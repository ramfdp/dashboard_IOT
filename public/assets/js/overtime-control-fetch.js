import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const db = getDatabase(initializeApp({
    apiKey: "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg",
    authDomain: "smart-building-3e5c1.firebaseapp.com",
    databaseURL: "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-building-3e5c1",
    storageBucket: "smart-building-3e5c1.appspot.com",
    messagingSenderId: "693247019169",
    appId: "1:693247019169:web:xxxxxx"
}));

let manualMode = false, relay1ManualState = null, relay2ManualState = null, editMode = false, editingId = null;

const checkAutoMode = () => {
    // Check if device is in manual mode by checking if any switches were manually operated
    const deviceStates = window.getDeviceStates?.() || {};
    const deviceManualMode = deviceStates.manualMode;

    // If device is in manual mode, don't interfere with manual control
    if (deviceManualMode) {
        manualMode = true;
        return;
    }

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

    // If overtime is cut off (status = 2), it's never active regardless of time
    if (overtime.status === 2) return false;

    // If overtime is running (status = 1), it's active
    if (overtime.status === 1) return true;

    // If overtime is not started yet (status = 0), check if it should be active based on time
    const startTime = new Date(`${overtime.overtime_date}T${cleanTime(overtime.start_time)}`);
    const endTime = overtime.end_time ? new Date(`${overtime.overtime_date}T${cleanTime(overtime.end_time)}`) : null;

    return overtime.status === 0 && now >= startTime && (!endTime || now < endTime);
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

const apiRequest = async (url, options = {}) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const defaultOptions = {
        headers: { 'X-CSRF-TOKEN': token || '', 'Content-Type': 'application/json', ...options.headers }
    };
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) throw new Error(`Server Error: ${response.status}`);
    return response.json();
};

const updateTable = overtimes => {
    const tbody = document.getElementById("lembur-tbody");
    if (!tbody) return;

    if (!overtimes?.length) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center">Belum ada data lembur.</td></tr>`;
        return;
    }

    tbody.innerHTML = overtimes.map((overtime, index) => {
        const { displayStatus, statusText, statusClass } = getStatusInfo(overtime);
        const formattedDate = new Date(overtime.overtime_date).toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const actions = [
            `<button class="btn btn-sm btn-primary me-1" onclick="editOvertime(${overtime.id})"><i class="fas fa-edit"></i> Edit</button>`,
            `<button class="btn btn-sm btn-danger me-1" onclick="deleteOvertime(${overtime.id})"><i class="fas fa-trash"></i> Delete</button>`,
            displayStatus === 1 ? `<button class="btn btn-sm btn-warning" onclick="cutOffOvertime(${overtime.id})"><i class="fas fa-stop"></i> Cut-off</button>` : ''
        ].join('');

        return `<tr>
            <td>${index + 1}</td>
            <td>${overtime.division_name}</td>
            <td>${overtime.employee_name}</td>
            <td>${formattedDate}</td>
            <td>${overtime.start_time}</td>
            <td>${overtime.end_time ?? '-'}</td>
            <td>${overtime.duration ?? '-'}</td>
            <td><span class="badge bg-${statusClass}">${statusText}</span></td>
            <td>${overtime.notes ?? '-'}</td>
            <td>${actions}</td>
        </tr>`;
    }).join('');
};

