/**
 * Dashboard Current Usage
 * Handles real-time current usage data separately from period analysis
 * Updates more frequently for live monitoring
 */

class DashboardCurrentUsage {
    constructor() {
        this.updateInterval = null;
        // DISABLED: Menggunakan Firebase listener dari auto-pzem-values.js
        // this.init();
        console.log('[CurrentUsage] ⚠️ Disabled - menggunakan Firebase listener');
    }

    init() {
        // DISABLED
        // this.loadCurrentUsage();
        // this.startAutoUpdate();
    }

    async loadCurrentUsage() {
        try {
            const response = await fetch(`${window.baseUrl}/api/electricity/current-usage`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.updateCurrentUsageDisplay(result);

                // Current usage updated successfully
            } else {
                console.error('Failed to load current usage:', result.message);
                this.showError('Gagal memuat data penggunaan saat ini');
            }
        } catch (error) {
            console.error('Error loading current usage:', error);
            this.showError('Error koneksi saat memuat penggunaan saat ini');
        }
    }

    /**
     * Start auto-update interval untuk current usage
     */
    startAutoUpdate() {
        // Update every 15 seconds for current usage
        this.updateInterval = setInterval(() => {
            this.loadCurrentUsage();
        }, 15 * 1000); // Update setiap 15 detik
    }

    updateCurrentUsageDisplay(data) {
        // Update current power
        const currentPowerElement = document.getElementById('currentPower');
        if (currentPowerElement) {
            currentPowerElement.textContent = `${data.current_power} W`;
            this.animateValue(currentPowerElement, data.current_power, 'W');
        }

        // Update average power
        const averagePowerElement = document.getElementById('averagePower');
        if (averagePowerElement) {
            averagePowerElement.textContent = `${data.average_power} W`;
            this.animateValue(averagePowerElement, data.average_power, 'W');
        }

        // Update today's kWh
        const todayKwhElement = document.getElementById('todayKwh');
        if (todayKwhElement) {
            todayKwhElement.textContent = `${data.total_kwh_today} kWh`;
            this.animateValue(todayKwhElement, data.total_kwh_today, 'kWh');
        }

        // Update last update time
        const lastUpdateElement = document.getElementById('lastUpdateTime');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = `Update terakhir: ${data.last_update}`;
        }

        // Update source indicator
        this.updateSourceIndicator(data.source, data.date);

        // Update power status indicator
        this.updatePowerStatusIndicator(data.current_power);
    }

    animateValue(element, targetValue, unit) {
        const currentValue = parseFloat(element.textContent.replace(/[^\d.]/g, '')) || 0;
        const increment = (targetValue - currentValue) / 20;
        let current = currentValue;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
                current = targetValue;
                clearInterval(timer);
            }

            if (unit === 'kWh') {
                element.textContent = `${current.toFixed(2)} ${unit}`;
            } else {
                element.textContent = `${Math.round(current)} ${unit}`;
            }
        }, 50);
    }

    updateSourceIndicator(source, date) {
        const currentPowerElement = document.querySelector('#currentPower');
        if (!currentPowerElement) {
            console.warn('[CurrentUsage] Element #currentPower not found, skipping source indicator');
            return;
        }

        const currentUsageCard = currentPowerElement.closest('.card');
        if (!currentUsageCard) {
            console.warn('[CurrentUsage] Parent card not found, skipping source indicator');
            return;
        }

        // Remove existing indicator
        let existingIndicator = currentUsageCard.querySelector('.usage-source-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'usage-source-indicator text-center mt-2';

        let badgeClass = 'bg-light text-dark';
        let iconClass = 'fa-database';
        let text = '';

        switch (source) {
            case 'database':
                badgeClass = 'bg-success';
                iconClass = 'fa-database';
                text = `Data real dari database (${date})`;
                break;
            case 'demo':
                badgeClass = 'bg-warning text-dark';
                iconClass = 'fa-exclamation-triangle';
                text = `Data simulasi - ${date}`;
                break;
            case 'error_fallback':
                badgeClass = 'bg-danger';
                iconClass = 'fa-exclamation-circle';
                text = 'Data cadangan - error koneksi database';
                break;
        }

        indicator.innerHTML = `
            <small class="badge ${badgeClass}">
                <i class="fa ${iconClass} me-1"></i>${text}
            </small>
        `;

        currentUsageCard.querySelector('.card-body').appendChild(indicator);
    }

    updatePowerStatusIndicator(currentPower) {
        const currentPowerCard = document.querySelector('#currentPower').closest('.card');
        if (!currentPowerCard) return;

        // Remove existing status
        let existingStatus = currentPowerCard.querySelector('.power-status-indicator');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Determine power status
        let statusClass = 'bg-info';
        let statusText = 'Normal';
        let statusIcon = 'fa-info-circle';

        if (currentPower > 600) {
            statusClass = 'bg-danger';
            statusText = 'Konsumsi Tinggi';
            statusIcon = 'fa-exclamation-triangle';
        } else if (currentPower > 400) {
            statusClass = 'bg-warning text-dark';
            statusText = 'Konsumsi Sedang';
            statusIcon = 'fa-exclamation-circle';
        } else if (currentPower < 100) {
            statusClass = 'bg-secondary';
            statusText = 'Konsumsi Rendah';
            statusIcon = 'fa-moon';
        }

        // Create status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'power-status-indicator text-center mt-1';
        statusIndicator.innerHTML = `
            <small class="badge ${statusClass}">
                <i class="fa ${statusIcon} me-1"></i>${statusText}
            </small>
        `;

        currentPowerCard.querySelector('.card-body').appendChild(statusIndicator);
    }

    startAutoUpdate() {
        // Update every 30 seconds for current usage (more frequent than period data)
        this.updateInterval = setInterval(() => {
            this.loadCurrentUsage();
        }, 30 * 1000);
    }

    showError(message) {
        console.error('Current Usage Error:', message);

        // Show error in current usage card
        const currentPowerElement = document.querySelector('#currentPower');
        if (!currentPowerElement) {
            console.warn('[CurrentUsage] Element #currentPower not found, cannot show error badge');
            return;
        }

        const currentUsageCard = currentPowerElement.closest('.card');
        if (!currentUsageCard) {
            console.warn('[CurrentUsage] Parent card not found, cannot show error badge');
            return;
        }

        let errorBadge = currentUsageCard.querySelector('.usage-error-badge');
        if (errorBadge) {
            errorBadge.remove();
        }

        const errorElement = document.createElement('div');
        errorElement.className = 'usage-error-badge text-center mt-2';
        errorElement.innerHTML = `
            <small class="badge bg-danger">
                <i class="fa fa-exclamation-circle me-1"></i>${message}
            </small>
        `;

        currentUsageCard.querySelector('.card-body').appendChild(errorElement);

        // Auto remove error after 10 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 10000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    window.dashboardCurrentUsage = new DashboardCurrentUsage();

    console.log('Dashboard Current Usage initialized');
});
