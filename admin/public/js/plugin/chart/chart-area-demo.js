// Set new default font family and font color to mimic Bootstrap's default styling
// Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
// Chart.defaults.global.defaultFontColor = '#292b2c';

// Area Chart Example
// startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
// endDate = moment().format('YYYY-MM-DD');
// console.log(startDate, endDate);

let dateLabels = [];
let depositTotal = [];
let withdrawTotal = [];

for (var i = 0; i < 7; i++) {
  var date = moment().subtract(i, "days").format("DD");
  dateLabels.unshift(date + "일");
}

Chart.defaults.global.tooltips.callbacks.label = function (tooltipItem, data) {
  var value = tooltipItem.yLabel;
  return value.toLocaleString();
};

$.ajax({
  method: "POST",
  url: "/bankchart",
  dataType: "json",
})
  .done(function (result) {
    for (var i = 0; i < 7; i++) {
      let matchData = result.find((item) => item.date.endsWith(dateLabels[i].replace("일", "")));
      if (matchData) {
        depositTotal.push(matchData.depositTotal || 0);
        withdrawTotal.push(matchData.withdrawTotal || 0);
      } else {
        depositTotal.push(0);
        withdrawTotal.push(0);
      }
    }

    var ctx = document.getElementById("moneyChart").getContext("2d");
    var myLineChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: "입금",
            backgroundColor: "rgba(220,53,69,0.5)",
            borderColor: "rgba(220,53,69,0.2)",
            data: depositTotal,
          },
          {
            label: "출금",
            backgroundColor: "rgba(2,117,216,0.5)",
            borderColor: "rgba(2,117,216,0.2)",
            data: withdrawTotal,
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
                  return value.toLocaleString("kr-KR");
                },
              },
            },
          ],
        },
      },
    });
  })
  .fail(function (err) {
    console.log(err);
  });
