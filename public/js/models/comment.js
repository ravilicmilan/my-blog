app = app || {};

app.Models.Comment = Backbone.AssociatedModel.extend({
	idAttribute: '_id',
	urlRoot: '/posts/comments',

	setCommentUrl: function(postId) {
	    this.url = this.urlRoot + "/" + postId;
	}
});