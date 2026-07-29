<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use OwenIt\Auditing\Models\Audit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index()
    {
        $audits = Audit::with('user')
            ->orderBy('created_at', 'desc')
            ->take(200)
            ->get();
            
        return Inertia::render('Admin/Audits/Index', [
            'audits' => $audits
        ]);
    }
}
