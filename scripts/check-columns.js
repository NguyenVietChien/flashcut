const { Client } = require('pg');
const fs = require('fs');

async function main() {
    const env = fs.readFileSync('.env', 'utf8');
    const c = new Client({ connectionString: env.match(/DATABASE_URL="(.+)"/)[1] });
    await c.connect();
    const r = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='Plan' ORDER BY ordinal_position");
    r.rows.forEach(x => console.log(x.column_name));
    await c.end();
}
main();
