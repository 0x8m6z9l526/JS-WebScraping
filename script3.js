import { load } from 'cheerio';
import got from 'got';
import fs from 'fs';
import iconv from 'iconv-lite';
import sequelize from './db.js';
import moskvaDoskiParsed from './models/moskvaDoskiParsed.js';

const baseUrl = 'https://moskva.doski.ru/cat-otdyh-i-sport/obrazovanie-nauka/?page=';
const jsonFile = 'moskvaDoskiParsed.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    await sequelize.sync({ alter: true });

    if (!fs.existsSync(jsonFile)) {
      fs.writeFileSync(jsonFile, JSON.stringify([]), 'utf8');
    }

    let globalIndex = 1;

    for (let i = 1; i <= 5; i++) {
      const url = `${baseUrl}${i}`;

      try {
        console.log(`Парсим страницу: ${url}`);

        const response = await got(url, { https: { rejectUnauthorized: false }, responseType: 'buffer' });
        const decodedHtml = iconv.decode(response.body, 'windows-1251');
        const $ = load(decodedHtml);

        let pairs = [];

        $('td.mtx').each((index, element) => {
          const title = $(element).find('a').text().trim();
          const price = $(element).nextAll('td[align="right"]').first().text().trim();

          if (title && price) {
            console.log(`Заголовок ${globalIndex}: ${title}, Цена: ${price}`);
            pairs.push({ title, price });
            globalIndex++;
          }
        });

        let existingData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        existingData = existingData.concat(pairs);
        fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2), 'utf8');
        console.log(`Данные успешно добавлены в файл: ${jsonFile}`);

        for (const data of pairs) {
          try {
            await moskvaDoskiParsed.create(data);
          } catch (err) {
            console.error('Ошибка при записи в базу данных:', err.message);
          }
        }

      } catch (error) {
        console.error(`Ошибка при парсинге страницы ${url}:`, error.message);
      }
      await delay(5000);
    }

  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await sequelize.close();
  }
})();
