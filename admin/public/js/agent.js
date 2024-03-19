window.addEventListener('DOMContentLoaded', (event) => {
  // 사이드바 토글
  const sidebarToggle = document.body.querySelector('#sidebarToggle, #sidebarToggleMobile');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
    });
  }

  collapseSideMenu();
  initPopover();

  if (
    document.getElementById('agentInfo') ||
    document.getElementById('agentAsset') ||
    document.getElementById('agentCommission') ||
    document.getElementById('agentBetting')
  ) {
    $('table').simpleTreeTable({
      expander: '#expander',
      collapser: '#collapser',
      store: 'local',
      storeKey: 'KEY',
      margin: 5,
    });

    document.querySelector('#expander').innerHTML = '모두 열기';
    document.querySelector('#collapser').innerHTML = '모두 닫기';

    if (document.querySelector('#add-platinum')) {
      document.querySelector('#add-platinum').innerHTML = '플래티넘 생성';
    }

    if (document.querySelector('.dateInput')) {
      document.querySelector('.dateInput').innerHTML = '<input type="text" class="text-center w-100 mt-1" id="dateSelector" name="date" value=""/>';
    }
  } else if (document.getElementById('agentConnect') || document.getElementById('agentBlock')) {
    if (document.querySelector('.dateInput')) {
      document.querySelector('.dateInput').innerHTML =
        '<input type="text" class="text-center w-100" style="padding: 3px 0" id="dateSelector" name="date" value=""/>';
    }
  }

  //? 자동검색
  var urlParams = new URLSearchParams(window.location.search);
  var searchParam = urlParams.get('search');

  if (searchParam != null) {
    setTimeout(() => {
      document.querySelector('#expander').click();
      agentInfo.search(searchParam).draw();
    }, 100);
  }

  if (document.querySelector('#assetToggle')) {
    document.querySelector('#assetToggle').innerHTML = `
    <div class="d-flex align-items-center pt-2 ps-3" style="font-size:1.05rem;">
    <span>개별</span>
    <div class="form-check form-switch ms-2 me-1">
      <input class="form-check-input" type="checkbox" role="switch" id="assetToggleSwitch" checked>
      <label class="form-check-label" for="agentAssetInfoSwitch"></label>
    </div>
    <span>하부합산</span>
  </div>  `;
  }

  //todo 에이전트 베팅 개별, 합산 확인
  // if (document.querySelector('#bettingToggle')) {
  //   document.querySelector('#bettingToggle').innerHTML = `
  //   <div class="d-flex align-items-center pt-2 ps-3" style="font-size:1.05rem;">
  //   <span>개별</span>
  //   <div class="form-check form-switch ms-2 me-1">
  //     <input class="form-check-input" type="checkbox" role="switch" id="bettingToggleSwitch" checked>
  //     <label class="form-check-label" for="agentAssetInfoSwitch"></label>
  //   </div>
  //   <span>하부합산</span>
  // </div>  `;
  // }

  $('table').on('click', 'tbody tr .balance-btn', function () {
    rowData = $('table').DataTable().row($(this).parent('td')).data();
  });

  //? 에이전트 개별메세지 열기
  $('table').on('click', 'tbody tr .msg-btn', function () {
    rowData = $('table').DataTable().row($(this).parent('td')).data();
    document.getElementById('messageType').value = '개별';
    document.getElementById('messageType').disabled = true;
    document.getElementById('sendRange').disabled = true;
    document.getElementById('selectedUser').disabled = false;
    document.getElementById('selectedUser').value = rowData.아이디;

    $('#sendMessageModal').modal('show');
  });

  // //? 메세지 전송
  // document.querySelector('#sendMessageForm').addEventListener('submit', (e) => {
  //   e.preventDefault();
  //   let message_data = $('#sendMessageForm').serialize();
  //   let messageType = '개별';

  //   message_data += '&messageType=' + encodeURIComponent(messageType);

  //   $.ajax({
  //     method: 'POST',
  //     url: '/board/send',
  //     data: message_data,
  //   })
  //     .done((result) => {
  //       document.querySelector('#boardConfirm').innerHTML = result.msg;
  //       $('#boardConfirmModal').modal('show');

  //       if (result.send) {
  //         $('#sendMessageModal').modal('hide');
  //         $('#message').DataTable().ajax.reload(null, false);
  //       }
  //     })
  //     .fail(function (err) {
  //       console.log('전송오류');
  //       console.log(err);
  //     });
  // });

  $('#assetToggle').on('click', function (event) {
    var seperateVisible = agentAsset.column('.seperate').visible();
    agentAsset.columns('.seperate').visible(!seperateVisible, !seperateVisible);
    agentAsset.columns('.combine').visible(seperateVisible, seperateVisible);
    agentAsset.columns.adjust().draw(false);
  });

  //? 초기화 시 컬럼 숨기기
  agentBetting.columns('.seperate').visible(false);
  // agentBetting.columns('.combine').visible(true);

  //? 토글 버튼
  //todo 에이전트 베팅 개별, 합산 확인
  // $('#bettingToggle').on('click', function (event) {
  //   console.log('베팅스위치')
  //   var seperateVisible = agentBetting.column('.seperate').visible();
  //   agentBetting.columns('.seperate').visible(!seperateVisible, !seperateVisible);
  //   agentBetting.columns('.combine').visible(seperateVisible, seperateVisible);
  //   agentBetting.columns.adjust().draw(false);
  // });
});

