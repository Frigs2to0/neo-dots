import migrationRunner from 'node-pg-migrate'
import { join } from "node:path"
import database from 'infra/database'
 
export default async function migrations(request, response) {

    const allowedMethods = ["GET", "POST"]
    if (!allowedMethods.includes(request.method)) {
        return response.status(405).json({
            error: `Method "${request.method}" not allowed`
        })
    }

    let dbClient;
    try {
    dbClient = await database.getNewClient()

    const defaultMigrations= {
        dbClient: dbClient,
        dryRun: true,
        dir: join("infra", "migration"),
        direction: "up",
        verbose: true,
        migrationsTable: "pgmigrations"
    }

    if (request.method === "GET") {
        const pendingMigrations = await migrationRunner(defaultMigrations)
    return response.status(200).json(pendingMigrations)
    }

    if (request.method === 'POST') {
        const migratedMigrations = await migrationRunner({
            ...defaultMigrations,
            dryRun: false
        })

        if (migratedMigrations > 0) {
            return response.status(201).json(migratedMigrations)
        }

        return response.status(200).json(migratedMigrations)
    }

    } catch (error) {
        console.error(error)
        throw error
    } finally {
        await dbClient.end()
    }

}