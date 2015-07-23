app = app || {};

app.Views.Pagination = Backbone.View.extend({
	el: '#pagination-nav',
	template: _.template($('#pagination-template').html()),

	total: null,

	events: {
		'click .page': 'showPage'
	},

	initialize: function (options) {
		var range = 5;
		var perPage = 6;

		var numOfPages = Math.ceil(options.totalRecords / perPage); // 13 / 6 = 3
		var currentLinkNumber = options.currentLinkNumber; // 1

	    var rangeMin = (range % 2 == 0) ? (range / 2) - 1 : (range - 1) / 2;  // false 3
	    var rangeMax = (range % 2 == 0) ? rangeMin + 1 : rangeMin;  // false 3
	    var pageMin = currentLinkNumber - rangeMin;  // 1 - 3 = -2
	    var pageMax = currentLinkNumber + rangeMax;  // 1 + 3 = 4

	    pageMin = (pageMin < 1) ? 1 : pageMin; // true 1
	    pageMax = (pageMax < (pageMin + range - 1)) ? pageMin + range - 1 : pageMax; // true 5

	    if (pageMax > numOfPages) { // true
	        pageMin = (pageMin > 1) ? numOfPages - range + 1 : 1; // false 1
	        pageMax = numOfPages; // 3
	    }

    	pageMin = (pageMin < 1) ? 1 : pageMin; // false 1

    	this.numOfPages = numOfPages;
    	this.currentLinkNumber = currentLinkNumber;
    	this.pageMin = pageMin;
    	this.pageMax = pageMax;
    	this.pageUrl = options.pageUrl || '/posts';
	},

	render: function () {
		var html = this.template({
			numOfPages : this.numOfPages,
	    	currentLinkNumber : this.currentLinkNumber,
	    	pageMin : this.pageMin,
	    	pageMax : this.pageMax,
	    	pageUrl : this.pageUrl
		});
		this.$el.html(html);
		return this;
	},

	showPage: function(e) {
		e.preventDefault();
		var page = $(e.currentTarget).attr('rel');

		app.router.navigate('posts/page/' + page, {trigger: true});
	}
});