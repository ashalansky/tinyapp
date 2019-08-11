const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const {
  searchEmail
} = require("./helpers");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: "session",
  keys: ["Superman"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.set("view engine", "ejs");

// //----------------------------------------------- EMAIL LOOKUP---------------------------------------------------//
// const searchEmail = function(email, users) {
//   for (let key in users) {
//     if (users[key]["email"] === email) {
//       return key;
//     }
//   }
//   return false;
// };

//----------------------------------------------USER DATABASE---------------------------------------------------//
const users = {
  "aJ48lw": {
    userID: "aJ48lw",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "user2RandomID": {
    userID: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher", 10)
  }
}
//----------------------------------------------- URL DATABASE-----------------------------------------------------//
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


//--------------------------------------------- RANDOM GENERATOR---------------------------------------------------//
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}



//CREATE NEW ----------------------------------POST-URLS--------------------------------------------------------//
// integrate long url inside of short url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    "longURL": req.body.longURL,
    "userID": req.session.userID
  }
  console.log("POOP", urlDatabase[shortURL]);
  console.log("users object", users[req.session.userID]);
  res.redirect(`/urls/${shortURL}`); //responds with a redirect to /urls/:shortURL 
});

app.get("/urls", (req, res) => {
  let templateVars = {
    userID: users[req.session.userID],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    email: users[req.session.userID].email,
    userID: users[req.session.userID],
  }
  res.render("urls_new", templateVars);
});

// ---------------------------------------------SHORT URLS INTO LINKS---------------------------------------------//
//Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  let templateVars = {
    email: users[req.session.userID].email,
    userID: users[req.session.userID],
    shortURL: shortURL,
    longURL: urlObject && urlObject.longURL,
  };
  res.render("urls_show", templateVars); //render information about a single URL
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//------------------------------------------------------DELETE--------------------------------------------------//
app.post("/urls/:shortURL/delete", (req, res) => {
  let userID = users[req.session.userID];
  if (userID) {
    if (userID["userID"] === urlDatabase[req.params.shortURL].userID) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
  }
  res.redirect("/login");
});

//---------------------------------------------------EDIT - SHORTURL---------------------------------------------//
// added edit redirection to change long url's
app.post("/urls/:shortURL", (req, res) => {
  let userID = users[req.session.userID];
  if (userID) {
    if (userID["userID"] === urlDatabase[req.params.shortURL].userID) {
      urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
      res.redirect(`/urls/${req.params.shortURL}`);
    } else {
      res.redirect("/urls");
    }
  }
});


//------------------------------------------------------LOGIN------------------------------------------------------//
app.post("/login", (req, res) => {
  let userID = searchEmail(req.body.email, users);
  if (userID === false) {
    console.log("Email not found")
    res.send("Error 403: Email not found")
  }
  if (userID) {
    let password = bcrypt.compareSync(req.body.password, users[userID]["password"])
    if (password === true) {
      req.session.userID = userID;
      res.redirect("/urls");
    } else {
      console.log("Password is incorrect!");
      res.send("Error 403: Password is incorrect");
    }
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    userID: users[req.session.userID]
  };
  res.render("urls_login", templateVars);
});


//----------------------------------------------------LOGOUT------------------------------------------------------//
app.post("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect("/login");
});

//--------------------------------------------------REGISTRATION---------------------------------------------------//
app.get("/registration", (req, res) => {
  let templateVars = {
    email: users[req.session.email],
    userID: req.session.userID
  };
  res.render("urls_registration", templateVars);
});

app.post("/registration", (req, res) => {
  // const newUserID = generateRandomString();
  // const newUserEmail = req.body.email;

  if (req.body.email === "" || req.body.password === "") {
    console.log("email missing")
    res.send("Error 400");
    return;
  } else if (searchEmail(req.body.email, users)) {
    console.log("email exists");
    res.send("Error 400");
    return;
  } else {
    const newUserID = generateRandomString();
    const newUserEmail = req.body.email;
    users[newUserID] = {
      userID: newUserID,
      email: newUserEmail,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    console.log(users[newUserID]);
    req.session.userID = newUserID;
    res.redirect("/urls");
  }
});

//---------------------------------------NEW USER REG WILL ENCRYPT PASSWORD----------------------------------------//

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});