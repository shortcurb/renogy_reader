import os
import time,mariadb
from datetime import datetime, timedelta
from skyfield.api import Topos, load
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
latitude = float(os.getenv('LATITUDE'))  # Replace with your latitude
longitude = float(os.getenv('LONGITUDE'))  # Replace with your longitude


db_credentials = {
    'password': os.environ['DB_PW'],
    'host': os.environ['DB_HOST'],
    'port': 3306,
    'user': os.environ['DB_USER'],
    'database': os.environ['DB_NAME']
}

# Load ephemeris data
eph = load('de421.bsp')
sun = eph['sun']
earth = eph['earth']

# Define observer's location
observer = earth + Topos(latitude_degrees=latitude, longitude_degrees=longitude)

# Define time range
timer = datetime.strptime('11/28/2024 00:00:00', '%m/%d/%Y %H:%M:%S')
connection = mariadb.connect(**db_credentials)
with connection.cursor() as cursor:
    query = 'SELECT datetime FROM sun_position order by datetime desc limit 1'
    cursor.execute(query,[])
    timer = cursor.fetchall()[0][0]
    connection.close()
end = datetime.strptime('1/1/2026 00:00:00', '%m/%d/%Y %H:%M:%S')

# Load Skyfield's timescale
ts = load.timescale()


def writer(meta):
    query = "INSERT IGNORE INTO sun_position (datetime,azimuth,altitude) VALUES (?,?,?) "
    try:
        with connection.cursor() as cursor:
            print('writing')
            cursor.executemany(query,meta)
            connection.commit()
            connection.close()
    except mariadb.OperationalError:
        writer(meta)

meta = []
while timer < end:
    # Convert Python datetime to Skyfield time
    t = ts.utc(timer.year, timer.month, timer.day, timer.hour, timer.minute, timer.second)
    
    # Calculate the position of the Sun from the observer's location
    astrometric = observer.at(t).observe(sun).apparent()
    
    # Get altitude and azimuth
    alt, az, _ = astrometric.altaz()
    
    # Output results
#    print(f"{timer} - Altitude: {alt.degrees:.2f}°, Azimuth: {az.degrees:.2f}°")
    
    # Increment time by 60 seconds
    connection = mariadb.connect(**db_credentials)
    line = [timer,az.degrees,alt.degrees]
    meta.append(line)
    next = timer + timedelta(seconds=60)
    if timer.day != next.day:
        writer(meta)
        meta = []
    print(len(meta))
    timer += timedelta(seconds=60)
        
    




