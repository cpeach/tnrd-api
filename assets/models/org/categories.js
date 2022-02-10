const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({
			category_id        : {type:String},
			name               : {type:String},
			parent_category_id : {type:String},
			visibility         : {type:Boolean}
		});
		
		return db.model('categories', schema);
		
	}
	
}
