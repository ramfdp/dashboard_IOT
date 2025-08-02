import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const db = getDatabase(initializeApp({
    apiKey: "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg", authDomain: "smart-building-3e5c1.firebaseapp.com",
    databaseURL: "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app", projectId: "smart-building-3e5c1",
    storageBucket: "smart-building-3e5c1.appspot.com", messagingSenderId: "693247019169", appId: "1:693247019169:web:xxxxxx"
}));

let manualMode = false, relay1ManualState = null, relay2ManualState = null, editMode = false, editingId = null;

const checkAutoMode = () => {
    const deviceStates = window.getDeviceStates?.() || {};
    if (deviceStates.manualMode) return manualMode = true;

    const autoMode = relay1ManualState === 0 && relay2ManualState === 0;
    if (autoMode && manualMode) {
        manualMode = false;
        relay1ManualState = relay2ManualState = null;
        setTimeout(() => updateLemburStatusDanRelay(), 1000);
    } else if (!autoMode && (relay1ManualState !== null || relay2ManualState !== null)) {
        manualMode = true;
    }
};

const manualRelayControl = (relayNum, value) => {
    if (relayNum === 1) relay1ManualState = value;
    else if (relayNum === 2) relay2ManualState = value;
    set(ref(db, `/relayControl/relay${relayNum}`), value);
    checkAutoMode();
};

const cleanTime = timeString => timeString?.match(/^(\d{1,2}:\d{2})/)?.[1] + ':00' || null;

const isOvertimeActive = overtime => {
    const now = new Date();
    if (overtime.status === 2) return false;

    if (overtime.status === 1) {
        if (overtime.end_time) {
            const dateOnly = overtime.overtime_date.split(' ')[0];
            const endTime = new Date(`${dateOnly}T${cleanTime(overtime.end_time)}`);
            if (now >= endTime) { completeOvertimeAutomatically(overtime.id); return false; }
        }
        return true;
    }

    const dateOnly = overtime.overtime_date.split(' ')[0];
    const startTime = new Date(`${dateOnly}T${cleanTime(overtime.start_time)}`);
    const endTime = overtime.end_time ? new Date(`${dateOnly}T${cleanTime(overtime.end_time)}`) : null;

    if (overtime.status === 0 && now >= startTime) {
        if (!endTime || now < endTime) { startOvertimeAutomatically(overtime.id); return true; }
        else { completeOvertimeAutomatically(overtime.id); return false; }
    }
    return false;
};

const getStatusInfo = overtime => {
    const statusMap = {
        1: { text: 'Sedang Berjalan', class: 'warning' },
        2: { text: 'Selesai', class: 'success' },
        0: { text: 'Belum Mulai', class: 'secondary' }
    };

    const isActive = isOvertimeActive(overtime);
    if (isActive && overtime.status !== 1) {
        return { displayStatus: 1, statusText: 'Sedang Berjalan', statusClass: 'warning' };
    }

    const status = statusMap[overtime.status] || statusMap[0];
    return { displayStatus: overtime.status, statusText: status.text, statusClass: status.class };
};

// Auto-start overtime when start time is reached
const startOvertimeAutomatically = async (overtimeId) => {
    try {
        const response = await apiRequest(`/overtime/${overtimeId}/auto-start`, {
            method: 'POST',
            body: JSON.stringify({ auto_start: true })
        });
        if (response.success) {
            showOvertimeNotification(`Overtime #${overtimeId} automatically started`, 'success');
            setTimeout(() => updateLemburStatusDanRelay(), 500);
        }
    } catch (error) {
        showOvertimeNotification(`Failed to auto-start overtime #${overtimeId}`, 'danger');
    }
};

