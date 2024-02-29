window.addEventListener('DOMContentLoaded', (event) => {
  // #region 상세내역 타입선택 버튼
  const detailSelectCasinoBtn = document.querySelector('.detailViewCasino');
  const detailSelectSlotBtn = document.querySelector('.detailViewSlot');
  const detailSelectBetBtn = document.querySelector('.detailViewBet');
  const detailSelectWinBtn = document.querySelector('.detailViewWin');
  const detailSelectTieBtn = document.querySelector('.detailViewTie');
  const detailSelectResetBtn = document.querySelector('.detailViewReset');

  const summarySelectCasinoBtn = document.querySelector('.summaryViewCasino');
  const summarySelectSlotBtn = document.querySelector('.summaryViewSlot');
  const summarySelectResetBtn = document.querySelector('.summaryViewReset');

  detailSelectCasinoBtn.innerHTML = '카지노 내역';
  detailSelectSlotBtn.innerHTML = '슬롯 내역';
  detailSelectBetBtn.innerHTML = '베팅 내역';
  detailSelectWinBtn.innerHTML = '윈 내역';
  detailSelectTieBtn.innerHTML = '타이 내역';
  detailSelectResetBtn.innerHTML = '전체 내역';

  summarySelectCasinoBtn.innerHTML = '카지노 내역';
  summarySelectSlotBtn.innerHTML = '슬롯 내역';
  summarySelectResetBtn.innerHTML = '전체 내역';

  detailSelectCasinoBtn.addEventListener('click', () => {
    let searchText = 'casino';
    detailBetting.search(searchText).draw();
  });
  detailSelectSlotBtn.addEventListener('click', () => {
    let searchText = 'slot';
    detailBetting.search(searchText).draw();
  });
  detailSelectBetBtn.addEventListener('click', () => {
    let searchText = 'bet';
    detailBetting.search(searchText).draw();
  });
  detailSelectWinBtn.addEventListener('click', () => {
    let searchText = 'win';
    detailBetting.search(searchText).draw();
  });
  detailSelectTieBtn.addEventListener('click', () => {
    let searchText = 'tie';
    detailBetting.search(searchText).draw();
  });
  detailSelectResetBtn.addEventListener('click', () => {
    detailBetting.search('').draw();
  });

  summarySelectCasinoBtn.addEventListener('click', () => {
    let searchText = '카지노';
    detailSummaryBetting.search(searchText).draw();
  });
  summarySelectSlotBtn.addEventListener('click', () => {
    let searchText = '슬롯';
    detailSummaryBetting.search(searchText).draw();
  });
  summarySelectResetBtn.addEventListener('click', () => {
    detailSummaryBetting.search('').draw();
  });

  // #endregion
  //? 날짜 선택
  let elements = document.querySelectorAll('.detailDateInput');

  if (elements.length > 0) {
    elements.forEach((element) => {
      element.innerHTML = '<input type="text" class="text-center w-100 mb-3 detailDateSelector" style="padding: 3px 0" name="date" value=""/>';
    });
  }

  const tabElements = [
    { selector: '#detailDeposit-tab', detail: detailDeposit },
    { selector: '#detailWithdraw-tab', detail: detailWithdraw },
    { selector: '#detailGive-tab', detail: detailGive },
    { selector: '#detailTake-tab', detail: detailTake },
    { selector: '#detailBalance-tab', detail: detailBalance },
    { selector: '#detailPoint-tab', detail: detailPoint },
    { selector: '#detailBetting-tab', detail: detailBetting },
    { selector: '#detailSummaryBetting-tab', detail: detailSummaryBetting },
    { selector: '#detailConnect-tab', detail: detailConnect },
    { selector: '#detailBoard-tab', detail: detailMessage },
    { selector: '#detailBoard-tab', detail: detailQna },
    { selector: '#detailRecommend-tab', detail: detailRecommend },
  ];

  tabElements.forEach(({ selector, detail }) => {
    document.querySelector(selector).addEventListener('click', () => {
      detail.columns.adjust().draw();
    });
  });

  $('#userDetail').on('shown.bs.modal', function () {
    tabElements.forEach(({ detail }) => {
      detail.ajax.reload();
    });
  });

  //? 지급,회수 메모컬럼 숨김
  // if (clientType != 9) {
  //   console.log('관리자 아님');
  //   giveTable.column(10).visible(false);
  //   takeTable.column(10).visible(false);
  // }

  //? 일괄 출금승인 버튼
  // if (document.querySelector('#batchWithdraw')) {
  //   document.querySelector('#batchWithdraw').innerHTML = '일괄 출금승인';
  //   document.querySelector('#batchWithdraw').classList.add('disabled');
  //   document.querySelector('#batchWithdraw').addEventListener('click', () => {
  //     $('#batchWithdrawModal').modal('show');
  //   });
  // }
});

