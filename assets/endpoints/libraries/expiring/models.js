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
		
	}
	
}