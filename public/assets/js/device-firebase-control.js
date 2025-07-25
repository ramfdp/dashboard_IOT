// Firebase Device Control - Dedicated script for ITMS 1, ITMS 2, and SOS controls
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration
const app = initializeApp({
    apiKey: "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg",
    authDomain: "smart-building-3e5c1.firebaseapp.com",
    databaseURL: "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-building-3e5c1",
    storageBucket: "smart-building-3e5c1.appspot.com",
    messagingSenderId: "693247019169",
    appId: "1:693247019169:web:xxxxxx"
});

const db = getDatabase(app);

// Device control state
let deviceManualMode = false;
let relay1State = null;
let relay2State = null;
let sosState = null;
let manualModeTimer = null;
let lastManualActivity = null;

// Manual mode timeout (10 minutes)
const MANUAL_MODE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

// Function to reset device to auto mode
function resetDeviceToAutoMode() {
    console.log('Resetting device to auto mode');
    deviceManualMode = false;
    lastManualActivity = null;

    // Clear any existing timer
    if (manualModeTimer) {
        clearTimeout(manualModeTimer);
        manualModeTimer = null;
    }

    // Update Firebase to clear manual mode
    set(ref(db, "/relayControl/manualMode"), false);

    // Notify other systems about the mode change
    const event = new CustomEvent('modeChanged', {
        detail: { mode: 'auto', timestamp: Date.now(), source: 'timeout' }
    });
    document.dispatchEvent(event);

    console.log('Device returned to automatic mode');
}

// Function to start manual mode timeout
function startManualModeTimeout() {
    // Clear existing timeout
    if (manualModeTimer) {
        clearTimeout(manualModeTimer);
    }

    lastManualActivity = Date.now();

    // Set timeout to reset to auto mode after inactivity
    manualModeTimer = setTimeout(() => {
        console.log('Manual mode timeout reached - returning to auto mode');
        resetDeviceToAutoMode();
    }, MANUAL_MODE_TIMEOUT);

    console.log(`Manual mode timeout set for ${MANUAL_MODE_TIMEOUT / 1000 / 60} minutes`);

    // Notify mode manager about manual mode activation
    const event = new CustomEvent('modeChanged', {
        detail: { mode: 'manual', timestamp: Date.now(), source: 'user_action' }
    });
    document.dispatchEvent(event);
}// Initialize device controls after DOM and Livewire are ready
function initializeDeviceControls() {
    console.log('Initializing device controls...');

    // Wait for other systems to initialize first
    setTimeout(() => {
        setupDeviceSwitchListeners();
        listenToFirebaseDeviceChanges();
        syncInitialDeviceState();
        initializeDeviceIndicators();

        // Trigger initial mode check after everything is set up
        setTimeout(() => {
            if (window.modeManager) {
                window.modeManager.checkCurrentMode();
            }
        }, 1000);
    }, 2000); // Increased to 2 seconds to prevent race conditions
}

