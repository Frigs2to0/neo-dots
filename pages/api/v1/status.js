import database from "infra/database.js"

async function status(request, response) {
    const updatedAt = new Date().toISOString()

    const dbVersionBody = await database.query("SHOW server_version;")
    const dbVersion = await dbVersionBody.rows[0].server_version

    const dbMaxConnectionsBody = await database.query("SHOW max_connections")
    const dbMaxConnections = Number(dbMaxConnectionsBody.rows[0].max_connections)

    const dbActiveConnectionsBody = await database.query("SELECT * FROM pg_stat_activity")
    const dbActiveConnections = dbActiveConnectionsBody.rowCount
       
    response.status(200).json({
        updated_at: updatedAt,
        dependencies: {
            database: {
                db_version: dbVersion,
                max_connections: dbMaxConnections,
                db_active_connection: dbActiveConnections,
            }
        }
    })
}

export default status