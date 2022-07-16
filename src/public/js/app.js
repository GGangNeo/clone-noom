const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');

let muted = false;
let cameraOff = false;
let myStream;

async function getCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    cameras.forEach((camera) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
    console.log(myStream);
    await getCamera();
  } catch (e) {
    console.log(e);
  }
}

getMedia();

superEventHandler = {
  handleMuteClick() {
    myStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
      muted = true;
      muteBtn.innerText = 'Unmute';
    } else {
      muted = false;
      muteBtn.innerText = 'Mute';
    }
  },
  hadleCameraClick() {
    myStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));

    if (cameraOff) {
      cameraOff = false;
      cameraBtn.innerText = 'Turn Camera Off';
    } else {
      cameraOff = true;
      cameraBtn.innerText = 'Turn Camera On';
    }
  },
};

muteBtn.addEventListener('click', superEventHandler.handleMuteClick);
cameraBtn.addEventListener('click', superEventHandler.hadleCameraClick);
