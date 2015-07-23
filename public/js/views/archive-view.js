app = app || {};

app.Views.ArchiveView = Backbone.View.extend({
	template: _.template($('#archive-template').html()),
	className: 'well',
	tagName: 'div',

	months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Avg', 'Sep', 'Oct', 'Nov', 'Dec'],

	initialize: function(options) {
		this.render();
	},

	render: function() {
		var self = this;
		$.ajax({
			url: '/posts/archive',
			type: 'GET',
			success: function(data) {
				self.$el.html(self.template({
					templateData: data,
					months: self.months
				}));
			},
			error: function(jqXhr, response, options) {
				console.log(jqXhr);
				console.log(response);
				console.log(options);
			}
		});
		
		return this;
	}
});