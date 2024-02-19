let quill;

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

  document.querySelector('#writeNotice').innerHTML = '새 글 등록';
  document.querySelector('#sendMessage').innerHTML = '메세지 보내기';
  document.querySelector('#writeBanner').innerHTML = '배너 등록';

  quill = new Quill('#quillEditor', {
    modules: {
      toolbar: [
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ header: 1 }, { header: 2 }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['image'],
      ],
    },
    theme: 'snow',
  });

  quill.on('text-change', function(delta, oldDelta, source) {
    document.querySelector('#writeNoticeBtn').disabled = false;
  });
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
  dom: 'l<"#writeNotice.btn btn-sm asset-success float-end">rtip',
  columns: [
    { data: 'IDX' },
    { data: '카테고리' },
    { data: '작성일자', className: 'desktop' },
    { data: '종류', responsivePriority: 1 },
    { data: '범위', className: 'desktop' },
    { data: '제목', responsivePriority: 2 },
    { data: '내용', className: 'desktop' },
    { data: '공개여부', responsivePriority: 3 },
    { data: null, responsivePriority: 4 },
    { data: null, responsivePriority: 4 },
    { data: null, className: 'desktop' },
  ],
  scrollY: '26vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: [0, 1, 6], visible: false },
    {
      target: 3,
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
      target: 4,
      render: function (data) {
        if (data == '0') {
          return `플래티넘만`;
        } else if (data == '1') {
          return `골드까지`;
        } else if (data == '2') {
          return `실버까지`;
        } else if (data == '3') {
          return `브론즈까지`;
        } else if (data == '4') {
          return `전체`;
        }
      },
    },
    {
      target: 7,
      render: function (data) {
        if (data == 0) {
          return '공개';
        } else {
          return '숨김';
        }
      },
    },
    {
      target: 8,
      width: 100,
      render: function (data, type, row) {
        if (row.범위 == 4 && row.팝업 != 0) {
          return `<div>
                  <input class="form-check-input noticeCheckBox" type="checkbox" value="" aria-label="..." checked> (${row.팝업}/5)
                </div>`;
        } else if (row.범위 == 4 && row.팝업 == 0) {
          return `<div>
                  <input class="form-check-input noticeCheckBox" type="checkbox" value="" aria-label="...">
                </div>`;
        } else {
          return '';
        }
      },
    },
    {
      target: 9,
      width: 100,
      render: function (data) {
        return `<button class='btn btn-sm asset-primary noticeCheckBtn'>확인 및 수정</button>`;
      },
    },
    {
      target: 10,
      width: 45,
      render: function (data) {
        return `<button class='btn btn-sm asset-danger noticeDeleteBtn'>삭제</button>`;
      },
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      className: 'dt-head-center dt-body-center',
      orderable: false,
    },
  ],
});

