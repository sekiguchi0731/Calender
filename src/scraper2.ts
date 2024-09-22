import axios from "axios";
import * as cheerio from "cheerio";

export const scrapeTimes = async (): Promise<string[]> => {
  const url = "https://tryworks.trygroup.co.jp/calendar";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const times: string[] = [];

  $("span.Schedules__time").each((_, element) => {
    const timeText = $(element).text();
    console.log("抽出されたテキスト: ", timeText);
    const timeMatch = timeText.match(/(\d{1,2}:\d{2})/g);
    if (timeMatch) {
      console.log("抽出された時間: ", timeMatch[0]);
      times.push(timeMatch[0]);
    }
  });

  return times;
};