let detailDeposit = $('#detailDeposit').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/deposit',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'deposit';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"detailDateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '입금신청일시', className: 'desktop' },
    { data: '신청 시 보유금', className: 'desktop' },
    { data: '신청금액', responsivePriority: 2 },
    { data: '보너스타입', className: 'desktop' },
    { data: '보너스금액', className: 'desktop' },
    { data: '승인 후 보유금', className: 'desktop' },
    { data: '신청IP', className: 'desktop' },
    { data: '처리현황', responsivePriority: 3 },
    { data: '입금 처리일시', className: 'desktop' },
    { data: '메모', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 200, 300, -1],
    [100, 200, 300, 'ALL'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [11, 12, 13, 14, 15],
      visible: false,
    },
    {
      target: [2, 3],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: 3,
      className: 'fw-semibold',
    },
    {
      target: 4,
      render: function (data, type, row) {
        if (row.보너스상태 == '1') {
          if (data == '0') {
            return '';
          } else if (data == '1') {
            return `<button type='button' class='btn btn-sm asset-primary'>매일 첫충</button>`;
          } else if (data == '2') {
            return `<button type='button' class='btn btn-sm asset-success'>가입 첫충</button>`;
          } else if (data == '3') {
            return `<button type='button' class='btn btn-sm asset-dark'>재충전</button>`;
          } else if (data == '4') {
            return `<button type='button' class='btn btn-sm asset-dark'>가입 재충전</button>`;
          }
        } else if (row.보너스상태 == '0') {
          return '';
        }
      },
    },
    {
      target: 5,
      className: 'dt-body-right',
      render: function (data, type, row) {
        return data.toLocaleString('ko-KR');
      },
    },
    {
      target: 6,
      className: 'dt-body-right fw-semibold',
      render: function (data, type, row) {
        if (row.보너스상태 == 0) {
          row['승인 후 보유금'] = row['신청 시 보유금'] + row.신청금액;
          return row['승인 후 보유금'].toLocaleString('ko-KR');
        } else {
          if (row['보너스타입'] == 0) {
            row['승인 후 보유금'] = row['신청 시 보유금'] + row.신청금액;
            return row['승인 후 보유금'].toLocaleString('ko-KR');
          } else {
            row['승인 후 보유금'] = row['신청 시 보유금'] + row.신청금액 + row.보너스금액;
            return row['승인 후 보유금'].toLocaleString('ko-KR');
          }
        }
      },
    },
    {
      target: 8,
      render: function (data, type, row) {
        if (data == '입금신청') {
          return `<button type='button' class='btn btn-sm asset-danger deposit-btn'>` + data + `</button>`;
        } else if (data == '입금대기') {
          return `<button type='button' class='btn btn-sm asset-warning deposit-btn'>` + data + `</button>`;
        } else if (data == '입금확인') {
          return `<button type='button' class='btn btn-sm asset-primary deposit-btn'>` + data + `</button>`;
        } else if (data == '입금승인') {
          return `<button type='button' class='btn btn-sm asset-success deposit-btn'>` + data + `</button>`;
        } else if (data == '승인취소') {
          return `<button type='button' class='btn btn-sm asset-dark deposit-btn'>` + data + `</button>`;
        } else if (data == '신청취소') {
          return `<button type='button' class='btn btn-sm asset-dark deposit-btn'>` + data + `</button>`;
        }
      },
    },
    {
      target: 10,
      render: function (data) {
        if (data == '') {
          return data;
        } else {
          return `
            <button type='button' class='btn btn-sm btn-outline-secondary deposit-memo'
            data-bs-toggle="popover"
            data-bs-trigger="hover"
            data-bs-placement="left"
            data-bs-content="${data}">메모확인</button>
            `;
        }
      },
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 9, 12, 13, 15],
      orderable: false,
    },
  ],
  footerCallback: function (row, data, start, end, display) {
    let api = this.api();

    // Remove the formatting to get integer data for summation
    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    reqTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.신청금액);
      }, 0);

    confirmTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        if (row.처리현황 === '입금승인') {
          return sum + intVal(row.신청금액);
        }
        return sum;
      }, 0);

    bonusTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        if (row.처리현황 === '입금승인' && row.보너스상태 === 1) {
          return sum + intVal(row.보너스금액);
        }
        return sum;
      }, 0);

    let summaryBettingFooter = `<div class="row text-start">
    <div class="col">입금신청:</div>
    <div class="col text-end border-end pe-3">${reqTotal.toLocaleString('ko-KR')}</div>
    <div class="col">보너스 승인:</div>
    <div class="col text-end border-end pe-3">${bonusTotal.toLocaleString('ko-KR')}</div>
    <div class="col">신청 승인:</div>
    <div class="col text-end border-end pe-3">${confirmTotal.toLocaleString('ko-KR')}</div>
    <div class="col">최종 승인:</div>
    <div class="col text-end border-end pe-3">${(confirmTotal + bonusTotal).toLocaleString('ko-KR')}</div>
    </div>`;

    $(api.column(0).footer()).html(summaryBettingFooter);
  },
});

