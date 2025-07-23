<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Department;
use App\Models\Karyawan;
use App\Models\Divisi;
use App\Models\LightSchedule;
use Spatie\Permission\Models\Role;
use App\Models\HistoryKwh;
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

        // If no data exists, create empty collection with default structure
        if ($dataKwh->isEmpty()) {
            $dataKwh = collect([
                (object)['waktu' => date('H:i:s'), 'daya' => 0]
            ]);
        }

        // Get light schedules
        $lightSchedules = LightSchedule::orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        // Get relay states with default fallback values
        try {
            $relay1 = $this->firebase->getRelayState('relay1') ?? 0;
            $relay2 = $this->firebase->getRelayState('relay2') ?? 0;
            $sos = $this->firebase->getRelayState('sos') ?? 0;
        } catch (\Exception $e) {
            // If Firebase fails, set default values
            $relay1 = 0;
            $relay2 = 0;
            $sos = 0;
        }


        // Kirim semua data ke view
        return view('pages.dashboard-v1', compact(
            'roles',
            'users',
            'departments',
            'karyawans',
            'divisions',
            'dataKwh',
            'lightSchedules',
            'relay1',
            'relay2',
            'sos'
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

    // Light schedule methods
    public function storeSchedule(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'device_type' => 'required|in:relay1,relay2',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        LightSchedule::create($request->all());

        return back()->with('success_schedule', 'Jadwal lampu berhasil ditambahkan.');
    }

    public function updateSchedule(Request $request, LightSchedule $schedule)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'device_type' => 'required|in:relay1,relay2',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'boolean'
        ]);

        $schedule->update($request->all());

        return back()->with('success_schedule', 'Jadwal lampu berhasil diperbarui.');
    }

    public function destroySchedule(LightSchedule $schedule)
    {
        $schedule->delete();

        return back()->with('success_schedule', 'Jadwal lampu berhasil dihapus.');
    }

    public function toggleSchedule(LightSchedule $schedule)
    {
        $schedule->update(['is_active' => !$schedule->is_active]);

        return back()->with('success_schedule', 'Status jadwal berhasil diubah.');
    }
}