const completeOvertimeAutomatically = async (overtimeId) => {
    try {
        showOvertimeNotification(`Auto-completing overtime #${overtimeId}...`, 'warning');
        const response = await apiRequest(`/overtime/${overtimeId}/auto-complete`, {
            method: 'POST',
            body: JSON.stringify({ auto_complete: true })
        });

        if (response.success) {
            showOvertimeNotification(`Overtime #${overtimeId} automatically completed`, 'success');
            const currentData = await apiRequest(`/overtime/status-check?_=${Date.now()}`);
            const remainingActiveOvertimes = currentData.overtimes?.filter(o => o.id !== overtimeId).filter(isOvertimeActive) || [];

            let relay1State = 0, relay2State = 0;
            if (remainingActiveOvertimes.length > 0) {
                remainingActiveOvertimes.forEach(overtime => {
                    const lightSelection = overtime.light_selection || 'all';
                    if (lightSelection === 'itms1' || lightSelection === 'all') relay1State = 1;
                    if (lightSelection === 'itms2' || lightSelection === 'all') relay2State = 1;
                });
                showOvertimeNotification(`Overtime completed - lights updated based on remaining active overtimes`, 'info');
            } else {
                showOvertimeNotification('All overtime completed - lights turned OFF immediately', 'success');
            }

            try {
                await Promise.all([
                    set(ref(db, "/relayControl/relay1"), relay1State),
                    set(ref(db, "/relayControl/relay2"), relay2State)
                ]);
            } catch (firebaseError) {
                showOvertimeNotification('Overtime completed but failed to control lights', 'warning');
            }

            setTimeout(() => {
                updateLemburStatusDanRelay();
                triggerBackendStatusCheck();
            }, 500);
        } else {
            showOvertimeNotification(`Failed to auto-complete overtime #${overtimeId}`, 'danger');
        }
    } catch (error) {
        showOvertimeNotification(`Error auto-completing overtime #${overtimeId}`, 'danger');
    }
};

const apiRequest = async (url, options = {}) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const defaultOptions = { headers: { 'X-CSRF-TOKEN': token || '', 'Content-Type': 'application/json', ...options.headers } };
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) throw new Error(`Server Error: ${response.status}`);
    return response.json();
};

const updateTable = overtimes => {
    const tbody = document.getElementById("lembur-tbody");
    if (!tbody) return;
    if (!overtimes?.length) { tbody.innerHTML = `<tr><td colspan="11" class="text-center">Belum ada data lembur.</td></tr>`; return; }

    tbody.innerHTML = overtimes.map((overtime, index) => {
        const { displayStatus, statusText, statusClass } = getStatusInfo(overtime);
        const formattedDate = new Date(overtime.overtime_date).toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const lightSelection = overtime.light_selection || 'all';
        const lightBadge = lightSelection === 'itms1' ? '<span class="badge bg-info">ITMS 1</span>' :
            lightSelection === 'itms2' ? '<span class="badge bg-warning">ITMS 2</span>' :
                '<span class="badge bg-success">Semua</span>';

        const actions = [
            `<button class="btn btn-sm btn-primary me-1" onclick="editOvertime(${overtime.id})"><i class="fas fa-edit"></i> Edit</button>`,
            `<button class="btn btn-sm btn-danger me-1" onclick="deleteOvertime(${overtime.id})"><i class="fas fa-trash"></i> Delete</button>`,
            displayStatus === 1 ? `<button class="btn btn-sm btn-warning" onclick="cutOffOvertime(${overtime.id})"><i class="fas fa-stop"></i> Cut-off</button>` : ''
        ].join('');

        return `<tr><td>${index + 1}</td><td>${overtime.division_name}</td><td>${overtime.employee_name}</td><td>${formattedDate}</td><td>${overtime.start_time}</td><td>${overtime.end_time ?? '-'}</td><td>${overtime.duration ?? '-'}</td><td><span class="badge bg-${statusClass}">${statusText}</span></td><td>${lightBadge}</td><td>${overtime.notes ?? '-'}</td><td>${actions}</td></tr>`;
    }).join('');
};

