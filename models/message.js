const utils = require('./utils');

const schemaMessage = utils.Schema({
	user: Number,
	destination: Number,
	message: String,
	date: Date
});

const Message = utils.mongoose.model('Chat', schemaMessage);

module.exports = Message;