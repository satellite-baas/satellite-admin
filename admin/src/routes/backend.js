const express = require("express");
const makeBackendController = require("../controllers/Backend");
const { ensureLogIn } = require("../controllers/Auth");

function makeBackendRouter(Backend) {
  const router = express.Router();
  const backendController = makeBackendController(Backend);

  router.post("/backend", ensureLogIn, backendController.createBackend);
  router.get("/backends", ensureLogIn, backendController.getAllBackends);
  router.delete("/backend", ensureLogIn, backendController.deleteBackend);
  router.get("/backend/:id", ensureLogIn, backendController.getBackend);

  return router;
}

module.exports = makeBackendRouter;
