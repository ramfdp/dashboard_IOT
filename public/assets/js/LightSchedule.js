import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue, get, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg",
    authDomain: "smart-building-3e5c1.firebaseapp.com",
    databaseURL: "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-building-3e5c1",
    storageBucket: "smart-building-3e5c1.appspot.com",
    messagingSenderId: "693247019169",
    appId: "1:693247019169:web:xxxxxx"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class ScheduleManager {
    constructor() {
        this.schedules = [];
        this.deviceStates = {};
        this.scheduleInterval = null;
        this.lastScheduleCheck = null;
        this.debounceTimeout = null;
        this.init();
    }

    init() {
        this.loadSchedules();
        this.listenToDeviceChanges();
        this.startScheduleChecker();
        this.bindEvents();
    }

    async loadSchedules() {
        try {
            const schedulesRef = ref(database, 'schedules');
            const snapshot = await get(schedulesRef);

            if (snapshot.exists()) {
                const newSchedules = Object.values(snapshot.val());
                if (JSON.stringify(this.schedules) !== JSON.stringify(newSchedules)) {
                    this.schedules = newSchedules;
                    console.log('Schedules updated:', this.schedules);
                }
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    }

    listenToDeviceChanges() {
        const devicesRef = ref(database, 'devices');

        onValue(devicesRef, (snapshot) => {
            if (snapshot.exists()) {
                const newDeviceStates = snapshot.val();
                const hasChanged = JSON.stringify(this.deviceStates) !== JSON.stringify(newDeviceStates);

                if (hasChanged) {
                    this.deviceStates = newDeviceStates;
                    this.debounceUpdateUI();
                    console.log('Device states updated:', this.deviceStates);
                }
            }
        });
    }

    debounceUpdateUI() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout(() => {
            this.updateDeviceUI();
        }, 100);
    }

    updateDeviceUI() {
        Object.keys(this.deviceStates).forEach(deviceType => {
            const device = this.deviceStates[deviceType];
            const statusElement = document.querySelector(`[data-device="${deviceType}"] .device-status`);

            if (statusElement) {
                const newText = device.status === 1 ? 'Aktif' : 'Nonaktif';
                const newClass = `device-status badge ${device.status === 1 ? 'bg-success' : 'bg-secondary'}`;

                if (statusElement.textContent !== newText) {
                    statusElement.textContent = newText;
                }
                if (statusElement.className !== newClass) {
                    statusElement.className = newClass;
                }
            }
        });
    }

    startScheduleChecker() {
        this.checkSchedules();

        this.scheduleInterval = setInterval(() => {
            this.checkSchedules();
        }, 60000);
    }

    stopScheduleChecker() {
        if (this.scheduleInterval) {
            clearInterval(this.scheduleInterval);
            this.scheduleInterval = null;
        }
    }

    checkSchedules() {
        const now = new Date();
        const currentTimeString = now.toISOString();

        if (this.lastScheduleCheck === currentTimeString) {
            return;
        }
        this.lastScheduleCheck = currentTimeString;

        const currentDay = this.getCurrentDay();
        const currentTime = this.getCurrentTime();

        console.log(`Checking schedules for ${currentDay} at ${currentTime}`);

        const desiredStates = {
            relay1: 0,
            relay2: 0
        };

        this.schedules.forEach(schedule => {
            if (!schedule.is_active || schedule.day_of_week !== currentDay) return;

            const start = schedule.start_time;
            const end = schedule.end_time;

            if (this.isTimeInRange(currentTime, start, end)) {
                desiredStates[schedule.device_type] = 1;
            }
        });

        Object.entries(desiredStates).forEach(([deviceType, desiredStatus]) => {
            const currentStatus = this.deviceStates[deviceType]?.status;
            if (currentStatus !== desiredStatus) {
                console.log(`Updating ${deviceType}: ${currentStatus} → ${desiredStatus}`);
                this.controlDevice(deviceType, desiredStatus, 'schedule');
            }
        });
    }

    async controlDevice(deviceType, action, source = 'manual') {
        try {
            const deviceRef = ref(database, `devices/${deviceType}`);
            const deviceData = {
                status: parseInt(action),
                timestamp: new Date().toISOString(),
                source: source
            };

            await set(deviceRef, deviceData);
            console.log(`Device ${deviceType} turned ${action} by ${source}`);

            if (!this.deviceStates[deviceType]) {
                this.deviceStates[deviceType] = {};
            }
            this.deviceStates[deviceType].status = parseInt(action);
            this.deviceStates[deviceType].timestamp = deviceData.timestamp;
            this.deviceStates[deviceType].source = source;

        } catch (error) {
            console.error(`Error controlling device ${deviceType}:`, error);
        }
    }

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

    getCurrentDay() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date().getDay()];
    }

    getCurrentTime() {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
    }

    isTimeInRange(currentTime, startTime, endTime) {
        return currentTime >= startTime && currentTime <= endTime;
    }

    wasRecentlyActive(currentTime, endTime) {
        const current = this.timeToMinutes(currentTime);
        const end = this.timeToMinutes(endTime);
        return current === end + 1 || (end === 1439 && current === 0);
    }

    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    bindEvents() {
        const handleDeviceControl = async (e) => {
            const deviceType = e.target.dataset.deviceControl;
            const action = e.target.dataset.action;

            await this.controlDevice(deviceType, action, 'manual');
            this.updateControlButtons(deviceType, action);
        };

        const handleScheduleSubmit = async (e) => {
            e.preventDefault();
            await this.handleScheduleSubmit(e.target);
        };

        const handleScheduleToggle = async (e) => {
            e.preventDefault();
            await this.handleScheduleToggle(e.target);
        };

        const handleScheduleDelete = async (e) => {
            e.preventDefault();
            if (confirm('Hapus jadwal ini?')) {
                await this.handleScheduleDelete(e.target);
            }
        };

        document.querySelectorAll('[data-device-control]').forEach(button => {
            button.addEventListener('click', handleDeviceControl, { passive: false });
        });

        const scheduleForm = document.querySelector('form[action*="schedule.store"]');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', handleScheduleSubmit, { passive: false });
        }

        document.querySelectorAll('form[action*="schedule.toggle"]').forEach(form => {
            form.addEventListener('submit', handleScheduleToggle, { passive: false });
        });

        document.querySelectorAll('form[action*="schedule.destroy"]').forEach(form => {
            form.addEventListener('submit', handleScheduleDelete, { passive: false });
        });
    }

    async handleScheduleSubmit(form) {
        try {
            const formData = new FormData(form);
            const scheduleData = {
                id: Date.now(),
                name: formData.get('name'),
                device_type: formData.get('device_type'),
                day_of_week: formData.get('day_of_week'),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time'),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (scheduleData.start_time >= scheduleData.end_time) {
                alert('Jam selesai harus lebih besar dari jam mulai!');
                return;
            }

            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
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

    updateControlButtons(deviceType, action) {
        const onButton = document.querySelector(`[data-device-control="${deviceType}"][data-action="1"]`);
        const offButton = document.querySelector(`[data-device-control="${deviceType}"][data-action="0"]`);

        if (onButton && offButton) {
            if (parseInt(action) === 1) {
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

    showMessage(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const alertHtml = `<div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;

        const container = document.querySelector('.card');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);

            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 5000);
        }
    }

    cleanup() {
        this.stopScheduleChecker();
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
        this.schedules = [];
        this.deviceStates = {};
        console.log('ScheduleManager cleaned up');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.scheduleManager) {
        window.scheduleManager.cleanup();
    }
    window.scheduleManager = new ScheduleManager();
});

window.addEventListener('beforeunload', () => {
    if (window.scheduleManager) {
        window.scheduleManager.cleanup();
    }
});

export default ScheduleManager;
