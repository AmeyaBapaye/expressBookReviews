const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Util methods
const isExistingUser = (username) => {
  let existingUsers = users.filter((user) => {
    return user.username == username;
  });

  if (existingUsers.length > 0) {
    return true;
  } else {
    return false;
  }
};

// Endpoints
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are both provided
  if (username && password) {
    //Check if user already exists
    if (!isExistingUser(username)) {
      //add the new user to the customers array
      users.push({ username: username, password: password });
      return res.status(200).json({
        message:
          "User has been successfully registered. You are now able to login.",
      });
    } else {
      return res.status(404).json({ message: "This user already exists." });
    }
  }
});

// Get the book list available in the shop
// // Synchronous Version
// public_users.get("/", function (req, res) {
//   return res.status(200).send(JSON.stringify(books, null, 4));
// });

// Async Version
public_users.get("/", async (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// // Get book details based on ISBN
// // Synchronous Version
// public_users.get("/isbn/:isbn", function (req, res) {
//   const isbnToFind = req.params.isbn;
//   if (books[isbnToFind]) {
//     return res.status(200).send(JSON.stringify(books[isbnToFind], null, 4));
//   } else {
//     return res
//       .status(404)
//       .json({ message: `Book with ISBN ${isbnToFind} not found.` });
//   }
// });

//Async Version
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbnToFind = req.params.isbn;
  try {
    if (!books[isbnToFind]) {
      throw new Error((message = `Book with ISBN ${isbnToFind} not found.`));
    } else {
      return res.status(200).send(JSON.stringify(books[isbnToFind], null, 4));
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book details based on author
// // Synchronous Version
// public_users.get("/author/:author", function (req, res) {
//   const authorToFind = req.params.author;
//   const booksByAuthor = {};

//   for (const [isbn, book] of Object.entries(books)) {
//     if (book.author.toLowerCase() === authorToFind.toLowerCase()) {
//       booksByAuthor[isbn] = book;
//     }
//   }

//   if (Object.keys(booksByAuthor).length > 0) {
//     return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
//   } else {
//     return res
//       .status(404)
//       .json({ message: `No books by the author ${authorToFind} found.` });
//   }
// });

// Async Version
public_users.get("/author/:author", async (req, res) => {
  const authorToFind = req.params.author;
  const booksByAuthor = {};

  try {
    for (const [isbn, book] of Object.entries(books)) {
      if (book.author.toLowerCase() === authorToFind.toLowerCase()) {
        booksByAuthor[isbn] = book;
      }
    }
    if (Object.keys(booksByAuthor).length > 0) {
      return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } else {
      return res
        .status(404)
        .json({ message: `No books by the author ${authorToFind} found.` });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get all books based on title
// //Synchronous Version
// public_users.get("/title/:title", function (req, res) {
//   const titleToFind = req.params.title;
//   const booksByTitle = {};

//   for (const [isbn, book] of Object.entries(books)) {
//     if (
//       book.title.toLowerCase().includes(titleToFind.toLowerCase()) ||
//       titleToFind.toLowerCase().includes(book.title.toLowerCase())
//     ) {
//       booksByTitle[isbn] = book;
//     }
//   }

//   if (Object.keys(booksByTitle).length > 0) {
//     return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
//   } else {
//     return res
//       .status(404)
//       .json({ message: `No books entitled ${titleToFind} found.` });
//   }
// });

// Async Version
public_users.get("/title/:title", async (req, res) => {
  const titleToFind = req.params.title;
  const booksByTitle = {};

  try {
    for (const [isbn, book] of Object.entries(books)) {
      if (
        book.title.toLowerCase().includes(titleToFind.toLowerCase()) ||
        titleToFind.toLowerCase().includes(book.title.toLowerCase())
      ) {
        booksByTitle[isbn] = book;
      }
    }
    if (Object.keys(booksByTitle).length > 0) {
      return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } else {
      return res
        .status(404)
        .json({ message: `No books entitled ${titleToFind} found.` });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbnToFind = req.params.isbn;
  if (books[isbnToFind]) {
    return res
      .status(200)
      .send(JSON.stringify(books[isbnToFind]["reviews"], null, 4));
  } else {
    return res.status(404).json({
      message: `Book with ISBN ${isbnToFind} not found. Cannot provide reviews`,
    });
  }
});

module.exports.general = public_users;
