import puppeteer from "puppeteer";

export const scrapeTimes = async (): Promise<string[]> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // ログインページにアクセス
  await page.goto("https://tryworks.trygroup.co.jp/log-in");

  // ログイン情報を入力
  await page.type("#teacher_code", "10210422002"); // 適切なIDに変更
  await page.type("#password", "EahWMiro"); // 適切なIDに変更

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ログイン後のページ遷移を待機
  await page.waitForNavigation();
  await page.screenshot({ path: "login-result1.png" });

  // スケジュールページにアクセス
  await page.goto("https://tryworks.trygroup.co.jp/calendar");
  await page.waitForSelector("li.Schedules__item.-notYet");
  await page.screenshot({ path: "login-result2.png" });

  // 時間情報を抽出（'li.Schedules__item.-notYet' の中の 'span.Schedules__time'）
  const times = await page.evaluate(() => {
    const items = document.querySelectorAll("li.Schedules__item.-notYet");
    return Array.from(items).map((item) => {
      const timeElement = item.querySelector("span.Schedules__time");
      return timeElement?.textContent?.match(/(\d{1,2}:\d{2})/g)?.[0] || "";
    });
  });

  await browser.close();
  return times.filter((time) => time); // 空要素を除外
};
