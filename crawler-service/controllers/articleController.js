var mongoose = require("mongoose");
var puppeteer = require("puppeteer");
var Article = mongoose.model("Article");
var sourceController = require("./sourceController");
var psl = require("psl");
var http = require("http");
var request = require("request");
var sourcesDict = require("../dictionaries/sources");



/**
 * filterArticles prepares data for REST API, does not expose data which was collected for
 * aggregation and grading purposes.
 */
module.exports.filterArticles = function(articles) {
  var filtered_articles = [];

  articles.forEach(function(article, index) {
    filtered_articles.push({
      link: article.link,
      title: article.title,
      summary: article.summary,
      category: article.category,
      connectedArticles: article.connectedArticles
    });
  });

  return filtered_articles;
};

/**
 * evalArticle looks at the link of given article and checks if it exists in database, if not it'll try to insert
 */
module.exports.evalArticle = async function(article) {

  article.grade = 0;

  Article.findOne({ link: article.link }, function(err, docs) {    
    if (err) {
      console.log(err);
    } else {
      if (docs) {
        console.log(docs.title);
        console.log('Article already exists\n');
        if(docs.content > article.content){
          console.log('Found difference in content length therfore updating article object')
          article.grade = 0
          Article.findOneAndUpdate({link: docs.link}, article, function(err, doc, res){
            if(err) console.log(err)
            if(docs) console.log('Article successfully updated.\n')
          })
        }
      } else {
        createArticle(article);
      }
    }
  });
};

/**
 * Classic mongoose create function, accepts Article look at models
 */
createArticle = function(article) {
  Article.create(article, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      console.log("Article added\n");
    }
  });
};





