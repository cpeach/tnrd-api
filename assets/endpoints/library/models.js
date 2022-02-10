const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	patron_registration : function(db){
		
		var schema = new Schema({
			patron        : {type:Object,required:true},
      		key           : {type:String,required:true},
			created       : {type:Date,required:true},
      		expiry        : {type:Date,required:true}
		});
	
		return db.model('patron_registration', schema);
		
	}
}