const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');
const call = document.getElementById('call');
const messageForm = document.getElementById('message');

call.hidden = true;

let muted = false;
let cameraOff = false;
let myStream;
let roomName;
let myPeerConnection;
let myDataChannel;
let room_size = null;

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

const DeviceControlHandler = {
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
    await getMedia(camerasSelect.value);
    if (myPeerConnection) {
      const videoTrack = myStream.getVideoTracks()[0];
      const videoSender = myPeerConnection
        .getSenders()
        .find((sender) => sender.track.kind === 'video');
      videoSender.replaceTrack(videoTrack);
    }
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

const RtcEventHandler = {
  async WelcomeSubmitHandle(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector('input');
    console.log(room_size);
    if (room_size <= 1) {
      welcome.hidden = true;
      call.hidden = false;
      await getMedia();
      makeConnection();
      socket.emit('join_room', input.value);
      roomName = input.value;
      input.value = '';
      messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = messageForm.querySelector('input');
        const message = input.value;
        makeMessage('me', message);
        if (myDataChannel) myDataChannel.send(message);
      });
    } else {
      alert('could not enter the room.');
    }
    input.value = '';
  },
  IceHandle(data) {
    console.log('sent candidate');
    socket.emit('ice', data.candidate, roomName);
  },
  AddStreamHandle(data) {
    const peerFace = document.getElementById('peerFace');
    peerFace.srcObject = data.stream;
    console.log(data.stream);
    console.log(myStream);
  },
};

welcomeForm.addEventListener('submit', RtcEventHandler.WelcomeSubmitHandle);

const MessageHandler = {
  Createdhandle(event) {
    makeMessage('unknown', event.data);
  },
  Joinedhandle(event) {
    console.log('join');
    myDataChannel = event.channel;
    myDataChannel.addEventListener('message', (event) => {
      makeMessage('unknown', event.data);
    });
    myDataChannel.send('unknown join this channel');
  },
};

function makeMessage(name, msg) {
  const messageList = document.getElementById('messageList');
  const li = document.createElement('li');
  li.innerText = `${name} : ${msg}`;
  messageList.prepend(li);
}
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
    console.log('someone joined');
    // main browser create datachannel
    myDataChannel = myPeerConnection.createDataChannel('chat');
    myDataChannel.addEventListener('message', MessageHandler.Createdhandle);
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    // send offer to joined browser
    socket.emit('offer', offer, roomName);
  })
  .on('offer', async (offer) => {
    // joined browser register datachannel
    myPeerConnection.addEventListener(
      'datachannel',
      MessageHandler.Joinedhandle
    );

    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    // send answer to host browser
    socket.emit('answer', answer, roomName);
  })
  .on('answer', (answer) => {
    // host browser set the description
    myPeerConnection.setRemoteDescription(answer);
  })
  .on('ice', (ice) => {
    myPeerConnection.addIceCandidate(ice);
  })
  .on('denied', () => alert('Could not enter the room.'))
  .on('room_num', (num) => {
    room_size = num;
  });
// webrtc defeat, sfu
// npm i -g localtunner ==> lt --port 3000
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
        ],
      },
    ],
  });
  myPeerConnection.addEventListener('icecandidate', RtcEventHandler.IceHandle);
  myPeerConnection.addEventListener(
    'addstream',
    RtcEventHandler.AddStreamHandle
  );
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}
