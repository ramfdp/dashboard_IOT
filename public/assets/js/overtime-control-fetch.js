import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const app = initializeApp({
    apiKey: "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg",
    authDomain: "smart-building-3e5c1.firebaseapp.com",
    databaseURL: "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-building-3e5c1",
    storageBucket: "smart-building-3e5c1.appspot.com",
    messagingSenderId: "693247019169",
    appId: "1:693247019169:web:xxxxxx"
});
const db = getDatabase(app);

let manualMode = false, relay1ManualState = null, relay2ManualState = null, editMode = false, editingId = null;

function checkAutoMode() {
    const autoMode = relay1ManualState === 0 && relay2ManualState === 0;
    if (autoMode && manualMode) {
        manualMode = false;
        relay1ManualState = relay2ManualState = null;
        setTimeout(() => updateLemburStatusDanRelay(), 2500);
    } else if (!autoMode && (relay1ManualState !== null || relay2ManualState !== null)) {
        manualMode = true;
    }
}

function manualRelayControl(relayNum, value) {
    if (relayNum === 1) relay1ManualState = value;
    else if (relayNum === 2) relay2ManualState = value;
    set(ref(db, `/relayControl/relay${relayNum}`), value);
    checkAutoMode();
}

function cleanTime(timeString) {
    if (!timeString) return null;
    const match = timeString.match(/^(\d{1,2}:\d{2}(?::\d{2})?)/);
    if (match) {
        let time = match[1];
        if (!time.includes(':00') && time.split(':').length === 2) time += ':00';
        return time;
    }
    const simple = timeString.match(/^(\d{1,2}:\d{2})/);
    return simple ? simple[1] + ':00' : null;
}

function debugOvertimes(overtimes) {
    const now = new Date();
    if (!overtimes?.length) return false;
    let hasActive = false;
    overtimes.forEach(overtime => {
        let isActive = false;
        if (overtime.status === 1) isActive = true;
        else if (overtime.status === 2 && overtime.end_time) {
            const cleanEnd = cleanTime(overtime.end_time);
            if (cleanEnd) {
                const endTime = new Date(`${overtime.overtime_date}T${cleanEnd}`);
                if (!isNaN(endTime.getTime())) isActive = now < endTime;
            }
        } else if (overtime.status === 0 && overtime.start_time) {
            const cleanStart = cleanTime(overtime.start_time);
            if (cleanStart) {
                const startTime = new Date(`${overtime.overtime_date}T${cleanStart}`);
                if (!isNaN(startTime.getTime())) {
                    let endTime = null;
                    if (overtime.end_time) {
                        const cleanEnd = cleanTime(overtime.end_time);
                        if (cleanEnd) {
                            endTime = new Date(`${overtime.overtime_date}T${cleanEnd}`);
                            if (isNaN(endTime.getTime())) endTime = null;
                        }
                    }
                    isActive = now >= startTime && (!endTime || now < endTime);
                }
            }
        }
        if (isActive) hasActive = true;
    });
    return hasActive;
}

function getStatusInfo(overtime) {
    const now = new Date();
    let displayStatus = overtime.status, statusText = '', statusClass = '';

    if (overtime.status === 1) {
        statusText = 'Sedang Berjalan';
        statusClass = 'warning';
    } else if (overtime.status === 2) {
        if (overtime.end_time) {
            const cleanEnd = cleanTime(overtime.end_time);
            if (cleanEnd) {
                const endTime = new Date(`${overtime.overtime_date}T${cleanEnd}`);
                if (!isNaN(endTime.getTime()) && now < endTime) {
                    statusText = 'Sedang Berjalan';
                    statusClass = 'warning';
                    displayStatus = 1;
                } else {
                    statusText = 'Selesai';
                    statusClass = 'success';
                }
            } else {
                statusText = 'Selesai';
                statusClass = 'success';
            }
        } else {
            statusText = 'Selesai';
            statusClass = 'success';
        }
    } else {
        if (overtime.start_time) {
            const cleanStart = cleanTime(overtime.start_time);
            if (cleanStart) {
                const startTime = new Date(`${overtime.overtime_date}T${cleanStart}`);
                if (!isNaN(startTime.getTime())) {
                    let endTime = null;
                    if (overtime.end_time) {
                        const cleanEnd = cleanTime(overtime.end_time);
                        if (cleanEnd) {
                            endTime = new Date(`${overtime.overtime_date}T${cleanEnd}`);
                            if (isNaN(endTime.getTime())) endTime = null;
                        }
                    }
                    if (now >= startTime && (!endTime || now < endTime)) {
                        statusText = 'Sedang Berjalan';
                        statusClass = 'warning';
                        displayStatus = 1;
                    } else {
                        statusText = 'Belum Mulai';
                        statusClass = 'secondary';
                    }
                } else {
                    statusText = 'Belum Mulai';
                    statusClass = 'secondary';
                }
            } else {
                statusText = 'Belum Mulai';
                statusClass = 'secondary';
            }
        } else {
            statusText = 'Belum Mulai';
            statusClass = 'secondary';
        }
    }
    return { displayStatus, statusText, statusClass };
}