const updateLemburStatusDanRelay = async () => {
    // Check if device is in manual mode - if so, don't auto-control relays
    const deviceStates = window.getDeviceStates?.() || {};
    if (deviceStates.manualMode || manualMode) {
        console.log('Manual mode detected - skipping automatic relay control');
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
        updateTable(data.overtimes);

        // Check if overtime system is available from backend
        if (data.overtimeAvailable === false) {
            console.log('Overtime system: Not available - scheduler system active');
            return;
        }

        // Check if system is in manual mode before controlling relays
        const manualModeRef = ref(db, "/relayControl/manualMode");
        const manualModeSnapshot = await get(manualModeRef);
        const isManualMode = manualModeSnapshot.val() === true;

        if (isManualMode) {
            console.log('Overtime system: Skipping relay control - device in manual mode');
            return;
        }

        // Only control relays if overtime is available and not in manual mode
        const hasActive = data.overtimes?.some(isOvertimeActive) || false;

        if (hasActive) {
            console.log('Overtime mode - turning ON relays for overtime work');
            set(ref(db, "/relayControl/relay1"), 1);
            set(ref(db, "/relayControl/relay2"), 1);
        } else {
            // Don't turn off relays here - let schedule system handle it
            console.log('No active overtime - letting schedule system control relays');
        }
    } catch (err) {
        console.error("Gagal memuat lembur:", err);
    }
}; const getFormData = () => {
    const elements = ['division_name', 'employee_name', 'overtime_date', 'start_time', 'end_time', 'notes']
        .reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

    return {
        division_name: elements.division_name.value.trim(),
        employee_name: elements.employee_name.value.trim(),
        overtime_date: elements.overtime_date.value,
        start_time: elements.start_time.value,
        end_time: elements.end_time?.value || null,
        notes: elements.notes?.value?.trim() || null
    };
};

const validateForm = () => {
    const elements = getFormData();
    const validations = [
        [elements.division_name, 'Nama divisi harus diisi'],
        [elements.employee_name, 'Nama karyawan harus diisi'],
        [elements.overtime_date, 'Tanggal lembur harus diisi'],
        [elements.start_time, 'Waktu mulai harus diisi']
    ];

    for (const [value, msg] of validations) {
        if (!value) return alert(msg), false;
    }

    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(elements.start_time)) {
        return alert('Format waktu mulai tidak valid'), false;
    }

    if (elements.end_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(elements.end_time)) {
        return alert('Format waktu selesai tidak valid'), false;
    }

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
        const elements = ['division_name', 'employee_name', 'overtime_date', 'start_time', 'end_time', 'notes'];

        elements.forEach(key => {
            const el = document.getElementById(key);
            if (!el) return;

            if (key === 'overtime_date') el.value = overtime[key]?.slice(0, 10) || '';
            else if (key.includes('time')) el.value = overtime[key]?.substring(0, 5) || '';
            else el.value = overtime[key] || '';
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
                Object.assign(cancelBtn, {
                    type: 'button',
                    className: 'btn btn-secondary btn-cancel ms-2',
                    textContent: 'Cancel',
                    onclick: cancelEdit
                });
                submitBtn.parentNode.appendChild(cancelBtn);
            }
        }
        document.querySelector('.panel-heading h1')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error("Gagal memuat data overtime:", err);
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
        console.error("Gagal menghapus overtime:", err);
        alert('Gagal menghapus data lembur');
    }
};

const cutOffOvertime = async id => {
    if (!confirm('Apakah Anda yakin ingin menghentikan lembur ini sekarang?')) return;
    try {
        const data = await apiRequest(`/overtime/${id}/cutoff`, { method: 'POST' });
        alert(data.success ? 'Lembur berhasil dihentikan' : data.message || 'Gagal menghentikan lembur');

        if (data.success) {
            // Immediately turn OFF relays when cutoff is successful
            try {
                set(ref(db, "/relayControl/relay1"), 0);
                set(ref(db, "/relayControl/relay2"), 0);
                set(ref(db, "/relayControl/manualMode"), false);
                console.log('Relays turned OFF immediately after cutoff');
            } catch (firebaseError) {
                console.warn('Failed to immediately control relays after cutoff:', firebaseError);
            }

            setTimeout(() => updateLemburStatusDanRelay(), 1500);
        }
    } catch (err) {
        console.error("Gagal cut-off overtime:", err);
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
        console.error("Gagal update overtime:", err);
        alert('Terjadi kesalahan saat mengupdate data lembur');
    }
};

