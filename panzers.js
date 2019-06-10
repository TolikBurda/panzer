
var t = fetch('level_1.json')
t.then(res => {
    return res.json()
}).then(data => {
    console.log(data);
    
})

class Panzer {
    constructor(inputMap, pubsub, x, y){
        this.pubsub = pubsub;
        this.position = {x: x, y: y};// координаты для спавна в переменную вместо 1,1
        this.currentDirection = {x: 0, y: 0};
        this.superInputMap = inputMap;
    }
    movePanzer(){
        this.position.x += this.currentDirection.x;
        this.position.y += this.currentDirection.y;
    }
    stopDirectionChange(){
        this.position.x -= this.currentDirection.x;
        this.position.y -= this.currentDirection.y;
    }
    changeDirectionOfPanzer(keyCode){
        var directionMap = {
            up : { x: 0, y: -1},
            down: { x: 0, y: 1},
            right: { x: 1, y: 0},
            left: { x: -1, y: 0}
        }   
        if(this.superInputMap[keyCode] == 'shot'){
            this.shooting();
        }
        let directionChange = directionMap[this.superInputMap[keyCode]];
        
        if(!directionChange){
            return null;
        }
        if (directionChange.x == this.currentDirection.x && directionChange.y == this.currentDirection.y){
            this.currentDirection = directionChange;
            this.movePanzer();
        }else if(directionChange.x != this.currentDirection.x || directionChange.y != this.currentDirection.y){
            this.currentDirection = directionChange;   
        } 
    }
    shooting(){
        let offsetPosition = {
            x : this.position.x + 10*this.currentDirection.x,
            y : this.position.y + 10*this.currentDirection.y
        }
        this.pubsub.fireEvent('shot', {position: offsetPosition, direction: this.currentDirection})
    }
}

class Shell {
    constructor(coords){
        this.currentDirection = coords.direction;
        this.coords = coords.position;
        this.shellSpeed = 10;
        this.createShell(); 
    }
    createShell(){
        console.log(this.coords.x, this.coords.y);
        this.update()  
    }
    update(){
        this.coords.x += this.shellSpeed*this.currentDirection.x;
        this.coords.y += this.shellSpeed*this.currentDirection.y; 
        console.log('shell position:', this.coords, );
    }
}

class Block {
    constructor(x, y, type){  ///(x,y)
        // this.coords = {
        //     x: 50,
        //     y: 50}
        this.coords = {
            x: x,
            y: y
        };
        this.type = type;
    }
}
// class SubField extends Field {
// }

