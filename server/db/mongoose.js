//SPAJANJE NA BAZU

//import mongoose modula koji nam omogućuje spajanje na mongodb baze podataka
var mongoose = require('mongoose');

//govorimo mongooseu da koristimo promises od javascripta(global)
mongoose.Promise = global.Promise;

//spajanje na bazu
mongoose.connect('mongodb://toni:toni6788@ds263656.mlab.com:63656/sportiranje' , {useNewUrlParser: true} );

//export modula
module.exports = {mongoose};
