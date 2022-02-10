// JavaScript Document

var mongodb = require('mongodb');

module.exports = {
	
	
	init : function(r){
		r.mongo  = mongodb;
	},
	
	run : function(r,p,c){
		var params = p;
		mongodb.MongoClient.connect("mongodb://localhost:27017",{useUnifiedTopology: true, useNewUrlParser: true },function(e,client) {
			var db = client.db(params[0]);
			var collection = db.collection(params[1]);
			c(client,collection);
		});
	},
	
	set : {
		
		collection : 
		{
			item  :{
				insert : function(r,p,c){
					var params = p;
					r.run(r,params,function(client,collection){
						collection.insertOne(params[2],function(e,p){
							client.close();
							typeof c==="function"?c(p):null;
						});
					});
				},
				update : function(r,p,c){
					var params = p;
					r.run(r,params,function(client,collection){
						var id = new r.mongo.ObjectID(params[2]);
						collection.updateOne({"_id":id},{$set:params[3]},function(e,p){
							client.close();
							typeof c==="function"?c(p):null;
						});
					});
				}
			},
			items : {
				
			}
		},
		
	},
	
	get : {
		
		
		collection : 
		{
			item  : function(r,p,c){
				var params = p;
				r.run(r,params,function(client,collection){
					var id = new r.mongo.ObjectID(params[2]);
					collection.findOne({"_id":id},function(e,p){
						client.close();
						typeof c==="function"?c(p):null;
					});
				});
			},
			items : function(r,p,c){
				var params = p;
				r.run(r,params,function(client,collection){
					collection.find(params[2]).toArray(function(e,p){
						client.close();
						typeof c==="function"?c(p):null;
					});
				});
			}
		},
		
		
	},
	let : {
		
		collection : 
		{
			item  : function(r,p,c){
				var params = p;
				r.run(r,params,function(client,collection){
					var id = new r.mongo.ObjectID(params[2]);
					collection.deleteOne({"_id":id},function(e,p){
						client.close();
						typeof c==="function"?c(p):null;
					});
				});
			},
			items : function(r,p,c){
				var params = p;
				r.run(r,params,function(client,collection){
					collection.deleteMany(params[2],function(e,p){
						client.close();
						typeof c==="function"?c(p):null;
					});
				});
			}
		},
		
		
	}
	
}