(function (red5prosdk) {
    'use strict';

    var watchButton = document.querySelector('#watch');
    var rtcSubscriber = new red5prosdk.RTCSubscriber();
    var targetPublisher;
    var config = {
        protocol: 'ws',
        host: '192.168.15.145',
        port: 5080,
        app: 'live',
        mediaElementId: 'vid',
        rtcConfiguration: {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            iceCandidatePoolSize: 2,
            bundlePolicy: 'max-bundle'
        }
    };

    watchButton.addEventListener('click', function (event) {
        config.streamName = document.getElementById('stream-name').value.replace(/ /g, '');
        subscribe();
    });

    function subscribe() {
        rtcSubscriber.init(config)
            .then(function () {
                var video = document.getElementById('vid');
                video.play();
                var divWatch = document.getElementsByClassName('live')[0];
                divWatch.setAttribute('style', 'display:none');
                return rtcSubscriber.subscribe();
            })
            .then(function () {
                console.log('Playing!');
            })
            .catch(function (err) {
                console.log('Could not play: ' + err);
            });
    }

}(window.red5prosdk));
