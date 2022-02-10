const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({

			parent: {
				type: String,
				required: true
			},
			name: {
				type: String,
				required: true
			},
			short: {
				type: String,
				required: true
			},
			details: {
				type: String
			},
			domain: {
				type: String,
			}
			
		});
		
		return db.model('application', schema);
		
	}
	
	
}
