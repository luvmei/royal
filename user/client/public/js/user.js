import { getAsset } from './bank.js';

// #region 언어 선택

document.querySelectorAll('.langBtn').forEach(function (btn, index) {
  btn.addEventListener('click', function () {
    // 동일한 인덱스를 가진 .langLst 요소를 찾아서 클래스를 토글합니다.
    var langLsts = document.querySelectorAll('.langLst');
    if (langLsts.length > index) {
      // .langLst가 충분히 존재하는지 확인
      langLsts[index].classList.toggle('show');
    }
  });
});

function changLang(code) {
  changeLanguage(i18next.changeLanguage(code));
}

$('.langLst').on('click', (e) => {
  let contains = e.target.classList.contains('list-group-item');
  let parents = e.target.parentNode.getAttribute('data-value');
  let value = e.target.getAttribute('data-value');

  let langValue = contains ? value : parents;

  i18next.changeLanguage(langValue);
  localStorage.setItem('gameLang', langValue);

  let contents = `<img src="/public/images/flag/1x1/${langValue}.svg" />`;

  // Use querySelector for the first element and querySelectorAll with forEach for all elements
  document.querySelector('.langBtn').innerHTML = contents;
  document.querySelectorAll('.langBtn').forEach((element) => {
    element.innerHTML = contents;
  });

  document.querySelectorAll('.langLst').forEach((element) => {
    element.classList.remove('show');
  });
});
//#endregion

// #region 회원가입
const successColor = '#FFC451';
const failColor = '#FF7878';
let specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
let joinCode;

// #region 아이디
let id_isValid = false;
let id_isCheck = false;

let id = document.querySelector('#join-id');
let id_desc = document.querySelector('#join-id-desc');
let id_button = document.querySelector('#join-id-btn');

// ID 유효성 체크
id.addEventListener('input', function () {
  let regex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{6,12}$/;
  // let regex = /^(?=\S*[a-z])(?=\S*[0-9])\S{6,12}$/;
  //* 아이디는 'admin', 'test'를 포함하면 안됨
  let forbiddenWords = ['admin', 'test'];

  let isValid = regex.test(id.value) && !forbiddenWords.some((word) => id.value.toLowerCase().includes(word));

  if (isValid) {
    id_desc.style.color = failColor;
    id_desc.innerHTML = '아이디 중복확인을 해주세요';
    id_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    id_isValid = true;
    id.classList.remove('is-invalid', 'is-valid');
  } else {
    id_desc.style.color = failColor;
    if (id.value.toLowerCase().includes('admin')) {
      id_desc.innerHTML = '아이디는 admin을 포함할 수 없습니다.';
    } else if (id.value.toLowerCase().includes('test')) {
      id_desc.innerHTML = '아이디는 test를 포함할 수 없습니다.';
    } else {
      id_desc.innerHTML = '영어 소문자, 숫자 조합 6~12자';
    }
    id_button.style.boxShadow = `0 0 0 0 ${successColor} inset`;
    id.classList.add('is-invalid');
    id_isValid = false;
  }
});

// id.addEventListener('input', function () {
//   let regex = /^(?=\S*[a-zA-Z])(?=\S*[0-9])\S{6,12}$/;

//   if (regex.test(id.value)) {
//     id_desc.style.color = failColor;
//     id_desc.innerHTML = '아이디 중복확인을 해주세요';
//     id_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
//     id_isValid = true;
//     id.classList.remove('is-invalid', 'is-valid');
//   } else {
//     id_desc.style.color = failColor;
//     id_desc.innerHTML = '영문, 숫자 조합 6~12자';
//     id_button.style.boxShadow = `0 0 0 0 ${successColor} inset`;
//     id.classList.add('is-invalid');
//     id_isValid = false;
//   }
// });

