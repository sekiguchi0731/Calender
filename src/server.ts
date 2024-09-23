// // import express from "express";
// // import { middleware, MiddlewareConfig } from "@line/bot-sdk";
// // import { lineConfig } from "./config"; // lineConfigをインポート
// // import { sendLoginLink, handleLoginComplete } from "./lineBot";

// // const app = express();

// // // LINEミドルウェア用にchannelSecretだけを抽出
// // const middlewareConfig: MiddlewareConfig = {
// //   channelSecret: lineConfig.channelSecret, // .envから読み込まれた正しいchannelSecret
// // };

// // app.use(middleware(middlewareConfig)); // リクエストの署名検証を行う

// // // Webhookのエンドポイント
// // app.post("/webhook", async (req, res) => {
// //   const events = req.body.events;

// //   for (const event of events) {
// //     if (event.type === "message" && event.message.type === "text") {
// //       const lineUserId = event.source.userId;
// //       const userMessage = event.message.text;
// //       console.log("Received message from:", lineUserId);
// //       if (userMessage === "完了") {
// //         // ユーザーが「完了」と送信した場合にログイン完了を処理
// //         await handleLoginComplete(lineUserId);
// //       } else {
// //         // ログインリンクを送信（例: 初回アクセス時にログインリンクを送信）
// //         await sendLoginLink(lineUserId);
// //       }
// //     }
// //   }

// //   res.sendStatus(200);
// // });

// // // サーバー起動
// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => {
// //   console.log(`Server is running on port ${PORT}`);
// // });

// // server.ts
// import express from 'express';
// import { middleware, MiddlewareConfig } from '@line/bot-sdk';
// import { lineConfig } from './config';
// import { requestLoginInfo, saveLoginInfo } from './lineBot'; // 必要な関数をインポート

// const app = express();
// app.use(express.json()); // JSONボディの解析ミドルウェア

// // LINEミドルウェア設定
// const middlewareConfig: MiddlewareConfig = {
//   channelSecret: lineConfig.channelSecret,
// };

// // app.use(middleware(middlewareConfig));
// app.use(middleware(middlewareConfig), (err, req, res, next) => {
//   if (err) {
//     console.error('Middleware signature validation failed:', err);
//   }
//   next();
// });

// // Webhookエンドポイント
// app.post('/webhook', async (req, res) => {
//   const events = req.body.events;

//   for (const event of events) {
//     if (event.type === 'message' && event.message.type === 'text') {
//       const lineUserId = event.source.userId;
//       const userMessage = event.message.text;

//       // IDとパスワードの形式で送られた場合、その情報を保存
//       if (userMessage.startsWith('ID:') && userMessage.includes('PW:')) {
//         await saveLoginInfo(lineUserId, userMessage);
//       } else {
//         // 初回アクセス時にログイン情報の入力を促す
//         await requestLoginInfo(lineUserId);
//       }
//     }
//   }

//   res.sendStatus(200);
// });

// // サーバー起動
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import { middleware, MiddlewareConfig } from "@line/bot-sdk";
import express from "express";
import { lineConfig } from "./config";
import { sendCalendarInfo, sendLoginLink } from "./lineBot"; // 必要な関数をインポート
import { saveLoginInfo } from "./lineBot";

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
        await sendCalendarInfo(lineUserId);
      } else if (userMessage === "ログイン") {
        await sendLoginLink(lineUserId);
      } else if (userMessage.startsWith('ID:') && userMessage.includes('PW:')) {
        await saveLoginInfo(lineUserId, userMessage);
      } else {
        // それ以外のメッセージの場合、ログインリンクを送信（必要に応じてカスタマイズ）
        await sendLoginLink(lineUserId);
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
