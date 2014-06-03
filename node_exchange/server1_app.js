// need to run 
// npm install socket.io in the same directory as this
var server = require('http').createServer(handler)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
var mongodb = require('mongodb');
var db = new mongodb.Db('control_process', new mongodb.Server('127.0.0.1', 27017), {safe: true}); 
var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600 
});

server.listen(8080);

// Open Database 
db.open(function(err){
			console.log('database open')
	});
var Packet;
var PacketIndex = 0;
var dec;
var temp;
	h2d = function(h) {
			return parseInt(h,16);
			};

// Open Serial port
serialPort.on("open", function () {
		 console.log('Serial port open');
		 serialPort.on('data', function(data) {
					  if (data=='[')
					  {   // start of packet
						  Packet='';
						  PacketIndex++;
					  }
					  else if (data ==']')
					  {
						  // end of packet
						console.log('packet received: '+Packet);
						switch(PacketIndex)
						{
							case 0: PacketIndex++;
									break;
							case 1:
								if (Packet[7]=='1')
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 1'}, {$set: {state: 'high'}},function(err){}); // updates Ls1 in database
									});
									console.log(PacketIndex);
									console.log('case 1');
								}
								else
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 1'}, {$set: {state: 'low'}},function(err){}); // updates Ls1 in database
									});
								}
								break;
							case 2:
								if (Packet[7]=='1')
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 2'}, {$set: {state: 'high'}},function(err){}); // updates Ls2 in database
									});
									console.log(PacketIndex);
									console.log('case 2');
								}
								else
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 2'}, {$set: {state: 'low'}},function(err){}); // updates Ls2 in database
									});
								}
								break;
							case 3:
								if (Packet[7]=='1')
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 3'}, {$set: {state: 'high'}},function(err){}); // updates Ls3 in database
									});
									console.log(PacketIndex);
									console.log('case 3');
								}
								else
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 3'}, {$set: {state: 'low'}},function(err){}); // updates Ls3 in database
									});
								}	
								break;
							case 4:
								
								dec = h2d(Packet); // coverts hex to dec
								temp = Math.round(dec/10.24);// rounds to the nearest whole number
								db.collection('tank2_temp', function(err, collection){
									collection.update({name: 'tank2'}, {$set: {temperature: temp}},function(err){}); // updates tank2 temp in database
								});
								zeroFilledTemp = ('000' + temp).substr(-3) // makes 2 digit number a 3 digit number
								console.log(zeroFilledTemp);
								level = "l5"+ zeroFilledTemp +"$"; 
								db.collection('outputs', function(err, collection){
									collection.distinct('state', {name: 'Temperature Control'}, function(err,tempCon_state){ 
										if(tempCon_state == 'on'){
											serialPort.write(level, function(err, results) {
						
											});
										}
										else{
											serialPort.write("l5000$", function(err, results) {
						
											});
										}
									});	
								});
								console.log(PacketIndex);
								PacketIndex = 0;
								break;
							case 5:
								if (Packet[7]=='1')
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 1'}, {$set: {state: 'high'}},function(err){}); // updates Ls1 in database
									});
									console.log(PacketIndex);
									console.log('case 5');
									PacketIndex = 1;
								}
								else
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 1'}, {$set: {state: 'low'}},function(err){}); // updates Ls1 in database
									});
									PacketIndex = 1;
								}
								break;
							case 6:
								if (Packet[7]=='1')
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 2'}, {$set: {state: 'high'}},function(err){}); // updates Ls2 in database
									});
									console.log(PacketIndex);
									console.log('case 6');
									PacketIndex = 2;
								}
								else
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 2'}, {$set: {state: 'low'}},function(err){}); // updates Ls2 in database
									});
									PacketIndex = 2;
								}
								break;	
							case 7:
								if (Packet[7]=='1')
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 3'}, {$set: {state: 'high'}},function(err){}); // updates Ls3 in database
									});
									console.log(PacketIndex);
									console.log('case 3');
									PacketIndex = 3;
								}
								else
								{
									db.collection('outputs', function(err, collection){
										collection.update({name: 'limit switch 3'}, {$set: {state: 'low'}},function(err){}); // updates Ls3 in database
									});
									PacketIndex = 3;
								}	
								break;
						}
					  }
					  else 
					  {
						  Packet=Packet+data;		
					  }
				  });			 
	 });

