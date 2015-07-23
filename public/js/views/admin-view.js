app = app || {};

app.Views.AdminLogin = Backbone.View.extend({
	template: _.template($('#admin-login-template').html()),

	events: {
		'click #login_btn': 'login'
	},

	initialize: function(options) {

	},

	render: function() {
		this.$el.html(this.template({}));
		return this;
	},

	login: function(e) {
		e.preventDefault();
		var self = this;
		var username = this.$('#username').val();
		var password = this.$('#password').val();
		var postData = {
			username: username,
			password: password
		};

		$.ajax({
			method : 'POST',
			url: '/admin/login',
			dataType: 'json',
			data: postData,
			success: function(data) {
				console.log(data);
				app.Auth.user = data.user;
				app.Auth.loggedIn = true;
				// $('meta[name="x-access-token"]').attr('content', data.token);
				
				app.setToken(data.token);
				
				app.router.navigate('', {trigger: true});
				app.vent.trigger('admin:login', [app.router.headerView]);
			},
			error: function( jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
		});
	}

});