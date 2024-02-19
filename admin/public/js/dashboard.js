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
});

$('#onlineUsers').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/adminonline',
    method: 'POST',
    dataSrc: '',
  },
  columns: [
    { data: '레벨' },
    { data: '아이디' },
    { data: '닉네임', className: 'desktop' },
    { data: '상위 에이전트', className: 'desktop' },
    { data: '보유금' },
    { data: '포인트' },
    { data: '카_베팅', className: 'desktop' },
    { data: '카_윈', className: 'desktop' },
    { data: '슬_베팅', className: 'desktop' },
    { data: '슬_윈', className: 'desktop' },
  ],
  scrollY: '20vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[4, 'desc']],
  columnDefs: [
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
        <button type="button" class="btn btn-sm local-tag">매</button>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>
        `;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
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
      target: [4, 5, 6, 7, 8, 9],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9],
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
      const balanceGiveBtn = document.querySelector('.balanceGiveBtn');
      const balanceTakeBtn = document.querySelector('.balanceTakeBtn');
      const pointGiveBtn = document.querySelector('.pointGiveBtn');
      const pointTakeBtn = document.querySelector('.pointTakeBtn');

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

      if (pointGiveBtn) {
        pointGiveBtn.addEventListener('click', function () {
          openPointGiveModal(rowData);
        });
      }

      if (pointTakeBtn) {
        pointTakeBtn.addEventListener('click', function () {
          openPointTakeModal(rowData);
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

$('#dashboardBank').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/bank/depowith',
    method: 'POST',
    data: function (d) {
      d.startDate = moment().format('YYYY-MM-DD');
      d.endDate = moment().format('YYYY-MM-DD');
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: '신청일시', className: 'desktop' },
    { data: '신청타입' },
    { data: '회원타입', className: 'desktop' },
    { data: '아이디' },
    { data: '닉네임', className: 'desktop' },
    // { data: '상위 에이전트' },
    // { data: '신청 시 보유금' },
    { data: '신청금액' },
    // { data: '승인 후 보유금' },
    // { data: '신청IP' },
    { data: '처리현황' },
    { data: '메모', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
    { data: 'IDX' },
  ],
  scrollY: '20vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: [2, 7, 8, 9, 10, 11, 12, 13],
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
              <button type="button" class="btn btn-sm local-tag">매</button>
              <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
          } else {
            return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
          }
        }
      },
    },
    {
      target: 1,
      render: function (data, type, row) {
        if (data == '입금') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>` + data + `</button>`;
        } else if (data == '출금') {
          return `<button type='button' class='btn btn-sm text-danger border-dnager' disabled>` + data + `</button>`;
        }
      },
    },
    {
      target: 5,
      className: 'dt-body-right fw-semibold',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: 6,
      width: 60,
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
      target: 7,
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
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 2, 3, 4, 5, 7, 8, 9, 10, 11],
      orderable: false,
    },
  ],
  drawCallback: function () {
    initPopover();
  },
});

