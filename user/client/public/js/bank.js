const { spinnerToggle } = require('./common');

// #region 보유금 주기적 갱신
let curBalance;
let curPoint;

export function getAsset() {
  $.ajax({
    method: 'POST',
    url: '/user/asset',
  })
    .done(function (result) {
      if (result) {
        curBalance = result.balance.toLocaleString('ko-KR');
        document.querySelector('#navBalance').innerHTML = curBalance;
        curPoint = result.point.toLocaleString('ko-KR');
        document.querySelector('#navPoint').innerHTML = curPoint;
        document.querySelectorAll('.userBalance').forEach((el) => {
          el.innerHTML = curBalance;
        });
        deposit.curMoney = result.balance;
        withdraw.curMoney = result.balance;
      } else {
        clearInterval(assetInterval);
        location.href = '/';
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

let assetInterval = setInterval(() => {
  if (clientId) {
    getAsset();
  }
}, 1000 * 5);
// #endregion

// #region 입금모달
//todo 신청금액 없을 시 경고메시지 표시하기
let bonus;
let deposit = {
  reqExist: false,
  curMoney: undefined,
  pushedMoney: 0,
  reqMoney: 0,
  afterReqMoney: 0,
  bonusMoney: 0,
  joinBonusRate: 0,
  dailyBonusRate: 0,
  isReqAccount: false,
  reqMoneyText: document.querySelector('#deposit-req-money'),
  bonusTitleText: document.querySelector('#deposit-bonus-text'),
  bonusMoneyText: document.querySelector('#deposit-bonus-money').parentElement,
  afterReqMoneyText: document.querySelector('#deposit-after-money'),
};

let accountReqBtn = document.querySelector('#deposit-req-bank');
let bonusType;

//? 입금계좌 요청
accountReqBtn.addEventListener('click', function () {
  reqBankAccount();
});

//? 입금금액 버튼
$('#deposit-btn-group .col-3 button.btn.btn-light').click(function (e) {
  pushMoneyBtn(deposit, e);
});

//? 모달열기 > 금액 설정
$('#depositModal').on('show.bs.modal', async function () {
  getAsset();
  await checkBonusType();
  deposit.reqMoneyText.innerHTML = '0';
  deposit.afterReqMoneyText.innerHTML = deposit.curMoney.toLocaleString('ko-KR');
  if (bonus.bonusState == 0) {
    deposit.bonusTitleText.classList.add('d-none');
    deposit.bonusMoneyText.classList.add('d-none');
  } else if (bonus.bonusState == 1) {
    if (bonus.bonus_type == 0) {
      deposit.bonusTitleText.classList.add('d-none');
      deposit.bonusMoneyText.classList.add('d-none');
    } else if (bonus.bonus_type == 1) {
      deposit.bonusTitleText.innerHTML = `매일 첫 충전 ${bonus.dailyBonusRate}% 보너스`;
      document.querySelector('#deposit-bonus-money').innerHTML = '0';
    } else if (bonus.bonus_type == 2) {
      deposit.bonusTitleText.innerHTML = `가입 첫 충전 ${bonus.joinBonusRate}% 보너스`;
      document.querySelector('#deposit-bonus-money').innerHTML = '0';
    } else if (bonus.bonus_type == 3) {
      deposit.bonusTitleText.innerHTML = `재충전 ${bonus.everyBonusRate}% 보너스`;
      document.querySelector('#deposit-bonus-money').innerHTML = '0';
    } else if (bonus.bonus_type == 4) {
      deposit.bonusTitleText.innerHTML = `가입 재충전 ${bonus.joinEveryBonusRate}% 보너스`;
      document.querySelector('#deposit-bonus-money').innerHTML = '0';
    }
  }
});

//? 모달닫기 > 금액 클리어
$('#depositModal').on('hidden.bs.modal', function () {
  assetModalClear(deposit);
});

//? 정정 버튼
document.querySelector('#deposit-modify').addEventListener('click', function () {
  pushClearBtn(deposit);
});

//? 입금신청 버튼
document.querySelector('#deposit-submit').addEventListener('click', function () {
  document.querySelector('#deposit-submit').disabled = true;
  if (!deposit.isReqAccount) {
    document.getElementById('alert-text').innerHTML = `<div class='fs-5'>입금계좌를 먼저 요청해주세요</div>`;
    // document.querySelector('#alertModal #returnMessageBtn').classList.add('d-none');
    // document.querySelector('#alertModal #closeMessageModal').classList.remove('d-none');

    $('#alertModal').modal('show');
    document.querySelector('#deposit-submit').disabled = false;
    return;
  } else if (deposit.reqMoney == 0) {
    document.getElementById('alert-text').innerHTML = `<div class='fs-5'>입금신청 할 금액을 확인하세요</div>`;
    $('#alertModal').modal('show');
    document.querySelector('#deposit-submit').disabled = false;
    return;
  } else {
    setTimeout(() => {
      spinnerToggle();
      pushRequestBtn(deposit);
    }, 1000);
  }
});

//? 입금 보너스 변경
checkBonusType();
function checkBonusType() {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'POST',
      url: '/bank/bonus',
    })
      .done(function (result) {
        bonus = result;
        deposit.bonusType = result.bonusType;
        deposit.joinBonusRate = result.joinBonusRate;
        deposit.dailyBonusRate = result.dailyBonusRate;
        resolve(); // 비동기 작업이 성공적으로 완료되면 resolve를 호출합니다.
      })
      .fail(function (error) {
        reject(error); // 에러가 발생하면 reject를 호출합니다.
      });
  });
}

