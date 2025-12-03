<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyController extends Controller
{
    /**
     * Proxy untuk fetch data dari API eksternal (bypass CORS)
     * HANYA DARI: http://115.85.65.125:8084/iot/data.json
     */
    public function getIotData()
    {
        try {
            // HARD-CODED: Hanya ambil dari API data.json ini saja
            $apiUrl = 'http://115.85.65.125:8084/iot/data.json';
            \Log::info('[ProxyController] Fetching from IOT API: ' . $apiUrl);

            $response = Http::timeout(30)->get($apiUrl);

            if ($response->successful()) {
                $data = $response->json();
                \Log::info('[ProxyController] Successfully fetched ' . (isset($data['data']) ? count($data['data']) : 0) . ' records');

                return response()->json($data)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET')
                    ->header('Access-Control-Allow-Headers', 'Content-Type');
            }

            \Log::error('[ProxyController] Failed with status: ' . $response->status());
            return response()->json([
                'error' => 'Failed to fetch data',
                'status' => $response->status()
            ], $response->status());
        } catch (\Exception $e) {
            \Log::error('[ProxyController] Exception: ' . $e->getMessage());
            return response()->json([
                'error' => 'Connection failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
