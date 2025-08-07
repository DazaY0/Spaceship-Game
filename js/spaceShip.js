import {  drawBeam, drawShip} from './utils.js';

export class ShipBase {
    constructor(x, y, hp, shipParts , movementSpeed ,bulletDamage, rpm, bulletSpeed, beamDamage = 15, beamDuration = 2000, beamCooldown= 7500) {
        this.tip = { x, y };
        this.maxHP = hp;   
        this.currentHP = hp;
        this.ship = this.deepCopyShip(shipParts);
        this.invincible = false;
        this.movementSpeed = movementSpeed; 
        this.rpm = rpm;
        this.bulletSpeed = bulletSpeed;
        this.bulletDamage = bulletDamage;

        

        this.shoot = false;
        
        this.canShoot = true;

        this.beamDamage = beamDamage;
        this.beam = true;
        this.isShootingBeam= false;
        this.canShootBeam = true;
        this.beamDuration = beamDuration;
        this.beamCooldown = beamCooldown;   

    }

    deepCopyShip(shipParts) {
        return shipParts.map(part => ({ x: part.x, y: part.y }));
    }

    takeDamage(amount = 1) {
        if(this.invincible) return
        this.currentHP -= amount;
        //console.log(this);
        //console.log("took hit")
        
        if (this.currentHP <= 0) {
            this.onDestroyed();
        }
        this.invincible= true;
        setTimeout(() => {
            this.invincible = false;
        }, 300);
    }
    heal(amount) {
        this.currentHP += amount;
        if (this.currentHP > this.maxHP) {
            this.currentHP = this.maxHP;
        }

        this.invincible = true;
        setTimeout(() => {
            this.invincible = false;
        }, 100);
    }

    increaseHP( amount ){ //id = 1
        this.maxHP += amount;
        this.currentHP += amount;
    }
    increaseMovementSpeed( amount){ //id=2
        this.movementSpeed += amount;
    }
    decreaseShootingSpeed(amount){ //id = 3
        this.shootingSpeed -= amount;
    }
    decreaseShootingSpeedAim(amount){ //id = 4
        this.shootingSpeedAim -= amount;
    }
    increaseBulletSpeed(amount){ // id= 5
        this.bulletSpeed += amount;
    }


    activateBeam(){
        console.log("activating beam")
        this.canShoot = false;
        
        this.canShootBeam = false;
        this.isShootingBeam = true;
        setTimeout(() => {
            this.isShootingBeam= false;
            this.canShoot = true;
            console.log("Beam ended after 2 seconds.");
        }, this.beamDuration);
        setTimeout(() => {
            this.beam = true;
            this.canShootBeam = true;
            console.log("Beam is ready");
        }, this.beamCooldown);
    }

    onDestroyed() {
        // Override this in subclasses
        console.log("Ship destroyed.");
    }

    draw(color = 0, ctx) {
        drawShip(this, color, ctx);
        if(this.isShootingBeam) drawBeam(this, color);
    }

    move(dx, dy) {
        let newX = this.tip.x + dx;
        let newY = this.tip.y + dy;

        if (newX < 0 || newX > 600 || newY < 0 || newY > 600) {
            return; 
        }
        this.tip.x = newX;
        this.tip.y = newY;
        this.ship.forEach(part => {
            part.x += dx;
            part.y += dy;
        });
    }
}



