// Firebase configuration - Replace with your config
const firebaseConfig = {
    apiKey: "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg",
    authDomain: "smart-building-3e5c1.firebaseapp.com",
    databaseURL: "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-building-3e5c1",
    storageBucket: "smart-building-3e5c1.appspot.com",
    messagingSenderId: "693247019169",
    appId: "1:693247019169:web:xxxxxx"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove, onValue } from 'firebase/database';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class ScheduleManager {
    constructor() {
        this.schedules = [];
        this.deviceStates = {};
        this.init();
    }

    init() {
        this.loadSchedules();
        this.listenToDeviceChanges();
        this.startScheduleChecker();
        this.bindEvents();
    }

    // Load schedules from Firebase
    async loadSchedules() {
        try {
            const schedulesRef = ref(database, 'schedules');
            const snapshot = await get(schedulesRef);
            
            if (snapshot.exists()) {
                this.schedules = Object.values(snapshot.val());
                console.log('Schedules loaded:', this.schedules);
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    }

    // Listen to real-time device state changes
    listenToDeviceChanges() {
        const devicesRef = ref(database, 'devices');
        
        onValue(devicesRef, (snapshot) => {
            if (snapshot.exists()) {
                this.deviceStates = snapshot.val();
                this.updateDeviceUI();
                console.log('Device states updated:', this.deviceStates);
            }
        });
    }

    // Update device UI based on current states
    updateDeviceUI() {
        Object.keys(this.deviceStates).forEach(deviceType => {
            const device = this.deviceStates[deviceType];
            const statusElement = document.querySelector(`[data-device="${deviceType}"] .device-status`);
            
            if (statusElement) {
                statusElement.textContent = device.status === 'on' ? 'Aktif' : 'Nonaktif';
                statusElement.className = `device-status badge ${device.status === 'on' ? 'bg-success' : 'bg-secondary'}`;
            }
        });
    }

    // Start the schedule checker (runs every minute)
    startScheduleChecker() {
        // Check immediately
        this.checkSchedules();
        
        // Then check every minute
        setInterval(() => {
            this.checkSchedules();
        }, 60000); // 60 seconds
    }

    // Check and execute schedules
    checkSchedules() {
        const now = new Date();
        const currentDay = this.getCurrentDay();
        const currentTime = this.getCurrentTime();

        console.log(`Checking schedules for ${currentDay} at ${currentTime}`);

        this.schedules.forEach(schedule => {
            if (schedule.is_active && schedule.day_of_week === currentDay) {
                const startTime = schedule.start_time;
                const endTime = schedule.end_time;

                if (this.isTimeInRange(currentTime, startTime, endTime)) {
                    console.log(`Executing schedule: ${schedule.name} - turning ON ${schedule.device_type}`);
                    this.controlDevice(schedule.device_type, 'on', 'schedule');
                } else if (this.wasRecentlyActive(currentTime, endTime)) {
                    console.log(`Schedule ended: ${schedule.name} - turning OFF ${schedule.device_type}`);
                    this.controlDevice(schedule.device_type, 'off', 'schedule');
                }
            }
        });
    }

    // Control device through Firebase
    async controlDevice(deviceType, action, source = 'manual') {
        try {
            const deviceRef = ref(database, `devices/${deviceType}`);
            const deviceData = {
                status: action,
                timestamp: new Date().toISOString(),
                source: source
            };

            await set(deviceRef, deviceData);
            console.log(`Device ${deviceType} turned ${action} by ${source}`);

            // Update local state
            if (!this.deviceStates[deviceType]) {
                this.deviceStates[deviceType] = {};
            }
            this.deviceStates[deviceType].status = action;
            this.deviceStates[deviceType].timestamp = deviceData.timestamp;
            this.deviceStates[deviceType].source = source;

        } catch (error) {
            console.error(`Error controlling device ${deviceType}:`, error);
        }
    }

    // Sync schedule to Firebase
    async syncScheduleToFirebase(scheduleData) {
        try {
            const scheduleRef = ref(database, `schedules/${scheduleData.id}`);
            await set(scheduleRef, scheduleData);
            console.log('Schedule synced to Firebase:', scheduleData);
        } catch (error) {
            console.error('Error syncing schedule to Firebase:', error);
            throw error;
        }
    }

    // Remove schedule from Firebase
    async removeScheduleFromFirebase(scheduleId) {
        try {
            const scheduleRef = ref(database, `schedules/${scheduleId}`);
            await remove(scheduleRef);
            console.log('Schedule removed from Firebase:', scheduleId);
        } catch (error) {
            console.error('Error removing schedule from Firebase:', error);
            throw error;
        }
    }

    // Helper functions
    getCurrentDay() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date().getDay()];
    }

    getCurrentTime() {
        const now = new Date();
        return now.toTimeString().slice(0, 5); // HH:MM format
    }

    isTimeInRange(currentTime, startTime, endTime) {
        return currentTime >= startTime && currentTime <= endTime;
    }

    wasRecentlyActive(currentTime, endTime) {
        // Check if the schedule just ended (within the last minute)
        const current = this.timeToMinutes(currentTime);
        const end = this.timeToMinutes(endTime);
        return current === end + 1 || (end === 1439 && current === 0); // Handle midnight rollover
    }

    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Bind UI events
    bindEvents() {
        // Manual device control buttons
        document.querySelectorAll('[data-device-control]').forEach(button => {
            button.addEventListener('click', async (e) => {
                const deviceType = e.target.dataset.deviceControl;
                const action = e.target.dataset.action;
                
                await this.controlDevice(deviceType, action, 'manual');
                
                // Update button states
                this.updateControlButtons(deviceType, action);
            });
        });

        // Schedule form submission
        const scheduleForm = document.querySelector('form[action*="schedule.store"]');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleScheduleSubmit(e.target);
            });
        }

        // Schedule toggle buttons
        document.querySelectorAll('form[action*="schedule.toggle"]').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleScheduleToggle(e.target);
            });
        });

        // Schedule delete buttons
        document.querySelectorAll('form[action*="schedule.destroy"]').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (confirm('Hapus jadwal ini?')) {
                    await this.handleScheduleDelete(e.target);
                }
            });
        });
    }

    // Handle schedule form submission
    async handleScheduleSubmit(form) {
        try {
            const formData = new FormData(form);
            const scheduleData = {
                id: Date.now(), // Temporary ID, will be replaced by server
                name: formData.get('name'),
                device_type: formData.get('device_type'),
                day_of_week: formData.get('day_of_week'),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time'),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Validate times
            if (scheduleData.start_time >= scheduleData.end_time) {
                alert('Jam selesai harus lebih besar dari jam mulai!');
                return;
            }

            // Submit to server and sync to Firebase
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
                // Reload schedules
                await this.loadSchedules();
                form.reset();
                this.showMessage('Jadwal berhasil ditambahkan!', 'success');
            } else {
                throw new Error('Server error');
            }

        } catch (error) {
            console.error('Error submitting schedule:', error);
            this.showMessage('Gagal menambahkan jadwal!', 'error');
        }
    }

    // Handle schedule toggle
    async handleScheduleToggle(form) {
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
                await this.loadSchedules();
                this.showMessage('Status jadwal berhasil diubah!', 'success');
            } else {
                throw new Error('Server error');
            }

        } catch (error) {
            console.error('Error toggling schedule:', error);
            this.showMessage('Gagal mengubah status jadwal!', 'error');
        }
    }

    // Handle schedule deletion
    async handleScheduleDelete(form) {
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
                await this.loadSchedules();
                this.showMessage('Jadwal berhasil dihapus!', 'success');
            } else {
                throw new Error('Server error');
            }

        } catch (error) {
            console.error('Error deleting schedule:', error);
            this.showMessage('Gagal menghapus jadwal!', 'error');
        }
    }

    // Update control button states
    updateControlButtons(deviceType, action) {
        const onButton = document.querySelector(`[data-device-control="${deviceType}"][data-action="on"]`);
        const offButton = document.querySelector(`[data-device-control="${deviceType}"][data-action="off"]`);

        if (onButton && offButton) {
            if (action === 'on') {
                onButton.classList.add('btn-success');
                onButton.classList.remove('btn-outline-success');
                offButton.classList.add('btn-outline-danger');
                offButton.classList.remove('btn-danger');
            } else {
                offButton.classList.add('btn-danger');
                offButton.classList.remove('btn-outline-danger');
                onButton.classList.add('btn-outline-success');
                onButton.classList.remove('btn-success');
            }
        }
    }

    // Show user messages
    showMessage(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const alertHtml = `<div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;

        const container = document.querySelector('.card');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 5000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleManager = new ScheduleManager();
});

// Export for use in other modules
export default ScheduleManager;