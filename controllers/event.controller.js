import { Op } from "sequelize";
import { errorHandler } from "../utils/error.js";
import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";

export const registerEvent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.body;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return next(errorHandler(404, "Event not found"));
    }

    // Check for duplicate registration
    const existing = await Registration.findOne({
      where: { userId, eventId },
    });
    if (existing) {
      return next(errorHandler(400, "Already registered for this event"));
    }

    // Check if max registration reached
    const count = await Registration.count({ where: { eventId } });
    if (count >= event.maxRegistration) {
      return next(errorHandler(400, "Event registration is full"));
    }

    // Register
    const registration = await Registration.create({ userId, eventId });
    res.status(201).json({ message: "Registered successfully", registration });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  if (!req.user?.isAdmin) {
    return next(errorHandler(403, "You are not allowed to create an event"));
  }

  const {
    title,
    content,
    image,
    category,
    location,
    datetime,
    maxRegistration,
  } = req.body;

  if (!title || !content || !location || !datetime) {
    return next(errorHandler(400, "Please provide all required fields"));
  }

  const slug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  try {
    const newEvent = await Event.create({
      title,
      content,
      category,
      location,
      datetime,
      maxRegistration,
      slug,
      userId: req.user.id,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? "ASC" : "DESC";

    const filters = {};
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.slug) filters.slug = req.query.slug;
    if (req.query.searchTerm) {
      filters[Op.or] = [
        { title: { [Op.like]: `%${req.query.searchTerm}%` } },
        { content: { [Op.like]: `%${req.query.searchTerm}%` } },
      ];
    }

    const events = await Event.findAll({
      where: filters,
      order: [["updatedAt", sortDirection]],
      offset: startIndex,
      limit: limit,
    });

    const totalPost = await Event.count();

    const now = new Date();
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

    const lastMonthPosts = await Event.count({
      where: {
        createdAt: { [Op.gte]: oneMonthAgo },
      },
    });

    res.status(200).json({
      posts: events,
      totalPost,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  if (!req.user?.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this event"));
  }

  try {
    const deleted = await Event.destroy({
      where: {
        id: req.params.postId,
      },
    });

    if (deleted === 0) {
      return next(errorHandler(404, "Event not found"));
    }

    res.status(200).json("Event has been deleted");
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  if (!req.user?.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this event"));
  }

  try {
    const [updatedCount, updatedRows] = await Event.update(
      {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        image: req.body.image,
        location: req.body.location,
        datetime: req.body.datetime,
        maxRegistration: req.body.maxRegistration,
      },
      {
        where: { id: req.params.postId },
        returning: true,
      }
    );

    if (updatedCount === 0) {
      return next(errorHandler(404, "Event not found"));
    }

    res.status(200).json(updatedRows[0]);
  } catch (error) {
    next(error);
  }
};
