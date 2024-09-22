import { Client, TextMessage } from "@line/bot-sdk";
import { lineConfig } from "./config";
import { scrapeTimes } from "./scraper";

const client = new Client(lineConfig);

export const sendLineMessage = async (lineUserId: string) => {
  try {
    // ユーザごとにログイン
    const times = await scrapeTimes(lineUserId);
    console.log(times);
    console.log(lineUserId);

    const message: TextMessage = {
      type: "text",
      text: `スケジュールされた時間は: ${times.join(", ")}`,
    };

    await client.pushMessage(lineUserId, message);
  } catch (error) {
    console.error("エラーが発生しました: ", error);
    const errorMessage: TextMessage = {
      type: "text",
      text: "ログインに失敗しました。ユーザー情報を確認してください。",
    };
    await client.pushMessage(lineUserId, errorMessage);
  }
};
