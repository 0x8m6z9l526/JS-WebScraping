import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres', 'postgres', 'Nikita2004', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
});

export default sequelize;
