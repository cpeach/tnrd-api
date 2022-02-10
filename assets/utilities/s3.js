const AWS 	= require('aws-sdk');
const http 	= require('http');

module.exports = { 
 
//	DATA
	data : {
		conf : {
			accessKeyId: 	 process.env.tnrd_iam_key,
			secretAccessKey: process.env.tnrd_iam_skey,
			region: 		 process.env.tnrd_iam_region		
		},
	}, 
	
//	INIT
	init : function(r){
		r.s3 = new AWS.S3(r.data.conf);
		return r;
	},
	
//	upload
	upload : function(r,p,c){
		
		var params = {
			Bucket : 'tnrd-assets/'+p.folder+'/'+p.application,
			Body   : p.body,
			Key    : p.filename,
			tagging: p.tag?'type='+p.tag : ''
		};
	
		r.s3.upload(params, function (e,p) {
			e?c(e):c(p);
		});
			
	},
	
//	delete
	delete : function(r,p,c){
		var params = {
			Bucket : p.bucket, 
			Key    : p.key
		};
		r.s3.deleteObject(params, function (e,p) {
			if(c){e?c(e):c(p);}else{e?e:p}
		});
			
	},

	
}

