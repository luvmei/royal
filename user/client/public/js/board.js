// #region 공지사항
//? 공지사항리스트 테이블(dataTable)
$('#noticeList').DataTable({
  language: korean,
  responsive: true,
  autoWidth: false, // 자동 너비 계산 비활성화

  ajax: {
    url: '/board/list',
    method: 'POST',
    data: { type: 'notice' },
    dataSrc: '',
  },
  dom: 'tip',
  columns: [
    { data: 'IDX' },
    { data: '작성일자', className: 'desktop' },
    { data: '종류', responsivePriority: 1 },
    { data: '제목', responsivePriority: 2 },
    { data: null, responsivePriority: 4 },
    { data: '내용', className: 'desktop' },
    { data: '파일이름', className: 'desktop' },
  ],
  pageLength: 10,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: [0, 5, 6], visible: false },
    {
      target: 1,
      render: function (data) {
        return data.slice(0, 7);
      },
    },
    {
      target: 2,
      render: function (data) {
        if (data == '공지') {
          return `<button class='btn btn-sm btn-outline-dark disabled'>${data}</button>`;
        } else if (data == '이벤트') {
          return `<button class='btn btn-sm btn-outline-primary disabled'>${data}</button>`;
        } else if (data == '점검') {
          return `<button class='btn btn-sm btn-outline-danger disabled'>${data}</button>`;
        }
      },
    },
    {
      target: 3,
      width: 700,
    },
    {
      target: 4,
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
  noticeContent = $('#noticeList').DataTable().row($(this).parent('td')).data();
  buildNoticePopup(noticeContent);
});
// #endregion

// #region 문의
//? 문의리스트 테이블(dataTable)
$('#questionList').DataTable({
  autoWidth: false,
  language: korean,
  responsive: true,
  ajax: {
    url: '/board/list',
    method: 'POST',
    data: { type: 'question' },
    dataSrc: '',
  },
  dom: 'tip',
  columns: [
    { data: 'IDX' },
    { data: '문의일시' },
    { data: '종류' },
    { data: '제목' },
    { data: '내용' },
    { data: '상태' },
    { data: '답변' },
    { data: '답변일시' },
  ],
  pageLength: 10,
  lengthMenu: [10, 50, 100],
  order: [[1, 'desc']],
  columnDefs: [
    { target: [0, 4, 6, 7], visible: false },
    {
      target: 2,
      render: function (data) {
        if (data === '베팅') {
          return `<button class='btn btn-sm btn-outline-primary questionType' disabled>베팅</button>`;
        } else if (data === '계좌') {
          return `<button class='btn btn-sm btn-outline-danger questionType' disabled>계좌</button>`;
        } else if (data === '계정') {
          return `<button class='btn btn-sm btn-outline-success questionType' disabled>계정</button>`;
        } else if (data === '기타') {
          return `<button class='btn btn-sm btn-outline-warning questionType' disabled>기타</button>`;
        }
      },
    },
    {
      target: 5,
      render: function (data) {
        if (data == '유저문의') {
          return `<button class='btn btn-sm btn-danger questionState' disabled>답변대기</button>`;
        } else if (data == '답변완료') {
          return `<button class='btn btn-sm btn-primary questionState' disabled>답변완료</button>`;
        } else if (data == '답변확인') {
          return `<button class='btn btn-sm btn-primary questionState' disabled>답변완료</button>`;
        }
      },
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7],
      className: 'dt-head-center dt-body-center',
    },
    {
      target: [2, 3, 4, 5],
      orderable: false,
    },
  ],
  drawCallback: function (settings) {
    $('#questionModal tr').click(function () {
      let selectedQuestion = $('table').DataTable().row($(this)).data();

      switch (selectedQuestion.종류) {
        case '계좌':
          document.querySelector('#viewQuestionType').classList.add('asset-danger');
          break;
        case '베팅':
          document.querySelector('#viewQuestionType').classList.add('asset-primary');
          break;
        case '계정':
          document.querySelector('#viewQuestionType').classList.add('asset-success');
          break;
        case '기타':
          document.querySelector('#viewQuestionType').classList.add('asset-warning');
          break;
      }

      if (selectedQuestion.상태 == '유저문의') {
        document.querySelector('#viewQuestionLabel').textContent = `관리자가 확인 중입니다. 조금만 기다려주세요.`;
      } else {
        document.querySelector('#viewQuestionLabel').textContent = ` 답변 내용`;
      }

      console.log(selectedQuestion);
      document.querySelector('#viewQuestionType').value = selectedQuestion.종류;
      document.querySelector('#viewQuestionTitle').value = selectedQuestion.제목;
      document.querySelector('#viewQuestionContent').value = selectedQuestion.내용.replace(/\\/g, '');
      document.querySelector('#viewQuestionAnswer').value = selectedQuestion.답변.replace(/\\/g, '');

      $('#questionModal').modal('hide');
      $('#viewQuestionModal').modal('show');

      if (selectedQuestion.상태 == '답변완료') {
        changeQuestionState(selectedQuestion);
      }

      console.log(selectedQuestion);
    });
  },
});

