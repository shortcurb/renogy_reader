sudo docker build -t solar-listen .
sudo docker run --env-file docker.env --name solar-listen -d solar-listen
The open portainer, switch the new container's network to bombur_default, and it'll run

If you get "key not found" errors, it just means that the ESP32 is sending MQTTs
that solar_listen.py doesn't know whether to treat as a string or a float. 
Make an entry in         self.data_structure = { if you want the error to go away
