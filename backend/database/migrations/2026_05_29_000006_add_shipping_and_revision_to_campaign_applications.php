<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaign_applications', function (Blueprint $table) {
            $table->string('shipping_status')->default('not_shipped')->after('status');
            $table->string('tracking_number')->nullable()->after('shipping_status');
            $table->timestamp('shipped_at')->nullable()->after('tracking_number');
            $table->timestamp('received_at')->nullable()->after('shipped_at');
        });
    }

    public function down(): void
    {
        Schema::table('campaign_applications', function (Blueprint $table) {
            $table->dropColumn(['shipping_status', 'tracking_number', 'shipped_at', 'received_at']);
        });
    }
};
