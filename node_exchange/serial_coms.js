var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600
});

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
  serialPort.write("o60$", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});


/*port.on('data', function(data) {
  console.log(data.toString());
});

port.on('error', function(err) {
  console.log(err);
});

port.open('/dev/ttyUSB0', {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1
}, function(err) {
  port.write("hello world");
  port.close();
});*/