$('#dashboardAgentBank').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/bank/depowith',
    method: 'POST',
    data: function (d) {
      d.startDate = moment().format('YYYY-MM-DD');
      d.endDate = moment().format('YYYY-MM-DD');
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: '신청일시', className: 'desktop' },
    { data: '신청타입' },
    { data: '회원타입', className: 'desktop' },
    { data: '아이디' },
    { data: '닉네임' },
    // { data: '상위 에이전트' },
    // { data: '신청 시 보유금' },
    { data: '신청금액' },
    // { data: '승인 후 보유금' },
    // { data: '신청IP' },
    { data: '처리현황' },
    { data: '메모' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
    { data: 'IDX' },
  ],
  scrollY: '20vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: [4, 7, 8, 9, 10, 11, 12, 13],
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
              <button type="button" class="btn btn-sm local-tag">매</button>
              <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
          } else {
            return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
          }
        }
      },
    },
    {
      target: 1,
      render: function (data, type, row) {
        if (data == '입금') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>` + data + `</button>`;
        } else if (data == '출금') {
          return `<button type='button' class='btn btn-sm text-danger border-dnager' disabled>` + data + `</button>`;
        }
      },
    },
    {
      target: 5,
      className: 'dt-body-right fw-semibold',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: 6,
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
      target: 7,
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
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      orderable: false,
    },
  ],
  drawCallback: function () {
    initPopover();
  },
});

$('#dashboardWait').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/bank/depowith',
    method: 'POST',
    data: function (d) {
      d.startDate = moment().format('YYYY-MM-DD');
      d.endDate = moment().format('YYYY-MM-DD');
      d.tableType = 'wait';
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: '신청일시', className: 'desktop' },
    { data: '신청타입' },
    { data: '회원타입', className: 'desktop' },
    { data: '아이디' },
    { data: '닉네임', className: 'desktop' },
    // { data: '상위 에이전트' },
    // { data: '신청 시 보유금' },
    { data: '신청금액' },
    // { data: '승인 후 보유금' },
    // { data: '신청IP' },
    { data: '처리현황' },
    { data: '메모' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
    { data: 'IDX' },
  ],
  scrollY: '32vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: [2, 7, 8, 9, 10, 11, 12, 13],
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
              <button type="button" class="btn btn-sm local-tag">매</button>
              <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
          } else {
            return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
          }
        }
      },
    },
    {
      target: 1,
      render: function (data, type, row) {
        if (data == '입금') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>` + data + `</button>`;
        } else if (data == '출금') {
          return `<button type='button' class='btn btn-sm text-danger border-dnager' disabled>` + data + `</button>`;
        }
      },
    },
    {
      target: 5,
      className: 'dt-body-right fw-semibold',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: 6,
      width: 60,
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
      target: 7,
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
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 2, 3, 4, 5, 7, 8, 9, 10, 11],
      orderable: false,
    },
  ],
  drawCallback: function () {
    initPopover();
  },
});

