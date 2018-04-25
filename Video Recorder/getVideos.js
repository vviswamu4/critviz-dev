//Setting S3 configurations

AWS.config.region = 'us-east-1'; // 1. Enter your region

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:8f030282-3313-4787-a95e-67812e070a0c' // 2. Enter your identity pool
});

AWS.config.credentials.get(function(err) {
    if (err) alert(err);
});


//S3 configurations end

//Querying S3 bucket to list audio files

var directory = "video/"

var bucketName = 'critvizaudio'; // Enter your bucket name
var bucket = new AWS.S3({
    params: {
        Bucket: bucketName,
        Delimiter: '/',
        Prefix: 'video/'
    }
});

var href = "";
var bucketUrl = ""; 

bucket.listObjects(function (err, data) {
	  if(err)throw err;
	  href = this.request.httpRequest.endpoint.href;
	  bucketUrl = href + bucketName + '/';
	  display(data);
	});



function display(data){
	
	data.Contents.forEach(function(n){
		if(n.Key == directory){
			return;
		}
		
		var videoKey = n.Key;
		var videoUrl = bucketUrl + encodeURIComponent(videoKey);
		
		var grid = document.querySelector('#columns');
        var item = document.createElement('div');
        var h = '<div>';
        h += "<video controls src='"+videoUrl+"'></video>";
        h += '</div>';
        salvattore['append_elements'](grid, [item]);
        item.outerHTML = h;
	
	});
	
}

