var mongoose = require('mongoose');
var Article = mongoose.model('Article');

module.exports.evalArticle = function(article) {
    Article.find(
        {source: article.source}, 
        function (err, docs) {
            if(err){
                console.log(err)
            } else {
                if(docs.length > 0){
                    console.log("Already exits")
                } else {
                    console.log("Wanted to insert");
                    createArticle(article);
                }
            }
    });
};


createArticle = function(article) {
    Article.create(article, function(err, article) {
        if (err) {
          console.log(err)
        } else {
          console.log('Success');
        }
    });
}