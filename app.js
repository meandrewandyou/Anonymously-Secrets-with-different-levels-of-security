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
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

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
  password: String,
  // googleID added to schema to prevent user's profile to be created multiple timese in db
  googleId: String,
  // Secret field added to make users add and save theirs secrets
  secret: []
});

// Pluging in userSchema with passportLocalMongoose to hash and salt passwords before saving

userSchema.plugin(passportLocalMongoose);

// Pluging in userSchema with findOrCreate method to make GoogleStrategy work (mongoose custom method)

userSchema.plugin(findOrCreate);

const User = new mongoose.model("user", userSchema);

// Setting up passport

passport.use(User.createStrategy());

// Serialize and deserialize methods changed to work with every, not only local strategy

passport.serializeUser(function(user,done){
  done(null, user.id);
});
passport.deserializeUser(function(id,done){
  User.findById(id, function(err,user){
    done(err,user);
  });
});

// Setting up passport to use GoogleStrategy

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// Get requests

app.get("/",function(req,res){
  res.render("home")
});

// Redirect user to google auth page when google button got clicked on /register and /login routes

app.get("/auth/google",
  passport.authenticate("google", {scope: ["profile"]})
);

// If google authentication succesfull, redirect to secrets page

app.get("/auth/google/secrets",
passport.authenticate("google", {failureRedirect: "/login"}),
function(req,res){
  res.redirect("/secrets");
});

app.get("/login",function(req,res){
  res.render("login")
});

app.get("/register",function(req,res){
  res.render("register")
});

// Render secrets page only if authenticated
app.get("/secrets",function(req,res){
  User.find({"secret":{$ne:null}},function(err,foundUsers){
    if(err){
      console.log(err);
    }else{
      if(foundUsers){
        res.render("secrets", {
          usersWithSecrets: foundUsers
        });
      }
    }
  });
});

app.get("/submit", function(req,res){
  if (req.isAuthenticated()){
    res.render("submit");
  }else{
    res.redirect("/login")
  }
})

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

app.post("/submit",function(req,res){
  const newSecret = req.body.secret;
  console.log(newSecret);
  User.findById(req.user.id,function(err,foundUser){
    if(err){
      console.log(err);
    }if(foundUser){
      foundUser.secret.push(newSecret);
      foundUser.save(function(){
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
