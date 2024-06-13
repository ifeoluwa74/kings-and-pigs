"use strict";

class Player extends AnimatedGameObject{
    constructor(position,levelIndex,collisionBlock,door,layer,id){
        super(layer,id)
        this.position = position;
        this._previousYPosition = 0;
        this.levelIndex = levelIndex;
        this.onTheGround = true;
        this.finished = false;
        this.door = door;
       
        this.alive = true;
        this.invert = false;
        this.gameOver = false;
        this.velocity = new Vector2(0,0);
        this.times = 0;
        this.walkingSpeed = 400;
        this.gravity = 900;
        this.collisionBlock = collisionBlock;

        this.loadAnimation(sprites.playerAttack,"attack",true,0.05);
        this.loadAnimation(sprites.playerDead,"dead",false,0.05);
        this.loadAnimation(sprites.playerDoorIn,"doorin",false);
        this.loadAnimation(sprites.playerDoorOut,"doorout",false);
        this.loadAnimation(sprites.playerFall,"fall",false);
        this.loadAnimation(sprites.playerGround,"ground",false);
        this.loadAnimation(sprites.playerHit,"hit",false);
        this.loadAnimation(sprites.playerIdle,"idle",true,0.05);
        this.loadAnimation(sprites.playerIdleLeft,'idleleft',false,0.05);
        this.loadAnimation(sprites.playerJump,"jump",false,0.05);
        this.loadAnimation(sprites.playerRun,'run',true,0.05);
        this.loadAnimation(sprites.playerRunLeft,"runleft",true,0.05);
        this.loadAnimation(sprites.playerRunRight,'runright',true,0.05);
        this.reset(this.position.x,this.position.y);
    }
    reset(x,y){
        this.position = new Vector2(x,y);
        this.gameOver = false;
        this._previousYPosition = 0;
        this.alive = true;
        this.finished = false;
        this.velocity = new Vector2(0,0);
        this.gravity = 900;
        this.onTheGround = true;
        this.playAnimation("idle");
    }
    
    handleInput(delta){
        if(this.finished)
        return;
        if(Keyboard.pressed(Keys['left'])){
            this.velocity.x = -this.walkingSpeed;
        }else if(Keyboard.pressed(Keys['right'])){
            this.velocity.x = +this.walkingSpeed;
        }else
            this.velocity.x = 0;

            if(Keyboard.pressed(Keys['up']) && this.onTheGround)
                this.jump();
    }
    jump(){
        let speed = 14000;
        this.velocity.y = -speed;
        this.playAnimation('jump');
    }

    
    die(boolean){
        if(!this.alive  ||  this.finished)
        return;

        if(boolean){
            // sounds.
            this.playAnimation('dead')
        }
    }
    draw(){
        AnimatedGameObject.prototype.draw.call(this);
    }
    levelFinshed(){
        this.velocity.x = 0;
        this.playAnimation('doorin')
    }

    update(delta){
        AnimatedGameObject.prototype.update.call(this,delta);
        gameObject.prototype.update.call(this,delta);


        if(!this.onTheGround){
            this.velocity.y = this.gravity;
            // this.playAnimation('fall');
        }


        if(this.velocity.x < -0)
        this.invert = true;
        else if(this.velocity.x > 0)
        this.invert = false;        

        if(this.onTheGround){
            if(this.finished){
                this.levelFinshed()
            }else{
                if(this.velocity.x === 0){
                    if(this.invert)
                    this.playAnimation("idleleft");
                    else
                    this.playAnimation('idle')
                }else{
                    if(this.invert)
                    this.playAnimation('runleft');
                    else
                    this.playAnimation('runright')
                }
            }

            if(Keyboard.pressed(Keys['I'])){
                this.finished = true;
            }

           
        }
        
        if(this.alive){
            this.handleCollision();
        }
    }
        
    handleCollision(){
        this.onTheGround = false;
        let collisionBlock = this.collisionBlock._gameObjects;

        for(let i = 0;i < collisionBlock.length;i++){
            let blocks = collisionBlock[i];
            let boundingBox = this.boundingBox;
            let tiles = this.root.find(ID.tiles);
            let tileBounds = new Rectangle(blocks.position.x,blocks.position.y,tiles.cellWidth,tiles.cellHeight);


            if(blocks.type === TileType['background'])
            continue;

            boundingBox.height += 1;

            if(!tileBounds.intersects(boundingBox))
            continue;

            let depth = boundingBox.calculateIntersectionDepth(tileBounds);

            if (Math.abs(depth.x) < Math.abs(depth.y)) {
                // move character in the x direction
                if(blocks.type === TileType['normal'])
                this.position.x += depth.x;
            }

            // if (this._previousYPosition <= tileBounds.top && blocks.type === TileType['normal']) {
            //     // move character in the y direction
            //     this.onTheGround = true;
            //     this.velocity.y = 0;
            // }

            if((this.boundingBox.top <= tileBounds.top || this.boundingBox.bottom >= tileBounds.bottom) && TileType['normal']){
                this.onTheGround = true;
                this.velocity.y = 0;
            }

            

            if(blocks.type === TileType['background'] || this.onTheGround){
                this.position.y += depth.y + 1;
            }
            this._previousYPosition = this.position.y;
        }
    }
}