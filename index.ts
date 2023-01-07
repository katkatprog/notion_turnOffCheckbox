import { Client } from "@notionhq/client";
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import "dotenv/config";
import cron from "node-cron";

// ---------------custom interface---------------
interface PropertiesDONE {
  properties: {
    DONE: {
      checkbox: boolean;
    };
  };
}

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
  } catch (error: any) {
    console.error(error.body);
  }
}

// 実行用の関数
const main = async () => {
  const notionDBObj = await getDatabase(); //DB取得
  if (!notionDBObj) {
    console.log("DB取得に失敗しました。");
    return;
  }

  //取得したDBの要素部分
  const notionDBElements = notionDBObj.results as (PageObjectResponse &
    PropertiesDONE)[];
  // デフォルトだと、notionDBElementsの型が (PageObjectResponse | PartialPageObjectResponse)[] のユニオン型になる
  // そうなると、propertiesプロパティにアクセスしようとした際、PartialPageObjectResponseの方には存在しないので、コンパイルエラーになる。
  // それを防ぐため、型アサーションでPageObjectResponseの配列に固定
  // さらに、properties内のDONEプロパティにもアクセスしたい(これはPageObjectResponseに存在しない)ので、
  // 自作interfaceであるPropertiesDONEをインターセクションし、型拡張している。

  let pageIds: string[] = []; //DBの各要素のpageIdを格納 ↓3行で格納処理を行う。
  notionDBElements.forEach((ele) => {
    pageIds.push(ele.id);
  });

  // 各々のpageId(DBの要素)のうち，チェックボックスがtrue(チェックあり)のもののみチェックを外す。
  for (let i = 0; i < pageIds.length; i++) {
    if (notionDBElements[i].properties.DONE.checkbox) {
      checkboxTurnedToOff(pageIds[i]);
    }
  }
};

// ---------------関数定義部分終了--------------

// ---------------処理実行部分----------------
// 毎日00:00:00秒に実行する
cron.schedule("0 0 0 * * *", main);
