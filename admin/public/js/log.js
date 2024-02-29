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

  if (document.querySelector('.dateInput')) {
    document.querySelector('.dateInput').innerHTML =
      '<input type="text" class="text-center w-100" style="padding: 3px 0" id="dateSelector" name="date" value=""/>';
  }

  if (document.querySelector('.dateTimeInput')) {
    document.querySelector('.dateTimeInput').innerHTML =
      '<input type="text" class="text-center w-100" style="padding: 3px 0" id="dateTimeSelector" name="date" value=""/>';
  }
});

let balanceLog = $('#balanceLog').DataTable({
  language: korean,
  responsive: true,
  scrollY: '72vh',
  scrollCollapse: true,
  ajax: {
    url: '/log/balance',
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
      if (data.고유번호 == balanceLog.row(dataIndex - 1).data().고유번호) {
        if (balanceLog.row(dataIndex - 1).node().style.backgroundColor == 'rgb(238, 238, 238)') {
          $(row).css('background-color', '#eeeeee');
        }
      } else if (data.고유번호 != balanceLog.row(dataIndex - 1).data().고유번호) {
        if (balanceLog.row(dataIndex - 1).node().style.backgroundColor != 'rgb(238, 238, 238)') {
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

let pointLog = $('#pointLog').DataTable({
  language: korean,
  responsive: true,
  scrollY: '72vh',
  scrollCollapse: true,
  ajax: {
    url: '/log/point',
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
      target: [9, 10, 14, 16, 17, 18, 19],
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
      target: [9, 11, 14],
      width: 120,
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
      pointLog.column(8).header().innerHTML = `발생 금액<br><span class="text-primary">베팅마진 적용</span>`;
      pointLog.column(9).header().innerHTML = `기록시점<br>베팅마진 요율(%)
      <i class="bi bi-question-circle-fill text-primary" data-bs-toggle="tooltip" data-bs-placement="top"
      data-bs-custom-class="custom-tooltip"
      data-bs-title="적용되는 베팅마진 요율은 발생아이디 상위 에이전트의 베팅마진 요율입니다"></i>
      `;
      pointLog.column(13).header().innerHTML = `발생 포인트<br><span class="text-primary">롤링마진 적용</span>`;
      pointLog.column(14).header().innerHTML = `기록시점<br>롤링마진 요율(%)
      <i class="bi bi-question-circle-fill text-primary" data-bs-toggle="tooltip" data-bs-placement="top"
      data-bs-custom-class="custom-tooltip"
      data-bs-title="적용되는 롤링마진 요율은 에이전트의 롤링마진 요율입니다"></i>
      `;
      pointLog.column(10).header().innerHTML = `베팅마진<br>적용금액`;
      pointLog.column(9).visible(true);
      pointLog.column(9).header().classList.add('text-primary');

      pointLog.column(14).visible(true);
      pointLog.column(14).header().classList.add('text-primary');
      pointLog.columns.adjust().draw();
    } else if (clientType != 9) {
      pointLog.column(8).header().innerHTML = `발생 금액`;
      pointLog.column(13).header().innerHTML = `발생 포인트`;
      pointLog.columns.adjust().draw();
    }
  },
});

// $('#detailBettingLog').DataTable({
//   language: korean,
//   responsive: true,
//   scrollY: '72vh',
//   scrollCollapse: true,
//   ajax: {
//     url: '/log/detail',
//     // beforeSend: function () {
//     //   spinnerToggle(true);
//     // },
//     // complete: function () {
//     //   spinnerToggle(false);
//     // },
//     method: 'POST',
//     data: function (d) {
//       d.startDate = startDate;
//       d.endDate = endDate;
//       return d;
//     },
//     dataSrc: '',
//   },
//   dom: '<"dateInput float-start dateWidth me-2">lfrtip',
//   columns: [
//     { data: 'IDX' },
//     { data: '베팅시간', className: 'desktop' },
//     { data: '세션ID', className: 'desktop' },
//     { data: '아이디', responsivePriority: 1 },
//     { data: '프로바이더', className: 'desktop' },
//     { data: '게임', className: 'desktop' },
//     { data: '트랜젝션ID', className: 'desktop' },
//     { data: '베팅', responsivePriority: 2 },
//     { data: '획득', responsivePriority: 3 },
//     { data: '결과', responsivePriority: 4 },
//     { data: 'node_id' },
//   ],
//   pageLength: 100,
//   lengthMenu: [
//     [100, 200, 300, -1],
//     [100, 200, 300, 'ALL'],
//   ],
//   order: [[0, 'desc']],
//   columnDefs: [
//     {
//       target: 0,
//       visible: false,
//       searchable: false,
//     },
//     { target: 10, visible: false },
//     {
//       target: 3,
//       render: function (data) {
//         return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
//       },
//     },
//     {
//       target: 9,
//       className: 'fw-semibold',
//       createdCell: function (td, cellData, rowData, row, col) {
//         if (cellData < 0) {
//           $(td).addClass('text-danger');
//         }
//       },
//     },
//     {
//       target: [1, 2, 3, 4, 5, 6, 7, 8, 9],
//       className: 'dt-head-center dt-body-center',
//     },
//     {
//       target: [7, 8, 9],
//       className: 'dt-body-right',
//       render: $.fn.dataTable.render.number(','),
//     },
//     {
//       target: [2, 3, 4, 5, 6],
//       orderable: false,
//     },
//   ],
// });

// let detailLog = $('#detailSdBettingLog').DataTable({
//   language: korean,
//   responsive: true,
//   scrollY: '72vh',
//   scrollCollapse: true,
//   serverSide: true,
//   ajax: {
//     url: '/log/detail',
//     beforeSend: function () {
//       spinnerToggle(true);
//     },
//     complete: function () {
//       spinnerToggle(false);
//     },
//     method: 'POST',
//     data: function (d) {
//       d.startDate = startDate;
//       d.endDate = endDate;
//       return d;
//     },
//     // dataSrc: '',
//   },
//   dom: '<"dateInput float-start dateWidth me-2">lfrtip',
//   columns: [
//     { data: 'IDX' },
//     { data: '발생시간', className: 'desktop' },
//     { data: '아이디', responsivePriority: 1 },
//     { data: '트랜젝션ID', className: 'desktop' },
//     { data: '라운드ID', className: 'desktop' },
//     { data: '프로바이더', className: 'desktop' },
//     { data: '게임타입', className: 'desktop' },
//     { data: '게임명', className: 'desktop' },
//     { data: '내역타입', className: 'desktop' },
//     { data: '금액', responsivePriority: 2 },
//     { data: '이전보유금', responsivePriority: 3 },
//     { data: '이후보유금', responsivePriority: 4 },
//     { data: 'node_id' },
//   ],
//   pageLength: 300,
//   lengthMenu: [
//     [300, 500, 1000, -1],
//     [300, 500, 1000, 'ALL'],
//   ],
//   order: [[0, 'desc']],
//   createdRow: function (row, data, dataIndex) {
//     if (data.내역타입 == 'bet') {
//       $(row).addClass('bg-mistyred');
//     } else if (data.내역타입 == 'tie') {
//       $(row).addClass('bg-mistygreen');
//     } else if (data.내역타입 == 'win') {
//       $(row).addClass('bg-mistyblue');
//     }
//   },
//   columnDefs: [
//     {
//       target: 0,
//       visible: false,
//       searchable: false,
//     },
//     { target: [3, 12], visible: false },
//     {
//       target: 2,
//       render: function (data, type, row) {
//         if (data == 'admin') {
//           return `<button type='button' class='btn btn-sm id-btn asset-dark'>` + data + `</button>`;
//         } else if (row.회원타입 == 0) {
//           return `<button type='button' class='btn btn-sm id-btn asset-danger'>` + data + `</button>`;
//         } else if (row.회원타입 == 1) {
//           return `<button type='button' class='btn btn-sm id-btn asset-warning'>` + data + `</button>`;
//         } else if (row.회원타입 == 2) {
//           return `<button type='button' class='btn btn-sm id-btn asset-success'>` + data + `</button>`;
//         } else if (row.회원타입 == 3) {
//           return `<button type='button' class='btn btn-sm id-btn asset-primary'>` + data + `</button>`;
//         } else if (row.회원타입 == 4) {
//           if (row.가입코드) {
//             return `<div class="btn-group" role="group" aria-label="Basic example">
//               <button type="button" class="btn btn-sm online-tag">온</button>
//               <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
//           } else if (row.가입코드 == '') {
//             return `<div class="btn-group" role="group" aria-label="Basic example">
//               <button type="button" class="btn btn-sm local-tag">매장</button>
//               <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
//           } else {
//             return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
//           }
//         }
//       },
//     },
//     {
//       target: 4,
//       width: 250,
//     },
//     {
//       target: 6,
//       render: function (data) {
//         if (data == 'casino') {
//           return `<button type='button' class='btn btn-sm btn-outline-danger'>카지노</button>`;
//         } else if (data == 'slot') {
//           return `<button type='button' class='btn btn-sm btn-outline-primary'>슬롯</button>`;
//         }
//       },
//     },
//     {
//       target: 7,
//       render: function (data) {
//         if (data == 'Baccarat') {
//           return '바카라';
//         } else {
//           return data;
//         }
//       },
//     },
//     {
//       target: 8,
//       render: function (data, type, row) {
//         if(data == 'win' && row.금액 == 0){
//           return `<button type='button' class='btn btn-sm asset-primary'>LOSE</button>`;
//         } else if (data == 'bet') {
//           return `<button type='button' class='btn btn-sm asset-danger'>BET</button>`;
//         } else if (data == 'win') {
//           return `<button type='button' class='btn btn-sm asset-primary'>WIN</button>`;
//         } else if (data == 'tie') {
//           return `<button type='button' class='btn btn-sm asset-success'>TIE</button>`;
//         }
//       },
//     },
//     {
//       target: 9,
//       className: 'fw-semibold',
//       createdCell: function (td, cellData, rowData, row, col) {
//         if (rowData.내역타입 === 'bet') {
//           $(td).addClass('text-danger');
//         }
//       },
//       render: function (data, type, row) {
//         let num = parseInt(data, 10); // 문자열을 숫자로 변환하고 소수점 이하를 제거합니다.
//         // num 숫자를 bold로 변환
//         if (row.내역타입 === 'Bet') {
//           return '- ' + num.toLocaleString('ko-KR'); // 숫자를 문자열로 변환하고 천 단위마다 쉼표를 추가합니다.
//         } else {
//           return num.toLocaleString('ko-KR'); // 숫자를 문자열로 변환하고 천 단위마다 쉼표를 추가합니다.
//         }
//       },
//     },
//     {
//       target: [10, 11],
//       render: function (data, type, row) {
//         let num = parseInt(data, 10);
//         return num.toLocaleString('ko-KR');
//       },
//     },
//     {
//       target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
//       className: 'dt-head-center dt-body-center',
//     },
//     {
//       target: [9, 10,11],
//       className: 'dt-body-right',
//     },
//     {
//       target: [2, 3, 4, 5, 6],
//       orderable: false,
//     },
//   ],
// });

let detailSprotLog = $('#detailSportBettingLog').DataTable({
  language: korean,
  responsive: true,
  scrollY: '72vh',
  scrollCollapse: true,
  serverSide: true,
  ajax: {
    url: '/log/detail',
    beforeSend: function () {
      spinnerToggle(true);
    },
    complete: function () {
      spinnerToggle(false);
    },
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.type = 'sport';
      return d;
    },
    // dataSrc: '',
  },
  dom: '<"dateTimeInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '발생시간', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
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
  order: [[0, 'desc']],
  createdRow: function (row, data, dataIndex) {
    if (data.내역타입 == 'bet') {
      $(row).addClass('bg-mistyred');
    } else if (data.내역타입 == 'tie') {
      $(row).addClass('bg-mistygreen');
    } else if (data.내역타입 == 'win') {
      $(row).addClass('bg-mistyblue');
    } else if (data.내역타입 == 'exceed_credit' || data.내역타입 == 'cancel') {
      $(row).addClass('bg-gray');
    }
  },
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    { target: [3, 12], visible: false },
    {
      target: 2,
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
      target: 4,
      width: 250,
    },
    {
      target: 6,
      render: function (data) {
        if (data == 'live-sport') {
          return `<button type='button' class='btn btn-sm btn-outline-success'>스포츠</button>`;
        } else if (data == 'casino') {
          return `<button type='button' class='btn btn-sm btn-outline-danger'>카지노</button>`;
        } else if (data == 'slot') {
          return `<button type='button' class='btn btn-sm btn-outline-primary'>슬롯</button>`;
        }
      },
    },
    {
      target: 7,
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
      render: function (data, type, row) {
        if (data == 'win' && row.금액 == 0) {
          return `<button type='button' class='btn btn-sm asset-primary'>LOSE</button>`;
        } else if (data == 'bet') {
          return `<button type='button' class='btn btn-sm asset-danger'>BET</button>`;
        } else if (data == 'win') {
          return `<button type='button' class='btn btn-sm asset-primary'>WIN</button>`;
        } else if (data == 'tie') {
          return `<button type='button' class='btn btn-sm asset-success'>TIE</button>`;
        } else if (data == 'exceed_credit') {
          return `<button type='button' class='btn btn-sm asset-dark'>초과환수</button>`;
        } else if (data == 'cancel') {
          return `<button type='button' class='btn btn-sm asset-dark'>베팅취소</button>`;
        }
      },
    },
    {
      target: 9,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData.내역타입 === 'bet') {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        let num = parseInt(data, 10); // 문자열을 숫자로 변환하고 소수점 이하를 제거합니다.
        // num 숫자를 bold로 변환
        if (row.내역타입 === 'Bet') {
          return '- ' + num.toLocaleString('ko-KR'); // 숫자를 문자열로 변환하고 천 단위마다 쉼표를 추가합니다.
        } else {
          return num.toLocaleString('ko-KR'); // 숫자를 문자열로 변환하고 천 단위마다 쉼표를 추가합니다.
        }
      },
    },
    {
      target: [10, 11],
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
      target: [9, 10, 11],
      className: 'dt-body-right',
    },
    {
      target: [2, 3, 4, 5, 6],
      orderable: false,
    },
  ],
});

let detailCasinoLog = $('#detailCasinoBettingLog').DataTable({
  language: korean,
  responsive: true,
  scrollY: '72vh',
  scrollCollapse: true,
  serverSide: true,
  ajax: {
    url: '/log/detail',
    beforeSend: function () {
      spinnerToggle(true);
    },
    complete: function () {
      spinnerToggle(false);
    },
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.type = 'casino';
      return d;
    },
    // dataSrc: '',
  },
  dom: '<"dateTimeInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '발생시간', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
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
    [0, 'desc'],[4, 'desc']
  ],
  createdRow: function (row, data, dataIndex) {
    if (data.내역타입 == 'bet') {
      $(row).addClass('bg-mistyred');
    } else if (data.내역타입 == 'tie') {
      $(row).addClass('bg-mistygreen');
    } else if (data.내역타입 == 'win') {
      $(row).addClass('bg-mistyblue');
    } else if (data.내역타입 == 'exceed_credit') {
      $(row).addClass('bg-gray');
    }
  },
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    { target: [3, 12], visible: false },
    {
      target: 2,
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
      target: 4,
      width: 250,
    },
    {
      target: 6,
      render: function (data) {
        if (data == 'live-sport') {
          return `<button type='button' class='btn btn-sm btn-outline-success'>스포츠</button>`;
        } else if (data == 'casino') {
          return `<button type='button' class='btn btn-sm btn-outline-danger'>카지노</button>`;
        } else if (data == 'slot') {
          return `<button type='button' class='btn btn-sm btn-outline-primary'>슬롯</button>`;
        }
      },
    },
    {
      target: 7,
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
      render: function (data, type, row) {
        if (data == 'win' && row.금액 == 0) {
          return `<button type='button' class='btn btn-sm asset-primary'>LOSE</button>`;
        } else if (data == 'bet') {
          return `<button type='button' class='btn btn-sm asset-danger'>BET</button>`;
        } else if (data == 'win') {
          return `<button type='button' class='btn btn-sm asset-primary'>WIN</button>`;
        } else if (data == 'tie') {
          return `<button type='button' class='btn btn-sm asset-success'>TIE</button>`;
        } else if (data == 'exceed_credit') {
          return `<button type='button' class='btn btn-sm asset-dark'>초과환수</button>`;
        } else if (data == 'cancel') {
          return `<button type='button' class='btn btn-sm asset-dark'>베팅취소</button>`;
        }
      },
    },
    {
      target: 9,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData.내역타입 === 'bet') {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        let num = parseInt(data, 10);
        if (row.내역타입 === 'Bet') {
          return '- ' + num.toLocaleString('ko-KR');
        } else {
          return num.toLocaleString('ko-KR');
        }
      },
    },
    {
      target: [10, 11],
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
      target: [9, 10, 11],
      className: 'dt-body-right',
    },
    {
      target: [2, 3, 4, 5, 6],
      orderable: false,
    },
  ],
});

