var sourcesController = require('./sourceController');

module.exports.syncNewsSources = async function(){
    sourcesController.updateArticles(function(){sourcesController.runChecks()});
    setInterval(async function() {
        await sourcesController.updateArticles(function(){sourcesController.runChecks()});
    }, 10*60*1000);
}