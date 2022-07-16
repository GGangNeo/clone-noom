const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');

let muted = false;
let cameraOff = false;
let myStream;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}

superEventHandler = {
  handleMuteClick() {
    if (!muted) {
      muted = true;
      muteBtn.innerText = 'Unmute';
    } else {
      muted = false;
      muteBtn.innerText = 'Mute';
    }
  },
  hadleCameraClick() {
    if (cameraOff) {
      cameraOff = false;
      cameraOff.innerText = 'Turn Camera Off';
    } else {
      cameraOff = true;
      cameraOff.innerText = 'Turn Camera On';
    }
  },
};

muteBtn.addEventListener('click', superEventHandler.handleMuteClick);
cameraBtn.addEventListener('click', superEventHandler.hadleCameraClick);
