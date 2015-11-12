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

		var numOfPages = Math.ceil(options.totalRecords / perPage); 
		var currentLinkNumber = options.currentLinkNumber; 

	    var rangeMin = (range % 2 == 0) ? (range / 2) - 1 : (range - 1) / 2;  
	    var rangeMax = (range % 2 == 0) ? rangeMin + 1 : rangeMin; 
	    var pageMin = currentLinkNumber - rangeMin;  
	    var pageMax = currentLinkNumber + rangeMax;  

	    pageMin = (pageMin < 1) ? 1 : pageMin; 
	    pageMax = (pageMax < (pageMin + range - 1)) ? pageMin + range - 1 : pageMax; 

	    if (pageMax > numOfPages) { 
	        pageMin = (pageMin > 1) ? numOfPages - range + 1 : 1; 
	        pageMax = numOfPages; 
	    }

    	pageMin = (pageMin < 1) ? 1 : pageMin; 

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