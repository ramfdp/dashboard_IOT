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
let relay3State = null;
let relay4State = null;
let relay5State = null;
let relay6State = null;
let relay7State = null;
let relay8State = null;
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
    console.log('[Timeout DISABLED] Manual mode akan aktif permanen hingga dinonaktifkan pengguna.');

    lastManualActivity = Date.now();

    // Kosongkan timer
    if (manualModeTimer) {
        clearTimeout(manualModeTimer);
        manualModeTimer = null;
    }

    // Tetap kirim event
    const event = new CustomEvent('modeChanged', {
        detail: { mode: 'manual', timestamp: Date.now(), source: 'user_action' }
    });
    document.dispatchEvent(event);
}

// Initialize device controls after DOM and Livewire are ready
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

    // Function to create switch listener
    function createSwitchListener(relayNum) {
        const relaySwitch = document.querySelector(`input[name="relay${relayNum}"][type="checkbox"].device-switch`);
        if (relaySwitch) {
            // Remove existing listeners and clone to prevent conflicts
            const newRelaySwitch = relaySwitch.cloneNode(true);
            relaySwitch.parentNode.replaceChild(newRelaySwitch, relaySwitch);

            newRelaySwitch.addEventListener('change', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const value = this.checked ? 1 : 0;
                console.log(`Relay ${relayNum} manually switched to:`, value);

                // Set manual mode and start timeout
                deviceManualMode = true;
                set(ref(db, "/relayControl/manualMode"), true);
                startManualModeTimeout();

                // Update Firebase
                set(ref(db, `/relayControl/relay${relayNum}`), value).then(() => {
                    console.log(`Relay${relayNum} updated in Firebase successfully`);
                }).catch((error) => {
                    console.error(`Error updating Relay${relayNum} in Firebase:`, error);
                });

                // Update local state
                window[`relay${relayNum}State`] = value;

                // Update visual indicator
                updateDeviceIndicator(this, value === 1 ? 'success' : 'grey');

                console.log(`Device now in manual mode due to Relay ${relayNum} switch`);
            });

            console.log(`Relay ${relayNum} switch listener attached`);
        } else {
            console.warn(`Relay ${relayNum} switch not found`);
        }
    }

    // Create listeners for all 8 relays
    for (let i = 1; i <= 8; i++) {
        createSwitchListener(i);
    }
}

// Listen to Firebase changes and update UI
function listenToFirebaseDeviceChanges() {
    console.log('Setting up Firebase listeners...');

    // Function to create Firebase listener for each relay
    function createFirebaseListener(relayNum) {
        onValue(ref(db, `/relayControl/relay${relayNum}`), (snapshot) => {
            const value = snapshot.val();
            const currentState = window[`relay${relayNum}State`];

            // Only process if value actually changed
            if (value !== null && value !== currentState) {
                console.log(`Firebase Relay${relayNum} changed to:`, value);

                const relaySwitch = document.querySelector(`input[name="relay${relayNum}"][type="checkbox"].device-switch`);
                if (relaySwitch) {
                    relaySwitch.checked = (value === 1);
                    window[`relay${relayNum}State`] = value;
                    updateDeviceIndicator(relaySwitch, value === 1 ? 'success' : 'grey');
                    console.log(`UI updated for Relay${relayNum}:`, value);
                }
            }
        });
    }

    // Create Firebase listeners for all 8 relays
    for (let i = 1; i <= 8; i++) {
        createFirebaseListener(i);
    }

    // Listen to manual mode changes to provide better logging
    onValue(ref(db, "/relayControl/manualMode"), (snapshot) => {
        const value = snapshot.val();

        // Only process if the manual mode state actually changed
        if (value !== null && deviceManualMode !== value) {
            console.log('Firebase manualMode changed to:', value);
            deviceManualMode = value;

            if (value === true) {
                console.log('Device is now in MANUAL mode - automatic schedules suspended');
                startManualModeTimeout();
            } else {
                console.log('Device is now in AUTO mode - schedules will control relays');
                // Clear manual mode timer when auto mode is active
                if (manualModeTimer) {
                    clearTimeout(manualModeTimer);
                    manualModeTimer = null;
                }
                lastManualActivity = null;
            }
        }
    });
}

// Sync initial state from Firebase
function syncInitialDeviceState() {
    console.log('Syncing initial device state...');

    // Function to sync initial state for each relay
    function syncRelayState(relayNum) {
        onValue(ref(db, `/relayControl/relay${relayNum}`), (snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                const relaySwitch = document.querySelector(`input[name="relay${relayNum}"][type="checkbox"].device-switch`);
                if (relaySwitch) {
                    relaySwitch.checked = (value === 1);
                    window[`relay${relayNum}State`] = value;
                    updateDeviceIndicator(relaySwitch, value === 1 ? 'success' : 'grey');
                    console.log(`Initial Relay${relayNum} state:`, value);
                }
            }
        }, { once: true });
    }

    // Sync initial state for all 8 relays
    for (let i = 1; i <= 8; i++) {
        syncRelayState(i);
    }
}

// Update visual indicator for a switch
function updateDeviceIndicator(switchElement, color) {
    // Update status text
    const relayName = switchElement.name;
    const statusElement = document.querySelector(`.${relayName}-status`);
    if (statusElement) {
        const isOn = switchElement.checked;
        statusElement.textContent = isOn ? 'ON' : 'OFF';
        statusElement.style.color = isOn ? '#28a745' : '#6c757d';
    }

    // Update device icon - find the lightbulb icon in the same card
    const card = switchElement.closest('.device-control-card');
    if (card) {
        const lightbulbIcon = card.querySelector('.device-icon .fa-lightbulb');
        if (lightbulbIcon) {
            // Remove existing color classes and add new one
            lightbulbIcon.classList.remove('text-warning', 'text-success', 'text-secondary');
            lightbulbIcon.classList.add(switchElement.checked ? 'text-success' : 'text-secondary');
        }
    }
}

// Initialize indicators on page load
function initializeDeviceIndicators() {
    console.log('Initializing device indicators...');

    // Update all device switches to reflect their current state
    document.querySelectorAll('.device-switch').forEach(switchEl => {
        // Update the visual indicators based on current state
        updateDeviceIndicator(switchEl, switchEl.checked ? 'success' : 'grey');
    });
}

// Manual control function for external use
function manualDeviceControl(device, value) {
    console.log(`Manual control: ${device} = ${value}`);

    // Set manual mode and start timeout
    deviceManualMode = true;
    set(ref(db, "/relayControl/manualMode"), true);
    startManualModeTimeout();

    // Support all 8 relays
    if (device.match(/^relay[1-8]$/)) {
        set(ref(db, `/relayControl/${device}`), value);
        const relayNum = device.replace('relay', '');
        window[`relay${relayNum}State`] = value;
    }
}

// Get current device states
function getDeviceStates() {
    return {
        relay1: relay1State,
        relay2: relay2State,
        relay3: relay3State,
        relay4: relay4State,
        relay5: relay5State,
        relay6: relay6State,
        relay7: relay7State,
        relay8: relay8State,
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
