const utils = require('./utils');
const bcrypt = require('bcrypt');
const schemaUsuario = new utils.Schema({
	role: String,
	name: {type: String, required: true, unique: true},
	lastname: {type: String, required: true},
	state: {type: Number, required: true},
	currentLocation: {
		latitude: Number,
		longitude: Number
	},
	password: {type: String, required: true},
	entry: {type: Date, required: true}
});

/*schemaUsuario.pre('save', function preSave(next) {
	var user = this;
	var saltRounds = 10;
	var salt = bcrypt.genSaltSync(saltRounds);
	var hash = bcrypt.hashSync(user.password, salt);
	this.password = hash; 
	next();
});*/

const Usuario = utils.mongoose.model('Usuario', schemaUsuario);
module.exports = Usuario;