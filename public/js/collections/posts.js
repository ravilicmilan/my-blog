app = app || {};

app.Collections.Posts = Backbone.Collection.extend({
	model: app.Models.Post,

	format: 'json', 

	initialize: function(models, options) {
    	this.pageNum = options.pageNum;
        this.searchTerm = options.searchTerm || '';
        this.year = options.year || '';
        this.month = options.month || '';
    },

    parse: function (response) {
        return response.posts;
    },

    url: function() {
        if (this.year && this.month) {
            if (this.pageNum)
                return '/posts/archive/' + this.year + '/' + this.month + '/page/' + this.pageNum;
            return '/posts/archive/' + this.year + '/' + this.month;
        } else if (this.searchTerm) {
            if (this.pageNum)
               return '/posts/search/' + this.searchTerm + '/page/' + this.pageNum; 
            return '/posts/search/' + this.searchTerm;
        } else {
            if (this.pageNum)
                return '/posts/page/' + this.pageNum;
            return '/posts';
        }



    	/*if (this.pageNum) {
    		return '/posts/page/' + this.pageNum;
    	} else if (this.searchTerm) {
    		return '/posts/search/' + this.searchTerm;
    	} else if (this.searchTerm && this.pageNum) {
            return '/posts/search/' + this.searchTerm + '/page/' + this.pageNum;
        } else if (this.year && this.month) {
            return '/posts/archive/' + this.year + '/' + this.month;
        } else if (this.year && this.month && this.pageNum) {
            return '/posts/archive/' + this.year + '/' + this.month + '/page/' + this.pageNum;
        } else {
            return '/posts';
        } */ 	
    }
});