/**
 * Seed Ultra plan + PlanDisplay
 * Run: node scripts/seed-ultra.js
 */
const { Client } = require('pg');
const fs = require('fs');

async function main() {
    const env = fs.readFileSync('.env', 'utf8');
    const c = new Client({ connectionString: env.match(/DATABASE_URL="(.+)"/)[1] });
    await c.connect();

    try {
        await c.query('BEGIN');

        // 1. Create Ultra plan (no createdAt/updatedAt in this table)
        const planId = 'plan_ultra_' + Date.now();
        await c.query(
            `INSERT INTO "Plan" ("id", "slug", "name", "priceVnd", "priceUsd", "durationDays", "isActive", "productId", "features")
             VALUES ($1, 'ultra', 'Ultra', 1499000, 59, 30, true, 'prod_flashcut', $2)`,
            [planId, JSON.stringify({
                vi: [
                    { group: 'AI Director', icon: 'cpu', items: ['Mô tả ý tưởng — AI tự edit video', 'Ra lệnh bằng ngôn ngữ tự nhiên — không cần học', 'Xem thay đổi ngay khi chat'] },
                    { group: 'Creative Studio', icon: 'mic', items: ['Tạo ảnh bằng 3 engine AI', 'Quy trình sáng tạo khép kín', 'Tự động render & xuất video hoàn chỉnh'] },
                    { group: 'Mở rộng', icon: 'layers', items: ['Chạy nhiều project song song', 'A/B test các biến thể video', 'Template không giới hạn'] },
                    { group: 'Kết nối', icon: 'plug', items: ['Tự động với webhooks', 'Truy cập REST API đầy đủ', 'Tùy chỉnh trigger workflow'] },
                ],
                en: [
                    { group: 'AI Director', icon: 'cpu', items: ['Describe what you want — AI does the editing', 'Natural language commands — no learning curve', 'See changes in real-time as you chat'] },
                    { group: 'Creative Studio', icon: 'mic', items: ['Generate images with 3 AI engines', 'End-to-end visual production', 'Auto render & deliver final video'] },
                    { group: 'Scale', icon: 'layers', items: ['Run multiple projects simultaneously', 'A/B test video variations', 'Unlimited reusable templates'] },
                    { group: 'Connect', icon: 'plug', items: ['Automate with webhooks', 'Full REST API access', 'Custom workflow triggers'] },
                ],
            })]
        );
        console.log('Plan created:', planId);

        // 2. Create PlanDisplay
        const displayId = 'pd_ultra_' + Date.now();
        await c.query(
            `INSERT INTO "PlanDisplay" ("id", "planId", "taglineVi", "taglineEn", "highlightVi", "highlightEn", "ctaVi", "ctaEn", "emoji", "sortOrder", "isFeatured")
             VALUES ($1, $2, 'Chỉ cần mô tả — AI edit video cho bạn', 'Just describe it — AI edits your video', 'Tất cả Pro, thêm', 'Everything in Pro, plus', 'Liên Hệ', 'Contact Us', '👑', 2, false)`,
            [displayId, planId]
        );
        console.log('Display created:', displayId);

        await c.query('COMMIT');

        // Verify
        const plans = await c.query('SELECT slug, name, "priceVnd", "priceUsd" FROM "Plan" ORDER BY "priceVnd"');
        console.log('\nAll plans:');
        plans.rows.forEach(p => console.log(`  ${p.slug}: ${p.name} | ${p.priceVnd}d / $${p.priceUsd}`));

    } catch (err) {
        await c.query('ROLLBACK');
        console.error('Failed:', err.message);
    } finally {
        await c.end();
    }
}
main();
