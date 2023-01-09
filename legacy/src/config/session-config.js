module.exports = function(environment = "development") {
  return {
    name: "session",
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: environment === "production",
      maxAge: 60000
    }
  };
};