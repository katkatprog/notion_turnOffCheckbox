import { Client } from "@notionhq/client"
import { } from 'dotenv/config'

const notion = new Client({ auth: process.env.NOTION_KEY })

async function getDatabase() {
  const response = await notion.databases.query({ database_id: process.env.NOTION_DATABASE_ID });
  return response;
};

async function checkboxTurnedToOff(pageID) {
  try {
    const response = await notion.pages.update({
      page_id: pageID,
      properties: {
        'DONE': {
          checkbox: false,
        },
      },
    })
    // console.log(response)
    console.log("checkbox turned to off")
  } catch (error) {
    console.error(error.body)
  }
}

const notionDBObj = await getDatabase();//DB取得
const notionDBElements = notionDBObj.results//取得したDBの要素部分

let pageIds = []//DBの各要素のpageIdを格納 ↓3行で格納処理を行う。
notionDBElements.forEach(ele => {
  pageIds.push(ele.id)
});

// 各々のpageId(DBの要素)のうち，チェックボックスがtrue(チェックあり)のもののみチェックを外す。
for (let i = 0; i < pageIds.length; i++) {
  if (notionDBElements[i].properties.DONE.checkbox) {
    checkboxTurnedToOff(pageIds[i])
  }
}
