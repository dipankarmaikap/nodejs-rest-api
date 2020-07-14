const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../Email/accountVerify");
const bcrypt = require("bcrypt");

exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("User already exists please login");
    }
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );
    sendEmail.sendAccountVerificationEmail(token, email, name);
    res.send("A verification email has been sent to your email.");
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.activateAccount = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { name, email, password } = decoded;
    const exeUser = await User.findOne({ email });
    if (exeUser) {
      return res.status(400).send("User already exists please login");
    }
    const user = new User({ name, email, password });
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send("Token Error");
  }
};
exports.logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const exeUser = await User.findOne({ email });
    if (!exeUser) {
      return res.status(400).send("User does not exist");
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15m",
    });
    sendEmail.sendResetPassswordEmail(token, email, exeUser.name);
    res.send("A verification email has been sent to your email.");
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.confirmResetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { email } = decoded;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User does not exists please register.");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(400).send("New password can not be your old password");
    }
    user.password = password;
    user.tokens = [];
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getUserRoute = async (req, res) => {
  res.send(req.user);
};
exports.patchUserRoute = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(404).send({ error: "Invalid updates!" });
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.deleteUserRoute = async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.postUserLogoutRoute = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.postUserLogoutAllRoute = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
};
