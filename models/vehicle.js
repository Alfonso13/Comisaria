const utils = require('./utils');
const schemaVehicle = new utils.Schema({
	type: String,
	type_vehicle: String,
	brand: String,
	color: String,
	plate: String,
	reference: String,
	mode: String,
	whistleblower: String,
	state: Number,
	location: {
		latitude: Number,
		longitude: Number
	},
	user: utils.Schema.ObjectId,
	date: {type: Date, default: Date.now}
});
const Vehicle = utils.mongoose.model('VehicleComplaint', schemaVehicle);
module.exports = Vehicle;