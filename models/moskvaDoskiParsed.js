import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const moskvaDoskiParsed = sequelize.define('moskvaDoskiParsed', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  freezeTableName: true,
});

export default moskvaDoskiParsed;
