import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Konfigurasi Firebase
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
const db = getDatabase(app);

// Variabel untuk tracking mode kontrol
let manualMode = false;
let relay1ManualState = null;
let relay2ManualState = null;

// Variabel untuk edit mode
let editMode = false;
let editingId = null;

// Fungsi untuk mengecek apakah harus masuk mode otomatis
function checkAutoModeCondition() {
    const shouldEnterAutoMode = (relay1ManualState === 0 && relay2ManualState === 0);

    if (shouldEnterAutoMode && manualMode) {
        manualMode = false;
        relay1ManualState = null;
        relay2ManualState = null;
        console.log("Mode otomatis diaktifkan - kedua switch dimatikan");
        setTimeout(() => {
            updateLemburStatusDanRelay();
        }, 2500);
    } else if (!shouldEnterAutoMode && (relay1ManualState !== null || relay2ManualState !== null)) {
        manualMode = true;
        console.log("Mode manual tetap aktif - ada switch yang menyala");
    }
}

// Fungsi untuk kontrol manual relay
function manualRelayControl(relayNum, value) {
    if (relayNum === 1) {
        relay1ManualState = value;
    } else if (relayNum === 2) {
        relay2ManualState = value;
    }

    set(ref(db, `/relayControl/relay${relayNum}`), value);
    console.log(`Manual control: Relay ${relayNum} set to ${value}`);
    checkAutoModeCondition();
}

