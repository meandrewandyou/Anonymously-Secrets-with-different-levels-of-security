//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Crearing BD for Users

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
const userSchema = {
  email: String,
  password: String
};
const User = new mongoose.model("user", userSchema);


// Get requests

app.get("/",function(req,res){
  res.render("home")
});


app.get("/login",function(req,res){
  res.render("login")
});

app.get("/register",function(req,res){
  res.render("register")
});


// New user registration and redirect for secrets page

app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if (err){
      console.log(err);
    }else{
      res.render("secrets")
    }
  });
});

// Login form and redirect for secrets page

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(!err){
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets")
        }
      }
    }
  });
});

















app.listen(3000, function(){
  console.log("Connected to server");
});
