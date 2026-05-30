<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string');
            $table->timestamps();
        });

        DB::table('platform_settings')->insert([
            ['key' => 'guild_commission_rate', 'value' => '0.02', 'type' => 'float'],
            ['key' => 'platform_fee_rate', 'value' => '0.10', 'type' => 'float'],
            ['key' => 'reward_budget_ratio', 'value' => '0.08', 'type' => 'float'],
            ['key' => 'max_daily_points', 'value' => '200', 'type' => 'integer'],
            ['key' => 'tier_rising_min', 'value' => '0', 'type' => 'integer'],
            ['key' => 'tier_creator_min', 'value' => '500', 'type' => 'integer'],
            ['key' => 'tier_pro_min', 'value' => '2000', 'type' => 'integer'],
            ['key' => 'tier_elite_min', 'value' => '5000', 'type' => 'integer'],
            ['key' => 'login_points', 'value' => '5', 'type' => 'integer'],
            ['key' => 'streak_milestone_7', 'value' => '50', 'type' => 'integer'],
            ['key' => 'streak_milestone_30', 'value' => '200', 'type' => 'integer'],
            ['key' => 'streak_milestone_60', 'value' => '500', 'type' => 'integer'],
            ['key' => 'streak_milestone_100', 'value' => '1000', 'type' => 'integer'],
            ['key' => 'points_expiry_days', 'value' => '365', 'type' => 'integer'],
            ['key' => 'grace_days_max', 'value' => '1', 'type' => 'integer'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
