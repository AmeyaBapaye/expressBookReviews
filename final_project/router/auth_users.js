const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isUsernameValid = (username) => {
  return users.some((user) => user.username == username);
};

const isAuthenticatedUser = (username, password) => {
  let validCustomers = users.filter((user) => {
    return user.username == username && user.password == password;
  });

  if (validCustomers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate the user
  if (isAuthenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.auth = {
      accessToken,
      username,
    };
    return res.status(200).send("User has successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid login. Please check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!req.session || !req.session.auth) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const isbn = req.params.isbn;
  const username = req.session.auth.username;
  const review = req.body.review;

  if (books[isbn]) {
    if (isUsernameValid(username)) {
      books[isbn]["reviews"][username] = review;
      res
        .status(200)
        .send(
          `The following review has been added for the book with the ISBN ${isbn}:\n  Review by ${username}: \"${review}\"`
        );
    } else {
      res.status(404).json({ message: `The username ${username} is invalid.` });
    }
  } else {
    res
      .status(404)
      .json({ message: `There is no book with the ISBN ${isbn}.` });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!req.session || !req.session.auth) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const isbn = req.params.isbn;
  const username = req.session.auth.username;

  if (books[isbn]) {
    if (isUsernameValid(username)) {
      delete books[isbn]["reviews"][username];
      res.status(200).send(`Review by the user ${username} has been deleted.`)
    } else {
      res.status(404).json({ message: `The username ${username} is invalid.`});
    }
  } else {
    res
      .status(404)
      .json({ message: `There is no book with the ISBN ${isbn}.` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isUsernameValid = isUsernameValid;
module.exports.users = users;
