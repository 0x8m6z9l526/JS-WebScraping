import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const ParsedData = sequelize.define('ParsedData', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default ParsedData;