let detailWithdraw = $('#detailWithdraw').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/withdraw',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'withdraw';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"detailDateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '출금신청일시', className: 'desktop' },
    { data: '신청 시 보유금', className: 'desktop' },
    { data: '신청금액', responsivePriority: 2 },
    { data: '롤링율', className: 'desktop' },
    { data: '승인 후 보유금', className: 'desktop' },
    { data: '신청IP', className: 'desktop' },
    { data: '처리현황', responsivePriority: 3 },
    { data: '출금 처리일시', className: 'desktop' },
    { data: '메모', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 200, 300, -1],
    [100, 200, 300, 'ALL'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [4, 10, 11, 12, 13, 14],
      visible: false,
    },
    {
      target: [2, 3, 5],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: 7,
      render: function (data, type, row) {
        if (data == '출금신청') {
          return `<button type='button' class='btn btn-sm asset-danger withdraw-btn'>` + data + `</button>`;
        } else if (data == '출금대기') {
          return `<button type='button' class='btn btn-sm asset-warning withdraw-btn'>` + data + `</button>`;
        } else if (data == '출금승인') {
          return `<button type='button' class='btn btn-sm asset-success withdraw-btn'>` + data + `</button>`;
        } else if (data == '승인취소') {
          return `<button type='button' class='btn btn-sm asset-dark withdraw-btn'>` + data + `</button>`;
        } else if (data == '신청취소') {
          return `<button type='button' class='btn btn-sm asset-dark withdraw-btn'>` + data + `</button>`;
        }
      },
    },
    {
      target: 9,
      render: function (data) {
        if (data == '') {
          return data;
        } else {
          return `
            <button type='button' class='btn btn-sm btn-outline-secondary withdraw-memo'
            data-bs-toggle="popover"
            data-bs-trigger="hover"            
            data-bs-placement="left"
            data-bs-content="${data}">메모확인</button>
            `;
        }
      },
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 7, 8, 13, 14],
      orderable: false,
    },
    {
      target: 3,
      className: 'fw-semibold',
    },
  ],
  footerCallback: function (row, data, start, end, display) {
    let api = this.api();

    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    // pageTotal = api
    //   .column(3, { page: 'current' })
    //   .data()
    //   .reduce(function (a, b) {
    //     return intVal(a) + intVal(b);
    //   }, 0);

    confirmTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        if (row.처리현황 === '출금승인') {
          return sum + intVal(row.신청금액);
        }
        return sum;
      }, 0);

    $(api.column(1).footer()).html(`선택기간 출금승인 합계 :  ${confirmTotal.toLocaleString('ko-KR')} 원`);
  },
  drawCallback: function () {
    initPopover();
  },
});

let detailGive = $('#detailGive').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/give',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'give';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"detailDateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '지급일시', className: 'desktop' },
    { data: '지급매장', className: 'desktop' },
    { data: '지급종류', className: 'desktop' },
    { data: '지급금액', className: 'desktop' },
    { data: '지급전', className: 'desktop' },
    { data: '지급후', className: 'desktop' },
    { data: '지급트랜잭션ID', responsivePriority: 2 },
    { data: 'node_id' },
    { data: '메모' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 200, 300, -1],
    [100, 200, 300, 'ALL'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [4, 5, 6],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 7, 8, 9],
      orderable: false,
    },
    {
      target: 3,
      render: function (data) {
        switch (data) {
          case '일반':
            return `<button type='button' class='btn btn-sm text-dark-emphasis bg-dark-subtle border border-dark-subtle rounded-3' disabled>${data}</button>`;
          case '루징':
            return `<button type='button' class='btn btn-sm text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3' disbled>${data}</button>`;
          case '로또':
            return `<button type='button' class='btn btn-sm text-success-emphasis bg-success-subtle border border-success-subtle rounded-3' disbled>${data}</button>`;
          case '지인추천':
            return `<button type='button' class='btn btn-sm text-primary-emphasis bg-primary-subtle border border-primary-subtle rounded-3' disbled>${data}</button>`;
          default:
            return `<button type='button' class='btn btn-sm text-dark-emphasis bg-dark-subtle border border-dark-subtle rounded-3' disbled>${data}</button>`;
        }
      },
    },
    {
      target: 4,
      className: 'fw-semibold',
    },
    {
      target: [7, 8],
      visible: false,
    },
    {
      target: 9,
      render: function (data) {
        if (data == '') {
          return data;
        } else {
          return `
            <button type='button' class='btn btn-sm btn-outline-secondary deposit-memo'
            data-bs-toggle="popover"
            data-bs-trigger="hover"
            data-bs-placement="left"
            data-bs-content="${data}">메모확인</button>
            `;
        }
      },
    },
  ],
});

let detailTake = $('#detailTake').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/take',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'take';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"detailDateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '회수일시', className: 'desktop' },
    { data: '회수매장', className: 'desktop' },
    { data: '회수금액', className: 'desktop' },
    { data: '회수전', className: 'desktop' },
    { data: '회수후', className: 'desktop' },
    { data: '회수트랜잭션ID', responsivePriority: 2 },
    { data: 'node_id' },
    { data: '메모' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 200, 300, -1],
    [100, 200, 300, 'ALL'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [3, 4, 5],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 4, 5, 6, 7, 8],
      orderable: false,
    },
    {
      target: 3,
      className: 'fw-semibold',
    },
    {
      target: [6, 7],
      visible: false,
    },
    {
      target: 8,
      render: function (data) {
        if (data == '') {
          return data;
        } else {
          return `
            <button type='button' class='btn btn-sm btn-outline-secondary deposit-memo'
            data-bs-toggle="popover"
            data-bs-trigger="hover"
            data-bs-placement="left"
            data-bs-content="${data}">메모확인</button>
            `;
        }
      },
    },
  ],
});

