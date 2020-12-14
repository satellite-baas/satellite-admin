function makeAuthController(passport) {
  const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.sendStatus(200);
    }

    return next();
  };

  const logIn = (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).send();
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.sendStatus(200);
      });
    })(req, res, next);
  };

  const logOut = (req, res) => {
    req.logOut();
    return res.sendStatus(200);
  };

  return {
    isLoggedIn,
    logIn,
    logOut,
  };
}

function ensureLogIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  return next();
}

module.exports = { makeAuthController, ensureLogIn };
