/**
 * Firebase Integration for PT Krakatau Sarana Property Real-time Data
 * Handles Firebase authentication and data synchronization
 */

class FirebaseIntegration {
    constructor(config = null) {
        this.isInitialized = false;
        this.database = null;
        this.auth = null;

        // Default Firebase config for PT Krakatau Sarana Property
        this.defaultConfig = {
            apiKey: "your-api-key-here",
            authDomain: "krakatau-sarana-property.firebaseapp.com",
            databaseURL: "https://krakatau-sarana-property-default-rtdb.asia-southeast1.firebasedatabase.app/",
            projectId: "krakatau-sarana-property",
            storageBucket: "krakatau-sarana-property.appspot.com",
            messagingSenderId: "123456789012",
            appId: "1:123456789012:web:abcdef123456789"
        };

        this.config = config || this.defaultConfig;
        this.init();
    }

    /**
     * Initialize Firebase
     */
    async init() {
        try {
            // Check if Firebase SDK is loaded
            if (typeof firebase === 'undefined') {
                console.warn('[Firebase] Firebase SDK not loaded. Loading Firebase SDK...');
                await this.loadFirebaseSDK();
                return;
            }

            // Initialize Firebase if not already initialized
            if (!firebase.apps.length) {
                firebase.initializeApp(this.config);
                console.log('[Firebase] Firebase initialized with config:', {
                    projectId: this.config.projectId,
                    databaseURL: this.config.databaseURL
                });
            }

            this.database = firebase.database();

            // Safely try to initialize auth if available
            try {
                if (typeof firebase.auth === 'function') {
                    this.auth = firebase.auth();
                    console.log('[Firebase] Auth module loaded successfully');
                    this.setupAuthListener();
                } else {
                    console.log('[Firebase] Auth module not available, continuing without auth');
                }
            } catch (authError) {
                console.warn('[Firebase] Auth initialization failed, continuing without auth:', authError);
            }

            this.isInitialized = true;
            console.log('[Firebase] Firebase integration ready for PT Krakatau Sarana Property');

        } catch (error) {
            console.error('[Firebase] Initialization error:', error);
            // Continue without auth if possible
            this.initializeWithoutAuth();
        }
    }

