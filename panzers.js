class Panzer {
    constructor(inputMap, pubsub, x, y, type){
        this.pubsub = pubsub;
        this.position = {x: x, y: y};
        this.type = type;
        this.currentDirection = {x: 0, y: 0};
        this.superInputMap = inputMap;
        this.speed = 10;
    }
    movePanzer() {
        this.position.x += this.currentDirection.x;
        this.position.y += this.currentDirection.y;
    }
    stopDirectionChange() {
        this.position.x -= this.currentDirection.x;
        this.position.y -= this.currentDirection.y;
    }
    changeDirectionOfPanzer(keyCode) {
        var directionMap = {
            up : { x: 0, y: -1},
            down: { x: 0, y: 1},
            right: { x: 1, y: 0},
            left: { x: -1, y: 0}
        }   
        if(this.superInputMap[keyCode] == 'shot') {
            this.shooting();
        }
        let directionChange = directionMap[this.superInputMap[keyCode]];
        
        if(!directionChange) {
            return null;
        }
        if (directionChange.x == this.currentDirection.x && directionChange.y == this.currentDirection.y) {
            this.currentDirection = directionChange;
            this.movePanzer();
        }else if(directionChange.x != this.currentDirection.x || directionChange.y != this.currentDirection.y) {
            this.currentDirection = directionChange;   
        } 
    }
    shooting() {
        let offsetPosition = {
            x : this.position.x + this.speed*this.currentDirection.x,
            y : this.position.y + this.speed*this.currentDirection.y
        }
        this.pubsub.fireEvent('shot', {position: offsetPosition, direction: this.currentDirection});
    }
}

class Shell {
    constructor(coords) {
        this.currentDirection = coords.direction;
        this.coords = coords.position;
        this.shellSpeed = 5;
        this.update(); 
    }
    update() {
        this.coords.x += this.shellSpeed * this.currentDirection.x;
        this.coords.y += this.shellSpeed * this.currentDirection.y; 
        // console.log('shell position:', Math.ceil(this.coords.x/20), Math.ceil(this.coords.y/20));
        // console.log('shell position:', this.coords.x/20, this.coords.y/20);
    }
}

class Block {
    constructor(x, y, type) { 
        this.coords = {
            x: x,
            y: y
        };
        this.type = type;
    }
}

class Game {
    constructor() {
        this.pubsub = new PubSub();
        this.resourceLoader = new ResourceLoader();
        this.initialize();
        this.draw = new Drawing();
        this.intervalId = null;
        this.arrOfPanzers = [];
        this.arrOfShells = [];
        this.arrOfBlocks = [];
        this.timer = 50;
        this.arrOfField = null;
        this.pressedKeys = {
            38 : false,
            40 : false,
            39 : false,
            37 : false,
            80 : false,
            87 : false,
            83 : false,
            68 : false,
            65 : false,
            79 : false
        }
        this.superInputMap = [
            {
                38 : 'up',
                40 : 'down',
                39 : 'right',
                37 : 'left',
                191 : 'shot'
            },
            {
                87 : 'up',
                83 : 'down',
                68 : 'right',
                65 : 'left',
                81 : 'shot'
            }
        ]
    }

    initialize() {
        this.pubsub.subscribe('shot', this, this.createShells);
        
        this.resourceLoader.loadAllImages()
            .then(()=>{
                var t = fetch('level_1.json');
                return t.then(res => {
                    return res.json();
                }).then(data => {
                    console.log(data);
                    this.arrOfField = data.block;
                })
            })
            .then(() => {
                this.gameControl() })
            .catch(error => console.error(error));     
    }

    createField() {
        for(let i = 0; i < this.arrOfField.length; i++) {
            let column = this.arrOfField[i];
            for(let j = 0; j < column.length; j++) {
                let fieldCell = column[j];
                console.log('x ' + [j], 'y '+[i], 'typeOfCell ' + fieldCell);
                let x = [j+0.5];
                let y = [i+0.5];
                switch(fieldCell) {
                    // case 0 : break;
                    case 1 : this.createBlocks(x * this.draw.cellSize, y * this.draw.cellSize, fieldCell);
                        break;
                    case 2 : this.createBlocks(x * this.draw.cellSize, y * this.draw.cellSize, fieldCell);
                        break;
                    case 3 : this.createPanzers(this.superInputMap[0], x * this.draw.cellSize, y * this.draw.cellSize, fieldCell);
                        break;
                    case 4 : this.createPanzers(this.superInputMap[1], x * this.draw.cellSize, y * this.draw.cellSize, fieldCell);
                        break;
                }
            }
        }
    }
    createBlocks(x, y, type){
        let block = new Block(x, y, type);
        this.arrOfBlocks.push(block);
    }

