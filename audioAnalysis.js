let fft, stereoIn;

function setup() {
  createCanvas(0, 0);
  stereoIn = new p5.AudioIn();
  stereoIn.start();
  fft = new p5.FFT();
  fft.setInput(stereoIn);
}

function draw() {
  let spectrum = fft.analyze();
  // example of one frequency analysis band
  // see the getEnergy documentation for more info on what you can
  // define the band as - but it returns a range of 0 - 255
  let mid = fft.getEnergy("mid");
  // the remap function takes in the fft value and maps it to a range
  // defined by the second two numbers. uncomment the line below to 
  // see in the console an example of remaping the mid to a 0 - 100 range
  // console.log(remapEnergy(mid, 0, 100));

  // below i've implemented bass/mid/hi to the three phase axes - hopefully makes sense
  let bass = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");
  document.documentElement.style.setProperty("--font-var-one", remapEnergy(bass, 0, 100));
  document.documentElement.style.setProperty("--font-var-two", remapEnergy(mid, 0, 100));
  document.documentElement.style.setProperty("--font-var-three", remapEnergy(treble, 0, 100));
}

function remapEnergy(energyInput, floor, ceiling){
  // this expects the 0 - 255 range of the getEnergy
  return floor + (ceiling - floor) * energyInput/255;
}

// get latest prompt from server
function liveUpdate(){
  fetch(`https://room2.fm/api/getLiveUpdate`, {
    headers: {
      'Content-type': 'application/json'
    },
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({ lastResponseID: 0})
  })
    .then(res => res.json())
    .then(res => {
      document.getElementById("current-prompt").innerHTML = res.data[0][0].currentPrompt;
      document.getElementById("bgText").innerHTML = res.data[0][0].currentPrompt;
    });
  setTimeout(liveUpdate, 5000)
}

liveUpdate();