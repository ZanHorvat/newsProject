var mongoose = require("mongoose");

var articleShema = new mongoose.Schema({
  source: { type: String },
  title: { type: String },
  summary: { type: String },
  content: { type: String },
  category: { type: String },
  comments: Number,
  sorted: { type: Boolean, default: false },
  people: { type: [String] },
  places: { type: [String] },
  otherSubjects: { type: [String] },
  grade: { type: Number, default: 0 },
  graded: Date,
  updated: Date,
  aggregated: Date
});

mongoose.model("Article", articleShema, "Articles");
