const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({
			contact : { 
				type: String
			},
			items : {
				type: JSON
			}
		});
		
		return db.model('carts', schema);
		
	}
	
}
