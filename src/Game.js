
import React from 'react';
import { Howl } from 'howler';

const STATUS = {
  STOP: 'STOP',
  START: 'START',
  PAUSE: 'PAUSE',
  OVER: 'OVER'
};

const JUMP_DELTA = 5;
const JUMP_MAX_HEIGHT = 58;

export default class Game extends React.Component {
  constructor(props) {
    super(props);

    let imageLoadCount = 0;
    let onImageLoaded = () => {
      ++imageLoadCount;
      if (imageLoadCount === 3) {
        this.obstacles = this.__obstaclesGenerate();
        this.__draw();
      }
    };

    // 资源文件
    let skyImage = new Image();
    let groundImage = new Image();
    let playerImage = new Image();
    let playerLeftImage = new Image();
    let playerRightImage = new Image();
    let playerDieImage = new Image();
    let lionImage = new Image();
    let dogImage = new Image();
    let deerImage = new Image();
    let snakeImage = new Image();
    // let treeImage = new Image();
    // this.gotPointsSound = new Audio();
    this.gotPointsSound = new Howl({
      src: ['http://first.laughguru.com/assets/audio/Coin_sound.mp3']
    });
    this.soundId = null;
    this.cycleCount = 0;

    skyImage.onload = onImageLoaded;
    groundImage.onload = onImageLoaded;
    playerImage.onload = onImageLoaded;

    skyImage.src = require('./img/cloud.png');
    groundImage.src = require('./img/ground.png');
    playerImage.src = require('./img/dinosaur.png');
    playerLeftImage.src = require('./img/dinosaur_left.png');
    playerRightImage.src = require('./img/dinosaur_right.png');
    playerDieImage.src = require('./img/dinosaur_die.png');
    lionImage.src = require('./img/lion.png');
    deerImage.src = require('./img/deer.png');
    dogImage.src = require('./img/dog.png');
    snakeImage.src = require('./img/snake.png');
    // treeImage.src = require('./img/tree.png');
    // this.gotPointsSound.src = require('./audio/Coin_sound.mp3');

    this.options = {
      fps: 120,
      skySpeed: 40,
      groundSpeed: 200,
      minimum_distance: 600,
      skyImage: skyImage,
      groundImage: groundImage,
      playerImage: [playerImage, playerLeftImage, playerRightImage, playerDieImage],
      mammalImage: [lionImage, deerImage, dogImage],
      nonMammalImage: [snakeImage],
      skyOffset: 0,
      groundOffset: 0,
      acceleration: 50
    };
    if (this.props.settings) {
      this.options.fps = this.props.settings.fps ? this.props.settings.fps : 120;
      if (this.props.settings.acceleration) {
        let acceleration = parseFloat(this.props.settings.acceleration, 10);
        let accel = parseInt(50 / acceleration, 10);
        let idealAcceleration = parseInt(parseFloat((120 / this.options.fps), 10) * 50, 10);
        this.options.acceleration = accel < idealAcceleration ? accel : idealAcceleration;
      } else {
        this.options.acceleration = parseInt(parseFloat((120 / this.options.fps), 10) * 50, 10)
      }
    }

    this.styleCanvas = { width: this.props.width }

    this.options.skySpeed = parseInt(this.options.fps / 3, 10);
    this.options.groundSpeed = parseInt((this.options.fps * 10) / 6, 10);

    this.status = STATUS.STOP;
    this.timer = null;
    this.score = 0;
    this.highScore = window.localStorage ? window.localStorage['highScore'] || 0 : 0;
    this.jumpHeight = 0;
    this.jumpDelta = 0;
    this.obstaclesBase = 1;
    this.currentDistance = 0;
    this.playerStatus = 0;
    this.selectedMammals = [];
    this.selectedNonMammal = null;
    this.level = 1;
    this.state = {
      showCanvas: true
    };
  }

  componentDidMount() {
    if (window.innerWidth >= 680) {
      this.canvas.width = 680;
    }

    const onSpacePress = () => {
      switch (this.status) {
        case STATUS.STOP:
          this.start();
          break;
        case STATUS.START:
          this.jump();
          break;
        case STATUS.OVER:
          this.restart();
          break;
        default:
          break;
      }
    };

    const onEnterPress = () => {
      switch (this.status) {
        case 'PAUSE':
          this.goOn();
          break;
        default:
          this.stop();
          break;
      }
    };

    window.onkeydown = function (e) {
      if (e.key === ' ') {
        onSpacePress();
      }
      if (e.key === 'ArrowUp') {
          onSpacePress();
      }
      if (e.key === 'Enter') {
        onEnterPress();
      }
    };
    this.canvas.parentNode.onclick = onSpacePress;

    window.onblur = this.pause;
    window.onfocus = this.goOn;
  }

