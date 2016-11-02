const utils = require('./utils');
//const bcrypt = require('bcrypt');
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

const Usuario = utils.mongoose.model('Usuario', schemaUsuario);
module.exports = Usuario;