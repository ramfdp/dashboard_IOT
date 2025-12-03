<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyController extends Controller
{
    /**
     * Proxy untuk fetch data dari API eksternal (bypass CORS)
     */
    public function getRamaJson()
    {
        try {
            $response = Http::timeout(30)->get('http://115.85.65.125:8084/iot/data.json');

            if ($response->successful()) {
                return response()->json($response->json())
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET')
                    ->header('Access-Control-Allow-Headers', 'Content-Type');
            }

            return response()->json([
                'error' => 'Failed to fetch data',
                'status' => $response->status()
            ], $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Connection failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
