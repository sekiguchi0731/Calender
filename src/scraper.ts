// scraper.ts
import puppeteer from "puppeteer";
import { findUserByLineUserId } from "./userModel";

export const scrapeTimes = async (lineUserId): Promise<string[]> => {
  const user = await findUserByLineUserId(lineUserId);
  console.log("user情報", lineUserId);
  console.log("user情報2", lineUserId.username);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // ログインページにアクセス
  await page.goto("https://tryworks.trygroup.co.jp/log-in");

  // 保存されたユーザー情報でログイン
  await page.type("#teacher_code", lineUserId.username);
  await page.type("#password", lineUserId.password_hash); // ハッシュ化されたパスワードを使ってログイン

  // ログインボタンをクリック
  await page.click('button[type="submit"]');
  await page.screenshot({ path: "login-result-1.png" });

  // ページ遷移後の処理
  await page.waitForNavigation();
  await page.goto("https://tryworks.trygroup.co.jp/calendar");
  await page.screenshot({ path: "login-result-2.png" });

  const times = await page.evaluate(() => {
    const timeElements = document.querySelectorAll(
      "li.Schedules__item.-notYet span.Schedules__time"
    );
    return Array.from(timeElements).map((el) => el.textContent || "");
  });

  await browser.close();
  return times;
};
