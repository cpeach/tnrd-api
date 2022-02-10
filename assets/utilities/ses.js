const AWS      = require('aws-sdk');
const http = require('http');



module.exports = { 
 
//	DATA
	data : {
		conf : {
			accessKeyId		: process.env.tnrd_iam_key,
			secretAccessKey	: process.env.tnrd_iam_skey,
			region			: process.env.tnrd_iam_region		
		},
		params : {
			Source: '"TNRD Inventory" <noreply@tnrd.ca>',
			Destination: {ToAddresses:[]},
			ReplyToAddresses: [],
			Message: {
				Body: {Html:{Charset: 'UTF-8',Data:''}},
				Subject: { Charset:'UTF-8',Data:''}
			}
		}
	}, 
	
//	INIT
	init : function(r){
		r.ses = new AWS.SES(r.data.conf);

		return r;
	},
//	SEND
	send : async function(r,p,c){
		r.data.params.Destination.ToAddresses = p.to;
		r.data.params.Message.Subject.Data    = p.subject;
		r.data.params.Message.Body.Html.Data  = p.body;
		r.data.params.Source                  = p.source || r.data.params.Source;
		r.ses.sendEmail(r.data.params,async(p)=>{console.log(p);return c?c(p):p;})
			
	},

}

