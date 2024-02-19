// #region 출석체크
const attModal = document.querySelector('#attendanceModal');

if (attModal) {
  $('#attendanceModal').on('show.bs.modal', function () {
    getAttendanceData();
  });

  $('#attendanceModal').on('hidden.bs.modal', function () {
    const modalBody = document.getElementById('attendanceTable');
    modalBody.innerHTML = '';
  });
}

async function getAttendanceData() {
  $.ajax({
    method: 'POST',
    url: '/event/attendance',
  })
    .done(function (result) {
      let { continueCounter, attendanceDays } = result;
      attendanceDays = attendanceDays.split(',').map((item) => Number(item.trim()));

      createAttendanceModal(attendanceDays, continueCounter);
    })
    .fail(function (err) {
      console.log(err);
    });
}

async function createAttendanceModal(attendanceDays, continueCounter) {
  const modalBody = document.getElementById('attendanceTable');

  // 현재 월의 마지막 날짜 구하기
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // 테이블 생성
  const titleElement = document.getElementById('attendanceModalTitle');
  titleElement.textContent = `출석체크 - ${currentMonth}월`;
  const table = document.createElement('table');
  table.className = 'table table-bordered';
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  for (let i = 0; i < Math.ceil(lastDayOfMonth / 8); i++) {
    const row = document.createElement('tr');
    for (let j = 1; j <= 8; j++) {
      const day = i * 8 + j;
      if (day > lastDayOfMonth) break;

      const cell = document.createElement('td');
      cell.textContent = day;

      // 출석한 날짜에 'checked' 클래스 추가
      if (attendanceDays.includes(day)) {
        cell.className = 'checked';
      }

      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }

  modalBody.appendChild(table);

  const counterDiv = document.createElement('div');
  counterDiv.className = 'countinueCounter btn btn-sm btn-warning';
  counterDiv.textContent = `연속 출석횟수:  ${continueCounter}일`;
  modalBody.appendChild(counterDiv);

  //todo 조건 충족 입금액 & 현재 입금액 추가

  const attendanceBtn = await createAttendanceButton(modalBody);
  modalBody.insertAdjacentHTML('beforeend', attendanceBtn);

  const initialButton = document.getElementById('attendanceButton');
  if (initialButton && !initialButton.disabled) {
    initialButton.addEventListener('click', onAttendanceButtonClick);
  }

  async function onAttendanceButtonClick() {
    $.ajax({
      method: 'POST',
      url: '/event/attendance/submit',
    })
      .done(async function (result) {
        console.log('출석체크 결과', result);
        let { isAttendance, attendanceMsg } = result;
        if (isAttendance) {
          document.getElementById('confirm-text').innerHTML = attendanceMsg;
          $('#confirmModal').modal('show');
        }

        // 기존 버튼 제거
        const existingButton = document.getElementById('attendanceButton');
        if (existingButton) {
          existingButton.remove();
        }

        // 새로운 버튼 생성 및 추가
        const newButtonHtml = await createAttendanceButton();
        modalBody.insertAdjacentHTML('beforeend', newButtonHtml);

        // 새 버튼에 이벤트 리스너 추가
        const newButton = document.getElementById('attendanceButton');
        if (newButton && !newButton.disabled) {
          newButton.addEventListener('click', onAttendanceButtonClick);
        }
      })
      .fail(function (err) {
        console.log(err);
      });
  }

  // if (!document.getElementById('attendanceButton').disabled) {
  //   document.getElementById('attendanceButton').addEventListener('click', function () {
  //     $.ajax({
  //       method: 'POST',
  //       url: '/event/attendance/submit',
  //     })
  //       .done(function (result) {
  //         let { isAttendance, attendanceMsg } = result;
  //         if (isAttendance) {
  //           document.getElementById('confirm-text').innerHTML = attendanceMsg;
  //           $('#confirmModal').modal('show');
  //         }
  //       })
  //       .fail(function (err) {
  //         console.log(err);
  //       });
  //   });
  // }
}

async function createAttendanceButton() {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'POST',
      url: '/event/state',
    })
      .done(function (result) {
        let { attendance_state } = result;
        let submitButtonClass = 'btn-success';
        let submitButtonText = '출석체크';
        let submitButtonDisabled = '';

        if (attendance_state == 0) {
          submitButtonClass = 'btn-secondary';
          submitButtonText = '참여조건 미충족';
          submitButtonDisabled = 'disabled';
        } else if (attendance_state == 2) {
          submitButtonClass = 'btn-secondary';
          submitButtonText = '오늘 출석완료';
          submitButtonDisabled = 'disabled';
          hideButtonsClass = 'd-none';
        }

        const attendanceBtn = `
          <button class="btn ${submitButtonClass} float-end" id="attendanceButton" ${submitButtonDisabled}>${submitButtonText}</button>
          `;
        resolve(attendanceBtn);
      })
      .fail(function (err) {
        console.log(err);
        reject(err);
      });
  });
}
// #endregion

