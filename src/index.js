import Phaser from "phaser";
import skyImg from "./assets/sky.png"
import groundImg from "./assets/platform.png"
import starImg from "./assets/star.png"
import bombImg from "./assets/bomb.png"
import dudeImg from "./assets/dude.png"
/*
import slamSound from "./assets/slam.wav"
import coinSound from "./assets/coin.wav"
import jumpSound from "./assets/jump.wav" */

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('sky', skyImg);
  this.load.image('ground', groundImg);
  this.load.image('star', starImg);
  this.load.image('bomb', bombImg);
  this.load.spritesheet('dude', dudeImg, {
    frameWidth: 32,
    frameHeight: 48
  });

  this.load.audio('slam', './src/assets/slam.wav');
  this.load.audio('jump', './src/assets/jump.wav');
  this.load.audio('coin', './src/assets/coin.wav');
  this.load.audio('beer', './src/assets/beer.wav');

}

let platforms;
let player;
let cursors;
let stars;
let bombs;

let score = 0;
let scoreText;

let gameOver = false;
let GameOverText;


function create() {



  this.add.image(400, 300, 'sky');
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  player = this.physics.add.sprite(100, 450, 'dude');

  scoreText = this.add.text(16, 16, 'score: 0', {
    fontSize: '32px',
    fill: '#000'
  });

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);




  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', {
      start: 0,
      end: 3
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{
      key: 'dude',
      frame: 4
    }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {
      start: 5,
      end: 8
    }),
    frameRate: 10,
    repeat: -1
  });

  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: {
      x: 12,
      y: 0,
      stepX: 70
    }
  });

  bombs = this.physics.add.group();

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });


  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);


  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  cursors = this.input.keyboard.createCursorKeys();

}

function update() {

  if (gameOver)
    {
      GameOverText = this.add.text(200, 300, 'GAME OVER', {
        fontSize: '72px',
        fill: '#000'
      });

      setTimeout(function(){ location.reload(); }, 3000);

        return;
    }

  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
    this.sound.play('jump');
  }

}

function collectStar(player, star) {
  star.disableBody(true, true);

  this.sound.play('coin');

  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0) {

    this.sound.play('beer');

    stars.children.iterate(function (child) {

      child.enableBody(true, child.x, 0, true, true);

    });

    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

  }
}

function hitBomb(player, bomb) {

  this.sound.play('slam');
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}