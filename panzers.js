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
        console.log('panzer position:',this.position);
        
    }
    stopPanzer(){
        this.position.x = this.position.x;
        this.position.y = this.position.y; 
    }

    update(){
        this.position
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
        console.log('shell position:', this.coords, );
    }

}


class Block {
    constructor(x, y){  ///(x,y)
        // this.coords = {
        //     x: 50,
        //     y: 50}
        this.coords = {
            x: x,
            y: y
        };
        this.type = null;
    }
}
// class SubField extends Field {
// }

class Game {
    constructor(pubsub){
        this.pubsub = pubsub; ////Подписываешься на ивент стрельбы в игре/// В танке кидаешь ивент, когда жмёшь кнопку
        this.pubsub.subscribe('shot', this, this.createShells);
        this.resourceLoader = new ResourceLoader();
        this.draw = new Drawing();
        this.gameControl();
        this.intervalId = null;
        this.arrOfPanzers = [];
        this.arrOfShells = [];
        this.arrOfBlocks = [];
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
        for(let i = 0; i < 2; i++){
            let x = Math.round(Math.random() * this.draw.fieldWidth);
            let y = Math.round(Math.random() * this.draw.fieldHeight);
            const panz = new Panzer(this.superInputMap[i], this.pubsub, x, y);
            this.arrOfPanzers.push(panz);
        }
        // const panz1 = new Panzer(this.superInputMap[1], this.pubsub, x, y);
        // this.arrOfPanzers.push(panz1);
    }
    createBlocks(){
        for(let i = 0; i < 2; i++){
            let x = Math.round(Math.random() * this.draw.fieldWidth);
            let y = Math.round(Math.random() * this.draw.fieldHeight);
            const block = new Block(x, y);
            this.arrOfBlocks.push(block);
            console.log(this.arrOfBlocks[i].coords);   
        }
        // const block = new Block();
        // this.arrOfBlocks.push(block);
    }

    createShells(data){
        if(data){
            const shell = new Shell(data);
            this.arrOfShells.push(shell);
            // console.log(this.arrOfShells.length);
        }
    }

    // update(){
    //     for(let i = 0; i < this.arrOfPanzers.length; i++){
    //         const panz = this.arrOfPanzers[i];
    //         panz.update();
    //     }
    // }
    
    checkShellCollision(){
        for(let i = 0; i < this.arrOfShells.length; i++){
            let shellPositions = this.arrOfShells[i];
            
            for(let k = 0; k < this.arrOfPanzers.length; k++){
                let panzerPosition = this.arrOfPanzers[k];
                if(shellPositions.coords.x == panzerPosition.position.x && shellPositions.coords.y == panzerPosition.position.y){
                    console.log('POPAL!!!');
                    
                }
            }
        }
    }

    checkPanzerCollision(){
        for(let i = 0; i < this.arrOfPanzers.length; i++){
            let panzerPosition = this.arrOfPanzers[i];
            for(let k = 0; k < this.arrOfBlocks.length; k++){
                let blockPositions = this.arrOfBlocks[k];
                console.log(blockPositions.coords);
                
                if(panzerPosition.position.x + (panzerPosition.currentDirection.x*this.draw.cellSize) == blockPositions.coords.x && panzerPosition.position.y + (panzerPosition.currentDirection.y*this.draw.cellSize)  == blockPositions.coords.y){
                    
                    console.log('VREZALSA!!!');
                    
                }
            }
        }
    }
    checkBordersCollision(){
        for(let i = 0; i < this.arrOfShells.length; i++){
            let shell = this.arrOfShells[i];  ///забил хуй, решил не писать проверку на вылет, а огородить все поле блоками и писать проверку только на столкновение с танком/блоком
            // if(){
            //     console.log('fffatit');
            //     this.arrOfShells.splice(this.arrOfShells[i], 1); 
            // }
        }
    }

