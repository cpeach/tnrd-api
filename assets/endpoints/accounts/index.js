const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool 		= AmazonCognitoIdentity.CognitoUserPool;
const aws      	= require('aws-sdk');
const mongoose 	= require('mongoose');
const http 		= require('http');

// MODELS 
const application_model = require('../../models/accounts/application.js');
const department_model  = require('../../models/accounts/department.js');
const role_model = require('../../models/accounts/role.js');
const user_model = require('../../models/accounts/_user.js');
//https://medium.com/@prasadjay/amazon-cognito-user-pools-in-nodejs-as-fast-as-possible-22d586c5c8ec
module.exports = { 
 
//	DATA
	data : {
		mongo:{
			db:process.env.tnrd_accounts_db,
			options : {useNewUrlParser: true,useUnifiedTopology: true}
		},
	}, 
	
//	INIT
	init : function(r){ 
		r = r || this;
		r.db = mongoose.createConnection(process.env.mongo+r.data.mongo.db,r.data.mongo.options);
		
		r.models = {};
		r.models.application = application_model.get(r.db);
		r.models.department  = department_model.get(r.db);
		r.models.role = role_model.get(r.db);
		r.models.user = user_model.get(r.db);
		 
		aws.config.accessKeyId     = process.env.tnrd_iam_key;
		aws.config.secretAccessKey = process.env.tnrd_iam_skey;
		aws.config.region          = process.env.tnrd_iam_region;
		
		r.cognito = new aws.CognitoIdentityServiceProvider();

		return r;
	},

	
	
//	SIGNUP
	
	signup : function(r,p,c){
		
		var username = p.username;
		var password = p.password;
		var profile  = p.profile;
		var source   = p.application;
		var user     = {username:username,hidden:p.hidden,profile:profile,applications:{}};
		user.applications[source.id]={role:source.role,meta:source.meta};
		r.applications.get.item(r,profile.application,function(p){
			application = p;
		//  insert identity
			var pool     = {UserPoolId:application.cognito_id,ClientId:application.cognito_client};
			var userPool = new AmazonCognitoIdentity.CognitoUserPool(pool);
			userPool.signUp(username,password,[], null,async function(e,p){
				var identity = p;
				if(e){
					c({message:e.message,code:0})
				}else{
				//  insert profile
					var _profile = await r.profiles.insert(r,[application.path,profile.meta]);
					if(_profile.code===1){
					// insert user
						user.reference = identity.userSub;
						user.profile = {};
						user.profile.id = _profile.id;
						user.profile.application = profile.application;

						var _user = await r.users.insert(r,user);
						c({payload:_user,code:1});
					}else{
						c(_profile);
					}
				}
			});
		});
		
	},	
	
//	SIGNIN
	signin : function(r,p,c){
		var user = p.user.toString();
		var pass = p.pass;
		r.applications.get.item(r,p.application,function(p){
			var pool = {UserPoolId:p.cognito_id,ClientId:p.cognito_client};
		
			var up = new AmazonCognitoIdentity.CognitoUserPool(pool);

			var _user = user ? user : "";
			var _pass = pass ? pass : "";

			var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
				Username : _user,Password : _pass,
			});

			var cognitoUser = new AmazonCognitoIdentity.CognitoUser({Username:_user,Pool:up});
			cognitoUser.authenticateUser(authenticationDetails, {
				onSuccess: function(p) {
					var access = p.getAccessToken().payload;
					var payload = {
						refresh : p.getRefreshToken().getToken(),
						token : p.getAccessToken().getJwtToken(),
						role  : access.role,
						exp   : access.exp,
						identity : p.getIdToken().payload
					};
					c({payload:payload,code:1});

				},
				onFailure: function(e) {
					c({payload:e.message,code:0});
				},
			});
			
		})	
		

	},
	
//	SIGNOUT
	signout : function(r,p,c){},
	
//	DELETE
	delete :async function(r,p,c){

		//  Get User
			var user = await r.users.get.item(r,p.toString());
	
			if(user !== null){
				
				var app  = await r.models.application.findById(user.profile.application._id).lean();
				
			//	Delete Profile
				var deleted_profile = await r.profiles.delete(r,[user.profile.application.path,user.profile._id]);
				
			//	Delete User
				var deleted_user = await r.models.user.deleteOne({_id:user._id});
			
			//	Delete Cognito
				if(deleted_profile.code){
					r.cognito.adminDeleteUser({UserPoolId:app.cognito_id,Username:user.reference},(e,p) => {
						if(e){
							c({code:0,message:"Could Not Delete Cognito Identity",payload:e});
						}else{
							r.users.delete(r,{reference:user.reference},function(p){
								c({code:1,message:"User Deleted Successfully",payload:user});
							});
						}
						//	delete user	
					});
				}
			}
			
	},		
			
	