$('#message').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/board/table',
    method: 'POST',
    data: { type: 'message' },
    dataSrc: '',
  },
  dom: 'l<"#sendMessage.btn btn-sm asset-success float-end">rtip',
  columns: [
    { data: 'IDX' },
    { data: '보낸시간', className: 'desktop' },
    { data: '종류', responsivePriority: 1 },
    { data: '제목', responsivePriority: 2 },
    { data: '내용', className: 'desktop' },
    { data: '받는유저', responsivePriority: 3 },
    { data: null },
  ],
  scrollY: '26vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'desc']],
  columnDefs: [
    { target: [0, 4], visible: false },
    {
      target: 2,
      render: function (data) {
        if (data == '일반') {
          return `<button class='btn btn-sm btn-outline-dark disabled'>${data}</button>`;
        } else if (data == '개별') {
          return `<button class='btn btn-sm btn-outline-primary disabled'>${data}</button>`;
        } else if (data == '긴급') {
          return `<button class='btn btn-sm btn-outline-danger disabled'>${data}</button>`;
        }
      },
    },
    {
      target: 5,
      render: function (data) {
        if (data == '전체유저' || data == '플래티넘만' || data == '골드까지' || data == '실버까지' || data == '브론즈까지') {
          return data;
        } else {
          return `<button type='button' class='btn btn-sm btn-outline-dark id-btn'>` + data + `</button>`;
        }
      },
    },
    {
      target: 6,
      render: function (data) {
        return `<button class='btn btn-sm asset-primary messageContentBtn'>내용 확인</button>`;
      },
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6],
      orderable: false,
      className: 'dt-head-center dt-body-center',
    },
  ],
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
  dom: 'l<"#setMacro.btn btn-sm asset-success float-end ms-2">frtip',
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
  scrollY: '26vh',
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
          return `<button class='btn btn-sm asset-danger questionStateBtn'>${data}</button>`;
        } else if (data == '답변완료') {
          return `<button class='btn btn-sm asset-success questionStateBtn'>${data}</button>`;
        } else if (data == '답변확인') {
          return `<button class='btn btn-sm asset-primary questionStateBtn'>${data}</button>`;
        }
      },
    },
    {
      target: [0, 1, 2, 3, 4, 5, 6, 7],
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

$('#eventBanner').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/board/table',
    method: 'POST',
    data: { type: 'eventBanner' },
    dataSrc: '',
  },
  dom: '<"#writeBanner.btn btn-sm asset-success float-end">rtip',
  columns: [{ data: '순번' }, { data: '순번' }, { data: '제목' }, { data: null }, { data: null }],
  scrollY: '26vh',
  scrollCollapse: true,
  pageLength: 50,
  lengthMenu: [50, 75, 100],
  order: [[0, 'asc']],
  columnDefs: [
    { target: 0, visible: false },
    {
      target: 1,
      width: 50,
      render: function (data, type, row, meta) {
        return meta.row + 1;
      },
    },
    {
      target: 3,
      width: 100,
      render: function (data) {
        return `<button class='btn btn-sm asset-primary bannerCheckBtn'>확인 및 수정</button>`;
      },
    },
    {
      target: 4,
      width: 45,
      render: function (data) {
        return `<button class='btn btn-sm asset-danger bannerDeleteBtn'>삭제</button>`;
      },
    },
    {
      target: [0, 1, 2, 3, 4],
      className: 'dt-head-center dt-body-center',
      orderable: false,
    },
  ],
});

// #region 공지사항 및 이벤트
let noticeContent;
let bannerContent;

let table = $('#notice').DataTable();
let idxArray = table.row;
// var maxIDX = Math.max(...idxArray);

// #region 새 글 작성
//? 글쓰기 모달 열기
document.querySelector('#writeNotice').addEventListener('click', () => {
  const currentDate = moment.tz('Asia/Seoul').format('YYYY-MM-DD');
  document.getElementById('noticeDate').value = currentDate;
  document.querySelector('#writeNoticeBtn').innerHTML = '작성하기';
  document.querySelector('#writeNoticeBtn').disabled = true;
  $('#writeNoticeModal').modal('show');
  quill.setContents([]);
});