const forceRefreshRelayState = async () => {
    // Check if device is in manual mode - if so, don't force refresh
    const deviceStates = window.getDeviceStates?.() || {};
    if (deviceStates.manualMode || manualMode) {
        console.log('Manual mode detected - skipping force refresh');
        return;
    }

    try {
        const data = await apiRequest(`/overtime/status-check?_=${Date.now()}`);
        if (!data.overtimes?.length) {
            set(ref(db, "/relayControl/relay1"), 0);
            set(ref(db, "/relayControl/relay2"), 0);
            return;
        }
        const hasActive = data.overtimes.some(isOvertimeActive);
        const relayState = hasActive ? 1 : 0;

        console.log('Force refresh - updating relays to:', relayState);
        set(ref(db, "/relayControl/relay1"), relayState);
        set(ref(db, "/relayControl/relay2"), relayState);
    } catch (err) {
        console.error("Gagal force refresh:", err);
    }
};

const updateSwitchState = (name, value) => {
    const switchEl = document.querySelector(`input[name="${name}"][type="checkbox"].device-switch`);
    if (switchEl && switchEl.checked !== (value === 1)) {
        switchEl.checked = (value === 1);
        const indicator = switchEl.closest(".d-flex")?.querySelector(".indicator");
        if (indicator) {
            const color = name === 'sos' ? (value === 1 ? "red" : "grey") : (value === 1 ? "green" : "grey");
            indicator.style.backgroundColor = color;
        }
    }
};

const setupFirebaseListeners = () => {
    ['relay1', 'relay2', 'sos'].forEach(name => {
        onValue(ref(db, `/relayControl/${name}`), snapshot => {
            updateSwitchState(name, snapshot.val());
        });
    });
};

const showModeStatus = () => {
    const statusEl = document.getElementById('mode-status');
    if (!statusEl) return;

    // Check device manual mode first
    const deviceStates = window.getDeviceStates?.() || {};
    const sosActive = document.querySelector('input[name="sos"][type="checkbox"].device-switch')?.checked;

    if (sosActive) {
        statusEl.textContent = 'Mode SOS Aktif - Semua Relay ON';
        statusEl.className = 'badge bg-danger';
    } else if (deviceStates.manualMode) {
        const active = [];
        if (deviceStates.relay1 === 1) active.push('ITMS 1');
        if (deviceStates.relay2 === 1) active.push('ITMS 2');
        statusEl.textContent = `Mode Manual Aktif (${active.join(', ') || 'Semua OFF'})`;
        statusEl.className = 'badge bg-warning';
    } else if (manualMode) {
        const active = [];
        if (relay1ManualState === 1) active.push('ITMS 1');
        if (relay2ManualState === 1) active.push('ITMS 2');
        statusEl.textContent = `Mode Manual Aktif (${active.join(', ') || 'Semua OFF'})`;
        statusEl.className = 'badge bg-warning';
    } else {
        statusEl.textContent = 'Mode Otomatis Aktif (Berdasarkan Jadwal Lembur)';
        statusEl.className = 'badge bg-success';
    }
};

const resetToAutoMode = () => {
    // Reset both manual modes
    manualMode = false;
    relay1ManualState = relay2ManualState = null;

    // Reset device manual mode if function exists
    if (window.resetDeviceToAutoMode) {
        window.resetDeviceToAutoMode();
    }

    updateLemburStatusDanRelay();
}; document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const form = document.querySelector('form[action*="overtime"]');
        if (form) {
            form.addEventListener('submit', e => {
                if (editMode) {
                    e.preventDefault();
                    handleEditSubmit();
                }
            });
        }

        setupFirebaseListeners();
        updateLemburStatusDanRelay();
        console.log('Overtime control system initialized');
    }, 1500);

    let overtimeUpdateInterval = setInterval(updateLemburStatusDanRelay, 15000);
    let statusInterval = setInterval(showModeStatus, 5000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(overtimeUpdateInterval);
            clearInterval(statusInterval);
        } else {
            overtimeUpdateInterval = setInterval(updateLemburStatusDanRelay, 15000);
            statusInterval = setInterval(showModeStatus, 5000);
        }
    });

    window.addEventListener('beforeunload', () => {
        clearInterval(overtimeUpdateInterval);
        clearInterval(statusInterval);
    });
});

// Export functions to global scope
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
