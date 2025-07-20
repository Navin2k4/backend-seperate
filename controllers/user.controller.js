import { User } from "../models/database.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";

export const updateUser = async (req, res, next) => {
  if (parseInt(req.user.id) !== parseInt(req.params.userId)) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  }
  try {
    const [updatedCount, updatedRows] = await User.update(
      {
        username: req.body.username,
        email: req.body.email,
        profilePicture: req.body.profilePicture,
        password: req.body.password,
      },
      {
        where: { id: req.params.userId },
        returning: true,
      }
    );
    if (updatedCount === 0) {
      return next(errorHandler(404, "User not found"));
    }
    const updatedUser = updatedRows[0].toJSON();
    delete updatedUser.password;
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    parseInt(req.user.id) !== parseInt(req.params.userId)
  ) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    const deleted = await User.destroy({ where: { id: req.params.userId } });
    if (deleted === 0) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? "ASC" : "DESC";

    const users = await User.findAll({
      order: [["createdAt", sortDirection]],
      offset: startIndex,
      limit: limit,
    });

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user.toJSON();
      return rest;
    });

    const totalUsers = await User.count();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await User.count({
      where: { createdAt: { [User.sequelize.Op.gte]: oneMonthAgo } },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user.toJSON();
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
