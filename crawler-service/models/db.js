var mongoose = require('mongoose');

var dbURI = 'mongodb://localhost/newsarticle';

mongoose.connect(dbURI, { useNewUrlParser: true, useCreateIndex: true });

mongoose.set('useFindAndModify', false);

mongoose.connection.on('connected', function() {
    console.log('Mongoose - is connected ' + dbURI + '\n');
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose - error at connecting: ' + err + '\n');
});
  
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose - is disconnected' + '\n');
});

require('./article');
require('./source');