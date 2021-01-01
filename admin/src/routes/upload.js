const express = require("express");
const { upload, makeFileUploadController } = require("../controllers/Upload");
const { ensureLogIn } = require("../controllers/Auth");

const makeFileUploadRouter = (Backend) => {
  const router = express.Router();
  const fileUploadController = makeFileUploadController(Backend);

  router.post("/upload", ensureLogIn, upload, fileUploadController);

  return router;
};

module.exports = {
  makeFileUploadRouter,
};
