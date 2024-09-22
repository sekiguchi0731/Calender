// lineBot.ts
import { Client, TextMessage } from "@line/bot-sdk";
import { lineConfig } from "./config";
import { scrapeTimes } from "./scraper";
import { findUserByLineUserId, saveUser } from "./userModel"; // ユーザーモデルをインポート

const client = new Client(lineConfig);

// メッセージ送信関数
export const sendLineMessage = async (lineUserId: string) => {
  try {
    // ユーザー情報を確認
    const user = await findUserByLineUserId(lineUserId);

    if (!user) {
      // 新規ユーザーへの処理
      const loginUrl = "https://tryworks.trygroup.co.jp/log-in";
      const message: TextMessage = {
        type: "text",
        text: `初めてのご利用ありがとうございます。以下のリンクからログインしてください: ${loginUrl}`,
      };
      await client.pushMessage(lineUserId, message);
    } else {
      // 既存ユーザーの場合
      const times = await scrapeTimes(user);
      const message: TextMessage = {
        type: "text",
        text: `スケジュールされた時間は: ${times.join(", ")}`,
      };
      await client.pushMessage(lineUserId, message);
    }
  } catch (error) {
    console.error("エラーが発生しました: ", error);
  }
};
