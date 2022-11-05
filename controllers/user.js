'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var User = require('../models/user');
var fs =  require('fs'); //Sistema de ficheros
var path = require('path');
var saltRounds = 10;
var jwtoken = require('../services/jwt');
const { param } = require('../routes/user');
const { exec } = require('child_process');
const res = require('express/lib/response');


//vamos a crear varios metodos dentro de la variable controller
var controller = {

    probando: function(req, res){
        return res.status(200).send({
            message: "Probando"
        });
    },
    testeando: function(req, res){
        return res.status(200).send({
            message: "Testeando"
        });

    },

    save: function(req, res){
        //Recoger los parametros de la peticion
        var params = req.body

        //Validar los datos 
        try{

        var validate_name = !validator.isEmpty(params.name);
        var validate_surname = !validator.isEmpty(params.surname);
        var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password);

        }catch(err){

            return res.status(500).send({ 
                status: 'error',
                err
            });

        }
        

        // console.log(validate_name, validate_surname, validate_email, validate_password)

        if(validate_name && validate_surname && validate_email && validate_password){
        //Crear objeto de usuario
        var user = new User();

        //Asignar valores al usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email.toLowerCase();
        user.role = 'ROLE_USER';
        user.image = null;


        //Comprobar si el usuario existe
        User.findOne({email: user.email}, (err, issetUser) => {
           
            if(err){

                return res.status(500).send({
                    message: "Error al comprobar duplicidad de usuario"
                    
                });

            }

            if(!issetUser){
               
        // Si no exite
                    
        // cifrar la contrasena 
        bcrypt.hash(params.password, saltRounds, (err, hash) => {
        user.password = hash;
     
            //guardar usuario
            user.save((err, userStored) => {

                if(err){
                    return res.status(500).send({
                        message: "Error al guardar el usuario."
                    });

                }

                if(!userStored){
                    return res.status(400).send({
                        message: "El usuario no se ha guardado."
                    });
                }

                 //Devolver respuesta
                return res.status(200).send({ 
                    status: 'success',
                    user: userStored
                });
            }); //close user.save

        });//close bcrypt
        
        
        }else{
                
                //Si el usuario esta registrado
                return res.status(500).send({
                    message: "Usuario registrado"
                    
                })
        
            }
        });//close User.findOne

     
        }else{

            return res.status(500).send({
                message: "La validacion fue incorrecta"
                
            });


        }     
        
        
    },

    login: function(req, res){

        //Recoger los parametros de la peticion
        var params = req.body;

        //Validar los datos
        try{

        var email_validate = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var pass_validate = !validator.isEmpty(params.password);
        
        }catch(err){

            return res.status(200).send({
                message:"Faltan datos por enviar!!"
            });

        }
        

        if(!email_validate || !pass_validate){

            return res.status(200).send({
                message:"Datos suministrados de manera incorrecta!!"
            });

        }

        //Buscar usuarios que coincidan con el email
        User.findOne({email : params.email.toLowerCase()}, (err, user) => {
            
                if(err){

                    return res.status(500).send({
                        message: "Erro de autenticacion.",
                        user_datail: user
                    });
                }

                if(!user){
                    return res.status(404).send({
                        message: "Usuario no existe.",
                        user_datail: user
                    });
                }
            
            //Si lo encuentra
            //Comprobar contraseña (coincidencia de email y password / bcrypt)

            bcrypt.compare(params.password, user.password, (err, check) =>{


                //Si es correcto
                if(check){
                    //Generar token jwt y devolverlo
                    if(params.gettoken){

                        //Devolver datos
                    return res.status(200).send({

                    token: jwtoken.createToken(user)

                    });

                    }else{
                    
                    //Limpiar el objeto para que no se muestre el resultado de la password
                    user.password = undefined;
                    
                    //Devolver datos
                    return res.status(200).send({
                        
                        user

                    });

                    }
                        

                    

                }else{

                    return res.status(200).send({
                        message: "Las credenciales no son correctas."
                    });

                }

            })    
                
        

        });
       
        

      
        

    },

    update: function(req, res){

        //Recoger datos del usuario

        var params = req.body;

        //Validar los datos
        try{

            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);

        }catch(err){
            
            return res.status(500).send({
                message : "Faltan datos por enviar",
                err
            });

        }
       
        //Eliminar propiedades innecesarias
        delete params.password

        var userId = req.user.sub

        // Comprobar si el email es unico
        if(req.user.email != params.email){
           
             //Buscar usuarios que coincidan con el email
            User.findOne({email : params.email.toLowerCase()}, (err, user) => {
               
                //Si se introduce un email que no existe
                if(!user){

                    return res.status(500).send({
                        message: "Email no existe, no se puede actualizar."
                    });

                }else{
                    
                    if(err){

                        return res.status(500).send({
                            message: "Error de autenticacion."
                        });
                    }
    
                    if(user && user.email == params.email){
                      
                        return res.status(500).send({
                            message: "El email no puede ser modificado."
                            
                        });
                    }
                }
               
            });

        }else{

            //Buscar y actualizar documento
                // User.findOneAndUpdate(condicion, datos a actualizar, opciones, callback)
                User.findOneAndUpdate({_id:userId}, params, {new:true}, (err, userUpdated) => {

                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al actualizar usuario'
                        });

                    }

                    if(!userUpdated){

                        return res.status(500).send({
                            status: 'error',
                            message: 'Usuario no actualizado'
                        });

                    }
                    
                      //Devolver respuesta
                    return res.status(200).send({
                        status: 'success',
                        user: userUpdated
                    });


                });
      
        }

       

    },

    uploadAvatar: function(req, res){
       
        //Configurar el modulo multiparti  (md - middleware) routes/user.js

        //Recoger el fichero de la peticion
        var file_name = 'Avatar no subido...';

        if(!req.files.file0.originalFilename ){
           
            return res.status(404).send({
                status: 'error',
                message: file_name
                
            });

        }
         //Conseguir el nombre y la extension del archivo subido
         var file_path =  req.files.file0.path;
         var file_split = file_path.split('\\');
        console.log(file_path)

         //**Advertencia ** en Linus/MAC se utliza //
        //  var file_split = file_path.split(' //');

        //Nombre del archivo
        var file_name = file_split[2];

        //Extension del archivo ***OJO se poner  split('\.') con la diagonal invertida para indicar que vamos a salir luego del signo siguiente a esta.
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        //Comprobar extension (solo imagenes), si no es valida borrar fichero subido
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){

            fs.unlink(file_path, (err) =>{

         

                return res.status(400).send({
                    status : 'Failed!',
                    mesage : err
                    
                });

            

           });// END unlink

        }else{
            //Sacar el id del usuario identificado
            var userId = req.user.sub;
                   

            //Buscar y actualizar documento de la bd  
            //Con {new: TRUE} le decimos que devuelva el objeto nuevo actualizado
            User.findOneAndUpdate({_id : userId}, {image: file_name}, {new : true}, (err, userUpdated) => {

                if(err || !userUpdated){

                    return res.status(500).send({
                        status: 'error',
                        mesage: 'Error al subir la imagen'
                        
                                            });


                }

                
                        //Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            user:  userUpdated
                            
                                                });

            })

                            
        }// END IF unlink

        
    },
    avatar:  function(req, res){
        var fileName = req.params.fileName
        var pathFile = './uploads/users/'+fileName
    
        fs.exists(pathFile, (exists) => {
            // console.log(exists)
          
            if(exists){
             
                return res.sendFile(path.resolve(pathFile));

            }else{
                return res.status(404).send({
                    message: "Imagen no existe."
                })
            }
        })

    },
    getUsers: function(req, res){

        User.find().exec((err, users) => {
            if(err || !users){
                return res.status(400).send({
                    status: 'error',
                    message: 'No hay usuarios para mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                users: users
            })


        })

    },
    getUser: function(req, res){
        var userId = req.params.userId;
   
        User.findById(userId).exec((err, user) => {
            
            if(err || !user){
                return res.status(400).send({
                    status: 'error',
                    message: 'No hay usuarios para mostrar'
                })
              
            }
            return res.status(200).send({
                status: 'success',
                user
            })
        })

    }


};

module.exports = controller;


