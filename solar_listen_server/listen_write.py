import datetime,traceback,json
import asyncio
import os
from aiomqtt import Client
import mariadb
from threading import Lock
if os.getenv('ENVIRONMENT') != 'production':
    from dotenv import load_dotenv
    load_dotenv()



class ListenRead:
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

        self.data = {}  # Holds the data, reset every 60s
        self.lock = Lock()  # To prevent race conditions when accessing self.data

        self.db_credentials = {
            'password': os.environ['DB_PW'],
            'host': os.environ['DB_HOST'],
            'port': 3306,
            'user': os.environ['DB_USER'],
            'database': os.environ['DB_NAME']
        }
        self.db_retry_delay = int(os.environ['DB_RETRY_DELAY'])
        self.mqtt_retry_delay = int(os.environ['MQTT_RETRY_DELAY'])

    async def listen(self):
        while True:  # Outer loop for reconnection
            try:
                async with Client(
                    self.mqtt_credentials['hostname'],
                    port=self.mqtt_credentials['port'],
                    username=self.mqtt_credentials['username'],
                    password=self.mqtt_credentials['password']
                ) as client:
                    await client.subscribe(self.mqtt_topic)
                    print(f"Connected to MQTT broker at {self.mqtt_credentials['hostname']}")

                    async for message in client.messages:
                        with self.lock:  # Prevent race condition
                            self.data[str(message.topic)] = [
                                datetime.datetime.now(),
                                message.payload.decode(),
                            ]

            except Exception as e:
                print(f"MQTT connection error: {e}")
                print(f"Attempting to reconnect in {self.mqtt_retry_delay} seconds...")
                await asyncio.sleep(self.mqtt_retry_delay)  # Wait before reconnecting
                continue


    async def write(self):
        persistent_data = {}
        while True:
            print('locking')
            with self.lock: 
                this_write = {}
                for key, value in self.data.items():
                    include = False
                    if key not in persistent_data.keys():
                        print('new key')
                        include = True
                    else:
                        if value[1] != persistent_data[key][1]:
                            print('different values for key', key, 'values', value[1], 'vs', persistent_data[key][1])
                            include = True
                    if include:
                        this_write.update({key: value})

            if this_write != {}:
                connection = None
                while connection is None:
                    try:
                        connection = mariadb.connect(**self.db_credentials)
                        with connection.cursor() as cursor:
                            query = 'INSERT INTO renogy20 (topic, datetime, value) VALUES (?, ?, ?)'
                            write_data = [[key, value[0], value[1]] for key, value in this_write.items()]
                            cursor.executemany(query, write_data)
                            connection.commit()
                    except mariadb.Error as e:
                        print(f"Database error: {e}")
                        print(f"Retrying database connection in {self.db_retry_delay} seconds...")
                        await asyncio.sleep(self.db_retry_delay)
                    finally:
                        if connection:
                            connection.close()

            persistent_data = self.data.copy()

            await asyncio.sleep(self.write_frequency)



async def main():
    lr = ListenRead()
    await asyncio.gather(
        lr.listen(),
        lr.write()
    )


if __name__ == "__main__":
    asyncio.run(main())


