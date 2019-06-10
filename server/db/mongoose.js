//SPAJANJE NA BAZU

//import mongoose modula koji nam omogućuje spajanje na mongodb baze podataka
var mongoose = require('mongoose');

//govorimo mongooseu da koristimo promises od javascripta(global)
mongoose.Promise = global.Promise;

//spajanje na bazu
mongoose.connect(process.env.DB_URL , {useNewUrlParser: true} );

//export modula
module.exports = {mongoose};
