// scraper.ts
import puppeteer from "puppeteer";
import { askTeacherOrStudent, sendErrorMessage } from "./lineBot";
import { findUserByLineUserId } from "./userModel";

export const scrapeTimes = async (
  lineUserId: string,
  id: string,
  password: string
): Promise<string[]> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const user = await findUserByLineUserId(lineUserId);
  if (user == null) {
    await askTeacherOrStudent(lineUserId);
  }
  const proper = user.user_property;

  // ログインページにアクセス
  if (proper === "講師") {
    await page.goto("https://tryworks.trygroup.co.jp/log-in");
  } else if (proper === "生徒") {
    // 後でよしなにかえる
    await page.goto("https://student.dailytry.trygroup.co.jp/auth/login");
  } else {
    await askTeacherOrStudent(lineUserId);
  }

  // 保存されたユーザー情報でログイン
  if (proper === "講師") {
    await page.type("#teacher_code", id);
    await page.type("#password", password);
  } else if (proper === "生徒") {
    await page.type('input[name="id"]', id);
    await page.type('input[name="password"]', password);
  }

  // ログインボタンをクリック
  if (proper === "講師") {
    await page.click('button[type="submit"]');
  } else if (proper === "生徒") {
    await page.click("button._button_w0tr8_1");
  }
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

  const times = await page.evaluate(() => {
    const timeElements = document.querySelectorAll(
      "li.Schedules__item.-notYet span.Schedules__time"
    );
    return Array.from(timeElements).map((el) => el.textContent || "");
  });

  await browser.close();
  return times;
};
