const express = require("express");
const sequelize = require("./models/index");
const cors = require("cors");
const uuid = require("uuid").v4;
const session = require("express-session");
const redis = require("redis");
const redisStore = require("connect-redis")(session);
const configurePassport = require("./helpers/configure-passport");
const makeAuthRouter = require("./routes/auth");
const makeBackendRouter = require("./routes/backend");
const makeProxyRouter = require("./routes/proxy");

(async function () {
  await sequelize.sync({});
  const { User, Backend } = sequelize.models;

  const app = express();

  var corsOptions = { origin: true, credentials: true };
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });

  app.use(
    session({
      genid: (req) => {
        return uuid();
      },
      store: new redisStore({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        client: redisClient,
      }),
      name: "_redis",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
      },
    })
  );

  if (process.env.NODE_ENV === "production") {
    sessionOptions.cookie.secure = true;
  }

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
