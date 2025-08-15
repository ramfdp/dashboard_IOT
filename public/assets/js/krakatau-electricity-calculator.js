/**
 * Krakatau Sarana Property - Electricity Cost Calculator
 * Sistem perhitungan biaya listrik otomatis untuk gedung kantor
 * Mengintegrasikan dengan data monitoring existing tanpa input manual
 * Author: Dashboard IoT System
 * Date: August 14, 2025
 */

// Tarif PLN 2025 khusus untuk Krakatau Sarana Property (Gedung Kantor)
const KRAKATAU_TARIFF = {
    name: 'B-2/TM - Krakatau Sarana Property',
    description: 'Tarif Bisnis Menengah untuk Gedung Kantor',
    ratePerKwh: 1467.28,  // Default Rupiah per kWh (akan dioverride oleh input user)
    fixedMonthlyCharge: 48000,  // Biaya beban tetap per bulan
    category: 'office_building'
};

/**
 * Get current dynamic rate from user input or use default
 * @returns {number} Current kWh rate in Rupiah
 */
function getCurrentKwhRate() {
    const rateInput = document.getElementById('dynamicKwhRate');
    if (rateInput && rateInput.value && !isNaN(rateInput.value)) {
        const rate = parseFloat(rateInput.value);
        if (rate > 0) {
            return rate;
        }
    }
    return KRAKATAU_TARIFF.ratePerKwh; // fallback to default
}

/**
 * Ekstrak data kWh dari sistem monitoring yang sudah ada
 * Prioritas: global real-time data > monitoring display > chart data > API data > estimasi
 */
function extractKwhFromDashboard() {
    let kwhValue = 0;
    let source = 'unknown';

    try {
        // 1. Prioritas tertinggi: data real-time dari monitoring
        if (window.realTimeElectricityData && window.realTimeElectricityData.dailyKwh) {
            kwhValue = window.realTimeElectricityData.dailyKwh;
            source = 'real_time_firebase';
        }

        // 2. Dari display monitoring utama
        if (kwhValue === 0) {
            const kwhElement = document.getElementById('totalKwh');
            if (kwhElement) {
                const text = kwhElement.textContent || kwhElement.innerText;
                const match = text.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    kwhValue = parseFloat(match[1]);
                    source = 'monitoring_display';
                }
            }
        }

        // 3. Dari data chart (Chart.js)
        if (kwhValue === 0 && window.chartData) {
            const datasets = window.chartData.datasets;
            if (datasets && datasets[0] && datasets[0].data) {
                const data = datasets[0].data;
                if (data.length > 0) {
                    // Ambil rata-rata data terakhir dan konversi ke kWh harian
                    const latestWatt = data[data.length - 1] || 0;
                    kwhValue = (latestWatt / 1000) * 24;
                    source = 'chart_data';
                }
            }
        }

        // 3. Dari elemen watt display
        if (kwhValue === 0) {
            const wattElement = document.getElementById('totalWatt');
            if (wattElement) {
                const text = wattElement.textContent || wattElement.innerText;
                const match = text.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    const watt = parseFloat(match[1]);
                    kwhValue = (watt / 1000) * 24; // Estimasi kWh per hari
                    source = 'watt_conversion';
                }
            }
        }

        // 4. Dari history data atau statistik detail
        if (kwhValue === 0) {
            const kwhElements = ['kwhHarian', 'kwhMingguan', 'kwhBulanan'];
            for (let elementId of kwhElements) {
                const element = document.getElementById(elementId);
                if (element) {
                    const text = element.textContent || element.innerText;
                    const match = text.match(/(\d+(?:\.\d+)?)/);
                    if (match) {
                        let value = parseFloat(match[1]);
                        if (elementId === 'kwhMingguan') value = value / 7;
                        if (elementId === 'kwhBulanan') value = value / 30;
                        kwhValue = value;
                        source = `history_${elementId}`;
                        break;
                    }
                }
            }
        }

        console.log(`[Krakatau Calculator] Extracted ${kwhValue} kWh from ${source}`);
        return Math.max(kwhValue, 0);

    } catch (error) {
        console.error('[Krakatau Calculator] Error extracting kWh:', error);
        return 0;
    }
}

/**
 * Hitung biaya listrik untuk Krakatau Sarana Property
 */
