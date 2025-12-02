// Schedule monitoring and execution
class LightScheduleManager {
    constructor() {
        this.checkInterval = null;
        this.init();
    }

    init() {
        console.log('Light Schedule Manager initialized');
        this.startScheduleMonitoring();
        this.setupEventListeners();
        this.setupModeChangeListener();
    }

    setupModeChangeListener() {
        // Listen for mode changes from ModeManager
        document.addEventListener('modeChanged', (e) => {
            console.log('Schedule Manager: Mode changed to', e.detail.mode);
            if (e.detail.mode === 'manual') {
                this.clearScheduleIndicators();
                console.log('Schedule monitoring paused - manual mode active');
            } else if (e.detail.mode === 'auto') {
                console.log('Schedule monitoring resumed - auto mode active');
                // Check schedules immediately when switching to auto mode
                setTimeout(() => this.checkSchedules(), 1000);
            }
        });
    }

    startScheduleMonitoring() {
        console.log('Starting schedule monitoring - this is now the ONLY relay control system');

        // Check schedules every 2 minutes to ensure proper control
        this.checkInterval = setInterval(() => {
            this.checkSchedules();
        }, 120000); // 2 minutes

        // Initial check after 5 seconds to avoid conflicts with page load
        setTimeout(() => {
            this.checkSchedules();
        }, 5000);
    }

    async checkSchedules() {
        try {
            console.log('Checking light schedules...');

            const response = await fetch(`${window.baseUrl}/api/check-schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.lastResponse = data; // Store response for manual mode checking
                console.log('Schedule check response:', data);

                if (data.success && !data.manual_mode && !data.overtime_active) {
                    this.updateDeviceStatus(data.active_devices, data.inactive_devices);
                    this.showScheduleNotification(data);
                } else if (data.manual_mode) {
                    console.log('Device is in manual mode - schedule control suspended');
                    this.clearScheduleIndicators();
                } else if (data.overtime_active) {
                    console.log('Overtime is active - schedule control suspended, maintaining lights ON');
                    this.clearScheduleIndicators();
                    // Add overtime indicator
                    this.addOvertimeIndicators();
                }
            } else {
                console.error('Failed to check schedules:', response.statusText);
            }
        } catch (error) {
            console.error('Error checking schedules:', error);
        }
    }

    updateDeviceStatus(activeDevices, inactiveDevices) {
        // Don't update UI if response indicates manual mode or overtime active
        if (this.lastResponse && (this.lastResponse.manual_mode || this.lastResponse.overtime_active)) {
            console.log('Skipping UI update - device in manual mode or overtime active');
            return;
        }

        // Ensure activeDevices and inactiveDevices are arrays
        const safeActiveDevices = Array.isArray(activeDevices) ? activeDevices : [];
        const safeInactiveDevices = Array.isArray(inactiveDevices) ? inactiveDevices : [];

        // Update the UI to reflect current device states
        const deviceSwitches = document.querySelectorAll('.device-switch');

        deviceSwitches.forEach(switchElement => {
            const deviceName = switchElement.getAttribute('name');

            if (safeActiveDevices.includes(deviceName)) {
                switchElement.checked = true;
                this.addScheduleIndicator(switchElement, 'active');
            } else if (safeInactiveDevices.includes(deviceName)) {
                switchElement.checked = false;
                this.addScheduleIndicator(switchElement, 'inactive');
            }
        });
    }

    addScheduleIndicator(switchElement, status) {
        // Add visual indicator that device is controlled by schedule
        const container = switchElement.closest('.card');
        if (container) {
            // Remove existing indicators
            const existingIndicator = container.querySelector('.schedule-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }

            // Add new indicator
            const indicator = document.createElement('div');
            indicator.className = `schedule-indicator badge ${status === 'active' ? 'bg-success' : 'bg-secondary'}`;
            indicator.innerHTML = `<i class="fa fa-clock"></i> Scheduled ${status === 'active' ? 'ON' : 'OFF'}`;
            indicator.style.position = 'absolute';
            indicator.style.top = '10px';
            indicator.style.right = '10px';
            indicator.style.fontSize = '0.75rem';

            container.style.position = 'relative';
            container.appendChild(indicator);
        }
    }

    clearScheduleIndicators() {
        // Remove all schedule indicators when in manual mode
        const indicators = document.querySelectorAll('.schedule-indicator');
        indicators.forEach(indicator => indicator.remove());
    }

    addOvertimeIndicators() {
        // Add overtime indicators to show devices are controlled by overtime
        const deviceCards = document.querySelectorAll('.device-control-card');
        deviceCards.forEach(card => {
            // Remove existing indicators
            const existingIndicator = card.querySelector('.schedule-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }

            // Add overtime indicator
            const indicator = document.createElement('div');
            indicator.className = 'schedule-indicator badge bg-warning';
            indicator.innerHTML = '<i class="fa fa-briefcase"></i> Overtime Active';
            indicator.style.position = 'absolute';
            indicator.style.top = '10px';
            indicator.style.right = '10px';
            indicator.style.fontSize = '0.75rem';

            card.style.position = 'relative';
            card.appendChild(indicator);
        });
    }

    showScheduleNotification(data) {
        // Show a subtle notification about schedule execution
        if (data.overtime_active) {
            this.showToast('Overtime is active - devices controlled by overtime system', 'warning');
        } else {
            const activeDevices = Array.isArray(data.active_devices) ? data.active_devices : [];
            const inactiveDevices = Array.isArray(data.inactive_devices) ? data.inactive_devices : [];

            if (activeDevices.length > 0 || inactiveDevices.length > 0) {
                const message = `Schedule executed: ${activeDevices.length} device(s) turned ON, ${inactiveDevices.length} device(s) turned OFF`;
                this.showToast(message, 'info');
            }
        }
    }

    showToast(message, type = 'info') {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'info' ? 'primary' : type} border-0`;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fa fa-clock me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        document.body.appendChild(toast);

        // Initialize and show toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 5000
        });
        bsToast.show();

        // Remove toast element after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    setupEventListeners() {
        // Manual schedule check button
        const checkBtn = document.getElementById('manual-schedule-check');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                this.checkSchedules();
            });
        }

        // Prevent device switches from being manually changed when controlled by schedule
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('device-switch')) {
                const indicator = e.target.closest('.card').querySelector('.schedule-indicator');
                if (indicator && indicator.textContent.includes('Scheduled')) {
                    e.preventDefault();
                    this.showToast('This device is currently controlled by a schedule. Disable the schedule to control manually.', 'warning');
                    return false;
                }
            }
        });
    }

    stopScheduleMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Manual schedule execution for testing
    async executeScheduleManually() {
        console.log('Manually executing schedule check...');
        await this.checkSchedules();
    }
}

// Initialize the schedule manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    window.lightScheduleManager = new LightScheduleManager();
});

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LightScheduleManager;
}
