/**
 * Dashboard Data Debug
 * Debug logging untuk memverifikasi data dari controller
 * Dipindahkan dari dashboard-v1.blade.php
 */

document.addEventListener('DOMContentLoaded', function () {
    // Data debug dari Laravel controller
    console.log('[Dashboard Debug] DataKwh from controller:', window.dashboardDebugData?.dataKwh || []);
    console.log('[Dashboard Debug] Labels count:', window.dashboardDebugData?.labelsCount || 0);
    console.log('[Dashboard Debug] Values count:', window.dashboardDebugData?.valuesCount || 0);

    // Additional debug info
    if (window.dashboardDebugData) {
        console.log('[Dashboard Debug] Controller data loaded successfully');
    } else {
        console.log('[Dashboard Debug] No controller data found, using fallback');
    }
});