let detailSlotLog = $('#detailSlotBettingLog').DataTable({
  language: korean,
  responsive: true,
  scrollY: '72vh',
  scrollCollapse: true,
  serverSide: true,
  ajax: {
    url: '/log/detail',
    beforeSend: function () {
      spinnerToggle(true);
    },
    complete: function () {
      spinnerToggle(false);
    },
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.type = 'slot';
      return d;
    },
    // dataSrc: '',
  },
  dom: '<"dateTimeInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '발생시간', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
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
  order: [[0, 'desc'], [4, 'desc']],
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
    { target: [12], visible: false },
    {
      target: 2,
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
      target: 4,
      width: 250,
    },
    {
      target: 6,
      render: function (data) {
        if (data == 'live-sport') {
          return `<button type='button' class='btn btn-sm btn-outline-success'>스포츠</button>`;
        } else if (data == 'casino') {
          return `<button type='button' class='btn btn-sm btn-outline-danger'>카지노</button>`;
        } else if (data == 'slot') {
          return `<button type='button' class='btn btn-sm btn-outline-primary'>슬롯</button>`;
        }
      },
    },
    {
      target: 7,
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
      render: function (data, type, row) {
        if (data == 'win' && row.금액 == 0) {
          return `<button type='button' class='btn btn-sm asset-primary'>LOSE</button>`;
        } else if (data == 'bet') {
          return `<button type='button' class='btn btn-sm asset-danger'>BET</button>`;
        } else if (data == 'win') {
          return `<button type='button' class='btn btn-sm asset-primary'>WIN</button>`;
        } else if (data == 'tie') {
          return `<button type='button' class='btn btn-sm asset-success'>TIE</button>`;
        } else if (data == 'exceed_credit') {
          return `<button type='button' class='btn btn-sm asset-dark'>초과환수</button>`;
        } else if (data == 'cancel') {
          return `<button type='button' class='btn btn-sm asset-dark'>베팅취소</button>`;
        }
      },
    },
    {
      target: 9,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (rowData.내역타입 === 'bet') {
          $(td).addClass('text-danger');
        }
      },
      render: function (data, type, row) {
        let num = parseInt(data, 10); // 문자열을 숫자로 변환하고 소수점 이하를 제거합니다.
        // num 숫자를 bold로 변환
        if (row.내역타입 === 'Bet') {
          return '- ' + num.toLocaleString('ko-KR'); // 숫자를 문자열로 변환하고 천 단위마다 쉼표를 추가합니다.
        } else {
          return num.toLocaleString('ko-KR'); // 숫자를 문자열로 변환하고 천 단위마다 쉼표를 추가합니다.
        }
      },
    },
    {
      target: [10, 11],
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
      target: [9, 10, 11],
      className: 'dt-body-right',
    },
    {
      target: [2, 3, 4, 5, 6],
      orderable: false,
    },
  ],
});

