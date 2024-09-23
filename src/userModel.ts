// userModel.ts
import bcrypt from "bcrypt";
import { query } from "./db";
import { sendSavingMessage } from "./lineBot";

// ユーザーオブジェクトの型定義
interface User {
  id: number;
  line_user_id: string;
  created_at: Date;
  user_property: string;
}

// ユーザーをデータベースに保存（存在する場合は更新）
export const saveUser = async (lineUserId: string, userProper: string) => {
  // すでにユーザーが存在するか確認
  const existingUser = await findUserByLineUserId(lineUserId);
  console.log("ここだよ");

  if (existingUser) {
    // 既存のユーザー情報を更新
    try {
      await query(
        "UPDATE users SET user_property = $1 WHERE line_user_id = $2",
        [userProper, lineUserId]
      );
      console.log(userProper, lineUserId);
      console.log(`ユーザー ${lineUserId} の情報を更新しました`);
      sendSavingMessage(lineUserId, userProper, true);
    } catch (error) {
      console.log(error);
      sendSavingMessage(lineUserId, userProper, false);
    }
  } else {
    try {
      // 新しいユーザーを作成
      await query(
        "INSERT INTO users (line_user_id, user_property) VALUES ($1, $2)",
        [lineUserId, userProper]
      );
      console.log(`新しいユーザー ${lineUserId} を作成しました`);
      sendSavingMessage(lineUserId, userProper, true);
    } catch (error) {
      console.log(error);
      sendSavingMessage(lineUserId, userProper, false);
    }
  }
};

// ユーザー情報を取得
export const findUserByLineUserId = async (
  lineUserId: string
): Promise<User | null> => {
  const result = await query("SELECT * FROM users WHERE line_user_id = $1", [
    lineUserId,
  ]);
  return result.rows[0];
};

// パスワードの検証
export const verifyPassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, passwordHash);
};
