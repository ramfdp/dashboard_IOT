<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Overtime;
use App\Models\User;
use App\Models\Department;
use App\Models\Karyawan;
use App\Models\Divisi; // Tambahkan import Divisi
use Spatie\Permission\Models\Role;
use App\Models\HistoryKwh; // Import model HistoriKwh
use App\Http\Controllers\OvertimeController;

class DashboardController extends Controller
{
    public function index()
    {
        // Update status overtime
        app(OvertimeController::class)->updateOvertimeStatuses();

        // Ambil data overtime
        $overtimes = Overtime::all();

        // Ambil data roles
        $roles = Role::all();

        // Ambil data users beserta roles
        $users = User::with('roles')->get();

        // Ambil data departments
        $departments = Department::all();

        // Ambil data karyawan dengan relasi divisi
        $karyawans = Karyawan::with('divisi')->get();

        // Ambil data divisions
        $divisions = Divisi::all();

        // Ambil data histori Kwh untuk grafik
        $dataKwh = HistoryKwh::select('waktu', 'daya')
                             ->orderBy('waktu', 'asc')
                             ->get();

        // Kirim semua data ke view
        return view('pages.dashboard-v1', compact(
            'overtimes', 
            'roles', 
            'users', 
            'departments', 
            'karyawans',
            'divisions', 
            'dataKwh'  // Kirim data Kwh ke view
        ));
    }
}
