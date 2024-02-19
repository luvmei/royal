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

  // 날짜선택 창
  if (document.getElementById('userConnect') || document.getElementById('userBlock') || document.getElementById('userInfoDate')) {
    if (document.querySelector('.dateInput')) {
      document.querySelector('.dateInput').innerHTML =
        '<input type="text" class="text-center w-100" style="padding: 3px 0" id="dateSelector" name="date" value=""/>';
    }
  }

  collapseSideMenu();

  // initPopover();

  $('table').on('click', 'tbody tr .balance-btn', function () {
    rowData = $('table').DataTable().row($(this).parent('td')).data();
  });
});

let userInfoTotal = $('#userInfoTotal').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/info',
    method: 'POST',
    data: { table: 'userInfoTotal' },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '레벨' },
    { data: '아이디' },
    { data: '닉네임', className: 'desktop' },
    { data: null, className: 'desktop' },
    { data: '보유금' },
    { data: '포인트', className: 'desktop' },
    { data: '총 입금', className: 'desktop' },
    { data: '총 출금', className: 'desktop' },
    { data: '총 입출금', className: 'desktop' },
    { data: '총 베팅', className: 'desktop' },
    { data: '총 당첨', className: 'desktop' },
    { data: '총 당첨율', className: 'desktop' },
    { data: '가입일자', className: 'desktop' },
    { data: '최근 접속일시', className: 'desktop' },
    { data: '최근 접속IP', className: 'desktop' },
    { data: '상태', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
    { data: 'P타입', className: 'pType' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: [0, 16, 22],
      visible: false,
      searchable: false,
    },
    {
      target: [17, 18, 19, 20, 21],
      visible: false,
    },
    {
      target: 2,
      render: function (data, type, row) {
        if (row.가입코드 == '') {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm online-tag">온</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm local-tag">매장</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        }
      },
    },
    {
      target: 4,
      width: 300,
      render: function (data, type, row) {
        return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
      },
    },
    {
      target: 5,
      render: function (data) {
        if (clientType == 9 || clientType == 3) {
          return (
            `<button type="button" class="btn btn-sm btn-outline-dark balance-btn" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-html="true" data-bs-content="<button type='button' class='btn asset-primary balanceGiveBtn'>지급</button><button type='button' class='ms-3 btn asset-danger balanceTakeBtn'>회수</button>" data-bs-delay='{"show":100,"hide":300}'>` +
            data.toLocaleString('ko-KR') +
            `</button>`
          );
        } else {
          return (
            `<button type="button" class="btn btn-sm btn-outline-dark balance-btn" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-html="true" data-bs-content="<button type='button' class='btn asset-primary balanceGiveBtn'>지급</button>" data-bs-delay='{"show":100,"hide":300}'>` +
            data.toLocaleString('ko-KR') +
            `</button>`
          );
        }
      },
    },
    {
      target: 15,
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
      target: 22,
      render: function (data) {
        if (data == 0) {
          return `<button type='button' class='btn btn-sm btn-outline-dark pType-btn asset-primary'>정</button>`;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark pType-btn asset-danger'>파</button>`;
        }
      },
    },
    {
      target: [5, 6, 7, 8, 9, 10, 11],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    { target: 12, className: 'dt-body-right' },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 22],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3, 4, 15, 22],
      orderable: false,
    },
  ],
  drawCallback: function (settings) {
    let popoverTimer;

    $('[data-bs-toggle="popover"]').on('shown.bs.popover', function () {
      let balanceGiveBtn = document.querySelector('.balanceGiveBtn');
      let balanceTakeBtn = document.querySelector('.balanceTakeBtn');

      if (balanceGiveBtn) {
        balanceGiveBtn.addEventListener('click', function () {
          openBalanceGiveModal(rowData);
        });
      }

      if (balanceTakeBtn) {
        balanceTakeBtn.addEventListener('click', function () {
          openBalanceTakeModal(rowData);
        });
      }

      if (popoverTimer) {
        clearTimeout(popoverTimer);
      }

      let $popoverTrigger = $(this); // 현재 팝오버 트리거 요소를 참조
      popoverTimer = setTimeout(function () {
        $popoverTrigger.popover('hide');
      }, 1000);
    });

    $('[data-bs-toggle="popover"]').on('hidden.bs.popover', function () {
      clearTimeout(popoverTimer);
    });
    initPopover();
  },
});

