const multer = require("multer");
const fs = require("fs-extra");
const extract = require("extract-zip");
const { uploadStaticFiles } = require("../helpers/kubernetes");

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

const makeFileUploadController = (Backend) => {
  const uploadFile = async (req, res, next) => {
    const filePath = req.file.path;
    const id = req.body.id;
    const UserId = req.user.id;

    const satellite = await Backend.findOne({ where: { id, UserId } });
    if (!satellite) {
      await fs.remove(filePath);
      return res.sendStatus(404);
    }

    const satelliteName = satellite.name;

    await unZip(filePath, satelliteName);
    await fs.remove(filePath);

    try {
      await uploadStaticFiles(satelliteName, `/uploads/${satelliteName}`);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    return res.json({ message: "uploaded!" });
  };

  return uploadFile;
};

module.exports = {
  upload,
  makeFileUploadController,
};
