import { Client } from "@notionhq/client"
import { } from 'dotenv/config'

const notionKey = process.env.NOTION_KEY
const databaseId = process.env.NOTION_DATABASE_ID

const notion = new Client({ auth: notionKey })

const getDatabase = async () => {
  const response = await notion.databases.query({ database_id: databaseId });

  console.log(response);
};

getDatabase();
