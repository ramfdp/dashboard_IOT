<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sensor;

class EnsureDefaultSensor extends Command
{
    protected $signature = 'sensor:ensure-default';
    protected $description = 'Ensure default PZEM sensor exists';

    public function handle()
    {
        // Check if any sensor exists, since sensors table has limited columns
        $sensor = Sensor::find(1);

        if (!$sensor) {
            $sensor = Sensor::create([
                'temperature' => 25.0,
                'humidity' => 60.0
            ]);

            $this->info("Default sensor created with ID: {$sensor->id}");
        } else {
            $this->info("Default sensor already exists (ID: {$sensor->id})");
        }

        return 0;
    }
}
