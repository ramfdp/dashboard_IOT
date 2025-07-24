<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\DashboardController;
use App\Services\FirebaseService;

class CheckLightSchedules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and execute light schedules based on current time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking light schedules...');

        try {
            // Create DashboardController instance with FirebaseService
            $firebaseService = app(FirebaseService::class);
            $controller = new DashboardController($firebaseService);

            // Call the checkSchedules method
            $response = $controller->checkSchedules();

            if ($response && $response->getData()->success) {
                $data = $response->getData();
                $this->info('Schedule check completed successfully');
                $this->info('Active devices: ' . implode(', ', $data->active_devices ?: ['none']));
                $this->info('Inactive devices: ' . implode(', ', $data->inactive_devices ?: ['none']));
            } else {
                $this->error('Schedule check failed');
            }
        } catch (\Exception $e) {
            $this->error('Error checking schedules: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
