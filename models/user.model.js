import { DataTypes } from 'sequelize';  
import sequelize from '../database.js'; 

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING,
    field: 'profile_picture',
    defaultValue:
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    field: 'is_admin',
    defaultValue: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true, // converts camelCase to snake_case
});

export default User;
