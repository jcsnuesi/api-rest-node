'use strict'

var Topic = require('../models/topic')
var validator = require('validator');


var controller = {

    add: function(req, res){

        //Recoger el id del topic de la url
        var topicId = req.params.id;
      
        //Find por id del topic

        Topic.findById(topicId).exec((err, topics) =>{
             
             if(err){

                return res.status(500).send({
                    status: "error",
                    message: "Error en la peticion"
                });
          
             }

             if(!topics){

                return res.status(404).send({
                    status: "error",
                    message: "No existe el topic"
                });

             }

             //Comprobar si el objeto usuario esta identificado y validar datos

             if(req.body.content){

                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                 
                } catch (error) {
        
                    console.log(error);
                    
                }

                if(validate_content){

                    var commentjson = {
                        user: req.user.sub,
                        content: req.body.content
                    };

                     //En la propiedad comment del objeto resultante hacer un push
                     topics.comments.push(commentjson);

                        //Guardar el topic completo

                        topics.save((err) => {

                            if(err){

                                return res.status(500).send({
                                    status: "error",
                                    message:"Error al guardar el topic"
                                });
                            }

                        Topic.findById(topicId)
                        .populate('user')
                        .populate('comments.user')
                        .exec((err, topic) => {
                            if (err) {
                                //validar que nos venga vacio
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Erro en consulta id Topic'
                                });

                            }
                            if (!topic) {
                                //validar que nos venga vacio
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'No se encontro el id del Topic'
                                });

                            }

                            if (topic) {
                                //Devolver la respuesta
                                return res.status(200).send({
                                    status: 'success',
                                    comments: topic
                                    

                                });
                            }

                        })    
                    
                        });


                }else{

                    return res.status(500).send({
                        status: "error",
                        message: "No se han validado los datos del comentario"
                    });

                }
        

             }
        })

      

    },
    update: function(req, res){

        //Operadores de actualizacion****
       

        //Conseguir id de comentario que llega de la url
        var commentId = req.params.idcomment;
      

        //Recoger datos y validar
        var param = req.body;

        try {
            var validate_content = !validator.isEmpty(param.content);

        } catch (error) {

            return res.status(500).send({
                status: "error",
                message: "No se han comentado nada!"
            });
            
        }

        if(validate_content){

        //Find and Update de un subdocumento 
        // 1- Parametro es la condicion que vamos a buscar
        // 2- Le paramos el operador de actualizacion, para actualizar el documento
        // 3- Le pasamos el {new:true} para que devuelva el documento actualizado
        Topic.findOneAndUpdate(
            {"comments._id" : commentId},
            {
                "$set": {
                    "comments.$.content": param.content
                }
            }, 
            {new:true},
            (err, topicUpdated) => {

                if(err){

                    return res.status(500).send({
                        status: "error",
                        message: "No se pudo actualizar el comentario!"
                    });

                    }

                    if(!topicUpdated){

                        return res.status(500).send({
                            status: "error",
                            message: "Error en la peticion de actualizacion de comentario"
                        });
                  
                     }
        
                     if(topicUpdated){
                        //Devolver los datos
                        return res.status(200).send({
                            status: "success",
                            topic: topicUpdated
                        });
        
                     }

            });

      
      

        }


    },
    delete: function(req, res){

        //Sacar el id del topic y del comentario a borrar
        var topicId =  req.params.topicId
        var commentId =  req.params.commentId
        

        //Buscar el topic
       Topic.findById(topicId, (err, topic) =>{

        if(err){

            return res.status(500).send({
                status: "error",
                message: "No se pudo actualizar el comentario!"
            });

            }

            if(!topic){

                return res.status(500).send({
                    status: "error",
                    message: "Error en la peticion de actualizacion de comentario"
                });
          
             }
        
        //Seleccionar el subdocumento (comentario)
        var comment = topic.comments.id(commentId);

        if(comment){
        //Borrar el comentario
        comment.remove();
        //Guardar el topic
        topic.save((err) =>{

            if(err){

                return res.status(500).send({
                    status: "error",
                    message: "Error al eliminar comentario"
                });
          
             }

             //Devolver un resultado
             return res.status(200).send({
                status: "success",
                topic
            });

        });
      

        }else{
            return res.status(500).send({
                status: "error",
                message: "No existe el comentario"
            });
     

        }

      

       });//END FIND ONE
     

    }
   
}

module.exports = controller;
