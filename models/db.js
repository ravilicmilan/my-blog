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

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	orignalPassword: String,
	token: String
});



var Post = mongoose.model('Post', postSchema);
var User = mongoose.model('User', userSchema);

var Models = {
	Post: Post,
	User: User
};

module.exports = Models;