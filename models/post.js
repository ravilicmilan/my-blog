var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
	email: String,
	name: String,
	commentText: String,
	commentDate: {type: Date, default: Date.now}
});

var postSchema = new mongoose.Schema({
	title: String,
	createdOn: {type: Date, default: Date.now},
	content: String,
	slug: String,
	comments: [commentSchema]
});


var Post = mongoose.model('Post', postSchema);

module.exports = Post;