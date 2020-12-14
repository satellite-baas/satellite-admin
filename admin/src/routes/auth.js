const express = require("express");
const makeUserController = require("../controllers/User");
const { makeAuthController } = require("../controllers/Auth");

function makeAuthRouter(passport, User) {
  const router = express.Router();
  const userController = makeUserController(User);
  const authController = makeAuthController(passport);

  router.post("/signup", userController);

  router.post("/login", authController.isLoggedIn, authController.logIn);

  router.post("/logout", authController.logOut);

  return router;
}

module.exports = makeAuthRouter;
