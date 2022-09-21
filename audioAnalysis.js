let fft, stereoIn;

function setup() {
  createCanvas(0, 0);
  stereoIn = new p5.AudioIn();
  stereoIn.start();
  fft = new p5.FFT(0.985);
  fft.setInput(stereoIn);
}

function draw() {
  let spectrum = fft.analyze(512);
  // example of one frequency analysis band
  // see the getEnergy documentation for more info on what you can
  // define the band as - but it returns a range of 0 - 255

  // the remap function takes in the fft value and maps it to a range
  // defined by the second two numbers. uncomment the line below to 
  // see in the console an example of remaping the mid to a 0 - 100 range
  // console.log(remapEnergy(mid, 0, 100));

  // below i've implemented bass/mid/hi to the three phase axes - hopefully makes sense
  // let bass = remapEnergy(fft.getEnergy(50,140),230,225);
  let mid = remapEnergy(fft.getEnergy(140,400),175,184);
  let treble = remapEnergy(fft.getEnergy(400,14000),33,43);

  // document.documentElement.style.setProperty("--font-var-one", bass);
  document.documentElement.style.setProperty("--font-var-two", mid);
  document.documentElement.style.setProperty("--font-var-three", treble);

  bassSlider = document.getElementById("bass-slider"); bassNum = document.getElementById("bass-num");
  midSlider = document.getElementById("mid-slider"); midNum = document.getElementById("mid-num");
  hiSlider = document.getElementById("hi-slider"); hiNum = document.getElementById("hi-num");

  bassSlider.value = bassNum.value = bass*2.25;
  midSlider.value = midNum.value = mid*2.25;
  hiSlider.value = hiNum.value = treble*2.25;

}

function remapEnergy(energyInput, floor, ceiling){
  // this expects the 0 - 255 range of the getEnergy
  // return floor + (ceiling - floor) * energyInput/255;
  return (energyInput - floor)/(ceiling - floor) * 100;
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
      document.getElementById("current-prompt").innerHTML = "That’s a beautiful colour, it looks perfect in your memory palace. What is something you have lost?";
      document.getElementById("bgText").innerHTML = "That’s a beautiful colour, it looks perfect in your memory palace. What is something you have lost?";
      // document.getElementById("current-prompt").innerHTML = res.data[0][0].currentPrompt;
      // document.getElementById("bgText").innerHTML = res.data[0][0].currentPrompt;
    });
  setTimeout(liveUpdate, 5000)
}

liveUpdate();
