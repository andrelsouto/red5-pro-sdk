(function (red5prosdk) {
  'use strict';

  var captureButton = document.querySelector('#captureButton');
  var rtcPublisher = new red5prosdk.RTCPublisher();
  var rtcSubscriber = new red5prosdk.RTCSubscriber();
  var targetPublisher;
  var config = {
    protocol: 'wss',
    host: 'red5.vsoft.com.br',
    port: 443,
    app: 'live',
    mediaElementId: 'vid',
    streamName: `stream - ${new Date().getMilliseconds()}`,
    rtcConfiguration: {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      iceCandidatePoolSize: 2,
      bundlePolicy: 'max-bundle'
    }
  };

  function subscribe() {
    rtcSubscriber.init(config)
      .then(function () {
        return rtcSubscriber.subscribe();
      })
      .then(function () {
        console.log('Playing!');
      })
      .catch(function (err) {
        console.log('Could not play: ' + err);
      });
  }

  rtcPublisher.init(config)
    .then(function (e) {
      rtcPublisher.on(red5prosdk.PublisherEventTypes.PUBLISH_START, subscribe);
      targetPublisher = e;
      return rtcPublisher.publish();
    })
    .then(function () {
      console.log('Publishing!');
    })
    .catch(function (err) {
      console.error('Could not publish: ' + err);
    });

  captureButton.addEventListener('click', swapCamera);

  function swapCamera() {
    if (captureButton.textContent === 'Compartilhar') {

      navigator.mediaDevices.getDisplayMedia()
        .then((stream) => swap(stream))
        .catch(function (error) {
          console.error('Could not replace track : ' + error.message);
        });
    }

    if (captureButton.textContent === 'Parar de compartilhar') {
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((stream) => swap(stream))
        .catch(function (error) {
          console.error('Could not replace track : ' + error.message);
        });
    }
  }

  function swap(stream) {

    var connection = targetPublisher.getPeerConnection();
    var senders = connection.getSenders();
    var tracks = stream.getTracks();
    var i = senders.length;
    var j = tracks.length;
    while (--i > -1) {
      if (senders[i].track.kind === 'video') {
        break;
      }
    }
    if (i < 0) {
      console.error('Could not replace track : No video stream in connection');
      return;
    }
    var replacePromise;
    while (--j > -1) {
      if (tracks[j].kind === 'video') {
        senders[i].track.stop();
        replacePromise = senders[i].replaceTrack(tracks[j]);
        break;
      }
    }
    document.getElementById('vid').srcObject = stream;
    captureButton.textContent = captureButton.textContent === 'Compartilhar' ? 'Parar de compartilhar' : 'Compartilhar';
    return replacePromise;
  }

}(window.red5prosdk));
