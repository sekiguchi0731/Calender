import { Client, middleware, MiddlewareConfig } from "@line/bot-sdk";
import express from "express";
import { sendLineMessage } from "./lineBot"; // sendLineMessage 関数は先ほどのコード
import { lineConfig } from "./config";

const app = express();

// LINEからのリクエストの署名検証を行うミドルウェア
app.use(middleware(lineConfig));

// Webhookのエンドポイント
app.post("/webhook", (req, res) => {
  const events = req.body.events;

  // 各イベントごとに処理
  events.forEach((event) => {
    if (event.type === "message" && event.message.type === "text") {
      const lineUserId = event.source.userId;
      sendLineMessage(lineUserId);
    }
  });

  res.sendStatus(200); // LINE側にリクエスト成功を通知
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
