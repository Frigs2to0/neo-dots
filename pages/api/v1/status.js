import database from "infra/database.js"

async function status(request, response) {
    const updatedAt = new Date().toISOString()

    const dbVersionBody = await database.query("SHOW server_version;")
    const dbVersion = await dbVersionBody.rows[0].server_version

    const dbMaxConnectionsBody = await database.query("SHOW max_connections;")
    const dbMaxConnections = dbMaxConnectionsBody.rows[0].max_connections

    const databaseName = process.env.POSTGRES_DB
    const dbActiveConnectionsBody = await database.query({
        text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
        values: [databaseName],
    })
    const dbActiveConnections = dbActiveConnectionsBody.rows[0].count

       
    response.status(200).json({
        updated_at: updatedAt,
        dependencies: {
            database: {
                db_version: dbVersion,
                max_connections: parseInt(dbMaxConnections),
                db_active_connections: dbActiveConnections,
            }
        }
    })
}

export default status