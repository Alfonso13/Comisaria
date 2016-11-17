const utils = require('./utils');
const schemaMessage = utils.Schema({
	created: {type: Date, default: Date.now},
	content: String,
	username: String,
	userId: utils.Schema.Types.ObjectId,
	destination: utils.Schema.Types.ObjectId
});
const Message = utils.mongoose.model('Chat', schemaMessage);
module.exports = Message;