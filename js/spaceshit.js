
import { updateBullets, drawBullets, drawBeam, drawItems , getChanceBasedValue, sendHighScore, getCookie} from './utils.js';
import {EnemyFactory} from "./enemyFactory.js";
import { Boss } from './boss.js';

import { Player } from './player.js';

export const enemies = [];
export const bullets = [];
export const items = [];

export let player;


const canvas = document.getElementById("gameCanvas");
canvas.width = 600;
canvas.height = 600;

export const ctx = canvas.getContext("2d");

const keysDown = {};
let dx = 0;
let dy = 0;

let gameOver = false;
let score = 0;

let gameSpeed = 100;
let gameTimout;
let playerTimout;

let round = 0;
export let enemiesToDefeat = 0;

let inAnimation = false;
let animationFrame = 0;
let animationType = null;
let hpAnimation;


let pauseGame = false;


let enemyShipSprite;

export let mouseX = 0;
export let mouseY = 0;




document.addEventListener('keydown', (event) => {
    keysDown[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    keysDown[event.key] = false;
});
canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();

   
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    
     mouseX = Math.min(Math.max(Math.floor(x), 0), 599);
     mouseY = Math.min(Math.max(Math.floor(y), 0), 599);

    
});
canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        
        player.shoot = true;
    } else if (event.button === 2 && player.beam && player.canShootBeam) {
       
        player.beam = false;
        player.activateBeam();
    } 
});
canvas.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
        player.shoot = false;
    }
});





export function incrementScore(amount = 1) {
  const scoreContainer = document.getElementById("score-container");
  const scoreElement = document.getElementById("score");
  const rect = scoreContainer.getBoundingClientRect();

  // Create the popup
  const popup = document.createElement("span");
  popup.textContent = "+" + amount;
  popup.className = "score-popup";

  // Fix broken left calculation (ternary bug)
  const offset = score > 9 ? 115 : 105;
  popup.style.left = `${rect.left + window.scrollX + offset}px`;
  popup.style.top = `${rect.top + 25 + window.scrollY}px`;

  document.body.appendChild(popup);

  // Animate popup
  gsap.fromTo(
    popup,
    {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    {
      y: -30,
      opacity: 0,
      scale: 1.2,
      duration: 0.6,
      ease: CustomEase.create(
        "custom",
        "M0,0 C0.366,0 0.61,0.094 0.747,0.215 0.974,0.415 1,1 1,1"
      ),
      onComplete: () => {
        popup.remove();

        score += amount;
        scoreElement.textContent = score;

        // Animate score bounce
        gsap.fromTo(
          scoreElement,
          { scale: 1.5, y: 10 },
          { scale: 1, y: 0, duration: 0.2, ease: "back.out(3)" }
        );
      },
    }
  );
}

export function decreaseEnemyToDefeat(){
    enemiesToDefeat --;
}



export function setGameSpeed(amount){
    gameSpeed = amount;
}

function checkForKeyboard() {
    dx = 0;
    dy = 0;

    if (keysDown['q'] && player.freezeTime && player.canFreezeTime) {
        player.activateFreezeTime();
    }

    if (keysDown['d']) dx = player.movementSpeed;
    if (keysDown['a']) dx = -player.movementSpeed;
    if (keysDown['w']) dy = -player.movementSpeed;
    if (keysDown['s']) dy = player.movementSpeed;

    if (keysDown["e"] && player.aimBullets && player.canShootAim) {
        player.activateAimBullets();
    }
    /*
    if (dx > 0) direction = 'right';
    if (dx < 0) direction = 'left';
    if (dy > 0) direction = 'down';
    if (dy < 0) direction = 'up';
    */
}

function updateInteraction() {
    player.move(dx, dy);


    if (player.shoot && player.isShootingAim) {
        player.spawnAimBullet();
    } else if (player.shoot && player.canShoot) {
        player.spawnNormalBullet();
    }
}


function collision() {
    items.forEach(item => {
        for (let i = 0; i < player.ship.length; i++) {
            if ( //player
                item.x >= player.ship[i].x &&
                item.x < player.ship[i].x + 8 &&
                item.y >= player.ship[i].y &&
                item.y < player.ship[i].y + 8 
            ) {
                console.log("pick up Item");
                console.log(item);
                item.activate(player);
                items.splice(items.indexOf(item), 1)
                break;
                
            }
        }
    });

    if(!player.isShootingBeam){
        for (let b = bullets.length - 1; b >= 0; b--) {
            const bullet = bullets[b];
            let hit = false;

            if (bullet.owner !== 0) {
                for (let i = 0; i < player.ship.length; i++) {
                    const part = player.ship[i];
                    if (
                        bullet.x >= part.x &&
                        bullet.x < part.x + 4 &&
                        bullet.y >= part.y &&
                        bullet.y < part.y + 4
                    ) {
                        player.takeDamage(bullet.damage);
                        hit = true;
                       
                        break;
                    }
                }
            }
    
            if (!hit && bullet.owner !== 1) {
                for (const enemy of enemies) {
                    for (let i = 0; i < enemy.ship.length; i++) {
                        const part = enemy.ship[i];
                        if (
                            bullet.x >= part.x &&
                            bullet.x < part.x + 4 &&
                            bullet.y >= part.y &&
                            bullet.y < part.y + 4
                        ) {
                            enemy.takeDamage(bullet.damage);
                            hit = true;
                            break;
                        }
                    }
                    if (hit) break;
                }
            }
            
            if (hit) {
                bullets.splice(b, 1);
            }
        }

    }else{  ///player beam
        const beamX = player.tip.x;
        const beamWidth = 8;

        enemies.forEach(enemy => {
            for (let i = 0; i < enemy.ship.length; i++) {
                const part = enemy.ship[i];
                if (
                    part.x >= beamX - beamWidth / 2 &&
                    part.x <= beamX + beamWidth / 2 &&
                    part.y <= player.tip.y // beam goes upward
                ) {
                    enemy.takeDamage(player.beamDamage);
                    break; 
                }
            }
        });
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (
                bullet.x >= beamX - beamWidth / 2 &&
                bullet.x <= beamX + beamWidth / 2 &&
                bullet.y >= 0 &&
                bullet.y <= player.tip.y
            ){
                bullets.splice(i, 1);
            }
        }

    } 
    if(round%5 === 0){ ///enemy beam
        if(enemies[0] instanceof Boss){
            const enemy = enemies[0];
            if(enemy.isShootingBeam){
                const beamX = enemy.tip.x;
                const beamWidth = 8;
                for (let i = 0; i < player.ship.length; i++) {
                    const part = player.ship[i];
                    if (
                        part.x >= beamX - beamWidth / 2 &&
                        part.x <= beamX + beamWidth / 2 &&
                        part.y >= enemy.tip.y // beam goes downward
                    ) {
                        player.takeDamage(enemy.beamDamage);
                        break; 
                    }
                }
            }
        }

    }
}
    


