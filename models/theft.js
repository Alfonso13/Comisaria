const utils = require('./utils');

const schemaTheft = new utils.Schema({
	theft_to: String,
	theft_reference: String,
	victimizer_clothing: String,
	stolen_object: String,
	whistleblower: String,
	location: {
		latitude: Number,
		longitude: Number
	},
	user: utils.Schema.ObjectId,
	date: {type: Date, default: Date.now},
	state: {type: Number, default: 0},
	is: {type: String, default: 'theft'}
});
const Theft = utils.mongoose.model('Theft', schemaTheft);
module.exports = Theft;