var express = require("express");
var router = express.Router();
var Parser = require("rss-parser");

var articleController = require("../controllers/articleController");

router.get("/", async function(req, res, next) {
  res.status(200);
  res.json("Available sources");
});

router.get("/rtvslo", async function(req, res, next) {
  var parser = new Parser();
  var feed = await parser.parseURL("https://stari.rtvslo.si/feeds/00.xml");
  res.status(200);
  res.json(feed.items);

  
});

router.get("/24ur", async function(req, res, next) {
  var parser = new Parser();
  var feed = await parser.parseURL("https://www.24ur.com/rss");
  res.status(200);
  res.json(feed.items);
});

router.get("/delo", async function(req, res, next) {
  var parser = new Parser();
  var feed = await parser.parseURL("http://www.delo.si/rss/");
  res.json(feed.items);
});

router.get("/test", async function(req, res, next) {

    res.status(200);
    res.json({message: "done"});
});

module.exports = router;
