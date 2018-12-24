
//creamos un nuevo video 
function nuevovideo() {
 	var abri = $("#abrir");
 	if (abri.length == 0){
 		console.log("el boton abri no existe");
 	}else{
 		//window.open("C:/Users/ramirez/Downloads" , "ventana1" , "width=120, height=300, scrollbars=NO") 
 		console.log("el boton abrir si existe");
       $.ajax({
        url: 'https://www.googleapis.com/auth/youtube.upload"',
        type: POST,
        data: Youtube.videos.insert({
            resource: {
                // Video title and description
                snippet: {
                    title: 'prueba desde nodejs'
                  , description: 'prueba desde nodejs comentario'
                }
                // I don't want to spam my subscribers
              , status: {
                    privacyStatus: "private"
                }
            }
            // This is for the callback function
          , part: "snippet,status"

            // Create the readable stream to upload the video
          , media: {
                body: fs.createReadStream('video2.mp4')
            }
        }, (err, data) => {
            console.log("Done.");
            process.exit();
        });

      }).done(function(data){

      })//fin de ajax
            setInterval(function () {
            Logger.log(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`);
                }, 250);
 
};//fin del else

