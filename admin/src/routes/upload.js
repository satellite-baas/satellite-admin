const express = require("express");
const { upload, uploadFile } = require("../controllers/Upload");
const { ensureLogIn } = require("../controllers/Auth");

const router = express.Router();

router.post("/upload", upload, uploadFile);

module.exports = {
  uploadRouter: router,
};
