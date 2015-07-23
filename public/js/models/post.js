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
	     //    var token = $('meta[name="x-access-token"]').attr('content');
		    // if (token) jqXHR.setRequestHeader('x-access-token', token);
		    jqXHR.setRequestHeader('x-access-token', app.getToken());
	    });
	},

	getBySlug: function(slug) {
	    // "this" is now our Model instance declared from the router
	    this.url = this.urlRoot + "/view/" + slug;
	}
});