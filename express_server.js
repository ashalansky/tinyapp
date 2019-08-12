const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const {searchEmail, urlsForUser} = require("./helpers");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: "session",
  keys: ["Superman"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");


//--------------USER DATABASE--------------//
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
};
//---------- URL DATABASE---------------//
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

//-------- RANDOM GENERATOR----------------//
const generateRandomString = function () {
  return Math.random().toString(36).slice(2, 8);
};

//CREATE NEW -----------POST-URLS------------//

app.post("/urls", (req, res) => {
  if (!users[req.session.userID]) {
    res.status(401).render("error_page", {
      error: 404,
      message: "Not Signed In",
      userID: users[req.session.userID]
    });
  }
  
  let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      "longURL": req.body.longURL,
      "userID": req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  if (req.session.userID) {
    let listURL = urlsForUser(req.session.userID, urlDatabase);
  
    let templateVars = {
      userID: users[req.session.userID],
       urls: urlDatabase
  };
  res.render("urls_index", templateVars);
} else {
  let templateVars = {
    error: 503,
    message: "Access Denied. Please Login or Register to view urls",
    userID: users[req.session.userID]
  };
  res.status(503).render("error_page", templateVars);
}

});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    userID: users[req.session.userID],
  };
  if (req.session.userID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// -----------SHORT URLS INTO LINKS---------------//

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  let templateVars = {
    userID: users[req.session.userID],
    shortURL: shortURL,
    longURL: urlObject && urlObject.longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]){
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    let templateVars = {
      error: 503,
      message: "Invalid shorturl.",
      userID: users[req.session.userID]
    }
    res.render("error_page", templateVars);
  }
});

//----------DELETE------------------------//
app.post("/urls/:shortURL/delete", (req, res) => {
  let userID = users[req.session.userID];
  if (userID) {
    if (userID["userID"] === urlDatabase[req.params.shortURL].userID) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect("/urls");
    }
    res.redirect("/login");
  }
});

//-----------EDIT - SHORTURL------------//

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

//------------LOGIN-------------------//
app.post("/login", (req, res) => {
  let userID = searchEmail(req.body.email, users);
  if (userID === false) {
    res.send("Error 403: Email not found");
  }
  if (userID) {
    let password = bcrypt.compareSync(req.body.password, users[userID]["password"]);
    if (password === true) {
      req.session.userID = userID;
      res.redirect("/urls");
    } else {
      let templateVars = {
        error: 401,
        message: "Incorrect email or password",
        userID: users[req.session.userID]
      };
      res.status(503).render("error_page", templateVars);
    } 
  }
});

app.get("/login", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.render("urls_login");
  }
});


//--------LOGOUT-------------------------//
app.post("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect("/login");
});

//---------REGISTRATION------------------------//
app.get("/registration", (req, res) => {
  let templateVars = {
    email: users[req.session.email],
    userID: req.session.userID
  };
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration", templateVars);
  }
});

app.post("/registration", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.send("Error 400");
    return;
  } else if (searchEmail(req.body.email, users)) {
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

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});