function updateLemburStatusDanRelay() {
    if (manualMode) return;
    fetch(`/overtime/status-check?_=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            const overtimes = data.overtimes;
            const tbody = document.getElementById("lembur-tbody");
            if (tbody) tbody.innerHTML = "";

            if (!overtimes?.length) {
                if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="text-center">Belum ada data lembur.</td></tr>`;
                if (!manualMode) {
                    set(ref(db, "/relayControl/relay1"), 0);
                    set(ref(db, "/relayControl/relay2"), 0);
                }
                return;
            }

            if (tbody) {
                overtimes.forEach((overtime, index) => {
                    const { displayStatus, statusText, statusClass } = getStatusInfo(overtime);
                    let actions = `
                        <button type="button" class="btn btn-sm btn-primary me-1" onclick="editOvertime(${overtime.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button type="button" class="btn btn-sm btn-danger me-1" onclick="deleteOvertime(${overtime.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>`;

                    if (displayStatus === 1) {
                        actions += `<button type="button" class="btn btn-sm btn-warning me-1" onclick="cutOffOvertime(${overtime.id})">
                            <i class="fas fa-stop"></i> Cut-off
                        </button>`;
                    }

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${overtime.division_name}</td>
                        <td>${overtime.employee_name}</td>
                        <td>${overtime.overtime_date}</td>
                        <td>${overtime.start_time}</td>
                        <td>${overtime.end_time ?? '-'}</td>
                        <td>${overtime.duration ?? '-'}</td>
                        <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                        <td>${overtime.notes ?? '-'}</td>
                        <td>${actions}</td>`;
                    tbody.appendChild(row);
                });
            }

            if (!manualMode) {
                const hasActive = debugOvertimes(overtimes);
                const relayState = hasActive ? 1 : 0;
                set(ref(db, "/relayControl/relay1"), relayState);
                set(ref(db, "/relayControl/relay2"), relayState);
            }
        })
        .catch(err => console.error("Gagal memuat lembur:", err));
}

function editOvertime(id) {
    editMode = true;
    editingId = id;
    fetch(`/overtime/${id}/edit`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const overtime = data.overtime;
                const elements = {
                    division_name: document.getElementById('division_name'),
                    employee_name: document.getElementById('employee_name'),
                    overtime_date: document.getElementById('overtime_date'),
                    start_time: document.getElementById('start_time'),
                    end_time: document.getElementById('end_time'),
                    notes: document.getElementById('notes')
                };

                Object.entries(elements).forEach(([key, el]) => {
                    if (el) {
                        if (key === 'overtime_date') el.value = overtime[key] ? overtime[key].slice(0, 10) : '';
                        else if (key.includes('time')) el.value = overtime[key] ? overtime[key].substring(0, 5) : '';
                        else el.value = overtime[key] || '';
                    }
                });

                const form = document.querySelector('form[action*="overtime"]');
                if (form) {
                    form.action = `/overtime/${id}/update`;
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.textContent = 'Update';
                        submitButton.className = submitButton.className.replace('btn-primary', 'btn-success');
                    }
                    if (!form.querySelector('.btn-cancel')) {
                        const cancelBtn = document.createElement('button');
                        cancelBtn.type = 'button';
                        cancelBtn.className = 'btn btn-secondary btn-cancel ms-2';
                        cancelBtn.textContent = 'Cancel';
                        cancelBtn.onclick = cancelEdit;
                        submitButton.parentNode.appendChild(cancelBtn);
                    }
                }
                document.querySelector('.panel-heading h1')?.scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch(err => {
            console.error("Gagal memuat data overtime:", err);
            alert('Gagal memuat data untuk edit');
        });
}

function cancelEdit() {
    editMode = false;
    editingId = null;
    const form = document.querySelector('form');
    if (form) {
        form.reset();
        form.action = form.action.replace(/\/overtime\/\d+\/update/, '/overtime/store');
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Simpan';
            submitButton.className = submitButton.className.replace('btn-success', 'btn-primary');
        }
        form.querySelector('.btn-cancel')?.remove();
    }
    const overtimeDateEl = document.getElementById('overtime_date');
    if (overtimeDateEl) overtimeDateEl.value = new Date().toISOString().split('T')[0];
}

function deleteOvertime(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data lembur ini?')) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        fetch(`/overtime/${id}/delete`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken?.getAttribute('content') || '',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.success ? 'Data lembur berhasil dihapus' : 'Gagal menghapus data lembur');
                if (data.success) updateLemburStatusDanRelay();
            })
            .catch(err => {
                console.error("Gagal menghapus overtime:", err);
                alert('Gagal menghapus data lembur');
            });
    }
}

function cutOffOvertime(id) {
    if (confirm('Apakah Anda yakin ingin menghentikan lembur ini sekarang?')) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        fetch(`/overtime/${id}/cutoff`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken?.getAttribute('content') || '',
                'Content-Type': 'application/json'
            }
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Server Error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                alert(data.success ? 'Lembur berhasil dihentikan' : data.message || 'Gagal menghentikan lembur');
                if (data.success) {
                    setTimeout(() => updateLemburStatusDanRelay(), 4000);
                }
            })
            .catch(err => {
                console.error("Gagal cut-off overtime:", err);
                alert('Terjadi kesalahan saat menghentikan lembur');
            });
    }
}

function validateTime(timeString) {
    return timeString && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
}

function validateForm() {
    const elements = {
        division_name: document.getElementById('division_name'),
        employee_name: document.getElementById('employee_name'),
        overtime_date: document.getElementById('overtime_date'),
        start_time: document.getElementById('start_time'),
        end_time: document.getElementById('end_time')
    };

    const validations = [
        { el: elements.division_name, msg: 'Nama divisi harus diisi' },
        { el: elements.employee_name, msg: 'Nama karyawan harus diisi' },
        { el: elements.overtime_date, msg: 'Tanggal lembur harus diisi' },
        { el: elements.start_time, msg: 'Waktu mulai harus diisi' }
    ];

    for (const { el, msg } of validations) {
        if (!el?.value.trim()) {
            alert(msg);
            el.focus();
            return false;
        }
    }

    if (!validateTime(elements.start_time.value)) {
        alert('Format waktu mulai tidak valid. Gunakan format HH:MM');
        elements.start_time.focus();
        return false;
    }

    if (elements.end_time?.value && !validateTime(elements.end_time.value)) {
        alert('Format waktu selesai tidak valid. Gunakan format HH:MM');
        elements.end_time.focus();
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(elements.overtime_date.value)) {
        alert('Format tanggal tidak valid (YYYY-MM-DD)');
        elements.overtime_date.focus();
        return false;
    }

    if (elements.end_time?.value) {
        const startTime = new Date(`${elements.overtime_date.value}T${elements.start_time.value}`);
        const endTime = new Date(`${elements.overtime_date.value}T${elements.end_time.value}`);
        if (endTime <= startTime) {
            alert('Waktu selesai harus lebih besar dari waktu mulai');
            elements.end_time.focus();
            return false;
        }
    }
    return true;
}

function handleEditSubmit() {
    if (!validateForm()) return;

    const elements = {
        division_name: document.getElementById('division_name'),
        employee_name: document.getElementById('employee_name'),
        overtime_date: document.getElementById('overtime_date'),
        start_time: document.getElementById('start_time'),
        end_time: document.getElementById('end_time'),
        notes: document.getElementById('notes')
    };

    const data = {
        division_name: elements.division_name.value.trim(),
        employee_name: elements.employee_name.value.trim(),
        overtime_date: elements.overtime_date.value,
        start_time: elements.start_time.value,
        end_time: elements.end_time?.value || null,
        notes: elements.notes?.value?.trim() || null
    };

    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    fetch(`/overtime/${editingId}/update`, {
        method: 'PUT',
        headers: {
            'X-CSRF-TOKEN': csrfToken?.getAttribute('content') || '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(async (res) => {
            const responseData = await res.json();
            if (!res.ok) {
                if (res.status === 422 && responseData.errors) {
                    let errorMessage = 'Validasi gagal:\n';
                    Object.entries(responseData.errors).forEach(([field, errors]) => {
                        errorMessage += `${field}: ${errors.join(', ')}\n`;
                    });
                    alert(errorMessage);
                    const firstErrorField = Object.keys(responseData.errors)[0];
                    document.getElementById(firstErrorField)?.focus();
                    return;
                }
                throw new Error(`Server Error: ${res.status}`);
            }
            if (responseData.success) {
                alert('Data lembur berhasil diupdate');
                cancelEdit();
                setTimeout(() => updateLemburStatusDanRelay(), 4000);
                setTimeout(() => forceRefreshRelayState(), 7000);
                setTimeout(() => forceRefreshRelayState(), 10000);
            } else {
                alert(responseData.message || 'Gagal mengupdate data lembur');
            }
        })
        .catch(err => {
            console.error("Gagal update overtime:", err);
            alert('Terjadi kesalahan saat mengupdate data lembur');
        });
}

function debugCurrentOvertimeState() {
    fetch(`/overtime/status-check?_=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            console.log("Raw server response:", data);
            if (data.overtimes) debugOvertimes(data.overtimes);
        })
        .catch(err => console.error("Error checking current state:", err));
}

function forceRefreshRelayState() {
    if (manualMode) return;
    fetch(`/overtime/status-check?_=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            const overtimes = data.overtimes;
            if (!overtimes?.length) {
                set(ref(db, "/relayControl/relay1"), 0);
                set(ref(db, "/relayControl/relay2"), 0);
                return;
            }
            const hasActive = debugOvertimes(overtimes);
            const relayState = hasActive ? 1 : 0;
            set(ref(db, "/relayControl/relay1"), relayState);
            set(ref(db, "/relayControl/relay2"), relayState);
        })
        .catch(err => console.error("Gagal force refresh:", err));
}

function setupSwitchListeners() {
    ['relay1', 'relay2'].forEach((relay, index) => {
        const switchEl = document.querySelector(`input[name="${relay}"][type="checkbox"]`);
        if (switchEl) {
            switchEl.addEventListener('change', function (e) {
                e.preventDefault();
                manualRelayControl(index + 1, this.checked ? 1 : 0);
            });
        }
    });
}

function listenToFirebaseChanges() {
    ['relay1', 'relay2'].forEach(relay => {
        onValue(ref(db, `/relayControl/${relay}`), (snapshot) => {
            const value = snapshot.val();
            const switchEl = document.querySelector(`input[name="${relay}"][type="checkbox"]`);
            if (switchEl) switchEl.checked = (value === 1);
        });
    });
}

function syncInitialState() {
    ['relay1', 'relay2'].forEach(relay => {
        onValue(ref(db, `/relayControl/${relay}`), (snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                const switchEl = document.querySelector(`input[name="${relay}"][type="checkbox"]`);
                if (switchEl) switchEl.checked = (value === 1);
            }
        }, { once: true });
    });
}

function resetToAutoMode() {
    manualMode = false;
    relay1ManualState = relay2ManualState = null;
    updateLemburStatusDanRelay();
}

function showModeStatus() {
    const statusEl = document.getElementById('mode-status');
    if (statusEl) {
        if (manualMode) {
            const active = [];
            if (relay1ManualState === 1) active.push('Relay1');
            if (relay2ManualState === 1) active.push('Relay2');
            statusEl.textContent = `Mode Manual Aktif (${active.join(', ') || 'Semua OFF'})`;
            statusEl.className = 'badge bg-warning';
        } else {
            statusEl.textContent = 'Mode Otomatis Aktif';
            statusEl.className = 'badge bg-success';
        }
    }
}

setInterval(showModeStatus, 1000);

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        setupSwitchListeners();
        const form = document.querySelector('form[action*="overtime"]');
        if (form) {
            form.addEventListener('submit', function (e) {
                if (editMode) {
                    e.preventDefault();
                    handleEditSubmit();
                }
            });
        }
        listenToFirebaseChanges();
        syncInitialState();
        updateLemburStatusDanRelay();
    }, 500);
    setInterval(updateLemburStatusDanRelay, 10000);
});

window.updateLemburStatusDanRelay = updateLemburStatusDanRelay;
window.manualRelayControl = manualRelayControl;
window.resetToAutoMode = resetToAutoMode;
window.editOvertime = editOvertime;
window.deleteOvertime = deleteOvertime;
window.cutOffOvertime = cutOffOvertime;
window.cancelEdit = cancelEdit;
window.forceRefreshRelayState = forceRefreshRelayState;
window.debugOvertimeStatus = debugOvertimes;
window.debugCurrentOvertimeState = debugCurrentOvertimeState;
window.checkModeStatus = () => ({
    manualMode, relay1ManualState, relay2ManualState, editMode, editingId
});