$('#giveTake').DataTable({
  language: korean,
  responsive: true,
  autoWidth: false,
  ajax: {
    url: '/bank/givetake',
    method: 'POST',
    data: function (d) {
      d.startDate = moment().format('YYYY-MM-DD');
      d.endDate = moment().format('YYYY-MM-DD');
      d.tableType = 'wait';
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: '지급일시', className: 'desktop' },
    { data: '타입' },
    { data: '지급매장' },
    { data: '유저타입', className: 'desktop' },
    { data: '아이디' },
    { data: '지급금액' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: 'node_id' },
  ],
  scrollY: '20vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: [6, 7, 8, 9, 10],
      visible: false,
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
              <button type="button" class="btn btn-sm local-tag">매</button>
              <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
          } else {
            return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
          }
        }
      },
    },
    {
      target: 1,
      render: function (data, type, row) {
        if (data == '지급') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>` + data + `</button>`;
        } else if (data == '회수') {
          return `<button type='button' class='btn btn-sm text-danger border-dnager' disabled>` + data + `</button>`;
        }
      },
    },
    {
      target: 5,
      className: 'dt-body-right fw-semibold',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 2, 3, 4, 5, 7, 8, 9, 10],
      orderable: false,
    },
  ],
  drawCallback: function () {
    initPopover();
  },
});

$('#qna').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/board/table',
    method: 'POST',
    data: { type: 'qna' },
    dataSrc: '',
  },
  dom: 'l<"#setMacro.btn btn-sm asset-success float-end">rtip',
  columns: [
    { data: 'IDX' },
    { data: '문의시간', className: 'desktop' },
    { data: '종류', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '타입', className: 'desktop' },
    { data: '제목', responsivePriority: 4 },
    { data: '내용', responsivePriority: 5 },
    { data: '답변' },
    { data: '상태' },
  ],
  scrollY: '26vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: [0, 6, 7], visible: false },
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
      render: function (data, type, row) {
        if (row.타입 == 0) {
          return `<button type='button' class='btn btn-sm id-btn asset-danger'>` + data + `</button>`;
        } else if (row.타입 == 1) {
          return `<button type='button' class='btn btn-sm id-btn asset-warning'>` + data + `</button>`;
        } else if (row.타입 == 2) {
          return `<button type='button' class='btn btn-sm id-btn asset-success'>` + data + `</button>`;
        } else if (row.타입 == 3) {
          return `<button type='button' class='btn btn-sm id-btn asset-primary'>` + data + `</button>`;
        } else if (row.타입 == 4) {
          if (row.가입코드) {
            return `<div class="btn-group" role="group" aria-label="Basic example">
              <button type="button" class="btn btn-sm online-tag">온</button>
              <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
          } else if (row.가입코드 == '') {
            return `<div class="btn-group" role="group" aria-label="Basic example">
              <button type="button" class="btn btn-sm local-tag">매</button>
              <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
          } else {
            return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
          }
        }
      },
    },
    {
      target: 4,
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
      target: 8,
      render: function (data) {
        if (data == '유저문의') {
          return `<button class='btn btn-sm asset-danger questionStateBtn'>${data}</button>`;
        } else if (data == '답변완료') {
          return `<button class='btn btn-sm asset-success questionStateBtn'>${data}</button>`;
        } else if (data == '답변확인') {
          return `<button class='btn btn-sm asset-primary questionStateBtn'>${data}</button>`;
        }
      },
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      orderable: false,
      className: 'dt-head-center dt-body-center',
    },
  ],
  initComplete: function () {
    document.querySelector('#setMacro').innerHTML = `<i class="fas fa-cog pe-2"></i>매크로 설정`;
    document.querySelector('#setMacro').addEventListener('click', () => {
      $('#setMacroModal').modal('show');
    });
  },
});

// #region 문의사항
let questionContent;
let type = document.querySelector('#viewQuestionType');
let title = document.querySelector('#viewQuestionTitle');
let content = document.querySelector('#viewQuestionContent');
let reply = document.querySelector('#viewQuestionAnswer');
let answerBtn = document.querySelector('#anserQuestionBtn');
let modifyBtn = document.querySelector('#modifyQuestionBtn');
let macroBtnGroupdnjs = document.querySelector('#macroBtnGroup');

//? 문의 모달 열기
$('table').on('click', 'tbody tr .questionStateBtn', function () {
  questionContent = $('#qna').DataTable().row($(this).parent('td')).data();

  if (questionContent.종류 == '계좌') {
    type.classList.add('asset-danger');
  } else if (questionContent.종류 == '베팅') {
    type.classList.add('asset-primary');
  } else if (questionContent.종류 == '계정') {
    type.classList.add('asset-success');
  } else if (questionContent.종류 == '기타') {
    type.classList.add('asset-warning');
  }

  if (questionContent.답변 == null) {
    answerBtn.classList.remove('d-none');
    modifyBtn.classList.add('d-none');
  } else {
    let sanitizedAnswer = questionContent.답변.replace(/\\/g, '');
    reply.value = sanitizedAnswer;
    answerBtn.classList.add('d-none');
    modifyBtn.classList.remove('d-none');
  }

  reply.removeAttribute('readonly');
  macroBtnGroup.classList.remove('d-none');
  type.value = questionContent.종류;
  title.value = questionContent.제목;
  content.value = questionContent.내용.replace(/\\/g, '');

  answerBtn.disabled = true;
  modifyBtn.disabled = true;
  $('#viewQuestionModal').modal('show');
});

//? 답변 시 답변 버튼 활성화
$('#viewQuestionAnswer').on('input', () => {
  answerBtn.disabled = false;
  modifyBtn.disabled = false;
  if (reply.value == '') {
    answerBtn.disabled = true;
  }
  if (reply.value == questionContent.답변) {
    modifyBtn.disabled = true;
  }
});

//? 답변 전송
document.querySelector('#anserQuestionBtn').addEventListener('click', (e) => {
  e.preventDefault();
  questionContent.답변 = reply.value;
  console.log(questionContent);

  $.ajax({
    method: 'POST',
    url: '/board/answer',
    data: questionContent,
  })
    .done((result) => {
      console.log(result);
      document.querySelector('#boardConfirm').innerHTML = result;
      $('#viewQuestionModal').modal('hide');
      $('#boardConfirmModal').modal('show');
      $('#qna').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

//? 문의 수정 전송
document.querySelector('#modifyQuestionBtn').addEventListener('click', (e) => {
  e.preventDefault();
  questionContent.답변 = reply.value;
  console.log(questionContent);

  $.ajax({
    method: 'POST',
    url: '/board/modifyanswer',
    data: questionContent,
  })
    .done((result) => {
      console.log(result);
      document.querySelector('#boardConfirm').innerHTML = result;
      $('#viewQuestionModal').modal('hide');
      $('#boardConfirmModal').modal('show');
      $('#qna').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

$('#onlineUsersAgent').DataTable({
  language: korean,
  responsive: {
    details: {
      renderer: function (api, rowIdx, columns) {
        var data = $.map(columns, function (col, i) {
          switch (i) {
            case 5:
              col.title = '카지노 베팅';
              break;
            case 6:
              col.title = '카지노 획득';
              break;
            case 7:
              col.title = '슬롯 베팅';
              break;
            case 8:
              col.title = '슬롯 획득';
              break;
            case 9:
              col.title = '임시 - 카지노 베팅';
              break;
            case 10:
              col.title = '임시 - 카지노 롤링';
              break;
            case 11:
              col.title = '임시 - 슬롯 베팅';
              break;
            case 12:
              col.title = '임시 - 슬롯 롤링';
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
    url: '/agentonline',
    method: 'POST',
    dataSrc: '',
  },
  columns: [
    { data: '레벨', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: '상위 에이전트', className: 'desktop' },
    { data: '보유금', responsivePriority: 1 },
    { data: '카_베팅', className: 'desktop' },
    { data: '카_윈', className: 'desktop' },
    { data: '슬_베팅', className: 'desktop' },
    { data: '슬_윈', className: 'desktop' },
    { data: '카_임시베팅', className: 'desktop' },
    { data: '카_임시롤링', className: 'desktop' },
    { data: '슬_임시베팅', className: 'desktop' },
    { data: '슬_임시롤링', className: 'desktop' },
    { data: null, responsivePriority: 1 },
    { data: null, defaultContent: '', responsivePriority: 1 },
  ],
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[4, 'desc']],
  columnDefs: [
    {
      target: 1,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
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
      target: [5, 6, 7, 8],
      visible: false,
    },
    {
      target: 13,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-danger temp-clear'>초기화</button>`;
      },
    },
    {
      target: 14,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-danger forceLogout' >접속종료</button>`;
      },
    },
    {
      target: [4, 5, 6, 7, 8, 9, 10, 11, 12],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 1, 2, 3, 13],
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
  // drawCallback: function (settings) {
  //   let popoverTimer;

  //   $('[data-bs-toggle="popover"]').on('shown.bs.popover', function () {
  //     let balanceGiveBtn = document.querySelector('.balanceGiveBtn');
  //     let balanceTakeBtn = document.querySelector('.balanceTakeBtn');

  //     if (balanceGiveBtn) {
  //       balanceGiveBtn.addEventListener('click', function () {
  //         openBalanceGiveModal(rowData);
  //       });
  //     }

  //     if (balanceTakeBtn) {
  //       balanceTakeBtn.addEventListener('click', function () {
  //         openBalanceTakeModal(rowData);
  //       });
  //     }

  //     if (popoverTimer) {
  //       clearTimeout(popoverTimer);
  //     }

  //     let $popoverTrigger = $(this); // 현재 팝오버 트리거 요소를 참조
  //     popoverTimer = setTimeout(function () {
  //       $popoverTrigger.popover('hide');
  //     }, 2000);
  //   });

  //   $('[data-bs-toggle="popover"]').on('hidden.bs.popover', function () {
  //     clearTimeout(popoverTimer);
  //   });

  //   initPopover();
  // },
});

