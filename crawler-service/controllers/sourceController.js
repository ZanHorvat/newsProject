var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var Parser = require("rss-parser");
var puppeteer = require("puppeteer");
var articleController = require("./articleController");


module.exports.runChecks = async function(article) {
  // Check Delo
  await visitUrls("https://www.delo.si/rss/",  ".itemSubtitle",".itemFullText", "._50f7", ""); 

  // Check Rtvslo
  await visitUrls("https://stari.rtvslo.si/feeds/00.xml", ".lead", ".article-body", ".numComments", ".section-title");

  // Check 24ur
  await visitUrls("https://www.24ur.com/rss", ".article__summary", ".article__body-dynamic", ".article__details-main", ".article__label");
};


/**
 * 
 * @param {*} ms 
 */
async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 
 * @param {*} source 
 * @param {*} summary_location 
 * @param {*} content_location 
 * @param {*} comments_location 
 * @param {*} category_location 
 */
async function visitUrls(source, summary_location, content_location, comments_location, category_location){
  var parser = new Parser();
  var feed = await parser.parseURL(source);

  var browser = await puppeteer.launch();
  var page = await browser.newPage();

  for (let i = 0; i < feed.items.length; i++) {
    await inspectArticlePage(page, feed.items[i], source, summary_location, content_location, comments_location, category_location);
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
 async function inspectArticlePage(page, article_rss, source, summary_location, content_location, category_location){
  
  var promise = page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.goto(article_rss.link);
  await timeout(10000);
  
  var link = await prepareLink(source, article_rss, page)
  var title = await prepareTitle(source, article_rss, page);
  var summary = await prepareSummary(source, article_rss, page, summary_location);
  var content = await prepareContent(source, article_rss, page, content_location);
  var category = await prepareCategory(source, article_rss, page, category_location);

  if(
    link.length > 0 &&
    title.length > 0 &&
    summary.length > 0 &&
    content.length > 0 &&
    category.length > 0
  ) {
    addNewArticle(source, link, title, summary, content, category);
  }
  await promise;
}



async function prepareLink(source, article_rss, page){
  return article_rss.link;
}

async function prepareTitle(source, article_rss, page){
  return article_rss.title;
}

/**
 * 
 * @param {*} source 
 * @param {*} article_rss 
 * @param {*} page 
 */
async function prepareSummary(source, article_rss, page, summary_location){
  
  var element = await page.$(summary_location);
  var summary = await page.evaluate(element => element != null ? element.innerText.trim() : '', element);
  summary = cleanString(summary);
  return summary;
}

/**
 * 
 * @param {*} source 
 * @param {*} article_rss 
 * @param {*} page 
 */
async function prepareContent(source, article_rss, page, content_location){
  
  switch (source){

    case "https://www.delo.si/rss/":
      var element = await page.$(".itemFullText > .preview_text");
      if (element != null) { content_location = ".itemFullText > .preview_text"}
      break
    default:
      
  }

  var element = await page.$(content_location);
      var content = await page.evaluate(element => element != null ? element.innerText.trim() : '', element);
      content = cleanString(content);
    

  
  
  return content;
}

/**
 * 
 * @param {*} source 
 * @param {*} article_rss 
 * @param {*} page 
 */
async function prepareCategory(source, article_rss, page, category_location){
  var element = category_location != '' ? await page.$(category_location) : null;
  var category = '';

  switch(source) {
    case "https://www.delo.si/rss/":
      category = article_rss.categories[0];
      break;
    default:
      category = await page.evaluate(element => element != null ? element.innerText : '', element);
  }

  category = cleanString(category);

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
async function addNewArticle(source, link, title, summary, content, category){
  articleController.evalArticle(source,
    {
      link: link,
      title: title,
      summary: summary,
      content: content,
      category: category,
    }
  );
}

function cleanString(str){
  str = str.replace('\n\n', '');
  str = str.replace('\n', '');
  str = str.replace('\t', '');

  return str;
}
  