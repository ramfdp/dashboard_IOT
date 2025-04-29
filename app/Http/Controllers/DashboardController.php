<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Overtime;
use Spatie\Permission\Models\Role;
use App\Models\User;
use App\Models\Department;
use App\Http\Controllers\OvertimeController;

class DashboardController extends Controller
{
    public function index()
    {
        app(OvertimeController::class)->updateOvertimeStatuses();

        $overtimes = Overtime::all();
        $roles = Role::all();
        $users = User::with('roles')->get();
        $departments = Department::all();
    
        return view('pages.dashboard-v1', compact('overtimes', 'roles', 'users', 'departments'));
    }        
}