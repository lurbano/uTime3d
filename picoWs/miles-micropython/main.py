import network, socket, time, neopixel

from machine import Pin

with open("webpage.html", "r", encoding="utf-8") as file:
    html = file.read()

ledCount = 443
timelineStart = -3500
timelineEnd = 2100

pin = Pin(27, Pin.OUT)
leds = neopixel.NeoPixel(pin, ledCount)

ssid = 'TFS Students'
password = 'Fultoneagles'

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

max_wait = 10
while max_wait > 0:
    if wlan.status() < 0 or wlan.status() >= 3:
        break
    max_wait -= 1
    print('waiting for connection...')
    time.sleep(1)
   
if wlan.status() != 3:
    raise RuntimeError('network connection failed')
else:
    print('connected ')
    status = wlan.ifconfig()
    print('ip = ' + status[0])

addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]

s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(addr)

s.listen(1)

print('listening on:', addr) 

currentDate = 'none'

def dateLocation(startDate, endDate, enterDate, ledCount):
    range = endDate - startDate
    ledScale = range / ledCount
    location = enterDate - startDate
    selLed = location / ledScale
    select = int(round(selLed))
    if select >= ledCount: 
        select = ledCount - 1
    if select <= 0:
        select = 0
    return select

try:
    while True:
        try:
            cl, addr = s.accept()
            print('client connected from', addr)
            request = cl.recv(1024)
            if not request:
                cl.close()
                continue
            
            request = str(request)
            
            if "GET /submit" in request:
                try:
                    query_string = request.split(' ')
                    inputDate = query_string[1].split('date=')[1]
                    
                    #inputDate = inputDate.replace('+', '###').replace('%20', '@@@').replace('-', ' ')
                    #inputDate = inputDate.split()
                    #inputYear = int(inputDate[0])
                    #inputMonth = int(inputDate[1])
                    #inputDay = int(inputDate[2])
                    
                    inputYear = int(inputDate)
                    
                    print(inputYear)
                    
                    print('date input recieved')
                    
                    currentDate =  inputDate
                    ledLocation = dateLocation(timelineStart, timelineEnd, inputYear, ledCount)
                    print(ledLocation)
                    leds.fill((0,0,0))
                    leds[ledLocation] = (0, 100, 0)
                    leds.write()
                
                except Exception as parse_err:
                    print('parsing error:', parse_err)
                
                cl.send('HTTP/1.0 200 OK\r\nContent-type: text/plain\r\nConnection: close\r\n\r\ndata received')
            else:
                response = html % '"Current date =" currentDate'
                #cl.send('HTTP/1.0 200 OK\r\nContent-type: text/html\r\nConnection: close\r\n\r\n')
                client.send('HTTP/1.1 200 OK\n')
                client.send('Access-Control-Allow-Origin: *\n')
                client.send('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\n')
                client.send('Access-Control-Allow-Headers: Content-Type\n')
                client.send('Content-Type: text/html\n')
                client.send('\n')
                cl.send(response)

            cl.close()
        except OSError as e:
            cl.close()
            print('connection closed')
finally:
    leds.fill((0,0,0))
    print('socket closed successfully')
    s.close()
