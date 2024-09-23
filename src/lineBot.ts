// // // lineBot.ts
// // import { Client, TextMessage } from "@line/bot-sdk";
// // import { lineConfig } from "./config";
// // import { scrapeTimes } from "./scraper";
// // import { findUserByLineUserId, saveUser } from "./userModel"; // ユーザーモデルをインポート

// // const client = new Client(lineConfig);

// // // ログインリンクを送信する関数
// // export const sendLoginLink = async (lineUserId: string) => {
// //   try {
// //     // 新規ユーザーにはログインリンクを送信
// //     const loginUrl = "https://tryworks.trygroup.co.jp/log-in";
// //     const message: TextMessage = {
// //       type: "text",
// //       text: `初めてのご利用ありがとうございます。以下のリンクからログインしてください: ${loginUrl}\nログインが完了したら「完了」とメッセージを送信してください。`,
// //     };
// //     await client.pushMessage(lineUserId, message);
// //   } catch (error) {
// //     console.error("エラーが発生しました: ", error);
// //   }
// // };

// // // ログイン完了の確認とスケジュール送信
// // export const handleLoginComplete = async (lineUserId: string) => {
// //   try {
// //     // ユーザー情報を確認
// //     const user = await findUserByLineUserId(lineUserId);
// //     console.log("User found in database:", user);

// //     if (!user) {
// //       // ユーザーがまだ登録されていない場合のエラーメッセージ
// //       const errorMessage: TextMessage = {
// //         type: "text",
// //         text: "ログイン情報が見つかりません。再度ログインを試してください。",
// //       };
// //       await client.pushMessage(lineUserId, errorMessage);
// //       return;
// //     }

// //     // スケジュールを取得してユーザーに送信
// //     const times = await scrapeTimes(user);
// //     const scheduleMessage: TextMessage = {
// //       type: "text",
// //       text: `スケジュールされた時間は: ${times.join(", ")}`,
// //     };
// //     await client.pushMessage(lineUserId, scheduleMessage);
// //   } catch (error) {
// //     console.error("エラーが発生しました: ", error);
// //   }
// // };
// // lineBot.ts
// import { Client, TextMessage } from "@line/bot-sdk";
// import { lineConfig } from "./config";
// import { saveUser } from "./userModel"; // ユーザーモデルをインポート

// const client = new Client(lineConfig);

// // ユーザーにログインIDとパスワードを入力させるように促す
// export const requestLoginInfo = async (lineUserId: string) => {
//   const message: TextMessage = {
//     type: "text",
//     text: "ログインIDとパスワードを以下のフォーマットで送信してください:\nID: your_id\nPW: your_password",
//   };
//   await client.pushMessage(lineUserId, message);
// };

// // ユーザーからのログイン情報を受け取って保存
// export const saveLoginInfo = async (lineUserId: string, messageText: string) => {
//   const [idLine, pwLine] = messageText.split("\n");
//   const id = idLine.split("ID: ")[1];
//   const password = pwLine.split("PW: ")[1];

//   if (id && password) {
//     await saveUser(lineUserId, id, password); // パスワードは内部でハッシュ化
//     const successMessage: TextMessage = {
//       type: "text",
//       text: "ログイン情報が保存されました。",
//     };
//     await client.pushMessage(lineUserId, successMessage);
//   } else {
//     const errorMessage: TextMessage = {
//       type: "text",
//       text: "IDとパスワードの形式が正しくありません。もう一度試してください。",
//     };
//     await client.pushMessage(lineUserId, errorMessage);
//   }
// };

import { Client, TextMessage } from "@line/bot-sdk";
import { lineConfig } from "./config";
import { scrapeTimes } from "./scraper"; // カレンダーから時間を抽出する関数
import { findUserByLineUserId, saveUser } from "./userModel"; // ユーザー情報を確認する関数

const client = new Client(lineConfig);


export const sendLoginLink = async (lineUserId: string) => {
  try {
    const message: TextMessage = {
      type: "text",
      text: "ログインIDとパスワードを以下のフォーマットで送信してください:\nID: your_id\nPW: your_password",
    };
    await client.pushMessage(lineUserId, message);
  } catch (error) {
    console.error("エラーが発生しました (sendLoginLink):", error);
  }
};

export const saveLoginInfo = async (
  lineUserId: string,
  messageText: string
) => {
  const [idLine, pwLine] = messageText.split("\n");
  const id = idLine.split("ID: ")[1];
  const password = pwLine.split("PW: ")[1];

  if (id && password) {
    await saveUser(lineUserId, id, password); // パスワードは内部でハッシュ化
    const successMessage: TextMessage = {
      type: "text",
      text: "ログイン情報が保存されました。",
    };
    await client.pushMessage(lineUserId, successMessage);
  } else {
    const errorMessage: TextMessage = {
      type: "text",
      text: "IDとパスワードの形式が正しくありません。もう一度試してください。",
    };
    await client.pushMessage(lineUserId, errorMessage);
  }
};

// カレンダー情報を送信する関数
export const sendCalendarInfo = async (lineUserId: string) => {
  try {
    // ユーザー情報を確認
    const user = await findUserByLineUserId(lineUserId);
    console.log("user情報", user)

    if (!user) {
      // ユーザーが存在しない場合、ログインリンクを送信
      await sendLoginLink(lineUserId);
    } else {
      // スケジュールをスクレイピングしてユーザーに送信
      const times = await scrapeTimes(user);
      if (times.length > 0) {
        const scheduleMessage: TextMessage = {
          type: "text",
          text: `スケジュールされた時間は: ${times.join(", ")}`,
        };
        await client.pushMessage(lineUserId, scheduleMessage);
      } else {
        const noScheduleMessage: TextMessage = {
          type: "text",
          text: "現在、スケジュールされた時間はありません。",
        };
        await client.pushMessage(lineUserId, noScheduleMessage);
      }
    }
  } catch (error) {
    console.error("エラーが発生しました (sendCalendarInfo):", error);
  }
};