let detailBalance = $('#detailBalance').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/balance',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'balance';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"detailDateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '이벤트발생일시', className: 'desktop' },
    { data: '회원타입', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: '이벤트타입', responsivePriority: 1 },
    { data: '고유번호', className: 'desktop' },
    { data: '변동 전 보유금', className: 'desktop' },
    { data: '변동금액', responsivePriority: 1 },
    { data: '변동 후 보유금', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 200, 300, -1],
    [100, 200, 300, 'ALL'],
  ],
  order: [[0, 'desc']],
  createdRow: function (row, data, dataIndex) {
    if (dataIndex > 0) {
      if (data.고유번호 == detailBalance.row(dataIndex - 1).data().고유번호) {
        if (detailBalance.row(dataIndex - 1).node().style.backgroundColor == 'rgb(238, 238, 238)') {
          $(row).css('background-color', '#eeeeee');
        }
      } else if (data.고유번호 != detailBalance.row(dataIndex - 1).data().고유번호) {
        if (detailBalance.row(dataIndex - 1).node().style.backgroundColor != 'rgb(238, 238, 238)') {
          $(row).css('background-color', '#eeeeee');
        }
      }
    }
  },
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [10, 11, 12, 13],
      visible: false,
    },
    {
      target: 2,
      render: function (data) {
        if (data == '0') {
          return `<button type='button' class='btn btn-sm asset-danger' style='pointer-events: none;'>플래티넘</button>`;
        } else if (data == '1') {
          return `<button type='button' class='btn btn-sm asset-warning' style='pointer-events: none;'>골드</button>`;
        } else if (data == '2') {
          return `<button type='button' class='btn btn-sm asset-success' style='pointer-events: none;'>실버</button>`;
        } else if (data == '3') {
          return `<button type='button' class='btn btn-sm asset-primary' style='pointer-events: none;'>브론즈</button>`;
        } else if (data == '4') {
          return `일반`;
        } else if (data == '9') {
          return `<button type='button' class='btn btn-sm btn-secondary' style='pointer-events: none;'>최고관리자</button>`;
        }
      },
    },
    {
      target: 3,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 5,
      render: function (data, type, row) {
        if (
          data.includes('입금승인') ||
          data == '위닝_슬롯' ||
          data == '위닝_카지노' ||
          data.includes('지급받음') ||
          data.includes('회수함') ||
          data == '관리자회수' ||
          data == '포인트 전환'
        ) {
          return `<button type='button' class='btn btn-sm asset-primary' style='pointer-events:none'>` + data + `</button>`;
        } else if (data == '입금승인취소' || data == '출금승인취소') {
          return `<button type='button' class='btn btn-sm text-dark border-secondary' disabled>` + data + `</button>`;
        } else if (
          data == '출금승인' ||
          data == '베팅_슬롯' ||
          data == '베팅_카지노' ||
          data.includes('지급함') ||
          data.includes('회수됨') ||
          data == '관리자지급'
        ) {
          return `<button type='button' class='btn btn-sm asset-danger' style='pointer-events:none'>` + data + `</button>`;
        }
      },
    },
    {
      target: 8,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (
          rowData.이벤트타입 == '출금승인' ||
          rowData.이벤트타입 == '입금승인취소' ||
          rowData.이벤트타입 == '베팅_카지노' ||
          rowData.이벤트타입 == '베팅_슬롯' ||
          rowData.이벤트타입.indexOf('-') != -1
        ) {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        data = data.toLocaleString('ko-KR');

        if (
          row.이벤트타입 == '출금승인' ||
          row.이벤트타입 == '입금승인취소' ||
          row.이벤트타입 == '베팅_카지노' ||
          row.이벤트타입 == '베팅_슬롯' ||
          row.이벤트타입.indexOf('-') != -1
        ) {
          return '- ' + data;
        } else {
          return data;
        }
      },
    },
    {
      target: [7, 8, 9],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6],
      orderable: false,
    },
  ],
});

