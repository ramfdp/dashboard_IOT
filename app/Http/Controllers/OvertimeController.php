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
        // Update status lembur secara otomatis berdasarkan waktu saat ini
        $this->updateOvertimeStatuses();
        
        $overtimes = Overtime::orderBy('created_at', 'desc')->get();
        return view('overtime.index', compact('overtimes'));
    }

    // Fungsi untuk memeriksa dan memperbarui status lembur
    public function updateOvertimeStatuses()
    {
        $now = Carbon::now('Asia/Jakarta');
        $updated = false;
        
        $overtimes = Overtime::all();
        
        foreach ($overtimes as $overtime) {
            $startTime = Carbon::parse($overtime->start_time);
            $endTime = $overtime->end_time ? Carbon::parse($overtime->end_time) : null;
            
            $newStatus = $overtime->status; // Default: status tidak berubah
            
            if ($endTime && $now->gte($endTime)) {
                // Jika waktu sekarang >= waktu selesai, status = Selesai (2)
                $newStatus = 2;
            } elseif ($now->gte($startTime)) {
                // Jika waktu sekarang >= waktu mulai, status = Dalam Proses (1)
                $newStatus = 1;
            } else {
                // Jika waktu sekarang < waktu mulai, status = Belum Dimulai (0)
                $newStatus = 0;
            }
            
            // Update hanya jika status berubah
            if ($overtime->status != $newStatus) {
                $overtime->status = $newStatus;
                $overtime->save();
                $updated = true;
            }
        }
        
        // Trigger Pusher hanya jika ada perubahan status
        if ($updated) {
            $this->triggerPusher();
        }

        \Log::info('Now: ' . $now);
        \Log::info('Start: ' . $startTime);
        \Log::info('End: ' . $endTime);
        \Log::info('Status: ' . $newStatus);

    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'employee_name' => 'required|string',
            'department' => 'required|string',
            'overtime_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string', 
            'end_time' => 'nullable|date_format:H:i'
        ]);

        // Siapkan data untuk start_time
        $startTime = Carbon::createFromFormat('Y-m-d H:i', $validatedData['overtime_date'] . ' ' . $validatedData['start_time']);
        
        // Periksa waktu sekarang
        $now = Carbon::now('Asia/Jakarta');

        
        // Siapkan data untuk end_time jika ada
        $endTime = null;
        $duration = null;
        
        // Tentukan status awal
        $status = 0; // Default: Belum Dimulai
        
        if ($now->gte($startTime)) {
            $status = 1; // Dalam Proses
        }
        
        if (!empty($request->end_time)) {
            $endTime = Carbon::createFromFormat('Y-m-d H:i', $validatedData['overtime_date'] . ' ' . $request->end_time);
            $duration = $startTime->copy()->diffInMinutes($endTime);
            
            // Jika waktu sekarang sudah melewati waktu selesai, set status Selesai
            if ($now->gte($endTime)) {
                $status = 2; // Selesai
            }
        }

        $overtime = Overtime::create([
            'employee_name' => $validatedData['employee_name'],
            'department' => $validatedData['department'],
            'overtime_date' => $validatedData['overtime_date'],
            'start_time' => $startTime,
            'notes' => $validatedData['notes'] ?? null,
            'status' => $status,
            'end_time' => $endTime,
            'duration' => $duration
        ]);

        $this->triggerPusher();
        return back()->with('success', 'Lembur berhasil disimpan');
    }

    public function destroy($id)
    {
        $overtime = Overtime::findOrFail($id);
        $overtime->delete();

        $this->triggerPusher();
        return back()->with('success', 'Data lembur berhasil dihapus');
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