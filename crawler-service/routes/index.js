var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Article = mongoose.model("Article");

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
  }).sort([['updated', -1]]);
});

module.exports = router;
