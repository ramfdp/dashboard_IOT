<?php

namespace App\Services;

use Kreait\Firebase\Factory;

class FirebaseService
{
    protected $database;

    public function __construct()
    {
        $factory = (new Factory)
            ->withServiceAccount(storage_path('app/firebase/firebase_credentials.json'))
            ->withDatabaseUri('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/');

        $this->database = $factory->createDatabase();
    }

    public function setRelayState($relay, $value)
    {
        return $this->database
            ->getReference("relayControl/{$relay}")
            ->set((int) $value);
    }

    public function getRelayState($relay)
    {
        return $this->database
            ->getReference("relayControl/{$relay}")
            ->getValue();
    }

    public function setSOSMode($value)
    {
        return $this->database
            ->getReference('relayControl/sos')
            ->set((int) $value);
    }

    // Schedule management methods
    public function setSchedule($scheduleId, $scheduleData)
    {
        return $this->database
            ->getReference("schedules/{$scheduleId}")
            ->set($scheduleData);
    }

    public function getSchedule($scheduleId)
    {
        return $this->database
            ->getReference("schedules/{$scheduleId}")
            ->getValue();
    }

    public function deleteSchedule($scheduleId)
    {
        return $this->database
            ->getReference("schedules/{$scheduleId}")
            ->remove();
    }

    public function getAllSchedules()
    {
        return $this->database
            ->getReference("schedules")
            ->getValue();
    }
}
