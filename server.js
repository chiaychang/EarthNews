/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();
var port = process.env.PORT || 3006;

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Handlebars setup
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_qz8v7ng2:vp0oe9df5hv0jcdnvgeei6hifs@ds131512.mlab.com:31512/heroku_qz8v7ng2");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

Article.remove({}, function(error, doc) {
    // Log any errors
    if (error) {
        console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
        console.log("removed!");
    }
});

app.get("/", function(req, res) {

    var object = {};
    res.render("index", object);
});

articlesArray = [];
// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  
  var number = 0;
    // First, we grab the body of the html with request
    request("http://www.climatechangenews.com/", function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        $(".media-body h2").each(function(i, element) {

          number++;

            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");
            result.saved = "false";

            articlesArray.push(result);

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            // Now, save that entry to the db
            entry.save(function(err, res) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                // Or log the doc
                else {
                   
                }
            });

        });
        
        var articlesN = {
          count: number
        }
       res.render("notice", articlesN);
    });
    

});


app.get("/savedArticles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({ saved: true }, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {

            var articles = { articles: doc };
            res.render("save", articles);
        }
    });
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({ saved: false }, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            var articles = { articles: doc };
            res.render("articles", articles);
        }
    });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ "_id": req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        // now, execute our query
        .exec(function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});


app.post("/save/:id", function(req, res) {

    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": req.body.saved })

    .exec(function(err, doc) {
        // Log any errors
        if (err) {
            console.log(err);
        } else {
            // Or send the document to the browser
            res.send(doc);
        }
    });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note(req.body);

    // And save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

// Listen on port 3000
app.listen(port, function() {
  console.log("App listening on PORT " + port);
});
