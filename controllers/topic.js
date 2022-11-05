'use strict'
const res = require('express/lib/response')
var validate = require('validator')
var Topic = require('../models/topic')
const { param } = require('../routes/topic')

var controller = {

    test: function(req, res){
        return res.status(400).send({
            message: "Se conecto a topic "
        })
    },

    topic: function(req, res){

        //Recoger los parametros
        var params = req.body

        ///Validar los datos

        try {

        var validate_title = !validate.isEmpty(params.title);
        var validate_content = !validate.isEmpty(params.content);
        var validate_lang = !validate.isEmpty(params.lang);
            
        } catch (error) {

            return res.status(200).send({
                message: "Faltan datos por enviar"
            })
            
        }
        
        if(validate_content && validate_title && validate_lang){

            //Crear el objeto a guardar
            var topic = new Topic();

            //Asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

        
              //Guardar el topic
        topic.save((err, topicStored) =>{

          if(err || !topicStored){

            return res.status(404).send({
                status: 'error',
                message:"Error al guardar el topic!"
            });
        }
         //Devolver una respuesta
            return res.status(200).send({
                success: 'success',
                topic: topicStored
            })

        })

        }else{

            return res.status(500).send({
                message: 'Datos invalidos!'
            })
        }

    }, 
    getTopicPagination: function(req, res){
        //Cargar la libreria de paginacion en la clase (MODELO)


        //Recoger la pagina actual
        if(!req.params.page || req.params.page == [null, undefined, 0, "0"]){
            var page = 1;

        }else{
            var page = req.params.page;
        }
       

        //Indicar las opciones de paginacion
        var options = {
            sort: {date: -1},
            populate: 'user',
            limit: 5,
            page: page

        }
        //Find paginado
        //Topic.paginate({condicion}, options, callback () =>{})
        Topic.paginate({}, options, (err, topics) =>{

           
            if(err){
                return res.status(500).send({
                   status: 'error',
                   message: 'Error al hacer la consulta'
                });

            }

            if(!topics){
                return res.status(404).send({
                   status: 'error',
                   message: 'No hay topics'
                });

            }

            //Devolver resultado (topic, total de topic, total de paginas)
        return res.status(200).send({
            status: 'success',
            topics: topics.docs,
            totalDocs: topics.totalDocs,
            totalPages: topics.totalPages
        });

        })

        
    }, 
    getTopicsByUsers: function(req, res){

        //Conseguir el id del usuario
        var userId = req.params.user
        //Hacer un find con la condicion de usuario
        Topic.find({
            user: userId
        }).sort([['date', 'descending']])//Organiza la respuesta por fecha de manera descendente y luego la ejecuta con EXEC
        .exec((err, topic) => {

            if(err){

                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion getTopics'
                 });

            }
            if(topic == ""){

                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar'
                 });

            }
            //Devolver un resultado

        return res.status(200).send({
            status: 'success',
            topic
         });

        })

      
    
    },
    getTopic: function(req, res){

        //Obtener el id del topic
        var topicId = req.params.topicId
 
        //hacer la consulta a mongodb
        Topic.find({_id: topicId})
        .populate('user')
        .populate('comments.user')
        .exec((err, topic) =>{
            if(err){
                 //validar que nos venga vacio
                return res.status(500).send({
                    status: 'error',
                    message: 'Erro en consulta id Topic'
                });
                
            }
            if(!topic){

                //validar que nos venga vacios
               return res.status(500).send({
                   status: 'error',
                   message: 'No se encontro el id del Topic'
               });
               
           }

            if(topic){

                //Devolver la respuesta
                return res.status(200).send({
                    status: 'success',
                    topics: topic
                });
                
            }

         })    


    },

    update : function(req, res){
        //Recoger el id del topic a actualizar
        var topicId = req.params.id

        //Recoger los datos que llegan de post
        var params = req.body 
  
        //Validar datos
        
        try {
            var validate_title = !validate.isEmpty(params.title);
            var validate_content = !validate.isEmpty(params.content);
            var validate_lang = !validate.isEmpty(params.lang);
            console.log(validate_title)
        } catch (error) {

            console.log(error);
            
        }

        if(validate_title && validate_content && validate_lang){

             //Montar un json con los datos modificables
            var update = {
                title : params.title,
                content : params.content,
                code : params.code,
                lang : params.lang
            }

              //Find and update del topic que id conocido y por id de user
    
            //SINTAXI opic.findOneAndUpdate({DATOS EN EL COMENTO : PARAMETRO QUE BUSCAREMOS , user: req.user.sub} DATOS QUE VAMOS A ACTUALIZAR EN JSON "update", update, {new: true} para que traiga el documento mas reciente, (err. topicUpdated) =>{})
            Topic.findOneAndUpdate({_id : topicId , user : req.user.sub}, update, {new: true}, (err, topicUpdated) =>{

                if(err){

                    return res.status(500).send({
                        status: 'error',
                        message: 'No se actualizo el topic!'
                    });

                }

                if(!topicUpdated){

                    return res.status(500).send({
                        status: 'error',
                        message: 'Topic no existe para ser actualzado!'
                    });

                }

                if(topicUpdated){
            
                    //Devolver la respuesta

                    return res.status(200).send({
                        status: 'success',
                        topic: topicUpdated
                    });
    

                }

              

            })
        }else{

            return res.status(500).send({
                status: 'error',
                message: 'Validacion de campos incorrecta!'
            });

        }

       
     
    },
    delete: function(req, res){

        //sacar el id del topic de la url
        var topicId = req.params.id
        
        //Find and delete por topicId and userId
        Topic.findOne({_id: topicId}, (err, topicFound) =>{

            if(err){

                return res.status(500).send({
                        status: 'error',
                        message: 'Error al encontrar topic para su eliminacion'
                    });
            } 

            if(!topicFound.user){
        
                return res.status(500).send(
                    {
                        status: 'error',
                        message: 'Este topic no tiene user asignado'
                    })
              
            }

            if(topicFound.user){

                Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicDeleted) =>{
                    console.log(err)
                    if(err){
        
                        return res.status(500).send({
                                status: 'error',
                                message: 'Error al eliminar topic'
                            });
                    }

                            
                    if(topicDeleted){
        
                        return res.status(200).send(
                            {
                                status: 'success',
                                topicDeleted
                            })
                      
                    }
        
                });
                           
              
            }

        });

        
    },
    search: function(req, res){

        //Sacar string a buscar de la URL
        var searchString = req.params.search;
    
        //Find OR con este operador podemos poner los resultados que deseamos de la busqueda dentro de un array de objetos

        Topic.find({ "$or" : [
            {"title": { "$regex": searchString, "$options" : "i"}},
            {"content": {"$regex": searchString, "$options" : "i"}},
            {"code": {"$regex": searchString, "$options" : "i"}},
            {"lang": {"$regex": searchString, "$options" : "i"}}

        ]})
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics) =>{

            if(err){

                return res.status(500).send({
                    status: "error",
                    message: "Error en la peticion"
                });

            }
            if(!topics){

                return res.status(404).send({
                    status: "error",
                    message: "No existen coincidencias."
                });

            }

            if(topics){

            //Devolver el resultado
            
            return res.status(200).send({
                status: "success",
                topics
            });

            }
       
        })
      
    }


}

module.exports = controller;