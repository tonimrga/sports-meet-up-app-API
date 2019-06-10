var cities = require('../cities.json');
var sports = require('../sports.json');

module.exports = (app) => {

  //ruta zs dohvaćanje svih gradova u određenoj državi
  app.get('/cities/:country', (req, res) => {
    const filterByCountry = cities.filter(city => city.country == req.params.country);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({filterByCountry}));
  });

  //ruta zs dohvaćanje svih država
  app.get('/countries', (req, res) => {

    var countries = new Set();

    for (var i = 0; i < cities.length; i++) {
      if(!countries.has(cities[i].country)){
        countries.add(cities[i].country)
      }
    }
    res.send(Array.from(countries));
    res.end()
  });

  //ruta zs dohvaćanje svih sportova
  app.get('/sports', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({sports}));
  });

}
