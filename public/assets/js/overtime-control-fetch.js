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
let relay1ManualState = null; // null = tidak ada kontrol manual, 0/1 = kontrol manual
let relay2ManualState = null;

// Fungsi untuk mengecek apakah harus masuk mode otomatis
function checkAutoModeCondition() {
    // Masuk mode otomatis jika kedua relay dimatikan secara manual (bernilai 0)
    const shouldEnterAutoMode = (relay1ManualState === 0 && relay2ManualState === 0);

    if (shouldEnterAutoMode && manualMode) {
        manualMode = false;
        relay1ManualState = null;
        relay2ManualState = null;
        console.log("Mode otomatis diaktifkan - kedua switch dimatikan");
        // Jalankan update sekali untuk sync dengan status lembur
        setTimeout(() => {
            updateLemburStatusDanRelay();
        }, 1000);
    } else if (!shouldEnterAutoMode && (relay1ManualState !== null || relay2ManualState !== null)) {
        manualMode = true;
        console.log("Mode manual tetap aktif - ada switch yang menyala");
    }
}

// Fungsi untuk kontrol manual relay
function manualRelayControl(relayNum, value) {
    // Update state manual untuk relay yang bersangkutan
    if (relayNum === 1) {
        relay1ManualState = value;
    } else if (relayNum === 2) {
        relay2ManualState = value;
    }

    // Set ke Firebase
    set(ref(db, `/relayControl/relay${relayNum}`), value);
    console.log(`Manual control: Relay ${relayNum} set to ${value}`);

    // Cek kondisi untuk mode otomatis
    checkAutoModeCondition();
}

// Fungsi untuk update status lembur dan relay otomatis
function updateLemburStatusDanRelay() {
    // Skip jika sedang dalam mode manual
    if (manualMode) {
        console.log("Skipping auto update - manual mode active");
        return;
    }

    fetch("/overtime/status-check")
        .then(res => res.json())
        .then(data => {
            const overtimes = data.overtimes;

            const tbody = document.getElementById("lembur-tbody");
            if (tbody) tbody.innerHTML = "";

            if (!overtimes || overtimes.length === 0) {
                if (tbody) {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td colspan="9" class="text-center">Belum ada data lembur.</td>`;
                    tbody.appendChild(row);
                }

                // Matikan semua relay jika tidak ada lembur (hanya jika tidak manual mode)
                if (!manualMode) {
                    set(ref(db, "/relayControl/relay1"), 0);
                    set(ref(db, "/relayControl/relay2"), 0);
                    console.log("Auto control: All relays turned OFF - no overtime data");
                }
                return;
            }

            const latestOvertime = overtimes[0];
            const status = latestOvertime.status;

            // Update tabel lembur jika ada
            if (tbody) {
                overtimes.forEach((overtime, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${overtime.division_name}</td>
                        <td>${overtime.employee_name}</td>
                        <td>${overtime.overtime_date}</td>
                        <td>${overtime.start_time}</td>
                        <td>${overtime.end_time ?? '-'}</td>
                        <td>${overtime.duration ?? '-'}</td>
                        <td>
                            <span class="badge bg-${overtime.status === 0 ? 'secondary' : overtime.status === 1 ? 'warning' : 'success'}">
                                ${overtime.status === 0 ? 'Belum Mulai' : overtime.status === 1 ? 'Sedang Berjalan' : 'Selesai'}
                            </span>
                        </td>
                        <td>${overtime.notes ?? '-'}</td>
                    `;
                    tbody.appendChild(row);
                });
            }

            // Kontrol Relay berdasarkan status (hanya jika tidak manual mode)
            if (!manualMode) {
                const isActive = (status === 1);
                set(ref(db, "/relayControl/relay1"), isActive ? 1 : 0);
                set(ref(db, "/relayControl/relay2"), isActive ? 1 : 0);
                console.log(`Auto control: Relays set to ${isActive ? 1 : 0} based on overtime status ${status}`);
            }
        })
        .catch(err => {
            console.error("Gagal memuat atau memperbarui lembur:", err);
        });
}

// Fungsi untuk setup event listener pada switch
function setupSwitchListeners() {
    // Cari checkbox untuk relay1 dan relay2
    const relay1Switch = document.querySelector('input[name="relay1"][type="checkbox"]');
    const relay2Switch = document.querySelector('input[name="relay2"][type="checkbox"]');

    if (relay1Switch) {
        relay1Switch.addEventListener('change', function (e) {
            e.preventDefault(); // Mencegah form submit otomatis
            const value = this.checked ? 1 : 0;
            manualRelayControl(1, value);
        });
    }

    if (relay2Switch) {
        relay2Switch.addEventListener('change', function (e) {
            e.preventDefault(); // Mencegah form submit otomatis
            const value = this.checked ? 1 : 0;
            manualRelayControl(2, value);
        });
    }
}

// Fungsi untuk mencegah form submit otomatis ketika switch diklik
function preventFormSubmit() {
    const form = document.querySelector('form[action*="dashboard.update"]');
    if (form) {
        // Hapus event listener submit default
        form.addEventListener('submit', function (e) {
            // Hanya izinkan submit jika tombol submit yang diklik
            if (!e.submitter || !e.submitter.type === 'submit') {
                e.preventDefault();
            }
        });

        // Disable tombol submit sementara untuk menghindari konflik
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.style.display = 'none'; // Sembunyikan tombol submit
        }
    }
}

// Fungsi untuk listen perubahan real-time dari Firebase
function listenToFirebaseChanges() {
    // Listen untuk relay1
    onValue(ref(db, "/relayControl/relay1"), (snapshot) => {
        const value = snapshot.val();
        const switchElement = document.querySelector('input[name="relay1"][type="checkbox"]');
        if (switchElement) {
            switchElement.checked = (value === 1);
            console.log(`Firebase update: Relay1 set to ${value}`);
        }
    });

    // Listen untuk relay2
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
    // Ambil state awal dari Firebase
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

// Fungsi untuk reset ke mode otomatis (untuk debugging)
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

    // Setup event listeners untuk switch
    setupSwitchListeners();

    // Prevent form auto-submit
    preventFormSubmit();

    // Setup Firebase listeners
    listenToFirebaseChanges();

    // Sinkronisasi state awal
    syncInitialState();

    // Jalankan update lembur pertama kali
    updateLemburStatusDanRelay();

    // Jalankan update lembur setiap 10 detik
    setInterval(updateLemburStatusDanRelay, 10000);
});

// Export fungsi untuk debugging
window.manualRelayControl = manualRelayControl;
window.resetToAutoMode = resetToAutoMode;
window.checkModeStatus = () => {
    return {
        manualMode: manualMode,
        relay1ManualState: relay1ManualState,
        relay2ManualState: relay2ManualState
    };
};