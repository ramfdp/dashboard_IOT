<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Overtime;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Pusher\Pusher;

class OvertimeControl extends Component
{
    use WithPagination;

    // Form properties
    public $division_name = '';
    public $employee_name = '';
    public $overtime_date;
    public $start_time = '';
    public $end_time = '';
    public $notes = '';

    // Modal properties
    public $showCutOffModal = false;
    public $selectedOvertimeId = null;
    public $cutoff_reason = '';

    // Edit properties
    public $editMode = false;
    public $editOvertimeId = null;

    protected $rules = [
        'division_name' => 'required|string|max:100',
        'employee_name' => 'required|string|max:100',
        'overtime_date' => 'required|date',
        'start_time' => 'required|date_format:H:i',
        'end_time' => 'nullable|date_format:H:i|after:start_time',
        'notes' => 'nullable|string|max:500',
    ];

    protected $messages = [
        'division_name.required' => 'Divisi harus diisi.',
        'employee_name.required' => 'Nama karyawan harus diisi.',
        'overtime_date.required' => 'Tanggal lembur harus diisi.',
        'start_time.required' => 'Waktu mulai harus diisi.',
        'end_time.after' => 'Waktu selesai harus setelah waktu mulai.',
    ];

    public function mount()
    {
        $this->overtime_date = date('Y-m-d');
        $this->updateOvertimeStatuses();
    }

    public function hydrate()
    {
        // This method runs on every request to refresh the component
        $this->updateOvertimeStatuses();
    }

