var sourcesController = require('./sourceController');

module.exports.syncNewsSources = async function(){
    console.log(new Date());
    sourcesController.updateArticles(function(){sourcesController.runChecks()});
    setTimeout(function() {
        module.exports.syncNewsSources();
    }, 10*60*1000);
}