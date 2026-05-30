<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('creator_profiles', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('country');
            $table->string('payment_phone')->nullable()->after('payment_method');
            $table->string('payment_name')->nullable()->after('payment_phone');
        });
    }

    public function down(): void
    {
        Schema::table('creator_profiles', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_phone', 'payment_name']);
        });
    }
};
