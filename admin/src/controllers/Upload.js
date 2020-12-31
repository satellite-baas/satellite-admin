const multer = require("multer");
const fs = require("fs-extra");
const extract = require("extract-zip");
const {
  getWebServerPodName,
  uploadStaticFiles,
} = require("../helpers/kubernetes");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).single("file");

const unZip = async (filePath, dirName) => {
  console.log("unzipping", filePath);

  const fullDirPath = `/uploads/${dirName}`;

  await fs.remove(fullDirPath);

  await extract(filePath, { dir: fullDirPath });

  if (!fs.existsSync(`${fullDirPath}/index.html`)) {
    throw new Error(
      "Please make sure there is a file named index.html in the root of your zip!"
    );
  }
};

const uploadFile = async (req, res, next) => {
  const filePath = req.file.path;
  const satelliteId = req.body.id;

  await unZip(filePath, satelliteId);
  console.log("got here");
  await fs.remove(filePath);
  console.log("Did I get here?");

  const podName = await getWebServerPodName("testapp");

  try {
    uploadStaticFiles("testapp", `/uploads/${satelliteId}`);
  } catch (err) {
    console.log(err);
  }
  console.log(podName);

  return res.json({ message: "uploaded!" });
};

module.exports = {
  upload,
  uploadFile,
};
