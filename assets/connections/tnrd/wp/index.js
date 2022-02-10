
//WordPress
var wpapi = require('wpapi');
var http  = require('http');
var https = require('https');

module.exports = {

//	INIT	
	init : function(r){
		
		r.https = https;
		r.http  = http;
		r.wp = new WPAPI({
			endpoint: 'http://your-site.com/wp-json',
			// This assumes you are using basic auth, as described further below
			username: 'someusername',
			password: 'password'
		});
		
	},
	

	
//	AUTH	
	auth : function(r,p){
		
		
		
	},	
	
}