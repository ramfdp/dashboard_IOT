<?php

namespace App\Livewire;

use Livewire\Component;

class OvertimeControl extends Component
{
    public $message = 'Livewire is working correctly!';
    public $relay1Status = 0;
    public $relay2Status = 0;

    public function toggleRelay($relayNumber)
    {
        if ($relayNumber == 1) {
            $this->relay1Status = $this->relay1Status ? 0 : 1;
        } else {
            $this->relay2Status = $this->relay2Status ? 0 : 1;
        }
        
        $this->message = "Relay {$relayNumber} " . ($this->{"relay{$relayNumber}Status"} ? 'ON' : 'OFF');
    }

    public function render()
    {
        return view('livewire.overtime-control');
    }
}
