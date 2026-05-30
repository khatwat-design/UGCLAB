<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_redemptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('reward_id')->constrained('rewards_catalog')->onDelete('cascade');
            $table->integer('points_used');
            $table->string('status')->default('pending');
            $table->json('address_snapshot')->nullable();
            $table->timestamps();
            $table->timestamp('fulfilled_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_redemptions');
    }
};
