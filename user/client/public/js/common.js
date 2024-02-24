import AOS from '../vendor/aos/aos.js';

//? AOS 초기화

AOS.init();

window.onload = function () {
  window.scrollTo(0, 0);
};

//? 로딩 스피너
export function spinnerToggle() {
  const spinner = document.querySelector('.spinner-container');
  spinner.classList.toggle('d-none');
}

//? DataTables 한국어 설정
export let korean = {
  decimal: '',
  emptyTable: '데이터가 없습니다.',
  info: '_START_ - _END_ (총 _TOTAL_)',
  infoEmpty: ' ',
  infoFiltered: '(전체 _MAX_ 명 중 검색결과)',
  infoPostFix: '',
  thousands: ',',
  lengthMenu: '_MENU_ 개씩 보기',
  loadingRecords: '로딩중...',
  processing: '처리중...',
  search: '검색 : ',
  zeroRecords: '검색된 데이터가 없습니다.',
  paginate: {
    first: '첫 페이지',
    last: '마지막 페이지',
    next: '다음',
    previous: '이전',
  },
  aria: {
    sortAscending: ' :  오름차순 정렬',
    sortDescending: ' :  내림차순 정렬',
  },
};

// #region 모달열기, 닫기
//? 네비메뉴 모달열기
document.querySelector('.navbar').addEventListener('click', function (e) {
  let selectedMenu;

  if (e.target.tagName === 'SPAN') {
    selectedMenu = `#${e.target.id.slice(4)}Modal`;
  }
  else if (e.target.tagName === 'A') {
    const spanElement = e.target.querySelector('span');
    e.preventDefault();
    if (spanElement) {
      selectedMenu = `#${spanElement.id.slice(4)}Modal`;
    } else {
      selectedMenu = `#${e.target.id.slice(4)}Modal`;
    }
  }

  if (selectedMenu) {
    openModals(selectedMenu);
  }
});

//? 모바일 모달열기
document.querySelector('.sidebarMenu').addEventListener('click', function (e) {
  let elementId = e.target.id || (e.target.nextElementSibling ? e.target.nextElementSibling.id : null);

  if (elementId) {
    let strippedId = elementId.slice(6);
    let selectedMenu = `#${strippedId.charAt(0).toLowerCase()}${strippedId.slice(1)}Modal`;
    openModals(selectedMenu);
  }
});

function openModals(menu) {
  $.ajax({
    method: 'POST',
    url: '/bank/modal',
  }).done(function (result) {
    if (result) {
      $(menu).modal('show');
    } else {
      $('#notLoginModal').modal('show');
    }
  });
}

//? 모달닫을 때 초기화
$('.modal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
  $('.modal input').removeClass('is-invalid is-valid');
  $('.modal .description').css('color', 'rgba(255, 255, 255, 0.5)');
});
// #endregion

// #region 알림창 엔터, 스페이스로 닫기
let notice_modal = document.querySelector('.notice.modal');
let confirm_btn = document.querySelector('#notice-confirm-btn');

notice_modal.addEventListener('keyup', function (e) {
  if (e.keyCode === 13 || e.keyCode === 32) {
    console.log('엔터키누름');
    confirm_btn.click();
  }
});

confirm_btn.addEventListener('click', () => {
  location.reload();
});
// #endregion
