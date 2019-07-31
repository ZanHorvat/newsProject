var mongoose = require('mongoose');

var dbURI = 'mongodb://localhost/newsarticle';

mongoose.connect(dbURI, { useNewUrlParser: true, useCreateIndex: true });

mongoose.connection.on('connected', function() {
    console.log('Mongoose - is connected ' + dbURI);
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose - error at connecting: ' + err);
});
  
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose - is disconnected');
});

require('./article');