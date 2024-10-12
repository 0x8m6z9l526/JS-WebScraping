import * as cheerio from 'cheerio';
import got from 'got';
import fs from 'fs';
import punycode from 'punycode';
import sequelize from './db.js';
import BesplatniyeObyavleniaParsed from './models/BesplatniyeObyavleniaParsed.js';

const jsonFile = 'besplatniyeObyavleniaParsed.json';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  let counter = 1;

  await sequelize.sync({ alter: true });

  if (!fs.existsSync(jsonFile)) {
    fs.writeFileSync(jsonFile, JSON.stringify([]), 'utf8');
  }

  try {
    for (let i = 1; i <= 5; i++) {
      const domain = 'бесплатныеобъявления.рф';
      const path = `/?qact=search_adv&Type=2&View=&Folder=-1&Price_Start=&Price_End=&Currency=&Phrase=&Period=&SortBy=&SortedBy=&Dir=&Foto=&pg=`;
      const urlUnicode = `https://${domain}${path}${i}`;
      const url = `https://${punycode.toASCII(domain)}${path}${i}`;

      console.log(`Парсим страницу: ${urlUnicode}`);
      
      const response = await got(url);
      const $ = cheerio.load(response.body);

      let pairs = [];

      $('tr.vatop').each((index, element) => {
        const title = $(element).find('h4 a').text().trim();
        const price = $(element).find('div[style="font-size: 13px;"]').last().text().trim();

        if (title) {
          pairs.push({ index: counter, title, price });
          counter++;
        }
      });

      if (pairs.length === 0) {
        console.log('Не удалось найти объявления на странице.');
        continue;
      }

      let existingData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      existingData = existingData.concat(pairs);
      fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2), 'utf8');
      console.log(`Данные успешно добавлены в файл: ${jsonFile}`);

      for (const data of pairs) {
        try {
          await BesplatniyeObyavleniaParsed.create(data);
        } catch (err) {
          console.error('Ошибка при записи в базу данных:', err.message);
        }
      }

      await delay(5000);
    }

  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await sequelize.close();
  }
})();
