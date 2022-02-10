const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	

	patrons : function(db){
		var schema = new Schema({
			name  : {type:String},
			barcode : {type:String},
			pid : {type:String},
			subjects : {type:Array},
			authors : {type:Array},
			formats : {type:Array},
			dislikes : {type:Array},
			likes : {type:Array},				
			type:{type:String},
			legacy_contact : {type:String}
		});
		return db.model('patrons', schema);
	},
	checkouts : function(db){
		var schema = new Schema({
			patron  : {type:String},
			date : {type:Date},
			item : {type:String},
			bibid : {type:Number}
		});
		return db.model('checkouts', schema);
	},
	temp_checkouts : function(db){
		var schema = new Schema({
			patron  : {type:Number},
			date : {type:Date},
			item : {type:String}
		});
		return db.model('temp-checkouts', schema);
	},
	settings : function(db){
		var schema = new Schema({
			administrators : {type:Array}
		});
		return db.model('settings', schema);
	},
	formats : function(db){
		var schema = new Schema({
			code  : {type:String},
			name : {type:String,required:false}
		});
		return db.model('formats', schema);
	},
	
	authors : function(db){
		var schema = new Schema({
			name : {type:String}
		});
		return db.model('authors', schema);
	},

	subjects : function(db){
		var schema = new Schema({
			name : {type:String}
		});
		return db.model('subjects', schema);
	},
	
	stats : function(db){
		var schema = new Schema({
			sample  : {type:Number}
		});
		return db.model('stats', schema);
	},

	hashad : function(db){
		var schema = new Schema({
			dateFrom  : {type:Date},
			dateTo  : {type:Date},
			results : {type:Array}
		});
		return db.model('hashad', schema);
	}
	

}