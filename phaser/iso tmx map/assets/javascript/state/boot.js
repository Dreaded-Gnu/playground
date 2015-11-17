
var client = client || {};
client.state = client.state || {};

client.state.boot = function ( game ) {

	this.game = game;

};

client.state.boot.prototype = {

	create: function() {

		// set advanced timing
		this.game.time.advancedTiming = true;

		// kickstart game with login state
		this.game.state.start( 'login' );

	},

};
