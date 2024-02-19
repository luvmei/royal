// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// Area Chart Example
var ctx = document.getElementById('betChart');
var myLineChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['19일', '20일', '21일', '22일', '23일', '24일', '25일', '26일'],
        datasets: [
            {
                label: '베팅',
                backgroundColor: 'rgba(220,53,69,0.5)',
                borderColor: 'rgba(220,53,69,0.3)',
                data: [144, 723, 1243, 1839, 828, 658, 324, 2332],
            },
            {
                label: '롤링',
                backgroundColor: 'rgba(2,117,216,0.5)',
                borderColor: 'rgba(2,117,216,0.3)',
                data: [230, 301, 2626, 183, 812, 1286, 312, 1530],
            },
            {
                label: '루징',
                backgroundColor: 'rgba(25,135,84, 0.5)',
                borderColor: 'rgba(25,135,84,0.3)',
                data: [230, 301, 2626, 183, 812, 1286, 312, 1530],
            },
        ],
    },
    options: {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                        callback: function (value, index, values) {
                            if (parseInt(value) >= 1000) {
                                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                            } else {
                                return value;
                            }
                        },
                    },
                },
            ],
        },
    },
});
