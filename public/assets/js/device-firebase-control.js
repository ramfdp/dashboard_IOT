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

// Function to reset device to auto mode
function resetDeviceToAutoMode() {
    console.log('Resetting device to auto mode');
    deviceManualMode = false;

    // Clear any existing timer
    if (manualModeTimer) {
        clearTimeout(manualModeTimer);
        manualModeTimer = null;
    }
}

// Initialize device controls after DOM and Livewire are ready
function initializeDeviceControls() {
    console.log('Initializing device controls...');

    // Wait for DOM and Livewire to be ready
    setTimeout(() => {
        setupDeviceSwitchListeners();
        listenToFirebaseDeviceChanges();
        syncInitialDeviceState();
        initializeDeviceIndicators();
    }, 1000);
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

            // Set manual mode and clear any auto-reset timer
            deviceManualMode = true;
            if (manualModeTimer) {
                clearTimeout(manualModeTimer);
                manualModeTimer = null;
            }

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

            // Set manual mode and clear any auto-reset timer
            deviceManualMode = true;
            if (manualModeTimer) {
                clearTimeout(manualModeTimer);
                manualModeTimer = null;
            }

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

            // Set manual mode and clear any auto-reset timer
            deviceManualMode = true;
            if (manualModeTimer) {
                clearTimeout(manualModeTimer);
                manualModeTimer = null;
            }

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
        if (relay1Switch && relay1Switch.checked !== (value === 1)) {
            // Only update UI if this change is not from manual operation
            // (Firebase changes from other sources like overtime system)
            relay1Switch.checked = (value === 1);
            relay1State = value;
            updateDeviceIndicator(relay1Switch, value === 1 ? 'green' : 'grey');
        }
    });

    // Listen to Relay2 changes
    onValue(ref(db, "/relayControl/relay2"), (snapshot) => {
        const value = snapshot.val();
        console.log('Firebase Relay2 changed to:', value);

        const relay2Switch = document.querySelector('input[name="relay2"][type="checkbox"].device-switch');
        if (relay2Switch && relay2Switch.checked !== (value === 1)) {
            // Only update UI if this change is not from manual operation
            relay2Switch.checked = (value === 1);
            relay2State = value;
            updateDeviceIndicator(relay2Switch, value === 1 ? 'green' : 'grey');
        }
    });

    // Listen to SOS changes
    onValue(ref(db, "/relayControl/sos"), (snapshot) => {
        const value = snapshot.val();
        console.log('Firebase SOS changed to:', value);

        const sosSwitch = document.querySelector('input[name="sos"][type="checkbox"].device-switch');
        if (sosSwitch && sosSwitch.checked !== (value === 1)) {
            sosSwitch.checked = (value === 1);
            sosState = value;
            updateDeviceIndicator(sosSwitch, value === 1 ? 'red' : 'grey');
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

    deviceManualMode = true;
}

// Get current device states
function getDeviceStates() {
    return {
        relay1: relay1State,
        relay2: relay2State,
        sos: sosState,
        manualMode: deviceManualMode
    };
}

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

console.log('Device Firebase Control script loaded');
