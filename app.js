const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();
const $ = require("jquery");
const content= "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tincidunt vitae semper quis lectus nulla at volutpat diam ut. Eget velit aliquet sagittis id consectetur purus. Leo in vitae turpis massa sed elementum tempus egestas. In metus vulputate eu scelerisque felis imperdiet. Dis parturient montes nascetur ridiculus mus mauris vitae. Tincidunt tortor aliquam nulla facilisi cras fermentum odio. Eget nunc scelerisque viverra mauris in aliquam sem fringilla ut. Suspendisse ultrices gravida dictum fusce ut placerat orci nulla. Quis blandit turpis cursus in hac habitasse platea dictumst quisque. Nunc congue nisi vitae suscipit tellus mauris a diam. Sit amet justo donec enim."

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
const ToDoItem = mongoose.model("ToDoItem", itemSchema);
const item1 = new ToDoItem({
  activity: "Hey there, Welcome!"
});
const item2 = new ToDoItem({
  activity: "What is your main focus today?"
});
const defaultItems = [item1,item2];

const customlstSchema = new mongoose.Schema({
  title : String,
  item:[itemSchema],
  date:{
    type: Date,
    default: Date.now()
  }

});
// itemSchema.path('date').index({expires:});
const CustomList = mongoose.model("CustomList",customlstSchema);

// const helpContSchema = new mongoose.Schema({
//   content:String
// });
//
// const Help = mongoose.model("Help", helpContSchema);
//
// const help = new Help({
  // });

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
      if(foundItems.length===0){
        ToDoItem.insertMany(defaultItems, function(err){
          if(!err){
            console.log("successfully inserted default documents")
          }
        });
        res.redirect("/");
      }else{
        res.render("index",{
          listTitle:"todo",
          currentDay: today,
          presentItems:foundItems
        });
      }
    }
  });
});

app.get("/category/:customListname", function(req,res){
  const customListname = _.capitalize(req.params.customListname);
  CustomList.findOne({name: customListname}, function(err,result){
    if(!err){
      if(!result){
        const defaultcustList = new CustomList({
          title: customListname,
          item: defaultItems
        });
        defaultcustList.save();
        res.redirect("/category/"+customListname);
      }else{
        res.render("index",{
          listTitle:result.title,
          currentDay: today,
          presentItems:result.item
        });
      }
    }
  });
});

app.get("/help", function(req, res) {

  res.render("help",{helpContent:content});
});


app.post("/", function(req, res) {
  const newActivity = req.body.newItem;
  const listName = req.body.list;
  const nextActivity = new ToDoItem({
    activity: newActivity
  });

if(listName === "todo"){
  nextActivity.save();
  console.log("item saved to db");
  res.redirect("/");
}else{
  CustomList.findOne({title:listName}, function(err, foundList){
    foundList.item.push(nextActivity);
    foundList.save();
    res.redirect("/category/"+listName);
  });
}




});

app.post("/delete", function(req, res) {
  const idofChecked = req.body.check;
  const listName = req.body.custlistName;
  if(listName==="Today"){
    ToDoItem.findByIdAndRemove(idofChecked, function(err) {
      if (!err) {
        console.log("successfully deleted checked item");
        res.redirect("/");
      }
    });
  }else{
    CustomList.findOneAndUpdate({title:listName},{$pull:{item:{_id:idofChecked}}}, function(err, foundList){
      if(!err){
        res.redirect("/category/"+listName);
      }
    });
  }


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
