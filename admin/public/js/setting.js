window.addEventListener('DOMContentLoaded', (event) => {
  const sidebarToggle = document.body.querySelector('#sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
    });
  }

  collapseSideMenu();
});

// #region 입금 보너스
// let getBonusState;
// let bonusState;
// let isBonusStateChanged = false;
// let getJoinBonusRate;
// let joinBonusRate;
// let isJoinBonusRateChanged = false;
// let getDailyBonusRate;
// let dailyBonusRate;
// let isDailyBonusRateChanged = false;
// let getEveryBonusRate;
// let everyBonusRate;
// let isEveryBonusRateChanged = false;
// let changeAudio = new Audio('/public/mp3/setChange.mp3');

// //? 보너스 요율 제한
// ['joinBonusRate', 'dailyBonusRate', 'everyBonusRate'].forEach(function (id) {
//   document.getElementById(id).addEventListener('input', function () {
//     if (this.value > 100) {
//       this.value = 100;
//     } else if (this.value < 0) {
//       this.value = 0;
//     }
//   });
// });

// //? 보너스 상태 가져오기
// checkBonusState();
// function checkBonusState() {
//   $.ajax({
//     method: 'POST',
//     url: '/setting/bonus/get',
//   })
//     .done(function (result) {
//       let { bonusState, joinBonusRate, dailyBonusRate, everyBonusRate } = result;
//       getBonusState = bonusState;
//       bonusState = bonusState;
//       getJoinBonusRate = joinBonusRate;
//       joinBonusRate = joinBonusRate;
//       getDailyBonusRate = dailyBonusRate;
//       dailyBonusRate = dailyBonusRate;
//       getEveryBonusRate = everyBonusRate;
//       everyBonusRate = everyBonusRate;

//       if (bonusState === 1) {
//         document.getElementById('bonusStateBtn').checked = true;
//       } else {
//         document.getElementById('bonusStateBtn').checked = false;
//       }

//       document.getElementById('joinBonusRate').value = joinBonusRate;
//       document.getElementById('dailyBonusRate').value = dailyBonusRate;
//       document.getElementById('everyBonusRate').value = everyBonusRate;
//     })
//     .fail(function (err) {
//       console.log('전송오류');
//       console.log(err);
//     });
// }

// //? 보너스 On/Off
// document.getElementById('bonusStateBtn').addEventListener('click', function () {
//   bonusState = this.checked ? 1 : 0;
//   if (getBonusState !== bonusState) {
//     isBonusStateChanged = true;
//   } else {
//     isBonusStateChanged = false;
//   }

//   changeBonusSettingBtnState();
// });

// //? 보너스 요율 변경
// document.getElementById('joinBonusRate').addEventListener('input', function () {
//   joinBonusRate = this.value;
//   if (getJoinBonusRate !== joinBonusRate) {
//     isJoinBonusRateChanged = true;
//   } else if (getJoinBonusRate === joinBonusRate) {
//     isJoinBonusRateChanged = false;
//   }

//   changeBonusSettingBtnState();
// });

// document.getElementById('dailyBonusRate').addEventListener('input', function () {
//   dailyBonusRate = this.value;
//   if (getDailyBonusRate !== dailyBonusRate) {
//     isDailyBonusRateChanged = true;
//   } else {
//     isDailyBonusRateChanged = false;
//   }

//   changeBonusSettingBtnState();
// });

// document.getElementById('everyBonusRate').addEventListener('input', function () {
//   everyBonusRate = this.value;
//   if (getEveryBonusRate !== everyBonusRate) {
//     isEveryBonusRateChanged = true;
//   } else {
//     isEveryBonusRateChanged = false;
//   }

//   changeBonusSettingBtnState();
// });

// function changeBonusSettingBtnState() {
//   if (isBonusStateChanged || isJoinBonusRateChanged || isDailyBonusRateChanged || isEveryBonusRateChanged) {
//     document.getElementById('bonusSettingBtn').disabled = false;
//     document.getElementById('bonusSettingBtn').classList.replace('btn-secondary', 'btn-success');
//   } else {
//     document.getElementById('bonusSettingBtn').disabled = true;
//     document.getElementById('bonusSettingBtn').classList.replace('btn-success', 'btn-secondary');
//   }
// }

// //? 보너스 On/Off 및 요율 변경하기
// document.getElementById('bonusSettingBtn').addEventListener('click', function () {
//   bonusState = bonusState;
//   joinBonusRate = joinBonusRate || getJoinBonusRate;
//   dailyBonusRate = dailyBonusRate || getDailyBonusRate;
//   everyBonusRate = everyBonusRate || getEveryBonusRate;

//   let data = {
//     bonusState,
//     joinBonusRate,
//     dailyBonusRate,
//     everyBonusRate,
//   };
//   $.ajax({
//     method: 'POST',
//     url: '/setting/bonus/set',
//     data: data,
//   })
//     .done(function (result) {
//       checkBonusState();
//       changeAudio.play();
//       document.getElementById('bonusSettingBtn').innerHTML = '변경완료';
//       setTimeout(() => {
//         document.getElementById('bonusSettingBtn').innerHTML = '설정변경';
//         document.getElementById('bonusSettingBtn').disabled = true;
//         document.getElementById('bonusSettingBtn').classList.replace('btn-success', 'btn-secondary');
//       }, 1500);
//     })
//     .fail(function (err) {
//       console.log('전송오류');
//       console.log(err);
//     });
// });

