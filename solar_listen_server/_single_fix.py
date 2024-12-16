
import mariadb,os,json
from dotenv import load_dotenv
load_dotenv()


class fixer:
    def __init__(self):
        self.mqtt_credentials = {
            'hostname': os.environ['MQTT_BROKER'],  # Updated to 'host' for aiomqtt
            'port': 1883,
            'username': os.environ['MQTT_USER'],
            'password': os.environ['MQTT_PW']
        }
        print(json.dumps(self.mqtt_credentials,indent=2))
        self.mqtt_topic = os.environ["MQTT_TOPIC"]
        self.write_frequency =int(os.environ["WRITE_FREQ"])

        self.data_structure = {
            'status': str,
            'battery_soc': float,
            'battery_voltage': float,
            'battery_charging_amps': float,
            'battery_temperature': float,
            'controller_temperature': float,
            'load_voltage': float,
            'load_amps': float,
            'load_watts': float,
            'solar_panel_voltage': float,
            'solar_panel_amps': float,
            'solar_panel_watts': float,
            'min_battery_voltage_today': float,
            'max_battery_voltage_today': float,
            'max_charging_amps_today': float,
            'max_discharging_amps_today': float,
            'max_charge_watts_today': float,
            'max_discharge_watts_today': float,
            'charge_amphours_today': float,
            'discharge_amphours_today': float,
            'charge_watthours_today': float,
            'discharge_watthours_today': float,
            'controller_uptime_days': float,
            'total_battery_overcharges': float,
            'total_battery_fullcharges': float,
            'battery_temperatureF': float,
            'controller_temperatureF': float,
            'battery_charging_watts': float,
            'last_update_time': str,
            'controller_connected': str,
            'voltage_rating': float,
            'amp_rating': float,
            'discharge_amp_rating': float,
            'type': str,
            'controller_name': str,
            'software_version': str,
            'hardware_version': str,
            'serial_number': str,
            'modbus_address': float,
            'wattage_rating': float,
            'relay1state': str,
            'relay2state': str,
            'relay3state': str,
            'loadstate': str
        }  
        self.db_credentials = {
            'password': os.environ['DB_PW'],
            'host': os.environ['DB_HOST'],
            'port': 3306,
            'user': os.environ['DB_USER'],
            'database': os.environ['DB_NAME']
        }


    def pull(self):
        connection = mariadb.connect(**self.db_credentials)
        with connection.cursor() as cursor:
            query = 'select * from renogy20 WHERE value is not Null'
            cursor.execute(query)
            self.oldies = cursor.fetchall()

    def sorter(self):
        self.write_data = []
        for item in self.oldies:


            translated_value = self.data_structure[item[0].split('/')[-1]](item[2])
            if type(translated_value) == float:
                line_data = [item[0],item[1], None, translated_value]
            else:
                line_data = [item[0],item[1],translated_value, None]
            self.write_data.append(line_data)
        print(json.dumps(self.write_data,indent=2,default=str))
        print(len(self.write_data))

    def writer(self):
        connection = mariadb.connect(**self.db_credentials)
        with connection.cursor() as cursor:
            query = 'INSERT INTO renogy20 (topic, datetime, value_str, value_float) VALUES (?, ?, ?, ?)'
            cursor.executemany(query,self.write_data)   
            connection.commit()                 


"""

            if this_write != {}:
                connection = None
                while connection is None:
                    try:
                        connection = mariadb.connect(**self.db_credentials)
                        with connection.cursor() as cursor:
                            query = 'INSERT INTO renogy20 (topic, datetime, value_str, value_float) VALUES (?, ?, ?, ?)'
                            write_data = []
                            for key,value in this_write.items():
                                if type(value[2]) == float:
                                    line_data = [key,value[0], None, value[2]]
                                else:
                                    line_data = [key, value[0], value[2], None]
                                write_data.append(line_data)
                            cursor.executemany(query, write_data)
                            connection.commit()
                    except mariadb.Error as e:
                        print(f"Database error: {e}")
                        print(f"Retrying database connection in {self.db_retry_delay} seconds...")
                        await asyncio.sleep(self.db_retry_delay)
                    finally:
                        if connection:
                            connection.close()

"""
f = fixer()
f.pull()
f.sorter()
f.writer()