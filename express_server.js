const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true})); 
app.use(cookieParser())// convert request body from a Buffer into string
app.set("view engine", "ejs");

// USER DATABASE
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
// URL DATABASE
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// RANDOM GENERATOR
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

// EMAIL LOOKUP
const searchEmail = function(email, database) {
  for (let key of database) {
    if (database[key].email === email) {
      return true;
    }
  }
  return false;
};

//CREATE NEW
// integrate long url inside of short url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls/${shortURL}`);//responds with a redirect to /urls/:shortURL 
});

app.get("/urls", (req, res) => {
  //console.log("test --->",req.cookies) testing if cookies are being passed
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
    console.log(templateVars)
  res.render("urls_index", templateVars);
});// pass URL data to our template

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  }
  res.render("urls_new", templateVars); // present form to user
});

// SHORT URLS INTO LINKS
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL; 
  let templateVars = { 
    username: req.cookies["username"],
    shortURL: shortURL, 
    longURL: urlDatabase[req.params.shortURL]};//Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase
  res.render("urls_show", templateVars); //render information about a single URL
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//EDIT
// added edit redirection to change long url's
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//LOGIN
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  //console.log("TEST",res.cookies); testing if cookies are set
  res.redirect("/urls");
}); 


//LOGOUT
app.post("/logout", (req, res) => {
res.clearCookie("username");
res.redirect("/urls");
})

//REGISTRATION
app.get("/registration", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_registration", templateVars);
})

app.post("/registration", (req, res) => {
  if (req.body.email === "" || req.body.password == "") {
    res.send("Error 400");
    console.log("email missing")
  } else if (searchEmail(req.body.email, users)) {
    res.send("Error 400");
    console.log("email exists")
  } else {
    let newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password
    };
  }; 
  console.log(users[newUserID])
  res.cookie("userID", newUserID);
  res.redirect("/urls");
});
//NEW USER REG WILL ENCRYPT PASSWORD

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});