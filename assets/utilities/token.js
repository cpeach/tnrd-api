const request    = require('request');
const jwkToPem   = require('jwk-to-pem');
const jwt        = require('jsonwebtoken');
const accounts   = require('../endpoints/accounts/index.js').init()
module.exports = { 

	pool:{
		'https://www.tnrl.ca/' :process.env.library_ils_cognito_id,
		'https://tnrl.ca/'     :process.env.library_ils_cognito_id,
		'https://im.tnrdit.ca/':process.env.tnrd_im_cognito_id
	},
	validate :async function(req,res,next){
		
		//console.log(req.headers['x-application'])
		//console.log(req.url)
		//console.log(req.method)
		
		var application  = await accounts.models.application.findById(req.headers['x-application']).lean();
		if(application){
			var token        = req.headers.authorization?req.headers.authorization.split("Bearer ")[1]:'';
			var cognito_id   = application.cognito_id

			//token = token.replace(/.$/,"2")
 
			if(token && cognito_id){
				request({
					url: 'https://cognito-idp.'+process.env.tnrd_iam_region+'.amazonaws.com/'+cognito_id+'/.well-known/jwks.json',
					json: true
				}, function (error, response, body) {
					if (!error && response.statusCode === 200) {
						pems = {};
						var keys = body['keys'];
						for(var i = 0; i < keys.length; i++) {
							//Convert each key to PEM
							var key_id   = keys[i].kid;
							var modulus  = keys[i].n;
							var exponent = keys[i].e;
							var key_type = keys[i].kty;
							var jwk = { kty: key_type, n: modulus, e: exponent};
							var pem = jwkToPem(jwk);
							pems[key_id] = pem;
						}
						//validate the token
						var decodedJwt = jwt.decode(token, {complete: true});
						if (!decodedJwt) {
							console.log("Not a valid JWT token");
							res.status(401).json({code:0,message:"Invalid Authorization",unauthorized:true});
							return
						}

						var kid = decodedJwt.header.kid;
						var pem = pems[kid];
						if (!pem) {
							console.log('Invalid token');
							res.status(401).json({code:0,message:"Invalid Authorization",unauthorized:true});
							return
						} 

						jwt.verify(token, pem,async function(err, payload) {
							if(err) {
								console.log("Invalid Token.");
								res.status(401).json({code:0,message:"Invalid Authorization",unauthorized:true});
							} else {
								var user  = await accounts.models.user.findOne({reference:decodedJwt.payload.sub});
								//var role  = await accounts.models.role.findOne({_id:user.roles[req.headers['x-application']]});

								next();
							}
						});
					} else {
						console.log("Error! Unable to download JWKs");
						res.status(401).json({code:0,message:"Invalid Authorization",unauthorized:true});
					}

				})
			}else{
				res.status(401).json({code:0,message:"Invalid Authorization",unauthorized:true});
			}
		}else{res.status(401).json({code:0,message:"Invalid Authorization",unauthorized:true});}
	}
		
	
}