var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var Source = mongoose.model("Source");
var Parser = require("rss-parser");
var puppeteer = require("puppeteer");
var articleController = require("./articleController");
var categoryDict = require("../dictionaries/categories");
var sourcesDict = require("../dictionaries/sources");
const pastHours = 48; // How old articles will be take into consideration


module.exports.runChecks = async function(article) {
  // Check Rtvslo

  for (var source in sourcesDict.sources) {
    var objSource = sourcesDict.sources[source];
    await visitUrls(
      objSource.source,
      objSource.title_selector,
      objSource.summary_selector,
      objSource.content_selector,
      objSource.comments_selector,
      objSource.category_selector
    );
  }
};

/**
 *
 * @param {*} ms
 */
async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @description Launches and iterates trough feed provided in source
 * 
 * @param {String} source             Url of the rss feed.
 * @param {String} summary_location   DOM Selector string.
 * @param {String} content_location   DOM Selector string.
 * @param {String} comments_location  DOM Selector string.
 * @param {String} category_location  DOM Selector string.
 */
async function visitUrls(source, title_location,summary_location, content_location, comments_location, category_location) {
  
  var parser = new Parser();
  var feed = await parser.parseURL(source);

  var browser = await puppeteer.launch();
  var page = await browser.newPage();

  for (let i = 0; i < feed.items.length; i++) {
    
    await inspectArticlePage(page, feed.items[i].link, feed.items[i].pubDate)
        .catch(err => console.log(err));  
  }
  browser.close();
}

/**
 *
 * @param {*} page
 * @param {*} feed
 * @param {*} source
 * @param {*} summary_location
 * @param {*} content_location
 * @param {*} comments_location
 * @param {*} category_location
 * @param {*} i
 */
inspectArticlePage = async function(page, link, date) {
  
  var promise = page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.goto(link).catch('Error getting website.');

  var pubDate = new Date(date);
  var refSource = {}
  var source = '';

  for (var host in sourcesDict.sources) {
    if(link.includes(host)){
      source = sourcesDict.sources[host].source; // rss link
      refSource = sourcesDict.sources[host]; // object of host as host variable is a string
    }
  }

  var title = await prepareTitle(page, refSource.title_selector);
  var summary = await prepareSummary(page, refSource.summary_selector);
  var content = await prepareContent(source, page, refSource.content_selector);
  var category = await prepareCategory(page, refSource.category_selector);
  if (
    link.length > 0 &&
    title.length > 0 &&
    summary.length > 0 &&
    content.length > 0 &&
    category.length > 0
  ) {
    await addNewArticle(link, title, summary, content, category, pubDate);
  } else {
    console.log('Could not add ' + link);
    console.log(source.length + ' ' + link.length + ' ' + title.length + ' ' + summary.length + ' ' + content.length + ' ' + category.length + ' ' + pubDate.length)
  }
  await promise;
}

async function prepareLink(article_rss) {
  return article_rss.link;
}

async function prepareTitle(page, title_location) {
  var element = await page.$(title_location);
  var title = await page.evaluate(
    element => (element != null ? element.innerText.trim() : ""),
    element
  );
  title = cleanString(title);
  console.log('Title: '+title);
  return title;
}

/**
 *
 * @param {*} source
 * @param {*} article_rss
 * @param {*} page
 */
async function prepareSummary(page, summary_location) {
  var element = await page.$(summary_location);
  var summary = await page.evaluate(
    element => (element != null ? element.innerText.trim() : ""),
    element
  );
  summary = cleanString(summary);
  return summary;
}

/**
 *
 * @param {*} source
 * @param {*} article_rss
 * @param {*} page
 */
async function prepareContent(source, page, content_location) {
  switch (source) {
    case "https://www.delo.si/rss/":
      var element = await page.$(".itemFullText > .preview_text");
      if (element != null) {
        content_location = ".itemFullText > .preview_text";
      }
      break;
    default:
  }

  var element = await page.$(content_location);
  var content = await page.evaluate(
    element => (element != null ? element.innerText.trim() : ""),
    element
  );
  content = cleanString(content);
  return content;
}

/**
 *
 * @param {*} source
 * @param {*} article_rss
 * @param {*} page
 */
async function prepareCategory(page, category_location) {
  var element =
    category_location != "" ? await page.$(category_location) : null;
  var category = "";

  category = await page.evaluate(
    element => (element != null ? element.innerText : ""),
    element
  );

  category = cleanString(category);
  category = category.toLowerCase();

  for (var key in categoryDict.categories) {
    if (categoryDict.categories[key].includes(category)) {
      return key;
    }
  }
  return category;
}

/**
 * @description Tries to add new article.
 *
 * @param {*} source
 * @param {*} link
 * @param {*} title
 * @param {*} summary
 * @param {*} content
 * @param {*} category
 */
async function addNewArticle(
  link,
  title,
  summary,
  content,
  category,
  pubDate
) {
  await articleController.evalArticle({
    link: link,
    title: title,
    summary: summary,
    content: content,
    category: category,
    updated: pubDate
  });
}

function cleanString(str) {
  str = str.replace("\n\n", " ");
  str = str.replace("\n", " ");
  str = str.replace("\t", " ");
  str = str.trim();
  return str;
}


module.exports.collectElementsFromWebpage = async function(source, page){

  var sourceObj = sourcesDict.sources[source];

  var link = page().url;
  var title = await prepareTitle(page, sourceObj.title_selector);
  var summary = await prepareSummary(page, sourceObj.summary_selector);
  var content = await prepareContent(page, content_selector);
  var category = await prepareCategory(page, category_selector);

  return {
    link: link,
    title: title,
    summary: summary,
    content: content,
    category: category
  };
}

// https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
extractHostname = function(url) {
  var hostname;
  // find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  // find & remove port number
  hostname = hostname.split(":")[0];
  // find & remove "?"
  hostname = hostname.split("?")[0];

  hostname = hostname.replace("www.", "");

  return hostname;
}

/** Looks at the page in the headless browser and checks difference
 *  If it's not the same it recollects and updates the article in database
 */
async function updateArticle(page, doc) {
  var promise = page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.goto(doc.link);

  var originalUrl = new URL(doc.link);
  var currentUrl = new URL(page.url());

  console.log(doc.updated)

  if(originalUrl.pathname !== currentUrl.pathname){
    console.log('Found difference');
    Article.deleteOne(doc).exec(function(err){
      if(err){
        console.log('Could not removed')
      } else {
        console.log('Removed')
      }
    })
    inspectArticlePage(page, page.url(), new Date());
  }

  await promise;
}

/**
 * Opens headless browser and itterates through given Articles and attempts to visit given url
 * It passes opened page and article object down to updateArticle
 */
visitArrayOfArticleWebpages = async function(docs) {
  var browser = await puppeteer.launch();
  var page = await browser.newPage();

  for (var i = 0; i < docs.length; i++) {
    await updateArticle(page, docs[i]).catch(e => console.log(e));
  }

  browser.close();
};

module.exports.updateArticles = async function(callback) {
  var startDate = new Date();
  startDate.setHours(startDate.getHours() - pastHours);

  Article.find({ updated: { $gt: startDate } }, async function(err, docs) {
    if (err) {
      console.log(err);
    } else {
      console.log(docs.length)
      await visitArrayOfArticleWebpages(docs);
      callback();
    }
  });
};