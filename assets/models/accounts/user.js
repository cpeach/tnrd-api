const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({

			application: {
				type: String,
				required: true,
				trim: true
			},
			role: {
				type: String,
				required: true
			},
			rolen: {
				type: String,
				required: false
			},
			reference: {
				type: String,
				required: true
			},
			profile: {
				type: String,
				required: true
			},
			object: {
				type: JSON,
				required: false
			}, 
			data: {
				type: JSON,
				required: false
			}, 
			applications: {
				type: JSON,
				required: false
			},
			username: {
				type: String,
				required: false
			},

		});
		
		return db.model('users', schema);
		
	}

}