let detailPoint = $('#detailPoint').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/point',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'point';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"detailDateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '이벤트발생일시', className: 'desktop' },
    { data: '회원타입', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: '이벤트 타입', responsivePriority: 2 },
    { data: '고유번호', className: 'desktop' },
    { data: '발생 아이디', className: 'desktop' },
    { data: '발생 금액', className: 'desktop' },
    { data: '기록시점 베팅마진 요율', className: 'desktop' },
    { data: '베팅마진 적용금액', defaultContent: '', className: 'desktop' },

    { data: '이벤트 요율', className: 'desktop' },
    { data: '변동 전 포인트', className: 'desktop' },
    { data: '발생 포인트', responsivePriority: 3 },
    { data: '기록시점 롤링마진 요율', className: 'desktop' },
    { data: '변동 후 포인트', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
  ],
  order: [
    [0, 'desc'],
    [6, 'desc'],
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 200, 300, -1],
    [100, 200, 300, 'ALL'],
  ],
  createdRow: function (row, data, dataIndex) {
    if (clientType == 9) {
      if (data.고유번호 % 2 == 1) {
        $(row).css('background-color', '#eeeeee');
      }
    } else {
      if (dataIndex % 2 == 1) {
        $(row).css('background-color', '#eeeeee');
      }
    }
  },
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [3, 4, 9, 10, 14, 16, 17, 18, 19],
      visible: false,
    },
    {
      target: 2,
      render: function (data) {
        if (data == '0') {
          return `플래티넘`;
        } else if (data == '1') {
          return '골드';
        } else if (data == '2') {
          return '실버';
        } else if (data == '3') {
          return '브론즈';
        } else if (data == '4') {
          return '일반';
        }
      },
    },
    {
      target: 3,
      render: function (data, type, row) {
        if (data == 'admin') {
          return `<button type='button' class='btn btn-sm id-btn asset-dark'>` + data + `</button>`;
        } else if (row.회원타입 == 0) {
          return `<button type='button' class='btn btn-sm id-btn asset-danger'>` + data + `</button>`;
        } else if (row.회원타입 == 1) {
          return `<button type='button' class='btn btn-sm id-btn asset-warning'>` + data + `</button>`;
        } else if (row.회원타입 == 2) {
          return `<button type='button' class='btn btn-sm id-btn asset-success'>` + data + `</button>`;
        } else if (row.회원타입 == 3) {
          return `<button type='button' class='btn btn-sm id-btn asset-primary'>` + data + `</button>`;
        } else if (row.회원타입 == 4) {
          if (row.가입코드) {
            return `<div class="btn-group" role="group" aria-label="Basic example">
              <button type="button" class="btn btn-sm online-tag">온</button>
              <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
          } else if (row.가입코드 == '') {
            return `<div class="btn-group" role="group" aria-label="Basic example">
              <button type="button" class="btn btn-sm local-tag">매장</button>
              <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
          } else {
            return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
          }
        }
      },
    },
    {
      target: 7,
      searchable: false,
    },
    {
      target: 5,
      render: function (data, type, row) {
        if (data == '롤링_슬롯') {
          return `<button type='button' class='btn btn-sm asset-primary' style='pointer-events:none'>` + data + `</button>`;
        } else if (data == '롤링_카지노') {
          return `<button type='button' class='btn btn-sm asset-primary' style='pointer-events:none'>` + data + `</button>`;
        } else if (data == '포인트 전환') {
          return `<button type='button' class='btn btn-sm asset-danger' style='pointer-events:none'>` + data + `</button>`;
        } else if (data == '관리자 지급') {
          return `<button type='button' class='btn btn-sm asset-success' style='pointer-events:none'>` + data + `</button>`;
        }
      },
    },
    {
      target: 8,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = data || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${row['베팅마진 적용금액'].toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${row['베팅마진 적용금액'].toLocaleString('ko-KR')}</div>`;
        }
      },
      // createdCell: function (td, cellData, rowData, row, col) {
      //   if (clientType == 9) {
      //     $(td).addClass('divide');
      //   }
      // },
    },
    {
      target: 11,
      render: function (data, type, row) {
        if (row['이벤트 타입'] != '포인트 전환') {
          let str = data;
          let parts = str.split(' ');

          let totalRate = parts[0];
          let realRate = parts[1] ? `<span class="text-primary fw-semibold">${parts[1]}</span>` : '';

          let newStr = `${totalRate}<br>${realRate}`;
          return newStr;
        }
        return '';
      },
    },
    {
      target: 13,
      className: 'fw-semibold',
      render: function (data, type, row) {
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${row['롤링마진 적용포인트'].toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${row['롤링마진 적용포인트'].toLocaleString('ko-KR')}</div>`;
        }
      },
      createdCell: function (td, cellData, rowData, row, col) {
        if (clientType == 9) {
          $(td).addClass('divide');
        }
        if (rowData['이벤트 타입'] == '포인트 전환') {
          $(td).addClass('text-danger');
        }
      },
    },
    {
      target: [8, 10, 12, 13, 15],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-head-center dt-body-center',
    },
    {
      targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      orderable: false,
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      detailPoint.column(8).header().innerHTML = `발생 금액<br><span class="text-primary">베팅마진 적용</span>`;
      detailPoint.column(9).header().innerHTML = `기록시점<br>베팅마진 요율(%)
      <i class="bi bi-question-circle-fill text-primary" data-bs-toggle="tooltip" data-bs-placement="top"
      data-bs-custom-class="custom-tooltip"
      data-bs-title="적용되는 베팅마진 요율은 발생아이디 상위 에이전트의 베팅마진 요율입니다"></i>
      `;
      detailPoint.column(13).header().innerHTML = `발생 포인트<br><span class="text-primary">롤링마진 적용</span>`;
      detailPoint.column(14).header().innerHTML = `기록시점<br>롤링마진 요율(%)
      <i class="bi bi-question-circle-fill text-primary" data-bs-toggle="tooltip" data-bs-placement="top"
      data-bs-custom-class="custom-tooltip"
      data-bs-title="적용되는 롤링마진 요율은 에이전트의 롤링마진 요율입니다"></i>
      `;
      detailPoint.column(10).header().innerHTML = `베팅마진<br>적용금액`;
      detailPoint.column(9).visible(true);
      detailPoint.column(9).header().classList.add('text-primary');

      detailPoint.column(14).visible(true);
      detailPoint.column(14).header().classList.add('text-primary');
      detailPoint.columns.adjust().draw();
    } else if (clientType != 9) {
      detailPoint.column(8).header().innerHTML = `발생 금액`;
      detailPoint.column(13).header().innerHTML = `발생 포인트`;
      detailPoint.columns.adjust().draw();
    }
  },
  footerCallback: function (row, data, start, end, display) {
    let api = this.api();

    // 발생금액 합계 계산
    let totalOriginAmount = api
      .column(8, { page: 'current' })
      .data()
      .reduce(function (a, b) {
        return a + b;
      }, 0);

    let totalMarginAmount = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (acc, rowData) {
        return acc + parseFloat(rowData['베팅마진 적용금액'] || 0);
      }, 0);

    // 발생 포인트 합계 계산
    let totalOriginPoint = api
      .column(13, { page: 'current' })
      .data()
      .reduce(function (a, b) {
        return a + b;
      }, 0);

    let totalMarginPoint = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (acc, rowData) {
        return acc + parseFloat(rowData['롤링마진 적용포인트'] || 0);
      }, 0);

    // 푸터에 합계 표시
    $(api.column(6).footer()).html('발생금액 합계: ');
    $(api.column(8).footer()).html(`
    <div>${totalOriginAmount.toLocaleString('ko-KR')}</div>
    <div class="text-primary">${totalMarginAmount.toLocaleString('ko-KR')}</div>
  `);
    $(api.column(11).footer()).html('발생포인트 합계: ');
    $(api.column(13).footer()).html(`
    <div>${totalOriginPoint.toLocaleString('ko-KR')}</div>
    <div class="text-primary">${totalMarginPoint.toLocaleString('ko-KR')}</div>`);
  },
});

