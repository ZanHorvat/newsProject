var mongoose = require('mongoose');
var Article = mongoose.model('Article');

module.exports.evalArticle = function(source,article) {

    console.log(source+': '+article.title);

    Article.find(
        {link: article.link}, 
        function (err, docs) {
            if(err){
                console.log(err)
            } else {
                if(docs.length > 0){
                    console.log("Already exists.\n")
                } else {
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
          console.log('Article added\n');
        }
    });
}