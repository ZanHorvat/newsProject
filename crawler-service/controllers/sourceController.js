var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var Parser = require("rss-parser");
var puppeteer = require('puppeteer');
var articleController = require('./articleController');

var sources = [
  {
    name: "24ur",
    url: "https://www.24ur.com/rss",
    div_content: "",
    div_comment: ""
  }
];

module.exports.runChecks = async function(article) {
  
  var browser = await puppeteer.launch();
  
  // Check rtvslo
  var parser = new Parser();
  var feed = await parser.parseURL("https://stari.rtvslo.si/feeds/00.xml");

  feed.items.forEach(async function(item) {
    console.log(item.title + ":" + item.link);


    articleController.evalArticle({
      source: "https://www.24ur.com/novice/slovenija/popoldne-in-zvecer-povecana-moznost-nastanka-mocnejsih-neviht.html",
      title: "Popoldne in zvečer povečana možnost nastanka močnejših neviht",
      content: "Nestabilnost ozračja, ki je posledica pomika oslabljene vremenske fronte prek srednje Evrope proti vzhodu, bo spet povzročila nastanek krajevnih neviht. Te se bodo pozno popoldne in zvečer združevale v večje sisteme, ki bodo prepotovali dobršen del države. Ob nevihtah se bodo pojavljali nalivi in močni sunki vetra, zelo verjeten je tudi pojav toče. Arso je za večji del Slovenije izdal oranžno opozorilo.",
      summary: "Nestabilnost ozračja, ki je posledica pomika oslabljene vremenske fronte prek srednje Evrope proti vzhodu, bo spet povzročila nastanek krajevnih neviht. Te se bodo pozno popoldne in zvečer združevale v večje sisteme, ki bodo prepotovali dobršen del države. Ob nevihtah se bodo pojavljali nalivi in močni sunki vetra, zelo verjeten je tudi pojav toče. Arso je za večji del Slovenije izdal oranžno opozorilo.",
      category: "Zabava",
    });

    var page = await browser.newPage();
    await page.goto('https://www.24ur.com/novice/slovenija/popoldne-in-zvecer-povecana-moznost-nastanka-mocnejsih-neviht.html');

    var innerText = await page.evaluate(() => document.querySelector('.article__body-dynamic'));

    console.log(innerText);

    browser.close();

  });

  collectNewArticles("rtvslo", feed);

  // Check 24ur
  var feed = await parser.parseURL("https://www.24ur.com/rss");

  feed.items.forEach(item => {
    console.log(item.title + ":" + item.link);
  });

  // Check Delo
  var feed = await parser.parseURL("http://www.delo.si/rss/");

  feed.items.forEach(item => {
    console.log(item.title + ":" + item.link);
  });
};

collectNewArticles = function(source, feed) {
  feed.items.forEach(item => {
    console.log(item.title + ":" + item.link);
  });
};
