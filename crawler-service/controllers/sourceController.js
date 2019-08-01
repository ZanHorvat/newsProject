var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var Parser = require("rss-parser");
var puppeteer = require("puppeteer");
var articleController = require("./articleController");

var sources = [
  {
    name: "24ur",
    url: "https://www.24ur.com/rss",
    div_content: "",
    div_comment: ""
  }
];

module.exports.runChecks = async function(article) {
  // Check Rtvslo
  await visitUrls("https://stari.rtvslo.si/feeds/00.xml", ".lead", ".article-body", ".numComments", ".section-title");

  // Check 24ur
  await visitUrls("https://www.24ur.com/rss", ".article__summary", ".article__body-dynamic", ".article__details-main", ".article__label");

  // Check Delo
  await visitUrls("http://www.delo.si/rss/",  ".itemSubtitle",".itemBody", "._50f7", "");  
};

collectNewArticles = function(source, feed) {
  feed.items.forEach(item => {
    console.log(item.title + ":" + item.link);
  });
};

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

visitUrls = async function(source, summary_location, content_location, comments_location, category_location){
  var parser = new Parser();
  var feed = await parser.parseURL(source);

  var browser = await puppeteer.launch();
  var page = await browser.newPage();

  for (let i = 0; i < feed.items.length; i++) {
    var url = feed.items[i].link;
    
    var promise = page.waitForNavigation({ waitUntil: "networkidle2" });
    await page.goto(url);
    await timeout(10000);

    var element = category_location != "" ? await page.$(category_location) : null;
    
    var category = null;
    
    if(element == null || category_location == "") {
      category = feed.items[i].category;
    } else {
      category = await page.evaluate(element => element.innerText, element);
    }

    var element = await page.$(summary_location);
    var summary = await page.evaluate(element => element.innerText, element);
    
    var element = await page.$(content_location);
    var content = await page.evaluate(element => element.innerText, element);
    
    var element = await page.$(comments_location);
    var comments = await page.evaluate(element => element.innerText, element);
    /*
    console.log('#' + feed.items[i].title + '#');
    console.log();
    console.log(summary.trim());
    console.log();
    console.log(content.trim());
    console.log();
    console.log(comments.trim());
    console.log(category.trim());
    console.log('========'); */

    articleController.evalArticle(
      {
        source: url,
        title: feed.items[i].title,
        summary: summary.trim(),
        content: content.trim(),
        category: category.trim(),
      }
    );

    await promise;
  }

  browser.close();
}
