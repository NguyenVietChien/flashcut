/**
 * Dynamic Pricing Migration — PlanDisplay table + seed data
 * Run: node prisma/migrations/dynamic-pricing/run-migration.js
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

        // 1. Create table
        console.log('Creating PlanDisplay table...');
        await client.query(sql);

        // 2. Seed display data for existing plans
        console.log('Seeding display data for existing plans...');
        const plans = await client.query('SELECT id, slug FROM "Plan"');

        const seedData = {
            basic: {
                taglineVi: 'Có kịch bản? 1 click ra video hoàn chỉnh',
                taglineEn: 'Got a script? One click to a finished video',
                highlightVi: 'Bộ công cụ cốt lõi',
                highlightEn: 'Core toolkit',
                ctaVi: 'Bắt Đầu',
                ctaEn: 'Get Started',
                emoji: '⚡',
                sortOrder: 0,
                isFeatured: false,
            },
            pro: {
                taglineVi: 'Công cụ thông minh — sản xuất video chất lượng studio nhanh hơn',
                taglineEn: 'Smart tools — produce studio-quality videos faster',
                highlightVi: 'Tất cả Basic, thêm',
                highlightEn: 'Everything in Basic, plus',
                ctaVi: 'Nâng Cấp Ngay',
                ctaEn: 'Upgrade Now',
                emoji: '🚀',
                sortOrder: 1,
                isFeatured: true,
            },
            ultra: {
                taglineVi: 'Chỉ cần mô tả — AI edit video cho bạn',
                taglineEn: 'Just describe it — AI edits your video',
                highlightVi: 'Tất cả Pro, thêm',
                highlightEn: 'Everything in Pro, plus',
                ctaVi: 'Liên Hệ',
                ctaEn: 'Contact Us',
                emoji: '👑',
                sortOrder: 2,
                isFeatured: false,
            },
        };

        // Also seed features JSON for each plan
        const featuresData = {
            basic: {
                vi: [
                    { group: 'Tạo video', icon: 'film', items: ['Có kịch bản → ra video chỉ trong vài phút', 'Ghép video, text & audio dễ dàng', 'Tự động sắp xếp & sắp thứ tự file media'] },
                    { group: 'Hoàn thiện', icon: 'sparkles', items: ['Xếp chồng nhiều audio track', '100+ hiệu ứng & filter sẵn dùng ngay', 'Chuyển cảnh mượt mà giữa các scene', 'Timeline trực quan — kéo & thả'] },
                    { group: 'AI hỗ trợ', icon: 'brain', items: ['Dùng key AI của bạn (BYOK)', 'Chat với GPT hoặc Gemini', 'Để AI viết kịch bản cho bạn'] },
                    { group: 'Xuất bản', icon: 'layers', items: ['1 click — từ kịch bản đến sản phẩm'] },
                ],
                en: [
                    { group: 'Create', icon: 'film', items: ['Script in → finished video out, in minutes', 'Combine video, text & audio effortlessly', 'Auto-organize & sequence your media files'] },
                    { group: 'Polish', icon: 'sparkles', items: ['Layer multiple audio tracks', '100+ effects & filters ready to use', 'Smooth transitions between scenes', 'Visual timeline — drag & drop'] },
                    { group: 'AI Assist', icon: 'brain', items: ['Use your own AI key (BYOK)', 'Chat with GPT or Gemini', 'Let AI write your script'] },
                    { group: 'Deliver', icon: 'layers', items: ['One click — script to final product'] },
                ],
            },
            pro: {
                vi: [
                    { group: 'Sức mạnh', icon: 'settings', items: ['Áp hiệu ứng cho tất cả clip tức thì', 'Lưu & tái sử dụng style yêu thích', 'Xây template project tái sử dụng'] },
                    { group: 'AI thông minh', icon: 'brain', items: ['4 AI model phối hợp cùng lúc', '10 AI tools — chính xác 95.5%', 'AI tự chọn SFX phù hợp nhất', 'Không lo vượt ngân sách AI'] },
                    { group: 'Giọng nói & Phụ đề', icon: 'mic', items: ['Tạo giọng nói từ văn bản', 'Chuyển giọng nói thành text tức thì', 'Tự động tạo phụ đề'] },
                    { group: 'Quy trình', icon: 'bar-chart', items: ['Theo dõi mọi phiên bản project', 'Quy trình sản xuất chuyên nghiệp', 'Hỗ trợ email ưu tiên'] },
                ],
                en: [
                    { group: 'Power Tools', icon: 'settings', items: ['Apply effects to all clips instantly', 'Save & reuse your favorite styles', 'Build reusable project templates'] },
                    { group: 'AI Brain', icon: 'brain', items: ['4 AI models working together', '10 AI tools — 95.5% accuracy', 'AI picks the perfect sound effects', 'Never overspend on AI — budget guard'] },
                    { group: 'Voice & Subtitle', icon: 'mic', items: ['Generate voices from text', 'Turn speech into text instantly', 'Auto-generate subtitles'] },
                    { group: 'Workflow', icon: 'bar-chart', items: ['Track every version of your project', 'Streamlined production pipeline', 'Priority email support'] },
                ],
            },
            ultra: {
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
            },
        };

        let seeded = 0;
        for (const plan of plans.rows) {
            const data = seedData[plan.slug];
            const features = featuresData[plan.slug];
            if (!data) continue;

            // Check if display already exists
            const existing = await client.query(
                'SELECT id FROM "PlanDisplay" WHERE "planId" = $1',
                [plan.id]
            );
            if (existing.rowCount > 0) {
                console.log(`  ⏭  ${plan.slug}: display already exists`);
                continue;
            }

            // Insert PlanDisplay
            const id = `pd_${plan.slug}_${Date.now()}`;
            await client.query(
                `INSERT INTO "PlanDisplay" ("id", "planId", "taglineVi", "taglineEn", "highlightVi", "highlightEn", "ctaVi", "ctaEn", "emoji", "sortOrder", "isFeatured")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [id, plan.id, data.taglineVi, data.taglineEn, data.highlightVi, data.highlightEn, data.ctaVi, data.ctaEn, data.emoji, data.sortOrder, data.isFeatured]
            );

            // Update Plan.features JSON
            if (features) {
                await client.query(
                    'UPDATE "Plan" SET "features" = $1 WHERE "id" = $2',
                    [JSON.stringify(features), plan.id]
                );
            }

            console.log(`  ✅ ${plan.slug}: display + features seeded`);
            seeded++;
        }

        await client.query('COMMIT');
        console.log(`\n✅ Migration completed! Seeded ${seeded} plan displays.`);

        // Verify
        const displays = await client.query('SELECT pd.*, p.slug as "planSlug" FROM "PlanDisplay" pd JOIN "Plan" p ON pd."planId" = p.id ORDER BY pd."sortOrder"');
        console.log(`\nPlanDisplay rows: ${displays.rowCount}`);
        displays.rows.forEach(d => console.log(`  - ${d.planSlug}: ${d.emoji} sortOrder=${d.sortOrder} featured=${d.isFeatured}`));

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed, rolled back:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
