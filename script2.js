import { load } from 'cheerio';
import got from 'got';
import fs from 'fs';
import iconv from 'iconv-lite';
import sequelize from './db.js';
import chernogolovkaParsed from './models/chernogolovkaParsed.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const url = 'http://chernogolovka.ru/board/';
const jsonFile = 'chernogolovkaParsed.json';

(async () => {
  try {
    await sequelize.sync({ alter: true });

    if (!fs.existsSync(jsonFile)) {
      fs.writeFileSync(jsonFile, JSON.stringify([]), 'utf8');
    }

    const response = await got(url, { responseType: 'buffer' });

    const decodedBody = iconv.decode(response.body, 'koi8-r');

    const $ = load(decodedBody);

    let pairs = [];

    $('dt').each((index, element) => {
      if ($(element).next().hasClass('date')) return;

      const title = $(element).find('a').text().trim();
      const content = $(element).next('dd').text().trim();

      if (title && content) {
        pairs.push({ title, content });
      }
    });

    if (pairs.length === 0) {
      console.log('Не удалось найти элементы dt с тегами <a> и соответствующие им <dd>.');
      return;
    }

    let existingData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    existingData = existingData.concat(pairs);

    fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2), 'utf8');
    console.log(`Данные успешно добавлены в файл: ${jsonFile}`);

    for (const data of pairs) {
      try {
        await chernogolovkaParsed.create(data);
      } catch (err) {
        console.error('Ошибка при записи в базу данных:', err.message);
      }
    }

    await delay(5000);
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await sequelize.close();
  }
})();
