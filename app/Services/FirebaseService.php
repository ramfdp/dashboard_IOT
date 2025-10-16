<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    protected $database;
    protected $timeout = 3;

    public function __construct()
    {
        try {
            $factory = (new Factory)
                ->withServiceAccount(storage_path('app/firebase/firebase_credentials.json'))
                ->withDatabaseUri('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app');

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

    public function setBatchRelayStates($states)
    {
        try {
            $updates = [];
            foreach ($states as $relay => $value) {
                $updates["relayControl/{$relay}"] = (int) $value;
            }

            Log::info("Firebase batch update - sending data: " . json_encode($updates));

            $result = $this->database->getReference()->update($updates);

            Log::info("Firebase batch update completed successfully");

            return $result;
        } catch (\Exception $e) {
            Log::error("Failed to set batch relay states: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }

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

    /**
     * Get sensor data from Firebase
     */
    public function getSensorData()
    {
        try {
            $sensorData = $this->database
                ->getReference("sensor")
                ->getValue();

            return [
                'temperature' => $sensorData['temperature'] ?? 25.0,
                'humidity' => $sensorData['humidity'] ?? 60.0,
                'voltage' => $sensorData['voltage'] ?? 220.0,
                'current' => $sensorData['current'] ?? 0.0,
                'power' => $sensorData['power'] ?? 0.0,
                'timestamp' => $sensorData['timestamp'] ?? now()->toISOString(),
                'lastUpdated' => $sensorData['lastUpdated'] ?? now()->toISOString()
            ];
        } catch (\Exception $e) {
            Log::error("Failed to get sensor data: " . $e->getMessage());
            return [
                'temperature' => 25.0,
                'humidity' => 60.0,
                'voltage' => 220.0,
                'current' => 0.0,
                'power' => 0.0,
                'timestamp' => now()->toISOString(),
                'lastUpdated' => now()->toISOString()
            ];
        }
    }

    /**
     * Set sensor data to Firebase
     */
    public function setSensorData($data)
    {
        try {
            return $this->database
                ->getReference("sensor")
                ->set($data);
        } catch (\Exception $e) {
            Log::error("Failed to set sensor data: " . $e->getMessage());
            return false;
        }
    }
}
