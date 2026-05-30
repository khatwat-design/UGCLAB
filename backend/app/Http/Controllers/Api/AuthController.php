<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', 'in:creator,advertiser'],
            'phone' => ['required', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'category' => ['nullable', 'string', 'max:255'],
            'platforms' => ['nullable', 'array'],
            'platforms.*' => ['string'],
            'followers_count' => ['nullable', 'integer', 'min:0'],
            'engagement_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'portfolio_links' => ['nullable', 'array'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'company_website' => ['nullable', 'url'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:2'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
        ]);

        Wallet::create(['user_id' => $user->id]);

        if ($user->role === 'creator') {
            $user->creatorProfile()->create([
                'category' => $validated['category'] ?? null,
                'platforms' => $validated['platforms'] ?? [],
                'followers_count' => $validated['followers_count'] ?? 0,
                'engagement_rate' => $validated['engagement_rate'] ?? 0,
                'portfolio_links' => $validated['portfolio_links'] ?? [],
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'zip_code' => $validated['zip_code'] ?? null,
                'country' => $validated['country'] ?? 'IQ',
            ]);
        } else {
            $user->advertiserProfile()->create([
                'company_name' => $validated['company_name'] ?? $validated['name'].'\'s Company',
                'industry' => $validated['industry'] ?? null,
                'company_website' => $validated['company_website'] ?? null,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $cookie = cookie('token', $token, 60 * 24 * 7, '/', null, $request->secure(), true, false, 'Strict');

        return response()->json([
            'user' => $user->load(['creatorProfile', 'advertiserProfile', 'wallet', 'kycDocuments']),
            'token' => $token,
        ], 201)->withCookie($cookie);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Account is deactivated'], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $cookie = cookie('token', $token, 60 * 24 * 7, '/', null, $request->secure(), true, false, 'Strict');

        return response()->json([
            'user' => $user->load(['creatorProfile', 'advertiserProfile', 'wallet']),
            'token' => $token,
        ])->withCookie($cookie);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        $cookie = cookie('token', '', -1, '/', null, request()->secure(), true, false, 'Strict');

        return response()->json(['message' => 'Logged out successfully'])
            ->withCookie($cookie);
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->load(['creatorProfile', 'advertiserProfile', 'wallet', 'kycDocuments'])
        );
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['sometimes', 'string', 'max:20'],
            'bio' => ['sometimes', 'string', 'max:1000'],
            'avatar' => ['sometimes', 'string', 'max:2048'],
            'gender' => ['sometimes', 'string', 'in:male,female'],
            'date_of_birth' => ['sometimes', 'date', 'before:today'],
            'company_name' => ['sometimes', 'string', 'max:255'],
        ]);

        $user->update([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'phone' => $validated['phone'] ?? $user->phone,
            'bio' => $validated['bio'] ?? $user->bio,
            'gender' => $validated['gender'] ?? $user->gender,
            'date_of_birth' => $validated['date_of_birth'] ?? $user->date_of_birth,
        ]);

        // Update advertiser profile if applicable
        if ($user->isAdvertiser() && isset($validated['company_name'])) {
            $user->advertiserProfile()->updateOrCreate(
                ['user_id' => $user->id],
                ['company_name' => $validated['company_name']]
            );
        }

        return response()->json($user->fresh()->load(['creatorProfile', 'advertiserProfile', 'wallet']));
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function updateNotificationPreferences(Request $request)
    {
        $validated = $request->validate([
            'email_notifications' => ['boolean'],
            'new_application_alert' => ['boolean'],
            'message_alert' => ['boolean'],
            'campaign_completed_alert' => ['boolean'],
            'marketing_emails' => ['boolean'],
        ]);

        $user = $request->user();

        // Store preferences as JSON in user meta
        $user->notification_preferences = $validated;
        $user->save();

        return response()->json(['message' => 'Preferences updated', 'preferences' => $validated]);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'exists:users,email'],
        ]);

        // Generate a simple reset token (in production, send via email)
        $token = Str::random(60);

        // Store token in password_resets table (or cache)
        DB::table('password_reset_tokens')
            ->updateOrInsert(
                ['email' => $validated['email']],
                ['token' => Hash::make($token), 'created_at' => now()]
            );

        // In production, send this token via email
        // For now, return it directly (dev mode only)
        return response()->json([
            'message' => 'Password reset link sent to your email',
            'reset_token' => $token,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'exists:users,email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (! $record || ! Hash::check($validated['token'], $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset token'], 422);
        }

        // Token valid for 60 minutes
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            return response()->json(['message' => 'Reset token has expired'], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        $user->update(['password' => Hash::make($validated['password'])]);

        // Delete used token
        DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->delete();

        return response()->json(['message' => 'Password reset successfully']);
    }
}
