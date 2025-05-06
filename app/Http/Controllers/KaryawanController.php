<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Karyawan;
use App\Models\Divisi;

class KaryawanController extends Controller
{
    /**
     * Menampilkan halaman utama karyawan dengan data divisi & karyawan (jika difilter).
     */
    public function index(Request $request)
    {
        $divisions = Divisi::all();
        $selectedDivision = $request->input('division', null);

        $karyawans = Karyawan::when($selectedDivision, function ($query, $divisionId) {
            return $query->where('divisi_id', $divisionId);
        })->get();

        return view('pages.karyawan', compact('karyawans', 'divisions', 'selectedDivision'));
    }

    /**
     * Menyediakan data karyawan dalam format JSON untuk DataTables.
     */
    public function getData(Request $request)
    {
        $divisiId = $request->divisi;

        $karyawan = Karyawan::with('divisi')
            ->when($divisiId, function ($query) use ($divisiId) {
                return $query->where('divisi_id', $divisiId);
            })
            ->get();

        return datatables()->of($karyawan)
            ->addColumn('divisi', function ($karyawan) {
                return $karyawan->divisi ? $karyawan->divisi->nama_divisi : '-';
            })
            ->make(true);
    }

    /**
     * Mengembalikan daftar karyawan berdasarkan divisi (digunakan untuk dropdown Ajax).
     */
    public function getKaryawanByDivisi($divisiId)
    {
        $karyawans = Karyawan::where('divisi_id', $divisiId)->get();
        return response()->json($karyawans);
    }

    /**
     * Menyimpan data karyawan baru ke dalam database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_karyawan' => 'required|string|max:255',
            'divisi_id' => 'required|exists:divisions,id',
        ]);

        Karyawan::create([
            'nama_karyawan' => $request->input('nama_karyawan'),
            'divisi_id' => $request->input('divisi_id'),
        ]);

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        // Mencari karyawan berdasarkan ID
        $karyawan = Karyawan::findOrFail($id);
        
        // Hapus karyawan
        $karyawan->delete();

        // Kirimkan response atau redirect
        return redirect()->route('karyawan.index')->with('success', 'Karyawan berhasil dihapus');
    }
}
