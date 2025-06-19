<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class PowerUsageController extends Controller
{
    public function getPowerUsage()
    { 
        $data = [
            'CM2' => rand(40, 100), 
            'CM1' => rand(50, 120),
            'CM3' => rand(60, 150),
            'Sport' => rand(70, 130),
            'timestamp' => Carbon::now()->toDateTimeString()
        ];

        return response()->json($data);
    }
}