let agentInfo = $('#agentInfo').DataTable({
  language: korean,
  responsive: {
    details: {
      type: 'column',
      target: 0,
    },
  },
  ajax: {
    url: '/agent/info',
    method: 'POST',
    dataSrc: '',
  },
  dom: 'l<"#expander.btn float-start mb-2"><"#collapser.btn float-start mb-2">frtip',
  columns: [
    { data: null, defaultContent: '', className: 'dtr-control' },
    { data: 'node_id' },
    { data: 'node_pid' },
    { data: '타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', className: 'desktop' },
    { data: '보유금', className: 'desktop' },
    { data: '포인트', className: 'desktop' },
    { data: '총 입금', className: 'desktop' },
    { data: '총 출금', className: 'desktop' },
    { data: '총 입출금', className: 'desktop' },

    { data: '카지노 롤링요율', className: 'desktop' },
    { data: '슬롯 롤링요율', className: 'desktop' },
    { data: '루징요율', className: 'desktop' },
    { data: '카지노베팅마진요율', className: 'desktop' },
    { data: '슬롯베팅마진요율', className: 'desktop' },
    { data: '카지노롤링마진요율', className: 'desktop' },
    { data: '슬롯롤링마진요율', className: 'desktop' },
    { data: null, defaultContent: '', className: 'desktop dt-head-center' },
    { data: '최근 접속일시', className: 'desktop' },
    { data: '최근 접속페이지', className: 'desktop' },

    { data: '최근 접속IP', className: 'desktop' },
    { data: null, defaultContent: '', responsivePriority: 3 },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
    { data: '플래티넘_id' },
    { data: '골드_id' },
    { data: '실버_id' },
    { data: '브론즈_id' },
    { data: null, defaultContent: '' },
    { data: '예금주' },
  ],
  paging: false,
  lengthMenu: [100, 300, 500],
  order: [[1, 'asc']],
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
      $(row).addClass('d-none');
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
      target: [1, 2, 8, 9, 10, 14, 15, 16, 17],
      visible: false,
      searchable: false,
    },
    { target: [23, 24, 25, 26, 27, 28, 29, 30, 32], visible: false },
    {
      target: [11, 12, 13],
      width: 60,
    },
    {
      target: 3,
      className: 'dt-head-center',
      render: function (data) {
        if (data == '0') {
          return `<i class="fa-solid fa-square-plus fa-xl text-danger simple-tree-table-handler" style='cursor:pointer'></i>  ` + '플래티넘';
        } else if (data == '1') {
          return `<i class="fa-solid fa-square-plus fa-xl text-warning simple-tree-table-handler" style='cursor:pointer; margin-left: 3px'></i>  ` + '골드';
        } else if (data == '2') {
          return `<i class="fa-solid fa-square-plus fa-xl text-success simple-tree-table-handler" style='cursor:pointer; margin-left: 6px'></i>  ` + '실버';
        } else if (data == '3') {
          return `<i class="fa-solid fa-square fa-xl text-primary simple-tree-table-handler" style='margin-left: 9px'></i>  ` + '브론즈';
        }
      },
    },
    {
      target: 4,
      render: function (data) {
        return `<div class="btn-group" role="group" aria-label="Basic example">
        <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>        
        </div>`;
      },
    },
    {
      target: 6,
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
      target: 18,
      render: function (data, type, row) {
        if (clientType === 9) {
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
          switch (row.타입) {
            case 4:
              return `<button type='button' class='btn btn-sm btn-outline-dark asset-primary ms-2' style='cursor: default'>${row.브론즈}</button>`;
            case 3:
              return `<button type='button' class='btn btn-sm btn-outline-dark asset-success ms-2' style='cursor: default'>${row.실버}</button>`;
            case 2:
              return `<button type='button' class='btn btn-sm btn-outline-dark asset-warning ms-2' style='cursor: default'>${row.골드}</button>`;
            case 1:
              return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;
          }
        }
      },
    },
    {
      target: 21,
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
      searchable: false,
      render: function (data, type, row) {
        if (row.타입 == '0') {
          return `<button class="btn btn-sm border-warning asset-warning add-gold">
            골드 생성
          </button>`;
        } else if (row.타입 == '1') {
          return `<button class="btn btn-sm asset-success add-silver">
            실버 생성
          </button>`;
        } else if (row.타입 == '2') {
          return `<button class="btn btn-sm asset-primary add-bronze">
            브론즈 생성
          </button>`;
        } else if (row.타입 == '3') {
          return `<button class="btn btn-sm asset-dark add-user">
            유저 생성
          </button>`;
        }
      },
    },
    {
      target: 31,
      render: function (data, type, row) {
        return `<i class="msg-btn fa-regular fa-message fa-xl" style="cursor: pointer"></i>`;
      },
    },
    {
      target: [6, 7, 8, 9, 10],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 31],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
      orderable: false,
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      agentInfo.column(14).visible(true);
      agentInfo.column(14).header().innerHTML = '카';
      agentInfo.column(15).visible(true);
      agentInfo.column(15).header().innerHTML = '슬';
      agentInfo.column(16).visible(true);
      agentInfo.column(16).header().innerHTML = '카';
      agentInfo.column(17).visible(true);
      agentInfo.column(17).header().innerHTML = '슬';
      agentInfo.columns.adjust().draw();
    } else {
      this.api().columns(18).header().to$().text('상위 에이전트');
      console.log(this.api().columns(18).css);
      this.api().column(18).style.width = '100px';
      this.api().columns.adjust().draw();
    }
  },
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

