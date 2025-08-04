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
        $relay3 = $this->firebase->getRelayState('relay3');
        $relay4 = $this->firebase->getRelayState('relay4');
        $relay5 = $this->firebase->getRelayState('relay5');
        $relay6 = $this->firebase->getRelayState('relay6');
        $relay7 = $this->firebase->getRelayState('relay7');
        $relay8 = $this->firebase->getRelayState('relay8');

        return view('pages.dashboard-v1', compact(
            'relay1',
            'relay2',
            'relay3',
            'relay4',
            'relay5',
            'relay6',
            'relay7',
            'relay8'
        ));
    }

    public function update(Request $request)
    {
        $relay1 = $request->input('relay1', 0); // default OFF
        $relay2 = $request->input('relay2', 0);
        $relay3 = $request->input('relay3', 0);
        $relay4 = $request->input('relay4', 0);
        $relay5 = $request->input('relay5', 0);
        $relay6 = $request->input('relay6', 0);
        $relay7 = $request->input('relay7', 0);
        $relay8 = $request->input('relay8', 0);

        // Use batch update for better performance
        $this->firebase->setBatchRelayStates([
            'relay1' => $relay1,
            'relay2' => $relay2,
            'relay3' => $relay3,
            'relay4' => $relay4,
            'relay5' => $relay5,
            'relay6' => $relay6,
            'relay7' => $relay7,
            'relay8' => $relay8,
            'manualMode' => true
        ]);

        return back()->with('success', 'All relay devices updated successfully.');
    }
}
