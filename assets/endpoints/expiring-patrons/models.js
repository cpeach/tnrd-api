const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	

	notified : function(db){
		var schema = new Schema({
			date        : {type:Date,default: Date.now},
			date_from : {type:Date},
			date_to : {type:Date},
			patrons     : {type:Array}
		});
		return db.model('notifieds', schema);
	},
	settings : function(db){
		var schema = new Schema({
			administrators : {type:Array},
			types  : {type:Array},
			range  : {type:Number},
			window : {type:Number},
			email_source  : {type:String},
			email_subject : {type:String}
		});
		return db.model('settings', schema);
	},	
	templates : function(db){
		
		var schema = new Schema({
			name : {type:String},
			description : {type:String},
			types   : {type:Array},
			content : {type:String}
		});
	
		return db.model('templates', schema);
		
	},

}