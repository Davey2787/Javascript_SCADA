var mongodb = require('mongodb');

var db = new mongodb.Db('trend_test', new mongodb.Server('127.0.0.1', 27017), {safe: true});
    db.open(function(err)
	{
		db.collection('temp_range', function(err, collection)
		{	
			collection.find({ x_coor: { $exists: true}}).sort({$natural:-1}).limit(10).toArray(function(err, items){
				
				for(var i=0; i < items.length; i++)
				{	
					console.dir(items[i].x_coor)
					var timeStamp = items[i]._id.getTimestamp();
					var timeStampstr = timeStamp.toString();
					var time = timeStampstr.substr(16,8);
					console.dir(time);
				}		
			});
		});
	});
		
				
function err_callback(err)
{
	console.log(err);
}


