var app = {
	Models: {},
	Views: {},
	Collections: {},
	Routers: {},
	router: {},
	vent: {},

	startOverlay: function() {
    	$("body")
	    .append('<div class="overlay"></div><div class="overlay-container"><img src="/img/ajax-loader.gif" /></div>')
	    .css({"overflow-y": "hidden"});
	},

	removeOverlay: function() {
		$("body").css({"overflow-y": "auto"});
		$(".overlay-container, .overlay").animate({"opacity": "0"}, 200, "linear", function() {
			$(".overlay-container, .overlay").remove();  
		});
	},

	showMessage: function(msgClass, msg, delay) {
		var div = $('#response');

		if (div.hasClass('response-success')) {
			div.removeClass('response-success');
		} else if (div.hasClass('response-error')) {
			div.removeClass('response-error');
		}	
		div.addClass(msgClass).fadeIn().html(msg).delay(delay).fadeOut();
	},

	getToken: function() {
		return localStorage.getItem('token');
	},

	setToken: function(token) {
		localStorage.setItem('token', token);
	},

	removeToken: function() {
		localStorage.setItem('token', '');
	},

	Auth: {
		loggedIn: false,
		user: ''
	},

	checkAuth: function() {
		var token = app.getToken();

		if (!token)
			app.Auth.loggedIn = false;
		else
			app.Auth.loggedIn = true;
	},

	rerender: function(views) {
		views.forEach(function(view) {
			view.render();
		});
	},
	
	init: function() {
		_.extend(app.vent, Backbone.Events);
		app.vent.on('admin:login', app.rerender);
		app.vent.on('admin:logout', app.rerender); 
		app.vent.on('posts:add', app.rerender); 


		$.ajaxSetup({
			beforeSend: function() {
				app.startOverlay();
			},
			complete: function() {
				app.removeOverlay();
			}
		});

		Backbone.View.prototype.close = function () {
		    if (this.beforeClose) {
		        this.beforeClose();
		    }
		    this.remove();
		    this.unbind();
		};

		Backbone.old_sync = Backbone.sync;

		Backbone.sync = function(method, model, options) {
		    var new_options =  _.extend({
		        beforeSend: function(xhr) {
		            xhr.setRequestHeader('x-access-token', app.getToken());
		        }
		    }, options)
		    return Backbone.old_sync(method, model, new_options);
		};

		app.checkAuth();
	}
};