const updateLemburStatusDanRelay = async () => {
    const deviceStates = window.getDeviceStates?.() || {};
    if (deviceStates.manualMode || manualMode) {
        try {
            const data = await apiRequest(`/overtime/status-check?_=${Date.now()}`);
            updateTable(data.overtimes);
        } catch (err) {
            console.error("Gagal memuat lembur:", err);
        }
        return;
    }

    try {
        const data = await apiRequest(`/overtime/status-check?_=${Date.now()}`);
        const previousStates = window.previousOvertimeStates || {};
        const currentStates = {};
        let hasStatusChanges = false;

        if (data.overtimes) {
            data.overtimes.forEach(overtime => {
                const currentStatus = overtime.status;
                const previousStatus = previousStates[overtime.id];
                currentStates[overtime.id] = currentStatus;

                if (previousStatus !== undefined && previousStatus !== currentStatus) {
                    hasStatusChanges = true;
                    const message = currentStatus === 2 ? `Overtime #${overtime.id} completed` : `Overtime #${overtime.id} started`;
                    const type = currentStatus === 2 ? 'success' : 'info';
                    showOvertimeNotification(message, type);
                }
            });
        }

        window.previousOvertimeStates = currentStates;
        updateTable(data.overtimes);

        if (data.overtimeAvailable === false) return;

        const manualModeSnapshot = await get(ref(db, "/relayControl/manualMode"));
        if (manualModeSnapshot.val() === true) return;

        const activeOvertimes = data.overtimes?.filter(isOvertimeActive) || [];
        let relay1State = 0, relay2State = 0;

        if (activeOvertimes.length > 0) {
            activeOvertimes.forEach(overtime => {
                const lightSelection = overtime.light_selection || 'all';
                if (lightSelection === 'itms1' || lightSelection === 'all') relay1State = 1;
                if (lightSelection === 'itms2' || lightSelection === 'all') relay2State = 1;
            });

            await Promise.all([
                set(ref(db, "/relayControl/relay1"), relay1State),
                set(ref(db, "/relayControl/relay2"), relay2State)
            ]);
        } else if (hasStatusChanges) {
            await Promise.all([
                set(ref(db, "/relayControl/relay1"), 0),
                set(ref(db, "/relayControl/relay2"), 0)
            ]);
            showOvertimeNotification('All overtime completed - lights turned OFF', 'info');
        }
    } catch (err) {
        console.error("Gagal memuat lembur:", err);
    }
}; const getFormData = () => {
    const elements = ['division_name', 'employee_name', 'overtime_date', 'start_time', 'end_time', 'notes', 'light_selection']
        .reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

    return {
        division_name: elements.division_name.value.trim(),
        employee_name: elements.employee_name.value.trim(),
        overtime_date: elements.overtime_date.value,
        start_time: elements.start_time.value,
        end_time: elements.end_time?.value || null,
        notes: elements.notes?.value?.trim() || null,
        light_selection: elements.light_selection?.value || 'all'
    };
};

const validateForm = () => {
    const elements = getFormData();
    const validations = [
        [elements.division_name, 'Nama divisi harus diisi'], [elements.employee_name, 'Nama karyawan harus diisi'],
        [elements.overtime_date, 'Tanggal lembur harus diisi'], [elements.start_time, 'Waktu mulai harus diisi'],
        [elements.light_selection, 'Pilihan lampu harus dipilih']
    ];

    for (const [value, msg] of validations) {
        if (!value) return alert(msg), false;
    }

    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(elements.start_time)) return alert('Format waktu mulai tidak valid'), false;
    if (elements.end_time && !timePattern.test(elements.end_time)) return alert('Format waktu selesai tidak valid'), false;

    if (elements.end_time) {
        const start = new Date(`${elements.overtime_date}T${elements.start_time}`);
        const end = new Date(`${elements.overtime_date}T${elements.end_time}`);
        if (end <= start) return alert('Waktu selesai harus lebih besar dari waktu mulai'), false;
    }
    return true;
};

