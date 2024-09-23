// userModel.ts
import bcrypt from "bcrypt";
import { query } from "./db";

// ユーザーをデータベースに保存（存在する場合は更新）
export const saveUser = async (
  lineUserId: string,
  username: string,
  password: string
) => {
  const passwordHash = await bcrypt.hash(password, 10); // パスワードをハッシュ化

  // すでにユーザーが存在するか確認
  const existingUser = await findUserByLineUserId(lineUserId);
  console.log("ここだよ");

  if (existingUser) {
    // 既存のユーザー情報を更新
    await query(
      "UPDATE users SET username = $1, password_hash = $2 WHERE line_user_id = $3",
      [username, passwordHash, lineUserId]
    );
    console.log(username, passwordHash, lineUserId);
    console.log(`ユーザー ${lineUserId} の情報を更新しました`);
  } else {
    // 新しいユーザーを作成
    await query(
      "INSERT INTO users (line_user_id, username, password_hash) VALUES ($1, $2, $3)",
      [lineUserId, username, passwordHash]
    );
    console.log(`新しいユーザー ${lineUserId} を作成しました`);
  }
};

// ユーザー情報を取得
export const findUserByLineUserId = async (lineUserId: string) => {
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
