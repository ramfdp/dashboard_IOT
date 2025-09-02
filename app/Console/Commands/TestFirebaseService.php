<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FirebaseService;

class TestFirebaseService extends Command
{
    protected $signature = 'test:firebase';
    protected $description = 'Test Firebase Service methods';

    public function handle()
    {
        $this->info('=== FIREBASE SERVICE TEST ===');
        
        try {
            $firebase = app(FirebaseService::class);
            
            $this->line('1. Testing getSensorData():');
            $sensorData = $firebase->getSensorData();
            
            $this->line("   Temperature: {$sensorData['temperature']}°C");
            $this->line("   Humidity: {$sensorData['humidity']}%");
            $this->line("   Voltage: {$sensorData['voltage']}V");
            $this->line("   Current: {$sensorData['current']}A");
            $this->line("   Power: {$sensorData['power']}W");
            
            $this->info('✅ getSensorData() method works!');
            
            $this->line("\n2. Testing getRelayState():");
            $relay1 = $firebase->getRelayState('relay1');
            $this->line("   Relay1 state: " . ($relay1 ? 'ON' : 'OFF'));
            $this->info('✅ getRelayState() method works!');
            
            $this->info("\n🎉 All Firebase Service methods working!");
            
        } catch (\Exception $e) {
            $this->error("❌ Firebase Service test failed:");
            $this->error($e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
