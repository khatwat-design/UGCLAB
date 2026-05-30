<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->integer('amount');
            $table->string('type');
            $table->string('source');
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('creator_id');
            $table->index('type');
            $table->index('source');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};
