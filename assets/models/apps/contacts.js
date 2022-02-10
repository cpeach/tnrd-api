const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({
			first_name      : {type:String},
			last_name       : {type:String},
			email           : {type:String},
			active          : {type:Boolean,default:true},
			created          : {type:Date,default:Date.now}	
		});
		
		return db.model('contacts', schema);
		
	}
	
}