window.addEventListener('DOMContentLoaded', (event) => {
  // 사이드바 토글
  const sidebarToggle = document.body.querySelector('#sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
    });
  }

  if (
    document.getElementById('depositWithdraw') ||
    document.getElementById('deposit') ||
    document.getElementById('withdraw') ||
    document.getElementById('give') ||
    document.getElementById('take')
  ) {
    if (document.querySelector('.dateInput')) {
      document.querySelector('.dateInput').innerHTML =
        '<input type="text" class="text-center w-100" style="padding: 3px 0" id="dateSelector" name="date" value=""/>';
    }
  }

  //? 지급,회수 메모컬럼 숨김
  if (clientType != 9) {
    giveTable.column(10).visible(false);
    takeTable.column(10).visible(false);
  }

  //? 일괄 출금승인 버튼
  if (document.querySelector('#batchWithdraw')) {
    document.querySelector('#batchWithdraw').innerHTML = '일괄 출금승인';
    document.querySelector('#batchWithdraw').classList.add('disabled');
    document.querySelector('#batchWithdraw').addEventListener('click', () => {
      $('#batchWithdrawModal').modal('show');
    });
  }

  collapseSideMenu();
  initPopover();
});

$('#depositWithdraw').DataTable({
  language: korean,
  responsive: true,
  scrollY: '75vh',
  scrollCollapse: true,
  ajax: {
    url: '/bank/depowith',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: '신청일시', className: 'desktop' },
    { data: '회원타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', className: 'desktop' },
    { data: null, className: 'desktop dt-head-center' },
    { data: '신청타입', className: 'desktop' },
    { data: '신청 시 보유금', className: 'desktop' },
    { data: '신청금액', responsivePriority: 3 },
    { data: '승인 후 보유금', className: 'desktop' },
    { data: '신청IP', className: 'desktop' },
    { data: '처리현황', responsivePriority: 4 },
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
      target: [12, 13, 14, 15, 16],
      visible: false,
    },
    {
      target: 1,
      render: function (data) {
        if (data == '0') {
          return '플래티넘';
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
      target: 2,
      render: function (data, type, row) {
        if (row.회원타입 == 0) {
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
      target: 4,
      width: 300,
      render: function (data, type, row) {
        if (row.회원타입 == 4) {
          let result = `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;

          if (row.골드 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>`;
          }

          if (row.실버 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button>`;
          }

          if (row.브론즈 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
          }

          return result;
        } else {
          let result = `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;

          if (row.골드 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>`;
          }

          if (row.실버 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button>`;
          }

          if (row.브론즈 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
          }

          return result;
        }
      },
    },
    {
      target: 5,
      render: function (data, type, row) {
        if (data == '입금') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>` + data + `</button>`;
        } else if (data == '출금') {
          return `<button type='button' class='btn btn-sm text-danger border-dnager' disabled>` + data + `</button>`;
        }
      },
    },
    {
      target: 7,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData.신청타입 == '출금') {
          $(td).addClass('text-danger');
        }
      },
    },
    {
      target: [6, 7, 8],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: 9,
      render: function (data, type, row) {
        if (data && data.includes(':')) {
          let parts = data.split(':');
          let firstHalf = parts.slice(0, 4).join(':');
          let secondHalf = parts.slice(4).join(':');
          return `${firstHalf}<br>:${secondHalf}`;
        }
        return data || '';
      },
    },
    {
      target: 10,
      render: function (data, type, row) {
        if (row.신청타입 == '입금') {
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
        } else if (row.신청타입 == '출금') {
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
        }
      },
    },
    {
      target: 11,
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
      target: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3, 4, 5, 9, 10, 11],
      orderable: false,
    },
  ],
  drawCallback: function () {
    initPopover();
  },
});

$('#deposit').DataTable({
  language: korean,
  responsive: true,
  autowidth: true,
  scrollY: '72vh',
  scrollCollapse: true,
  ajax: {
    url: '/bank/deposit',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX', className: 'desktop' },
    { data: '입금신청일시', className: 'desktop' },
    { data: '회원타입', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: null, className: 'desktop dt-head-center desktop' },
    { data: '입금자명', className: 'desktop' },
    { data: '신청 시 보유금', className: 'desktop' },
    { data: '신청금액', responsivePriority: 2 },
    { data: '보너스타입', className: 'desktop' },
    { data: '보너스금액', className: 'desktop' },

    { data: '승인 후 보유금', className: 'desktop' },
    { data: '신청IP', className: 'desktop' },
    { data: '처리현황', responsivePriority: 3 },
    { data: '입금 처리일시', className: 'desktop' },
    { data: '메모', className: 'desktop' },
    { data: null, className: 'desktop' },
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
  order: [
    [0, 'desc'],
    [1, 'desc'],
  ],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [17, 18, 19, 20, 21],
      visible: false,
    },
    {
      target: 2,
      render: function (data) {
        if (data == '0') {
          return '플래티넘';
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
        if (row.회원타입 == 0) {
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
      target: 5,
      width: 300,
      render: function (data, type, row) {
        if (row.회원타입 == 4) {
          let result = `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;

          if (row.골드 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>`;
          }

          if (row.실버 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button>`;
          }

          if (row.브론즈 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
          }

          return result;
        } else {
          let result = `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;

          if (row.골드 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>`;
          }

          if (row.실버 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button>`;
          }

          if (row.브론즈 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
          }

          return result;
        }
      },
    },
    {
      target: [7, 8],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: 9,
      render: function (data, type, row) {
        if (row.보너스상태 == 0) {
          return '';
        } else {
          if (data == '0') {
            return '';
          } else if (data == '1') {
            return `<button type='button' class='btn btn-sm asset-warning'>매일 첫충</button>`;
          } else if (data == '2') {
            return `<button type='button' class='btn btn-sm asset-danger'>가입 첫충</button>`;
          } else if (data == '3') {
            return `<button type='button' class='btn btn-sm asset-dark'>재충전</button>`;
          } else if (data == '4') {
            return `<button type='button' class='btn btn-sm asset-dark'>가입 재충전</button>`;
          }
        }
      },
    },
    {
      target: 10,
      className: 'dt-body-right',
      render: function (data, type, row) {
        if (row.보너스상태 == 0) {
          return '';
        } else {
          if (row.보너스타입 == 0) {
            return '';
          } else {
            return (row.신청금액 + data).toLocaleString('ko-KR');
          }
        }
      },
    },
    {
      target: 11,
      className: 'dt-body-right',
      render: function (data, type, row) {
        if (row.보너스상태 == 0) {
          row['승인 후 보유금'] = row['신청 시 보유금'] + row.신청금액;
          return row['승인 후 보유금'].toLocaleString('ko-KR');
        } else {
          if (row['보너스타입'] == '0') {
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
      target: 12,
      render: function (data, type, row) {
        if (data && data.includes(':')) {
          let parts = data.split(':');
          let firstHalf = parts.slice(0, 4).join(':');
          let secondHalf = parts.slice(4).join(':');
          return `${firstHalf}<br>:${secondHalf}`;
        }
        return data || '';
      },
    },
    {
      target: 13,
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
      target: 15,
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
      target: 16,
      render: function (data, type, row) {
        return `<span type='button' class='text-danger deposit-cancel'>` + `<i class="bi bi-x-circle"></i>` + `</span>`;
      },
    },
    {
      target: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 9, 12, 13, 15, 16],
      orderable: false,
    },
    {
      target: 8,
      className: 'fw-semibold',
    },
  ],
  drawCallback: function () {
    initPopover();
  },
  footerCallback: function (row, data, start, end, display) {
    var api = this.api();

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

    $(api.column(1).footer().classList.add('text-center'));
    $(api.column(1).footer()).html(`선택기간 합계`);

    $(api.column(5).footer()).html(`신청 :  ${reqTotal.toLocaleString('ko-KR')} 원`);

    $(api.column(6).footer()).html(`보너스 승인:  ${bonusTotal.toLocaleString('ko-KR')} 원`);

    $(api.column(9).footer()).html(`신청 승인 :  ${confirmTotal.toLocaleString('ko-KR')} 원`);

    $(api.column(13).footer()).html(`최종 승인 :  ${(confirmTotal + bonusTotal).toLocaleString('ko-KR')} 원  `);
  },
});

let withdrawTable = $('#withdraw').DataTable({
  language: korean,
  select: {
    style: 'os',
    blurable: true,
  },
  responsive: true,
  scrollY: '70vh',
  scrollCollapse: true,
  ajax: {
    url: '/bank/withdraw',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth me-2">lf<"#batchWithdraw.btn btn-sm btn-secondary float-end me-4">rtip',
  columns: [
    { data: 'IDX' },
    { data: '출금신청일시', className: 'desktop' },
    { data: '회원타입', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: null, className: 'desktop dt-head-center' },
    { data: '은행', className: 'desktop' },
    { data: '계좌번호', className: 'desktop' },
    { data: '예금주', className: 'desktop' },
    { data: '신청 시 보유금', className: 'desktop' },
    { data: '신청금액', responsivePriority: 2 },
    { data: '롤링율', className: 'desktop' },
    { data: '승인 후 보유금', className: 'desktop' },
    { data: '신청IP', className: 'desktop' },
    { data: '처리현황', responsivePriority: 3 },
    { data: '출금 처리일시', className: 'desktop' },
    { data: '메모', className: 'desktop' },
    { data: null, className: 'desktop' },
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
      target: [11, 18, 19, 20, 21, 22],
      visible: false,
    },
    {
      target: 2,
      render: function (data) {
        if (data == '0') {
          return '플래티넘';
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
      width: 120,
      render: function (data, type, row) {
        if (row.회원타입 == 0) {
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
      target: 5,
      width: 300,
      render: function (data, type, row) {
        if (row.회원타입 == 4) {
          let result = `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;

          if (row.골드 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>`;
          }

          if (row.실버 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button>`;
          }

          if (row.브론즈 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
          }

          return result;
        } else {
          let result = `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;

          if (row.골드 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>`;
          }

          if (row.실버 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button>`;
          }

          if (row.브론즈 !== null) {
            result += `<button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
          }

          return result;
        }
      },
    },
    {
      target: 10,
      render: function (data, type, row) {
        return `<div class='text-danger text-end'>${data.toLocaleString('ko-KR')}</div>`;
      },
    },
    {
      target: [9, 12],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: 13,
      render: function (data, type, row) {
        if (data && data.includes(':')) {
          let parts = data.split(':');
          let firstHalf = parts.slice(0, 4).join(':');
          let secondHalf = parts.slice(4).join(':');
          return `${firstHalf}<br>:${secondHalf}`;
        }
        return data || '';
      },
    },
    {
      target: 14,
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
      target: 16,
      render: function (data) {
        if (data == '') {
          return data;
        } else {
          return `
            <button type='button' class='btn btn-sm btn-outline-secondary withdraw-memo'
            data-bs-toggle="popover"
            data-bs-trigger="hover"            
            data-bs-placement="left"
            data-bs-content="${data}">메모<br>확인</button>
            `;
        }
      },
    },
    {
      target: 17,
      render: function (data, type, row) {
        return `<span type='button' class='text-danger deposit-cancel'>` + `<i class="bi bi-x-circle"></i>` + `</span>`;
      },
    },
    {
      target: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 7, 8, 13, 14, 16, 17],
      orderable: false,
    },
    {
      target: 10,
      className: 'fw-semibold',
    },
  ],
  footerCallback: function (row, data, start, end, display) {
    var api = this.api();

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
        if (row.처리현황 === '출금승인') {
          return sum + intVal(row.신청금액);
        }
        return sum;
      }, 0);

    $(api.column(1).footer().classList.add('text-center'));
    $(api.column(1).footer()).html(`선택기간 합계 :`);
    $(api.column(2).footer()).html(`신청 :  ${reqTotal.toLocaleString('ko-KR')} 원`);
    $(api.column(17).footer()).html(`최종 승인 :  ${confirmTotal.toLocaleString('ko-KR')} 원`);

    if (window.innerWidth < 992) {
      $(api.table().footer()).find('th:not(:first)').remove();

      // 첫 번째 cell에 colspan 속성 적용
      $(api.table().footer()).find('th:first').attr('colspan', 22); // 전체 컬럼 수

      // 첫 번째 cell에 원하는 값 설정 (예: 합계)
      $(api.table().footer())
        .find('th:first')
        .html(`신청 :  ${reqTotal.toLocaleString('ko-KR')} 원`);
    }
  },
  drawCallback: function () {
    initPopover();
  },
});

