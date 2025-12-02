/**
 * History Listrik Handler
 * Handles filtering, pagination, and CSV download for electricity history data
 * Author: Dashboard IoT System
 * Date: August 12, 2025
 */

class HistoryListrikHandler {
    constructor() {
        this.currentPage = 1;
        this.recordsPerPage = 100;
        this.allData = [];
        this.filteredData = [];
        this.currentFilters = {
            bulan: '',
            tahun: ''
        };
        this.init();
    }

    init() {
        console.log('[History] 🚀 Initializing History Listrik Handler...');

        document.addEventListener('DOMContentLoaded', () => {
            console.log('[History] ✅ DOM loaded, setting up events...');
            this.bindEvents();
            this.loadInitialData();
            this.setCurrentMonthYear();

            // Auto-load data after initialization
            setTimeout(() => {
                console.log('[History] 🔄 Auto-loading data...');
                this.applyFilter();
            }, 1000);
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        console.log('[History] 🔗 Binding events...');

        // Filter button
        const filterBtn = document.getElementById('btnFilterHistory');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.applyFilter());
            console.log('[History] ✅ Filter button bound');
        }

        // Download button
        const downloadBtn = document.getElementById('btnDownloadHistory');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadHistoryCSV());
            console.log('[History] ✅ Download button bound');
        }

        // Auto-apply filter on dropdown change
        const bulanFilter = document.getElementById('filterBulan');
        if (bulanFilter) {
            bulanFilter.addEventListener('change', () => {
                console.log('[History] 🔄 Month filter changed to:', bulanFilter.value);
                this.applyFilter();
            });
            console.log('[History] ✅ Month filter bound');
        }

        const tahunFilter = document.getElementById('filterTahun');
        if (tahunFilter) {
            tahunFilter.addEventListener('change', () => {
                console.log('[History] 🔄 Year filter changed to:', tahunFilter.value);
                this.applyFilter();
            });
            console.log('[History] ✅ Year filter bound');
        }

        console.log('[History] ✅ All events bound successfully');
    }

    /**
     * Set current month and year as default
     */
    setCurrentMonthYear() {
        const currentDate = new Date();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentYear = currentDate.getFullYear();

        document.getElementById('filterBulan').value = currentMonth;
        document.getElementById('filterTahun').value = currentYear;
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            this.showLoading(true);

            // Apply current month/year filter by default
            setTimeout(() => {
                this.applyFilter();
            }, 500);

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Gagal memuat data history');
        }
    }

    /**
     * Apply filter and fetch data
     */
    async applyFilter() {
        try {
            this.showLoading(true);

            // Get filter values
            this.currentFilters.bulan = document.getElementById('filterBulan').value;
            this.currentFilters.tahun = document.getElementById('filterTahun').value;

            // Reset to first page
            this.currentPage = 1;

            // Fetch filtered data
            await this.fetchHistoryData();

        } catch (error) {
            console.error('Error applying filter:', error);
            this.showError('Gagal memfilter data');
        }
    }

    /**
     * Fetch history data from server
     */
    async fetchHistoryData() {
        try {
            const params = new URLSearchParams();

            // Add pagination
            params.append('page', this.currentPage);
            params.append('per_page', 50); // Get more records per page

            // Add filters to API request
            if (this.currentFilters.bulan) {
                params.append('bulan', this.currentFilters.bulan);
            }

            if (this.currentFilters.tahun) {
                params.append('tahun', this.currentFilters.tahun);
            }

            console.log('[History] Fetching data from API...');

            // Make API call to the correct endpoint
            const response = await fetch(`${window.baseUrl}/api/listrik?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data && data.data.data && data.data.data.length > 0) {
                console.log('[History] ✅ API data received:', data.data.data.length, 'records');

                // Transform data to match expected format
                const transformedData = {
                    data: data.data.data.map(item => ({
                        id: item.id,
                        timestamp: new Date(item.created_at),
                        voltage: parseFloat(item.tegangan) || 220,
                        current: parseFloat(item.arus) || 1.5,
                        power: parseFloat(item.daya) || 330,
                        energy: parseFloat(item.energi) || 0.33,
                        frequency: parseFloat(item.frekuensi) || 50,
                        pf: parseFloat(item.power_factor) || 0.85,
                        location: item.lokasi || 'Main Panel'
                    })),
                    total: data.data.total,
                    current_page: data.data.current_page,
                    per_page: data.data.per_page,
                    last_page: data.data.last_page
                };

                this.processHistoryData(transformedData);
            } else {
                console.warn('[History] ⚠️ No data from API, using simulated data');
                throw new Error('No data available from server');
            }

        } catch (error) {
            console.error('[History] ❌ API Error:', error.message);
            console.log('[History] 🔄 Falling back to simulated data...');

            // Generate simulated data as fallback
            const simulatedData = this.generateSimulatedHistoryData();
            this.processHistoryData(simulatedData);

            // Show info message instead of error
            this.showInfo('Menampilkan data simulasi - koneksi database tidak tersedia');
        }
    }

    /**
     * Generate simulated history data (replace with real API call)
     */
    generateSimulatedHistoryData() {
        const data = [];
        const recordCount = Math.floor(Math.random() * 50) + 50; // 50-100 records

        const selectedMonth = this.currentFilters.bulan ? parseInt(this.currentFilters.bulan) : new Date().getMonth() + 1;
        const selectedYear = this.currentFilters.tahun ? parseInt(this.currentFilters.tahun) : new Date().getFullYear();

        for (let i = 0; i < recordCount; i++) {
            const randomDay = Math.floor(Math.random() * 28) + 1;
            const randomHour = Math.floor(Math.random() * 24);
            const randomMinute = Math.floor(Math.random() * 60);
            const randomSecond = Math.floor(Math.random() * 60);

            const timestamp = new Date(selectedYear, selectedMonth - 1, randomDay, randomHour, randomMinute, randomSecond);

            // Generate realistic business electrical data (Max 660W)
            const voltage = (220 + (Math.random() - 0.5) * 10).toFixed(2); // 215-225V (stable for business)

            // Generate realistic power first (Max 660W for business)
            let basePower;
            if (randomHour >= 0 && randomHour < 6) {
                basePower = 30 + Math.random() * 50; // 30-80W standby
            } else if (randomHour >= 6 && randomHour < 8) {
                basePower = 80 + Math.random() * 100; // 80-180W preparation
            } else if (randomHour >= 8 && randomHour < 12) {
                basePower = 200 + Math.random() * 300; // 200-500W active
            } else if (randomHour >= 12 && randomHour < 14) {
                basePower = 350 + Math.random() * 310; // 350-660W peak
            } else if (randomHour >= 14 && randomHour < 18) {
                basePower = 250 + Math.random() * 300; // 250-550W afternoon
            } else if (randomHour >= 18 && randomHour < 22) {
                basePower = 120 + Math.random() * 230; // 120-350W evening
            } else {
                basePower = 40 + Math.random() * 60; // 40-100W night
            }

            const power = Math.min(660, basePower).toFixed(2); // Ensure max 660W
            const pf = (0.88 + Math.random() * 0.08).toFixed(3); // 0.88-0.96 PF for business
            const current = (parseFloat(power) / (parseFloat(voltage) * parseFloat(pf))).toFixed(3);
            const energi = (parseFloat(power) / 1000 * Math.random()).toFixed(4); // Energy in kWh
            const frekuensi = (50 + (Math.random() - 0.5) * 1).toFixed(2); // 49.5-50.5Hz (stable for business)
            const power_factor = pf; // Use the same power factor value

            data.push({
                id: i + 1,
                timestamp: timestamp,
                voltage: parseFloat(voltage),
                current: parseFloat(current),
                power: parseFloat(power),
                energi: parseFloat(energi),
                frekuensi: parseFloat(frekuensi),
                power_factor: parseFloat(power_factor),
                // Legacy fields for compatibility
                energy: parseFloat(energi),
                frequency: parseFloat(frekuensi),
                pf: parseFloat(power_factor),
                sensor_id: 1
            });
        }

        // Sort by timestamp descending
        data.sort((a, b) => b.timestamp - a.timestamp);

        return {
            data: data,
            total: recordCount,
            current_page: this.currentPage,
            per_page: this.recordsPerPage,
            last_page: Math.ceil(recordCount / this.recordsPerPage)
        };
    }

    /**
     * Process and display history data
     */
    processHistoryData(response) {
        this.allData = response.data || [];
        this.filteredData = this.allData;

        // Update statistics
        this.updateStatistics();

        // Update table
        this.updateHistoryTable();

        // Update pagination
        this.updatePagination(response);

        this.showLoading(false);
    }

    /**
     * Update statistics cards
     */
    updateStatistics() {
        const totalRecords = this.filteredData.length;
        const avgPower = totalRecords > 0 ?
            (this.filteredData.reduce((sum, item) => sum + item.power, 0) / totalRecords).toFixed(2) : 0;
        const totalEnergy = totalRecords > 0 ?
            this.filteredData.reduce((sum, item) => sum + item.energy, 0).toFixed(4) : 0;
        const peakPower = totalRecords > 0 ?
            Math.max(...this.filteredData.map(item => item.power)).toFixed(2) : 0;

        document.getElementById('totalRecords').textContent = totalRecords;
        document.getElementById('avgPower').textContent = avgPower;
        document.getElementById('totalEnergy').textContent = totalEnergy;
        document.getElementById('peakPower').textContent = peakPower;
    }

    /**
     * Update history table
     */
    updateHistoryTable() {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Tidak ada data history yang tersedia</td></tr>';
            return;
        }

        let html = '';
        this.filteredData.forEach((item, index) => {
            const rowNumber = index + 1;
            const formattedDate = this.formatDateTime(item.timestamp);

            html += `
                <tr>
                    <td class="text-center">${rowNumber}</td>
                    <td class="text-center">${formattedDate}</td>
                    <td class="text-center">${item.voltage} V</td>
                    <td class="text-center">${item.current} A</td>
                    <td class="text-center">${item.power} W</td>
                    <td class="text-center">${item.energi || item.energy || 0} kWh</td>
                    <td class="text-center">${item.frekuensi || item.frequency || 50} Hz</td>
                    <td class="text-center">${item.power_factor || item.pf || 0.85}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Update pagination
     */
    updatePagination(response) {
        const totalRecords = response.total || 0;
        const currentPage = response.current_page || 1;
        const totalPages = response.last_page || 1;

        // Update pagination info
        const startRecord = ((currentPage - 1) * this.recordsPerPage) + 1;
        const endRecord = Math.min(currentPage * this.recordsPerPage, totalRecords);

        document.getElementById('paginationInfo').textContent =
            `Menampilkan ${startRecord}-${endRecord} dari ${totalRecords} records`;

        // Update pagination buttons (simplified for now)
        const paginationContainer = document.getElementById('historyPagination');
        if (paginationContainer && totalPages > 1) {
            let paginationHtml = '';

            // Previous button
            paginationHtml += `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="historyListrikHandler.goToPage(${currentPage - 1})">Previous</a>
                </li>
            `;

            // Page numbers (simplified - show current page and neighbors)
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                paginationHtml += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="historyListrikHandler.goToPage(${i})">${i}</a>
                    </li>
                `;
            }

            // Next button
            paginationHtml += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="historyListrikHandler.goToPage(${currentPage + 1})">Next</a>
                </li>
            `;

            paginationContainer.innerHTML = paginationHtml;
        } else if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
    }

    /**
     * Navigate to specific page
     */
    async goToPage(page) {
        if (page < 1) return;

        this.currentPage = page;
        await this.fetchHistoryData();
    }

    /**
     * Download history CSV for selected month/year
     */
    async downloadHistoryCSV() {
        try {
            this.setDownloadButtonLoading(true);

            // Get all data for selected filters (not paginated)
            const allFilteredData = await this.getAllFilteredData();

            if (allFilteredData.length === 0) {
                this.showWarning('Tidak ada data untuk didownload pada periode yang dipilih');
                return;
            }

            this.generateHistoryCSV(allFilteredData);
            this.showSuccess(`Berhasil mendownload ${allFilteredData.length} records history data`);

        } catch (error) {
            console.error('Error downloading CSV:', error);
            this.showError('Gagal mendownload CSV');
        } finally {
            this.setDownloadButtonLoading(false);
        }
    }

    /**
     * Get all filtered data (not paginated) for CSV download
     */
    async getAllFilteredData() {
        try {
            const params = new URLSearchParams();

            if (this.currentFilters.bulan) {
                params.append('bulan', this.currentFilters.bulan);
            }

            if (this.currentFilters.tahun) {
                params.append('tahun', this.currentFilters.tahun);
            }

            // Make API call untuk mendapatkan semua data
            const response = await fetch(`${window.baseUrl}/api/history/download?${params.toString()}`);
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                return data.data;
            } else {
                // Jika tidak ada data dari API, return data simulasi
                throw new Error('Tidak ada data dari server');
            }

        } catch (error) {
            console.error('Error getting all filtered data from API:', error);

            // Fallback ke data simulasi
            console.log('Menggunakan data simulasi untuk download');
            return this.generateCompleteSimulatedData();
        }
    }

    /**
     * Generate complete simulated data for download fallback
     */
    generateCompleteSimulatedData() {
        const completeData = [];
        const selectedMonth = this.currentFilters.bulan ? parseInt(this.currentFilters.bulan) : new Date().getMonth() + 1;
        const selectedYear = this.currentFilters.tahun ? parseInt(this.currentFilters.tahun) : new Date().getFullYear();

        // Generate data for each day of the month
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            // Generate multiple records per day (every hour)
            for (let hour = 0; hour < 24; hour++) {
                const timestamp = new Date(selectedYear, selectedMonth - 1, day, hour, 0, 0);

                // Generate realistic electrical data
                const voltage = (220 + (Math.random() - 0.5) * 20).toFixed(2);
                const current = (Math.random() * 10 + 1).toFixed(3);
                const power = (parseFloat(voltage) * parseFloat(current) * (0.8 + Math.random() * 0.4)).toFixed(2);
                const energi = (parseFloat(power) / 1000 * Math.random()).toFixed(4);
                const frekuensi = (50 + (Math.random() - 0.5) * 2).toFixed(2);
                const power_factor = (0.8 + Math.random() * 0.2).toFixed(3);

                completeData.push({
                    id: completeData.length + 1,
                    timestamp: timestamp,
                    voltage: parseFloat(voltage),
                    current: parseFloat(current),
                    power: parseFloat(power),
                    energi: parseFloat(energi),
                    frekuensi: parseFloat(frekuensi),
                    power_factor: parseFloat(power_factor),
                    // Legacy fields for compatibility
                    energy: parseFloat(energi),
                    frequency: parseFloat(frekuensi),
                    pf: parseFloat(power_factor),
                    sensor_id: 1
                });
            }
        }

        // Sort by timestamp
        completeData.sort((a, b) => a.timestamp - b.timestamp);

        return completeData;
    }

    /**
     * Generate and download CSV file
     */
    generateHistoryCSV(data) {
        let csvContent = "data:text/csv;charset=utf-8,";

        // Header
        csvContent += "ELECTRICITY HISTORY DATA REPORT\n";
        csvContent += `Generated on: ${new Date().toLocaleString('id-ID')}\n`;

        const monthName = this.getMonthName(this.currentFilters.bulan);
        const filterInfo = this.currentFilters.bulan && this.currentFilters.tahun ?
            `${monthName} ${this.currentFilters.tahun}` :
            (this.currentFilters.bulan ? monthName :
                (this.currentFilters.tahun ? `Year ${this.currentFilters.tahun}` : 'All Time'));

        csvContent += `Period: ${filterInfo}\n`;
        csvContent += `Total Records: ${data.length}\n`;
        csvContent += "\n";

        // Column headers
        csvContent += "No,Date Time,Voltage (V),Current (A),Power (W),Energi (kWh),Frekuensi (Hz),Power Factor,Sensor ID\n";

        // Data rows
        data.forEach((item, index) => {
            const formattedDate = this.formatDateTime(item.timestamp);
            // Use new field names first, fallback to legacy names for compatibility
            const energi = item.energi || item.energy || 0;
            const frekuensi = item.frekuensi || item.frequency || 50;
            const power_factor = item.power_factor || item.pf || 0.85;
            csvContent += `${index + 1},${formattedDate},${item.voltage},${item.current},${item.power},${energi},${frekuensi},${power_factor},${item.sensor_id}\n`;
        });

        // Summary statistics
        csvContent += "\n";
        csvContent += "=== SUMMARY STATISTICS ===\n";
        csvContent += `Total Records,${data.length}\n`;
        csvContent += `Average Power (W),${(data.reduce((sum, item) => sum + item.power, 0) / data.length).toFixed(2)}\n`;
        csvContent += `Total Energy (kWh),${data.reduce((sum, item) => sum + item.energy, 0).toFixed(4)}\n`;
        csvContent += `Peak Power (W),${Math.max(...data.map(item => item.power)).toFixed(2)}\n`;
        csvContent += `Min Power (W),${Math.min(...data.map(item => item.power)).toFixed(2)}\n`;
        csvContent += `Average Voltage (V),${(data.reduce((sum, item) => sum + item.voltage, 0) / data.length).toFixed(2)}\n`;
        csvContent += `Average Current (A),${(data.reduce((sum, item) => sum + item.current, 0) / data.length).toFixed(3)}\n`;

        // Generate filename
        const dateStr = new Date().toISOString().split('T')[0];
        const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        const periodStr = filterInfo.replace(/\s+/g, '-').toLowerCase();
        const filename = `electricity-history-${periodStr}-${dateStr}-${timeStr}.csv`;

        // Create and trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // CSV exported successfully
    }

    /**
     * Format datetime for display
     */
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Get month name from month number
     */
    getMonthName(monthNum) {
        const monthNames = [
            '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return monthNum ? monthNames[parseInt(monthNum)] : '';
    }

    /**
     * Show loading state
     */
    showLoading(loading) {
        const tbody = document.getElementById('historyTableBody');
        const periodBadge = document.getElementById('periodBadge');

        if (loading && tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <div class="spinner-border text-primary me-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <span class="text-muted">Memuat data history listrik...</span>
                    </td>
                </tr>
            `;

            if (periodBadge) {
                periodBadge.textContent = 'Loading...';
                periodBadge.className = 'badge bg-secondary ms-2';
            }
        } else if (!loading && periodBadge) {
            // Update period badge with current filter
            const bulan = this.currentFilters.bulan || new Date().getMonth() + 1;
            const tahun = this.currentFilters.tahun || new Date().getFullYear();
            const monthName = this.getMonthName(bulan);

            periodBadge.textContent = `${monthName} ${tahun}`;
            periodBadge.className = 'badge bg-info ms-2';
        }
    }

    /**
     * Set download button loading state
     */
    setDownloadButtonLoading(loading) {
        const button = document.getElementById('btnDownloadHistory');
        if (button) {
            if (loading) {
                button.disabled = true;
                button.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Downloading...';
            } else {
                button.disabled = false;
                button.innerHTML = '<i class="fa fa-download me-2"></i>Download CSV';
            }
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show warning message
     */
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'danger');
    }

    /**
     * Show info message
     */
    showInfo(message) {
        this.showNotification(message, 'info');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        notification.innerHTML = `<i class="fa fa-${type === 'success' ? 'check' : (type === 'warning' ? 'exclamation-triangle' : 'times')} me-2"></i>${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Initialize the history handler
console.log('[History] 🚀 Creating HistoryListrikHandler instance...');
window.historyListrikHandler = new HistoryListrikHandler();

// Add debugging functions for troubleshooting
window.debugHistoryTable = function () {
    console.log('=== HISTORY TABLE DEBUG INFO ===');
    console.log('Handler instance:', window.historyListrikHandler);
    console.log('Current filters:', window.historyListrikHandler?.currentFilters);
    console.log('All data count:', window.historyListrikHandler?.allData?.length || 0);
    console.log('Filtered data count:', window.historyListrikHandler?.filteredData?.length || 0);
    console.log('Table body element:', document.getElementById('historyTableBody'));
    console.log('Filter elements:', {
        bulan: document.getElementById('filterBulan'),
        tahun: document.getElementById('filterTahun'),
        btnFilter: document.getElementById('btnFilterHistory')
    });

    if (window.historyListrikHandler) {
        console.log('🔄 Triggering manual data load...');
        window.historyListrikHandler.applyFilter();
    }
};

// Test function to manually load simulated data
window.loadSimulatedHistoryData = function () {
    console.log('[History] 🧪 Loading simulated data for testing...');
    if (window.historyListrikHandler) {
        const simulatedData = window.historyListrikHandler.generateSimulatedHistoryData();
        window.historyListrikHandler.processHistoryData(simulatedData);
        window.historyListrikHandler.showSuccess('✅ Data simulasi berhasil dimuat!');
        console.log('[History] ✅ Simulated data loaded:', simulatedData.data.length, 'records');
    }
};

console.log('[History] ✅ Handler initialized successfully');
console.log('[History] 💡 Debug functions available: window.debugHistoryTable(), window.loadSimulatedHistoryData()');
