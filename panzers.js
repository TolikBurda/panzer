class Panzer {
    constructor(w, h, inputMap){

        this.position = {x: 1, y: 1};// координаты для спавна в переменную вместо 1,1
        this.currentDirection = {x: 0, y: 0};
        this.fieldWidth = w;
        this.fieldHeight = h;
        this.superInputMap = inputMap;
        
    }


    movePanzer(){
        this.position.x = this.position.x + this.currentDirection.x;
        this.position.y = this.position.y + this.currentDirection.y;
    }

    //если новое направление == старому, то двигаемся, если не равно - поворот
    changeDirectionOfPanzer(keyCode){
        // var directionMap = {
        //     up : { x: 0, y: -1},
        //     down: { x: 0, y: 1},
        //     right: { x: 1, y: 0},
        //     left: { x: -1, y: 0}
        // }   
        // let directionChange = directionMap[this.superInputMap[keyCode]]

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

// class Shell {
//     constructor(){
//         this.shellCoords = {x: 0, y: 0};
//     }
// }
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
        
        this.arrOfPanzers = [];
        

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
        const panz = new Panzer(this.draw.fieldWidth, this.draw.fieldHeight, this.superInputMap[0]);
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
    }

    mainLoop(){

    }
}


class Drawing {
    constructor(){
        this.canvas = null;
        this.createHtmlElements();
        this.ctx = this.canvas.getContext('2d');
        this.fieldWidth = 40;
        this.fieldHeight = 40;
        this.cellSize = 10;
        this.scale = this.cellSize * 3;

        //this.panzer = {x: 1, y: 1}

        this.canvas.width = (this.fieldWidth + 1)*this.cellSize;
        this.canvas.height = (this.fieldHeight + 1)*this.cellSize;
        // this.drawField()
        
    }

    createHtmlElements(){
        
        let arrOfHtmlElements = [];

        let div = document.createElement('div');
        let canv = document.createElement('canvas');
        canv.id = 'canvas';
        canv.style = 'display: block;';
        this.canvas = canv;       
        
        
        arrOfHtmlElements.push(canv);

        for(let n = 0; n < arrOfHtmlElements.length; n++){
            div.appendChild(arrOfHtmlElements[n])
        }
        document.body.appendChild(div);
        console.log(2);
    }
    // spawnPanzer(){ 
    //     this.panzer.x = Math.round(Math.random() * this.fieldWidth);
    //     this.panzer.y = Math.round(Math.random() * this.fieldHeight);     
    // }
    drawField(game){
        //this.spawnPanzer()
        
        const img = new Image();
        img.src = "hui.png";
        
        console.log(game.arrOfPanzers);
        
        // for(let j = 0; j < game.arrOfPanzers.length; j++){
        //     let panzerPosition = game.arrOfPanzers[j]
        //     img.addEventListener('load', ()=>{
        //         this.ctx.drawImage(img, panzerPosition.position.x, panzerPosition.position.y, this.scale, this.scale);// передать сюда координаты 
        //         console.log('img loaded');
                
        //     })

        // }


        // const img = new Image();
        // img.src = "hui.png";
        
        
        // img.addEventListener('load', ()=>{
        //     this.ctx.drawImage(img, this.panzer.x, this.panzer.y, this.scale, this.scale);// передать сюда координаты 
        //     console.log('img loaded');
            
        // })

        this.ctx.strokeStyle = 'blue';
        this.ctx.strokeRect(0, 0, (this.fieldWidth + 1)*this.cellSize, (this.fieldHeight + 1)*this.cellSize);
        console.log(1);


        // this.ctx.strokeStyle = 'magenta';
        // for(let j = 0; j < game.arrOfPanzers.length; j++){
        //     let panz = game.arrOfPanzers[j]
        //     for(let i = 0; i < panz.segments.length; i++){
        //         this.ctx.strokeRect(panz.segments[i].x*this.cellSize, panz.segments[i].y*this.cellSize, this.cellSize, this.cellSize);
        //     }
        // }


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


