<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepositRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'receipt_image' => $this->receipt_image,
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'processed_at' => $this->processed_at,
            'created_at' => $this->created_at,
        ];
    }
}