//	VALIDATE
	validate : function(r,p,c){},	
	
//	REFRESH
	refresh : function(r,p,c){
		
		
		if(p && p.application && p.user && p.token ){
			var application = p.application;
			var _token = p.token;
			var _user  = p.user.toString();
			r.applications.get.item(r,application,function(p){
				
				application = p;
				var token = new AmazonCognitoIdentity.CognitoRefreshToken({RefreshToken:_token});
				var pool  = {UserPoolId:p.cognito_id,ClientId:p.cognito_client};

				const user = {
					Username: _user,
					Pool: new AmazonCognitoIdentity.CognitoUserPool(pool)
				};  

				const cognitoUser = new AmazonCognitoIdentity.CognitoUser(user);
				
				cognitoUser.refreshSession(token,async (e,p) => {
					
					if (e) {
						//console.log("fail");
						c({code:0,message:e});  
					} else {  
						//console.log("pass")
						var session  = p;
						var identity = session.getIdToken().payload;
						var user = await r.models.user.findOne({"reference":identity.sub}).lean();
						user = await r.users.get.item(r,user._id);
						delete user.hidden;
						c({
							"code":user.code?user.code:1,
							"message":user.message?user.message:'',
							"expiry":session.getAccessToken().payload.exp,
							"token" :session.accessToken.jwtToken,
							identity:identity,
							user:user,
							"application":application._id
						});						
					

					}
				});
			});
		}else{
			c({code:0});  
		}
	},
	
	
//	PASSWORD
	password : {
		request :async function(r,p,c){
			var _user       = await r.models.user.findOne({username:p}).lean();
			
			if(_user !== null){
				var application = await r.models.application.findById(_user.profile.application);
				var pool        = {UserPoolId:application.cognito_id,ClientId:application.cognito_client};

				const user = {
					Username: p,
					Pool: new AmazonCognitoIdentity.CognitoUserPool(pool)
				};  

				const cognitoUser = new AmazonCognitoIdentity.CognitoUser(user);
				cognitoUser.forgotPassword({
					onFailure(e) {
						console.log("Failed");
						console.log(e);
						c(e)
					},
					onSuccess(p) {
						console.log("Success");
						c({code:1,message:"Success"})
					}}
				)
			}else{
				c({code:0,message:"User not found"})
			}
			
		},
		reset :async function(r,p,c){
			var _user = await r.models.user.findOne({username:p.username}).lean();
			if(_user !== null){
				var application = await r.models.application.findById(_user.profile.application);
				var pool        = {UserPoolId:application.cognito_id,ClientId:application.cognito_client};

				const user = {
					Username: p.username,
					Pool: new AmazonCognitoIdentity.CognitoUserPool(pool)
				};  

				const cognitoUser = new AmazonCognitoIdentity.CognitoUser(user);
			
				cognitoUser.confirmPassword(p.code,p.pass,{ 
					onSuccess(p){
						console.log("Success");
						c({code:1,message:"Success"})
					},
					onFailure(e){
						console.log("Failed");
						c({code:0,message:e.message});
					}}
					
				)
			}else{
				c({code:0,message:"User not found"})
			}			
		}
	},
	
//	ATTRIBUTES
	attributes : {
		get    : function(r,p,c){},
		update : function(r,p,c){},
	},	