// Fungsi untuk update status lembur dan relay otomatis
function updateLemburStatusDanRelay() {
    if (manualMode) {
        console.log("Skipping auto update - manual mode active");
        return;
    }

    fetch(`/overtime/status-check?_=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            const overtimes = data.overtimes;
            const tbody = document.getElementById("lembur-tbody");

            if (tbody) tbody.innerHTML = "";

            if (!overtimes || overtimes.length === 0) {
                if (tbody) {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td colspan="10" class="text-center">Belum ada data lembur.</td>`;
                    tbody.appendChild(row);
                }

                if (!manualMode) {
                    set(ref(db, "/relayControl/relay1"), 0);
                    set(ref(db, "/relayControl/relay2"), 0);
                    console.log("Auto control: All relays turned OFF - no overtime data");
                }
                return;
            }

            // Ambil semua lembur yang masih aktif (status 1) atau baru saja selesai
            const activeOvertimes = overtimes.filter(overtime => {
                if (overtime.status === 1) return true;

                // Cek jika status 2 tapi masih dalam rentang waktu
                if (overtime.status === 2 && overtime.end_time) {
                    const now = new Date();
                    const endTime = new Date(`${overtime.overtime_date}T${overtime.end_time}`);
                    return now < endTime;
                }

                return false;
            });

            // Update status display untuk semua overtime
            if (tbody) {
                overtimes.forEach((overtime, index) => {
                    const row = document.createElement("tr");

                    // Tentukan status yang akan ditampilkan
                    let displayStatus = overtime.status;
                    let statusText = '';
                    let statusClass = '';

                    if (overtime.status === 1) {
                        statusText = 'Sedang Berjalan';
                        statusClass = 'warning';
                    } else if (overtime.status === 2) {
                        // Cek apakah masih dalam rentang waktu
                        if (overtime.end_time) {
                            const now = new Date();
                            const endTime = new Date(`${overtime.overtime_date}T${overtime.end_time}`);

                            if (now < endTime) {
                                statusText = 'Sedang Berjalan';
                                statusClass = 'warning';
                                displayStatus = 1; // Override untuk display
                            } else {
                                statusText = 'Selesai';
                                statusClass = 'success';
                            }
                        } else {
                            statusText = 'Selesai';
                            statusClass = 'success';
                        }
                    } else {
                        statusText = 'Belum Mulai';
                        statusClass = 'secondary';
                    }

                    let actionButtons = `
                        <button type="button" class="btn btn-sm btn-primary me-1" onclick="editOvertime(${overtime.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button type="button" class="btn btn-sm btn-danger me-1" onclick="deleteOvertime(${overtime.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    `;

                    // Tambahkan button cut-off jika status aktif (baik status 1 atau override)
                    if (displayStatus === 1) {
                        actionButtons += `
                            <button type="button" class="btn btn-sm btn-warning me-1" onclick="cutOffOvertime(${overtime.id})">
                                <i class="fas fa-stop"></i> Cut-off
                            </button>
                        `;
                    }

                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${overtime.division_name}</td>
                        <td>${overtime.employee_name}</td>
                        <td>${overtime.overtime_date}</td>
                        <td>${overtime.start_time}</td>
                        <td>${overtime.end_time ?? '-'}</td>
                        <td>${overtime.duration ?? '-'}</td>
                        <td>
                            <span class="badge bg-${statusClass}">
                                ${statusText}
                            </span>
                        </td>
                        <td>${overtime.notes ?? '-'}</td>
                        <td>${actionButtons}</td>
                    `;
                    tbody.appendChild(row);
                });
            }

            // Kontrol relay berdasarkan overtime aktif
            if (!manualMode) {
                const now = new Date();
                const stillInAnyOvertimePeriod = overtimes.some(overtime => {
                    if (overtime.status === 1 || overtime.status === 2) {
                        if (!overtime.end_time) return false;
                        const endTime = new Date(`${overtime.overtime_date}T${overtime.end_time}`);
                        return now < endTime;
                    }
                    return false;
                });

                const relayState = activeOvertimes.length > 0 ? 1 : 0;

                set(ref(db, "/relayControl/relay1"), relayState);
                set(ref(db, "/relayControl/relay2"), relayState);

                const activeCount = activeOvertimes.length;
                console.log(`Auto control: Relays set to ${relayState} based on ${activeCount} active overtimes`);

                // Log detail untuk debugging
                if (activeOvertimes.length > 0) {
                    activeOvertimes.forEach(overtime => {
                        console.log(`Active overtime: ${overtime.employee_name} - ${overtime.overtime_date} ${overtime.start_time} to ${overtime.end_time}`);
                    });
                }

            }
        })
        .catch(err => {
            console.error("Gagal memuat atau memperbarui lembur:", err);
        });
}

// Fungsi untuk edit overtime
function editOvertime(id) {
    editMode = true;
    editingId = id;

    fetch(`/overtime/${id}/edit`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const overtime = data.overtime;

                // Populate form dengan data existing
                const divisionNameEl = document.getElementById('division_name');
                const employeeNameEl = document.getElementById('employee_name');
                const overtimeDateEl = document.getElementById('overtime_date');
                const startTimeEl = document.getElementById('start_time');
                const endTimeEl = document.getElementById('end_time');
                const notesEl = document.getElementById('notes');

                if (divisionNameEl) divisionNameEl.value = overtime.division_name || '';
                if (employeeNameEl) employeeNameEl.value = overtime.employee_name || '';
                if (overtimeDateEl) overtimeDateEl.value = overtime.overtime_date ? overtime.overtime_date.slice(0, 10) : '';
                if (startTimeEl) startTimeEl.value = overtime.start_time ? overtime.start_time.substring(0, 5) : '';
                if (endTimeEl) endTimeEl.value = overtime.end_time ? overtime.end_time.substring(0, 5) : '';
                if (notesEl) notesEl.value = overtime.notes || '';

                // Update form action dan button text
                const form = document.querySelector('form[action*="overtime"]');
                if (form) {
                    form.action = `/overtime/${id}/update`;
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.textContent = 'Update';
                        submitButton.classList.remove('btn-primary');
                        submitButton.classList.add('btn-success');
                    }

                    // Tambahkan tombol cancel
                    if (!form.querySelector('.btn-cancel')) {
                        const cancelBtn = document.createElement('button');
                        cancelBtn.type = 'button';
                        cancelBtn.className = 'btn btn-secondary btn-cancel ms-2';
                        cancelBtn.textContent = 'Cancel';
                        cancelBtn.onclick = cancelEdit;
                        submitButton.parentNode.appendChild(cancelBtn);
                    }
                }

                // Scroll ke form
                const panelHeading = document.querySelector('.panel-heading h1');
                if (panelHeading) {
                    panelHeading.scrollIntoView({ behavior: 'smooth' });
                }
            }
        })
        .catch(err => {
            console.error("Gagal memuat data overtime untuk edit:", err);
            alert('Gagal memuat data untuk edit');
        });
}

// Fungsi untuk cancel edit
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
            submitButton.classList.remove('btn-success');
            submitButton.classList.add('btn-primary');
        }

        const cancelBtn = form.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }

    // Set tanggal ke hari ini
    const overtimeDateEl = document.getElementById('overtime_date');
    if (overtimeDateEl) {
        overtimeDateEl.value = new Date().toISOString().split('T')[0];
    }
}

// Fungsi untuk delete overtime
function deleteOvertime(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data lembur ini?')) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');

        fetch(`/overtime/${id}/delete`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken ? csrfToken.getAttribute('content') : '',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Data lembur berhasil dihapus');
                    updateLemburStatusDanRelay();
                } else {
                    alert('Gagal menghapus data lembur');
                }
            })
            .catch(err => {
                console.error("Gagal menghapus overtime:", err);
                alert('Gagal menghapus data lembur');
            });
    }
}

// Fungsi untuk cut-off overtime
function cutOffOvertime(id) {
    if (confirm('Apakah Anda yakin ingin menghentikan lembur ini sekarang?')) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');

        fetch(`/overtime/${id}/cutoff`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken ? csrfToken.getAttribute('content') : '',
                'Content-Type': 'application/json'
            }
        })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Server error:", text);
                    throw new Error(`Server Error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Lembur berhasil dihentikan');

                    // PERBAIKAN: Refresh dengan delay untuk memastikan database sudah terupdate
                    setTimeout(() => {
                        updateLemburStatusDanRelay();
                    }, 2500);

                    console.log("Cut-off berhasil - relay akan dimatikan");
                } else {
                    alert(data.message || 'Gagal menghentikan lembur');
                }
            })
            .catch(err => {
                console.error("Gagal cut-off overtime:", err);
                alert('Terjadi kesalahan saat menghentikan lembur');
            });
    }
}