let userInfoOnline = $('#userInfoOnline').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/info',
    method: 'POST',
    data: { table: 'userInfoOnline' },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '레벨' },
    { data: '아이디' },
    { data: '닉네임', className: 'desktop' },
    { data: null, className: 'desktop' },
    { data: '보유금' },
    { data: '포인트', className: 'desktop' },
    { data: '총 입금', className: 'desktop' },
    { data: '총 출금', className: 'desktop' },
    { data: '총 입출금', className: 'desktop' },
    { data: '총 베팅', className: 'desktop' },

    { data: '총 당첨', className: 'desktop' },
    { data: '총 당첨율', className: 'desktop' },
    { data: '가입일자', className: 'desktop' },
    { data: '가입IP', className: 'desktop' },
    { data: '최근 접속일시', className: 'desktop' },
    { data: '최근 접속IP', className: 'desktop' },
    { data: '상태', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
    { data: 'P타입', className: 'pType' },
    { data: '이름', className: 'desktop' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[0, 'desc']],
  createdRow: function (row, data, dataIndex) {
    if (data['중복아이피'] > 0) {
      $(row).find('td').eq(15).addClass('asset-danger');
    }
  },
  columnDefs: [
    {
      target: [0, 17, 23],
      visible: false,
      searchable: false,
    },
    {
      target: [18, 19, 20, 21, 22, 24],
      visible: false,
    },
    {
      target: 2,
      render: function (data, type, row) {
        return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm online-tag">온</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
      },
    },
    {
      target: 4,
      width: 300,
      render: function (data, type, row) {
        if (row.타입 == 4) {
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
      render: function (data) {
        if (clientType == 9 || clientType == 3) {
          return (
            `<button type="button" class="btn btn-sm btn-outline-dark balance-btn" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-html="true" data-bs-content="<button type='button' class='btn asset-primary balanceGiveBtn'>지급</button><button type='button' class='ms-3 btn asset-danger balanceTakeBtn'>회수</button>" data-bs-delay='{"show":100,"hide":300}'>` +
            data.toLocaleString('ko-KR') +
            `</button>`
          );
        } else {
          return (
            `<button type="button" class="btn btn-sm btn-outline-dark balance-btn" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-html="true" data-bs-content="<button type='button' class='btn asset-primary balanceGiveBtn'>지급</button>" data-bs-delay='{"show":100,"hide":300}'>` +
            data.toLocaleString('ko-KR') +
            `</button>`
          );
        }
      },
    },
    {
      target: 14,
      render: function (data, type, row) {
        if (data && data.includes(':')) {
          let parts = data.split(':');
          let firstHalf = parts.slice(0, 3).join(':');
          let secondHalf = parts.slice(4).join(':');
          return `${firstHalf}<br>:${secondHalf}`;
        } else {
          return data;
        }
      },
    },
    {
      target: 16,
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
      target: 23,
      render: function (data) {
        if (data == 0) {
          return `<button type='button' class='btn btn-sm btn-outline-dark pType-btn asset-primary'>정</button>`;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark pType-btn asset-danger'>파</button>`;
        }
      },
    },
    {
      target: [5, 6, 7, 8, 9, 10, 11],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    { target: 12, className: 'dt-body-right' },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 14, 16, 23],
      orderable: false,
    },
  ],
  drawCallback: function (settings) {
    let popoverTimer;

    $('[data-bs-toggle="popover"]').on('shown.bs.popover', function () {
      let balanceGiveBtn = document.querySelector('.balanceGiveBtn');
      let balanceTakeBtn = document.querySelector('.balanceTakeBtn');

      if (balanceGiveBtn) {
        balanceGiveBtn.addEventListener('click', function () {
          openBalanceGiveModal(rowData);
        });
      }

      if (balanceTakeBtn) {
        balanceTakeBtn.addEventListener('click', function () {
          openBalanceTakeModal(rowData);
        });
      }

      if (popoverTimer) {
        clearTimeout(popoverTimer);
      }

      let $popoverTrigger = $(this); // 현재 팝오버 트리거 요소를 참조
      popoverTimer = setTimeout(function () {
        $popoverTrigger.popover('hide');
      }, 1000);
    });

    $('[data-bs-toggle="popover"]').on('hidden.bs.popover', function () {
      clearTimeout(popoverTimer);
    });
    initPopover();
  },
});

