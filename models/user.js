'use strict'

//requiere el modulo de mongoose para usar el ORM con la BD.
var mongoose = require('mongoose');
//Creo la variable esquema para crear esquemas de mongoose y definir todas las propiedades que va a tener el objeto
var Schema = mongoose.Schema;

//creamos el esquema modelo de usuario

var UserSchema = Schema({
    
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
    
});

//Eviar que se muestre la clave al hacer consulta en mongodb

//****OBSERVACION: Este metodo se ultiliza para cuando hacemos una consulta devolver la respuesta en JSON */
UserSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.password;
    return obj;

}

//Exportar el modulo para ser usado en otros ficheros
//mongoose.model('User', UserSchema) dentro del parentesis colocalos el modelo y luego el esquema que vamos a utilizar

module.exports = mongoose.model('User', UserSchema);

