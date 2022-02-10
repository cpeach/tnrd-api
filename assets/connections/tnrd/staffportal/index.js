
//staffportal

const mysql = require('mysql');

module.exports = {

//	INIT
	init : function(r){

		r.client = mysql.createConnection({
            host     : process.env.sp_host,
            user     : process.env.sp_user,
            password : process.env.sp_pass,
            database :     'livestats'
        });

		console.log(r.client)

	},
	
//	QUERY	
	query : function(r,p,c){    

		console.log("try")
		var con = mysql.createConnection({
			host: "204.239.198.23",
			user: "holiday",
			password: "!drnt!",
			database: "livestats"
		});

		con.connect((err) => {
			if (err) throw err;
				console.log('Connected!');
		});

		//console.log(con)

		/* con.connect(function(err) {
		if (err) throw err;
			con.query("SELECT * FROM libs", function (err, result, fields) {
				if (err) throw err;
				
				console.log(result);
				c(result)
			});
		});
 */


/* 		r.client.query(p[0],(e, p, f)=>{
            r.client.end();
			e?c([e.stack]):c([p]);
		}); */

	}

}