  componentWillUnmount() {
    window.onblur = null;
    window.onfocus = null;
  }

  __drawObstacles(ctx, groundSpeed) {
    // 障碍
    const { width } = this.canvas;
    let pop = 0;
    for (let i = 0; i < this.obstacles.length; ++i) {
      if (this.currentDistance >= this.obstacles[i].distance) {
        let offset = width - (this.currentDistance - this.obstacles[i].distance + groundSpeed);
        if (offset > 0) {
          ctx.drawImage(this.obstacles[i].image, offset, this.obstacles[i].height);
        } else {
          ++pop;
        }
      } else {
        break;
      }
    }
    for (let i = 0; i < pop; i++) {
      this.obstacles.shift();
    }
    if (this.obstacles.length < 5) {
      this.obstacles = this.obstacles.concat(this.__obstaclesGenerate());
    }
  }

  __hitObstacles(groundSpeed, playerWidth, playerHeight) {
    // 碰撞检测
    const { width } = this.canvas;
    let firstOffset = width - (this.currentDistance - this.obstacles[0].distance + groundSpeed);
    if (this.obstacles[0].isMammal) {
      if (90 - this.obstacles[0].width < firstOffset &&
        firstOffset < 60 + playerWidth) {
        if (this.obstacles[0].height === 84) {
          if (64 - this.jumpHeight + playerHeight > 84) {
            this.grab(groundSpeed);
          }
        } else {
          if (80 - (this.jumpHeight + playerHeight) < this.obstacles[0].height) {
            this.grab(groundSpeed);
          }
        }
      }
    } else if (90 - this.obstacles[0].width < firstOffset &&
      firstOffset < 60 + playerWidth) {
      if (this.obstacles[0].height === 84) {
        if (64 - this.jumpHeight + playerHeight > 84) {
          this.stop();
        }
      } else {
        if (80 - (this.jumpHeight + playerHeight) < this.obstacles[0].height) {
          this.stop();
        }
      }
    }
  }

  __draw() {
    if (!this.canvas) {
      return;
    }
    const { options } = this;
    let level = Math.min(200, Math.floor(this.score / options.acceleration));
    let groundSpeed = (options.groundSpeed + level) / options.fps;
    let skySpeed = options.skySpeed / options.fps;
    let playerWidth = options.playerImage[0].width;
    let playerHeight = options.playerImage[0].height;

    const ctx = this.canvas.getContext('2d');
    const { width, height } = this.canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // 云 -- cloud
    this.options.skyOffset = this.options.skyOffset < width
      ? (this.options.skyOffset + skySpeed)
      : (this.options.skyOffset - width);
    ctx.translate(-this.options.skyOffset, 0);
    ctx.drawImage(this.options.skyImage, 0, 0);
    ctx.drawImage(this.options.skyImage, this.options.skyImage.width, 0);

    // 地面 -- ground 
    this.options.groundOffset = this.options.groundOffset < width
      ? (this.options.groundOffset + groundSpeed)
      : (this.options.groundOffset - width);
    ctx.translate(this.options.skyOffset-this.options.groundOffset, 0);
    ctx.drawImage(this.options.groundImage, 0, 76);
    ctx.drawImage(this.options.groundImage, this.options.groundImage.width, 76);

    // Dinosaur
    // Here has been reduced back to the upper left corner coordinates
    ctx.translate(this.options.groundOffset, 0);
    ctx.drawImage(this.options.playerImage[this.playerStatus], 80, 64 - this.jumpHeight);
    // 更新跳跃高度/速度
    this.jumpHeight = this.jumpHeight + this.jumpDelta;
    if (this.jumpHeight <= 1) {
      this.jumpHeight = 0;
      this.jumpDelta = 0;
    }
    else if (this.jumpHeight < JUMP_MAX_HEIGHT && this.jumpDelta > 0) {
      this.jumpDelta = (this.jumpHeight * this.jumpHeight) * 0.001033 - this.jumpHeight * 0.137 + 5;
    }
    else if (this.jumpHeight >= JUMP_MAX_HEIGHT) {
      this.jumpDelta = -JUMP_DELTA / 2.7;
    }

    // 分数
    let scoreText = (this.status === STATUS.OVER ? 'GAME OVER  ' : '') + Math.floor(this.score);
    ctx.font = "Bold 18px Arial";
    ctx.textAlign = "right";
    ctx.fillStyle = "#595959";
    ctx.fillText(scoreText, width - 30, 23);
    if (this.status === STATUS.START) {
      this.score += 0.5;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        window.localStorage['highScore'] = this.score;
      }
      this.currentDistance += groundSpeed;
      if (this.cycleCount % 8 === 0) {
        this.playerStatus = (this.playerStatus + 1) % 3;
      }
      if (this.jumpHeight > 0) {
        this.playerStatus = 0;
      }
    }
    if (this.highScore) {
      ctx.textAlign = "left";
      ctx.fillText('HIGH  ' + Math.floor(this.highScore), 30, 23);
      ctx.fillText('Speed  ' + groundSpeed.toFixed(2), 150, 23);
    }

