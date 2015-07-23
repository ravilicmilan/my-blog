app = app || {};

app.Views.NotFound = Backbone.View.extend({
	template: _.template($('#not-found-template').html()),

	render: function() {
		this.$el.html(this.template({}));
		return this;
	}
});