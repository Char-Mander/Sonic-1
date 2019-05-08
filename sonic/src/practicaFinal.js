var game = function () {


	///////////////////////////////Inicio Quintus/////////////////////////////////////////////////
	// Set up an instance of the Quintus engine and include
	// the Sprites, Scenes, Input and 2D module. The 2D module
	// includes the `TileLayer` class as well as the `2d` componet.
	var Q = Quintus({
		development: true,
		imagePath: "images/",
		audioPath: "audio/",
		audioSupported: ['mp3'],
		dataPath: "data/"
	}).include("Sprites, Scenes, Input, 2D, Audio, Anim, Touch, UI, TMX").setup({
		width: 520, // Set the default width to 800 pixels
		height: 480, // Set the default height to 600 pixels
	}).controls().touch().enableSound();



	///////////////////////////////sprites//////////////////////////////////////////////	

	//CARGA DE DATOS
	Q.load(["mario_small.png", "mario_small.json",
		"mainTitle.png", "goomba.png", "goomba.json",
		"princess.png", "bloopa.png", "bloopa.json",
		"coin.png", "coin.json", "1up_mushroom.png",
		"pingu.png", "pingu.json", "daemon.png",
		"daemon.json", "shark.png", "shark.json",
		"clown.png", "clown.json", "spring.png", "spring.json", 
		"eggman.png", "eggman.json", "bee.png", "bee.json",
		"bullet.png", "bullet.json"], function () {

			Q.compileSheets("mario_small.png", "mario_small.json");
			Q.compileSheets("goomba.png", "goomba.json");
			Q.compileSheets("bloopa.png", "bloopa.json");
			Q.compileSheets("coin.png", "coin.json");
			Q.compileSheets("spring.png", "spring.json");
			Q.compileSheets("pingu.png", "pingu.json");
			Q.compileSheets("daemon.png", "daemon.json");
			Q.compileSheets("shark.png", "shark.json");
			Q.compileSheets("clown.png", "clown.json");
			Q.compileSheets("eggman.png", "eggman.json");
			Q.compileSheets("bee.png", "bee.json");
			Q.compileSheets("bullet.png", "bullet.json");





			//SPRITE SONIC
			Q.Sprite.extend("Sonic", {



				init: function (p) {

					this.alive = true;
					this.lastMileStone = 1;
					this.oneUp = true;
					this._super(p, {

						sheet: "marioR",
						sprite: "Mario_anim",
						jumpSpeed: -400,
						speed: 300,
						w: 32,
						h: 32

					});

					this.add('2d, platformerControls, animation, tween');

					this.on("hit.sprite", function (collision) {
						if (collision.obj.isA("Peach")) {
							Q.audio.play("music_level_complete.mp3");
							Q.stageScene("endGame", 1, { label: "You Win!" });
							this.destroy();
						}
					});


				},


				Die: function () {
					if (this.alive) {
						this.alive = false;
						Q.audio.stop();
						Q.audio.play("mario-bros-mamma-mia.mp3");
						this.gravity = 0;
						this.stage.unfollow();
						this.play("die");
						this.del('2d, platformerControls');
						Q.state.set("lives", 0);
						Q.stageScene("endGame", 1, { label: "You Died" });
						this.animate({ y: this.p.y - 100 }, 0.4, Q.Easing.Linear, { callback: this.nowDown });
					}

				},

				bounce: function () {

					this.p.vy = -200;
				},

				nowDown: function () {

					this.animate({ y: this.p.y + 300 }, 0.8, Q.Easing.Linear, { callback: this.changeToDead });

				},

				changeToDead: function () {

					this.destroy();

				},

				fall: function () {

					if (this.alive) {
						this.destroy();
						Q.state.dec("lives", 1);
						Q.audio.stop();
						Q.audio.play("mario-bros-mamma-mia.mp3");
						Q.stageScene("endGame", 1, { label: "You Died" });
					}
				},

				step: function (dt) {

					if (this.p.y > 520)
						this.stage.follow(Q("Sonic").first(), { x: true, y: false });

					if (this.oneUp && Q.state.get("score") / 1000 == this.lastMileStone) {

						this.extralife();
						this.oneUp = false;
					}
					else if (!this.oneUp) {
						this.lastMileStone++;
						this.oneUp = true;
					}

					if (this.p.y > 620) {
						this.fall();
					}
					if (!this.alive)
						this.play("die");
					else if (this.p.vy != 0) {
						this.play("fall_" + this.p.direction);
					}
					else if (this.p.vx > 0) {
						this.play("run_right");
					}
					else if (this.p.vx < 0) {
						this.play("run_left");
					}
					else {
						this.play("Stand_" + this.p.direction);
					}

				},
				extralife: function () {

					Q.state.inc("lives", 1);
					Q.audio.play("1up.mp3");
				}

			});

			//SPRITE EGGMAN
			Q.Sprite.extend("Eggman",{

				init: function(p) {
					this.timeFromTurn = 0;
				
					this._super(p, {
						sheet: "eggmanL",
						sprite: "eggman_anim",
						hits: 0,
						alive: true,
						vx: 50,
						//collisionMask: Q.SPRITE_FRIENDLY | Q.SPRITE_ACTIVE | Q.SPRITE_DEFAULT
					});

					this.add('2d, aiBounce, animation');

					this.on("bump.left,bump.right,bump.bottom",function(collision) {
						if(collision.obj.isA("Sonic")) {
							collision.obj.Die();
							//TIENE QUE PONER LAURA LO DE PUNTOS TOTALES Y ESO. QUE NO MUERAS AL TOQUE VAMOS	
						}
					});
					/*
					INTENTAR QUE HAGA EL FLIP
					this.on("hit",function(collision){
						console.log("choca");
						var floor = Q("Floor");
						if(collision.obj.isA("floor")){
							collision.impact = this.p.vx;
							if(this.p.defaultDirection == "left")
								this.goRight(collision);
							else
								this.goLeft(collision);
						}	
					});*/

					this.on("bump.top",function(collision) {
						if(collision.obj.isA("Sonic")) {
							if(this.p.hits === 1){
								collision.obj.bounce();
								//this.on("endAnim", this, "die");
								this.DEAD();
							}
							else
							{
								this.p.hits++;
								this.p.vx += 100; //Subirle la velocidad porque se enfada
								this.p.x += 40; //MOVERLE PARA QUE SE ENFADE Y CORRA MAS
								console.log(this.p.hits);
							}
						}
							
					});
					this.on("endAnim", this, "die");
				},


				step: function(dt) {

					if(this.p.vx != 0 && this.p.alive){
						this.play("walk_left");
					}
				},

				DEAD: function() {
					console.log("choca con mario");
					if(this.p.alive){
						//console.log("choca con mario");
						Q.audio.play("kill_enemy.mp3");
						this.alive = false;
						Q.state.inc("score", 100);
						//this.on("endAnim", this, "die");
						console.log("MUERTO");
						this.die();
						}
					},

				die: function(){
					this.destroy();
				},

				goRight: function(){
					if(this.timeFromTurn > 1){	
						this.timeFromTurn = 0;
					this.p.vx = col.impact;
					if(this.p.defaultDirection === 'left') {
						this.p.flip = 'x';
					}
					else 
						this.p.flip = false;
					}
				},
				goLeft: function(col) {
				if(this.timeFromTurn > 1){	
					this.timeFromTurn= 0;
					this.p.vx = -col.impact;
					if(this.p.defaultDirection === 'right') {
						this.p.flip = 'x';
						}
					else {
						this.p.flip = false;
						}
					}
				}
				
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top
			
			});




			//SPRITE GOOMBA
			Q.Sprite.extend("Goomba", {


				init: function (p) {


					this._super(p, {
						sheet: "goomba",
						sprite: "Goomba_anim",
						x: 1500,
						y: 450,
						vx: 100
					});

					this.add('2d, aiBounce, animation, DefaultEnemy');


				},


				step: function (dt) {

					if (this.p.vx != 0 && this.alive) {
						this.play("run");
					}
				}
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top

			});

			//SPRITE PEACH
			Q.Sprite.extend("Peach", {


				init: function (p) {


					this._super(p, {
						asset: "princess.png",

					});
				},

				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top

			});


			//SPRITE BLOOPA
			Q.Sprite.extend("Bloopa", {


				init: function (p) {


					this._super(p, {
						sheet: "bloopa",
						sprite: "Bloopa_anim",
						x: 200,
						y: 350,
						gravity: 1 / 4

					});

					this.add('2d, aiBounce, animation, DefaultEnemy');

					this.on("dead", this, "DEAD");
				},

				step: function (dt) {

					if (this.alive) {
						this.play("standing");
						if (this.p.vy == 0)
							this.p.vy = -300;
					}

				}
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top

			});

			//SPRITE PINGU
			Q.Sprite.extend("Pingu", {


				init: function (p) {


					this._super(p, {
						sheet: "pingu",
						sprite: "Pingu_anim",
						x: 1500,
						y: 450,
						vx: 100
					});

					this.add('2d, aiBounce, animation, DefaultEnemy');
				},


				step: function (dt) {

					if (this.p.vx != 0 && this.alive) {
						this.play("run");
					}
				}
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top

			});


			//SPRITE CLOWN
			Q.Sprite.extend("Clown", {


				init: function (p) {


					this._super(p, {
						sheet: "clown",
						sprite: "Clown_anim",
						x: 1500,
						y: 450,
						vx: 100
					});

					this.add('2d, aiBounce, animation, DefaultEnemy');
				},


				step: function (dt) {

					if (this.p.vx != 0 && this.alive) {
						this.play("run");
					}
				}
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top

			});


			//SPRITE DAEMON
			Q.Sprite.extend("Daemon", {


				init: function (p) {


					this._super(p, {
						sheet: "daemon",
						sprite: "Daemon_anim",
						x: 200,
						y: 350,
						gravity: 1 / 4

					});

					this.add('2d, aiBounce, animation, DefaultEnemy');

					//this.on("dead", this, "DEAD");
				},

				step: function (dt) {

					if (this.alive) {
						this.play("standing");
						if (this.p.vy == 0)
							this.p.vy = -300;
					}

				}
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top

			});


			//SPRITE SHARK
			Q.Sprite.extend("Shark", {


				init: function (p) {


					this._super(p, {
						sheet: "shark",
						sprite: "Shark_anim",
						x: 200,
						y: 350,
						gravity: 1 / 4

					});

					this.add('2d, aiBounce, animation, DefaultEnemy');

					//this.on("dead", this, "DEAD");
				},

				step: function (dt) {

					if (this.alive) {
						this.play("standing");
						if (this.p.vy == 0)
							this.p.vy = -300;
					}

				}
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top

			});

			//SPRITE BEE
			Q.Sprite.extend("Bee",{
				init: function(p) {

					this._super(p, {
						sheet: "bee",
						sprite: "Bee_anim",
						x: 350,
						y: 350,
						gravity: 0 //Asi va en horizontal por el cielo

					});

					this.add('2d, aiBounce, animation, DefaultEnemy');
				},

				step: function(dt) {
					if(this.alive){
						if(this.p.x > 900){
							this.p.vx = -this.p.vx;

						}else if(this.p.x < 550){
							this.p.vx = +this.p.vx;
						}


						var that = this;
						setInterval(function(){ 
							that.shoot(); }, 5000);			

						this.play("standing");
						if(this.p.vx == 0)
							this.p.vx = 200;

						
						/*var that = this;
						setInterval(function(){ 
							that.shoot(); }, 10000);*/
					}
				},
				/**
				 * Este método va a crear un nuevo objeto "Bullet".
				 * La posición del nuevo "Bullet" tiene que ser el mismo x que el jugador
				 * y un poco por encima del objeto "Player".
				 * vy es la velocidad de "Bullet" sobre el eje Y.
				 */
				shoot: function() {
					this.stage.insert(new Q.Bullet({
						x: this.p.x,
						y: this.p.y + this.p.w/2
					}))
				}
			
			});


			/**
			 * Voy a crear un nuevo objeto "Bullet" extendiendo "MovingSprite".
			 * Las propiedades por defecto son:
			 * - Utilizar el sprite "bullet".
			 * - El tipo es SPRITE_BULLET. 
			 * - Colisiona con SPRITE_ENEMY.
			 * - "sensor: true" porque quiero definir mi propio comportamiento de colisiones.
			 */
			Q.Sprite.extend("Bullet", {
				init: function(p) {
					this._super(p, {
						sheet: "bullet",
						sprite: "Bullet_anim",
						//sensor: true,
					});

					/**
					 * Añadiendo el componente 2d para activar la detección de colisiones y el movimiento.
					 */
					this.add("animation, tween");

					this.on("hit.sprite",function(collision) {
						if(collision.obj.isA("Sonic")) {
							collision.obj.isA("Sonic").destroy();
							this.destroy();
						}
					});
				},
				step: function(dt){
					this.play("fire");
					this.animate({y: this.p.y+50 }, 10, Q.Easing.Linear, {callback: this.destroy});
				}
			});


			// SPRING SPRITE
			Q.Sprite.extend("Spring", {
				init: function (p) {
					this.touched = false;
					this._super(p, {
						sheet: 'spring',
						sprite: 'spring_anim',
						gravity: 0
					});


					this.add('2d, animation, tween');
					// Write event handlers to respond hook into behaviors
					
					this.on("bump.top", function (collision) {
						if (collision.obj.isA("Sonic")) {
							collision.obj.p.vy = -700;
							this.play("bounce");
						}
					});
			
					
				},

			});

			//SPRITE COIN 
			Q.Sprite.extend("Coin", {


				init: function (p) {

					this.taken = false;
					this._super(p, {
						sheet: "coin",
						sprite: "Coin_anim",
						sensor: true
					});

					this.add('animation, tween');

					this.on("hit.sprite", function (collision) {
						if (collision.obj.isA("Sonic")) {
							if (!this.taken) {
								this.taken = true;
								Q.audio.play("coin.mp3");
								this.animate({ y: p.y - 50 }, 0.25, Q.Easing.Linear, { callback: this.destroy });
								Q.state.inc("score", 10);
							}
						}
					});
				},

				step: function (dt) {

					this.play("twist");
				}

			});

			//SPRITE ONEUP
			Q.Sprite.extend("OneUp", {


				init: function (p) {

					this.taken = false;

					this._super(p, {
						asset: "1up_mushroom.png",
						x: 2000,
						y: 430,
						vx: 100,
						sensor: true
					});

					this.on("hit.sprite", function (collision) {


						if (collision.obj.isA("Sonic")) {
							if (!this.taken) {
								this.taken = true;
								collision.obj.extralife();
								this.destroy();
							}
						}
					});

				}


			});

			////////////////////////////////////COMPONENTES////////////////////////////////////////////////////
			//COMPONENTE ENEMIGOS
			Q.component("DefaultEnemy", {

				added: function () {

					this.entity.alive = true;
					this.entity.on("bump.left,bump.right,bump.bottom", function (collision) {
						if (collision.obj.isA("Sonic")) {

							if (Q.state.get("score") < 50) {
								if (Q.state.get("lives") > 1) {
									Q.state.dec("lives", 1);
									Q.stageScene("livesLeft", 1);

								}
								else {
									collision.obj.Die();
								}
							}
							else {
								if (Q.state.get("score") > 50) {
									Q.state.dec("score", 50);
								}
								else {
									Q.state.set("score", 0);
								}
								collision.obj.bounce();
								collision.obj.p.vx = -300;
							}

						}
					});

					this.entity.on("bump.top", function (collision, that) {
						if (collision.obj.isA("Sonic")) {
							collision.obj.bounce();
							this.DEAD();
						}
					});

					this.entity.on("endAnim", this.entity, "die");

				},

				extend: {
					DEAD: function () {
						if (this.alive) {
							Q.audio.play("kill_enemy.mp3");
							this.alive = false;
							Q.state.inc("score", 100);
							this.destroy();

						}
					},

					die: function () {
						this.destroy();
					}
				}

			});



			////////////////////////////////////ANIMACIONES/////////////////////////////////////////////////////
			//Animaciones Sonic
			Q.animations('Mario_anim', {
				run_right: { frames: [1, 2, 3], rate: 1 / 10 },
				run_left: { frames: [17, 16, 15], rate: 1 / 10 },
				Stand_right: { frames: [0] },
				Stand_left: { frames: [14] },
				fall_right: { frames: [4], loop: false },
				fall_left: { frames: [18], loop: false },
				die: { frames: [12], loop: true }
			});

			
			//Animaciones Bowser
			Q.animations('eggman_anim', {
				stand_left: { frames: [0], rate: 1/3}, 
				walk_left: {frames: [1, 2, 3, 4], rate: 1/4},
				die: {frames: [5,6,7],rate: 1/150, loop: false, trigger: "endAnim"}
			});

			//Animaciones Goomba
			Q.animations('Goomba_anim', {
				run: { frames: [0, 1], rate: 1 / 3 },
				die: { frames: [2], rate: 1 / 2, loop: false, trigger: "endAnim" }
			});

			//Animaciones Bloopa
			Q.animations('Bloopa_anim', {
				standing: { frames: [0, 1], rate: 1 / 2 },
				die: { frames: [2], rate: 1 / 2, loop: false, trigger: "endAnim" }
			});

			//Animaciones Coin
			Q.animations('Coin_anim', {
				twist: { frames: [0, 1, 2, 3], rate: 1 / 3, loop: true }
			});

			Q.animations("Pingu_anim", {
				run: { frames: [0, 1, 2, 3, 4], rate: 1 / 3, loop: false }
			});

			Q.animations("Daemon_anim", {
				standing: { frames: [0, 1, 2], rate: 1 / 5, loop: false }
			});

			Q.animations("Shark_anim", {
				standing: { frames: [0, 1, 2], rate: 0.5 / 3, loop: false }
			});

			Q.animations("Clown_anim", {
				run: { frames: [0, 1, 2, 3], rate: 0.5 / 3, loop: false }
			});

			Q.animations("Bee_anim", {
				standing: { frames: [0,1,2,3,4,5,6,7], rate: 1/3, loop: false }
			});
		
			Q.animations("Bullet_anim", {
				fire: { frames: [0,1], rate: 1/3, loop: true }
			});
		
			//Animación Spring
			Q.animations("spring_anim", {
				bounce: {
					frames: [1, 2, 3, 0], rate: 2/15,
					flip: false, loop: false
				}
			});


			///////////////////////////////////AUDIOS///////////////////////////////////////////////////////////
			//CARGA DE AUDIOS
			Q.load(["music_die.mp3", "music_level_complete.mp3", "music_main.mp3",
				"coin.mp3", "mario-bros-mamma-mia.mp3", "squish_enemy.mp3", "kill_enemy.mp3", "1up.mp3"], function () {

				});
			///////////////////////////////////CARGA NIVELES////////////////////////////////////////////////////

			//INICIALIZACION
			Q.loadTMX("level.tmx", function () {
				Q.stageScene("mainTitle");
			});


			//NIVEL 1
			Q.scene("level1", function (stage) {

				Q.stageTMX("level.tmx", stage);

				Q.audio.play('music_main.mp3', { loop: true });

				var player = stage.insert(new Q.Sonic({ x: 150, y: 380 }));

				//stage.insert(new Q.Coin({x: 200, y: 400}));
				//stage.insert(new Q.Coin({x: 250, y: 400}));
				//stage.insert(new Q.Coin({x: 300, y: 400}));

				//stage.insert(new Q.Spring({x: 350, y:550}));
				stage.insert(new Q.Eggman({x: 350, y:550}));
				stage.insert(new Q.Bee({x: 560,y: 350}));
				//stage.insert(new Q.Coin({x: 350, y: 250}));
				//stage.insert(new Q.Coin({x: 370, y: 400}));
				//stage.insert(new Q.Coin({x: 425, y: 400}));
				//stage.insert(new Q.Coin({x: 480, y: 400}));


				stage.insert(new Q.Pingu({ x: 1460, y: 350 }));
				stage.insert(new Q.Clown({ x: 1000, y: 350 }));

				stage.insert(new Q.Daemon({ x: 500, y: 350 }));
				stage.insert(new Q.Shark({ x: 560, y: 350 }));


				//		stage.insert(new Q.Peach({x: 2000,y: 517}));
				stage.add("viewport").centerOn(150, 360);
				//stage.add("viewport").follow(Q("Sonic", {x: true, y: false}).first());
				//stage.viewport.offsetX = -100;
				//stage.viewport.offsetY = 160;
			});


			//TITULO DEL JUEGO
			Q.scene("mainTitle", function (stage) {

				var button = new Q.UI.Button({
					x: Q.width / 2,
					y: Q.height / 2,
					asset: "mainTitle.png"
				});
				stage.insert(button);
				button.on("click", function () {
					Q.clearStages();
					Q.state.reset({ score: 0, lives: 2 });
					Q.stageScene("level1");
					Q.stageScene("hud", 3);
				});

			});

			//GAME OVER
			Q.scene('endGame', function (stage) {

				Q.audio.stop("music_main.mp3");
				var container = stage.insert(new Q.UI.Container({

					x: Q.width / 2,
					y: Q.height / 2,
					fill: "rgba(0,0,0,0.5)"

				}));
				var button = container.insert(new Q.UI.Button({

					x: 0,
					y: 0,
					fill: "#CCCCCC",
					label: (Q.state.get("lives") > 0 ? "Play Again" : "GAME OVER")

				}))
				var label = container.insert(new Q.UI.Text({
					y: -10 - button.p.h,
					label: stage.options.label
				}));
				// When the button is clicked, clear all the stages
				// and restart the game.

				button.on("click", function () {
					Q.clearStages();
					if (Q.state.get("lives") > 0) {
						Q.stageScene('level1');
						Q.stageScene("hud", 3);
					}
					else
						Q.stageScene('mainTitle');
				});
				// Expand the container to visibily fit it's contents
				// (with a padding of 20 pixels)
				container.fit(20);
			});
		});
	//HUD
	Q.scene("hud", function (stage) {
		/** Primero, voy a crear un "Container" que contendrá los labels. */
		var container = stage.insert(new Q.UI.Container({
			x: Q.width / 3,
			y: Q.height / 6,
			w: Q.width,
			h: 50,
			radius: 0
		}));

		/** Ahora voy a insertar los tres labels uno encima de otro. */
		container.insert(new Q.SCORE({
			x: container.p.x / 2 - container.p.x,
			y: -container.p.y / 3
		}));

		container.insert(new Q.LIVES({
			x: container.p.x / 2 + container.p.x,
			y: -container.p.y / 3
		}));

	});

	//Escenario que se muestra cuando todavía le quedan vidas
	Q.scene('livesLeft', function (stage) {
		var life = Q.state.p.lives;
		Q.audio.stop("music_main.mp3");
		Q.clearStages();
		Q.state.reset({ score: 0, lives: life });
		Q.stageScene('level1');
		Q.stageScene("hud", 3);
		
	});

	/////////////////////////////////PARTES DEL HUD////////////////////////////////////////////////
	//SCORE
	Q.UI.Text.extend("SCORE", {
		init: function (p) {
			this._super(p, {
				label: "SCORE: " + Q.state.get("score"),
				color: "white",
				size: "14"
			});
			/** Necesito extender porque quiero escuchar los cambios de la variable en el "State". */
			Q.state.on("change.score", this, "update_label");
		},

        /**
        * Con esta función actualizo el label.
        */
		update_label: function (score) {
			this.p.label = "SCORE: " + Q.state.get("score");
		}
	});

	//LIVES
	Q.UI.Text.extend("LIVES", {
		init: function (p) {
			this._super(p, {
				label: "LIVES: " + Q.state.get("lives"),
				color: "white",
				size: "14"
			});
			/** Necesito extender porque quiero escuchar los cambios de la variable en el "State". */
			Q.state.on("change.lives", this, "update_label");
		},

        /**
        * Con esta función actualizo el label.
        */
		update_label: function (score) {
			this.p.label = "LIVES: " + Q.state.get("lives");
		}
	});
}