    createPanzers(inputMap, x, y, type){
        const panz = new Panzer(inputMap, this.pubsub, x, y, type);
        this.arrOfPanzers.push(panz); 
    }

    createShells(data){
        if(data){
            const shell = new Shell(data);
            this.arrOfShells.push(shell);
            console.log(this.arrOfShells.length);
        }
    }

    clearArrOfShells(shellToDel){
        this.arrOfShells.splice(shellToDel, 1);
    }
    clearArrOfBlocks(blockToDel){
        this.arrOfBlocks.splice(blockToDel, 1);
    }
    clearArrOfPanzers(panzerToDel){
        this.arrOfPanzers.splice(panzerToDel, 1);
    }
    
    checkShellCollision(){//////////////////////////////
        // console.time('test')
        for(let i = 0; i < this.arrOfShells.length; i++){
            let shell = this.arrOfShells[i];
            let shellCoord = shell.coords;
            let cellSize = this.draw.cellSize;
            for(let k = 0; k < this.arrOfPanzers.length; k++){
                let panzerPosition = this.arrOfPanzers[k];
                let panzerCoord = panzerPosition.position;
                let collX = shellCoord.x > (panzerCoord.x - cellSize/2) && shellCoord.x < (panzerCoord.x + cellSize/2);
                let collY = shellCoord.y > (panzerCoord.y - cellSize/2) && shellCoord.y < (panzerCoord.y + cellSize/2);
                if (collX && collY){
                    this.clearArrOfPanzers(k);
                    this.clearArrOfShells(i);
                } 
            }
            for(let k = 0; k < this.arrOfBlocks.length; k++){
                let block = this.arrOfBlocks[k];
                let blockCoord = block.coords;
                let collX = shellCoord.x > (blockCoord.x - cellSize/2) && shellCoord.x < (blockCoord.x + cellSize/2);
                let collY = shellCoord.y > (blockCoord.y - cellSize/2) && shellCoord.y < (blockCoord.y + cellSize/2);
                if (collX && collY){
                    if(block.type == 1){
                        this.clearArrOfShells(i);
                    }else{
                        this.clearArrOfBlocks(k);
                        this.clearArrOfShells(i);
                    }
                }
            }                
        }
        // console.timeEnd('test')
    }

    checkPanzerCollision(){
        for(let i = 0; i < this.arrOfPanzers.length; i++){
            let panzer = this.arrOfPanzers[i];
            let panzerCoord = panzer.position;
            let cellSize = this.draw.cellSize;
            for(let k = 0; k < this.arrOfBlocks.length; k++){
                let block = this.arrOfBlocks[k];
                let blockCoord = block.coords;
                let collX = (blockCoord.x + cellSize/2) > (panzerCoord.x - cellSize/2) && (blockCoord.x - cellSize/2) < (panzerCoord.x + cellSize/2);
                let collY = (blockCoord.y + cellSize/2) > (panzerCoord.y - cellSize/2) && (blockCoord.y - cellSize/2) < (panzerCoord.y + cellSize/2);
                if(collX && collY){
                    panzer.stopDirectionChange();
                }
            }
        }
    }

    panzerControl(){
        document.addEventListener('keydown', (e)=> {
            this.pressedKeys[e.keyCode] = true;
        })

        document.addEventListener('keyup', (e)=> {
            this.pressedKeys[e.keyCode] = false;
        })
    }
    gameControl(){
        this.draw.startButton.addEventListener('click', ()=> {                  
            this.startGame();  
        } );

        this.draw.stopButton.addEventListener('click', ()=> {
            this.stopGame();
        } );
    }

    stopGame() {
        clearInterval(this.intervalId);
        this.arrOfPanzers = [];
        this.arrOfShells = [];
        this.arrOfBlocks = [];
    }
    startGame() {
        this.stopGame();
        this.createField();
        this.panzerControl();
        this.intervalId = setInterval(()=> {        
            this.mainLoop();
        }, this.timer);
    }
    
    mainLoop() { 
        for(let j = 0; j < this.arrOfPanzers.length; j++) {
            let panzer = this.arrOfPanzers[j];    
            for(let keyCode in this.pressedKeys) {
                if(this.pressedKeys[keyCode] == true) {
                    panzer.changeDirectionOfPanzer(keyCode);
                }
            }
        }     
        this.checkPanzerCollision();
        this.newCheckShellCollision();
        for(let i = 0; i < this.arrOfShells.length; i++){
            let shell = this.arrOfShells[i];
            shell.update();
        }
        this.draw.drawField(this); 
    }
}

