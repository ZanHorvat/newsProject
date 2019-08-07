var mongoose = require("mongoose");

var sourceShema = new mongoose.Schema({
  title: { type: String, required : true },
  summary_location: {type: String, required : true },
  content_location: {type: String, required :true },
  comments_location: {type: String, required : true },
  category_location: {type: String, required : true },
});

mongoose.model("Source", sourceShema, "Source");