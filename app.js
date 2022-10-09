const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();
const $ = require("jquery");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-fathima:Mnbvc1234x@cluster0.tix9grr.mongodb.net/todoAppdb", function() {
  console.log("connected to mongodb");
});
const itemSchema = new mongoose.Schema({
  activity: String
});
const ToDoItem = mongoose.model("ToDoItem", itemSchema);

const item1 = new ToDoItem({
  activity: "Welcome to your todo List"
});
const item2 = new ToDoItem({
  activity: "set your aim and work to get through."
})
const defaultItems = [item1, item2];


app.get("/", function(req, res) {
  const date = new Date();
  // const day = date.getDay();
  // res.send(day+"");
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
  var day = date.toLocaleDateString("en-US", options);
  // res.render("index",{currentDay: day});

  ToDoItem.find({}, function(err, foundItems) {
    if (foundItems.length !== 0) {
      res.render("index", {
        currentDay: day,
        presentItems: foundItems,
        title: "Hey!"
      });
    } else {
      ToDoItem.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err.message);
        } else {
          console.log("successfully saved items to db");
        }
      });
      res.redirect("/");
    }
  });
});

const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);
// const list = new List({
//   name: category,
//   items: defaultItems
// });
// list.save();
// res.redirect("/category/"+category);
app.get("/category/:anyTopic", function(req, res) {
  const category = req.params.anyTopic;
  List.findOne({name: category}, function(err, foundList) {
    if (!err) {
      if (!foundList) {

        console.log("item does'nt exist");
      } else {
        // res.render("index",{title:foundList.name,presentItems:foundList.items});
        console.log("item exists");
      }
    }
  });
});

app.post("/", function(req, res) {
  const newActivity = req.body.newItem;
  //create a new document.
  const nextActivity = new ToDoItem({
    activity: newActivity
  });
  nextActivity.save();
  res.redirect("/");
});

app.post("/delete", function(req, res) {
  const idofChecked = req.body.check;
  ToDoItem.findByIdAndRemove(idofChecked, function(err) {
    if (!err) {
      console.log("successfully deleted an item");
    } else {
      console.log("id not matching");
    }
    res.redirect("/");
  });

});
app.listen(process.env.PORT || 3000, function() {
  console.log("server has started");
});
