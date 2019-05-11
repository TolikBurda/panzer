class Panzer {
    constructor(w, h, inputMap, g){

        this.position = {x: 10, y: 1};// координаты для спавна в переменную вместо 1,1
        this.currentDirection = {x: 0, y: 0};
        this.fieldWidth = w;
        this.fieldHeight = h;
        this.superInputMap = inputMap;
        this.draw = g;
        this.directionChangeIntevalId = null;
    }


    movePanzer(directionChange){
        this.position.x += directionChange.x ;

        this.position.y += directionChange.y ;
        console.log(this.position.x, this.position.y);
        
    }

    //если новое направление == старому, то двигаемся, если не равно - поворот
    changeDirectionOfPanzer(keyCode){
        var directionMap = {
            up : { x: 0, y: -1},
            down: { x: 0, y: 1},
            right: { x: 1, y: 0},
            left: { x: -1, y: 0}
        }   
        let directionChange = directionMap[this.superInputMap[keyCode]]
        
        
        this.stopChangeDirection()
        this.directionChangeIntevalId = setInterval(()=>{
            this.movePanzer(directionChange);   
            this.draw.drawField(this)

        }, 1000/60);
    }
    stopChangeDirection(){
        clearInterval(this.directionChangeIntevalId);
    }

    createAmmo(){
        //пихнуть его куда-то где тусуют все снаряды 
        //но лучше создавать тут экземпляры класса shell 
    }

    shooting(keyCode){
        if(keyCode == 99){
            createAmmo()
        }
    }
    
}
//const panzer = new Panzer()

class Shell {
    constructor(){
        this.shellCoords = {x: 0, y: 0};
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
        this.fieldWidth = 40;
        this.fieldHeight = 40;
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
        this.createPanzers()
        this.panzerControl()
    }

    createPanzers(){
        const panz = new Panzer(this.fieldWidth, this.fieldHeight, this.superInputMap[0], this.draw);
        //const panz1 = new Panzer(this.draw.fieldWidth, this.draw.fieldHeight, this.superInputMap[1]);
        this.arrOfPanzers.push(panz);
        //this.arrOfPanzers.push(panz1);
        console.log(this.arrOfPanzers);
        
    }
    panzerControl(){
        document.addEventListener('keydown', (e)=> {
            for(let i = 0; i < this.arrOfPanzers.length; i++){
                this.arrOfPanzers[i].changeDirectionOfPanzer(e.keyCode);
                //this.arrOfPanzers[i].shooting(e.keyCode)
            }
        })
        document.addEventListener('keyup', (e)=>{
            for(let i = 0; i < this.arrOfPanzers.length; i++){
                this.arrOfPanzers[i].stopChangeDirection()
            }    
        })
    }
    stopGame(){


    }
    startGame(){
        this.stopGame();
        this.createPanzers();
        this.panzerControl();
        this.draw.drawField(this)
    }
    gameControl(){
        this.draw.startButton.addEventListener('click', ()=>{                        ///()=>
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
        this.fieldWidth = 40;
        this.fieldHeight = 40;
        this.cellSize = 10;
        this.scale = this.cellSize * 3;

        this.canvas.width = (this.fieldWidth + 1)*this.cellSize;
        this.canvas.height = (this.fieldHeight + 1)*this.cellSize;
        //this.drawField()
        
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
        console.log(2);
    }
  
    drawField(){
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const img = new Image();
        img.src = "hui.png";
        
        
        for(let j = 0; j < game.arrOfPanzers.length; j++){
            let panzerPosition = game.arrOfPanzers[j]
            img.addEventListener('load', ()=>{
                // let dx = 64;
                // let dy = 64;
                // this.ctx.save();
                // this.ctx.translate(dx, dy);
                // this.ctx.rotate(30 * (Math.PI/180));
                // this.ctx.translate(-dx, -dy);
                // this.ctx.rotate(5 * (Math.PI/180));
                this.ctx.drawImage(img, panzerPosition.position.x, panzerPosition.position.y, this.scale, this.scale);// передать сюда координаты 
                console.log('img loaded');
                this.ctx.restore();
            })
        }
        

        // const img = new Image();
        // img.src = "hui.png";
        
        
        // img.addEventListener('load', ()=>{
        //     this.ctx.drawImage(img, this.panzer.x, this.panzer.y, this.scale, this.scale);// передать сюда координаты 
        //     console.log('img loaded');
            
        // })

        this.ctx.strokeStyle = 'blue';
        this.ctx.strokeRect(0, 0, (this.fieldWidth + 1)*this.cellSize, (this.fieldHeight + 1)*this.cellSize);
        console.log(1);



        // this.ctx.fillStyle = 'magenta';
        // this.ctx.fillRect(this.panzer.x*this.cellSize, this.panzer.y*this.cellSize, this.cellSize*2, this.cellSize*2);
        
    }
}
// class ResourceLoder{
//     constructor(){

//     }

// }
const game = new Game();
// const draw = new Drawing(game);


