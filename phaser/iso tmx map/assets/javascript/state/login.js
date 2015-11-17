
var client = client || {};
client.state = client.state || {};

client.state.login = function ( game ) {

	this.game = game;
	this.map = null;
	this.tileset = null;
	this.groups = [];
	this.cursors = null;

};

client.state.login.prototype = {

	preload: function() {

		// load map file from server
		this.game.load.json( "map", "assets/map/test/test.json" );
		this.game.load.spritesheet( "tiles", "assets/map/test/test.png", 64, 64, 24 );

	},

	create: function() {

		var layer, tmp, currentLayerData, xIndex, yIndex, tilesetIndex,
			foundTilesetIndex, tileIndex, tile, destX, destY, tileset,
			maxX, maxY, minX, minY;

		// cursor handling
		this.cursors = this.game.input.keyboard.createCursorKeys();

		// cache map data
		this.map = this.game.cache.getJSON( "map" );

		// determine max x and y for set of bounds
		maxX = this.map.width * this.map.tilewidth - this.map.tilewidth * .75;
		maxY = this.map.height * this.map.tileheight / 2 - this.map.tileheight * 2 * .75;
		if ( "isometric" === this.map.orientation ) {
			maxX += this.map.tilewidth * .5;
			maxY = this.map.height * this.map.tileheight - this.map.tileheight * .25;
		}

		// determine min x and y
		minX = 0;
		minY = 0;
		// handle diamond isometric special calculation
		if ( "isometric" === this.map.orientation ) {
			minX = -1 * maxX / 2 - this.map.tilewidth * .25;
			minY = -1 * this.map.tileheight * 1.25;
		}

		// set bounds
		this.game.world.setBounds( minX, minY, maxX, maxY );


		// handle special centering for diamond isometric cards
		if ( "isometric" === this.map.orientation ) {
			this.game.camera.x = minX / 2;
			this.game.camera.y = -1 * minY;
		} else {
			// center camera
			this.game.camera.x = this.game.world.width / 2 - this.game.width / 2;
			this.game.camera.y = this.game.world.height / 2 - this.game.height / 2;
		}

		// cache tileset
		this.tileset = this.map.tilesets;

		// loop through map for rendering
		for ( layer = 0; layer < this.map.layers.length; ++layer ) {

			// skip no tile layers
			if ( this.map.layers[ layer ].type !== "tilelayer" ) {
				continue;
			}

			// create new group for layer
			tmp = this.game.add.group();

			// cache current layer
			currentLayerData = this.map.layers[ layer ].data;

			// loop through map height
			for ( yIndex = 0; yIndex < this.map.height; ++yIndex ) {

				// loop through map width
				for ( xIndex = 0; xIndex < this.map.width; ++xIndex ) {

					// default no tileset found
					foundTilesetIndex = null;
					// get tile id
					tileIndex = currentLayerData[ yIndex * this.map.width + xIndex ];

					// determine tileset
					for ( tilesetIndex = 0 ; tilesetIndex < this.tileset.length; ++tilesetIndex ) {

						// tileset matching? cache it, and check following tilesets
						if ( tileIndex >= this.tileset[ tilesetIndex ].firstgid ) {

							foundTilesetIndex = tilesetIndex;

						}

					}
					// no tileset found? => skip
					if ( null === foundTilesetIndex ) {

						console.log( "Skipping (" + xIndex + ", " + yIndex + ")" );
						continue;

					}
					// cache found tileset
					tileset = this.tileset[ foundTilesetIndex ];

					if ( this.map.orientation === "isometric" ) {
						// calculate destination coordinates
						destX = ( xIndex - yIndex ) * ( tileset.tilewidth / 2 );
						destY = ( xIndex + yIndex ) * ( tileset.tileheight / 2 );
					}
					// determine destination coordinates for staggered iso maps
					else if ( this.map.orientation === "staggered" ) {
						// default x and y position
						destX = xIndex * tileset.tilewidth;
						destY = yIndex * tileset.tileheight;
						// consider per line adjustment at staggered iso maps depending on staggering axis and index
						if ( "y" === this.map.staggeraxis ) {
							destY = parseInt( destY / 2, 10 );
							if ( "odd" === this.map.staggerindex ) {
								destX += parseInt( ( yIndex & 1 ) * parseInt( tileset.tilewidth / 2, 10 ), 10 );
							} else if ( "even" === this.map.staggerindex ) {
								destX -= parseInt( ( yIndex & 1 ) * parseInt( tileset.tilewidth / 2, 10 ), 10 );
							}
						} else if ( "x" === this.map.staggeraxis ) {
							destX = parseInt( destX / 2, 10 );
							if ( "odd" === this.map.staggerindex ) {
								destY += parseInt( ( xIndex & 1 ) * parseInt( tileset.tileheight / 2, 10 ), 10 );
							} else if (  "even" === this.map.staggerindex ) {
								destY -= parseInt( ( xIndex & 1 ) * parseInt( tileset.tileheight / 2, 10 ), 10 );
							}
						}
					}
					// consider difference for y, when tileset tile height is greater than map tile height
					if ( tileset.tileheight > this.map.tileheight )
					{
						destY /= ( tileset.tileheight / this.map.tileheight );
					}
					// consider difference for X, when tileset tile width is greater than map tile width
					if ( tileset.tilewidth > this.map.tilewidth )
					{
						destX /= ( tileset.tilewidth / this.map.tilewidth );
					}
					// consider rendering offsets
					if ( "undefined" !== typeof tileset.tileoffset )
					{
						destX -= tileset.tileoffset.x;
						destY -= tileset.tileoffset.y;
					}

					// add sprite to group
					tile = this.game.add.sprite( destX, destY, "tiles", tileIndex - 1, tmp );
					tile.anchor.set( .75, .75 );

				}

			}

			// push back group
			this.groups.push( tmp );

		}

	},

	update: function () {

		if ( this.cursors.up.isDown )
		{
			this.game.camera.y -= 4;
		}
		else if ( this.cursors.down.isDown )
		{
			this.game.camera.y += 4;
		}

		if ( this.cursors.left.isDown )
		{
			this.game.camera.x -= 4;
		}
		else if ( this.cursors.right.isDown )
		{
			this.game.camera.x += 4;
		}

	},

	render: function () {

		this.game.debug.text( this.game.time.fps || "--", 2, 14, "#a7aebe" );

	},

	shutdown: function() {
	}

};