let userInfoLocal = $('#userInfoLocal').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/info',
    method: 'POST',
    data: { table: 'userInfoLocal' },
    dataSrc: '',
  },
  createdRow: function (row, data, dataIndex) {
    if (data['중복아이피'] > 0) {
      $(row).find('td').eq(14).addClass('asset-danger');
    }
  },
  columns: [
    { data: 'IDX' },
    { data: '레벨' },
    { data: '아이디' },
    { data: '닉네임', className: 'desktop' },
    { data: null, className: 'desktop' },
    { data: '보유금' },
    { data: '포인트', className: 'desktop' },
    { data: '총 입금', className: 'desktop' },
    { data: '총 출금', className: 'desktop' },
    { data: '총 입출금', className: 'desktop' },
    { data: '총 베팅', className: 'desktop' },
    { data: '총 당첨', className: 'desktop' },
    { data: '총 당첨율', className: 'desktop' },
    { data: '가입일자', className: 'desktop' },
    { data: '최근 접속일시', className: 'desktop' },
    { data: '최근 접속IP', className: 'desktop' },
    { data: '상태', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
    { data: 'P타입', className: 'pType' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: [0, 16, 22],
      visible: false,
      searchable: false,
    },
    {
      target: [17, 18, 19, 20, 21],
      visible: false,
    },
    {
      target: 2,
      render: function (data, type, row) {
        return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm local-tag">매장</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
      },
    },
    {
      target: 4,
      width: 300,
      render: function (data, type, row) {
        return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
      },
    },
    {
      target: 5,
      render: function (data) {
        if (clientType == 9 || clientType == 3) {
          return (
            `<button type="button" class="btn btn-sm btn-outline-dark balance-btn" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-html="true" data-bs-content="<button type='button' class='btn asset-primary balanceGiveBtn'>지급</button><button type='button' class='ms-3 btn asset-danger balanceTakeBtn'>회수</button>" data-bs-delay='{"show":100,"hide":300}'>` +
            data.toLocaleString('ko-KR') +
            `</button>`
          );
        } else {
          return (
            `<button type="button" class="btn btn-sm btn-outline-dark balance-btn" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-html="true" data-bs-content="<button type='button' class='btn asset-primary balanceGiveBtn'>지급</button>" data-bs-delay='{"show":100,"hide":300}'>` +
            data.toLocaleString('ko-KR') +
            `</button>`
          );
        }
      },
    },
    {
      target: 15,
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
      target: 22,
      render: function (data) {
        if (data == 0) {
          return `<button type='button' class='btn btn-sm btn-outline-dark pType-btn asset-primary'>정</button>`;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark pType-btn asset-danger'>파</button>`;
        }
      },
    },
    {
      target: [5, 6, 7, 8, 9, 10, 11],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    { target: 12, className: 'dt-body-right' },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 22],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3, 4, 15, 22],
      orderable: false,
    },
  ],
  drawCallback: function (settings) {
    let popoverTimer;

    $('[data-bs-toggle="popover"]').on('shown.bs.popover', function () {
      let balanceGiveBtn = document.querySelector('.balanceGiveBtn');
      let balanceTakeBtn = document.querySelector('.balanceTakeBtn');

      if (balanceGiveBtn) {
        balanceGiveBtn.addEventListener('click', function () {
          openBalanceGiveModal(rowData);
        });
      }

      if (balanceTakeBtn) {
        balanceTakeBtn.addEventListener('click', function () {
          openBalanceTakeModal(rowData);
        });
      }

      if (popoverTimer) {
        clearTimeout(popoverTimer);
      }

      let $popoverTrigger = $(this); // 현재 팝오버 트리거 요소를 참조
      popoverTimer = setTimeout(function () {
        $popoverTrigger.popover('hide');
      }, 1000);
    });

    $('[data-bs-toggle="popover"]').on('hidden.bs.popover', function () {
      clearTimeout(popoverTimer);
    });
    initPopover();
  },
});