// function checkBonusType() {
//   $.ajax({
//     method: 'POST',
//     url: '/bank/bonus',
//   })
//     .done(function (result) {
//       bonus = result;
//       deposit.bonusType = result.bonusType;
//       deposit.joinBonusRate = result.joinBonusRate;
//       deposit.dailyBonusRate = result.dailyBonusRate;
//     })
//     .fail(function (error) {
//       reject(error);
//     });
// }
// #endregion

// #region 입금내역 모달
//? 입금내역 테이블(dataTable)
$('#depositHistory').DataTable({
  language: korean,
  responsive: true,
  autoWidth: false,

  ajax: {
    url: '/bank/table',
    method: 'POST',
    data: { type: 'depositHistory' },
    dataSrc: '',
    error: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 429) {
        window.location.reload();
      }
    },
  },
  dom: 'ltip',
  columns: [
    { data: 'IDX' },
    { data: '신청일시', className: 'control', responsivePriority: 1 },
    { data: '신청금액', className: 'desktop' },
    { data: '보너스금액', className: 'desktop' },
    { data: null, responsivePriority: 2 },
    { data: '처리현황', responsivePriority: 3 },
    { data: '처리일시', className: 'desktop' },
  ],
  pageLength: 10,
  lengthMenu: [10, 50, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: 0, visible: false },
    {
      target: [0, 1, 2, 3, 4, 5, 6],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: 6,
      render: function (data, type, row) {
        if (row.처리현황 == '신청취소' || row.처리현황 == '승인취소') return '';
        return data;
      },
    },
    {
      target: [1, 6],
      render: function (data, type, row) {
        if (type === 'display') {
          data = data.slice(2);
        }
        return data;
      },
    },
    {
      target: [2, 3],
      className: 'dt-body-right',
      render: function (data) {
        return data.toLocaleString('ko-KR');
      },
    },
    {
      target: 4,
      className: 'dt-body-right',
      render: function (data, type, row) {
        data = row.신청금액 + row.보너스금액;
        return data.toLocaleString('ko-KR');
      },
    },
    {
      target: 5,
      render: function (data, type, row) {
        if (data == '입금승인') {
          return `<button class='btn btn-sm btn-outline-success disabled'>${data}</button>`;
        } else if (data == '신청취소' || data == '승인취소') {
          return `<button class='btn btn-sm btn-outline-danger disabled'>${data}</button>`;
        }
      },
    },
  ],
  createdRow: function (row, data, dataIndex) {
    if (data.처리현황 == '입금승인') {
      $(row).addClass('bg-pastel-success');
    } else if (data.처리현황 == '신청취소' || data.처리현황 == '승인취소') {
      $(row).addClass('bg-pastel-danger');
    }
  },
});
// #endregion

