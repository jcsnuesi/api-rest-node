'use strict' //Es una directiva que indica el modo en que el navegador debe ejecutar nuestro código JavaScript

var mongoose = require('mongoose');
var mongooPaginate = require('mongoose-paginate-v2')
var Schema = mongoose.Schema;

//Modelo de comment

var commentsSchema = Schema({
    content: String,
    date: {type: Date, default: Date.now},
    user: {type: 'objectId', ref: 'User'}
});

var Comment = mongoose.model('Comment', commentsSchema)

//Modelo de topic
var TopicSchema = Schema({
     title: String,
     content: String,
     code: String,
     lang: String,
     date: {type: Date, default: Date.now},
     user: {type: 'objectId', ref: 'User'},
     comments: [commentsSchema]

});


//Cargar paginacion
TopicSchema.plugin(mongooPaginate);


module.exports =  mongoose.model('Topic', TopicSchema);