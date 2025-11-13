class NightModeIndicator {
    constructor() {
        this.createIndicator();
        this.updateInterval = null;
        this.startUpdating();
    }

    createIndicator() {
        // Cek apakah sudah ada indicator
        if (document.getElementById('nightModeIndicator')) {
            return;
        }

        // Buat container untuk night mode indicator
        const indicatorHtml = `
            <div id="nightModeIndicator" class="card bg-dark text-light mb-3" style="border-left: 4px solid #6c757d;">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-title mb-1">
                                <i class="fa fa-moon me-2"></i>Night Mode Simulation
                            </h6>
                            <small id="nightModeStatus" class="text-muted">Initializing...</small>
                        </div>
                        <div class="text-end">
                            <div id="nightModeTimer" class="badge bg-secondary">--:--</div>
                            <div><small id="nextTrigger" class="text-muted">Next: --:--</small></div>
                        </div>
                    </div>
                    <div class="progress mt-2" style="height: 4px;" id="nightModeProgress" style="display: none;">
                        <div class="progress-bar bg-warning" role="progressbar" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;

        // Cari tempat untuk menambahkan indicator (setelah card monitoring pertama)
        const dashboardContent = document.querySelector('.row .col-xl-3') ||
            document.querySelector('.card') ||
            document.querySelector('.container-fluid .row');

        if (dashboardContent) {
            // Buat wrapper div
            const wrapper = document.createElement('div');
            wrapper.className = 'col-xl-12 col-lg-12 mb-3';
            wrapper.innerHTML = indicatorHtml;

            // Insert di awal dashboard
            const parent = dashboardContent.parentNode;
            parent.insertBefore(wrapper, parent.firstChild);
        } else {
            // Fallback: tambahkan di body
            document.body.insertAdjacentHTML('afterbegin', `<div class="container mt-3">${indicatorHtml}</div>`);
        }

        console.log('[NightMode] Visual indicator created');
    }

    updateIndicator() {
        if (!window.autoPZEMGenerator) return;

        const status = window.autoPZEMGenerator.getStatus();
        const nightMode = status.nightMode;

        // Update elements
        const statusEl = document.getElementById('nightModeStatus');
        const timerEl = document.getElementById('nightModeTimer');
        const nextTriggerEl = document.getElementById('nextTrigger');
        const progressEl = document.getElementById('nightModeProgress');
        const cardEl = document.getElementById('nightModeIndicator');

        if (!statusEl || !timerEl || !nextTriggerEl || !cardEl) return;

        if (nightMode.isActive) {
            // Night mode sedang aktif
            statusEl.textContent = `Active - Power: ${nightMode.powerReduction}, Current: ${nightMode.currentReduction}`;
            statusEl.className = 'text-warning';

            timerEl.textContent = `${nightMode.remainingMinutes || 0} min left`;
            timerEl.className = 'badge bg-warning';

            cardEl.style.borderLeftColor = '#ffc107';

            // Show progress bar
            progressEl.style.display = 'block';
            const progress = ((nightMode.durationMinutes - (nightMode.remainingMinutes || 0)) / nightMode.durationMinutes) * 100;
            progressEl.querySelector('.progress-bar').style.width = `${progress}%`;

        } else {
            // Night mode tidak aktif
            statusEl.textContent = `Standby - Next cycle in ${nightMode.intervalHours}h for ${nightMode.durationMinutes}min`;
            statusEl.className = 'text-muted';

            timerEl.textContent = 'Standby';
            timerEl.className = 'badge bg-secondary';

            cardEl.style.borderLeftColor = '#6c757d';

            // Hide progress bar
            progressEl.style.display = 'none';
        }

        // Update next trigger time
        if (nightMode.nextTrigger) {
            const nextTime = new Date(nightMode.nextTrigger);
            nextTriggerEl.textContent = `Next: ${nextTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        }
    }

    startUpdating() {
        this.updateInterval = setInterval(() => {
            this.updateIndicator();
        }, 1000); // Update setiap detik
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Wait for auto generator to be ready
    setTimeout(() => {
        if (window.autoPZEMGenerator) {
            window.nightModeIndicator = new NightModeIndicator();
            console.log('[NightMode] Indicator initialized');
        }
    }, 2000);
});

// Make it globally accessible
window.NightModeIndicator = NightModeIndicator;
