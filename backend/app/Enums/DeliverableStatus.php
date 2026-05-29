<?php

namespace App\Enums;

enum DeliverableStatus: string
{
    case Pending = 'pending';
    case Submitted = 'submitted';
    case Approved = 'approved';
    case RevisionRequested = 'revision_requested';
}
