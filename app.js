//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Setting up session

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// Creating BD for Users

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
// Setting mongoose to prevent some deprecation warnings
mongoose.set("useCreateIndex",true);
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// Pluging in userSchema with passportLocalMongoose to hash and salt passwords before saving

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("user", userSchema);

// Setting up passport

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

// Render secrets page only if authenticated
app.get("/secrets",function(req,res){
  if (req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login")
  }
});


// New user registration and redirect for secrets page

app.post("/register", function(req,res){

User.register({username: req.body.username}, req.body.password, function(err,user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("secrets")
    })
  }
});

});

// Login form and redirect for secrets page

app.post("/login", function(req,res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("secrets")
      });
    }
  });

});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});














app.listen(3000, function(){
  console.log("Connected to server");
});
