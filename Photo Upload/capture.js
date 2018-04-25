var data = null;
(function() {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = 300;    // We will scale the photo width to this
  var height = 0;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.
  var video = null;
  var canvas = null;
  var startbutton = null;
  var output = null;
  var camera = null;
  var blob = null;
  function startup() {
    video = document.getElementById('gum');
    canvas = document.getElementById('canvas');
    startbutton = document.getElementById('record');
    output = document.getElementById('recordedDiv');
    camera = document.getElementById('gumDiv');

    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);

    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
      
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.
      
        if (isNaN(height)) {
          height = width / (4/3);
        }
      
        height = height -7;
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startbutton.addEventListener('click', function(ev){
          if(startbutton.textContent == "Click!"){
    	  startbutton.textContent = "Upload";
    	  camera.style.display = "none";
          output.style.display = "block";
          takepicture();
          ev.preventDefault();
      }
      else{
    	  upload();
      }
     
    }, false);
    
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }
  
  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext('2d');
    
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    
      data = canvas.toDataURL('image/png');
      
      canvas.toBlob(function(iblob) {
    	  
    	  blob = iblob;
    	  
    	});
      
    } else {
      //clearphoto();
    	
    }
  }
  
  
  function upload(){
		
		var date = new Date;
		var str = date.getFullYear().toString() + (date.getMonth() + 1 <10 ? "0" + (date.getMonth()+1) : date.getMonth()+1).toString() + date.getDate().toString() ;
		str += (date.getHours()<10 ? "0" + (date.getHours()) : date.getHours()).toString() +  (date.getMinutes()<10 ? "0" + (date.getMinutes()) : date.getMinutes()).toString() + (date.getSeconds()<10 ? "0" + (date.getSeconds()) : date.getSeconds()).toString()
		var ext = ".png";
		var file_name = `${str}${ext}`;
		var objKey = directory + file_name;
		console.log(blob);
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
	        	
	        	startbutton.textContent = 'Success!';
	            startbutton.disabled = true;
	            window.location.reload(false);
	        }
	        
	    });
		
		
	}
  
  
  window.addEventListener('load', startup, false);
})();