const editOvertime = async id => {
    editMode = true;
    editingId = id;
    try {
        const data = await apiRequest(`/overtime/${id}/edit`);
        if (!data.success) return;

        const overtime = data.overtime;
        ['division_name', 'employee_name', 'overtime_date', 'start_time', 'end_time', 'notes', 'light_selection'].forEach(key => {
            const el = document.getElementById(key);
            if (!el) return;
            el.value = key === 'overtime_date' ? overtime[key]?.slice(0, 10) || '' :
                key.includes('time') ? overtime[key]?.substring(0, 5) || '' :
                    key === 'light_selection' ? overtime[key] || 'all' :
                        overtime[key] || '';
        });

        const form = document.querySelector('form[action*="overtime"]');
        if (form) {
            form.action = `/overtime/${id}/update`;
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Update';
                submitBtn.className = submitBtn.className.replace('btn-primary', 'btn-success');
            }
            if (!form.querySelector('.btn-cancel')) {
                const cancelBtn = document.createElement('button');
                Object.assign(cancelBtn, { type: 'button', className: 'btn btn-secondary btn-cancel ms-2', textContent: 'Cancel', onclick: cancelEdit });
                submitBtn.parentNode.appendChild(cancelBtn);
            }
        }
        document.querySelector('.panel-heading h1')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        alert('Gagal memuat data untuk edit');
    }
};

const cancelEdit = () => {
    editMode = false;
    editingId = null;
    const form = document.querySelector('form');
    if (form) {
        form.reset();
        form.action = form.action.replace(/\/overtime\/\d+\/update/, '/overtime/store');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Simpan';
            submitBtn.className = submitBtn.className.replace('btn-success', 'btn-primary');
        }
        form.querySelector('.btn-cancel')?.remove();
    }
    document.getElementById('overtime_date').value = new Date().toISOString().split('T')[0];
};

const deleteOvertime = async id => {
    if (!confirm('Apakah Anda yakin ingin menghapus data lembur ini?')) return;
    try {
        const data = await apiRequest(`/overtime/${id}`, { method: 'DELETE' });
        alert(data.success ? 'Data lembur berhasil dihapus' : 'Gagal menghapus data lembur');
        if (data.success) updateLemburStatusDanRelay();
    } catch (err) {
        alert('Gagal menghapus data lembur');
    }
};

const cutOffOvertime = async id => {
    if (!confirm('Apakah Anda yakin ingin menghentikan lembur ini sekarang?')) return;
    try {
        const data = await apiRequest(`/overtime/${id}/cutoff`, { method: 'POST' });
        alert(data.success ? 'Lembur berhasil dihentikan' : data.message || 'Gagal menghentikan lembur');

        if (data.success) {
            try {
                const currentData = await apiRequest(`/overtime/status-check?_=${Date.now()}`);
                const remainingActiveOvertimes = currentData.overtimes?.filter(o => o.id !== id).filter(isOvertimeActive) || [];

                let relay1State = 0, relay2State = 0;
                if (remainingActiveOvertimes.length > 0) {
                    remainingActiveOvertimes.forEach(overtime => {
                        const lightSelection = overtime.light_selection || 'all';
                        if (lightSelection === 'itms1' || lightSelection === 'all') relay1State = 1;
                        if (lightSelection === 'itms2' || lightSelection === 'all') relay2State = 1;
                    });
                }

                await Promise.all([
                    set(ref(db, "/relayControl/relay1"), relay1State),
                    set(ref(db, "/relayControl/relay2"), relay2State),
                    set(ref(db, "/relayControl/manualMode"), false)
                ]);
            } catch (firebaseError) {
                console.warn('Failed to immediately control relays after cutoff:', firebaseError);
            }
            setTimeout(() => updateLemburStatusDanRelay(), 1500);
        }
    } catch (err) {
        alert('Terjadi kesalahan saat menghentikan lembur');
    }
};

const handleEditSubmit = async () => {
    if (!validateForm()) return;
    try {
        const data = await apiRequest(`/overtime/${editingId}/update`, {
            method: 'PUT',
            body: JSON.stringify(getFormData())
        });
        if (data.success) {
            alert('Data lembur berhasil diupdate');
            cancelEdit();
            setTimeout(() => updateLemburStatusDanRelay(), 1500);
            [2000, 3000].forEach(delay => setTimeout(() => forceRefreshRelayState(), delay));
        } else {
            alert(data.message || 'Gagal mengupdate data lembur');
        }
    } catch (err) {
        alert('Terjadi kesalahan saat mengupdate data lembur');
    }
};

