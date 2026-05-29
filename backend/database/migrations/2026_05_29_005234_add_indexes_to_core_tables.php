<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Campaigns
        Schema::table('campaigns', function (Blueprint $table) {
            $table->index('advertiser_id');
            $table->index('status');
        });

        // Campaign applications
        Schema::table('campaign_applications', function (Blueprint $table) {
            $table->index('creator_id');
            $table->index('campaign_id');
            $table->index('status');
        });

        // Deliverables
        Schema::table('deliverables', function (Blueprint $table) {
            $table->index('application_id');
        });

        // Payments
        Schema::table('payments', function (Blueprint $table) {
            $table->index('advertiser_id');
            $table->index('creator_id');
            $table->index('campaign_id');
            $table->index('status');
        });

        // Wallet transactions
        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->index('wallet_id');
            $table->index(['reference_type', 'reference_id']);
        });

        // Messages
        Schema::table('messages', function (Blueprint $table) {
            $table->index('sender_id');
            $table->index('receiver_id');
        });

        // Notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('user_id');
        });

        // Reviews - unique constraint to prevent duplicates
        Schema::table('reviews', function (Blueprint $table) {
            $table->unique(['campaign_id', 'reviewer_id', 'reviewee_id'], 'reviews_unique');
        });

        // Admin logs
        Schema::table('admin_logs', function (Blueprint $table) {
            $table->index('admin_id');
            $table->index('action');
        });

        // KYC documents
        Schema::table('kyc_documents', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
        });

        // Portfolio items
        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropIndex(['advertiser_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('campaign_applications', function (Blueprint $table) {
            $table->dropIndex(['creator_id']);
            $table->dropIndex(['campaign_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('deliverables', function (Blueprint $table) {
            $table->dropIndex(['application_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['advertiser_id']);
            $table->dropIndex(['creator_id']);
            $table->dropIndex(['campaign_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->dropIndex(['wallet_id']);
            $table->dropIndex(['reference_type', 'reference_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['sender_id']);
            $table->dropIndex(['receiver_id']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique('reviews_unique');
        });

        Schema::table('admin_logs', function (Blueprint $table) {
            $table->dropIndex(['admin_id']);
            $table->dropIndex(['action']);
        });

        Schema::table('kyc_documents', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};
