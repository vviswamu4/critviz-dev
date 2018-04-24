var href = "";
var bucketUrl = ""; 

//list bucket objects
bucket.listObjects(function (err, data) {
	  if(err)throw err;
	  href = this.request.httpRequest.endpoint.href;
	  bucketUrl = href + bucketName + '/';
	  display(data);
	});



function display(data){
	var count = 1;
	
	//array of wavesurfer objects for each mp3 file
	var waveObjects = {};
	
	data.Contents.forEach(function(n){
		console.log(n.Key);
		if(n.Key == directory){
			return;
		}
		
		var audioKey = n.Key;
		var audioUrl = bucketUrl + encodeURIComponent(audioKey);
		
		var aContainer = "waveform"+count.toString();
		var filename = n.Key.split("/").pop();
		
		$("#audio").append("<tr><td style='width:150px'>"+filename+"</td><td><div id='"+aContainer+"'></div></td><tr>");

		var wavesurfer = WaveSurfer.create({
		    container: "#"+aContainer,
		    height: 50,
		    width:400,
		    hideScrollbar: true
		});
		
		waveObjects[aContainer] = wavesurfer;
		waveObjects[aContainer].load(audioUrl);
		
		$("#"+aContainer).on("click", function(){
			wavesurfer.playPause();
		});
				
		count += 1;
		
	});
	
	
}
