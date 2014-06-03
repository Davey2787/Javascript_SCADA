// need to run 
// npm install socket.io in the same directory as this
var mongo_app = require('http').createServer(handler)
  , io = require('socket.io').listen(mongo_app)
  , fs = require('fs')
var mongodb = require('mongodb');
var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600
});
var msg;

	var Packet;				  
					
			  
mongo_app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/mongo_test.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
serialPort.on("open", function () {
	console.log('open');
		  serialPort.on('data', function(data) {
					  console.log('data received: ' + data);
					  if (data=='[')
					  {   // start of packet
						  Packet='';
					  }
					  else if (data ==']')
					  {
						  // end of packet
						console.log('packet received: '+Packet);
						if (Packet[7]=='1')
						{
							console.log("Switch 0 on");
						}
					  }
					  else 
					  {
						  
						  Packet=Packet+data;
					  }
				  });
			  });
io.sockets.on('connection', function (socket) {
			 
				  
  socket.emit('news', { hello: 'world' });
  socket.on('Button State', function (data) {
	
    console.log(data);
    var db = new mongodb.Db('io_list', new mongodb.Server('127.0.0.1', 27017), {safe: true});
    db.open(function(err)
		 {
			console.log('Made it here');
			db.collection('inputs', function(err, collection)
			{
				console.log(data['btn']);
				collection.update({name: 'start_button'}, {$set: {status: data['btn']}},err_callback);
				
				  serialPort.write("i0$", function(err, results) {
					console.log('err ' + err);
					console.log('results ' + results);
				  });
				});	
			});
		});
	});


		
function err_callback(err)
{
	console.log(err);
}

/*var SerialPort = require('serialport').SerialPort;
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
});*/