//	APPLICATIONS
	applications : {
		query : async function(r,p,c){
			var applications = await r.models.application.find(
        {$or:[{ name: { $regex: p.term, $options: "i" }},{ description: { $regex: p.term, $options: "i" }}]}
      ).lean();
      var departments  = await r.models.department.find({}).lean();
      	applications.map(async (app,a)=>{
					delete app.cognito_client;
					delete app.cognito_id;
					departments.map((dep,d)=>{
						applications[a].departments.map((item,i)=>{
							if(item===dep._id.toString()){
								app.departments[i]=dep;
							}
						})
					})
				});
      var app;
		  for(var a in applications){
				app = applications[a];
				if(app.image){
				  var img  = await fetch("https://api.tnrdit.ca/api-console/images/"+app.image);
				  var _img = await img.json();
				  applications[a].image = _img;
        }
		  }
			c(applications);
		},
		get : {
			
			public : async function(r,p,c){
				try{
					var application = await r.models.application.findById(p).lean();
					var departments = await r.models.department.find({}).lean();

					delete application.cognito_client;
					delete application.cognito_id;
					
					departments.map((dep,d)=>{

						application.departments.map((item,i)=>{
							if(item===dep._id.toString()){
								application.departments[i]=dep;
							}
						})
					})
					c(application);
				}catch(e){
					c({})
				}
			},
			
			all_public : async function(r,c){
				var applications = await r.models.application.find({}).lean();
				var departments  = await r.models.department.find({}).lean();

				applications.map(async (app,a)=>{
					delete app.cognito_client;
					delete app.cognito_id;
					departments.map((dep,d)=>{
						applications[a].departments.map((item,i)=>{
							if(item===dep._id.toString()){
								app.departments[i]=dep;
							}
						})
					})
				});
				var app;
				for(var a in applications){
					app = applications[a];
					if(app.image){
						var img  = await fetch("https://api.tnrdit.ca/api-console/images/"+app.image);
						var _img = await img.json();
						applications[a].image = _img;
					}
				}
				c(applications);
			},
			all : async function(r,c){
				var result = await r.models.application.find({}).lean();
				c(result);
			},
			item : async function(r,p,c){
				var result = await r.models.application.findById(p).lean();
				c(result);
			}
		},
		update : async function(r,p,c){
			var res = await r.models.application.updateOne({_id:p._id},p);
			c(res);
		},
		insert : async function(r,p,c){
			var res = new r.models.application(p);
			res.save(function (e) {e ? c(e) : c(res);});
		},
		delete : async function(r,p,c){
			var res = await r.models.application.deleteOne({'_id':p});
			c(res);	
		},		
	}, 
//	DEPARTMENTS
	departments : {
		query : async function(r,p,c){
			var result = await r.models.department.find(p);
			c(result);
		},
		get    :{
			item : async function(r,p,c){
				var result = await r.models.department.findById(p);
				c(result);
			}
		},
		update : async function(r,p,c){
			var res = await r.models.department.updateOne({_id:p._id},p);
			c(res);
		},
		insert : async function(r,p,c){
			var res = new r.models.department(p);
			res.save(function (e) {e ? c(e) : c(res);});
		},
		delete :async function(r,p,c){
			var res = await r.models.department.deleteOne({'_id':p});
			c(res);	
		},
	},		
//	ROLES
	roles : {
		query : async function(r,p,c){
			var result = await r.models.role.find(p);
			c(result);
		},
		get : async function(r,p,c){
			var result = await r.models.role.findById(p);
			c(result);
		},
		insert : function(r,p,c){
			var res = new r.models.role(p);
			res.save(function (e) {
				e ? c(e) : c(res);
			});
		},
		update : function(r,p,c){},
		delete : function(r,p,c){},
	},	
