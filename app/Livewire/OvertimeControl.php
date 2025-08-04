<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Overtime;
use App\Models\LightSchedule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
    public $light_selection = '';

    // Modal properties
    public $showCutOffModal = false;
    public $selectedOvertimeId = null;
    public $cutoff_reason = '';

    // Edit properties
    public $editMode = false;
    public $editOvertimeId = null;

    // System availability
    public $overtimeAvailable = true;
    public $scheduleEndTime = null;
    public $minutesUntilAvailable = 0;

    protected $rules = [
        'division_name' => 'required|string|max:100',
        'employee_name' => 'required|string|max:100',
        'overtime_date' => 'required|date',
        'start_time' => 'required|date_format:H:i',
        'end_time' => 'nullable|date_format:H:i|after:start_time',
        'notes' => 'nullable|string|max:500',
        'light_selection' => 'required|in:relay1,relay2,relay3,relay4,relay5,relay6,relay7,relay8,all',
    ];

    public function updatedLightSelection($value)
    {
        // Debug: Track when light_selection changes
        file_put_contents(
            storage_path('logs/debug_overtime.log'),
            date('Y-m-d H:i:s') . " - LIVEWIRE UPDATED: light_selection changed to '{$value}'\n",
            FILE_APPEND | LOCK_EX
        );
    }

    protected $messages = [
        'division_name.required' => 'Divisi harus diisi.',
        'employee_name.required' => 'Nama karyawan harus diisi.',
        'overtime_date.required' => 'Tanggal lembur harus diisi.',
        'start_time.required' => 'Waktu mulai harus diisi.',
        'end_time.after' => 'Waktu selesai harus setelah waktu mulai.',
        'light_selection.required' => 'Pilihan lampu harus dipilih.',
        'light_selection.in' => 'Pilihan lampu tidak valid.',
    ];

    public function mount()
    {
        $this->overtime_date = date('Y-m-d');
        $this->updateOvertimeStatuses();
        $this->checkOvertimeAvailability();
    }

    public function hydrate()
    {
        // Temporarily disable automatic status updates on every hydration
        // This was causing light_selection to be overridden
        // $this->updateOvertimeStatuses();
        $this->checkOvertimeAvailability();
    }

    public function render()
    {
        $overtimes = Overtime::orderBy('created_at', 'desc')
            ->orderBy('overtime_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(10);

        return view('livewire.overtime-control', compact('overtimes'));
    }

    /**
     * Check if overtime system is available based on light scheduler status
     * Overtime becomes available 1 minute after the last schedule ends
     */
    public function checkOvertimeAvailability()
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
            $this->overtimeAvailable = true;
            $this->scheduleEndTime = null;
            $this->minutesUntilAvailable = 0;
            return;
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

            if ($now->gte($bufferTime)) {
                $this->overtimeAvailable = true;
                $this->scheduleEndTime = null;
                $this->minutesUntilAvailable = 0;
            } else {
                $this->overtimeAvailable = false;
                $this->scheduleEndTime = $endTimeCarbon->format('H:i');
                $this->minutesUntilAvailable = $now->diffInMinutes($bufferTime);
            }
        } else if ($hasActiveSchedule) {
            // Schedule is currently active - overtime not available
            $this->overtimeAvailable = false;
            $this->scheduleEndTime = $latestEndTime;
            $this->minutesUntilAvailable = null; // Will be calculated when schedule ends
        } else {
            // No active schedules and past buffer time
            $this->overtimeAvailable = true;
            $this->scheduleEndTime = null;
            $this->minutesUntilAvailable = 0;
        }
    }

    public function store()
    {
        // CRITICAL DEBUG: Log form submission
        file_put_contents(
            storage_path('logs/debug_overtime.log'),
            date('Y-m-d H:i:s') . " - STORE METHOD CALLED: light_selection='{$this->light_selection}'\n",
            FILE_APPEND | LOCK_EX
        );

        // Add a session flash to confirm the method is called
        session()->flash('debug_message', 'Store method called with light_selection: ' . $this->light_selection);

        // Check if overtime system is available
        if (!$this->overtimeAvailable) {
            $message = 'Sistem lembur tidak tersedia. ';
            if ($this->scheduleEndTime) {
                $message .= "Scheduler lampu aktif hingga {$this->scheduleEndTime}. ";
                if ($this->minutesUntilAvailable > 0) {
                    $message .= "Sistem lembur akan tersedia dalam {$this->minutesUntilAvailable} menit setelah scheduler selesai.";
                }
            }
            session()->flash('error_overtime', $message);
            return;
        }

        $this->validate();

        // Add debugging to track the light_selection value
        Log::info('OvertimeControl store method - after validation', [
            'light_selection' => $this->light_selection,
            'form_data' => [
                'employee_name' => $this->employee_name,
                'division_name' => $this->division_name,
                'overtime_date' => $this->overtime_date,
                'start_time' => $this->start_time,
                'end_time' => $this->end_time,
                'notes' => $this->notes
            ]
        ]);

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
                'light_selection' => $this->light_selection,
            ]);

            session()->flash('success_overtime', 'Data lembur berhasil diupdate!');
            $this->cancelEdit();
        } else {
            // Debug: Log before creating overtime record
            Log::info('Creating new overtime record', [
                'light_selection_before_create' => $this->light_selection,
                'all_form_data' => [
                    'employee_name' => $this->employee_name,
                    'division_name' => $this->division_name,
                    'overtime_date' => $this->overtime_date,
                    'start_time' => $this->start_time,
                    'end_time' => $this->end_time,
                    'notes' => $this->notes,
                    'light_selection' => $this->light_selection
                ]
            ]);

            // Ensure light_selection is not empty or null
            $lightSelection = $this->light_selection;
            if (empty($lightSelection)) {
                $lightSelection = 'all'; // Fallback if empty
                Log::warning('Light selection was empty, using fallback value: all');
            }

            $createdOvertime = Overtime::create([
                'employee_name' => $this->employee_name,
                'division_name' => $this->division_name,
                'overtime_date' => $this->overtime_date,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $duration,
                'status' => $status,
                'notes' => $this->notes,
                'light_selection' => $lightSelection,
            ]);

            // CRITICAL DEBUG: Force write to debug log file
            file_put_contents(
                storage_path('logs/debug_overtime.log'),
                date('Y-m-d H:i:s') . " - CREATED: ID={$createdOvertime->id}, light_selection_before={$lightSelection}, light_selection_after={$createdOvertime->light_selection}\n",
                FILE_APPEND | LOCK_EX
            );

            // Debug: Log after creating overtime record and immediately fetch to verify
            $freshRecord = Overtime::find($createdOvertime->id);
            Log::info('Overtime record created and verified', [
                'created_id' => $createdOvertime->id,
                'light_selection_after_create' => $createdOvertime->light_selection,
                'light_selection_fresh_fetch' => $freshRecord->light_selection,
                'original_light_selection' => $this->light_selection,
                'used_light_selection' => $lightSelection
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
        $this->light_selection = $overtime->light_selection ?? 'all';
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
        // Check if overtime system is available
        if (!$this->overtimeAvailable) {
            $message = 'Tidak dapat memulai lembur. Sistem scheduler lampu masih aktif.';
            if ($this->scheduleEndTime) {
                $message .= " Tunggu hingga {$this->scheduleEndTime} + 1 menit.";
            }
            session()->flash('error_overtime', $message);
            return;
        }

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

        // Smart relay control based on remaining active overtimes
        try {
            $this->updateRelayStatesBasedOnActiveOvertimes($this->selectedOvertimeId);
            session()->flash('success_overtime', 'Lembur berhasil dihentikan! Lampu diatur otomatis berdasarkan lembur aktif lainnya.');
        } catch (\Exception $e) {
            session()->flash('success_overtime', 'Lembur berhasil dihentikan! (Relay mungkin perlu dimatikan manual)');
        }

        $this->showCutOffModal = false;
        $this->cutoff_reason = '';
        $this->selectedOvertimeId = null;

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
        // Reset relay to auto mode logic with faster timeout
        try {
            Http::timeout(3)->put('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/relayControl.json', [
                'relay1' => 0,
                'relay2' => 0,
                'manualMode' => false
            ]);

            session()->flash('success_overtime', 'Mode otomatis berhasil diaktifkan! Sistem lembur siap digunakan.');
        } catch (\Exception $e) {
            session()->flash('error_overtime', 'Gagal mengaktifkan mode otomatis: ' . $e->getMessage());
        }
    }

    private function updateRelayStatesBasedOnActiveOvertimes($excludeOvertimeId = null)
    {
        // Get all active overtimes excluding the one being cut off
        $now = Carbon::now('Asia/Jakarta');
        $activeOvertimes = Overtime::where('status', 1)
            ->when($excludeOvertimeId, function ($query, $excludeId) {
                return $query->where('id', '!=', $excludeId);
            })
            ->get()
            ->filter(function ($overtime) use ($now) {
                // Check if overtime should still be active based on time
                $startTime = Carbon::parse($overtime->start_time);
                $endTime = $overtime->end_time ? Carbon::parse($overtime->end_time) : null;

                return $now->gte($startTime) && (!$endTime || $now->lt($endTime));
            });

        // Initialize all relay states to false
        $relayStates = [
            'relay1' => false,
            'relay2' => false,
            'relay3' => false,
            'relay4' => false,
            'relay5' => false,
            'relay6' => false,
            'relay7' => false,
            'relay8' => false,
        ];

        // Determine which relays should be ON based on active overtimes' light selections
        foreach ($activeOvertimes as $overtime) {
            $lightSelection = $overtime->light_selection ?? 'all';

            // Handle legacy ITMS selections for backward compatibility
            if ($lightSelection === 'itms1') {
                $relayStates['relay1'] = true;
            } elseif ($lightSelection === 'itms2') {
                $relayStates['relay2'] = true;
            } elseif ($lightSelection === 'all') {
                // Turn on all relays when "all" is selected
                foreach ($relayStates as $relay => $state) {
                    $relayStates[$relay] = true;
                }
            } elseif (in_array($lightSelection, ['relay1', 'relay2', 'relay3', 'relay4', 'relay5', 'relay6', 'relay7', 'relay8'])) {
                // Handle individual relay selections
                $relayStates[$lightSelection] = true;
            }
        }

        // Prepare Firebase update data
        $firebaseData = ['manualMode' => false];
        foreach ($relayStates as $relay => $shouldBeOn) {
            $firebaseData[$relay] = $shouldBeOn ? 1 : 0;
        }

        // Update Firebase with the calculated relay states
        Http::timeout(3)->put('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/relayControl.json', $firebaseData);

        $activeRelays = array_keys(array_filter($relayStates));
        Log::info("Smart relay control updated: Active relays: " . implode(', ', $activeRelays) . ", Active overtimes: {$activeOvertimes->count()}");
    }

    private function resetForm()
    {
        $this->division_name = '';
        $this->employee_name = '';
        $this->overtime_date = date('Y-m-d');
        $this->start_time = '';
        $this->end_time = '';
        $this->notes = '';
        $this->light_selection = '';
    }

    private function updateOvertimeStatuses()
    {
        $now = Carbon::now('Asia/Jakarta');
        $updated = false;

        $overtimes = Overtime::all();

        foreach ($overtimes as $overtime) {
            $startTime = Carbon::parse($overtime->overtime_date)->setTimeFromTimeString($overtime->start_time);
            $endTime = $overtime->end_time ? Carbon::parse($overtime->overtime_date)->setTimeFromTimeString($overtime->end_time) : null;

            $newStatus = $overtime->status;

            // Don't change status if overtime was manually cut off (status 2 with end_time set)
            // We can detect manual cutoff if end_time exists and current time is still before original end_time
            if ($overtime->status === 2 && $endTime) {
                // Already cut off or finished - don't change status
                continue;
            }

            if ($endTime && $now->gte($endTime)) {
                $newStatus = 2; // Selesai (naturally finished)
            } elseif ($now->gte($startTime)) {
                $newStatus = 1; // Sedang Berjalan
            } else {
                $newStatus = 0; // Belum Mulai
            }

            if ($overtime->status != $newStatus) {
                // Only update the status field, not the entire model
                // This prevents the light_selection from being overridden by model mutators
                Overtime::where('id', $overtime->id)->update(['status' => $newStatus]);
                $updated = true;
                Log::info("Livewire: Overtime {$overtime->id} status changed from {$overtime->status} to {$newStatus}", [
                    'light_selection_preserved' => $overtime->light_selection
                ]);
            }
        }

        if ($updated) {
            $this->triggerPusher();
        }
    }

    /**
     * Check for automatic overtime status changes and refresh if needed
     * This method will be called periodically to ensure backend stays in sync
     */
    public function checkForAutomaticStatusChanges()
    {
        $now = Carbon::now('Asia/Jakarta');
        $hasChanges = false;

        // Get all running overtimes that might need auto-completion
        $runningOvertimes = Overtime::where('status', 1)->get();

        foreach ($runningOvertimes as $overtime) {
            if ($overtime->end_time) {
                $endTime = Carbon::parse($overtime->overtime_date)->setTimeFromTimeString($overtime->end_time);
                // If overtime end time has passed, it should be completed
                if ($now->gte($endTime)) {
                    Log::info("Backend auto-completing overtime {$overtime->id} - end time reached");
                    // Only update status, end_time, and duration
                    Overtime::where('id', $overtime->id)->update([
                        'status' => 2,
                        'end_time' => $endTime->format('H:i:s'),
                        'duration' => Carbon::parse($overtime->overtime_date)->setTimeFromTimeString($overtime->start_time)->diffInMinutes($endTime)
                    ]);
                    $hasChanges = true;
                }
            }
        }        // Get all pending overtimes that might need auto-start
        $pendingOvertimes = Overtime::where('status', 0)->get();

        foreach ($pendingOvertimes as $overtime) {
            $startTime = Carbon::parse($overtime->overtime_date)->setTimeFromTimeString($overtime->start_time);

            // If start time has passed and it's still today, auto-start it
            if ($now->gte($startTime) && $now->isSameDay($startTime)) {
                $endTime = $overtime->end_time ? Carbon::parse($overtime->overtime_date)->setTimeFromTimeString($overtime->end_time) : null;
                // Only auto-start if we haven't passed the end time (if it exists)
                if (!$endTime || $now->lt($endTime)) {
                    Log::info("Backend auto-starting overtime {$overtime->id} - start time reached");
                    Overtime::where('id', $overtime->id)->update(['status' => 1]);
                    $hasChanges = true;
                } else {
                    // If both start and end time have passed, mark as completed
                    Log::info("Backend auto-completing overtime {$overtime->id} - period has passed");
                    Overtime::where('id', $overtime->id)->update([
                        'status' => 2,
                        'end_time' => $endTime->format('H:i:s'),
                        'duration' => Carbon::parse($overtime->overtime_date)->setTimeFromTimeString($overtime->start_time)->diffInMinutes($endTime)
                    ]);
                    $hasChanges = true;
                }
            }
        }        // If there were status changes, update relay states and refresh the view
        if ($hasChanges) {
            Log::info("Backend detected automatic status changes - updating relay states and refreshing view");

            // Update relay states based on current active overtimes
            $this->updateRelayStatesBasedOnActiveOvertimes();

            // Force refresh the component to show updated data
            $this->dispatch('$refresh');

            // Also trigger pusher to notify other users
            $this->triggerPusher();

            return true;
        }

        return false;
    }

    /**
     * Manually trigger status check and refresh
     * Can be called from frontend when needed
     */
    public function forceStatusCheck()
    {
        $changed = $this->checkForAutomaticStatusChanges();

        if ($changed) {
            session()->flash('success_overtime', 'Status lembur berhasil diperbarui secara otomatis!');
        }

        // Always refresh the status check
        $this->updateLemburStatusDanRelay();
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
