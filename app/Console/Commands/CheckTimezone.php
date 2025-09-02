<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\HistoryKwh;
use Carbon\Carbon;

class CheckTimezone extends Command
{
    protected $signature = 'check:timezone';
    protected $description = 'Check current timezone and latest records';

    public function handle()
    {
        $this->info('=== TIMEZONE CHECK ===');
        
        // Current timezone
        $now = Carbon::now('Asia/Jakarta');
        $this->line("Current Indonesia time: {$now->format('Y-m-d H:i:s')} (WIB)");
        $this->line("Current UTC time: " . Carbon::now('UTC')->format('Y-m-d H:i:s') . " (UTC)");
        
        // Latest records
        $this->info("\n=== LATEST RECORDS ===");
        $latest = HistoryKwh::latest('waktu')->take(3)->get();
        
        if ($latest->count() > 0) {
            foreach ($latest as $record) {
                $waktu = Carbon::parse($record->waktu, 'Asia/Jakarta');
                $this->line("ID: {$record->id}");
                $this->line("  Waktu: {$record->waktu}");
                $this->line("  Formatted: {$waktu->format('Y-m-d H:i:s')} WIB");
                $this->line("  Daya: {$record->daya} W");
                $this->line("---");
            }
        } else {
            $this->warn("No records found in HistoryKwh table");
        }
        
        return 0;
    }
}
