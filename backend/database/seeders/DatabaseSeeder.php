<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CreatorProfile;
use App\Models\AdvertiserProfile;
use App\Models\Campaign;
use App\Models\CampaignApplication;
use App\Models\Wallet;
use App\Models\Message;
use App\Enums\UserRole;
use App\Enums\CampaignStatus;
use App\Enums\ApplicationStatus;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::factory()->create([
            'name' => 'مدير المنصة',
            'email' => 'admin@ugclab.com',
            'role' => 'admin',
        ]);
        Wallet::create(['user_id' => $admin->id]);

        // Creators
        $creators = collect();
        $creatorNames = [
            ['name' => 'أحمد علي', 'category' => 'تكنولوجيا', 'followers' => 50000, 'engagement' => 4.5],
            ['name' => 'سارة محمد', 'category' => 'موضة وجمال', 'followers' => 120000, 'engagement' => 6.2],
            ['name' => 'عمر خالد', 'category' => 'ألعاب', 'followers' => 200000, 'engagement' => 8.1],
            ['name' => 'نور حسن', 'category' => 'سفر ومغامرات', 'followers' => 85000, 'engagement' => 5.3],
            ['name' => 'ليلى عبدالله', 'category' => 'طبخ', 'followers' => 150000, 'engagement' => 7.8],
        ];

        foreach ($creatorNames as $data) {
            $user = User::factory()->create([
                'name' => $data['name'],
                'email' => strtolower(str_replace(' ', '.', $data['name'])) . '@ugclab.com',
                'role' => 'creator',
                'bio' => "مبدع محتوى في مجال {$data['category']}",
            ]);
            CreatorProfile::create([
                'user_id' => $user->id,
                'category' => $data['category'],
                'platforms' => ['youtube', 'instagram', 'tiktok'],
                'rates' => ['post' => 200, 'video' => 500, 'story' => 100],
                'portfolio_links' => ['https://example.com/portfolio'],
                'followers_count' => $data['followers'],
                'engagement_rate' => $data['engagement'],
            ]);
            Wallet::create(['user_id' => $user->id]);
            $creators->push($user);
        }

        // Advertisers
        $advertiserNames = [
            ['name' => 'شركة التقنية', 'company' => 'TechCo IQ', 'industry' => 'تكنولوجيا'],
            ['name' => 'متجر الموضة', 'company' => 'FashionHub', 'industry' => 'موضة'],
            ['name' => 'مطعم الذواق', 'company' => 'AlDhawaq', 'industry' => 'مطاعم'],
        ];

        $advertisers = collect();
        foreach ($advertiserNames as $data) {
            $user = User::factory()->create([
                'name' => $data['name'],
                'email' => strtolower(str_replace(' ', '_', $data['company'])) . '@ugclab.com',
                'role' => 'advertiser',
            ]);
            AdvertiserProfile::create([
                'user_id' => $user->id,
                'company_name' => $data['company'],
                'industry' => $data['industry'],
            ]);
            Wallet::create(['user_id' => $user->id]);
            $advertisers->push($user);
        }

        // Campaigns
        $campaignTitles = [
            ['title' => 'إطلاق هاتف ذكي جديد', 'budget' => 5000, 'category' => 'تكنولوجيا'],
            ['title' => 'حملة ترويج للملابس الصيفية', 'budget' => 3000, 'category' => 'موضة'],
            ['title' => 'تذوق قائمة الطعام الجديدة', 'budget' => 2000, 'category' => 'مطاعم'],
            ['title' => 'تطبيق توصيل جديد', 'budget' => 4000, 'category' => 'تكنولوجيا'],
            ['title' => 'منتجات العناية بالبشرة', 'budget' => 3500, 'category' => 'جمال'],
        ];

        foreach ($campaignTitles as $i => $data) {
            $campaign = Campaign::create([
                'advertiser_id' => $advertisers[$i % count($advertisers)]->id,
                'title' => $data['title'],
                'description' => "نبحث عن مبدعين مبدعين للترويج لـ {$data['title']} عبر منصات التواصل الاجتماعي.",
                'brief' => "نحتاج إلى محتوى إبداعي يعكس قيم العلامة التجارية ويصل إلى الجمهور المستهدف.",
                'budget' => $data['budget'],
                'status' => 'open',
                'category' => $data['category'],
                'requirements' => ['نشر على Instagram', 'ستوري لمدة 24 ساعة', 'فيديو قصير'],
                'max_creators' => 3,
                'start_date' => now()->addDays(7),
                'end_date' => now()->addDays(30),
            ]);

            // Some applications
            if ($i < 3) {
                CampaignApplication::create([
                    'campaign_id' => $campaign->id,
                    'creator_id' => $creators[$i]->id,
                    'proposal' => "لدي خبرة واسعة في هذا المجال ويمكنني تقديم محتوى مميز يصل إلى آلاف المتابعين.",
                    'proposed_rate' => $data['budget'] * 0.8,
                    'status' => ApplicationStatus::Pending->value,
                ]);
            }
        }

        // Sample messages
        Message::create([
            'sender_id' => $creators[0]->id,
            'receiver_id' => $advertisers[0]->id,
            'content' => 'مرحباً، أنا مهتم بالتعاون معكم في حملة الهاتف الذكي',
        ]);
        Message::create([
            'sender_id' => $advertisers[0]->id,
            'receiver_id' => $creators[0]->id,
            'content' => 'مرحباً أحمد، يسعدنا التعاون معك. يرجى إرسال ملفك التعريفي',
        ]);
    }
}
