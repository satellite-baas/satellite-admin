const express = require("express");
const sequelize = require("./models/index");
const cors = require("cors");
const uuid = require("uuid").v4;
const session = require("express-session");
const configurePassport = require("./helpers/configure-passport");
const makeAuthRouter = require("./routes/auth");
const makeBackendRouter = require("./routes/backend");
const makeProxyRouter = require("./routes/proxy");

(async function () {
  await sequelize.sync({ force: true });
  const { User, Backend } = sequelize.models;

  const app = express();

  var corsOptions = { origin: "http://localhost:3000", credentials: true };
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      genid: (req) => {
        return uuid();
      },
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
      },
    })
  );

  const passport = configurePassport(User);

  app.use(passport.initialize());
  app.use(passport.session());

  const authRouter = makeAuthRouter(passport, User);
  const backendRouter = makeBackendRouter(Backend);
  const proxyRouter = makeProxyRouter(Backend);

  app.use(proxyRouter);
  app.use(authRouter);
  app.use(backendRouter);

  app.get("/", (req, res) => {
    res.send(`You hit home page!\n`);
  });

  app.listen(3000);
})();
