import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {
    x: 50,
    
    y: 100,
    
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
        return this.get('grid.firstObject.length')
    }),
    
    screenPixelHeight: Ember.computed(function() {
        // return this.get('screenHeight') * this.get('squareSize');
        return this.get('grid.length');
    }),
    
    keyboardShortcuts: {
        up: function() { 
            console.log('up'); 
            this.moveTo('y', -1);
        },
        down: function() { 
            console.log('down'); 
            this.moveTo('y', 1);
        },
        left: function() { 
            console.log('left'); 
            this.moveTo('x', -1);
        },
        right: function() { 
            console.log('right'); 
            this.moveTo('x', 1);
        }
    },
    
    walls: [
        { x: 1, y: 1 },
        { x: 8, y: 5 }
    ],
    
    grid: [
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 1, 0, 0, 0, 1],
        [0, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
    ],
    
    didInsertElement: function() {
        this.drawWalls();
        this.drawCircle();
    },
    
    moveTo: function(direction, distance) {
        this.incrementProperty(direction, distance);
        
        if (this.collidedWithBorder() || this.collidedWithWall()) {
            this.decrementProperty(direction, distance);
        }
        
        this.clearScreen();
        this.drawWalls();
        this.drawCircle();
    },
    
    drawCircle: function() {
        let ctx = this.get('ctx');
        let x = this.get('x');
        let y = this.get('y');
        let radius = this.get('squareSize') / 2;
        
        let pixelX = (x+1/2) * radius;
        let pixelY = (y+1/2) * radius;
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    },
    
    drawWalls: function() {
        let squareSize = this.get('squareSize');
        let ctx = this.get('ctx');
        ctx.fillStyle = '#000';
        
        // let walls = this.get('walls');
        let grid = this.get('grid');
        
        grid.forEach(function(row, rowIndex){
            row.forEach(function(cell, columnIndex){
                if(cell == 1) {
                    ctx.fillRect(columnIndex * squareSize,
                                rowIndex * squareSize,
                                squareSize,
                                squareSize);
                }
            });
        });
        
        // walls.forEach(function(wall){
        //     ctx.fillRect(wall.x * squareSize,
        //                     wall.y * squareSize,
        //                     squareSize,
        //                     squareSize);
        // });
    },
    
    clearScreen: function() {
        let ctx = this.get('ctx');
        // let screenPixelWidth = this.get('screenWidth') * this.get('squareSize');
        // let screenPixelHeight = this.get('screenHeight') * this.get('squareSize');

        // ctx.clearRect(0, 0, screenPixelWidth, screenPixelHeight);
        
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
        
        return grid[y][x] == 1;
        // let walls = this.get('walls');

        // return walls.any(function(wall) {
        //     return x == wall.x && y == wall.y;
        // });
    }
});
