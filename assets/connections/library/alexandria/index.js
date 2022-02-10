
//alexandria

const {Client} = require('pg');

module.exports = {

//	INIT
	init : function(r){
		r.client = new Client({
			user:process.env.alexandria_user,
			host:process.env.alexandria_host,
			database:process.env.alexandria_db,
			password:process.env.alexandria_pass,
			ssl:{rejectUnauthorized:false},
			port:process.env.alexandria_port,
		});
		
	},
	
//	QUERY	
	query : function(r,p,c){
		r.alexandria.client.connect(function(e){
			r.alexandria.client.query(p[0],(e,p)=>{
				e?c([e.stack]):c([p.rows]);
			});
		});
	}

}