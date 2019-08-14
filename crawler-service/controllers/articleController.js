var mongoose = require("mongoose");
var puppeteer = require("puppeteer");
var Article = mongoose.model("Article");
var sourceController = require("./sourceController");
var psl = require("psl");
var http = require('http');
var request = require('request');
var sourcesDict = require("../dictionaries/sources");

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

module.exports.updateArticles = async function() {
  Article.find(async function(err, docs) {
    if (err) {
      console.log(err);
    } else {

      var browser = await puppeteer.launch();
      var page = await browser.newPage();

      for (var i = 0; i < docs.length; i++) {
        await updateArticle(page, docs[i]);
      }

      browser.close();
    }
  });
};

async function updateArticle(page, doc){
  
  var promise = page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.goto(doc.link);

  var originalUrl = new URL(doc.link);
  var currentUrl = new URL(page.url());

  

  console.log(originalUrl.pathname === currentUrl.pathname);

  await promise;
}

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
