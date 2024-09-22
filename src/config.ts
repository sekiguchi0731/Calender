import { ClientConfig } from "@line/bot-sdk";
import dotenv from "dotenv";

// .envファイルの内容を読み込む
dotenv.config();

export const lineConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
