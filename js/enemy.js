import { getDirectionVector, spawnBullet , drawShip} from './utils.js';
import {player, enemies, incrementScore, items, enemiesToDefeat, nextRound, decreaseEnemyToDefeat} from "./spaceshit.js";
import { ShipBase } from './spaceShip.js';
import { HealItem, UpgradeItem } from './upgrades.js';

export class Enemy extends ShipBase{
    constructor(x, y,type,  hp, ship,shootingSpeed,  movementSpeed , bulletDamage, dropChance = 0.6, beamDamage = 7) {
        super(x, y, hp, ship,movementSpeed, bulletDamage, shootingSpeed, 10, beamDamage, 1500, 9000 );
        this.lastShotTime = Date.now();
        this.ship = this.rotateShip180(this.ship, this.tip);
        this.vx = 0;
        this.vy = 0;
        this.type = type;
        this.dropChance = dropChance;
    
        // How far enemy should travel before changing direction
        this.distanceToTravel = 50 + Math.random() * 150; // random distance between 50 and 200
    
        // Track how far traveled so far
        this.distanceTraveled = 0;
    
        // Initialize with a random direction and speed
        this.setRandomDirection();
    }

    update() {
        this.moveRandomly();
        this.shootBullet();
    } 



    rotateShip180(ship, newTip) {
        const originalTip = ship[0];

        return ship.map(part => {
            const rotatedX = 2 * originalTip.x - part.x;
            const rotatedY = 2 * originalTip.y - part.y;

            const dx = newTip.x - originalTip.x;
            const dy = newTip.y - originalTip.y;

            return {
                x: rotatedX + dx,
                y: rotatedY + dy
            };
        });
    }

    shootBullet() {
        const now = Date.now();
        if (now - this.lastShotTime > this.rpm) {
            const direction = getDirectionVector(this.tip, player.tip,  3);
            spawnBullet(direction.x, direction.y, this.tip.x, this.tip.y, this.bulletDamage, 1, this.type);
            this.lastShotTime = now;
        }
    }

    
    onDestroyed() {
        let last = false;
        console.log("Enemy destroyed");
        if(enemies.length === 1) last = true;
        enemies.splice(enemies.indexOf(this), 1);

        this.funeral(last);
    }

     funeral(last, amount = 1){
        if (enemiesToDefeat - 1 <= 0) {
            nextRound();
        }else{
            decreaseEnemyToDefeat();
        }

        if(last || Math.random() < dropChance){
            console.log("created Item");
            let allowedValues;

            if (player.rpm && player.rpmAim <= 200) {
               
                allowedValues = [1, 2, 5];
            } else if(player.rpm <= 200){
                
                allowedValues = [1, 2, 4, 5];
            }else if(player.rpmAim <=200){
                allowedValues = [1,2,3,5];
            }
            else{
                allowedValues = [1,2,3,4,5];
            }

            // Choose a random allowed value
            let randomValue = allowedValues[Math.floor(Math.random() * allowedValues.length)];
            
            items.push(new UpgradeItem(0, 3,this.tip.x, this.tip.y,randomValue));
           
        }
        
        incrementScore(amount);
    }
    setRandomDirection() {
        const angle = Math.random() * 2 * Math.PI;
        const speed = this.movementSpeed; // speed between 1 and 2
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    
        this.distanceTraveled = 0;
        this.distanceToTravel = 50 + Math.random() * 150; // randomize distance
    }
    
    moveRandomly() {
        // Predict new position
        const newX = this.tip.x + this.vx;
        const newY = this.tip.y + this.vy;
    
        if (newX < 0 || newX > 600 || newY < 0 || newY > 600) {
            // Hit boundary, pick a new direction
            this.setRandomDirection();
        } else {
            this.move(this.vx, this.vy);
            const frameDistance = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.distanceTraveled += frameDistance;
    
            if (this.distanceTraveled >= this.distanceToTravel) {
                this.setRandomDirection();
            }
        }
    }
    
    
    
}
