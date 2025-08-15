<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Overtime;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PopulateOvertimeEmployeeIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'populate:overtime-employee-ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate employee_id field in overtime records based on employee_name';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to populate employee_id in overtime records...');

        // Get all overtimes with null employee_id
        $overtimes = Overtime::whereNull('employee_id')->get();

        if ($overtimes->isEmpty()) {
            $this->info('No overtime records need employee_id population.');
            return 0;
        }

        $updated = 0;
        $notFound = 0;

        foreach ($overtimes as $overtime) {
            // Try to find user by name
            $user = User::where('name', $overtime->employee_name)->first();

            if ($user) {
                $overtime->employee_id = $user->id;
                $overtime->save();
                $updated++;
                $this->line("✓ Updated overtime ID {$overtime->id}: {$overtime->employee_name} → User ID {$user->id}");
            } else {
                $notFound++;
                $this->warn("✗ No user found for employee name: {$overtime->employee_name} (Overtime ID: {$overtime->id})");
            }
        }

        $this->info("Population complete!");
        $this->info("Updated: {$updated} records");
        $this->info("Not found: {$notFound} records");

        return 0;
    }
}
