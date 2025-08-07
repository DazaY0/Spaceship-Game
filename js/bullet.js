import { Projectile } from "./projectile.js";

export class Bullet extends Projectile {

    owner; //player = 0 enemy = 1

    constructor(xd, yd, spawnX, spawnY,damage, owner, type = "") {
        super(xd,yd,spawnX, spawnY);
        this.owner = owner;
        this.damage = damage;
        this.type = type;
    }


    update() {
        this.moveRandomly();
        this.shootBullet();
    } 

}
