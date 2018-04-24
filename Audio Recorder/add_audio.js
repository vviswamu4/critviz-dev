//GetUserMedia start

$(document).ready(function(){
	startup();
});


function startup(){
	var log = console.log.bind(console);
	var audioCtx = new (window.AudioContext || webkitAudioContext)();
	var canvas = document.querySelector('.visualizer');
	var recorder = null;
	
	//timer setup
	var hours=0, seconds=0, minutes=0, t;
	
	//send to S3
	var file_name;
	var blob_glob;
	
	var mediaOptions = {
	        video: {
	          tag: 'video',
	          type: 'video/webm',
	          ext: '.mp4',
	          gUM: {video: true, audio: true}
	        },
	        audio: {
	          tag: 'audio',
	          type: 'audio/mp3',
	          ext: '.mp3',
	          gUM: {audio: true}
	        }
	      };
	var canvasCtx = canvas.getContext("2d");
	
	var wavesurfer = WaveSurfer.create({
	    container: '#waveform',
	    height:50,
	    width:400,
	    hideScrollbar: true
	    
	});
	
	
	reset();
	
	
	//GetUserMedia Configurations
	media =  mediaOptions.audio;
	navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
	stream = _stream;
	recorder = new MediaRecorder(stream);
	   
	//Visualizing Waveform
	visualize(stream);
	    
	//Getting media 
	recorder.ondataavailable = e => {
	  chunks.push(e.data);
	  if(recorder.state == 'inactive')  makeLink();
	  };
	 log('got media successfully');
	}).catch(log);
	
	
	
	function reset(){
		$("#waveform").css("display", "none");
		if(recorder != null && recorder.state == 'active'){
			recorder.state == 'inactive';
		}
		$("#streamWave").css("display", "block");
		$("#timer").css("display", "block");
		$("#start").html("Start");
		resetTimer();
		document.getElementById("start").disabled = false;
	}
	
	
	//Handling Start, Stop and Upload buttons
	
	$("#start").bind('click', function() {
		$(this).text() == 'Start' ? start() : $(this).text()=='Stop' ? stop() : upload();
	});
	
	function start(){
		$("#start").html("Stop");
		chunks=[];
		recorder.start();
		startTimer();		
	}
	
	
	function stop(){
		$("#start").html("Upload");
		recorder.stop();
		resetTimer();
		$("#streamWave").css("display","none");
	    $("#waveform").css("display","block");
	    
	    $("#waveform").on("click", function(){
	    	
	    	if(wavesurfer.isPlaying() == false){
	    		wavesurfer.play();
	    		
	    	}
	    	else{
	    		wavesurfer.play();
	    	}
	    });
	}
	
	function upload(){
		sendToS3();
		
	}
	
	//Timer while recording	
	function startTimer(){
		t = setTimeout(add, 1000);
		
	}

	function add() {
	    seconds++;
	    if (seconds >= 60) {
	        seconds = 0;
	        minutes++;
	        if (minutes >= 60) {
	            minutes = 0;
	            hours++;
	        }
	    }
	    
	    $("#timer").text((hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds));
	    
	    $("#timer").color= "white";
	    
	    startTimer();
	}
	
	
	function resetTimer(){
		clearTimeout(t);
	    seconds = 0; minutes = 0; hours = 0;
	    $("#timer").text("00:00:00");
	 }
	
	//Timer code end
	
	
	function makeLink(){
		  let blob = new Blob(chunks, {type: media.type })
		    , url = URL.createObjectURL(blob)
		    , li = document.createElement('div')
		    , mt = document.createElement(media.tag)
		    , hf = document.createElement('a')
		  ;
		  blob_glob = blob;
		  blob_url = url;
		  hf.href = url;
		  var date = new Date;
		  var str = date.getFullYear().toString() + (date.getMonth() + 1 <10 ? "0" + (date.getMonth()+1) : date.getMonth()+1).toString() + date.getDate().toString() ;
		  str += (date.getHours()<10 ? "0" + (date.getHours()) : date.getHours()).toString() +  (date.getMinutes()<10 ? "0" + (date.getMinutes()) : date.getMinutes()).toString() + (date.getSeconds()<10 ? "0" + (date.getSeconds()) : date.getSeconds()).toString()
		  hf.download = `${str}${media.ext}`;
		  file_name = `${str}${media.ext}`;
		  file_size = blob.size;
		  hf.innerHTML = `${hf.download}`;
		  $("#timer").text(file_name);
		  
		  wavesurfer.empty();
		  wavesurfer.load(url);
		  
		  
		}
	
	
	function sendToS3(file){
		
		var objKey = directory + file_name;
	    var params = {
	        Key: objKey,
	        ContentType: "Blob",
	        Body: blob_glob,
	        ACL: 'public-read'
	    };

	    bucket.putObject(params, function(err, data) {
	        if (err) {
	            console.log(err);
	            $("#timer").empty();
	            $("#timer").text("Error uploading file");
	            
	        } else {
	        	
	        	$("#timer").empty();
	            $("#timer").text("Success!");
	            window.location.reload(false);
	        }
	        document.getElementById("start").disabled = true;
	    });
		
	}

	
	
	function visualize(stream) {
		  var source = audioCtx.createMediaStreamSource(stream);

		  var analyser = audioCtx.createAnalyser();
		  analyser.fftSize = 2048;
		  var bufferLength = analyser.frequencyBinCount;
		  var dataArray = new Uint8Array(bufferLength);

		  source.connect(analyser);
		  //analyser.connect(audioCtx.destination);

		  draw();

		  function draw() {
		    let WIDTH = canvas.width,
		    HEIGHT = canvas.height;

		    requestAnimationFrame(draw);

		    analyser.getByteTimeDomainData(dataArray);

		    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
		    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		    canvasCtx.lineWidth = 2;
		    canvasCtx.strokeStyle = '#696969';
		    
		    canvasCtx.beginPath();

		    var sliceWidth = WIDTH * 1.0 / bufferLength;
		    var x = 0;


		    for(var i = 0; i < bufferLength; i++) {
		 
		      var v = dataArray[i] / 128.0;
		      var y = v * HEIGHT/2;

		      if(i === 0) {
		        canvasCtx.moveTo(x, y);
		      } else {
		        canvasCtx.lineTo(x, y);
		      }

		      x += sliceWidth;
		    }

		    canvasCtx.lineTo(canvas.width, canvas.height/2);
		    canvasCtx.stroke();

		  }
	}
	
	
}