// ID 중복체크
id_button.addEventListener('click', function () {
  reportToServer({ id: id.value });
  if (id_isValid && !specialCharRegex.test(id.value)) {
    $.ajax({
      method: 'POST',
      url: '/user/doublecheck',
      data: { id: id.value, type: 'id' },
    })
      .done(function (result) {
        if (result) {
          id_desc.style.color = successColor;
          id_desc.innerHTML = '사용 가능한 아이디입니다';
          id_isCheck = true;
          id.classList.add('is-valid');
        } else {
          id_desc.style.color = failColor;
          id_desc.innerHTML = '이미 사용 중인 아이디입니다';
          id.classList.add('is-invalid');
          id_isCheck = false;
        }
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  } else {
    id_desc.style.color = failColor;
    if (id.value.toLowerCase().includes('admin')) {
      id_desc.innerHTML = '아이디는 admin을 포함할 수 없습니다.';
    } else if (id.value.toLowerCase().includes('test')) {
      id_desc.innerHTML = '아이디는 test를 포함할 수 없습니다.';
    } else {
      id_desc.innerHTML = '영어 소문자, 숫자 조합 6~12자';
    }
    id_button.style.boxShadow = `0 0 0 0 ${successColor} inset`;
    id.classList.add('is-invalid');
    id_isValid = false;
  }
});
// #endregion

// #region 비밀번호
let pw_isValid = false;

let pw = document.querySelector('#join-pw');
let pw_desc = document.querySelector('#join-pw-desc');
let pw_button = document.querySelector('#join-pw-btn');

// PW 유효성 체크
pw.addEventListener('input', () => {
  reportToServer({ pw: pw.value });
  let regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#*])[a-zA-Z\d!@#*]{8,16}$/;

  if (!regex.test(pw.value)) {
    pw_desc.style.color = failColor;
    pw_desc.innerHTML = '영문, 숫자, 특수문자(!,@,#,*) 조합 8~16자';
    pw_button.style.boxShadow = `0 0 0 0 ${successColor} inset`;
    pw.classList.add('is-invalid');
    pw_isValid = false;
  } else {
    pw_desc.style.color = successColor;
    pw_desc.innerHTML = '사용 가능한 비밀번호 입니다';
    pw_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    pw.classList.replace('is-invalid', 'is-valid');
    pw_isValid = true;
  }
});

// PW 확인 토글
pw_button.addEventListener('click', () => {
  let x = pw;
  if (x.type === 'password') {
    x.type = 'text';
    pw_button.innerText = '비밀번호 숨김';
  } else {
    x.type = 'password';
    pw_button.innerText = '비밀번호 확인';
  }
});
// #endregion

// #region 닉네임
let nick_isValid = false;
let nick_isCheck = false;

let nick = document.querySelector('#join-nick');
let nick_desc = document.querySelector('#join-nick-desc');
let nick_button = document.querySelector('#join-nick-btn');

// nickname 유효성 체크
nick.addEventListener('input', () => {
  let regex = /^(?=.*[a-z가-힣0-9]).{3,8}$/;

  if (regex.test(nick.value)) {
    nick_desc.style.color = failColor;
    nick_desc.innerHTML = '닉네임 중복확인을 해주세요';
    nick_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    nick_isValid = true;
    nick.classList.remove('is-invalid', 'is-valid');
  } else {
    nick_desc.style.color = failColor;
    nick_desc.innerHTML = '한글, 영문, 숫자 3~8자';
    nick_button.style.boxShadow = '0 0 0 0 successColor inset';
    nick.classList.add('is-invalid');
    nick_isValid = false;
  }
});

// nickname 중복체크
nick_button.addEventListener('click', function () {
  reportToServer({ nickname: nick.value });
  if (nick_isValid && !specialCharRegex.test(nick.value)) {
    $.ajax({
      method: 'POST',
      url: '/user/doublecheck',
      data: { nickname: nick.value, type: 'nickname' },
    })
      .done(function (result) {
        if (result) {
          nick_desc.style.color = successColor;
          nick_desc.innerHTML = '사용 가능한 닉네임입니다';
          nick_isCheck = true;
          nick.classList.add('is-valid');
        } else {
          nick_desc.style.color = failColor;
          nick_desc.innerHTML = '이미 사용 중인 닉네임입니다';
          nick.classList.add('is-invalid');
          nick_isCheck = false;
        }
      })
      .fail(function (err) {
        console.log('전송오류');
      });
  } else {
    nick_desc.style.color = failColor;
    nick_desc.innerHTML = '한글, 영문, 숫자 조합 3~8자';
    nick.classList.add('is-invalid');
    nick_isCheck = false;
  }
});
// #endregion

// #region 이름
let userName_isValid = false;

let userName = document.querySelector('#join-name');
let userName_desc = document.querySelector('#join-name-desc');

// 이름 유효성 체크
userName.addEventListener('input', () => {
  let regex = /^[a-zA-Z\uAC00-\uD7A3\s]{2,30}$/;

  // 이후 중복 된 전화번호 케이스 추가
  if (!regex.test(userName.value)) {
    userName_desc.style.color = failColor;
    userName_desc.innerHTML = '한글 2~4자 또는 영문 20자 이내';
    userName.classList.add('is-invalid');
    userName_isValid = false;
  } else {
    userName_desc.style.color = successColor;
    userName_desc.innerHTML = '예금주명은 이름과 일치해야 합니다';
    userName.classList.replace('is-invalid', 'is-valid');
    userName_isValid = true;
  }
});
// #endregion

// #region 전화번호
let phone_isValid = false;
let phone_isCheck = true;

let phone = document.querySelector('#join-phone-num');
let phone_desc = document.querySelector('#join-phone-desc');
let phone_button = document.querySelector('#join-phone-btn');

// 폰번호 유효성 체크
phone.addEventListener('input', () => {
  let regex = /^01[016789][1-9]{1}\d{2,3}\d{4}$/;

  // 이후 중복 된 전화번호 케이스 추가
  if (!regex.test(phone.value)) {
    phone_desc.style.color = failColor;
    phone_desc.innerHTML = '올바른 전화번호를 입력해주세요';
    phone.classList.add('is-invalid');
    phone_isValid = false;
  } else {
    phone_desc.style.color = successColor;
    phone_desc.innerHTML = '전화번호 중복확인을 해주세요';
    phone.classList.replace('is-invalid', 'is-valid');
    phone_isValid = true;
  }
});

// 폰번호 중복체크
phone_button.addEventListener('click', function () {
  reportToServer({ phone: phone.value });
  if (phone_isValid && !specialCharRegex.test(phone.value)) {
    $.ajax({
      method: 'POST',
      url: '/user/doublecheck',
      data: { phone: phone.value, type: 'phone' },
    })
      .done(function (result) {
        if (result) {
          phone_desc.style.color = successColor;
          phone_desc.innerHTML = '사용 가능한 전화번호입니다';
          phone.classList.add('is-valid');
          phone_isCheck = true;
        } else {
          phone_desc.style.color = failColor;
          phone_desc.innerHTML = '이미 사용 중인 전화번호입니다';
          phone.classList.add('is-invalid');
          phone_isCheck = false;
        }
      })
      .fail(function (err) {
        console.log('전송오류');
      });
  } else {
    phone_desc.style.color = failColor;
    phone_desc.innerHTML = '올바른 전화번호를 입력해주세요';
    phone.classList.add('is-invalid');
    phone_isCheck = false;
  }
});
// #endregion

// #region 은행
let bank_isValid = false;
let bank = document.querySelector('#join-bank');

bank.addEventListener('change', () => {
  if (bank.value != '') {
    bank_isValid = true;
    bank.classList.add('is-valid');
  } else if (bank.value == '') {
    bank_isValid = false;
    bank.classList.remove('is-valid');
  }
});
// #endregion

// #region 계좌번호
let account_isValid = false;

let account = document.querySelector('#join-account-num');
let account_desc = document.querySelector('#join-account-num-desc');

// 계좌번호 유효성 체크
account.addEventListener('input', () => {
  let regex = /^\d{11,14}$/;

  if (!regex.test(account.value)) {
    account_desc.style.color = failColor;
    account.classList.add('is-invalid');
    account_isValid = false;
  } else {
    account_desc.style.color = successColor;
    account.classList.replace('is-invalid', 'is-valid');
    account_isValid = true;
  }
});
// #endregion

// #region 예금주
let holder_isValid = false;

let holder = document.querySelector('#join-account-holder');
let holder_desc = document.querySelector('#join-account-holder-desc');

// 예금주 유효성 체크
holder.addEventListener('input', () => {
  let regex = /^[a-zA-Z가-힣\s]{2,30}$/;

  if (!regex.test(holder.value) || userName.value !== holder.value) {
    holder_desc.style.color = failColor;
    holder_desc.innerHTML = '예금주명은 이름과 일치해야 합니다';
    holder.classList.add('is-invalid');
    holder_isValid = false;
  } else {
    holder_desc.style.color = successColor;
    holder_desc.innerHTML = '이름과 일치합니다';
    holder.classList.replace('is-invalid', 'is-valid');
    holder_isValid = true;
  }
});
// #endregion

// #region 출금 비밀번호
let withdraw_isValid = false;

let withdraw_pw = document.querySelector('#join-withdraw-pw');
let withdraw_pw_desc = document.querySelector('#join-withdraw-pw-desc');
let withdraw_pw_button = document.querySelector('#join-withdraw-pw-btn');

// 출금 비밀번호 유효성 체크
withdraw_pw.addEventListener('input', () => {
  let regex = /^\d{6}$/;

  if (!regex.test(withdraw_pw.value)) {
    withdraw_pw_desc.style.color = failColor;
    withdraw_pw_button.style.boxShadow = `0 0 0 0 ${successColor} inset`;
    withdraw_pw.classList.add('is-invalid');
    withdraw_isValid = false;
  } else {
    withdraw_pw_desc.style.color = successColor;
    withdraw_pw_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    withdraw_pw.classList.replace('is-invalid', 'is-valid');
    withdraw_isValid = true;
  }
});

// 출금 비밀번호 확인 토글
withdraw_pw_button.addEventListener('click', () => {
  reportToServer({ withdraw_pw: withdraw_pw.value });
  let x = withdraw_pw;
  if (x.type === 'password') {
    x.type = 'text';
    withdraw_pw_button.innerText = '비밀번호 숨김';
  } else {
    x.type = 'password';
    withdraw_pw_button.innerText = '비밀번호 확인';
  }
});
// #endregion

// #region 가입코드
let code_isValid = false;
let code_isCheck = false;

let code = document.querySelector('#join-code');
let code_desc = document.querySelector('#join-code-desc');
let code_button = document.querySelector('#join-code-btn');

// 가입코드 유효성 체크
code.addEventListener('input', () => {
  let regex = /^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{4,12}$/;

  if (regex.test(code.value)) {
    code_desc.style.color = failColor;
    code_desc.innerHTML = '가입코드 확인을 해주세요';
    code_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    code_isValid = true;
    code.classList.remove('is-invalid', 'is-valid');
  } else {
    code_desc.style.color = failColor;
    code_desc.innerHTML = '추천받은 코드를 입력하세요';
    code_button.style.boxShadow = `0 0 0 0 ${successColor} inset`;
    code.classList.add('is-invalid');
    code_isValid = false;
  }
});

// 가입코드 중복체크
code_button.addEventListener('click', checkCode);
function checkCode() {
  reportToServer({ join_code: code.value });
  if (code_isValid && !specialCharRegex.test(code.value)) {
    $.ajax({
      method: 'POST',
      url: '/user/doublecheck',
      data: { join_code: code.value, type: 'code' },
    }).done((result) => {
      if (result) {
        code_desc.style.color = failColor;
        code_desc.innerHTML = '사용 불가한 가입코드입니다';
        code.classList.remove('is-valid');
        code.classList.add('is-invalid');
        code_isValid = false;
      } else {
        code_desc.style.color = successColor;
        code_desc.innerHTML = '사용 가능한 가입코드입니다';
        code_isValid = true;
        code.classList.remove('is-invalid');
        code.classList.add('is-valid');
      }
    });
  } else {
    code_isCheck = true;
    code_button.innerHTML = '가입코드 확인';
    code_desc.style.color = failColor;
    code_desc.innerHTML = '가입코드 확인을 해주세요';
    code_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    code_isValid = true;
  }
}
// #endregion

// #region 추천인코드
let recommend_isValid = true;
let recommend_isCheck = false;

let recommend = document.querySelector('#join-recommend');
let recommend_desc = document.querySelector('#join-recommend-desc');
let recommend_button = document.querySelector('#join-recommend-btn');

// 추천인코드 유효성 체크
recommend_button.addEventListener('click', function () {
  reportToServer({ join_recommend: recommend.value });
  if (recommend.value == '') {
    recommend_desc.style.color = successColor;
    recommend_desc.innerHTML = '없을 시 미입력';
    recommend.classList.remove('is-invalid');
    recommend.classList.add('is-valid');
    recommend_isValid = true;
  } else if (!specialCharRegex.test(recommend.value)) {
    $.ajax({
      method: 'POST',
      url: '/user/doublecheck',
      data: { join_recommend: recommend.value, type: 'recommend' },
    }).done((result) => {
      if (result) {
        recommend_desc.style.color = failColor;
        recommend_desc.innerHTML = '사용 불가한 추천인코드입니다';
        recommend.classList.remove('is-valid');
        recommend.classList.add('is-invalid');
        recommend_isValid = false;
      } else {
        recommend_desc.style.color = successColor;
        recommend_desc.innerHTML = '사용 가능한 추천인코드입니다';
        recommend.classList.remove('is-invalid');
        recommend.classList.add('is-valid');
        recommend_isValid = true;
      }
    });
  } else {
    recommend_isCheck = true;
    recommend_button.innerHTML = '코드 확인';
    recommend_desc.style.color = failColor;
    recommend_desc.innerHTML = '추천인코드 확인을 해주세요';
    recommend_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    recommend_isValid = true;
  }
});
// #endregion

// #region 회원가입 버튼
let join_btn = document.querySelector('#join-btn');

join_btn.addEventListener('click', function () {
  if (
    (id_isCheck &&
      pw_isValid &&
      nick_isCheck &&
      phone_isCheck &&
      bank_isValid &&
      account_isValid &&
      holder_isValid &&
      withdraw_isValid &&
      code_isValid &&
      recommend_isValid) ||
    holder.value == document.getElementById('join-name')
  ) {
    let join_data = $('#join-data').serialize();

    $.ajax({
      method: 'POST',
      url: '/user/signup',
      data: join_data,
    })
      .done(async function (result) {
        $('#confirm-text').html(`<h3>회원가입이 완료되었습니다</h3>
                <h4>가입승인 후 모든 서비스 이용이 가능합니다</h4>`);
        $('#joinModal').modal('hide');
        $('#confirmModal').modal('show');
      })
      .fail(function (err) {
        console.log(err);
      });
  } else {
    if (holder.value != document.getElementById('join-name')) {
    }
    join_btn.innerHTML = '입력값 확인 후 다시 시도';
    join_btn.classList.add('notice');

    setTimeout(() => {
      join_btn.innerHTML = '회원가입';
      join_btn.classList.remove('notice');
    }, 3000);
  }
});
// #endregion

// #region URL에서 가입코드 가져오기
window.addEventListener('DOMContentLoaded', (event) => {
  getJoinCode();

  async function getJoinCode() {
    $.ajax({
      method: 'POST',
      url: '/joincode',
    })
      .done(function (result) {
        joinCode = result;
      })
      .fail(function (err) {
        console.log(err);
      });
  }
});

const protocol = window.location.protocol;
const host = window.location.host;
const baseUrl = `${protocol}//${host}`;

window.history.pushState({}, '', baseUrl);
// #endregion

// #region 가입코드 자동입력
document.getElementById('joinModal').addEventListener('show.bs.modal', () => {
  console.log(joinCode);
  if (joinCode) {
    code_isValid = true;
    code.value = joinCode;
    checkCode();
  }
});
// #endregion

// #endregion

// #region 로그인
const login_btn = document.querySelector('#login-btn');
// const m_login_btn = document.querySelector('#mobile-login-btn');
const logout_btn = document.querySelector('#notice-logout-btn');
const m_logout_btn = document.querySelector('#mobile-logout-btn');
const logout_modal = document.querySelector('#nav-logout');
const notice_text = document.querySelector('#confirm-text');
const captchaImg = document.querySelectorAll('.captcha-img');
const captchaInput = document.querySelectorAll('.captcha-input');

window.loadCaptcha = async function () {
  try {
    const response = await fetch('/user/captcha?' + new URLSearchParams({ timestamp: Date.now() }));
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    captchaImg.forEach((el) => {
      console.log(el);
      el.src = url;
    });
  } catch (error) {
    console.error('Error fetching captcha:', error);
  }

  captchaImg.forEach((el) => {
    console.log(el);
    el.src = '/user/captcha?' + Date.now();
  });
};

captchaImg.forEach((el) => {
  el.addEventListener('click', window.loadCaptcha);
});

function checkLogin(result, error = false) {
  function updateBorder(selector, borderStyle) {
    $(selector).css('border', borderStyle);
  }

  function updateMessage(selector, message) {
    $(selector).html(message);
  }

  if (error) {
    updateBorder('.login .form-control', '2px solid #f95668');
    updateMessage('.login-message', result);
    updateMessage('.m-login-message', result);
  } else if (result.isLogin) {
    $('#loginModal').modal('hide');
    notice_text.innerHTML = `
      <h3>로그인 되었습니다</h3>
      <h4>오늘도 찾아주셔서 감사합니다</h4>
    `;
    $('#confirmModal').modal('show');
  } else {
    loadCaptcha();
    captchaInput.forEach((el) => {
      el.value = '';
    });
    let borderStyle = '2px solid #f95668';
    if (result.message.includes('CAPTCHA')) {
      updateBorder('.m_login #captcha-input', borderStyle);
      updateBorder('.login #captcha-input', borderStyle);
    } else {
      updateBorder('.login .login-input', borderStyle);
      updateBorder('.m_login .mobile-login-input', borderStyle);
    }
    updateMessage('.login-message', result.message);
    updateMessage('.m-login-message', result.message);
  }
}

document.getElementById('loginModal').addEventListener('shown.bs.modal', function () {
  document.getElementById('login-id').focus();
});

// function openLogoutModal() {
//   $('#logoutModal').modal('show');
// }

// #region login button
login_btn.addEventListener('click', login);
if (document.getElementById('landing-login-btn')) {
  document.getElementById('landing-login-btn').addEventListener('click', login);
}
// if (m_login_btn) {
//   m_login_btn.addEventListener('click', login);
// }

// function login(e) {
//   e.preventDefault();
//   let isMobile = e.target.id === 'mobile-login-btn';
//   let loginId = $(isMobile ? '#mobile-login-data #login_id' : '#login-data #login-id').val();
//   let loginPw = $(isMobile ? '#mobile-login-data #login_pw' : '#login-data #login-pw').val();
//   let dataID = isMobile ? '#mobile-login-data' : '#login-data';

//   let specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
//   let pwSpecialCharRegex = /[^!@#A-Za-z0-9]/;

//   if (specialCharRegex.test(loginId) || pwSpecialCharRegex.test(loginPw)) {
//     reportToServer({ id: loginId, pw: loginPw });
//     checkLogin('아이디와 비밀번호를 확인하세요', true);
//     return;
//   }

//   if (!loginId || !loginPw) {
//     checkLogin('아이디와 비밀번호를 입력해주세요', true);
//     return;
//   }

//   let login_data = $(dataID).serialize();

//   $.ajax({
//     method: 'POST',
//     url: '/user/login',
//     data: login_data,
//   })
//     .done(function (result) {
//       checkLogin(result);
//       login_btn.disabled = true;
//       setTimeout(() => {
//         login_btn.disabled = false;
//         login_btn.style.filter = 'brightness(100%)';
//       }, 2000);
//     })
//     .fail(function (err) {
//       if (err.status === 429) {
//         location.reload();
//       } else {
//         console.log(err);
//       }
//     });
// }

function login(e) {
  e.preventDefault();
  let loginId, loginPw, formSelector;

  // 클릭 이벤트에 따른 처리 분기
  if (e.target.id === 'landing-login-btn') {
    // 랜딩 페이지 로그인 처리
    loginId = document.getElementById('landing-id').value;
    loginPw = document.getElementById('landing-pw').value;
    formSelector = '#landing-login-data';
  } else if (e.target.id === 'mobile-login-btn') {
    // 모바일 로그인 처리
    loginId = document.getElementById('mobile-login-id').value;
    loginPw = document.getElementById('mobile-login-pw').value;
    formSelector = '#mobile-login-data';
  } else {
    // 일반 로그인 처리
    loginId = document.getElementById('login-id').value;
    loginPw = document.getElementById('login-pw').value;
    formSelector = '#login-data';
  }

  // 입력 값 검증
  let specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  let pwSpecialCharRegex = /[^!@#*A-Za-z0-9]/;

  if (specialCharRegex.test(loginId) || pwSpecialCharRegex.test(loginPw)) {
    reportToServer({ id: loginId, pw: loginPw });
    checkLogin('아이디와 비밀번호를 확인하세요', true);
    return;
  }

  if (!loginId || !loginPw) {
    checkLogin('아이디와 비밀번호를 입력해주세요', true);
    return;
  }

  // 폼 데이터 직렬화 및 AJAX 요청
  let loginData = new FormData(document.querySelector(formSelector));
  let loginDataObject = {};
  console.log(loginData);
  console.log(loginData.entries());
  loginData.forEach((value, key) => {
    loginDataObject[key] = value;
  });

  $.ajax({
    method: 'POST',
    url: '/user/login',
    data: loginDataObject,
  })
    .done(function (result) {
      console.log(result);
      checkLogin(result);
      e.target.disabled = true;
      setTimeout(() => {
        e.target.disabled = false;
        e.target.style.filter = 'brightness(100%)';
      }, 2000);
    })
    .fail(function (err) {
      if (err.status === 429) {
        location.reload();
      } else {
        console.log(err);
      }
    });
}

function reportToServer(data) {
  $.ajax({
    method: 'POST',
    url: '/report',
    data: data,
  }).fail(function (err) {
    console.error('Error reporting to server:', err);
  });
}
// #endregion

// #region logout button
// logout_modal.addEventListener('click', function () {
//   openLogoutModal();
// });

logout_btn.addEventListener('click', logout);
if (m_logout_btn) {
  m_logout_btn.addEventListener('click', logout);
}

function logout() {
  getAsset();

  $.ajax({
    method: 'POST',
    url: '/user/logout',
  })
    .done(function (result) {
      location.reload();
    })
    .fail(function (err) {
      console.log(err);
    });
}

// #endregion

// #endregion

// #region 회원정보
// id가 userInfoModal 인 모달이 열릴 때
$('#userInfoModal').on('show.bs.modal', function () {
  getUserInfo();
});

// 회원정보 가져오기
async function getUserInfo() {
  $.ajax({
    method: 'POST',
    url: '/user/info',
  })

    .done(function (result) {
      document.querySelector('#userLevel').innerHTML = result.level;
      document.querySelector('#userId').innerHTML = result.id;
      document.querySelector('#userName').innerHTML = result.name;
      document.querySelector('#userNick').innerHTML = result.nickname;
      document.querySelector('#userPhone').innerHTML = result.phone;
      document.querySelector('#userBalance').innerHTML = result.balance.toLocaleString('ko-KR');
      document.querySelector('#userPoint').innerHTML = result.point.toLocaleString('ko-KR');
      document.querySelector('#userBank').innerHTML = result.bank;
      document.querySelector('#userAccount').innerHTML = result.bank_num;
      document.querySelector('#userOwner').innerHTML = result.bank_owner;
    })
    .fail(function (err) {
      console.log(err);
    });
}
// #endregion

// #region 비밀번호 및 계좌정보 변경요청
//? 비밀번호 변경요청
const questionType = document.getElementById('questionType');
const questionTitle = document.getElementById('questionTitle');
const questionContent = document.getElementById('questionContent');
const sendQuestionBtn = document.getElementById('sendQuestionBtn');

document.getElementById('requestQna').addEventListener('click', () => {
  questionType.value = '계정';
  questionTitle.value = '비밀번호 변경요청';
  questionContent.value = `기존 비밀번호 :

변경할 비밀번호 : `;
  sendQuestionBtn.disabled = true;

  $('#reqQuestionModal').modal('show');
});

if (questionContent) {
  questionContent.addEventListener('input', () => {
    sendQuestionBtn.disabled = false;
  });
}

//? 계좌정보 변경요청
document.getElementById('requestAccount').addEventListener('click', () => {
  questionType.value = '계좌';
  questionTitle.value = '계좌정보 변경요청';
  questionContent.value = `- 기존 계좌정보
  은행: 
  예금주: 
  계좌번호: 
  
  - 변경할 계좌정보
  은행: 
  예금주: 
  계좌번호: `;
  sendQuestionBtn.disabled = true;

  $('#reqQuestionModal').modal('show');
});
// #endregion

// #region 설정 변경
let settingTitle = document.querySelector('#setting-title');
let beforeChange = document.querySelector('#beforeChange');
let setChange = document.querySelector('#setChange');
let setChangeCheck = document.querySelector('#setChangeCheck');
let beforeChangeLabel = document.querySelector('label[for="beforeChange"]');
let changeLabel = document.querySelector('label[for="setChange"]');
let changeLabelCheck = document.querySelector('label[for="setChangeCheck"]');
let changeNickBtn = document.querySelector('#change-nick-btn');
let changePasswordBtn = document.querySelector('#change-password-btn');
let changeDescription = document.querySelector('#settingModal .modal-body .description');

// #region 닉네임 변경 (보류)
// $('.changeNick').click(() => {
//   settingTitle.innerHTML = '닉네임 변경';
//   beforeChangeLabel.textContent = '기존 닉네임';
//   changeLabel.textContent = '변경할 닉네임';
//   changeLabelCheck.textContent = '변경할 닉네임 확인';
//   changeNickBtn.classList.remove('d-none');
//   changePasswordBtn.classList.add('d-none');
//   $('#settingModal').modal('show');
// });

// document.querySelector('#change-nick-btn').addEventListener('click', () => {
//   let nickInfo = $('#change-data').serialize();
//   nickInfo += `&type=nick`;

//   $.ajax({
//     method: 'POST',
//     url: '/user/change',
//     data: nickInfo,
//   })
//     .done(function (result) {
//       alert(result);
//     })
//     .fail(function (err) {
//       console.log(err);
//     });
// });
// #endregion

// #region 비밀번호 변경
pw_isValid = false;

// PW 유효성 체크
setChange.addEventListener('input', () => {
  //* 비밀번호 규칙: 영문, 숫자, 특수문자 조합 8~16자
  // let regex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/;
  //* 비밀번호 규칙: 영문, 숫자, 특수문자 중 2가지 조합 6~16자
  let regex = /^(?=.*[a-zA-Z])(?=.*[0-9!@#?]).{6,16}$/;

  if (!regex.test(setChange.value)) {
    changeDescription.style.color = failColor;
    changeDescription.innerHTML = '영문, 숫자, 특수문자 중 2가지 조합 6~16자';
    setChange.classList.add('is-invalid');
    pw_isValid = false;
  } else {
    changeDescription.style.color = successColor;
    changeDescription.innerHTML = '사용 가능한 비밀번호 입니다';
    setChange.classList.replace('is-invalid', 'is-valid');
    pw_isValid = true;
  }
});

$('.changePassword').click(() => {
  settingTitle.innerHTML = `비밀번호 변경<br><span style='font-size:0.9rem'>영문, 숫자, 특수문자 중 2가지 조합 6~16자</span>`;
  beforeChange.setAttribute('type', 'password');
  beforeChangeLabel.textContent = '기존 비밀번호';
  setChange.setAttribute('type', 'password');
  changeLabel.textContent = '변경할 비밀번호';
  setChangeCheck.setAttribute('type', 'password');
  changeLabelCheck.textContent = '변경할 비밀번호 확인';
  changeNickBtn.classList.add('d-none');
  changePasswordBtn.classList.remove('d-none');
  $('#settingModal').modal('show');
});

document.querySelector('#change-password-btn').addEventListener('click', () => {
  let passwordInfo = $('#change-data').serialize();
  passwordInfo += `&type=password`;

  if (document.querySelector('#change-data').checkValidity()) {
    $.ajax({
      method: 'POST',
      url: '/user/change',
      data: passwordInfo,
    })
      .done(function async(result) {
        if (result.isChange) {
          $('#settingModal').modal('hide');
          document.querySelector('#confirm-text').innerHTML = `<h3>비밀번호가 변경되었습니다</h3>
        <h4>다시 로그인 해주세요</h4>`;
          document.querySelector('#notice-confirm-btn').classList.add('d-none');
          document.querySelector('#after-reset').classList.remove('d-none');
          $('#confirmModal').modal('show');
        } else {
          changeDescription.innerHTML = result.msg;
        }
      })
      .fail(function (err) {
        console.log(err);
      });
  } else {
    changeDescription.innerHTML = '입력값을 확인해주세요';
  }
});

document.querySelector('#after-reset').addEventListener('click', () => {
  $.ajax({
    method: 'POST',
    url: '/user/logout',
  })
    .done(function (result) {
      location.reload();
    })
    .fail(function (err) {
      console.log(err);
    });
});
// #endregion

// #endregion
