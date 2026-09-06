
import socketpool
import wifi

from adafruit_httpserver import Server, Request, Response, POST

import json
import board
from digitalio import DigitalInOut, Direction
import time

import neopixel
pixels = neopixel.NeoPixel(board.GP27, 60)

pixels[0] = (0,0,100)

# SET UP NETWORK
from uNetComm import *
deviceInfo = {
    'deviceName': 'Timeline',
    'notes': 'Timeline LED Strip',
    'hostname': ''
    }

#  connect to network
print()
print("Connecting to WiFi")
#  connect to your SSID
wifi.radio.connect('TFS Students', 'Fultoneagles')

with open("index.html") as f:
    webpage = f.read()

print("Connected to WiFi")
pool = socketpool.SocketPool(wifi.radio)
server = Server(pool, "/static", debug=True)
port = 80
comm = uNetComm(pool)
#/ NETWORK 


#  onboard LED setup
led = DigitalInOut(board.LED)
led.direction = Direction.OUTPUT
led.value = False



def requestToArray(request):
    raw_text = request.body.decode("utf8")
    print("Raw")
    try:
        data = json.loads(raw_text)
    except:
        print()
        print("Unable to convert request to object: requestToArray()")
        print()
        data = {}
        data["action"] = ""
        data["value"] = ""
    return data

@server.route("/", "GET")
def base(request: Request):
    """
    Serve the default index.html file.
    """
    return Response(request, f"{webpage}", content_type='text/html')


@server.route("/", "POST")
def base(request: Request):
    """
    Serve the default index.html file.
    """
    rData = {}
        
    print("POST")
    data = requestToArray(request)
    print(f"data: {data} ")
    print(f"action: {data['action']} & value: {data['value']}")

    # SET MODE
    if (data['action'] == "lightON"):
        led.value = True
        pixels.fill((50,50,0))
        rData['item'] = "onboardLED"
        rData['status'] = led.value
    if (data['action'] == "lightOFF"):
        led.value = False
        pixels.fill((0,0,0))

        rData['item'] = "onboardLED"
        rData['status'] = led.value
        


    return Response(request, json.dumps(rData))

@server.route("/led", "GET")
def ledButton(request: HTTPRequest):
    rData = {}
    
    if led.value:
        led.value = False
    else:
        led.value = True
    
    rData['item'] = "onboardLED"
    rData['status'] = led.value
        
    return Response(request, json.dumps(rData))

 
# STARTING SERVER
print("starting server..")
# startup the server
try:
    server.start(str(wifi.radio.ipv4_address), port)
    print(f"Listening on http://{wifi.radio.ipv4_address}:{port}" )
    pixels[0] = (0,100,0)
    # log device on makerspace network
    regInfo = {"ip": f'{wifi.radio.ipv4_address}:{port}',
               "deviceName": deviceInfo['deviceName'],
               "hostname": deviceInfo['hostname'],
               "notes": deviceInfo['notes']
               }
    regData = comm.request("http://makerspace.local:27182", "registerDevice", regInfo)
    print('registered:', regData.text)
        

#  if the server fails to begin, restart the pico w
except OSError:
    pixels[0] = (100,0,0)
    time.sleep(5)
    print("restarting..")
    microcontroller.reset()
#/ STARTING SERVER


while True:
    try:
        # Process any waiting requests
        server.poll()
        #print(lightSwitch)
        
        time.sleep(0.1)
        
    except OSError as error:
        print(error)
        continue

        