// Set up event listeners for device switches
function setupDeviceSwitchListeners() {
    console.log('Setting up device switch listeners...');

    // ITMS 1 (Relay 1) control
    const relay1Switch = document.querySelector('input[name="relay1"][type="checkbox"].device-switch');
    if (relay1Switch) {
        // Remove existing listeners and clone to prevent conflicts
        const newRelay1Switch = relay1Switch.cloneNode(true);
        relay1Switch.parentNode.replaceChild(newRelay1Switch, relay1Switch);

        newRelay1Switch.addEventListener('change', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const value = this.checked ? 1 : 0;
            console.log('ITMS 1 (Relay1) manually switched to:', value);

            // Set manual mode and start timeout
            deviceManualMode = true;
            set(ref(db, "/relayControl/manualMode"), true);
            startManualModeTimeout();

            // Update Firebase
            set(ref(db, "/relayControl/relay1"), value).then(() => {
                console.log('Relay1 updated in Firebase successfully');
            }).catch((error) => {
                console.error('Error updating Relay1 in Firebase:', error);
            });

            // Update local state
            relay1State = value;

            // Update visual indicator
            updateDeviceIndicator(this, value === 1 ? 'green' : 'grey');

            console.log('Device now in manual mode due to ITMS 1 switch');
        });

        console.log('ITMS 1 switch listener attached');
    } else {
        console.warn('ITMS 1 switch not found');
    }

    // ITMS 2 (Relay 2) control
    const relay2Switch = document.querySelector('input[name="relay2"][type="checkbox"].device-switch');
    if (relay2Switch) {
        // Remove existing listeners and clone to prevent conflicts
        const newRelay2Switch = relay2Switch.cloneNode(true);
        relay2Switch.parentNode.replaceChild(newRelay2Switch, relay2Switch);

        newRelay2Switch.addEventListener('change', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const value = this.checked ? 1 : 0;
            console.log('ITMS 2 (Relay2) manually switched to:', value);

            // Set manual mode and start timeout
            deviceManualMode = true;
            set(ref(db, "/relayControl/manualMode"), true);
            startManualModeTimeout();

            // Update Firebase
            set(ref(db, "/relayControl/relay2"), value).then(() => {
                console.log('Relay2 updated in Firebase successfully');
            }).catch((error) => {
                console.error('Error updating Relay2 in Firebase:', error);
            });

            // Update local state
            relay2State = value;

            // Update visual indicator
            updateDeviceIndicator(this, value === 1 ? 'green' : 'grey');

            console.log('Device now in manual mode due to ITMS 2 switch');
        });

        console.log('ITMS 2 switch listener attached');
    } else {
        console.warn('ITMS 2 switch not found');
    }

    // SOS control
    const sosSwitch = document.querySelector('input[name="sos"][type="checkbox"].device-switch');
    if (sosSwitch) {
        // Remove existing listeners and clone to prevent conflicts
        const newSosSwitch = sosSwitch.cloneNode(true);
        sosSwitch.parentNode.replaceChild(newSosSwitch, sosSwitch);

        newSosSwitch.addEventListener('change', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const value = this.checked ? 1 : 0;
            console.log('SOS manually switched to:', value);

            // Set manual mode and start timeout
            deviceManualMode = true;
            set(ref(db, "/relayControl/manualMode"), true);
            startManualModeTimeout();

            // Update Firebase SOS state
            set(ref(db, "/relayControl/sos"), value).then(() => {
                console.log('SOS updated in Firebase successfully');
            }).catch((error) => {
                console.error('Error updating SOS in Firebase:', error);
            });

            // When SOS is activated, turn on both relays
            if (value === 1) {
                set(ref(db, "/relayControl/relay1"), 1);
                set(ref(db, "/relayControl/relay2"), 1);
                console.log('SOS activated - turning on all relays');
            } else {
                // When SOS is deactivated, turn off both relays
                set(ref(db, "/relayControl/relay1"), 0);
                set(ref(db, "/relayControl/relay2"), 0);
                console.log('SOS deactivated - turning off all relays');
            }

            // Update local state
            sosState = value;
            relay1State = value;
            relay2State = value;

            // Update visual indicator
            updateDeviceIndicator(this, value === 1 ? 'red' : 'grey');

            console.log('Device now in manual mode due to SOS switch');
        });

        console.log('SOS switch listener attached');
    } else {
        console.warn('SOS switch not found');
    }
}

// Listen to Firebase changes and update UI
function listenToFirebaseDeviceChanges() {
    console.log('Setting up Firebase listeners...');

    // Listen to Relay1 changes
    onValue(ref(db, "/relayControl/relay1"), (snapshot) => {
        const value = snapshot.val();
        console.log('Firebase Relay1 changed to:', value);

        const relay1Switch = document.querySelector('input[name="relay1"][type="checkbox"].device-switch');
        if (relay1Switch) {
            // Always sync Firebase state to UI to maintain consistency
            if (relay1Switch.checked !== (value === 1)) {
                relay1Switch.checked = (value === 1);
                relay1State = value;
                updateDeviceIndicator(relay1Switch, value === 1 ? 'green' : 'grey');
                console.log('UI updated for Relay1:', value);
            }
        }
    });

    // Listen to Relay2 changes
    onValue(ref(db, "/relayControl/relay2"), (snapshot) => {
        const value = snapshot.val();
        console.log('Firebase Relay2 changed to:', value);

        const relay2Switch = document.querySelector('input[name="relay2"][type="checkbox"].device-switch');
        if (relay2Switch) {
            // Always sync Firebase state to UI to maintain consistency
            if (relay2Switch.checked !== (value === 1)) {
                relay2Switch.checked = (value === 1);
                relay2State = value;
                updateDeviceIndicator(relay2Switch, value === 1 ? 'green' : 'grey');
                console.log('UI updated for Relay2:', value);
            }
        }
    });

    // Listen to SOS changes
    onValue(ref(db, "/relayControl/sos"), (snapshot) => {
        const value = snapshot.val();
        console.log('Firebase SOS changed to:', value);

        const sosSwitch = document.querySelector('input[name="sos"][type="checkbox"].device-switch');
        if (sosSwitch) {
            if (sosSwitch.checked !== (value === 1)) {
                sosSwitch.checked = (value === 1);
                sosState = value;
                updateDeviceIndicator(sosSwitch, value === 1 ? 'red' : 'grey');
                console.log('UI updated for SOS:', value);
            }
        }
    });

    // Listen to manual mode changes to provide better logging
    onValue(ref(db, "/relayControl/manualMode"), (snapshot) => {
        const value = snapshot.val();
        console.log('Firebase manualMode changed to:', value);

        if (value === true) {
            console.log('Device is now in MANUAL mode - automatic schedules suspended');
        } else {
            console.log('Device is now in AUTO mode - schedules will control relays');
        }
    });
}