// 파싱 유효시에만 사용
function checkUserType() {
  $.ajax({
    method: 'POST',
    url: '/clientId',
  })
    .done(function (result) {
      if (result.type != 9) {
        userInfo.columns('.pType').visible(false);
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

$('#userInfoDate').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/info',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      d.table = 'userInfoDate';
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '레벨' },
    { data: '아이디' },
    { data: '보유금' },
    { data: '지급', className: 'desktop' },
    { data: '회수', className: 'desktop' },
    { data: '지급-회수', className: 'desktop' },
    { data: '입금', className: 'desktop' },
    { data: '출금', className: 'desktop' },
    { data: '입금-출금', className: 'desktop' },
    { data: '베팅', className: 'desktop' },
    { data: '윈', className: 'desktop' },
    { data: '베팅-윈', className: 'desktop' },
    { data: '최근접속일시', className: 'desktop' },
    { data: '상태', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  dom: '<"dateInput float-start dateWidth me-2">lfrtip',
  pageLength: 100,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [14, 15, 16, 17, 18, 19],
      visible: false,
    },
    {
      target: 2,
      render: function (data, type, row) {
        if (row.가입코드) {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm online-tag">온</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else if (row.가입코드 == '') {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm local-tag">매장</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
        }
      },
    },
    {
      target: 6,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData[`지급-회수`] < 0) {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        data = parseInt(data).toLocaleString('ko-KR');
        return data;
      },
    },
    {
      target: 9,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData[`입금-출금`] < 0) {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        data = parseInt(data).toLocaleString('ko-KR');
        return data;
      },
    },
    {
      target: 12,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData[`베팅-윈`] < 0) {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        data = parseInt(data).toLocaleString('ko-KR');
        return data;
      },
    },
    {
      target: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    { target: 12, className: 'dt-body-right' },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3, 4, 15],
      orderable: false,
    },
  ],
  drawCallback: function (settings) {
    let popoverTimer;

    $('[data-bs-toggle="popover"]').on('shown.bs.popover', function () {
      let balanceGiveBtn = document.querySelector('.balanceGiveBtn');
      let balanceTakeBtn = document.querySelector('.balanceTakeBtn');

      if (balanceGiveBtn) {
        balanceGiveBtn.addEventListener('click', function () {
          openBalanceGiveModal(rowData);
        });
      }

      if (balanceTakeBtn) {
        balanceTakeBtn.addEventListener('click', function () {
          openBalanceTakeModal(rowData);
        });
      }

      if (popoverTimer) {
        clearTimeout(popoverTimer);
      }

      let $popoverTrigger = $(this); // 현재 팝오버 트리거 요소를 참조
      popoverTimer = setTimeout(function () {
        $popoverTrigger.popover('hide');
      }, 1000);
    });

    $('[data-bs-toggle="popover"]').on('hidden.bs.popover', function () {
      clearTimeout(popoverTimer);
    });

    initPopover();
  },
});

