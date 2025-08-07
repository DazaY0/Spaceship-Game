

document.addEventListener("DOMContentLoaded", async function () {
    const list = document.getElementById("highscore-list");
    if(getCookie("username")){
        document.getElementById("logged-in").innerHTML = "You are logged in as " + getCookie("username");
        document.getElementById("logged-in").classList.add("visible")
    }
    const loadingEl = document.getElementById("loading-text");
    gsap.to(loadingEl, {
        duration: 5,
        scrambleText: {
            text: loadingEl.innerHTML,
            tweenLength: false,
            speed: 4,
            revealDelay: 5
        },
        repeat: -1,
        yoyo: true
    });

    let data;
    try {
        const res = await fetch('http://localhost:5000/scores');

        if (!res.ok) {
            
            loadingEl.innerHTML = "Server didnt like u";
            gsap.killTweensOf(loadingEl);
            gsap.to(loadingEl, {
                duration: 2,
                scrambleText: {
                    text: loadingEl.innerHTML,
                    tweenLength: false,
                    speed: 3,
                    
                },


            });
            return;
        }

       data = await res.json();
       gsap.killTweensOf(loadingEl);
       loadingEl.style.display = "none";

    } catch (err) {
        // Network error, e.g., connection refused
        loadingEl.innerHTML = "Failed to load";
        gsap.killTweensOf(loadingEl);
        gsap.to(loadingEl, {
                duration: 2,
                scrambleText: {
                    text: loadingEl.innerHTML,
                    tweenLength: false,
                    speed: 3,
                    
                },


            });
            return;
        console.error('Fetch failed:', err);
    }

    

    data.sort((a, b) => b.score - a.score);

    list.classList.remove("hidden");

    data.forEach((element, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${element.name} - ${element.score}Pt`;
        li.classList.add("item");

        list.appendChild(li);
         gsap.to(li, {
            scrambleText: {
                text: `${element.name} - ${element.score}Pt`,
                //chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                speed: 2
            },
            delay: index * 0.25,
            duration: 3.5,
            onStart: () => li.classList.add("visible")
        });
    });
});


function showModal() {
  document.getElementById("registerModalPage").style.display = "flex";
}
function hideModal() {
  document.getElementById("registerModalPage").style.display = "none";
}
function register(){
    const input = document.getElementById("registerInput");
    if(input.value != ""){
        document.cookie = `username= ${input.value}; expires=Fri, 31 Dec 2099 23:59:59 GMT  ` 
    }
    else{
        document.getElementById("error").innerHTML = "no Username input";
    }
    hideModal();
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


window.hideModal = hideModal;
window.showModal = showModal;
window.register = register;