// Sync initial state from Firebase
function syncInitialDeviceState() {
    console.log('Syncing initial device state...');

    // Get initial Relay1 state
    onValue(ref(db, "/relayControl/relay1"), (snapshot) => {
        const value = snapshot.val();
        if (value !== null) {
            const relay1Switch = document.querySelector('input[name="relay1"][type="checkbox"].device-switch');
            if (relay1Switch) {
                relay1Switch.checked = (value === 1);
                relay1State = value;
                updateDeviceIndicator(relay1Switch, value === 1 ? 'green' : 'grey');
                console.log('Initial Relay1 state:', value);
            }
        }
    }, { once: true });

    // Get initial Relay2 state
    onValue(ref(db, "/relayControl/relay2"), (snapshot) => {
        const value = snapshot.val();
        if (value !== null) {
            const relay2Switch = document.querySelector('input[name="relay2"][type="checkbox"].device-switch');
            if (relay2Switch) {
                relay2Switch.checked = (value === 1);
                relay2State = value;
                updateDeviceIndicator(relay2Switch, value === 1 ? 'green' : 'grey');
                console.log('Initial Relay2 state:', value);
            }
        }
    }, { once: true });

    // Get initial SOS state
    onValue(ref(db, "/relayControl/sos"), (snapshot) => {
        const value = snapshot.val();
        if (value !== null) {
            const sosSwitch = document.querySelector('input[name="sos"][type="checkbox"].device-switch');
            if (sosSwitch) {
                sosSwitch.checked = (value === 1);
                sosState = value;
                updateDeviceIndicator(sosSwitch, value === 1 ? 'red' : 'grey');
                console.log('Initial SOS state:', value);
            }
        }
    }, { once: true });
}

// Update visual indicator for a switch
function updateDeviceIndicator(switchElement, color) {
    const indicator = switchElement.closest(".d-flex")?.querySelector(".indicator");
    if (indicator) {
        indicator.style.backgroundColor = color;
    }
}

// Initialize indicators on page load
function initializeDeviceIndicators() {
    console.log('Initializing device indicators...');

    // Add indicators if they don't exist
    document.querySelectorAll('.device-switch').forEach(switchEl => {
        const container = switchEl.closest('.d-flex');
        if (container && !container.querySelector('.indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.style.cssText = `
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: grey;
                margin-left: 10px;
                transition: background-color 0.3s ease;
            `;
            container.appendChild(indicator);
        }
    });
}

// Manual control function for external use
function manualDeviceControl(device, value) {
    console.log(`Manual control: ${device} = ${value}`);

    // Set manual mode and start timeout
    deviceManualMode = true;
    set(ref(db, "/relayControl/manualMode"), true);
    startManualModeTimeout();

    if (device === 'relay1') {
        set(ref(db, "/relayControl/relay1"), value);
        relay1State = value;
    } else if (device === 'relay2') {
        set(ref(db, "/relayControl/relay2"), value);
        relay2State = value;
    } else if (device === 'sos') {
        set(ref(db, "/relayControl/sos"), value);
        if (value === 1) {
            set(ref(db, "/relayControl/relay1"), 1);
            set(ref(db, "/relayControl/relay2"), 1);
        } else {
            set(ref(db, "/relayControl/relay1"), 0);
            set(ref(db, "/relayControl/relay2"), 0);
        }
        sosState = value;
        relay1State = value;
        relay2State = value;
    }
}

// Get current device states
function getDeviceStates() {
    return {
        relay1: relay1State,
        relay2: relay2State,
        sos: sosState,
        manualMode: deviceManualMode,
        lastManualActivity: lastManualActivity,
        manualModeTimeoutActive: manualModeTimer !== null
    };
}

// Function to show manual mode notification with countdown
function showManualModeNotification() {
    if (!deviceManualMode || !lastManualActivity) return;

    const remainingTime = MANUAL_MODE_TIMEOUT - (Date.now() - lastManualActivity);
    const remainingMinutes = Math.ceil(remainingTime / (1000 * 60));

    if (remainingMinutes > 0) {
        console.log(`Manual mode active - will return to auto mode in ${remainingMinutes} minutes`);

        // Let ModeManager handle the display to avoid conflicts
        if (window.modeManager) {
            window.modeManager.updateModeDisplay();
        }
    }
}// Update manual mode status every minute
setInterval(() => {
    if (deviceManualMode) {
        showManualModeNotification();
    }
}, 60000); // Update every minute

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDeviceControls);

// Re-initialize after Livewire updates
document.addEventListener('livewire:navigated', initializeDeviceControls);
document.addEventListener('livewire:load', initializeDeviceControls);

// Export functions for global access
window.manualDeviceControl = manualDeviceControl;
window.getDeviceStates = getDeviceStates;
window.initializeDeviceControls = initializeDeviceControls;
window.resetDeviceToAutoMode = resetDeviceToAutoMode;
window.showManualModeNotification = showManualModeNotification;
window.startManualModeTimeout = startManualModeTimeout;

console.log('Device Firebase Control script loaded');
