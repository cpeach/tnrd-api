const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({
			contact_id         : {type:String,required:false},
			contact_name       : {type:String},
			email              : {type:String},
			department         : {type:String,required:false},
			cart               : {type:Array,default:[]},
			active             : {type:Boolean,default:true}	
		});
		
		return db.model('contacts', schema);
		
	}
	
}
