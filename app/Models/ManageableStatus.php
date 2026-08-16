<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManageableStatus extends Model
{
    protected $fillable = [
        'type',
        'name',
    ];
}
