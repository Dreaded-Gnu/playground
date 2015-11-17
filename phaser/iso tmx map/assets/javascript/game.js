
// initialize game
var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );
// add game states
game.state.add( 'boot', client.state.boot );
game.state.add( 'login', client.state.login );
// start with boot state
game.state.start( 'boot' );
