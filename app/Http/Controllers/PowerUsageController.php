<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class PowerUsageController extends Controller
{
    public function getPowerUsage()
    {
        // Contoh data yang diambil dari database (gantilah dengan model database yang sebenarnya)
        $data = [
            'CM2' => rand(40, 100),  // Simulasi data acak antara 40-100 kWh
            'CM1' => rand(50, 120),
            'CM3' => rand(60, 150),
            'Sport' => rand(70, 130),
            'timestamp' => Carbon::now()->toDateTimeString()
        ];

        return response()->json($data);
    }
}
