app = app || {};

app.Models.Post = Backbone.AssociatedModel.extend({
	idAttribute: '_id',
	urlRoot: '/posts',

	relations: [{
        type: Backbone.Many,
        key: 'comments',
        relatedModel: app.Models.Comment
    }],

	defaults: {
		title: '',
		createdOn: '',
		content: '',
		slug: '',
		comments: []
	},

	initialize: function() {
		$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
		    jqXHR.setRequestHeader('x-access-token', app.getToken());
	    });
	},

	getBySlug: function(slug) {
	    this.url = this.urlRoot + "/view/" + slug;
	}
});