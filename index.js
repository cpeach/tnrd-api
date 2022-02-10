/*
	API ENDPOINTS
*/

const dotenv   		 = require('dotenv').config();
const express  		 = require('express');
const cors     		 = require('cors');
const cookie_parser  = require('cookie-parser');
const auth	         = require('./assets/utilities/auth.js');
const config         = require('./config');

//const file_uploader  = require('express-fileupload');
const app     		 = express();

var passport       = require('passport');
var BearerStrategy = require('passport-azure-ad').BearerStrategy

 
//  parsers 
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
    //app.use(file_uploader());

//  cors
	app.use(cors());
  
//  cookies
	app.use(cookie_parser());

//	auth

const options = {
    identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
    issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
    clientID: config.credentials.clientID,
    audience: config.credentials.audience,
    validateIssuer: config.settings.validateIssuer,
    passReqToCallback: config.settings.passReqToCallback,
    loggingLevel: config.settings.loggingLevel,
    //scope: config.resource.scope
};

	app.use(passport.initialize());
	passport.use(new BearerStrategy (options,function(token, done){
		return done(null,{},token)
	}));

//	root
	app.use('/', require('./assets/endpoints/root/router.js'));

//  auth
	app.use('/auth/signin',auth.signin); 
	app.use('/auth/validate',passport.authenticate('oauth-bearer', {session: false}),(req,res)=>{res.json({})}); 

//  accounts
	app.use('/accounts', require('./assets/endpoints/accounts/router.js'));

//	api console
	app.use('/api-console', require('./assets/endpoints/api-console/router.js'));

//	hub console
	app.use('/hub-console',passport.authenticate('oauth-bearer',{session: false}),require('./assets/endpoints/hub-console/router.js'));

//	expiring patrons
	app.use('/expiring-patrons',passport.authenticate('oauth-bearer',{session: false}),require('./assets/endpoints/expiring-patrons/router.js'));

//	stats counter
	app.use('/stats-counter',passport.authenticate('oauth-bearer',{session: false}),require('./assets/endpoints/stats-counter/router.js'));

//	hashad
	app.use('/hashad',passport.authenticate('oauth-bearer',{session: false}),require('./assets/endpoints/hashad/router.js'));

//	incident reports
	app.use('/incident-reports',passport.authenticate('oauth-bearer',{session: false}),require('./assets/endpoints/incident-reports/router.js'));

//	archived permits
	app.use('/archived-permits',passport.authenticate('oauth-bearer',{session: false}),require('./assets/endpoints/archived-permits/router.js'));

//	tnrl stats dashboard
	app.use('/tnrl-stats',passport.authenticate('oauth-bearer',{session: false}),require('./assets/endpoints/tnrl-stats/router.js'));


//	im 
	app.use('/im', require('./assets/endpoints/im/router.js'));

//	libraries
	app.use('/libraries/expiring', require('./assets/endpoints/libraries/expiring/router.js'));
 
//	library
	app.use('/library', require('./assets/endpoints/library/router.js'));

//	gis
	app.use('/gis', require('./assets/endpoints/gis/router.js'));

//	ad
	app.use('/ad', require('./assets/endpoints/ad/router.js'));

/*
	RUN
*/
let d = Date(Date.now()).toString().replace(" GMT+0000 (Coordinated Universal Time)","");
app.listen(process.env.port, () => {console.log('API started on: '+d)});
 
