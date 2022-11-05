'use strict';


const mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3998;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/api_rest_node', { useNewUrlParser: true })
                .then(() => {
                    console.log('Conectado a la DB existosamente!!')
               
                    //Crear servidor
                    app.listen(port, () => {
                        console.log('Servidor corriendo!')
                    })
               
                })
                .catch(error => console.log(error));

