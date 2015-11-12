var Post = require('../models/post');
var helpers = require('../utils/helpers');
var truncatise = require('truncatise');

var methods = {
	getPosts: getPosts,
	getArchive: getArchive,
	getPostById: getPostById,
	getPostBySlug: getPostBySlug,
	checkSlug: checkSlug,
	addPost: addPost,
	addComment: addComment,
	updatePost: updatePost,
	deletePost: deletePost
};

function getPosts(req, res, next) {
	var page;
	var perPage = 6;
	var query = null;
	var token;

	if (!req.params.num) {
		page = 1;
	} else {
		page = req.params.num;
	}

	if (req.params.searchTerm) {
		var searchParam = new RegExp(req.params.searchTerm, 'i');
		query = { $or: [{title: searchParam}, {content: searchParam}] };
	} else if (req.params.year && req.params.month) {
		var month = helpers.stripScriptTags(req.params.month);
		var year = helpers.stripScriptTags(req.params.year);
		var startDate = new Date(year, month - 1, 1);
		var endDate = new Date(year, month, 1);
		query = {'createdOn': {$gte : startDate, $lt: endDate}};
	} else {
		query = {};
	}


	token = req.headers['x-access-token'] || req.session.token || '';


	Post.count(query, function(err, count) {
		if (err) res.status(404).json({error: 'No posts found!'});

		Post.find(query).skip((page - 1) * perPage).limit(perPage).sort({createdOn: -1}).lean().exec(function(err, posts) {
			if (err || posts.length < 1) {
				res.status(404).json({error: 'Unable to find records'});
			} else {
				var truncateOptions = {
					    TruncateBy      : 'words',  // Options are 'words', 'characters' or 'paragraphs' 
					    TruncateLength  : 50,       // The count to be used with TruncatedBy 
					    StripHTML       : false,    // Whether or not the truncated text should contain HTML tags 
					    Strict          : true,     // If set to false the truncated text finish at the end of the word 
					    Suffix          : '...'
				};

				posts.forEach(function(post) {
					if (post.comments) {
						post.commentCount = post.comments.length;
					} else {
						post.commentCount = 0;
					}
					
					post.content = truncatise(post.content, truncateOptions);
					
					delete post.comments;
				});

				res.json({
					posts: posts,
					totalRecords: count,
					token: token
				});				
			}
		});
	});
}

function getArchive(req, res, next) {
	Post.aggregate({ 
	    	$project: { _id: 0, year: {$year: "$createdOn"}, month : {$month : "$createdOn"} }
		}, {
	    	$group : { 
		       _id : {year: "$year", month : "$month"}, 
		       count : { $sum : 1 }
		    }
		}  
	).exec(function(err, result) {
		if (err) {
			throw err;
		}
		res.json(result);
	});
}

function getPostBySlug(req, res, next) {
	Post.findOne({slug: req.params.slug}, function(err, post) {
		if (err) {
			res.json({error: 'Unable to get post with an slug: ' + req.params.slug}).status(404);
			throw err;
		} 
		res.json(post);
	});
}

function getPostById(req, res, next) {
	Post.findOne({_id: req.params.id}, function(err, post) {
		if (err) {
			res.json({error: 'Unable to get post with an id: ' + req.params.id});
			throw err;
		} 
		res.json(post);
	});
}

function addPost(req, res, next) {
	if (!req.body.title || req.body.title === '' || req.body.title.length < 1) {
		res.json({error: 'Title cannot be empty!'});
	} else if (!req.body.slug || req.body.slug === '' || req.body.slug.length < 1) {
		res.json({error: 'Slug cannot be empty!'});
	} else {
		Post.findOne({slug: req.body.slug}, function(err, post) {
			if (post == null) {
				var post = new Post({
					title: req.body.title,
					content: req.body.content,
					slug: req.body.slug
				});
				post.save(function(err, post) {
					if (err) {
						res.json({eror: 'Unable to insert new post'});
						throw err;
					} 
					res.json(post);
				});					
			} else {
				res.json({error: 'This slug already exists!'});					
			}
		});
	}
}

function updatePost(req, res, next) {
	if (!req.body.title || req.body.title === '' || req.body.title.length < 1) {
		res.json({error: 'Title cannot be empty!'});
	} else if (!req.body.slug || req.body.slug === '' || req.body.slug.length < 1) {
		res.json({error: 'Slug cannot be empty!'});
	} else {
		Post.findOne({_id: req.params.id}, function(err, post) {
			if (err) {
				res.json({error: 'Unable to get post with an id: ' + req.params.id});
				throw err;
			} 
			post.title = req.body.title;
			post.content = req.body.content;
			post.slug = req.body.slug
			post.save(function(err) {
				if (err) {
					res.json({error: 'Unable to update post with an id: ' + req.params.id});
					throw err;
				}
				res.json(post);
			});
		});			
	}
}

function checkSlug(req, res, next) {
	if (req.body.slug && req.body.slug !== '') {
		Post.findOne({slug: req.body.slug}, function(err, post) {
			if (err) {
				res.send(err);
			} else {
				if (post == null) {
					res.json({success: 'This is slug is OK'});
				} else {
					res.json({error: 'This slug already exists!'});					
				}
			}
		});
	} else {
		res.json({error: 'Slug must not be emtpy!'});
	}
}

function addComment(req, res, next) {
	Post.findOne({_id: req.params.post}, function(err, post) {
		if (err) throw err;
		var name = helpers.stripScriptTags(req.body.name);
		var email = helpers.stripScriptTags(req.body.email);
		var commentText = helpers.stripScriptTags(req.body.commentText);

		if (name === '' || name.length < 0) {
			name = 'Anonymous';
		}

		var new_comment = {
			name : name,
			email : email,
			commentText : commentText
		};
		
        post.comments.push(new_comment);
        post.save(function(err, post) {
        	if (err) {
        		res.json({error: 'Error saving comments on this post'});
        	} else {
        		res.json(post);
        	}
        });
	});
}
 
function deletePost(req, res, next) {
	Post.remove({_id: req.params.id}, function(err) {
		if (err) {
			res.json({error: 'Unable to delete post with an id: ' + req.params.id});
			throw err;
		}
		res.json({success: 'Ok'});
	});
}

module.exports = methods;