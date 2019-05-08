class Panzer {
    constructor(w, h, inputMap){
        this.ammo = {x: 0, y: 0};
        this.panzer = {x: 1, y: 1};
        this.currentDirection = {x: 0, y: 0};
        this.fieldWidth = w;
        this.fieldHeight = h;
        this.superInputMap = inputMap;
        
    }
    createPanzer(){

    }

    movePanzer(){
        this.panzer.x = this.panzer.x + this.currentDirection.x;
        this.panzer.y = this.panzer.y + this.currentDirection.y;
    }

    //если новое направление == старому, то двигаемся, если не равно - то хуй его
    changeDirectionOfPanzer(keyCode){
        var directionMap = {
            up : { x: 0, y: -1},
            down: { x: 0, y: 1},
            right: { x: 1, y: 0},
            left: { x: -1, y: 0}
        }   

    }

    createAmmo(){
        this.ammo.x = this.panzer.x + this.currentDirection.x;
        this.ammo.y = this.panzer.y + this.currentDirection.y;
        //пихнуть его куда-то где тусуют все снаряды 
        //
    }

    shooting(keyCode){
        if(keyCode == 99){
            createAmmo()
        }
    }
    
}
const panzer = new Panzer()

// class Shell {
//     constructor(){

//     }
// }
class Field {
    constructor(){
        this.arrOfBlocks = [];
    }
}


class Game {
    constructor(){
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
    }

    panzerControl(){
        document.addEventListener('keydown', (e)=> {
            for(let i = 0; i < this.arrOfPanzers.length; i++){
                this.arrOfPanzers[i].changeDirectionOfPanzer(e.keyCode);
                this.arrOfPanzers[i].shooting(e.keyCode)
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
        //this.panzer = {x: 3, y: 4};
        this.fieldWidth = 40;
        this.fieldHeight = 40;
        this.cellSize = 10;
        this.canvas.width = (this.fieldWidth + 1)*this.cellSize;
        this.canvas.height = (this.fieldHeight + 1)*this.cellSize;
        this.drawField()
        
    }

    createHtmlElements(){
        console.log(2);
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
    }

    drawField(){
        const img = new Image();
        img.src = "cod4.ico";
        this.ctx.drawImage(img, 5, 5);
        this.ctx.strokeStyle = 'blue';
        this.ctx.strokeRect(0, 0, (this.fieldWidth + 1)*this.cellSize, (this.fieldHeight + 1)*this.cellSize);
        console.log(1);

        this.ctx.fillStyle = 'magenta';
        this.ctx.fillRect(this.panzer.x*this.cellSize, this.panzer.y*this.cellSize, this.cellSize*2, this.cellSize*2);
        
    }
}
const draw = new Drawing();