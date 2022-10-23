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
  activity: {
    type: String,
    trim: true,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});
// itemSchema.path('date').index({expires:});
const ToDoItem = mongoose.model("ToDoItem", itemSchema);

const item1 = new ToDoItem({activity:"Plan your day"});
const item2 = new ToDoItem({activity:"note down your main focus for today"});
const defaultItems = [item1,item2];

const date = new Date();
let options = {
  weekday: "long",
  day: "numeric",
  month: "long"
};
const today = date.toLocaleDateString("en-US", options);
app.get("/", function(req,res){
  ToDoItem.find({}, function(err, foundItems){
    if(!err){
      res.render("index",{
        currentDay: today,
        presentItems:foundItems
      });
    }
  });
});
app.post("/", function(req, res) {
  const newActivity = req.body.newItem;

  const nextActivity = new ToDoItem({
    activity: newActivity
  });
  nextActivity.save();
  console.log("item saved to db");
  res.redirect("/");
});

app.get("/lists", function(req, res) {


  res.render("lists");
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


// const yesterday = currentDay.setDate(currentDay.getDate()-1);
//
// ToDoItem.deleteMany({date:yesterday}, function(err){
//   if(!err){
//     console.log("data deleted");
//   }
// });