// #region 로또이벤트
const lottoModal = document.querySelector('#lotteryListModal');
const listGroup = document.getElementById('lotteryList');
const lotteryDetail = document.getElementById('lotteryDetail');

let listCountdown;
let detailCountdown;

// #region 회차별 리스트 작성
if (lottoModal) {
  $('#lotteryListModal').on('show.bs.modal', async function () {
    spinnerToggle();
    await getLottoRoundList();
  });

  $('#lotteryListModal').on('hidden.bs.modal', function () {
    listGroup.innerHTML = '';
    clearInterval(listCountdown);
  });
}

async function getLottoRoundList() {
  $.ajax({
    method: 'POST',
    url: '/event/lotto',
    data: { type: 'list' },
  })
    .done(function (listData) {
      createLottoList(listData);
      updateTime('listCountdown');
      listCountdown = setInterval(updateTime, 1000, 'listCountdown');
      spinnerToggle();
    })
    .fail(function (err) {
      console.log(err);
    });
}

function createLottoList(listData) {
  const listGroup = document.getElementById('lotteryList');

  for (list of listData) {
    console.log('리스트', list);
    const listContent = generateListContent(list, 'list');
    listGroup.insertAdjacentHTML('beforeend', listContent);
  }
}

function getBallColorClass(num) {
  if (num >= 1 && num <= 10) return 'yellow';
  if (num >= 11 && num <= 20) return 'blue';
  if (num >= 21 && num <= 30) return 'red';
  if (num >= 31 && num <= 40) return 'gray';
  if (num >= 41 && num <= 45) return 'green';
  return '';
}
// #endregion

// #region 상세내역 작성
document.getElementById('lotteryList').addEventListener('click', function (event) {
  if (event.target.tagName === 'A' || event.target.closest('a')) {
    spinnerToggle();
    event.preventDefault();
    const round = event.target.getAttribute('data-round') || event.target.closest('a').getAttribute('data-round');

    $.ajax({
      method: 'POST',
      url: '/event/lotto',
      data: { type: 'detail', round: round },
    })
      .done(async function (result) {
        const { listData, detailData } = result;
        const selectedData = listData.find((data) => data.회차 == round);
        lotteryDetail.innerHTML = generateListContent(selectedData, 'detail');

        if (selectedData.isDraw) {
          drawnRankingList(detailData, lotteryDetail);
          drawnParticipantsList(detailData, lotteryDetail);
        } else {
          await createLottoParticipationGrid(lotteryDetail, round);
          drawnParticipantsList(detailData, lotteryDetail);
        }

        if (document.getElementById('detailCountdown')) {
          updateTime('detailCountdown');
          detailCountdown = setInterval(updateTime, 1000, 'detailCountdown');
        }
        spinnerToggle();
      })
      .fail(function (err) {
        console.log(err);
      });
  }
});

document.getElementById('lotteryDetailModal').addEventListener('hidden.bs.modal', function () {
  lotteryDetail.innerHTML = '';
  clearInterval(detailCountdown);
});

// #region 추첨 전
let selectedNumbers = new Set();
let userLottoState;