    panzerControl(){
        document.addEventListener('keydown', (e)=> {
            for(let i = 0; i < this.arrOfPanzers.length; i++){
                this.arrOfPanzers[i].changeDirectionOfPanzer(e.keyCode);
            }
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

    checkMethod(){
        // for(let i = 0; i < this.resourceLoader.length; i++){
        //     let one = this.resourceLoader[i]
            
        // }
    }
    startGame(){
        this.stopGame();
        this.createBlocks();
        this.createPanzers();
        ;
        this.panzerControl();
        // this.checkMethod();
        this.intervalId = setInterval(()=> {
            
            this.mainLoop()
            
        }, this.timer);
    }

    

    mainLoop(){ 
        this.checkPanzerCollision()
        this.checkShellCollision();
        //this.checkBordersCollision();         не подключено        
        for(let i = 0; i < this.arrOfShells.length; i++){
            let shell = game.arrOfShells[i];
            shell.update();
            // console.log(this.draw.fieldHeight);
            console.log('shells in arr', this.arrOfShells.length);
        }

        
        for(let j = 0; j < this.arrOfPanzers.length; j++){
            let panzer = this.arrOfPanzers[j];           
            //panzer.movePanzer();
            // panzer.stopPanzer() 
        }
        this.draw.drawField(this); 
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
        this.fieldWidth = 400;
        this.fieldHeight = 400;
        this.cellSize = 20;
        // this.scale = this.cellSize * 3;

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
            for(let k = i; k < game.resourceLoader.arrOfPanzerImage.length; k++){
                let img = game.resourceLoader.arrOfPanzerImage[i];
                this.ctx.save();
                this.ctx.translate(panzerPosition.position.x, panzerPosition.position.y);
                this.ctx.rotate(Math.atan2(panzerPosition.currentDirection.y, panzerPosition.currentDirection.x));
                this.ctx.translate( -panzerPosition.position.x, -panzerPosition.position.y);
                this.ctx.drawImage(img, panzerPosition.position.x - this.cellSize/2, panzerPosition.position.y - this.cellSize/2, this.cellSize, this.cellSize);
                this.ctx.restore();
            }
        }

        for(let i = 0; i < game.arrOfBlocks.length; i++){
            let blockPositions = game.arrOfBlocks[i];
            for(let k = 0; k < game.resourceLoader.arrOfTextureImage.length; k++){
                let img = game.resourceLoader.arrOfTextureImage[1];
                this.ctx.drawImage(img, blockPositions.coords.x -this.cellSize/2, blockPositions.coords.y -this.cellSize/2, this.cellSize, this.cellSize);
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
        this.arrOfPanzerImage = [];
        this.arrOfTextureImage = [];

        this.imgOfPanzer1 = new Image();
        this.imgOfPanzer1.src = "panz1.png";

        this.imgOfPanzer2 = new Image();
        this.imgOfPanzer2.src = "panz2.png";

        this.imgOfStone = new Image();
        this.imgOfStone.src = "stone.jpg";

        this.imgOfMetal = new Image();
        this.imgOfMetal.src = "metal.jpg";

        this.arrOfPanzerImage.push(this.imgOfPanzer1);
        this.arrOfPanzerImage.push(this.imgOfPanzer2);
        this.arrOfTextureImage.push(this.imgOfStone);
        this.arrOfTextureImage.push(this.imgOfMetal);
        this.loader();

    }
    loader(){
        for(let i = 0; i < this.arrOfPanzerImage.length; i++){
            let img = this.arrOfPanzerImage[i];
            img.addEventListener('load', ()=>{
                console.log('иконки танков загружены!');
            })
        }
        for(let i = 0; i < this.arrOfTextureImage.length; i++){
            let img = this.arrOfTextureImage[i];
            img.addEventListener('load', ()=>{
                console.log('иконки текстур загружены!');
            })
        }    
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
const game = new Game(pubSubInstance);
