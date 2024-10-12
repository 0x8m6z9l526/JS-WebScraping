import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const mskBarahlaParsed = sequelize.define('mskBarahlaNetParsed', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  freezeTableName: true,
});

export default mskBarahlaParsed;