let agentAsset = $('#agentAsset').DataTable({
  language: korean,
  responsive: {
    details: {
      type: 'column',
      target: 0,
      renderer: function (api, rowIdx, columns) {
        var data = $.map(columns, function (col, i) {
          switch (i) {
            case 7:
              col.title = '당일 합산 입금';
              break;
            case 8:
              col.title = '당일 합산 출금';
              break;
            case 9:
              col.title = '당일 합산 입출금';
              break;
            case 10:
              col.title = '당일 입금';
              break;
            case 11:
              col.title = '당일 출금';
              break;
            case 12:
              col.title = '당일 입출금';
              break;
            case 13:
              col.title = '총 합산 입금';
              break;
            case 14:
              col.title = '총 합산 출금';
              break;
            case 15:
              col.title = '총 합산 입출금';
              break;
            case 16:
              col.title = '총 입금';
              break;
            case 17:
              col.title = '총 출금';
              break;
            case 18:
              col.title = '총 입출금';
              break;
          }
          return col.hidden
            ? `<li class=" dt-head-center dt-body-center" data-dtr-index="${col.columnIndex}" data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}"><span
            class="dtr-title">${col.title}</span> <span class="dtr-data">${col.data}</span></li>`
            : '';
        }).join('');

        return data ? $('<ul class="dtr-details"/>').append(data) : false;
      },
    },
  },
  ajax: {
    url: '/agent/asset',
    method: 'POST',
    dataSrc: '',
  },
  dom: 'l<"#expander.btn"><"#collapser.btn"><"#assetToggle">frtip',
  columns: [
    { data: null, defaultContent: '', className: 'dtr-control' },
    { data: 'node_id' },
    { data: 'node_pid' },
    { data: '타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', className: 'desktop' },
    { data: '보유금', responsivePriority: 3 },
    { data: '포인트', responsivePriority: 4 },
    { data: '당일 합산 입금', className: 'combine desktop' },
    { data: '당일 합산 출금', className: 'combine desktop' },
    { data: '당일 합산 입출금', className: 'combine desktop' },
    { data: '당일 입금', className: 'seperate desktop' },
    { data: '당일 출금', className: 'seperate desktop' },
    { data: '당일 입출금', className: 'seperate desktop' },
    { data: '총 합산 입금', className: 'combine desktop' },
    { data: '총 합산 출금', className: 'combine desktop' },
    { data: '총 합산 입출금', className: 'combine desktop' },
    { data: '총 입금', className: 'seperate desktop' },
    { data: '총 출금', className: 'seperate desktop' },
    { data: '총 입출금', className: 'seperate desktop' },
    { data: '지급 보유금', className: 'desktop' },
    { data: '지급 포인트', className: 'desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
  ],
  paging: false,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[1, 'asc']],
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
      target: [1, 2, 22, 23, 24, 25],
      visible: false,
    },
    {
      target: [1, 2],
      searchable: false,
    },
    {
      target: 3,
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
      target: 4,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 6,
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
      target: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 3, 4, 5, 20, 21, 22, 23, 24, 25],
      orderable: false,
    },
  ],
  initComplete: function () {
    agentAsset.columns('.seperate').visible(false);
    agentAsset.columns('.combine').visible(true);
  },
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

