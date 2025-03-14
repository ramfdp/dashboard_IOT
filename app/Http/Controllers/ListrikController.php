<?php

namespace App\Http\Controllers; // Pastikan namespace sesuai dengan lokasi file

use Illuminate\Http\Request;
use App\Models\Lokasi; // Pastikan model ini ada

class ListrikController extends Controller
{
    public function detail($id)
    {
        $lokasi = Lokasi::find($id);

        if (!$lokasi) {
            abort(404, "Data lokasi tidak ditemukan.");
        }

        // Data dari database (contoh, nanti ambil dari model)
        $penggunaanListrik = [
            'CM1' => 70.33,
            'CM2' => 50,
            'CM3' => 50,
            'Sport' => 50
        ];

        return view('pages.dashboard-detail-wisma', [
            'penggunaanListrik' => $penggunaanListrik,
            'breadcrumb' => [
                ['name' => 'Home', 'route' => route('dashboard-v1')],
                ['name' => 'Penggunaan Listrik', 'route' => route('listrik.detail', ['id' => $id])],
            ]
        ]);
    }


}
