const utils = require('./utils');
const schemaDenuncia = new utils.Schema({
	address: String,
	description: String,
	observation: String,
	date: {type: Date, default: Date.now},
	user: Number,
	location: {
		lat: String,
		lng: String
	}
});
const Denuncia = utils.mongoose.model('Denuncia', schemaDenuncia);

module.exports = Denuncia;