async function createLottoParticipationGrid(element, curRound) {
  const maxSelection = 6;
  const gridHeaders = await checkLottoState();
  element.insertAdjacentHTML('beforeend', gridHeaders);
  updateSelectedBallsDisplay();
  updateLottoNumberGrid();

  const grid = document.getElementById('lottoNumberGrid');

  function checkLottoState() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/event/lotto',
        type: 'post',
        data: {
          type: 'check',
          round: curRound,
        },
      })
        .done(function (result) {
          const { lottoState, lottoInfo } = result;
          userLottoState = lottoState;
          const gridHeaders = createGridHeaders(lottoState, lottoInfo);
          resolve(gridHeaders);
        })
        .fail(function (err) {
          console.log(err);
          reject(err);
        });
    });
  }

  function createGridHeaders(lottoState, lottoInfo) {
    let submitButtonClass = 'btn-success';
    let submitButtonText = '참여';
    let submitButtonDisabled = '';
    let hideButtonsClass = '';

    if (lottoInfo && lottoInfo.selected_numbers !== undefined) {
      let numbers = lottoInfo.selected_numbers.replace(/[\[\]]/g, '').split(',');
      numbers.forEach((num) => {
        selectedNumbers.add(parseInt(num));
      });
    }

    if (lottoState == 0) {
      submitButtonClass = 'btn-secondary';
      submitButtonText = '참여조건 미충족';
      submitButtonDisabled = 'disabled';
    } else if (lottoState == 2) {
      submitButtonClass = 'btn-secondary';
      submitButtonText = '이번회차 참여완료';
      submitButtonDisabled = 'disabled';
      hideButtonsClass = 'd-none';
    }

    return `
    <div class="row g-0 align-content-between" id="lottoNumberTable">
      <div class="col-12 col-lg-6">
        <table class="table table-bordered text-center bg-white text-black">
          <thead>
            <tr>
              <th colspan="10" class="lotto-table-title border-end-0">로또 번호 선택</th>
            </tr>
          </thead>
          <tbody id="lottoNumberGrid">
          </tbody>
        </table>
      </div>
      <div class="col-12 col-lg-6 bg-white text-black">
        <div class="selected-ball-group">          
        </div>
        <div class="lotte-btn-group">
          <button class="btn btn-primary ${hideButtonsClass}" id="randomNumberGenerator">랜덤생성</button>
          <button class="btn btn-secondary ${hideButtonsClass}" id="lottoNumberReset">초기화</button>
          <button class="btn ${submitButtonClass} float-end" id="lottoNumberSubmit" ${submitButtonDisabled}>${submitButtonText}</button>
        </div>
      </div>
    </div>`;
  }

  // #region 로또번호 그리드 생성
  createLottoNumbers(grid, maxSelection);

  function createLottoNumbers(grid, maxSelection) {
    for (let number = 1; number <= 45; number++) {
      let cell = createLottoNumberCell(number, maxSelection);

      if (number % 10 === 1) {
        var row = document.createElement('tr');
        grid.appendChild(row);
      }
      row.appendChild(cell);
    }
  }

  function createLottoNumberCell(number, maxSelection) {
    let cell = document.createElement('td');
    cell.textContent = number;
    cell.classList.add('lotto-number');

    if (userLottoState != 2) {
      cell.addEventListener('click', function () {
        toggleLottoNumberSelection(number, cell, maxSelection);
      });
    }

    return cell;
  }

  function toggleLottoNumberSelection(number, cell, maxSelection) {
    if (selectedNumbers.has(number)) {
      selectedNumbers.delete(number);
      cell.classList.remove('selected');
    } else {
      if (selectedNumbers.size < maxSelection) {
        selectedNumbers.add(number);
        cell.classList.add('selected');
      } else {
        document.getElementById('alert-text').innerHTML = `<h3>번호는 6개까지 선택 가능합니다.</h3>`;
        $('#alertModal').modal('show');
      }
    }
    updateSelectedBallsDisplay();
  }
  // #endregion

  // #region 로또 신청
  // 랜덤, 초기화, 신청 버튼 이벤트
  document.getElementById('randomNumberGenerator').addEventListener('click', function () {
    selectedNumbers.clear(); // selectedNumbers 초기화
    while (selectedNumbers.size < 6) {
      selectedNumbers.add(Math.floor(Math.random() * 45) + 1);
    }
    updateSelectedBallsDisplay(); // 선택된 공들을 업데이트
    updateLottoNumberGrid(); // lottoNumberGrid 업데이트
  });

  document.getElementById('lottoNumberReset').addEventListener('click', function () {
    selectedNumbers.clear(); // selectedNumbers 초기화
    updateSelectedBallsDisplay(); // 선택된 공들을 업데이트
    updateLottoNumberGrid(); // lottoNumberGrid 업데이트
  });

  function updateSelectedBallsDisplay() {
    const selectedBallsContainer = document.querySelector('.selected-ball-group');
    selectedBallsContainer.innerHTML = '';

    Array.from(selectedNumbers)
      .sort((a, b) => a - b)
      .forEach((number) => {
        const ball = document.createElement('span');
        const colorClass = getBallColorClass(number);
        ball.classList.add('ball', colorClass);
        ball.textContent = number;
        selectedBallsContainer.appendChild(ball);
      });
  }

  function updateLottoNumberGrid() {
    const cells = document.querySelectorAll('#lottoNumberGrid .lotto-number');
    cells.forEach((cell) => {
      const number = parseInt(cell.textContent);
      if (selectedNumbers.has(number)) {
        cell.classList.add('selected'); // 선택된 숫자에 'selected' 클래스 추가
      } else {
        cell.classList.remove('selected'); // 선택되지 않은 숫자에서 'selected' 클래스 제거
      }
    });
  }

  // 로또 번호 선택 후 신청
  document.getElementById('lottoNumberSubmit').addEventListener('click', function () {
    const confirmNumbers = Array.from(selectedNumbers).sort((a, b) => a - b);
    if (confirmNumbers.length < 6) {
      document.getElementById('alert-text').innerHTML = `<h3>번호를 6개 선택해주세요.</h3>`;
      $('#alertModal').modal('show');
      return;
    }

    $.ajax({
      url: '/event/lotto',
      type: 'POST',
      data: {
        type: 'submit',
        round: curRound,
        numbers: confirmNumbers,
      },
    })
      .done(function (result) {
        document.querySelectorAll('.lotto-number').forEach(function (element) {
          element.style.pointerEvents = 'none';
        });

        document.getElementById('lottoNumberSubmit').classList.add('btn-secondary');
        document.getElementById('lottoNumberSubmit').classList.remove('btn-success');
        document.getElementById('lottoNumberSubmit').textContent = '신청완료';
        document.getElementById('lottoNumberSubmit').disabled = true;

        document.getElementById('alert-text').innerHTML = `<h3>${result.lottoSubmitMsg}</h3>`;
        $('#alertModal').modal('show');
      })
      .fail(function (err) {
        console.log(err);
      });
  });
}
// #endregion

