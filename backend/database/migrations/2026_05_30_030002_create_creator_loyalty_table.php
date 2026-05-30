<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creator_loyalty', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->integer('total_points')->default(0);
            $table->integer('available_points')->default(0);
            $table->string('tier')->default('rising');
            $table->timestamp('tier_updated_at')->nullable();
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_login_date')->nullable();
            $table->integer('grace_days_left')->default(1);
            $table->boolean('streak_frozen')->default(false);
            $table->timestamps();

            $table->unique('creator_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creator_loyalty');
    }
};
