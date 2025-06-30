// Endpoint API untuk suhu dari Laravel
const API_URL = "http://192.168.30.249:8000/api/sensor/latest";

let usageValues = {
    CM2: 0,
    CM3: 0,
    Sport: 0,
    CM1: 0
};

function updateTotalUsage() {
    let totalUsage = usageValues.CM2 + usageValues.CM3 + usageValues.Sport + usageValues.CM1;
    let lampuUsage = totalUsage * 0.5;
    let acUsage = totalUsage * 0.5;
    document.getElementById("lampu-value").innerText = lampuUsage > 0 ? lampuUsage.toFixed(1) + " KWh" : "N/A";
    document.getElementById("ac-value").innerText = acUsage > 0 ? acUsage.toFixed(1) + " KWh" : "N/A";
    document.getElementById("listrik-value").innerText = totalUsage > 0 ? totalUsage.toFixed(1) + " KWh" : "N/A";
}

function createChart(canvasId, usageId, key) {
    let ctx = document.getElementById(canvasId).getContext("2d");
    let chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Digunakan", "Sisa Kapasitas"],
            datasets: [{
                data: [usageValues[key], 100 - usageValues[key]],
                backgroundColor: ["#ff5733", "#ddd"],
                borderWidth: 1
            }]
        },
        options: {
            circumference: 180,
            rotation: 270,
            cutout: "70%",
            plugins: {
                legend: { display: false }
            }
        }
    });

    document.getElementById(usageId).innerText = usageValues[key] > 0 ? usageValues[key] + " KWh" : "N/A";
    return chart;
}

function updateCharts() {
    chartCM2.data.datasets[0].data[0] = usageValues.CM2;
    chartCM3.data.datasets[0].data[0] = usageValues.CM3;
    chartSport.data.datasets[0].data[0] = usageValues.Sport;
    chartGudang.data.datasets[0].data[0] = usageValues.CM1;

    // Update the displayed usage values or set to "N/A"
    document.getElementById("usageCM2").innerText = usageValues.CM2 > 0 ? usageValues.CM2 + " KWh" : "N/A";
    document.getElementById("usageCM3").innerText = usageValues.CM3 > 0 ? usageValues.CM3 + " KWh" : "N/A";
    document.getElementById("usageSport").innerText = usageValues.Sport > 0 ? usageValues.Sport + " KWh" : "N/A";
    document.getElementById("usageCM1").innerText = usageValues.CM1 > 0 ? usageValues.CM1 + " KWh" : "N/A";

    chartCM2.update();
    chartCM3.update();
    chartSport.update();
    chartGudang.update();
}

document.addEventListener("DOMContentLoaded", function () {
    // Inisialisasi Pusher untuk real-time
    Pusher.logToConsole = true;
    var pusher = new Pusher("c77afdf15a167aa70311", { cluster: "ap1" });

    var channel = pusher.subscribe("sensor-data");
    channel.bind("update-usage", function (data) {
        // Update usage values from Pusher
        usageValues.CM2 = data.CM2;
        usageValues.CM3 = data.CM3;
        usageValues.Sport = data.Sport;
        usageValues.CM1 = data.CM1;

        // Update charts and total usage
        updateCharts();
        updateTotalUsage();
    });

    // Create charts
    let chartCM2 = createChart("chartCM2", "usageCM2", "CM2");
    let chartCM3 = createChart("chartCM3", "usageCM3", "CM3");
    let chartSport = createChart("chartSport", "usageSport", "Sport");
    let chartGudang = createChart("chartCM1", "usageCM1", "CM1");

    // Fetch initial data
    async function fetchInitialData() {
        try {
            let response = await fetch(API_URL);
            let data = await response.json();

            if (data.success) {
                usageValues.CM2 = data.usage.CM2;
                usageValues.CM3 = data.usage.CM3;
                usageValues.Sport = data.usage.Sport;
                usageValues.CM1 = data.usage.CM1;

                updateCharts();
                updateTotalUsage();
            } else {
                console.error("Gagal mengambil data penggunaan");
            }
        } catch (error) {
            console.error("Error fetching usage:", error);
        }
    }

    fetchInitialData(); // Fetch initial data on page load
});