<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepositRequestResource;
use App\Models\DepositRequest;
use App\Models\Wallet;
use Illuminate\Http\Request;
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

    // Deposit requests (receipt upload flow)
    public function submitDepositRequest(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string', 'in:zain_cash,super_kay,fib'],
            'receipt_image' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $path = $request->file('receipt_image')->store('receipts', 'public');

        $depositRequest = DepositRequest::create([
            'user_id' => auth()->id(),
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'receipt_image' => $path,
            'status' => 'pending',
        ]);

        return response()->json(new DepositRequestResource($depositRequest), 201);
    }

    public function myDepositRequests()
    {
        return DepositRequestResource::collection(
            DepositRequest::where('user_id', auth()->id())
                ->latest()
                ->paginate(12)
        );
    }
}