// #region 입금 보너스
let bonusState, joinBonusRate, joinEveryBonusRate, dailyBonusRate, everyBonusRate;
let originalBonusState, originalJoinBonusRate, originalJoinEveryBonusRate, originalDailyBonusRate, originalEveryBonusRate;
let isBonusStateChanged = false,
  isJoinBonusRateChanged = false,
  isJoinEveryBonusRateChanged = false,
  isDailyBonusRateChanged = false,
  isEveryBonusRateChanged = false;
let changeAudio = new Audio('/public/mp3/setChange.mp3');

// 보너스 요율 제한
['joinBonusRate', 'joinEveryBonusRate', 'dailyBonusRate', 'everyBonusRate'].forEach(function (id) {
  document.getElementById(id).addEventListener('input', function () {
    this.value = Math.max(0, Math.min(this.value, 100));
  });
});

// 보너스 상태 가져오기
function checkBonusState() {
  $.ajax({
    method: 'POST',
    url: '/setting/bonus/get',
  })
    .done(function (result) {
      ({ bonusState, joinBonusRate, joinEveryBonusRate, dailyBonusRate, everyBonusRate } = result);
      originalBonusState = bonusState;
      originalJoinBonusRate = joinBonusRate;
      originalJoinEveryBonusRate = joinEveryBonusRate;
      originalDailyBonusRate = dailyBonusRate;
      originalEveryBonusRate = everyBonusRate;

      document.getElementById('bonusStateBtn').checked = bonusState === 1;
      document.getElementById('joinBonusRate').value = joinBonusRate;
      document.getElementById('joinEveryBonusRate').value = joinEveryBonusRate;
      document.getElementById('dailyBonusRate').value = dailyBonusRate;
      document.getElementById('everyBonusRate').value = everyBonusRate;
    })
    .fail(function (err) {
      console.log('전송오류', err);
    });
}
checkBonusState();

// 이벤트 리스너 설정
document.getElementById('bonusStateBtn').addEventListener('click', function () {
  bonusState = this.checked ? 1 : 0;
  isBonusStateChanged = bonusState !== originalBonusState;
  changeBonusSettingBtnState();
});

function setupRateChangeListener(id) {
  document.getElementById(id).addEventListener('input', function () {
    let currentValue = parseFloat(this.value);
    console.log(currentValue);
    switch (id) {
      case 'joinBonusRate':
        joinBonusRate = currentValue;
        isJoinBonusRateChanged = currentValue !== originalJoinBonusRate;
        break;
      case 'joinEveryBonusRate':
        joinEveryBonusRate = currentValue;
        isJoinEveryBonusRateChanged = currentValue !== originalJoinEveryBonusRate;
        break;
      case 'dailyBonusRate':
        dailyBonusRate = currentValue;
        isDailyBonusRateChanged = currentValue !== originalDailyBonusRate;
        break;
      case 'everyBonusRate':
        everyBonusRate = currentValue;
        isEveryBonusRateChanged = currentValue !== originalEveryBonusRate;
        break;
    }
    changeBonusSettingBtnState();
  });
}

setupRateChangeListener('joinBonusRate');
setupRateChangeListener('joinEveryBonusRate');
setupRateChangeListener('dailyBonusRate');
setupRateChangeListener('everyBonusRate');

function changeBonusSettingBtnState() {
  let hasChanged = isBonusStateChanged || isJoinBonusRateChanged || isJoinEveryBonusRateChanged || isDailyBonusRateChanged || isEveryBonusRateChanged;
  document.getElementById('bonusSettingBtn').disabled = !hasChanged;
  document.getElementById('bonusSettingBtn').classList.replace(hasChanged ? 'btn-secondary' : 'btn-success', hasChanged ? 'btn-success' : 'btn-secondary');
}

// 보너스 설정 변경
document.getElementById('bonusSettingBtn').addEventListener('click', function () {
  let data = { bonusState, joinBonusRate, joinEveryBonusRate, dailyBonusRate, everyBonusRate };
  $.ajax({
    method: 'POST',
    url: '/setting/bonus/set',
    data: data,
  })
    .done(function (result) {
      isBonusStateChanged = false;
      isJoinBonusRateChanged = false;
      isJoinEveryBonusRateChanged = false;
      isDailyBonusRateChanged = false;
      isEveryBonusRateChanged = false;

      checkBonusState();
      changeAudio.play();
      document.getElementById('bonusSettingBtn').innerHTML = '변경완료';
      setTimeout(() => {
        document.getElementById('bonusSettingBtn').innerHTML = '설정변경';
        changeBonusSettingBtnState();
      }, 1500);
    })
    .fail(function (err) {
      console.log('전송오류', err);
    });
});
// #endregion

// #region 레벨별 자동안내 계좌정보

