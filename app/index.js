const fs = require('fs');
//librerias necesarias para la api de youtube
const   google = require('googleapis'); //requerimos googleapis
const   OAuth2 = google.auth.OAuth2; //Definimos OAuth2

//login a google
var oauth2Client = new OAuth2(
    '854329116218-rne4p68fogaqaa991jgdm0rntdncc9j7.apps.googleusercontent.com ', //id de cliente
    'mXKg617JS5r3NxSBWGDmonVU' //secreto de cliente
);

oauth2Client.setCredentials({
    access_token: 'ya29.GltqBlkrIpJJmv2hFNcHWzsk9AL-RbyLiRqWEpNz8MZwo_sq0OIsnzgNCMXh_Yqht7Gr38n1Hh7vZeTlvuny9C_IchEv69QYg_l8ZfIx7yzoS06KgcOaWtBQ5SHQ',
    refresh_token: '1/jYyv_riLJQYe-9LerD6ytG_9akmUiWGsZkb262gQq4U' 
});

google.options({ auth: oauth2Client}, function(error, response){
    console.log("se esta ejecutando la inserccion");
    if(error) throw error;
    console.log(response);
});

var youtube = google.youtube('v3');

var options = {
    resource: {
        snippet:{
            title: 'subida desde youtube api con nodejs',
            description: 'la subida fue correcta con nodejs'
        },
        status:{
            privacySatus: 'private'
        }
    },
    part:'snippet, status',
    media:{
        body: fs.createReadStream('video.mp4')
    }
};

youtube.videos.insert(options, function(err,data){
    if(err) throw err;
    console.log(data);
});