function calculateKrakatauCost(dailyKwh) {
    if (!dailyKwh || dailyKwh <= 0) {
        return {
            error: 'Data konsumsi tidak tersedia',
            dailyKwh: 0,
            monthlyCost: 0
        };
    }

    // Get current dynamic rate
    const currentRate = getCurrentKwhRate();

    // Estimasi konsumsi bulanan (30 hari)
    const monthlyKwh = dailyKwh * 30;

    // Hitung biaya berdasarkan tarif dinamis
    const usageCost = monthlyKwh * currentRate;
    const totalMonthlyCost = usageCost + KRAKATAU_TARIFF.fixedMonthlyCharge;
    const dailyCost = totalMonthlyCost / 30;

    return {
        // Data konsumsi
        dailyKwh: dailyKwh,
        monthlyKwh: monthlyKwh,

        // Biaya
        dailyCost: dailyCost,
        monthlyCost: totalMonthlyCost,
        usageCost: usageCost,
        fixedCharge: KRAKATAU_TARIFF.fixedMonthlyCharge,

        // Tarif info
        tariffName: KRAKATAU_TARIFF.name,
        ratePerKwh: currentRate,  // Use current dynamic rate

        // Breakdown untuk display
        breakdown: [
            {
                component: 'Biaya Pemakaian',
                detail: `${monthlyKwh.toFixed(2)} kWh × Rp ${currentRate.toLocaleString('id-ID')}`,
                amount: usageCost
            },
            {
                component: 'Beban Tetap',
                detail: 'Biaya administrasi bulanan PLN',
                amount: KRAKATAU_TARIFF.fixedMonthlyCharge
            }
        ]
    };
}

/**
 * Format angka ke format Rupiah
 */
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Update display cost estimation di modal
 */
function updateCostDisplay(costResult) {
    try {
        // Update summary cards
        const elements = {
            'costDailyKwh': `${costResult.dailyKwh.toFixed(2)} kWh`,
            'costDailyAmount': formatRupiah(costResult.dailyCost),
            'costMonthlyKwh': `${costResult.monthlyKwh.toFixed(2)} kWh`,
            'costMonthlyAmount': formatRupiah(costResult.monthlyCost),
            'totalCostHighlight': formatRupiah(costResult.monthlyCost)
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });

        // Update breakdown table
        updateBreakdownTable(costResult.breakdown);

        // Show success state
        showCalculationSuccess();

    } catch (error) {
        console.error('[Krakatau Calculator] Error updating display:', error);
        showCalculationError('Gagal menampilkan hasil perhitungan');
    }
}

/**
 * Update tabel breakdown biaya
 */
