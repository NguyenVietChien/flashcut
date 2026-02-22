const { createClient } = require("@libsql/client");

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
    const stmts = [
        `CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, emailVerified DATETIME, image TEXT, password TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
        `CREATE TABLE IF NOT EXISTS Account (id TEXT PRIMARY KEY, userId TEXT NOT NULL, type TEXT NOT NULL, provider TEXT NOT NULL, providerAccountId TEXT NOT NULL, refresh_token TEXT, access_token TEXT, expires_at INTEGER, token_type TEXT, scope TEXT, id_token TEXT, session_state TEXT, FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE)`,
        `CREATE UNIQUE INDEX IF NOT EXISTS Account_provider_providerAccountId_key ON Account(provider, providerAccountId)`,
        `CREATE TABLE IF NOT EXISTS Session (id TEXT PRIMARY KEY, sessionToken TEXT UNIQUE NOT NULL, userId TEXT NOT NULL, expires DATETIME NOT NULL, FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE)`,
        `CREATE TABLE IF NOT EXISTS VerificationToken (identifier TEXT NOT NULL, token TEXT UNIQUE NOT NULL, expires DATETIME NOT NULL)`,
        `CREATE UNIQUE INDEX IF NOT EXISTS VerificationToken_identifier_token_key ON VerificationToken(identifier, token)`,
        `CREATE TABLE IF NOT EXISTS ContactMessage (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
        `CREATE TABLE IF NOT EXISTS "Order" (id TEXT PRIMARY KEY, userId TEXT NOT NULL, plan TEXT NOT NULL, amount INTEGER NOT NULL, currency TEXT DEFAULT 'vnd', status TEXT DEFAULT 'pending', paymentMethod TEXT DEFAULT 'stripe', stripeSessionId TEXT UNIQUE, paidAt DATETIME, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE)`,
        `CREATE TABLE IF NOT EXISTS License (id TEXT PRIMARY KEY, userId TEXT NOT NULL, orderId TEXT UNIQUE NOT NULL, key TEXT UNIQUE NOT NULL, plan TEXT NOT NULL, status TEXT DEFAULT 'active', activatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, expiresAt DATETIME NOT NULL, FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE, FOREIGN KEY (orderId) REFERENCES "Order"(id))`,
    ];

    for (const sql of stmts) {
        try {
            await client.execute(sql);
            console.log("OK:", sql.substring(0, 70) + "...");
        } catch (err) {
            console.error("FAIL:", sql.substring(0, 70), err.message);
        }
    }

    const tables = await client.execute(`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log("\nTables created:", tables.rows.map((r) => r.name));
}

migrate().catch(console.error);
