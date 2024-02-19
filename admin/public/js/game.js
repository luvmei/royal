window.addEventListener('DOMContentLoaded', (event) => {
  // #region Select2 초기화
  $('#selectProviderName').select2({
    dropdownParent: $('#providerModal'),
    placeholder: '프로바이더 선택(다중선택 가능)',
    width: '100%',
    ajax: {
      url: '/game/providerlist',
      type: 'POST',
      dataType: 'json',
      delay: 250,
      processResults: function (data) {
        let providers = data.map(function (item) {
          return { id: item.provider, text: item.provider };
        });
        providers.unshift({ id: 'all', text: '전체 선택' });

        return {
          results: providers.map((item) => ({
            id: item.id,
            text: item.text,
          })),
        };
      },
      cache: true,
    },
  });

  $('#selectDisplayState').select2({
    dropdownParent: $('#providerModal'),
    placeholder: '노출상태',
    width: '100%',
    minimumResultsForSearch: Infinity,
  });
  // #endregion

  // #region 사이드바 토글
  const sidebarToggle = document.body.querySelector('#sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
    });
  }
  // #endregion

  collapseSideMenu();
  initPopover();

  // #region 게임리스트 업데이트
  document.querySelector('#updateGameList').innerHTML = '리스트 업데이트';

  document.querySelector('#updateGameList').addEventListener('click', () => {
    spinnerToggle();
    document.querySelector('#boardConfirm').innerHTML = `<h5>리스트 업데이트는 약 5분정도 소요됩니다</h5>
        <h6>소요시간이 지난 후 확인해주세요</h6>`;
        $('#boardConfirmModal').modal('show');
    $.ajax({
      method: 'POST',
      url: '/game/updategamelist',
    })
      .done(function (result) {
        $('#gameSlot').DataTable().ajax.reload(null, false);
        spinnerToggle();
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  });
  // #endregion

  // #region 프로바이더 보이기/감추기 설정
  document.querySelector('#selectProvider').innerHTML = '프로바이더 노출설정';

  document.querySelector('#selectProvider').addEventListener('click', () => {
    $('#providerModal').modal('show');
  });

  let provider_form = document.querySelector('#providerDisplayChangeForm');

  //? 프로바이더 보이기/감추기/예약/예약취소 실행
  let timers = [];
  provider_form.addEventListener('submit', function (e) {
    e.preventDefault();

    let provider_data = $('#providerDisplayChangeForm').serialize();
    provider_data += `&startDate=${startDate}&endDate=${endDate}`;
    $.ajax({
      method: 'POST',
      url: '/game/providerdisplay',
      data: provider_data,
    })
      .done(function (result) {
        openConfirmModal(result.msg);

        if (result.reserved) {
          $('#providerModal').modal('hide');
          $('#gameSlot').DataTable().ajax.reload(null, false);

          let startTimer = setTimeout(() => {
            $('#gameSlot').DataTable().ajax.reload(null, false);
            timers.push(startTimer);
            console.log('예약 점검시작(체크해제 됨)');
          }, result.startTimer);

          let endTimer = setTimeout(() => {
            $('#gameSlot').DataTable().ajax.reload(null, false);
            timers.push(endTimer);
            console.log('예약 점검 종료(체크 됨)');
          }, result.endTimer);
        }

        if (result.provider || result.cancel) {
          $('#providerModal').modal('hide');
          $('#gameSlot').DataTable().ajax.reload(null, false);
        }
      })
      .fail(function (err) {
        console.log(err);
      });
  });

  //? 시계
  let clock;
  function updateTime() {
    document.getElementById('clock').innerHTML = new Date().toLocaleTimeString();
  }

  $('#providerModal').on('show.bs.modal', function (e) {
    updateTime();
    clock = setInterval(updateTime, 1000);
  });

  $('#providerModal').on('hidden.bs.modal', function (e) {
    $('#selectProviderName').val(null).trigger('change');
    $('#selectDisplayState').val(null).trigger('change');
    $('#reserve').prop('checked', false);
    $('#cancelReserve').prop('checked', false);
    $('#reserve').prop('disabled', false);
    $('#cancelReserve').prop('disabled', false);
    $('#selectDisplayState').prop('disabled', false);
    clearInterval(clock);
    document.querySelector('#selectProviderName').disabled = false;
  });

  // #endregion

  // #region 예약 체크에 따른 날짜필드 및 상태필드 활성화/비활성화
  $('#reserve').change(function () {
    if ($(this).is(':checked')) {
      document.querySelector('#reserve').value = 'true';
      $('#cancelReserve').prop('disabled', true);
      $('#reserveDateSelector').prop('disabled', false);
      $('#selectDisplayState').prop('disabled', true);
      $('#selectDisplayState').prop('required', false);
    } else {
      document.querySelector('#reserve').value = 'false';
      $('#cancelReserve').prop('disabled', false);
      $('#reserveDateSelector').prop('disabled', true);
      $('#selectDisplayState').prop('disabled', false);
      $('#selectDisplayState').prop('required', true);
    }
  });

  $('#cancelReserve').change(function () {
    if ($(this).is(':checked')) {
      document.querySelector('#cancelReserve').value = 'true';
      $('#reserve').prop('disabled', true);
      $('#reserveDateSelector').prop('disabled', true);
      $('#selectDisplayState').prop('disabled', true);
      $('#selectDisplayState').prop('required', false);
      document.querySelector('#selectProviderName').disabled = true;
    } else {
      document.querySelector('#cancelReserve').value = 'false';
      $('#reserve').prop('disabled', false);
      $('#reserveDateSelector').prop('disabled', false);
      $('#selectDisplayState').prop('disabled', false);
      $('#selectDisplayState').prop('required', true);
    }
  });
  // #endregion

  // #region 개별 보이기/감추기 설정
  $('table').on('click', 'tbody tr .form-check-input', function () {
    rowData = $('table').DataTable().row($(this).closest('tr')).data();
    changeGameDisplayState(rowData);
  });

  function changeGameDisplayState(rowData) {
    $.ajax({
      method: 'POST',
      url: '/game/display',
      data: { IDX: rowData.IDX, displayState: rowData.공개여부 },
    })
      .done(function (result) {
        console.log(result.msg);
        openConfirmModal(result.msg);
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  }

  function openConfirmModal(params) {
    document.querySelector('#boardConfirm').innerHTML = params;
    $('#boardConfirmModal').modal('show');
  }
  // #endregion
});

$('#gameSlot').DataTable({
  language: korean,
  responsive: true,
  scrollY: '70vh',
  ajax: {
    url: '/game/table',
    method: 'POST',
    data: { type: 'slot' },
    dataSrc: '',
  },
  dom: 'l<"#updateGameList.btn btn-sm asset-success ms-4 d-none d-lg-inline">f<"#selectProvider.btn btn-sm asset-primary float-end me-4">rtip',
  columns: [
    { data: 'IDX' },
    { data: '공급사' },
    { data: '코드' },
    { data: '제목' },
    { data: '영문제목' },
    { data: '등록일' },
    { data: '인기도' },
    { data: '공개여부' },
    { data: '점검시작' },
    { data: '점검종료' },
  ],
  pageLength: 300,
  lengthMenu: [
    [300, 500, 1000, -1],
    [300, 500, 1000, 'ALL'],
  ],
  order: [[0, 'desc']],
  columnDefs: [
    { target: 0, visible: false, orderable: false },
    {
      target: 1,
      render: function (data, type, row, meta) {
        if (row.공급사이름) {
          return row.공급사이름.replace('_slot', '').replace('_casino', '').toUpperCase();
        } else {
          return data;
        }
      },
    },
    {
      target: 2,
      width: 100,
    },
    {
      target: 4,
      render: function (data, type, row, meta) {
        if (data == '') {
          return row.제목;
        } else {
          return data;
        }
      },
    },
    {
      target: 7,
      render: function (data, type, row, meta) {
        if (data === 1) {
          return `<div>
          <input class="form-check-input" type="checkbox" value="" checked>
        </div>`;
        } else {
          return `<div>
          <input class="form-check-input" type="checkbox" value="">
        </div>`;
        }
      },
      className: 'text-center',
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      orderable: false,
    },
  ],
});
