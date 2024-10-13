// scraper.ts
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import { askName, sendErrorMessage } from "./lineBot";
import { findUserByLineUserId } from "./userModel";

// .envファイル内の呼び出し
dotenv.config();

export const scrapeTimes = async (lineUserId: string): Promise<string[]> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const user = await findUserByLineUserId(lineUserId);
  if (user == null) {
    await askName(lineUserId);
  }
  const name = user.user_property;

  // ログインページにアクセス
  await page.goto("https://tryworks.trygroup.co.jp/log-in");

  // 保存されたユーザー情報でログイン
  await page.type("#teacher_code", process.env.USER_ID);
  await page.type("#password", process.env.USER_PASSWORD);

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  await page.screenshot({ path: "login-result-1.png" });

  // ID, パスワードが間違えていないか確認
  try {
    await page.waitForNavigation();
  } catch (error) {
    await sendErrorMessage(lineUserId);
    return [];
  }
  // 後でよしなに変える
  await page.goto("https://tryworks.trygroup.co.jp/calendar");
  await page.waitForSelector("li.Schedules__item.-notYet");
  await page.screenshot({ path: "login-result-2.png" });
  // 指定されたクラスのテキストを取得
  console.log("ここだよ！");

  const times = await page.evaluate((name) => {
    // 全てのli.Schedules__date要素を取得
    const dateItems = document.querySelectorAll("li.Schedules__date");

    // 一致するstudent_nameが見つかった場合、その日のdata-dateと.Schedules__timeを返す
    return Array.from(dateItems).flatMap((dateItem) => {
      // 日付をdata-date属性から取得
      const dateElement = dateItem.querySelector("h3[data-date]");
      const date = dateElement
        ? dateElement.getAttribute("data-date")
        : "日付なし";

      // li.Schedules__item.-notYet要素を全て取得
      const scheduleItems = dateItem.querySelectorAll(
        "li.Schedules__item.-notYet"
      );

      // 名前が一致する場合、その.Schedules__timeを取得して返す
      return Array.from(scheduleItems)
        .filter((item) => {
          const studentElement = item.querySelector("span.Schedules__student");
          if (studentElement) {
            // 全角スペースを削除して比較
            const studentName = studentElement.textContent
              .replace(/\s+/g, "")
              .trim();
            return studentName === name;
          }
          return false;
        })
        .map((item) => {
          const timeElement = item.querySelector("span.Schedules__time");
          const time = timeElement
            ? timeElement.textContent.trim()
            : "時間なし";
          // 日付と時間を結合して返す
          return `${date} ${time}`;
        });
    });
  }, name);

  await browser.close();
  return times;
};
