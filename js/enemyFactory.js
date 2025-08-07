import { Boss } from "./boss.js";
import { Enemy } from "./enemy.js";
import {getRandomFromRanges} from "./utils.js";


const bossSprite = [
    // Nose tip
    {x: 75, y: 75},  // Tip

    {x: 72, y: 78}, {x: 75, y: 78}, {x: 78, y: 78},

    {x: 69, y: 81}, {x: 75, y: 81}, {x: 81, y: 81},

    {x: 66, y: 84}, {x: 72, y: 84}, {x: 75, y: 84}, {x: 78, y: 84}, {x: 84, y: 84},

    {x: 63, y: 87}, {x: 69, y: 87}, {x: 72, y: 87}, {x: 75, y: 87},
    {x: 78, y: 87}, {x: 81, y: 87}, {x: 87, y: 87},

    {x: 60, y: 90}, {x: 66, y: 90}, {x: 69, y: 90}, {x: 75, y: 90},
    {x: 81, y: 90}, {x: 84, y: 90}, {x: 90, y: 90},

    {x: 66, y: 93}, {x: 69, y: 93}, {x: 72, y: 93}, {x: 75, y: 93}, {x: 78, y: 93}, {x: 81, y: 93},

    {x: 63, y: 96}, {x: 66, y: 96}, {x: 69, y: 96}, {x: 72, y: 96}, {x: 75, y: 96},
    {x: 78, y: 96}, {x: 81, y: 96}, {x: 84, y: 96}, {x: 87, y: 96},

    {x: 66, y: 99}, {x: 69, y: 99}, {x: 72, y: 99}, {x: 75, y: 99}, {x: 78, y: 99}, {x: 81, y: 99},

    {x: 63, y: 102}, {x: 72, y: 102}, {x: 75, y: 102}, {x: 78, y: 102}, {x: 87, y: 102},

    {x: 60, y: 105}, {x: 69, y: 105}, {x: 75, y: 105}, {x: 81, y: 105}, {x: 90, y: 105},
];

const enemyTypes = {
    Classic: {
        spriteName: "Classic",
        shootingSpeedRanges: [
            { start: 400, end: 600, chance: 80 },
            { start: 300, end: 399, chance: 20 }
        ],
        movementSpeedRanges: [
            { start: 8, end: 11, chance: 100 }
        ],
        damageRanges: [
            { start: 8, end: 10, chance: 100 }
        ]
    },

    Tank: {
        spriteName: "Tank",
        shootingSpeedRanges: [
            { start: 600, end: 1000, chance: 100 }
        ],
        movementSpeedRanges: [
            { start: 4, end: 7, chance: 70 },
            { start: 8, end: 10, chance: 30 }
        ],
        damageRanges: [
            { start: 5, end: 10, chance: 100 }
        ]
    },

    speedy: {
        spriteName: "Speedy",
        shootingSpeedRanges: [
            { start: 300, end: 500, chance: 100 }
        ],
        movementSpeedRanges: [
            { start: 15, end: 18, chance: 100 }
        ],
        damageRanges: [
            { start: 7, end: 8, chance: 100 }
        ]
    },

    sniper: {
        spriteName: "Sniper",
        shootingSpeedRanges: [
            { start: 1000, end: 1500, chance: 100 }
        ],
        movementSpeedRanges: [
            { start: 6, end: 8, chance: 100 }
        ],
        damageRanges: [
            { start: 20, end: 30, chance: 100 }
        ]
    } ,
    Boss: {
        spriteName: "Boss",
        shootingSpeedRanges: [
            { start: 500, end: 600, chance: 80 },
            { start: 400, end: 499, chance: 20 }
        ],
        movementSpeedRanges: [
            { start: 8, end: 11, chance: 100 }
        ],
        damageRanges: [
            { start: 10, end: 13, chance: 100 }
        ]
    },
}; 


export class EnemyFactory {
  static instance = null;

