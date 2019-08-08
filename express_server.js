const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true})); // convert request body from a Buffer into string
app.set("view engine", "ejs");


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

//CREATE NEW
// integrate long url inside of short url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls/${shortURL}`);//responds with a redirect to /urls/:shortURL 
});

app.get("/urls", (req, res) => {
  console.log(req.cookies)
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
    
  res.render("urls_index", templateVars);
});// pass URL data to our template

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new"); // present form to user
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
  //console.log([req.params.id]);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//LOGIN
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  console.log(res.cookie);
  res.redirect("/urls");
}); 

app.get("/login", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("/urls", templateVars);
})

//LOGOUT
app.post("/logout", (rew, res) => {
res.clearCookie("username");
res.redirect('/urls');
})

//REGISTRATION
//NEW USER REG WILL ENCRYPT PASSWORD

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});