<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Listrik;
use Pusher\Pusher;

class ListrikController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'lokasi' => 'required|string',
            'listrik' => 'required|numeric',
            'ac' => 'required|numeric',
            'lampu' => 'required|numeric',
        ]);

        $listrik = Listrik::create([
            'lokasi' => $request->lokasi,
            'listrik' => $request->listrik,
            'ac' => $request->ac,
            'lampu' => $request->lampu,
        ]);

        $pusher = new Pusher(
            env('PUSHER_APP_KEY'),
            env('PUSHER_APP_SECRET'),
            env('PUSHER_APP_ID'),
            [
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'useTLS' => true,
            ]
        );

        $pusher->trigger('penggunaan-listrik', 'update-' . strtolower($request->lokasi), [
            'labels' => now()->toDateTimeString(),
            'listrik' => [$request->listrik],
            'ac' => [$request->ac],
            'lampu' => [$request->lampu],
        ]);

        return response()->json(['message' => 'Data berhasil disimpan dan dikirim'], 200);
    }

    public function getData($lokasi)
    {
        $data = Listrik::where('lokasi', $lokasi)->latest()->take(30)->get();
        return response()->json($data);
    }
}
