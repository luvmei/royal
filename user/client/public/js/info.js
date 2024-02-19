import { CountUp } from '../vendor/countUp/countUp.min.js';
import { buildNoticePopup } from './board.js';

// #region 잭팟
let jackpot;

// 잭팟 카운터 초기화
async function initializeJackpotCounter() {
  const target = document.getElementById('counter');
  const endValue = await getJackpot();
  const startVal = Math.max(endValue - 900, 0);

  const options = {
    startVal: startVal,
    decimalPlaces: 1,
    duration: 2,
  };

  jackpot = new CountUp(target, endValue, options);
  if (!jackpot.error) {
    jackpot.start();
    scheduleNextUpdate();
  } else {
    console.error(jackpot.error);
  }
}

// 잭팟 정보 가져오기
async function getJackpot(currentJackpot) {
  try {
    let result = await $.ajax({
      method: 'POST',
      url: '/bank/jackpot',
      data: { currentJackpot: currentJackpot },
    });
    return result.jackpotData;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// 잭팟 값 업데이트 함수
async function updateJackpot() {
  try {
    const updateValue = await getJackpot();
    if (updateValue !== jackpot.endVal) {
      jackpot.update(updateValue);
    }
    scheduleNextUpdate();
  } catch (err) {
    location.reload();
    console.error('잭팟 정보 업데이트 오류');
  }
}

// 랜덤 시간 간격생성
function getRandomTimeout(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 다음 잭팟 업데이트를 위한 스케줄링
function scheduleNextUpdate() {
  const randomTimeout = getRandomTimeout(3000, 10000);
  setTimeout(updateJackpot, randomTimeout);
}
// #endregion

// #region marquee 설정
function startMarquee($element) {
  const speedPerSecond = 20;
  const actualHeight = $element[0].scrollHeight;
  const adjustedDuration = (actualHeight / speedPerSecond) * 1000;

  if ($element[0].classList.contains('withdraw') || $element[0].classList.contains('lottery')) {
    $element.marquee({
      duration: adjustedDuration,
      gap: 0,
      delayBeforeStart: 1000,
      direction: 'up',
      duplicated: true,
      startVisible: true,
    });
    return;
  }
  $element.marquee({
    duration: adjustedDuration,
    gap: 0,
    delayBeforeStart: 1000,
    direction: 'up',
    duplicated: true,
    startVisible: true,
    pauseOnHover: true,
  });
}

$('#information .nav-link').on('shown.bs.tab', function (e) {
  let targetTabContent = $(e.target).attr('data-bs-target');

  if (targetTabContent === '#info-event-content') {
    $('#info-notice-content .marquee').marquee('destroy');
  } else if (targetTabContent === '#info-notice-content') {
    $('#info-event-content .marquee').marquee('destroy');
  } else if (targetTabContent === '#info-withdraw-content') {
    $('#info-deposit-content .marquee').marquee('destroy');
  } else if (targetTabContent === '#info-deposit-content') {
    $('#info-withdraw-content .marquee').marquee('destroy');
  }

  let $currentMarquee = $(targetTabContent).find('.marquee');
  startMarquee($currentMarquee);

  const buttons = document.querySelectorAll('#information .js-marquee-wrapper button');
  buttons.forEach((button) => {
    button.addEventListener('click', function (e) {
      console.log(e.target.innerText);
      getBoardContent(e.target.innerText);
    });
  });
});
// #endregion

// #region 공지, 이벤트
async function getBoardInfo() {
  $.ajax({
    method: 'POST',
    url: '/board/info',
  })
    .done(function (result) {
      const eventList = document.querySelector('#notice-list .list-group.event');
      const noticeList = document.querySelector('#notice-list .list-group.notice');
      let eventData = result.filter((item) => item.종류 == '이벤트');
      let noticeData = result.filter((item) => item.종류 == '공지');

      eventData.forEach((el) => {
        createList(el, eventList);
      });

      noticeData.forEach((el) => {
        createList(el, noticeList);
      });

      startMarquee($('#info-event-content .marquee'));

      const buttons = document.querySelectorAll('.js-marquee-wrapper button');
      buttons.forEach((button) => {
        button.addEventListener('click', function (e) {
          getBoardContent(e.target.innerText);
        });
      });
    })
    .fail(function (err) {
      console.log(err);
    });
}

async function getBoardContent(title) {
  $.ajax({
    method: 'POST',
    url: '/board/content',
    data: { title: title },
  })
    .done(function (result) {
      console.log(result);
      buildNoticePopup(result);
    })
    .fail(function (err) {
      console.log(err);
    });
}
// #endregion

// #region 로또 이벤트 참여목록
async function getLottoInfo() {
  $.ajax({
    method: 'POST',
    url: '/board/event',
    data: {
      eventType: 'lottery',
    },
  })
    .done(function (result) {
      const { latestRound, data } = result;
      const participationCount = data.length;

      document.getElementById('lottery-list').innerHTML = `
        <div class="col-12 lottery-title text-start">
          ${latestRound} 회차 로또이벤트 참여현황
        </div>
        <div class="col-2 ps-4 lottery-count pt-0 pt-lg-4">
          <i class="bi bi-person-fill" style="font-size: 2rem"></i><br>${participationCount.toLocaleString('ko-KR')}
        </div>
        <div class="col-10 list-group lottery marquee"></div>
      `;

      const lotteryList = document.querySelector('#lottery-list .list-group.lottery');

      lotteryList.innerHTML = '';

      for (let i = 0; i < data.length && i < 50; i++) {
        const elementCopy = { ...data[i] };
        createList(elementCopy, lotteryList);
      }

      startMarquee($('#lottery-list .marquee'));
    })
    .fail(function (err) {
      console.log(err);
    });
}
// #endregion

// #region 입금, 출금 내역
function getBankInfo() {
  $.ajax({
    method: 'POST',
    url: '/bank/bankdata',
  })
    .done(function (result) {
      let { depositData, withdrawData } = result;
      const depositList = document.querySelector('#bank-list .list-group.deposit');
      const withdrawList = document.querySelector('#bank-list .list-group.withdraw');

      depositList.innerHTML = '';
      withdrawList.innerHTML = '';

      withdrawData.forEach((el) => {
        createList(el, withdrawList);
      });

      depositData.forEach((el) => {
        createList(el, depositList);
      });

      startMarquee($('#info-withdraw-content .marquee'));
    })
    .fail(function (err) {
      console.log(err);
    });
}
// #endregion

// #region 내역 생성
//? 리스트(버튼형) 생성
function createList(element, targetList) {
  const button = document.createElement('button');
  const div = document.createElement('div');
  button.type = 'button';
  button.className = 'list-group-item';
  div.className = 'list-group-item';

  if (targetList.classList.contains('event') || targetList.classList.contains('notice')) {
    button.innerHTML = element.제목;
  } else if (targetList.classList.contains('deposit') || targetList.classList.contains('withdraw')) {
    const numberValue = Number(element.money.replace(/,/g, ''));

    div.innerHTML = `
    <div class='row align-items-center mb-1'>
      <div class='col-4 text-center'>${element.time}</div>
      <div class='col-3 text-center'>${element.id}</div>
      <div class='col-5 text-end pe-5 ${numberValue > 500000 ? 'pastel-danger fw-bold' : numberValue > 300000 ? 'pastel-primary fw-bold' : ''}'>${
      element.money
    }</div>
    <hr class="d-none d-lg-block mt-lg-3 mb-lg-1">`;
  } else if (targetList.classList.contains('lottery')) {
    if (element.id.length > 6) {
      element.id = element.id.slice(0, 3) + '***' + element.id.slice(6);
    } else {
      element.id = element.id.slice(0, 3) + '*'.repeat(Math.max(0, element.id.length - 3));
    }
    const numbersArray = element.selected_numbers
      .slice(1, -1)
      .split(',')
      .map((num) => parseInt(num.trim(), 10));
      
    const balls = numbersArray
      .map((num) => {
        const colorClass = getBallColorClass(num);
        return `<span class="ball ${colorClass}">${num}</span>`;
      })
      .join('');

    let content = `
    <div class='row align-items-center'>
      <div class='col-3 col-lg-4 text-center pe-0'>${element.submit_datetime}</div>
      <div class='col-2 text-start px-0 pe-lg-3'>${element.id}</div>
      <div class='col-7 col-lg-6 text-end px-0 pe-lg-4 info-ball-group'>${balls}</div>
    </div>
    <hr class="mt-3 mb-0">`;

    targetList.insertAdjacentHTML('beforeend', content);
  }

  if (targetList.classList.contains('event') || targetList.classList.contains('notice')) {
    targetList.appendChild(button);
  } else {
    targetList.appendChild(div);
  }
}

//? 숫자에 따른 공색깔 설정
function getBallColorClass(num) {
  if (num >= 1 && num <= 10) return 'yellow';
  if (num >= 11 && num <= 20) return 'blue';
  if (num >= 21 && num <= 30) return 'red';
  if (num >= 31 && num <= 40) return 'gray';
  if (num >= 41 && num <= 45) return 'green';
  return '';
}

//? 입출금 내역 반복 생성
// getBankInfo();
// setInterval(getBankInfo, 1000 * 60 * 5);
// #endregion

//~ 페이지 로드 후 실행될 함수
document.addEventListener('DOMContentLoaded', function () {
  // 모든 초기화 함수를 동시에 실행
  Promise.all([initializeJackpotCounter(), getBoardInfo(), getLottoInfo(), getBankInfo()])
    .then(() => {
      // 모든 초기화 함수가 성공적으로 완료되면, 주기적인 업데이트 시작
      setInterval(getBankInfo, 1000 * 60 * 5);
    })
    .catch((error) => {
      // 초기화 중 에러가 발생했을 때의 처리
      console.error('Error during initialization:', error);
    });
});
