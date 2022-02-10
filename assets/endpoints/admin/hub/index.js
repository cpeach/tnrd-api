
const cognito  = require('../../../utilities/cognito.js');
const mongoose = require('mongoose');
const fs	   = require('fs');
const s3	   = require('../../../utilities/s3.js');

// MODELS

const models = require('./models.js');

module.exports = {
	
	data : {
		
		mongo:{
			db:process.env.tnrd_apps_db,
			options : {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true}
		},
		
		
	}, 
	
	init : function(r){

		r.db = mongoose.createConnection('mongodb://localhost/'+r.data.mongo.db,r.data.mongo.options);
		
		r.models = {};
		r.models.user   = models.user(r.db);
		r.models.images = models.images(r.db);
		r.s3  = s3.init(s3); 
		r.accounts = {
			path:"https://api.tnrdit.ca/accounts"
		};
		
	},
	
//	PROFILES
	profiles : {
		get : async function(r,p,c){
			var user = await r.models.user.findById(p).lean()
			user = user||{code:99,message:'Apps user not found'};
			c(user);
		},
		insert :async function(r,p,c){
			var user = await r.models.user.create(p);
			c({code:user._id?1:0,message:user._id?'valid':'failed to insert profile',id:user._id||'-1'});
		},
		delete :async function(r,p,c){
			var user = await r.models.user.deleteOne({_id:p});
			user.code=1
			c(user);
		}
	},
	
	
//	DEPARTMENTS
	departments : {
		export : {},
		query : {
			all : async function(){}
		},
		get : {
			
			all  : async function(r,c){
				var res = await fetch(r.accounts.path+"/departments");
				c(await res.json());
			},
			byId : async function(r,p,c){
				var res  = await fetch(r.accounts.path+"/department/"+p);
				c(await res.json());
			}
			
		},
		insert  : async function(r,p,c){
			var params = {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/departments/",params);
			c(await res.json());			
		},
		update  : async function(r,p,c){
			var params = {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/departments/",params);
			c(await res.json());			
		},
		delete  : async function(r,p,c){
			var res    = await fetch(r.accounts.path+"/departments/"+p,{method:'DELETE'});
			c(await res.json());
		}
		
	},	
	
//	APPLICATIONS
	applications : {
		export : {},
		query : {
			all : async function(r,p,c){
      
      }
		},
		get : {
			
			all  : async function(r,c){
				var res = await fetch(r.accounts.path+"/applications");
				c(await res.json());
			},
			byId : async function(r,p,c){
				var res  = await fetch(r.accounts.path+"/applications/"+p);
				var json = await res.json();
				if(json.image){
					
					console.log(json.image)
					r.images.get(r,json.image,function(p){
						console.log(p)
						json.image_meta = p;
						c(json);
					})
				}else{
					c(json);
				}
				
			}
			
		},
		insert  : async function(r,p,c){
			
			var params = {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/applications/",params);
			var json   = await res.json();

			// create default roles
			
			params.body = JSON.stringify({ name: 'Public', application: json._id, scope: {} })
			await fetch(r.accounts.path+"/roles/",params);
			params.body = JSON.stringify({ name: 'Staff', application: json._id, scope: {} })
			await fetch(r.accounts.path+"/roles/",params);
			params.body = JSON.stringify({ name: 'Admin', application: json._id, scope: {} })
			await fetch(r.accounts.path+"/roles/",params);
			params.body = JSON.stringify({ name: 'Root', application: json._id, scope: {} })
			await fetch(r.accounts.path+"/roles/",params);
			
			console.log(json)
			c(json);			
		},
		update  : async function(r,p,c){
			var params = {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/applications/",params);
			c(await res.json());			
		},
		delete  : async function(r,p,c){
		
			var res    = await fetch(r.accounts.path+"/applications/"+p,{method:'DELETE'});
			c(await res.json());			
		}
		
	},
//	ROLES 
	roles : {
		get : {
			all : async function(r,c){
				var res  = await fetch(r.accounts.path+"/roles");
				var roles = await res.json();
				for(i in roles){
					var app_res = await fetch(r.accounts.path+"/applications/"+roles[i].application);
					var app     = await app_res.json();
					roles[i].application = app.name;
				}
				c(roles);
			},
			byApplication : async function(r,p,c){
				var res = await fetch(r.accounts.path+"/roles/"+p);
				c(await res.json());
			}
		},
		insert : async function(r,p,c){
			console.log(p)
			var params = {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/roles/",params);
			c(await res.json());	
			
			//c({})
		}
	},

//	USERS
	users : {
		export : {},
		query : {
			all : async function(){}
		},
		get : {
			
			all  : async function(r,c){
				
				var users = [];
				var res   = await fetch(r.accounts.path+"/users");
				res       = await res.json();
				res.map(item=>{
					if(item.profile.application._id === '60906b4cf5e24d7d2498642b'){
						users[users.length] = item;
					}
				}) 
				
				c(users); 
			},
			byRef : async function(r,p,c){
				var res  = await fetch(r.accounts.path+"/users/ref/"+p);
				var user = await res.json();
				c(user);
			},
			byProfile : async function(r,p,c){
				var res  = await fetch(r.accounts.path+"/users/profile/"+p);
				var user = await res.json();
				c(user);
			}
			
		},
		insert  : async function(r,p,c){
			console.log(p)
			/* var params = {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/users/",params);
			c(await res.json()); */			
			c({})
		},
		update  : async function(r,p,c){
			
			var params = {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/users/",params);
			c(await res.json());	
	
		},
		delete  : async function(r,p,c){
			var res    = await fetch(r.accounts.path+"/users/"+p,{method:'DELETE'});
			c(await res.json());			
		},

		role : {
			update : async function(r,p,c){
				var params = {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p[2])}
				var res    = await fetch(r.accounts.path+"/user/role/"+p[0]+"/"+p[1],params);
				var json   = await res.json();
				c(json); 
			},
			blocked : async function(r,p,c){
				console.log(p)
				var params = {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p[2])}
				var res    = await fetch(r.accounts.path+"/user/blocked/"+p[0]+"/"+p[1],params);
				var json   = await res.json();
				c(json);
			}
		}
		
	},
	
	
//	IMAGES
	images : {
		get : async function(r,p,c){
			var image = await r.models.images.findById(p);
			c(image)
		},
		post : async function(r,p,c){
				var params = p;
				var path   = p.path;
				params.application = 'tnrd-hub';
				params.folder      = 'images';
				params.body        = fs.readFileSync(path); 
				
				r.s3.upload(r.s3,params,async function(p){
			
					delete params.body;
					delete params.destination;
					delete params.path;
					params.application = params.ref;
					params.url    = p.Location;
					params.key    = p.key;
					params.bucket = 'tnrd-assets';
					var image = await r.models.images.create(params);
					fs.unlinkSync(path);
					c(image)
				})
				
		},
		delete : async function(r,p,c){
			var id = p;
			var image = await r.models.images.findById(id);
			
			//var image = await r.models.images.deleteOne({_id:p});

			r.s3.delete(r.s3,image,async function(p){
				console.log(221);
				console.log(p)
				var res = await r.models.images.deleteOne({_id:id});
				c(p);	
			})
			//console.log(image)
			
		},

	}
	
	
	
	
	
	
}