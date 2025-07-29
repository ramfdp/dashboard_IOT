<?php

namespace App\Http\Controllers;

use App\Models\Overtime;
use App\Models\HistoryKwh;
use App\Models\User;
use App\Models\LightSchedule;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Carbon\Carbon;
use Pusher\Pusher;

class OvertimeController extends Controller
{
    public function index()
    {
        $this->updateOvertimeStatuses();

        $overtimes = Overtime::orderBy('created_at', 'desc')
            ->orderBy('overtime_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        $dataKwh = HistoryKwh::latest()->take(10)->get();

        $relayStatus = $this->getRelayStatusFromFirebase();
        $relay1 = $relayStatus['relay1'] ?? 0;
        $relay2 = $relayStatus['relay2'] ?? 0;

        $users = User::with('roles')->get();
        $roles = Role::all();

        return view('pages.dashboard-v1', compact('overtimes', 'dataKwh', 'relay1', 'relay2', 'users', 'roles'));
    }

    public function create()
    {
        $overtimes = Overtime::orderBy('created_at', 'desc')->get();
        return view('overtime.create', compact('overtimes'));
    }

    public function cutoff(Request $request, $id)
    {
        try {
            $overtime = Overtime::findOrFail($id);

            if ($overtime->status !== 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lembur ini tidak sedang berjalan.',
                    'current_status' => $overtime->status
                ], 400);
            }

            if (empty($overtime->overtime_date) || empty($overtime->start_time)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tanggal atau waktu mulai lembur tidak tersedia.',
                ], 400);
            }

            // Deteksi jika start_time sudah berupa datetime
            $startTimeRaw = $overtime->start_time;
            if (strlen($startTimeRaw) > 8) {
                $startDateTime = Carbon::parse($startTimeRaw);
            } else {
                $startDateTime = Carbon::parse("{$overtime->overtime_date} {$startTimeRaw}");
            }

            $currentTime = Carbon::now('Asia/Jakarta');
            $duration = $startDateTime->diffInMinutes($currentTime);

            $overtime->update([
                'end_time' => $currentTime,
                'duration' => $duration,
                'status' => 2
            ]);

            // Immediately turn OFF relays when overtime is cut off
            try {
                Http::timeout(3)->put('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/relayControl.json', [
                    'relay1' => 0,
                    'relay2' => 0,
                    'manualMode' => false
                ]);

                Log::info("Overtime {$id} cut off - relays turned OFF automatically");
            } catch (\Exception $e) {
                Log::warning("Overtime {$id} cut off but failed to control relays: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Lembur berhasil dihentikan',
                'duration' => $duration,
                'end_time' => $currentTime->format('H:i'),
                'overtime' => $overtime->fresh()
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data lembur tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error("Cutoff error for overtime ID {$id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function autoStart(Request $request, $id)
    {
        try {
            $overtime = Overtime::findOrFail($id);

            if ($overtime->status !== 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lembur sudah dimulai atau selesai.',
                    'current_status' => $overtime->status
                ], 400);
            }

            // Check if current time is appropriate for starting
            $now = Carbon::now('Asia/Jakarta');
            $startTime = Carbon::parse("{$overtime->overtime_date} {$overtime->start_time}");

            if ($now->lt($startTime)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Belum waktunya memulai lembur.',
                ], 400);
            }

            // Start the overtime
            $overtime->update(['status' => 1]);

            Log::info("Overtime {$id} auto-started at " . $now->format('Y-m-d H:i:s'));

            return response()->json([
                'success' => true,
                'message' => 'Lembur dimulai secara otomatis',
                'overtime' => $overtime->fresh()
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data lembur tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error("Auto-start error for overtime ID {$id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function autoComplete(Request $request, $id)
    {
        try {
            $overtime = Overtime::findOrFail($id);

            if ($overtime->status === 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lembur sudah selesai.',
                    'current_status' => $overtime->status
                ], 400);
            }

            $now = Carbon::now('Asia/Jakarta');

            // Calculate duration if overtime was running
            $duration = null;
            if ($overtime->status === 1) {
                $startTimeRaw = $overtime->start_time;
                if (strlen($startTimeRaw) > 8) {
                    $startDateTime = Carbon::parse($startTimeRaw);
                } else {
                    $startDateTime = Carbon::parse("{$overtime->overtime_date} {$startTimeRaw}");
                }
                $duration = $startDateTime->diffInMinutes($now);
            }

            // Complete the overtime
            $updateData = [
                'status' => 2,
                'end_time' => $now->format('H:i:s')
            ];

            if ($duration !== null) {
                $updateData['duration'] = $duration;
            }

            $overtime->update($updateData);

            Log::info("Overtime {$id} auto-completed at " . $now->format('Y-m-d H:i:s'));

            return response()->json([
                'success' => true,
                'message' => 'Lembur diselesaikan secara otomatis',
                'duration' => $duration,
                'end_time' => $now->format('H:i:s'),
                'overtime' => $overtime->fresh()
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data lembur tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error("Auto-complete error for overtime ID {$id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_name' => 'required|string|max:100',
            'division_name' => 'required|string|max:100',
            'overtime_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $startTime = Carbon::createFromFormat('Y-m-d H:i', $request->overtime_date . ' ' . $request->start_time);
        $now = Carbon::now('Asia/Jakarta');

        $endTime = null;
        $duration = null;
        $status = 0;

        if (!empty($request->end_time)) {
            $endTime = Carbon::createFromFormat('Y-m-d H:i', $request->overtime_date . ' ' . $request->end_time);
            $duration = $startTime->copy()->diffInMinutes($endTime);

            if ($now->gte($endTime)) {
                $status = 2;
            } elseif ($now->gte($startTime)) {
                $status = 1;
            }
        } elseif ($now->gte($startTime)) {
            $status = 1;
        }

        Overtime::create([
            'employee_name' => $request->employee_name,
            'division_name' => $request->division_name,
            'overtime_date' => $request->overtime_date,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $duration,
            'status' => $status,
            'notes' => $request->notes,
        ]);

        $this->triggerPusher();
        return redirect()->route('overtime.index')->with('success_overtime', 'Lembur berhasil disimpan');
    }

    public function edit($id)
    {
        $overtime = Overtime::findOrFail($id);
        return response()->json(['success' => true, 'overtime' => $overtime]);
    }

    public function update(Request $request, $id)
    {
        $overtime = Overtime::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'employee_name' => 'required|string|max:255',
            'division_name' => 'required|string|max:255',
            'overtime_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $now = Carbon::now('Asia/Jakarta');
        $startTime = Carbon::createFromFormat('Y-m-d H:i', $request->overtime_date . ' ' . $request->start_time);
        $data['start_time'] = $startTime;

        if ($request->end_time) {
            $endTime = Carbon::createFromFormat('Y-m-d H:i', $request->overtime_date . ' ' . $request->end_time);
            $data['end_time'] = $endTime;
            $data['duration'] = $startTime->diffInMinutes($endTime);

            if ($now->gte($endTime)) {
                $data['status'] = 2;
            } elseif ($now->gte($startTime)) {
                $data['status'] = 1;
            } else {
                $data['status'] = 0;
            }
        } else {
            $data['end_time'] = null;
            $data['duration'] = null;

            if ($now->gte($startTime)) {
                $data['status'] = 1;
            } else {
                $data['status'] = 0;
            }
        }

        $data['employee_name'] = $request->employee_name;
        $data['division_name'] = $request->division_name;
        $data['overtime_date'] = $request->overtime_date;
        $data['notes'] = $request->notes;

        $overtime->update($data);
        $this->triggerPusher();

        return response()->json(['success' => true, 'message' => 'Data lembur berhasil diupdate']);
    }

    public function destroy($id)
    {
        $overtime = Overtime::findOrFail($id);
        $overtime->delete();

        $this->triggerPusher();
        return response()->json(['success' => true, 'message' => 'Data lembur berhasil dihapus']);
    }

    public function updateOvertimeStatuses()
    {
        $now = Carbon::now('Asia/Jakarta');
        $updated = false;

        $overtimes = Overtime::all();

        foreach ($overtimes as $overtime) {
            $startTime = Carbon::parse($overtime->start_time);
            $endTime = $overtime->end_time ? Carbon::parse($overtime->end_time) : null;

            $newStatus = $overtime->status;

            // Don't change status if overtime was manually cut off (status 2 with end_time set)
            if ($overtime->status === 2 && $endTime) {
                // Already cut off or finished - don't change status
                continue;
            }

            if ($endTime && $now->gte($endTime)) {
                $newStatus = 2;
            } elseif ($now->gte($startTime)) {
                $newStatus = 1;
            } else {
                $newStatus = 0;
            }

            if ($overtime->status != $newStatus) {
                $overtime->status = $newStatus;
                $overtime->save();
                $updated = true;
            }
        }

        if ($updated) {
            $this->triggerPusher();
        }
    }

    public function updateOvertimeStatusesAjax()
    {
        $this->updateOvertimeStatuses();
        $overtimes = Overtime::orderBy('created_at', 'desc')->get();
        $overtimeAvailable = $this->checkOvertimeAvailability();

        return response()->json([
            'overtimes' => $overtimes,
            'overtimeAvailable' => $overtimeAvailable
        ]);
    }

    /**
     * Check if overtime system is available based on light scheduler status
     * Overtime becomes available 1 minute after the last schedule ends
     */
    private function checkOvertimeAvailability()
    {
        $now = Carbon::now('Asia/Jakarta');
        $currentDay = strtolower($now->format('l')); // Get current day name
        $currentTime = $now->format('H:i:s');

        // Get all active schedules for today
        $todaySchedules = LightSchedule::where('is_active', true)
            ->where('day_of_week', $currentDay)
            ->get();

        if ($todaySchedules->isEmpty()) {
            // No schedules today - overtime is always available
            return true;
        }

        $latestEndTime = null;
        $hasActiveSchedule = false;

        foreach ($todaySchedules as $schedule) {
            // Handle overnight schedules (end_time < start_time)
            if ($schedule->end_time < $schedule->start_time) {
                $isActive = ($currentTime >= $schedule->start_time || $currentTime <= $schedule->end_time);
                if ($isActive) {
                    $hasActiveSchedule = true;
                    // For overnight schedules, use end_time as the latest
                    if (!$latestEndTime || $schedule->end_time > $latestEndTime) {
                        $latestEndTime = $schedule->end_time;
                    }
                }
            } else {
                // Normal schedule (same day)
                $isActive = ($currentTime >= $schedule->start_time && $currentTime <= $schedule->end_time);
                if ($isActive) {
                    $hasActiveSchedule = true;
                }
                // Track the latest end time for today
                if (!$latestEndTime || $schedule->end_time > $latestEndTime) {
                    $latestEndTime = $schedule->end_time;
                }
            }
        }

        if (!$hasActiveSchedule && $latestEndTime) {
            // Check if 1 minute has passed since the latest schedule ended
            $endTimeCarbon = Carbon::createFromFormat('H:i:s', $latestEndTime, 'Asia/Jakarta');
            $endTimeCarbon->setDate($now->year, $now->month, $now->day);
            $bufferTime = $endTimeCarbon->copy()->addMinute();

            return $now->gte($bufferTime);
        } else if ($hasActiveSchedule) {
            // Schedule is currently active - overtime not available
            return false;
        } else {
            // No active schedules and past buffer time
            return true;
        }
    }

    public function start(Request $request, $id)
    {
        try {
            $overtime = Overtime::findOrFail($id);

            if ($overtime->status !== 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lembur ini sudah dimulai atau selesai. Status saat ini: ' . $overtime->status
                ], 400);
            }

            $overtime->update(['status' => 1]);

            return response()->json([
                'success' => true,
                'message' => 'Lembur berhasil dimulai'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function statusCheck()
    {
        $this->updateOvertimeStatuses();

        $overtimes = Overtime::orderBy('created_at', 'desc')
            ->orderBy('overtime_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json(['success' => true, 'overtimes' => $overtimes]);
    }

    private function triggerPusher()
    {
        try {
            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                ['cluster' => config('broadcasting.connections.pusher.options.cluster')]
            );

            $pusher->trigger('overtime-channel', 'overtime-updated', ['message' => 'Timer updated']);
        } catch (\Exception $e) {
            Log::error('Pusher trigger failed: ' . $e->getMessage());
        }
    }

    private function getRelayStatusFromFirebase()
    {
        $firebaseUrl = 'https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/.json';

        try {
            $response = Http::get($firebaseUrl);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'relay1' => $data['relay1'] ?? 0,
                    'relay2' => $data['relay2'] ?? 0,
                ];
            }
        } catch (\Exception $e) {
            Log::error('Gagal ambil data Firebase: ' . $e->getMessage());
        }

        return [
            'relay1' => 0,
            'relay2' => 0,
        ];
    }
}