$('#userAsset').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/asset',
    method: 'POST',
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '아이디' },
    { data: '닉네임' },
    { data: null, className: 'desktop' },
    { data: '보유금' },
    { data: '포인트', className: 'desktop' },
    { data: '최근 입금', className: 'desktop' },
    { data: '최근 출금', className: 'desktop' },
    { data: '당일 입금', className: 'desktop' },
    { data: '당일 출금', className: 'desktop' },
    { data: '당일 입출금', className: 'desktop' },

    { data: '총 입금', className: 'desktop' },
    { data: '총 출금', className: 'desktop' },
    { data: '총 입출금', className: 'desktop' },
    { data: '받은 보유금', className: 'desktop' },
    { data: '받은 포인트', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  pageLength: 20,
  lengthMenu: [20, 50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [16, 17, 18, 19, 20],
      visible: false,
    },
    {
      target: 1,
      render: function (data, type, row) {
        if (row.가입코드) {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm online-tag">온</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else if (row.가입코드 == '') {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm local-tag">매장</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
        }
      },
    },
    {
      target: 3,
      width: 300,
      render: function (data, type, row) {
        if (row.타입 == 4) {
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
      target: 4,
      render: function (data) {
        if (clientType == 9 || clientType == 3) {
          return (
            `<button type="button" class="btn btn-sm btn-outline-dark balance-btn" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-html="true" data-bs-content="<button type='button' class='btn asset-primary balanceGiveBtn'>지급</button><button type='button' class='ms-3 btn asset-danger balanceTakeBtn'>회수</button>" data-bs-delay='{"show":100,"hide":300}'>` +
            data.toLocaleString('ko-KR') +
            `</button>`
          );
        } else {
          return (
            `<button type="button" class="btn btn-sm btn-outline-dark balance-btn" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-html="true" data-bs-content="<button type='button' class='btn asset-primary balanceGiveBtn'>지급</button>" data-bs-delay='{"show":100,"hide":300}'>` +
            data.toLocaleString('ko-KR') +
            `</button>`
          );
        }
      },
    },
    {
      target: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3],
      orderable: false,
    },
  ],
  drawCallback: function (settings) {
    let popoverTimer;

    $('[data-bs-toggle="popover"]').on('shown.bs.popover', function () {
      let balanceGiveBtn = document.querySelector('.balanceGiveBtn');
      let balanceTakeBtn = document.querySelector('.balanceTakeBtn');

      if (balanceGiveBtn) {
        balanceGiveBtn.addEventListener('click', function () {
          openBalanceGiveModal(rowData);
        });
      }

      if (balanceTakeBtn) {
        balanceTakeBtn.addEventListener('click', function () {
          openBalanceTakeModal(rowData);
        });
      }

      if (popoverTimer) {
        clearTimeout(popoverTimer);
      }

      let $popoverTrigger = $(this); // 현재 팝오버 트리거 요소를 참조
      popoverTimer = setTimeout(function () {
        $popoverTrigger.popover('hide');
      }, 1000);
    });

    $('[data-bs-toggle="popover"]').on('hidden.bs.popover', function () {
      clearTimeout(popoverTimer);
    });

    initPopover();
  },
});

$('#userCommission').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/commission',
    method: 'POST',
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '아이디' },
    { data: '닉네임' },
    { data: null },
    { data: '카지노 롤링요율' },
    { data: '카지노 당일적립 롤링커미션' },
    { data: '카지노 총적립 롤링커미션' },
    { data: '슬롯 롤링요율' },
    { data: '슬롯 당일적립 롤링커미션' },
    { data: '슬롯 총적립 롤링커미션' },
    { data: '루징요율' },
    { data: '당일적립 루징커미션' },
    { data: '총적립 루징커미션' },
    { data: '롤링마진요율' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  pageLength: 20,
  lengthMenu: [20, 50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [16, 17, 18, 19, 20],
      visible: false,
    },
    {
      target: 1,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 3,
      width: 300,
      render: function (data, type, row) {
        return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
      },
    },
    {
      target: [6, 9, 12],
      className: 'border-end',
    },
    {
      target: [5, 6, 8, 9, 11, 12, 14, 15],
      className: 'dt-body-right',
    },
    {
      target: [4, 7, 10, 13],
      className: 'dt-body-right',
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3],
      orderable: false,
    },
  ],
});