// #endregion

// #region 추첨 후

// #region 회차별 당첨정보
function drawnRankingList(detailData, element) {
  const firstRank = [];
  const secondRank = [];
  const thirdRank = [];

  for (let data of detailData) {
    // 아이디 마스킹
    // const id = data.id.length > 6 ? data.id.slice(0, 3) + '***' + data.id.slice(6) : data.id.slice(0, 3) + '*'.repeat(Math.max(0, data.id.length - 3));
    const id = data.id;

    if (data.winning_count >= 4) {
      firstRank.push(id);
    } else if (data.winning_count === 3) {
      secondRank.push(id);
    }
    // 3위 제외
    // else if (data.winning_count === 2) {
    //   thirdRank.push(id);
    // }
  }

  const rankingHeaders = `
        <table class="table table-striped text-center bg-white text-black" id="rankingInfoTable">
        <thead class="table-group-divider">
            <tr>
            <th scope="col" colspan="8" class="lotto-table-title">회차별 당첨정보</th>
            </tr>
            <tr>
              <th scope="col" class="col-rank">순위</th>
              <th scope="col" class="col-win-count">당첨수</th>
              <th scope="col" class="col-win-id">당첨 아이디</th>
              <th scope="col" class="col-win-condition">당첨기준(보너스번호 제외)</th>     
            </tr>
          </thead>
          <tbody>
            ${createRankRow('1등', firstRank)}
            ${createRankRow('2등', secondRank)}            
          </tbody>
        </table>`;

  element.insertAdjacentHTML('beforeend', rankingHeaders);
}