// Fungsi helper untuk format waktu - DIPERBAIKI
function formatTimeForDatabase(timeString) {
    if (!timeString) return null;

    // Jika sudah dalam format HH:MM:SS, return as is
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return timeString;
    }

    // Jika dalam format HH:MM, tambahkan :00
    if (timeString.match(/^\d{1,2}:\d{2}$/)) {
        // Pastikan format HH:MM (2 digit jam)
        const parts = timeString.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1];
        return `${hours}:${minutes}:00`;
    }

    return null;
}

// Fungsi untuk validasi format waktu H:i (sesuai Laravel)
function validateTimeFormat(timeString) {
    if (!timeString) return false;

    // Format H:i Laravel berarti jam (0-23) dan menit (00-59)
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(timeString);
}


// Fungsi untuk setup event listener pada switch
function setupSwitchListeners() {
    const relay1Switch = document.querySelector('input[name="relay1"][type="checkbox"]');
    const relay2Switch = document.querySelector('input[name="relay2"][type="checkbox"]');

    if (relay1Switch) {
        relay1Switch.addEventListener('change', function (e) {
            e.preventDefault();
            const value = this.checked ? 1 : 0;
            manualRelayControl(1, value);
        });
    }

    if (relay2Switch) {
        relay2Switch.addEventListener('change', function (e) {
            e.preventDefault();
            const value = this.checked ? 1 : 0;
            manualRelayControl(2, value);
        });
    }
}

