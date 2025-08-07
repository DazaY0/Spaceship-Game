
const canvasShip = document.getElementById('canvasShip');
const ctxShip = canvasShip.getContext('2d');
let ships = [];
let currentShipIndex = 0;

function clearCanvas() {
    ctxShip.clearRect(0, 0, canvasShip.width, canvasShip.height);
}
window.addEventListener("resize", function(){
    if(window.innerWidth <= 600){
        canvasShip.width = window.innerWidth;
         displayShip(currentShipIndex);
    }
})


function loadText(element,speed, duration, delay){
    gsap.to(element, {
        duration: duration,
        scrambleText: {
            text: element.textContent,
            tweenLength: false,
            speed: speed,
            
        },
        delay: 0
        
    });
}

fetch('/resources/shipData.json')
  .then(response => response.json())
  .then(data => {
    ships = data;
    if(getCookie("currentShip")){
        currentShipIndex = getCookie("currentShip");
    }
    displayShip(currentShipIndex);
  })
  .catch(error => console.error('Error loading JSON:', error));


function displayShip(index) {
    const ship = ships[index];
    if (!ship) return;

    document.cookie = `currentShip=${index}; expires=Fri, 31 Dec 2099 23:59:59 GMT`;

   
    document.getElementById('name').textContent = ship.name;
    loadText(document.getElementById('name'), 1.5, 1.5 , 0);

    document.getElementById('hp').textContent = `HP: ${ship.hp}`;
    loadText(document.getElementById('hp'), 2,  1 , 0.1);

    document.getElementById('movementSpeed').textContent = `Movement Speed: ${ship.movementSpeed}`;
    loadText(document.getElementById('movementSpeed'), 2,  1 , 0.1);

    
    const bulletRow = document.getElementById('bullet');
    if (ship.Bullet) {
        bulletRow.style.display = 'block';
        document.getElementById('bulletDamage').textContent = `Damage:${ship.Bullet.damage}`;
        loadText(document.getElementById('bulletDamage'), 2,  1 , 0.2);

        document.getElementById('bulletSpeed').textContent = `Speed:${ship.Bullet.speed}`;
        loadText(document.getElementById('bulletSpeed'), 2,  1 , 0.2);

        document.getElementById('rpm').textContent = `Cooldown:${ship.Bullet.rpm}`;
        loadText(document.getElementById('rpm'), 2,  1 , 0.2);

    } else {
        bulletRow.style.display = 'none';
    }

    
    const beamRow = document.getElementById('beam');
    if (ship.Beam) {
        beamRow.style.display = 'block';
        document.getElementById('beamDamage').textContent = `Damage:${ship.Beam.damage}`;
        loadText(document.getElementById('beamDamage'), 2,  1 , 0.3);

        document.getElementById('beamDuration').textContent = `Duration:${ship.Beam.duration}`;
        loadText(document.getElementById('beamDuration'), 2,  1 , 0.3);

        document.getElementById('beamCooldown').textContent = `Cooldown:${ship.Beam.cooldown}`;
        loadText(document.getElementById('beamCooldown'), 2,  1 , 0.3);

    } else {
        beamRow.style.display = 'none';
    }

    
    const aimBulletRow = document.getElementById('aimBullet');
    if (ship.AimBullet) {
        aimBulletRow.style.display = 'block';
        document.getElementById('aimBulletDamage').textContent = `Damage:${ship.AimBullet.damage}`;
        loadText(document.getElementById('aimBulletDamage'), 2,  1 , 0.4);

        document.getElementById('aimBulletDuration').textContent = `Duration:${ship.AimBullet.duration}`;
        loadText(document.getElementById('aimBulletDuration'), 2,  1 , 0.4);

        document.getElementById('aimBulletCooldown').textContent = `Cooldown:${ship.AimBullet.cooldown}`;
        loadText(document.getElementById('aimBulletCooldown'), 2, 1 , 0.4);

    } else {
        aimBulletRow.style.display = 'none';
    }

    // Draw ship sprite
    clearCanvas();
    drawShipDisplay(ship.sprite, ctxShip);
}


function showNextShip() {
    
    currentShipIndex = (currentShipIndex + 1) % ships.length;
    console.log("showing next ship" +  currentShipIndex);
    displayShip(currentShipIndex);
}

function showPrevShip() {
    currentShipIndex = (currentShipIndex - 1 + ships.length) % ships.length;
    console.log("showing last ship" +  currentShipIndex);
    displayShip(currentShipIndex);
}

document.getElementById('nextBtn').addEventListener('click', showNextShip);
document.getElementById('prevBtn').addEventListener('click', showPrevShip);

 function drawShipDisplay(sprite, ctx) {
    console.log("drawing ship");

    const scale = 2; // 
    const offsetX = canvasShip.width / 2;
    const offsetY = canvasShip.height / 2;

    // Find the center of the original sprite (for proper scaling around center)
    const centerX = sprite.reduce((sum, p) => sum + p.x, 0) / sprite.length;
    const centerY = sprite.reduce((sum, p) => sum + p.y, 0) / sprite.length;

    sprite.forEach((part) => {
        const scaledX = (part.x - centerX) * scale + offsetX ;
        const scaledY = (part.y - centerY) * scale + offsetY; 

        const size = 5 * scale;

        ctx.fillStyle = 'lightgreen';
        ctx.strokeStyle = 'darkgreen';
        ctx.fillRect(scaledX, scaledY, size, size);
        ctx.strokeRect(scaledX, scaledY, size, size);
    });
}


function getCookie(cname) {
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
