var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var userSchema = new Schema({
	username: String,
	// name: {type: String, required: true}, // this version requires this field to exist
	// name: {type: String, unique: true}, // this version requires this field to be unique in the db
	password: String,
	dateAdded : { type: Date, default: Date.now },
	//{ collection: 'Figures'}
})

// var userSchema = new Schema({
// 	name: String,
// 	// name: {type: String, required: true}, // this version requires this field to exist
// 	// name: {type: String, unique: true}, // this version requires this field to be unique in the db
// 	password: String,
// 	comps: [String],
// 	url: String,
// 	dateAdded : { type: Date, default: Date.now },
// })

// export 'Animal' model so we can interact with it in other files
module.exports = mongoose.model('User',figureSchema);

//module.exports = mongoose.model('User',userSchema);