//? 선택 된 row의 데이터 추출
let selectedData = [];

withdrawTable.on('select deselect', function () {
  let data = withdrawTable.rows({ selected: true }).data().toArray();
  selectedData = data.map(function (row) {
    return {
      IDX: row.IDX,
      id: row.아이디,
      reqMoney: row.신청금액,
      currentBalance: row['신청 시 보유금'],
      afterBalance: row['승인 후 보유금'],
      currentStatus: row.처리현황,
      withdraw_memo: '',
      confirmTime: getCurrentTime(),
      type: row.회원타입,
    };
  });

  if (selectedData.length > 1) {
    document.querySelector('#batchWithdraw').classList.replace('btn-secondary', 'asset-danger');
    document.querySelector('#batchWithdraw').classList.remove('disabled');
  } else {
    document.querySelector('#batchWithdraw').classList.replace('asset-danger', 'btn-secondary');
    document.querySelector('#batchWithdraw').classList.add('disabled');
  }
});

//? 선택 된 row 일괄 출금승인
document.querySelector('#batchWithdrawConfirmBtn').addEventListener('click', function () {
  if (selectedData.length == 0) {
    alert('선택된 행이 없습니다.');
    return;
  }
  spinnerToggle();
  console.log('after', selectedData);

  $.ajax({
    method: 'POST',
    url: '/bank/withdraw/batchconfirm',
    data: {
      selectedData: selectedData,
    },
  })
    .done(function (result) {
      $('#batchWithdrawModal').modal('hide');
      spinnerToggle();
      $('#withdraw').DataTable().ajax.reload(null, false);
      getNavModalData();
      initPopover();
      console.log(result);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

let giveTable = $('#give').DataTable({
  language: korean,
  responsive: true,
  scrollY: '70vh',
  scrollCollapse: true,
  ajax: {
    url: '/bank/give',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '지급일시', className: 'desktop' },
    { data: '지급매장', className: 'desktop' },
    { data: '유저타입', responsivePriority: 1 },
    { data: '아이디', className: 'desktop' },
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
      target: 3,
      render: function (data) {
        if (data == '0') {
          return '플래티넘';
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
      target: 4,
      render: function (data, type, row) {
        if (row.유저타입 == 0) {
          return `<button type='button' class='btn btn-sm id-btn asset-danger'>` + data + `</button>`;
        } else if (row.유저타입 == 1) {
          return `<button type='button' class='btn btn-sm id-btn asset-warning'>` + data + `</button>`;
        } else if (row.유저타입 == 2) {
          return `<button type='button' class='btn btn-sm id-btn asset-success'>` + data + `</button>`;
        } else if (row.유저타입 == 3) {
          return `<button type='button' class='btn btn-sm id-btn asset-primary'>` + data + `</button>`;
        } else if (row.유저타입 == 4) {
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
      target: 5,
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
      target: [6, 7, 8],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 9],
      orderable: false,
    },
    {
      target: 6,
      className: 'fw-semibold',
    },
    {
      target: [9, 10],
      visible: false,
    },
    {
      target: 11,
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

let takeTable = $('#take').DataTable({
  language: korean,
  responsive: true,
  scrollY: '70vh',
  scrollCollapse: true,
  ajax: {
    url: '/bank/take',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '회수일시', className: 'desktop' },
    { data: '회수매장', className: 'desktop' },
    { data: '유저타입', responsivePriority: 1 },
    { data: '아이디', className: 'desktop' },
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
      target: 3,
      render: function (data) {
        if (data == '0') {
          return '플래티넘';
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
      target: 4,
      render: function (data, type, row) {
        if (row.유저타입 == 0) {
          return `<button type='button' class='btn btn-sm id-btn asset-danger'>` + data + `</button>`;
        } else if (row.유저타입 == 1) {
          return `<button type='button' class='btn btn-sm id-btn asset-warning'>` + data + `</button>`;
        } else if (row.유저타입 == 2) {
          return `<button type='button' class='btn btn-sm id-btn asset-success'>` + data + `</button>`;
        } else if (row.유저타입 == 3) {
          return `<button type='button' class='btn btn-sm id-btn asset-primary'>` + data + `</button>`;
        } else if (row.유저타입 == 4) {
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
      target: [5, 6, 7],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 8],
      orderable: false,
    },
    {
      target: 5,
      className: 'fw-semibold',
    },
    {
      target: [8, 9],
      visible: false,
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
  ],
});