//	USERS
	users : {
		query : async function(r,p,c){
			var users  = await r.models.user.find(p).lean();
			for(user in users){
				users[user] = await r.users.get.item(r,users[user]._id);
			}
			c(users);				
		},
		
		get : {
			
			item : async function(r,p,c){
				var user = await r.models.user.findById(p).lean();
				if(user !== null){
					var app  = await r.models.application.findById(user.profile.application).lean();
					delete app.cognito_client;
					delete app.cognito_id;
					user.profile = await r.profiles._get(r,[app.path,user.profile.id]);
					user.profile.application = app;
					for(application in user.applications){
						var role = await r.models.role.findById(user.applications[application].role).lean();
						user.applications[application].role = role;
					}
					return user					
				}
				return null;
			},
			record : async function(r,p,c){
				
				var user  = await r.models.user.findOne({reference:p}).lean();
				
				
				
				
				
				
				user.profile = await r.profile()
				
				//model.applications= user.applications;
				model.application = user.application;
				model.data 		  = user.data;
				model.profile_id  = user.profile;
				model.reference   = user.reference;
				r.roles.get(r,user.role,function(p){
					model.role = p.name;
					r.profiles.get(r,[model,path,user],c);
				});
				

			},
			_record : async function(r,p,c){
				
				// if application has a profile then use it otherwise just use source profile id
				// ** next figure out records
				
				/*
				{
					profile : {id:"",application:""},
					applications : {"123":{role:"",meta:{}}},
					reference : ""
					
				}
				*/
				var role;
				var user   = await r.models.user.findOne({reference:p[0]}).lean();
				var source = await r.models.application.findOne({_id:user.profile.application}).lean();
				if(user.applications[p[1]]){
				   role = await r.models.role.findOne({_id:user.applications[p[1]].role}).lean();
				   user.role = role.name;
				}
				
				r.profiles._get(r,[user,source.path,user.profile.id],c);
				
			},			
			records : function(r,p,c){
				var items  = p[0];
				var path   = p[1];
				var app_id = p[2];
				var position = p[3] ? p[3] : 0;
				var model = {},user;
				if(position < items.length){ 
					user 		= items[position];
					role        = user.role;
					//model.applications= user.applications;
					model.application = app_id;
					model.data 		  = user.data;
					model.profile_id  = user.profile;
					model.reference   = user.reference;
					r.roles.get(r,role,function(p){
						model.role = p.name;
						r.profiles.get(r,[model,path,user],function(p){
							items[position] = p
							r.users.get.records(r,[items,path,app_id,(position+1)],c);
						});
					}); 
				}else{
					c(items);
				}
			},
			_records : function(r,p,c){
				var items  = p[0];
				var path   = p[1];
				var app_id = p[2];
				var position = p[3] ? p[3] : 0;
				var model = {},user;
				if(position < items.length){ 
					user 		= items[position];
					role        = user.role;
					//model.applications= user.applications;
					model.application = app_id;
					model.data 		  = user.data;
					model.profile_id  = user.profile;
					model.reference   = user.reference;
					r.roles.get(r,role,function(p){
						model.role = p.name;
						r.profiles.get(r,[model,path,user],function(p){
							items[position] = p
							r.users.get.records(r,[items,path,app_id,(position+1)],c);
						});
					}); 
				}else{
					c(items);
				}
			},
			
		},
		
		insert :async function(r,p){
			return await r.models.user.create(p);
		},
		update : function(r,p,c){},
		delete :async function(r,p,c){ 
			var user = await r.models.user.deleteOne(p);
			c(p);			
		},
		role:{
			update : async function(r,p,c){
				var user_id = p[0];
				var app_id  = p[1];
				var data    = p[2];
				var user    = await r.models.user.findOne({'profile.id':user_id}).lean();
				var applications = user.applications;
				applications[app_id]=data;
				var res = await r.models.user.updateOne({"_id":user._id},{"$set":{"applications":applications}})
				c(res)
			},
			blocked : async function(r,p,c){
				var user_id = p[0];
				var app_id  = p[1];
				var blocked   = p[2];
				var user    = await r.models.user.findOne({'profile.id':user_id}).lean();
				var applications = user.applications;
				applications[app_id].blocked = blocked;
				var res = await r.models.user.updateOne({"_id":user._id},{"$set":{"applications":applications}})
				c(res)
			}
		}
	},
	
//	PROFILES
	profiles : {
		get    : function(r,p,c){
			var model=p[0]?p[0]:{}; 
			r.request(r,['GET','localhost','8443',p[1]+'/profile/'+p[2].profile],function(p){
				model.profile = JSON.parse(p);
				model.code = model.profile.code ? model.profile.code : 1;
				model.message = model.profile.message ? model.profile.message : '';
				c(model);
			});
		},
		
		_get    :async function(r,p,c){
			let response = await fetch('http://localhost:8443'+p[0]+'/profile/'+p[1]);
			return response.json();
		},
		
		__get    : function(r,p,c){
			var path=p[0],id=[1]; 
			r.request(r,['GET','localhost','8443',path+'/profile/'+id],function(p){
				c(JSON.parse(p));
			});
		},
		insert :async function(r,p,c){
			return await fetch('http://localhost:8443'+p[0]+'/profile/', {
				method: 'POST',
				headers: {
				  'Accept': 'application/json',
				  'Content-Type': 'application/json'
				},
				body: JSON.stringify(p[1])
			}).then(response => response.json());
			/*
			r.request(r,['POST','localhost','8443',p.path+'/profile',p.meta],function(p){
				c(typeof p === 'string'?JSON.parse(p):p);
			});	*/		
		},
		update : function(r,p,c){},
		delete :async function(r,p,c){
			return await fetch('http://localhost:8443'+p[0]+'/profile/'+p[1], {
				method: 'DELETE',
			}).then(response => response.json());
		},		
	},
	
//	REQUEST
	request : function(r,p,c){
		var data = typeof p[4] === 'object' ? JSON.stringify(p[4]):p[4];
		var req = http.request({method:p[0],host:p[1],port:p[2],path:p[3]}, function(p){
			var str = '';
			p.on('data',function(chunk){str+=chunk;});
			p.on('end',function(){c(str);});
		});
		req.setHeader('Content-Type', 'application/json');
		p[0]!=='GET'&& p[0]!=='DELETE'?req.write(data):null;
		req.end();
	}

	
}