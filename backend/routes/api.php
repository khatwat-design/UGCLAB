<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdvertiserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CreatorController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\LoyaltyController;
use App\Http\Controllers\Api\ReviewController;
use App\Models\Campaign;
use App\Models\CampaignApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'time' => now()]);
});

// Public routes (with rate limiting)
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:auth')
    ->name('login');
Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:auth');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:auth');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:auth');

// Public explore endpoint — no auth required
Route::get('/campaigns/explore', function () {
    return Campaign::where('status', 'open')
        ->select(['id', 'title', 'description', 'budget', 'category', 'created_at'])
        ->with('advertiser:id,name')
        ->latest()
        ->paginate(12);
})->middleware('throttle:api');

// Authenticated routes (with general API rate limiting)
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::put('/auth/notifications', [AuthController::class, 'updateNotificationPreferences']);

    // Creator routes
    Route::middleware('role:creator')->prefix('creator')->group(function () {
        Route::get('/dashboard', [CreatorController::class, 'dashboard']);
        Route::get('/campaigns', [CreatorController::class, 'availableCampaigns']);
        Route::post('/campaigns/{campaign}/apply', [CreatorController::class, 'apply']);
        Route::get('/applications', [CreatorController::class, 'myApplications']);
        Route::get('/applications/{application}', [CreatorController::class, 'myApplication']);
        Route::post('/deliverables/{application}', [CreatorController::class, 'submitDeliverable']);
        Route::post('/applications/{application}/mark-received', [CreatorController::class, 'markReceived']);
        Route::get('/settlement-requests', [CreatorController::class, 'settlementRequests']);
        Route::post('/settlement-requests', [CreatorController::class, 'requestSettlement']);
        Route::get('/earnings', [CreatorController::class, 'earnings']);
        Route::put('/profile', [CreatorController::class, 'updateProfile']);
        Route::get('/payout-methods', [CreatorController::class, 'payoutMethods']);
        Route::put('/payout-methods', [CreatorController::class, 'updatePayoutMethods']);
    });

    // Advertiser routes
    Route::middleware('role:advertiser')->prefix('advertiser')->group(function () {
        Route::get('/dashboard', [AdvertiserController::class, 'dashboard']);
        Route::get('/campaigns', [AdvertiserController::class, 'index']);
        Route::post('/campaigns', [AdvertiserController::class, 'store']);
        Route::get('/campaigns/{campaign}', [AdvertiserController::class, 'show']);
        Route::put('/campaigns/{campaign}', [AdvertiserController::class, 'update']);
        Route::delete('/campaigns/{campaign}', [AdvertiserController::class, 'destroy']);
        Route::get('/campaigns/{campaign}/applications', [AdvertiserController::class, 'applications']);
        Route::post('/campaigns/{campaign}/applications/{application}/approve', [AdvertiserController::class, 'approveApplication']);
        Route::post('/campaigns/{campaign}/applications/{application}/reject', [AdvertiserController::class, 'rejectApplication']);
        Route::post('/deliverables/{deliverable}/approve', [AdvertiserController::class, 'approveDeliverable']);
        Route::post('/deliverables/{deliverable}/reject', [AdvertiserController::class, 'rejectDeliverable']);
        Route::post('/deliverables/{deliverable}/request-revision', [AdvertiserController::class, 'requestRevision']);
        Route::post('/campaigns/{campaign}/applications/{application}/ship', [AdvertiserController::class, 'markShipped']);
        Route::post('/invite/{creator}', [AdvertiserController::class, 'invite']);
        Route::get('/creators', [CreatorController::class, 'discoverCreators']);
    });

    // Media uploads
    Route::prefix('media')->group(function () {
        Route::post('/upload', [MediaController::class, 'upload']);
        Route::delete('/{medium}', [MediaController::class, 'delete']);
    });

    // Portfolio
    Route::prefix('portfolio')->group(function () {
        Route::get('/', [PortfolioController::class, 'index']);
        Route::post('/', [PortfolioController::class, 'store']);
        Route::put('/{portfolioItem}', [PortfolioController::class, 'update']);
        Route::delete('/{portfolioItem}', [PortfolioController::class, 'destroy']);
    });

    // Public portfolio by user
    Route::get('/portfolio/user/{user}', [PortfolioController::class, 'showByUser']);

    // Shared routes (both creator & advertiser)
    Route::get('/creators', [CreatorController::class, 'discoverCreators']);
    Route::get('/creators/{user}', function (User $user) {
        if (! in_array($user->role, ['creator', 'advertiser'])) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $user->load(['creatorProfile', 'advertiserProfile', 'portfolioItems']);
        $user->completed_campaigns = CampaignApplication::where('creator_id', $user->id)
            ->where('status', 'completed')
            ->with('campaign')
            ->get();

        return $user;
    });

    // Messages
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::post('/', [MessageController::class, 'send']);
        Route::get('/conversation/{user}', [MessageController::class, 'conversation']);
        Route::put('/{message}/read', [MessageController::class, 'markAsRead']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::put('/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    });

    // Payments
    Route::prefix('payments')->group(function () {
        Route::post('/deposit', [PaymentController::class, 'deposit']);
        Route::post('/withdraw', [PaymentController::class, 'withdraw']);
        Route::get('/transactions', [PaymentController::class, 'transactions']);
        Route::post('/deposit-requests', [PaymentController::class, 'submitDepositRequest']);
        Route::get('/deposit-requests', [PaymentController::class, 'myDepositRequests']);
    });

    // Reviews
    Route::prefix('reviews')->group(function () {
        Route::post('/', [ReviewController::class, 'store']);
        Route::get('/campaign/{campaign}', [ReviewController::class, 'campaign']);
        Route::get('/user/{user}', [ReviewController::class, 'user']);
    });

    // KYC Documents
    Route::prefix('kyc')->group(function () {
        Route::post('/upload', [KycController::class, 'upload']);
        Route::get('/my-documents', [KycController::class, 'myDocuments']);
        Route::get('/documents/{document}', [KycController::class, 'serveFile']);
    });

    // Wallet
    Route::get('/wallet', function (Request $request) {
        return $request->user()->wallet;
    });

    // Loyalty system (creator only)
    Route::middleware('role:creator')->prefix('loyalty')->group(function () {
        Route::get('/me', [LoyaltyController::class, 'me']);
        Route::post('/daily-login', [LoyaltyController::class, 'dailyLogin']);
        Route::get('/transactions', [LoyaltyController::class, 'transactions']);
        Route::get('/rewards', [LoyaltyController::class, 'rewards']);
        Route::post('/redeem', [LoyaltyController::class, 'redeem']);
        Route::get('/redemptions', [LoyaltyController::class, 'redemptions']);
        Route::get('/streak', [LoyaltyController::class, 'streak']);
    });

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::get('/campaigns', [AdminController::class, 'campaigns']);
        Route::put('/campaigns/{campaign}/status', [AdminController::class, 'updateCampaignStatus']);
        Route::get('/payments', [AdminController::class, 'payments']);
        Route::post('/payments/{payment}/release', [AdminController::class, 'releasePayment']);
        Route::post('/payments/{payment}/refund', [AdminController::class, 'refundPayment']);
        Route::get('/logs', [AdminController::class, 'logs']);
        Route::get('/settlement-requests', [AdminController::class, 'settlementRequests']);
        Route::post('/settlement-requests/{settlementRequest}/process', [AdminController::class, 'processSettlement']);
        Route::get('/kyc/pending', [KycController::class, 'pendingUsers']);
        Route::get('/kyc/users', [KycController::class, 'allUsers']);
        Route::post('/kyc/{document}/review', [KycController::class, 'review']);
        Route::get('/deposit-requests', [AdminController::class, 'depositRequests']);
        Route::post('/deposit-requests/{depositRequest}/review', [AdminController::class, 'reviewDeposit']);
    });
});
