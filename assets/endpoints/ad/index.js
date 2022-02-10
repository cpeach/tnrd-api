
const cognito  = require('../../utilities/cognito.js');
const s3	   = require('../../utilities/s3.js');
const mongoose = require('mongoose');
const { promises: fs } = require("fs");

const msal    = require('@azure/msal-node');

// MODELS


module.exports = {
	
	


	
	init : function(r){


		
	},
//  REFRESH
	validate : async function(r,c){

		const cachePath = "./cache.json"; // Replace this string with the path to your valid cache file.

		const beforeCacheAccess = async (cacheContext) => {
			try {
				const cacheFile = await fs.readFile(cachePath, "utf-8");
				cacheContext.tokenCache.deserialize(cacheFile);
			} catch (error) {
				// if cache file doesn't exists, create it
				console.log(fs)
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

		const cachePlugin = {
			beforeCacheAccess,
			afterCacheAccess
		};


		const msalConfig = {
			auth: {
				clientId:  "665e2278-7eb9-4c56-ba1e-356355b32e38",
				authority: "https://login.microsoftonline.com/organizations",
			},
			cache: {
				cachePlugin
			},
			system: {
				loggerOptions: {
					loggerCallback(loglevel, message, containsPii) {
						console.log(message);
					},
					piiLoggingEnabled: false,
					logLevel: msal.LogLevel.Verbose,
				}
			}
		};
		const pca = new msal.PublicClientApplication(msalConfig);
		const msalTokenCache = pca.getTokenCache();

		// Acquire Token Silently if an account is present
		

		async function getAccounts() {
			return await msalTokenCache.getAllAccounts();
		};

		accounts = await getAccounts();

		// Acquire Token Silently if an account is present
		if (accounts.length > 0) {
			const silentRequest = {
				account: accounts[0], // Index must match the account that is trying to acquire token silently
				scopes: ["user.read"],
			};

			pca.acquireTokenSilent(silentRequest).then((response) => {
				console.log(response)
				console.log("\nSuccessful silent token acquisition");
			}).catch((error) => {
				console.log(error);
			});
		} else { // fall back to username password if there is no account
			const usernamePasswordRequest = {
				scopes: ["user.read"],
				username: "cpeach@rdtn.onmicrosoft.com", // Add your username here
				password: "", // Add your password here
			};

			pca.acquireTokenByUsernamePassword(usernamePasswordRequest).then((response) => {
				console.log(response)
				console.log("acquired token by password grant");
			}).catch((error) => {
				console.log(error);
			});
		}
			
		c({valid:false})
	},


	
}