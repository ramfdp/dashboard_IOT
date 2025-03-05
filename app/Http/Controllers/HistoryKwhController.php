<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HistoryKwh;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class HistoryKwhController extends Controller
{
    /**
     * Menampilkan halaman utama dengan DataTable.
     */
    public function index(Request $request)
    {
        try {
            if (!Schema::hasTable('histori_kwh')) {
                Log::error("Tabel histori_kwh tidak ditemukan di database.");
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }
    
            if ($request->ajax()) {
                $data = HistoryKwh::select('id', 'tegangan', 'arus', 'daya', 'energi', 'frekuensi', 'power_factor', 'tanggal_input');
    
                Log::info("Data berhasil diambil dari database", ['jumlah_data' => $data->count()]);
    
                return DataTables::of($data)
                    ->toJson();
            }
            
    
            return view('pages.table-manage-buttons'); 
        } catch (\Exception $e) {
            Log::error("Error dalam pengambilan data: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Menyimpan data baru ke dalam tabel history_kwh.
     */
    public function store(Request $request)
    {
        try {
            if (!Schema::hasTable('history_kwh')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $validated = $request->validate([
                'tegangan' => 'required|numeric',
                'arus' => 'required|numeric',
                'daya' => 'required|numeric',
                'energi' => 'required|numeric',
                'frekuensi' => 'required|numeric',
                'power_factor' => 'required|numeric',
            ]);

            $history = HistoryKwh::create(array_merge($validated, ['tanggal_input' => now()]));

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil disimpan',
                'data' => $history
            ], 201);
        } catch (QueryException $e) {
            return response()->json(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan satu data berdasarkan ID.
     */
    public function show($id)
    {
        try {
            if (!Schema::hasTable('history_kwh')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $history = HistoryKwh::find($id);

            if (!$history) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'data' => $history]);
        } catch (QueryException $e) {
            return response()->json(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Memperbarui data berdasarkan ID.
     */
    public function update(Request $request, $id)
    {
        try {
            if (!Schema::hasTable('history_kwh')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $history = HistoryKwh::find($id);

            if (!$history) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            $validated = $request->validate([
                'tegangan' => 'nullable|numeric',
                'arus' => 'nullable|numeric',
                'daya' => 'nullable|numeric',
                'energi' => 'nullable|numeric',
                'frekuensi' => 'nullable|numeric',
                'power_factor' => 'nullable|numeric',
            ]);

            $history->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diperbarui',
                'data' => $history
            ]);
        } catch (QueryException $e) {
            return response()->json(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Menghapus data berdasarkan ID.
     */
    public function destroy($id)
    {
        try {
            if (!Schema::hasTable('history_kwh')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $history = HistoryKwh::find($id);

            if (!$history) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            $history->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ]);
        } catch (QueryException $e) {
            return response()->json(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mengambil data terbaru dari history_kwh.
     */
    public function latest()
    {
        try {
            if (!Schema::hasTable('history_kwh')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $history = HistoryKwh::orderBy('tanggal_input', 'desc')->first();

            if (!$history) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'data' => $history]);
        } catch (QueryException $e) {
            return response()->json(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
