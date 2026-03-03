/**
 * Multi-Product Migration Script
 * Run: node prisma/migrations/multi_product/run-migration.js
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
    // Read DATABASE_URL from .env
    const envContent = fs.readFileSync(path.join(__dirname, '../../../.env'), 'utf8');
    const match = envContent.match(/DATABASE_URL="(.+)"/);
    if (!match) {
        console.error('DATABASE_URL not found in .env');
        process.exit(1);
    }

    const client = new Client({ connectionString: match[1] });
    await client.connect();
    console.log('Connected to database');

    const sql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');

    try {
        await client.query('BEGIN');
        console.log('Running migration...');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');

        // Verify
        const products = await client.query('SELECT * FROM "Product"');
        console.log(`\nProducts: ${products.rowCount}`);
        products.rows.forEach(p => console.log(`  - ${p.slug}: ${p.name} (${p.type})`));

        const plans = await client.query('SELECT * FROM "Plan"');
        console.log(`Plans: ${plans.rowCount}`);
        plans.rows.forEach(p => console.log(`  - ${p.slug}: ${p.name} (${p.priceVnd} VND)`));

        const licenses = await client.query('SELECT COUNT(*) as count FROM "License"');
        console.log(`Licenses: ${licenses.rows[0].count}`);

        const orders = await client.query('SELECT COUNT(*) as count FROM "Order"');
        console.log(`Orders: ${orders.rows[0].count}`);

        // Check if desktop_licenses still exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'desktop_licenses'
            )
        `);
        console.log(`desktop_licenses table dropped: ${!tableCheck.rows[0].exists}`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed, rolled back:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
