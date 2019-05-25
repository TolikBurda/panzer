class Panzer {
    constructor(inputMap, pubsub){
        this.pubsub = pubsub;
        this.position = {x: 10, y: 10};// координаты для спавна в переменную вместо 1,1
        this.currentDirection = {x: 0, y: 0};
        this.superInputMap = inputMap;
        this.directionChangeIntevalId = null;
    }


    movePanzer(directionChange){
        this.position.x += directionChange.x ;
        this.position.y += directionChange.y ; 
    }

    changeDirectionOfPanzer(keyCode){
        var directionMap = {
            up : { x: 0, y: -1},
            down: { x: 0, y: 1},
            right: { x: 1, y: 0},
            left: { x: -1, y: 0}
        }   
        if(this.superInputMap[keyCode] == 'shot'){
            this.shoting()
        }
        let directionChange = directionMap[this.superInputMap[keyCode]]
        //console.log(this.superInputMap[keyCode]);
        
        if(!directionChange){
            return null
        }
        if (directionChange.x == this.currentDirection.x && directionChange.y == this.currentDirection.y){
            this.movePanzer(directionChange);

        }else if(directionChange.x != this.currentDirection.x || directionChange.y != this.currentDirection.y){
            this.currentDirection = directionChange;   
        }
        
    }

    shoting(){
        let offsetPosition = {
            x : this.position.x + 67*this.currentDirection.x,
            y : this.position.y + 67*this.currentDirection.y
        }
        this.pubsub.fireEvent('shot', {position: offsetPosition, direction: this.currentDirection})
        //this.createShells()80 == p;79 == o
    }
    
}

class Shell {
    constructor(coords){
        this.currentDirection = coords.direction;
        this.coords = coords.position;
        this.createShell();
    }

    createShell(){
        console.log(this.coords.x, this.coords.y);
        this.update()  
    }

    update(){
        this.coords.x += this.currentDirection.x;
        this.coords.y += this.currentDirection.y; 
        
    }

}
// class Field {
//     constructor(){
//         this.arrOfBlocks = [];
//          this.arrOfShells = [];
//          this.arrOfPanzers = [];
//
//     }
//     createMetallBlocks(){
//     }
//     createBricksBlocks(){
//     }
// }
// class SubField extends Field {
// }

class Game {
    constructor(pubsub){
        this.pubsub = pubsub; ////Подписываешься на ивент стрельбы в игре/// В танке кидаешь ивент, когда жмёшь кнопку
        this.pubsub.subscribe('shot', this, this.createShells);
        this.draw = new Drawing();
        this.gameControl();
        this.intervalId = null;
        this.arrOfPanzers = [];
        this.arrOfShells = [];
        this.timer = 100;
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
    }

    createPanzers(){
        const panz = new Panzer(this.superInputMap[0], this.pubsub);
        const panz1 = new Panzer(this.superInputMap[1], this.pubsub);
        this.arrOfPanzers.push(panz);
        this.arrOfPanzers.push(panz1);
    }

    createShells(data){
        if(data){
            const shell = new Shell(data);
            this.arrOfShells.push(shell);
            //console.log(this.arrOfShells.length);
        }
    }

    // update(){
    //     for(let i = 0; i < this.arrOfPanzers.length; i++){
    //         const panz = this.arrOfPanzers[i];
    //         panz.update();
    //     }
    // }

    panzerControl(){
        document.addEventListener('keydown', (e)=> {
            for(let i = 0; i < this.arrOfPanzers.length; i++){
                this.arrOfPanzers[i].changeDirectionOfPanzer(e.keyCode);
            }
        })
    }

    stopGame(){
        clearInterval(this.intervalId);
        this.arrOfPanzers = [];
    }

    startGame(){
        this.stopGame();
        this.createPanzers();
        this.panzerControl();
        //this.draw.drawField()
        this.intervalId = setInterval(()=> {
            this.draw.drawField()
            this.mainLoop()
        }, this.timer);
    }

    gameControl(){
        this.draw.startButton.addEventListener('click', ()=>{                  
            this.startGame();  
        } );

        this.draw.stopButton.addEventListener('click', ()=>{
            this.stopGame();
        } );
    }

    mainLoop(){                   
        // for(let i = 0; i < this.arrOfShells.length; i++){
        //     let shell = game.arrOfShells[i];
        //     shell.update();
        // }
        // for(let j = 0; j < this.arrOfPanzers.length; j++){
        //     let panzer = this.arrOfPanzers[j];
        //     panzer.movePanzer();
        // }

    }
}

//сделать так что бы все переотрисовывалось по таймеру а снаряды еще и двигались в мейнлупе , передать два массива из мейнлупа (танки и снаряды)

class Drawing {
    constructor(){
        this.canvas = null;
        this.startButton = null;
        this.stopButton = null;
        this.createHtmlElements();
        this.ctx = this.canvas.getContext('2d');
        this.fieldWidth = 50;
        this.fieldHeight = 50;
        this.cellSize = 10;
        this.scale = this.cellSize * 3;

        this.canvas.width = (this.fieldWidth + 1)*this.cellSize;
        this.canvas.height = (this.fieldHeight + 1)*this.cellSize; 
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

    // drawShell(){
    // }


    drawField(){  //раньше принимал угол поворота через атан из функции чендждирекшн
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //let a = angle;
        const img = new Image();
        img.src = "hui.png";
        
        
        for(let j = 0; j < game.arrOfPanzers.length; j++){
            let panzerPosition = game.arrOfPanzers[j]
            img.addEventListener('load', ()=>{
                let dx = 64;
                let dy = 64;
                this.ctx.save();
                this.ctx.translate(panzerPosition.position.x, panzerPosition.position.y);
                this.ctx.rotate(Math.PI); //a = angle
                this.ctx.translate( -panzerPosition.position.x, -panzerPosition.position.y);
                this.ctx.drawImage(img, panzerPosition.position.x - dx, panzerPosition.position.y - dy);
                //console.log('img loaded');
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(panzerPosition.position.x, panzerPosition.position.y, 10, 10)
                this.ctx.restore();
            })  
        }
        for(let i = 0; i < game.arrOfShells.length; i++){
            let shellPositions = game.arrOfShells[i];
            this.ctx.fillStyle = 'black';
            
            this.ctx.fillRect(shellPositions.coords.x, shellPositions.coords.y, 5, 5)
        }

        this.ctx.strokeStyle = 'blue';
        this.ctx.strokeRect(0, 0, (this.fieldWidth + 1)*this.cellSize, (this.fieldHeight + 1)*this.cellSize);
        //console.log(1);
    }

}
// class ResourceLoder{
//     constructor(){
//     }
// }

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
const game = new Game(pubSubInstance);
