import { Client } from "@notionhq/client"
import { } from 'dotenv/config'

const notionKey = process.env.NOTION_KEY
const databaseId = process.env.NOTION_DATABASE_ID

const notion = new Client({ auth: notionKey })

async function getDatabase() {
  const response = await notion.databases.query({ database_id: databaseId });
  return response;
};

async function addItem(text) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [
            {
              "text": {
                "content": text
              }
            }
          ]
        }
      },
    })
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}

async function updateItem(pageID) {
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
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}


const notionDBObj = await getDatabase();
const elements = notionDBObj.results;
let pageIds = []
elements.forEach(ele => {
  pageIds.push(ele.id)
});
console.log(pageIds);
for(let i=0;i<pageIds.length;i++){
  await updateItem(pageIds[i])
}
// addItem("Yurts in Big Sur, California")
// updateItem()
