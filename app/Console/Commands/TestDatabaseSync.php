<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\HistoryKwh;
use App\Models\Listrik;
use Carbon\Carbon;

class TestDatabaseSync extends Command
{
    protected $signature = 'test:db-sync';
    protected $description = 'Test database sync for auto-generated PZEM data';

    public function handle()
    {
        $this->info('Testing database sync...');
        
        try {
            // Test data
            $data = [
                'tegangan' => 230.5,
                'arus' => 8.2,
                'daya' => 1890.5,
                'energi' => 45.8,
                'frekuensi' => 50.0,
                'power_factor' => 0.85,
                'lokasi' => 'PT Krakatau Sarana Property',
                'timestamp' => '2025-09-02T10:15:00.000Z'
            ];

            // Test Listrik table
            $this->line('1. Testing Listrik table...');
            $listrik = Listrik::create([
                'tegangan' => $data['tegangan'],
                'arus' => $data['arus'],
                'daya' => $data['daya'],
                'energi' => $data['energi'],
                'frekuensi' => $data['frekuensi'],
                'power_factor' => $data['power_factor'],
                'lokasi' => $data['lokasi'],
                'status' => 'active',
                'source' => 'test_command',
                'metadata' => json_encode(['test' => true])
            ]);
            $this->info("✅ Listrik record created with ID: {$listrik->id}");

            // Test HistoryKwh table  
            $this->line('2. Testing HistoryKwh table...');
            $historyKwh = HistoryKwh::create([
                'daya' => $data['daya'],
                'tegangan' => $data['tegangan'],
                'arus' => $data['arus'],
                'energi' => $data['energi'],
                'power_factor' => $data['power_factor'],
                'frekuensi' => $data['frekuensi'],
                'tanggal_input' => now()->toDateString(),
                'waktu' => Carbon::parse($data['timestamp']),
            ]);
            $this->info("✅ HistoryKwh record created with ID: {$historyKwh->id}");

            $this->info("\n🎉 Database sync test completed successfully!");
            $this->line("Listrik ID: {$listrik->id}, HistoryKwh ID: {$historyKwh->id}");
            
        } catch (\Exception $e) {
            $this->error("❌ Database sync test failed:");
            $this->error($e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
