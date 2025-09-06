<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\CheckLightSchedules::class,
        Commands\AssignAdminRole::class,
        Commands\AssignUserRole::class,
        Commands\EnsureDefaultSensor::class,
        Commands\CleanupSessions::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Check timer status every minute
        $schedule->command('timer:check')->everyMinute();

        // Check light schedules every 5 minutes to reduce conflicts
        $schedule->command('schedule:check')->everyFiveMinutes();

        // Clean up old session files every hour
        $schedule->command('session:cleanup')->hourly();
    }
    /**
     * Register the Closure based commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }
}