let detailBetting = $('#detailBetting').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  serverSide: true,
  ajax: {
    url: '/detail/betting',
    method: 'POST',
    beforeSend: function () {
      spinnerToggle(true);
    },
    complete: function () {
      spinnerToggle(false);
    },
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'betting';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    // dataSrc: '',
  },
  dom: '<"detailDateInput float-start dateWidth me-2"><"ms-2 btn btn-sm asset-primary detailViewCasino"><"ms-1 btn btn-sm asset-danger detailViewSlot"><"ms-4 btn btn-sm asset-primary detailViewBet"><"ms-1 btn btn-sm asset-danger detailViewWin"><"ms-1 btn btn-sm asset-success detailViewTie"><"ms-4 btn btn-sm asset-dark detailViewReset">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '발생시간', className: 'desktop' },
    { data: '트랜젝션ID', className: 'desktop' },
    { data: '라운드ID', className: 'desktop' },
    { data: '프로바이더', className: 'desktop' },
    { data: '게임타입', className: 'desktop' },
    { data: '게임명', className: 'desktop' },
    { data: '내역타입', className: 'desktop' },
    { data: '금액', responsivePriority: 2 },
    { data: '이전보유금', responsivePriority: 3 },
    { data: '이후보유금', responsivePriority: 4 },
    { data: 'node_id' },
  ],
  pageLength: 300,
  lengthMenu: [300, 500, 1000],
  order: [
    [1, 'desc'],
    [3, 'desc'],
  ],
  createdRow: function (row, data, dataIndex) {
    if (data.내역타입 == 'bet') {
      $(row).addClass('bg-mistyred');
    } else if (data.내역타입 == 'tie') {
      $(row).addClass('bg-mistygreen');
    } else if (data.내역타입 == 'win') {
      $(row).addClass('bg-mistyblue');
    }
  },
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    { target: [2, 11], visible: false },
    {
      target: 3,
      width: 140,
    },
    {
      target: 6,
      render: function (data) {
        if (data == 'Baccarat') {
          return '바카라';
        } else {
          return data;
        }
      },
    },
    {
      target: 8,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData.내역타입 === 'bet') {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        if (row.내역타입 == 'bet') {
          data = data.replace(/-/g, '');
          return Number(data).toLocaleString('ko-KR');
        } else {
          return Number(data).toLocaleString('ko-KR');
        }
      },
    },
    {
      target: [9, 10],
      render: function (data, type, row) {
        let num = parseInt(data, 10);
        return num.toLocaleString('ko-KR');
      },
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [8, 9, 10],
      className: 'dt-body-right',
    },
    {
      target: [1, 2, 3, 4, 5, 6, 9, 10, 11],
      orderable: false,
      className: 'no-sort',
    },
  ],
  footerCallback: function (row, data, start, end, display) {
    let api = this.api();
    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\,\원]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    // 현재 페이지에 표시된 '금액'의 총합 계산
    let totalAmount = api
      .column(8, { page: 'current' })
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    let totalWin = 0,
      totalBet = 0;

    api.rows({ page: 'current' }).every(function () {
      let data = this.data();
      let type = data['내역타입'];
      let amount = Math.abs(intVal(data['금액']));

      switch (type) {
        case 'win':
          totalWin += amount;
          break;
        case 'bet':
          totalBet += amount;
          break;
      }
    });

    let netAmount = totalBet - totalWin;
    let netAmountClass = netAmount < 0 ? 'text-danger' : '';

    $(api.column(0).footer()).html(`
    <div class="row text-start">
      <div class="col">베팅(BET): </div>
      <div class="col text-end pe-3 border-end">${totalBet.toLocaleString('ko-KR')}</div>
      <div class="col">승리(WIN): </div>
      <div class="col text-end pe-3 border-end">${totalWin.toLocaleString('ko-KR')}</div>
      <div class="col">전체(BET-WIN): </div>
      <div class="col text-end pe-3 border-end ${netAmountClass}">${netAmount.toLocaleString('ko-KR')}</div>
    </div>`);
  },
});

