import { middleware, MiddlewareConfig } from "@line/bot-sdk";
import express from "express";
import { lineConfig } from "./config";
import { askName, saveName, sendCalender, sendRegularlyCalender } from "./lineBot"; // 必要な関数をインポート
import cron from "node-cron";
import { findAllLineUserIds } from "./userModel";

const app = express();

// LINEミドルウェア設定
const middlewareConfig: MiddlewareConfig = {
  channelSecret: lineConfig.channelSecret,
};

app.use("/webhook", middleware(middlewareConfig)); // LINEのミドルウェアを適用

// Webhookエンドポイント
app.post("/webhook", async (req, res) => {
  const events = req.body.events;
  console.log("Received Webhook request:", events);

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const lineUserId = event.source.userId;
      const userMessage = event.message.text.trim();

      console.log("Message from user:", lineUserId, userMessage);

      if (userMessage === "カレンダー") {
        // 「カレンダー」と送信された場合、カレンダー情報を送信
        await sendCalender(lineUserId);
      } else if (userMessage === "ログイン") {
        await askName(lineUserId);
      } else if (userMessage.startsWith("名前は")) {
        await saveName(lineUserId, userMessage);
        console.log(userMessage);
      } else {
        await askName(lineUserId);
      }
    }
  }

  res.sendStatus(200);
});

// 毎日18:00に「こんにちは」を送信
cron.schedule("10 19 * * 0", async () => {
  try {
    // DBからすべてのline_user_idを取得
    const lineUserIds = await findAllLineUserIds();

    // 各ユーザーにメッセージを送信
    for (const lineUserId of lineUserIds) {
      await sendRegularlyCalender(lineUserId);
    }
    console.log("Messages sent successfully.");
  } catch (error) {
    console.error("Error sending messages:", error);
  }
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
