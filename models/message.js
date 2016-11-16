const utils = require('./utils');
const schemaMessage = utils.Schema({
	created: Date,
	content: String,
	username: String,
	userId: String,
	destination: utils.Schema.Types.ObjectId
});
const Message = utils.mongoose.model('Chat', schemaMessage);
module.exports = Message;