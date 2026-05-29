<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Held = 'held';
    case Released = 'released';
    case Refunded = 'refunded';
    case Failed = 'failed';
}
