<?php

namespace App\Http\Controllers\Api;

use App\Models\Payment;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function deposit(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string', 'in:zain_cash,fib,qi_card,wallet'],
        ]);

        $wallet = auth()->user()->wallet;

        $wallet->transactions()->create([
            'amount' => $validated['amount'],
            'type' => 'deposit',
            'description' => "Deposit via {$validated['payment_method']}",
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Deposit initiated',
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
        ]);
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string', 'in:zain_cash,fib,qi_card,bank_transfer'],
            'account_details' => ['required', 'string', 'max:1000'],
        ]);

        $wallet = auth()->user()->wallet;

        return DB::transaction(function () use ($wallet, $validated) {
            // Re-fetch wallet with row lock to prevent race conditions
            $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();

            if ($lockedWallet->balance < $validated['amount']) {
                return response()->json(['message' => 'Insufficient balance'], 422);
            }

            $lockedWallet->decrement('balance', $validated['amount']);

            $lockedWallet->transactions()->create([
                'amount' => -$validated['amount'],
                'type' => 'withdrawal',
                'description' => "Withdrawal to {$validated['payment_method']}",
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Withdrawal initiated',
                'amount' => $validated['amount'],
            ]);
        });
    }

    public function transactions()
    {
        return auth()->user()->wallet->transactions()->latest()->paginate(20);
    }
}
