<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Overtime;
use App\Models\User;

echo "Starting to populate employee_id in overtime records...\n";

// Get all overtimes with null employee_id
$overtimes = Overtime::whereNull('employee_id')->get();

if ($overtimes->isEmpty()) {
    echo "No overtime records need employee_id population.\n";
    exit(0);
}

$updated = 0;
$notFound = 0;

foreach ($overtimes as $overtime) {
    // Try to find user by name
    $user = User::where('name', $overtime->employee_name)->first();

    if ($user) {
        $overtime->employee_id = $user->id;
        $overtime->save();
        $updated++;
        echo "✓ Updated overtime ID {$overtime->id}: {$overtime->employee_name} → User ID {$user->id}\n";
    } else {
        $notFound++;
        echo "✗ No user found for employee name: {$overtime->employee_name} (Overtime ID: {$overtime->id})\n";
    }
}

echo "Population complete!\n";
echo "Updated: {$updated} records\n";
echo "Not found: {$notFound} records\n";
