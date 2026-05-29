<?php

namespace App\Enums;

enum CampaignStatus: string
{
    case Draft = 'draft';
    case Open = 'open';
    case InReview = 'in_review';
    case Active = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
