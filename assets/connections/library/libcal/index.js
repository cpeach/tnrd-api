
//Libcal
var http = require('https');

module.exports = {

//	INIT	
	init : function(r){
		r.http = http;
		r.host=process.env.libcal_host;
		r.token_path=process.env.libcal_path + process.env.libcal_token_path;
		r.client_id=process.env.libcal_client_id;
		r.client_secret=process.env.libcal_client_secret;
	},

//	REQUEST		
	request : function(r,p,c){
		var o = p[0];
		o.host = r.host;
		o.headers = o.headers ? o.headers : {}; 
		r.session(r,function(p){
			o.headers['Content-type']  = 'application/json';
			o.headers['Authorization'] = ' Bearer '+ p[0].access_token;
      
			var cb = function(response){
				var data = '';
				response.on('data',function(d){data+=d});
				response.on('end',function(){
          try {
              c([JSON.parse(data)]);
          } catch (e) {
             c([e]);
          }
          
        });
			}
			var request = r.http.request(o,cb);
      if(o.body){request.write(JSON.stringify(o.body))}
			request.end();	
      
		});
	},
	
//	SESSION	
	session : function(r,c){
		var o = {
			host: r.host,
			path: r.token_path,
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
      body :{
        client_id:r.client_id,
        client_secret:r.client_secret,
        grant_type: 'client_credentials'
      }
		};
		var cb = function(response){
			var data = '';
			response.on('data',function(d){data+=d});
			response.on('end',function(){
        c([JSON.parse(data)])
      ;});
		}
		var request = r.http.request(o,cb);
    if(o.body){request.write(JSON.stringify(o.body))};
		request.end();
	},


	
}