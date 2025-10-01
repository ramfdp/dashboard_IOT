<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Listrik;

class ListrikController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Listrik::query();

            // Filter by month if provided
            if ($request->has('bulan') && $request->bulan != '') {
                $query->whereMonth('created_at', $request->bulan);
            }

            // Filter by year if provided  
            if ($request->has('tahun') && $request->tahun != '') {
                $query->whereYear('created_at', $request->tahun);
            }

            // Get page size from request or default to 10
            $perPage = $request->get('per_page', 10);

            $listriks = $query->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $listriks,
                'filters' => [
                    'bulan' => $request->bulan,
                    'tahun' => $request->tahun
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $listrik = Listrik::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil disimpan',
                'data' => $listrik
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $listrik = Listrik::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $listrik
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }
    }
}