function handler (req, res) {
  fs.readFile(__dirname + '/client1.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	
	// Pump 1 On/Off and Database Update
	socket.on('Pump1 State', function (data) {
		socket.emit('news',{ update: 'received'});
		db.collection('outputs', function(err, collection){
				
					collection.distinct('state', {name: 'limit switch 2'}, function(err,ls2_state){ // checks state of limit switch 2
					if(ls2_state == 'low'){
						if(data['pump1'] == 'on'){ // limit switch 2 low switch on Pump 1
							serialPort.write("o01$", function(err, results) {
								  console.log('Pump1 on');
								   socket.emit('Confirm Pump1 on',{pump1_on: "true"}); // confirms Pump 1 came on
								   collection.update({name: 'pump1'}, {$set: {state: 'on'}},function(err){}); // updates Pump1 in database
							});
						}
						else{ // limit switch 2 low switch off Pump 1
							serialPort.write("o00$", function(err, results) {
								  console.log('Pump1 off');
								  socket.emit('Confirm Pump1 off',{pump1_off: "true"}); // confirms Pump 1 went off
								  collection.update({name: 'pump1'}, {$set: {state: 'off'}},function(err){}); // updates Pump1 in database
							});
						}
					}
					else{// limit switch 2 high switch off Pump 1
							serialPort.write("o00$", function(err, results) {
								  console.log('Pump1 off');
								  socket.emit('Confirm Pump1 off',{pump1_off: "true"}); // confirms Pump 1 went off
								  collection.update({name: 'pump1'}, {$set: {state: 'off'}},function(err){}); // updates Pump1 in database
							});
							
						}
					
				});
			});	
	});
	
	// Pump 2 On/Off and Database Update
	socket.on('Pump2 State', function (data) {
		socket.emit('news',{ update: 'received'});
		db.collection('outputs', function(err, collection){
			
			collection.distinct('state', {name: 'limit switch 3'}, function(err,ls3_state){ // checks state of Limit switch 3
				collection.distinct('state', {name: 'valve1'}, function(err,v1_state){ // checks state of valve 1
				if(v1_state == 'open' && ls3_state == 'low'){
					if(data['pump2'] == 'on'){ // valve 1 open and limit switch 3 is low switch on pump 2
						serialPort.write("o21$", function(err, results) {
							  console.log('Pump2 on');
							  socket.emit('Confirm Pump2 on',{pump2_on: "true"});
							  collection.update({name: 'pump2'}, {$set: {state: 'on'}},function(err){}); // updates Pump 2 in database
						});
					}
					else{ // valve 1 open and limit switch 3 is low switch off pump 2
						serialPort.write("o20$", function(err, results) {
							  console.log('Pump2 off');
							  socket.emit('Confirm Pump2 off',{pump2_off: "true"}); // confirms Pump 2 went off
							  collection.update({name: 'pump2'}, {$set: {state: 'off'}},function(err){}); // updates Pump 2 in database
						});
					}
				}
				else{ // valve 1 closed or limit switch 3 is high switch off pump 2
						serialPort.write("o20$", function(err, results) {
							  console.log('Pump2 off');
							  socket.emit('Confirm Pump2 off',{pump2_off: "true"}); // confirms Pump 2 went off
							  collection.update({name: 'pump2'}, {$set: {state: 'off'}},function(err){}); // updates Pump 2 in database
						});
					}
				});
			});
		});	
	});
	
	// Valve 1 Open/Close and Database Update
	socket.on('Valve1 State', function (data) {
		socket.emit('news',{ update: 'received'});
		db.collection('outputs', function(err, collection){
			
			collection.distinct('state', {name: 'limit switch 1'}, function(err,ls1_state){ // checks state of limit switch 1
				if(ls1_state == 'high')
				{
					if(data['valve1'] == 'open'){ // limit switch 1 high, open valve 1
						serialPort.write("o11$", function(err, results) {
							  console.log('Valve1 open');
							  socket.emit('Confirm Valve1 open',{Valve1_open: "true"}); // confirm valve 1 is open
							  collection.update({name: 'valve1'}, {$set: {state: 'open'}},function(err){}); // updates valve 1 in database
						});
					}
					else{ // limit switch 1 high, close valve 1
						serialPort.write("o10$", function(err, results) {
							  console.log('Valve1 closed ');
							  socket.emit('Confirm Valve1 closed',{Valve1_closed: "true"}); // confirm valve 1 is closed
							  collection.update({name: 'valve1'}, {$set: {state: 'closed'}},function(err){}); // updates valve 1 in database
						});
					}
				}
				else{ // limit switch 1 low, close valve 1
						serialPort.write("o10$", function(err, results) {
							  console.log('Valve1 closed ');
							  socket.emit('Confirm Valve1 closed',{Valve1_closed: "true"}); // confirm valve 1 is closed
							  collection.update({name: 'valve1'}, {$set: {state: 'closed'}},function(err){}); // updates valve 1 in database
						});
				}
			});
		});	
	});
	
	// Valve 2 Open/Close and Database Update
	socket.on('Valve2 State', function (data) {
		socket.emit('news',{ update: 'received'});
		db.collection('outputs', function(err, collection){
				collection.update({name: 'valve2'}, {$set: {state: data['valve2']}},function(err){});
				if(data['valve2'] == 'open'){
					serialPort.write("o61$", function(err, results) {
						  console.log('Valve2 open');
						  socket.emit('Confirm Valve2 open',{Valve2_open: "true"});
					});
				}
				else{
					serialPort.write("o60$", function(err, results) { 
						  console.log('Valve2 closed ');
						  socket.emit('Confirm Valve2 closed',{Valve2_closed: "true"});
					});
				}
			});	
	});
	
	// Stirrer On/Off and Database Update
	socket.on('Stirrer State', function (data) {
		socket.emit('news',{ update: 'received'});
		db.collection('outputs', function(err, collection){
			
			collection.distinct('state', {name: 'limit switch 3'}, function(err,ls3_state){ // checks state of Limit switch 3
				collection.distinct('state', {name: 'valve2'}, function(err,v2_state){ // checks state of valve 2
				if(ls3_state =='high' && v2_state == 'closed'){
					if(data['stirrer'] == 'on'){ // valve 2 closed and limit switch 3 is high switch on stirrer
						serialPort.write("o41$", function(err, results) {
							  console.log('Stirrer on');
							  socket.emit('Confirm Stirrer on',{Stirrer_on: "true"}); // confirm stirrer is on
							  collection.update({name: 'stirrer'}, {$set: {state: 'on'}},function(err){}); // updates stirrer in database
						});
					}
					else{ // valve 2 closed and limit switch 3 is high switch off stirrer
						serialPort.write("o40$", function(err, results) {
							  console.log('Stirrer off');
							  socket.emit('Confirm Stirrer off',{Stirrer_off: "true"}); // confirm stirrer is off
							  collection.update({name: 'stirrer'}, {$set: {state: 'off'}},function(err){}); // updates stirrer in database
						});
					}
					
				}
				else{  // valve 2 open or limit switch 3 is low switch off stirrer
						serialPort.write("o40$", function(err, results) {
							  console.log('Stirrer off');
							  socket.emit('Confirm Stirrer off',{Stirrer_off: "true"}); // confirm stirrer is off
							  collection.update({name: 'stirrer'}, {$set: {state: 'off'}},function(err){}); // updates stirrer in database
						});
				}
				});	
			});	
		});	
	});
	
	// Heating Coil On/Off and Database Update
	socket.on('Heating Coil State', function (data) {
		socket.emit('news',{ update: 'received'});
		db.collection('outputs', function(err, collection){
			
			collection.distinct('state', {name: 'limit switch 3'}, function(err,ls3_state){ // checks state of Limit switch 3
				collection.distinct('state', {name: 'valve2'}, function(err,v2_state){ // checks state of valve 2
				if(ls3_state =='high' && v2_state == 'closed'){
					if(data['heatingCoil'] != 'l3000$'){ // valve 2 closed and limit switch 3 is high switch on heating coil
						
						console.log(data['heatingCoil']);
						serialPort.write(data['heatingCoil'], function(err, results) {
							  console.log('Heating coil on');
							   socket.emit('Confirm Heating Coil on',{Heating_Coil_on: "true"}); // confirm heating coil is on
							   collection.update({name: 'heating coil'}, {$set: {state: 'on'}},function(err){}); // updates Heating coil in database	
						});
					}
					else{ // valve 2 closed and limit switch 3 is high switch off heating coil
						serialPort.write(data['heatingCoil'], function(err, results) {
							  console.log('Heating coil off');
							  socket.emit('Confirm Heating Coil off',{Heating_Coil_off: "true"}); // confirm heating coil is off
							  collection.update({name: 'heating coil'}, {$set: {state: 'off'}},function(err){}); // updates Heating coil in database	
						});
					}
					}
					else{ // valve 2 open or limit switch 3 is low switch off heating coil
					serialPort.write("o30$", function(err, results) {
							  console.log('Heating coil off');
							  socket.emit('Confirm Heating Coil off',{Heating_Coil_off: "true"}); // confirm heating coil is off
							  collection.update({name: 'heating coil'}, {$set: {state: 'off'}},function(err){}); // updates Heating coil in database	
						});
					}
				});	
			});	
		});	
	});
	
	// Temperature Control and Database Update
	socket.on('Temperature Control State', function (data) {
		socket.emit('news',{ update: 'received'});
		db.collection('outputs', function(err, collection){
					if(data['tempCon'] == 'on'){ // switch on temperature sensor
							  console.log('Temperature Control on');
							  socket.emit('Confirm Temperature Control on',{TempCon_on: "true"}); // confirm stirrer is on
							  collection.update({name: 'Temperature Control'}, {$set: {state: 'on'}},function(err){}); // updates stirrer in database
								
					}
					else{  // switch off temperature sensor
						
							  console.log('Temperature Control off');
							  socket.emit('Confirm Temperature Control off',{TempCon_off: "true"}); // confirm stirrer is off
							  collection.update({name: 'Temperature Control'}, {$set: {state: 'off'}},function(err){}); // updates stirrer in database
					}
				});	
			});	
	
	// reset server on client page refresh
	socket.on('server reset', function () {
		PacketIndex = 0;
		console.log('reset');
		db.collection('outputs', function(err, collection){
			serialPort.write("o00$", function(err, results) {
					collection.update({name: 'pump1'}, {$set: {state: 'off'}},function(err){}); // updates Pump1 in database
				});
			serialPort.write("o10$", function(err, results) {
					collection.update({name: 'valve1'}, {$set: {state: 'closed'}},function(err){}); // updates valve 1 in database
				});
			serialPort.write("o20$", function(err, results) {
					collection.update({name: 'pump2'}, {$set: {state: 'off'}},function(err){}); // updates Pump 2 in database
				});
			serialPort.write("l3000$", function(err, results) {
					collection.update({name: 'heating coil'}, {$set: {state: 'off'}},function(err){}); // updates Heating coil in database	
				});
			serialPort.write("o40$", function(err, results) {
					collection.update({name: 'stirrer'}, {$set: {state: 'off'}},function(err){}); // updates stirrer in database
				});
			serialPort.write("l5000$", function(err, results) {
					collection.update({name: 'Temperature Control'}, {$set: {state: 'off'}},function(err){}); // updates Temperature Control in database
				});
			serialPort.write("o60$", function(err, results) {
					collection.update({name: 'valve2'}, {$set: {state: 'closed'}},function(err){}); // updates valve 2 in database
				});
			});
	});
	socket.on('Limit Switch 1 Update', function () {
			console.log('write 1');
			serialPort.write("i0$", function(err, results) {
						
					  });
		});
	socket.on('Limit Switch 2 Update', function () {
			console.log('write 2');
			serialPort.write("i1$", function(err, results) {
						
					  });
		});
	socket.on('Limit Switch 3 Update', function () {
			console.log('write 3');
			serialPort.write("i2$", function(err, results) {
					
					  });
		});
	socket.on('Temperature Sensor Update', function () {
			console.log('write 4');
			serialPort.write("a0$", function(err, results) {
					
					  });
			db.collection('tank2_temp', function(err, collection){
			collection.update({name: 'tank2'}, {$set: {temperature: temp}},function(err){}); // updates tank2 temp in databa						});		  
			collection.distinct('temperature', {name: 'tank2'}, function(err,temp){ 
				socket.emit('Temperature Update',{TempVal: temp}); 
		});		 
});
});
});