// let summaryLog = $('#summaryBettingLog').DataTable({
//   language: korean,
//   responsive: true,
//   scrollY: '70vh',
//   scrollCollapse: true,
//   ajax: {
//     url: '/log/summary',
//     method: 'POST',
//     data: function (d) {
//       d.startDate = startDateTime;
//       d.endDate = endDateTime;
//       return d;
//     },
//     dataSrc: '',
//   },
//   dom: '<"dateTimeInput float-start dateWidth me-2">lfrtip',
//   columns: [
//     { data: 'IDX' },
//     { data: '결과수신시간', className: 'desktop' },
//     { data: '아이디', responsivePriority: 1 },
//     { data: '닉네임', className: 'desktop' },
//     { data: '상위 에이전트', className: 'desktop' },
//     { data: '베팅타입', responsivePriority: 2 },
//     { data: '베팅', responsivePriority: 3 },
//     { data: '획득', responsivePriority: 4 },
//     { data: '결과', className: 'desktop' },
//     { data: '마진베팅', defaultContent: '' },
//     { data: '마진획득', defaultContent: '' },
//     { data: null, defaultContent: '' },
//     { data: '플래티넘' },
//     { data: '골드' },
//     { data: '실버' },
//     { data: '브론즈' },
//     { data: 'node_id' },
//   ],
//   pageLength: 100,
//   lengthMenu: [
//     [100, 200, 300, -1],
//     [100, 200, 300, 'ALL'],
//   ],
//   order: [[0, 'desc']],
//   columnDefs: [
//     {
//       target: 0,
//       visible: false,
//       searchable: false,
//     },
//     {
//       target: [6, 7, 8, 12, 13, 14, 15, 16],
//       visible: false,
//     },
//     {
//       target: 2,
//       width: 200,
//       render: function (data, type, row) {
//         if (data == 'admin') {
//           return `<button type='button' class='btn btn-sm id-btn asset-dark'>` + data + `</button>`;
//         } else if (row.회원타입 == 0) {
//           return `<button type='button' class='btn btn-sm id-btn asset-danger'>` + data + `</button>`;
//         } else if (row.회원타입 == 1) {
//           return `<button type='button' class='btn btn-sm id-btn asset-warning'>` + data + `</button>`;
//         } else if (row.회원타입 == 2) {
//           return `<button type='button' class='btn btn-sm id-btn asset-success'>` + data + `</button>`;
//         } else if (row.회원타입 == 3) {
//           return `<button type='button' class='btn btn-sm id-btn asset-primary'>` + data + `</button>`;
//         } else if (row.회원타입 == 4) {
//           if (row.가입코드) {
//             return `<div class="btn-group" role="group" aria-label="Basic example">
//               <button type="button" class="btn btn-sm online-tag">온</button>
//               <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
//           } else if (row.가입코드 == '') {
//             return `<div class="btn-group" role="group" aria-label="Basic example">
//               <button type="button" class="btn btn-sm local-tag">매장</button>
//               <button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button></div>`;
//           } else {
//             return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>${data}</button>`;
//           }
//         }
//       },
//     },
//     {
//       target: 5,
//       render: function (data) {
//         if (data == 's') {
//           return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>슬롯</button>`;
//         } else if (data == 'c') {
//           return `<button type='button' class='btn btn-sm text-danger border-danger' disabled>카지노</button>`;
//         }
//       },
//     },
//     {
//       target: 8,
//       className: 'fw-semibold',
//       createdCell: function (td, cellData, rowData, row, col) {
//         if (cellData < 0) {
//           $(td).addClass('text-danger');
//         }
//       },
//     },
//     {
//       target: [6, 7, 8, 9, 10, 11],
//       width: 160,
//     },
//     {
//       target: 11,
//       className: 'fw-semibold',
//       createdCell: function (td, cellData, rowData, row, col) {
//         if (rowData.결과 < 0) {
//           $(td).addClass('text-danger');
//         }
//       },
//       render: function (data, type, row) {
//         return row.결과.toLocaleString('ko-KR');
//       },
//     },
//     {
//       target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
//       className: 'dt-head-center dt-body-center',
//     },
//     {
//       target: [6, 7, 8, 9, 10, 11],
//       className: 'dt-body-right',
//       render: $.fn.dataTable.render.number(','),
//     },
//     {
//       target: [2, 3, 4, 5],
//       orderable: false,
//     },
//   ],
//   initComplete: function () {
//     if (clientType == 9) {
//       let thElement = document.querySelector('#summaryMaginHeader');
//       thElement.innerText = '베팅마진 적용';
//       thElement.classList.remove('d-none');

