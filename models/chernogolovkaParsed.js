import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const chernogolovkaParsed = sequelize.define('chernogolovkaParsed', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  freezeTableName: true, 
});

export default chernogolovkaParsed;
