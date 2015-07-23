app = app || {};

app.Views.HeaderView = Backbone.View.extend({
	template: _.template($('#header-template').html()),

	events: {
		'click #login_btn': 'login',
		'click #logout_btn': 'logout',
		'click #search_btn': 'search'
	},

	selectMenu: function(menu) {
		this.$('.navbar-nav').find('li').removeClass('active');
		this.$('#' + menu).addClass('active');
	},

	initialize: function(options) {
	},

	render: function() {
		if (app.Auth.loggedIn === true) {
			this.$el.html(this.template({loggedIn: true}));			
		} else {
			this.$el.html(this.template({loggedIn: false}));	
		}
		return this;
	},

	logout: function(e) {
		e.preventDefault();
		var self = this;
		$.ajax({
			method: 'POST',
			url: '/admin/logout',
			success: function(data) {
				console.log(data);
				app.Auth.user = '';
				app.Auth.loggedIn = false;
				app.removeToken();
				app.router.navigate('', {trigger: true});
				app.vent.trigger('admin:logout', [self, app.router.postsView]);
				// document.location = '/'; // ne valja radi page reload
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
		});
	},

	search: function(e) {
		e.preventDefault();
		var searchTerm = this.$('#search_txt').val();
		app.router.navigate('posts/search/' + searchTerm, {trigger: true});
	}
});