$('#notice').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/board/table',
    method: 'POST',
    data: { type: 'notice' },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '작성일자', className: 'desktop' },
    { data: '종류', responsivePriority: 1 },
    { data: '제목', responsivePriority: 2 },
    { data: null, responsivePriority: 4 },
    { data: '내용', className: 'desktop' },
  ],
  scrollY: '18vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: [0, 5], visible: false },
    {
      target: 1,
      width: 80,
      render: function (data) {
        return data.slice(0, 7);
      },
    },
    {
      target: 2,
      render: function (data) {
        if (data == '공지') {
          return `<button class='btn btn-sm btn-outline-dark disabled' style='word-break: keep-all'>${data}</button>`;
        } else if (data == '이벤트') {
          return `<button class='btn btn-sm btn-outline-primary disabled' style='word-break: keep-all'>${data}</button>`;
        } else if (data == '점검') {
          return `<button class='btn btn-sm btn-outline-danger disabled' style='word-break: keep-all'>${data}</button>`;
        }
      },
    },
    {
      target: 4,
      width: 100,
      render: function (data) {
        return `<button class='btn btn-sm asset-primary noticeCheckBtn'>내용확인</button>`;
      },
    },
    {
      target: [0, 1, 2, 3, 4, 5],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 1, 2, 3, 4, 5],
      orderable: false,
    },
  ],
});

