class KrakatauElectricityCalculator {
    constructor() {
        this.tariffData = {
            'B-1/TR': {
                name: 'B-1/TR (900 VA s.d. 5.500 VA)',
                category: 'Bisnis',
                power: '900-5500 VA',
                rates: [{ limit: Infinity, rate: 1913.89 }],
                basicFee: 0,
                rekMin: 40,
                description: 'Bisnis dengan daya 900 VA sampai 5500 VA'
            },
            'B-2/TR': {
                name: 'B-2/TR (6.600 VA s.d. 200 kVA)',
                category: 'Bisnis',
                power: '6600 VA - 200 kVA',
                rates: [{ limit: Infinity, rate: 1913.89 }],
                basicFee: 33900,
                description: 'Bisnis dengan daya 6600 VA sampai 200 kVA'
            },
            'B-3/TM': {
                name: 'B-3/TM (lebih dari 200 kVA)',
                category: 'Bisnis',
                power: '> 200 kVA',
                rates: [{ limit: Infinity, rate: 1745.43 }],
                basicFee: 37500,
                description: 'Bisnis dengan daya lebih dari 200 kVA',
                blockType: 'WBP/LWBP',
                wbpRate: 1745.43,
                lwbpRate: 1745.43
            }
        };

        this.loadFactorTable = [
            { min: 0, max: 10, factor: 1 },
            { min: 10, max: 40, factor: 0.9 },
            { min: 40, max: 60, factor: 0.8 },
            { min: 60, max: 80, factor: 0.7 },
            { min: 80, max: 100, factor: 0.6 }
        ];

        this.currentTariff = 'B-3/TM';
        this.initializeUI();
    }

    initializeUI() {
        this.createModalTariffSelector();
        this.updateModalDisplay();
    }

    createModalTariffSelector() {
        this.initializeModalSelector();
    }

    initializeModalSelector() {
        const checkModal = setInterval(() => {
            const modalSelector = document.getElementById('tariffSelectModal');
            if (modalSelector) {
                clearInterval(checkModal);
                this.setupModalSelector(modalSelector);
            }
        }, 500);
    }

    setupModalSelector(modalSelector) {
        modalSelector.innerHTML = this.generateTariffOptions();
        modalSelector.value = this.currentTariff;

        modalSelector.addEventListener('change', (e) => {
            this.changeTariff(e.target.value);
        });

        this.updateModalDisplay();
        this.calculateModalCost();
        this.setupModalCalculator();
    }