// #region 출금모달
//todo 신청금액 없을 시 경고메시지 표시하기
let withdraw = {
  reqExist: false,
  curMoney: undefined,
  pushedMoney: 0,
  reqMoney: 0,
  afterReqMoney: 0,
  reqMoneyText: document.querySelector('#withdraw-req-money'),
  afterReqMoneyText: document.querySelector('#withdraw-after-money'),
  bankHolder: document.querySelector('#withdraw-holder').nextElementSibling,
  bank: document.querySelector('#withdraw-bank').nextElementSibling,
  account: document.querySelector('#withdraw-account').nextElementSibling,
};

//? 출금금액 버튼
$('#withdraw-btn-group .col-3 button.btn.btn-light').click(function (e) {
  pushMoneyBtn(withdraw, e);
});

let userBankInfo;
//? 모달열기 > 금액 및 은행정보 설정
$('#withdrawModal').on('show.bs.modal', async function () {
  getAsset();
  await getBankInfo();
  withdraw.reqMoneyText.innerHTML = '0';
  withdraw.afterReqMoneyText.innerHTML = withdraw.curMoney.toLocaleString('ko-KR');
});

async function getBankInfo() {
  $.ajax({
    method: 'POST',
    url: '/bank/userbankinfo',
  }).done(function (result) {
    userBankInfo = result.userBankInfo;
    withdraw.bankHolder.value = userBankInfo.bank_owner;
    withdraw.bank.value = userBankInfo.bank;
    withdraw.account.value = userBankInfo.bank_num;
  });
}

//? 모달닫기 > 금액 클리어
$('#withdrawModal').on('hidden.bs.modal', function () {
  assetModalClear(withdraw);
});

//? 정정 버튼
document.querySelector('#withdraw-modify').addEventListener('click', function () {
  pushClearBtn(withdraw);
});

//? 출금비번 입력
document.querySelector('#withdraw-password').addEventListener('input', function () {
  //누른 값이 숫자인지 정규식으로 확인 후 숫자가 아니면 한자리를 지우고 alertModal의 내용을 표시하고 모달창 띄우기
  const regex = /^[0-9]*$/;
  if (!regex.test(this.value)) {
    this.value = this.value.substring(0, this.value.length - 1);
    showAlert('숫자만 입력하세요');
    $('#alertModal').modal('show');
  }
});

//? 출금비번 확인
async function checkWithdrawPassword() {
  const password = document.querySelector('#withdraw-password').value;

  try {
    const response = await $.ajax({
      method: 'POST',
      url: '/bank/password',
      data: { password: password },
    });
    return response.isValid;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

//? 출금신청 버튼
document.querySelector('#withdraw-submit').addEventListener('click', function () {
  const passwordInput = document.querySelector('#withdraw-password');
  const password = passwordInput.value;

  this.disabled = true;

  if (withdraw.reqMoney == 0) {
    showAlert('출금신청 할 금액을 확인하세요');
    this.disabled = false;
    return;
  }

  if (!password || password.length !== 6 || !/^\d{6}$/.test(password)) {
    showAlert('유효한 비밀번호를 입력하세요<br>(6자리 숫자)');
    this.disabled = false;
    return;
  }

  checkWithdrawPassword()
    .then((isValid) => {
      if (isValid) {
        setTimeout(() => {
          spinnerToggle();
          pushRequestBtn(withdraw);
        }, 1000);
      } else {
        showAlert('입력하신 비밀번호가 일치하지 않습니다.');
        this.disabled = false;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      showAlert('오류가 발생했습니다. 다시 시도해주세요.');
      this.disabled = false;
    });
});

function showAlert(message) {
  document.getElementById('alert-text').innerHTML = `<div class='fs-5'>${message}</div>`;
  $('#alertModal').modal('show');
}
// #endregion

// #region 출금내역 모달
//? 출금내역 테이블(dataTable)
$('#withdrawHistory').DataTable({
  language: korean,
  responsive: true,
  autoWidth: false,

  ajax: {
    url: '/bank/table',
    method: 'POST',
    data: { type: 'withdrawHistory' },
    dataSrc: '',
    error: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 429) {
        window.location.reload();
      }
    },
  },
  dom: 'ltip',
  columns: [
    { data: 'IDX' },
    { data: '신청일시', className: 'control', responsivePriority: 1 },
    { data: '신청금액', responsivePriority: 2 },
    { data: '처리현황', responsivePriority: 3 },
    { data: '처리일시', className: 'desktop' },
  ],
  pageLength: 10,
  lengthMenu: [10, 50, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: 0, visible: false },
    {
      target: [0, 1, 2, 3, 4],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: 4,
      render: function (data, type, row) {
        if (row.처리현황 == '신청취소' || row.처리현황 == '승인취소') return '';
        return data;
      },
    },
    {
      target: [1, 4],
      render: function (data, type, row) {
        if (type === 'display') {
          data = data.slice(2);
        }
        return data;
      },
    },
    {
      target: 2,
      className: 'dt-body-right',
      render: function (data) {
        return data.toLocaleString('ko-KR');
      },
    },
    {
      target: 3,
      render: function (data, type, row) {
        if (data == '출금승인') {
          return `<button class='btn btn-sm btn-outline-success disabled'>${data}</button>`;
        } else if (data == '신청취소' || data == '승인취소') {
          return `<button class='btn btn-sm btn-outline-danger disabled'>${data}</button>`;
        }
      },
    },
  ],
  createdRow: function (row, data, dataIndex) {
    if (data.처리현황 == '출금승인') {
      $(row).addClass('bg-pastel-success');
    } else if (data.처리현황 == '신청취소' || data.처리현황 == '승인취소') {
      $(row).addClass('bg-pastel-danger');
    }
  },
});
// #endregion

