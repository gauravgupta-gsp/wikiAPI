const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

const port = 3001;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const url = "mongodb://localhost:27017/wikiDB";

mongoose.connect(url, {useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false });

let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error" ));
db.once("open" , () => {
  console.log("Connected to Mongo Db");
});

const articleSchema = {
  title : String,
  content: String
};

const Article = mongoose.model("Article", articleSchema);

app.route("/articles")
.get((req, res) => {
  Article.find({}, (err, articles)=> {
    console.log(articles);
    if(!err) {
      res.send(articles);
    }
    else {
      res.send(err);
    }

  });
})

.post( (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const article = new Article({title:title, content:content});
  article.save(function (err) {
    if(!err ) {
      res.send("content saved");

    }else {
      res.send(err);
    }
  });

})
.delete((req,res) => {
  Article.deleteMany({}, function (err) {
    if(!err) {
      res.send("Deleted all articles");
    }
    else {
      res.send(err);
    }
  });
});

app.route("/articles/:articleTitle")
.get((req,res)=>{
  Article.findOne({title:req.params.articleTitle}, (err, foundArticle) => {
    if(foundArticle) {
      res.send(foundArticle);
    }
    else {
      res.send("No article matching that title was found");
    }
  });
})
.put((req, res) => {
  Article.update(
    {title:req.params.articleTitle},
    {title:req.body.title,content:req.body.content},
    {overwrite:true},
    (err)=> {
      if(!err) {
        res.send("Successfully updated Article");
      }
    });

})
.patch((req,res) => {
  Article.update(
    {title:req.params.articleTitle},
    {$set: req.body},
    (err) => {
      if(!err) {
        res.send("Successfully updated article");
      }
      else {
        res.send(err);
      }
    }
  );
})
.delete((req,res) => {
  Article.deleteOne(
    {title:req.params.articleTitle},
    (err,result) => {
      if(result.deletedCount > 0) {
        res.send("Successfully deleted article");
      }
      else {
        res.send("No matching docuement found to delete");
      }
    }
  );
});

app.listen(port, ()=> {
  console.log(`Server running at http://localhost:${port} `);

});
