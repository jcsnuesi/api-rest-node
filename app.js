'use strict'

//Requires
var express = require('express');
var bodyparser = require('body-parser');

//Ejecutar express
var app = express();

//Cargar archivos de rutas
var user_routes = require('./routes/user');
var topic_router = require('./routes/topic')
var comment_router = require('./routes/comments')

//Middleewares
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Reescribir rutas
app.use('/api', user_routes);
app.use('/api', topic_router);
app.use('/api', comment_router);
//Usamos .use() para indicar dentro que es lo primero que va a contener la url


// //Ruta de prueba GET
// app.get('/prueba', (req, res) => {
//     return res.status(200).send("<h1>Hola desde el backend</h1>")

// })

// //Ruta de prueba POST
// app.post('/prueba', (req, res) => {
//     // return req.status(200).send("<h1>Hola desde el backend</h1>")
//     return res.status(200).send({
//         Nombre: 'Hector Santos',
//         message: 'Hola desde el backend con NodeJS soy POST!!'
//     })
// })

//Exportar modulo
module.exports = app;

