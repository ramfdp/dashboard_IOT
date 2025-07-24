// Global Firebase timeout and performance configuration
const FIREBASE_CONFIG = {
    // Connection timeouts (in milliseconds)
    CONNECTION_TIMEOUT: 3000,      // 3 seconds for connection
    READ_TIMEOUT: 2000,            // 2 seconds for read operations
    WRITE_TIMEOUT: 2000,           // 2 seconds for write operations

    // Retry configuration
    MAX_RETRIES: 2,
    RETRY_DELAY: 500,              // 500ms between retries

    // Cache settings
    CACHE_SIZE: '10mb',
    ENABLE_OFFLINE: true,

    // Performance optimizations
    BATCH_SIZE: 10,                // Maximum operations per batch
    DEBOUNCE_DELAY: 300,           // 300ms debounce for rapid operations

    // API call intervals (in milliseconds)
    SCHEDULE_CHECK_INTERVAL: 60000,    // 1 minute
    STATUS_CHECK_INTERVAL: 30000,      // 30 seconds
    DEVICE_SYNC_INTERVAL: 15000,       // 15 seconds

    // Quick timeouts for UI responsiveness
    UI_UPDATE_DELAY: 200,          // 200ms for UI updates
    FORM_SUBMIT_TIMEOUT: 2000,     // 2 seconds for form submissions

    // Firebase URLs
    PRIMARY_URL: 'https://iot-firebase-a83a5-default-rtdb.firebaseio.com',
    FALLBACK_URL: 'https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FIREBASE_CONFIG;
}

// Global window object for browser environment
if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}

// Performance monitoring utilities
const FirebasePerformance = {
    startTime: Date.now(),

    logTiming(operation, startTime) {
        const duration = Date.now() - startTime;
        if (duration > FIREBASE_CONFIG.CONNECTION_TIMEOUT) {
            console.warn(`Firebase operation '${operation}' took ${duration}ms (exceeded ${FIREBASE_CONFIG.CONNECTION_TIMEOUT}ms threshold)`);
        } else {
            console.log(`Firebase operation '${operation}' completed in ${duration}ms`);
        }
        return duration;
    },

    withTimeout(promise, timeoutMs = FIREBASE_CONFIG.CONNECTION_TIMEOUT, operation = 'Firebase operation') {
        const startTime = Date.now();

        return Promise.race([
            promise.then(result => {
                this.logTiming(operation, startTime);
                return result;
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
            )
        ]).catch(error => {
            console.error(`Firebase error in '${operation}':`, error.message);
            throw error;
        });
    }
};

// Export performance utilities
if (typeof window !== 'undefined') {
    window.FirebasePerformance = FirebasePerformance;
}