// #region 계좌정보 가져오기
getAutoBankInfo();
function getAutoBankInfo() {
  $.ajax({
    method: 'POST',
    url: '/setting/autobank/get',
  })
    .done(function (result) {
      const { levelAccounts, virtualAccountState } = result;
      originalVirtualAccountState = virtualAccountState.virtualAccountState !== 0;
      updateVirtualAccountState(virtualAccountState);
      updateLevelAccounts(levelAccounts);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

function updateVirtualAccountState(virtualAccountStateData) {
  const virtualAccountCheckbox = document.getElementById('virtualAccount');
  virtualAccountCheckbox.checked = virtualAccountStateData.virtualAccountState !== 0;
  updateChangeButtonState();
}

function updateLevelAccounts(levelAccounts) {
  for (let account of levelAccounts) {
    const bankElement = document.getElementById(`lv${account.user_level_id}_bank`);
    const accountElement = document.getElementById(`lv${account.user_level_id}_account`);
    const holderElement = document.getElementById(`lv${account.user_level_id}_holder`);

    bankElement.value = account.bank;
    accountElement.value = account.bank_num;
    holderElement.value = account.bank_owner;

    originalValues[`lv${account.user_level_id}_bank`] = account.bank;
    originalValues[`lv${account.user_level_id}_account`] = account.bank_num;
    originalValues[`lv${account.user_level_id}_holder`] = account.bank_owner;
  }
}

function updateChangeButtonState() {
  const isChanged = document.getElementById('virtualAccount').checked !== originalVirtualAccountState;
  const bankSettingBtn = document.getElementById('autoBankSettingBtn');
  if (isChanged) {
    bankSettingBtn.disabled = false;
    bankSettingBtn.classList.replace('btn-secondary', 'btn-success');
  } else {
    bankSettingBtn.disabled = true;
    bankSettingBtn.classList.replace('btn-success', 'btn-secondary');
  }
}

document.getElementById('virtualAccount').addEventListener('change', updateChangeButtonState);
// #endregion

// #region 계좌정보 변경
const regexBank = /^[가-힣]{2,7}$/; // 한글만, 2~7자리
const regexAccount = /^[가-힣0-9]{9,14}$/;
// const regexAccount = /^[0-9]{9,14}$/; // 숫자만, 9~14자리
const regexHolder = /^[A-Za-z가-힣\s\(\)]{2,10}$/; // 영어, 한글만

// 변경하기 버튼 및 설명
const bankSettingBtn = document.getElementById('autoBankSettingBtn');
let autoBankDesc = document.getElementById('autoBankDesc');

// 유효성 상태를 저장하는 객체
let validationStatus = {
  ischanged: true,
  bank: true,
  account: true,
  holder: true,
};

// 모든 input 태그 선택
let inputs = document.querySelectorAll('#levelAccountSetting input.form-control:not(.title, .level)');

// 원래의 값을 저장하는 객체
let originalValues = {};

// 각 input 태그에 이벤트 리스너 추가
inputs.forEach((input) => {
  // 원래의 값을 저장
  originalValues[input.id] = input.value;

  input.addEventListener('input', function (e) {
    let value = e.target.value;
    let id = e.target.id;

    // ID에 따라 다른 유효성 검증 정규식 적용
    if (id.includes('bank')) {
      validationStatus.bank = regexBank.test(value);
      if (!validationStatus.bank) {
        autoBankDesc.innerHTML = '은행명은 한글 2~7자리';
        e.target.classList.add('is-invalid');
      } else {
        autoBankDesc.innerHTML = '';
        e.target.classList.remove('is-invalid');
        e.target.classList.add('is-valid');
      }
    } else if (id.includes('account')) {
      validationStatus.account = regexAccount.test(value);
      if (!validationStatus.account) {
        autoBankDesc.innerHTML = '계좌번호는 숫자 9~14자리';
        e.target.classList.add('is-invalid');
      } else {
        autoBankDesc.innerHTML = '';
        e.target.classList.remove('is-invalid');
        e.target.classList.add('is-valid');
      }
    } else if (id.includes('holder')) {
      validationStatus.holder = regexHolder.test(value);
      if (!validationStatus.holder) {
        autoBankDesc.innerHTML = '예금주는 한글 2~8자리';
        e.target.classList.add('is-invalid');
      } else {
        autoBankDesc.innerHTML = '';
        e.target.classList.remove('is-invalid');
        e.target.classList.add('is-valid');
      }
    }

    // 해당 input 값이 변경되었는지 확인
    validationStatus.ischanged = originalValues[input.id] !== value;
    if (!validationStatus.ischanged) {
      e.target.classList.remove('is-invalid');
      e.target.classList.remove('is-valid');
    }

    // 모든 유효성 검사가 통과되었는지 확인합니다.
    let allValid = validationStatus.ischanged && validationStatus.bank && validationStatus.account && validationStatus.holder;

    // 모든 유효성 검사가 통과되면 '변경하기' 버튼을 활성화합니다.
    if (allValid) {
      bankSettingBtn.disabled = false;
      bankSettingBtn.classList.replace('btn-secondary', 'btn-success');
    } else {
      bankSettingBtn.disabled = true;
      bankSettingBtn.classList.replace('btn-success', 'btn-secondary');
    }
  });
});
// #endregion

//? 변경된 계좌정보 전송하기
bankSettingBtn.addEventListener('click', function () {
  const virtualAccount = document.getElementById('virtualAccount');
  let inputs = document.querySelectorAll('#levelAccountSetting input.form-control:not(.title, .level)');
  let data = [];

  for (let input of inputs) {
    let idParts = input.id.split('_'); // 가정: id가 "lv1_bank" 형식으로 되어있다.
    let level = idParts[0].substring(2); // "lv1"에서 "1"을 추출
    let key = idParts[1]; // "bank"

    // 해당 레벨의 객체를 찾거나 새로 생성
    let levelData = data.find((item) => item.user_level_id === level);
    if (!levelData) {
      levelData = { user_level_id: level };
      data.push(levelData);
    }

    // 해당 레벨의 객체에 값을 저장
    levelData[key] = input.value;
  }

  $.ajax({
    method: 'POST',
    url: '/setting/autobank/set',
    data: { levelBankAccount: data, virtualAccount: virtualAccount.checked },
  })
    .done(function (result) {
      inputs.forEach((input) => {
        input.classList.remove('is-valid');
      });
      changeAudio.play();
      bankSettingBtn.innerHTML = '변경완료';
      autoBankDesc.classList.replace('text-danger', 'text-success');
      autoBankDesc.innerHTML = `${result.msg}`;
      getAutoBankInfo();
      setTimeout(() => {
        autoBankDesc.innerHTML = ``;
        bankSettingBtn.innerHTML = '설정변경';
        bankSettingBtn.disabled = true;
        bankSettingBtn.classList.replace('btn-success', 'btn-secondary');
        autoBankDesc.classList.replace('text-success', 'text-danger');
      }, 1500);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

// #region 마진 설정
let checkboxStates = {
  casinoBetMarginBtn: null,
  casinoRollMarginBtn: null,
  slotBetMarginBtn: null,
  slotRollMarginBtn: null,
};

let initialCheckboxStates = {
  initCasinoBetMarginState: null,
  initCasinoRollMarginState: null,
  initSlotBetMarginState: null,
  initSlotRollMarginState: null,
};

getMarginState();

//? 마진상태 가져오기
async function getMarginState() {
  $.ajax({
    method: 'POST',
    url: '/setting/margin/get',
  })
    .done(function (result) {
      let { casinoBetMarginState, slotBetMarginState, casinoRollMarginState, slotRollMarginState } = result;

      checkboxStates['casinoBetMarginBtn'] = casinoBetMarginState;
      checkboxStates['slotBetMarginBtn'] = slotBetMarginState;
      checkboxStates['casinoRollMarginBtn'] = casinoRollMarginState;
      checkboxStates['slotRollMarginBtn'] = slotRollMarginState;

      initialCheckboxStates = { ...checkboxStates };

      for (let id in checkboxStates) {
        document.getElementById(id).checked = checkboxStates[id] === 1;
      }
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

//? 마진설정 변경
for (let id in checkboxStates) {
  document.getElementById(id).addEventListener('change', function () {
    checkboxStates[id] = this.checked ? 1 : 0;
    updateSubmitButton();
  });
}

//? 마진설정 변경버튼 활성화 및 비활성화
function updateSubmitButton() {
  let marginBtn = document.getElementById('marginSetBtn');
  let checkboxStatesKeys = Object.keys(checkboxStates).sort();
  let initialCheckboxStatesKeys = Object.keys(initialCheckboxStates)
    .sort()
    .map((key) => key.replace('init', ''));

  let isEqual =
    JSON.stringify(checkboxStatesKeys) === JSON.stringify(initialCheckboxStatesKeys) &&
    checkboxStatesKeys.every((key) => checkboxStates[key] === initialCheckboxStates[key.replace('init', '')]);

  if (!isEqual) {
    marginBtn.disabled = false;
    marginBtn.classList.replace('btn-secondary', 'btn-success');
  } else {
    marginBtn.disabled = true;
    marginBtn.classList.replace('btn-success', 'btn-secondary');
  }
}

//? 마진설정 변경요청
document.getElementById('marginSetBtn').addEventListener('click', function () {
  $.ajax({
    method: 'POST',
    url: '/setting/margin/set',
    data: checkboxStates,
  })
    .done(function (result) {
      getMarginState();
      changeAudio.play();
      document.getElementById('marginSetBtn').innerHTML = '변경완료';
      setTimeout(() => {
        document.getElementById('marginSetBtn').innerHTML = '설정변경';
        document.getElementById('marginSetBtn').disabled = true;
        document.getElementById('marginSetBtn').classList.replace('btn-success', 'btn-secondary');
      }, 1500);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

// #region 잭팟 설정
const currentJackpotInput = document.getElementById('currentSetJackpot');
const setJackpotInput = document.getElementById('setJackpot');
const randomJackpotBtn = document.getElementById('randomJackpotBtn');
const setMinJackpotInput = document.getElementById('setMinJackpot');
const setMaxJackpotInput = document.getElementById('setMaxJackpot');
const jackpotSetBtn = document.getElementById('jackpotSetBtn');

let jackpot = {};
let initialJackpot = {};

//? 잭팟 설정 상태확인
function updateStateAndCheckButton() {
  // 상태 업데이트
  state.stateRandomJackpot = randomJackpotBtn.checked ? 1 : 0;
  state.setMinJackpot = parseFloat(setMinJackpotInput.value.replace(/,/g, '')) || 0;
  state.setMaxJackpot = parseFloat(setMaxJackpotInput.value.replace(/,/g, '')) || 0;
  state.setJackpotInputValue = setJackpotInput.value;

  // 버튼 활성화/비활성화 로직 (예: 모든 값이 같으면 버튼 비활성화)
  if (state.stateRandomJackpot === state.setMinJackpot && state.stateRandomJackpot === state.setMaxJackpot && state.setJackpotInputValue === '') {
    randomSettingBtn.disabled = true;
  } else {
    randomSettingBtn.disabled = false;
  }
}

//? 잭팟 상태 가져오기
getJackpotState();
function getJackpotState() {
  $.ajax({
    method: 'POST',
    url: '/setting/jackpot/get',
  })
    .done(function (result) {
      let { stateRandomJackpot, currentJackpot, setJackpot, setMinJackpot, setMaxJackpot } = result;

      if (stateRandomJackpot == 0) {
        randomJackpotBtn.checked = false;
        setMinJackpotInput.disabled = true;
        setMaxJackpotInput.disabled = true;
      } else if (stateRandomJackpot == 1) {
        randomJackpotBtn.checked = true;
        setJackpotInput.disabled = true;
        setJackpotInput.value = '';
        setMinJackpotInput.disabled = false;
        setMaxJackpotInput.disabled = false;
      }

      jackpot = {
        stateRandom: stateRandomJackpot,
        manual: '',
        min: setMinJackpot,
        max: setMaxJackpot,
      };

      initialJackpot = {
        stateRandom: stateRandomJackpot,
        manual: '',
        min: setMinJackpot,
        max: setMaxJackpot,
      };

      currentJackpotInput.value = setJackpot === 0 ? 0 : setJackpot.toLocaleString('ko-KR');
      setJackpotInput.value = '';
      setMinJackpotInput.value = setMinJackpot === 0 ? 0 : setMinJackpot.toLocaleString('ko-KR');
      setMaxJackpotInput.value = setMaxJackpot === 0 ? 0 : setMaxJackpot.toLocaleString('ko-KR');
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

//? 잭팟 설정 변경
let beforeValue;
const jackpotInputFileds = [setJackpotInput, setMinJackpotInput, setMaxJackpotInput];

jackpotInputFileds.forEach((input) => {
  input.addEventListener('focus', function () {
    beforeValue = this.value;
    this.value = '';
  });
});

const inputFieldMapping = {
  [setJackpotInput.id]: 'manual',
  [setMinJackpotInput.id]: 'min',
  [setMaxJackpotInput.id]: 'max',
};

jackpotInputFileds.forEach((input) => {
  input.addEventListener('blur', function () {
    let attributeToUpdate = inputFieldMapping[input.id];
    if ((this.value === '' || this.value === '0') && input.id == 'setJackpot') {
      this.value = '';
      jackpot[attributeToUpdate] = '';
    } else if (this.value === '') {
      this.value = beforeValue;
      jackpot[attributeToUpdate] = beforeValue;
    } else {
      this.value = parseFloat(this.value).toLocaleString('ko-KR');
      jackpot[attributeToUpdate] = parseFloat(this.value.replace(/,/g, ''));
    }
    compareValues();
  });
});

randomJackpotBtn.addEventListener('click', function () {
  if (this.checked) {
    jackpot.stateRandom = 1;
    setJackpotInput.disabled = true;
    setMinJackpotInput.disabled = false;
    setMaxJackpotInput.disabled = false;
  } else {
    jackpot.stateRandom = 0;
    setJackpotInput.disabled = false;
    setMinJackpotInput.disabled = true;
    setMaxJackpotInput.disabled = true;
  }
  compareValues();
});

//? 초기값과 비교
function compareValues() {
  for (let key in jackpot) {
    if (jackpot[key] !== initialJackpot[key]) {
      jackpotSetBtn.disabled = false;
      jackpotSetBtn.classList.replace('btn-secondary', 'btn-success');
      return false;
    }
  }
  jackpotSetBtn.disabled = true;
  jackpotSetBtn.classList.replace('btn-success', 'btn-secondary');
  return true;
}

//? 잭팟 설정 변경요청
jackpotSetBtn.addEventListener('click', function () {
  if (jackpotSetBtn.disabled) {
    return;
  } else {
    if (jackpot.min > jackpot.max) {
      alert('오류: 최소 잭팟 금액이 최대 잭팟 금액보다 클 수 없습니다.');
      setMinJackpotInput.classList.add('is-invalid');
      jackpotSetBtn.disabled = true;
      jackpotSetBtn.classList.replace('btn-success', 'btn-secondary');
      return; // 요청을 중단하고 함수 종료
    }

    $.ajax({
      method: 'POST',
      url: '/setting/jackpot/set',
      data: jackpot,
    })
      .done(function (result) {
        getJackpotState();
        changeAudio.play();
        jackpotSetBtn.innerHTML = '변경완료';
        setTimeout(() => {
          jackpotSetBtn.innerHTML = '설정변경';
          jackpotSetBtn.disabled = true;
          jackpotSetBtn.classList.replace('btn-success', 'btn-secondary');
        }, 1500);
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  }
});
// #endregion

// #region 출석체크 설정
let attOriginalValues = [];
let attOriginalSetValues = [];
const attEventAmount = document.getElementById('attEventAmount');
const attEventCount = document.getElementById('attEventCount');
const attSettingBtn = document.getElementById('attendanceSetBtn');
const attendanceSetBtn = document.getElementById('attendanceSetBtn');

// #region 출석체크 설정 가져오기 및 테이블 생성
function getAttendanceSetting() {
  $.ajax({
    method: 'POST',
    url: '/setting/attendance/get',
  })
    .done(function (result) {
      let { eventAmount, eventCount, rewardInfo } = result;

      attOriginalSetValues = [eventAmount, eventCount, rewardInfo];

      attEventAmount.value = eventAmount.toLocaleString('ko-KR');
      attEventCount.value = eventCount;
      generateTable(rewardInfo, eventCount);
      makeAttEventListeners(attOriginalSetValues);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

function generateTable(rewardInfo, eventCount) {
  const tableContainer = document.getElementById('attEventTable');
  attOriginalValues = [];
  tableContainer.innerHTML = '';

  let tableContent = `
    <div class="row">
      ${Array.from(
        { length: 2 },
        (_, k) => `
        <div class="col-6">
          <table class="table table-bordered">
            <thead>
              <tr class="text-center">
                <th>연속일수(일)</th>
                <th>보상금액(원)</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: 5 }, (_, i) => {
                const originalCounter = rewardInfo[k * 5 + i].continueCounter;
                attOriginalValues.push(originalCounter.toString());

                const originalAmount = rewardInfo[k * 5 + i].reward_amount.toLocaleString('ko-KR');
                attOriginalValues.push(originalAmount);
                return `
                  <tr data-id="${k * 5 + i + 1}">
                    <td class="p-0"><input type="text" class="form-control continue" value="${k * 5 + i + 1 > eventCount ? '·' : originalCounter}" ${
                  k * 5 + i + 1 > eventCount ? 'disabled' : ''
                }/></td>
                    <td class="p-0"><input type="text" class="form-control amount" value="${k * 5 + i + 1 > eventCount ? '' : originalAmount}" ${
                  k * 5 + i + 1 > eventCount ? 'disabled' : ''
                }/></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `
      ).join('')}
    </div>
  `;

  tableContainer.innerHTML = tableContent;

  makeRewardInputEventListeners();
}
// #endregion

// #region 이벤트 관련
function makeAttEventListeners(attOriginalSetValues) {
  attEventAmount.addEventListener('focus', function () {
    attEventAmount.value = removeCommas(attEventAmount.value);
  });

  attEventAmount.addEventListener('blur', function () {
    let value = parseInt(attEventAmount.value);
    attEventAmount.value = isNaN(value) ? '' : numberWithCommas(value);
  });

  attEventAmount.addEventListener('input', function () {
    let inputAmount = attEventAmount.value;
    inputAmount = parseInt(inputAmount);

    if (inputAmount === attOriginalSetValues[0]) {
      toggleAttButtonState(false);
    } else {
      toggleAttButtonState(true);
    }
  });

  attEventCount.addEventListener('input', function () {
    let inputCount = parseInt(attEventCount.value);

    generateTable(attOriginalSetValues[2], inputCount);

    if (inputCount === attOriginalSetValues[1]) {
      toggleAttButtonState(false);
    } else {
      toggleAttButtonState(true);
    }
  });
}

function makeRewardInputEventListeners() {
  const inputElements = document.querySelectorAll('#attEventTable input:not([disabled])');

  inputElements.forEach((inputElement, index) => {
    inputElement.addEventListener('focus', function () {
      inputElement.value = removeCommas(inputElement.value);
    });

    inputElement.addEventListener('blur', function () {
      let value = parseInt(inputElement.value);
      inputElement.value = isNaN(value) ? '' : numberWithCommas(value);
    });

    inputElement.addEventListener('input', function () {
      let allSame = true;

      for (let i = 0; i < inputElements.length; i++) {
        if (removeCommas(attOriginalValues[i]) !== removeCommas(inputElements[i].value)) {
          allSame = false;
          break;
        }
      }

      toggleAttButtonState(!allSame);
    });
  });
}

function toggleAttButtonState(isActive) {
  if (isActive) {
    attSettingBtn.disabled = false;
    attSettingBtn.classList.replace('btn-secondary', 'btn-success');
  } else {
    attSettingBtn.disabled = true;
    attSettingBtn.classList.replace('btn-success', 'btn-secondary');
  }
}
// #endregion

// #region 출석체크 설정 저장
document.getElementById('attendanceSetBtn').addEventListener('click', function () {
  const eventAmount = removeCommas(document.getElementById('attEventAmount').value);
  const eventCount = document.getElementById('attEventCount').value;

  // 테이블의 모든 입력값을 가져옵니다.
  const tableInputs = document.querySelectorAll('#attEventTable input:not([disabled])');

  let allValuesValid = true; // 모든 값이 유효한지 저장할 변수

  // eventAmount가 숫자인지 확인합니다.
  if (isNaN(eventAmount) || eventAmount === '') {
    document.getElementById('attEventAmount').classList.add('is-invalid');
    allValuesValid = false;
  } else {
    document.getElementById('attEventAmount').classList.remove('is-invalid');
  }

  document.getElementById('attEventAmount').addEventListener('focus', function () {
    document.getElementById('attEventAmount').classList.remove('is-invalid');
  });

  const tableValues = Array.from(tableInputs).map((input) => {
    // 각 입력값이 숫자인지 확인합니다.
    const inputValue = removeCommas(input.value);
    if (isNaN(inputValue) || inputValue === '') {
      input.classList.add('is-invalid');
      allValuesValid = false;
    } else {
      input.classList.remove('is-invalid');
    }

    input.addEventListener('focus', function () {
      input.classList.remove('is-invalid');
    });

    return inputValue;
  });

  if (!allValuesValid) {
    console.log('유효하지 않은 입력값이 있습니다.');
    return;
  }

  // 데이터를 서버로 전송하기 위한 객체를 생성합니다.
  const dataToSend = {
    eventAmount: eventAmount,
    eventCount: eventCount,
    rewardValues: tableValues,
  };

  console.log('전송 할 데이터:', dataToSend);

  // AJAX 요청을 사용하여 데이터를 서버로 전송합니다.
  $.ajax({
    method: 'POST',
    url: '/setting/attendance/set',
    data: dataToSend,
  })
    .done(function (result) {
      getAttendanceSetting();
      changeAudio.play();
      attendanceSetBtn.innerHTML = '변경완료';
      setTimeout(() => {
        attendanceSetBtn.innerHTML = '설정변경';
        attendanceSetBtn.disabled = true;
        attendanceSetBtn.classList.replace('btn-success', 'btn-secondary');
      }, 1500);
    })
    .fail(function (err) {
      console.log(err);
    });
});
// #endregion

getAttendanceSetting();
// #endregion

// #region 로또 설정
const currentLottoWinnerInput = document.getElementById('currentLottoWinner');
const nextLottoRoundParticipateInput = document.getElementById('nextLottoRoundParicipate');
const lottoSetBtn = document.getElementById('lottoSetBtn');

let lottoSettings = {};
let initialLottoSettings = {};

//? 로또 설정 가져오기
getLottoSetInfo();
function getLottoSetInfo() {
  $.ajax({
    method: 'POST',
    url: '/setting/lotto/get',
  })
    .done(function (result) {
      const { lottoWinnerAmount, lottoNextParticipation } = result;

      currentLottoWinnerInput.value = lottoWinnerAmount;
      nextLottoRoundParticipateInput.value = numberWithCommas(lottoNextParticipation);

      initialLottoSettings = {
        winnerAmount: lottoWinnerAmount,
        nextParticipation: lottoNextParticipation,
      };

      lottoSettings = { ...initialLottoSettings };
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

nextLottoRoundParticipateInput.addEventListener('focus', function () {
  nextLottoRoundParticipateInput.value = removeCommas(nextLottoRoundParticipateInput.value);
});

nextLottoRoundParticipateInput.addEventListener('blur', function () {
  let value = parseInt(nextLottoRoundParticipateInput.value);
  nextLottoRoundParticipateInput.value = isNaN(value) ? '' : numberWithCommas(value);
});

// 로또 설정 변경 감지 및 저장
function updateLottoSettings() {
  lottoSettings.winnerAmount = parseFloat(currentLottoWinnerInput.value.replace(/,/g, ''));
  lottoSettings.nextParticipation = parseFloat(nextLottoRoundParticipateInput.value.replace(/,/g, ''));

  compareLottoValues();
}

// 초기값과 비교하여 변경 여부 확인
function compareLottoValues() {
  if (JSON.stringify(lottoSettings) !== JSON.stringify(initialLottoSettings)) {
    lottoSetBtn.disabled = false;
    lottoSetBtn.classList.replace('btn-secondary', 'btn-success');
    return false;
  } else {
    lottoSetBtn.disabled = true;
    lottoSetBtn.classList.replace('btn-success', 'btn-secondary');
    return true;
  }
}

// 로또 설정 변경 요청
lottoSetBtn.addEventListener('click', function () {
  if (lottoSetBtn.disabled) {
    return;
  }

  console.log('변경준비', lottoSettings);

  $.ajax({
    method: 'POST',
    url: '/setting/lotto/set',
    data: lottoSettings,
  })
    .done(function (result) {
      initialLottoSettings = { ...lottoSettings };
      getLottoSetInfo();
      changeAudio.play();
      lottoSetBtn.innerHTML = '변경완료';
        setTimeout(() => {
          lottoSetBtn.innerHTML = '설정변경';
          lottoSetBtn.disabled = true;
          lottoSetBtn.classList.replace('btn-success', 'btn-secondary');
        }, 1500);      
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

// 입력 필드 이벤트 리스너 추가
[currentLottoWinnerInput, nextLottoRoundParticipateInput].forEach((input) => {
  input.addEventListener('input', updateLottoSettings);
});

// #endregion

// #region 가상 입출금
let originalVirtualValues;
let originalAutoState;
let currentAutoState;
let virtualMoneyInput = document.querySelectorAll('#virtualSetTable .money input:not([disabled])');
let virtualInput = document.querySelectorAll('#virtualSetTable input:not([disabled])');

const virtualAutoCheckbox = document.querySelector('#virtualAuto');
const depoAutoMinTime = document.getElementById('depoAutoMinTime');
const depoAutoMaxTime = document.getElementById('depoAutoMaxTime');
const depoAutoMinMoney = document.getElementById('depoAutoMinMoney');
const depoAutoMaxMoney = document.getElementById('depoAutoMaxMoney');
const withAutoMinTime = document.getElementById('withAutoMinTime');
const withAutoMaxTime = document.getElementById('withAutoMaxTime');
const withAutoMinMoney = document.getElementById('withAutoMinMoney');
const withAutoMaxMoney = document.getElementById('withAutoMaxMoney');
const virtualSettingBtn = document.getElementById('virtualSetBtn');

// #region 가상 입출금 설정 가져오기
function getVirtualSetting() {
  $.ajax({
    method: 'POST',
    url: '/setting/virtual/get',
  }).done(function (result) {
    originalAutoState = result.virtualAutoState;
    originalValues = [
      result.depoAutoMinTime,
      result.depoAutoMaxTime,
      result.depoAutoMinMoney,
      result.depoAutoMaxMoney,
      result.withAutoMinTime,
      result.withAutoMaxTime,
      result.withAutoMinMoney,
      result.withAutoMaxMoney,
    ];

    currentAutoState = result.virtualAutoState;
    depoAutoMinTime.value = result.depoAutoMinTime;
    depoAutoMaxTime.value = result.depoAutoMaxTime;
    depoAutoMinMoney.value = numberWithCommas(result.depoAutoMinMoney);
    depoAutoMaxMoney.value = numberWithCommas(result.depoAutoMaxMoney);
    withAutoMinTime.value = result.withAutoMinTime;
    withAutoMaxTime.value = result.withAutoMaxTime;
    withAutoMinMoney.value = numberWithCommas(result.withAutoMinMoney);
    withAutoMaxMoney.value = numberWithCommas(result.withAutoMaxMoney);

    if (originalAutoState == 1) {
      virtualAutoCheckbox.checked = true;
      virtualInput.forEach((input) => {
        input.disabled = false;
      });

      // depoAutoMinTime.disabled = false;
      // depoAutoMaxTime.disabled = false;
      // depoAutoMinMoney.disabled = false;
      // depoAutoMaxMoney.disabled = false;
      // withAutoMinTime.disabled = false;
      // withAutoMaxTime.disabled = false;
      // withAutoMinMoney.disabled = false;
      // withAutoMaxMoney.disabled = false;
    } else {
      virtualAutoCheckbox.checked = false;
      virtualInput.forEach((input) => {
        input.disabled = true;
      });
      // depoAutoMinTime.disabled = true;
      // depoAutoMaxTime.disabled = true;
      // depoAutoMinMoney.disabled = true;
      // depoAutoMaxMoney.disabled = true;
      // withAutoMinTime.disabled = true;
      // withAutoMaxTime.disabled = true;
      // withAutoMinMoney.disabled = true;
      // withAutoMaxMoney.disabled = true;
    }
  });
}
// #endregion

// #region 이벤트 관련

virtualMoneyInput.forEach((el) => {
  el.addEventListener('focus', function () {
    el.value = removeCommas(el.value);
  });

  el.addEventListener('blur', function () {
    el.value = numberWithCommas(el.value);
  });
});

virtualInput.forEach((el) => {
  el.addEventListener('input', function () {
    let allSame = true;

    for (let i = 0; i < virtualInput.length; i++) {
      if (originalValues[i] !== parseInt(removeCommas(virtualInput[i].value))) {
        allSame = false;
        break;
      }
    }

    toggleVirtualButtonState(!allSame);
  });
});

virtualAutoCheckbox.addEventListener('change', function () {
  currentAutoState = this.checked ? 1 : 0;

  if (this.checked) {
    virtualInput.forEach((input) => {
      input.disabled = false;
    });
  } else {
    virtualInput.forEach((input) => {
      input.disabled = true;
    });
  }

  toggleVirtualButtonState(currentAutoState !== originalAutoState);
});

function toggleVirtualButtonState(isActive) {
  if (isActive) {
    virtualSettingBtn.disabled = false;
    virtualSettingBtn.classList.replace('btn-secondary', 'btn-success');
  } else {
    virtualSettingBtn.disabled = true;
    virtualSettingBtn.classList.replace('btn-success', 'btn-secondary');
  }
}
// #endregion

// #region 가상 입출금 설정 저장
document.getElementById('virtualSetBtn').addEventListener('click', function () {
  const virtualSetData = {
    virtualAutoState: currentAutoState,
    depoAutoMinTime: depoAutoMinTime.value,
    depoAutoMaxTime: depoAutoMaxTime.value,
    depoAutoMinMoney: removeCommas(depoAutoMinMoney.value),
    depoAutoMaxMoney: removeCommas(depoAutoMaxMoney.value),
    withAutoMinTime: withAutoMinTime.value,
    withAutoMaxTime: withAutoMaxTime.value,
    withAutoMinMoney: removeCommas(withAutoMinMoney.value),
    withAutoMaxMoney: removeCommas(withAutoMaxMoney.value),
  };

  console.log(virtualSetData);

  $.ajax({
    method: 'POST',
    url: '/setting/virtual/set',
    data: virtualSetData,
  }).done(function (result) {
    console.log(result);
    getVirtualSetting();
    changeAudio.play();
    virtualSettingBtn.innerHTML = '변경완료';
    setTimeout(() => {
      virtualSettingBtn.innerHTML = '설정변경';
      virtualSettingBtn.disabled = true;
      virtualSettingBtn.classList.replace('btn-success', 'btn-secondary');
    }, 1500);
  });
});

// #endregion

// 페이지 로드 시 체크박스의 초기 상태에 따라 입력 필드를 설정합니다.
window.addEventListener('DOMContentLoaded', (event) => {
  if (!virtualAutoCheckbox.checked) {
    virtualInput.forEach((input) => {
      input.disabled = true;
    });
    toggleVirtualButtonState(false);
  }
});

getVirtualSetting();
// #endregion

// #region 공통 함수

// #region 금액 표기설정
function numberWithCommas(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function removeCommas(value) {
  return value.replace(/,/g, '');
}
// #endregion

// #endregion
