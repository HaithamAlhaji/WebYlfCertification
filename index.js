const constants = require("./config/constants"),
  express = require("express"),
  expressHandlebars = require("express-handlebars"),
  path = require("path"),
  home = require("./routes/home/index"),
  admin = require("./routes/admin/index"),
  i18n = require("i18n-express"),
  session = require("express-session"),
  flash = require("connect-flash"),
  mysql = require("mysql"),
  bodyParser = require("body-parser");

var defaults = {
  style: "default",
  language: "ar"
};

//
const app = express();
console.log(constants.mysql.host);
//
const mysqlConnection = mysql.createPool({
  host: constants.mysql.host,
  user: constants.mysql.username,
  password: constants.mysql.password,
  database: constants.mysql.database
});
mysqlConnection.getConnection((err, connection) => {
  connection;
  connection.query("select 1;", (errors, results, fields) => {
    if (errors) {
      throw errors;
    } else {
    }
  });
  connection.release();
});

global.mysqlConnection = mysqlConnection;
//
app.set("defaultStyle", defaults.style);
app.set("view engine", "handlebars");

//
app.engine(
  "handlebars",
  expressHandlebars({
    defaultLayout: "home/index",
    helpers: { defaultStlye: defaults.style }
  })
);

//
app.use(
  session({
    secret: "mypro.haitham.com",
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());
app.use(
  i18n({
    translationsPath: path.join(__dirname, "public/lang"),
    cookieLangName: "ulang",
    browserEnable: false,
    defaultLang: "ar",
    paramLangName: "clang",
    siteLangs: ["en", "ar", "ku"]
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("bodyParser", bodyParser);
app.use("/", home);
app.use("/admin", admin);
app.use(express.static(path.join(__dirname, "public")));

//
app.listen(constants.express.port, () => {});
