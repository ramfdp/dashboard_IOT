// Mode Management Script
class ModeManager {
    constructor() {
        this.currentMode = 'auto'; // default to auto
        this.autoModeTimer = null; // Timer for automatic return to auto mode
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkCurrentMode();
    }

    setupEventListeners() {
        // Listen for manual device switch changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('device-switch')) {
                console.log('Device switch changed - activating manual mode');
                this.switchToManualMode();
            }
        });

        // Listen for form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.action && e.target.action.includes('dashboard/update')) {
                console.log('Manual device update form submitted');
                this.switchToManualMode();
                return; // Prevent auto mode activation
            }

            // Listen for auto mode activation
            if (e.target.action && e.target.action.includes('dashboard/auto-mode')) {
                console.log('Auto mode form submitted');
                e.preventDefault(); // Prevent form submission temporarily

                // Immediately switch to auto mode and reset any manual timers
                this.activateAutoMode();

                // Submit the form after mode switch
                setTimeout(() => {
                    e.target.submit();
                }, 100);
            }
        });

        // Listen for auto mode button clicks specifically
        document.addEventListener('click', (e) => {
            if (e.target.closest('button[type="submit"]') &&
                e.target.closest('form[action*="dashboard/auto-mode"]')) {
                console.log('Auto mode button clicked');
                e.preventDefault();
                this.activateAutoMode();

                // Submit the form after a short delay
                setTimeout(() => {
                    e.target.closest('form').submit();
                }, 200);
            }
        });
    }

    switchToManualMode() {
        this.currentMode = 'manual';

        // Set manual mode in local storage with timestamp
        localStorage.setItem('manualMode', 'true');
        localStorage.setItem('lastManualActivity', Date.now().toString());

        this.updateModeDisplay();
        console.log('Switched to manual mode');

        // Notify other systems about mode change
        this.broadcastModeChange('manual');

        // Show notification
        this.showModeNotification('Manual mode activated. Schedules are temporarily disabled for 10 minutes.', 'warning');

        // Set timer to automatically return to auto mode after 10 minutes
        this.setAutoModeTimer();
    }

    setAutoModeTimer() {
        // Clear any existing timer
        if (this.autoModeTimer) {
            clearTimeout(this.autoModeTimer);
        }

        // Set 10-minute timer to return to auto mode
        this.autoModeTimer = setTimeout(() => {
            console.log('10 minutes elapsed, returning to auto mode');
            localStorage.removeItem('manualMode');
            localStorage.removeItem('lastManualActivity');
            this.currentMode = 'auto';
            this.updateModeDisplay();
            this.broadcastModeChange('auto');
            this.showModeNotification('Automatic mode restored after 10 minutes.', 'info');

            // Force check schedules
            if (window.lightScheduleManager && window.lightScheduleManager.checkSchedules) {
                window.lightScheduleManager.checkSchedules();
            }
        }, 10 * 60 * 1000); // 10 minutes
    }

    switchToAutoMode() {
        this.currentMode = 'auto';
        this.updateModeDisplay();
        console.log('Switched to auto mode');

        // Notify other systems about mode change
        this.broadcastModeChange('auto');

        // Show notification
        this.showModeNotification('Auto mode activated. Schedules will control devices.', 'success');
    }

    activateAutoMode() {
        console.log('Activating auto mode...');

        // Clear any existing manual mode timer
        if (this.autoModeTimer) {
            clearTimeout(this.autoModeTimer);
            this.autoModeTimer = null;
        }

        // Force switch to auto mode
        this.currentMode = 'auto';

        // Clear any manual mode timers
        if (window.clearManualModeTimer) {
            window.clearManualModeTimer();
        }

        // Reset device manual mode states
        if (window.resetDeviceToAutoMode) {
            window.resetDeviceToAutoMode();
        }

        // Clear manual mode from local storage
        localStorage.removeItem('manualMode');
        localStorage.removeItem('lastManualActivity');

        // Update display immediately
        this.updateModeDisplay();

        // Notify other systems
        this.broadcastModeChange('auto');

        // Show success notification
        this.showModeNotification('Auto mode forcefully activated. All manual overrides cleared.', 'success');

        // Force check schedules
        if (window.lightScheduleManager && window.lightScheduleManager.checkSchedules) {
            setTimeout(() => {
                window.lightScheduleManager.checkSchedules();
            }, 500);
        }
    }

    broadcastModeChange(mode) {
        // Dispatch custom event that other scripts can listen to
        const event = new CustomEvent('modeChanged', {
            detail: { mode: mode, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    updateModeDisplay() {
        const modeStatus = document.getElementById('mode-status');
        if (!modeStatus) {
            console.log('Mode status element not found');
            return;
        }

        // Check SOS mode first (highest priority)
        const sosActive = document.querySelector('input[name="sos"][type="checkbox"].device-switch')?.checked;
        if (sosActive) {
            modeStatus.innerHTML = '<i class="fa fa-exclamation-triangle me-2"></i>Mode SOS Aktif - Semua Relay ON';
            modeStatus.className = 'badge bg-danger rounded-pill shadow';
            modeStatus.style.fontSize = '1.25rem';
            modeStatus.style.padding = '0.75rem 1.25rem';
            return;
        }

        // Check for device manual mode states
        const deviceStates = window.getDeviceStates?.() || {};
        const manualModeActive = localStorage.getItem('manualMode') === 'true';
        const lastManualActivity = parseInt(localStorage.getItem('lastManualActivity') || '0');

        if (manualModeActive && lastManualActivity) {
            const remainingTime = (lastManualActivity + (10 * 60 * 1000)) - Date.now();
            const remainingMinutes = Math.ceil(remainingTime / (1000 * 60));

            if (remainingMinutes > 0) {
                modeStatus.innerHTML = `<i class="fa fa-hand-pointer me-2"></i>Mode Manual Aktif (Auto dalam ${remainingMinutes} menit)`;
                modeStatus.className = 'badge bg-warning rounded-pill shadow';
                modeStatus.style.fontSize = '1.25rem';
                modeStatus.style.padding = '0.75rem 1.25rem';
                return;
            } else {
                // Manual mode expired, clear it
                localStorage.removeItem('manualMode');
                localStorage.removeItem('lastManualActivity');
                this.currentMode = 'auto';
            }
        }

        // Default mode display based on current mode
        if (this.currentMode === 'manual') {
            modeStatus.innerHTML = '<i class="fa fa-hand-pointer me-2"></i>Mode Manual Aktif';
            modeStatus.className = 'badge bg-warning rounded-pill shadow';
        } else {
            modeStatus.innerHTML = '<i class="fa fa-robot me-2"></i>Mode Otomatis Aktif';
            modeStatus.className = 'badge bg-success rounded-pill shadow';
        }

        // Ensure consistent styling
        modeStatus.style.fontSize = '1.25rem';
        modeStatus.style.padding = '0.75rem 1.25rem';
    }

    checkCurrentMode() {
        // Check local storage first for immediate feedback
        const localManualMode = localStorage.getItem('manualMode') === 'true';
        const lastManualActivity = parseInt(localStorage.getItem('lastManualActivity') || '0');

        if (localManualMode && lastManualActivity) {
            const timeSinceManual = Date.now() - lastManualActivity;
            if (timeSinceManual < (10 * 60 * 1000)) { // 10 minutes
                this.currentMode = 'manual';
                this.updateModeDisplay();
                return;
            } else {
                // Manual mode expired
                localStorage.removeItem('manualMode');
                localStorage.removeItem('lastManualActivity');
                this.currentMode = 'auto';
                this.updateModeDisplay();
                return;
            }
        }

        // Check with server what mode we're in
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) {
            console.log('CSRF token not found, defaulting to auto mode');
            this.currentMode = 'auto';
            this.updateModeDisplay();
            return;
        }

        fetch(`${window.baseUrl}/api/check-schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Server mode check response:', data);
                if (data.manual_mode) {
                    this.currentMode = 'manual';
                    // Update local storage
                    localStorage.setItem('manualMode', 'true');
                    localStorage.setItem('lastManualActivity', Date.now().toString());
                } else {
                    this.currentMode = 'auto';
                    // Clear local storage
                    localStorage.removeItem('manualMode');
                    localStorage.removeItem('lastManualActivity');
                }
                this.updateModeDisplay();
            })
            .catch(error => {
                console.error('Error checking current mode:', error);
                // Default to auto mode if check fails
                this.currentMode = 'auto';
                localStorage.removeItem('manualMode');
                localStorage.removeItem('lastManualActivity');
                this.updateModeDisplay();
            });
    }

    showModeNotification(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.style.position = 'fixed';
        toast.style.top = '80px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.setAttribute('role', 'alert');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fa fa-cog me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        document.body.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 4000
        });
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Initialize mode manager
document.addEventListener('DOMContentLoaded', function () {
    window.modeManager = new ModeManager();

    // Expose useful functions globally
    window.clearManualModeTimer = function () {
        if (window.modeManager && window.modeManager.autoModeTimer) {
            clearTimeout(window.modeManager.autoModeTimer);
            window.modeManager.autoModeTimer = null;
            console.log('Manual mode timer cleared');
        }
    };

    window.forceAutoMode = function () {
        if (window.modeManager) {
            window.modeManager.activateAutoMode();
        }
    };

    window.checkCurrentMode = function () {
        if (window.modeManager) {
            window.modeManager.checkCurrentMode();
        }
    };
});

// Update mode display every minute to show remaining time
setInterval(function () {
    if (window.modeManager) {
        window.modeManager.updateModeDisplay();
    }
}, 60000); // Every minute
