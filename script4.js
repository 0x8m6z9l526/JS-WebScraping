import { load } from 'cheerio';
import got from 'got';
import fs from 'fs';
import sequelize from './db.js';
import mskBarahlaParsed from './models/mskBarahlaNetParsed.js';

const baseUrl = 'https://msk.barahla.net/services/204/?page=';
const jsonFile = 'mskBarahlaNetParsed.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    await sequelize.sync({ alter: true });

    if (!fs.existsSync(jsonFile)) {
      fs.writeFileSync(jsonFile, JSON.stringify([]), 'utf8');
    }

    for (let i = 1; i <= 5; i++) {
      const url = `${baseUrl}${i}`;
      console.log(`Парсим страницу: ${url}`);

      const response = await got(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36'
        },
        https: { rejectUnauthorized: false },
        responseType: 'text',
        encoding: 'utf-8'
      });

      const $ = load(response.body);

      let pairs = [];

      $('div.ads-info').each((index, element) => {
        const title = $(element).find('p.title.bigger-on-mobile a').text().trim();
        const time = $(element).find('div.right-side p.placing.lgray').text().trim();

        if (title && time) {
          console.log(`Заголовок ${index + 1}: ${title}, Время публикации: ${time}`);
          pairs.push({ title, time });
        }
      });

      let existingData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      existingData = existingData.concat(pairs);
      fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2), 'utf8');
      console.log(`Данные успешно добавлены в файл: ${jsonFile}`);

      for (const data of pairs) {
        try {
          await mskBarahlaParsed.create(data);
        } catch (err) {
          console.error('Ошибка при записи в базу данных:', err.message);
        }
      }

      await delay(5000);
    }

  } catch (error) {
    console.error('Ошибка при парсинге страницы:', error.message);
  } finally {
    await sequelize.close();
  }
})();
