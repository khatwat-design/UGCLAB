<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_revenue_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('month');
            $table->decimal('total_revenue', 12, 2);
            $table->decimal('reward_budget', 12, 2);
            $table->decimal('spent_on_rewards', 12, 2)->default(0);
            $table->boolean('is_finalized')->default(false);
            $table->timestamps();

            $table->unique('month');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_revenue_snapshots');
    }
};
