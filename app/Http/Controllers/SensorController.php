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

        EventHandler::dispatch($message);
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
}
