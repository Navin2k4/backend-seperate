import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  console.log(req.body);
  if (
    !username ||
    !email ||
    !password ||
    email === "" ||
    password === "" ||
    username === ""
  ) {
    next(errorHandler(400, "All Fields Are Required"));
  }
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  res.json("User saved successfully");
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password || email === "" || password === "") {
      return next(errorHandler(400, "All fields are required"));
    }
  
    try {
      const validUser = await User.findOne({ where: { email } });
  
      if (!validUser) {
        return next(errorHandler(404, "User not found"));
      }
  
      const isPasswordCorrect = bcryptjs.compareSync(password, validUser.password);
      if (!isPasswordCorrect) {
        return next(errorHandler(400, "Invalid password"));
      }
  
      const token = jwt.sign(
        {
          id: validUser.id,
          isAdmin: validUser.isAdmin,
        },
        "your_super_secret_key_here",
        { expiresIn: '7d' }
      );
  
      const { password: pass, ...rest } = validUser.toJSON();
  
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .json(rest);
    } catch (error) {
      next(error);  
    }
  };