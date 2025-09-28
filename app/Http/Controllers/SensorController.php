<?php

namespace App\Http\Controllers;

use App\Events\EventHandler;
use App\Models\Listrik;
use Illuminate\Http\Request;

class SensorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $listriks = Listrik::latest()->take(100)->get();

            return response()->json([
                'success' => true,
                'data' => $listriks,
                'count' => $listriks->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving sensor data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $data = [
                'lokasi' => $request->lokasi ?? 'PT Krakatau Sarana Property',
                'tegangan' => $request->tegangan ?? $request->voltage ?? 220,
                'arus' => $request->arus ?? $request->current ?? 0,
                'daya' => $request->daya ?? $request->power ?? 0,
                'energi' => $request->energi ?? $request->energy ?? 0,
                'frekuensi' => $request->frekuensi ?? $request->frequency ?? 50,
                'power_factor' => $request->power_factor ?? $request->pf ?? 0.85,
                'status' => 'active',
                'metadata' => json_encode([
                    'sensor_type' => 'PZEM-004T',
                    'source' => $request->source ?? 'api_sensor'
                ])
            ];

            $listrik = Listrik::create($data);

            // Event handling with new field names
            $message = [
                'tegangan' => $listrik->tegangan,
                'arus' => $listrik->arus,
                'daya' => $listrik->daya,
                'energi' => $listrik->energi,
                'frekuensi' => $listrik->frekuensi,
                'power_factor' => $listrik->power_factor,
                'lokasi' => $listrik->lokasi,
                'timestamp' => $listrik->created_at,
            ];

            EventHandler::dispatch($message);

            return response()->json([
                'success' => true,
                'message' => 'Data listrik berhasil disimpan',
                'data' => $listrik
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error storing sensor data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $listrik = Listrik::find($id);

            if (!$listrik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data listrik tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $listrik
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving listrik data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $listrik = Listrik::find($id);

            if (!$listrik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data listrik tidak ditemukan'
                ], 404);
            }

            $updateData = [
                'voltage' => $request->voltage ?? $listrik->voltage,
                'current' => $request->current ?? $listrik->current,
                'power' => $request->power ?? $listrik->power,
                'energy' => $request->energy ?? $listrik->energy,
                'frequency' => $request->frequency ?? $listrik->frequency,
                'pf' => $request->pf ?? $listrik->pf,
                'lokasi' => $request->lokasi ?? $listrik->lokasi,
            ];

            $listrik->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Data listrik berhasil diupdate',
                'data' => $listrik
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating listrik data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $listrik = Listrik::find($id);

            if (!$listrik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data listrik tidak ditemukan'
                ], 404);
            }

            $listrik->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data listrik berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting listrik data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function latest()
    {
        try {
            $listrik = Listrik::latest()->first();

            if (!$listrik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data listrik tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'tegangan' => $listrik->tegangan,
                'arus' => $listrik->arus,
                'daya' => $listrik->daya,
                'energi' => $listrik->energi,
                'frekuensi' => $listrik->frekuensi,
                'power_factor' => $listrik->power_factor,
                'lokasi' => $listrik->lokasi,
                'status' => $listrik->status,
                'datetime' => $listrik->created_at
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving latest listrik data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function summary()
    {
        try {
            $totalPower = Listrik::sum('daya');
            $totalEnergy = Listrik::sum('energi');
            $avgVoltage = Listrik::avg('tegangan');
            $avgCurrent = Listrik::avg('arus');
            $latestData = Listrik::latest()->first();

            return response()->json([
                'success' => true,
                'total_power' => round($totalPower, 2),
                'total_energy' => round($totalEnergy, 3),
                'avg_voltage' => round($avgVoltage, 2),
                'avg_current' => round($avgCurrent, 2),
                'latest_power' => $latestData ? $latestData->daya : 0,
                'latest_voltage' => $latestData ? $latestData->tegangan : 0,
                'latest_current' => $latestData ? $latestData->arus : 0,
                'latest_energy' => $latestData ? $latestData->energi : 0,
                'data_count' => Listrik::count(),
                'location' => 'PT Krakatau Sarana Property'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving summary: ' . $e->getMessage()
            ], 500);
        }
    }
}
