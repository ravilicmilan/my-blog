app = app || {};

app.Views.CommentView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#comment-template').html()),

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

app.Views.CommentsView = Backbone.View.extend({
	template: _.template($('#comments-template').html()),

	events: {
		'click #submit_comment_btn': 'submitComment'
	},

	initialize: function(options) {
		this.listenTo(this.collection, 'add', this.render);
		this.listenTo(this.collection, 'change', this.render);
		this.listenTo(this.collection, 'reset', this.render);
	},

	render: function() {
		var self = this;
		this.$el.html(this.template());

		this.collection.each(function(model) {
			var commentView = new app.Views.CommentView({model: model});
			self.$('#comment-list').append(commentView.render().el);
		});
		return this;
	},

	submitComment: function(e) {
		e.preventDefault();
		var self = this;

		var newComment = new app.Models.Comment({
			name: this.$('#name').val(),
			email: this.$('#email').val(),
			commentText: this.$('#commentText').val(),
			commentDate: Date.now()
		});
		var postId = $('#post_id').val();

		newComment.setCommentUrl(postId);
		newComment.save(null, {
			success: function(data) {
				app.showMessage('response-success', 'Thank you for submitting your comment!', 1500);
				self.collection.add(newComment);
			},
			error: function(jqXhr, response, options) {
				app.showMessage('response-error', 'Error adding new comment ', 3000);
				console.log(jqXhr);
				console.log(response);
				console.log(options);
			}
		});
	}
});