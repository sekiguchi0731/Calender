// scraper.ts
import puppeteer from "puppeteer";
import { findUserByLineUserId } from "./userModel";

export const scrapeTimes = async (user: any): Promise<string[]> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // ログインページにアクセス
  await page.goto("https://tryworks.trygroup.co.jp/login");

  // 保存されたユーザー情報でログイン
  await page.type("#teacher_code", user.username);
  await page.type("#password", user.password_hash); // ハッシュ化されたパスワードを使ってログイン

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ページ遷移後の処理
  await page.waitForNavigation();
  await page.goto("https://tryworks.trygroup.co.jp/calendar");

  const times = await page.evaluate(() => {
    const timeElements = document.querySelectorAll(
      "li.Schedules__item.-notYet span.Schedules__time"
    );
    return Array.from(timeElements).map((el) => el.textContent || "");
  });

  await browser.close();
  return times;
};
