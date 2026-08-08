const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

const DEFAULT_USERNAME = "bdgwin";
const DEFAULT_PASSWORD = "bdgwin";


// Create default user if it does not exist
async function ensureDefaultUser() {
  let user = await User.findOne({
    username: DEFAULT_USERNAME
  });

  if (user) {
    return user;
  }

  const passwordHash =
    await bcrypt.hash(
      DEFAULT_PASSWORD,
      12
    );

  user = await User.create({
    username: DEFAULT_USERNAME,
    passwordHash
  });

  return user;
}


// LOGIN
router.post(
  "/login",
  async (req, res) => {
    try {

      const username =
        String(
          req.body.username || ""
        )
          .trim()
          .toLowerCase();

      const password =
        String(
          req.body.password || ""
        );

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Username and password are required."
        });
      }


      // Make sure initial account exists
      await ensureDefaultUser();


      const user =
        await User.findOne({
          username
        });


      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password."
        });
      }


      const valid =
        await bcrypt.compare(
          password,
          user.passwordHash
        );


      if (!valid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password."
        });
      }


      const token =
        jwt.sign(
          {
            id:
              user._id.toString(),

            username:
              user.username
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "7d"
          }
        );


      return res.json({
        success: true,

        token,

        user: {
          id: user._id,
          username: user.username
        }
      });

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Login failed."
      });
    }
  }
);


module.exports = router;