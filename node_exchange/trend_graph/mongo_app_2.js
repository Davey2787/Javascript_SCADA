// need to run 
// npm install socket.io in the same directory as this
var mongo_app = require('http').createServer(handler)
  , io = require('socket.io').listen(mongo_app)
  , fs = require('fs')
var mongodb = require('mongodb');


mongo_app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/mongo_test_2.html',
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
  socket.on('Button State', function (data) {
	socket.emit('news',{ update: 'received'});
    console.log(data);
    var db = new mongodb.Db('trend_test', new mongodb.Server('127.0.0.1', 27017), {safe: true});
		db.open(function(err)
	{
		db.collection('temp_range', function(err, collection)
		{	
			collection.find({ x_coor: { $exists: true}}).sort({$natural:-1}).limit(10).toArray(function(err, items){
				
				for(var i=0; i < items.length; i++)
				{	
					//console.dir(items[i].x_coor)
					var timeStamp = items[i]._id.getTimestamp();
					var timeStampstr = timeStamp.toString();
					var time = timeStampstr.substr(16,8);
					socket.emit('time_stamp',[time,items[i].x_coor,items[i].y_coor]);
				}		
			});
		});
	});
	});
});

		
function err_callback(err)
{
	console.log(err);
}
/*db.open(function(err)
		 {
			console.log('Made it here');
			db.collection('inputs', function(err, collection)
			{
				console.log(data['btn']);
				collection.update({name: 'start_button'}, {$set: {status: data['btn']}},err_callback);
				
			});
		});*/
