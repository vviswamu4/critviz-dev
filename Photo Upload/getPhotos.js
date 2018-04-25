var href = "";
var bucketUrl = ""; 

bucket.listObjects(function (err, data) {
	  if(err)throw err;
	  href = this.request.httpRequest.endpoint.href;
	  bucketUrl = href + bucketName + '/';
	  display(data);
	});



function display(data){
	var count = 1;
	
	var waveObjects = {};
	
	data.Contents.forEach(function(n){
		console.log(n.Key);
		if(n.Key == directory){
			return;
		}
		
		var audioKey = n.Key;
		var audioUrl = bucketUrl + encodeURIComponent(audioKey);
		
		var grid = document.querySelector('#columns');
        var item = document.createElement('div');
        var h = '<div>';
        
        h += "<img src='"+audioUrl+"'></img>"
        h += '</div>';
        
        salvattore['append_elements'](grid, [item]);
        item.outerHTML = h;
	
	});
	
}