    this.__drawObstacles(ctx, groundSpeed);

    this.__hitObstacles(groundSpeed, playerWidth, playerHeight);

    this.cycleCount += 1;
    ctx.restore();
  }

  __setImageForObstacle(bool) {
    let image = null;
    let that = this;
    let sameAndMany = () => {
      if (bool) {
        let level = that.level;
        if (that.selectedMammals.length < level && that.selectedMammals.length < 4) {
          let random = parseInt(Math.random() * 10, 10) % 3;
          if (level > 1 && random === that.selectedMammals[0].index) {
          } else {
            that.selectedMammals.push({
              image: that.options.mammalImage[random],
              index: random
            });
          }
        }
        let random = parseInt(Math.random() * 10, 10) % that.selectedMammals.length;
        image = that.selectedMammals[random].image;
      } else {
        if (that.selectedNonMammal === null) {
          let random = parseInt(Math.random() * 10, 10) % 1;
          that.selectedNonMammal = that.options.nonMammalImage[random];
        }
        image = that.selectedNonMammal;
      }
      return image;
    };

    let obj = {
      sameAndMany: sameAndMany
    }    
    if (this.props.type) {
      return obj[this.props.type]();
    }
    return sameAndMany();
  }

  __obstaclesGenerate() {
    let res = [];
    for (let i = 0; i < 10; ++i) {
      let random = Math.floor(Math.random() * 100) % 60;
      let bool = parseInt(Math.random() * 10, 10) % 2;
      let boolMammal = parseInt(Math.random() * 10, 10) % 2;
      let image = this.__setImageForObstacle(boolMammal);
      random = (bool === 0 ? 1 : -1) * random;
      res.push({
        distance: random + this.obstaclesBase * 200,
        height: bool ? 84 : 64 - this.options.playerImage[0].height,
        isMammal: boolMammal,
        image: image,
        width: image.width
      });
      ++this.obstaclesBase;
    }
    return res;
  }

  __setTimer() {
    this.timer = setInterval(() => this.__draw(), 1000 / this.options.fps);
    this.levelUpTimer = setTimeout(() => this.__showLevelUp(), 10000);
  }

  __clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      clearTimeout(this.levelUpTimer);
      this.timer = null;
    }
  }

  __clear() {
    this.score = 0;
    this.jumpHeight = 0;
    this.currentDistance = 0;
    this.obstacles = [];
    this.obstaclesBase = 1;
    this.playerStatus = 0;
    this.level = 1;
    this.selectedMammals = [];
    this.selectedNonMammal = null;
  }

  __showLevelUp() {
    this.setState({
      showCanvas: false
    });
    this.pause();
    this.level += 1;
    console.log(Date.now(), this.level);
  }

  start = () => {
    if (this.status === STATUS.START) {
        return;
    }
    console.log(Date.now());
    this.status = STATUS.START;
    this.__setTimer();
    this.jump();
  };

  pause = () => {
    if (this.status === STATUS.START) {
      this.status = STATUS.PAUSE;
      this.__clearTimer();
    }
  };

  goOn = () => {
    if (this.status === STATUS.PAUSE) {
      if (!this.state.showCanvas) {
        this.setState({
          showCanvas: true
        });
      }
      this.status = STATUS.START;
      this.__setTimer();
    }
  };

  stop = () => {
    if (this.status === STATUS.OVER) {
      return;
    }
    this.status = STATUS.OVER;
    this.playerStatus = 3;
    this.__clearTimer();
    this.__draw();
    this.__clear();
  };

  grab = (speed) => {
    if (this.status === STATUS.OVER) {
      return;
    }
    this.score += (50 * speed);
    this.gotPointsSound.stop(this.soundId);
    this.soundId = this.gotPointsSound.play();
    this.obstacles.shift();
  }  

  restart = () => {
    this.obstacles = this.__obstaclesGenerate();
    this.start();
  };

  jump = () => {
    if (this.jumpHeight > 2) {
      return;
    }
    this.jumpDelta = JUMP_DELTA;
    this.jumpHeight = JUMP_DELTA;
  };

  render() {
    let play = this.state.showCanvas;
    let opacity = {
      opacity: play ? 1 : 0.5
    }
    return ( 
      <div>
        <canvas id="canvas" ref={ref => this.canvas = ref} height={160} width={680} style={{ ...this.styleCanvas, ...opacity }} />
        { !play ? (<h3>Level Up! Press Enter to continue</h3>) : null}
      </div>
    );
  }
};