let noticeContent;

//? 글 확인 및 수정
$('table').on('click', 'tbody tr .noticeCheckBtn', function () {
  noticeContent = $('#notice').DataTable().row($(this).parent('td')).data();

  let type = document.querySelector('#readNoticeType');
  let title = document.querySelector('#readNoticeTitle');
  let content = document.querySelector('#readNoticeContent');

  type.value = noticeContent.종류;
  title.value = noticeContent.제목;
  content.value = noticeContent.내용;

  $('#readNoticeModal').modal('show');
});

// $('#agentQna').DataTable({
//   autoWidth: false,
//   language: korean,
//   responsive: true,
//   ajax: {
//     url: '/board/table',
//     method: 'POST',
//     data: { type: 'agentQna' },
//     dataSrc: '',
//   },
//   dom: 'tip',
//   columns: [
//     { data: 'IDX' },
//     { data: '문의일시' },
//     { data: '종류' },
//     { data: '제목' },
//     { data: '내용' },
//     { data: '상태' },
//     { data: '답변' },
//     { data: '답변일시' },
//   ],
//   pageLength: 10,
//   lengthMenu: [10, 50, 100],
//   order: [[1, 'desc']],
//   columnDefs: [
//     { target: [0, 4, 6, 7], visible: false },
//     {
//       target: 2,
//       render: function (data) {
//         if (data === '베팅') {
//           return `<button class='btn btn-sm btn-outline-primary questionType' disabled>베팅</button>`;
//         } else if (data === '계좌') {
//           return `<button class='btn btn-sm btn-outline-danger questionType' disabled>계좌</button>`;
//         } else if (data === '계정') {
//           return `<button class='btn btn-sm btn-outline-success questionType' disabled>계정</button>`;
//         } else if (data === '기타') {
//           return `<button class='btn btn-sm btn-outline-warning questionType' disabled>기타</button>`;
//         }
//       },
//     },
//     {
//       target: 5,
//       render: function (data) {
//         if (data == '유저문의') {
//           return `<button class='btn btn-sm btn-danger questionState' disabled>답변대기</button>`;
//         } else if (data == '답변완료') {
//           return `<button class='btn btn-sm btn-primary questionState' disabled>답변완료</button>`;
//         } else if (data == '답변확인') {
//           return `<button class='btn btn-sm btn-primary questionState' disabled>답변완료</button>`;
//         }
//       },
//     },
//     {
//       target: [0, 1, 2, 3, 4, 5, 6, 7],
//       className: 'dt-head-center dt-body-center',
//     },
//     {
//       target: [2, 3, 4, 5],
//       orderable: false,
//     },
//   ],
//   drawCallback: function (settings) {
//     $('#agentQuestionModal tr').click(function () {
//       let selectedQuestion = $('table').DataTable().row($(this)).data();

