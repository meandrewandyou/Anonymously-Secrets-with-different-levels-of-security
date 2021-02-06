//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Creating BD for Users

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});




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

// Lets salt our password before adding to DB
bcrypt.hash(req.body.password, saltRounds, function(err,hash){
  const newUser = new User({
    email: req.body.username,
    password: hash
  });
  newUser.save(function(err){
    if (err){
      console.log(err);
    }else{
      res.render("secrets")
    }
  });
});
});

// Login form and redirect for secrets page

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(!err){
      if(foundUser){
        
// Lets compare passwords via bcrypt.compare

        bcrypt.compare(password, foundUser.password, function(err,result){
          if(result === true){
            res.render("secrets")
          }
        })
      }
    }else {
      console.log(err);
    }
  });
});
















app.listen(3000, function(){
  console.log("Connected to server");
});
