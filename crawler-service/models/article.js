var mongoose = require("mongoose");

var articleShema = new mongoose.Schema({
  link: { type: String },
  title: { type: String },
  summary: { type: String },
  content: { type: String },
  category: { type: String },
  grade: { type: Number, default: 0 },
  updated: Date,
  aggregated: Date,
  connectedArticles: {
    title: String,
    link: String,
    summary: String
  },
  show: Boolean
});

mongoose.model("Article", articleShema, "Articles");
