import { Client, middleware, MiddlewareConfig } from "@line/bot-sdk";
import express from "express";
import { lineConfig } from "./config"; 
import { sendLineMessage } from "./lineBot";

// LINEミドルウェア用にchannelSecretだけを抽出
const middlewareConfig: MiddlewareConfig = {
  channelSecret: lineConfig.channelSecret, // middlewareに必要なchannelSecretのみを渡す
};


const app = express();

// LINEからのリクエストの署名検証を行うミドルウェア
app.use(middleware(middlewareConfig)); // middlewareConfigを利用

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
