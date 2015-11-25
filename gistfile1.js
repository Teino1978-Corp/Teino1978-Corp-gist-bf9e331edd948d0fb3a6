// 1. Setup project on Heroku (SEE OTHER SHEET)
// 2. Setup app

//////////////////////////////////////////////////
//// RANDOM BLINK TIMER

//// NODE

// You will need to install the express module
// http://expressjs.com
// npm install express

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

var num = 0;
setInterval(updateNum, 3000);

function updateNum() {
  num = Math.random() * 10;
  console.log('num = '+num);
}

app.get('/get_num', function(request, response) {
  response.send(String(num));
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

//// ARDUINO

// 1. Download Arduino IDE.
// 2. Plug in, connect to Arduino via wifi.
// 3. http://arduino.local or http://192.168.240.1 pw: arduino
// 4. Configure name, password (8 chars), tz, wifi network, restart. It will then
//    reset itself and attempt to connect to the network. In meantime, connect to normal wifi.
// 5. Follow link, name.local. Now you can see it's now on the network.
// 6. Bridge is a tool that lets you communicate between Arduino and Linux side. Serial connection between two processors.
//    Similar to serial connection between Arduino and computer.

// 7. Setup similar to Serial.
Bridge.begin();

// 8. Set up a Process. Similar to command line process.


#include <Bridge.h>
#include <HttpClient.h>

void setup() {
  Bridge.begin();
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  // Initialize the client library
  HttpClient client;

  // Make a HTTP request:
  client.get("http://api02.herokuapp.com/get_pressure");

  // if there are incoming bytes available
  // from the server, read them and print them:
  String resp = "";
  while (client.available()) {
    char c = client.read();
    resp += c;
  }
  int time = resp.toInt();
  Serial.println(time);

  digitalWrite(13, HIGH);
  delay(time);
  digitalWrite(13, LOW);
  delay(time);
  
}


//////////////////////////////////////////////////
//// SEND PRESSURE

//// NODE

// You will need to install the express module
// http://expressjs.com
// npm install express

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

var pressure = 0;

app.get('/set_pressure', function(request, response) {
  pressure = request.query.val;
  response.send('pressure set to '+pressure);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});


//// ARDUINO
// 1. SETUP CIRCUIT
// 2. CODE

#include <Bridge.h>
#include <HttpClient.h>

void setup() {
  Bridge.begin();
  Serial.begin(9600);
}

void loop() {
  
  int sensorValue = analogRead(A0);
  Serial.println(sensorValue);
  
  // Initialize the client library
  HttpClient client;

  // Make a HTTP request:
  client.get("http://api02.herokuapp.com/set_pressure?val="+String(sensorValue));

  // if there are incoming bytes available
  // from the server, read them and print them:
  while (client.available()) {
    char c = client.read();
    Serial.print(c);
  }
  Serial.println("");

  delay(200);
}


//////////////////////////////////////////////////
//// SEND AND VISUALIZE PRESSURE

//// NODE

// You will need to install the express module
// http://expressjs.com
// npm install express

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

var pressure = 0;

app.get('/set_pressure', function(request, response) {
  pressure = request.query.val;
  response.send('pressure set to '+pressure);
});

app.get('/get_pressure', function(request, response) {
  response.send(String(pressure));
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});


//// SKETCH
var p = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER);
  background(0);
  setInterval(updateScene, 1000);
}

function draw() {
  background(0);
  ellipse(width/2, height/2, p, p);
}


function updateScene() {
  loadJSON('/get_pressure', updatePressure);
}

function updatePressure(data) {
  p = data;
}
