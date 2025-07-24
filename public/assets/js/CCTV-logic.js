document.addEventListener('DOMContentLoaded', () => {
    const timestampEl = document.getElementById('current-timestamp');

    const updateTimestamp = () => {
        if (timestampEl) {
            timestampEl.textContent = new Date().toLocaleString('id-ID', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            });
        }
    };

    const updateCameraStatus = (id, status) => {
        const el = document.getElementById(`status-${id}`);
        if (el) el.className = `status-indicator ${status === 'offline' ? 'offline' : ''}`;
    };

    const refreshCamera = id => {
        const img = document.getElementById(`camera-${id}`);
        const overlay = document.getElementById(`loading-${id}`);
        if (!img || !overlay) return;

        overlay.style.display = 'flex';
        const newSrc = img.src.split('?')[0] + '?t=' + Date.now();

        img.addEventListener('load', () => {
            overlay.style.display = 'none';
            updateCameraStatus(id, 'online');
        }, { once: true });

        img.addEventListener('error', () => {
            overlay.style.display = 'none';
            updateCameraStatus(id, 'offline');
        }, { once: true });

        img.src = newSrc;
    };

    const refreshAllCameras = () => {
        document.querySelectorAll('[id^="camera-"]').forEach(cam => {
            refreshCamera(cam.id.replace('camera-', ''));
        });
    };

    const checkCameraStatus = () => {
        document.querySelectorAll('[id^="camera-"]').forEach(cam => {
            const id = cam.id.replace('camera-', '');
            cam.addEventListener('load', () => updateCameraStatus(id, 'online'));
            cam.addEventListener('error', () => updateCameraStatus(id, 'offline'));
        });
    };

    let timestampInterval = setInterval(updateTimestamp, 1000);
    let cameraRefreshInterval = setInterval(refreshAllCameras, 60000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(timestampInterval);
            clearInterval(cameraRefreshInterval);
        } else {
            timestampInterval = setInterval(updateTimestamp, 1000);
            cameraRefreshInterval = setInterval(refreshAllCameras, 60000);
        }
    });

    window.addEventListener('beforeunload', () => {
        clearInterval(timestampInterval);
        clearInterval(cameraRefreshInterval);
    });

    updateTimestamp();
    checkCameraStatus();

    // Expose for global button
    window.refreshAllCameras = refreshAllCameras;
});
