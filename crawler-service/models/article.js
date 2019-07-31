var mongoose = require("mongoose");

var articleShema = new mongoose.Schema({
  source: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
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