let agentCommission = $('#agentCommission').DataTable({
  language: korean,
  responsive: {
    details: {
      type: 'column',
      target: 0,
      renderer: function (api, rowIdx, columns) {
        var data = $.map(columns, function (col, i) {
          switch (i) {
            case 8:
              col.title = '카지노 롤링요율(%)';
              break;
            case 9:
              col.title = '카지노 - 당일 적립 롤링포인트';
              break;
            case 10:
              col.title = '카지노 - 총 적립 롤링포인트';
              break;
            case 11:
              col.title = '슬롯 롤링요율(%)';
              break;
            case 12:
              col.title = '슬롯 - 당일 적립 롤링포인트';
              break;
            case 13:
              col.title = '슬롯 - 총 적립 롤링포인트';
              break;
            case 14:
              col.title = '루징요율(%)';
              break;
            case 15:
              col.title = '당일 적립 루징포인트';
              break;
            case 16:
              col.title = '총 적립 루징포인트';
              break;
          }
          return col.hidden
            ? `<li class=" dt-head-center dt-body-center" data-dtr-index="${col.columnIndex}" data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}"><span
            class="dtr-title">${col.title}</span> <span class="dtr-data">${col.data}</span></li>`
            : '';
        }).join('');

        return data ? $('<ul class="dtr-details"/>').append(data) : false;
      },
    },
  },
  ajax: {
    url: '/agent/commission',
    method: 'POST',
    dataSrc: '',
  },
  dom: 'l<"#expander.btn"><"#collapser.btn">frtip',
  buttons: ['copy', 'excel', 'pdf', 'print'],
  columns: [
    { data: null, defaultContent: '', className: 'dtr-control' },
    { data: 'node_id' },
    { data: 'node_pid' },
    { data: '타입' },
    { data: '아이디' },
    { data: '닉네임', className: 'desktop' },
    { data: '보유금' },
    { data: '포인트' },
    { data: '베팅마진요율', className: 'desktop' },
    { data: '롤링마진요율', className: 'desktop' },
    { data: '카지노 롤링요율', className: 'desktop' },
    { data: '카지노 당일 적립 롤링커미션', className: 'desktop' },
    { data: '카지노 총 적립 롤링커미션', className: 'desktop' },
    { data: '슬롯 롤링요율', className: 'desktop' },
    { data: '슬롯 당일 적립 롤링커미션', className: 'desktop' },
    { data: '슬롯 총 적립 롤링커미션', className: 'desktop' },
    { data: '루징요율', className: 'desktop' },
    { data: '당일 적립 루징커미션', className: 'desktop' },
    { data: '총 적립 루징커미션', className: 'desktop' },
    { data: '플래티넘', className: 'desktop' },
    { data: '골드', className: 'desktop' },
    { data: '실버', className: 'desktop' },
    { data: '브론즈', className: 'desktop' },
  ],
  paging: false,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[1, 'asc']],
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
      target: [1, 2, 8, 9],
      visible: false,
      searchable: false,
    },
    { target: [19, 20, 21, 22], visible: false },
    {
      target: 3,
      width: 100,
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
      target: 4,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: [6, 7, 11, 12, 14, 15, 17, 18],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    { target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], className: 'dt-head-center' },
    {
      target: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 3, 4, 5, 17, 18, 19, 20],
      orderable: false,
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      agentCommission.column(8).visible(true);
      agentCommission.column(8).header().innerHTML = '베팅<br>마진요율(%)';
      agentCommission.column(9).visible(true);
      agentCommission.column(9).header().innerHTML = '롤링<br>마진요율(%)';
      agentCommission.columns.adjust().draw();
    }
  },
});

