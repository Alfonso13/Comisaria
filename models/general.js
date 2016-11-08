const utils = require('./utils');
const schemaAlert = new utils.Schema({
	reference: String,
	description: String,
	location: {
		latitude: Number,
		longitude: Number
	},
	user: utils.Schema.ObjectId,
	date: {type: Date, default: Date.now},
	state: {type: Number, default: 0}
});
const Alert = utils.mongoose.model('Alert', schemaAlert);
module.exports = Alert;