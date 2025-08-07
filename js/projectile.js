export class Projectile {
    xd;
    yd;
    y;
    x;
 

    constructor(xd, yd, spawnX, spawnY) {
        this.xd = xd;
        this.yd = yd;
        this.x = spawnX;
        this.y = spawnY;
    }

    updatePosition() {
        this.x += this.xd;
        this.y += this.yd;
    }
}
