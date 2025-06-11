const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

let customers = [];

// Util methods
const isExistingUser = (username) => {
  let existingCustomers = customers.filter((customer) => {
    return customer.customerName == username;
  });

  if (existingCustomers.length > 0) {
    return true;
  } else {
    return false;
  }
};

const isAuthenticatedCustomer = (username, password) => {
  let validCustomers = customers.filter((customer) => {
    return (
      customer.customerName == username && customer.customerPassword == password
    );
  });

  if (validCustomers.length > 0) {
    return true;
  } else {
    return false;
  }
};

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

//Authentication Middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.auth) {
    let token = req.session.auth["accessToken"];

    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

//Login Endpoint
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate the user
  if (isAuthenticatedCustomer(username, password)) {
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

// Register a new user
app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are both provided
  if (username && password) {
    //Check if user doesn't already exist
    if (!isExistingUser(username)) {
      //add the new user to the customers array
      customers.push({ customerName: username, password: password });
      return res.status(200).json({
        message:
          "User has been successfully registered. You are now able to login.",
      });
    } else {
      return res.status(404).json({ message: "This user already exists." });
    }
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