let agentBetting = $('#agentBetting').DataTable({
  language: korean,
  responsive: {
    details: {
      type: 'column',
      target: 0,
      renderer: function (api, rowIdx, columns) {
        var data = $.map(columns, function (col, i) {
          switch (i) {
            case 5:
              col.title = '카지노 당일합산베팅금';
              break;
            case 6:
              col.title = '카지노 당일합산당첨금';
              break;
            case 7:
              col.title = '카지노 당일합산당첨률(%)';
              break;
            case 8:
              col.title = '카지노 당일베팅금';
              break;
            case 9:
              col.title = '카지노 당일당첨금';
              break;
            case 10:
              col.title = '카지노 당일당첨률(%)';
              break;
            case 11:
              col.title = '카지노 전체합산베팅금';
              break;
            case 12:
              col.title = '카지노 전체합산당첨금';
              break;
            case 13:
              col.title = '카지노 전체합산당첨률(%)';
              break;
            case 14:
              col.title = '카지노 전체베팅금';
              break;
            case 15:
              col.title = '카지노 전체당첨금';
              break;
            case 16:
              col.title = '카지노 전체당첨률(%)';
              break;
            case 17:
              col.title = '슬롯 당일합산베팅금';
              break;
            case 18:
              col.title = '슬롯 당일합산당첨금';
              break;
            case 19:
              col.title = '슬롯 당일합산당첨률(%)';
              break;
            case 20:
              col.title = '슬롯 당일베팅금';
              break;
            case 21:
              col.title = '슬롯 당일당첨금';
              break;
            case 22:
              col.title = '슬롯 당일당첨률(%)';
              break;
            case 23:
              col.title = '슬롯 전체합산베팅금';
              break;
            case 24:
              col.title = '슬롯 전체합산당첨금';
              break;
            case 25:
              col.title = '슬롯 전체합산당첨률(%)';
              break;
            case 26:
              col.title = '슬롯 전체베팅금';
              break;
            case 27:
              col.title = '슬롯 전체당첨금';
              break;
            case 28:
              col.title = '슬롯 전체당첨률(%)';
              break;
          }
          return col.hidden
            ? `<li class=" dt-head-center dt-body-center" data-dtr-index="${col.columnIndex}" data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}"><span
            class="dtr-title">${col.title}</span> <span class="dtr-data">${col.data}</span></li>`
            : '';
        }).join('');

        return data ? $('<ul class="dtr-details"/>').append(data) : false;
      },
    },
  },
  ajax: {
    url: '/agent/betting',
    method: 'POST',
    dataSrc: '',
  },
  //todo 에이전트 베팅 개별, 합산 확인
  // dom: 'l<"#expander.btn"><"#collapser.btn"><"#bettingToggle">frtip',
  dom: 'l<"#expander.btn"><"#collapser.btn">frtip',
  columns: [
    { data: null, defaultContent: '', className: 'dtr-control' },
    { data: 'node_id' },
    { data: 'node_pid' },
    { data: '타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 2 },
    { data: '닉네임', responsivePriority: 3 },
    { data: '카지노 당일합산베팅금', className: 'combine desktop' },
    { data: '카지노 당일합산당첨금', className: 'combine desktop' },
    { data: '카지노 당일합산당첨율', className: 'combine desktop' },
    { data: '카지노 당일베팅금', className: 'seperate desktop' },
    { data: '카지노 당일당첨금', className: 'seperate desktop' },
    { data: '카지노 당일당첨율', className: 'seperate desktop' },
    { data: '카지노 전체합산베팅금', className: 'combine desktop' },
    { data: '카지노 전체합산당첨금', className: 'combine desktop' },
    { data: '카지노 전체합산당첨율', className: 'combine desktop' },
    { data: '카지노 전체베팅금', className: 'seperate desktop' },
    { data: '카지노 전체당첨금', className: 'seperate desktop' },
    { data: '카지노 전체당첨율', className: 'seperate desktop' },
    { data: '슬롯 당일합산베팅금', className: 'combine desktop' },
    { data: '슬롯 당일합산당첨금', className: 'combine desktop' },
    { data: '슬롯 당일합산당첨율', className: 'combine desktop' },
    { data: '슬롯 당일베팅금', className: 'seperate desktop' },
    { data: '슬롯 당일당첨금', className: 'seperate desktop' },
    { data: '슬롯 당일당첨율', className: 'seperate desktop' },
    { data: '슬롯 전체합산베팅금', className: 'combine desktop' },
    { data: '슬롯 전체합산당첨금', className: 'combine desktop' },
    { data: '슬롯 전체합산당첨율', className: 'combine desktop' },
    { data: '슬롯 전체베팅금', className: 'seperate desktop' },
    { data: '슬롯 전체당첨금', className: 'seperate desktop' },
    { data: '슬롯 전체당첨율', className: 'seperate desktop' },
    { data: '플래티넘' },
    { data: '골드' },
    { data: '실버' },
    { data: '브론즈' },
  ],
  paging: false,
  lengthMenu: [
    [100, 300, 500, -1],
    [100, 300, 500, 'All'],
  ],
  order: [[1, 'asc']],
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
      target: [1, 2, 8, 14, 20, 26],
      visible: false,
      searchable: false,
    },
    { target: [30, 31, 32, 33], visible: false },
    {
      target: 3,
      width: 100,
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
      target: 4,
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: [6, 7, 9, 10, 12, 13, 15, 16, 18, 19, 21, 22, 24, 25, 27, 28],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [8, 11, 14, 17, 20, 23, 26],
      className: 'dt-body-right, border-end',
    },
    { target: 17, className: 'dt-body-right' },
    {
      target: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [0, 3, 4, 5],
      orderable: false,
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      agentBetting.column(8).visible(true);
      agentBetting.column(14).visible(true);
      agentBetting.column(20).visible(true);
      agentBetting.column(26).visible(true);
      agentBetting.columns.adjust().draw();
    }
  },
});