const forceRefreshRelayState = async () => {
    const deviceStates = window.getDeviceStates?.() || {};
    if (deviceStates.manualMode || manualMode) return;

    try {
        const data = await apiRequest(`/overtime/status-check?_=${Date.now()}`);
        if (!data.overtimes?.length) {
            await Promise.all([
                set(ref(db, "/relayControl/relay1"), 0),
                set(ref(db, "/relayControl/relay2"), 0)
            ]);
            return;
        }

        const activeOvertimes = data.overtimes.filter(isOvertimeActive);
        let relay1State = 0, relay2State = 0;

        activeOvertimes.forEach(overtime => {
            const lightSelection = overtime.light_selection || 'all';
            if (lightSelection === 'itms1' || lightSelection === 'all') relay1State = 1;
            if (lightSelection === 'itms2' || lightSelection === 'all') relay2State = 1;
        });

        await Promise.all([
            set(ref(db, "/relayControl/relay1"), relay1State),
            set(ref(db, "/relayControl/relay2"), relay2State)
        ]);
    } catch (err) {
        console.error("Gagal force refresh:", err);
    }
};

const updateSwitchState = (name, value) => {
    const switchEl = document.querySelector(`input[name="${name}"][type="checkbox"].device-switch`);
    if (switchEl && switchEl.checked !== (value === 1)) {
        switchEl.checked = (value === 1);
        const indicator = switchEl.closest(".d-flex")?.querySelector(".indicator");
        if (indicator) indicator.style.backgroundColor = name === 'sos' ? (value === 1 ? "red" : "grey") : (value === 1 ? "green" : "grey");
    }
};

const setupFirebaseListeners = () => { ['relay1', 'relay2', 'sos'].forEach(name => { onValue(ref(db, `/relayControl/${name}`), snapshot => { updateSwitchState(name, snapshot.val()); }); }); };

const showModeStatus = () => {
    const statusEl = document.getElementById('mode-status');
    if (!statusEl) return;

    const deviceStates = window.getDeviceStates?.() || {};
    const sosActive = document.querySelector('input[name="sos"][type="checkbox"].device-switch')?.checked;

    if (sosActive) {
        statusEl.textContent = 'Mode SOS Aktif - Semua Relay ON';
        statusEl.className = 'badge bg-danger';
    } else if (deviceStates.manualMode || manualMode) {
        const getActiveStates = () => {
            const active = [];
            if ((deviceStates.relay1 || relay1ManualState) === 1) active.push('ITMS 1');
            if ((deviceStates.relay2 || relay2ManualState) === 1) active.push('ITMS 2');
            return active;
        };
        statusEl.textContent = `Mode Manual Aktif (${getActiveStates().join(', ') || 'Semua OFF'})`;
        statusEl.className = 'badge bg-warning';
    } else {
        statusEl.textContent = 'Mode Otomatis Aktif (Berdasarkan Jadwal Lembur)';
        statusEl.className = 'badge bg-success';
    }
};

const resetToAutoMode = () => {
    manualMode = false;
    relay1ManualState = relay2ManualState = null;
    if (window.resetDeviceToAutoMode) window.resetDeviceToAutoMode();
    updateLemburStatusDanRelay();
};

