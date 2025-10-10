import { Client } from "pg"

async function query(queryObject) {
     let client;

  if (process.env.NODE_ENV === "production") {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false 
      }
    });
  } else {
    client = new Client({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      ssl: false
    });
  }
    
    try {
        await client.connect()
        const result = await client.query(queryObject);
        return result
    } catch (error) {
        console.error("ERRO DATABASE.JS: ", error)
        throw error
    } finally {
        await client.end()
    }
}

export default {
    query: query,
}