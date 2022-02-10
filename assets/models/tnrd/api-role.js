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
			id: {
				type: String,
				required: true
			},
			secret: {
				type: String,
				required: true
			}, 
			expiry: {
				type: String,
				required: true
			}
			

		});
		
		return db.model('role', schema);
		
	}

}
