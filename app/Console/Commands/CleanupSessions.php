<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CleanupSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'session:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old session files';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $sessionPath = storage_path('framework/sessions');

        if (!File::exists($sessionPath)) {
            $this->info('Session directory does not exist.');
            return 0;
        }

        $files = File::files($sessionPath);
        $deletedCount = 0;

        foreach ($files as $file) {
            // Delete files older than 2 hours (7200 seconds)
            if (time() - $file->getCTime() > 7200) {
                File::delete($file);
                $deletedCount++;
            }
        }

        $this->info("Cleaned up {$deletedCount} old session files.");

        return 0;
    }
}