//       summaryLog.columns([6, 7, 8]).visible(true);

//       for (let i = 9; i <= 11; i++) {
//         summaryLog.column(i).header().classList.add('text-danger');
//       }

//       summaryLog.columns.adjust().draw();
//     }
//   },
//   footerCallback: function (row, data, start, end, display) {
//     var api = this.api();

//     let intVal = function (i) {
//       return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
//     };

//     betTotal = api
//       .rows({ page: 'current' })
//       .data()
//       .toArray()
//       .reduce(function (sum, row) {
//         return sum + intVal(row.베팅);
//       }, 0);

//     winTotal = api
//       .rows({ page: 'current' })
//       .data()
//       .toArray()
//       .reduce(function (sum, row) {
//         return sum + intVal(row.획득);
//       }, 0);

//     betWinTotal = api
//       .rows({ page: 'current' })
//       .data()
//       .toArray()
//       .reduce(function (sum, row) {
//         return sum + intVal(row.결과);
//       }, 0);

//     mBetTotal = api
//       .rows({ page: 'current' })
//       .data()
//       .toArray()
//       .reduce(function (sum, row) {
//         return sum + intVal(row.마진베팅);
//       }, 0);

//     mWinTotal = api
//       .rows({ page: 'current' })
//       .data()
//       .toArray()
//       .reduce(function (sum, row) {
//         return sum + intVal(row.마진획득);
//       }, 0);

