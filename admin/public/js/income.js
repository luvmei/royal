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
  collapseSideMenu();
  initPopover();

  if (document.querySelector('#incomeAgentDepoWith') || document.querySelector('#incomeAgentBetWin') || document.querySelector('#incomeAgentDeath')) {
    $('#incomeAgentDepoWith, #incomeAgentBetWin, #incomeAgentDeath').simpleTreeTable({
      expander: '#expander',
      collapser: '#collapser',
      store: 'local',
      storeKey: 'KEY',
    });

    document.querySelector('#expander').innerHTML = '모두 열기';
    document.querySelector('#collapser').innerHTML = '모두 닫기';
  }

  if (document.querySelector('.dateInput')) {
    document.querySelector('.dateInput').innerHTML =
      '<input type="text" class="text-center w-100" style="padding: 3px 0" id="dateSelector" name="date" value=""/>';
  }

  let expander = document.getElementById('expander');
  let collapser = document.getElementById('collapser');

  if (expander) {
    expander.addEventListener('click', function () {
      incomeAgentBetWin.columns.adjust().draw();
    });
  }

  if (collapser) {
    collapser.addEventListener('click', function () {
      incomeAgentBetWin.columns.adjust().draw();
    });
  }
});
let selectedIncome;
let node_id = '';

$('#incomeHeadquarters').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/income/headquarters',
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
    { data: '정산일자', responsivePriority: 1 },
    { data: '입금', className: 'desktop' },
    { data: '출금', className: 'desktop' },
    { data: '입금-출금', responsivePriority: 2 },
    { data: '베팅', className: 'desktop' },
    { data: '획득', className: 'desktop' },
    { data: '베팅-획득', responsivePriority: 3 },
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
      target: [4, 7],
      createdCell: function (td, cellData, rowData, row, col) {
        if (cellData < 0) {
          $(td).addClass('text-danger');
        }
      },
      className: 'fw-semibold',
    },
    {
      target: [2, 3, 4, 5, 6, 7],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 1],
      orderable: false,
    },
  ],
  footerCallback: function (row, data, start, end, display) {
    var api = this.api();

    // Remove the formatting to get integer data for summation
    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    // Total over all pages
    let sumDeposit = api
      .column(2)
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    let sumWithdraw = api
      .column(3)
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    let sumBetting = api
      .column(5)
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    // Total over this page
    let sumWin = api
      .column(6)
      .data()
      .reduce(function (a, b) {
        return intVal(a) + intVal(b);
      }, 0);

    // Update footer
    $(api.column(2).footer()).html(`${sumDeposit.toLocaleString('ko-KR')}`);
    $(api.column(3).footer()).html(`${sumWithdraw.toLocaleString('ko-KR')}`);
    $(api.column(4).footer()).html(`${(sumDeposit - sumWithdraw).toLocaleString('ko-KR')}`);
    $(api.column(5).footer()).html(`${sumBetting.toLocaleString('ko-KR')}`);
    $(api.column(6).footer()).html(`${sumWin.toLocaleString('ko-KR')}`);
    $(api.column(7).footer()).html(`${(sumBetting - sumWin).toLocaleString('ko-KR')}`);

    // negative value red color
    if (sumDeposit - sumWithdraw < 0) {
      $(api.column(4).footer()).addClass('text-danger');
    }
    if (sumBetting - sumWin < 0) {
      $(api.column(7).footer()).addClass('text-danger');
    }
  },
  drawCallback: function () {
    initPopover();
  },
});

