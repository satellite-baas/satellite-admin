const { DataTypes } = require("sequelize");
const crypto = require("crypto");

async function generateToken() {
  const apiKey = await new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      }
      const apiKey = buffer.toString("base64");
      resolve(apiKey);
    });
  });

  return apiKey;
}

function makeBackendModel(sequelize) {
  const Backend = sequelize.define("Backend", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  Backend.beforeValidate(async (backend) => {
    if (backend.isNewRecord) {
      backend.apiKey = await generateToken();
    }
  });

  return Backend;
}

module.exports = makeBackendModel;
