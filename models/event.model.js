import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Event = sequelize.define(
  "Event",
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "user_id",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      defaultValue:
        "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post-1536x674.webp",
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "uncategorized",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    maxRegistration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "events",
    timestamps: true,
    underscored: true,
  }
);

export default Event;