// #region 에이전트 입금 - 출금 정산
let incomeAgentDepoWith = $('#incomeAgentDepoWith').DataTable({
  language: korean,
  autowidth: false,
  scrollY: '63vh',
  scrollCollapse: true,
  responsive: {
    details: {
      type: 'column',
      target: 0,
      renderer: function (api, rowIdx, columns) {
        var data = $.map(columns, function (col, i) {
          switch (i) {
            case 10:
              col.title = '카지노 롤링요율';
              break;
            case 11:
              col.title = '슬롯 롤링요율';
              break;
            case 12:
              col.title = '루징용율';
              break;
            case 13:
              col.title = '베팅마진요율';
              break;
            case 14:
              col.title = '전일 보유금';
              break;
            case 15:
              col.title = '당일 보유금';
              break;
            case 16:
              col.title = '전일 포인트';
              break;
            case 17:
              col.title = '당일 포인트';
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
    url: '/income/agent',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      d.type = 'depoWith';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth"><"#expander.btn float-start"><"#collapser.btn float-start">frtip',
  columns: [
    { data: null, defaultContent: '' },
    { data: 'IDX' },
    { data: '정산일자' },
    { data: 'node_id' },
    { data: 'node_pid' },
    { data: '타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', className: 'desktop' },
    { data: '카지노 롤링요율', className: 'desktop' },
    { data: '슬롯 롤링요율', className: 'desktop' },
    { data: '루징요율', className: 'desktop' },
    { data: '베팅마진요율', className: 'desktop' },
    { data: '입금', className: 'desktop' },
    { data: '출금', className: 'desktop' },
    { data: '입금-출금', className: 'desktop' },
    { data: '전일보유금', className: 'desktop' },
    { data: '보유금', className: 'desktop' },
    { data: '전일포인트', className: 'desktop' },
    { data: '포인트', className: 'desktop' },
    { data: '루징', className: 'desktop' },
    { data: '총정산금', className: 'desktop' },
    { data: '실정산금', responsivePriority: 3 },
    { data: '베팅', className: 'desktop' },
    { data: '획득', className: 'desktop' },
    { data: '베팅-획득', className: 'desktop' },
    { data: '카지노롤링', className: 'desktop' },
    { data: '슬롯롤링', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
  ],
  paging: false,
  order: [[3, 'asc']],
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
    } else {
      $(row).addClass('block-bg');
      $(row).css('display', 'none');
    }

    if (clientType == 9) {
      if (data.타입 == 0) {
        $(row).addClass('simple-tree-table-root');
      } else {
        $(row).addClass('simple-tree-table-closed');
        $(row).css('display', 'none');
      }
    } else {
      if (data.node_id == clientNode) {
        $(row).addClass('simple-tree-table-root');
      } else {
        $(row).addClass('simple-tree-table-closed');
        $(row).css('display', 'none');
      }
    }

    // if (clientType == 9) {
    //   $(row).addClass('simple-tree-table-root');
    // } else {
    //   $(row).addClass('simple-tree-table-closed');
    //   $(row).css('display', 'none');
    // }

    $(row).attr('data-node-id', data.node_id);
    $(row).attr('data-node-pid', data.node_pid);
  },
  columnDefs: [
    {
      target: 0,
      className: 'dtr-control',
    },
    {
      target: [1, 2, 3, 4],
      visible: false,
      searchable: false,
    },
    { target: [27, 28, 29, 30], visible: false },
    {
      target: 5,
      width: 110,
      className: 'dt-head-center',
      render: function (data) {
        if (data == '0') {
          return `<i class="fa-solid fa-square-plus fa-xl text-danger simple-tree-table-handler" style='cursor:pointer'></i>  ` + '플래티넘';
        } else if (data == '1') {
          return `<i class="fa-solid fa-square-plus fa-xl text-warning simple-tree-table-handler" style='cursor:pointer; margin-left: 10px'></i>  ` + '골드';
        } else if (data == '2') {
          return `<i class="fa-solid fa-square-plus fa-xl text-success simple-tree-table-handler" style='cursor:pointer; margin-left: 20px'></i>  ` + '실버';
        } else if (data == '3') {
          return `<i class="fa-solid fa-square fa-xl text-primary simple-tree-table-handler" style='margin-left: 30px'></i>  ` + '브론즈';
        }
      },
    },
    {
      target: 6,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    // {
    //   target: [8, 12, 15, 17, 19, 22, 25],
    //   className: 'left-border',
    // },
    {
      target: 21,
      render: function (data, type, row) {
        if (row.타입 == 3 || row.루징 == 0) {
          return $.fn.dataTable.render.number(',').display(data);
        } else {
          return (
            `<button type='button' class='btn btn-sm btn-outline-dark under-income-depowith fw-bold'>` +
            $.fn.dataTable.render.number(',').display(data) +
            `</button>`
          );
        }
      },
      className: 'fw-bold',
    },
    { target: 19, className: 'fw-bold' },
    {
      target: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    { target: 5, className: 'dt-head-center' },
    {
      target: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      orderable: false,
    },
  ],
  footerCallback: function (row, data, start, end, display) {
    var api = this.api();

    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    var updateFooter = function () {
      let sumDeposit = api
        .column(12, { search: 'applied' })
        .data()
        .reduce(function (a, b) {
          return intVal(a) + intVal(b);
        }, 0);

      let sumWithdraw = api
        .column(13, { search: 'applied' })
        .data()
        .reduce(function (a, b) {
          return intVal(a) + intVal(b);
        }, 0);

      let sumLose = api
        .column(14, { search: 'applied' })
        .data()
        .reduce(function (a, b) {
          return intVal(a) + intVal(b);
        }, 0);

      let sumIncome = api
        .column(20, { search: 'applied' })
        .data()
        .reduce(function (a, b) {
          return intVal(a) + intVal(b);
        }, 0);

      let sumRealIncome = api
        .column(21, { search: 'applied' })
        .data()
        .reduce(function (a, b) {
          return intVal(a) + intVal(b);
        }, 0);

      let sumCasinoRoll = api
        .column(25, { search: 'applied' })
        .data()
        .reduce(function (a, b) {
          return intVal(a) + intVal(b);
        }, 0);

      let sumSlotRoll = api
        .column(26, { search: 'applied' })
        .data()
        .reduce(function (a, b) {
          return intVal(a) + intVal(b);
        }, 0);

      $(api.column(12).footer()).html(`${sumDeposit.toLocaleString('ko-KR')}`);
      $(api.column(13).footer()).html(`${sumWithdraw.toLocaleString('ko-KR')}`);
      $(api.column(14).footer()).html(`${(sumDeposit - sumWithdraw).toLocaleString('ko-KR')}`);
      $(api.column(19).footer()).html(`${sumLose.toLocaleString('ko-KR')}`);
      $(api.column(20).footer()).html(`${sumIncome.toLocaleString('ko-KR')}`);
      $(api.column(21).footer()).html(`${sumRealIncome.toLocaleString('ko-KR')}`);
      $(api.column(25).footer()).html(`${sumCasinoRoll.toLocaleString('ko-KR')}`);
      $(api.column(26).footer()).html(`${sumSlotRoll.toLocaleString('ko-KR')}`);
    };

    api.on('draw', updateFooter);
  },
});

let incomeDepoWithDetail = $('#incomeDepoWithDetail').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/income/detail',
    method: 'POST',
    data: function (d) {
      d.type = 'depowith';
      d.node_id = node_id;
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '정산일자' },
    { data: 'node_id' },
    { data: 'node_pid' },
    { data: '타입' },
    { data: 'user_id' },
    { data: '아이디' },
    { data: '닉네임' },
    { data: '입금' },
    { data: '출금' },
    { data: '입금-출금' },
    { data: '전일보유금' },
    { data: '보유금' },
    { data: '전일포인트' },
    { data: '포인트' },
    { data: '루징' },
    { data: '상위루징요율' },
    { data: '루징요율' },
    { data: '적용루징요율' },
    { data: '상위정산금' },
  ],
  dom: 'frtip',
  order: [[2, 'asc']],
  createdRow: function (row, data, dataIndex) {
    if (data.상태 != '차단') {
      if (data.타입 == 0) {
        $(row).addClass('platinum-bg');
      } else if (data.타입 == 1) {
        $(row).addClass('gold-bg');
      } else if (data.타입 == 2) {
        $(row).addClass('silver-bg');
      } else if (data.타입 == 3) {
        $(row).addClass('bronze-bg');
      }
    }
  },
  columnDefs: [
    { target: 0, visible: false, searchable: false },
    {
      target: [1, 2, 3, 5],
      visible: false,
    },
    {
      target: 1,
      render: function (data) {
        return moment(data).format('YYYY-MM-DD');
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
        }
      },
    },
    {
      target: 6,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: [15, 18, 19],
      createdCell: function (td, cellData, rowData, row, col) {
        if (cellData < 0) {
          $(td).addClass('text-danger');
        }
      },
      className: 'fw-semibold',
    },
    {
      target: [8, 9, 10, 11, 12, 13, 14, 15, 19],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },

    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7],
      orderable: false,
    },
  ],
  drawCallback: function () {
    $('table').on('click', 'tbody tr .under-income-depowith', function () {
      selectedIncome = $('table').DataTable().row($(this).parent('td')).data();
      if (selectedIncome.타입 != 3) {
        node_id = selectedIncome.node_id;
        incomeDepoWithDetail.clear().ajax.reload(function (d) {
          d.node_id = node_id;
          d.startDate = startDate;
          d.endDate = endDate;
        });
        $('#incomeDepoWithDetailModal').modal('show');
      }
    });
  },
});
// #endregion

// #region 에이전트 베팅 - 획득 정산
let selectedValues = {};

let incomeAgentBetWin = $('#incomeAgentBetWin').DataTable({
  language: korean,
  scrollY: '63vh',
  scrollCollapse: true,
  autowidth: true,
  responsive: {
    details: {
      type: 'column',
      target: 0,
      renderer: function (api, rowIdx, columns) {
        var data = $.map(columns, function (col, i) {
          switch (i) {
            case 9:
              col.title = '카지노 롤링요율';
              break;
            case 10:
              col.title = '슬롯 롤링요율';
              break;
            case 11:
              col.title = '루징요율';
              break;
            case 12:
              col.title = '베팅 마진요율';
              break;
            case 13:
              col.title = '슬롯 마진요율';
              break;
            case 14:
              col.title = '카지노 베팅';
              break;
            case 15:
              col.title = '카지노 획득';
              break;
            case 16:
              col.title = '카지노 윈루즈';
              break;
            case 17:
              col.title = '슬롯 베팅';
              break;
            case 18:
              col.title = '슬롯 획득';
              break;
            case 19:
              col.title = '슬롯 윈루즈';
              break;
            case 20:
              col.title = '카지노 롤링';
              break;
            case 21:
              col.title = '슬롯 롤링';
              break;
            case 22:
              col.title = '루징';
              break;
            case 23:
              col.title = '총 정산금';
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
    url: '/income/agent',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      d.type = 'betwinAcc';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth"><"#expander.btn float-start"><"#collapser.btn float-start">Bfrtip',
  buttons: [
    {
      extend: 'excel',
      exportOptions: {
        columns: [':visible', '3', '4'],
      },
      text: '엑셀 다운로드',
    },
  ],
  columns: [
    { data: null, defaultContent: '', className: 'desktop' },
    { data: 'IDX', className: 'desktop' },
    { data: '정산일자', className: 'desktop' },
    { data: 'node_id', className: 'desktop' },
    { data: 'node_pid', className: 'desktop' },
    { data: '타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', responsivePriority: 3 },
    { data: '보유금', className: 'desktop' },
    { data: '포인트', className: 'desktop' },
    { data: '카지노 롤링요율', className: 'desktop' },

    { data: '슬롯 롤링요율', className: 'desktop' },
    { data: '루징요율', className: 'desktop' },
    { data: '베팅마진요율', className: 'desktop' },
    { data: '롤링마진요율', className: 'desktop' },
    { data: '카지노베팅', className: 'desktop' },
    { data: '카지노획득', className: 'desktop' },
    { data: '카지노윈루즈', className: 'desktop' },
    { data: '슬롯베팅', className: 'desktop' },
    { data: '슬롯획득', className: 'desktop' },
    { data: '슬롯윈루즈', className: 'desktop' },

    { data: '카지노롤링', className: 'desktop' },
    { data: '슬롯롤링', className: 'desktop' },
    { data: '루징', className: 'desktop' },
    { data: '총정산금', className: 'desktop' },
    { data: '하부합산루징금', responsivePriority: 4 },
    { data: null, defaultContent: '', className: 'desktop' },
    { data: '최종정산금', responsivePriority: 5 },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
  ],
  paging: false,
  order: [[3, 'asc']],
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
    } else {
      $(row).addClass('block-bg');
      $(row).css('display', 'none');
    }

    if (clientType == 9) {
      if (data.타입 == 0) {
        $(row).addClass('simple-tree-table-root');
      } else {
        $(row).addClass('simple-tree-table-closed');
        $(row).css('display', 'none');
      }
    } else {
      if (data.node_id == clientNode) {
        $(row).addClass('simple-tree-table-root');
      } else {
        $(row).addClass('simple-tree-table-closed');
        $(row).css('display', 'none');
      }
    }
    // if (clientType == 9) {
    //   $(row).addClass('simple-tree-table-root');
    // } else {
    //   $(row).addClass('simple-tree-table-closed');
    //   $(row).css('display', 'none');
    // }

    $(row).attr('data-node-id', data.node_id);
    $(row).attr('data-node-pid', data.node_pid);

    if (selectedValues[data.IDX]) {
      // IDX는 행을 식별할 수 있는 고유한 값
      $(row).find('select').val(selectedValues[data.IDX]);
    }
  },
  columnDefs: [
    {
      target: 0,
      className: 'dtr-control',
    },
    {
      target: [1, 2, 3, 4, 13, 14, 23, 24, 25],
      visible: false,
      searchable: false,
    },
    { target: [27, 28, 29, 30, 31], visible: false },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
      orderable: false,
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      className: 'dt-body-right',
    },
    {
      target: 5,
      width: 110,
      className: 'dt-head-center',
      render: function (data) {
        if (data == '0') {
          return `<i class="fa-solid fa-square-plus fa-xl text-danger simple-tree-table-handler" style='cursor:pointer'></i>  ` + '플래티넘';
        } else if (data == '1') {
          return `<i class="fa-solid fa-square-plus fa-xl text-warning simple-tree-table-handler" style='cursor:pointer; margin-left: 10px'></i>  ` + '골드';
        } else if (data == '2') {
          return `<i class="fa-solid fa-square-plus fa-xl text-success simple-tree-table-handler" style='cursor:pointer; margin-left: 20px'></i>  ` + '실버';
        } else if (data == '3') {
          return `<i class="fa-solid fa-square fa-xl text-primary simple-tree-table-handler" style='margin-left: 30px'></i>  ` + '브론즈';
        }
      },
    },
    {
      target: 6,
      width: 90,
      render: function (data) {
        return `<div>
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>
        <button type="button" class="btn btn-sm copy-btn" data-copy="${data}">
          <i class="bi bi-copy"></i>
        </button>
      </div>`;
      },
    },
    { target: 7, width: 90 },
    {
      target: [8, 9],
      render: function (data) {
        return data.toLocaleString('ko-KR');
      },
    },
    {
      target: 15,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.카지노마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진베팅).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 16,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.카지노마진획득).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진획득).toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 17,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (data < 0) {
          return `<div class="text-danger">${data.toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${data.toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 18,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.슬롯마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진베팅).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 19,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.슬롯마진획득).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진획득).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 20,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (data < 0) {
          return `<div class="text-danger">${data.toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${data.toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 21,
      className: 'fw-semibold',
      width: 250,
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          if (row.타입 == 3) {
            return `
            <div class="row text-end justify-content-between">
              <div class='col-4'>매장</div>
              <div class='col-4'>유저</div>
              <div class='col-4'>합</div>
              <div class="col-4 fw-light">
                ${data.toLocaleString('ko-KR')}
              </div>
              <div class="col-4 fw-light">
                ${Number(row.유저카지노롤링).toLocaleString('ko-KR')}
              </div>
              <div class="col-4 fw-light">
                ${(Number(row.유저카지노롤링) + data).toLocaleString('ko-KR')}
              </div>
              <div class="col-4 text-primary">
                ${Number(row.카지노마진롤링).toLocaleString('ko-KR')}
              </div>
              <div class="col-4 text-primary">
                ${Number(row.유저카지노마진롤링).toLocaleString('ko-KR')}
              </div>
              <div class="col-4 text-primary">
                ${(Number(row.카지노마진롤링) + Number(row.유저카지노마진롤링)).toLocaleString('ko-KR')}
              </div>
          </div>`;
          } else {
            return `
            <div class="fw-light">
            ${data.toLocaleString('ko-KR')}
            </div>
            <div class="text-primary">
            ${Number(row.카지노마진롤링).toLocaleString('ko-KR')}
            </div>`;
          }
        } else {
          return `${Number(row.카지노마진롤링).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 22,
      className: 'fw-semibold',
      width: 250,
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          if (row.타입 == 3) {
            return `
            <div class="row text-end justify-content-around">
              <div class='col-4'>매장</div>
              <div class='col-4'>유저</div>
              <div class='col-4'>합</div>
              <div class="col-4 fw-light">
                ${data.toLocaleString('ko-KR')}
              </div>
              <div class="col-4 fw-light">
                ${Number(row.유저슬롯롤링).toLocaleString('ko-KR')}
                </div>
                <div class="col-4 fw-light">
                ${(Number(row.유저슬롯롤링) + data).toLocaleString('ko-KR')}
                </div>
                <div class="col-4 text-primary">
                ${Number(row.슬롯마진롤링).toLocaleString('ko-KR')}
                </div>
                <div class="col-4 text-primary">
                ${Number(row.유저슬롯마진롤링).toLocaleString('ko-KR')}
                </div>
                <div class="col-4 text-primary">
                ${(Number(row.슬롯마진롤링) + Number(row.유저슬롯마진롤링)).toLocaleString('ko-KR')}
                </div>
                </div>`;
          } else {
            return `
            <div class="fw-light">
            ${data.toLocaleString('ko-KR')}
            </div>
            <div class="text-primary">
            ${Number(row.슬롯마진롤링).toLocaleString('ko-KR')}
            </div>`;
          }
        } else {
          return `${Number(row.슬롯마진롤링).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: [23, 24],
      className: 'fw-semibold',
      render: function (data, type, row) {
        if (data < 0) {
          return `<div class="text-danger">${Number(data).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(data).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 25,
      width: 120,
      className: 'fw-bold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        const formattedData = data.toLocaleString('ko-KR');

        const isSpecialCase = row.타입 == 3 || row.루징 == 0;
        const isNegative = data < 0;

        const btnClass = isNegative ? 'btn-outline-danger' : 'btn-outline-primary';
        const textColor = isNegative ? 'text-danger' : '';

        if (isSpecialCase) {
          return `<div class="${textColor}">${formattedData}</div>`;
        } else {
          return `<button type='button' class='btn btn-sm ${btnClass} under-income-betwin fw-bold'>${formattedData}</button>`;
        }
      },
    },
    {
      target: 26,
      width: 120,
      className: 'fw-bolder',
      render: function (data, type, row) {
        if (row.타입 == 3) {
          let losing =
            ((Number(row.슬롯마진베팅) +
              Number(row.카지노마진베팅) -
              Number(row.슬롯마진획득) -
              Number(row.카지노마진획득) -
              Number(row.슬롯마진롤링) -
              Number(row.카지노마진롤링) -
              Number(row.유저슬롯마진롤링) -
              Number(row.유저카지노마진롤링)) *
              row.루징요율) /
            100;

          losing = Math.floor(losing);

          if (losing >= 0) {
            return `<div class="text-primary">${losing.toLocaleString('ko-KR')}</div>`;
          } else {
            return `<div class="text-danger">${losing.toLocaleString('ko-KR')}</div>`;
          }
        } else {
          return '';
        }
      },
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      let casinoHeader = document.querySelector('#betWinCasinoHeader');
      let slotHeader = document.querySelector('#betWinSlotHeader');

      casinoHeader.innerHTML = `<div class="fw-light">카지노</div>
      <div class="text-primary">카지노 베팅마진</div>`;
      slotHeader.innerHTML = `<div class="fw-light">슬롯</div>
      <div class="text-primary">슬롯 베팅마진</div>`;

      // incomeAgentBetWin.column(13).visible(true);
      // incomeAgentBetWin.column(13).header().innerHTML = '베';
      // incomeAgentBetWin.column(14).visible(true);
      // incomeAgentBetWin.column(14).header().innerHTML = '롤';
    }

    // 셀렉트 요소 변경 이벤트 리스너 추가
    $('#incomeAgentBetWin').on('change', 'select', function () {
      let selectElement = $(this);
      let selectedValue = selectElement.val();
      let rowEl = selectElement.closest('tr');
      let rowData = incomeAgentBetWin.row(rowEl).data();

      rowData.루징요율 = selectedValue; // 혹은 rowData['루징요율'] = selectedValue;

      // 선택된 값을 저장
      selectedValues[rowData.IDX] = selectedValue; // IDX는 행을 식별할 수 있는 고유한 값

      incomeAgentBetWin.row(rowEl).data(rowData).draw(false); // draw(false)를 사용하여 현재 페이지 유지
    });

    setTimeout(function () {
      incomeAgentBetWin.columns.adjust().draw(false);
    }, 100);
  },
});

let incomeBetWinDetail = $('#incomeBetWinDetail').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/income/detail',
    method: 'POST',
    data: function (d) {
      d.type = 'betwinAcc';
      d.node_id = node_id;
      d.startDate = startDate;
      d.endDate = endDate;
      return d;
    },
    dataSrc: '',
  },
  columns: [
    { data: 'IDX' },
    { data: '정산일자' },
    { data: 'node_id' },
    { data: 'node_pid' },
    { data: '타입' },
    { data: 'user_id' },
    { data: '아이디' },
    { data: '닉네임' },
    { data: '카지노베팅' },
    { data: '카지노획득' },
    { data: '카지노윈루즈' },

    { data: '슬롯베팅' },
    { data: '슬롯획득' },
    { data: '슬롯윈루즈' },
    { data: '상위카지노롤링' },
    { data: '상위슬롯롤링' },
    { data: '하부합산루징금' },
    { data: '최종루징금' },
  ],
  dom: 'frtip',
  order: [[2, 'asc']],
  createdRow: function (row, data, dataIndex) {
    if (data.상태 != '차단') {
      if (data.타입 == 0) {
        $(row).addClass('platinum-bg');
      } else if (data.타입 == 1) {
        $(row).addClass('gold-bg');
      } else if (data.타입 == 2) {
        $(row).addClass('silver-bg');
      } else if (data.타입 == 3) {
        $(row).addClass('bronze-bg');
      }
    } else {
      $(row).addClass('block-bg');
      $(row).addClass('d-none');
    }
  },
  columnDefs: [
    { target: 0, visible: false, searchable: false },
    {
      target: [1, 2, 3, 5],
      visible: false,
    },
    {
      target: 1,
      render: function (data) {
        return moment(data).format('YYYY-MM-DD');
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
        }
      },
    },
    {
      target: 6,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 8,
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.카지노마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진베팅).toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 9,
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.카지노마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진획득).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 11,
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.슬롯마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진베팅).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 12,
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.슬롯마진획득).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진획득).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 14,
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.상위카지노마진롤링).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.상위카지노마진롤링).toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 15,
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.상위슬롯마진롤링).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.상위슬롯마진롤링).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: [10, 13, 16, 17],
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (data < 0) {
          return `<div class="text-danger">${data.toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${data.toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: [10, 13, 16, 17],
      createdCell: function (td, cellData, rowData, row, col) {
        if (cellData < 0) {
          $(td).addClass('text-danger');
        }
      },
      className: 'fw-semibold',
    },
    {
      target: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7],
      orderable: false,
    },
  ],
  drawCallback: function () {
    $('table')
      .off('click', 'tbody tr .under-income-betwin')
      .on('click', 'tbody tr .under-income-betwin', function () {
        selectedIncome = $('table').DataTable().row($(this).parent('td')).data();
        if (selectedIncome.타입 != 3) {
          node_id = selectedIncome.node_id;
          incomeBetWinDetail.clear().ajax.reload(function (d) {
            d.node_id = node_id;
            d.startDate = startDate;
            d.endDate = endDate;
          });
          $('#incomeBetWinDetailModal').modal('show');
        }
      });
  },
});
// #endregion

// #region 에이전트 죽장 정산
let incomeAgentDeath = $('#incomeAgentDeath').DataTable({
  language: korean,
  scrollY: '63vh',
  scrollCollapse: true,
  autowidth: true,
  responsive: {
    details: {
      type: 'column',
      target: 0,
      renderer: function (api, rowIdx, columns) {
        let data = $.map(columns, function (col, i) {
          switch (i) {
            case 9:
              col.title = '카지노 롤링요율';
              break;
            case 10:
              col.title = '슬롯 롤링요율';
              break;
            case 11:
              col.title = '루징요율';
              break;
            case 12:
              col.title = '베팅 마진요율';
              break;
            case 13:
              col.title = '슬롯 마진요율';
              break;
            case 14:
              col.title = '카지노 베팅';
              break;
            case 15:
              col.title = '카지노 획득';
              break;
            case 16:
              col.title = '카지노 윈루즈';
              break;
            case 17:
              col.title = '슬롯 베팅';
              break;
            case 18:
              col.title = '슬롯 획득';
              break;
            case 19:
              col.title = '슬롯 윈루즈';
              break;
            case 20:
              col.title = '카지노 롤링';
              break;
            case 21:
              col.title = '슬롯 롤링';
              break;
            case 22:
              col.title = '루징';
              break;
            case 23:
              col.title = '총 정산금';
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
    url: '/income/agent',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      d.type = 'death';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth"><"#expander.btn float-start"><"#collapser.btn float-start">Bfrtip',
  buttons: [
    {
      extend: 'excel',
      exportOptions: {
        columns: [':visible', '3', '4'],
      },
      text: '엑셀 다운로드',
    },
  ],
  columns: [
    { data: null, defaultContent: '', className: 'desktop' },
    { data: 'IDX', className: 'desktop' },
    { data: '정산일자', className: 'desktop' },
    { data: 'node_id', className: 'desktop' },
    { data: 'node_pid', className: 'desktop' },
    { data: '타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', responsivePriority: 3 },
    { data: '보유금', className: 'desktop' },
    { data: '루징요율', className: 'desktop' },
    { data: '카지노베팅', className: 'desktop' },

    { data: '카지노획득', className: 'desktop' },
    { data: '카지노윈루즈', className: 'desktop' },
    { data: '슬롯베팅', className: 'desktop' },
    { data: '슬롯획득', className: 'desktop' },
    { data: '슬롯윈루즈', className: 'desktop' },
    { data: '당일입금', className: 'desktop' },
    { data: '당일출금', className: 'desktop' },
    { data: '당일죽장금', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
  ],
  paging: false,
  order: [[3, 'asc']],
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
    } else {
      $(row).addClass('block-bg');
      $(row).css('display', 'none');
    }

    if (clientType == 9) {
      if (data.타입 == 0) {
        $(row).addClass('simple-tree-table-root');
      } else {
        $(row).addClass('simple-tree-table-closed');
        $(row).css('display', 'none');
      }
    } else {
      if (data.node_id == clientNode) {
        $(row).addClass('simple-tree-table-root');
      } else {
        $(row).addClass('simple-tree-table-closed');
        $(row).css('display', 'none');
      }
    }

    $(row).attr('data-node-id', data.node_id);
    $(row).attr('data-node-pid', data.node_pid);
  },
  columnDefs: [
    {
      target: 0,
      className: 'dtr-control',
    },
    {
      target: [1, 2, 3, 4],
      visible: false,
      searchable: false,
    },
    { target: [19, 20, 21, 22], visible: false },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      orderable: false,
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [10, 11, 12, 13, 14, 15, 16, 17, 18],
      className: 'dt-body-right',
    },
    {
      target: 5,
      width: 110,
      className: 'dt-head-center',
      render: function (data) {
        if (data == '0') {
          return `<i class="fa-solid fa-square-plus fa-xl text-danger simple-tree-table-handler" style='cursor:pointer'></i>  ` + '플래티넘';
        } else if (data == '1') {
          return `<i class="fa-solid fa-square-plus fa-xl text-warning simple-tree-table-handler" style='cursor:pointer; margin-left: 10px'></i>  ` + '골드';
        } else if (data == '2') {
          return `<i class="fa-solid fa-square-plus fa-xl text-success simple-tree-table-handler" style='cursor:pointer; margin-left: 20px'></i>  ` + '실버';
        } else if (data == '3') {
          return `<i class="fa-solid fa-square fa-xl text-primary simple-tree-table-handler" style='margin-left: 30px'></i>  ` + '브론즈';
        }
      },
    },
    {
      target: 6,
      width: 90,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    { target: 7, width: 90 },
    {
      target: 8,
      render: function (data) {
        return data.toLocaleString('ko-KR');
      },
    },
    {
      target: 9,
      render: function (data) {
        return data - 5;
      },
    },
    {
      target: 10,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                  <div class="text-primary">${Number(row.카지노마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진베팅).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 11,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                  <div class="text-primary">${Number(row.카지노마진획득).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진획득).toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 12,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (data < 0) {
          return `<div class="text-danger">${data.toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${data.toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 13,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                  <div class="text-primary">${Number(row.슬롯마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진베팅).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 14,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                  <div class="text-primary">${Number(row.슬롯마진획득).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진획득).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 15,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (data < 0) {
          return `<div class="text-danger">${data.toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${data.toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 16,
      className: 'fw-semibold',
      render: function (data, type, row) {
        return `<div class="text-primary">${Number(data).toLocaleString('ko-KR')}</div>`;
      },
    },
    {
      target: 17,
      className: 'fw-semibold',
      render: function (data, type, row) {
        return `<div class="text-danger">${Number(data).toLocaleString('ko-KR')}</div>`;
      },
    },
    {
      target: 18,
      className: 'fw-semibold',
      render: function (data, type, row) {
        let income = Number(data);
        if (income < 0) {
          return `<div class="text-danger">${income.toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${income.toLocaleString('ko-KR')}</div>`;
        }
      },
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      let casinoHeader = document.querySelector('#betWinCasinoHeader');
      let slotHeader = document.querySelector('#betWinSlotHeader');

      casinoHeader.innerHTML = `<div class="fw-light">카지노</div>
      <div class="text-primary">카지노 베팅마진</div>`;
      slotHeader.innerHTML = `<div class="fw-light">슬롯</div>
      <div class="text-primary">슬롯 베팅마진</div>`;
    }
    setTimeout(function () {
      incomeAgentDeath.columns.adjust().draw();
    }, 100);
  },
});
// #endregion

// #region 유저 정산
$('#incomeUserDepoWith').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/income/user',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      d.type = 'depoWith';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth me-2">lfrtip',
  createdRow: function (row, data, dataIndex) {
    if (data.상태 == '차단') {
      $(row).addClass('block-bg');
      $(row).css('display', 'none');
    }
  },
  columns: [
    { data: null, defaultContent: '', className: 'desktop' },
    { data: 'IDX', className: 'desktop' },
    { data: '정산일자', className: 'desktop' },
    { data: '타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', responsivePriority: 3 },
    { data: null, defaultContent: '', className: 'desktop' },
    { data: '보유금', className: 'desktop' },
    { data: '포인트', className: 'desktop' },
    { data: '카지노 롤링요율', className: 'desktop' },
    { data: '슬롯 롤링요율', className: 'desktop' },

    { data: '죽장요율', className: 'desktop' },
    { data: '입금', className: 'desktop' },
    { data: '출금', className: 'desktop' },
    { data: '입출금', className: 'desktop' },
    { data: '카지노마진롤링', className: 'desktop' },
    { data: '슬롯마진롤링', className: 'desktop' },
    { data: '최종루징금', className: 'desktop' },
    { data: '최종정산금', className: 'desktop' },
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
  order: [[18, 'desc']],
  columnDefs: [
    {
      target: 0,
      className: 'dtr-control',
    },
    {
      target: [1, 2, 3],
      visible: false,
      searchable: false,
    },
    { target: [19, 20, 21, 22], visible: false },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22],
      orderable: false,
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [7, 8, 12, 13, 14, 15, 16, 17, 18],
      className: 'dt-body-right',
    },
    {
      target: 4,
      width: 90,
      render: function (data, type, row) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 6,
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
      target: [7, 8, 12, 13, 14, 15, 16, 17, 18],
      render: function (data) {
        if (typeof data === 'number') {
          return data.toLocaleString('ko-KR');
        } else if (typeof data === 'string') {
          return Number(data).toLocaleString('ko-KR');
        }
      },
    },
    {
      target: [17, 18],
      orderable: true,
      className: 'dt-head-center dt-body-center',
    },
  ],
});

$('#incomeUserBetWin').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/income/user',
    method: 'POST',
    data: function (d) {
      d.startDate = startDate;
      d.endDate = endDate;
      d.type = 'betwin';
      return d;
    },
    dataSrc: '',
  },
  dom: '<"dateInput float-start dateWidth me-2">lfrtip',
  createdRow: function (row, data, dataIndex) {
    if (data.상태 == '차단') {
      $(row).addClass('block-bg');
      $(row).css('display', 'none');
    }
  },
  columns: [
    { data: null, defaultContent: '', className: 'desktop' },
    { data: 'IDX', className: 'desktop' },
    { data: '정산일자', className: 'desktop' },
    { data: '타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', responsivePriority: 3 },
    { data: '보유금', className: 'desktop' },
    { data: '포인트', className: 'desktop' },
    { data: '카지노 롤링요율', className: 'desktop' },
    { data: '슬롯 롤링요율', className: 'desktop' },
    { data: '루징요율', className: 'desktop' },

    { data: '베팅마진요율', className: 'desktop' },
    { data: '롤링마진요율', className: 'desktop' },
    { data: '카지노베팅', className: 'desktop' },
    { data: '카지노획득', className: 'desktop' },
    { data: '카지노윈루즈', className: 'desktop' },
    { data: '슬롯베팅', className: 'desktop' },
    { data: '슬롯획득', className: 'desktop' },
    { data: '슬롯윈루즈', className: 'desktop' },
    { data: '카지노롤링', className: 'desktop' },
    { data: '슬롯롤링', className: 'desktop' },

    { data: '최종루징금', className: 'desktop' },
    { data: '최종정산금', responsivePriority: 5 },
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
  columnDefs: [
    {
      target: 0,
      className: 'dtr-control',
    },
    {
      target: [1, 2, 3, 11, 12],
      visible: false,
      searchable: false,
    },
    { target: [23, 24, 25, 26], visible: false },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
      orderable: false,
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [6, 7, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      className: 'dt-body-right',
    },
    {
      target: 4,
      width: 90,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: [6, 7],
      render: function (data) {
        return data.toLocaleString('ko-KR');
      },
    },
    {
      target: 13,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.카지노마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진베팅).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 14,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.카지노마진획득).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진획득).toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 15,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (data < 0) {
          return `<div class="text-danger">${data.toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${data.toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 16,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.슬롯마진베팅).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진베팅).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 17,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.슬롯마진획득).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진획득).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 18,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (data < 0) {
          return `<div class="text-danger">${data.toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${data.toLocaleString('ko-KR')}</div>`;
        }
      },
    },
    {
      target: 19,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.카지노마진롤링).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.카지노마진롤링).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: 20,
      className: 'fw-semibold',
      render: function (data, type, row) {
        data = Number(data) || 0;
        if (clientType == 9) {
          return `<div class="fw-light">${data.toLocaleString('ko-KR')}</div>
                <div class="text-primary">${Number(row.슬롯마진롤링).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(row.슬롯마진롤링).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: [21, 22],
      className: 'fw-semibold',
      render: function (data, type, row) {
        if (data < 0) {
          return `<div class="text-danger">${Number(data).toLocaleString('ko-KR')}</div>`;
        } else {
          return `${Number(data).toLocaleString('ko-KR')}`;
        }
      },
    },
    {
      target: [23, 24],
      width: 120,
      className: 'fw-bolder',
      render: function (data, type, row) {
        if (data < 0) {
          return `<div class="text-danger">${Number(data).toLocaleString('ko-KR')}</div>`;
        } else if (data == 0) {
          return `<div>${Number(data).toLocaleString('ko-KR')}</div>`;
        } else {
          return `<div class="text-primary">${Number(data).toLocaleString('ko-KR')}</div>`;
        }
      },
    },
  ],
  // drawCallback: function () {
  //   initPopover();
  // },
});
// #endregion

//* 트리뷰 저장
incomeBetWinDetail.on('draw', function () {
  const closedNodesStr = localStorage.getItem('KEY') || '[]';
  const closedNodes = JSON.parse(closedNodesStr).map(String);

  const allNodes = $('[data-node-id]')
    .map(function () {
      return String($(this).data('node-id'));
    })
    .get();

  for (const node of allNodes) {
    const elem = $(`tr[data-node-id='${node}']`);
    const pid = elem.data('node-pid');
    let parentNode = $(`[data-node="${pid}"]`);

    if (!closedNodes.includes(String(pid))) {
      let parentNode = $(`[data-node-id="${pid}"]`);
      if (parentNode.hasClass('simple-tree-table-closed')) {
        parentNode.removeClass('simple-tree-table-closed').addClass('simple-tree-table-opened');
      }
      elem.css('display', '');
    } else {
      if (parentNode.hasClass('simple-tree-table-opened')) {
        parentNode.removeClass('simple-tree-table-opened').addClass('simple-tree-table-closed');
      }
      elem.css('display', 'none');

      if (!closedNodes.includes(node)) {
        closedNodes.push(node);
        console.log('closedNodes', closedNodes);
      }
    }
  }

  localStorage.setItem('KEY', JSON.stringify(closedNodes));
});

$(document).on('click', '.simple-tree-table-handler, #expander, #collapser', function () {
  if (localStorage.getItem('KEY') === null) {
    localStorage.setItem('KEY', '');
  }

  const str = localStorage.getItem('KEY');
  closedNodes = JSON.parse(str);
  closedNodes = closedNodes.map((node) => String(node));
  localStorage.setItem('KEY', JSON.stringify(closedNodes));
});
