// Mode Management Script
class ModeManager {
    constructor() {
        this.currentMode = 'auto'; // default to auto
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
            }

            // Listen for auto mode activation
            if (e.target.action && e.target.action.includes('dashboard/auto-mode')) {
                console.log('Auto mode form submitted');
                // Immediately switch to auto mode and reset any manual timers
                this.switchToAutoMode();

                // Reset device manual mode
                if (window.resetDeviceToAutoMode) {
                    window.resetDeviceToAutoMode();
                }

                // Update display after form submission
                setTimeout(() => {
                    this.checkCurrentMode();
                }, 1000);
            }
        });
    }

    switchToManualMode() {
        this.currentMode = 'manual';
        this.updateModeDisplay();
        console.log('Switched to manual mode');

        // Notify other systems about mode change
        this.broadcastModeChange('manual');

        // Show notification
        this.showModeNotification('Manual mode activated. Schedules are temporarily disabled.', 'warning');
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

    broadcastModeChange(mode) {
        // Dispatch custom event that other scripts can listen to
        const event = new CustomEvent('modeChanged', {
            detail: { mode: mode, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    updateModeDisplay() {
        const modeStatus = document.getElementById('mode-status');
        if (modeStatus) {
            // Check if device is manually controlled (higher priority)
            const deviceStates = window.getDeviceStates?.() || {};
            const sosActive = document.querySelector('input[name="sos"][type="checkbox"].device-switch')?.checked;

            if (sosActive) {
                modeStatus.innerHTML = '<i class="fa fa-exclamation-triangle"></i> Mode SOS Aktif - Semua Relay ON';
                modeStatus.className = 'badge bg-danger rounded-pill shadow';
                return;
            }

            if (deviceStates.manualMode && deviceStates.lastManualActivity) {
                const remainingTime = (deviceStates.lastManualActivity + (10 * 60 * 1000)) - Date.now();
                const remainingMinutes = Math.ceil(remainingTime / (1000 * 60));

                if (remainingMinutes > 0) {
                    modeStatus.innerHTML = `<i class="fa fa-hand-pointer"></i> Mode Manual Aktif (Auto dalam ${remainingMinutes} menit)`;
                    modeStatus.className = 'badge bg-warning rounded-pill shadow';
                    return;
                }
            }

            // Default to current mode
            if (this.currentMode === 'manual') {
                modeStatus.innerHTML = '<i class="fa fa-hand-pointer"></i> Mode Manual Aktif';
                modeStatus.className = 'badge bg-warning rounded-pill shadow';
            } else {
                modeStatus.innerHTML = '<i class="fa fa-robot"></i> Mode Otomatis Aktif';
                modeStatus.className = 'badge bg-success rounded-pill shadow';
            }
        }
    }

    checkCurrentMode() {
        // Check with server what mode we're in
        fetch('/api/check-schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.manual_mode) {
                    this.currentMode = 'manual';
                } else {
                    this.currentMode = 'auto';
                }
                this.updateModeDisplay();
            })
            .catch(error => {
                console.error('Error checking current mode:', error);
                // Default to auto mode if check fails
                this.currentMode = 'auto';
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
});
