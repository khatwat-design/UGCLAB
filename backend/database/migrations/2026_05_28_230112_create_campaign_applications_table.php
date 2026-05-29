<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->text('proposal')->nullable();
            $table->decimal('proposed_rate', 12, 2)->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
            $table->unique(['campaign_id', 'creator_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_applications');
    }
};