    setupModalCalculator() {
        const kwhInput = document.getElementById('kwhInputModal');
        const calculateBtn = document.getElementById('calculateCostBtn');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.loadMonitoringData();
            });
        }

        if (kwhInput) {
            kwhInput.setAttribute('readonly', true);
            kwhInput.addEventListener('input', () => {
                this.calculateModalCost();
            });

            this.loadMonitoringData();
        } else {
            this.loadMonitoringData();
        }
    }

    async loadMonitoringData() {
        const kwh = await this.getDataFromMonitoring();
        if (kwh > 0) {
            this.calculateModalCost(kwh);
        }
    }

    async getDataFromMonitoring() {
        try {
            const response = await fetch('/api/pln/monthly-kwh-data', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.monthly_kwh && data.monthly_kwh > 0) {
                    console.log('[KWh Calculator] Monthly data from database:', data.monthly_kwh, 'kWh');
                    return parseFloat(data.monthly_kwh);
                }
            }
        } catch (error) {
            console.log('[KWh Calculator] Database API not available:', error.message);
        }

        const kwhFromElements = this.extractKwhFromDashboard();
        if (kwhFromElements > 0) {
            return kwhFromElements;
        }

        if (window.realTimeElectricityData && window.realTimeElectricityData.dailyKwh) {
            return window.realTimeElectricityData.dailyKwh;
        }

        return 0;
    }

    extractKwhFromDashboard() {
        let kwhValue = 0;

        const kwhElement = document.getElementById('totalKwh');
        if (kwhElement) {
            const text = kwhElement.textContent || kwhElement.innerText;
            const match = text.match(/(\d+(?:\.\d+)?)/);
            if (match) {
                kwhValue = parseFloat(match[1]);
            }
        }

        if (kwhValue === 0 && window.chartData) {
            const datasets = window.chartData.datasets;
            if (datasets && datasets[0] && datasets[0].data) {
                const data = datasets[0].data;
                if (data.length > 0) {
                    const latestWatt = data[data.length - 1] || 0;
                    kwhValue = (latestWatt / 1000) * 24;
                }
            }
        }

        if (kwhValue === 0) {
            const wattElement = document.getElementById('totalWatt');
            if (wattElement) {
                const text = wattElement.textContent || wattElement.innerText;
                const match = text.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    const watt = parseFloat(match[1]);
                    kwhValue = (watt / 1000) * 24;
                }
            }
        }

        if (kwhValue === 0) {
            const powerElement = document.getElementById('pzem-power');
            if (powerElement) {
                const powerText = powerElement.textContent || powerElement.innerHTML;
                const powerMatch = powerText.match(/(\d+(?:\.\d+)?)/);
                if (powerMatch) {
                    const powerWatts = parseFloat(powerMatch[1]);
                    const powerKw = powerWatts / 1000;
                    kwhValue = powerKw * 24;
                }
            }
        }

        return Math.max(kwhValue, 0);
    }

    getLoadFactor(utilisasiPersen) {
        for (let range of this.loadFactorTable) {
            if (utilisasiPersen > range.min && utilisasiPersen <= range.max) {
                return range.factor;
            }
        }
        return 1;
    }

    calculateUtilisasi(kwhUsed, dayaKontrakKVA) {
        const utilisasiKVA = (kwhUsed / 720) / 0.85;
        const utilisasiPersen = (utilisasiKVA / dayaKontrakKVA) * 100;
        return Math.min(utilisasiPersen, 100);
    }

    generateTariffOptions() {
        let options = '';
        let currentCategory = '';

        Object.entries(this.tariffData).forEach(([code, data]) => {
            if (data.category !== currentCategory) {
                if (currentCategory !== '') {
                    options += '</optgroup>';
                }
                options += `<optgroup label="${data.category}">`;
                currentCategory = data.category;
            }

            const selected = code === this.currentTariff ? 'selected' : '';
            options += `<option value="${code}" ${selected}>${code} - ${data.name}</option>`;
        });

        if (currentCategory !== '') {
            options += '</optgroup>';
        }

        return options;
    }

    changeTariff(tariffCode) {
        this.currentTariff = tariffCode;
        this.updateModalDisplay();
        this.calculateModalCost();
    }

    updateModalDisplay() {
        const tariff = this.tariffData[this.currentTariff];
        const rate = tariff.rates[0].rate;

        const currentRateModal = document.getElementById('currentRateModal');
        const tariffDescriptionModal = document.getElementById('tariffDescriptionModal');

        if (currentRateModal) {
            currentRateModal.textContent = `Rp ${this.formatNumber(rate)}`;
        }

        if (tariffDescriptionModal) {
            tariffDescriptionModal.textContent = tariff.description;
        }
    }

    calculateModalCost(kwhValue = null) {
        let kwh = kwhValue;

        if (kwh === null) {
            const kwhInput = document.getElementById('kwhInputModal');
            if (!kwhInput) {
                kwh = this.extractKwhFromDashboard();
            } else {
                kwh = parseFloat(kwhInput.value) || 0;
            }
        }

        if (kwh <= 0) {
            kwh = this.extractKwhFromDashboard();
        }

        if (kwh <= 0) {
            return { kwh: 0, rate: 0, totalCost: 0, tariffCode: '', tariffName: '' };
        }

        const tariff = this.tariffData[this.currentTariff];
        if (!tariff) {
            return { kwh: 0, rate: 0, totalCost: 0, tariffCode: '', tariffName: '' };
        }

        const rate = tariff.rates[0].rate;
        let totalCost = 0;

        if (this.currentTariff === 'B-1/TR') {
            const rekMin = tariff.rekMin || 40;
            const nyalaJam = kwh;
            const dayaTersambung = 5.5;
            const biayaPemakaian = nyalaJam * rate;
            const rekMin40 = rekMin * dayaTersambung * rate;

            totalCost = Math.max(biayaPemakaian, rekMin40);
        } else if (this.currentTariff === 'B-3/TM') {
            const dayaKontrakKVA = 200;
            const utilisasiPersen = this.calculateUtilisasi(kwh, dayaKontrakKVA);
            const loadFactor = this.getLoadFactor(utilisasiPersen);
            const tarifBiayaBeban = tariff.basicFee || 37500;
            const biayaBeban = loadFactor * tarifBiayaBeban * dayaKontrakKVA;
            const biayaPemakaian = kwh * rate;

            totalCost = biayaBeban + biayaPemakaian;
        } else {
            const biayaBeban = tariff.basicFee || 0;
            totalCost = (kwh * rate) + biayaBeban;
        }

        const displayKwhModal = document.getElementById('displayKwhModal');
        const totalCostModal = document.getElementById('totalCostModal');

        if (displayKwhModal) {
            displayKwhModal.textContent = `${kwh} kWh`;
        }

        if (totalCostModal) {
            totalCostModal.textContent = `Rp ${this.formatNumber(totalCost)}`;
        }

        this.updateCostSummaryCards(kwh, rate, totalCost);
        this.triggerCalculationEvent(kwh, rate, totalCost);

        return {
            kwh: kwh,
            rate: rate,
            totalCost: totalCost,
            tariffCode: this.currentTariff,
            tariffName: tariff.name
        };
    }

    updateCostSummaryCards(kwh, rate, totalCost) {
        const costDailyKwh = document.getElementById('costDailyKwh');
        const costDailyAmount = document.getElementById('costDailyAmount');
        const costMonthlyKwh = document.getElementById('costMonthlyKwh');
        const costMonthlyAmount = document.getElementById('costMonthlyAmount');
        const totalCostHighlight = document.getElementById('totalCostHighlight');

        if (costDailyKwh) costDailyKwh.textContent = `${kwh.toFixed(1)} kWh`;
        if (costDailyAmount) costDailyAmount.textContent = `Rp ${this.formatNumber(totalCost)}`;

        const monthlyKwh = kwh * 30;
        const monthlyCost = totalCost * 30;

        if (costMonthlyKwh) costMonthlyKwh.textContent = `${this.formatNumber(monthlyKwh)} kWh`;
        if (costMonthlyAmount) costMonthlyAmount.textContent = `Rp ${this.formatNumber(monthlyCost)}`;
        if (totalCostHighlight) totalCostHighlight.textContent = `Rp ${this.formatNumber(monthlyCost)}`;

        // Show detail and download buttons after calculation
        const toggleBtn = document.getElementById('toggleCostDetailsBtn');
        const downloadBtn = document.getElementById('downloadCsvBtn');

        if (toggleBtn) {
            toggleBtn.style.display = 'inline-block';
        }

        if (downloadBtn) {
            downloadBtn.style.display = 'inline-block';
        }

        // Populate cost breakdown
        this.populateCostBreakdown(kwh, rate, totalCost, monthlyKwh, monthlyCost);
    }

    populateCostBreakdown(kwh, rate, totalCost, monthlyKwh, monthlyCost) {
        const breakdownTable = document.getElementById('costBreakdownTable');
        if (!breakdownTable) return;

        const tariff = this.tariffData[this.currentTariff];
        let breakdownHTML = '';

        // Header Info
        breakdownHTML += `
            <tr class="table-active">
                <td colspan="3" class="fw-bold text-primary">
                    <i class="fa fa-info-circle me-2"></i>Tarif: ${this.currentTariff} - ${tariff.name}
                </td>
            </tr>
        `;

        if (this.currentTariff === 'B-1/TR') {
            // B-1/TR Calculation
            const rekMin = tariff.rekMin || 40;
            const dayaTersambung = 5.5;
            const biayaPemakaian = kwh * rate;
            const rekMin40 = rekMin * dayaTersambung * rate;

            breakdownHTML += `
                <tr>
                    <td>Konsumsi Listrik Harian</td>
                    <td>${kwh.toFixed(2)} kWh</td>
                    <td class="text-end">-</td>
                </tr>
                <tr>
                    <td>Tarif per kWh</td>
                    <td>Rp ${this.formatNumber(rate)}</td>
                    <td class="text-end">-</td>
                </tr>
                <tr>
                    <td>Biaya Pemakaian Harian</td>
                    <td>${kwh.toFixed(2)} × Rp ${this.formatNumber(rate)}</td>
                    <td class="text-end">Rp ${this.formatNumber(biayaPemakaian)}</td>
                </tr>
                <tr>
                    <td>Rekening Minimum (RM)</td>
                    <td>${rekMin} × ${dayaTersambung} kVA × Rp ${this.formatNumber(rate)}</td>
                    <td class="text-end">Rp ${this.formatNumber(rekMin40)}</td>
                </tr>
                <tr class="table-warning fw-bold">
                    <td>Biaya Harian (Max RM/Pemakaian)</td>
                    <td>Max(Rp ${this.formatNumber(biayaPemakaian)}, Rp ${this.formatNumber(rekMin40)})</td>
                    <td class="text-end">Rp ${this.formatNumber(totalCost)}</td>
                </tr>
                <tr>
                    <td colspan="3" class="pt-2"></td>
                </tr>
                <tr>
                    <td>Estimasi Konsumsi Bulanan</td>
                    <td>${kwh.toFixed(2)} × 30 hari</td>
                    <td class="text-end">${this.formatNumber(monthlyKwh)} kWh</td>
                </tr>
                <tr class="table-success fw-bold">
                    <td>Estimasi Biaya Bulanan</td>
                    <td>Rp ${this.formatNumber(totalCost)} × 30 hari</td>
                    <td class="text-end">Rp ${this.formatNumber(monthlyCost)}</td>
                </tr>
            `;
        } else if (this.currentTariff === 'B-3/TM') {
            // B-3/TM Calculation with Load Factor
            const dayaKontrakKVA = 200;
            const utilisasiPersen = this.calculateUtilisasi(kwh, dayaKontrakKVA);
            const loadFactor = this.getLoadFactor(utilisasiPersen);
            const tarifBiayaBeban = tariff.basicFee || 37500;
            const biayaBeban = loadFactor * tarifBiayaBeban * dayaKontrakKVA;
            const biayaPemakaian = kwh * rate;

            breakdownHTML += `
                <tr>
                    <td>Daya Kontrak</td>
                    <td>${dayaKontrakKVA} kVA</td>
                    <td class="text-end">-</td>
                </tr>
                <tr>
                    <td>Konsumsi Listrik Harian</td>
                    <td>${kwh.toFixed(2)} kWh</td>
                    <td class="text-end">-</td>
                </tr>
                <tr>
                    <td>Tingkat Utilisasi</td>
                    <td>((${kwh.toFixed(2)}/720)/0.85) / ${dayaKontrakKVA} × 100%</td>
                    <td class="text-end">${utilisasiPersen.toFixed(2)}%</td>
                </tr>
                <tr>
                    <td>Load Factor</td>
                    <td>Berdasarkan utilisasi ${utilisasiPersen.toFixed(2)}%</td>
                    <td class="text-end">${loadFactor.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>Biaya Beban</td>
                    <td>${loadFactor.toFixed(1)} × Rp ${this.formatNumber(tarifBiayaBeban)} × ${dayaKontrakKVA} kVA</td>
                    <td class="text-end">Rp ${this.formatNumber(biayaBeban)}</td>
                </tr>
                <tr>
                    <td>Tarif per kWh</td>
                    <td>Rp ${this.formatNumber(rate)}</td>
                    <td class="text-end">-</td>
                </tr>
                <tr>
                    <td>Biaya Pemakaian Harian</td>
                    <td>${kwh.toFixed(2)} × Rp ${this.formatNumber(rate)}</td>
                    <td class="text-end">Rp ${this.formatNumber(biayaPemakaian)}</td>
                </tr>
                <tr class="table-warning fw-bold">
                    <td>Total Biaya Harian</td>
                    <td>Biaya Beban + Biaya Pemakaian</td>
                    <td class="text-end">Rp ${this.formatNumber(totalCost)}</td>
                </tr>
                <tr>
                    <td colspan="3" class="pt-2"></td>
                </tr>
                <tr>
                    <td>Estimasi Konsumsi Bulanan</td>
                    <td>${kwh.toFixed(2)} × 30 hari</td>
                    <td class="text-end">${this.formatNumber(monthlyKwh)} kWh</td>
                </tr>
                <tr class="table-success fw-bold">
                    <td>Estimasi Biaya Bulanan</td>
                    <td>Rp ${this.formatNumber(totalCost)} × 30 hari</td>
                    <td class="text-end">Rp ${this.formatNumber(monthlyCost)}</td>
                </tr>
            `;
        } else {
            // B-2/TR and other tariffs
            const biayaBeban = tariff.basicFee || 0;
            const biayaPemakaian = kwh * rate;

            breakdownHTML += `
                <tr>
                    <td>Konsumsi Listrik Harian</td>
                    <td>${kwh.toFixed(2)} kWh</td>
                    <td class="text-end">-</td>
                </tr>
                <tr>
                    <td>Tarif per kWh</td>
                    <td>Rp ${this.formatNumber(rate)}</td>
                    <td class="text-end">-</td>
                </tr>
                <tr>
                    <td>Biaya Pemakaian Harian</td>
                    <td>${kwh.toFixed(2)} × Rp ${this.formatNumber(rate)}</td>
                    <td class="text-end">Rp ${this.formatNumber(biayaPemakaian)}</td>
                </tr>
                <tr>
                    <td>Biaya Beban/Administrasi</td>
                    <td>Tetap per bulan</td>
                    <td class="text-end">Rp ${this.formatNumber(biayaBeban)}</td>
                </tr>
                <tr class="table-warning fw-bold">
                    <td>Total Biaya Harian</td>
                    <td>Biaya Pemakaian + Biaya Beban</td>
                    <td class="text-end">Rp ${this.formatNumber(totalCost)}</td>
                </tr>
                <tr>
                    <td colspan="3" class="pt-2"></td>
                </tr>
                <tr>
                    <td>Estimasi Konsumsi Bulanan</td>
                    <td>${kwh.toFixed(2)} × 30 hari</td>
                    <td class="text-end">${this.formatNumber(monthlyKwh)} kWh</td>
                </tr>
                <tr class="table-success fw-bold">
                    <td>Estimasi Biaya Bulanan</td>
                    <td>Rp ${this.formatNumber(totalCost)} × 30 hari</td>
                    <td class="text-end">Rp ${this.formatNumber(monthlyCost)}</td>
                </tr>
            `;
        }

        breakdownTable.innerHTML = breakdownHTML;
    }

    toggleCostBreakdown() {
        const container = document.getElementById('costBreakdownContainer');
        const toggleBtn = document.getElementById('toggleCostDetailsBtn');

        if (container && toggleBtn) {
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';

            const btnText = toggleBtn.querySelector('span');
            const btnIcon = toggleBtn.querySelector('i');

            if (isHidden) {
                if (btnText) btnText.textContent = 'Sembunyikan Rincian';
                if (btnIcon) btnIcon.className = 'fa fa-eye-slash me-1';
                toggleBtn.classList.remove('btn-info');
                toggleBtn.classList.add('btn-warning');
            } else {
                if (btnText) btnText.textContent = 'Detail Rincian';
                if (btnIcon) btnIcon.className = 'fa fa-list-alt me-1';
                toggleBtn.classList.remove('btn-warning');
                toggleBtn.classList.add('btn-info');
            }
        }
    }

    downloadCostEstimationCSV() {
        // Get current calculation data
        const costDailyKwh = document.getElementById('costDailyKwh')?.textContent || '0 kWh';
        const costDailyAmount = document.getElementById('costDailyAmount')?.textContent || 'Rp 0';
        const costMonthlyKwh = document.getElementById('costMonthlyKwh')?.textContent || '0 kWh';
        const costMonthlyAmount = document.getElementById('costMonthlyAmount')?.textContent || 'Rp 0';

        // Extract numeric values
        const dailyKwh = parseFloat(costDailyKwh.replace(/[^\d.]/g, '')) || 0;
        const dailyCost = parseFloat(costDailyAmount.replace(/[^\d.]/g, '')) || 0;
        const monthlyKwh = parseFloat(costMonthlyKwh.replace(/[^\d.]/g, '')) || 0;
        const monthlyCost = parseFloat(costMonthlyAmount.replace(/[^\d.]/g, '')) || 0;

        const tariff = this.tariffData[this.currentTariff];
        const rate = tariff.rates[0].rate;

        // Get current date and time
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Build CSV content with BOM for Excel UTF-8 compatibility
        let csvContent = '\uFEFF'; // UTF-8 BOM

        // Header section
        csvContent += '=======================================================\n';
        csvContent += 'ESTIMASI BIAYA LISTRIK - PT KRAKATAU SARANA PROPERTY\n';
        csvContent += '=======================================================\n\n';

        csvContent += `Tanggal Laporan:,${dateStr}\n`;
        csvContent += `Waktu Laporan:,${timeStr}\n`;
        csvContent += `Sistem:,Dashboard IoT Monitoring\n\n`;

        // Tariff information
        csvContent += '-------------------------------------------------------\n';
        csvContent += 'INFORMASI TARIF\n';
        csvContent += '-------------------------------------------------------\n';
        csvContent += `Kode Tarif:,${this.currentTariff}\n`;
        csvContent += `Nama Tarif:,${tariff.name}\n`;
        csvContent += `Kategori:,${tariff.category}\n`;
        csvContent += `Daya:,${tariff.power}\n`;
        csvContent += `Tarif per kWh:,Rp ${this.formatNumber(rate)}\n`;

        if (tariff.basicFee > 0) {
            csvContent += `Biaya Beban/Administrasi:,Rp ${this.formatNumber(tariff.basicFee)}\n`;
        }

        if (this.currentTariff === 'B-1/TR') {
            csvContent += `Rekening Minimum (RM):,${tariff.rekMin} per kVA\n`;
        }

        csvContent += '\n';

        // Summary section
        csvContent += '-------------------------------------------------------\n';
        csvContent += 'RINGKASAN KONSUMSI DAN BIAYA\n';
        csvContent += '-------------------------------------------------------\n';
        csvContent += 'Periode,Konsumsi (kWh),Biaya (Rp)\n';
        csvContent += `Harian,${dailyKwh.toFixed(2)},${dailyCost.toFixed(2)}\n`;
        csvContent += `Bulanan (30 hari),${monthlyKwh.toFixed(2)},${monthlyCost.toFixed(2)}\n\n`;

        // Detailed breakdown section
        csvContent += '-------------------------------------------------------\n';
        csvContent += 'RINCIAN PERHITUNGAN DETAIL\n';
        csvContent += '-------------------------------------------------------\n';
        csvContent += 'Komponen Biaya,Keterangan,Nilai,Satuan\n';

        if (this.currentTariff === 'B-1/TR') {
            const rekMin = tariff.rekMin || 40;
            const dayaTersambung = 5.5;
            const biayaPemakaian = dailyKwh * rate;
            const rekMin40 = rekMin * dayaTersambung * rate;

            csvContent += `Konsumsi Listrik Harian,Data dari monitoring,${dailyKwh.toFixed(2)},kWh\n`;
            csvContent += `Tarif Listrik,Tarif per kWh,${rate.toFixed(2)},Rp/kWh\n`;
            csvContent += `Biaya Pemakaian Harian,${dailyKwh.toFixed(2)} × ${rate.toFixed(2)},${biayaPemakaian.toFixed(2)},Rp\n`;
            csvContent += `Daya Tersambung,Daya kontrak pelanggan,${dayaTersambung},kVA\n`;
            csvContent += `Rekening Minimum,${rekMin} × ${dayaTersambung} × ${rate.toFixed(2)},${rekMin40.toFixed(2)},Rp\n`;
            csvContent += `Biaya Harian (Final),Maksimal dari Pemakaian atau RM,${dailyCost.toFixed(2)},Rp\n`;
            csvContent += `Estimasi Konsumsi Bulanan,${dailyKwh.toFixed(2)} × 30 hari,${monthlyKwh.toFixed(2)},kWh\n`;
            csvContent += `Estimasi Biaya Bulanan,${dailyCost.toFixed(2)} × 30 hari,${monthlyCost.toFixed(2)},Rp\n`;

        } else if (this.currentTariff === 'B-3/TM') {
            const dayaKontrakKVA = 200;
            const utilisasiPersen = this.calculateUtilisasi(dailyKwh, dayaKontrakKVA);
            const loadFactor = this.getLoadFactor(utilisasiPersen);
            const tarifBiayaBeban = tariff.basicFee || 37500;
            const biayaBeban = loadFactor * tarifBiayaBeban * dayaKontrakKVA;
            const biayaPemakaian = dailyKwh * rate;

            csvContent += `Daya Kontrak,Daya kontrak pelanggan,${dayaKontrakKVA},kVA\n`;
            csvContent += `Konsumsi Listrik Harian,Data dari monitoring,${dailyKwh.toFixed(2)},kWh\n`;
            csvContent += `Tingkat Utilisasi,((kWh/720)/0.85) / kVA × 100%,${utilisasiPersen.toFixed(2)},%\n`;
            csvContent += `Load Factor,Berdasarkan tabel utilisasi,${loadFactor.toFixed(1)},-\n`;
            csvContent += `Tarif Biaya Beban,Per kVA per bulan,${tarifBiayaBeban.toFixed(2)},Rp/kVA\n`;
            csvContent += `Biaya Beban,${loadFactor.toFixed(1)} × ${tarifBiayaBeban} × ${dayaKontrakKVA},${biayaBeban.toFixed(2)},Rp\n`;
            csvContent += `Tarif Listrik,Tarif per kWh,${rate.toFixed(2)},Rp/kWh\n`;
            csvContent += `Biaya Pemakaian Harian,${dailyKwh.toFixed(2)} × ${rate.toFixed(2)},${biayaPemakaian.toFixed(2)},Rp\n`;
            csvContent += `Total Biaya Harian,Biaya Beban + Biaya Pemakaian,${dailyCost.toFixed(2)},Rp\n`;
            csvContent += `Estimasi Konsumsi Bulanan,${dailyKwh.toFixed(2)} × 30 hari,${monthlyKwh.toFixed(2)},kWh\n`;
            csvContent += `Estimasi Biaya Bulanan,${dailyCost.toFixed(2)} × 30 hari,${monthlyCost.toFixed(2)},Rp\n`;

        } else {
            const biayaBeban = tariff.basicFee || 0;
            const biayaPemakaian = dailyKwh * rate;

            csvContent += `Konsumsi Listrik Harian,Data dari monitoring,${dailyKwh.toFixed(2)},kWh\n`;
            csvContent += `Tarif Listrik,Tarif per kWh,${rate.toFixed(2)},Rp/kWh\n`;
            csvContent += `Biaya Pemakaian Harian,${dailyKwh.toFixed(2)} × ${rate.toFixed(2)},${biayaPemakaian.toFixed(2)},Rp\n`;
            csvContent += `Biaya Beban/Administrasi,Biaya tetap per bulan,${biayaBeban.toFixed(2)},Rp\n`;
            csvContent += `Total Biaya Harian,Biaya Pemakaian + Biaya Beban,${dailyCost.toFixed(2)},Rp\n`;
            csvContent += `Estimasi Konsumsi Bulanan,${dailyKwh.toFixed(2)} × 30 hari,${monthlyKwh.toFixed(2)},kWh\n`;
            csvContent += `Estimasi Biaya Bulanan,${dailyCost.toFixed(2)} × 30 hari,${monthlyCost.toFixed(2)},Rp\n`;
        }

        csvContent += '\n';

        // Load Factor Table (for B-3/TM)
        if (this.currentTariff === 'B-3/TM') {
            csvContent += '-------------------------------------------------------\n';
            csvContent += 'TABEL LOAD FACTOR\n';
            csvContent += '-------------------------------------------------------\n';
            csvContent += 'Utilisasi Min (%),Utilisasi Max (%),Load Factor\n';
            this.loadFactorTable.forEach(entry => {
                csvContent += `${entry.min},${entry.max},${entry.factor}\n`;
            });
            csvContent += '\n';
        }

        // Footer
        csvContent += '=======================================================\n';
        csvContent += 'CATATAN:\n';
        csvContent += '- Estimasi ini berdasarkan data konsumsi real-time\n';
        csvContent += '- Biaya bulanan adalah proyeksi 30 hari\n';
        csvContent += '- Tarif sesuai Krakatau Chandra Energi (Oktober-Desember 2025)\n';
        csvContent += '- Untuk informasi lebih lanjut, hubungi bagian administrasi\n';
        csvContent += '=======================================================\n';

        // Create download
        const filename = `Estimasi_Biaya_Listrik_${this.currentTariff}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.csv`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`[KWh Calculator] CSV downloaded: ${filename}`);

        // Show success message
        this.showDownloadSuccessMessage(filename);
    }

    showDownloadSuccessMessage(filename) {
        // Create temporary success alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            <strong><i class="fa fa-check-circle me-2"></i>Download Berhasil!</strong>
            <p class="mb-0 small">File: ${filename}</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }

    triggerCalculationEvent(kwh, rate, totalCost) {
        const event = new CustomEvent('plnCalculationUpdate', {
            detail: {
                kwh: kwh,
                rate: rate,
                totalCost: totalCost,
                tariffCode: this.currentTariff,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(number);
    }

    getCurrentTariff() {
        return this.tariffData[this.currentTariff];
    }

    getCurrentRate() {
        return this.tariffData[this.currentTariff].rates[0].rate;
    }

    calculateKwhToCost(kwh) {
        const rate = this.getCurrentRate();
        return kwh * rate;
    }

    getAllTariffs() {
        return this.tariffData;
    }

    startDataSync() {
        console.log('[KWh Calculator] Data sync disabled - Manual input mode');
    }

    stopDataSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    refreshData() {
        this.loadMonitoringData();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        window.kwhCalculator = new KrakatauElectricityCalculator();
        window.plnCalculator = window.kwhCalculator;

        window.calculatePLNCost = (kwh) => window.kwhCalculator.calculateKwhToCost(kwh);
        window.getPLNRate = () => window.kwhCalculator.getCurrentRate();
        window.getPLNTariff = () => window.kwhCalculator.getCurrentTariff();

        // Toggle cost breakdown button
        const toggleCostDetailsBtn = document.getElementById('toggleCostDetailsBtn');
        if (toggleCostDetailsBtn) {
            toggleCostDetailsBtn.addEventListener('click', function () {
                window.kwhCalculator.toggleCostBreakdown();
            });
        }

        // Download CSV button
        const downloadCsvBtn = document.getElementById('downloadCsvBtn');
        if (downloadCsvBtn) {
            downloadCsvBtn.addEventListener('click', function () {
                window.kwhCalculator.downloadCostEstimationCSV();
            });
        }

        // Calculate cost button
        const calculateCostBtn = document.getElementById('calculateCostBtn');
        if (calculateCostBtn) {
            calculateCostBtn.addEventListener('click', async function () {
                const kwh = await window.kwhCalculator.getDataFromMonitoring();
                if (kwh > 0) {
                    window.kwhCalculator.calculateModalCost(kwh);
                } else {
                    alert('Tidak ada data konsumsi listrik yang tersedia');
                }
            });
        }

        const modalElement = document.getElementById('modalPerhitunganListrik');
        if (modalElement) {
            modalElement.addEventListener('hide.bs.modal', function (event) {
                setTimeout(() => {
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 100);
            });

            // Reset detail view when modal is closed
            modalElement.addEventListener('hidden.bs.modal', function (event) {
                const container = document.getElementById('costBreakdownContainer');
                const toggleBtn = document.getElementById('toggleCostDetailsBtn');
                const downloadBtn = document.getElementById('downloadCsvBtn');

                if (container) container.style.display = 'none';

                if (toggleBtn) {
                    toggleBtn.style.display = 'none';
                    const btnText = toggleBtn.querySelector('span');
                    const btnIcon = toggleBtn.querySelector('i');
                    if (btnText) btnText.textContent = 'Detail Rincian';
                    if (btnIcon) btnIcon.className = 'fa fa-list-alt me-1';
                    toggleBtn.classList.remove('btn-warning');
                    toggleBtn.classList.add('btn-info');
                }

                if (downloadBtn) {
                    downloadBtn.style.display = 'none';
                }
            });
        }
    }, 1000);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = KrakatauElectricityCalculator;
}
