// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// Pie Chart Example
var ctx = document.getElementById('casinoChart');
var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['베팅', '당첨'],
        datasets: [
            {
                data: [74, 26],
                backgroundColor: ['rgba(220,53,69,0.5)', 'rgba(2,117,216,0.5)'],
            },
        ],
    },
    options: {
        plugins: {
            legend: {
                position: 'right',
            },
        },
    },
});
