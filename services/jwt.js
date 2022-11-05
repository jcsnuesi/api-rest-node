'use strict'

var jwt = require('jwt-simple');
//momento modulo de procesamiento de fechas
var moment = require('moment');

exports.createToken = function(user){

    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    };
    //Le pasamos el paylaod para codificar y una clave secreta adicional para mayor seguridad
    return jwt.encode(payload, 'mi-clave-secreta-2022');

}
