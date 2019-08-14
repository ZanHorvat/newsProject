var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var Source = mongoose.model("Source");
var Parser = require("rss-parser");
var puppeteer = require("puppeteer");
var articleController = require("./articleController");
var categoryDict = require("../dictionaries/categories");
var sourcesDict = require("../dictionaries/sources");

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
    await inspectArticlePage(page, feed.items[i], source, title_location,summary_location, content_location, category_location)
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
async function inspectArticlePage( page, article_rss, source, title_location,summary_location, content_location, category_location) {
  var promise = page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.goto(article_rss.link);

  var pubDate = new Date(article_rss.pubDate);

  var link = await prepareLink(article_rss);
  var title = await prepareTitle(page, title_location);
  var summary = await prepareSummary(page, summary_location);
  var content = await prepareContent(source, page, content_location);
  var category = await prepareCategory(page, category_location);
  if (
    link.length > 0 &&
    title.length > 0 &&
    summary.length > 0 &&
    content.length > 0 &&
    category.length > 0
  ) {
    await addNewArticle(source, link, title, summary, content, category, pubDate);
  } else {
    console.log('Could not add ' + link);
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
  source,
  link,
  title,
  summary,
  content,
  category,
  pubDate
) {
  await articleController.evalArticle(source, {
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
  }
}