//       switch (selectedQuestion.종류) {
//         case '계좌':
//           document.querySelector('#agentViewQuestionType').classList.add('asset-danger');
//           break;
//         case '베팅':
//           document.querySelector('#agentViewQuestionType').classList.add('asset-primary');
//           break;
//         case '계정':
//           document.querySelector('#agentViewQuestionType').classList.add('asset-success');
//           break;
//         case '기타':
//           document.querySelector('#agentViewQuestionType').classList.add('asset-warning');
//           break;
//       }

//       if (selectedQuestion.상태 == '유저문의') {
//         document.querySelector('#agentViewQuestionLabel').innerHTML = `관리자가 확인 중입니다. 조금만 기다려주세요.`;
//       } else {
//         document.querySelector('#agentViewQuestionLabel').innerHTML = ` 답변 내용`;
//       }

//       document.querySelector('#agentViewQuestionType').value = selectedQuestion.종류;
//       document.querySelector('#agentViewQuestionTitle').value = selectedQuestion.제목;
//       document.querySelector('#agentViewQuestionContent').value = selectedQuestion.내용;
//       document.querySelector('#agentViewQuestionAnswer').value = selectedQuestion.답변;

//       $('#agentQuestionModal').modal('hide');
//       $('#agentViewQuestionModal').modal('show');

//       if (selectedQuestion.상태 == '답변완료') {
//         changeQuestionState(selectedQuestion);
//       }

//       console.log(selectedQuestion);
//     });
//   },
// });

// // #region 에이전트 문의사항
// //? 문의하기
// if (document.querySelector('#agentRequestQuestionForm')) {
//   document.querySelector('#agentRequestQuestionForm').addEventListener('submit', (e) => {
//     e.preventDefault();
//     let question_data = $('#agentRequestQuestionForm').serialize();

//     $.ajax({
//       method: 'POST',
//       url: '/board/agentquestion',
//       data: question_data,
//     })
//       .done((result) => {
//         console.log(result.message);

//         document.querySelector('#confirm-text').innerHTML = `<h3>${result.message}</h3>`;
//         $('#agentRequestQuestionModal').modal('hide');
//         $('#agentConfirmModal').modal('show');

//         socket.emit('to_admin', { userId: result.id, type: 'requestQuestion' });
//       })
//       .fail(function (err) {
//         console.log('전송오류');
//         console.log(err);
//       });
//   });
// }

// //? 문의확인 닫기
// $('#agentViewQuestionModal').on('hide.bs.modal', function () {
//   let viewQuestionType = document.querySelector('#viewQuestionType');
//   let classList = viewQuestionType.classList;

//   // asset-로 시작하는 클래스를 모두 삭제합니다.
//   for (var i = 0; i < classList.length; i++) {
//     if (classList[i].startsWith('asset-')) {
//       classList.remove(classList[i]);
//       i--; // 클래스가 삭제될 때 인덱스를 조정합니다.
//     }
//   }
//   $('#agentQuestionModal').modal('show');
// });

// //? 답변완료 > 유저확인 상태변경
// function changeQuestionState(params) {
//   console.log('changeQuestionState', params);