// Fungsi untuk mencegah form submit otomatis
function preventFormSubmit() {
    const form = document.querySelector('form[action*="overtime"]');
    if (form) {
        form.addEventListener('submit', function (e) {
            if (editMode) {
                e.preventDefault();
                handleEditSubmit();
            }
        });
    }
}

// Fungsi untuk handle edit submit - DIPERBAIKI SEPENUHNYA
function handleEditSubmit() {
    const form = document.querySelector('form');
    const divisionNameEl = document.getElementById('division_name');
    const employeeNameEl = document.getElementById('employee_name');
    const overtimeDateEl = document.getElementById('overtime_date');
    const startTimeEl = document.getElementById('start_time');
    const endTimeEl = document.getElementById('end_time');
    const notesEl = document.getElementById('notes');

    if (!divisionNameEl || !employeeNameEl || !overtimeDateEl || !startTimeEl) {
        alert('Form elements tidak ditemukan. Pastikan semua field tersedia.');
        return;
    }

    // Validasi client-side
    if (!divisionNameEl.value.trim()) {
        alert('Nama divisi harus diisi');
        divisionNameEl.focus();
        return;
    }

    if (!employeeNameEl.value.trim()) {
        alert('Nama karyawan harus diisi');
        employeeNameEl.focus();
        return;
    }

    if (!overtimeDateEl.value) {
        alert('Tanggal lembur harus diisi');
        overtimeDateEl.focus();
        return;
    }

    if (!startTimeEl.value) {
        alert('Waktu mulai harus diisi');
        startTimeEl.focus();
        return;
    }

    // Validasi format waktu
    if (!validateTimeFormat(startTimeEl.value)) {
        alert('Format waktu mulai tidak valid. Gunakan format HH:MM (contoh: 09:30)');
        startTimeEl.focus();
        return;
    }

    if (endTimeEl && endTimeEl.value && !validateTimeFormat(endTimeEl.value)) {
        alert('Format waktu selesai tidak valid. Gunakan format HH:MM (contoh: 17:30)');
        endTimeEl.focus();
        return;
    }

    // Validasi tanggal
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(overtimeDateEl.value)) {
        alert('Format tanggal tidak valid (YYYY-MM-DD)');
        overtimeDateEl.focus();
        return;
    }

    // Validasi logika waktu
    if (endTimeEl && endTimeEl.value) {
        const startTime = new Date(`${overtimeDateEl.value}T${startTimeEl.value}`);
        const endTime = new Date(`${overtimeDateEl.value}T${endTimeEl.value}`);

        if (endTime <= startTime) {
            alert('Waktu selesai harus lebih besar dari waktu mulai');
            endTimeEl.focus();
            return;
        }
    }

    const data = {
        division_name: divisionNameEl.value.trim(),
        employee_name: employeeNameEl.value.trim(),
        overtime_date: overtimeDateEl.value,
        start_time: startTimeEl.value,
        end_time: endTimeEl && endTimeEl.value ? endTimeEl.value : null,
        notes: notesEl && notesEl.value ? notesEl.value.trim() : null
    };

    console.log("Data yang akan dikirim ke server:", data);

    const csrfToken = document.querySelector('meta[name="csrf-token"]');

    fetch(`/overtime/${editingId}/update`, {
        method: 'PUT',
        headers: {
            'X-CSRF-TOKEN': csrfToken ? csrfToken.getAttribute('content') : '',
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
                    Object.keys(responseData.errors).forEach(field => {
                        const fieldErrors = responseData.errors[field];
                        errorMessage += `${field}: ${fieldErrors.join(', ')}\n`;
                    });

                    alert(errorMessage);
                    console.error("Validation errors:", responseData.errors);

                    const firstErrorField = Object.keys(responseData.errors)[0];
                    const errorElement = document.getElementById(firstErrorField);
                    if (errorElement) errorElement.focus();
                    return;
                }

                throw new Error(`Server Error: ${res.status} - ${responseData.message || 'Unknown error'}`);
            }

            if (responseData.success) {
                alert('Data lembur berhasil diupdate');
                cancelEdit();

                setTimeout(() => {
                    updateLemburStatusDanRelay();
                }, 2500);

                // Refresh sekali lagi setelah 3 detik untuk memastikan
                // setTimeout(() => {
                //     updateLemburStatusDanRelay();
                // }, 3000);

                console.log("Edit berhasil - relay akan disesuaikan dengan status lembur yang baru");
            } else {
                alert(responseData.message || 'Gagal mengupdate data lembur');
            }
        })
        .catch(err => {
            console.error("Gagal update overtime:", err);
            alert('Terjadi kesalahan saat mengupdate data lembur: ' + err.message);
        });
}

