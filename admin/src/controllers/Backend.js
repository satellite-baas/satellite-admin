const { tearDownSatellite, spinUpSatellite } = require("../helpers/kubernetes");

function makeBackendController(Backend) {
  const isUniqueName = async (name) => {
    const backend = await Backend.findOne({ where: { name } });
    return !backend;
  };

  const isAlphaNumericName = (name) => {
    const alphaNumericRegex = /^[0-9a-zA-Z]+$/;
    return name.match(alphaNumericRegex);
  };

  async function createBackend(req, res) {
    const { name } = req.body;
    const UserId = req.user.id;

    if (!name) {
      return res.status(422).send({ error: "Backend requires a name" });
    }

    if (!isAlphaNumericName(name)) {
      return res.status(422).send({
        error: "Backend names can only consist of alphanumeric characters",
      });
    }

    const uniqueName = await isUniqueName(name);
    if (!uniqueName) {
      return res
        .status(422)
        .send({ error: "Backend with that name already exists" });
    }

    const newBackend = Backend.build({ name, UserId });

    try {
      await newBackend.save();
      var apiKey = newBackend.apiKey;
    } catch (err) {
      return res.status(500).send();
    }

    const onSuccess = (output) => {
      return res
        .status(201)
        .send({
          message: `Backend ${newBackend.name} created!`,
          backend: newBackend,
        });
    };

    const onFailure = async (error) => {
      await Backend.destroy({ where: { name } });
      return res.status(500).send({
        message: `Something went wrong while spinning up ${newBackend.name}`,
        error,
      });
    };

    spinUpSatellite(name, apiKey, onSuccess, onFailure);
  }

  async function deleteBackend(req, res) {
    const { id } = req.body;
    const UserId = req.user.id;

    const backend = await Backend.findOne({ where: { id, UserId } });

    if (!backend) {
      return res.status(404).send({ error: "No backend found" });
    }

    const onSuccess = async (output) => {
      await Backend.destroy({ where: { id } });
      return res
        .status(201)
        .send({ message: `Backend ${backend.name} destroyed!`, output });
    };

    const onFailure = (error) => {
      return res.status(500).send({
        message: `Something went wrong while destroying ${backend.name}`,
        error,
      });
    };

    tearDownSatellite(backend.name, onSuccess, onFailure);
  }

  async function getAllBackends(req, res) {
    const UserId = req.user.id;
    const backends = await Backend.findAll({ where: { UserId } });

    res.send({ backends });
  }

  async function getBackend(req, res) {
    const id = Number(req.params.id);
    const UserId = req.user.id;

    const backend = await Backend.findOne({ where: { id, UserId } });

    if (!backend) {
      return res.status(404).send({ error: "No backend found" });
    }

    res.send({ backend });
  }

  return {
    createBackend,
    deleteBackend,
    getAllBackends,
    getBackend,
  };
}

module.exports = makeBackendController;
