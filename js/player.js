import { ShipBase } from './spaceShip.js';
import { setGameSpeed , mouseX, mouseY, end, hitAnimation} from './spaceshit.js';
import { spawnBullet, getDirectionVector, getCookie, drawBeam } from './utils.js';

export class Player extends ShipBase {
   

     constructor(x, y, shipData) {
        const {
            name,
            hp,
            movementSpeed,
            Bullet,
            Beam,
            AimBullet,
            Freeze,
            sprite
        } = shipData;

        const {
            damage: bulletDamage,
            speed: bulletSpeed,
            rpm: rpm
        } = Bullet;

        const {
            damage: beamDamage,
            duration: beamDuration,
            cooldown: beamCooldown
        } = Beam;

        const {
            damage: aimBulletDamage,
            rpm: rpmAim,
            duration: aimBulletDuration,
            cooldown: aimBulletCooldown
        } = AimBullet;

        // Call the parent constructor with the correct values.
        super(x, y, hp, sprite, movementSpeed, bulletDamage, rpm, bulletSpeed, beamDamage, beamDuration, beamCooldown);
        this.name = name;
        // Aiming bullets
        this.aimBullets = true;
        this.isShootingAim = false;
        this.canShootAim = true;
        this.aimBulletDamage = aimBulletDamage;
        this.rpmAim = rpmAim;
        this.aimBulletsDuration = aimBulletDuration;
        this.aimBulletsCooldown = aimBulletCooldown;

        // Time Freeze
        this.freezeTime = Freeze === true;
        this.isFreezingTime = false;
        this.canFreezeTime = true;
        this.freezeDuration = 5000;
        this.freezeCooldown = 15000;

        // Timestamps
        this.lastBulletTime = 0;
        this.lastAimBulletTime = 0;
    }

    static async create(x, y) {
        try {
            const response = await fetch('/resources/shipData.json');
            const data = await response.json();

            let currentShipIndex = getCookie("currentShip");
            if (!currentShipIndex || isNaN(currentShipIndex)) {
                currentShipIndex = 0;
            }

            const shipData = data[currentShipIndex];
            console.log(shipData);
            return new Player(x, y, shipData);
        } catch (error) {
            console.error('Error loading ship data:', error);
            throw error;
        }
    }

    onDestroyed() {
        console.log("Player destroyed");
        end(); // call your game over logic
    }

    activateBeam(){
        console.log("activating beam")
        this.canShoot = false;
        this.canShootAim = false;
        this.canShootBeam = false;
        this.isShootingBeam = true;
        setTimeout(() => {
            
            this.isShootingBeam= false;
            this.canShoot = true;
            this.canShootAim = true;
            console.log("Beam ended after " + this.beamDuration /1000+" seconds.");
        }, this.beamDuration);
        setTimeout(() => {
            this.beam = true;
            this.canShootBeam = true;
            console.log("Beam is ready");
        }, this.beamCooldown);
    }
    takeDamage(amount = 1) {
        if(this.invincible) return
        this.currentHP -= amount;
        hitAnimation(amount, this.currentHP, this.maxHP);
        
        if (this.currentHP <= 0) {
            this.onDestroyed();
        }
        this.invincible= true;
        setTimeout(() => {
            this.invincible = false;
        }, 300);
    }

    activateAimBullets(){
        this.aimBullets = false;
        console.log("activating aim bullets")
        this.canShoot = false;
        this.canShootBeam = false;
        this.canShootAim = false;
        this.isShootingAim = true;
        setTimeout(() => {
            this.isShootingAim= false;
            this.canShoot = true;
            this.canShootBeam = true;
            console.log("Aim Bullets ended after " + this.aimBulletsDuration / 1000+" seconds.");
        }, this.aimBulletsDuration);
        setTimeout(() => {
            this.aimBullets = true;
            this.canShootAim = true;
            console.log("Aim Bullets is ready");
        }, this.aimBulletsCooldown);
    }

     activateFreezeTime(){
        this.freezeTime = false;
        console.log("activating freeze time");
        this.isFreezingTime = true;
        this.canFreezeTime = false;
        setGameSpeed(500);

        setTimeout(() => {
            this.isFreezingTime = false;
            setGameSpeed(100);
            console.log("Freeze Time ended after " + this.freezeDuration /1000+" seconds.");
        }, this.freezeDuration);

        setTimeout(() => {
            this.freezeTime = true;
            this.canFreezeTime = true;
            console.log("Freeze Time is ready");
        }, this.freezeCooldown);
    }
    

    spawnAimBullet(){
        const now = Date.now();
        if (now - this.lastAimBulletTime > this.rpmAim) {  // 0.25 sec cooldown
            var temp = getDirectionVector(this.tip, {x:mouseX, y:mouseY}, this.bulletSpeed, 0);
            spawnBullet(temp.x, temp.y, this.tip.x, this.tip.y, this.aimBulletDamage,  0, this.name );
            this.lastAimBulletTime = now;
        }
    }
    spawnNormalBullet(){
        const now = Date.now();
        if (now - this.lastBulletTime > this.rpm) {  // 0.5 sec cooldown
            spawnBullet(0, -this.bulletSpeed, this.tip.x, this.tip.y, this.bulletDamage, 0, this.name);
            this.lastBulletTime = now;
        }
    }
    
    
}