function createRankRow(rank, ids) {
  const winCount = ids.length;
  const idList = ids.join(', ');
  let winCondition = '';

  switch (rank) {
    case '1등':
      winCondition = '당첨번호 4개 이상';
      break;
    case '2등':
      winCondition = '당첨번호 3개 이상';
      break;
    case '3등':
      winCondition = '당첨번호 2개 이상';
      break;
  }

  return `
    <tr>
      <td>${rank}</td>
      <td>${winCount}명</td>
      <td>
        <div class="overflow-auto">${idList}</div>
      </td>
      <td>${winCondition}</td>
    </tr>`;
}
// #endregion

// #region 이벤트 참여정보
function drawnParticipantsList(detailData, element) {
  let participants = '';
  for (let i = 0; i < detailData.length; i += 2) {
    const participant1 = detailData[i];
    const participant2 = detailData[i + 1] ? detailData[i + 1] : {};
    participants += createParticipantRow(participant1, participant2);
  }
  const participantsHeaders = `
        <table class="table table-striped text-center bg-white text-black" id="drawnParticipantsTable">
        <thead class="table-group-divider">
            <tr>
            <th scope="col" colspan="8" class="lotto-table-title">이벤트 참여정보</th>
            </tr>
            <tr>
              <th scope="col">아이디</th>
              <th scope="col">선택번호</th>
              <th scope="col">당첨</th>
              <th scope="col">등수</th>
              <th scope="col" class="d-none d-lg-table-cell">아이디</th>
              <th scope="col" class="d-none d-lg-table-cell">선택번호</th>
              <th scope="col" class="d-none d-lg-table-cell">당첨</th>
              <th scope="col" class="d-none d-lg-table-cell">등수</th>
            </tr>
          </thead>
          <tbody class="participants-list">${participants}</tbody>
        </table>`;

  element.insertAdjacentHTML('beforeend', participantsHeaders);
}

function createParticipantRow(data1, data2) {
  const processedData1 = processData(data1);
  const processedData2 = processData(data2 || {});
  return `
    <tr>
      <td class="participantId align-middle">${processedData1.id}</td>
      <td class="selectedNumber align-middle">${processedData1.balls}</td>
      <td class="winningCount align-middle">${processedData1.winning_count == null ? '' : processedData1.winning_count}</td>
      <td class="rank align-middle">${processedData1.rank}</td>
      <td class="participantId d-none d-md-table-cell">${processedData2.id}</td>
      <td class="selectedNumber d-none d-md-table-cell">${processedData2.balls}</td>
      <td class="winningCount d-none d-md-table-cell">${processedData2.winning_count == null ? '' : processedData2.winning_count}</td>
      <td class="rank d-none d-md-table-cell">${processedData2.rank}</td>
    </tr>
    ${
      data2
        ? `
    <tr class="d-md-none align-content-center">
      <td class="participantId align-middle">${processedData2.id}</td>
      <td class="selectedNumber align-middle">${processedData2.balls}</td>
      <td class="winningCount align-middle">${processedData2.winning_count == null ? '' : processedData2.winning_count}</td>
      <td class="rank align-middle">${processedData2.rank}</td>
    </tr>`
        : ''
    }
  `;
}

function processData(data) {
  if (!data || !data.id || data.id === '') return { id: '', balls: '', winning_count: '', rank: '' };

  // ID 마스킹
  // const id = data.id.length > 6 ? data.id.slice(0, 3) + '***' + data.id.slice(6) : data.id.slice(0, 3) + '*'.repeat(Math.max(0, data.id.length - 3));
  const id = data.id;

  const numbersArray = data.selected_numbers
    .slice(1, -1)
    .split(',')
    .map((num) => parseInt(num.trim(), 10));

  let winArray = [];

  if (data.winning_numbers != null && data.winning_numbers.trim().length > 0) {
    winArray = data.winning_numbers
      .slice(1, -1)
      .split(',')
      .map((num) => parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num));
  }

  const balls = numbersArray
    .map((num) => {
      const colorClass = getBallColorClass(num);
      const isWinningNumber = winArray.includes(num);
      return `<span class="ball ${colorClass}${isWinningNumber ? ' win' : ''}">${num}</span>`;
    })
    .join('');

  const rank = getRankButton(data.winning_count);

  return { id, balls, winning_count: data.winning_count, rank };
}

