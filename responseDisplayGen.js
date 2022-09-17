// array of responses to display
let responsesToDisplay = [];
// maximum amount of responses on screen
let maxResponses = 4;
// lock on modifying the responses array
let isModResponseArray = false;
// time between checking if can add new response
let newResponseCheck = 1000;
const responseFadeTime = 1500;
const responseHangTime = 12000;

// id of the last response pulled from the server
let lastResponseID = 0;
// time in between live updates
let liveUpdateTime = 5000;

// current prompt to display
let currentPrompt = "";

//current screen height/width
let sHeight = window.innerHeight;
let sWidth = window.innerWidth;

// get latest info from server
function liveUpdate(){
  fetch(`https://room2.fm/api/getLiveUpdate`, {
    headers: {
      'Content-type': 'application/json'
    },
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({ lastResponseID: lastResponseID})
  })
    .then(res => res.json())
    .then(res => updateFromServerResponse(res.data));
  setTimeout(liveUpdate, liveUpdateTime)
}

//update state from latest server info
function updateFromServerResponse(serverResponse){
  // set up array to push other responses to
  let returnedResponses = [];
  // update the current prompt
  document.getElementById("current-prompt").innerHTML = serverResponse[0][0].currentPrompt;
  // add new responses to the returned responses array
  if(serverResponse[1].length){
    serverResponse[1].forEach(response => {
      returnedResponses.push([response.RESPONSE, response.RESPONSE_TYPE]);
      lastResponseID = response.id;
    });
    responsesToDisplay = responsesToDisplay.concat(returnedResponses);
    addResponseToScreen();
  } 
}

// keeps looping if there's responses to display and tries to add a new one if there's not over the max amount
function addResponseToScreen(){
  // check how many responses are currently on screen
  // if less then max add new response
  if(document.getElementsByClassName("Response").length < maxResponses && responsesToDisplay.length){
    let newResponse = responsesToDisplay.shift();
    if(newResponse[1] === "text"){
      createTextResponseDisplay(newResponse[0]);
    } else if(newResponse[1] === "image"){
      createImageResponseDisplay(newResponse[0]);
    }
    if(responsesToDisplay.length){
      addResponseToScreen();
    }
    
  } else if (document.getElementsByClassName("Response").length >= maxResponses) {
    setTimeout(addResponseToScreen, newResponseCheck);
  }
}

// create new test response display
function createTextResponseDisplay(textResponse){
  let newResponseBox = document.createElement('p');
  let collision = false;
  newResponseBox.innerHTML = textResponse;
  newResponseBox.classList.add('Response');
  newResponseBox.classList.add('TextResponseBox');
  let xRandom = Math.random();
  let yRandom = Math.random();
  document.getElementById('overlay-wrapper').appendChild(newResponseBox);
  let responseBoxDimensions = newResponseBox.getBoundingClientRect();
  newResponseBox.style.left = (80 * xRandom) + "%";
  newResponseBox.style.top = ((100 - (sHeight / responseBoxDimensions.height)) * yRandom) + "%";
  let colliderArray = Array.from(document.getElementsByClassName("Collider"));
  for (let i = 0; i < colliderArray.length; i++) {
    if(detect2DBoxCollision(newResponseBox.getBoundingClientRect(), colliderArray[i].getBoundingClientRect()) && !collision){
      collision = true;
    }
  }
  if(collision){
    newResponseBox.remove();
    window.requestAnimationFrame(() => createTextResponseDisplay(textResponse));
  } else {
    newResponseBox.classList.add("Collider");
    responseFadeInOut(newResponseBox);
  } 
}

function createImageResponseDisplay(imageResponse){
  let newResponseBox = document.createElement('img');
  let collision = false;
  newResponseBox.classList.add('Response');
  newResponseBox.classList.add('ImageResponseBox');
  let xRandom = Math.random();
  let yRandom = Math.random();
  newResponseBox.addEventListener("load", (e) => {
    // add to the page
    document.getElementById('overlay-wrapper').appendChild(newResponseBox);
    let responseBoxDimensions = newResponseBox.getBoundingClientRect();
    newResponseBox.style.left = (80 * xRandom) + "%";
    newResponseBox.style.top = ((100 - (sHeight / responseBoxDimensions.height)) * yRandom) + "%";
    let colliderArray = Array.from(document.getElementsByClassName("Collider"));
    for (let i = 0; i < colliderArray.length; i++) {
      if(detect2DBoxCollision(newResponseBox.getBoundingClientRect(), colliderArray[i].getBoundingClientRect()) && !collision){
        collision = true;
      }
    }
    if(collision){
      newResponseBox.remove();
      window.requestAnimationFrame(() => createImageResponseDisplay(imageResponse));
    } else {
      newResponseBox.classList.add("Collider");
      responseFadeInOut(newResponseBox);
    } 
  });
  newResponseBox.src = 'https://humstore.thelongesthum.world/'+imageResponse;
}

function detect2DBoxCollision(box1, box2){
  let collision = false;
  if(box1.left < box2.right &&
     box1.right > box2.left &&
     box1.top < box2.bottom &&
     box1.bottom > box2.top) {
      collision = true;
    }
  return collision;
}

function responseFadeInOut(responseElement){
  responseElement.style.transition = responseFadeTime + "ms";
  setTimeout(() =>{
    // responseElement.classList.add('FadeIn');
    responseElement.style.opacity = 1;
    setTimeout(() => {responseElement.style.opacity = 0;}, responseHangTime);
    setTimeout(() => {responseElement.remove(); addResponseToScreen();}, responseFadeTime + responseHangTime + 100);
  }, 100);
}

liveUpdate();