$('#userBetting').DataTable({
  language: korean,
  responsive: {
    details: {
      renderer: function (api, rowIdx, columns) {
        var data = $.map(columns, function (col, i) {
          switch (i) {
            case 4:
              col.title = '카지노 당일베팅금';
              break;
            case 5:
              col.title = '카지노 당일당첨금';
              break;
            case 6:
              col.title = '카지노 당일당첨율';
              break;
            case 7:
              col.title = '슬롯 당일베팅금';
              break;
            case 8:
              col.title = '슬롯 당일당첨금';
              break;
            case 9:
              col.title = '슬롯 당일당첨율';
              break;
            case 10:
              col.title = '슬롯 당일베팅금';
              break;
            case 11:
              col.title = '슬롯 당일당첨금';
              break;
            case 12:
              col.title = '슬롯 당일당첨율';
              break;
            case 13:
              col.title = '슬롯 전체베팅금';
              break;
            case 14:
              col.title = '슬롯 전체당첨금';
              break;
            case 15:
              col.title = '슬롯 전체당첨율';
              break;
          }
          return col.hidden
            ? `<li class=" dt-head-center dt-body-center" data-dtr-index="${col.index}" data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}"><span
            class="dtr-title">${col.title}</span> <span class="dtr-data">${col.data}</span></li>`
            : '';
        }).join('');

        return data ? $('<ul class="dtr-details"/>').append(data) : false;
      },
    },
  },
  ajax: {
    url: '/user/betting',
    method: 'POST',
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '아이디' },
    { data: '닉네임' },
    { data: null, className: 'desktop' },
    { data: '카지노 당일베팅금', className: 'desktop' },
    { data: '카지노 당일당첨금', className: 'desktop' },
    { data: '카지노 당일당첨율', className: 'desktop' },
    { data: '카지노 전체베팅금', className: 'desktop' },
    { data: '카지노 전체당첨금', className: 'desktop' },
    { data: '카지노 전체당첨율', className: 'desktop' },
    { data: '슬롯 당일베팅금', className: 'desktop' },
    { data: '슬롯 당일당첨금', className: 'desktop' },
    { data: '슬롯 당일당첨율', className: 'desktop' },
    { data: '슬롯 전체베팅금', className: 'desktop' },
    { data: '슬롯 전체당첨금', className: 'desktop' },
    { data: '슬롯 전체당첨율', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  pageLength: 20,
  lengthMenu: [20, 50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [16, 17, 18, 19, 20],
      visible: false,
    },
    {
      target: 1,
      render: function (data, type, row) {
        if (row.가입코드) {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm online-tag">온</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else if (row.가입코드 == '') {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm local-tag">매장</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
        }
      },
    },
    {
      target: 3,
      width: 300,
      render: function (data, type, row) {
        if (row.타입 == 4) {
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
      target: [6, 9],
      className: 'border-end',
    },
    {
      target: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-body-right',
    },
    {
      target: [4, 5, 7, 8, 10, 11, 13, 14],
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3],
      orderable: false,
    },
  ],
});

$('#userConnect').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/connect',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '접속일시' },
    { data: '접속타입' },
    { data: '아이디' },
    { data: '닉네임', className: 'desktop' },
    { data: null, className: 'desktop' },
    { data: '전용 도메인', className: 'desktop' },
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
  dom: '<"dateInput float-start dateWidth me-2">lfrtip',
  createdRow: function (row, data, dataIndex) {
    if (data.접속타입 == '로그아웃' || data.접속타입 == '세션아웃') {
      $(row).addClass('bg-mistyred');
    } else if (data.접속타입 == '로그인' || data.접속타입 == '회원가입') {
      $(row).addClass('bg-mistyblue');
    }
  },
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
      target: 2,
      render: function (data, type, row) {
        if (data == '로그인' || data == '회원가입') {
          return `<button type='button' class='btn btn-sm btn-outline-primary id-btn'>${data}</button>`;
        } else if (data == '로그아웃' || data == '세션아웃') {
          return `<button type='button' class='btn btn-sm btn-outline-danger id-btn'>${data}</button>`;
        }
      },
    },
    {
      target: 3,
      render: function (data, type, row) {
        if (row.가입코드) {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm online-tag">온</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else if (row.가입코드 == '') {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm local-tag">매장</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
        }
      },
    },
    {
      target: 5,
      width: 300,
      render: function (data, type, row) {
        return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-primary' style='cursor: default'>${row.브론즈}</button>`;
      },
    },
    {
      target: 8,
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
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      orderable: false,
    },
  ],
});