// Fungsi untuk listen perubahan real-time dari Firebase
function listenToFirebaseChanges() {
    onValue(ref(db, "/relayControl/relay1"), (snapshot) => {
        const value = snapshot.val();
        const switchElement = document.querySelector('input[name="relay1"][type="checkbox"]');
        if (switchElement) {
            switchElement.checked = (value === 1);
            console.log(`Firebase update: Relay1 set to ${value}`);
        }
    });

    onValue(ref(db, "/relayControl/relay2"), (snapshot) => {
        const value = snapshot.val();
        const switchElement = document.querySelector('input[name="relay2"][type="checkbox"]');
        if (switchElement) {
            switchElement.checked = (value === 1);
            console.log(`Firebase update: Relay2 set to ${value}`);
        }
    });
}

// Fungsi untuk sinkronisasi state awal
function syncInitialState() {
    onValue(ref(db, "/relayControl/relay1"), (snapshot) => {
        const value = snapshot.val();
        if (value !== null) {
            const switchElement = document.querySelector('input[name="relay1"][type="checkbox"]');
            if (switchElement) {
                switchElement.checked = (value === 1);
            }
        }
    }, { once: true });

    onValue(ref(db, "/relayControl/relay2"), (snapshot) => {
        const value = snapshot.val();
        if (value !== null) {
            const switchElement = document.querySelector('input[name="relay2"][type="checkbox"]');
            if (switchElement) {
                switchElement.checked = (value === 1);
            }
        }
    }, { once: true });
}

// Fungsi untuk reset ke mode otomatis
function resetToAutoMode() {
    manualMode = false;
    relay1ManualState = null;
    relay2ManualState = null;
    console.log("Reset ke mode otomatis");
    updateLemburStatusDanRelay();
}

// Fungsi untuk menampilkan status mode
function showModeStatus() {
    const statusElement = document.getElementById('mode-status');
    if (statusElement) {
        if (manualMode) {
            const activeRelays = [];
            if (relay1ManualState === 1) activeRelays.push('Relay1');
            if (relay2ManualState === 1) activeRelays.push('Relay2');

            statusElement.textContent = `Mode Manual Aktif (${activeRelays.join(', ') || 'Semua OFF'})`;
            statusElement.className = 'badge bg-warning';
        } else {
            statusElement.textContent = 'Mode Otomatis Aktif';
            statusElement.className = 'badge bg-success';
        }
    }
}

// Update status setiap detik
setInterval(showModeStatus, 1000);

// Inisialisasi ketika DOM sudah siap
document.addEventListener('DOMContentLoaded', function () {
    console.log("Initializing Firebase relay control...");

    // Setup dengan delay untuk memastikan DOM sudah siap
    setTimeout(() => {
        setupSwitchListeners();
        preventFormSubmit();
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
window.checkModeStatus = () => {
    return {
        manualMode: manualMode,
        relay1ManualState: relay1ManualState,
        relay2ManualState: relay2ManualState,
        editMode: editMode,
        editingId: editingId
    };
};