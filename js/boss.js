
import { enemies, player, win} from "./spaceshit.js";
import { Enemy } from './enemy.js';
import { drawBeam, getDirectionVector } from "./utils.js";

export class Boss extends Enemy{
    constructor(x, y, hp,ship, shootingSpeed,movementSpeed, bulletDamage, beamDamage ) {
        super(x, y, "Boss",  hp, ship, shootingSpeed, movementSpeed, bulletDamage, 1);
        this.beamDetectionWidth = 20;
    }
    onDestroyed() {
        console.log("Boss destroyed");
        enemies.splice(enemies.indexOf(this), 1);
        this.funeral(true, 5);
    }


     update() {
        this.moveRandomly();
        this.bossAI();
    } 

    

    bossAI(){
        if( player.tip.x >= this.tip.x - this.beamDetectionWidth &&
            player.tip.x <= this.tip.x + this.beamDetectionWidth &&
            player.tip.y >= this.tip.y

        ){
            console.log("would");
            //try beam opportunity
            if(Math.random() < 1){
                if ( this.beam && this.canShootBeam) {
                
                    this.beam = false;
                    this.activateBeam();
                } 
            }
        }


        if(!this.isShootingBeam) this.shootBullet();
    }
    
            
}