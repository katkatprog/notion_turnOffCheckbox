import { Client } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import {} from "dotenv/config";
import cron from "node-cron";

// ---------------関数定義部分--------------
const notion = new Client({ auth: process.env.NOTION_KEY });

async function getDatabase(): Promise<QueryDatabaseResponse | undefined> {
  if (process.env.NOTION_DATABASE_ID) {
    return await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });
  }
  return undefined;
}

async function checkboxTurnedToOff(pageID: string) {
  try {
    await notion.pages.update({
      page_id: pageID,
      properties: {
        DONE: {
          checkbox: false,
        },
      },
    });
    // console.log(response)
    console.log("checkbox turned to off");
  } catch (error) {
    console.error(error.body);
  }
}
// ---------------関数定義部分終了--------------

// ---------------処理実行部分----------------
// 毎日00:00:00秒に実行する
cron.schedule("0 0 0 * * *", async () => {
  const notionDBObj = await getDatabase(); //DB取得
  const notionDBElements = notionDBObj.results; //取得したDBの要素部分

  let pageIds = []; //DBの各要素のpageIdを格納 ↓3行で格納処理を行う。
  notionDBElements.forEach((ele) => {
    pageIds.push(ele.id);
  });

  // 各々のpageId(DBの要素)のうち，チェックボックスがtrue(チェックあり)のもののみチェックを外す。
  for (let i = 0; i < pageIds.length; i++) {
    if (notionDBElements[i].properties.DONE.checkbox) {
      checkboxTurnedToOff(pageIds[i]);
    }
  }
});
