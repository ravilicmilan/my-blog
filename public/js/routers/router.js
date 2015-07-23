app = {
	Models: {},
	Views: {},
	Collections: {},
	Routers: {},
	router: {},
	vent: {},

	startOverlay: function() {
    	$("body")
	    .append('<div class="overlay"></div><div class="overlay-container"><img src="/img/ajax-loader.gif" /></div>')
	    .css({"overflow-y": "hidden"});
	},

	removeOverlay: function() {
		$("body").css({"overflow-y": "auto"});
		$(".overlay-container, .overlay").animate({"opacity": "0"}, 200, "linear", function() {
			$(".overlay-container, .overlay").remove();  
		});
	},

	showMessage: function(msgClass, msg, delay) {
		var div = $('#response');

		if (div.hasClass('response-success')) {
			div.removeClass('response-success');
		} else if (div.hasClass('response-error')) {
			div.removeClass('response-error');
		}	
		div.addClass(msgClass).fadeIn().html(msg).delay(delay).fadeOut();
	},

	getToken: function() {
		return Cookies.get('token');
	},

	setToken: function(token) {
		Cookies.set('token', token);
	},

	removeToken: function() {
		Cookies.set('token', '');
	},

	Auth: {
		loggedIn: false,
		user: ''
	},

	checkAuth: function() {
		var token = app.getToken();

		if (!token)
			app.Auth.loggedIn = false;
		else
			app.Auth.loggedIn = true;
	},

	rerender: function(views) {
		views.forEach(function(view) {
			view.render();
		});
	},
	
	init: function() {
		_.extend(app.vent, Backbone.Events);
		app.vent.on('admin:login', app.rerender);
		app.vent.on('admin:logout', app.rerender); 
		app.vent.on('posts:add', app.rerender); 


		$.ajaxSetup({
			beforeSend: function() {
				app.startOverlay();
			},
			complete: function() {
				app.removeOverlay();
			}
		});

		Backbone.View.prototype.close = function () {
		    if (this.beforeClose) {
		        this.beforeClose();
		    }
		    this.remove();
		    this.unbind();
		};

		Backbone.old_sync = Backbone.sync;

		Backbone.sync = function(method, model, options) {
		    var new_options =  _.extend({
		        beforeSend: function(xhr) {
		            xhr.setRequestHeader('x-access-token', app.getToken());
		        }
		    }, options)
		    return Backbone.old_sync(method, model, new_options);
		};

		app.checkAuth();
		
		app.router = new app.Routers.Router();
		Backbone.history.start();
	}
};