$('#agentConnect').DataTable({
  language: korean,
  responsive: true,
  autowidth: true,
  ajax: {
    url: '/agent/connect',
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
    { data: '접속일시', responsivePriority: 1 },
    { data: '접속타입', responsivePriority: 1 },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: null, className: 'desktop dt-head-center' },
    { data: '접속 도메인', className: 'desktop' },
    { data: '접속 IP', className: 'desktop' },
    { data: '접속 기기', className: 'desktop' },
    { data: '접속 브라우저', className: 'desktop' },
    { data: '에이전트 타입', className: 'desktop' },
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
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: [0, 10],
      visible: false,
      searchable: false,
    },
    {
      target: [11, 12, 13, 14],
      visible: false,
    },
    {
      target: 3,
      render: function (data, type, row) {
        if (row['에이전트 타입'] == 0) {
          return `<button type='button' class='btn btn-sm id-btn asset-danger'>` + data + `</button>`;
        } else if (row['에이전트 타입'] == 1) {
          return `<button type='button' class='btn btn-sm id-btn asset-warning'>` + data + `</button>`;
        } else if (row['에이전트 타입'] == 2) {
          return `<button type='button' class='btn btn-sm id-btn asset-success'>` + data + `</button>`;
        } else if (row['에이전트 타입'] == 3) {
          return `<button type='button' class='btn btn-sm id-btn asset-primary'>` + data + `</button>`;
        }
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 5,
      width: 300,
      render: function (data, type, row) {
        if (clientType === 9) {
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
          switch (row.타입) {
            case 4:
              return `<button type='button' class='btn btn-sm btn-outline-dark asset-primary ms-2' style='cursor: default'>${row.브론즈}</button>`;
            case 3:
              return `<button type='button' class='btn btn-sm btn-outline-dark asset-success ms-2' style='cursor: default'>${row.실버}</button>`;
            case 2:
              return `<button type='button' class='btn btn-sm btn-outline-dark asset-warning ms-2' style='cursor: default'>${row.골드}</button>`;
            case 1:
              return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;
          }
        }
      },
    },
    {
      target: 7,
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
      target: [1, 2, 3, 4, 6, 7, 8, 9, 10],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 7, 8, 9],
      orderable: false,
    },
  ],
  initComplete: function () {
    if (clientType !== 9) {
      this.api().columns(5).header().to$().text('상위 에이전트');
    }
  },
});

