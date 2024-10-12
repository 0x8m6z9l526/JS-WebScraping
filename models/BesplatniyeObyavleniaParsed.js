// models/BesplatniyeObyavleniaParsed.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const BesplatniyeObyavleniaParsed = sequelize.define('BesplatniyeObyavleniaParsed', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
  },
}, {
  freezeTableName: true,
});

export default BesplatniyeObyavleniaParsed;
