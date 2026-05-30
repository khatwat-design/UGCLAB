<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rewards_catalog', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('category');
            $table->integer('points_cost');
            $table->string('min_tier')->default('rising');
            $table->decimal('unit_cost_usd', 8, 2);
            $table->integer('stock')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('delivery_days')->default(7);
            $table->string('image_url')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rewards_catalog');
    }
};
