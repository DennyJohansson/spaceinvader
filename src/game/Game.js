import React, { Component } from 'react';
import Player from './Player';
import Alien from './Alien';
import StartScreen from './ui/StartScreen';
import EndScreen from './ui/EndScreen';
import './ui/Ui.css';
import './Game.css';
import './keyframes.css';

const KEY = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    A: 65,
    D: 68,
    W: 87,
    SPACE: 32
};

class Game extends Component {
    constructor() {
        super();
        this.laserPositions = [];
        this.ulPos = [];
        this.aliens = [];
        this.state = {
            context: null,
            currentScore: 0,
            topScore: localStorage['topscore'] || 0,
            inGame: false,
            fuse: false,
            animate: 0,
            difficult: 0,
            steps: 0,
            nextRow: 5,
            animateDir: 'right',
            alienLaserFuse: false,
            screen: 'start',
            keys: {
                left: 0,
                right: 0,
                up: 0,
                down: 0,
                space: 0,
            },
            user: {
                pos: {
                    x: 135,
                    padding: 20
                },
                explode: false,
                show: false,
                width: 40,
                height: 40
            },
            laser: {
                width: 5,
                height: 10,
                speed: 2,
                alienWidth: 5,
                alienHeight: 10,
                alienSpeed: 2
            },
            settings: {
                sensitivity: 10,
                animateDelay: 50,
                width: 800,
                height: 600
            },
            alien: {
                startPos: {
                    left: 150,
                    top: 50
                },
                movement: {
                    side: 10,
                    down: 40,
                    left: 20,
                    right: 20
                },
                width: 40,
                height: 40,
                padding: 5,
                row: 11,
                column: 5
            }
        }
    }
    componentDidMount() {
        window.addEventListener('keyup', this.handleKeys.bind(this, false));
        window.addEventListener('keydown', this.handleKeys.bind(this, true));
        window.addEventListener('mousedown', this.handleKeys.bind(this, false));
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.handleKeys);
        window.removeEventListener('keydown', this.handleKeys);
        this.setState({ fuse: true });
    }

    addScore(points) {
        if (this.state.inGame) {
            this.setState({
                currentScore: this.state.currentScore + points,
            });
        }
    }
    gameOver() {
        this.setState({
            inGame: false,
            screen: 'end'
        });

        if (this.state.currentScore > this.state.topScore) {
            this.setState({
                topScore: this.state.currentScore,
            });
            localStorage['topscore'] = this.state.currentScore;
        }
    }

    startGame() {
        const context = this.refs.canvas.getContext('2d');
        this.setState({
            context: context,
            inGame: true,
            currentScore: 0,
            screen: 'game',
            alienLaserFuse: false,
            user: { ...this.state.user, show: true, explode: false }
        });
        this.generateAliens();
        this.animateAliens();
        requestAnimationFrame(() => { this.update() });
    }

    generateAliens() {
        this.aliens = [];
        const row = this.state.alien.row;
        const col = this.state.alien.column;
        const noOfAliens = row * col;
        const width = this.state.alien.width;
        const height = this.state.alien.height;
        const padding = this.state.alien.padding;
        const getColMultiplier = (i) => {
            const hp = height + padding;
            const rowPlier = Math.floor(i / row);
            let result = hp * rowPlier;
            return result + this.state.alien.startPos.top
        };
        let createArr = Array.from({ length: noOfAliens }, (v, i) => i);
        let alienObjs = createArr.map((item, index) => {
            let itemObj = {
                index: noOfAliens - index,
                left: ((width + padding) * (index % row)) + this.state.alien.startPos.left,
                top: getColMultiplier(index),
                col: col,
                start: this.state.alien.startPos.left,
                row: Math.floor(index / row) + 1,
                dir: 'right',
                explode: false
            }
            return itemObj;
        })
        this.aliens = alienObjs;
    }
    animateAliens() {
        let newDir = this.state.animateDir;
        let newDiff = this.state.difficult;
        let newSteps = this.state.steps;
        let nextRow = this.state.nextRow;

        const movement = this.state.alien.movement;
        const alienWidth = this.state.alien.width + this.state.alien.padding;
        const maxLeft = this.state.settings.width - (this.state.alien.movement.right);
        const maxTop = this.state.settings.height - (this.state.alien.width + this.state.alien.padding);
        const minLeft = this.state.alien.movement.left;

        this.aliens.map((item, i, a) => {
            if (i === 0) {
                if (item.left + (alienWidth * this.state.alien.row) >= maxLeft && newDir === 'right') {
                    newDir = 'down';
                    newSteps++;
                } else if (item.left - movement.side <= minLeft && newDir === 'left') {
                    newDir = 'down';
                    newSteps++;
                } else if (newDir === 'down') {
                    if (newDiff % this.state.alien.column === this.state.alien.column - 1) {
                        if (a[a.length - 1].top >= maxTop) {
                            this.gameOver();
                            newDir = 'end';
                        } else if (newSteps % 2 === 1) {
                            newDir = 'left';
                        } else {
                            newDir = 'right';
                        }
                        newDiff = 0;
                    } else {
                        newDiff++;
                    }
                }
                this.setState({
                    animateDir: newDir,
                    difficult: newDiff,
                    steps: newSteps,
                })
            }
            if (this.checkPLayerCollision(item)) {
                newDir = 'end';
            } else if (item.row === nextRow) {
                if (newDir === 'right') {
                    item.left += movement.side;
                } else if (newDir === 'down') {
                    item.top += movement.down;
                } else if (newDir === 'left') {
                    item.left -= movement.side;
                }
            }
            return item;
        });
        nextRow = nextRow - 1 < 1 ? 5 : nextRow - 1;
        this.setState({
            animate: this.state.animate++,
            nextRow: nextRow,
            animateDir: newDir
        });
        setTimeout(() => {
            if (this.state.inGame) {
                this.animateAliens();
            }
        }, this.state.settings.animateDelay)
    }
    playerExplode() {
        this.setState({
            user: { ...this.state.user, explode: true }
        })

        setTimeout(() => {
            this.setState({
                user: { ...this.state.user, show: false }
            })
            this.gameOver();
        }, 150)

    }
    checkPLayerCollision(item) {
        let uXLeft = this.state.user.pos.x;
        let uXRight = uXLeft + this.state.user.width;
        let uYTop = this.state.settings.height - (this.state.user.height + this.state.user.pos.padding);
        if (item.left >= uXLeft && item.left <= uXRight) {
            if (item.top + this.state.alien.height >= uYTop) {
                this.playerExplode();
                return true;
            }
        }
        return false;
    }

    handleKeys(value, e) {
        let keys = this.state.keys;
        let fuse = this.state.fuse;
        if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
        if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
        if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
        if (e.keyCode === KEY.SPACE) keys.space = value;
        if (keys.left && this.state.inGame) {
            this.playerPos('left')
        }
        if (keys.right && this.state.inGame) {
            this.playerPos('right');
        }
        if (keys.space && this.state.inGame) {
            if (!fuse) {
                fuse = true;
                this.shoot();
            }
        }
        this.setState({
            keys: keys,
            fuse: fuse
        });
        if(e.type === 'mousedown'){ 
            if( this.state.screen === 'start' ||
            this.state.screen === 'end'){
                this.setState({screen: 'game'});
                this.startGame();
            }
        }
    }
    removeAlien(index) {
        this.aliens[index].explode = true;
        setTimeout(() => {
            this.aliens.splice(index, 1);
            this.setState({
                fuse: false
            });
        }, 100)

    }
    addPoints(row) {
        
        let oldScore = this.state.currentScore;
        oldScore += 1000 * Math.abs(row -(this.state.alien.column + 1));
        this.setState({
            currentScore: oldScore
        })
    }

    unidentifiedLaserBeams() {
        let randomRow = Math.floor(Math.random() * this.state.alien.row);
        let randomAlien = this.aliens.filter((item, i, a) => {
            return item.index % this.state.alien.row === randomRow;
        });

        if (randomAlien.length > 0) {
            randomAlien = randomAlien.reduce((prev, curr) => {
                return prev.index < curr.index ? prev : curr;
            });
        } else {

            this.unidentifiedLaserBeams();
        }

        let posX = randomAlien.left + (this.state.alien.width / 2);
        let posY = randomAlien.top + this.state.alien.height + this.state.alien.padding;
        this.ulPos.push({ x: posX, y: posY });

    }
    checkCollision(shot, index) {

        if (shot.y < 0) {
            this.setState({ fuse: false });
            return false;
        }

        let hitAliens = this.aliens.filter((alien, index) => {
            if (shot.y - this.state.laser.height <= alien.top + this.state.alien.height &&
                shot.y - this.state.laser.height >= alien.top &&
                shot.x >= alien.left && shot.x <= alien.left + this.state.alien.width) {

                this.removeAlien(index);
                this.addPoints(alien.row);
                return true;

            }
            return false;
        });
        return hitAliens.length > 0 ? false : true;
    }
    playerCollision(shot, index) {
        if (shot.y > this.state.settings.height) {
            this.setState({ alienLaserFuse: false });
            return false;
        }

        let uXLeft = this.state.user.pos.x;
        let uXRight = uXLeft + this.state.user.width;
        let uYTop = this.state.settings.height - (this.state.user.height + this.state.user.pos.padding);

        if (shot.x >= uXLeft && shot.x <= uXRight) {
            if (shot.y - this.state.laser.alienHeight >= uYTop) {
                this.playerExplode();
                return false;
            }
        }

        return true;
    }
    update() {
        const context = this.state.context;

        context.clearRect(0, 0, this.state.settings.width, this.state.settings.height)
        context.fillStyle = '#0f0';

        let newArray = this.laserPositions.map(beam => {
            let newY = beam.y - this.state.laser.speed;
            let cx = beam.x - (this.state.laser.width / 2);
            let cy = newY - this.state.laser.height;
            context.fillRect(cx, cy, this.state.laser.width, this.state.laser.height);
            return { x: beam.x, y: newY };
        }).filter(this.checkCollision.bind(this));

        this.laserPositions = newArray;

        context.fillStyle = '#f00';
        if (!this.state.alienLaserFuse) {
            this.setState({
                alienLaserFuse: true,
            })
            this.unidentifiedLaserBeams();
        }

        let newAlienArray = this.ulPos.map(beam => {
            let newY = beam.y + this.state.laser.alienSpeed;
            let cx = beam.x - (this.state.laser.alienWidth / 2);
            let cy = newY - this.state.laser.alienHeight;
            context.fillRect(cx, cy, this.state.laser.alienWidth, this.state.laser.alienHeight);
            return { x: beam.x, y: newY };
        }).filter(this.playerCollision.bind(this));

        this.ulPos = newAlienArray;

        if (this.state.inGame) {
            requestAnimationFrame(() => { this.update() });
        } else {
            this.laserPositions = [{x: 0, y: 0}];
            context.clearRect(0, 0, this.state.settings.width, this.state.settings.height)
        }
    }
    playerPos(dir) {
        let user = this.state.user;
        if (dir === 'left') {
            user.pos.x -= this.state.settings.sensitivity;
        } else {
            user.pos.x += this.state.settings.sensitivity;
        }
        let windowWidth = this.state.settings.width - this.state.user.width;
        user.pos.x = user.pos.x < 0 ? 0 : user.pos.x > windowWidth ? windowWidth : user.pos.x;

    }
    shoot() {
        let posX = this.state.user.pos.x + (this.state.user.width / 2);
        let posY = this.state.settings.height - (this.state.user.height + this.state.user.pos.padding);
        this.laserPositions.push({ x: posX, y: posY });
    }

    render() {
        let styles = {
            width: this.state.settings.width,
            height: this.state.settings.height
        }

        return (
            <div className="App--Game"
                style={styles}>
                <span className="App--Game-TopScore App--Game-Gui"><p>hi-score: {this.state.topScore}</p></span>
                <span className="App--Game-CurrScore App--Game-Gui"><p>score: {this.state.currentScore}</p></span>
                <canvas className="App--Canvas" ref="canvas"
                    width={this.state.settings.width}
                    height={this.state.settings.height}
                />
                {this.aliens.map((item, index) =>
                    <Alien
                        key={index}
                        alienIndex={item.index}
                        alienLeft={item.left}
                        alienTop={item.top}
                        alienWidth={this.state.alien.width}
                        alienHeight={this.state.alien.height}
                        explode={item.explode}
                    ></Alien>
                )}
                <Player
                    userShow={this.state.user.show}
                    userExplode={this.state.user.explode}
                    userLeft={this.state.user.pos.x}
                    userTop={this.state.settings.height - (this.state.user.height + this.state.user.pos.padding)}
                    userWidth={this.state.user.width}
                    userHeight={this.state.user.height}
                ></Player>
                <StartScreen
                    topScore={this.state.topScore}
                    screen={this.state.screen}
                ></StartScreen>
                <EndScreen
                    topScore={this.state.topScore}
                    currScore={this.state.currentScore}
                    screen={this.state.screen}
                ></EndScreen>
            </div>
        );
    }
}

export default Game;
