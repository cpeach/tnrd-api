const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({

			zoho_id: {
				type: String,
				required: true,
				trim: true
			},
			first: {
				type: String,
				required: true
			},
			last: {
				type: String,
				required: true
			},
			cart: {
				type: JSON
			}, 

		});
		
		return db.model('customer', schema);
		
	}

}
