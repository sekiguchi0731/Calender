import { Client, TextMessage } from "@line/bot-sdk";
import { lineConfig } from "./config";
import { scrapeTimes } from "./scraper";

const client = new Client(lineConfig);

export const sendLineMessage = async () => {
  const times = await scrapeTimes();
  console.log(times);

  const message: TextMessage = {
    type: "text",
    text: `スケジュールされた時間は: ${times.join(", ")}`,
  };

  await client.pushMessage("U13e6d5f39bb37522c52fd8c31bd512d4", message);
};