let detailSummaryBetting = $('#detailSummaryBetting').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/summarybetting',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'summaryBetting';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"detailDateInput float-start dateWidth me-2"><"ms-2 btn btn-sm asset-primary summaryViewCasino"><"ms-1 btn btn-sm asset-danger summaryViewSlot"><"ms-4 btn btn-sm asset-dark summaryViewReset">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '결과수신시간', className: 'desktop' },
    { data: '베팅타입', responsivePriority: 2 },
    { data: '베팅', responsivePriority: 3 },
    { data: '획득', responsivePriority: 4 },
    { data: '결과', className: 'desktop' },
    { data: '마진베팅', defaultContent: '' },
    { data: '마진획득', defaultContent: '' },
    { data: null, defaultContent: '' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 200, 300, -1],
    [100, 200, 300, 'ALL'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [9, 10, 11, 12, 13],
      visible: false,
    },
    {
      target: 2,
      render: function (data) {
        if (data == 's') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>슬롯</button>`;
        } else if (data == 'c') {
          return `<button type='button' class='btn btn-sm text-danger border-danger' disabled>카지노</button>`;
        }
      },
    },
    {
      target: 5,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (cellData < 0) {
          $(td).addClass('text-danger');
        }
      },
    },
    {
      target: 8,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData.결과 < 0) {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        return row.결과.toLocaleString('ko-KR');
      },
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [3, 4, 5, 6, 7, 8],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [2],
      orderable: false,
      className: 'no-sort',
    },
  ],
  initComplete: function () {
    if (clientType != 9) {
      detailSummaryBetting.columns([3, 4, 5]).visible(false);

      let thElement = document.querySelector('#summarySlotHeader');
      thElement.innerText = '슬롯';
      thElement.classList.add('d-none');

      for (let i = 6; i <= 8; i++) {
        detailSummaryBetting.column(i).header().classList.remove('text-danger');
      }
    }
  },
  footerCallback: function (row, data, start, end, display) {
    let api = this.api();
    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    let totalBet = api
      .column(3, { page: 'current' })
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    let totlaMarginBet = api
      .column(6, { page: 'current' })
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    let totalWin = api
      .column(4, { page: 'current' })
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    let totalMarginWin = api
      .column(7, { page: 'current' })
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    let totalResult = api
      .column(5, { page: 'current' })
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    let summaryBettingFooter = `<div class="row text-start">
    <div class="col">베팅:</div>
    <div class="col text-end border-end pe-3">${totalBet.toLocaleString('ko-KR')}</div>
    <div class="col">획득:</div>
    <div class="col text-end border-end pe-3">${totalWin.toLocaleString('ko-KR')}</div>
    <div class="col text-danger-emphasis">마진 베팅:</div>
    <div class="col text-end border-end pe-3">${totlaMarginBet.toLocaleString('ko-KR')}</div>
    <div class="col text-danger-emphasis">마진 획득:</div>
    <div class="col text-end border-end pe-3">${totalMarginWin.toLocaleString('ko-KR')}</div>
    <div class="col">결과:</div>
    <div class="col text-end border-end pe-3 ${totalResult < 0 ? 'text-danger' : ''}">${totalResult.toLocaleString('ko-KR')}</div>
    </div>`;

    $(api.column(0).footer()).html(summaryBettingFooter);
  },
});

let detailConnect = $('#detailConnect').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/connect',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'connect';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '접속일시' },
    { data: '접속타입' },
    { data: '접속 도메인', className: 'desktop' },
    { data: '접속 IP', className: 'desktop' },
    { data: '접속 기기', className: 'desktop' },
    { data: '접속 브라우저', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[0, 'desc']],
  dom: '<"detailDateInput float-start dateWidth me-2">lfrtip',
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [7, 8, 9, 10, 11],
      visible: false,
    },
    {
      target: [1, 2, 3, 4, 5, 6],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 7, 8, 9],
      orderable: false,
    },
  ],
});

let detailMessage = $('#detailMessage').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/detail/message',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'message';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  dom: 'tip',
  columns: [{ data: 'IDX' }, { data: '받은일시' }, { data: '종류' }, { data: '제목' }, { data: '내용' }, { data: '읽음여부' }],
  scrollY: '60vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[1, 'desc']],
  columnDefs: [
    { target: [0, 4], visible: false },
    {
      target: 2,
      render: function (data) {
        if (data == '긴급') {
          return `<button class='btn btn-sm btn-outline-danger' disabled>${data}</button>`;
        } else if (data == '일반') {
          return `<button class='btn btn-sm btn-outline-primary' disabled>${data}</button>`;
        } else if (data == '개별') {
          return `<button class='btn btn-sm btn-outline-success' disabled>${data}</button>`;
        }
      },
    },
    {
      target: 5,
      render: function (data) {
        if (data == 0) {
          return `<button class='btn btn-sm btn-danger questionState' disabled>읽지않음</button>`;
        } else if (data == 1) {
          return `<button class='btn btn-sm btn-primary questionState' disabled>읽음</button>`;
        }
      },
    },
    {
      target: [0, 1, 2, 3, 4, 5],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5],
      orderable: false,
    },
  ],
  drawCallback: function (settings) {
    $('#agentMessageModal tr').click(function () {
      let selectedMessage = $('table').DataTable().row($(this)).data();

      switch (selectedMessage.종류) {
        case '긴급':
          document.querySelector('#viewMessageType').classList.add('asset-danger');
          break;
        case '일반':
          document.querySelector('#viewMessageType').classList.add('asset-primary');
          break;
        case '개별':
          document.querySelector('#viewMessageType').classList.add('asset-success');
          break;
      }

      document.querySelector('#viewMessageType').value = selectedMessage.종류;
      document.querySelector('#viewMessageTitle').value = selectedMessage.제목;
      document.querySelector('#viewMessageContent').value = selectedMessage.내용;

      $('#agentMessageModal').modal('hide');
      $('#agentViewMessageModal').modal('show');

      if (selectedMessage.읽음여부 == 0) {
        changeMessageState(selectedMessage);
      }
    });
  },
});

let detailQna = $('#detailQna').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/detail/qna',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.tableType = 'qna';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '문의시간', className: 'desktop' },
    { data: '종류', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '제목', responsivePriority: 3 },
    { data: '내용', responsivePriority: 4 },
    { data: '답변' },
    { data: '상태' },
  ],
  scrollY: '60vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: [0, 5, 6], visible: false },
    {
      target: 2,
      render: function (data) {
        if (data == '계좌') {
          return `<button class='btn btn-sm btn-outline-danger disabled'>${data}</button>`;
        } else if (data == '베팅') {
          return `<button class='btn btn-sm btn-outline-primary disabled'>${data}</button>`;
        } else if (data == '계정') {
          return `<button class='btn btn-sm btn-outline-success disabled'>${data}</button>`;
        } else if (data == '기타') {
          return `<button class='btn btn-sm btn-outline-dark disabled'>${data}</button>`;
        }
      },
    },
    {
      target: 3,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 7,
      render: function (data) {
        if (data == '유저문의') {
          return `<button class='btn btn-sm asset-danger'>${data}</button>`;
        } else if (data == '답변완료') {
          return `<button class='btn btn-sm asset-success'>${data}</button>`;
        } else if (data == '답변확인') {
          return `<button class='btn btn-sm asset-primary'>${data}</button>`;
        }
      },
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7],
      orderable: false,
      className: 'dt-head-center dt-body-center',
    },
  ],
});

let detailRecommend = $('#detailRecommend').DataTable({
  language: korean,
  responsive: true,
  scrollY: '60vh',
  scrollCollapse: true,
  ajax: {
    url: '/detail/recommend',
    method: 'POST',
    data: function (d) {
      d.tableType = 'recommend';
      d.node_id = selectedUser ? selectedUser.node_id : '';
      d.userType = selectedUser ? selectedUser.타입 || selectedUser.회원타입 : '';
      d.userId = selectedUser ? selectedUser.아이디 : '';
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: '가입일시', className: 'desktop' },
    { data: '레벨', className: 'desktop' },
    { data: '아이디', className: 'desktop' },
    { data: '닉네임', responsivePriority: 2 },
    { data: '이름', className: 'desktop' },
    { data: '가입코드', className: 'desktop' },
    { data: null, defaultContent: '', className: 'desktop' },
    { data: null, defaultContent: '', className: 'desktop' },
    { data: null, defaultContent: '' },
    { data: null, defaultContent: '' },
  ],
  pageLength: 50,
  lengthMenu: [50, 100, 300],
  order: [[5, 'desc']],
  columnDefs: [
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: 2,
      render: function (data, type, row) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 6,
      render: function (data, type, row) {
        let diff = row.총입금액 - row.총출금액;

        let color;
        if (diff > 0) {
          color = 'text-primary';
        } else if (diff < 0) {
          color = 'text-danger';
        } else {
          color = '';
        }
        return `${row.총입금액.toLocaleString('ko-KR')}<br>${row.총출금액.toLocaleString('ko-KR')}<br><span class="${color}">${(
          row.총입금액 - row.총출금액
        ).toLocaleString('ko-KR')}</span>`;
      },
    },
    {
      target: 7,
      render: function (data, type, row) {
        let sum = row.카지노총롤링 + row.슬롯총롤링;

        let color;
        if (sum == 0) {
          color = '';
        } else if (sum > 0) {
          color = 'text-primary';
        }

        return `${row.카지노총롤링.toLocaleString('ko-KR')}<br>${row.슬롯총롤링.toLocaleString('ko-KR')}<br><span class="${color}">${sum.toLocaleString(
          'ko-KR'
        )}</span>`;
      },
    },
    {
      target: 8,
      render: function (data, type, row) {
        let diff = row.카지노총베팅 - row.카지노총획득;

        let color;
        if (diff > 0) {
          color = 'text-primary';
        } else if (diff < 0) {
          color = 'text-danger';
        } else {
          color = '';
        }

        return `${row.카지노총베팅.toLocaleString('ko-KR')}<br>${row.카지노총획득.toLocaleString('ko-KR')}<br><span class="${color}">${diff.toLocaleString(
          'ko-KR'
        )}</span>`;
      },
    },
    {
      target: 9,
      render: function (data, type, row) {
        let diff = row.슬롯총베팅 - row.슬롯총획득;

        let color;
        if (diff > 0) {
          color = 'text-primary';
        } else if (diff < 0) {
          color = 'text-danger';
        } else {
          color = '';
        }

        return `${row.슬롯총베팅.toLocaleString('ko-KR')}<br>${row.슬롯총획득.toLocaleString('ko-KR')}<br><span class="${color}">${diff.toLocaleString(
          'ko-KR'
        )}</span>`;
      },
    },
  ],
});

async function getNeedInfo(id) {
  try {
    const result = await $.ajax({
      method: 'POST',
      url: '/detail/needinfo',
      data: { tableType: 'needInfo', id: id },
    });
    return result[0];
  } catch (err) {
    console.log('전송오류');
    console.error(err);
  }
}