function startRoundAnimation( callback) {
    inAnimation = true;
    animationFrame = 0;
    animationType = "round";
    
    setTimeout(() => {
        inAnimation = false;
        animationType = null;
        callback(); 
    }, 3000); 
}



export  function nextRound() {
    round++;

    async function spawnEnemiesForRound() {
        const enemyFactory = new EnemyFactory();
        await  enemyFactory.init();
        if(round % 5 === 0){
            enemiesToDefeat = 1;
            
            enemies.push(enemyFactory.createBoss());
        }else{
            if(player.currentHP<=50){
                enemiesToDefeat = getChanceBasedValue([
                            { value: 4, chance: 0 },   // 0%
                            { value: 3, chance: 10 },   // 10%
                            { value: 2, chance: 50 },  // 50%
                            { value: 1, chance: 40 }   // 40%
                            ]);
            }else{
                enemiesToDefeat = getChanceBasedValue([
                            { value: 4, chance: 5 },   // 5%
                            { value: 3, chance: 15 },   // 15%
                            { value: 2, chance: 45 },  // 45%
                            { value: 1, chance: 35 }   // 30%
                            ]);
            }
            
            
            for(let i = 0; i< enemiesToDefeat; i++){
                enemies.push(enemyFactory.createEnemy(player.currentHP));
            }
        }
    }

    startRoundAnimation(spawnEnemiesForRound);
}




function gameLoopTick() {
    if (gameOver) return;

    if (!inAnimation && !pauseGame) {
        updateGameWorld();
    }
    gameTimout = setTimeout(gameLoopTick, gameSpeed);
}
function playerLoopTick(){
    if (gameOver) return;

    
    if (!inAnimation && !pauseGame) {
        updatePlayer();
    }
    render();
    playerTimout = setTimeout(playerLoopTick, 100);
}

