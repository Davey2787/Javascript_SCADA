var i = 0;
var j = 0;
var mongodb = require('mongodb');

var db = new mongodb.Db('trend_test', new mongodb.Server('127.0.0.1', 27017), {safe: true});
    db.open(function(err)
		 {
			db.collection('temp_range', function(err, collection)
			{
				while(1)
				{
					i = Math.floor((Math.random()*100)+1);			
					j = Math.floor((Math.random()*100)+1);			
					collection.insert([{x_coor: i , y_coor:j}], {w:1}, function(err, result) {
						console.log(err);
					});
				}
			});
		});
		
				
function err_callback(err)
{
	console.log(err);
}