$('#agentBlock').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/agent/block',
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
      render: function (data) {
        return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
      },
    },
    {
      target: 6,
      width: 270,
      render: function (data, type, row) {
        if (row.골드 == null) {
          return null;
        } else if (row.실버 == null) {
          return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button>`;
        } else if (row.브론즈 == null) {
          return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button>`;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark asset-danger ms-2' style='cursor: default'>${row.플래티넘}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-warning' style='cursor: default'>${row.골드}</button><button type='button' class='btn btn-sm btn-outline-dark ms-2 asset-success' style='cursor: default'>${row.실버}</button>`;
        }
      },
    },
    {
      target: [11, 12],
      className: 'dt-body-right',
      width: 110,
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
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5, 6, 7, 8, 9, 10, 13],
      orderable: false,
    },
  ],
  drawCallback: function () {
    initPopover();
  },
});

// 트리뷰 저장
[agentInfo, agentAsset, agentCommission, agentBetting].forEach((table) => {
  table.on('draw', function () {
    const closedNodesStr = localStorage.getItem('KEY') || '[]';
    const closedNodes = JSON.parse(closedNodesStr).map(String);

    // 모든 노드 가져오기
    const allNodes = $('[data-node-id]')
      .map(function () {
        return String($(this).data('node-id'));
      })
      .get();

    // 모든 노드를 순회
    for (const node of allNodes) {
      const elem = $(`tr[data-node-id='${node}']`);
      const pid = elem.data('node-pid');
      let parentNode = $(`[data-node="${pid}"]`);

      if (!closedNodes.includes(String(pid))) {
        let parentNode = $(`[data-node-id="${pid}"]`);
        if (parentNode.hasClass('simple-tree-table-closed')) {
          parentNode.removeClass('simple-tree-table-closed').addClass('simple-tree-table-opened');
        }
        elem.css('display', ''); // 보이는 상태로 설정
      } else {
        if (parentNode.hasClass('simple-tree-table-opened')) {
          parentNode.removeClass('simple-tree-table-opened').addClass('simple-tree-table-closed');
        }
        elem.css('display', 'none');

        // closedNodes에 추가 (노드가 닫혀 있지 않을 경우에만)
        if (!closedNodes.includes(node)) {
          closedNodes.push(node);
        }
      }
    }

    // closedNodes 업데이트
    localStorage.setItem('KEY', JSON.stringify(closedNodes));
  });
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
