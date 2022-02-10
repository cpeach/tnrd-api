const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	user : function(db){
		
		var schema = new Schema({
			first_name      : {type:String},
			last_name       : {type:String},
			email           : {type:String},
			active          : {type:Boolean,default:true},
			created         : {type:Date,default:Date.now}	
		});
		
		return db.model('users', schema);
		
	},
	images : function(db){
		
		var schema = new Schema({
			originalname : {type:String},
			encoding     : {type:String},
			mimetype     : {type:String},
			url          : {type:String},
			bucket       : {type:String},
			key          : {type:String,required:false},
			filename     : {type:String},
			size         : {type:Number},
			application  : {type:String},
			created      : {type:Date,default:Date.now}	
		});
		
		return db.model('images', schema);
		
	}
	
}