// #region 리워드모달
// #region 포인트 설정 전환방식
// let reward = {
//   curBalance: document.getElementById('rewarCurrentBalance'),
//   afterRewardBalance: document.getElementById('afterRewardBalance'),
//   curPoint: document.getElementById('rewardCurrentPoint'),
//   requestPoint: document.getElementById('rewardRequestPoint'),
//   exchangeBtn: document.getElementById('reward-submit'),
// };

// //? 모달열기 > 금액 및 포인트 채우기
// $('#rewardModal').on('show.bs.modal', async function () {
//   $.ajax({
//     method: 'POST',
//     url: '/bank/asset',
//   }).done(function (result) {
//     reward.curBalance.textContent = result.balance.toLocaleString('ko-KR');
//     reward.curPoint.textContent = result.point.toLocaleString('ko-KR');
//     reward.requestPoint.textContent = '0';
//     updateAfterRewardBalance();
//   });
// });

// //? 포인트 버튼 클릭 이벤트
// $('#reward-btn-group .col-3 button.btn.btn-light').click(function (e) {
//   pushPointBtn(reward, e);
//   updateAfterRewardBalance();
// });

// //? 전환 신청 버튼 클릭 이벤트
// reward.exchangeBtn.addEventListener('click', function () {
//   $.ajax({
//     method: 'POST',
//     url: '/bank/reward',
//     data: {
//       reqPoints: parseInt(reward.requestPoint.textContent.replace(/,/g, ''), 10),
//     },
//   }).done(function (result) {
//     $('#rewardModal').modal('hide');
//     document.getElementById('confirm-text').innerHTML = `<div class='fs-5'>${result}</div>`;
//     $('#confirmModal').modal('show');
//   });
// });

// //? 포인트 버튼 처리 함수
// function pushPointBtn(reward, e) {
//   let points = parseInt(reward.curPoint.textContent.replace(/,/g, ''), 10); // 현재 포인트
//   let requestPoints = parseInt(reward.requestPoint.textContent.replace(/,/g, '') || '0', 10); // 요청된 포인트
//   let amount = e.currentTarget.dataset.won;
//   console.log('points', points);
//   console.log('requestPoints', requestPoints);
//   console.log('amount', amount);

//   if (amount === 'all') {
//     if (points > 0) {
//       console.log('point', points);
//       amount = points;
//     } else {
//       document.getElementById('alert-text').innerHTML = `<div class='fs-5'>전환할 포인트가 없습니다.</div>`;
//       $('#alertModal').modal('show');
//       return;
//     }
//   } else {
//     amount = parseInt(amount, 10) * 10000;
//   }

