const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      //     return res.status(400).send("All fields are required");
      return res.send(error(400, "All fields are required"));
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      //   return res.status(409).send("User is already registered");
      return res.send(error(409, "User is already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // return res.status(201).json({
    //   user,
    // });

    return res.send(success(201, "user is created successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      //   return res.status(400).send("All fields are required");
      return res.send(error(400, "All fields are required"));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      //   res.status(404).send("User Not Registered");
      return res.send(error(404, "User Not Registered"));
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      //   return res.status(403).send("Incorrect Password");
      return res.send(error(403, "Incorrect Password"));
    }

    const accessToken = generateAcessToken({
      _id: user._id,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.send(
      success(200, {
        accessToken,
      })
    );
  } catch (err) {}
};

const refreshAcessTokenController = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies.jwt) {
    // return res.status(401) .send("Refresh Token in cookie is required");
    return res.send(error(401, "Refresh Token in cookie is required"));
  }

  const refreshToken = cookies.jwt;
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const _id = decoded._id;
    const accessToken = generateAcessToken({ _id });

    return res.send(success(201, { accessToken }));
  } catch (err) {
    console.log(err);
    return res.send(error(401, "invalid refresh key"));
    // return res.status(401).send("invalid refresh key");
  }
};

const logoutController = async (req, res) => {
  // access token fronted will delete
  // but we delete refresh token in cookie

  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(200, " user loged out"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

// internal functions
const generateAcessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "1d",
    });

    return token;
  } catch (err) {
    console.log(err);
  }
};

const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "1y",
    });

    return token;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAcessTokenController,
  logoutController,
};
