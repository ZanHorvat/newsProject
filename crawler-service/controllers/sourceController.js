var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var Source = mongoose.model("Source");
var Parser = require("rss-parser");
var puppeteer = require("puppeteer");
var articleController = require("./articleController");
var categoryDict = require("../dictionaries/categories");

module.exports.runChecks = async function(article) {
  // Check Rtvslo
  await visitUrls(
    "https://stari.rtvslo.si/feeds/00.xml",
    ".lead",
    ".article-body",
    ".numComments",
    "#main-container > div > div > header > div > h3"
  );

  // Check Delo
  await visitUrls(
    "https://www.delo.si/rss/",
    ".itemSubtitle",
    ".itemFullText",
    "._50f7",
    "#t3-content > div.container.break_cont.break_00_cont.outter_cont.item_break_00 > div > div > div > ul > li:nth-child(3) > span"
  );

  // Check 24ur
  await visitUrls(
    "https://www.24ur.com/rss",
    ".article__summary",
    ".article__body-dynamic",
    ".article__details-main",
    "div.label.article__label"
  );

  // Check Siol
  await visitUrls(
    "https://siol.net/feeds/latest",
    "body > div.body_wrap > div > div:nth-child(3) > div.grid-12.no-gutter.gutter-lg.gutter-xlg.article__wrap > div.column_content > div > article > div.article__body--content.js_articleBodyContent > div.article__intro.js_articleIntro > p",
    "body > div.body_wrap > div > div:nth-child(3) > div.grid-12.no-gutter.gutter-lg.gutter-xlg.article__wrap > div.column_content > div > article > div.article__body--content.js_articleBodyContent > div.article__main.js_article.js_bannerInArticleWrap",
    "body > div.body_wrap > div > div:nth-child(3) > div.grid-12.no-gutter.gutter-lg.gutter-xlg.article__wrap > div.column_content > div > article > div.article__additional > div.article__comments.js_articleComments.cf > div > div.comments__heading_wrap.cf > span > i",
    "body > div.body_wrap > div > div:nth-child(3) > div.grid-12.no-gutter.gutter-lg.gutter-xlg.article__wrap > div.article__breadcrumbs > a:nth-child(3)"
  );
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
async function visitUrls(
  source,
  summary_location,
  content_location,
  comments_location,
  category_location
) {
  var parser = new Parser();
  var feed = await parser.parseURL(source);

  var browser = await puppeteer.launch();
  var page = await browser.newPage();

  for (let i = 0; i < feed.items.length; i++) {
    await inspectArticlePage(
      page,
      feed.items[i],
      source,
      summary_location,
      content_location,
      category_location
    ).catch(err => console.log(err));
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
async function inspectArticlePage(
  page,
  article_rss,
  source,
  summary_location,
  content_location,
  category_location
) {
  var promise = page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.goto(article_rss.link);
  await timeout(10000);

  var pubDate = new Date(article_rss.pubDate);

  var link = await prepareLink(source, article_rss, page);
  var title = await prepareTitle(source, article_rss, page);
  var summary = await prepareSummary(
    source,
    article_rss,
    page,
    summary_location
  );
  var content = await prepareContent(
    source,
    article_rss,
    page,
    content_location
  );
  var category = await prepareCategory(
    source,
    article_rss,
    page,
    category_location
  );

  if (
    link.length > 0 &&
    title.length > 0 &&
    summary.length > 0 &&
    content.length > 0 &&
    category.length > 0
  ) {
    await addNewArticle(source, link, title, summary, content, category, pubDate);
  } {
    console.log('failed to add' + category.length)
  }
  await promise;
}

async function prepareLink(source, article_rss, page) {
  return article_rss.link;
}

async function prepareTitle(source, article_rss, page) {
  return article_rss.title;
}

/**
 *
 * @param {*} source
 * @param {*} article_rss
 * @param {*} page
 */
async function prepareSummary(source, article_rss, page, summary_location) {
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
async function prepareContent(source, article_rss, page, content_location) {
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
async function prepareCategory(source, article_rss, page, category_location) {
  console.log(new Date())
  console.log(article_rss.link)
  var element =
    category_location != "" ? await page.$(category_location) : null;
  var category = "";
  
  category = await page.evaluate(
    element => (element != null ? element.innerText : ""),
    element
  );

  category = cleanString(category);
  category = category.toLowerCase();

  console.log('Categorie: ' + category);

  for(var key in categoryDict.categories){
    if(categoryDict.categories[key].includes(category)){
      console.log(new Date())
      return key;
    } 
  }
  console.log(new Date())
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
  str = str.replace("\n\n", "");
  str = str.replace("\n", "");
  str = str.replace("\t", "");
  str = str.trim();
  return str;
}
