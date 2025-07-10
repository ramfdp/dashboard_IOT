<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Overtime;
use App\Models\User;
use App\Models\Department;
use App\Models\Karyawan;
use App\Models\Divisi; 
use Spatie\Permission\Models\Role;
use App\Models\HistoryKwh; 
use App\Http\Controllers\OvertimeController;
use App\Services\FirebaseService;

class DashboardController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

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


        $dataKwh = HistoryKwh::select('waktu', 'daya')
            ->orderBy('waktu', 'asc')
            ->get();

        $relay1 = $this->firebase->getRelayState('relay1');
        $relay2 = $this->firebase->getRelayState('relay2');
        

        // Kirim semua data ke view
        return view('pages.dashboard-v1', compact(
            'overtimes',
            'roles',
            'users',
            'departments',
            'karyawans',
            'divisions',
            'dataKwh',
            'relay1',
            'relay2'
        ));
    }

    public function update(Request $request)
    {
        $relay1 = $request->input('relay1', 0); // always set
        $relay2 = $request->input('relay2', 0);
        $sos    = $request->input('sos', 0);

        $this->firebase->setRelayState('relay1', $relay1);
        $this->firebase->setRelayState('relay2', $relay2);
        $this->firebase->setRelayState('sos', $sos);

        return back()->with('success_device', 'Perangkat diperbarui.');
    }
}
