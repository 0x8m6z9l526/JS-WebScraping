import { load } from 'cheerio';
import got from 'got';
import fs from 'fs';
import sequelize from './db.js';
import ParsedData from './models/autoMskParsed.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  try {
    await sequelize.sync({ alter: true });

    const jsonFile = 'autoMSKparsed.json';
    if (!fs.existsSync(jsonFile)) {
      fs.writeFileSync(jsonFile, JSON.stringify([]), 'utf8');
    }

    for (let i = 1; i <= 10; i++) {
      await delay(5000);

      const url = `https://auto.msk.proms.ru/category/83/page${i}`;
      console.log(`Парсим страницу: ${url}`);

      const response = await got(url);
      const html = response.body;

      const $ = load(html);

      const parsedData = [];

      $('.ann-list-item-wrapper').each((index, element) => {
        const title = $(element).find('.title').text().trim();
        const price = $(element).find('.cost').text().trim();

        parsedData.push({
          title,
          price,
        });
      });

      let existingData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      existingData = existingData.concat(parsedData);

      fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2), 'utf8');

      for (const data of parsedData) {
        try {
          await ParsedData.create(data);
        } catch (err) {
          console.error('Ошибка при записи в базу данных:', err.message);
        }
      }
    }
  } catch (err) {
    console.error('Ошибка выполнения скрипта:', err.message);
  } finally {х
    await sequelize.close();
  }
})();