class Panzer {
    constructor(inputMap, d){

        this.position = {x: 10, y: 10};// координаты для спавна в переменную вместо 1,1
        this.currentDirection = {x: 0, y: 0};
        this.superInputMap = inputMap;
        this.draw = d;
        this.directionChangeIntevalId = null;
        this.arrOfShells = [];
    }


    movePanzer(directionChange){
        this.position.x += directionChange.x ;
        this.position.y += directionChange.y ;
        console.log(this.position);
        
    }
    // rotatePanzer(keyCode){
    //     console.log(keyCode);
        
    // }
    changeDirectionOfPanzer(keyCode){
        var directionMap = {
            up : { x: 0, y: -1},
            down: { x: 0, y: 1},
            right: { x: 1, y: 0},
            left: { x: -1, y: 0}
        }   
        let directionChange = directionMap[this.superInputMap[keyCode]]
        
        if(!directionChange){
            return null
        }
        if (directionChange.x == this.currentDirection.x && directionChange.y == this.currentDirection.y){
            this.stopChangeDirection()
            this.directionChangeIntevalId = setInterval(()=>{
            this.movePanzer(directionChange);   
            this.draw.drawField(Math.atan2(directionChange.y, directionChange.x))

        }, 1000/60);

        }else if(directionChange.x != this.currentDirection.x || directionChange.y != this.currentDirection.y){
            // this.rotatePanzer(keyCode)
            this.draw.drawField(Math.atan2(directionChange.y, directionChange.x))
            this.currentDirection = directionChange;   
        }
        
        
    }
    stopChangeDirection(){
        clearInterval(this.directionChangeIntevalId);
    }

    createAmmo(){
        const shell = new Shell (this.position, this.currentDirection, this.draw)
        this.arrOfShells.push(shell)
        //console.log(111);

    }

    shooting(keyCode){
        if(keyCode == 87){
            this.createAmmo()
        }
    }
    
}


class Shell {
    constructor(p, c, d){
        this.position = p
        this.currentDirection = c;
        this.draw = d;
     
        this.shellCoords = {x: 0, y: 0};
        this.createShell()
    }
    createShell(){
        this.shellCoords.x = this.position.x + 67*this.currentDirection.x;  /// + длина дула, повернутая на atan2 направления + 64*Math.atan2(this.currentDirection.y, this.currentDirection.x)
        this.shellCoords.y = this.position.y + 67*this.currentDirection.y;
        console.log(this.shellCoords);
        
        
    }


}
// class Field {
//     constructor(){
//         this.arrOfBlocks = [];
//     }
//     createMetallBlocks(){

//     }
//     createBricksBlocks(){

//     }
// }


class Game {
    constructor(){
        this.draw = new Drawing();
        this.gameControl();
        this.intervalId = null;
        this.arrOfPanzers = [];
        this.timer = 200;
        this.superInputMap = [
            {
                38 : 'up',
                40 : 'down',
                39 : 'right',
                37 : 'left'
            },
            {
                87 : 'up',
                83 : 'down',
                68 : 'right',
                65 : 'left'
            }
        ]
    }

    createPanzers(){
        const panz = new Panzer(this.superInputMap[0], this.draw);
        //const panz1 = new Panzer(this.draw.fieldWidth, this.draw.fieldHeight, this.superInputMap[1]);
        this.arrOfPanzers.push(panz);
        //this.arrOfPanzers.push(panz1);
        //console.log(this.arrOfPanzers);
        
    }
    panzerControl(){
        document.addEventListener('keydown', (e)=> {
            for(let i = 0; i < this.arrOfPanzers.length; i++){
                this.arrOfPanzers[i].changeDirectionOfPanzer(e.keyCode);
                this.arrOfPanzers[i].shooting(e.keyCode)
            }
        })
        document.addEventListener('keyup', (e)=>{
            for(let i = 0; i < this.arrOfPanzers.length; i++){
                this.arrOfPanzers[i].stopChangeDirection()
            }    
        })
    }
    stopGame(){
        this.arrOfPanzers = [];

    }
    startGame(){
        this.stopGame();
        this.createPanzers();
        this.panzerControl();
        this.draw.drawField()
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

    }
}


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
    drawField(angle){
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
                this.ctx.rotate(angle); //angle
                this.ctx.translate( -panzerPosition.position.x, -panzerPosition.position.y);
                this.ctx.drawImage(img, panzerPosition.position.x - dx, panzerPosition.position.y - dy);
                //console.log('img loaded');
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(panzerPosition.position.x, panzerPosition.position.y, 10, 10)
                this.ctx.restore();
            })
            
            for(let j = 0; j < panzerPosition.arrOfShells.length; j++){
                let shellPositions = panzerPosition.arrOfShells[j];
                this.ctx.fillStyle = 'black';
                
                this.ctx.fillRect(shellPositions.shellCoords.x, shellPositions.shellCoords.y, 5, 5)
            }
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
const game = new Game();
// const draw = new Drawing(game);


