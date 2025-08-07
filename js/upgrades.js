import { Projectile } from "./projectile.js";

export class HealItem extends Projectile{
    amount;

    constructor(xd, yd, spawnX, spawnY, amount){
        super(xd, yd, spawnX, spawnY);
        this.amount = amount;
    }
    
    activate(ship) {
        console.log(`Healing for ${this.amount}`);
        ship.heal(this.amount);
    }
}




export class UpgradeItem extends Projectile{
    id; 

    constructor(xd, yd, spawnX, spawnY, id){
        super(xd, yd, spawnX, spawnY);
        this.id = id;
    }
    activate( player){
        let healhp = 20;
        console.log(this.id);
        if(this.id === 1){
            console.log("Increase HP");
            player.increaseHP(25);
            player.heal(healhp);
        }else if(this.id ===2){
            console.log("Increase Movement Speed");
            player.increaseMovementSpeed(3);
            player.heal(healhp);
        } else if(this.id === 3){
            console.log("Decrease shooting Speed");
            player.decreaseShootingSpeed(100);
            player.heal(healhp);
        } else if(this.id === 4){
            console.log("Decrease shotting speed aim ability")
            player.decreaseShootingSpeedAim(50);
            player.heal(healhp);
        } else if(this.id === 5) {
            console.log("Increase Bullet speed");
            player.increaseBulletSpeed(3);
            player.heal(healhp);
        }
    }

    
}