//     $(api.column(1).footer().classList.add('text-center'));
//     $(api.column(1).footer()).html(`선택기간 합계 :`);

//     $(api.column(6).footer()).html(`${betTotal.toLocaleString('ko-KR')} 원`);

//     $(api.column(7).footer()).html(`${winTotal.toLocaleString('ko-KR')} 원`);

//     $(api.column(8).footer()).html(`${betWinTotal.toLocaleString('ko-KR')} 원`);

//     $(api.column(9).footer()).html(`${mBetTotal.toLocaleString('ko-KR')} 원  `);

//     $(api.column(10).footer()).html(`${mWinTotal.toLocaleString('ko-KR')} 원`);

//     $(api.column(11).footer()).html(`${betWinTotal.toLocaleString('ko-KR')} 원`);
//   },
// });

let summarySportLog = $('#summarySportBettingLog').DataTable({
  language: korean,
  responsive: true,
  scrollY: '70vh',
  scrollCollapse: true,
  serverSide: true,
  ajax: {
    url: '/log/summary',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.type = 'sport';
      return d;
    },
    // dataSrc: '',
  },
  dom: '<"dateTimeInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '결과수신시간', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: '상위 에이전트', className: 'desktop' },
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
      target: [6, 7, 8, 12, 13, 14, 15, 16],
      visible: false,
    },
    {
      target: 1,
      width: 80,
    },
    {
      target: [2, 3, 4, 5],
      width: 140,
    },
    {
      target: 2,
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
      target: 5,
      render: function (data) {
        if (data == 'sp') {
          return `<button type='button' class='btn btn-sm text-success border-success' disabled>스포츠</button>`;
        } else if (data == 's') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>슬롯</button>`;
        } else if (data == 'c') {
          return `<button type='button' class='btn btn-sm text-danger border-danger' disabled>카지노</button>`;
        }
      },
    },
    {
      target: 8,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (cellData < 0) {
          $(td).addClass('text-danger');
        }
      },
    },
    {
      target: [6, 7, 8],
      width: 120,
    },
    {
      target: [9, 10, 11],
      width: 100,
    },
    {
      target: 11,
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
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [6, 7, 8, 9, 10, 11],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [2, 3, 4, 5],
      orderable: false,
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      let thElement = document.querySelector('#summaryMaginHeader');
      thElement.innerText = '베팅마진 적용';
      thElement.classList.remove('d-none');

      summarySportLog.columns([6, 7, 8]).visible(true);

      for (let i = 9; i <= 11; i++) {
        summarySportLog.column(i).header().classList.add('text-danger');
      }

      summarySportLog.columns.adjust().draw();
    }
  },
  footerCallback: function (row, data, start, end, display) {
    var api = this.api();

    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    betTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.베팅);
      }, 0);

    winTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.획득);
      }, 0);

    betWinTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.결과);
      }, 0);

    mBetTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.마진베팅);
      }, 0);

    mWinTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.마진획득);
      }, 0);

    $(api.column(1).footer().classList.add('text-center'));
    $(api.column(1).footer()).html(`선택기간 합계 :`);

    $(api.column(6).footer()).html(`${betTotal.toLocaleString('ko-KR')}`);

    $(api.column(7).footer()).html(`${winTotal.toLocaleString('ko-KR')}`);

    $(api.column(9).footer()).html(`${mBetTotal.toLocaleString('ko-KR')}`);

    $(api.column(10).footer()).html(`${mWinTotal.toLocaleString('ko-KR')}`);

    let netAmountClass = betWinTotal < 0 ? 'text-danger' : '';

    $(api.column(11).footer()).html(`<span class="${netAmountClass}">${betWinTotal.toLocaleString('ko-KR')}</span>`);
  },
});

let summaryCasinoLog = $('#summaryCasinoBettingLog').DataTable({
  language: korean,
  responsive: true,
  scrollY: '70vh',
  scrollCollapse: true,
  serverSide: true,
  ajax: {
    url: '/log/summary',
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.type = 'casino';
      return d;
    },
    // dataSrc: '',
  },
  dom: '<"dateTimeInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '결과수신시간', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: '상위 에이전트', className: 'desktop' },
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
      target: [6, 7, 8, 12, 13, 14, 15, 16],
      visible: false,
    },
    {
      target: 1,
      width: 80,
    },
    {
      target: [2, 3, 4, 5],
      width: 140,
    },
    {
      target: 2,
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
      target: 5,
      render: function (data) {
        if (data == 'sp') {
          return `<button type='button' class='btn btn-sm text-success border-success' disabled>스포츠</button>`;
        } else if (data == 's') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>슬롯</button>`;
        } else if (data == 'c') {
          return `<button type='button' class='btn btn-sm text-danger border-danger' disabled>카지노</button>`;
        }
      },
    },
    {
      target: 8,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (cellData < 0) {
          $(td).addClass('text-danger');
        }
      },
    },
    {
      target: [6, 7, 8],
      width: 120,
    },
    {
      target: [9, 10, 11],
      width: 100,
    },
    {
      target: 11,
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
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [6, 7, 8, 9, 10, 11],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [2, 3, 4, 5],
      orderable: false,
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      let thElement = document.querySelector('#summaryMaginHeader');
      thElement.innerText = '베팅마진 적용';
      thElement.classList.remove('d-none');

      summaryCasinoLog.columns([6, 7, 8]).visible(true);

      for (let i = 9; i <= 11; i++) {
        summaryCasinoLog.column(i).header().classList.add('text-danger');
      }
      setTimeout(() => {
        summaryCasinoLog.columns.adjust().draw();
      }, 100);
    }
  },
  footerCallback: function (row, data, start, end, display) {
    var api = this.api();

    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    betTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.베팅);
      }, 0);

    winTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.획득);
      }, 0);

    betWinTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.결과);
      }, 0);

    mBetTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.마진베팅);
      }, 0);

    mWinTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.마진획득);
      }, 0);

    $(api.column(1).footer().classList.add('text-center'));
    $(api.column(1).footer()).html(`선택기간 합계 :`);

    $(api.column(6).footer()).html(`${betTotal.toLocaleString('ko-KR')}`);

    $(api.column(7).footer()).html(`${winTotal.toLocaleString('ko-KR')}`);

    $(api.column(9).footer()).html(`${mBetTotal.toLocaleString('ko-KR')}`);

    $(api.column(10).footer()).html(`${mWinTotal.toLocaleString('ko-KR')}`);

    let netAmountClass = betWinTotal < 0 ? 'text-danger' : '';

    $(api.column(11).footer()).html(`<span class="${netAmountClass}">${betWinTotal.toLocaleString('ko-KR')}</span>`);
  },
});

