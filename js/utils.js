import { bullets, items, ctx } from './spaceshit.js';
import {Bullet} from "./bullet.js";
import { ShipBase } from './spaceShip.js';
import { UpgradeItem } from './upgrades.js';


export function getDirectionVector(start, target, speed) {
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    return {
        x: (dx / length) * speed,
        y: (dy / length) * speed
    };
}

export function spawnBullet(xd, yd, spawnX, spawnY, damage, owner, type = "player") {
    const bullet = new Bullet(xd, yd, spawnX, spawnY,damage, owner, type);
    bullets.push(bullet);
}

export function drawBullets() {
    bullets.forEach(bullet => {
        if(bullet.type === "Sniper"){
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'purple';
        }else{
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'red';
        }
        ctx.fillRect(bullet.x, bullet.y, 4, 4); 
        ctx.strokeRect(bullet.x, bullet.y,4, 4);
    });
}
export function drawBeam(player, enemy = 0){
    if (!player || !ctx) { console.log("cant draw beam");return;} // Safety check
    if(enemy === 0){
        for(let i= player.tip.y; i >= 0; i-- ){
        
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'lightblue';
            ctx.fillRect(player.tip.x, i, 4, 4); 
            ctx.strokeRect(player.tip.x, i,4, 4);
        }
    }else{
        for(let i= player.tip.y; i <= 600; i++ ){
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'red';
            ctx.fillRect(player.tip.x, i, 4, 4); 
            ctx.strokeRect(player.tip.x, i,4, 4);
        } 

    }
    
   
}

export function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.updatePosition();
        if (bullet.x < 0 || bullet.y < 0 || bullet.x > 600 || bullet.y > 600) {
            bullets.splice(i, 1); 
        }
    }
}


export function drawItems(){
    items.forEach(item => {
        if(item instanceof UpgradeItem){
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'darkyellow';
        }else{

            ctx.fillStyle = 'green';
            ctx.strokeStyle = 'darkgreen';
        }
        ctx.fillRect(item.x, item.y, 10, 10); 
        ctx.strokeRect(item.x, item.y,10, 10);
    })
}



function drawShipPart(ship, shipPart, enemy) {
    if (enemy === 0) {
        if (ship.invincible) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'white';
        } else {
            ctx.fillStyle = 'lightgreen';
            ctx.strokeStyle = 'darkgreen';
        }
    } else {
        if (ship.invincible) {
            ctx.fillStyle = 'orange';
            ctx.strokeStyle = 'darkorange';
        } else {
            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'darkred';
        }
    }
    ctx.fillRect(shipPart.x, shipPart.y, 5, 5);
    ctx.strokeRect(shipPart.x, shipPart.y, 5, 5);
}


export function drawShip(shipbase, enemy, ctx) {
    if (!shipbase || !shipbase.ship){ console.log("ship isnt definded"); return;}
   
    shipbase.ship.forEach((part, idx) => drawShipPart(shipbase ,part, enemy, ctx));
}




export function sendHighScore(name, score){
    // Submit score
    fetch('http://localhost:5000/scores', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: name, score: score })
    });
    console.log("send score");

    

}

export function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function getChanceBasedValue(options) {
  const totalChance = options.reduce((sum, item) => sum + item.chance, 0);
  if (totalChance !== 100) {
    throw new Error("Total chance must equal 100%");
  }

  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const item of options) {
    cumulative += item.chance;
    if (rand < cumulative) {
      return item.value;
    }
  }
}
export function getRandomFromRanges(ranges) {
  const totalChance = ranges.reduce((sum, r) => sum + r.chance, 0);
  if (totalChance !== 100) {
    throw new Error("Total chance must equal 100%");
  }

  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const range of ranges) {
    cumulative += range.chance;
    if (rand < cumulative) {
      // Return a random number from this range (inclusive)
      return Math.floor(Math.random() * (range.end - range.start + 1)) + range.start;
    }
  }
}