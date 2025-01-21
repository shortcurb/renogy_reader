// https://github.com/wrybread/ESP32ArduinoRenogy
// https://github.com/syvic/ModbusMaster
#include <ModbusMaster.h>
#include "secrets.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>  // Include ArduinoJson library
#include "esp_task_wdt.h" // Watchdog timer
#include <OneWire.h>
#include <DallasTemperature.h>

ModbusMaster node;

const int relaypin1 = 12;  // Relay 1 connected to D12
const int relaypin2 = 25;  // Relay 2 connected to D25
const int relaypin3 = 27;  // Relay 3 connected to D27 

#define RXD2 13
#define TXD2 14
#define ONE_WIRE_BUS 4  // GPIO D4 on ESP32

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

const uint32_t num_data_registers = 35;
const uint32_t num_info_registers = 17;

bool simulator_mode = false;

WiFiClient espClient;
PubSubClient client(espClient);
const char* commandtopic = "kili/sagehouse/solar/renogy20/command";
int modbus_timeout_count = 0;  // Count consecutive Modbus timeouts
const int max_modbus_timeout_count = 5;  // Reset if this threshold is exceeded

struct Controller_data {
  
  uint8_t battery_soc;               // percent
  float battery_voltage;             // volts
  float battery_charging_amps;       // amps
  int16_t battery_temperature;       // celcius
  int16_t controller_temperature;    // celcius
  float load_voltage;                // volts
  float load_amps;                   // amps
  uint8_t load_watts;                // watts
  float solar_panel_voltage;         // volts
  float solar_panel_amps;            // amps
  uint8_t solar_panel_watts;         // watts
  float min_battery_voltage_today;   // volts
  float max_battery_voltage_today;   // volts
  float max_charging_amps_today;     // amps
  float max_discharging_amps_today;  // amps
  uint8_t max_charge_watts_today;    // watts
  uint8_t max_discharge_watts_today; // watts
  uint8_t charge_amphours_today;     // amp hours
  uint8_t discharge_amphours_today;  // amp hours
  uint8_t charge_watthours_today;    // watt hours
  uint8_t discharge_watthours_today; // watt hours
  uint8_t controller_uptime_days;    // days
  uint8_t total_battery_overcharges; // count
  uint8_t total_battery_fullcharges; // count
  uint16_t raw_data;

  // convenience values
  float battery_temperatureF;        // fahrenheit
  float controller_temperatureF;     // fahrenheit
  float battery_charging_watts;      // watts. necessary? Does it ever differ from solar_panel_watts?
  long last_update_time;             // millis() of last update time
  bool controller_connected;         // bool if we successfully read data from the controller
  float ds18tempC;
  float ds18tempF;
};
Controller_data renogy_data;

struct Controller_info {
  
  uint8_t voltage_rating;            // volts
  uint8_t amp_rating;                // amps
  uint8_t discharge_amp_rating;      // amps
  uint8_t type;
  uint8_t controller_name;
  char software_version[40];
  char hardware_version[40];
  char serial_number[40];
  uint8_t modbus_address;  

  float wattage_rating;
  long last_update_time;           // millis() of last update time
};
Controller_info renogy_info;

struct Relay_info {
    int relay1state;
    int relay2state;
    int relay3state;
    int loadstate;
};
Relay_info relay_info;

struct Board_info {
    float boardTempC;
    float boardTempF;
};
Board_info board_info;

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;

  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println();

  // Handle the message received
  if (String(topic) == commandtopic) {
    handle_command(messageTemp);

  }
}

// control the load pins on Renogy charge controllers that have them
void renogy_control_load(bool state) {
    if (state==1) {
        Serial.println("Turning load on");
        node.writeSingleRegister(0x010A, 1);  // turn on load
    }
    else {
        Serial.println("Turning load off");
        node.writeSingleRegister(0x010A, 0);  // turn off load
    }
}

