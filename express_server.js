const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true})); 
app.use(cookieParser())// convert request body from a Buffer into string
app.set("view engine", "ejs");

// EMAIL LOOKUP
const searchEmail = function(email, users) {
  for (let key in users) {
    if (users[key]["email"] === email) {
      return key;
    }
  }
  return false;
};

// PASSWORD LOOKUP
const searchPassword = function(password, users) {
  for (let key in users) {
    if (users[key]["password"] === password) {
      return true;
    }
  }
  return false;
};

// USER DATABASE
const users = { 
  "aJ48lw": {
    userID: "aJ48lw", 
    email: "user@example.com", 
    password: "purple"
  },
 "user2RandomID": {
    userID: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher"
  }
}
// URL DATABASE
let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lw"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lw" 
  }
};


// RANDOM GENERATOR
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}



//CREATE NEW
// integrate long url inside of short url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    "longURL": req.body.longURL,
    "userID": req.cookies["userID"]
  }
  console.log(urlDatabase[shortURL]);
  console.log("users object", users[req.cookies["userID"]]);
  res.redirect(`/urls/${shortURL}`);//responds with a redirect to /urls/:shortURL 
});

app.get("/urls", (req, res) => {
  //console.log("test --->",req.cookies) testing if cookies are being passed
  console.log(req.cookies)
  let templateVars = {
    //email: users[req.cookies["userID"]].email,
    userID: users[req.cookies["userID"]],
    urls: urlDatabase };
    //console.log("EMAIL IS UNDEFINED",req.cookies["userID"]);
    //console.log("USERID", req.cookies["userID"])
  res.render("urls_index", templateVars);
});// pass URL data to our template

app.get("/urls/new", (req, res) => {
  let templateVars = {
    email: users[req.cookies["userID"]].email,
    userID: users[req.cookies["userID"]],
  }
  // if (!userID) {
  //   res.redirect("/login");
  // } // IF USER IN NOT LOGGED IN WHEN TRYING TO CREATE NEW, REDIRECT TO LOGIN
  res.render("urls_new", templateVars); // present form to user
});

// SHORT URLS INTO LINKS
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL; 
  let templateVars = { 
    email: users[req.cookies["userID"]].email,
    userID: users[req.cookies["userID"]],
    shortURL: shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL};//Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase
  res.render("urls_show", templateVars); //render information about a single URL
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  let userID = users[req.cookies["userID"]];
    if (userID) {
     if (userID["userID"] === urlDatabase[req.params.shortURL]["userID"]) {
        delete urlDatabase[req.params.shortURL];
        res.redirect("/urls");
      }
    }
    res.redirect("/login");
});

//EDIT - SHORTURL
// added edit redirection to change long url's
app.post("/urls/:shortURL", (req, res) => {
  let userID = users[req.cookies["userID"]];
    if (userID) {
      if (userID["userID"] === urlDatabase[req.params.shortURL]["userID"]) {
         urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
        res.redirect("urls_show");
      }
  }
  res.redirect("/urls");
});


//LOGIN
app.post("/login", (req, res) => {
  let userID = searchEmail(req.body.email, users);
  //console.log("HERE ARE THE USERS", req.body.email, users); // check if assessing users database
  if (userID === false) {
    console.log("Email not found")
    res.send("Error 403: Email not found")
  }
  if (userID) {
  let password = (searchPassword(req.body.password, users))
    if (password === true) {
      res.cookie("userID", userID);
      res.redirect("/urls");
    } else {
      console.log("Password is incorrect!");
      res.send("Error 403: Password is incorrect");
    }
  }
}); 

app.get("/login", (req, res) => {
  let templateVars = {
    //email: users[req.cookies["userID"]].email,
    userID: users[req.cookies["userID"]]
  };
  res.render("urls_login", templateVars);
});


//LOGOUT
app.post("/logout", (req, res) => {
res.clearCookie("userID");
res.redirect("/login");
});

//REGISTRATION
app.get("/registration", (req, res) => {
  let templateVars = {
    email: users[req.cookies["email"]],
    userID: req.cookies["userID"]
  };
  res.render("urls_registration", templateVars);
});

app.post("/registration", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    console.log("email missing")
      res.send("Error 400");
      return;
  } 
  if (searchEmail(req.body.email, users)){
      console.log("email exists");
      res.send("Error 400");   
      return;
  }
  let newUserID = generateRandomString();
  users[newUserID] = {
    userID: newUserID,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users[newUserID]);
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