//   if (points >= amount) {
//     points -= amount;
//     requestPoints += amount;
//     reward.curPoint.textContent = points.toLocaleString('ko-KR');
//     reward.requestPoint.textContent = requestPoints.toLocaleString('ko-KR');
//   } else {
//     document.getElementById('alert-text').innerHTML = `<div class='fs-5'>보유 포인트보다<br>더 많이 전환할 수 없습니다.</div>`;
//     $('#alertModal').modal('show');
//   }
// }

// //? 정정 버튼 클릭 이벤트
// document.getElementById('reward-modify').addEventListener('click', function () {
//   resetToOriginalState();
// });

// //? 원래 상태로 복구하는 함수
// function resetToOriginalState() {
//   $.ajax({
//     method: 'POST',
//     url: '/bank/asset',
//   }).done(function (result) {
//     reward.curBalance.textContent = result.balance.toLocaleString('ko-KR');
//     reward.curPoint.textContent = result.point.toLocaleString('ko-KR');
//     reward.requestPoint.textContent = '0';
//     updateAfterRewardBalance();
//   });
// }

// //? 전환 후 보유금 업데이트 함수
// function updateAfterRewardBalance() {
//   const currentBalance = parseInt(reward.curBalance.textContent.replace(/,/g, ''), 10);
//   const requestPoints = parseInt(reward.requestPoint.textContent.replace(/,/g, ''), 10);
//   const newBalance = currentBalance + requestPoints;
//   reward.afterRewardBalance.textContent = newBalance.toLocaleString('ko-KR');
// }
// #endregion

// #region 포인트 전액 전환방식
let reward = {
  curBalance: document.getElementById('rewarCurrentBalance'),
  curPoint: document.getElementById('rewardCurrentPoint'),
  afterRewardBalance: document.getElementById('afterRewardBalance'),
  requestPoint: document.getElementById('rewardRequestPoint'),
  exchangeBtn: document.getElementById('reward-submit'),
};

//? 모달열기 > 금액 및 포인트 채우기
$('#rewardModal').on('show.bs.modal', async function () {
  $.ajax({
    method: 'POST',
    url: '/bank/asset',
  }).done(function (result) {
    reward.curBalance.textContent = result.balance.toLocaleString('ko-KR');
    reward.curPoint.textContent = result.point.toLocaleString('ko-KR');
    reward.requestPoint.textContent = '0';
    updateAfterRewardBalance();
  });
});

//? 전환 신청 버튼 클릭 이벤트
reward.exchangeBtn.addEventListener('click', function () {
  $.ajax({
    method: 'POST',
    url: '/bank/reward',
    data: {
      reqPoints: parseInt(reward.curPoint.textContent.replace(/,/g, ''), 10),
    },
  }).done(function (result) {
    $('#rewardModal').modal('hide');
    document.getElementById('confirm-text').innerHTML = `<div class='fs-5'>${result}</div>`;
    $('#confirmModal').modal('show');
  });
});

//? 포인트 버튼 처리 함수
function pushPointBtn(reward, e) {
  let points = parseInt(reward.curPoint.textContent.replace(/,/g, ''), 10); // 현재 포인트
  let requestPoints = parseInt(reward.requestPoint.textContent.replace(/,/g, '') || '0', 10); // 요청된 포인트
  let amount = e.currentTarget.dataset.won;
  console.log('points', points);
  console.log('requestPoints', requestPoints);
  console.log('amount', amount);

  if (amount === 'all') {
    if (points > 0) {
      console.log('point', points);
      amount = points;
    } else {
      document.getElementById('alert-text').innerHTML = `<div class='fs-5'>전환할 포인트가 없습니다.</div>`;
      $('#alertModal').modal('show');
      return;
    }
  } else {
    amount = parseInt(amount, 10) * 10000;
  }

  if (points >= amount) {
    points -= amount;
    requestPoints += amount;
    reward.curPoint.textContent = points.toLocaleString('ko-KR');
    reward.requestPoint.textContent = requestPoints.toLocaleString('ko-KR');
  } else {
    document.getElementById('alert-text').innerHTML = `<div class='fs-5'>보유 포인트보다<br>더 많이 전환할 수 없습니다.</div>`;
    $('#alertModal').modal('show');
  }
}

