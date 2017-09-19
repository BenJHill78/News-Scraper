var express = require("express");
var expressh = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var article = require("./models/article.js");
var note = require("./models/note.js");
var port = process.env.PORT || 3000;

mongoose.Promise = Promise;

var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://heroku_m8nwswrt:25kfrabgd686b67l44o7i2s85s@ds141474.mlab.com:41474/heroku_m8nwswrt");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Error: ", error);
});

app.get("/scrape", function(req, res) {
  request("https://www.nytimes.com/", function(error, response, html) {

    var $ = cheerio.load(html);
  
    $("article h2").each(function(i, element) {

      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      //result.link = $(this).children("a").attr("img");
 
      var entry = new article(result);

      entry.save(function(err, doc) {

        if (err) {
          console.log(err);
        }

        else {
          console.log(doc);
        }
      });

    });
  });
  res.send("Scrape Complete");
});

app.get("/articles", function(req, res) {

  article.find({}, function(error, doc) {

    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function(req, res) {

  article.findOne({ "_id": req.params.id })

  .populate("notes")

  .exec(function(error, doc) {

    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});



app.post("/articles/:id", function(req, res) {

  var newNote = new note(req.body);

  newNote.save(function(error, doc) {

    if (error) {
      console.log(error);
    }

    else {
      article.findOneAndUpdate({ "_id": req.params.id }, { "notes": doc._id })

      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    }
  });
});

app.listen(port, function() {
  console.log("App running on port 3000!");
});