    public function render()
    {
        $overtimes = Overtime::orderBy('created_at', 'desc')
            ->orderBy('overtime_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(10);

        return view('livewire.overtime-control', compact('overtimes'));
    }

    public function store()
    {
        $this->validate();

        $startTime = Carbon::createFromFormat('Y-m-d H:i', $this->overtime_date . ' ' . $this->start_time);
        $now = Carbon::now('Asia/Jakarta');

        $endTime = null;
        $duration = null;
        $status = 0;

        if (!empty($this->end_time)) {
            $endTime = Carbon::createFromFormat('Y-m-d H:i', $this->overtime_date . ' ' . $this->end_time);
            $duration = $startTime->copy()->diffInMinutes($endTime);

            if ($now->gte($endTime)) {
                $status = 2; // Selesai
            } elseif ($now->gte($startTime)) {
                $status = 1; // Sedang Berjalan
            } else {
                $status = 0; // Belum Mulai
            }
        } else {
            if ($now->gte($startTime)) {
                $status = 1; // Sedang Berjalan
            } else {
                $status = 0; // Belum Mulai
            }
        }

        if ($this->editMode) {
            $overtime = Overtime::findOrFail($this->editOvertimeId);
            $overtime->update([
                'employee_name' => $this->employee_name,
                'division_name' => $this->division_name,
                'overtime_date' => $this->overtime_date,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $duration,
                'status' => $status,
                'notes' => $this->notes,
            ]);

            session()->flash('success_overtime', 'Data lembur berhasil diupdate!');
            $this->cancelEdit();
        } else {
            Overtime::create([
                'employee_name' => $this->employee_name,
                'division_name' => $this->division_name,
                'overtime_date' => $this->overtime_date,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $duration,
                'status' => $status,
                'notes' => $this->notes,
            ]);

            session()->flash('success_overtime', 'Lembur berhasil disimpan!');
            $this->resetForm();
        }

        $this->triggerPusher();
    }

    public function editOvertime($id)
    {
        $overtime = Overtime::findOrFail($id);

        $this->editMode = true;
        $this->editOvertimeId = $id;
        $this->division_name = $overtime->division_name;
        $this->employee_name = $overtime->employee_name;
        $this->overtime_date = Carbon::parse($overtime->overtime_date)->format('Y-m-d');
        $this->start_time = Carbon::parse($overtime->start_time)->format('H:i');
        $this->end_time = $overtime->end_time ? Carbon::parse($overtime->end_time)->format('H:i') : '';
        $this->notes = $overtime->notes ?? '';
    }

    public function cancelEdit()
    {
        $this->editMode = false;
        $this->editOvertimeId = null;
        $this->resetForm();
    }

    public function deleteOvertime($id)
    {
        Overtime::findOrFail($id)->delete();
        session()->flash('success_overtime', 'Data lembur berhasil dihapus!');
        $this->triggerPusher();
    }

    public function startOvertime($id)
    {
        $overtime = Overtime::findOrFail($id);
        $overtime->update([
            'status' => 1,
            'start_time' => Carbon::now('Asia/Jakarta')
        ]);

        session()->flash('success_overtime', 'Lembur berhasil dimulai!');
        $this->triggerPusher();
    }

    public function cutOffOvertime($id)
    {
        $this->selectedOvertimeId = $id;
        $this->showCutOffModal = true;
    }

    public function confirmCutOff()
    {
        $overtime = Overtime::findOrFail($this->selectedOvertimeId);
        $now = Carbon::now('Asia/Jakarta');

        $startTime = Carbon::parse($overtime->start_time);
        $duration = $startTime->diffInMinutes($now);

        $overtime->update([
            'end_time' => $now,
            'duration' => $duration,
            'status' => 2,
            'notes' => $overtime->notes . "\n\nCut-off reason: " . $this->cutoff_reason
        ]);

        $this->showCutOffModal = false;
        $this->cutoff_reason = '';
        $this->selectedOvertimeId = null;

        session()->flash('success_overtime', 'Lembur berhasil dihentikan!');
        $this->triggerPusher();
    }

    public function closeCutOffModal()
    {
        $this->showCutOffModal = false;
        $this->cutoff_reason = '';
        $this->selectedOvertimeId = null;
    }

    public function updateLemburStatusDanRelay()
    {
        $this->updateOvertimeStatuses();
        session()->flash('success_overtime', 'Status lembur berhasil diperbarui!');
    }

    public function resetToAutoMode()
    {
        // Reset relay to auto mode logic
        try {
            Http::timeout(10)->put('https://iot-firebase-a83a5-default-rtdb.firebaseio.com/relay.json', [
                'auto_mode' => true,
                'manual_override' => false
            ]);

            session()->flash('success_overtime', 'Mode otomatis berhasil diaktifkan!');
        } catch (\Exception $e) {
            session()->flash('error_overtime', 'Gagal mengaktifkan mode otomatis: ' . $e->getMessage());
        }
    }

    private function resetForm()
    {
        $this->division_name = '';
        $this->employee_name = '';
        $this->overtime_date = date('Y-m-d');
        $this->start_time = '';
        $this->end_time = '';
        $this->notes = '';
    }

    private function updateOvertimeStatuses()
    {
        $now = Carbon::now('Asia/Jakarta');
        $updated = false;

        $overtimes = Overtime::all();

        foreach ($overtimes as $overtime) {
            $startTime = Carbon::parse($overtime->start_time);
            $endTime = $overtime->end_time ? Carbon::parse($overtime->end_time) : null;

            $newStatus = $overtime->status;

            if ($endTime && $now->gte($endTime)) {
                $newStatus = 2; // Selesai
            } elseif ($now->gte($startTime)) {
                $newStatus = 1; // Sedang Berjalan
            } else {
                $newStatus = 0; // Belum Mulai
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

    private function triggerPusher()
    {
        try {
            $pusher = new Pusher(
                env('PUSHER_APP_KEY'),
                env('PUSHER_APP_SECRET'),
                env('PUSHER_APP_ID'),
                [
                    'cluster' => env('PUSHER_APP_CLUSTER'),
                    'useTLS' => true,
                ]
            );

            $pusher->trigger('overtime-channel', 'overtime-updated', [
                'message' => 'Overtime data updated'
            ]);
        } catch (\Exception $e) {
            // Handle pusher error silently
        }
    }
}
