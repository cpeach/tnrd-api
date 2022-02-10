
//gis

var http = require('https');

module.exports = {

//	INIT	
	init : function(r){r.http = http;r.host='tnrdmap.tnrd.ca'},

//	REQUEST		
	request : function(r,p,c){
		var params = p[1];
		var o  = p[0];
		o.host = r.host;
		
		o.headers = {
			'Content-Type'  : 'application/x-www-form-urlencoded;charset=UTF-8',
			'Connection'    : 'keep-alive',
			'Cache-Control' : 'no-cache'
		}

		var cb = function(response){
			var data = '';
			response.on('data',function(d){data+=d});
			response.on('end',function(){
				try{c([JSON.parse(data)]);}catch(e){c([data]);}
			});
		}
		var request = r.http.request(o,cb);
		request.write(params);
		request.end();	
	},

	
}