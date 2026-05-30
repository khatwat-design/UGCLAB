<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('target_gender')->nullable()->after('max_creators');
            $table->integer('target_age_min')->nullable()->after('target_gender');
            $table->integer('target_age_max')->nullable()->after('target_age_min');
            $table->integer('videos_per_creator')->default(1)->after('target_age_max');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['target_gender', 'target_age_min', 'target_age_max', 'videos_per_creator']);
        });
    }
};
