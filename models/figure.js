var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var figureSchema = new Schema({
	figureName: String,
	keySig: String,
	dateAdded : { type: Date, default: Date.now },
	owner: String,
	location: String
	//{ collection: 'Figures'}
})

module.exports = mongoose.model('Figure',figureSchema);

