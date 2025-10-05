/**
 * Dashboard v1 Mode Control Manager
 * Handles auto and manual mode switching functionality
 */

document.addEventListener('DOMContentLoaded', function () {
    const enableAutoModeBtn = document.getElementById('enable-auto-mode-btn');
    const enableManualModeBtn = document.getElementById('enable-manual-mode-btn');
    const modeStatus = document.getElementById('mode-status');

    // Auto Mode Button Handler
    if (enableAutoModeBtn) {
        enableAutoModeBtn.addEventListener('click', function () {
            activateMode('auto', this);
        });
    }

    // Manual Mode Button Handler
    if (enableManualModeBtn) {
        enableManualModeBtn.addEventListener('click', function () {
            activateMode('manual', this);
        });
    }

    // Generic mode activation function
    function activateMode(mode, buttonElement) {
        // Disable both buttons and show loading state
        enableAutoModeBtn.disabled = true;
        enableManualModeBtn.disabled = true;

        const btnText = buttonElement.querySelector('.btn-text');
        const btnLoading = buttonElement.querySelector('.btn-loading');

        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');

        // Get CSRF token
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
            document.querySelector('input[name="_token"]')?.value;

        // Get route URLs from window object (set by blade template)
        const endpoint = mode === 'auto' ? window.dashboardRoutes.autoMode : window.dashboardRoutes.manualMode;

        // Make AJAX request
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
                'Accept': 'application/json'
            },
            body: JSON.stringify({})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update mode status based on response
                    if (mode === 'auto') {
                        modeStatus.innerHTML = '<i class="fas fa-clock me-1"></i>Mode Otomatis Aktif';
                        modeStatus.className = 'badge bg-success rounded-pill shadow';

                        // Update button states
                        enableAutoModeBtn.className = 'btn btn-sm btn-success';
                        enableManualModeBtn.className = 'btn btn-sm btn-outline-warning';

                        // Reset device states if available
                        if (window.resetDeviceToAutoMode) {
                            window.resetDeviceToAutoMode();
                        }
                    } else {
                        modeStatus.innerHTML = '<i class="fas fa-hand-paper me-1"></i>Mode Manual Aktif';
                        modeStatus.className = 'badge bg-warning rounded-pill shadow';

                        // Update button states
                        enableAutoModeBtn.className = 'btn btn-sm btn-outline-success';
                        enableManualModeBtn.className = 'btn btn-sm btn-warning';

                        // Start manual mode timer if available
                        if (window.startManualModeTimeout) {
                            window.startManualModeTimeout();
                        }
                    }

                    // Show success message
                    showNotification('success', data.message || `Mode ${mode === 'auto' ? 'otomatis' : 'manual'} berhasil diaktifkan!`);

                    // Notify mode manager if available
                    if (window.modeManager) {
                        window.modeManager.checkCurrentMode();
                    }

                    console.log(`${mode} mode activated successfully`);
                } else {
                    throw new Error(data.message || 'Failed to activate mode');
                }
            })
            .catch(error => {
                console.error(`Error activating ${mode} mode:`, error);
                showNotification('error', `Gagal mengaktifkan mode ${mode === 'auto' ? 'otomatis' : 'manual'}. Silakan coba lagi.`);
            })
            .finally(() => {
                // Re-enable buttons and hide loading states
                enableAutoModeBtn.disabled = false;
                enableManualModeBtn.disabled = false;

                // Reset all button loading states
                document.querySelectorAll('.btn-text').forEach(el => el.classList.remove('d-none'));
                document.querySelectorAll('.btn-loading').forEach(el => el.classList.add('d-none'));
            });
    }

    // Notification function
    function showNotification(type, message) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.mode-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mode-notification`;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';

        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
});
