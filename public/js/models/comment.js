app = app || {};

app.Models.Comment = Backbone.AssociatedModel.extend({
	idAttribute: '_id',
	urlRoot: '/posts/comments',

	setCommentUrl: function(postId) {
	    // "this" is now our Model instance declared from the router
	    this.url = this.urlRoot + "/" + postId;
	}
});