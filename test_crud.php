<?php

// Test script untuk memastikan CRUD berjalan dengan benar

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Testing User CRUD Operations ===\n";

// 1. CREATE Test
echo "\n1. Testing CREATE user...\n";
$testUser = User::create([
    'name' => 'CRUD Test User',
    'email' => 'crudtest@example.com',
    'password' => Hash::make('password123'),
    'role' => 'admin'
]);

echo "Created user ID: " . $testUser->id . "\n";
echo "Created user role: " . $testUser->role . "\n";

// 2. READ Test
echo "\n2. Testing READ user...\n";
$readUser = User::find($testUser->id);
echo "Read user name: " . $readUser->name . "\n";
echo "Read user role: " . $readUser->role . "\n";

// 3. UPDATE Test
echo "\n3. Testing UPDATE user...\n";
$readUser->update([
    'name' => 'CRUD Test User UPDATED',
    'role' => 'user'
]);

$readUser->refresh();
echo "Updated user name: " . $readUser->name . "\n";
echo "Updated user role: " . $readUser->role . "\n";

// 4. Verify in database
echo "\n4. Direct database check...\n";
$dbCheck = \DB::table('users')->where('id', $testUser->id)->first();
echo "DB name: " . $dbCheck->name . "\n";
echo "DB role: " . $dbCheck->role . "\n";

// 5. DELETE Test
echo "\n5. Testing DELETE user...\n";
$readUser->delete();
echo "User deleted successfully\n";

echo "\n=== CRUD Test Complete ===\n";
