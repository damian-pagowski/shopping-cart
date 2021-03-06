require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const cartRouter = require("./routes/cart");
const productRouter = require("./routes/products");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const app = express();
const rateLimit = require("express-rate-limit");
 
// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

const CLIENT_URL = process.env.CLIENT_URL;
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// session
app.use(session({ secret: "secret", saveUninitialized: false, resave: false }));
//passport
require("./config/passport");
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// set static folder
app.use(express.static(`${__dirname}/public`));
// cors
// app.use(cors());
app.use(cors({ credentials: true, origin: CLIENT_URL }));

// helmet
app.use(helmet());

//routes
app.use("/", indexRouter);
app.use("/users", usersRouter(passport));
app.use("/cart", cartRouter);
app.use("/products", productRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
// db connection
const DB_URI = process.env.MONGOLAB_URI;
console.log(`Connecting to database:  ${DB_URI}`);
mongoose.set("useFindAndModify", false);
mongoose
  .connect(DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .catch(error => console.log(error));
// run server
const SERVER_PORT = process.env.PORT || process.env.SERVER_PORT || 3030;
app.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`));
module.exports = app;
