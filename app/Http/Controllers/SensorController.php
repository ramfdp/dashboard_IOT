<?php

namespace App\Http\Controllers;

use App\Events\EventHandler;
use App\Models\Sensor;
use Illuminate\Http\Request;

class SensorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $message = [
            'temperature' => $request->temperature,
            'humidity' => $request->humidity,
            'datetime' => now()
        ];

        Sensor::create($message);
        EventHandler::dispatch($message);

        // Kirim response JSON
        return response()->json([
            'succes' => true,
            'message' => 'Data sensor berhasil disimpan dan dikirim ke WebSocket'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sensor $sensor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sensor $sensor)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sensor $sensor)
    {
        //
    }

    public function latest()
    {
        $sensor = Sensor::latest()->first(); // Ambil data terbaru

        if (!$sensor) {
            return response()->json([
                'success' => false,
                'message' => 'Data sensor tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'temperature' => $sensor->temperature,
            'humidity' => $sensor->humidity,
            'datetime' => $sensor->created_at
        ]);
    }

}
