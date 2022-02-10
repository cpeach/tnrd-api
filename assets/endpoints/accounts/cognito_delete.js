const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool 		= AmazonCognitoIdentity.CognitoUserPool;
const AWS      	= require('aws-sdk');
const mongoose 	= require('mongoose');
const http 		= require('http');

// MODELS
const application_model = require('../../models/accounts/application.js');
const department_model = require('../../models/accounts/department.js');
const role_model = require('../../models/accounts/role.js');
const user_model = require('../../models/accounts/user.js');

module.exports = { 
 
//	DATA
	data : {
		mongo:{
			db:process.env.tnrdaccounts_db,
			options : {useNewUrlParser: true,useUnifiedTopology: true}
		},
	}, 
	
//	INIT
	init : function(r){
		r.db = mongoose.createConnection('mongodb://localhost/'+r.data.mongo.db,r.data.mongo.options);
		
		r.models = {};
		r.models.application = application_model.get(r.db);
		r.models.department  = department_model.get(r.db);
		r.models.role = role_model.get(r.db);
		r.models.user = user_model.get(r.db);
	},
	
//	SIGNUP
	signup : function(r,p,c){
		
		var data     = p.data;
		var profile  = p.profile;
		var username = p.username;
		var password = p.password;
		var application = p.application;
		var role = p.role;
		var user = {application:application,role:role,data:data};
		
		r.applications.get(r,p.application,function(p){
			// 	set profile
			r.profiles.insert(r,[profile,p.path],function(p){
				profile = p;
				if(profile.code===1){
					// set identity
					var pool     = {UserPoolId:process.env.tnrd_cognito_id,ClientId:process.env.tnrd_cognito_client};
					var userPool = new AmazonCognitoIdentity.CognitoUserPool(pool);
					userPool.signUp(username,password,[], null, function(e,p){
						if(e){
							c({message:e.message,code:0})
						}else{
							// insert user
							user.reference = p.userSub;
							user.profile = profile.id;
							r.users.insert(r,user,function(p){
								c({payload:p,code:1});
							});
							
						}
					});
				}else{
					c(profile)
				}
				console.log(p);
				
			});
		})
		
	},
	
//	SIGNIN
	signin : function(r,p,c){
			
		var pool = {UserPoolId:process.env.tnrd_cognito_id,ClientId:process.env.tnrd_cognito_client};
		var up = new AmazonCognitoIdentity.CognitoUserPool(pool);
		
		var _user = p.user ? p.user : "";
		var _pass = p.pass ? p.pass : "";
		
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
		
	},
	
//	SIGNOUT
	signout : function(r,p,c){},	
	
//	VALIDATE
	validate : function(r,p,c){},	
	
//	REFRESH
	refresh : function(r,p,c){
		
		if(p.application && p.user && p.token){
			var application = p.application;

			var token = new AmazonCognitoIdentity.CognitoRefreshToken({RefreshToken:p.token});
			var pool  = {UserPoolId:process.env.tnrd_cognito_id,ClientId:process.env.tnrd_cognito_client};

			const user = {
				Username: p.user,
				Pool: new AmazonCognitoIdentity.CognitoUserPool(pool)
			};  

			const cognitoUser = new AmazonCognitoIdentity.CognitoUser(user);

			cognitoUser.refreshSession(token,(e,p) => {
				if (e) {
					console.log("fail")
					c({code:0,message:e});  
				} else { 
					console.log("pass")
					var session  = p;
					var identity = session.getIdToken().payload;

					r.applications.get(r,application,function(p){
						var application = p;
						r.users.get(r,[application._id,identity.sub,application.path],function(p){
							c({
								"code":1,
								"expiry":session.getAccessToken().payload.exp,
								"token" :session.accessToken.jwtToken,
								identity:identity,
								model:p
							});
						});
					})
				}
			})
		}else{
			c({code:0});  
		}
	},
	
//	PASSWORD
	password : function(r,p,c){},
	
//	ATTRIBUTES
	attributes : {
		get    : function(r,p,c){},
		update : function(r,p,c){},
	},	

//	APPLICATIONS
	applications : {
		get : async function(r,p,c){
			var result = await r.models.application.find({_id:p});
			c(result[0]);
		},
		update : function(r,p,c){},
		delete : function(r,p,c){},		
	}, 
//	DEPARTMENTS
	departments : {
		get    : function(r,p,c){},
		update : function(r,p,c){},
		delete : function(r,p,c){},
	},		
//	ROLES
	roles : {
		get    :async function(r,p,c){
			var result = await r.models.role.find({_id:p});
			c(result[0]);
		},
		update : function(r,p,c){},
		delete : function(r,p,c){},
	},	
//	USERS
	users : {
		get    :async function(r,p,c){
			var path  = p[2];
			var model = {};
			var user  = await r.models.user.find({application:p[0],reference:p[1]});
			user      = user[0];
			
			model.application = user.application;
			model.data 		  = user.data;
			model.profile_id  = user.profile;
			model.reference   = user.reference;
			
			r.roles.get(r,user.role,function(p){
				model.role = p.name;
				r.profiles.get(r,[model,path,user],c);
			});
			
		},
		insert :async function(r,p,c){
			var user = await r.models.user.create(p);
			c(p);
		},
		update : function(r,p,c){},
		delete : function(r,p,c){},
	},
	
//	PROFILES
	profiles : {
		get    : function(r,p,c){
			var model=p[0]?p[0]:{}; 
			r.request(r,['GET','localhost','8443',p[1]+'/profile/'+p[2].profile],function(p){
				model.profile = JSON.parse(p);
				c(model);
			});
		},
		insert : function(r,p,c){
			r.request(r,['POST','localhost','8443',p[1]+'/profile',p[0]],function(p){
				c(JSON.parse(p));
			});			
		},
		update : function(r,p,c){},
		delete : function(r,p,c){},		
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
		p[0]!=='GET'?req.write(data):null;
		req.end();
	}

	
}