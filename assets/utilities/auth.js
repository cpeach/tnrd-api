const msal     = require('@azure/msal-node');
const mongoose = require('mongoose');
const models   = require('../endpoints/hub-console/models.js');

const { promises: fs } = require("fs");

const db = mongoose.createConnection(process.env.mongo'+tnrd-hub',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
const profiles = models.profiles(db);
const cachePath = "./cache.json";
const beforeCacheAccess = async (cacheContext) => {
	try {
		const cacheFile = await fs.readFile(cachePath, "utf-8");
		cacheContext.tokenCache.deserialize(cacheFile);
	} catch (error) {
		// if cache file doesn't exists, create it
		cacheContext.tokenCache.deserialize(await fs.writeFile(cachePath, ""));
	}
};

const afterCacheAccess = async (cacheContext) => {
	if (cacheContext.cacheHasChanged) {
		try {
			await fs.writeFile(cachePath, cacheContext.tokenCache.serialize());
		} catch (error) {
			console.log(error);
		}
	}
};
const getAccounts = async(id)=>{return await msalTokenCache.getAccountByHomeId(id);};
const cachePlugin = {beforeCacheAccess,afterCacheAccess};

const msalConfig = {
			auth: {
				clientId:  "665e2278-7eb9-4c56-ba1e-356355b32e38",
				authority: "https://login.microsoftonline.com/organizations",
			},
			cache: {cachePlugin},
			system: {
				loggerOptions: {
					loggerCallback(loglevel, message, containsPii) {
						//console.log(message);
					},
					piiLoggingEnabled: false,
					logLevel: msal.LogLevel.Verbose,
				}
			}
		};
const pca = new msal.PublicClientApplication(msalConfig);
const msalTokenCache = pca.getTokenCache();

module.exports = { 
	
	signin : async (req,res,next)=>{

		let user = req.body.user.indexOf("@tnrd.ca")>-1?req.body.user.replace("@tnrd.ca","@rdtn.onmicrosoft.com"):req.body.user;

		const usernamePasswordRequest = {
			scopes: ["User.Read"],
			username: user,
			password: req.body.pass
		};

		pca.acquireTokenByUsernamePassword(usernamePasswordRequest).then(async (response) => {
			
			// get profile if it doesn't exist then create one
			var _profile  = await profiles.find({uid:response.uniqueId});
			_profile = _profile[0];
			if(!_profile){
				
				_profile = await profiles.create({

					uid:response.uniqueId,
					tid:response.tenantId,
					name:response.account.name,
					email:req.body.user
				});
			}
			var data   = {}
			data.user  = _profile._id;
			//data.token = response.accessToken;
			data.token = response.idToken;
			//console.log(response)
			res.json(data);
			
		}).catch((error) => {
			res.status(401).json({code:0,message:"Invalid Login",unauthorized:true,error:error});
			console.log(error);
		});
	},	
 
	token : async(req,res,next)=>{
		
		const msalTokenCache = pca.getTokenCache();
		let accounts;
		var user = await profiles.findById(req.headers['x-user']).lean();
		//console.log(user)
		if(user){

		
			let account = await getAccounts(user.lid);
			// Acquire Token Silently if an account is present
 			if (account) {
				const silentRequest = {
					account: account, // Index must match the account that is trying to acquire token silently
					scopes: ["User.Read"],
					forceRefresh : false
				};

				pca.acquireTokenSilent(silentRequest).then((response) => {
					//console.log(response)
					console.log("\nSuccessful silent token acquisition");
					req.body.auth = response;
					next()
				}).catch((error) => {
					res.status(401).json({code:0,message:"Invalid Authorization",unauthorized:true});
					console.log(error);
				});
			} else { // fall back to username password if there is no account
				res.status(401).json({code:0,message:"Invalid Account",unauthorized:true});
				return
			} 
		}else{
			res.status(401).json({code:0,message:"Invalid User",unauthorized:true});
		}
	}
		
	
}