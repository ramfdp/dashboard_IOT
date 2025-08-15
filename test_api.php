<?php

/**
 * Simple test script to verify electricity data API is working
 * Run this from browser: http://localhost/dashboard_IOT/test_api.php
 */

// Include Laravel bootstrap
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

// Boot the application
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\HistoryKwh;

echo "<h1>Electricity Data API Test</h1>";

// Test 1: Check if we have data in database
echo "<h2>Test 1: Database Records</h2>";
try {
    $records = HistoryKwh::orderBy('created_at', 'desc')->take(5)->get();
    echo "<p>Total records in database: " . HistoryKwh::count() . "</p>";

    if ($records->count() > 0) {
        echo "<p>Latest 5 records:</p><ul>";
        foreach ($records as $record) {
            echo "<li>ID: {$record->id}, Daya: {$record->daya}W, Time: {$record->created_at}</li>";
        }
        echo "</ul>";
    } else {
        echo "<p style='color: orange;'>No records found in database</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>Database error: " . $e->getMessage() . "</p>";
}

// Test 2: Test API endpoint
echo "<h2>Test 2: API Endpoint Test</h2>";
$periods = ['harian', 'mingguan', 'bulanan'];

foreach ($periods as $period) {
    echo "<h3>Testing period: {$period}</h3>";

    // Simulate API call
    $request = new Illuminate\Http\Request(['period' => $period]);
    $controller = new App\Http\Controllers\ElectricityDataController();

    try {
        $response = $controller->getDataByPeriod($request);
        $data = json_decode($response->getContent(), true);

        if ($data['success']) {
            echo "<p style='color: green;'>✓ API Success</p>";
            echo "<p>Records: " . count($data['data']) . "</p>";
            echo "<p>Source: " . $data['source'] . "</p>";
            echo "<p>Sample data: " . implode(', ', array_slice($data['data'], 0, 5)) . "...</p>";
        } else {
            echo "<p style='color: orange;'>⚠ API returned success=false</p>";
            echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT) . "</pre>";
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>✗ API Error: " . $e->getMessage() . "</p>";
    }

    echo "<hr>";
}

echo "<h2>Test 3: JavaScript Integration Test</h2>";
echo '<script>
async function testAPI() {
    console.log("Testing API from JavaScript...");
    
    const periods = ["harian", "mingguan", "bulanan"];
    
    for (const period of periods) {
        try {
            const response = await fetch(`/api/electricity/data?period=${period}`);
            const data = await response.json();
            
            console.log(`${period} API response:`, data);
            
            const resultDiv = document.getElementById("js-results");
            resultDiv.innerHTML += `<p><strong>${period}:</strong> ${data.success ? "✓ Success" : "✗ Failed"} - ${data.total_records} records from ${data.source}</p>`;
            
        } catch (error) {
            console.error(`Error testing ${period}:`, error);
            document.getElementById("js-results").innerHTML += `<p><strong>${period}:</strong> ✗ Network Error</p>`;
        }
    }
}

// Test when page loads
testAPI();
</script>';

echo '<div id="js-results"><h3>JavaScript API Test Results:</h3></div>';

echo "<h2>Conclusion</h2>";
echo "<p>If all tests show success (✓), the API is working correctly and the issue might be in the frontend JavaScript logic.</p>";
echo "<p>If tests fail (✗), there are backend issues that need to be fixed first.</p>";
