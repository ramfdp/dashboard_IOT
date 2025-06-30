function getRandomFloat(min, max, decimals = 2) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
}

function updateSimulasiData() {
    const lampuUsage = getRandomFloat(120, 250);
    const acUsage = getRandomFloat(200, 400);
    const electricityUsage = lampuUsage + acUsage + getRandomFloat(50, 150);
    const suhu = getRandomFloat(25, 31);

    document.getElementById('lampu-value').textContent = lampuUsage + ' KWh';
    document.getElementById('ac-value').textContent = acUsage + ' KWh';
    document.getElementById('listrik-value').textContent = electricityUsage.toFixed(2) + ' KWh';
    document.getElementById('suhu-value').textContent = suhu + ' °C';
}

updateSimulasiData();

setInterval(updateSimulasiData, 60000);