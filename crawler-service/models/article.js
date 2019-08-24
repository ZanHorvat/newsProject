var mongoose = require("mongoose");

var articleShema = new mongoose.Schema({
  link: { type: String },
  title: { type: String },
  summary: { type: String },
  content: { type: String },
  category: { type: String },
  grade: { type: Number, default: 0 },
  updated: Date,
  connectedArticles: {
    title: String,
    link: String,
    summary: String
  },
  show: { type: Boolean, default: true }
});

mongoose.model("Article", articleShema, "Articles");