// Dedicated function to check for overtime end times
const checkOvertimeEndTimes = async () => {
    try {
        const data = await apiRequest(`/overtime/status-check?_=${Date.now()}`);
        if (!data.overtimes?.length) return;

        const now = new Date();
        let hasStatusChanges = false;

        for (const overtime of data.overtimes) {
            const dateOnly = overtime.overtime_date.split(' ')[0];
            const startTime = new Date(`${dateOnly}T${cleanTime(overtime.start_time)}`);
            const endTime = overtime.end_time ? new Date(`${dateOnly}T${cleanTime(overtime.end_time)}`) : null;

            if (overtime.status === 1 && endTime && now >= endTime) {
                await completeOvertimeAutomatically(overtime.id);
                hasStatusChanges = true;
            } else if (overtime.status === 0 && now >= startTime) {
                if (!endTime || now < endTime) {
                    await startOvertimeAutomatically(overtime.id);
                } else {
                    await completeOvertimeAutomatically(overtime.id);
                }
                hasStatusChanges = true;
            }
        }

        if (hasStatusChanges) {
            await updateLemburStatusDanRelay();
            setTimeout(() => triggerBackendStatusCheck(), 500);
            setTimeout(() => updateLemburStatusDanRelay(), 2000);
        }
    } catch (error) {
        console.error('Error checking overtime end times:', error);
    }
}; document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const form = document.querySelector('form[action*="overtime"]');
        if (form) form.addEventListener('submit', e => { if (editMode) { e.preventDefault(); handleEditSubmit(); } });
        setupFirebaseListeners();
        updateLemburStatusDanRelay();
    }, 1500);

    let overtimeUpdateInterval = setInterval(updateLemburStatusDanRelay, 3000);
    let statusInterval = setInterval(showModeStatus, 2000);
    let overtimeEndTimeCheck = setInterval(checkOvertimeEndTimes, 5000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            [overtimeUpdateInterval, statusInterval, overtimeEndTimeCheck].forEach(clearInterval);
        } else {
            updateLemburStatusDanRelay(); checkOvertimeEndTimes();
            overtimeUpdateInterval = setInterval(updateLemburStatusDanRelay, 3000);
            statusInterval = setInterval(showModeStatus, 2000);
            overtimeEndTimeCheck = setInterval(checkOvertimeEndTimes, 5000);
        }
    });
    window.addEventListener('beforeunload', () => { [overtimeUpdateInterval, statusInterval, overtimeEndTimeCheck].forEach(clearInterval); });
});

Object.assign(window, {
    updateLemburStatusDanRelay, manualRelayControl, resetToAutoMode, editOvertime,
    deleteOvertime, cutOffOvertime, cancelEdit, forceRefreshRelayState,
    debugOvertimeStatus: overtimes => overtimes?.some(isOvertimeActive) || false,
    debugCurrentOvertimeState: () => apiRequest(`/overtime/status-check?_=${Date.now()}`).then(data => {
        console.log("Raw server response:", data);
        if (data.overtimes) console.log("Has active:", data.overtimes.some(isOvertimeActive));
    }).catch(err => console.error("Error checking current state:", err)),
    checkModeStatus: () => ({ manualMode, relay1ManualState, relay2ManualState, editMode, editingId })
});

// Show automatic status change notifications
const showOvertimeNotification = (message, type = 'info') => {
    document.querySelectorAll('.overtime-notification').forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show overtime-notification`;
    notification.style.cssText = 'position: fixed; top: 70px; right: 20px; z-index: 9999; min-width: 350px; max-width: 400px;';

    const iconMap = { 'success': 'check-circle', 'info': 'info-circle', 'warning': 'exclamation-triangle', 'danger': 'exclamation-triangle' };

    notification.innerHTML = `
        <i class="fas fa-${iconMap[type] || 'info-circle'} me-2"></i>
        <strong>Overtime Update:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.parentNode && notification.remove(), 6000);
};

// Trigger backend status check via Livewire
const triggerBackendStatusCheck = () => {
    try {
        if (window.Livewire && window.Livewire.all && window.Livewire.all().length > 0) {
            const overtimeComponent = window.Livewire.all().find(component =>
                component.name === 'overtime-control' ||
                component.__instance.fingerprint.name === 'overtime-control'
            );
            if (overtimeComponent) overtimeComponent.call('checkForAutomaticStatusChanges');
        }
    } catch (error) {
        console.error('Failed to trigger backend status check:', error);
    }
};