import migrationRunner from 'node-pg-migrate'
import { join } from "node:path"
import database from 'infra/database'
 
export default async function migrations(request, response) {
    const dbClient = await database.getNewClient()

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
        await dbClient.end()
    return response.status(200).json(pendingMigrations)
    }

    if (request.method === 'POST') {
        const migratedMigrations = await migrationRunner({
            ...defaultMigrations,
            dryRun: false
        })

        await dbClient.end()

        if (migratedMigrations > 0) {
            return response.status(201).json(migratedMigrations)
        }

        return response.status(200).json(migratedMigrations)
    }

    return response.status(405).end()

}