app.Routers.Router = Backbone.Router.extend({
	routes: {
		'': 'showPosts',
		'posts/page/:num': 'showPosts',
		'about': 'about',
		'posts/view/:slug': 'viewPost',
		'add': 'addNewPost',
		'posts/edit/:_id': 'editPost',
		'admin/login': 'adminLogin',
		'posts/search/:searchTerm': 'searchPosts',
		'posts/search/:searchTerm/page/:num': 'searchPosts',
		'posts/archive/:year/:month': 'archivePosts',
		'posts/archive/:year/:month/page/:num': 'archivePosts',
	},

	initializeTinyMCE: function() {
		tinymce.init({
		    selector: "textarea",
		    theme: "modern",
		    plugins: [
		        "advlist autolink lists link image charmap print preview hr anchor pagebreak",
		        "searchreplace wordcount visualblocks visualchars code fullscreen",
		        "insertdatetime media nonbreaking save table contextmenu directionality",
		        "emoticons template paste textcolor colorpicker textpattern"
		    ],
		    toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
		    toolbar2: "print preview media | forecolor backcolor emoticons",
		    image_advtab: true,
		    templates: [
		        {title: 'Test template 1', content: 'Test 1'},
		        {title: 'Test template 2', content: 'Test 2'}
		    ]
		});
	},

	initialize: function(options) {
		this.headerView = new app.Views.HeaderView({vent: app.vent});
		this.archiveView = new app.Views.ArchiveView();
		this.num = 1;
		$('#header').html(this.headerView.render().el);
	},

	showPosts: function(num) {
		var self = this;

		if (num == undefined) {
			num = 1;
		}

		if (!$('#pagination-wrapper').is(':visible'))
            $('#pagination-wrapper').show();

		var posts = new app.Collections.Posts([], {pageNum: num});
		if (!this.postsView || num !== this.num) {
			this.num = num;
			this.postsView = new app.Views.PostsView({collection: posts, vent: app.vent});
		}
		
		$('#main').empty();
		posts.fetch({
			success: function(model, response, options) {
				$('#main').append(self.postsView.render().el);

				if (!self.archiveView) {
					self.archiveView = new app.Views.ArchiveView();
				}
				$('#archive-wrapper').append(self.archiveView.el);	

				var pagination = new app.Views.Pagination({
					totalRecords: response.totalRecords, 
					currentLinkNumber: parseInt(num),
					pageUrl: '/posts'
				});
				$('#pagination-wrapper').append(pagination.render().el);
			},
			error: function(model, response, options) {
				var notFound = new app.Views.NotFound();
				$('#main').append(notFound.render().el);
				$('#pagination-wrapper').hide();
			}
		});
		this.headerView.selectMenu('home');
	},

	about: function() {
		var aboutView = new app.Views.AboutView();
		$('#main').html(aboutView.el);
		this.headerView.selectMenu('about');
		$('#pagination-wrapper').hide();
	},

	viewPost: function(slug) {
		var post = new app.Models.Post({slug: slug});

		$('#main').empty();
		var viewPost = new app.Views.ViewPost({model: post});
		post.getBySlug(slug);
		
		post.fetch().then(function(model, response, options) {
			$('#main').append(viewPost.render().el);
			$('#pagination-wrapper').hide();
		});
	},

	addNewPost: function() {
		var post = new app.Models.Post();
		$('#main').empty();
		var formView = new app.Views.FormView({model: post, headingTitle: 'Add New Post'});
		$('#main').append(formView.render().el);
		$('#pagination-wrapper').hide();
		this.headerView.selectMenu('add');
		this.initializeTinyMCE();
	},

	editPost: function(_id) {
		var post = new app.Models.Post({_id: _id});
		var self = this;
		$('#main').empty();
		var formView = new app.Views.FormView({model: post, headingTitle: 'Edit Post'});
		post.fetch().then(function(model, response, options) {
			$('#main').append(formView.render().el);
			$('#pagination-wrapper').hide();
			self.initializeTinyMCE();
		});
	},

	adminLogin: function() {
		$('#main').empty();
		var adminLoginView = new app.Views.AdminLogin({vent: app.vent});
		$('#pagination-wrapper').hide();
		$('#main').append(adminLoginView.render().el);
		this.headerView.selectMenu('admin');
	},

	searchPosts: function(searchTerm, num) {
		if (num == undefined) {
			num = 1;
		}

		if (searchTerm == undefined || searchTerm == '') {
			return;
		}

		if (!$('#pagination-wrapper').is(':visible'))
            $('#pagination-wrapper').show();

        $('#main').empty();

		var posts = new app.Collections.Posts([], {
			searchTerm: searchTerm,
			pageNum: num
		});
		var postsView = new app.Views.PostsView({collection: posts});

		posts.fetch({
			success: function(model, response, options) {
				$('#main').append(postsView.render().el);
				var pagination = new app.Views.Pagination({
					totalRecords: response.totalRecords, 
					currentLinkNumber: parseInt(num),
					pageUrl: '/posts/search/' + searchTerm
				});
				$('#pagination-wrapper').html(pagination.render().el);
			}, 
			error: function(model, response, options) {
				console.log(model);
				console.log(response);
				console.log(options);
				var notFound = new app.Views.NotFound();
				$('#main').append(notFound.render().el);
			}
		});
	},

	archivePosts: function(year, month, num) {
		if (num == undefined) {
			num = 1;
		}

		if (year == undefined || month == undefined || year == '' || month == '') {
			return;
		}
		if (!$('#pagination-wrapper').is(':visible'))
            $('#pagination-wrapper').show();

		var posts = new app.Collections.Posts([], {
			year: year,
			month: month,
			pageNum: num
		});
		var postsView = new app.Views.PostsView({collection: posts});

		$('#main').empty();
		posts.fetch({
			success: function(model, response, options) {
				console.log(response);
				$('#main').append(postsView.render().el);
				var pagination = new app.Views.Pagination({
					totalRecords: response.totalRecords, 
					currentLinkNumber: parseInt(num),
					pageUrl: '/posts/archive/' + year + '/' + month
				});
				$('#pagination-wrapper').html(pagination.render().el);
			}, 
			error: function(model, response, options) {
				console.log(model);
				console.log(response);
				console.log(options);
				var notFound = new app.Views.NotFound();
				$('#main').append(notFound.render().el);
			}
		});
	}
});