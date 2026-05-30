<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('streak_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->boolean('used_grace')->default(false);
            $table->integer('points_earned')->default(0);
            $table->timestamps();

            $table->unique(['creator_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('streak_logs');
    }
};