let summarySlotLog = $('#summarySlotBettingLog').DataTable({
  language: korean,
  responsive: true,
  scrollY: '70vh',
  scrollCollapse: true,
  serverSide: true,
  ajax: {
    url: '/log/summary',
    beforeSend: function () {
      spinnerToggle(true);
    },
    complete: function () {
      spinnerToggle(false);
    },
    method: 'POST',
    data: function (d) {
      d.startDate = startDateTime;
      d.endDate = endDateTime;
      d.type = 'slot';
      return d;
    },
    // dataSrc: '',
  },
  dom: '<"dateTimeInput float-start dateWidth me-2">lfrtip',
  columns: [
    { data: 'IDX' },
    { data: '결과수신시간', className: 'desktop' },
    { data: '아이디', responsivePriority: 1 },
    { data: '닉네임', className: 'desktop' },
    { data: '상위 에이전트', className: 'desktop' },
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
  pageLength: 300,
  lengthMenu: [300, 500, 1000],
  order: [[0, 'desc']],
  columnDefs: [
    {
      target: 0,
      visible: false,
      searchable: false,
    },
    {
      target: [6, 7, 8, 12, 13, 14, 15, 16],
      visible: false,
    },
    {
      target: 1,
      width: 80,
    },
    { target: [2, 3, 4, 5], width: 140 },
    {
      target: 2,
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
      target: 5,
      render: function (data) {
        if (data == 'sp') {
          return `<button type='button' class='btn btn-sm text-success border-success' disabled>스포츠</button>`;
        } else if (data == 's') {
          return `<button type='button' class='btn btn-sm text-primary border-primary' disabled>슬롯</button>`;
        } else if (data == 'c') {
          return `<button type='button' class='btn btn-sm text-danger border-danger' disabled>카지노</button>`;
        }
      },
    },
    {
      target: 8,
      className: 'fw-semibold',
      createdCell: function (td, cellData, rowData, row, col) {
        if (cellData < 0) {
          $(td).addClass('text-danger');
        }
      },
    },
    {
      target: [6, 7, 8],
      width: 120,
    },
    {
      target: [9, 10, 11],
      width: 100,
    },
    {
      target: 11,
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
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [6, 7, 8, 9, 10, 11],
      className: 'dt-body-right',
      render: $.fn.dataTable.render.number(','),
    },
    {
      target: [2, 3, 4, 5],
      orderable: false,
    },
  ],
  initComplete: function () {
    if (clientType == 9) {
      let thElement = document.querySelector('#summaryMaginHeader');
      thElement.innerText = '베팅마진 적용';
      thElement.classList.remove('d-none');

      summarySlotLog.columns([6, 7, 8]).visible(true);

      for (let i = 9; i <= 11; i++) {
        summarySlotLog.column(i).header().classList.add('text-danger');
      }
      setTimeout(() => {
        summarySlotLog.columns.adjust().draw();
      }, 100);
    }
  },
  footerCallback: function (row, data, start, end, display) {
    var api = this.api();

    let intVal = function (i) {
      return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
    };

    betTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.베팅);
      }, 0);

    winTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.획득);
      }, 0);

    betWinTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.결과);
      }, 0);

    mBetTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.마진베팅);
      }, 0);

    mWinTotal = api
      .rows({ page: 'current' })
      .data()
      .toArray()
      .reduce(function (sum, row) {
        return sum + intVal(row.마진획득);
      }, 0);

    $(api.column(1).footer().classList.add('text-center'));
    $(api.column(1).footer()).html(`선택기간 합계 :`);

    $(api.column(6).footer()).html(`${betTotal.toLocaleString('ko-KR')}`);

    $(api.column(7).footer()).html(`${winTotal.toLocaleString('ko-KR')}`);

    $(api.column(9).footer()).html(`${mBetTotal.toLocaleString('ko-KR')}`);

    $(api.column(10).footer()).html(`${mWinTotal.toLocaleString('ko-KR')}`);

    let netAmountClass = betWinTotal < 0 ? 'text-danger' : '';

    $(api.column(11).footer()).html(`<span class="${netAmountClass}">${betWinTotal.toLocaleString('ko-KR')}</span>`);
  },
});