export function end() {
    gameOver = true;
    sendHighScore(getCookie("username"), score);
    document.getElementById("hp").style.display = "none";
    document.getElementById("messages").style.display = "block";
    document.getElementById("messages").innerHTML = "Game Over! Score: " + score;
}
export function win() {
    gameOver = true;
    document.getElementById("hp").innerHTML = "Game Won! Congratulations";
}

function pause(){
    console.log("pausing game");
    pauseGame= !pauseGame;
    console.log(pauseGame);
}
export async function start() {
    playerTimout = null;
    gameTimout = null;
    gameOver= true;
    gameOver = false;
    pauseGame = false;

    score = 0;
    round = 0;
    dx = 0;
    dy = 0;
    animationFrame = 0;
    gameSpeed = 100;
    document.getElementById("hp").style.display = "block";
    document.getElementById("messages").style.display = "none";


    bullets.length = 0;
    enemies.length = 0;
    
    player = await Player.create(300, 300);
    console.log(player.ship);
    await nextRound();
    document.getElementById('hp-text').textContent = player.currentHP + "/" + player.maxHP;
    console.log(enemies[0])
    console.log(player.tip);
    gameLoopTick();
    playerLoopTick();
}


function updateGameWorld() {
    updateEnemies();
    updateBullets();

    collision();
    
}
function updatePlayer(){
    checkForKeyboard();
    updateInteraction();
    additionalEffects();
}
function updateEnemies(){
    enemies.forEach(enemy => {
        enemy.update();
    })
}

function render(){
    //document.getElementById("hp").innerHTML = "HP: " + player.currentHP + "/" + player.maxHP ;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ships
    player.draw(0, ctx)
    enemies.forEach(enemy => {
        enemy.draw(1, ctx);
    })
    //draw Items
    drawItems();

    //draw bullets
    drawBullets();
    
    //beam

    if(player.isFreezingTime) {
        ctx.fillStyle = 'rgba(0, 150, 255, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if(pauseGame){
        const opacity = 1;
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = "36px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.class = "press-start-2p-regular"
        ctx.fillText("Round " + round, canvas.width / 2, canvas.height / 2);
    }


    if (inAnimation && animationType === "round") {
        const opacity = Math.sin((animationFrame / 30) * Math.PI); // fade in-out over 20 frames, 100ms tick über 2sek sein 20 frames
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = "36px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.class = "press-start-2p-regular"
        ctx.fillText("Round " + round, canvas.width / 2, canvas.height / 2);

        animationFrame++;
    }


}

function additionalEffects(){
    if (player.currentHP < 25) { //heart shaking
        if (!hpAnimation || !hpAnimation.isActive()) {
            console.log("starting heart shaking animation");
            hpAnimation = gsap.to("#hp", {
                color: "red",
                scale: 1.05,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
                duration: 0.6,
                transformOrigin: "center center",
            });
        }
    } else {
        if (hpAnimation) {
            hpAnimation.kill();
            gsap.set("#hallo", { color: "", scale: 1 }); 
        }
    }

}
export function hitAnimation(amount, currentHP, maxHP) {
  const hp = document.getElementById('hp');
  const hpText = document.getElementById('hp-text');
  const damageFloat = document.getElementById('damage-float');
  

  hpText.textContent = currentHP + "/" + maxHP ;

  gsap.fromTo(
    hpText,
    { x: 0 },
    {
      x: -10,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        gsap.to(hpText, {
          x: 0,
          duration: 0.4,
          ease: "elastic.out(1, 0.4)"
        });
      }
    }
  );

  // Red flash effect
  gsap.fromTo(
    hpText,
    { color: 'white' },
    {
      color: 'red',
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    }
  );
  damageFloat.textContent = `-${amount}`;
  gsap.killTweensOf(damageFloat);
    gsap.set(damageFloat, { opacity: 1, y: 0, display: 'inline-block' });
    gsap.to(damageFloat, {
    y: -20,
    opacity: 0,
    duration: 0.6,
    ease: "back.out(2)",
    onComplete: () => {
        gsap.set(damageFloat, { display: 'none' });
    }
    });
}



window.start = start;

window.pause = pause;

