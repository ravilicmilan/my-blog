app = app || {};

app.Views.PostView = Backbone.View.extend({
	tagName : 'li',
	className: 'list-group-item post-item list-group-item-warning',

	events: {
		'click .edit-post': 'editPost',
		'click .delete-post': 'deletePost'
	},

	template: _.template($('#post-template').html()),

	initialize: function (options) {
		this.vent = options.vent;
		this.on('admin:login', this);
		this.on('admin:logout', this);
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model.get('comments'), 'add', this.render);
	},

	render: function() {
		if (app.Auth.loggedIn === true) {
			this.$el.html(this.template({
				post: this.model.toJSON(),
				loggedIn: true
			}));
		} else {
			this.$el.html(this.template({
				post: this.model.toJSON(),
				loggedIn: false
			}));
		}
		return this;
	},

	editPost: function(e) {
		e.preventDefault();
		app.router.navigate('posts/edit/' + this.model.get('_id'), {trigger: true});
	},

	deletePost: function(e) {
		e.preventDefault();
		console.log('delete post: ' + this.model.get('_id'));
		if (confirm('Are you sure you want to delete this post?') === true) {
			this.model.destroy();
			this.remove();
		}
	}
});

app.Views.PostsView = Backbone.View.extend({
	tagName: 'ul',
	className: 'list-group',

	initialize: function(options) {
		this.listenTo(this.collection, 'refresh', this.render);
		this.listenTo(this.collection, 'change', this.render);
		this.listenTo(this.collection, 'reset', this.render);
	},

	render: function() {
		var self = this;
		this.$el.empty();
		this.collection.each(function(model) {
			var postView = new app.Views.PostView({model: model});
			self.$el.append(postView.render().el);
		});
		return this;
	}
});

app.Views.ViewPost = Backbone.View.extend({
	tagName: 'div',
	className: 'col-md-12 col-xs-12',

	template: _.template($('#post-view-template').html()),

	render: function() {
		if (app.Auth.loggedIn === true) {
			this.$el.html(this.template({
				post: this.model.toJSON(),
				loggedIn: true
			}));
		} else {
			this.$el.html(this.template({
				post: this.model.toJSON(),
				loggedIn: false
			}));
		}
		var comments = this.model.get('comments');
		var commentsView = new app.Views.CommentsView({collection: comments});
		this.$('#comments-holder').html(commentsView.render().el);
		return this;
	}
});

app.Views.FormView = Backbone.View.extend({
	tagName: 'div',
	className: 'col-md-12 col-xs-12',
	template: _.template($('#post-form-template').html()),

	events: {
		'submit form': 'savePost',
		'keyup #title': 'onKeyPress',
		'blur #title': 'onBlur'
	},

	initialize: function(options) {
		this.headingTitle = options.headingTitle;
		tinymce.editors = [];
	},

	render: function() {
		this.$el.html(this.template({
			model: this.model.toJSON(),
			headingTitle: this.headingTitle
		}));
		return this;
	},

	onKeyPress: function(e) {
		if (e.which !== 13) { 
			var string = $('#title').val();
			string = string.trim();
			string = string.toLowerCase().replace(',.;:"\'[]{}<>/!@#$%^&*()_-=+', '').replace(/\s/g, '-');
			
			this.$('#slug').val(string);
		}
	},

	onBlur: function(e) {
		var self = this;

		$.ajax({
			type: 'POST',
			url: '/posts/slug',
			data: { slug: self.$('#slug').val() },
			dataType: 'json',
			success: function(data) {
				if (data.success) {
					app.showMessage('response-success', data.success, 1500);
				} else if (data.error) {
					app.showMessage('response-error', data.error, 3000);
				}
			}
		});
	},

	savePost: function(e) {
		e.preventDefault();
		var self = this;

		this.model.set({
			title: this.$('#title').val(),
			slug: this.$('#slug').val(),
			content: this.$('#content').val()
		});
		
		this.model.save(null, {
			success: function(model, response, options) {
				app.showMessage('response-success', 'Post successfully saved!', 1500);
				app.vent.trigger('posts:add', [app.router.archiveView]);
				app.router.navigate('/posts/view/' + self.$('#slug').val(), {trigger: true});
			},
			error: function(model, response, options) {
				app.showMessage('response-error', 'Post could not be saved! Error: ' + model.error, 3000);
			}
		});
	}
});