//   $.ajax({
//     method: 'POST',
//     url: '/board/questionstate',
//     data: params,
//   })
//     .done((result) => {
//       agentCheckNoti();
//     })
//     .fail(function (err) {
//       console.log('전송오류');
//       console.log(err);
//     });
// }
// // #endregion

// $('#agentMessage').DataTable({
//   language: korean,
//   responsive: true,
//   ajax: {
//     url: '/board/table',
//     method: 'POST',
//     data: { type: 'agentMessage' },
//     dataSrc: '',
//   },
//   dom: 'tip',
//   columns: [{ data: 'IDX' }, { data: '받은일시' }, { data: '종류' }, { data: '제목' }, { data: '내용' }, { data: '읽음여부' }],
//   pageLength: 10,
//   lengthMenu: [10, 50, 100],
//   order: [[1, 'desc']],
//   columnDefs: [
//     { target: [0, 4], visible: false },
//     {
//       target: 2,
//       render: function (data) {
//         if (data == '긴급') {
//           return `<button class='btn btn-sm btn-outline-danger' disabled>${data}</button>`;
//         } else if (data == '일반') {
//           return `<button class='btn btn-sm btn-outline-primary' disabled>${data}</button>`;
//         } else if (data == '개별') {
//           return `<button class='btn btn-sm btn-outline-success' disabled>${data}</button>`;
//         }
//       },
//     },
//     {
//       target: 5,
//       render: function (data) {
//         if (data == 0) {
//           return `<button class='btn btn-sm btn-danger questionState' disabled>읽지않음</button>`;
//         } else if (data == 1) {
//           return `<button class='btn btn-sm btn-primary questionState' disabled>읽음</button>`;
//         }
//       },
//     },
//     {
//       target: [0, 1, 2, 3, 4, 5],
//       className: 'dt-head-center dt-body-center',
//     },
//     {
//       target: [2, 3, 4, 5],
//       orderable: false,
//     },
//   ],
//   drawCallback: function (settings) {
//     $('#agentMessageModal tr').click(function () {
//       let selectedMessage = $('table').DataTable().row($(this)).data();

//       switch (selectedMessage.종류) {
//         case '긴급':
//           document.querySelector('#viewMessageType').classList.add('asset-danger');
//           break;
//         case '일반':
//           document.querySelector('#viewMessageType').classList.add('asset-primary');
//           break;
//         case '개별':
//           document.querySelector('#viewMessageType').classList.add('asset-success');
//           break;
//       }

//       document.querySelector('#viewMessageType').value = selectedMessage.종류;
//       document.querySelector('#viewMessageTitle').value = selectedMessage.제목;
//       document.querySelector('#viewMessageContent').value = selectedMessage.내용;

//       $('#agentMessageModal').modal('hide');
//       $('#agentViewMessageModal').modal('show');

//       if (selectedMessage.읽음여부 == 0) {
//         changeMessageState(selectedMessage);
//       }
//     });
//   },
// });

// // #region 에이전트 메세지
// //? 개별 메세지 읽음여부 변경
// function changeMessageState(params) {
//   $.ajax({
//     method: 'POST',
//     url: '/board/messagestate',
//     data: params,
//   })
//     .done((result) => {
//       console.log(result);
//       $('#agentMessage').DataTable().ajax.reload(null, false);
//     })
//     .fail(function (err) {
//       console.log('전송오류');
//       console.log(err);
//     });
// }

// //? 메세지 확인 및 모달 열기
// let alertText = document.querySelector('#alert-text');
// let readAllBtn = document.querySelector('#readAllMessageBtn');
// let deleteAllBtn = document.querySelector('#deleteAllMessageBtn');
// let idx_list;
// let idx_array;

// //? 모든 메세지 모달 열기
// if (document.querySelector('#readAllModalOpen')) {
//   document.querySelector('#readAllModalOpen').addEventListener('click', () => {
//     idx_list = $('#agentMessage').DataTable().rows().data().pluck('IDX');
//     idx_array = Array.from(idx_list);