//? 새 글 작성 및 전송
document.querySelector('#writeNoticeForm').addEventListener('submit', (e) => {
  e.preventDefault();


  console.log('quill.root.innerHTML', quill.root.innerHTML);

  let content = document.querySelector('#noticeContent');
  content.value = quill.root.innerHTML;

  if (content.value.trim() !== '' && content.value !== '<p><br></p>') {
    console.log('내용 입력됨');
    content.removeAttribute('required');
  } else {
    alert('내용을 입력해주세요');
    content.setAttribute('required', '');
    return false;
  }

  let formData = new FormData(document.querySelector('#writeNoticeForm'));

  if (!noticeContent) {
    formData.append('isNew', 'true');
  } else {
    formData.append('isNew', 'false');
    formData.append('notice_id', noticeContent.IDX);
  }

  $.ajax({
    method: 'POST',
    url: '/board/write',
    data: formData,
    processData: false,
    contentType: false,
  })
    .done((result) => {
      if (result.isSuccess) {
        document.querySelector('#boardConfirm').innerHTML = result.msg;
        $('#writeNoticeModal').modal('hide');
        $('#boardConfirmModal').modal('show');
        $('#notice').DataTable().ajax.reload(null, false);
      } else {
        document.querySelector('#boardConfirm').innerHTML = result.msg;
        $('#boardConfirmModal .modal-body').css('background-color', '#f8d7da');
        $('#boardConfirmModal').modal('show');
      }
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

//? 글쓰기 모달 닫힐 때 정보제거
$('#writeNoticeModal').on('hidden.bs.modal', function () {
  noticeContent = undefined;
  document.querySelector('#noticeRange').value = '4';
  document.querySelector('#noticeType').value = '공지';
  document.querySelector('#noticeTitle').value = '';
  document.querySelector('#noticeContent').value = '';
  quill.setContents([]);
});
// #endregion

// #region 글 확인 및 수정
//? 글 확인 및 수정
$('table').on('click', 'tbody tr .noticeCheckBtn', function () {
  noticeContent = $('#notice').DataTable().row($(this).parent('td')).data();

  let range = document.querySelector('#noticeRange');
  let type = document.querySelector('#noticeType');
  let title = document.querySelector('#noticeTitle');
  let content = document.querySelector('#noticeContent');
  let currentDate = document.querySelector('#noticeDate');
  let noticeBtn = document.querySelector('#writeNoticeBtn');

  range.value = noticeContent.범위;
  type.value = noticeContent.종류;
  title.value = noticeContent.제목;
  quill.root.innerHTML = noticeContent.내용; // Quill 에디터에 내용 설정
  // content.value = noticeContent.내용;
  // content.value = sanitizeText(noticeContent.내용);
  currentDate.value = noticeContent.작성일자;

  noticeBtn.innerHTML = '수정하기';
  noticeBtn.disabled = true;

  $('#writeNoticeModal').modal('show');
});

//? 수정 시 수정 버튼 활성화 (텍스트 필드)
$('#noticeRange, #noticeType, #noticeTitle, #noticeContent, #noticeDate').on('input', () => {
  document.querySelector('#writeNoticeBtn').disabled = false;
});

//? 수정 시 수정 버튼 활성화 (파일 입력)
$('#uploadFile').on('change', function () {
  document.querySelector('#writeNoticeBtn').disabled = false;
});

function sanitizeText(text) {
  text = text.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
  text = text.replace(/\\/g, '');
  return text;
}
// #endregion

// #region 글 삭제
//? 글 삭제 확인
$('table').on('click', 'tbody tr .noticeDeleteBtn', function () {
  document.getElementById('noticeDeleteConfirmBtn').classList.remove('d-none');
  document.getElementById('bannerDeleteConfirmBtn').classList.add('d-none');

  let selectedNotice = $('table').DataTable().row($(this).closest('td')).data();

  document.querySelector('#deleteBoardConfirm').innerHTML = `<h5>${selectedNotice.제목}를 삭제하시겠습니까?</h5>`;

  if (selectedNotice.팝업 == 0) {
    $('#boardDeleteModal').modal('show');
    noticeContent = $('table').DataTable().row($(this).parent('td')).data();
  } else {
    document.querySelector('#boardConfirm').innerHTML = '팝업이 설정된 글은 삭제할 수 없습니다.';
    $('#boardConfirmModal').modal('show');
  }
});

//? 글 삭제
document.querySelector('#noticeDeleteConfirmBtn').addEventListener('click', () => {
  $('#boardDeleteModal').modal('hide');
  $.ajax({
    method: 'POST',
    url: '/board/delete',
    data: noticeContent,
  })
    .done((result) => {
      document.querySelector('#boardConfirm').innerHTML = result;
      $('#boardConfirmModal').modal('show');
      $('#notice').DataTable().ajax.reload(null, false);
      noticeContent = undefined;
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

// #endregion

// #region 팝업
//? 공지 팝업 설정 및 해제
$('table').on('click', 'tbody tr .noticeCheckBox', async function () {
  noticeContent = $('#notice').DataTable().row($(this).parent().parent('td')).data();

  if ($(this).is(':checked')) {
    insertNoticePopup(noticeContent);
  } else {
    deleteNoticePopup(noticeContent);
  }
});

async function insertNoticePopup(noticeContent) {
  $.ajax({
    method: 'POST',
    url: '/board/insertpopup',
    data: noticeContent,
  })
    .done((result) => {
      if (result.isUpdate === false) {
        $(this).prop('checked', false);
      }
      $('#notice').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

async function deleteNoticePopup(noticeContent) {
  $.ajax({
    method: 'POST',
    url: '/board/deletepopup',
    data: noticeContent,
  })
    .done((result) => {
      $('#notice').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

// #endregion

// #endregion

// #region 메세지
let messageContent;
//? 메세지 모달 열기
document.querySelector('#sendMessage').addEventListener('click', () => {
  $('#sendMessageModal').modal('show');
});

//? 메세지 전송
// document.querySelector('#sendMessageForm').addEventListener('submit', (e) => {
//   e.preventDefault();
//   let message_data = $('#sendMessageForm').serialize();

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

//? 메세지 내용확인
$('table').on('click', 'tbody tr .messageContentBtn', function () {
  messageContent = $('#message').DataTable().row($(this).parent('td')).data();
  document.querySelector('#messageContentModal #messageContent').innerHTML = sanitizeText(messageContent.내용);
  $('#messageContentModal').modal('show');
});

//? 종류에 따른 범위, 아이디 활성화
$('#messageType').on('change', () => {
  if ($('#messageType').val() == '개별') {
    $('#selectedUser').prop('disabled', false);
    $('#sendRange').prop('disabled', true);
  } else {
    $('#selectedUser').prop('disabled', true);
    $('#sendRange').prop('disabled', false);
    $('#selectedUser').val('');
  }
});

//? 메세지 모달 닫힐 때 정보제거
$('#sendMessageModal').on('hidden.bs.modal', function () {
  noticeContent = undefined;
  document.querySelector('#sendRange').value = '4';
  document.querySelector('#messageType').value = '일반';
  document.querySelector('#messageTitle').value = '';
  document.querySelector('#messageContent').value = '';
  $('#selectedUser').prop('disabled', true);
  $('#sendRange').prop('disabled', false);
});

// #endregion

// #region 문의사항
let questionContent;
let type = document.querySelector('#viewQuestionType');
let title = document.querySelector('#viewQuestionTitle');
let content = document.querySelector('#viewQuestionContent');
let reply = document.querySelector('#viewQuestionAnswer');
let answerBtn = document.querySelector('#anserQuestionBtn');
let modifyBtn = document.querySelector('#modifyQuestionBtn');
let macroBtnGroup = document.querySelector('#macroBtnGroup');

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

  $.ajax({
    method: 'POST',
    url: '/board/answer',
    data: questionContent,
  })
    .done((result) => {
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

// #region 이벤트배너

// #region 이벤트배너 작성
//? 배너등록 모달 열기
document.querySelector('#writeBanner').addEventListener('click', () => {
  document.querySelector('#writeBannerBtn').innerHTML = '작성하기';

  let bannerImgPreviewBtn = document.querySelector('#bannerImgPreviewBtn');
  let bannerContentImgPreviewBtn = document.querySelector('#bannerContentImgPreviewBtn');

  bannerImgPreviewBtn.classList.add('d-none');
  bannerContentImgPreviewBtn.classList.add('d-none');

  $('#writeBannerModal').modal('show');
});

//? 새 이벤트배너 작성 및 전송
document.querySelector('#writeBannerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  let formData = new FormData(e.target);
  console.log('e.target', e.target);

  if (!bannerContent) {
    formData.append('isNew', 'true');
  } else {
    formData.append('isNew', 'false');
    formData.append('banner_id', bannerContent.순번);
  }

  $.ajax({
    method: 'POST',
    url: '/board/banner/write',
    data: formData,
    processData: false,
    contentType: false,
  })
    .done((result) => {
      if (result.isSuccess) {
        console.log(result.msg);
        document.querySelector('#boardConfirm').innerHTML = result.msg;
        $('#writeBannerModal').modal('hide');
        $('#boardConfirmModal').modal('show');
        $('#eventBanner').DataTable().ajax.reload(null, false);
      } else {
        console.log(result.msg);
        document.querySelector('#boardConfirm').innerHTML = result.msg;
        $('#boardConfirmModal .modal-body').css('background-color', '#f8d7da');
        $('#boardConfirmModal').modal('show');
      }
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

// #region 이벤트배너 수정
//? 배너 확인 및 수정
$('table').on('click', 'tbody tr .bannerCheckBtn', function () {
  document.querySelector('#writeBannerBtn').disabled = true;
  document.querySelector('#writeBannerBtn').innerHTML = '수정하기';
  bannerContent = $('#eventBanner').DataTable().row($(this).parent('td')).data();

  let title = document.querySelector('#bannerTitle');
  let content = document.querySelector('#bannerContent');
  let bannerImgPreviewBtn = document.querySelector('#bannerImgPreviewBtn');
  let bannerContentImgPreviewBtn = document.querySelector('#bannerContentImgPreviewBtn');

  title.value = bannerContent.제목;
  content.value = bannerContent.내용;
  bannerImgPreviewBtn.classList.remove('d-none');
  bannerContentImgPreviewBtn.classList.remove('d-none');

  // 이미지 체커
  document.getElementById('bannerImgPreviewBtn').addEventListener('click', () => {
    document.querySelector(
      '#imageCheckModal .modal-body'
    ).innerHTML = `<img src="../public/uploads/banner/${bannerContent.배너이미지}" alt="이미지" class="img-fluid">`;
    $('#imageCheckModal').modal('show');
  });

  document.getElementById('bannerContentImgPreviewBtn').addEventListener('click', () => {
    document.querySelector(
      '#imageCheckModal .modal-body'
    ).innerHTML = `<img src="../public/uploads/banner/${bannerContent.내용이미지}" alt="이미지" class="img-fluid">`;
    $('#imageCheckModal').modal('show');
  });

  $('#writeBannerModal').modal('show');
});

//? 수정 시 수정 버튼 활성화 (텍스트 필드)
$('#bannerTitle, #bannerContent').on('input', () => {
  document.querySelector('#writeBannerBtn').disabled = false;
});

//? 수정 시 수정 버튼 활성화 (파일 입력)
$('#uploadBannerFile').on('change', function () {
  document.querySelector('#writeBannerBtn').disabled = false;
});
$('#uploadContentFile').on('change', function () {
  document.querySelector('#writeBannerBtn').disabled = false;
});

//? 이미지 체커 닫기
$('#imageCheckModal').on('hide.bs.modal', function () {
  document.querySelector('#imageCheckModal .modal-body').innerHTML = '';
});

//? 선택 이벤트정보 제거
$('#writeBannerModal').on('hide.bs.modal', function () {
  bannerContent = null;
  document.querySelector('#writeBannerForm').reset();
  document.querySelector('#writeBannerBtn').disabled = true;
});
// #endregion

// #region 이벤트배너 삭제
//? 이벤트배너 삭제 확인
$('table').on('click', 'tbody tr .bannerDeleteBtn', function () {
  document.getElementById('noticeDeleteConfirmBtn').classList.add('d-none');
  document.getElementById('bannerDeleteConfirmBtn').classList.remove('d-none');

  bannerContent = $('#eventBanner').DataTable().row($(this).parent('td')).data();
  document.querySelector('#deleteBoardConfirm').innerHTML = `<h5>${bannerContent.제목}를 삭제하시겠습니까?</h5>`;
  $('#boardDeleteModal').modal('show');
});

//? 이벤트배너 삭제
document.querySelector('#bannerDeleteConfirmBtn').addEventListener('click', () => {
  $('#boardDeleteModal').modal('hide');

  $.ajax({
    method: 'POST',
    url: '/board/banner/delete',
    data: bannerContent,
  })
    .done((result) => {
      document.querySelector('#boardConfirm').innerHTML = result.msg;
      $('#boardConfirmModal').modal('show');
      $('#eventBanner').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

// #endregion

//? 스페이스바 키로 열려있는 모닫 닫기
$(document).keyup(function (e) {
  if (e.keyCode == 32) {
    if ($('#boardConfirmModal').hasClass('show')) {
      $('#boardConfirmModal').modal('hide');
    } else if ($('#messageContentModal').hasClass('show')) {
      $('#messageContentModal').modal('hide');
    }
  }
});

$('#boardConfirmModal').on('hide.bs.modal', function () {
  $('#boardConfirmModal .modal-body').css('background-color', '#ffffff');
});
