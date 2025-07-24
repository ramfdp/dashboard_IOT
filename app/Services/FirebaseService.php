<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    protected $database;
    protected $timeout = 3; // Reduced timeout to 3 seconds

    public function __construct()
    {
        try {
            $factory = (new Factory)
                ->withServiceAccount(storage_path('app/firebase/firebase_credentials.json'))
                ->withDatabaseUri('https://iot-firebase-a83a5-default-rtdb.firebaseio.com');

            $this->database = $factory->createDatabase();
        } catch (\Exception $e) {
            Log::error('Firebase Service initialization failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function setRelayState($relay, $value)
    {
        try {
            return $this->database
                ->getReference("relayControl/{$relay}")
                ->set((int) $value);
        } catch (\Exception $e) {
            Log::error("Failed to set relay {$relay} state: " . $e->getMessage());
            return false;
        }
    }

    public function getRelayState($relay)
    {
        try {
            return $this->database
                ->getReference("relayControl/{$relay}")
                ->getValue();
        } catch (\Exception $e) {
            Log::error("Failed to get relay {$relay} state: " . $e->getMessage());
            return null;
        }
    }

    public function setSOSMode($value)
    {
        try {
            return $this->database
                ->getReference('relayControl/sos')
                ->set((int) $value);
        } catch (\Exception $e) {
            Log::error("Failed to set SOS mode: " . $e->getMessage());
            return false;
        }
    }

    // Manual mode management
    public function setManualMode($value)
    {
        try {
            return $this->database
                ->getReference('relayControl/manualMode')
                ->set((bool) $value);
        } catch (\Exception $e) {
            Log::error("Failed to set manual mode: " . $e->getMessage());
            return false;
        }
    }

    public function getManualMode()
    {
        try {
            return $this->database
                ->getReference('relayControl/manualMode')
                ->getValue();
        } catch (\Exception $e) {
            Log::error("Failed to get manual mode: " . $e->getMessage());
            return false;
        }
    }

    public function setAutoMode()
    {
        try {
            return $this->database
                ->getReference('relayControl/manualMode')
                ->set(false);
        } catch (\Exception $e) {
            Log::error("Failed to set auto mode: " . $e->getMessage());
            return false;
        }
    }

    // Batch update for better performance
    public function setBatchRelayStates($states)
    {
        try {
            $updates = [];
            foreach ($states as $relay => $value) {
                $updates["relayControl/{$relay}"] = (int) $value;
            }
            return $this->database->getReference()->update($updates);
        } catch (\Exception $e) {
            Log::error("Failed to set batch relay states: " . $e->getMessage());
            return false;
        }
    }

    // Schedule management methods
    public function setSchedule($scheduleId, $scheduleData)
    {
        try {
            return $this->database
                ->getReference("schedules/{$scheduleId}")
                ->set($scheduleData);
        } catch (\Exception $e) {
            Log::error("Failed to set schedule {$scheduleId}: " . $e->getMessage());
            return false;
        }
    }

    public function getSchedule($scheduleId)
    {
        try {
            return $this->database
                ->getReference("schedules/{$scheduleId}")
                ->getValue();
        } catch (\Exception $e) {
            Log::error("Failed to get schedule {$scheduleId}: " . $e->getMessage());
            return null;
        }
    }

    public function deleteSchedule($scheduleId)
    {
        try {
            return $this->database
                ->getReference("schedules/{$scheduleId}")
                ->remove();
        } catch (\Exception $e) {
            Log::error("Failed to delete schedule {$scheduleId}: " . $e->getMessage());
            return false;
        }
    }

    public function getAllSchedules()
    {
        try {
            return $this->database
                ->getReference("schedules")
                ->getValue();
        } catch (\Exception $e) {
            Log::error("Failed to get all schedules: " . $e->getMessage());
            return [];
        }
    }
}