  constructor() {
    if (EnemyFactory.instance) return EnemyFactory.instance;
    this.shipData = null;
     this.enemyCount = 0;
    EnemyFactory.instance = this;
  }

  async init() {
    if (this.shipData) return; // Already loaded
    try {
      const response = await fetch('/resources/shipData.json');
      this.shipData = await response.json();
    } catch (error) {
      console.error('Failed to load ship data:', error);
    }
  }

  getShipSpriteByName(name) {
    const match = this.shipData?.find(ship => ship.name === name);
    return match ? match.sprite : null;
  }

  createEnemy(playerHP) {
    if (!this.shipData) {
      throw new Error("Ship data not loaded. Call init() first.");
    }
    this.enemyCount++;

    let chance1 = 67 - this.enemyCount * 2;
    let chance2 = 24 + this.enemyCount;
    let chance3 = 9 + this.enemyCount;

    
    if (chance1 < 10) {
      chance1 = 10;
    }
    let rest = chance2 + chance3;

   
    let scale = (100 - chance1) / rest;

    chance2 = chance2 * scale;
    chance3 = chance3 * scale;

    let hp = getRandomFromRanges([
      { start: 100, end: 150, chance: chance1 },
      { start: 151, end: 300, chance: chance2 },
      { start: 301, end: 500, chance: chance3 }
    ]);
    const baseScale = Math.log2(this.enemyCount + 1);
    let scaleUp = 1 + baseScale * 0.13;
    let scaleDown = 1 - baseScale * 0.13;

    const hpThreshold = 35;
    if (playerHP <= hpThreshold) {
      const hpFactor = (hpThreshold - this.playerHP) / hpThreshold; 
      const easingPower = 1.5;
      const eased = Math.pow(hpFactor, easingPower); 

      
      const reliefMultiplier = 1 - eased * 0.4;
      scaleUp *= reliefMultiplier;

      
      const rewardBoost = 1 + eased * 0.2; 
      scaleDown *= rewardBoost;
    }
    scaleUp = Math.max(0.6, scaleUp);
    scaleDown = Math.min(1.3, scaleDown)


    const category = this.determineCategory(hp, playerHP);
    hp = Math.round(hp *scaleUp);
    const dropChance = 0.6 * scaleDown;

    const config = enemyTypes[category];

    const enemy = new Enemy(Math.random() * 600, Math.random() * 400, category, hp, this.getShipSpriteByName(config.spriteName),
                 Math.round(getRandomFromRanges(config.shootingSpeedRanges) * scaleDown), Math.round(getRandomFromRanges(config.movementSpeedRanges) * scaleUp),
                  Math.round(getRandomFromRanges(config.damageRanges) * scaleUp), dropChance);
    console.log(enemy);
    return enemy
  }



  determineCategory(hp, playerHP) {
     const r = Math.random(); 
      if(playerHP <=25){
      if (r < 0.1) return "Speedy";
      if (r < 0.2) return "Sniper";
  
    }
    if (hp > 350) return "Tank";
   

   
    return "Classic";
  }

  createBoss(){
    this.enemyCount++;

    let hp = getRandomFromRanges([
      { start: 500, end: 600, chance: 50 },
      { start: 700, end: 800, chance: 40 },
      { start: 900, end: 1100, chance: 10 }
    ]);
    const baseScale = Math.log2(this.enemyCount + 1);
    const scaleUp = 1 + baseScale * 0.13;
    const scaleDown = 1 - baseScale * 0.13;
    hp *= scaleUp;
    const config = enemyTypes["Boss"];
    const boss = new Boss(Math.random() * 600, Math.random() * 400, hp, bossSprite, Math.round(getRandomFromRanges(config.shootingSpeedRanges) * scaleDown), Math.round(getRandomFromRanges(config.movementSpeedRanges) * scaleUp),
                  Math.round(getRandomFromRanges(config.damageRanges) * scaleUp), Math.round(7*scaleUp));
    return boss;
  }
  
}
