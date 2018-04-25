
'use strict';

/* globals MediaRecorder */

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);

var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var gumVideo = document.querySelector('video#gum');
var recordedVideo = document.querySelector('video#recorded');

var recordButton = document.querySelector('button#record');
recordButton.onclick = toggleRecording;

// window.isSecureContext could be used for Chrome
/*var isSecureOrigin = location.protocol === 'https:' ||
location.hostname === 'localhost';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}*/

var constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  gumVideo.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

recordedVideo.addEventListener('error', function(ev) {
  console.error('MediaRecording.recordedMedia.error()');
  alert('Your browser can not play\n\n' + recordedVideo.src
    + '\n\n media clip. event: ' + JSON.stringify(ev));
}, true);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}

function toggleRecording() {
  if (recordButton.textContent === 'Record') {
    startRecording();
  } else {
	  if ((recordButton.textContent === 'Stop')){
		  stopRecording();
		  play();
		  recordButton.textContent = 'Upload';
		  
	  }
	  else{
		  
		  upload();
		  //recordButton.textContent = 'Start';
	  }
    
  }
}

function startRecording() {
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: ''};
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    alert('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop';
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  //console.log('Recorded Blobs: ', recordedBlobs);
  recordedVideo.controls = true;
}

function play() {
  var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  $("#recordedDiv").css("display","block");
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.addEventListener('loadedmetadata', function() {
  recordedVideo.play();
    
  });
}

function download() {
	  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
	  var url = window.URL.createObjectURL(blob);
	  var a = document.createElement('a');
	  a.style.display = 'none';
	  a.href = url;
	  a.download = 'test.webm';
	  document.body.appendChild(a);
	  a.click();
	  setTimeout(function() {
	    document.body.removeChild(a);
	    window.URL.revokeObjectURL(url);
	  }, 100);
}

function upload(){
	
	var blob = new Blob(recordedBlobs, {type: 'video/webm'});
	var url = window.URL.createObjectURL(blob);
	var date = new Date;
	var str = date.getFullYear().toString() + (date.getMonth() + 1 <10 ? "0" + (date.getMonth()+1) : date.getMonth()+1).toString() + date.getDate().toString() ;
	str += (date.getHours()<10 ? "0" + (date.getHours()) : date.getHours()).toString() +  (date.getMinutes()<10 ? "0" + (date.getMinutes()) : date.getMinutes()).toString() + (date.getSeconds()<10 ? "0" + (date.getSeconds()) : date.getSeconds()).toString()
	var ext = ".webm";
	var file_name = `${str}${ext}`;
	var objKey = directory + file_name;
    var params = {
        Key: objKey,
        ContentType: "Blob",
        Body: blob,
        ACL: 'public-read'
    };

    bucket.putObject(params, function(err, data) {
        if (err) {
            console.log(err);
            
        } else {
        	
        	recordButton.textContent = 'Success!';
            recordButton.disabled = true;
            window.location.reload(false);
        }
        
    });
	
	
}

