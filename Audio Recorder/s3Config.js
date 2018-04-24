AWS.config.region = 'us-east-1'; // 1. Enter your region

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:8f030282-3313-4787-a95e-67812e070a0c' // 2. Enter your identity pool
});

AWS.config.credentials.get(function(err) {
    if (err) alert(err);
    console.log(AWS.config.credentials);
});



var directory = "sample_audio/"

var bucketName = 'critvizaudio'; // Enter your bucket name
var bucket = new AWS.S3({
    params: {
        Bucket: bucketName,
        Delimiter: '/',
        Prefix: 'sample_audio/'
    }
});


