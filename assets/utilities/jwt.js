
const _jwt  = require('jsonwebtoken');

var jwt = {
	
	api : {},
	
//	REGISTER
	register : function(r,p,c){r.api.users.insert.item(r.api,[p],c)},
	
//	SIGN
	sign : function(p){
		var options = {expiresIn:p.expiry};
		return _jwt.sign({id:p._id}, p.secret,options);
	},
	
//	REFRESH	
	refresh : function(r,p,c){
		var req = p[0];
		var auth = req.headers.authorization;
		if(auth){
			var token   = auth.split("Bearer ")[1];
			var decoded = _jwt.decode(token);
			
			if(decoded){
				jwt.api.roles.get.item(jwt.api,decoded.id,function(p){
					var role = p;
					_jwt.verify(token,p.secret,function(e,p){
						if(e){
							c({code:0});
						}else{
							c({code:1,token:jwt.sign(role),token_name:role.application});
						}

					});
				})
				
			}else{
				c({code:0});
			}
		}else{
			c({code:0});
		}
		
	
	},
//	LOGIN
	login : function(r,p,c){
		r.api.users.get.items(r.api,[{reference:p}],function(p){
			var user = p[0];
			r.api.roles.get.item(r.api,user["role"],function(p){
				var token = r.sign(p);
				c({code:1,token:token,token_name:p.application,user:user.identity,role:p.role,data:user.data});
			});
		});	
	
	},
//	USER
	user : function(r,p,c){
		r.api.users.get.item(r.api,p,function(p){c(p)});	
	},	
	
//	VERIFY		
	verify : function(req,res,next){
		
		var auth = req.headers.authorization;
		
		if(auth){
			var token   = auth.split("Bearer ")[1];
			var decoded = _jwt.decode(token);
			
			if(decoded){
				jwt.api.roles.get.item(jwt.api,decoded.id,function(p){
					var role = p;
					_jwt.verify(token,p.secret,function(e,p){
						if(e){
							res.status(401);
							res.json({code:0});
						}else{
							console.log("verified!");
							// ** TODO: Check role against ACL
							
							next();
						}

					});
				})
				
			}else{
				res.status(401);
				res.json({code:0});
			}
		}else{
			res.status(401);
			res.json({code:0});
		}
	
	}

}


module.exports = jwt;