class Drawing {
    constructor(){
        this.canvas = null;
        this.startButton = null;
        this.stopButton = null;
        this.createHtmlElements();
        this.ctx = this.canvas.getContext('2d');
        this.fieldWidth = 400;
        this.fieldHeight = 400;
        this.cellSize = 20;
        this.offset = {
            x: this.cellSize / 2,
            y: this.cellSize / 2
        }
        
        this.canvas.width = (this.fieldWidth);
        this.canvas.height = (this.fieldHeight); 
    }

    createHtmlElements(){
        let arrOfHtmlElements = [];
        
        let div = document.createElement('div');

        let startGame = document.createElement('input');
        startGame.type = 'button';
        startGame.id = 'start';
        startGame.value = 'start game';
        this.startButton = startGame;

        let endGame = document.createElement('input');
        endGame.type = 'button';
        endGame.id = 'end';
        endGame.value = 'end game';
        this.stopButton = endGame;

        let canv = document.createElement('canvas');
        canv.id = 'canvas';
        canv.style = 'display: block;';
        this.canvas = canv;       
        
        arrOfHtmlElements.push(startGame);
        arrOfHtmlElements.push(endGame);
        arrOfHtmlElements.push(canv);

        for(let n = 0; n < arrOfHtmlElements.length; n++){
            div.appendChild(arrOfHtmlElements[n]);
        }
        document.body.appendChild(div);
    }

    drawField(game) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // this.ctx.moveTo(this.offset.x, this.offset.y)//найти ошибку 

        for(let i = 0; i < game.arrOfPanzers.length; i++) {
            let panzer = game.arrOfPanzers[i];
            let img = game.resourceLoader.imageBox;
            panzer.type == 3? img = img.blueTank : img = img.redTank;
            this.ctx.save();
            this.ctx.translate(panzer.position.x, panzer.position.y);
            this.ctx.rotate(Math.atan2(panzer.currentDirection.y, panzer.currentDirection.x));
            this.ctx.translate( -panzer.position.x, -panzer.position.y);
            this.ctx.drawImage(img, panzer.position.x - this.offset.x, panzer.position.y - this.offset.y, this.cellSize, this.cellSize);
            this.ctx.restore();
        }

        for(let i = 0; i < game.arrOfBlocks.length; i++) {
            let block = game.arrOfBlocks[i];
            let img = game.resourceLoader.imageBox;
            block.type == 1 ? img = img.metal : img = img.stone;
            this.ctx.drawImage(img, block.coords.x - this.offset.x, block.coords.y - this.offset.y, this.cellSize, this.cellSize);
        }

        for(let i = 0; i < game.arrOfShells.length; i++) {
            let shell = game.arrOfShells[i];
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(shell.coords.x, shell.coords.y, 4, 4);
        }

        this.ctx.strokeStyle = 'blue';
        this.ctx.strokeRect(0, 0, this.fieldWidth, this.fieldHeight);
    }

}

class ResourceLoader {
    constructor() {
        this.imageBox = {
            blueTank : null,
            redTank : null,
            stone : null,
            metal : null
        };
        this.srcOfImageMap = {
            blueTank : 'panz1.png',
            redTank : 'panz2.png',
            stone : 'stone.jpg',
            metal : 'metal.jpg'
        };
    }
    loadImage(url, imageName) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.addEventListener('load', () => resolve(img));
            img.addEventListener('error', () => {
              reject(new Error(`Failed to load image's URL: ${url}`));
            });
            img.src = url;
            console.log(imageName + " loaded");
        });
    }
    loadAllImages(){
        let promises = [];
        for(let imageName in this.srcOfImageMap){
            let src = this.srcOfImageMap[imageName]; 
            const promise = this.loadImage(src, imageName)
                .then((img) => {
                    this.imageBox[imageName] = img
            })
            promises.push(promise);
        }
        return Promise.all(promises);
    }
}

class Subscription {
    constructor(event, obj, method){
        this.event = event;
        this.obj = obj;
        this.method = method;
    }
}

class PubSub {
    constructor() {
        this.subscriptions = [];
    }
    subscribe(event, obj, method) {
        var sub = new Subscription(event, obj, method);
        this.subscriptions.push(sub);
    }
    fireEvent(event, data) {
        for (let i = 0; i < this.subscriptions.length; i++) {
            const sub = this.subscriptions[i];
            if (sub.event == event) {
                sub.method.call(sub.obj, data);
            }
        }
    }
}

const game = new Game();