//     $.ajax({
//       method: 'POST',
//       url: '/board/readcheck',
//       data: { idx: idx_array },
//     })
//       .done((result) => {
//         if (result) {
//           alertText.innerHTML = `<h4>모든 메세지를 읽음 처리하시겠습니까?</h4>
//         <h5 class='pt-1'>확인하지 않은 메세지로 인해<br> 불이익이 발생할 수 있습니다</h5>`;
//           readAllBtn.classList.remove('d-none');
//         } else if (!result && idx_array.length > 0) {
//           alertText.innerHTML = `<h4>모든 메세지가 이미 읽은 상태입니다</h4><h5 class='mt-3 text-danger fw-bold'>모든 메세지를 삭제하시겠습니까?</h5>
//         <h5 class='pt-1 text-danger fw-bold'>삭제된 메세지는 복구할 수 없습니다</h5>`;
//           deleteAllBtn.classList.remove('d-none');
//         } else {
//           alertText.innerHTML = `<h4>받은 메세지가 없습니다</h4>`;
//         }
//         $('#agentAlertModal').modal('show');
//       })
//       .fail(function (err) {
//         console.log('전송오류');
//         console.log(err);
//       });
//   });
// }

// //? 모든 메세지 읽음 처리
// readAllBtn.addEventListener('click', () => {
//   readAllMessage(idx_array);
//   $('#agentAlertModal').modal('hide');
// });

// function readAllMessage(params) {
//   console.log(params);
//   $.ajax({
//     method: 'POST',
//     url: '/board/readall',
//     data: { idx: params },
//   })
//     .done((result) => {
//       $('#agentMessage').DataTable().ajax.reload(null, false);
//       checkNoti();
//     })
//     .fail(function (err) {
//       console.log('전송오류');
//       console.log(err);
//     });
// }

// //? 전체 삭제 모달 열기
// if (document.querySelector('#deleteAllModalOpen')) {
//   document.querySelector('#deleteAllModalOpen').addEventListener('click', () => {
//     idx_list = $('#agentMessage').DataTable().rows().data().pluck('IDX');
//     idx_array = Array.from(idx_list);

//     $.ajax({
//       method: 'POST',
//       url: '/board/readcheck',
//       data: { idx: idx_array },
//     })
//       .done((result) => {
//         if (result) {
//           alertText.innerHTML = `<h4>아직 확인하지 않은 메세지가 있습니다</h4>
//         <h4 class='pt-1'>메세지를 확인해 주세요</h4>`;
//           $('#alertModal').modal('show');
//         } else if (!result && idx_array.length > 0) {
//           alertText.innerHTML = `<h4 class='fw-bold text-danger'>모든 메세지를 삭제하시겠습니까?</h4>
//         <h5 class='pt-1 fw-bold text-danger'>삭제된 메세지는 복구할 수 없습니다</h5>`;
//           deleteAllBtn.classList.remove('d-none');
//           $('#agentAlertModal').modal('show');
//         } else {
//           alertText.innerHTML = `<h3>받은 메세지가 없습니다</h3>`;
//         }
//       })
//       .fail(function (err) {
//         console.log('전송오류');
//         console.log(err);
//       });
//   });
// }

// //? 모든 메세지 삭제 처리
// deleteAllBtn.addEventListener('click', () => {
//   deleteAllMessage(idx_array);
//   $('#agentAlertModal').modal('hide');
// });

// function deleteAllMessage(params) {
//   console.log(params);
//   $.ajax({
//     method: 'POST',
//     url: '/board/deleteall',
//     data: { idx: params },
//   })
//     .done((result) => {
//       $('#agentMessage').DataTable().ajax.reload(null, false);
//       console.log(result);
//       checkNoti();
//     })
//     .fail(function (err) {
//       console.log('전송오류');
//       console.log(err);
//     });
// }

// // #endregion
