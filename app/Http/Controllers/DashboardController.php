<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Overtime;
use Spatie\Permission\Models\Role;
use App\Models\User;
use App\Http\Controllers\OvertimeController;

class DashboardController extends Controller
{
    public function index()
    {
        // Panggil fungsi update status lembur dari controller Overtime
        app(OvertimeController::class)->updateOvertimeStatuses();

        $overtimes = Overtime::all();
        $roles = Role::all();
        $users = User::with('roles')->get(); // ambil semua user beserta role-nya
    
        return view('pages.dashboard-v1', compact('overtimes', 'roles', 'users'));
    }        
}
