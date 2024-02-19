$('#eventLotto').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/event/table',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      d.type = 'lotto';
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '회차' },
    { data: '참여시간' },
    { data: '아이디' },
    { data: '닉네임' },
    { data: '보유금' },
    { data: '선택번호' },
    { data: '당첨번호' },
    { data: '당첨갯수' },
    { data: null, defaultContent: '' },
    { data: '당첨금액' },
    { data: '지급여부' },
  ],
  pageLength: 100,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[0, 'desc']],
  createdRow: function (row, data, dataIndex) {
    if (data.지급여부 == 2) {
      $(row).addClass('bg-mistyred');
    }
  },
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: 3,
      render: function (data, type, row) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
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
      target: 6,
      render: function (data) {
        let numbers = data.slice(1, -1);
        return numbers;
      },
    },
    {
      target: 7,
      render: function (data) {
        if (data == null) {
          return '';
        } else {
          let numbers = data.slice(1, -1);
          return numbers;
        }
      },
    },
    {
      target: 9,
      render: function (data, type, row) {
        if (row.당첨갯수 == 2) {
          return `<button type='button' class='btn btn-sm btn-warning' disabled>3등</button>`;
        } else if (row.당첨갯수 == 3) {
          return `<button type='button' class='btn btn-sm btn-primary' disabled>2등</button>`;
        } else if (row.당첨갯수 >= 4) {
          return `<button type='button' class='btn btn-sm btn-danger' disabled>1등</button>`;
        }
      },
    },
    {
      target: 10,
      render: function (data, type, row) {
        if (data !== null && data !== undefined) {
          return data.toLocaleString('ko-KR');
        } else {
          return '';
        }
      },
    },
    {
      target: 11,
      render: function (data) {
        switch (data) {
          case 0:
            return `<button type='button' class='btn btn-sm btn-outline-dark' disabled>미추첨</button>`;
          case 1:
            return `<button type='button' class='btn btn-sm btn-secondary' disabled>낙첨</button>`;
          case 2:
            return `<button type='button' class='btn btn-sm btn-danger' disabled>당첨 (지급 전)</button>`;
          case 3:
            return `<button type='button' class='btn btn-sm btn-success' disabled>당첨 (지급 완료)</button>`;
        }
      },
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