void reconnect() {
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        if (WiFi.status() != WL_CONNECTED) { // Check Wi-Fi status first
            setup_wifi();
        }
        if (client.connect("ESP32Client", mqtt_user, mqtt_password)) {
            Serial.println("connected");
            client.subscribe(commandtopic);
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void setup_wifi() {
    delay(10);
    Serial.print("Connecting to ");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void handle_command(const String message) {
    pinMode(relaypin1, OUTPUT);
    pinMode(relaypin2, OUTPUT);
    pinMode(relaypin3, OUTPUT);

    // Debug print
    Serial.println("Handling message: " + message);

    // Matching commands to control relays
    if (message == "relay1 on") {
        digitalWrite(relaypin1, HIGH);
    } else if (message == "relay1 off") {
        digitalWrite(relaypin1, LOW);
    } else if (message == "relay2 on") {
        digitalWrite(relaypin2, HIGH);
    } else if (message == "relay2 off") {
        digitalWrite(relaypin2, LOW);
    } else if (message == "relay3 on") {
        digitalWrite(relaypin3, HIGH);
    } else if (message == "relay3 off") {
        digitalWrite(relaypin3, LOW);
    } else if (message == "load on") {
        renogy_control_load(1);
    } else if (message == "load off") {
        renogy_control_load(0);
    } else {
        Serial.println("Unknown command: " + message);
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("Started!");

    // Configure and initialize the Task Watchdog Timer (WDT)
    static bool wdt_initialized = false;
    if (!wdt_initialized) {
        esp_task_wdt_config_t wdt_config = {
            .timeout_ms = 10000,       // Set WDT timeout to 10,000 ms
            .trigger_panic = true      // Trigger panic on timeout
        };
        esp_task_wdt_init(&wdt_config); // Initialize WDT with the config
        esp_task_wdt_add(NULL);         // Add current task to the watchdog
        wdt_initialized = true;         // Mark as initialized to avoid reinitializing
    }

    Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2); 
    int modbus_address = 255; 
    node.begin(modbus_address, Serial2); 

    setup_wifi();
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
    sensors.begin();

    delay(100);
}

void loop() {
    esp_task_wdt_reset();  // Initial reset at the start of loop

    if (WiFi.status() != WL_CONNECTED) {  // Check Wi-Fi connection
        setup_wifi();
        esp_task_wdt_reset();  // Reset after Wi-Fi reconnection attempt
    }

    if (!client.connected()) {
        reconnect();
        esp_task_wdt_reset();  // Reset after MQTT reconnection attempt
    }

    client.loop();
    esp_task_wdt_reset();  // Reset after processing client.loop()

    static uint32_t lastTaskTime = 0;  
    const uint32_t TASK_INTERVAL = 5000;  // 5-second interval

    if (millis() - lastTaskTime >= TASK_INTERVAL) {
        lastTaskTime = millis();
        send_data();           // Publish data and perform tasks
        esp_task_wdt_reset();  // Reset watchdog timer after successful task
    }

    delay(10);  // Small delay to prevent a tight loop; adjust if needed
}

void send_data() {
    static uint32_t i;
    i++;

    // set word 0 of TX buffer to least-significant word of counter (bits 15..0)
    node.setTransmitBuffer(0, lowWord(i));  
    // set word 1 of TX buffer to most-significant word of counter (bits 31..16)
    node.setTransmitBuffer(1, highWord(i));

    if (renogy_read_data_registers() && renogy_read_info_registers()) {
        read_relay_state();
        read_ds18b20();
        modbus_timeout_count = 0;  // Reset timeout count on successful read

        client.publish("kili/sagehouse/solar/renogy20/raw_data", String(renogy_data.raw_data).c_str());
        client.publish("kili/sagehouse/solar/renogy20/board_temperature", String(board_info.boardTempC).c_str());
        client.publish("kili/sagehouse/solar/renogy20/board_temperatureF", String(board_info.boardTempF).c_str());
        client.publish("kili/sagehouse/solar/renogy20/status", "Charge controller connected");
        client.publish("kili/sagehouse/solar/renogy20/battery_soc", String(renogy_data.battery_soc).c_str());
        client.publish("kili/sagehouse/solar/renogy20/battery_voltage", String(renogy_data.battery_voltage).c_str());
        client.publish("kili/sagehouse/solar/renogy20/battery_charging_amps", String(renogy_data.battery_charging_amps/10).c_str());
        client.publish("kili/sagehouse/solar/renogy20/battery_temperature", String(renogy_data.battery_temperature).c_str());
        client.publish("kili/sagehouse/solar/renogy20/controller_temperature", String(renogy_data.controller_temperature).c_str());
        client.publish("kili/sagehouse/solar/renogy20/load_voltage", String(renogy_data.load_voltage).c_str());
        client.publish("kili/sagehouse/solar/renogy20/load_amps", String(renogy_data.load_amps).c_str());
        client.publish("kili/sagehouse/solar/renogy20/load_watts", String(renogy_data.load_watts).c_str());
        client.publish("kili/sagehouse/solar/renogy20/solar_panel_voltage", String(renogy_data.solar_panel_voltage).c_str());
        client.publish("kili/sagehouse/solar/renogy20/solar_panel_amps", String(renogy_data.solar_panel_amps).c_str());
        client.publish("kili/sagehouse/solar/renogy20/solar_panel_watts", String(renogy_data.solar_panel_watts).c_str());
        client.publish("kili/sagehouse/solar/renogy20/min_battery_voltage_today", String(renogy_data.min_battery_voltage_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/max_battery_voltage_today", String(renogy_data.max_battery_voltage_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/max_charging_amps_today", String(renogy_data.max_charging_amps_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/max_discharging_amps_today", String(renogy_data.max_discharging_amps_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/max_charge_watts_today", String(renogy_data.max_charge_watts_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/max_discharge_watts_today", String(renogy_data.max_discharge_watts_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/charge_amphours_today", String(renogy_data.charge_amphours_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/discharge_amphours_today", String(renogy_data.discharge_amphours_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/charge_watthours_today", String(renogy_data.charge_watthours_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/discharge_watthours_today", String(renogy_data.discharge_watthours_today).c_str());
        client.publish("kili/sagehouse/solar/renogy20/controller_uptime_days", String(renogy_data.controller_uptime_days).c_str());
        client.publish("kili/sagehouse/solar/renogy20/total_battery_overcharges", String(renogy_data.total_battery_overcharges).c_str());
        client.publish("kili/sagehouse/solar/renogy20/total_battery_fullcharges", String(renogy_data.total_battery_fullcharges).c_str());
        client.publish("kili/sagehouse/solar/renogy20/battery_temperatureF", String(renogy_data.battery_temperatureF).c_str());
        client.publish("kili/sagehouse/solar/renogy20/controller_temperatureF", String(renogy_data.controller_temperatureF).c_str());
        client.publish("kili/sagehouse/solar/renogy20/battery_charging_watts", String(renogy_data.battery_charging_watts/10).c_str());
        client.publish("kili/sagehouse/solar/renogy20/last_update_time", String(renogy_data.last_update_time).c_str());
        client.publish("kili/sagehouse/solar/renogy20/controller_connected", renogy_data.controller_connected ? "true" : "false");

        client.publish("kili/sagehouse/solar/renogy20/voltage_rating", String(renogy_info.voltage_rating).c_str());
        client.publish("kili/sagehouse/solar/renogy20/amp_rating", String(renogy_info.amp_rating).c_str());
        client.publish("kili/sagehouse/solar/renogy20/discharge_amp_rating", String(renogy_info.discharge_amp_rating).c_str());
        client.publish("kili/sagehouse/solar/renogy20/type", String(renogy_info.type).c_str());
        client.publish("kili/sagehouse/solar/renogy20/controller_name", String(renogy_info.controller_name).c_str());
        client.publish("kili/sagehouse/solar/renogy20/software_version", renogy_info.software_version);
        client.publish("kili/sagehouse/solar/renogy20/hardware_version", renogy_info.hardware_version);
        client.publish("kili/sagehouse/solar/renogy20/serial_number", renogy_info.serial_number);
        client.publish("kili/sagehouse/solar/renogy20/modbus_address", String(renogy_info.modbus_address).c_str());
        client.publish("kili/sagehouse/solar/renogy20/wattage_rating", String(renogy_info.wattage_rating).c_str());
        client.publish("kili/sagehouse/solar/renogy20/last_update_time", String(renogy_info.last_update_time).c_str());

        client.publish("kili/sagehouse/solar/renogy20/relay1state", String(relay_info.relay1state).c_str());
        client.publish("kili/sagehouse/solar/renogy20/relay2state", String(relay_info.relay2state).c_str());
        client.publish("kili/sagehouse/solar/renogy20/relay3state", String(relay_info.relay3state).c_str());
        client.publish("kili/sagehouse/solar/renogy20/loadstate", String(relay_info.loadstate).c_str());


        esp_task_wdt_reset();  // Reset WDT after publishing data

    } else {
        client.publish("kili/sagehouse/solar/renogy20/status", "Charge controller disconnected");
        modbus_timeout_count++;
        if (modbus_timeout_count >= max_modbus_timeout_count) {
            esp_task_wdt_reset();  // Reset WDT after publishing data
            ESP.restart();  // Restart if too many consecutive timeouts
        }

    }
}

bool renogy_read_data_registers() {
  uint8_t j, result;
  uint16_t data_registers[num_data_registers];
  char buffer1[40], buffer2[40];
  uint16_t raw_data;

  // Prints data about each read to the console
  bool print_data = false;

  result = node.readHoldingRegisters(0x100, num_data_registers);
  if (result == node.ku8MBSuccess) {
    if (print_data) Serial.println("Successfully read the data registers!");
    renogy_data.controller_connected = true;

    for (j = 0; j < num_data_registers; j++) {
      data_registers[j] = node.getResponseBuffer(j);
      if (print_data) Serial.println(data_registers[j]);
    }

    renogy_data.battery_soc = data_registers[0];
    renogy_data.battery_voltage = data_registers[1] * 0.1; // Will it crash if data_registers[1] doesn't exist?
    renogy_data.battery_charging_amps = data_registers[2] * 0.1;
    renogy_data.battery_charging_watts = renogy_data.battery_voltage * renogy_data.battery_charging_amps;

    // ✅ Read and decode temperatures from 0x103 (data_registers[3])
    raw_data = data_registers[3];  // Example: 0x8C7C (35980)

    // Extract battery temperature (7 bits)
    int8_t battery_temperature = raw_data & 0x7F;
    // Extract battery temperature sign (bit 7)
    if (raw_data & 0x80) battery_temperature = -battery_temperature;

    // Extract controller temperature (7 bits)
    int8_t controller_temperature = (raw_data >> 8) & 0x7F;
    // Extract controller temperature sign (bit 15)
    if (raw_data & 0x8000) controller_temperature = -controller_temperature;

    // Store temperatures in renogy_data struct
    renogy_data.controller_temperature = controller_temperature;
    renogy_data.battery_temperature = battery_temperature;
    renogy_data.raw_data = raw_data;

    // ✅ Fahrenheit conversion
    renogy_data.controller_temperatureF = (renogy_data.controller_temperature * 1.8) + 32;
    renogy_data.battery_temperatureF = (renogy_data.battery_temperature * 1.8) + 32;

    // ✅ Debug print
    if (print_data) {
      Serial.print("Raw Modbus Data (0x103): ");
      Serial.println(raw_data, HEX);
      Serial.print("Controller Temp (C): ");
      Serial.println(renogy_data.controller_temperature);
      Serial.print("Battery Temp (C): ");
      Serial.println(renogy_data.battery_temperature);
    }

    renogy_data.load_voltage = data_registers[4] * 0.1;
    renogy_data.load_amps = data_registers[5] * 0.01;
    renogy_data.load_watts = data_registers[6];
    renogy_data.solar_panel_voltage = data_registers[7] * 0.1;
    renogy_data.solar_panel_amps = data_registers[8] * 0.01;
    renogy_data.solar_panel_watts = data_registers[9];

    renogy_data.min_battery_voltage_today = data_registers[11] * 0.1;
    renogy_data.max_battery_voltage_today = data_registers[12] * 0.1;
    renogy_data.max_charging_amps_today = data_registers[13] * 0.01;
    renogy_data.max_discharging_amps_today = data_registers[14] * 0.1;
    renogy_data.max_charge_watts_today = data_registers[15];
    renogy_data.max_discharge_watts_today = data_registers[16];
    renogy_data.charge_amphours_today = data_registers[17];
    renogy_data.discharge_amphours_today = data_registers[18];
    renogy_data.charge_watthours_today = data_registers[19];
    renogy_data.discharge_watthours_today = data_registers[20];
    renogy_data.controller_uptime_days = data_registers[21];
    renogy_data.total_battery_overcharges = data_registers[22];
    renogy_data.total_battery_fullcharges = data_registers[23];

    renogy_data.last_update_time = millis();

    if (print_data) Serial.println("---");
    return true;
  } 
  else {
    if (result == 0xE2) {
      Serial.println("Timed out reading the data registers!");
    } 
    else {
      Serial.print("Failed to read the data registers... ");
      Serial.println(result, HEX); // E2 is timeout
    }

    // Reset values if the reading fails
    renogy_data.controller_connected = false;
    renogy_data.battery_voltage = 0;
    renogy_data.battery_charging_amps = 0;
    renogy_data.battery_soc = 0;
    renogy_data.battery_charging_amps = 0;
    renogy_data.controller_temperature = 0;
    renogy_data.battery_temperature = 0;
    renogy_data.solar_panel_amps = 0;
    renogy_data.solar_panel_watts = 0;
    renogy_data.battery_charging_watts = 0;
    renogy_data.controller_connected = false;
    return false;
  }
}

bool renogy_read_info_registers() 
{
  uint8_t j, result;
  uint16_t info_registers[num_info_registers];
  char buffer1[40], buffer2[40];
  uint8_t raw_data;

  // prints data about the read to the console
  bool print_data=0;
  
  result = node.readHoldingRegisters(0x00A, num_info_registers);
  if (result == node.ku8MBSuccess)
  {
    if (print_data) Serial.println("Successfully read the info registers!");
    for (j = 0; j < num_info_registers; j++)
    {
      info_registers[j] = node.getResponseBuffer(j);
      if (print_data) Serial.println(info_registers[j]);
    }

    // read and process each value
    //Register 0x0A - Controller voltage and Current Rating - 0
    // Not sure if this is correct. I get the correct amp rating for my Wanderer 30 (30 amps), but I get a voltage rating of 0 (should be 12v)
    raw_data = info_registers[0]; 
    renogy_info.voltage_rating = raw_data/256; 
    renogy_info.amp_rating = raw_data%256;
    renogy_info.wattage_rating = renogy_info.voltage_rating * renogy_info.amp_rating;
    //Serial.println("raw ratings = " + String(raw_data));
    //Serial.println("Voltage rating: " + String(renogy_info.voltage_rating));
    //Serial.println("amp rating: " + String(renogy_info.amp_rating));


    //Register 0x0B - Controller discharge current and type - 1
    raw_data = info_registers[1]; 
    renogy_info.discharge_amp_rating = raw_data/256; // not sure if this should be /256 or /100
    renogy_info.type = raw_data%256; // not sure if this should be /256 or /100

    //Registers 0x0C to 0x13 - Product Model String - 2-9
    // Here's how the nodeJS project handled this:
    /*
    let modelString = '';
    for (let i = 0; i <= 7; i++) {  
        rawData[i+2].toString(16).match(/.{1,2}/g).forEach( x => {
            modelString += String.fromCharCode(parseInt(x, 16));
        });
    }
    this.controllerModel = modelString.replace(' ','');
    */

    //Registers 0x014 to 0x015 - Software Version - 10-11
    itoa(info_registers[10],buffer1,10); 
    itoa(info_registers[11],buffer2,10);
    strcat(buffer1, buffer2); // should put a divider between the two strings?
    strcpy(renogy_info.software_version, buffer1); 
    //Serial.println("Software version: " + String(renogy_info.software_version));

    //Registers 0x016 to 0x017 - Hardware Version - 12-13
    itoa(info_registers[12],buffer1,10); 
    itoa(info_registers[13],buffer2,10);
    strcat(buffer1, buffer2); // should put a divider between the two strings?
    strcpy(renogy_info.hardware_version, buffer1);
    //Serial.println("Hardware version: " + String(renogy_info.hardware_version));

    //Registers 0x018 to 0x019 - Product Serial Number - 14-15
    // I don't think this is correct... Doesn't match serial number printed on my controller
    itoa(info_registers[14],buffer1,10); 
    itoa(info_registers[15],buffer2,10);
    strcat(buffer1, buffer2); // should put a divider between the two strings?
    strcpy(renogy_info.serial_number, buffer1);
    //Serial.println("Serial number: " + String(renogy_info.serial_number)); // (I don't think this is correct)

    renogy_info.modbus_address = info_registers[16];
    renogy_info.last_update_time = millis();
  
    if (print_data) Serial.println("---");
    return true;
  }
  else
  {
    if (result == 0xE2) 
    {
      Serial.println("Timed out reading the info registers!");
    }
    else 
    {
      Serial.print("Failed to read the info registers... ");
      Serial.println(result, HEX); // E2 is timeout
    }
    // anything else to do if we fail to read the info reisters?
    return false;
  }
}

void read_relay_state() {
    relay_info.relay1state = digitalRead(relaypin1);
    relay_info.relay2state = digitalRead(relaypin2);
    relay_info.relay3state = digitalRead(relaypin3);
    uint8_t result = node.readHoldingRegisters(0x010A,1);
    if (result == node.ku8MBSuccess) {
        uint16_t value = node.getResponseBuffer(0);  
    } 
}

void read_ds18b20() {
  sensors.requestTemperatures();  // Request temperature from DS18B20
  float ds18tempC = sensors.getTempCByIndex(0);  // Read temperature in Celsius
  float ds18tempF = ds18tempC * 9.0 / 5.0 + 32.0;  // Convert to Fahrenheit
  board_info.boardTempC = ds18tempC;
  board_info.boardTempF = ds18tempF;
  Serial.println("ds18b20 temp c");
  Serial.println(ds18tempC);
}


