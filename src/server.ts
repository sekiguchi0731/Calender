import { Client, middleware, MiddlewareConfig } from "@line/bot-sdk";
import express from "express";
import { lineConfig } from "./config";
import { askTeacherOrStudent, checkAndSendCalenderInfo, sendLoginLink } from "./lineBot"; // 必要な関数をインポート
import { saveUser } from "./userModel";

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
        await sendLoginLink(lineUserId);
      } else if (userMessage === "ログイン") {
        await sendLoginLink(lineUserId);
      } else if (userMessage.startsWith("ID:") && userMessage.includes("PW:")) {
        await checkAndSendCalenderInfo(lineUserId, userMessage);
        console.log(userMessage);
      } else if (userMessage === "講師" || userMessage === "生徒") {
        await saveUser(lineUserId, userMessage)
      } else {
        await askTeacherOrStudent(lineUserId)
      }
    }
  }

  res.sendStatus(200);
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
