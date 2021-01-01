const FormData = require("form-data");
const axios = require("axios");

const PORT = 5000;

function getUrl(satelliteName, path) {
  return `http://satellite-app-server.${satelliteName}.svc.cluster.local:${PORT}${path}`;
}

function makeCustomSatelliteController(Backend) {
  async function uploadSchema(req, res) {
    const { id } = req.body;
    const file = req.files[0];
    console.log(`File: ${file}`);
    console.log(`Id: ${id}`);
    if (!id || !file) return res.status(422).send();

    const schemaBuffer = file.buffer;

    const UserId = req.user.id;
    const satellite = await Backend.findOne({ where: { id, UserId } });
    if (!satellite) return res.sendStatus(404);

    const satelliteName = satellite.name;
    const url = getUrl(satelliteName, "/admin/schema");

    try {
      const response = await axios.post(url, schemaBuffer);

      if (response.data.errors) {
        return res.status(422).send(response.data);
      }

      return res.status(201).send(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).send(error.response.data);
      } else {
        return res.sendStatus(500);
      }
    }
  }

  async function getFiles(req, res) {
    const id = Number(req.params.id);

    if (!id) return res.sendStatus(422);

    const UserId = req.user.id;
    const satellite = await Backend.findOne({ where: { id, UserId } });
    if (!satellite) return res.sendStatus(404);

    const satelliteName = satellite.name;
    const url = getUrl(satelliteName, "/files");

    try {
      const response = await axios.get(url);
      return res.status(200).send(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).send(error.response.data);
      } else {
        return res.sendStatus(500);
      }
    }
  }

  async function deleteFile(req, res) {
    const { id, fileName } = req.body;

    if (!id || !fileName) return res.sendStatus(422);

    const UserId = req.user.id;
    const satellite = await Backend.findOne({ where: { id, UserId } });
    if (!satellite) return res.sendStatus(404);

    const satelliteName = satellite.name;
    const url = getUrl(satelliteName, "/file");

    try {
      const response = await axios.delete(url, {
        data: {
          fileName,
        },
      });
      return res.status(202).send(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).send(error.response.data);
      } else {
        return res.sendStatus(500);
      }
    }
  }

  async function getHealth(req, res) {
    const id = Number(req.params.id);

    if (!id) return res.sendStatus(422);

    const UserId = req.user.id;
    const satellite = await Backend.findOne({ where: { id, UserId } });
    if (!satellite) return res.sendStatus(404);

    const satelliteName = satellite.name;
    const url = getUrl(satelliteName, "/health");

    try {
      const response = await axios.get(url);
      return res.status(200).send(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).send(error.response.data);
      } else {
        return res.sendStatus(500);
      }
    }
  }

  async function sendGQL(req, res) {
    const id = Number(req.params.id);

    if (!id) return res.sendStatus(422);

    const UserId = req.user.id;
    const satellite = await Backend.findOne({ where: { id, UserId } });
    if (!satellite) return res.sendStatus(404);

    const satelliteName = satellite.name;
    const url = getUrl(satelliteName, "/graphql");

    try {
      const response = await axios.post(url, req.body);
      return res.status(response.status).send(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).send(error.response.data);
      } else {
        return res.sendStatus(500);
      }
    }
  }

  async function sendAdminGQL(req, res) {
    const id = Number(req.params.id);

    if (!id) return res.sendStatus(422);

    const UserId = req.user.id;
    const satellite = await Backend.findOne({ where: { id, UserId } });
    if (!satellite) return res.sendStatus(404);

    const satelliteName = satellite.name;
    const url = getUrl(satelliteName, "/admin");

    try {
      const response = await axios.post(url, req.body);
      return res.status(response.status).send(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).send(error.response.data);
      } else {
        return res.sendStatus(500);
      }
    }
  }

  return {
    uploadSchema,
    getFiles,
    deleteFile,
    getHealth,
    sendGQL,
    sendAdminGQL,
  };
}

module.exports = makeCustomSatelliteController;
