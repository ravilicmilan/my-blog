var express = require('express');
var Post = require('../models/db').Post;
var router = express.Router();
var checkAuth = require('../utils/auth');

var getPosts = function(req, res, next) {
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
		query = { title: new RegExp(req.params.searchTerm, 'i') };
	} else if (req.params.year && req.params.month) {
		var month = req.params.month;
		var year = req.params.year;
		var startDate = new Date(year, month - 1, 1);
		var endDate = new Date(year, month, 1);
		query = {'createdOn': {$gte : startDate, $lt: endDate}};
	} else {
		query = {};
	}

	if (req.headers['x-access-token'] || req.session.token) {
		token = req.headers['x-access-token'] || req.session.token;
	} else {
		token = '';
	}


	Post.count(query, function(err, count) {
		if (err) res.status(404).json({error: 'No posts found!'});

		Post.find(query).skip((page - 1) * perPage).limit(perPage).sort({createdOn: -1}).exec(function(err, posts) {
			if (err || posts.length < 1) {
				res.status(404).json({error: 'Unable to find records'});
			} else {
				res.json({
					posts: posts,
					totalRecords: count,
					token: token
				});				
			}
		});
	});
};

var getArchive = function(req, res, next) {
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
};


/* GET  */

router.get('/', function(req, res, next) {
	getPosts(req, res, next);
});

router.get('/page/:num', function(req, res, next) {
	getPosts(req, res, next);
});

router.get('/view/:slug', function(req, res, next) {
	Post.findOne({slug: req.params.slug}, function(err, post) {
		if (err) {
			res.json({error: 'Unable to get post with an slug: ' + req.params.slug});
			throw err;
		} 
		res.json(post);
	});
});

router.get('/archive', function(req, res, next) {
	getArchive(req, res, next);
});

router.get('/:id', function(req, res, next) {
	Post.findOne({_id: req.params.id}, function(err, post) {
		if (err) {
			res.json({error: 'Unable to get post with an id: ' + req.params.id});
			throw err;
		} 
		res.json(post);
	});
});

router.get('/search/:searchTerm', function(req, res, next) {
	getPosts(req, res, next);
});

router.get('/search/:searchTerm/page/:num', function(req, res, next) {
	getPosts(req, res, next);
});

router.get('/archive/:year/:month', function(req, res, next) {
	getPosts(req, res, next);
});

router.get('/archive/:year/:month/page/:num', function(req, res, next) {
	getPosts(req, res, next);
});





/* POST */

router.post('/', checkAuth, function(req, res, next) {
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
});

router.post('/slug', checkAuth, function(req, res, next) {
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
});

router.post('/comments/:post', function(req, res, next) {
	Post.findOne({_id: req.params.post}, function(err, post) {
		if (err) throw err;
		var name = req.body.name;
		var email = req.body.email;
		var commentText = req.body.commentText;

		if (name === '' || name.length < 0) {
			name = 'Anonymous';
		}

		name.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '***');
		email.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '***');
		commentText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '***');

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
});




/* PUT */

router.put('/:id', checkAuth, function(req, res, next) {
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
});




/* DELETE */

router.delete('/:id', checkAuth, function(req, res, next) {
	Post.remove({_id: req.params.id}, function(err) {
		if (err) {
			res.json({error: 'Unable to delete post with an id: ' + req.params.id});
			throw err;
		}
		res.json({success: 'Ok'});
	});
});

module.exports = router;