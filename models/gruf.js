var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Gruf = new Schema({
    face: String,
    ear: String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Gruf', Gruf);