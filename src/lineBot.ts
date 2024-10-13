import { Client, TextMessage } from "@line/bot-sdk";
import { lineConfig } from "./config";
import { scrapeTimes } from "./scraper";
import { findUserByLineUserId, saveUserDB } from "./userModel"; // ユーザー情報を確認する関数

const client = new Client(lineConfig);

export const askName = async (lineUserId: string) => {
  try {
    const user = await findUserByLineUserId(lineUserId);
    if (user == null) {
      const askMessage: TextMessage = {
        type: "text",
        text: "あなたの名前を「名前は」の後ろに続けて教えてください。\n例：名前は山田太郎:",
      };
      await client.pushMessage(lineUserId, askMessage);
    } else {
      const proper = (await user).user_property;
      const properMessage: TextMessage = {
        type: "text",
        text: `あなたは現在 ${proper} として登録されています。\n変更したい場合は、「名前は」に続けて名前を入力してください。\n予定を確認したい場合は、「カレンダー」または「ログイン」と入力してください。`,
      };
      await client.pushMessage(lineUserId, properMessage);
    }
  } catch (error) {
    const user = await findUserByLineUserId(lineUserId);
    console.log(user)
  }
};


export const saveName = async (lineUserId: string, messageText: string) => {
  const name = messageText.split("名前は")[1];
  if (name) {
    const successMessage: TextMessage = {
      type: "text",
      text: `あなたの名前を ${name} として保存しています...`,
    };
    await client.pushMessage(lineUserId, successMessage);
    await saveUserDB(lineUserId, name)
  } else {
    const errorMessage: TextMessage = {
      type: "text",
      text: "名前の形式が正しくありません。もう一度試してください。",
    };
    await client.pushMessage(lineUserId, errorMessage);
    await askName(lineUserId)
  }
}

export const sendCalender = async (
  lineUserId: string,
) => {
  const user = await findUserByLineUserId(lineUserId)
  const name = (await user).user_property
  console.log("enter sendCalender")

  if (name) {
    // スケジュールをスクレイピングしてユーザーに送信
    console.log("there is name")
    const times = await scrapeTimes(lineUserId);
    console.log("times;", times)
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
      text: "名前が登録されていません。",
    };
    await client.pushMessage(lineUserId, errorMessage);
    await askName(lineUserId)
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

export const sendRegularlyCalender = async (lineUserId: string) => {
  const regularMessage: TextMessage = {
    type: "text",
    text: "テストメッセージ\n",
  };
  client.pushMessage(lineUserId, regularMessage)
  await sendCalender(lineUserId)
}