function updateBreakdownTable(breakdown) {
    const tableBody = document.getElementById('costBreakdownTable');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    breakdown.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.component}</strong></td>
            <td><small class="text-muted">${item.detail}</small></td>
            <td class="text-end"><strong>${formatRupiah(item.amount)}</strong></td>
        `;
        tableBody.appendChild(row);
    });

    // Show breakdown container
    const breakdownContainer = document.getElementById('costBreakdownContainer');
    if (breakdownContainer) {
        breakdownContainer.style.display = 'block';
    }
}

/**
 * Tampilkan loading state
 */
function showCalculationLoading() {
    const loading = document.getElementById('costCalculationLoading');
    const button = document.getElementById('calculateCostBtn');

    if (loading) loading.style.display = 'block';
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fa fa-spinner fa-spin me-1"></i>Menghitung...';
    }
}

/**
 * Sembunyikan loading state
 */
function hideCalculationLoading() {
    const loading = document.getElementById('costCalculationLoading');
    const button = document.getElementById('calculateCostBtn');

    if (loading) loading.style.display = 'none';
    if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="fa fa-calculator me-1"></i>Hitung Estimasi Biaya';
    }
}

/**
 * Tampilkan state berhasil
 */
function showCalculationSuccess() {
    hideCalculationLoading();

    const button = document.getElementById('calculateCostBtn');
    const toggleBtn = document.getElementById('toggleCostDetailsBtn');

    if (button) {
        button.innerHTML = '<i class="fa fa-check me-1"></i>Berhasil Dihitung';
        button.className = 'btn btn-success btn-sm';
    }

    if (toggleBtn) {
        toggleBtn.style.display = 'inline-block';
    }
}

/**
 * Tampilkan error state
 */
function showCalculationError(message) {
    hideCalculationLoading();

    const button = document.getElementById('calculateCostBtn');
    if (button) {
        button.innerHTML = '<i class="fa fa-exclamation-triangle me-1"></i>Error';
        button.className = 'btn btn-danger btn-sm';
    }

    // Show error message
    console.error('[Krakatau Calculator]', message);
}

/**
 * Fungsi utama untuk menghitung biaya dari data modal
 */
function calculateKrakatauElectricityCost() {
    console.log('[Krakatau Calculator] Starting cost calculation...');

    showCalculationLoading();

    // Delay sedikit untuk UX yang lebih baik
    setTimeout(() => {
        try {
            // Extract kWh data dari dashboard
            const dailyKwh = extractKwhFromDashboard();

            if (dailyKwh === 0) {
                showCalculationError('Data konsumsi tidak tersedia. Pastikan sistem monitoring berjalan.');
                return;
            }

            // Hitung biaya
            const costResult = calculateKrakatauCost(dailyKwh);

            if (costResult.error) {
                showCalculationError(costResult.error);
                return;
            }

            // Update display
            updateCostDisplay(costResult);

            console.log('[Krakatau Calculator] Calculation completed:', costResult);

        } catch (error) {
            console.error('[Krakatau Calculator] Calculation failed:', error);
            showCalculationError('Terjadi kesalahan saat menghitung biaya listrik');
        }
    }, 800);
}

/**
 * Initialize Krakatau Calculator
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('[Krakatau Calculator] Initializing...');

    // Bind calculate button
    const calculateBtn = document.getElementById('calculateCostBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateKrakatauElectricityCost);
    }

    // Bind toggle details button
    const toggleBtn = document.getElementById('toggleCostDetailsBtn');
    const breakdownContainer = document.getElementById('costBreakdownContainer');

    if (toggleBtn && breakdownContainer) {
        toggleBtn.addEventListener('click', function () {
            const isVisible = breakdownContainer.style.display !== 'none';
            breakdownContainer.style.display = isVisible ? 'none' : 'block';

            const icon = this.querySelector('i');
            const text = this.querySelector('span');
            if (isVisible) {
                if (icon) icon.className = 'fa fa-eye me-1';
                if (text) text.textContent = 'Lihat Detail';
            } else {
                if (icon) icon.className = 'fa fa-eye-slash me-1';
                if (text) text.textContent = 'Sembunyikan';
            }
        });
    }

    // Modal event handlers untuk mencegah bug backdrop
    const modal = document.getElementById('modalPerhitunganListrik');
    if (modal) {
        // Auto-calculate ketika modal dibuka
        modal.addEventListener('shown.bs.modal', function () {
            console.log('[Krakatau Calculator] Modal opened, auto-calculating...');
            // Delay untuk memastikan data chart sudah loaded
            setTimeout(calculateKrakatauElectricityCost, 1500);
        });

        // Fix backdrop bug ketika modal ditutup
        modal.addEventListener('hidden.bs.modal', function () {
            console.log('[Krakatau Calculator] Modal closed, cleaning up...');

            // Hapus backdrop yang tertinggal
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => {
                backdrop.remove();
            });

            // Restore body scroll
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');

            // Restore html overflow
            document.documentElement.style.removeProperty('overflow');
        });

        // Backup cleanup untuk kasus ekstrim
        modal.addEventListener('hide.bs.modal', function () {
            setTimeout(() => {
                // Double check cleanup setelah modal ditutup
                const backdrops = document.querySelectorAll('.modal-backdrop');
                if (backdrops.length > 0) {
                    console.log('[Krakatau Calculator] Cleaning up leftover backdrops...');
                    backdrops.forEach(backdrop => backdrop.remove());
                }

                if (document.body.classList.contains('modal-open')) {
                    document.body.classList.remove('modal-open');
                    document.body.style.removeProperty('overflow');
                    document.body.style.removeProperty('padding-right');
                }
            }, 500);
        });
    }

    console.log('[Krakatau Calculator] Initialized successfully');

    // Event handler for dynamic rate updates
    const updateRateBtn = document.getElementById('updateRateBtn');
    const rateInput = document.getElementById('dynamicKwhRate');

    if (updateRateBtn && rateInput) {
        // Update calculation when button is clicked
        updateRateBtn.addEventListener('click', function () {
            const newRate = parseFloat(rateInput.value);

            if (isNaN(newRate) || newRate <= 0) {
                // Add error styling
                rateInput.classList.add('is-invalid');
                setTimeout(() => rateInput.classList.remove('is-invalid'), 3000);

                alert('Masukkan tarif kWh yang valid (angka positif)');
                rateInput.focus();
                return;
            }

            // Add success styling
            rateInput.classList.remove('is-invalid');
            rateInput.classList.add('is-valid');
            setTimeout(() => rateInput.classList.remove('is-valid'), 2000);

            console.log('[Krakatau Calculator] Rate updated to:', newRate);

            // Add visual feedback
            updateRateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            updateRateBtn.disabled = true;

            // Trigger recalculation
            setTimeout(() => {
                if (typeof window.krakatauCalculator !== 'undefined') {
                    window.krakatauCalculator.updateCalculation();
                }

                // Update display texts
                updateRateDisplay();

                // Restore button
                updateRateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Update';
                updateRateBtn.disabled = false;
            }, 300);
        });

        // Update on Enter key press
        rateInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                updateRateBtn.click();
            }
        });

        // Auto-save to localStorage for persistence
        rateInput.addEventListener('change', function () {
            const rate = parseFloat(rateInput.value);
            if (!isNaN(rate) && rate > 0) {
                localStorage.setItem('krakatau_custom_rate', rate);
            }
        });

        // Load saved rate on page load
        const savedRate = localStorage.getItem('krakatau_custom_rate');
        if (savedRate && !isNaN(savedRate)) {
            rateInput.value = parseFloat(savedRate);
        }
    }
});

/**
 * Update rate display text in the dashboard
 */
function updateRateDisplay() {
    const currentRate = getCurrentKwhRate();
    const displayText = `Tarif saat ini: Rp ${currentRate.toLocaleString('id-ID')}/kWh`;

    // Update any rate display elements
    const rateDisplays = document.querySelectorAll('.current-rate-display');
    rateDisplays.forEach(element => {
        element.textContent = displayText;
    });

    console.log('[Krakatau Calculator] Display updated with rate:', currentRate);
}
