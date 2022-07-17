const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');
const call = document.getElementById('call');

call.hidden = true;

let muted = false;
let cameraOff = false;
let myStream;
let roomName;
let myPeearConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: 'user' },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

DeviceControlHandler = {
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
  handleCameraClick() {
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
  async handleCameraChange() {
    await getMedia();
  },
};

muteBtn.addEventListener('click', DeviceControlHandler.handleMuteClick);
cameraBtn.addEventListener('click', DeviceControlHandler.handleCameraClick);
camerasSelect.addEventListener(
  'input',
  DeviceControlHandler.handleCameraChange
);

// Welcome Form
const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

superEventHandler = {
  WelcomeSubmitHandle(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector('input');
    socket.emit('join_room', input.value, async () => {
      welcome.hidden = true;
      call.hidden = false;
      await getMedia();
      makeConnection();
    });
    roomName = input.value;
    input.value = '';
  },
};

welcomeForm.addEventListener('submit', superEventHandler.WelcomeSubmitHandle);

/**
 * https://gwanwoodev.github.io/introduction-webrtc/
 * getUserMedia()
 * addStream() *old way  ===> makeConnection()
 * createOffer()
 * setLocalDescription()
 * send offer ===>socket.on 'welcome'
 */
// Socket Code
socket
  .on('welcome', async () => {
    // console.log('someone joined');
    const offer = await myPeearConnection.createOffer();
    myPeearConnection.setLocalDescription(offer);
    socket.emit('offer', offer, roomName);
  })
  .on('offer', (offer) => {
    console.log(offer);
  });

function makeConnection() {
  myPeearConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach((track) => myPeearConnection.addTrack(track, myStream));
}
