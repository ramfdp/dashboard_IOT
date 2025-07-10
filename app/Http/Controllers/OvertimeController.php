<?php

namespace App\Http\Controllers;

use App\Models\Overtime;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Pusher\Pusher;

class OvertimeController extends Controller
{
    public function index()
    {
        $this->updateOvertimeStatuses();

        $overtimes = Overtime::orderBy('created_at', 'desc')->get();

        return view('overtime.index', compact('overtimes'));
    }

    public function create()
    {
        $overtimes = Overtime::orderBy('created_at', 'desc')->get();
        return view('overtime.create', compact('overtimes'));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'employee_name' => 'required|string|max:100',
            'division_name' => 'required|string|max:100',
            'overtime_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        $startTime = Carbon::createFromFormat('Y-m-d H:i', $validatedData['overtime_date'] . ' ' . $validatedData['start_time']);
        $now = Carbon::now('Asia/Jakarta');

        $endTime = null;
        $duration = null;
        $status = 0;

        if ($now->gte($startTime)) {
            $status = 1;
        }

        if (!empty($validatedData['end_time'])) {
            $endTime = Carbon::createFromFormat('Y-m-d H:i', $validatedData['overtime_date'] . ' ' . $validatedData['end_time']);
            $duration = $startTime->copy()->diffInMinutes($endTime);

            if ($now->gte($endTime)) {
                $status = 2;
            }
        }

        Overtime::create([
            'employee_name' => $validatedData['employee_name'],
            'division_name' => $validatedData['division_name'],
            'overtime_date' => $validatedData['overtime_date'],
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $duration,
            'status' => $status,
            'notes' => $validatedData['notes'] ?? null,
        ]);

        $this->triggerPusher();
        return back()->with('success_overtime', 'Lembur berhasil disimpan');
    }

    public function destroy($id)
    {
        $overtime = Overtime::findOrFail($id);
        $overtime->delete();

        $this->triggerPusher();
        return back()->with('success', 'Data lembur berhasil dihapus');
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

        \Log::info('Now: ' . $now);
    }

    public function updateOvertimeStatusesAjax()
    {
        $this->updateOvertimeStatuses();

        $overtimes = Overtime::orderBy('created_at', 'desc')->get();

        return response()->json([
            'overtimes' => $overtimes
        ]);
    }

    private function triggerPusher()
    {
        try {
            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                [
                    'cluster' => config('broadcasting.connections.pusher.options.cluster')
                ]
            );

            $pusher->trigger('overtime-channel', 'overtime-updated', ['message' => 'Timer updated']);
        } catch (\Exception $e) {
            \Log::error('Pusher trigger failed: ' . $e->getMessage());
        }
    }
}