class Game {
    constructor(pubsub){
        this.pubsub = pubsub;
        this.pubsub.subscribe('shot', this, this.createShells);
        this.resourceLoader = new ResourceLoader(); 
        this.loadAllImages();
        this.draw = new Drawing();
        this.intervalId = null;
        this.arrOfPanzers = [];
        this.arrOfShells = [];
        this.arrOfBlocks = [];
        this.timer = 100;
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
                80 : 'shot'
            },
            {
                87 : 'up',
                83 : 'down',
                68 : 'right',
                65 : 'left',
                79 : 'shot'
            }
        ]
        this.imageBox = {
            blueTank : null,
            redTank : null,
            stone : null,
            metal : null
        };
    }
    loadAllImages(){
        let promises = [];
        for(let imageName in this.resourceLoader.srcOfImageMap){
            let src = this.resourceLoader.srcOfImageMap[imageName]; 
            const promise = this.resourceLoader.loadImage(src, imageName)
                .then((img) => {
                    this.imageBox[imageName] = img
            })
            promises.push(promise);
        }
        let promiseAll = Promise.all(promises);
            
        promiseAll
            .then(()=>{
                console.log('everything loaded');
                this.gameControl();
            })
            .catch(error => console.error(error));
    }
    createPanzers(){
        for(let i = 0; i < 2; i++){
            let x = Math.round(Math.random() * this.draw.fieldWidth);
            let y = Math.round(Math.random() * this.draw.fieldHeight);
            const panz = new Panzer(this.superInputMap[i], this.pubsub, x, y);
            this.arrOfPanzers.push(panz);            
        }
    }
    createBlocks(){
        for(let i = 0; i < 2; i++){
            let x = Math.round(Math.random() * this.draw.fieldWidth);
            let y = Math.round(Math.random() * this.draw.fieldHeight);
            const block = new Block(x, y, 0);
            this.arrOfBlocks.push(block);
            console.log(this.arrOfBlocks[i].coords);   
        }
    }
    checkMethod(){
        for(let i = 0; i < this.draw.fieldWidth; i += this.draw.cellSize){
            let x = i;
            let y = 1;
            console.log(x);
            const block = new Block(x + this.draw.cellSize/2, y + this.draw.cellSize/2, 1);
            this.arrOfBlocks.push(block);
        }
        const block1 = new Block(10*this.draw.cellSize, 12*this.draw.cellSize, 0);
        this.arrOfBlocks.push(block1);
        console.log(this.arrOfBlocks.length);
        
    }
    createShells(data){
        if(data){
            const shell = new Shell(data);
            this.arrOfShells.push(shell);
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

    checkShellCollision(){
        for(let i = 0; i < this.arrOfShells.length; i++){
            let shellPositions = this.arrOfShells[i];
            let shellCoord = shellPositions.coords;
            let cellSize = this.draw.cellSize;
            for(let k = 0; k < this.arrOfPanzers.length; k++){
                let panzerPosition = this.arrOfPanzers[k];
                let panzerCoord = panzerPosition.position;
                let collX = shellCoord.x > (panzerCoord.x - cellSize/2) && shellCoord.x < (panzerCoord.x + cellSize/2);
                let collY = shellCoord.y > (panzerCoord.y - cellSize/2) && shellCoord.y < (panzerCoord.y + cellSize/2);
                if (collX && collY){
                    console.log('POPAL V TANK!!!');
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
                        console.log('POPAL V BLOCK!!!');
                        this.clearArrOfShells(i);
                    }else{
                        console.log('POPAL V BLOCK!!!');
                        this.clearArrOfBlocks(k);
                        this.clearArrOfShells(i);
                    }
                }
            }                
        }
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
                    console.log('VREZALSA!!!');
                }
            }
        }
    }
    checkPanzerTailCollision(){

        // for(let i = 0; i < this.arrOfShells.length; i++){
        //     let shell = this.arrOfShells[i];  ///забил хуй, решил не писать проверку на вылет, а огородить все поле блоками и писать проверку только на столкновение с танком/блоком
        // }
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
        this.draw.startButton.addEventListener('click', ()=>{                  
            this.startGame();  
        } );

        this.draw.stopButton.addEventListener('click', ()=>{
            this.stopGame();
        } );
    }
    stopGame(){
        clearInterval(this.intervalId);
        this.arrOfPanzers = [];
        this.arrOfShells = [];
        this.arrOfBlocks = [];
    }



    startGame(){
        this.stopGame();
        this.checkMethod();
        //this.createBlocks();
        this.createPanzers();
        this.panzerControl();
        this.intervalId = setInterval(()=> {        
            this.mainLoop()
        }, this.timer);
    }
    
    mainLoop(){ 
        for(let j = 0; j < this.arrOfPanzers.length; j++){
            let panzer = this.arrOfPanzers[j];    
            for(let keyCode in this.pressedKeys){
                if(this.pressedKeys[keyCode] == true){
                    panzer.changeDirectionOfPanzer(keyCode);
                }
            }
        }     
        this.checkPanzerCollision()
        this.checkShellCollision();
        //this.checkBordersCollision();         не подключено        
        for(let i = 0; i < this.arrOfShells.length; i++){
            let shell = this.arrOfShells[i];
            shell.update();
            console.log('shells in arr', this.arrOfShells.length);
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
            div.appendChild(arrOfHtmlElements[n])
        }
        document.body.appendChild(div);
    }

    drawField(game){
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for(let i = 0; i < game.arrOfPanzers.length; i++){
            let panzerPosition = game.arrOfPanzers[i];
            let img = game.imageBox.redTank;
            this.ctx.save();
            this.ctx.translate(panzerPosition.position.x, panzerPosition.position.y);
            this.ctx.rotate(Math.atan2(panzerPosition.currentDirection.y, panzerPosition.currentDirection.x));
            this.ctx.translate( -panzerPosition.position.x, -panzerPosition.position.y);
            this.ctx.drawImage(img, panzerPosition.position.x - this.cellSize/2, panzerPosition.position.y - this.cellSize/2, this.cellSize, this.cellSize);
            this.ctx.restore();
        }

        for(let i = 0; i < game.arrOfBlocks.length; i++){
            let block = game.arrOfBlocks[i];
            if(block.type == 1){
                let img = game.imageBox.metal;
            this.ctx.drawImage(img, block.coords.x - this.cellSize/2, block.coords.y - this.cellSize/2, this.cellSize, this.cellSize);
            }else{
                let img = game.imageBox.stone;
                this.ctx.drawImage(img, block.coords.x - this.cellSize/2, block.coords.y - this.cellSize/2, this.cellSize, this.cellSize);
            }
        }

        for(let i = 0; i < game.arrOfShells.length; i++){
            let shellPositions = game.arrOfShells[i];
            this.ctx.fillStyle = 'black';
            
            this.ctx.fillRect(shellPositions.coords.x, shellPositions.coords.y, 5, 5)
        }

        this.ctx.strokeStyle = 'blue';
        this.ctx.strokeRect(0, 0, this.fieldWidth, this.fieldHeight);
    }

}

class ResourceLoader{
    constructor(){
        this.srcOfImageMap = {
            blueTank : 'panz1.png',
            redTank : 'panz2.png',
            stone : 'stone.jpg',
            metal : 'metal.jpg'
        };
    }
    loadImage(url, imageName){
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
}

class Subscription {
    constructor(event, obj, method){
        this.event = event;
        this.obj = obj;
        this.method = method;
    }
}

class PubSub {
    constructor(){
        this.subscriptions = []
    }
    subscribe(event, obj, method){
        var sub = new Subscription(event, obj, method);
        this.subscriptions.push(sub)
    }
    fireEvent(event, data){
        for (let i = 0; i < this.subscriptions.length; i++) {
            const sub = this.subscriptions[i];
            if (sub.event == event) {
                sub.method.call(sub.obj, data)
            }
        }
    }
}
const pubSubInstance = new PubSub();
const game = new Game(pubSubInstance)
// const initialization = new ResourceLoader();

