const bcrypt = require("bcrypt");
const validate = require("validate.js");
const SALT_ROUNDS = 11;
const REQUIRED_PASSWORD_LENGTH = 5;

function makeUserController(User) {
  function notEmail(email) {
    constraints = {
      from: {
        email: true,
      },
    };

    return validate({ from: email }, constraints);
  }

  async function isUniqueEmail(email) {
    const user = await User.findOne({ where: { email } });
    return !user;
  }

  function passwordLongEnough(password) {
    return password && password.length >= REQUIRED_PASSWORD_LENGTH;
  }

  async function createUser(req, res, next) {
    const { email, password } = req.body;

    if (!email || notEmail(email)) {
      res.status(422).send({ error: "Invalid email!" });
      return;
    }

    const uniqueEmail = await isUniqueEmail(email);

    if (!uniqueEmail) {
      return res.status(422).send({ error: "This email is already in use!" });
    }

    if (!passwordLongEnough(password)) {
      return res.status(422).send({
        error: `Password must be at least ${REQUIRED_PASSWORD_LENGTH} long!`,
      });
    }

    const hashed_password = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = User.build({ email: email, password: hashed_password });

    try {
      await newUser.save();
    } catch (error) {
      return res.status(500).send();
    }

    req.logIn(newUser, (error) => {
      if (error) {
        return next(error);
      }

      return res
        .status(201)
        .send({ message: "You have signed up and logged in!" });
    });
  }

  return createUser;
}

module.exports = makeUserController;