    /**
     * Initialize Firebase without auth (fallback)
     */
    initializeWithoutAuth() {
        try {
            if (typeof firebase !== 'undefined' && typeof firebase.database === 'function') {
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.config);
                }
                this.database = firebase.database();
                this.isInitialized = true;
                console.log('[Firebase] Initialized without auth module');
            }
        } catch (error) {
            console.error('[Firebase] Failed to initialize without auth:', error);
        }
    }

    /**
     * Load Firebase Auth module specifically
     */
    async loadFirebaseAuth() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
            script.onload = () => {
                console.log('[Firebase] Auth module loaded');
                setTimeout(() => {
                    this.init();
                    resolve();
                }, 500);
            };
            script.onerror = () => {
                console.warn('[Firebase] Failed to load auth module, continuing without auth');
                this.initializeWithoutAuth();
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Load Firebase SDK dynamically if not present
     */
    /**
     * Load Firebase SDK dynamically if not present
     */
    async loadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            const scripts = [
                'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
                // Skip auth for now to avoid conflicts
                // 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js'
            ];

            let loadedScripts = 0;
            scripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loadedScripts++;
                    if (loadedScripts === scripts.length) {
                        console.log('[Firebase] Essential SDK modules loaded, reinitializing...');
                        setTimeout(() => {
                            this.init();
                            resolve();
                        }, 1000);
                    }
                };
                script.onerror = () => {
                    console.error('[Firebase] Failed to load script:', src);
                    if (loadedScripts >= scripts.length - 1) {
                        // Try to continue even if one script fails
                        setTimeout(() => {
                            this.init();
                            resolve();
                        }, 1000);
                    }
                };
                document.head.appendChild(script);
            });
        });
    }

    /**
     * Setup authentication listener
     */
    setupAuthListener() {
        if (!this.auth) {
            console.log('[Firebase] Auth not available, skipping auth listener setup');
            return;
        }

        try {
            this.auth.onAuthStateChanged(user => {
                if (user) {
                    console.log('[Firebase] User signed in:', user.uid);
                } else {
                    console.log('[Firebase] User signed out');
                    // For public data, we can continue without authentication
                }
            });
        } catch (error) {
            console.warn('[Firebase] Failed to setup auth listener:', error);
        }
    }

    /**
     * Store electricity data in Firebase
     */
    async storeElectricityData(data) {
        if (!this.isInitialized || !this.database) {
            console.warn('[Firebase] Not initialized, cannot store data');
            return false;
        }

        try {
            const timestamp = new Date().getTime();
            const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            const dataToStore = {
                ...data,
                stored_at: firebase.database.ServerValue.TIMESTAMP,
                client_timestamp: timestamp,
                building: 'PT Krakatau Sarana Property',
                location: 'Cilegon, Banten'
            };

            // Store in multiple locations for different access patterns
            const updates = {};

            // Store in daily data
            updates[`electricity_data/daily/${dateStr}/${timestamp}`] = dataToStore;

            // Store in latest data
            updates[`electricity_data/latest`] = dataToStore;

            // Store in building-specific data
            updates[`buildings/krakatau_sarana_property/electricity/${timestamp}`] = dataToStore;

            await this.database.ref().update(updates);

            console.log('[Firebase] Data stored successfully');
            return true;

        } catch (error) {
            console.error('[Firebase] Error storing data:', error);
            return false;
        }
    }

    /**
     * Get latest electricity data from Firebase
     */
    async getLatestData() {
        if (!this.isInitialized || !this.database) {
            console.warn('[Firebase] Not initialized, cannot get data');
            return null;
        }

        try {
            const snapshot = await this.database.ref('electricity_data/latest').once('value');
            const data = snapshot.val();

            if (data) {
                console.log('[Firebase] Latest data retrieved:', data);
                return data;
            } else {
                console.log('[Firebase] No latest data found');
                return null;
            }

        } catch (error) {
            console.error('[Firebase] Error getting latest data:', error);
            return null;
        }
    }

    /**
     * Get historical data for a specific date
     */
    async getHistoricalData(date) {
        if (!this.isInitialized || !this.database) {
            console.warn('[Firebase] Not initialized, cannot get historical data');
            return [];
        }

        try {
            const dateStr = date || new Date().toISOString().split('T')[0];
            const snapshot = await this.database.ref(`electricity_data/daily/${dateStr}`).once('value');
            const data = snapshot.val();

            if (data) {
                const dataArray = Object.keys(data).map(key => ({
                    timestamp: key,
                    ...data[key]
                })).sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

                console.log('[Firebase] Historical data retrieved:', dataArray.length, 'records');
                return dataArray;
            } else {
                console.log('[Firebase] No historical data found for', dateStr);
                return [];
            }

        } catch (error) {
            console.error('[Firebase] Error getting historical data:', error);
            return [];
        }
    }

    /**
     * Subscribe to real-time data updates
     */
    subscribeToRealTimeUpdates(callback) {
        if (!this.isInitialized || !this.database) {
            console.warn('[Firebase] Not initialized, cannot subscribe to updates');
            return null;
        }

        try {
            const ref = this.database.ref('electricity_data/latest');

            const listener = ref.on('value', snapshot => {
                const data = snapshot.val();
                if (data && callback) {
                    callback(data);
                }
            });

            console.log('[Firebase] Subscribed to real-time updates');
            return () => {
                ref.off('value', listener);
                console.log('[Firebase] Unsubscribed from real-time updates');
            };

        } catch (error) {
            console.error('[Firebase] Error subscribing to updates:', error);
            return null;
        }
    }

    /**
     * Get building statistics
     */
    async getBuildingStats(timeRange = 'today') {
        if (!this.isInitialized || !this.database) {
            console.warn('[Firebase] Not initialized, cannot get building stats');
            return null;
        }

        try {
            let startTime, endTime;
            const now = new Date();

            switch (timeRange) {
                case 'today':
                    startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    endTime = now.getTime();
                    break;
                case 'week':
                    startTime = now.getTime() - (7 * 24 * 60 * 60 * 1000);
                    endTime = now.getTime();
                    break;
                case 'month':
                    startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                    endTime = now.getTime();
                    break;
                default:
                    startTime = now.getTime() - (24 * 60 * 60 * 1000);
                    endTime = now.getTime();
            }

            const snapshot = await this.database.ref('buildings/krakatau_sarana_property/electricity')
                .orderByKey()
                .startAt(startTime.toString())
                .endAt(endTime.toString())
                .once('value');

            const data = snapshot.val();

            if (data) {
                const dataArray = Object.values(data);
                const stats = this.calculateStats(dataArray);

                console.log('[Firebase] Building stats calculated:', stats);
                return stats;
            } else {
                console.log('[Firebase] No data found for stats calculation');
                return null;
            }

        } catch (error) {
            console.error('[Firebase] Error getting building stats:', error);
            return null;
        }
    }

    /**
     * Calculate statistics from data array
     */
    calculateStats(dataArray) {
        if (!dataArray || dataArray.length === 0) {
            return {
                count: 0,
                avgPower: 0,
                maxPower: 0,
                minPower: 0,
                totalEnergy: 0
            };
        }

        const powers = dataArray.map(item => item.power || 0);
        const energies = dataArray.map(item => item.energy || 0);

        return {
            count: dataArray.length,
            avgPower: powers.reduce((a, b) => a + b, 0) / powers.length,
            maxPower: Math.max(...powers),
            minPower: Math.min(...powers),
            totalEnergy: Math.max(...energies) - Math.min(...energies),
            firstTimestamp: dataArray[0]?.client_timestamp,
            lastTimestamp: dataArray[dataArray.length - 1]?.client_timestamp
        };
    }

    /**
     * Cleanup and disconnect
     */
    disconnect() {
        if (this.database) {
            this.database.goOffline();
        }
        console.log('[Firebase] Disconnected from Firebase');
    }

    /**
     * Get connection status
     */
    isConnected() {
        return this.isInitialized && this.database !== null;
    }
}

// Initialize Firebase integration
window.firebaseIntegration = new FirebaseIntegration();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseIntegration;
}

console.log('[Firebase] Firebase Integration loaded for PT Krakatau Sarana Property');
