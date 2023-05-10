const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
	username: {
		type: String
	},
	password: {
		type: String
	},
})
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User)
