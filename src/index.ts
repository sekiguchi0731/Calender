import { sendLineMessage } from "./lineBot";

const main = async () => {
  try {
    await sendLineMessage();
    console.log("メッセージを送信しました！");
  } catch (error) {
    console.error("エラーが発生しました: ", error);
  }
};

main();
