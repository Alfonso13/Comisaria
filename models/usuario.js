const utils = require('./utils');

const schemaUsuario = new utils.Schema({
	role: Number,
	name: {type: String, required: true},
	lastname: {type: String, required: true},
	state: {type: Number, required: true}
});
const Usuario = utils.mongoose.model('Usuario', schemaUsuario);
module.exports = Usuario;