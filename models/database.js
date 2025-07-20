import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

/**
 * User Model
 */
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  profilePicture: { type: DataTypes.STRING, defaultValue: "...url" },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "users",
  underscored: true,
  timestamps: true,
});

/**
 * Role Model
 */
const Role = sequelize.define("Role", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
  tableName: "roles",
  timestamps: false,
});

/**
 * UserRole Join Table
 */
const UserRole = sequelize.define("UserRole", {
  userId: { type: DataTypes.INTEGER, field: "user_id" },
  roleId: { type: DataTypes.INTEGER, field: "role_id" },
}, {
  tableName: "user_roles",
  timestamps: false,
  underscored: true,
});

/**
 * Event Model
 */
const Event = sequelize.define("Event", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: "user_id",
  },
  title: { type: DataTypes.STRING, allowNull: false, unique: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  image: { type: DataTypes.STRING, defaultValue: "..." },
  category: { type: DataTypes.STRING, defaultValue: "uncategorized" },
  location: { type: DataTypes.STRING, allowNull: false },
  datetime: { type: DataTypes.DATE, allowNull: false },
  maxRegistration: { type: DataTypes.INTEGER, defaultValue: 100 },
  slug: { type: DataTypes.STRING, unique: true },
}, {
  tableName: "events",
  timestamps: true,
  underscored: true,
});

/**
 * EventCoordinator Join Table
 */
const EventCoordinator = sequelize.define("EventCoordinator", {
  eventId: { type: DataTypes.INTEGER, field: "event_id" },
  userId: { type: DataTypes.INTEGER, field: "user_id" },
}, {
  tableName: "event_coordinators",
  timestamps: false,
  underscored: true,
});

/**
 * Registration Join Table
 */
const Registration = sequelize.define("Registration", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: "user_id",
  },
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: "event_id",
  },
  registeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: "registered_at",
  },
}, {
  tableName: "registrations",
  timestamps: false,
  underscored: true,
  indexes: [{ unique: true, fields: ["user_id", "event_id"] }],
});

/**
 * Model Associations
 */
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "user_id",
  otherKey: "role_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "role_id",
  otherKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(Event, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Event.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.belongsToMany(Event, {
  through: Registration,
  foreignKey: "user_id",
  otherKey: "event_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "registeredEvents",
});
Event.belongsToMany(User, {
  through: Registration,
  foreignKey: "event_id",
  otherKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "registrants",
});

Event.belongsToMany(User, {
  through: EventCoordinator,
  as: "coordinators",
  foreignKey: "event_id",
  otherKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.belongsToMany(Event, {
  through: EventCoordinator,
  as: "coordinatedEvents",
  foreignKey: "user_id",
  otherKey: "event_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export {
  sequelize,
  User,
  Role,
  UserRole,
  Event,
  EventCoordinator,
  Registration,
};

export default sequelize;
