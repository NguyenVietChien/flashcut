const { Client } = require('pg');
const fs = require('fs');

async function main() {
    const env = fs.readFileSync('.env', 'utf8');
    const m = env.match(/DATABASE_URL="(.+)"/);
    const c = new Client({ connectionString: m[1] });
    await c.connect();

    const p = await c.query('SELECT slug, name, "priceVnd", "priceUsd", "isActive" FROM "Plan" ORDER BY "priceVnd"');
    console.log('Plans:');
    p.rows.forEach(r => console.log('  ' + JSON.stringify(r)));

    const d = await c.query('SELECT pd."emoji", pd."sortOrder", pd."isFeatured", p.slug FROM "PlanDisplay" pd JOIN "Plan" p ON pd."planId" = p.id ORDER BY pd."sortOrder"');
    console.log('Displays:');
    d.rows.forEach(r => console.log('  ' + JSON.stringify(r)));

    const ultra = await c.query('SELECT id FROM "Plan" WHERE slug = $1', ['ultra']);
    console.log('\nUltra plan exists:', ultra.rowCount > 0);

    if (ultra.rowCount === 0) {
        const products = await c.query('SELECT id, name FROM "Product" WHERE "isActive" = true LIMIT 1');
        console.log('Available product:', products.rows[0] || 'NONE');
    }

    await c.end();
}
main().catch(console.error);
