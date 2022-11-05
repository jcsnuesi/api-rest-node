'use strict'

//Creamos el router de express
var express = require('express');
var UserController = require('../controllers/user');
 

var router = express.Router();
var md_auth = require('../middleware/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

//RUTAS GET******

//Especificamos que ruta accederemos y a que controlador y metodo dentro del controlador accederemos
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers)
router.get('/user/:userId', UserController.getUser)


// <-----END RUTAS GET******

//RUTAS POST******
router.post('/testeando', UserController.testeando);

//Rutas de usuarios
router.post('/registro', UserController.save);
router.post('/login', UserController.login);
router.post('/upload-avatar', [md_auth.authenticated,md_upload] , UserController.uploadAvatar);
router.put('/update', md_auth.authenticated, UserController.update)

//Exportamos todas las rutas
module.exports = router;