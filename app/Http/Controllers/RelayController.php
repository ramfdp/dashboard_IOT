<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirebaseService;

class RelayController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index()
    {
        $relay1 = $this->firebase->getRelayState('relay1');
        $relay2 = $this->firebase->getRelayState('relay2');

        return view('pages.dashboard-v1', compact('relay1', 'relay2'));
    }

    public function update(Request $request)
    {
        $relay1 = $request->input('relay1', 0); // default OFF
        $relay2 = $request->input('relay2', 0);

        $this->firebase->setRelayState('relay1', $relay1);
        $this->firebase->setRelayState('relay2', $relay2);

        return back()->with('success', 'Perangkat diperbarui.');
    }

}