//? 정정 버튼 클릭 이벤트
document.getElementById('reward-modify').addEventListener('click', function () {
  resetToOriginalState();
});

//? 원래 상태로 복구하는 함수
function resetToOriginalState() {
  $.ajax({
    method: 'POST',
    url: '/bank/asset',
  }).done(function (result) {
    reward.curBalance.textContent = result.balance.toLocaleString('ko-KR');
    reward.curPoint.textContent = result.point.toLocaleString('ko-KR');
    reward.requestPoint.textContent = '0';
    updateAfterRewardBalance();
  });
}

//? 전환 후 보유금 업데이트 함수
function updateAfterRewardBalance() {
  const currentBalance = parseInt(reward.curBalance.textContent.replace(/,/g, ''), 10);
  const currentPoint = parseInt(reward.curPoint.textContent.replace(/,/g, ''), 10);
  console.log('currentBalance', currentBalance);
  console.log('requestPoints', currentPoint);
  const newBalance = currentBalance + currentPoint;
  console.log('newBalance', newBalance);
  reward.afterRewardBalance.textContent = newBalance.toLocaleString('ko-KR');
}
// #endregion
// #endregion

// #region 리워드 내역 모달
//? 리워드 테이블(dataTable)
$('#rewardHistory').DataTable({
  language: korean,
  responsive: true,
  autoWidth: false,

  ajax: {
    url: '/bank/table',
    method: 'POST',
    data: { type: 'rewardHistory' },
    dataSrc: '',
    error: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 429) {
        window.location.reload();
      }
    },
  },
  dom: 'ltip',
  columns: [{ data: 'IDX' }, { data: '신청일시', responsivePriority: 1 }, { data: '신청금액', responsivePriority: 2 }],
  pageLength: 10,
  lengthMenu: [10, 50, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: 0, visible: false },
    {
      target: [0, 1, 2],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: 1,
      render: function (data, type, row) {
        if (type === 'display') {
          data = data.slice(2);
        }
        return data;
      },
    },
    {
      target: 2,
      className: 'pe-4',
      render: function (data) {
        return data.toLocaleString('ko-KR').slice(1);
      },
    },
  ],
});
// #endregion

// #region 추천인 내역 모달
//? 추천인 테이블(dataTable)
$('#recommendHistory').DataTable({
  language: korean,
  responsive: true,
  autoWidth: false,

  ajax: {
    url: '/bank/table',
    method: 'POST',
    data: { type: 'recommendHistory' },
    dataSrc: '',
    error: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 429) {
        window.location.reload();
      }
    },
  },
  dom: 'ltip',
  columns: [
    { data: 'join_date', responsivePriority: 1 },
    { data: 'id', responsivePriority: 2 },
  ],
  pageLength: 10,
  lengthMenu: [10, 50, 100],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: [0, 1],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: 1,
      render: function (data, type, row) {
        if (type === 'display') {
          data = data.slice(0, -3) + '***';
        }
        return data;
      },
      orderable: false,
    },
  ],
});
// #endregion

