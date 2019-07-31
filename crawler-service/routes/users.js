var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {

  var Parser = require('rss-parser');
  var parser = new Parser();

  var feed = await parser.parseURL('https://stari.rtvslo.si/feeds/00.xml');
  console.log(feed.title);
 
  feed.items.forEach(item => {
    console.log(item.title + ':' + item.link)
  });

  res.send('respond with a resource');
});

module.exports = router;
