<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Listrik;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class HistoryKwhController extends Controller
{
    /**
     * Menampilkan halaman utama dengan DataTable.
     */
    public function index(Request $request)
    {
        try {
            if (!Schema::hasTable('listriks')) {
                Log::error("Tabel listriks tidak ditemukan di database.");
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            if ($request->ajax()) {
                $data = Listrik::select('id', 'tegangan', 'arus', 'daya', 'energi', 'frekuensi', 'power_factor', 'created_at as tanggal_input');

                Log::info("Data berhasil diambil dari database", ['jumlah_data' => $data->count()]);

                return DataTables::of($data)
                    ->editColumn('tanggal_input', function ($row) {
                        return $row->tanggal_input->format('d/m/Y, H:i:s');
                    })
                    ->toJson();
            }

            return view('pages.table-manage-buttons');
        } catch (\Exception $e) {
            Log::error("Error dalam pengambilan data: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Menyimpan data baru ke dalam tabel listriks.
     */
    public function store(Request $request)
    {
        try {
            if (!Schema::hasTable('listriks')) {
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

            $history = Listrik::create($validated);

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
            if (!Schema::hasTable('listriks')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $history = Listrik::find($id);

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
            if (!Schema::hasTable('listriks')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $history = Listrik::find($id);

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
            if (!Schema::hasTable('listriks')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $history = Listrik::find($id);

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
     * Mengambil data terbaru dari tabel listriks.
     */
    public function latest()
    {
        try {
            if (!Schema::hasTable('listriks')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 500);
            }

            $history = Listrik::orderBy('created_at', 'desc')->first();

            if (!$history) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'data' => $history]);
        } catch (QueryException $e) {
            return response()->json(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    public function fetchFromFirebase()
    {
        $firebaseUrl = 'https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/sensor.json';

        try {
            $response = Http::get($firebaseUrl);

            if ($response->ok()) {
                $data = $response->json();

                // Pastikan data valid
                if (!isset($data['voltage'], $data['current'], $data['power'], $data['energy'], $data['frequency'], $data['powerFactor'])) {
                    return response()->json(['success' => false, 'message' => 'Data tidak lengkap'], 400);
                }

                // Simpan ke DB
                Listrik::create([
                    'tegangan' => $data['voltage'],
                    'arus' => $data['current'],
                    'daya' => $data['power'],
                    'energi' => $data['energy'],
                    'frekuensi' => $data['frequency'],
                    'power_factor' => $data['powerFactor']
                ]);

                return response()->json(['success' => true, 'message' => 'Data berhasil disimpan']);
            }

            return response()->json(['success' => false, 'message' => 'Gagal ambil data dari Firebase'], 500);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mengambil data history dengan filter bulan dan tahun
     * Method untuk History Listrik section pada dashboard
     */
    public function getFilteredHistory(Request $request)
    {
        try {
            if (!Schema::hasTable('listriks')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 404);
            }

            $query = Listrik::query();

            // Filter berdasarkan bulan
            if ($request->filled('bulan')) {
                $query->whereMonth('created_at', $request->bulan);
            }

            // Filter berdasarkan tahun
            if ($request->filled('tahun')) {
                $query->whereYear('created_at', $request->tahun);
            }

            // Jika tidak ada filter, gunakan bulan dan tahun saat ini
            if (!$request->filled('bulan') && !$request->filled('tahun')) {
                $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
            }

            // Pagination
            $perPage = $request->get('per_page', 100);
            $page = $request->get('page', 1);

            // Order by timestamp descending
            $query->orderBy('created_at', 'desc');

            // Get paginated results
            $paginatedData = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform data untuk frontend manually
            $items = [];
            foreach ($paginatedData->items() as $item) {
                $items[] = [
                    'id' => $item->id,
                    'timestamp' => $item->created_at,
                    'voltage' => $item->voltage ?? $item->tegangan ?? 0,
                    'current' => $item->current ?? $item->arus ?? 0,
                    'power' => $item->power ?? $item->daya ?? 0,
                    'energy' => $item->energy ?? $item->energi ?? 0,
                    'frequency' => $item->frequency ?? $item->frekuensi ?? 50,
                    'pf' => $item->pf ?? $item->power_factor ?? 1,
                    'location' => $item->location ?? 'Main Panel',
                    'sensor_id' => $item->sensor_id ?? 1
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $items,
                'total' => $paginatedData->total(),
                'current_page' => $paginatedData->currentPage(),
                'per_page' => $paginatedData->perPage(),
                'last_page' => $paginatedData->lastPage(),
                'from' => $paginatedData->firstItem(),
                'to' => $paginatedData->lastItem()
            ]);
        } catch (\Exception $e) {
            Log::error("Error dalam getFilteredHistory: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mengambil semua data untuk download CSV (tanpa pagination)
     */
    public function getAllHistoryForDownload(Request $request)
    {
        try {
            if (!Schema::hasTable('listriks')) {
                return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan'], 404);
            }

            $query = Listrik::query();

            // Filter berdasarkan bulan
            if ($request->filled('bulan')) {
                $query->whereMonth('created_at', $request->bulan);
            }

            // Filter berdasarkan tahun
            if ($request->filled('tahun')) {
                $query->whereYear('created_at', $request->tahun);
            }

            // Jika tidak ada filter, gunakan bulan dan tahun saat ini
            if (!$request->filled('bulan') && !$request->filled('tahun')) {
                $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
            }

            // Order by timestamp ascending untuk CSV
            $data = $query->orderBy('created_at', 'asc')->get();

            // Transform data untuk CSV
            $transformedData = $data->map(function ($item) {
                return [
                    'id' => $item->id,
                    'timestamp' => $item->created_at,
                    'voltage' => $item->voltage ?? $item->tegangan ?? 0,
                    'current' => $item->current ?? $item->arus ?? 0,
                    'power' => $item->power ?? $item->daya ?? 0,
                    'energy' => $item->energy ?? $item->energi ?? 0,
                    'frequency' => $item->frequency ?? $item->frekuensi ?? 50,
                    'pf' => $item->pf ?? $item->power_factor ?? 1,
                    'location' => $item->location ?? 'Main Panel',
                    'sensor_id' => $item->sensor_id ?? 1
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedData,
                'total' => $data->count()
            ]);
        } catch (\Exception $e) {
            Log::error("Error dalam getAllHistoryForDownload: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
