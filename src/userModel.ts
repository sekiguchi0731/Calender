// userModel.ts
import bcrypt from "bcrypt";
import { query } from "./db";

// ユーザーをデータベースに保存
export const saveUser = async (
  lineUserId: string,
  username: string,
  password: string
) => {
  const passwordHash = await bcrypt.hash(password, 10); // パスワードをハッシュ化
  await query(
    "INSERT INTO users (line_user_id, username, password_hash) VALUES ($1, $2, $3)",
    [lineUserId, username, passwordHash]
  );
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
