/**
 * Debug Helper untuk Firebase Listener
 * Buka console dan jalankan: debugFirebaseListener()
 */

window.debugFirebaseListener = function() {
    console.log('=== FIREBASE LISTENER DEBUG ===');
    console.log('');
    
    // Check Firebase SDK
    console.log('1. Firebase SDK:');
    console.log('   - firebase object:', typeof firebase !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');
    console.log('   - firebase.database:', typeof firebase !== 'undefined' && firebase.database ? '✅ Available' : '❌ Not available');
    console.log('');
    
    // Check AutoPZEMGenerator
    console.log('2. AutoPZEMGenerator:');
    console.log('   - window.autoPZEMGenerator:', window.autoPZEMGenerator ? '✅ Exists' : '❌ Not initialized');
    if (window.autoPZEMGenerator) {
        console.log('   - isRunning:', window.autoPZEMGenerator.isRunning);
        console.log('   - currentData:', window.autoPZEMGenerator.currentData);
    }
    console.log('');
    
    // Check DOM Elements
    console.log('3. DOM Elements:');
    const elements = [
        'pzem-voltage',
        'pzem-current',
        'pzem-power',
        'pzem-energi',
        'pzem-frekuensi',
        'pzem-power-factor'
    ];
    elements.forEach(id => {
        const el = document.getElementById(id);
        console.log(`   - #${id}:`, el ? `✅ Found (value: "${el.textContent}")` : '❌ Not found');
    });
    console.log('');
    
    // Check Chart
    console.log('4. Chart:');
    console.log('   - window.electricityChart:', window.electricityChart ? '✅ Exists' : '❌ Not initialized');
    console.log('   - window.globalElectricityData:', window.globalElectricityData ? '✅ Exists' : '❌ Not initialized');
    console.log('');
    
    // Try to read Firebase data manually
    console.log('5. Firebase Data (manual check):');
    if (typeof firebase !== 'undefined' && firebase.database) {
        const sensorRef = firebase.database().ref('sensor');
        sensorRef.once('value').then((snapshot) => {
            const data = snapshot.val();
            console.log('   - Firebase /sensor data:', data);
            console.log('');
            console.log('=== END DEBUG ===');
        }).catch((error) => {
            console.error('   - Error reading Firebase:', error);
            console.log('');
            console.log('=== END DEBUG ===');
        });
    } else {
        console.log('   - Cannot check: Firebase not available');
        console.log('');
        console.log('=== END DEBUG ===');
    }
};

console.log('[Debug] 🛠️ Debug helper loaded. Run: debugFirebaseListener()');