function getRankButton(winningCount) {
  if (winningCount >= 4) {
    return '<button type="button" class="btn btn-sm btn-danger">1등</button>';
  } else if (winningCount == 3) {
    return '<button type="button" class="btn btn-sm btn-primary">2등</button>';
  } else if (winningCount == 2) {
    return '<button type="button" class="btn btn-sm btn-success">3등</button>';
  } else {
    return '';
  }
}
// #endregion

// #endregion

// #endregion

// #region 컨텐츠 작성
function generateListContent(list, countdownId) {
  if (!list.isDraw) {
    return `
      <a href="#" class="list-group-item list-group-item-action" aria-current="true" data-round="${
        list.회차
      }" data-bs-target="#lotteryDetailModal" data-bs-toggle="modal">
        <div class="row my-1 align-content-center">
          <div class="col-12 col-lg-8 mb-3 mb-lg-0">
            <div class="mb-2 sub-title">${list.회차} 회차</div>
            <div class="count" id="clock">
              <div class="countdown-desc">매주 토요일 오후 7시 마감까지: </div>
              <div class="text-danger fw-bold countdown" id="${countdownId}Countdown"></div>
            </div>
          </div>
          <div class="col-6 col-lg-2 text-center">
            <div class="mb-2 sub-title d-inline-block d-lg-block">참여</div>
            <div class="count d-inline-block d-lg-block">${list.참여인원}명</div>
          </div>
          <div class="col-6 col-lg-2 text-center">
            <div class="mb-2 sub-title d-inline-block d-lg-block">당첨</div>
            <div class="count d-inline-block d-lg-block">${list.당첨인원 == 0 ? '추첨 전' : list.당첨인원}</div>
          </div>
        </div>
      </a>
      `;
  } else {
    const balls = list.winningNumbers
      .map((num) => {
        const colorClass = getBallColorClass(num);
        return `<span class="ball ${colorClass}">${num}</span>`;
      })
      .join('');

    return `
      <a href="#" class="list-group-item list-group-item-action" aria-current="true" data-round="${list.회차}" data-bs-target="#lotteryDetailModal" data-bs-toggle="modal">
        <div class="row my-1 align-content-center">
          <div class="col-12 col-lg-8 mb-3 mb-lg-0">
            <div class="mb-2 sub-title">${list.회차} 회차</div>
            <div class="ball-group">${balls}</div>
          </div>
          <div class="col-6 col-lg-2 text-center">
            <div class="mb-2 sub-title d-inline-block d-lg-block">참여</div>
            <div class="count d-inline-block d-lg-block">${list.참여인원} 명</div>
          </div>
          <div class="col-6 col-lg-2 text-center">
            <div class="mb-2 sub-title d-inline-block d-lg-block">당첨</div>
            <div class="count d-inline-block d-lg-block">${list.당첨인원} 명</div>
          </div>
        </div>
      </a>
      `;
  }
}
// #endregion

// #region 카운트다운
function updateTime(countdownId) {
  const countDown = document.getElementById(countdownId);

  const now = moment();
  const nextSaturday8PM = getNextSaturday8PM();
  const duration = moment.duration(nextSaturday8PM.diff(now));

  const daysInHours = duration.days() * 24;
  const hours = (daysInHours + duration.hours()).toString().padStart(2, '0');
  const minutes = duration.minutes().toString().padStart(2, '0');
  const seconds = duration.seconds().toString().padStart(2, '0');

  const countdownString = `${hours}:${minutes}:${seconds}`;

  if (countDown) {
    countDown.innerHTML = `${countdownString}`;
  }
}

function getNextSaturday8PM() {
  let nextSaturday = moment().day(6).hour(19).minute(0).second(0);
  if (moment().isAfter(nextSaturday)) {
    nextSaturday.add(1, 'weeks');
  }
  return nextSaturday;
}
// #endregion

// #endregion
