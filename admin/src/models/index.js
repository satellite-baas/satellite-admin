const { Sequelize } = require("sequelize");
const makeBackendModel = require("./Backend");
const makeUserModel = require("./User");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

const User = makeUserModel(sequelize);
const Backend = makeBackendModel(sequelize);

User.hasMany(Backend);
Backend.belongsTo(User);

module.exports = sequelize;
