// apiController.ts
import { Request, Response } from "express";
import { saveUser } from "./userModel";

export const notifyLogin = async (req: Request, res: Response) => {
  try {
    const { lineUserId, status, username, passwordHash } = req.body;

    if (!lineUserId || !username || !passwordHash) {
      return res.status(400).send("Missing required fields");
    }

    if (status === "success") {
      // ユーザーがログインに成功したことを記録
      console.log(`ユーザー ${lineUserId} がログインに成功しました`);

      // ユーザー情報をデータベースに保存
      await saveUser(lineUserId, username, passwordHash);

      res.status(200).send("Login successful");
    } else {
      res.status(400).send("Login failed");
    }
  } catch (error) {
    console.error("エラーが発生しました: ", error);
    res.status(500).send("Internal server error");
  }
};
