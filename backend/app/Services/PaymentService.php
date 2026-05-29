<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Wallet;
use App\Enums\PaymentStatus;

class PaymentService
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function releasePayment(Payment $payment): Payment
    {
        if ($payment->status !== 'held') {
            throw new \Exception('Payment is not in held status');
        }

        $payment->update([
            'status' => 'released',
            'released_at' => now(),
        ]);

        $wallet = $payment->creator->wallet;
        if ($wallet) {
            $netAmount = $payment->amount - $payment->platform_fee;
            $wallet->increment('balance', $netAmount);
            $wallet->transactions()->create([
                'amount' => $netAmount,
                'type' => 'payment',
                'description' => "Payment for campaign #{$payment->campaign_id}",
                'reference_type' => 'payment',
                'reference_id' => $payment->id,
                'status' => 'completed',
            ]);
        }

        $this->notificationService->notifyPaymentReleased(
            $payment->creator,
            $payment->campaign,
            $payment->amount - $payment->platform_fee
        );

        return $payment->fresh();
    }

    public function refundPayment(Payment $payment): Payment
    {
        if ($payment->status !== 'held') {
            throw new \Exception('Payment is not in held status');
        }

        $payment->update(['status' => 'refunded']);

        $wallet = $payment->advertiser->wallet;
        if ($wallet) {
            $wallet->increment('balance', $payment->amount);
            $wallet->transactions()->create([
                'amount' => $payment->amount,
                'type' => 'refund',
                'description' => "Refund for campaign #{$payment->campaign_id}",
                'reference_type' => 'payment',
                'reference_id' => $payment->id,
                'status' => 'completed',
            ]);
        }

        return $payment->fresh();
    }

    public function calculateFee(float $amount): float
    {
        return $amount * 0.10;
    }
}
