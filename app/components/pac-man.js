import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {
    x: 50,
    
    y: 100,
    
    score: 0,
    
    levelNumber: 1,
    
    squareSize: 40,
    
    screenWidth: 20,
    
    screenHeight: 15,
    
    ctx: Ember.computed(function(){
        let canvas = document.getElementById('myCanvas');
        let ctx = canvas.getContext('2d');
        return ctx;
    }),
    
    screenPixelWidth: Ember.computed(function(){
        // return this.get('screenWidth') * this.get('squareSize');
        return this.get('grid.firstObject.length');
    }),
    
    screenPixelHeight: Ember.computed(function() {
        // return this.get('screenHeight') * this.get('squareSize');
        return this.get('grid.length');
    }),
    
    keyboardShortcuts: {
        // up: function() { 
        //     console.log('up'); 
        //     this.movePacMan('up');
        // },
        // down: function() { 
        //     console.log('down'); 
        //     this.movePacMan('down');
        // },
        // left: function() { 
        //     console.log('left'); 
        //     this.movePacMan('left');
        // },
        // right: function() { 
        //     console.log('right'); 
        //     this.movePacMan('right');
        // }
        up() { this.set('intent', 'up'); },
        down() { this.set('intent', 'down'); },
        left() { this.set('intent', 'left'); },
        right() { this.set('intent', 'right'); },
    },
    
    directions: {
        'up': { x: 0, y: -1 },
        'down': { x: 0, y: 1 },
        'left': { x: -1, y: 0 },
        'right': { x: 1, y: 0 },
        'stopped': { x: 0, y: 0 }
    },
    
    walls: [
        { x: 1, y: 1 },
        { x: 8, y: 5 }
    ],
    
    grid: [
        [2, 2, 2, 2, 2, 2, 2, 1],
        [2, 1, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 2, 2, 2, 2, 1],
        [2, 2, 2, 2, 2, 2, 2, 1],
        [2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
    ],
    
    isMoving: false,
    
    frameCycle: 1,
    
    framesPerMovement: 30,
    
    direction: 'down',
    
    intent: 'down',
    
    didInsertElement: function() {
        this.movementLoop();
    },
    
    changePacDirection: function(){
        let intent = this.get('intent')
        if (this.pathBlockedInDirection(intent)) {
            this.set('direction', 'stopped');
        } else {
            this.set('direction', intent);
        }
    },

    movementLoop: function () {
        if (this.get('frameCycle') == this.get('framesPerMovement')){
            let direction = this.get('direction');
            this.set('x', this.nextCoordinate('x', direction));
            this.set('y', this.nextCoordinate('y', direction));
            
            // this.set('isMoving', false);
            // this.set('frameCycle', 1);
            
            // this.processAnyPellets();
            // Ember.run.later(this, this.movePacMan, 1000/60);
            this.set('frameCycle', 1);
            this.processAnyPallets();
            this.changePacDirection();
        } else if (this.get('direction') == 'stopped') {
            this.changePacDirection();
        } else {
            this.incrementProperty('frameCycle');
        }
        
        this.clearScreen();
        this.drawGrid();
        this.drawPacMan();
        Ember.run.later(this, this.movementLoop, 1000/60);
    },
    
    movePacMan: function (direction){
        let inputBlocked = this.get('isMoving') || this.pathBlockedInDirection(direction);
        
        if (!inputBlocked){
            this.set('direction', direction);
            this.set('isMoving', true);
            this.movementLoop();
        }
        
        if (!this.pathBlockedInDirection(direction)) {
            this.set('x', this.nextCoordinate('x', direction));
            this.set('y', this.nextCoordinate('y', direction));
            this.processAnyPellets();
        }
        
        this.clearScreen();
        this.drawGrid();
        this.drawPacMan();
    },
    
    drawCircle: function(x, y, radiusDevisor, direction) {
        let ctx = this.get('ctx');
        let squareSize = this.get('squareSize');

        let pixelX = (x + 1/2 + this.offsetFor('x', direction)) * squareSize;
        let pixelY = (y + 1/2 + this.offsetFor('y', direction)) * squareSize;
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, squareSize / radiusDevisor, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    },
    
    drawWall: function(x, y) {
        let ctx = this.get('ctx');
        let squareSize = this.get('squareSize');
        ctx.fillStyle = '#000';
        ctx.fillRect(x * squareSize,
            y * squareSize,
            squareSize,
            squareSize);
    },
    
    drawPallet: function(x, y) {
        let radiusDevisor = 6;
        this.drawCircle(x, y, radiusDevisor, 'stopped');
    },
    
    drawPacMan: function() {
        let x = this.get('x');
        let y = this.get('y');
        let radiusDevisor = 2;
        this.drawCircle(x, y, radiusDevisor, this.get('direction'));
    },
    
    drawGrid: function() {
        let grid = this.get('grid');
        var that = this;
        grid.forEach(function(row, rowIndex) {
            row.forEach(function(cell, columnIndex) {
                if (Number(cell) === 1) {
                    that.drawWall(columnIndex, rowIndex);
                }   
                
                if (Number(cell) === 2) {
                    that.drawPallet(columnIndex, rowIndex);
                }
            });
        });
    },
    
    offsetFor: function(coordinate, direction){
        let frameRatio = this.get('frameCycle') / this.get('framesPerMovement');
        return this.get(`directions.${direction}.${coordinate}`) * frameRatio;
    }, 
    
    processAnyPellets: function(){
        let x = this.get('x');
        let y = this.get('y');
        let grid = this.get('grid');
        
        if (Number(grid[y][x]) == 2) {
            grid[y][x] = 0;
            this.incrementProperty('score');
            
            if (this.levelComplete()) {
                this.incrementProperty('levelNumber');
                this.restartLevel();
            }
        }
    },

    clearScreen: function() {
        let ctx = this.get('ctx');
        
        ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
    },
    
    collidedWithBorder: function(){
        let x = this.get('x');
        let y = this.get('y');
        let screenHeight = this.get('screenHeight');
        let screenWidth = this.get('screenWidth');

        let pacOutOfBounds = x < 0 ||
                             y < 0 ||
                             x >= screenWidth ||
                             y >= screenHeight;
        return pacOutOfBounds;
    },
    
    
    collidedWithWall: function(){
        let x = this.get('x');
        let y = this.get('y');
        let grid = this.get('gid');
        
        return Number(grid[y][x]) === 1;
    },
    
    levelComplete: function(){
        var hasPelletsLeft = false;
        let grid = this.get('grid');
        
        grid.forEach(function(row) {
            row.forEach(function(cell) {
                if(Number(cell) === 2){
                    hasPelletsLeft = true;
                }
            });
        });

        return !hasPelletsLeft;
    },
    
    restartLevel: function() {
        this.set('x', 0);
        this.set('y', 0);
        
        var grid = this.get('grid');
        grid.forEach(function(row, rowIndex) {
            row.forEach(function(cell, cellIndex) {
                if (Number(cell) === 0) {
                    grid[rowIndex][cellIndex] = 2;
                }    
            });
        });
    },
    
    nextCoordinate: function(coordinate, direction){
        return this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`);
    },
    
    pathBlockedInDirection: function(direction) {
        let cellTypeInDirection = this.cellTypeInDirection(direction);
        return Ember.isEmpty(cellTypeInDirection) || cellTypeInDirection === 1;
    },
    
    cellTypeInDirection: function (direction) {
        let nextX = this.nextCoordinate('x', direction);
        let nextY = this.nextCoordinate('y', direction);
        return this.get(`grid.${nextY}.${nextX}`);
    }
});
