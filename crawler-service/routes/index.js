var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var categoryDict = require("../dictionaries/categories");

/* GET home page. */
router.get("/", function(req, res, next) {
  Article.find({}, function(err, docs) {
    if (err) {
      res.status(500);
      res.json({});
    } else {
        res.status(200);
        res.json(docs);
    }
  }).sort([['updated', -1]]).limit(20);
});

router.get("/:category", function(req, res, next) {

  var category = req.params.category;

  if(categoryDict.categories[category] == undefined){
    res.status(404);
    res.json({category});
    res.end();

    return;
  }

  var query = {'category': category};

  Article.find(query, function(err, docs) {
    if (err) {
      res.status(500);
      res.json({});
      res.end();
    } else {
        res.status(200);
        res.json(docs);
        res.end();
    }
  }).sort([['updated', -1]]).limit(20);
});

module.exports = router;
