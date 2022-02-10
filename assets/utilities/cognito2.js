const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS      = require('aws-sdk');
const mongoose = require('mongoose');
const http = require('http');

// MODELS
const application_model = require('../models/accounts/application.js');
const department_model = require('../models/accounts/department.js');
const role_model = require('../models/accounts/role.js');
const user_model = require('../models/accounts/user.js');

module.exports = { 
 
//	DATA
	data : {
		mongo:{
			db:process.env.tnrd_accounts_db,
			options : {useNewUrlParser: true,useUnifiedTopology: true}
		},
	}, 
	
//	INIT
	init : function(r,p,c){
		r.db = mongoose.createConnection('mongodb://localhost/'+r.data.mongo.db,r.data.mongo.options);
		
		r.models = {};
		r.models.application = application_model.get(r.db);
		r.models.department  = department_model.get(r.db);
		r.models.role = role_model.get(r.db);
		r.models.user = user_model.get(r.db);
	},
	
//	SIGNUP
	signup : function(r,p,c){},
	
//	SIGNIN
	signin : function(r,p,c){
			
		var pool = {UserPoolId:process.env.tnrd_im_cognito_id,ClientId:process.env.tnrd_im_cognito_client};
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
	
//	VALIDATE
	validate : function(r,p,c){},	
	
//	REFRESH
	refresh : function(r,p,c){
		
		if(p.application && p.user && p.token){
			var application = p.application;

			var token = new AmazonCognitoIdentity.CognitoRefreshToken({RefreshToken:p.token});
			var pool  = {UserPoolId:process.env.tnrd_im_cognito_id,ClientId:process.env.tnrd_im_cognito_client};

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
			var path = p[2];
			var model = {};
			var user = await r.models.user.find({application:p[0],reference:p[1]});
			user = user[0];
			
			model.application = user.application;
			model.data 		  = user.data;
			model.profile_id  = user.profile;
			model.reference   = user.reference;
			
			r.roles.get(r,user.role,function(p){
				model.role = p.name; 
				r.request(r,['localhost','8443',path+'/user/'+user.profile],function(p){
					model.profile = JSON.parse(p);
					c(model);
				})
				
			});
			
		},
		insert : function(r,p,c){},
		update : function(r,p,c){},
		delete : function(r,p,c){},
	},	
	
//	REQUEST
	request : function(r,p,c){
		http.request({host:p[0],port:p[1],path:p[2]}, function(p){
			var str = '';
			p.on('data',function(chunk){str+=chunk;});
			p.on('end',function(){c(str);});
		}).end();		
	}

	
}