//? 문의하기
if (document.querySelector('#reqQuestionForm')) {
  document.querySelector('#reqQuestionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let question_data = $('#reqQuestionForm').serialize();

    $.ajax({
      method: 'POST',
      url: '/board/question',
      data: question_data,
    })
      .done((result) => {
        document.querySelector('#confirm-text').innerHTML = `<h3>${result.message}</h3>`;
        $('#reqQuestionModal').modal('hide');
        $('#confirmModal').modal('show');

        socket.emit('to_admin', { userId: result.id, type: 'requestQuestion' });
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  });
}

//? 문의확인 닫기
$('#viewQuestionModal').on('hidden.bs.modal', function () {
  let viewQuestionType = document.querySelector('#viewQuestionType');
  let classList = viewQuestionType.classList;

  // asset-로 시작하는 클래스를 모두 삭제합니다.
  for (var i = 0; i < classList.length; i++) {
    if (classList[i].startsWith('asset-')) {
      classList.remove(classList[i]);
      i--; // 클래스가 삭제될 때 인덱스를 조정합니다.
    }
  }
});

//? 답변완료 > 유저확인 상태변경
function changeQuestionState(params) {
  $.ajax({
    method: 'POST',
    url: '/board/state',
    data: params,
  })
    .done((result) => {
      checkNoti();
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}
// #endregion

// #region 메세지
//? 메세지리스트 테이블(dataTable)
$('#messageList').DataTable({
  language: korean,
  responsive: true,
  autoWidth: false,
  ajax: {
    url: '/board/list',
    method: 'POST',
    data: { type: 'message' },
    dataSrc: '',
  },
  dom: 'tip',
  columns: [{ data: 'IDX' }, { data: '받은일시', className: 'desktop' }, { data: '종류' }, { data: '제목' }, { data: '내용' }, { data: '읽음여부' }],
  pageLength: 10,
  lengthMenu: [10, 50, 100],
  order: [[1, 'desc']],
  columnDefs: [
    { target: [0, 4], visible: false },
    { target: 1, width: 180 },
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
    $('#messageModal tr').click(function () {
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
      document.querySelector('#viewMessageContent').value = selectedMessage.내용.replace(/\\/g, '');

      $('#messageModal').modal('hide');
      $('#viewMessageModal').modal('show');

      if (selectedMessage.읽음여부 == 0) {
        changeMessageState(selectedMessage);
      }
    });
  },
});

//? 개별 메세지 읽음여부 변경
function changeMessageState(params) {
  $.ajax({
    method: 'POST',
    url: '/board/state',
    data: params,
  })
    .done((result) => {
      checkNoti();
      $('#messageList').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

//? 메세지 확인 및 모달 열기
let alertMsgText = document.querySelector('#alertMsg-text');
let readAllBtn = document.querySelector('#readAllMessageBtn');
let readAllModalBtn = readAllBtn.nextElementSibling;
let deleteAllBtn = document.querySelector('#deleteAllMessageBtn');
let idx_list;
let idx_array;

//? 모든 메세지 모달 열기
if (document.querySelector('#readAllModalOpen')) {
  document.querySelector('#readAllModalOpen').addEventListener('click', () => {
    idx_list = $('#messageList').DataTable().rows().data().pluck('IDX');
    idx_array = Array.from(idx_list);

    $.ajax({
      method: 'POST',
      url: '/board/readcheck',
      data: { idx: idx_array },
    })
      .done((result) => {
        if (result) {
          readAllBtn.classList.remove('d-none');
          alertMsgText.innerHTML = `<h3>모든 메세지를 읽음 처리하시겠습니까?</h3>
          <h4 class='pt-1'>확인하지 않은 메세지로 인해<br> 불이익이 발생할 수 있습니다</h4>`;
        } else {
          if (idx_array.length > 0) {
            deleteAllBtn.classList.remove('d-none');
            alertMsgText.innerHTML = `<h3>모든 메세지가 이미 읽은 상태입니다</h3><h4 class='mt-3 text-danger fw-bold'>모든 메세지를 삭제하시겠습니까?</h4>
          <h4 class='pt-1 text-danger fw-bold'>삭제된 메세지는 복구할 수 없습니다</h4>`;
          } else if (idx_array.length == 0) {
            alertMsgText.innerHTML = `<h3>받은 메세지가 없습니다</h3>`;
          }
        }

        $('#messageModal').modal('hide');
        $('#alertMsgModal').modal('show');
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  });
}

//? 모든 메세지 읽음 처리
readAllBtn.addEventListener('click', () => {
  readAllMessage(idx_array);
  setTimeout(() => {
    $('#messageModal').modal('show');
  }, 500);
});
readAllModalBtn.addEventListener('click', () => {
  $('#messageModal').modal('show');
});

function readAllMessage(params) {
  $.ajax({
    method: 'POST',
    url: '/board/readall',
    data: { idx: params },
  })
    .done((result) => {
      checkNoti();
      $('#messageList').DataTable().ajax.reload(null, false);
      $('#alertMsgModal').modal('hide');
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

//? 전체 삭제 모달 열기
if (document.querySelector('#deleteAllModalOpen')) {
  document.querySelector('#deleteAllModalOpen').addEventListener('click', () => {
    idx_list = $('#messageList').DataTable().rows().data().pluck('IDX');
    idx_array = Array.from(idx_list);

    $.ajax({
      method: 'POST',
      url: '/board/readcheck',
      data: { idx: idx_array },
    })
      .done((result) => {
        if (result) {
          alertMsgText.innerHTML = `
          <h3>아직 확인하지 않은 메세지가 있습니다</h3>
          <h3 class='pt-1'>메세지를 확인해 주세요</h3>`;
        } else {
          if (idx_array.length > 0) {
            deleteAllBtn.classList.remove('d-none');
            alertMsgText.innerHTML = `<h3 class='fw-bold text-danger'>모든 메세지를 삭제하시겠습니까?</h3>
            <h4 class='pt-1 fw-bold text-danger'>삭제된 메세지는 복구할 수 없습니다</h4>`;
          } else if (idx_array.length == 0) {
            alertMsgText.innerHTML = `<h3>받은 메세지가 없습니다</h3>`;
          }
        }

        $('#messageModal').modal('hide');
        $('#alertMsgModal').modal('show');
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  });
}

//? 모든 메세지 삭제 처리
deleteAllBtn.addEventListener('click', () => {
  deleteAllMessage(idx_array);
  $('#alertMsgModal').modal('hide');
});

function deleteAllMessage(params) {
  $.ajax({
    method: 'POST',
    url: '/board/deleteall',
    data: { idx: params },
  })
    .done((result) => {
      checkNoti();
      $('#messageList').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

//? alertMsgModal 초기화
$('#alertMsgModal').on('hidden.bs.modal', function () {
  alertMsgText.innerHTML = '';
  readAllBtn.classList.add('d-none');
  deleteAllBtn.classList.add('d-none');
});
// #endregion

// #region 팝업공지
// 팝업 데이터
// 정의된 모달의 개수
let modalCount = 5;

function sanitizeText(text) {
  text = text.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
  text = text.replace(/\\/g, '');
  return text;
}

function getPopupData() {
  $.ajax({
    method: 'POST',
    url: '/popup',
  })
    .done(function (result) {
      // 각 팝업 데이터를 검사합니다.
      const modalCount = result.filter((item) => item.notice_id !== 0).length;

      for (let i = 0; i < result.length; i++) {
        let data = result[i];
        // notice_id가 0이 아니고, popup_title과 popup_content가 비어 있지 않다면
        if (data.notice_id !== 0 && data.popup_title !== '' && data.popup_content !== '') {
          document.querySelector(`#popup${i + 1} .modal-content`).classList.add(`popup-count-${modalCount}`, `popup-order-${i + 1}`);

          // HTML 요소의 ID를 사용하여 팝업 제목 및 본문 엘리먼트를 찾아 내용을 설정합니다.
          document.getElementById(`popupTitle${i + 1}`).textContent = data.popup_title;

          // 본문 내용을 변환하고 설정합니다.
          if (data.popup_image) {
            const convertedContent = sanitizeText(data.popup_content);
            document.getElementById(
              `popupBody${i + 1}`
            ).innerHTML = `<img src="/public/uploads/popup/${data.popup_image}" alt="popup_image" style="width: 100%;">
              <p class="d-none">${convertedContent}</p>`;
          } else {
            const convertedContent = sanitizeText(data.popup_content);
            document.getElementById(`popupBody${i + 1}`).innerHTML = convertedContent;
          }

          // 현재 시각이 쿠키에 저장된 시각 이후라면 모달창을 보여줍니다.
          showModalIfNotHidden(i + 1);
        }
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

// 팝업이 숨겨져 있지 않은 경우에만 팝업을 보여줍니다.
function showModalIfNotHidden(i) {
  if (shouldShowModal(i)) {
    $(`#popup${i}`).modal('show');
  }
}

// 쿠키에 저장된 만료 시간 이후라면 true를 반환합니다.
function shouldShowModal(i) {
  let hidePopupUntilDateTime = getHideUntilDateTime(i);
  let currentDateTime = new Date();
  return currentDateTime > hidePopupUntilDateTime;
}

// 쿠키에 저장된 만료 시간을 가져옵니다.
function getHideUntilDateTime(i) {
  let hideModalUntil = getCookie(`hidePopup${i}Until`);
  let hideUntilDate = new Date(hideModalUntil);
  // 만약 쿠키가 없거나, 쿠키의 값이 유효한 날짜가 아니라면,
  // JavaScript의 초기 날짜인 1970-01-01을 반환합니다.
  // 이렇게 하면, 쿠키가 없거나 유효하지 않을 때에도 팝업이 표시됩니다.
  if (isNaN(hideUntilDate)) {
    return new Date(0);
  }
  return hideUntilDate;
}

// 주어진 이름에 해당하는 쿠키 값을 가져옵니다.
function getCookie(name) {
  let cookies = document.cookie.split('; ');
  for (let j = 0; j < cookies.length; j++) {
    if (cookies[j].startsWith(`${name}=`)) {
      return cookies[j].substring(`${name}=`.length, cookies[j].length);
    }
  }
  return '';
}

// 모달 창 닫기 버튼에 이벤트 리스너를 추가합니다.
for (let i = 1; i <= modalCount; i++) {
  document.getElementById(`stopPopup${i}`).onclick = function () {
    setHideUntilCookie(i, 3);
    $(`#popup${i}`).modal('hide');
  };

  document.getElementById(`stopPopupToday${i}`).onclick = function () {
    setHideUntilCookie(i);
    $(`#popup${i}`).modal('hide');
  };
}

// 쿠키에 현재 시각에서 3시간 뒤의 시각을 저장합니다.
function setHideUntilCookie(i, hours) {
  let expirationDate = new Date();

  if (hours) {
    expirationDate.setTime(expirationDate.getTime() + hours * 60 * 60 * 1000);
  } else {
    expirationDate.setHours(24, 0, 0, 0);
  }

  document.cookie = `hidePopup${i}Until=${expirationDate.toUTCString()};path=/`;
}

// 페이지 로드 시, 팝업 데이터를 가져옵니다.
window.onload = function () {
  getPopupData();
};

// 팝업 생성
export function buildNoticePopup(data) {
  const type = document.querySelector('#noticePopupType');
  const title = document.querySelector('#noticePopupTitle');
  const image = document.querySelector('#noticePopupImage');
  const content = document.querySelector('#noticePopupContent');
  const imagePath = '/public/uploads/popup/' + data.파일이름;

  type.innerHTML = data.종류;
  title.innerHTML = data.제목;
  content.innerHTML = sanitizeText(data.내용);

  if (!data.파일이름 == '') {
    image.classList.remove('d-none');
    image.src = imagePath;
  } else {
    image.classList.add('d-none');
  }

  $('#noticePopup').modal('show');
}
// #endregion

// #region 로딩 시 메세지, 메시지 확인
checkNoti();
// function checkNoti() {
//   $.ajax({
//     method: 'POST',
//     url: '/board/checknoti',
//   })
//     .done(function (result) {
//       console.log(result);
//       if (result) {
//         const navQuestion = document.querySelector('.navbar #nav-question');
//         const navMessage = document.querySelector('.navbar #nav-message');
//         const messageModalCloser = document.getElementById('messageModalCloser');
//         if (result.question) {
//           navQuestion.classList.add('btn', 'btn-danger', 'btn-pulse', 'w-75', 'text-warning', 'm-auto');
//         } else {
//           navQuestion.classList.remove('btn', 'btn-danger', 'btn-pulse', 'w-75', 'text-warning', 'm-auto');
//         }

//         if (result.message) {
//           navMessage.classList.add('btn', 'btn-danger', 'btn-pulse', 'w-75', 'text-warning', 'm-auto');
//           messageModalCloser.classList.add('d-none');
//           $('#messageModal').modal('show');
//         } else {
//           navMessage.classList.remove('btn', 'btn-danger', 'btn-pulse', 'w-75', 'text-warning', 'm-auto');
//           messageModalCloser.classList.remove('d-none');
//         }
//       }
//     })
//     .fail(function (err) {
//       console.log(err);
//     });
// }
function checkNoti() {
  $.ajax({
    method: 'POST',
    url: '/board/checknoti',
  })
    .done(function (result) {
      if (result.isLogin) {
        const navQuestion = document.querySelector('.navbar #nav-question');
        const navMessage = document.querySelector('.navbar #nav-message');
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'), {
          backdrop: 'static', // 기본값을 static으로 설정
          keyboard: false, // 기본값을 false로 설정
        });

        if (result.question) {
          navQuestion.classList.add('btn', 'btn-danger', 'btn-pulse', 'w-75', 'text-warning', 'm-auto');
        } else {
          navQuestion.classList.remove('btn', 'btn-danger', 'btn-pulse', 'w-75', 'text-warning', 'm-auto');
        }

        if (result.message) {
          navMessage.classList.add('btn', 'btn-danger', 'btn-pulse', 'w-75', 'text-warning', 'm-auto');
          document.getElementById('messageModalCloser').classList.add('d-none');
          messageModal.show();
        } else {
          navMessage.classList.remove('btn', 'btn-danger', 'btn-pulse', 'w-75', 'text-warning', 'm-auto');
          document.getElementById('messageModalCloser').classList.remove('d-none');
          messageModal.hide();
          // 모달의 백드롭 옵션을 변경합니다.
          messageModal._config.backdrop = true; // 일반 모달로 변경
          messageModal._config.keyboard = true; // 키보드 닫기 활성화
        }
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

// #endregion
