'use strict';

const   videosModel     = require('../models/videos-model'),
        errors          = require('../middlewares/errors'),
        ratingModel     = require('../models/rating-model'), 
        commentModel    = require('../models/comments-model'),
        authModel       = require('../models/auth-model'),
        url             = require('url'),
        formidable      = require('formidable'),
        fs              = require('fs');

const Youtube = require("../lib")
    , readJson = require("r-json")
    , Lien = require("lien")
    , Logger = require("bug-killer")
    , opn = require("opn")
    , prettyBytes = require("pretty-bytes");


// I downloaded the file from OAuth2 -> Download JSON
const CREDENTIALS = readJson(`${__dirname}/credentials.json`);
// Init lien server
let server = new Lien({
    host: "localhost"
  , port: 5000
});

function UpdateVisits(id_video){    
    videosModel.updateVisitas(id_video);
}


class VideosController{  


    uploadYoutube(request, response, next){
        let oauth = Youtube.authenticate({
            type: "oauth"
            , client_id: CREDENTIALS.web.client_id
            , client_secret: CREDENTIALS.web.client_secret
            , redirect_url: CREDENTIALS.web.redirect_uris[0]
        });

        opn(oauth.generateAuthUrl({
            access_type: "offline", 
            scope: ["https://www.googleapis.com/auth/youtube.upload"]
        }));
        let mytitl = request.body.mytitle;
        let mydescriptio = request.body.mydescription;

        const videonuevo = formidable.IncomingForm();
        videonuevo.parse(request);
        videonuevo.uploadDir='controllers';
        
        videonuevo.on('fileBegin',(field, file) => {
            file.path = "./controllers/"+file.name;
        }); 
        //videonuevo.on('file', function(name,file){
          //  console.log("subido " + file.name);
        //})
        //validamos que los campos de texto no esten vacios
    if(mytitl== " "){
        console.log("no se puede subir un video sin titulo")
    }else{
    server.addPage("/oauth2callback", lien => {
        Logger.log("Trying to get the token using the following code: " + lien.query.code);
        oauth.getToken(lien.query.code, (err, tokens) => {

        if (err) {
            lien.lien(err, 400);
            return Logger.log(err);
        }
        Logger.log("Got the tokens.");
        oauth.setCredentials(tokens);
        lien.end("The video is being uploaded. Check out the logs in the terminal.");
            var req = Youtube.videos.insert({
                resource: {
                // Video title and description
                     snippet: {
                        title: mytitl
                        , description: mydescriptio
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
                        body: fs.createReadStream(path,(file))
                    }
                }, (err, data) => {
                    console.log("Done.");
                    process.exit();//fin de process.exit
                });
            });
        });
        
        }//fin del else
     }//fin de uploadyoutube*/


    getAll(request, response, next){
        let search = '';
        if(request.query.search){
            search = request.query.search;
        }else{
            search = '';
        }
        
        return (request.session.username)
            ?   videosModel.getAll(search,(error, data) => {
                    if(!error){
                        videosModel.getAllCategorias((err, categorias)=>{
                            if(!err){
                                response.render('index', {
                                    title: 'Videos',
                                    user : request.session.username,
                                    avatar : request.session.avatar,
                                    data: data,
                                    categorias: categorias,
                                    search: search
                                });
                            }
                        });
                    }
                })
            :   errors.http401(request, response, next);
    }    

    //edita un video 
    getOne(request, response, next){
        let id = request.params.id;
        return (request.session.username)
            ?   videosModel.getOne(id, (error, data)=>{
                    if(!error){
                        response.render('edit',{
                            title: 'Editar video',
                            user: request.session.username,
                            avatar : request.session.avatar,
                            id_auth: request.session.id_auth,
                            data: data
                        });
                    }
                })
            :   errors.http401(request, response, next);
    }

    //muestra los detalles del video
    getDetails(request, response, next){
        let id_video = request.params.id;
        let id_user = request.session.id_auth;        
        return (request.session.username)
            ?   videosModel.getOne(id_video, (error, data) => {
                    if(!error){
                        UpdateVisits(id_video);
                        ratingModel.getRateOfUser(id_user, id_video, (error, rating)=>{
                            if(!error){
                                commentModel.getCommentAllVideo(id_video, (error, messageData)=>{
                                    if(!error){
                                        response.render('details',{
                                            title: 'Publicación con lujo de detalle',
                                            user: request.session.username,
                                            avatar : request.session.avatar,
                                            id_auth: id_user,
                                            full_name: request.session.full_name,
                                            data: data,
                                            rating: rating,
                                            comments: messageData
                                        });
                                    }
                                });
                                
                            }
                        })
                    }
                })
            :   errors.http401(request, response, next);
    }

    getAllUsersWhoHaveRated(request, response, next){
        let id_video = request.params.id_video;
        ratingModel.getAllUsersWhoHaveRated(id_video, (error, votos)=>{
            if(!error){
                response.render('ratingOfUsers', {
                    title: 'Calificación de los usuarios',
                    user: request.session.username,
                    avatar : request.session.avatar,
                    id_video: id_video,
                    data: votos
                });
            }
        });
    }
    
    getProfile(request, response, next){
        let id_auth = request.session.id_auth;
        return (request.session.username)
            ?   videosModel.getAllVideosByUser(id_auth, (error, data) => {
                    if(!error){
                        authModel.getOneUser(id_auth,(error, user)=>{
                            if(!error){
                                response.render('profile',{
                                    title: 'Perfil - Publicaciones',
                                    user: request.session.username,
                                    avatar : request.session.avatar,
                                    data_user: user,
                                    data: data,
                                    error_image: request.query.error_image
                                });
                            }
                        })
                    }
                })
            :   errors.http401(request, response, next);
    }


    getProfileUser(request, response, next){
        let id_auth = request.params.idUser;
        return (request.session.username)
            ?   videosModel.getAllVideosByUserDetails(id_auth, (error, data) => {
                    if(!error){
                        authModel.getOneUser(id_auth,(error, user)=>{
                            if(!error){
                                response.render('profileUser',{
                                    title: 'Perfil - Actividad',
                                    user: request.session.username,
                                    avatar : request.session.avatar,
                                    data_user: user,
                                    data: data,
                                    error_image: request.query.error_image
                                });
                            }
                        })
                    }
                })
            :   errors.http401(request, response, next);
    }

    //actualiza foto de perfil
    uploadAvatar(request, response, next){
        let formidable = require('formidable');
        var form = new formidable.IncomingForm();
        let avatar, name, extension;
        //form.uploadDir = './public/image/avatars/';
        form.keepExtensions = true;
        form.parse(request, (error, fields, files)=>{
            name = files.avatar.name.split(".").shift();
            extension = files.avatar.name.split(".").pop();
            avatar = `${name}${fields.id_auth}.${extension}`;
            if(files.avatar.type == 'image/png' || files.avatar.type == 'image/jpg' || files.avatar.type == 'image/jpeg'){
                authModel.updateAvatar(avatar,fields.id_auth, (error)=>{
                    fs.rename(files.avatar.path, './public/image/avatars/'+avatar);
                    response.redirect('/perfil');
                });
            }else{
                response.redirect('/perfil?error_image=Seleccione una imagen válida!!');
            }

        });
    }

    //guarda un video 
    save(request, response, next){
        let ID_youtube;
        if(request.body.urlVideo.split('=').length != 1){
            ID_youtube = request.body.urlVideo.split('=')[1].split('&')[0];
        }else{
            ID_youtube = request.body.urlVideo.split('/').pop();
        }
        let video = {
            id : parseInt((request.body.id || 0)),
            titulo : request.body.titulo,
            descripcion : request.body.descripcion,
            url : ID_youtube,
            id_auth : parseInt(request.body.id_auth),
            id_categoria : parseInt(request.body.categoria)
        };        
        return (request.session.username)
            ?   videosModel.save(video, (error) => {
                    if(!error){
                        response.redirect('/perfil');
                    }else{
                        return next(new Error('Registro no salvado'));
                    }
                })
            :   errors.http401(request, response, next);
    }

    
    delete(request, response, next){
        let id = request.params.id;
        console.log(id);
        return (request.session.username)
            ?   videosModel.delete(id, (error) => {
                    if(!error){
                        response.redirect('/');
                    }else{
                        return next(new Error('Registro no encontrado'));
                    }
                })
            :   errors.http401(request, response, next);
    }

    //pagina para nombrar al formulario y agregarlo
    addForm(request, response, next){
    //nos permite autenticarnos en gmail para acceder a la api de youtub
        return (request.session.username)
            ?   videosModel.getAllCategorias((error, data) => {
                    if(!error){
                        response.render('add',{
                            title: 'Agregar nuevo video',
                            user: request.session.username,
                            avatar : request.session.avatar,
                            id_auth: request.session.id_auth,
                            data: data
                        });
                    }
                })
            :   errors.http401(request, response, next);
    }

    //muestra la calificacion de los videos
    calificarVideo(request, response, next){
        const datos = {
            votos : request.body.votos,
            id_auth : request.body.id_auth,
            id_video : request.body.id_video
        };
        ratingModel.votar(datos, (error)=>{
            if(!error){
                ratingModel.getRateAllVideo(datos.id_video, (err, allVotos)=>{
                    if(!err){
                        var totalVotos = allVotos[0].total_votos;
                        response.status(200).json({
                            countVotos: totalVotos
                        });
                    }
                });
            }
        });
    }

    comentarVideo(request, response, next){
        const comentario = {
            mensaje : request.body.comment,
            id_auth : request.body.id_auth_comment,
            id_video : request.body.id_video_comment
        };
        commentModel.comentar(comentario, (error)=>{
            if(!error){
                response.send('Bien');
            }
        });
    }   
}
    

    

module.exports = new VideosController;