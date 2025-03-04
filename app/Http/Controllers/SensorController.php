<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sensor;

class SensorController extends Controller
{
    public function index()
    {
        $sensorData = Sensor::orderBy('id', 'desc')->first(); // Ambil data terbaru
        return response()->json($sensorData);
    }
}