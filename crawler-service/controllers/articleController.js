var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var psl = require("psl");

module.exports.evalArticle = async function(source, article) {
  console.log(source + ": " + article.title);

  Article.find({ link: article.link }, function(err, docs) {
    if (err) {
      console.log(err);
    } else {
      if (docs.length > 0) {
        console.log("Already exists.\n");
      } else {
        createArticle(article);
      }
    }
  });
};

createArticle = function(article) {
  Article.create(article, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      console.log("Article added\n");
    }
  });
};

module.exports.readArticles = function() {
  Article.find(function(err, docs) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < docs.length; i++) {
        var url = docs[i].link;
        console.log(psl.get(extractHostname(url))); // returns youtube.com
      }
    }
  });
};

// https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
}