// #region 입출금 관련 함수
function reqBankAccount() {
  $.ajax({
    method: 'POST',
    url: '/bank/banknum',
  })
    .done(function (result) {
      if (result.isLogin) {
        if (result.isVirtual) {
          document.querySelector('#deposit-bank-value').value = result.virtualMsg;
          deposit.isReqAccount = true;
        } else {
          let bank_name = result.sqlResult[0].bank;
          let bank_num = result.sqlResult[0].bank_num;
          let bank_owner = result.sqlResult[0].bank_owner;
          let bankInfo = `${bank_name}    ${bank_num}    ${bank_owner}`;
          deposit.isReqAccount = true;

          document.querySelector('#deposit-bank-value').value = bankInfo;
        }
      } else {
        console.log('비정상 요청');
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

function assetModalClear(type) {
  type.reqMoney = 0;
  type.afterReqMoney = 0;
  type.reqMoneyText.innerHTML = '0';
  type.afterReqMoneyText.innerHTML = type.curMoney.toLocaleString('ko-KR');
  if (type == deposit) {
    document.querySelector('#deposit-bank-value').value = '계좌문의하기 버튼을 눌러주세요';
    type.isReqAccount = false;
  }
}

function pushMoneyBtn(type, e) {
  if (e.currentTarget.dataset.won == 'all') {
    type.pushedMoney = type.curMoney;
  } else {
    type.pushedMoney = e.currentTarget.dataset.won * 10000;
  }
  type.reqMoney = type.reqMoney + type.pushedMoney;
  if (type == deposit) {
    type.afterReqMoney = type.curMoney + type.reqMoney;
    if (bonus.bonusState == 1) {
      if (bonus.bonus_type == 1) {
        type.bonusMoney = (type.reqMoney * bonus.dailyBonusRate) / 100;
      } else if (bonus.bonus_type == 2) {
        type.bonusMoney = (type.reqMoney * bonus.joinBonusRate) / 100;
      } else if (bonus.bonus_type == 3) {
        type.bonusMoney = (type.reqMoney * bonus.everyBonusRate) / 100;
      } else if (bonus.bonus_type == 4) {
        type.bonusMoney = (type.reqMoney * bonus.joinEveryBonusRate) / 100;
      }
    }
  } else {
    type.afterReqMoney = type.curMoney - type.reqMoney;
  }

  if (type.afterReqMoney < 0) {
    type.afterReqMoney = type.afterReqMoney + type.pushedMoney;
    type.reqMoney = type.reqMoney - type.pushedMoney;
    document.getElementById('alert-text').innerHTML = `<div class='fs-5'>보유금보다 더 많이 신청할 수 없습니다.</div>`;
    $('#alertModal').modal('show');
    type.bonusMoney = 0;
  }

  type.reqMoneyText.innerHTML = `${type.reqMoney.toLocaleString('ko-KR')} `;
  if (type == deposit) {
    type.afterReqMoneyText.innerHTML = `${(type.afterReqMoney + type.bonusMoney).toLocaleString('ko-KR')} `;
    document.querySelector('#deposit-bonus-money').innerHTML = `${type.bonusMoney.toLocaleString('ko-KR')} `;
  } else {
    type.afterReqMoneyText.innerHTML = `${type.afterReqMoney.toLocaleString('ko-KR')} `;
  }
  type.reqExist = true;
}

function pushClearBtn(type) {
  type.reqMoney = 0;
  type.bonusMoney = 0;
  document.querySelector('#deposit-bonus-money').innerHTML = `${type.bonusMoney.toLocaleString('ko-KR')} `;
  type.reqMoneyText.innerHTML = `${type.reqMoney} `;
  type.afterReqMoneyText.innerHTML = document.querySelector('.userBalance').innerHTML;
  type.reqExist = false;
}

function pushRequestBtn(type) {
  spinnerToggle();
  let reqUrl;
  let content;
  let modalId;

  if (type == deposit) {
    reqUrl = '/bank/deposit';
    content = `
    <h3>입금신청 되었습니다</h3>
    <h4>최대한 신속히 처리해 드리겠습니다</h4>    
  `;
    modalId = `#depositModal`;
  } else {
    reqUrl = '/bank/withdraw';
    content = `
    <h3>출금신청 되었습니다</h3>
    <h4>최대한 신속히 처리해 드리겠습니다</h4>
  `;
    modalId = `#withdrawModal`;
  }

  if (type.reqExist) {
    $.ajax({
      method: 'POST',
      url: reqUrl,
      data: { reqMoney: type.reqMoney },
    })
      .done(function (result) {
        getAsset();
        const notice_text = document.querySelector('#confirm-text');

        if (!result.isValid) {
          notice_text.innerHTML = `<h3>${result.msg}</h3>`;
          $(modalId).modal('hide');
          $('#confirmModal').modal('show');
        } else if (result.reqState == 'n') {
          notice_text.innerHTML = content;
          $(modalId).modal('hide');
          $('#confirmModal').modal('show');

          socket.emit('to_admin', { type: result.type, userId: result.userId });
        } else {
          document.querySelector('#alert-text').innerHTML = result.msg;
          $(modalId).modal('hide');
          $('#alertModal').modal('show');
          document.querySelector('#deposit-submit').disabled = false;
          document.querySelector('#withdraw-submit').disabled = false;
        }
      })
      .fail(function (err) {
        console.log(err);
      });
  }
}
// #endregion
