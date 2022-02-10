
//COGNITO
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS      = require('aws-sdk');

module.exports = {

//	INIT	
	init : function(r,p){
		//r.pool        = {UserPoolId:p[0].id,ClientId:p[0].client}; 
		//r.pool_region = p.region;
		//r.userPool    = new AmazonCognitoIdentity.CognitoUserPool(r.pool);
	},
	

//	REGISTER
	register : function(r,p,c){
		var params = p[0];
		var attributes = p[1]?p[1]:[];
		var a=[];
		 
		for(attribute in attributes){
			a.push(new AmazonCognitoIdentity.CognitoUserAttribute(attributes[attribute]));
		}
		var pool     = {UserPoolId:params.id,ClientId:params.client};
		var userPool = new AmazonCognitoIdentity.CognitoUserPool(pool);
		userPool.signUp(params.user,params.pass,a, null, function(e,p){e?c({payload:e.message,code:0}):c({payload:p,code:1});});
	},
	
//	LOGIN	
	login : function(r,p,c){
		
		var pool     = {UserPoolId:p.id,ClientId:p.client};
		var userPool = new AmazonCognitoIdentity.CognitoUserPool(pool);
		
		var _user = p.user ? p.user : "";
		var _pass = p.pass ? p.pass : ""; 
		var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
			Username : _user,
			Password : _pass,
		});

		var userData = {
			Username : _user,
			Pool     : userPool
		}; 

		var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
		//cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
		cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess: function(p) {c({payload:p,code:1});},
			onFailure: function(e) {c({payload:e.message,code:0});},
		});
	},	
	
}