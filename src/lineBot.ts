import { Client, TextMessage } from "@line/bot-sdk";
import { lineConfig } from "./config";
import { scrapeTimes } from "./scraper";
import { findUserByLineUserId } from "./userModel"; // ユーザー情報を確認する関数

const client = new Client(lineConfig);

export const askTeacherOrStudent = async (lineUserId: string) => {
  try {
    const user = findUserByLineUserId(lineUserId);
    if (user == null) {
      const askMessage: TextMessage = {
        type: "text",
        text: "講師ですか？生徒ですか？\n「講師」または「生徒」と答えてください:",
      };
      await client.pushMessage(lineUserId, askMessage);
    } else {
      const proper = (await user).user_property;
      const properMessage: TextMessage = {
        type: "text",
        text: `あなたは現在 ${proper} として登録されています。\n変更したい場合は、「講師」または「生徒」と入力してください。\n予定を確認したい場合は、「カレンダー」または「ログイン」と入力してください。`,
      };
      await client.pushMessage(lineUserId, properMessage);
    }
  } catch (error) {}
};

export const sendLoginLink = async (lineUserId: string) => {
  try {
    const message1: TextMessage = {
      type: "text",
      text: "ログインIDとパスワードを以下のフォーマットで送信してください:",
    };
    await client.pushMessage(lineUserId, message1);
    const message2: TextMessage = {
      type: "text",
      text: "ID: your_id\nPW: your_password",
    };
    await client.pushMessage(lineUserId, message2);
  } catch (error) {
    console.error("エラーが発生しました (sendLoginLink):", error);
  }
};

export const checkAndSendCalenderInfo = async (
  lineUserId: string,
  messageText: string
) => {
  const [idLine, pwLine] = messageText.split("\n");
  const id = idLine.split("ID: ")[1];
  const password = pwLine.split("PW: ")[1];

  if (id && password) {
    const successMessage: TextMessage = {
      type: "text",
      text: "ログイン情報が確認されました。",
    };
    await client.pushMessage(lineUserId, successMessage);
    // スケジュールをスクレイピングしてユーザーに送信
    const times = await scrapeTimes(lineUserId, id, password);
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
  } else {
    const errorMessage: TextMessage = {
      type: "text",
      text: "IDとパスワードの形式が正しくありません。もう一度試してください。",
    };
    await client.pushMessage(lineUserId, errorMessage);
    await sendLoginLink(lineUserId);
  }
};

export const sendSavingMessage = async (
  lineUserID: string,
  userProper: string,
  isSaved: boolean
) => {
  if (isSaved) {
    const savedMessage: TextMessage = {
      type: "text",
      text: `ユーザ情報を ${userProper} として登録しました。`,
    };
    client.pushMessage(lineUserID, savedMessage);
  } else {
    const savedMessage: TextMessage = {
      type: "text",
      text: `ユーザ情報を ${userProper} として登録できませんでした。`,
    };
    client.pushMessage(lineUserID, savedMessage);
  }
};

export const sendErrorMessage = async (lineUserId: string) => {
  const errorMessage: TextMessage = {
    type: "text",
    text: "タイムアウトしました。\n入力が間違えていないか確認してください。",
  };
  client.pushMessage(lineUserId, errorMessage);
};
