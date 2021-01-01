const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const makeCustomSatelliteController = require("../controllers/SatelliteAdmin");
const { ensureLogIn } = require("../controllers/Auth");

function makeProxyRouter(Backend) {
  const router = express.Router();
  const {
    uploadSchema,
    getFiles,
    deleteFile,
    getHealth,
    sendGQL,
    sendAdminGQL,
  } = makeCustomSatelliteController(Backend);

  router.post("/admin/schema", upload.any(), ensureLogIn, uploadSchema);

  router.get("/files/:id", ensureLogIn, getFiles);

  router.delete("/file", ensureLogIn, deleteFile);

  router.get("/health/:id", ensureLogIn, getHealth);

  router.post("/graphql/:id", ensureLogIn, sendGQL);

  router.post("/admin/:id", ensureLogIn, sendAdminGQL);

  return router;
}

module.exports = makeProxyRouter;
