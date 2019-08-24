var sourcesController = require('./sourceController');

module.exports.syncNewsSources = async function(){
    console.log(new Date());
    sourcesController.updateArticles(async function(){
        await sourcesController.runChecks()
        console.log('Setting timeout')
        setTimeout(function() {
            module.exports.syncNewsSources();
        }, 10*60*1000);
    });
    
    
}