$('#userBlock').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/block',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '차단일시', responsivePriority: 1 },
    { data: '상태', className: 'desktop' },
    { data: '차단사유', className: 'desktop' },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', className: 'desktop' },
    { data: null, responsivePriority: 3 },
    { data: '전화번호', className: 'desktop' },
    { data: '출금은행', className: 'desktop' },
    { data: '계좌번호', className: 'desktop' },
    { data: '예금주', className: 'desktop' },
    { data: '보유금', className: 'desktop' },
    { data: '포인트', className: 'desktop' },
    { data: '최근 접속IP', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[1, 'desc']],
  dom: 'lfrtip',
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [14, 15, 16, 17],
      visible: false,
    },
    {
      target: 3,
      render: function (data) {
        if (data == '') {
          return data;
        } else {
          return `
              <button type='button' class='btn btn-sm btn-outline-secondary deposit-memo'
              data-bs-toggle="popover"
              data-bs-trigger="hover"
              data-bs-placement="left"
              data-bs-content="${data}">사유확인</button>
              `;
        }
      },
    },
    {
      target: 4,
      render: function (data, type, row) {
        if (row.가입코드) {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm online-tag">온</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else if (row.가입코드 == '') {
          return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-sm local-tag">매장</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
        }
      },
    },
    {
      target: 6,
      width: 300,
      render: function (data, type, row) {
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
      },
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
      target: [11, 12],
      className: 'dt-body-right',
      width: 110,
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 7, 8, 9, 10, 13],
      orderable: false,
    },
  ],
});

$('#userJoinConfirm').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/user/confirm',
    method: 'POST',
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '타입' },
    { data: '아이디' },
    { data: '닉네임' },
    { data: '전화번호' },
    { data: '은행' },
    { data: '계좌번호' },
    { data: '예금주' },
    { data: '출금 비밀번호' },
    { data: null },
    { data: '전용 도메인' },

    { data: '가입 도메인' },
    { data: '가입IP' },
    { data: '가입일자' },
    { data: null, defaultContent: '', responsivePriority: 1 },
    { data: null, defaultContent: '', responsivePriority: 2 },
    { data: '상태' },
  ],
  pageLength: 20,
  lengthMenu: [20, 50, 75, 100],
  order: [[0, 'desc']],
  createdRow: function (row, data, dataIndex) {
    if (data.상태 != '차단') {
      if (data.타입 == 0) {
        $(row).addClass('platinum-bg');
      } else if (data.타입 == 1) {
        $(row).addClass('gold-bg');
        // $(row).css('display', 'none');
      } else if (data.타입 == 2) {
        $(row).addClass('silver-bg');
        // $(row).css('display', 'none');
      } else if (data.타입 == 3) {
        $(row).addClass('bronze-bg');
        // $(row).css('display', 'none');
      }
    }

    if (data.IPCount && data.IPCount > 1) {
      $('td:eq(11)', row).addClass('asset-danger');
      $('td:eq(11)', row).html(`${data.가입IP}<br>가입 이력있는 IP`);
    }
  },
  columnDefs: [
    {
      target: [0, 16],
      visible: false,
      searchable: false,
    },
    {
      target: 1,
      render: function (data) {
        switch (data) {
          case 0:
            return '플래티넘';
          case 1:
            return '골드';
          case 2:
            return '실버';
          case 3:
            return '브론즈';
          case 4:
            return '일반';
        }
      },
    },
    {
      target: 9,
      width: 300,
      render: function (data, type, row) {
        if (row.타입 == 4) {
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
          if (row.타입 == 0) {
            $(row).addClass('platinum-bg');
            return null;
          } else if (row.타입 == 1) {
            $(row).addClass('gold-bg');
            return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;
          } else if (row.타입 == 2) {
            $(row).addClass('silver-bg');
            return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>
                    <button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>`;
          } else if (row.타입 == 3) {
            $(row).addClass('bronze-bg');
            return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>
                    <button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>
                    <button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button>`;
          }
        }
      },
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15],
      orderable: false,
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
      target: 14,
      render: function (data) {
        return `<button type='button' class='btn btn-sm asset-success open-join-confirm p-1 px-lg-2 py-lg-1'>승인</button>`;
      },
      width: 50,
    },
    {
      target: 15,
      render: function (data) {
        return `<button type='button' class='btn btn-sm asset-danger open-join-block p-1 px-lg-2 py-lg-1'>차단</button>`;
      },
      width: 50,
    },
  ],
});
