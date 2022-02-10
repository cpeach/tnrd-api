const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({
			name         	   : {type:String,default:''},
			contact            : {type:String,default:''},
			phone              : {type:String,default:''},
			email              : {type:String,default:''},
			comments           : {type:String,default:''},
		});
		
		return db.model('vendors', schema);
		
	}
	
}
