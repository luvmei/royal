// #region 유저
let selectedUser;
let selectedUserInfo;
let loginUser;
let isUserDataChanged = false;
let isRateModifyValid = true;
let hierarchy;
let lowerMaxRate;

// #region 상세보기
//? 상세보기 모달창 열기
$('table').on('click', 'tbody tr .id-btn', function () {
  selectedUser = $('table').DataTable().row($(this).closest('td')).data();
  if (!selectedUser.아이디) {
    selectedUser.아이디 = selectedUser.받는유저;
  }
  if (selectedUser.회원타입 !== 9) {
    openUserDetail(selectedUser);
  }
  $('table.detailUserTable').DataTable().ajax.reload();
});

function openUserDetail(selectedUser) {
  $.ajax({
    method: 'POST',
    url: '/user/detail',
    data: { id: selectedUser.아이디 },
  })
    .done(function (result) {
      $('#detailModalBody input').addClass('text-center');
      selectedUserInfo = result.user;
      loginUser = result.login_user;
      hierarchy = result.hierarchy;
      lowerMaxRate = result.lowerMaxRate[0];

      if (loginUser.type == 9) {
        document.querySelector('#user-detail-grid').classList.remove('d-none');
      } else {
        document.querySelector('#agent-tree').classList.add('d-none');
        document.querySelector('#detail-pw-item').classList.add('d-none');
        document.querySelector('#detail-nickname-item').classList.replace('col-3', 'col-6');
        document.querySelector('#addon').classList.add('d-none');
      }

      let userDetailTitle = document.querySelector('#userDetailTitle');
      let titleType = selectedUserInfo.type == 4 ? '유저 상세보기' : '에이전트 상세보기';
      let updateNotice = '';

      if (selectedUserInfo.type != 4) {
        document.querySelector('#detail-domain').parentElement.classList.add('d-none');
        document.querySelector('#detail-code').parentElement.classList.add('d-none');
        document.querySelector('#detail-recommend-count').parentElement.classList.add('d-none');
      }

      if (selectedUserInfo.days_passed != null && selectedUserInfo.days_passed >= 0) {
        if (selectedUserInfo.days_passed <= 2) {
          userDetailTitle.parentElement.classList.add('bg-danger-subtle');
          updateNotice = `<h1 class="modal-title float-end fs-5 fw-bold py-2 text-danger-emphasis"><i class="bi bi-exclamation-square"></i> 3일 내 수정 됨</h1>`;
        } else if (selectedUserInfo.days_passed <= 6) {
          userDetailTitle.parentElement.classList.add('bg-primary-subtle');
          updateNotice = `<h1 class="modal-title float-end fs-5 fw-bold py-2 text-primary-emphasis"><i class="bi bi-exclamation-square"></i> 7일 내 수정 됨</h1>`;
        }
      }

      userDetailTitle.innerHTML = `<h1 class="modal-title fs-5 fw-bold py-2">${titleType}</h1>${updateNotice}`;

      if (loginUser.type == 9) {
        document.querySelector('#admin-rate').classList.remove('d-none');
        // document.querySelector('#admin-betMarginRate').disabled = false;
        document.querySelector('#detailTakeBtn').classList.remove('d-none');
      } else if (loginUser.type != 4 && loginUser.type != 9) {
        document.querySelector('#agent-rate').classList.remove('d-none');

        //? 인풋창들 비활성화
        document.querySelector('#detail-lv').disabled = true;
        document.querySelector('#detail-nickname').disabled = true;
        document.querySelector('#detail-name').disabled = true;
        document.querySelector('#detail-phone').disabled = true;
        document.querySelector('#detail-bank').disabled = true;
        document.querySelector('#detail-banknum').disabled = true;
        document.querySelector('#detail-bankowner').disabled = true;

        //? 인풋창 숨기기
        document.querySelector('#detail-phone').parentElement.classList.add('d-none');
        document.querySelector('#detail-bank').parentElement.classList.add('d-none');
        document.querySelector('#detail-banknum').parentElement.classList.add('d-none');
        document.querySelector('#detail-bankowner').parentElement.classList.add('d-none');
        document.querySelector('#detail-memo').parentElement.classList.add('d-none');

        //? 인풋창 크기 조절
        const detailRow = document.querySelector('#basicInfoRow');
        const balanceCol = document.querySelector('#balance');
        const pointCol = document.querySelector('#point');
        const stateCol = document.querySelector('#state');
        const codeCol = document.querySelector('#detail-join-code');

        stateCol.classList.replace('col-4', 'col-2');
        balanceCol.classList.replace('col-5', 'col-4');
        pointCol.classList.replace('col-5', 'col-4');
        codeCol.classList.replace('col-6', 'col-4');
        document.querySelector('#detail-id').parentElement.classList.replace('col-3', 'col-4');
        document.querySelector('#detail-nickname').parentElement.classList.replace('col-6', 'col-4');
        document.querySelector('#detail-joindate').parentElement.classList.replace('col-6', 'col-4');

        //? 인풋창 순서 조절
        detailRow.insertBefore(stateCol, balanceCol);

        //? 수정하기 버튼 없애기
        document.querySelector('#modifyUserBtn').classList.add('d-none');
      }

      document.querySelector('#detail-lv').value = selectedUserInfo.level;
      document.querySelector('#detail-balance').value = selectedUserInfo.balance.toLocaleString('ko-KR');
      document.querySelector('#detail-point').value = selectedUserInfo.point.toLocaleString('ko-KR');
      document.querySelector('#detail-state').value = selectedUserInfo.state;
      document.querySelector('#detail-id').value = selectedUserInfo.id;
      document.querySelector('#detail-name').value = selectedUserInfo.name;
      document.querySelector('#detail-nickname').value = selectedUserInfo.nickname;
      document.querySelector('#detail-phone').value = selectedUserInfo.phone;
      document.querySelector('#detail-joindate').value = selectedUserInfo.join_date;
      document.querySelector('#detail-bank').value = selectedUserInfo.bank;
      document.querySelector('#detail-banknum').value = selectedUserInfo.bank_num;
      document.querySelector('#detail-bankowner').value = selectedUserInfo.bank_owner;
      if (selectedUserInfo.join_domain == 'https://') {
        document.querySelector('#detail-domain').value = '';
      } else {
        document.querySelector('#detail-domain').value = selectedUserInfo.join_domain;
      }
      document.querySelector('#detail-code').value = selectedUserInfo.join_code;
      document.querySelector('#detail-upper-agent').value = selectedUserInfo.upper_agent_id;
      document.querySelector('#detail-recommend-count').value = selectedUserInfo.recommend_count;
      document.querySelector('#detail-memo').value = selectedUserInfo.join_memo;

      document.querySelector('#admin-c-betMarginRate').previousElementSibling.innerHTML = `카지노 베팅마진`;
      document.querySelector('#admin-s-betMarginRate').previousElementSibling.innerHTML = `슬롯 베팅마진`;
      document.querySelector('#admin-c-rollMarginRate').previousElementSibling.innerHTML = `카지노 롤링마진`;
      document.querySelector('#admin-s-rollMarginRate').previousElementSibling.innerHTML = `슬롯 롤링마진`;

      const deathRate = document.querySelector('#admin-deathRate');

      switch (selectedUserInfo.type) {
        //todo 요율 상위 ~ 하위까지의 요율을 구해 범위지정 해야하는데, 현재는 상위만 구함
        case 0:
          document.querySelector(
            '#admin-casinoRate'
          ).previousElementSibling.innerHTML = `카지노 롤링<br>(<span class='text-danger'>▲</span>100 ~ <span class='text-primary'>▼</span>${
            lowerMaxRate.c_roll_rate ?? 0
          })`;
          document.querySelector(
            '#admin-slotRate'
          ).previousElementSibling.innerHTML = `슬롯 롤링<br>(<span class='text-danger'>▲</span>100 ~ <span class='text-primary'>▼</span>${
            lowerMaxRate.s_roll_rate ?? 0
          })`;
          document.querySelector(
            '#admin-loseRate'
          ).previousElementSibling.innerHTML = `루징 요율<br>(<span class='text-danger'>▲</span>100 ~ <span class='text-primary'>▼</span>${
            lowerMaxRate.lose_rate ?? 0
          })`;
          deathRate.previousElementSibling.innerHTML = `죽장 요율<br>(개별적용, 최대 100)`;
          break;
        case 1:
          document.querySelector('#admin-casinoRate').previousElementSibling.innerHTML = `카지노 롤링<br>(<span class='text-danger'>▲</span> ${
            hierarchy.p_c_roll
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.c_roll_rate ?? 0})`;
          document.querySelector('#admin-slotRate').previousElementSibling.innerHTML = `슬롯 롤링<br>(<span class='text-danger'>▲</span> ${
            hierarchy.p_s_roll
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.s_roll_rate ?? 0})`;
          document.querySelector('#admin-loseRate').previousElementSibling.innerHTML = `루징 요율<br>(<span class='text-danger'>▲</span> ${
            hierarchy.p_lose
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.lose_rate ?? 0})`;
          deathRate.previousElementSibling.innerHTML = `죽장 요율<br>(개별적용, 최대 100)`;
          break;
        case 2:
          document.querySelector('#admin-casinoRate').previousElementSibling.innerHTML = `카지노 롤링<br>(<span class='text-danger'>▲</span> ${
            hierarchy.g_c_roll
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.c_roll_rate ?? 0})`;
          document.querySelector('#admin-slotRate').previousElementSibling.innerHTML = `슬롯 롤링<br>(<span class='text-danger'>▲</span> ${
            hierarchy.g_s_roll
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.s_roll_rate ?? 0})`;
          document.querySelector('#admin-loseRate').previousElementSibling.innerHTML = `루징 요율<br>(<span class='text-danger'>▲</span> ${
            hierarchy.g_lose
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.lose_rate ?? 0})`;
          deathRate.previousElementSibling.innerHTML = `죽장 요율<br>(개별적용, 최대 100)`;
          break;
        case 3:
          document.querySelector('#admin-casinoRate').previousElementSibling.innerHTML = `카지노 롤링<br>(<span class='text-danger'>▲</span> ${
            hierarchy.s_c_roll
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.c_roll_rate ?? 0})`;
          document.querySelector('#admin-slotRate').previousElementSibling.innerHTML = `슬롯 롤링<br>(<span class='text-danger'>▲</span> ${
            hierarchy.s_s_roll
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.s_roll_rate ?? 0})`;
          document.querySelector('#admin-loseRate').previousElementSibling.innerHTML = `루징 요율<br>(<span class='text-danger'>▲</span> ${
            hierarchy.s_lose
          } ~ <span class='text-primary'>▼</span> ${lowerMaxRate.lose_rate ?? 0})`;
          deathRate.previousElementSibling.innerHTML = `죽장 요율<br>(개별적용, 최대 100)`;
          break;
        case 4:
          document.querySelector('#admin-casinoRate').previousElementSibling.innerHTML = `카지노 롤링<br>(<span class='text-danger'>▲</span> ${getRateValue(
            hierarchy,
            'c_roll'
          )} ~ <span class='text-primary'>▼</span>0})`;

          document.querySelector('#admin-slotRate').previousElementSibling.innerHTML = `슬롯 롤링<br>(<span class='text-danger'>▲</span> ${getRateValue(
            hierarchy,
            's_roll'
          )} ~ <span class='text-primary'>▼</span>0)`;

          document.querySelector('#admin-loseRate').previousElementSibling.innerHTML = `루징 요율<br>(<span class='text-danger'>▲</span> ${getRateValue(
            hierarchy,
            'lose'
          )} ~ <span class='text-primary'>▼</span>0)`;
          deathRate.previousElementSibling.innerHTML = `죽장 요율<br>(개별적용, 최대 100)`;

          document.querySelector('.margin-rate').classList.add('d-none');
          // document.querySelector('#admin-rate').classList.add('d-none');
          break;
      }

      document.querySelector('#admin-casinoRate').value = selectedUserInfo.c_roll_rate;
      document.querySelector('#admin-slotRate').value = selectedUserInfo.s_roll_rate;
      document.querySelector('#admin-loseRate').value = selectedUserInfo.lose_rate;
      document.querySelector('#admin-deathRate').value = selectedUserInfo.death_rate;
      document.querySelector('#admin-c-betMarginRate').value = selectedUserInfo.c_bet_margin_rate;
      document.querySelector('#admin-s-betMarginRate').value = selectedUserInfo.s_bet_margin_rate;
      document.querySelector('#admin-c-rollMarginRate').value = selectedUserInfo.c_roll_margin_rate;
      document.querySelector('#admin-s-rollMarginRate').value = selectedUserInfo.s_roll_margin_rate;

      document.querySelector('#agent-casinoRate').value = selectedUserInfo.c_roll_rate;
      document.querySelector('#agent-slotRate').value = selectedUserInfo.s_roll_rate;
      document.querySelector('#agent-loseRate').value = selectedUserInfo.lose_rate;

      document.querySelector('#detail-user').innerHTML = hierarchy.u_nick;
      document.querySelector('#detail-bronze').innerHTML = hierarchy.b_nick;
      document.querySelector('#detail-silver').innerHTML = hierarchy.s_nick;
      document.querySelector('#detail-gold').innerHTML = hierarchy.g_nick;
      document.querySelector('#detail-platinum').innerHTML = hierarchy.p_nick;

      document.querySelector('#detail-user-name').innerHTML = hierarchy.u_nick;
      document.querySelector('#detail-bronze-name').innerHTML = hierarchy.b_nick;
      document.querySelector('#detail-silver-name').innerHTML = hierarchy.s_nick;
      document.querySelector('#detail-gold-name').innerHTML = hierarchy.g_nick;
      document.querySelector('#detail-platinum-name').innerHTML = hierarchy.p_nick;

      let toFixedValue = (value1, value2) => {
        if (value1 == null || value2 == null) return `<i class="bi bi-dot"></i>`;
        let fixedVal = Number((value1 - value2).toFixed(2));
        return `${value1} (${fixedVal})`;
      };

      document.querySelector('#detail-user-c-roll').innerHTML = hierarchy.u_c_roll == null ? `<i class="bi bi-dot"></i>` : `${hierarchy.u_c_roll}`;
      document.querySelector('#detail-bronze-c-roll').innerHTML = toFixedValue(hierarchy.b_c_roll, hierarchy.u_c_roll);
      document.querySelector('#detail-silver-c-roll').innerHTML = toFixedValue(hierarchy.s_c_roll, hierarchy.b_c_roll);
      document.querySelector('#detail-gold-c-roll').innerHTML = toFixedValue(hierarchy.g_c_roll, hierarchy.s_c_roll);
      document.querySelector('#detail-platinum-c-roll').innerHTML = toFixedValue(hierarchy.p_c_roll, hierarchy.g_c_roll);

      document.querySelector('#detail-user-s-roll').innerHTML = hierarchy.u_s_roll == null ? `<i class="bi bi-dot"></i>` : `${hierarchy.u_s_roll}`;
      document.querySelector('#detail-bronze-s-roll').innerHTML = toFixedValue(hierarchy.b_s_roll, hierarchy.u_s_roll);
      document.querySelector('#detail-silver-s-roll').innerHTML = toFixedValue(hierarchy.s_s_roll, hierarchy.b_s_roll);
      document.querySelector('#detail-gold-s-roll').innerHTML = toFixedValue(hierarchy.g_s_roll, hierarchy.s_s_roll);
      document.querySelector('#detail-platinum-s-roll').innerHTML = toFixedValue(hierarchy.p_s_roll, hierarchy.g_s_roll);

      document.querySelector('#detail-user-lose').innerHTML =
        hierarchy.u_lose == null || hierarchy.u_lose == 0 ? `<i class="bi bi-dot"></i>` : `${hierarchy.u_lose}`;
      document.querySelector('#detail-bronze-lose').innerHTML = toFixedValue(hierarchy.b_lose, hierarchy.u_lose);
      document.querySelector('#detail-silver-lose').innerHTML = toFixedValue(hierarchy.s_lose, hierarchy.b_lose);
      document.querySelector('#detail-gold-lose').innerHTML = toFixedValue(hierarchy.g_lose, hierarchy.s_lose);
      document.querySelector('#detail-platinum-lose').innerHTML = toFixedValue(hierarchy.p_lose, hierarchy.g_lose);

      document.querySelector('#detail-user-margin').innerHTML =
        hierarchy.u_c_bet_margin == null || hierarchy.u_s_bet_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.u_c_bet_margin} / ${hierarchy.u_s_bet_margin}`;
      document.querySelector('#detail-bronze-margin').innerHTML =
        hierarchy.b_c_bet_margin == null || hierarchy.b_s_bet_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.b_c_bet_margin} / ${hierarchy.b_s_bet_margin}`;
      document.querySelector('#detail-silver-margin').innerHTML =
        hierarchy.s_c_bet_margin == null || hierarchy.s_s_bet_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.s_c_bet_margin} / ${hierarchy.s_s_bet_margin}`;
      document.querySelector('#detail-gold-margin').innerHTML =
        hierarchy.g_c_bet_margin == null || hierarchy.g_s_bet_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.g_c_bet_margin} / ${hierarchy.g_s_bet_margin}`;
      document.querySelector('#detail-platinum-margin').innerHTML =
        hierarchy.p_c_bet_margin == null || hierarchy.p_s_bet_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.p_c_bet_margin} / ${hierarchy.p_s_bet_margin}`;

      document.querySelector('#detail-user-roll-margin').innerHTML =
        hierarchy.u_c_roll_margin == null || hierarchy.u_s_roll_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.u_c_roll_margin} / ${hierarchy.u_s_roll_margin}`;
      document.querySelector('#detail-bronze-roll-margin').innerHTML =
        hierarchy.b_c_roll_margin == null || hierarchy.b_s_roll_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.b_c_roll_margin} / ${hierarchy.b_s_roll_margin}`;
      document.querySelector('#detail-silver-roll-margin').innerHTML =
        hierarchy.s_c_roll_margin == null || hierarchy.s_s_roll_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.s_c_roll_margin} / ${hierarchy.s_s_roll_margin}`;
      document.querySelector('#detail-gold-roll-margin').innerHTML =
        hierarchy.g_c_roll_margin == null || hierarchy.g_s_roll_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.g_c_roll_margin} / ${hierarchy.g_s_roll_margin}`;
      document.querySelector('#detail-platinum-roll-margin').innerHTML =
        hierarchy.p_c_roll_margin == null || hierarchy.p_s_roll_margin == null
          ? `<i class="bi bi-dot"></i>`
          : `${hierarchy.p_c_roll_margin} / ${hierarchy.p_s_roll_margin}`;

      if (selectedUserInfo.state == '정상') {
        document.querySelector('#cancelBlockBtn').classList.add('d-none');
      } else if (selectedUserInfo.state == '차단' || selectedUserInfo.state == '승인차단') {
        document.querySelector('#blockBtn').classList.add('d-none');
      }
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });

  $('#userDetail').modal('show');
}

//? 상세보기 내용 수정
$(
  '#detail-lv , #detail-nickname , #detail-phone, #detail-bank , #detail-banknum , #detail-bankowner , #detail-memo, #admin-casinoRate, #admin-slotRate, #admin-loseRate, #admin-deathRate, #admin-c-betMarginRate, #admin-s-betMarginRate, #admin-c-rollMarginRate,#admin-s-rollMarginRate'
).on('input', function () {
  selectedUserInfo.join_memo = selectedUserInfo.join_memo == null ? '' : selectedUserInfo.join_memo;
  document.querySelector('#detail-lv').value = Number(document.querySelector('#detail-lv').value);
  if (
    document.querySelector('#detail-lv').value == selectedUserInfo.level &&
    document.querySelector('#detail-nickname').value == selectedUserInfo.nickname &&
    document.querySelector('#detail-name').value == selectedUserInfo.name &&
    document.querySelector('#detail-phone').value == selectedUserInfo.phone &&
    document.querySelector('#detail-bank').value == selectedUserInfo.bank &&
    document.querySelector('#detail-banknum').value == selectedUserInfo.bank_num &&
    document.querySelector('#detail-bankowner').value == selectedUserInfo.bank_owner &&
    document.querySelector('#detail-memo').value == selectedUserInfo.join_memo &&
    document.querySelector('#admin-casinoRate').value == selectedUserInfo.c_roll_rate &&
    document.querySelector('#admin-slotRate').value == selectedUserInfo.s_roll_rate &&
    document.querySelector('#admin-loseRate').value == selectedUserInfo.lose_rate &&
    document.querySelector('#admin-deathRate').value == selectedUserInfo.death_rate &&
    document.querySelector('#admin-c-betMarginRate').value == selectedUserInfo.c_bet_margin_rate &&
    document.querySelector('#admin-s-betMarginRate').value == selectedUserInfo.s_bet_margin_rate &&
    document.querySelector('#admin-c-rollMarginRate').value == selectedUserInfo.c_roll_margin_rate &&
    document.querySelector('#admin-s-rollMarginRate').value == selectedUserInfo.s_roll_margin_rate &&
    document.querySelector('#detail-memo').value == selectedUserInfo.join_memo
  ) {
    document.querySelector('#modifyUserBtn').disabled = true;
    document.querySelector('#modifyUserBtn').classList.add('asset-secondary');
    document.querySelector('#modifyUserBtn').classList.remove('asset-success');
    isUserDataChanged = false;
  } else {
    document.querySelector('#modifyUserBtn').disabled = false;
    document.querySelector('#modifyUserBtn').classList.remove('asset-secondary');
    document.querySelector('#modifyUserBtn').classList.add('asset-success');
    isUserDataChanged = true;
  }
});

//? 상세보기 모달 초기화
$('#userDetail').on('hidden.bs.modal', function () {
  document.querySelector('#modifyUserBtn').disabled = true;
  document.querySelector('#modifyUserBtn').classList.add('asset-secondary');
  document.querySelector('#modifyUserBtn').classList.remove('asset-success');
  document.querySelector('#userDetailTitle').innerHTML = '';
  document.querySelector('#userDetailTitle').parentElement.classList.remove('bg-primary-subtle', 'bg-danger-subtle');
});

//? 상세보기 내용 수정 적용
document.querySelector('#modifyUserBtn').addEventListener('click', async function () {
  if (isUserDataChanged && isRateModifyValid) {
    modifyUserData();
  } else {
    alert('변경 내용을 다시 확인해주세요');
  }
});

//? 요율 변경시 요율 체크
$(
  '#admin-casinoRate, #admin-slotRate, #admin-loseRate, #admin-deathRate, #admin-c-betMarginRate, #admin-s-betMarginRate, #admin-c-rollMarginRate, #admin-s-rollMarginRate'
).on('input', async function () {
  let { c_roll_valid, s_roll_valid, lose_valid, c_bet_margin_valid, s_bet_margin_valid, c_roll_margin_valid, s_roll_margin_valid } = await checkRate(
    selectedUserInfo.type
  );

  let death_valid = document.querySelector('#admin-deathRate').value >= 0 && document.querySelector('#admin-deathRate').value <= 100;

  if (!death_valid) {
    document.querySelector('#admin-deathRate').classList.add('is-invalid');
    isRateModifyValid = false;
    console.log('100넘을때', isRateModifyValid);
  } else {
    document.querySelector('#admin-deathRate').classList.remove('is-invalid');
  }

  if (!c_roll_valid) {
    document.querySelector('#admin-casinoRate').classList.add('is-invalid');
    isRateModifyValid = false;
  } else {
    document.querySelector('#admin-casinoRate').classList.remove('is-invalid');
  }
  if (!s_roll_valid) {
    document.querySelector('#admin-slotRate').classList.add('is-invalid');
    isRateModifyValid = false;
  } else {
    document.querySelector('#admin-slotRate').classList.remove('is-invalid');
  }
  if (!lose_valid) {
    document.querySelector('#admin-loseRate').classList.add('is-invalid');
    isRateModifyValid = false;
  } else {
    document.querySelector('#admin-loseRate').classList.remove('is-invalid');
  }
  if (!c_bet_margin_valid) {
    document.querySelector('#admin-c-betMarginRate').classList.add('is-invalid');
    isRateModifyValid = false;
  } else {
    document.querySelector('#admin-c-betMarginRate').classList.remove('is-invalid');
  }
  if (!s_bet_margin_valid) {
    document.querySelector('#admin-s-betMarginRate').classList.add('is-invalid');
    isRateModifyValid = false;
  } else {
    document.querySelector('#admin-s-betMarginRate').classList.remove('is-invalid');
  }
  if (!c_roll_margin_valid) {
    document.querySelector('#admin-c-rollMarginRate').classList.add('is-invalid');
    isRateModifyValid = false;
  } else {
    document.querySelector('#admin-c-rollMarginRate').classList.remove('is-invalid');
  }
  if (!s_roll_margin_valid) {
    document.querySelector('#admin-s-rollMarginRate').classList.add('is-invalid');
    isRateModifyValid = false;
  } else {
    document.querySelector('#admin-s-rollMarginRate').classList.remove('is-invalid');
  }

  // If all fields are valid, then set isRateModifyValid to true.
  if (c_roll_valid && s_roll_valid && lose_valid && death_valid && c_bet_margin_valid && s_bet_margin_valid && c_roll_margin_valid && s_roll_margin_valid) {
    isRateModifyValid = true;
  }
});

async function checkRate(type) {
  let c_roll = document.querySelector('#admin-casinoRate').value;
  let s_roll = document.querySelector('#admin-slotRate').value;
  let lose = document.querySelector('#admin-loseRate').value;
  let c_bet_margin = document.querySelector('#admin-c-betMarginRate').value;
  let s_bet_margin = document.querySelector('#admin-s-betMarginRate').value;
  let c_roll_margin = document.querySelector('#admin-c-rollMarginRate').value;
  let s_roll_margin = document.querySelector('#admin-s-rollMarginRate').value;

  let h_c_roll, l_c_roll, h_s_roll, l_s_roll, h_lose, l_lose;

  switch (type) {
    case 0:
      h_c_roll = 100;
      h_s_roll = 100;
      h_lose = 100;
      l_c_roll = lowerMaxRate.c_roll_rate;
      l_s_roll = lowerMaxRate.s_roll_rate;
      l_lose = lowerMaxRate.lose_rate;
      break;
    case 1:
      h_c_roll = hierarchy.p_c_roll;
      l_c_roll = lowerMaxRate.c_roll_rate;
      h_s_roll = hierarchy.p_s_roll;
      l_s_roll = lowerMaxRate.s_roll_rate;
      h_lose = hierarchy.p_lose;
      l_lose = lowerMaxRate.lose_rate;
      break;
    case 2:
      h_c_roll = hierarchy.g_c_roll;
      l_c_roll = lowerMaxRate.c_roll_rate;
      h_s_roll = hierarchy.g_s_roll;
      l_s_roll = lowerMaxRate.s_roll_rate;
      h_lose = hierarchy.g_lose;
      l_lose = lowerMaxRate.lose_rate;
      break;
    case 3:
      h_c_roll = hierarchy.s_c_roll;
      l_c_roll = lowerMaxRate.c_roll_rate;
      h_s_roll = hierarchy.s_s_roll;
      l_s_roll = lowerMaxRate.s_roll_rate;
      h_lose = hierarchy.s_lose;
      l_lose = lowerMaxRate.lose_rate;
      break;
    case 4:
      h_c_roll = getRateValue(hierarchy, 'c_roll');
      l_c_roll = 0;
      h_s_roll = getRateValue(hierarchy, 's_roll');
      l_s_roll = 0;
      h_lose = getRateValue(hierarchy, 'lose');
      l_lose = 0;
      break;
  }

  let c_roll_valid = c_roll >= l_c_roll && c_roll <= h_c_roll;
  let s_roll_valid = s_roll >= l_s_roll && s_roll <= h_s_roll;
  let lose_valid = lose >= l_lose && lose <= h_lose;
  let c_bet_margin_valid = c_bet_margin >= 0 && c_bet_margin <= 100;
  let s_bet_margin_valid = s_bet_margin >= 0 && s_bet_margin <= 100;
  let c_roll_margin_valid = c_roll_margin >= 0 && c_roll_margin <= 100;
  let s_roll_margin_valid = s_roll_margin >= 0 && s_roll_margin <= 100;

  return { c_roll_valid, s_roll_valid, lose_valid, c_bet_margin_valid, s_bet_margin_valid, c_roll_margin_valid, s_roll_margin_valid };
}

function getRateValue(hierarchy, type) {
  if (type === 'c_roll') {
    return hierarchy.b_c_roll || hierarchy.s_c_roll || hierarchy.g_c_roll || hierarchy.p_c_roll || 0;
  }

  if (type === 's_roll') {
    return hierarchy.b_s_roll || hierarchy.s_s_roll || hierarchy.g_s_roll || hierarchy.p_s_roll || 0;
  }

  if (type === 'lose') {
    return hierarchy.b_lose || hierarchy.s_lose || hierarchy.g_lose || hierarchy.p_lose || 0;
  }

  return 0;
}

function modifyUserData() {
  let data = {
    user_id: selectedUserInfo.user_id,
    type: selectedUserInfo.type,
    level: document.querySelector('#detail-lv').value,
    nickname: document.querySelector('#detail-nickname').value,
    name: document.querySelector('#detail-name').value,
    phone: document.querySelector('#detail-phone').value,
    bank: document.querySelector('#detail-bank').value,
    bank_num: document.querySelector('#detail-banknum').value,
    bank_owner: document.querySelector('#detail-bankowner').value,
    join_memo: document.querySelector('#detail-memo').value,
    c_roll_rate: document.querySelector('#admin-casinoRate').value,
    s_roll_rate: document.querySelector('#admin-slotRate').value,
    lose_rate: document.querySelector('#admin-loseRate').value,
    death_rate: document.querySelector('#admin-deathRate').value,
    c_bet_margin_rate: document.querySelector('#admin-c-betMarginRate').value,
    s_bet_margin_rate: document.querySelector('#admin-s-betMarginRate').value,
    c_roll_margin_rate: document.querySelector('#admin-c-rollMarginRate').value,
    s_roll_margin_rate: document.querySelector('#admin-s-rollMarginRate').value,
    node_id: selectedUser.node_id,
  };
  $.ajax({
    type: 'POST',
    url: '/user/modify',
    data: data,
  })
    .done(function (result) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h4 class='pt-3'>${result}</h4>`;
      $('#userDetail').modal('hide');
      $('#confirmModal').modal('show');

      //todo 회원정보 수정 후 모든 테이블 새로고침(필요여부 재검토)
      $.each($.fn.dataTable.tables({ api: true }), function (index, table) {
        if (table.table().node().id !== 'incomeDepoWithDetail') {
          table.ajax.reload(null, false);
        }
      });
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

// #region 부가기능

// #region 비밀번호 확인하기
document.querySelector('#detail-pw').addEventListener('click', function () {
  checkPassword();
});

function checkPassword() {
  $.ajax({
    method: 'POST',
    url: '/user/checkpassword',
    data: { id: selectedUser.아이디 },
  })
    .done(function (result) {
      document.querySelector('#detail-pw').value = result;
      document.querySelector('#detail-pw').readOnly = true;
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

// #region 출금 비밀번호 확인하기
document.querySelector('#detail-withdraw-pw').addEventListener('click', function () {
  checkWithdrawPassword();
});

function checkWithdrawPassword() {
  console.log(selectedUser);
  $.ajax({
    method: 'POST',
    url: '/user/checkwithdrawpassword',
    data: { id: selectedUser.아이디 },
  })
    .done(function (result) {
      document.querySelector('#detail-withdraw-pw').value = result;
      document.querySelector('#detail-withdraw-pw').readOnly = true;
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}
// #endregion

$('#userDetail').on('hidden.bs.modal', function () {
  document.querySelector('#detail-pw').value = '확인';
});
// #endregion

// #region 개별 메세지 보내기
//? 개별 메세지 보내기 모달열기
$('#userDetail').on('click', '#addon .msg-btn', function () {
  document.getElementById('messageType').value = '개별';
  document.getElementById('messageType').disabled = true;
  document.getElementById('sendRange').disabled = true;
  document.getElementById('selectedUser').disabled = false;
  document.getElementById('selectedUser').value = selectedUser.아이디;

  $('#sendMessageModal').modal('show');
});

//? 개별 메세지 전송
document.querySelector('#sendMessageForm').addEventListener('submit', (e) => {
  e.preventDefault();
  let message_data = $('#sendMessageForm').serialize();
  // let messageType = '개별';

  // message_data += '&messageType=' + encodeURIComponent(messageType);

  $.ajax({
    method: 'POST',
    url: '/board/send',
    data: message_data,
  })
    .done((result) => {
      document.querySelector('#boardConfirm').innerHTML = result.msg;
      $('#boardConfirmModal').modal('show');

      if (result.send) {
        $('#sendMessageModal').modal('hide');
        $('#message').DataTable().ajax.reload(null, false);
      }
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

// #region 비밀번호 변경
//? 비밀번호 팝업 생성 및 유효성 검증
document.querySelector('#changeUserPassword').addEventListener('click', function () {
  document.querySelector(
    '#confirmModal .modal-body'
  ).innerHTML = `<h5 class='pt-3' style='line-height:2rem'>[ ${selectedUser.닉네임} ] 유저의<br>비밀번호를 변경 하시겠습니까?</h5>
  <div>
    <div class="input-group">
      <div class="form-floating">
        <input type="password" class="form-control" id="change-user-pw" placeholder="비밀번호" name="pw" maxlength="16" required>
          <label for="change-user-pw">비밀번호</label>
        </div>
        <button class="btn btn-sm btn-secondary px-3" id="change-user-pw-view" type="button">
          <i class="fa-solid fa-eye fa-lg"></i>
        </button>
        </div>
          <div class="description" id="change-user-pw-desc">영문, 숫자, 특수문자 중 2가지 조합 6~16자</div>            
    </div>
  `;
  document.querySelector('#change-user-password-confirm').classList.remove('d-none');

  //? 비밀번호 유효성 검증
  let passwordInput = document.querySelector('#change-user-pw');
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

  passwordInput.addEventListener('input', function () {
    if (passwordRegex.test(this.value)) {
      passwordInput.classList.add('is-valid');
      passwordInput.classList.remove('is-invalid');
    } else {
      passwordInput.classList.add('is-invalid');
      passwordInput.classList.remove('is-valid');
    }
  });

  //? 비밀번호 표시/숨기기 버튼
  const pwViewButton = document.querySelector('#change-user-pw-view');

  pwViewButton.addEventListener('click', function () {
    const pwInput = document.querySelector('#change-user-pw');
    if (pwInput.type === 'password') {
      pwInput.type = 'text'; // 비밀번호 표시
      this.querySelector('i').classList.replace('fa-eye', 'fa-eye-slash'); // 아이콘 변경
    } else {
      pwInput.type = 'password'; // 비밀번호 숨김
      this.querySelector('i').classList.replace('fa-eye-slash', 'fa-eye'); // 아이콘 변경
    }
  });

  $('#confirmModal').modal('show');
});

document.querySelector('#change-user-password-confirm').addEventListener('click', function () {
  $.ajax({
    method: 'POST',
    url: '/user/changeuserpassword',
    data: { id: selectedUser.아이디, newPw: document.querySelector('#change-user-pw').value, type: 'userPassword' },
  })
    .done(function (result) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `${result}`;
      document.getElementById('change-user-password-confirm').classList.add('d-none');
      $('#confirmModal').modal('show');
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

// #region 출금 비밀번호 변경
//? 출금 비밀번호 팝업 생성 및 유효성 검증
document.querySelector('#changeUserWithdrawPassword').addEventListener('click', function () {
  document.querySelector(
    '#confirmModal .modal-body'
  ).innerHTML = `<h5 class='pt-3' style='line-height:2rem'>[ ${selectedUser.닉네임} ] 유저의<br>출금 비밀번호를 변경 하시겠습니까?</h5>
  <div>
    <div class="input-group">
      <div class="form-floating">
        <input type="text" class="form-control" id="change-user-withdraw-pw" placeholder="출금 비밀번호" name="withdrawPw" minlength="6" maxlength="6" required>
        <label for="change-user-withdraw-pw">출금 비밀번호</label>
      </div>       
    </div>
    <div class="description text-start" id="change-user-withdraw-pw-desc">숫자 6자</div>
  </div>
  `;
  document.querySelector('#change-user-withdraw-password-confirm').classList.remove('d-none');

  //? 출금 비밀번호 유효성 검증
  let withdrawPasswordInput = document.querySelector('#change-user-withdraw-pw');
  const withdrawPasswordRegex = /^[0-9]{6}$/;
  withdrawPasswordInput.addEventListener('input', function () {
    if (withdrawPasswordRegex.test(this.value)) {
      withdrawPasswordInput.classList.add('is-valid');
      withdrawPasswordInput.classList.remove('is-invalid');
    } else {
      withdrawPasswordInput.classList.add('is-invalid');
      withdrawPasswordInput.classList.remove('is-valid');
    }
  });

  $('#confirmModal').modal('show');
});

document.querySelector('#change-user-withdraw-password-confirm').addEventListener('click', function () {
  $.ajax({
    method: 'POST',
    url: '/user/changeuserpassword',
    data: { id: selectedUser.아이디, newWithdrawPw: document.querySelector('#change-user-withdraw-pw').value, type: 'userWithdrawPassword' },
  })
    .done(function (result) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `${result}`;
      document.getElementById('change-user-withdraw-password-confirm').classList.add('d-none');
      $('#confirmModal').modal('show');
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

// #endregion

// #region 강제 접속종료
//? 강제 접속종료
document.querySelector('#forceLogout').addEventListener('click', function () {
  document.querySelector('#confirmModal .modal-body').innerHTML = `<div class='logoutId'>${selectedUser.아이디}</div>
  <h5 class='pt-3' style='line-height:2rem'>[ ${selectedUser.닉네임} ] 유저의<br>접속을 강제로 종료하시겠습니까?</h5>`;
  document.querySelector('#force-logout-confirm').classList.remove('d-none');
  $('#confirmModal').modal('show');
});

document.querySelector('#force-logout-confirm').addEventListener('click', function () {
  let logoutId = document.querySelector('.logoutId').innerHTML;
  $.ajax({
    method: 'POST',
    url: '/user/forcelogout',
    data: { id: logoutId },
  })
    .done(function (result) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h4 class='pt-3'>${result}</h4>`;
      document.querySelector('#force-logout-confirm').classList.add('d-none');
      $('#confirmModal').modal('show');
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

// #endregion

// #endregion

// #region 가입승인
// 메모 및 승인창
$('#userJoinConfirm').on('click', 'tbody tr .open-join-confirm', function () {
  selectedUser = $('#userJoinConfirm').DataTable().row($(this).parent('td')).data();
  document.querySelector('#user-join-confirm').disabled = false;
  openConfirmModal();
});

function openConfirmModal() {
  let joinConfirmContent = `
  <div class='col-12 mt-2 fw-bold' style='font-size: 1.2rem'>${selectedUser.닉네임} 회원을 승인하시겠습니까?</div>  
  <div class="mt-3 col-12">  
    <textarea class="form-control"  id="confirmMemo" rows="3" placeholder="추가로 메모할 내용이 있으면 입력하세요"></textarea>
  </div>
  `;
  document.querySelector('#confirmModal .modal-body').innerHTML = joinConfirmContent;
  document.querySelector('#user-join-confirm').classList.remove('d-none');
  document.querySelector('#user-join-block').classList.add('d-none');
  $('#confirmModal').modal('show');
}

// 최종 승인버튼
document.querySelector('#user-join-confirm').addEventListener('click', function () {
  document.querySelector('#user-join-confirm').disabled = true;
  confirmUser();
});

function confirmUser() {
  spinnerToggle();
  memo = document.querySelector('#confirmMemo').value;
  selectedUser.join_memo = memo;

  $.ajax({
    method: 'POST',
    url: '/user/joinconfirm',
    data: selectedUser,
  })
    .done(function (result) {
      console.log(result);
      $('#confirmModal').modal('hide');
      spinnerToggle();
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}
// #endregion

// #region 차단
// 메모 및 차단창
$('#blockBtn').on('click', function () {
  console.log(selectedUser);
  openBlockModal();
});

$('#userJoinConfirm').on('click', 'tbody tr .open-join-block', function () {
  selectedUser = $('#userJoinConfirm').DataTable().row($(this).parent('td')).data();
  openBlockModal();
});

function openBlockModal() {
  let joinBlockContent = `
  <div class='col-12 mt-2 fw-bold' style='font-size: 1.2rem'>${selectedUser.닉네임} 회원을 차단하시겠습니까?</div>  
  <div class="mt-3 col-12">  
    <textarea class="form-control" id="blockMemo" rows="3" placeholder="차단 사유를 입력하세요"></textarea>
  </div>
  `;
  document.querySelector('#confirmModal .modal-body').innerHTML = joinBlockContent;
  document.querySelector('#user-join-block').classList.remove('d-none');
  document.querySelector('#user-join-confirm').classList.add('d-none');

  $('#userDetail').modal('hide');
  $('#confirmModal').modal('show');
}

// 최종 차단버튼
document.querySelector('#user-join-block').addEventListener('click', function () {
  changeBlockState();
});

function changeBlockState() {
  selectedUser.block_reason = document.querySelector('#blockMemo').value;

  $.ajax({
    method: 'POST',
    url: '/user/userblock',
    data: selectedUser,
  })
    .done(function (result) {
      alert(result);

      $('#confirmModal').modal('hide');
      $('#agentBlock').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}
// #endregion

// #region 차단해제
document.querySelector('#cancelBlockBtn').addEventListener('click', () => {
  openBlockCancelModal();
});

function openBlockCancelModal() {
  let joinBlockContent = `
  <div class='col-12 mt-2 fw-bold' style='font-size: 1.1rem'>${selectedUser.닉네임} 회원의 차단을 해제하시겠습니까?</div>
  <div class="mt-3 col-12">  
    <textarea class="form-control" id="blockMemo" rows="3" placeholder="차단해제 사유를 입력하세요"></textarea>
  </div>  
  `;
  document.querySelector('#confirmModal .modal-body').innerHTML = joinBlockContent;
  document.querySelector('#user-block-release').classList.remove('d-none');
  document.querySelector('#user-join-block').classList.add('d-none');
  document.querySelector('#user-join-confirm').classList.add('d-none');

  $('#userDetail').modal('hide');
  $('#confirmModal').modal('show');
}

document.querySelector('#user-block-release').addEventListener('click', () => {
  changeBlockState();
});

// #endregion

// #endregion

// #region 유저 입출금

// #region 처리현황
let rowData;
let memo;

//? 입금 처리현황 버튼
$('#deposit, #dashboardBank, #dashboardWait').on('click', 'tbody tr .deposit-btn', async function () {
  rowData = $('#deposit, #dashboardBank, #dashboardWait').DataTable().row($(this).parent('td')).data();

  if (rowData.처리현황 == '입금신청' || rowData.처리현황 == '입금대기') {
    $.ajax({
      method: 'POST',
      url: '/bank/deposit/status',
      data: {
        IDX: rowData.IDX,
        reqMoney: rowData.신청금액,
        currentStatus: rowData.처리현황,
      },
    })
      .done(function (result) {
        countNotification();
        $('#deposit, #dashboardBank, #dashboardAgentBank, #dashboardWait, #depositWithdraw').DataTable().ajax.reload(null, false);
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  } else if (rowData.처리현황 == '입금확인') {
    let adminBalance;
    $.ajax({
      method: 'POST',
      url: '/navbar',
      async: false,
    })
      .done(function (result) {
        const { giveTakeData, summaryData, navData, todayJoinCount, countOnlineUsers } = result;

        adminBalance = navData.보유금 - summaryData['에이전트 보유금'] - summaryData['에이전트 포인트'];
        -summaryData['유저 포인트'];
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });

    if (adminBalance < rowData.신청금액 + rowData.보너스금액) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h5 class='pt-3 fw-bold'>[API 보유금이 부족]</h5>
      <h5 class='pt-3'>API 보유금을 충전 해 주세요</h5>`;
      $('#confirmModal').modal('show');
      return;
    } else {
      makeConfirmCancelModal('confirm', rowData);
    }
  } else if (rowData.처리현황 == '입금승인') {
    console.log('이미 승인된 내역입니다');
  } else if (rowData.처리현황 === '승인취소') {
    console.log('이미 취소 된 내역입니다');
  }
});

//? 출금 처리현황 버튼
$('#withdraw, #dashboardBank,#dashboardWait').on('click', 'tbody tr .withdraw-btn', function () {
  rowData = $('#withdraw, #dashboardBank, #dashboardWait').DataTable().row($(this).parent('td')).data();

  if (rowData.처리현황 == '출금신청') {
    $.ajax({
      method: 'POST',
      url: '/bank/withdraw/status',
      data: {
        IDX: rowData.IDX,
        reqMoney: rowData.신청금액,
        currentStatus: rowData.처리현황,
      },
    })
      .done(function (result) {
        $('#withdraw, #dashboardBank, #dashboardAgentBank, #dashboardWait, #depositWithdraw').DataTable().ajax.reload(null, false);
        countNotification();
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  } else if (rowData.처리현황 == '출금대기') {
    makeConfirmCancelModal('confirm', rowData);
  } else if (rowData.처리현황 == '출금승인') {
    console.log('이미 승인된 내역입니다');
  } else if (rowData.처리현황 === '승인취소') {
    console.log('이미 취소 된 내역입니다');
  }
});
// #endregion

// #region 입출금 승인
//? 최종 입금승인 버튼
$('#depositConfirm').on('click', function () {
  document.querySelector('#depositConfirm').disabled = true;
  spinnerToggle();

  memo = document.querySelector('#confirmMemo').value;

  $.ajax({
    method: 'POST',
    url: '/bank/deposit/confirm',
    data: {
      IDX: rowData.IDX,
      id: rowData.아이디,
      type: rowData.회원타입,
      bonusType: rowData.보너스타입,
      reqMoney: rowData.신청금액,
      bonusMoney: rowData.보너스금액,
      currentBalance: rowData['신청 시 보유금'],
      afterBalance: rowData['승인 후 보유금'],
      currentStatus: rowData.처리현황,
      deposit_memo: memo,
      confirmTime: getCurrentTime(),
    },
  })
    .done(function (result) {
      document.querySelector('#depositConfirm').disabled = false;
      spinnerToggle();
      $('#confirmCancel').modal('hide');
      $('#deposit, #depositWithdraw, #dashboardBank,#dashboardWait, #dashboardAgentBank').DataTable().ajax.reload(null, false);
      getNavModalData();
      initPopover();
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

//? 최종 출금승인 버튼
$('#withdrawConfirm').on('click', function () {
  document.querySelector('#withdrawConfirm').disabled = true;
  spinnerToggle();

  memo = document.querySelector('#confirmMemo').value;

  $.ajax({
    method: 'POST',
    url: '/bank/withdraw/confirm',
    data: {
      IDX: rowData.IDX,
      id: rowData.아이디,
      reqMoney: rowData.신청금액,
      currentBalance: rowData['신청 시 보유금'],
      afterBalance: rowData['승인 후 보유금'],
      currentStatus: rowData.처리현황,
      withdraw_memo: memo,
      confirmTime: getCurrentTime(),
      type: rowData.회원타입,
    },
  })
    .done(function (result) {
      document.querySelector('#withdrawConfirm').disabled = false;
      spinnerToggle();
      $('#confirmCancel').modal('hide');
      $('#withdraw, #depositWithdraw, #dashboardBank,#dashboardWait, #dashboardAgentBank').DataTable().ajax.reload(null, false);
      getNavModalData();
      initPopover();
      console.log(result);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});
// #endregion

// #region 입출금 취소
//? 입금취소 모달
$('#deposit').on('click', 'tbody tr .deposit-cancel', function () {
  rowData = $('#deposit').DataTable().row($(this).parent('td')).data();
  console.log(rowData);
  makeConfirmCancelModal('cancel', rowData);
});

//? 입금승인 취소버튼
$('#depositConfirmCancel').on('click', function () {
  memo = document.querySelector('#confirmMemo').value;

  $.ajax({
    method: 'POST',
    url: '/bank/deposit/confirmcancel',
    data: {
      IDX: rowData.IDX,
      id: rowData.아이디,
      reqMoney: rowData.신청금액 + rowData.보너스금액,
      currentBalance: rowData['신청 시 보유금'],
      afterBalance: rowData['승인 후 보유금'],
      currentStatus: rowData.처리현황,
      deposit_memo: memo,
      타입: rowData.신청타입,
      userType: rowData.회원타입,
      confirmTime: getCurrentTime(),
    },
  })
    .done(function (result) {
      $('#confirmCancel').modal('hide');
      $('#deposit').DataTable().ajax.reload(null, false);
      getNavModalData();
      initPopover();
      countNotification();
      console.log(result);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

//? 입금 취소버튼
$('#depositCancel').on('click', function () {
  memo = document.querySelector('#confirmMemo').value;

  $.ajax({
    method: 'POST',
    url: '/bank/deposit/cancel',
    data: {
      IDX: rowData.IDX,
      id: rowData.아이디,
      userType: rowData.회원타입,
      reqMoney: rowData.신청금액,
      currentBalance: rowData['신청 시 보유금'],
      afterBalance: rowData['승인 후 보유금'],
      currentStatus: rowData.처리현황,
      deposit_memo: memo,
      confirmTime: getCurrentTime(),
    },
  })
    .done(function (result) {
      countNotification();
      $('#confirmCancel').modal('hide');
      $('#deposit').DataTable().ajax.reload(null, false);
      initPopover();
      console.log(result);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

//? 출금취소 모달
$('#withdraw').on('click', 'tbody tr .deposit-cancel', function () {
  rowData = $('#withdraw').DataTable().row($(this).parent('td')).data();
  console.log(rowData);
  makeConfirmCancelModal('cancel', rowData);
});

//? 출금승인 취소버튼
$('#withdrawConfirmCancel').on('click', function () {
  memo = document.querySelector('#confirmMemo').value;

  $.ajax({
    method: 'POST',
    url: '/bank/withdraw/confirmcancel',
    data: {
      IDX: rowData.IDX,
      id: rowData.아이디,
      userType: rowData.회원타입,
      reqMoney: rowData.신청금액,
      currentBalance: rowData['신청 시 보유금'],
      afterBalance: rowData['승인 후 보유금'],
      currentStatus: rowData.처리현황,
      withdraw_memo: memo,
      confirmTime: getCurrentTime(),
    },
  })
    .done(function (result) {
      $('#confirmCancel').modal('hide');
      $('#withdraw').DataTable().ajax.reload(null, false);
      getNavModalData();
      initPopover();
      console.log(result);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

//? 출금요청 취소버튼
$('#withdrawCancel').on('click', function () {
  memo = document.querySelector('#confirmMemo').value;

  $.ajax({
    method: 'POST',
    url: '/bank/withdraw/cancel',
    data: {
      IDX: rowData.IDX,
      id: rowData.아이디,
      reqMoney: rowData.신청금액,
      userType: rowData.회원타입,
      currentBalance: rowData['신청 시 보유금'],
      afterBalance: rowData['승인 후 보유금'],
      currentStatus: rowData.처리현황,
      withdraw_memo: memo,
      confirmTime: getCurrentTime(),
    },
  })
    .done(function (result) {
      $('#confirmCancel').modal('hide');
      $('#withdraw').DataTable().ajax.reload(null, false);
      initPopover();
      console.log(result);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
});

// #endregion

// #endregion

// #region 에이전트
let upperAgent;
let loginAgentId;
document.querySelector('#reg-domain-name').value = undefined;
document.querySelector('#reg-code').value = undefined;

// #region 에이전트 모달 오픈

// #region 플래티넘
// agent-info.ejs 에서 조건문으로 출력

// #endregion

// #region 골드
$('table').on('click', 'tbody tr .add-gold', function () {
  upperAgent = $('table').DataTable().row($(this).parent('td')).data();

  // 제목 변경
  document.querySelector('#modal-title').innerHTML = '에이전트 생성 - 골드';

  // 상위 에이전트 정보출력
  document.querySelector('#upper-agent-title').innerHTML = '상위 플래티넘 에이전트 정보';

  // 에이전트 타입 변경
  document.querySelector('#agent-type').value = '1';

  // 상위 에이전트 정보입력
  document.querySelector('#upper-id').value = upperAgent.아이디;
  document.querySelector('#upper-nickname').value = upperAgent.닉네임;
  document.querySelector('#upper-casino-roll').value = upperAgent['카지노 롤링요율'];
  document.querySelector('#upper-slot-roll').value = upperAgent['슬롯 롤링요율'];
  document.querySelector('#upper-lose').value = upperAgent['루징요율'];

  // 요율 내 문구변경
  document.querySelector('#casino-roll-rate').nextElementSibling.innerHTML = `카지노 롤링요율 (최대 ${upperAgent['카지노 롤링요율']})`;
  document.querySelector('#slot-roll-rate').nextElementSibling.innerHTML = `슬롯 롤링요율 (최대 ${upperAgent['슬롯 롤링요율']})`;
  document.querySelector('#lose-rate').nextElementSibling.innerHTML = `루징요율 (최대 ${upperAgent['루징요율']})`;

  // 루징 요율 셀렉트박스 생성
  const loseRateSelect = document.querySelector('#lose-rate');
  loseRateSelect.innerHTML = '';

  // 초기 선택 옵션 생성 및 추가
  const defaultOption = document.createElement('option');
  defaultOption.textContent = '루징요율 선택';
  defaultOption.value = '';
  defaultOption.selected = true;
  defaultOption.disabled = true;
  loseRateSelect.appendChild(defaultOption);

  for (let i = 0; i <= 20; i += 5) {
    if (i <= upperAgent['루징요율']) {
      const option = document.createElement('option');
      option.value = i;
      option.innerHTML = i;
      loseRateSelect.appendChild(option);
    }
  }

  $('#addAgentModal').modal('show');
});
// #endregion

// #region 실버
$('table').on('click', 'tbody tr .add-silver', function () {
  upperAgent = $('table').DataTable().row($(this).parent('td')).data();

  // 제목 변경
  document.querySelector('#modal-title').innerHTML = '에이전트 생성 - 실버';

  // 상위 에이전트 정보출력
  document.querySelector('#upper-agent-title').innerHTML = '상위 골드 에이전트 정보';

  // 에이전트 타입 변경
  document.querySelector('#agent-type').value = '2';

  // 상위 에이전트 정보입력
  document.querySelector('#upper-id').value = upperAgent.아이디;
  document.querySelector('#upper-nickname').value = upperAgent.닉네임;
  document.querySelector('#upper-casino-roll').value = upperAgent['카지노 롤링요율'];
  document.querySelector('#upper-slot-roll').value = upperAgent['슬롯 롤링요율'];
  document.querySelector('#upper-lose').value = upperAgent['루징요율'];

  // 요율 내 문구변경
  document.querySelector('#casino-roll-rate').nextElementSibling.innerHTML = `카지노 롤링요율 (최대 ${upperAgent['카지노 롤링요율']})`;
  document.querySelector('#slot-roll-rate').nextElementSibling.innerHTML = `슬롯 롤링요율 (최대 ${upperAgent['슬롯 롤링요율']})`;
  document.querySelector('#lose-rate').nextElementSibling.innerHTML = `루징요율 (최대 ${upperAgent['루징요율']})`;

  // 루징 요율 셀렉트박스 생성
  const loseRateSelect = document.querySelector('#lose-rate');
  loseRateSelect.innerHTML = '';

  // 초기 선택 옵션 생성 및 추가
  const defaultOption = document.createElement('option');
  defaultOption.textContent = '루징요율 선택';
  defaultOption.value = '';
  defaultOption.selected = true;
  defaultOption.disabled = true;
  loseRateSelect.appendChild(defaultOption);

  for (let i = 0; i <= 20; i += 5) {
    if (i <= upperAgent['루징요율']) {
      const option = document.createElement('option');
      option.value = i;
      option.innerHTML = i;
      loseRateSelect.appendChild(option);
    }
  }

  $('#addAgentModal').modal('show');
});
// #endregion

// #region 브론즈
$('table').on('click', 'tbody tr .add-bronze', function () {
  upperAgent = $('table').DataTable().row($(this).parent('td')).data();

  // 제목 변경
  document.querySelector('#modal-title').innerHTML = '에이전트 생성 - 브론즈';

  // 상위 에이전트 정보출력
  document.querySelector('#upper-agent-title').innerHTML = '상위 실버 에이전트 정보';

  // 에이전트 타입 변경
  document.querySelector('#agent-type').value = '3';

  // 상위 에이전트 정보입력
  document.querySelector('#upper-id').value = upperAgent.아이디;
  document.querySelector('#upper-nickname').value = upperAgent.닉네임;
  document.querySelector('#upper-casino-roll').value = upperAgent['카지노 롤링요율'];
  document.querySelector('#upper-slot-roll').value = upperAgent['슬롯 롤링요율'];
  document.querySelector('#upper-lose').value = upperAgent['루징요율'];

  // 요율 내 문구변경
  document.querySelector('#casino-roll-rate').nextElementSibling.innerHTML = `카지노 롤링요율 (최대 ${upperAgent['카지노 롤링요율']})`;
  document.querySelector('#slot-roll-rate').nextElementSibling.innerHTML = `슬롯 롤링요율 (최대 ${upperAgent['슬롯 롤링요율']})`;
  document.querySelector('#lose-rate').nextElementSibling.innerHTML = `루징요율 (최대 ${upperAgent['루징요율']})`;

  // 루징 요율 셀렉트박스 생성
  const loseRateSelect = document.querySelector('#lose-rate');
  loseRateSelect.innerHTML = '';

  // 초기 선택 옵션 생성 및 추가
  const defaultOption = document.createElement('option');
  defaultOption.textContent = '루징요율 선택';
  defaultOption.value = '';
  defaultOption.selected = true;
  defaultOption.disabled = true;
  loseRateSelect.appendChild(defaultOption);

  for (let i = 0; i <= 20; i += 5) {
    if (i <= upperAgent['루징요율']) {
      const option = document.createElement('option');
      option.value = i;
      option.innerHTML = i;
      loseRateSelect.appendChild(option);
    }
  }

  // 추천코드 입력란 노출
  // document.querySelector('#reg-domain-info').classList.remove('d-none');
  // document.querySelector('#reg-domain-input').classList.remove('d-none');
  // document.querySelector('#reg-code-input').classList.remove('d-none');

  document.querySelector('#reg-domain-name').value = 'https://';
  // document.querySelector('#reg-domain-info').classList.remove('d-none');
  document.querySelector('#reg-code').value = '';

  $('#addAgentModal').modal('show');
});
// #endregion

// #region 유저생성
let possibleCount;
$('table').on('click', 'tbody tr .add-user', function () {
  upperAgent = $('table').DataTable().row($(this).parent('td')).data();

  $.ajax({
    method: 'POST',
    url: '/agent/usercounter',
    data: { id: upperAgent.아이디 },
  })
    .done(function (result) {
      possibleCount = result.count;
      document.querySelector('#user-count-label').innerHTML = `생성 가능 ( ${result.count} / 30 )`;
    })
    .fail(function (err) {
      console.log('전송오류');
    });

  $('#addUserModal').modal('show');
});

$('#addBatchUser').on('click', function () {
  console.log('loginAgentId', loginAgentId);
  $.ajax({
    method: 'POST',
    url: '/agent/usercounter',
    data: { id: loginAgentId },
  })
    .done(function (result) {
      possibleCount = result.count;
      document.querySelector('#user-count-label').innerHTML = `생성 가능 ( ${result.count} / 30 )`;
    })
    .fail(function (err) {
      console.log('전송오류');
    });

  $('#addUserModal').modal('show');
});
// #endregion

// #region 에이전트 모달 초기화
$('#addAgentModal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
  $('#addAgentModal input, #addAgentModal select').removeClass('is-invalid is-valid');
  upperAgent = undefined;
  document.querySelector('#reg-domain-name').value = null;
  document.querySelector('#reg-code').value = null;
  id_button.style.boxShadow = '0 0 0 0 #00ffff inset';
  pw_button.style.boxShadow = '0 0 0 0 #00ffff inset';
  nick_button.style.boxShadow = '0 0 0 0 #00ffff inset';
  withdraw_pw_button.style.boxShadow = '0 0 0 0 #00ffff inset';

  $('.description').css('color', '#6c757d');

  pw.type = 'password';
  pw_button.innerHTML = `<i class="fa-solid fa-eye fa-lg"></i>`;
  withdraw_pw.type = 'password';
  withdraw_pw_button.innerHTML = `<i class="fa-solid fa-eye fa-lg"></i>`;

  document.querySelector('#upper-agent-title').classList.remove('d-none');
  document.querySelector('#upper-agent-info').classList.remove('d-none');

  document.querySelector('#casino-roll-rate').nextElementSibling.innerHTML = `카지노 롤링 요율`;
  document.querySelector('#slot-roll-rate').nextElementSibling.innerHTML = `슬롯 롤링 요율`;
  document.querySelector('#lose-rate').nextElementSibling.innerHTML = `루징 요율`;

  document.querySelector('#reg-domain-info').classList.add('d-none');
  document.querySelector('#reg-domain-input').classList.add('d-none');
  document.querySelector('#reg-code-input').classList.add('d-none');
});
// #endregion

// #endregion

// #region 에이전트 생성 유효성 검사

// #region 아이디
let id_isValid = false;
let id_isCheck = false;

let id = document.querySelector('#agent-id');
let id_desc = document.querySelector('#agent-id-desc');
let id_button = document.querySelector('#agent-id-btn');

//? ID 유효성 체크
id.addEventListener('input', function () {
  //* 아이디 규칙: 영문, 숫자 조합 4~12자
  let regex = /^(?=.*[a-zA-Z])[a-zA-Z](?=.*[0-9])[^\s]{3,12}$/;
  //* 아이디는 'admin', 'test'를 포함하면 안됨
  let forbiddenWords = ['admin', 'test'];

  let isValid = regex.test(id.value) && !forbiddenWords.some((word) => id.value.toLowerCase().includes(word));

  if (!isValid) {
    id_desc.style.color = '#dc3545';
    if (id.value.toLowerCase().includes('admin')) {
      id_desc.innerHTML = '아이디는 admin을 포함할 수 없습니다.';
    } else if (id.value.toLowerCase().includes('test')) {
      id_desc.innerHTML = '아이디는 test를 포함할 수 없습니다.';
    } else {
      id_desc.innerHTML = '영어 소문자, 숫자 조합 4~12자';
    }
    id_button.style.boxShadow = '0 0 0 0 #00ffff inset';
    id.classList.add('is-invalid');
    id_isValid = false;
  } else {
    id_desc.style.color = '#dc3545';
    id_desc.innerHTML = '아이디 중복확인을 해주세요';
    id_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    id_isValid = true;
    id.classList.remove('is-invalid', 'is-valid');
  }
});

// id.addEventListener('input', function () {
//   //* 아이디 규칙: 영문, 숫자 조합 6~12자
//   // let regex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,12}$/;
//   //* 아이디 규칙: 영문, 숫자 조합 4~12자
//   let regex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{4,12}$/;

//   if (!regex.test(id.value)) {
//     id_desc.style.color = '#dc3545';
//     // id_desc.innerHTML = '영문, 숫자 조합 6~12자';
//     id_desc.innerHTML = '영문, 숫자 조합 4~12자';
//     id_button.style.boxShadow = '0 0 0 0 #00ffff inset';
//     id.classList.add('is-invalid');
//     id_isValid = false;
//   } else {
//     id_desc.style.color = '#dc3545';
//     id_desc.innerHTML = '아이디 중복확인을 해주세요';
//     id_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
//     id_isValid = true;
//     id.classList.remove('is-invalid', 'is-valid');
//   }
// });

//? ID 중복체크
id_button.addEventListener('click', function () {
  if (id_isValid) {
    $.ajax({
      method: 'POST',
      url: '/agent/doublecheck',
      data: { id: id.value },
    })
      .done(function (result) {
        if (!result) {
          id_desc.style.color = '#6c757d';
          id_desc.innerHTML = '사용 가능한 아이디 입니다';
          id_isCheck = true;
          id.classList.add('is-valid');
          code.value = id.value;
        } else {
          id_desc.style.color = '#dc3545';
          id_desc.innerHTML = '이미 사용 중인 아이디입니다';
          id.classList.add('is-invalid');
          id_isCheck = false;
        }
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  }
});
// #endregion

// #region 비밀번호
let pw_isValid = false;

let pw = document.querySelector('#agent-pw');
let pw_desc = document.querySelector('#agent-pw-desc');
let pw_button = document.querySelector('#agent-pw-btn');

//? PW 유효성 체크
pw.addEventListener('input', () => {
  //* 비밀번호 규칙: 영문, 숫자, 특수문자 조합 8~16자
  // let regex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/;
  //* 비밀번호 규칙: 영문, 숫자, 특수문자 중 2가지 조합 6~16자
  let regex = /^(?=.*[a-zA-Z])(?=.*[0-9!@#?]).{6,16}$/;

  if (!regex.test(pw.value)) {
    pw_desc.style.color = '#dc3545';
    pw_desc.innerHTML = '영문, 숫자, 특수문자 조합 6~16자';
    // pw_desc.innerHTML = '영문, 숫자, 특수문자 조합 8~16자';
    pw_button.style.boxShadow = '0 0 0 0 #00ffff inset';
    pw.classList.add('is-invalid');
    pw_isValid = false;
  } else {
    pw_desc.style.color = '#6c757d';
    pw_desc.innerHTML = '사용 가능한 비밀번호 입니다';
    pw_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    pw.classList.replace('is-invalid', 'is-valid');
    pw_isValid = true;
  }
});

//? PW 확인 토글
pw_button.addEventListener('click', () => {
  if (pw.type === 'password') {
    pw.type = 'text';
    pw_button.innerHTML = `<i class="fa-solid fa-eye-slash fa-lg"></i>`;
  } else {
    pw.type = 'password';
    pw_button.innerHTML = `<i class="fa-solid fa-eye fa-lg"></i>`;
  }
});
// #endregion

// #region 닉네임
let nick_isValid = false;
let nick_isCheck = false;

let nick = document.querySelector('#agent-nick');
let nick_desc = document.querySelector('#agent-nick-desc');
let nick_button = document.querySelector('#agent-nick-btn');

//? nickname 유효성 체크
nick.addEventListener('input', () => {
  let regex = /^(?=.*[a-z가-힣]).{2,8}$/;

  if (!regex.test(nick.value)) {
    nick_desc.style.color = '#dc3545';
    nick_desc.innerHTML = '한글, 영문, 숫자 조합 2~8자';
    nick_button.style.boxShadow = '0 0 0 0 #00ffff inset';
    nick.classList.add('is-invalid');
    nick_isValid = false;
  } else {
    nick_desc.style.color = '#dc3545';
    nick_desc.innerHTML = '닉네임 중복확인을 해주세요';
    nick_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    nick_isValid = true;
    nick.classList.remove('is-invalid', 'is-valid');
  }
});

//? nickname 중복체크
nick_button.addEventListener('click', function () {
  nick_desc.style.color = '#6c757d';
  if (nick_isValid) {
    nick_desc.style.color = '#6c757d';

    $.ajax({
      method: 'POST',
      url: '/agent/doublecheck',
      data: { nickname: nick.value },
    })
      .done(function (result) {
        if (!result) {
          nick_desc.innerHTML = '사용 가능한 닉네임 입니다';
          nick_isCheck = true;
          nick.classList.add('is-valid');
        } else {
          nick_desc.style.color = '#dc3545';
          nick_desc.innerHTML = '이미 사용 중인 닉네임입니다';
          nick.classList.add('is-invalid');
          nick_isCheck = false;
        }
      })
      .fail(function (err) {
        console.log('전송오류');
      });
  }
});
// #endregion

// #region 전화번호
let phone_isValid = false;

let phone = document.querySelector('#agent-phone');
let phone_desc = document.querySelector('#agent-phone-desc');

//? 폰번호 유효성 체크
phone.addEventListener('input', () => {
  let regex = /^01[016789][1-9]{1}\d{2,3}\d{4}$/;

  //? 이후 중복 된 전화번호 케이스 추가
  if (!regex.test(phone.value)) {
    phone_desc.style.color = '#dc3545';
    phone_desc.innerHTML = '전화번호를 확인 해주세요';
    phone.classList.add('is-invalid');
    phone_isValid = false;
  } else {
    phone_desc.style.color = '#6c757d';
    phone_desc.innerHTML = '사용 가능한 전화번호 입니다';
    phone.classList.replace('is-invalid', 'is-valid');
    phone_isValid = true;
  }
});
// #endregion

// #region 은행
let bank_isValid = false;
let bank = document.querySelector('#agent-bank');

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

let account = document.querySelector('#agent-account-num');
let account_desc = document.querySelector('#agent-account-num-desc');

//? 계좌번호 유효성 체크
account.addEventListener('input', () => {
  let regex = /^\d{10,14}$/;

  if (!regex.test(account.value)) {
    account_desc.style.color = '#dc3545';
    account.classList.add('is-invalid');
    account_isValid = false;
  } else {
    account_desc.style.color = '#6c757d';
    account.classList.replace('is-invalid', 'is-valid');
    account_isValid = true;
  }
});
// #endregion

// #region 예금주
let holder_isValid = false;

let holder = document.querySelector('#agent-account-holder');
let holder_desc = document.querySelector('#agent-account-holder-desc');

//? 예금주 유효성 체크
holder.addEventListener('input', () => {
  let regex = /^[a-zA-Z가-힣\s]{2,}$/;

  if (!regex.test(holder.value)) {
    holder_desc.style.color = '#dc3545';
    holder.classList.add('is-invalid');
    holder_isValid = false;
  } else {
    holder_desc.style.color = '#6c757d';
    holder.classList.replace('is-invalid', 'is-valid');
    holder_isValid = true;
  }
});
// #endregion

// #region 출금 비밀번호
let withdraw_isValid = false;

let withdraw_pw = document.querySelector('#agent-withdraw-pw');
let withdraw_pw_desc = document.querySelector('#agent-withdraw-pw-desc');
let withdraw_pw_button = document.querySelector('#agent-withdraw-pw-btn');

//? 출금 비밀번호 유효성 체크
withdraw_pw.addEventListener('input', () => {
  let regex = /^\d{6}$/;

  if (!regex.test(withdraw_pw.value)) {
    withdraw_pw_desc.style.color = '#dc3545';
    withdraw_pw_button.style.boxShadow = '0 0 0 0 #00ffff inset';
    withdraw_pw.classList.add('is-invalid');
    withdraw_isValid = false;
  } else {
    withdraw_pw_desc.style.color = '#6c757d';
    withdraw_pw_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    withdraw_pw.classList.replace('is-invalid', 'is-valid');
    withdraw_isValid = true;
  }
});

//? 출금 비밀번호 확인 토글
withdraw_pw_button.addEventListener('click', () => {
  if (withdraw_pw.type === 'password') {
    withdraw_pw.type = 'text';
    withdraw_pw_button.innerHTML = `<i class="fa-solid fa-eye-slash fa-lg"></i>`;
  } else {
    withdraw_pw.type = 'password';
    withdraw_pw_button.innerHTML = `<i class="fa-solid fa-eye fa-lg"></i>`;
  }
});
// #endregion

// #region 커미션 요율
let casino_roll_isValid = false;
let slot_roll_isValid = false;
let lose_isValid = false;
let bet_margin_isValid = true;
let roll_margin_isValid = true;

$('#addAgentModal').on('input', '.rate-input', function () {
  let regex = /^(100(\.0{1,2})?|[1-9]\d(\.\d{1,2})?|\d(\.\d{1,2})?)$/; // assuming the regex checks for values from 0 to 100 with up to 2 decimal places

  switch (this.id) {
    case 'bet-margin-rate':
    case 'roll-margin-rate':
      if (!regex.test(this.value) || this.value > 100) {
        this.classList.add('is-invalid');
        this.classList.remove('is-valid');
        this.id === 'bet-margin-rate' ? (bet_margin_isValid = false) : (roll_margin_isValid = false);
      } else {
        this.classList.add('is-valid');
        this.classList.remove('is-invalid');
        this.id === 'bet-margin-rate' ? (bet_margin_isValid = true) : (roll_margin_isValid = true);
      }
      break;
    case 'casino-roll-rate':
    case 'slot-roll-rate':
    case 'lose-rate':
      if (upperAgent == undefined) {
        if (!regex.test(this.value) || this.value > 100) {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
          this.id === 'casino-roll-rate' ? (casino_roll_isValid = false) : this.id === 'slot-roll-rate' ? (slot_roll_isValid = false) : (lose_isValid = false);
        } else {
          this.classList.add('is-valid');
          this.classList.remove('is-invalid');
          this.id === 'casino-roll-rate' ? (casino_roll_isValid = true) : this.id === 'slot-roll-rate' ? (slot_roll_isValid = true) : (lose_isValid = true);
        }
      } else if (upperAgent != undefined) {
        if (regex.test(this.value) && this.value <= upperAgent[this.dataset.ratetype]) {
          this.classList.add('is-valid');
          this.classList.remove('is-invalid');
          this.id === 'casino-roll-rate' ? (casino_roll_isValid = true) : this.id === 'slot-roll-rate' ? (slot_roll_isValid = true) : (lose_isValid = true);
        } else {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
          this.id === 'casino-roll-rate' ? (casino_roll_isValid = false) : this.id === 'slot-roll-rate' ? (slot_roll_isValid = false) : (lose_isValid = false);
        }
      }
      break;
    default:
      break;
  }
});

// $('#addAgentModal').on('input', '.rate-input', function () {
//   let regex = /(^[1-9][0-9]*$)|^0$|(^[0]\.{1}\d{1,2}$)|(^[1-9][0-9]*\.{1}\d{1,2}$)/;

//   switch (this.id) {
//     case 'bet-margin-rate':
//     case 'roll-margin-rate':
//       if (!regex.test(this.value) || this.value > 100) {
//         this.classList.add('is-invalid');
//         this.classList.remove('is-valid');
//         this.id === 'bet-margin-rate' ? (bet_margin_isValid = false) : (roll_margin_isValid = false);
//       } else {
//         this.classList.add('is-valid');
//         this.classList.remove('is-invalid');
//         this.id === 'bet-margin-rate' ? (bet_margin_isValid = true) : (roll_margin_isValid = true);
//       }
//       break;
//     default:
//       if (upperAgent == undefined) {
//         if (!regex.test(this.value) || this.value > 100) {
//           this.classList.add('is-invalid');
//           this.classList.remove('is-valid');
//           this.id === 'casino-roll-rate' ? (casino_roll_isValid = false) : this.id === 'slot-roll-rate' ? (slot_roll_isValid = false) : (lose_isValid = false);
//         } else {
//           this.classList.add('is-valid');
//           this.classList.remove('is-invalid');
//           this.id === 'casino-roll-rate' ? (casino_roll_isValid = true) : this.id === 'slot-roll-rate' ? (slot_roll_isValid = true) : (lose_isValid = true);
//         }
//       } else if (upperAgent != undefined) {
//         if (regex.test(this.value) && this.value <= upperAgent[this.dataset.ratetype]) {
//           this.classList.add('is-valid');
//           this.classList.remove('is-invalid');
//           this.id === 'casino-roll-rate' ? (casino_roll_isValid = true) : this.id === 'slot-roll-rate' ? (slot_roll_isValid = true) : (lose_isValid = true);
//         } else if (!regex.test(this.value) || this.value > upperAgent[this.dataset.ratetype]) {
//           this.classList.add('is-invalid');
//           this.classList.remove('is-valid');
//           this.id === 'casino-roll-rate' ? (casino_roll_isValid = false) : this.id === 'slot-roll-rate' ? (slot_roll_isValid = false) : (lose_isValid = false);
//         }
//       }
//   }
// });

// let casino_roll_isValid = false;
// let slot_roll_isValid = false;
// let lose_isValid = false;
// let bet_margin_isValid = false;
// let roll_margin_isValid = false;

// let regex = /(^[1-9][0-9]*$)|^0$|(^[0]\.{1}\d{1,2}$)|(^[1-9][0-9]*\.{1}\d{1,2}$)/;

// $('#addAgentModal').on('input', '.rate-input', function () {
//   if (upperAgent == undefined) {
//     if (!regex.test(this.value) || this.value > 100) {
//       this.classList.add('is-invalid');
//       this.classList.remove('is-valid');

//       switch (this.id) {
//         case 'casino-roll-rate':
//           casino_roll_isValid = false;
//           break;
//         case 'slot-roll-rate':
//           slot_roll_isValid = false;
//           break;
//         case 'lose-rate':
//           lose_isValid = false;
//           break;
//         case 'bet-margin-rate':
//           bet_margin_isValid = false;
//           break;
//         case 'bet-margin-rate':
//           roll_margin_isValid = false;
//           break;
//       }
//     } else {
//       this.classList.add('is-valid');
//       this.classList.remove('is-invalid');

//       switch (this.id) {
//         case 'casino-roll-rate':
//           casino_roll_isValid = true;
//           break;
//         case 'slot-roll-rate':
//           slot_roll_isValid = true;
//           break;
//         case 'lose-rate':
//           lose_isValid = true;
//           break;
//         case 'bet-margin-rate':
//           bet_margin_isValid = true;
//           break;
//         case 'roll-margin-rate':
//           roll_margin_isValid = true;
//           break;
//       }
//     }
//   } else if (upperAgent != undefined) {
//     if (regex.test(this.value) && this.value <= upperAgent[this.dataset.ratetype]) {
//       this.classList.add('is-valid');
//       this.classList.remove('is-invalid');

//       switch (this.id) {
//         case 'casino-roll-rate':
//           casino_roll_isValid = true;
//           break;
//         case 'slot-roll-rate':
//           slot_roll_isValid = true;
//           break;
//         case 'lose-rate':
//           lose_isValid = true;
//           break;
//         case 'bet-margin-rate':
//           bet_margin_isValid = true;
//           break;
//         case 'roll-margin-rate':
//           roll_margin_isValid = true;
//           break;
//       }
//     } else if (!regex.test(this.value) || this.value > upperAgent[this.dataset.ratetype]) {
//       this.classList.add('is-invalid');
//       this.classList.remove('is-valid');

//       switch (this.id) {
//         case 'casino-roll-rate':
//           casino_roll_isValid = false;
//           break;
//         case 'slot-roll-rate':
//           slot_roll_isValid = false;
//           break;
//         case 'lose-rate':
//           lose_isValid = false;
//           break;
//         case 'bet_margin-rate':
//           bet_margin_isValid = false;
//           break;
//         case 'bet_margin-rate':
//           roll_margin_isValid = false;
//           break;
//       }
//     }
//   }
// });
// #endregion

// #region 도메인 주소
let domain_isValid = true;

let domain = document.querySelector('#reg-domain-input input');

//? 도메인 유효성 체크
domain.addEventListener('input', () => {
  let regex = /^https:\/\/([a-z0-9]([-a-z0-9]*[a-z0-9])?\.)+[a-z]{2,}$/i;

  if (!regex.test(domain.value)) {
    domain.classList.add('is-invalid');
    domain_isValid = false;
  } else {
    domain.classList.replace('is-invalid', 'is-valid');
    domain_isValid = true;
  }
});
// #endregion

// #region 추천코드
let code_isValid = true;

let code = document.querySelector('#reg-code-input input');
let code_desc = document.querySelector('#reg-code-desc');

//? 추천코드 유효성 체크
//? 추천코드는 아이디와 동일하게 설정
// code.addEventListener('input', () => {
//   let regex = /^[a-zA-Z]{2,3}[0-9]{2,4}/g;

//   if (!regex.test(code.value)) {
//     code_desc.style.color = '#dc3545';
//     code.classList.add('is-invalid');
//     code_isValid = false;
//   } else {
//     code_desc.style.color = '#6c757d';
//     code.classList.replace('is-invalid', 'is-valid');
//     code_isValid = true;
//   }
// });
// #endregion

// #region 에이전트 생성 버튼
let addAgent = document.querySelector('#addAgent');

addAgent.addEventListener('click', function () {
  if (
    id_isCheck &&
    pw_isValid &&
    nick_isCheck &&
    phone_isValid &&
    bank_isValid &&
    account_isValid &&
    holder_isValid &&
    withdraw_isValid &&
    casino_roll_isValid &&
    slot_roll_isValid &&
    lose_isValid &&
    bet_margin_isValid &&
    roll_margin_isValid &&
    domain_isValid &&
    code_isValid
  ) {
    let agentJoindData = $('#agent-join').serialize();
    if (upperAgent != undefined) {
      agentJoindData += `&platinum=${upperAgent['플래티넘_id']}&gold=${upperAgent['골드_id']}&silver=${upperAgent['실버_id']}&bronze=${upperAgent['브론즈_id']}`;
    }

    $.ajax({
      method: 'POST',
      url: '/agent/add',
      data: agentJoindData,
    })
      .done(function (result) {
        let { agentType, isAdmin } = result;
        document.querySelector('#confirmModal .modal-body').innerHTML = `
        <h1 class="fs-5 pt-3">${agentType} 에이전트 생성완료</h1>`;

        if (isAdmin != 9) {
          socket.emit('to_admin', { type: 'requestJoin', userId: agentType });
        }

        $('#addAgentModal').modal('hide');
        $('#confirmModal').modal('show');
      })
      .fail(function (err) {
        console.log(err);
      });
  } else {
    addAgent.innerHTML = '입력값 확인';
    addAgent.classList.add('bg-danger');
    console.log('입력필드 유효성 확인 실패');

    setTimeout(() => {
      addAgent.innerHTML = '생성하기';
      addAgent.classList.remove('bg-danger');
    }, 3000);
  }
});

// #endregion

// #endregion

// #region 유저생성

// #region 아이디
let userId_isValid = false;
let userId_isCheck = false;

let userId = document.querySelector('#user-id');
let userId_desc = document.querySelector('#user-id-desc');
let userId_button = document.querySelector('#user-id-btn');

//? ID 유효성 체크
//? ID 유효성 체크
userId.addEventListener('input', function () {
  let regex = /^[a-zA-Z]{2,6}$/;
  // let regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{2,}$/;

  //* 아이디는 'admin', 'test'를 포함하면 안됨
  let forbiddenWords = ['admin', 'test'];

  let isValid = regex.test(userId.value) && !forbiddenWords.some((word) => userId.value.toLowerCase().includes(word));

  if (!isValid) {
    userId_desc.style.color = '#dc3545';
    if (userId.value.toLowerCase().includes('admin')) {
      userId_desc.innerHTML = '아이디는 admin을 포함할 수 없습니다.';
    } else if (userId.value.toLowerCase().includes('test')) {
      userId_desc.innerHTML = '아이디는 test를 포함할 수 없습니다.';
    } else {
      userId_desc.innerHTML = '영문 2~6자';
    }
    userId_button.style.boxShadow = '0 0 0 0 #00ffff inset';
    userId.classList.add('is-invalid');
    userId_isValid = false;
    userId_isCheck = false;
  } else {
    userId_desc.style.color = '#dc3545';
    userId_desc.innerHTML = '아이디 중복확인을 해주세요';
    userId_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    userId_isValid = true;
    userId.classList.remove('is-invalid', 'is-valid');
  }
});

// userId.addEventListener('input', function () {
//   let regex = /^[a-zA-Z]{2,6}$/;
//   // let regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{2,}$/;

//   if (!regex.test(userId.value)) {
//     userId_desc.style.color = '#dc3545';
//     userId_desc.innerHTML = '영문 2~6자';
//     userId_button.style.boxShadow = '0 0 0 0 #00ffff inset';
//     userId.classList.add('is-invalid');
//     userId_isValid = false;
//   } else {
//     userId_desc.style.color = '#dc3545';
//     userId_desc.innerHTML = '아이디 중복확인을 해주세요';
//     userId_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
//     userId_isValid = true;
//     userId.classList.remove('is-invalid', 'is-valid');
//   }
// });

//? ID 중복체크
userId_button.addEventListener('click', function () {
  if (userId_isValid) {
    $.ajax({
      method: 'POST',
      url: '/user/doublecheck',
      data: { id: userId.value, type: 'repeat' },
    })
      .done(function (result) {
        if (!result) {
          userId_desc.style.color = '#6c757d';
          userId_desc.innerHTML = '사용 가능한 아이디 입니다';
          userId_isCheck = true;
          userId.classList.add('is-valid');
        } else {
          userId_desc.style.color = '#dc3545';
          userId_desc.innerHTML = '이미 사용 중인 아이디입니다';
          userId.classList.add('is-invalid');
          userId_isCheck = false;
        }
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  }
});
// #endregion

// #region 비밀번호
let user_pw_isValid = false;

let user_pw = document.querySelector('#user-pw');
let user_pw_desc = document.querySelector('#user-pw-desc');
let user_pw_button = document.querySelector('#user-pw-btn');

//? PW 유효성 체크
user_pw.addEventListener('input', () => {
  //* 비밀번호 규칙: 영문, 숫자, 특수문자 조합 8~16자
  // let regex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/;
  //* 비밀번호 규칙: 영문, 숫자, 특수문자 중 2가지 조합 6~16자
  let regex = /^(?=.*[a-zA-Z])(?=.*[0-9!@#?]).{4,16}$/;

  if (!regex.test(user_pw.value)) {
    user_pw_desc.style.color = '#dc3545';
    user_pw_desc.innerHTML = '영문, 숫자, 특수문자(선택) 조합 4~16자';
    user_pw_button.style.boxShadow = '0 0 0 0 #00ffff inset';
    user_pw.classList.add('is-invalid');
    user_pw_isValid = false;
  } else {
    user_pw_desc.style.color = '#6c757d';
    user_pw_desc.innerHTML = '사용 가능한 비밀번호 입니다';
    user_pw_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    user_pw.classList.replace('is-invalid', 'is-valid');
    user_pw_isValid = true;
  }
});

//? PW 확인 토글
user_pw_button.addEventListener('click', () => {
  if (user_pw.type === 'password') {
    user_pw.type = 'text';
    user_pw_button.innerHTML = `<i class="fa-solid fa-eye-slash fa-lg"></i>`;
  } else {
    user_pw.type = 'password';
    user_pw_button.innerHTML = `<i class="fa-solid fa-eye fa-lg"></i>`;
  }
});
// #endregion

// #region 닉네임
let user_nick_isValid = false;
let user_nick_isCheck = false;

let user_nick = document.querySelector('#user-nick');
let user_nick_desc = document.querySelector('#user-nick-desc');
let user_nick_button = document.querySelector('#user-nick-btn');

//? nickname 유효성 체크
user_nick.addEventListener('input', () => {
  let regex = /^[a-zA-Z가-힣0-9]{2,8}$/;

  if (!regex.test(user_nick.value)) {
    user_nick_desc.style.color = '#dc3545';
    user_nick_desc.innerHTML = '한글, 영문, 조합 2~8자';
    user_nick_button.style.boxShadow = '0 0 0 0 #00ffff inset';
    user_nick.classList.add('is-invalid');
    user_nick_isValid = false;
    user_nick_isCheck = false;
  } else {
    user_nick_desc.style.color = '#dc3545';
    user_nick_desc.innerHTML = '닉네임 중복확인을 해주세요';
    user_nick_button.style.boxShadow = 'inset 0 0 5px 3px #ffc107';
    user_nick_isValid = true;
    user_nick.classList.remove('is-invalid', 'is-valid');
  }
});

//? nickname 중복체크
user_nick_button.addEventListener('click', function () {
  if (user_nick_isValid) {
    user_nick_desc.style.color = '#6c757d';

    $.ajax({
      method: 'POST',
      url: '/user/doublecheck',
      data: { nickname: user_nick.value },
    })
      .done(function (result) {
        if (!result) {
          user_nick_desc.innerHTML = '사용 가능한 닉네임 입니다';
          user_nick_isCheck = true;
          user_nick.classList.add('is-valid');
        } else {
          user_nick_desc.style.color = '#dc3545';
          user_nick_desc.innerHTML = '이미 사용 중인 닉네임입니다';
          user_nick.classList.add('is-invalid');
          user_nick_isCheck = false;
        }
      })
      .fail(function (err) {
        console.log('전송오류');
      });
  }
});
// #endregion

// #region 자동생성 갯수
let user_count_isValid = false;

let user_count = document.querySelector('#user-count');
let user_count_desc = document.querySelector('#user-count-desc');

user_count.addEventListener('input', () => {
  if (user_count.value > possibleCount) {
    user_count.value = possibleCount;
  }
  if (user_count.value > 0) {
    user_count_isValid = true;
  } else if (user_count.value == '') {
    user_count_isValid = false;
  }
});

// #endregion

// #region 유저 생성버튼
let addUser = document.querySelector('#addUser');

addUser.addEventListener('click', function () {
  console.log(userId_isCheck);
  console.log(user_pw_isValid);
  console.log(user_nick_isCheck);
  console.log(user_count_isValid);

  if (userId_isCheck && user_pw_isValid && user_nick_isCheck && user_count_isValid) {
    let userJoinData = $('#user-join').serialize();
    if (upperAgent) {
      userJoinData += `&upper_id=${upperAgent['아이디']}`;
    }

    $.ajax({
      method: 'POST',
      url: '/user/add',
      data: userJoinData,
    })
      .done(function (result) {
        console.log(result);
        document.querySelector('#boardConfirm').innerHTML = result;
        $('#addUserModal').modal('hide');
        $('#boardConfirmModal').modal('show');
      })
      .fail(function (err) {
        console.log(err);
      });
  } else {
    addUser.innerHTML = '입력값 확인';
    addUser.classList.add('bg-danger');

    setTimeout(() => {
      addUser.innerHTML = '생성하기';
      addUser.classList.remove('bg-danger');
    }, 3000);
  }
});
// #endregion

// #region 유저 모달 초기화
$('#addUserModal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
  $('#addAgentModal input, #addAgentModal select').removeClass('is-invalid is-valid');

  upperAgent = undefined;

  userId_button.style.boxShadow = '0 0 0 0 #00ffff inset';
  user_pw_button.style.boxShadow = '0 0 0 0 #00ffff inset';
  user_nick_button.style.boxShadow = '0 0 0 0 #00ffff inset';

  $('.description').css('color', '#6c757d');

  user_pw.type = 'password';
  user_pw_button.innerHTML = `<i class="fa-solid fa-eye fa-lg"></i>`;
});
// #endregion

// #endregion

// #region 에이전트 입출금, 포인트전환

// #region 모달기능
//? 모달닫을 때 초기화
$('.modal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
  $('.modal input').removeClass('is-invalid is-valid');
});
// #endregion

// #region 입금 모달
//todo 신청금액 없을 시 경고메시지 표시하기
let deposit = {
  reqExist: false,
  isBankReq: false,
  pushedMoney: 0,
  reqMoney: 0,
  afterReqMoney: 0,
  reqMoneyText: document.querySelector('#deposit-req-money'),
  afterReqMoneyText: document.querySelector('#deposit-after-money'),
};
let accountReqBtn = document.querySelector('#deposit-req-bank');

if (document.querySelector('#agentDepositBtn')) {
  //? 입금계좌 요청
  accountReqBtn.addEventListener('click', function () {
    reqBankAccount();
  });

  //? 입금금액 버튼
  $('#deposit-btn-group .col-3 button.btn.btn-light').click(function (e) {
    pushMoneyBtn(deposit, 'deposit', e);
  });

  //? 모달닫기 > 금액 클리어
  $('#agentDepositModal').on('hidden.bs.modal', function () {
    assetModalClear(deposit);
  });

  //? 정정 버튼
  document.querySelector('#deposit-modify').addEventListener('click', function () {
    pushClearBtn(deposit);
  });

  //? 입금신청 버튼
  document.querySelector('#deposit-submit').addEventListener('click', function () {
    if (!deposit.isBankReq) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h5 class='pt-3'>먼저 입금계좌 요청을 해주세요</h5>`;
      $('#confirmModal').modal('show');
      return;
    } else if (deposit.reqMoney == 0) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h5 class='pt-3'>입금신청 할 금액을 선택해주세요</h5>`;
      $('#confirmModal').modal('show');
      return;
    }

    if (deposit.reqExist) {
      document.querySelector('#deposit-submit').disabled = true;
      pushRequestBtn(deposit, 'deposit');
    }
  });
}
// #endregion

// #region 출금 모달
//todo 신청금액 없을 시 경고메시지 표시하기
let withdraw = {
  reqExist: false,
  pushedMoney: 0,
  reqMoney: 0,
  afterReqMoney: 0,
  reqMoneyText: document.querySelector('#withdraw-req-money'),
  afterReqMoneyText: document.querySelector('#withdraw-after-money'),
};

if (document.querySelector('#agentWithdrawBtn')) {
  //? 출금금액 버튼
  $('#withdraw-btn-group .col-3 button.btn.btn-light').click(function (e) {
    pushMoneyBtn(withdraw, 'withdraw', e);
  });

  //? 모달닫기 > 금액 클리어
  $('#agentWithdrawModal').on('hidden.bs.modal', function () {
    assetModalClear(withdraw);
  });

  //? 정정 버튼
  document.querySelector('#withdraw-modify').addEventListener('click', function () {
    pushClearBtn(withdraw);
  });

  //? 출금신청 버튼
  document.querySelector('#withdraw-submit').addEventListener('click', function () {
    if (withdraw.reqMoney == 0) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h5 class='pt-3'>출금신청 할 금액을 선택해주세요</h5>`;
      $('#confirmModal').modal('show');
      return;
    }
    document.querySelector('#withdraw-submit').disabled = true;
    pushRequestBtn(withdraw, 'withdraw');
  });
}
// #endregion

// #region 포인트전환 모달
document.querySelector('#exchange-submit').addEventListener('click', function () {
  let exchange = {
    reqExist: true,
    reqPoint: document.querySelector('#agentPoint').innerHTML,
  };
  document.querySelector('#exchange-submit').disabled = true;
  pushRequestBtn(exchange, 'exchange');
});

// #endregion

// #region 에이전트 입출금 관련 함수
let notice_text = document.querySelector('#confirm-text');

function reqBankAccount() {
  $.ajax({
    method: 'POST',
    url: '/bank/agent/banknum',
  })
    .done(function (result) {
      if (result.isLogin) {
        let bank_name = result.sqlResult[0].bank;
        let bank_num = result.sqlResult[0].bank_num;
        let bank_owner = result.sqlResult[0].bank_owner;
        let bankInfo = `${bank_name}    ${bank_num}    ${bank_owner}`;

        document.querySelector('#deposit-bank-value').value = bankInfo;
        deposit.isBankReq = true;
      } else {
        console.log('비정상 요청');
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

function assetModalClear(type) {
  type.reqMoney = 0;
  type.afterReqMoney = 0;
  if (type == deposit || type == withdraw) {
    type.afterReqMoneyText.innerHTML = '';
    type.reqMoneyText.innerHTML = '';

    if (type == deposit) {
      document.querySelector('#deposit-bank-value').value = '계좌문의하기 버튼을 눌러주세요';
      deposit.isBankReq = false;
    }
  } else {
    type.agentAfterReqMoneyText.innerHTML = '';
    type.userAfterReqMoneyText.innerHTML = '';
    type.reqMoneyText.value = '';
    type.reqMoneyText.classList.replace('text-end', 'text-center');
  }
}

function pushMoneyBtn(params, type, e) {
  if (type == 'take') {
    if (params.userAfterReqMoney == 0) {
      let userCurMoney = document.querySelector('#user-take-cur-money').innerHTML;
      userCurMoney = Number(userCurMoney.replace(/,/g, ''));
      document.querySelector('#wholeTake').setAttribute('data-won', userCurMoney / 10000);
    } else {
      document.querySelector('#wholeTake').setAttribute('data-won', params.userAfterReqMoney / 10000);
    }
  }
  params.pushedMoney = parseInt(e.currentTarget.dataset.won * 10000);
  params.reqMoney = params.reqMoney + params.pushedMoney;

  if (type == 'deposit') {
    params.afterReqMoney = params.reqMoney + Number(document.querySelector('#agentBalance').innerHTML);
  } else if (type == 'give') {
    params.agentAfterReqMoney = Number(document.querySelector('#agent-give-balance-cur-money').innerHTML.replace(/,/g, '')) - params.reqMoney;
    params.userAfterReqMoney = params.reqMoney + rowData.보유금;
  } else if (type == 'withdraw') {
    params.afterReqMoney = Number(document.querySelector('#agentBalance').innerHTML) - params.reqMoney;
  } else if (type == 'take') {
    params.agentAfterReqMoney = Number(document.querySelector('#agent-take-cur-money').innerHTML.replace(/,/g, '')) + params.reqMoney;
    params.userAfterReqMoney = rowData.보유금 - params.reqMoney;
  }

  if (params.afterReqMoney < 0) {
    params.afterReqMoney = params.afterReqMoney + params.pushedMoney;
    params.reqMoney = params.reqMoney - params.pushedMoney;
    params.userAfterReqMoney = params.reqMoney;
    params.reqExist = false;
    alert('보유금보다 더 많이 신청할 수 없습니다.');
  } else if (params.agentAfterReqMoney < 0) {
    params.agentAfterReqMoney = params.agentAfterReqMoney + params.pushedMoney;
    params.reqMoney = params.reqMoney - params.pushedMoney;
    params.userAfterReqMoney = params.reqMoney;
    params.reqExist = false;
    alert('보유금보다 더 많이 신청할 수 없습니다.');
  } else if (params.userAfterReqMoney < 0) {
    params.userAfterReqMoney = params.userAfterReqMoney + params.pushedMoney;
    params.agentAfterReqMoney = params.agentAfterReqMoney - params.pushedMoney;
    params.reqMoney = params.reqMoney - params.pushedMoney;
    params.reqExist = false;
    alert('보유금보다 더 많이 신청할 수 없습니다.');
  }

  if (type == 'give' || type == 'take') {
    params.reqMoneyText.value = `${params.reqMoney.toLocaleString('ko-KR')} `;
    params.agentAfterReqMoneyText.innerHTML = `${params.agentAfterReqMoney.toLocaleString('ko-KR')} `;
    params.userAfterReqMoneyText.innerHTML = `${params.userAfterReqMoney.toLocaleString('ko-KR')} `;
    params.reqMoneyText.classList.replace('text-center', 'text-end');
    if (params.reqMoneyText.value == '') {
      params.reqMoneyText.classList.replace('text-end', 'text-center');
    }
  } else if (type == 'deposit' || type == 'withdraw') {
    params.reqMoneyText.innerHTML = `${params.reqMoney.toLocaleString('ko-KR')} `;
    params.afterReqMoneyText.innerHTML = `${params.afterReqMoney.toLocaleString('ko-KR')} `;
  }

  // if (type == 'give' || type == 'take') {
  //   params.reqMoneyText.innerHTML = `${params.reqMoney.toLocaleString('ko-KR')} `;
  //   params.agentAfterReqMoneyText.innerHTML = `${params.agentAfterReqMoney.toLocaleString('ko-KR')} `;
  //   params.userAfterReqMoneyText.innerHTML = `${params.userAfterReqMoney.toLocaleString('ko-KR')} `;
  // } else if (type == 'deposit' || type == 'withdraw') {
  //   params.reqMoneyText.innerHTML = `${params.reqMoney.toLocaleString('ko-KR')} `;
  //   params.afterReqMoneyText.innerHTML = `${params.afterReqMoney.toLocaleString('ko-KR')} `;
  // }

  params.reqExist = true;
}

function pushClearBtn(type) {
  type.reqMoney = 0;
  type.reqMoneyText.innerHTML = `${type.reqMoney} `;
  type.reqExist = false;
  type.reqMoneyText.value = '0';
  if (type == deposit || type == withdraw) {
    type.afterReqMoney = Number(document.querySelector('#agentBalance').innerHTML);
    type.afterReqMoneyText.innerHTML = `${type.afterReqMoney.toLocaleString('ko-KR')} `;
  } else {
    type.agentAfterReqMoney = Number(document.querySelector('#agent-give-balance-cur-money').innerHTML.replace(/,/g, ''));
    type.agentAfterReqMoneyText.innerHTML = `${type.agentAfterReqMoney.toLocaleString('ko-KR')} `;
    type.userAfterReqMoney = rowData.보유금;
    type.userAfterReqMoneyText.innerHTML = `${type.userAfterReqMoney.toLocaleString('ko-KR')} `;
  }
}

function pushRequestBtn(params, type) {
  spinnerToggle();
  let reqUrl;
  let content;
  let modalId;
  let reqBtn;
  let data;

  if (type == 'deposit') {
    reqUrl = '/bank/agent/deposit';
    content = `
    <div class='fs-4 fw-bold my-2'>입금신청 완료</div>
    <div class='fs-5'>신속히 처리해 드리겠습니다</div>    
  `;
    modalId = `#agentDepositModal`;
    reqBtn = document.querySelector('#deposit-submit');
    data = { reqMoney: params.reqMoney };
  } else if (type == 'withdraw') {
    reqUrl = '/bank/agent/withdraw';
    content = `
    <div class='fs-4 fw-bold my-2'>출금신청 완료</div>
    <div class='fs-5>신속히 처리해 드리겠습니다</div>
  `;
    modalId = `#agentWithdrawModal`;
    reqBtn = document.querySelector('#withdraw-submit');
    data = { reqMoney: params.reqMoney };
  } else if (type == 'give') {
    reqUrl = '/bank/agent/give';
    content = `
    <div class='fs-4 fw-bold my-2'>지급이 완료되었습니다.</div>
  `;
    modalId = `#giveBalanceModal`;
    reqBtn = document.querySelector('#give-balance-submit');
    data = {
      reqMoney: params.reqMoney,
      receiverId: rowData.아이디,
      receiverNick: rowData.닉네임,
      userBalance: rowData.보유금,
      receiverType: rowData.타입,
      reqType: type,
      giveType: document.querySelector('input[name="giveType"]:checked').value,
      memo: params.memoContents,
    };
  } else if (type == 'take') {
    reqUrl = '/bank/agent/take';
    content = `
    <div class='fs-4 fw-bold my-2'>회수가 완료되었습니다.</div> `;
    modalId = `#takeBalanceModal`;
    reqBtn = document.querySelector('#take-submit');
    data = {
      reqMoney: params.reqMoney,
      receiverId: rowData.아이디,
      receiverNick: rowData.닉네임,
      userBalance: rowData.보유금,
      receiverType: rowData.타입,
      reqType: type,
      memo: params.memoContents,
    };
  } else if (type == 'exchange') {
    reqUrl = '/bank/agent/exchange';
    content = `
    <div class='fs-4 fw-bold my-2'>포인트가 보유금으로 전환되었습니다</div>    
  `;
    modalId = `#agentExchangeModal`;
    reqBtn = document.querySelector('#exchange-submit');
    data = { curPoint: params.reqPoint };
  }

  $.ajax({
    method: 'POST',
    url: reqUrl,
    data: data,
  })
    .done(function (result) {
      initPopover();
      reqBtn.disabled = false;

      if (result.balanceCheck == false) {
        notice_text.innerHTML = `
        <div class='fs-4 fw-bold my-2'>신청 실패</div>
        <div class='fs-5'>신청금액이 보유금보다 많습니다</div>`;
      } else if (result.request == 'fail') {
        notice_text.innerHTML = `
        <div class='fs-4 fw-bold my-2'>입금 또는 출금 신청 중</div>
        <div class='fs-5'>이전 신청 처리 후 신청해주세요</div>`;
      } else if (result.error == true) {
        notice_text.innerHTML = `
        <div class='fs-4 fw-bold my-2'>신청 실패</div>
        <div class='fs-5'>${result.msg}</div>`;
      } else {
        notice_text.innerHTML = content;
        if (type == 'give') {
          document.getElementById('detail-balance').value = (rowData.보유금 + params.reqMoney).toLocaleString('ko-KR');
        } else if (type == 'take') {
          document.getElementById('detail-balance').value = (rowData.보유금 - params.reqMoney).toLocaleString('ko-KR');
        }

        if (type == 'deposit' || type == 'withdraw') {
          socket.emit('to_admin', { type: result.type, userId: result.userId });
        }
      }
      getNavModalData();
      $.fn.dataTable.tables({ visible: true, api: true }).ajax.reload(null, false);

      setTimeout(() => {
        spinnerToggle();
        $(modalId).modal('hide');
        $('#agentConfirmModal').modal('show');
      }, 2000);
    })
    .fail(function (err) {
      spinnerToggle();
      alert('[네트워크 전송 오류] 잠시 후 다시 시도해주세요');
      setTimeout(() => {
        reqBtn.disabled = false;
      }, 1000);
      console.log(err);
    });
  if (params.reqExist) {
  }
}
// #endregion

// #endregion

// #endregion

// #region 보유금 지급회수
//? 디테일 모달 내 지급회수 버튼
const balanceGiveBtn = document.querySelector('#detailGiveBtn');
const balanceTakeBtn = document.querySelector('#detailTakeBtn');

if (balanceGiveBtn) {
  balanceGiveBtn.addEventListener('click', async function () {
    rowData = await getNeedInfo(selectedUser.아이디);
    openBalanceGiveModal(rowData);
  });
}

if (balanceTakeBtn) {
  balanceTakeBtn.addEventListener('click', async function () {
    rowData = await getNeedInfo(selectedUser.아이디);
    console.log(rowData);
    openBalanceTakeModal(rowData);
  });
}

if (document.querySelector('#agentDepositModal')) {
  $('table').on('click', 'tbody tr .balance-btn', function () {
    rowData = $('table').DataTable().row($(this).parent('td')).data();
  });
  let backspacePressed = false;

  // #region 지급
  //? 지급 직접입력
  document.getElementById('give-req-money').addEventListener('keydown', function (e) {
    // 백스페이스 키가 눌렸는지 확인
    backspacePressed = e.key === 'Backspace';
  });

  document.getElementById('give-req-money').addEventListener('input', function (e) {
    // let rawValue = parseInt(this.value.replace(/,/g, ''), 10) || 0;

    // if (rawValue === 0) {
    //   alert('0만 입력할 수 없습니다.');
    //   this.value = '';
    //   return;
    // }

    if (backspacePressed) {
      this.value = this.value.slice(0, -1);
      this.value = this.value.replace(/,/g, ''); // 콤마 제거
      reqMoney = parseInt(this.value, 10);
      this.value = this.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      let nonNumReg = /[^0-9]/g;
      this.value = this.value.replace(nonNumReg, '');
      this.value = this.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.classList.replace('text-center', 'text-end');
    }

    give.reqMoney = parseInt(this.value.replace(/,/g, ''), 10) || 0;
    give.agentAfterReqMoney = Number(document.querySelector('#agent-give-balance-cur-money').innerHTML.replace(/,/g, '')) - give.reqMoney;
    give.userAfterReqMoney = give.reqMoney + rowData.보유금;

    if (give.agentAfterReqMoney < 0) {
      give.agentAfterReqMoney = 0;
      give.reqMoney = Number(document.querySelector('#agent-give-balance-cur-money').innerHTML.replace(/,/g, ''));
      give.userAfterReqMoney = Number(document.querySelector('#agent-give-balance-cur-money').innerHTML.replace(/,/g, '')) + rowData.보유금;
      give.reqExist = false;
      alert('보유금보다 더 많이 지급할 수 없습니다.');
    }

    give.reqMoneyText.value = `${give.reqMoney.toLocaleString('ko-KR')} `;
    give.agentAfterReqMoneyText.innerHTML = `${give.agentAfterReqMoney.toLocaleString('ko-KR')} `;
    give.userAfterReqMoneyText.innerHTML = `${give.userAfterReqMoney.toLocaleString('ko-KR')} `;

    give.reqExist = true;
  });

  //todo 신청금액 없을 시 경고메시지 표시하기
  let give = {
    reqExist: false,
    pushedMoney: 0,
    reqMoney: 0,
    agentAfterReqMoney: 0,
    userAfterReqMoney: 0,
    reqMoneyText: document.querySelector('#give-req-money'),
    agentAfterReqMoneyText: document.querySelector('#agent-give-balance-after-money'),
    userAfterReqMoneyText: document.querySelector('#user-give-balance-after-money'),
    memoContents: '',
  };

  // //? 지급모달 열기
  function openBalanceGiveModal(rowData) {
    document.querySelector('#user-give-balance-cur-money').innerHTML = rowData.보유금.toLocaleString('ko-KR');
    document.querySelector('#user-give-balacnce-cur-money-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
    document.querySelector('#user-give-balance-after-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;

    if (clientType == 9) {
      if (envInfo.lotto == 1) {
        document.getElementById('lottoGiveCheck').classList.remove('d-none');
      }
      document.getElementById('give-balance-reason-text').classList.remove('d-none');
      document.getElementById('giveBalanceMemo').classList.remove('d-none');
    }

    if (rowData.타입 === 4) {
      document.querySelector('#user-balance-give-title').innerHTML = '유저에게 보유금 지급';
    } else if (rowData.타입 !== 9) {
      document.querySelector('#user-balance-give-title').innerHTML = '에이전트에게 보유금 지급';
    }

    $('#giveBalanceModal').modal('show');
  }

  //? 지금금액 버튼
  $('#give-balance-btn-group .col-3 button.btn.btn-light').click(function (e) {
    pushMoneyBtn(give, 'give', e);
  });

  //? 모달닫기 > 금액 클리어
  $('#giveBalanceModal').on('hidden.bs.modal', function () {
    assetModalClear(give);
  });

  //? 정정 버튼
  document.querySelector('#give-balance-modify').addEventListener('click', function () {
    pushClearBtn(give);
  });

  //? 지급메모내용
  document.querySelector('#giveBalanceMemo').addEventListener('input', function () {
    give.memoContents = document.querySelector('#giveBalanceMemo').value;
  });

  //? 지급신청 버튼
  document.querySelector('#give-balance-submit').addEventListener('click', function () {
    if (give.reqMoney <= 0) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h5 class='pt-3' style='line-height:2rem'>지급할 금액을 입력해주세요</h5>`;
      $('#confirmModal').modal('show');
    } else if (give.reqExist) {
      document.querySelector('#give-balance-submit').disabled = true;
      pushRequestBtn(give, 'give');
    }
  });
  // #endregion

  // #region 회수
  //? 회수 직접입력
  document.getElementById('take-req-money').addEventListener('keydown', function (e) {
    // 백스페이스 키가 눌렸는지 확인
    backspacePressed = e.key === 'Backspace';
  });

  document.getElementById('take-req-money').addEventListener('input', function (e) {
    console.log(backspacePressed);
    if (backspacePressed) {
      this.value = this.value.slice(0, -1);
      this.value = this.value.replace(/,/g, ''); // 콤마 제거
      reqMoney = parseInt(this.value, 10);
      this.value = this.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      console.log(this.value);
    } else {
      let nonNumReg = /[^0-9]/g;
      this.value = this.value.replace(nonNumReg, '');
      this.value = this.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.classList.replace('text-center', 'text-end');
    }

    take.reqMoney = parseInt(this.value.replace(/,/g, ''), 10) || 0;
    take.agentAfterReqMoney = Number(document.querySelector('#agent-take-cur-money').innerHTML.replace(/,/g, '')) + take.reqMoney;
    take.userAfterReqMoney = rowData.보유금 - take.reqMoney;

    if (take.userAfterReqMoney < 0) {
      take.userAfterReqMoney = 0;
      take.agentAfterReqMoney = Number(document.querySelector('#agent-take-cur-money').innerHTML.replace(/,/g, '')) + rowData.보유금;
      take.reqMoney = rowData.보유금;
      take.reqExist = false;
      alert('보유금보다 더 많이 신청할 수 없습니다.');
    }

    //  if (take.agentAfterReqMoney < 0) {
    //    take.agentAfterReqMoney = 0;
    //    take.reqMoney = Number(document.querySelector('#agent-take-cur-money').innerHTML.replace(/,/g, ''));
    //    take.userAfterReqMoney = Number(document.querySelector('#agent-take-cur-money').innerHTML.replace(/,/g, '')) + rowData.보유금;
    //    take.reqExist = false;
    //    alert('보유금보다 더 많이 지급할 수 없습니다.');
    //  }

    take.reqMoneyText.value = `${take.reqMoney.toLocaleString('ko-KR')} `;
    take.agentAfterReqMoneyText.innerHTML = `${take.agentAfterReqMoney.toLocaleString('ko-KR')} `;
    take.userAfterReqMoneyText.innerHTML = `${take.userAfterReqMoney.toLocaleString('ko-KR')} `;

    take.reqExist = true;
  });

  //todo 신청금액 없을 시 경고메시지 표시하기
  let take = {
    reqExist: false,
    pushedMoney: 0,
    reqMoney: 0,
    agentAfterReqMoney: 0,
    userAfterReqMoney: 0,
    reqMoneyText: document.querySelector('#take-req-money'),
    agentAfterReqMoneyText: document.querySelector('#agent-take-after-money'),
    userAfterReqMoneyText: document.querySelector('#user-take-after-money'),
    memoContents: '',
  };

  //? 회수모달 열기
  // $('table').on('click', 'tbody tr .takeBalance', function () {
  //   rowData = $('table').DataTable().row($(this).parent('td')).data();
  //   console.log(rowData);
  //   openBalanceTakeModal(rowData);
  // });
  function openBalanceTakeModal(rowData) {
    // if (rowData.가입코드 != null && clientType != 9) {
    //   alert('온라인 유저입니다. 온라인 유저에게는 지급 및 회수가 불가능합니다.');
    //   return;
    // }

    if (clientType == 9) {
      document.getElementById('take-reason-text').classList.remove('d-none');
      document.getElementById('takeMemo').classList.remove('d-none');

      if (rowData.타입 === 4) {
        document.querySelector('#user-take-title').innerHTML = '유저에게 보유금 회수';
        document.querySelector('#user-take-cur-money-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
        document.querySelector('#user-take-after-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
      } else if (rowData.타입 !== 9) {
        document.querySelector('#user-take-title').innerHTML = '에이전트에게 보유금 회수';
        document.querySelector('#user-take-cur-money-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
        document.querySelector('#user-take-after-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
        document.querySelector('#agent-take-cur-money-text').classList.add('d-none');
        document.querySelector('#agent-take-cur-money-text').nextElementSibling.classList.add('d-none');
        document.querySelector('#agent-take-after-text').classList.add('d-none');
        document.querySelector('#agent-take-after-text').nextElementSibling.classList.add('d-none');
      }
    } else {
      if (rowData.타입 === 4) {
        document.querySelector('#user-take-title').innerHTML = '유저에게 보유금 회수';
        document.querySelector('#user-take-cur-money-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
        document.querySelector('#user-take-after-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
      } else if (rowData.타입 !== 9) {
        document.querySelector('#user-take-title').innerHTML = '에이전트에게 보유금 회수';
        document.querySelector('#user-take-cur-money-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
        document.querySelector('#user-take-after-text').innerHTML = `[ ${rowData.아이디} ] 보유금`;
      }
    }

    document.querySelector('#user-take-cur-money').innerHTML = rowData.보유금.toLocaleString('ko-KR');

    // document.querySelector('#wholeTake').setAttribute('data-won', rowData.보유금 / 10000);

    document.querySelector;
    $('#takeBalanceModal').modal('show');
  }

  //? 회수금액 버튼
  $('#take-btn-group .col-3 button.btn.btn-light').click(function (e) {
    pushMoneyBtn(take, 'take', e);
  });

  //? 모달닫기 > 금액 클리어
  $('#takeBalanceModal').on('hidden.bs.modal', function () {
    assetModalClear(take);
  });

  //? 정정 버튼
  document.querySelector('#take-modify').addEventListener('click', function () {
    pushClearBtn(take);
  });

  //? 회수메모내용
  document.querySelector('#takeMemo').addEventListener('input', function () {
    take.memoContents = document.querySelector('#takeMemo').value;
  });

  //? 회수신청 버튼
  document.querySelector('#take-submit').addEventListener('click', function () {
    if (take.reqMoney <= 0) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h5 class='pt-3' style='line-height:2rem'>회수할 금액을 입력해주세요</h5>`;
      $('#confirmModal').modal('show');
    } else if (take.reqExist) {
      document.querySelector('#take-submit').disabled = true;
      pushRequestBtn(take, 'take');
    }
  });
  // #endregion
}
// #endregion

// #region 대시보드
//? 임시정보 초기화
let timeoutId;
$('#onlineUsersAgent').on('mousedown touchstart', 'tbody tr .temp-clear', function () {
  rowData = $('#onlineUsersAgent').DataTable().row($(this).parent('td')).data();
  timeoutId = setTimeout(function () {
    clearTempData(rowData);
    console.log('3초 지남');
  }, 2000);
});

$('#onlineUsersAgent').on('mouseup touchend', 'tbody tr .temp-clear', function () {
  clearTimeout(timeoutId);
  console.log('2초 안지남');
});

//? 유저 강제로그아웃
$('table').on('click', 'tbody tr .forceLogout', function () {
  rowData = $('table').DataTable().row($(this).parent('td')).data();
  document.querySelector(
    '#confirmModal .modal-body'
  ).innerHTML = `<div class='logoutId'>${rowData.아이디}</div><h5 class='pt-3' style='line-height:2rem'>[ ${rowData.닉네임} ] 유저의<br>접속을 강제로 종료하시겠습니까?</h5>`;
  document.querySelector('#force-logout-confirm').classList.remove('d-none');
  $('#confirmModal').modal('show');
});

function clearTempData(rowData) {
  $.ajax({
    method: 'POST',
    url: '/tempclear',
    data: {
      user_id: rowData.user_id,
    },
  })
    .done(function (result) {
      console.log(result);
      $('#onlineUsersAgent').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}
// #endregion

// #region 공통
let envInfo;
//? 환경변수
async function getEnvInfo() {
  await $.ajax({
    method: 'POST',
    url: '/envinfo',
  })
    .done(function (result) {
      envInfo = result;
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}
getEnvInfo();

let korean = {
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

function collapseSideMenu() {
  let menuStr = document.URL;
  let menu;

  if (menuStr.includes('income')) {
    menu = '#collapseIncome';
  } else if (menuStr.includes('user')) {
    menu = '#collapseLayouts';
  } else if (menuStr.includes('bank')) {
    menu = '#collapseCash';
  } else if (menuStr.includes('log')) {
    menu = '#collapseLog';
  } else if (menuStr.includes('agent')) {
    menu = '#collapseAgent';
  } else if (menuStr.includes('betting')) {
    menu = '#collapseBetting';
  } else if (menuStr.includes('board')) {
    menu = '#collapseBoard';
  } else if (menuStr.includes('setting')) {
    menu = '#collapseSetting';
  } else {
    return;
  }

  document.querySelector(menu).classList.add('show');
}

//? 키보드 단축키
keyShortCut();
function keyShortCut() {
  document.addEventListener('keydown', function (event) {
    if (event.key === '`') {
      $('table').each(function () {
        let tableId = $(this).attr('id');
        let isInsideModal = $(this).closest('.modal').length > 0;
        let isModalOpen = isInsideModal && $(this).closest('.modal').is(':visible');
        if (!isInsideModal || isModalOpen) {
          $('#' + tableId)
            .DataTable()
            .ajax.reload(null, false);
          console.log(tableId);
        }
      });
    } else if (event.altKey && event.key === '1') {
      window.location.href = '/';
    } else if (event.altKey && event.key === '2') {
      window.location.href = '/bank-deposit';
    } else if (event.altKey && event.key === '3') {
      window.location.href = '/bank-withdraw';
    } else if (event.altKey && event.key === '4') {
      window.location.href = '/board';
    }
  });
}

function initPopover() {
  setTimeout(() => {
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl), {
      container: 'body',
    });

    const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
  }, 100);
}

function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}

function makeConfirmCancelModal(type, rowData) {
  let modalContent = document.querySelector('#confirmCancel .modal-body .content');

  let confirmContent = `
  <h4 class='col-12 mb-4'>아래 내용을 승인하시겠습니까</h4>
  <div class='col-4'>
    아이디: ${rowData.아이디}
  </div>
  <div class='col-4'>
    닉네임: ${rowData.닉네임}
  </div>
  <div class='col-4'>
    신청금액: ${rowData.신청금액.toLocaleString('ko-KR')}
  </div>
  <div class="mt-3 col-12">  
    <textarea class="form-control"  id="confirmMemo" rows="3" placeholder="추가로 메모할 내용이 있으면 입력하세요"></textarea>
  </div>
  `;

  let confirmCancelContent = `
  <h5 class='col-12 mb-4'>승인처리 된 아래 내용을 취소하시겠습니까?</h5>
  <div class='col-4'>
    아이디: ${rowData.아이디}
  </div>
  <div class='col-4'>
    닉네임: ${rowData.닉네임}
  </div>
  <div class='col-4'>
    신청금액: ${rowData.신청금액.toLocaleString('ko-KR')}
  </div>
  <div class="mt-3 col-12">  
    <textarea class="form-control"  id="confirmMemo" rows="3" placeholder="추가로 메모할 내용이 있으면 입력하세요"></textarea>
  </div>
  `;

  let requestCancelContent = `
  <h5 class='col-12 mb-4'>아래 내용을 취소하시겠습니까?</h5>
  <div class='col-4'>
    아이디: ${rowData.아이디}
  </div>
  <div class='col-4'>
    닉네임: ${rowData.닉네임}
  </div>
  <div class='col-4'>
    신청금액: ${rowData.신청금액.toLocaleString('ko-KR')}
  </div>
  <div class="mt-3 col-12">  
    <textarea class="form-control"  id="confirmMemo" rows="3" placeholder="추가로 메모할 내용이 있으면 입력하세요"></textarea>
  </div>
  `;

  if (type === 'confirm') {
    switch (rowData.처리현황) {
      case '입금확인':
        modalContent.innerHTML = confirmContent;
        document.querySelector('#depositConfirm').classList.remove('d-none');
        break;
      case '출금대기':
        modalContent.innerHTML = confirmContent;
        document.querySelector('#withdrawConfirm').classList.remove('d-none');
        break;
    }
  } else if (type === 'cancel') {
    switch (rowData.처리현황) {
      case '입금신청':
      case '입금대기':
      case '입금확인':
        modalContent.innerHTML = requestCancelContent;
        document.querySelector('#depositCancel').classList.remove('d-none');
        break;
      case '입금승인':
        modalContent.innerHTML = confirmCancelContent;
        document.querySelector('#depositConfirmCancel').classList.remove('d-none');
        break;
      case '출금신청':
      case '출금대기':
        modalContent.innerHTML = requestCancelContent;
        document.querySelector('#withdrawCancel').classList.remove('d-none');
        break;
      case '출금승인':
        modalContent.innerHTML = confirmCancelContent;
        document.querySelector('#withdrawConfirmCancel').classList.remove('d-none');
        break;
      case '승인취소':
      case '신청취소':
        return console.log('이미 취소된 내역입니다');
    }
  }

  return $('#confirmCancel').modal('show');
}

$('#confirmCancel').on('hidden.bs.modal', function () {
  $('#confirmCancel button').addClass('d-none');
  document.querySelector('#depositConfirm').disabled = false;
});

//? 로딩 스피너
function spinnerToggle() {
  const spinner = document.querySelector('.spinner-container');
  spinner.classList.toggle('d-none');
}

//? 로그인체크
function loginCheck() {
  $.ajax({
    method: 'POST',
    url: '/auth/check',
  })
    .done(function (result) {
      console.log(result.isLogin);
      if (result.isLogin == false) {
        setTimeout(() => {
          location.href = '/';
        }, 3000);
      }
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

//? 화면에 따른 구성요소 변경
// let w = screen.availWidth;
// let bw = window.innerWidth;

const navbarBrand = document.querySelector('#navbar-name');
if (navbarBrand) {
  if (window.innerWidth < 768) {
    navbarBrand.textContent = 'R';
  }
}

// const laptop = document.querySelectorAll('.laptop');
// const smallMonitor = document.querySelectorAll('.smallMonitor');
// if (w <= 1920 || bw <= 1920) {
//   laptop.forEach((element) => {
//     element.classList.add('d-none');
//   });
//   smallMonitor.forEach((element) => {
//     element.classList.add('d-none');
//   });
// } else if (w <= 2560 || bw <= 2400) {
//   const smallMonitor = document.querySelectorAll('.smallMonitor');
//   smallMonitor.forEach((element) => {
//     element.classList.add('d-none');
//   });
// }

//? 어드민 로그아웃
document.querySelector('#logout-btn').addEventListener('click', function () {
  $.ajax({
    method: 'POST',
    url: '/auth/logout',
  })
    .done(function (result) {
      location.reload();
    })
    .fail(function (err) {
      console.log(err);
    });
});
// #endregion

// #region 네비바 및 모달데이터
getNavModalData();
function getNavModalData() {
  $.ajax({
    method: 'POST',
    url: '/navbar',
  })
    .done(function (result) {
      const { giveTakeData, summaryData, navData, todayJoinCount, countOnlineUsers } = result;

      let agentType;
      let pType;
      loginAgentId = navData.아이디;
      let remainBalance = navData.보유금 - summaryData['에이전트 보유금'] - summaryData['에이전트 포인트'] - summaryData['유저 포인트'];

      if (navData.타입 === 9) {
        //? PC 어드민 네비바
        document.querySelector('#navAdminNick').innerHTML = navData.닉네임;
        document.querySelector('#navAdminTotalBalance').innerHTML = `${remainBalance.toLocaleString('ko-KR')} 원`;
        if (remainBalance < 5000000) {
          document.querySelector('#navAdminTotalBalance').classList.add('asset-danger');
        } else if (remainBalance < 10000000) {
          document.querySelector('#navAdminTotalBalance').classList.add('asset-warning');
        }

        function parseValue(value) {
          let parsedValue = parseInt(value);
          return isNaN(parsedValue) ? 0 : parsedValue;
        }

        let agentBalance = parseValue(summaryData['에이전트 보유금']);
        let agentPoint = parseValue(summaryData['에이전트 포인트']);
        let userBalance = parseValue(summaryData['유저 보유금']);
        let userPoint = parseValue(summaryData['유저 포인트']);

        document.querySelector('#navAdminSdBalance').innerHTML = `${navData.보유금.toLocaleString('ko-KR')} 원`;
        document.querySelector('#navAdminDgBalance').innerHTML = `${navData.DG보유금.toLocaleString('ko-KR')} 원`;
        document.querySelector('#navAdminAgentBalance').innerHTML = `${agentBalance.toLocaleString('ko-KR')} 원`;
        document.querySelector('#navAdminAgentPoint').innerHTML = `${agentPoint.toLocaleString('ko-KR')} 원`;
        document.querySelector('#navAdminUserBalance').innerHTML = `${userBalance.toLocaleString('ko-KR')} 원`;
        document.querySelector('#navAdminUserPoint').innerHTML = `${userPoint.toLocaleString('ko-KR')} 원`;
        document.querySelector('#navAdminTotalUserNum').innerHTML = `${summaryData.회원수.toLocaleString('ko-KR')} 명`;
        document.querySelector('#navAdminNewJoin').innerHTML = `${todayJoinCount.당일가입.toLocaleString('ko-KR')} 명`;
        document.querySelector('#navAdminOnlineUser').innerHTML = `${countOnlineUsers} 명`;

        switch (navData.P타입) {
          case 0:
            pType = '유저별 설정';
            break;
          case 1:
            pType = '일괄 정품설정 (SD)';
            break;
          case 2:
            pType = '일괄 파싱설정 (DG)';
            break;
        }
        document.querySelector('#pType').innerHTML = pType;

        //? PC 어드민 요약정보
        let todayElem = document.querySelector('.todayInfo');
        if (todayElem) {
          document.querySelector('#totalGive').innerHTML = `${parseInt(giveTakeData[0].당일지급).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalTake').innerHTML = `${parseInt(giveTakeData[0].당일회수).toLocaleString('ko-KR')} 원`;
          let 당일지급회수 = giveTakeData[0].당일지급 - giveTakeData[0].당일회수;

          document.querySelector('#totalGiveTake').innerHTML = `${parseInt(당일지급회수).toLocaleString('ko-KR')} 원`;
          if (parseInt(당일지급회수) < 0) {
            document.querySelector('.todayInfo .giveTake').classList.add('minus-bg');
            document.querySelector('.todayInfo .giveTake').classList.remove('plus-bg');
          } else if (parseInt(당일지급회수) > 0) {
            document.querySelector('.todayInfo .giveTake').classList.add('plus-bg');
            document.querySelector('.todayInfo .giveTake').classList.remove('minus-bg');
          } else {
            document.querySelector('.todayInfo .giveTake').classList.remove('plus-bg');
            document.querySelector('.todayInfo .giveTake').classList.remove('minus-bg');
          }

          document.querySelector('#totalDeposit').innerHTML = `${parseInt(summaryData.당일입금).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalWithdraw').innerHTML = `${parseInt(summaryData.당일출금).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalDepoWith').innerHTML = `${parseInt(summaryData.당일입출금).toLocaleString('ko-KR')} 원`;
          if (parseInt(summaryData.당일입출금) < 0) {
            document.querySelector('.todayInfo .depowith').classList.add('minus-bg');
            document.querySelector('.todayInfo .depowith').classList.remove('plus-bg');
          } else if (parseInt(summaryData.당일입출금) > 0) {
            document.querySelector('.todayInfo .depowith').classList.add('plus-bg');
            document.querySelector('.todayInfo .depowith').classList.remove('minus-bg');
          } else {
            document.querySelector('.todayInfo .depowith').classList.remove('plus-bg');
            document.querySelector('.todayInfo .depowith').classList.remove('minus-bg');
          }

          document.querySelector('#totalCasinoBetting').innerHTML = `${parseInt(summaryData.당일카지노베팅).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalCasinoWin').innerHTML = `${parseInt(summaryData.당일카지노획득).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalCasinoBetWin').innerHTML = `${parseInt(summaryData.당일카지노벳윈).toLocaleString('ko-KR')} 원`;
          if (parseInt(summaryData.당일카지노벳윈) < 0) {
            document.querySelector('.todayInfo .casino').classList.add('minus-bg');
            document.querySelector('.todayInfo .casino').classList.remove('plus-bg');
          } else if (parseInt(summaryData.당일카지노벳윈) > 0) {
            document.querySelector('.todayInfo .casino').classList.add('plus-bg');
            document.querySelector('.todayInfo .casino').classList.remove('minus-bg');
          } else {
            document.querySelector('.todayInfo .casino').classList.remove('plus-bg');
            document.querySelector('.todayInfo .casino').classList.remove('minus-bg');
          }

          document.querySelector('#totalSlotBetting').innerHTML = `${parseInt(summaryData.당일슬롯베팅).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalSlotWin').innerHTML = `${parseInt(summaryData.당일슬롯획득).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalSlotBetWin').innerHTML = `${parseInt(summaryData.당일슬롯벳윈).toLocaleString('ko-KR')} 원`;
          if (parseInt(summaryData.당일슬롯벳윈) < 0) {
            document.querySelector('.todayInfo .slot').classList.add('minus-bg');
            document.querySelector('.todayInfo .slot').classList.remove('plus-bg');
          } else if (parseInt(summaryData.당일슬롯벳윈) > 0) {
            document.querySelector('.todayInfo .slot').classList.add('plus-bg');
            document.querySelector('.todayInfo .slot').classList.remove('minus-bg');
          } else {
            document.querySelector('.todayInfo .slot').classList.remove('plus-bg');
            document.querySelector('.todayInfo .slot').classList.remove('minus-bg');
          }

          document.querySelector('#totalCasinoRolling').innerHTML = `${parseInt(summaryData.당일카지노롤링).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalSlotRolling').innerHTML = `${parseInt(summaryData.당일슬롯롤링).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalSumRolling').innerHTML = `${parseInt(summaryData.당일롤링합계).toLocaleString('ko-KR')} 원`;

          let totalSummary =
            parseInt(summaryData.당일카지노벳윈) +
            parseInt(summaryData.당일슬롯벳윈) -
            parseInt(summaryData.당일카지노롤링) -
            parseInt(summaryData.당일슬롯롤링);

          document.querySelector('#totalSummary').innerHTML = `${totalSummary.toLocaleString('ko-KR')} 원`;
        }

        //? 모바일 어드민 종합
        if (document.querySelector('#mobileAdminSummary')) {
          document.querySelector('#mobileAdminNick').innerHTML = navData.닉네임;
          document.querySelector('#mobileAdminBalance').value = `${remainBalance.toLocaleString('ko-KR')} 원`;
          document.querySelector('#mobileAdminUserBalance').value = `${userBalance.toLocaleString('ko-KR')} 원`;
          document.querySelector('#mobileAdminAgentBalance').value = `${agentBalance.toLocaleString('ko-KR')} 원`;
          document.querySelector('#mobileAdminAgentPoint').value = `${agentPoint.toLocaleString('ko-KR')} 원`;
          document.querySelector('#mobileAdminTotalUserNum').value = `${summaryData.회원수} 명`;
          document.querySelector('#mobileAdminNewJoin').value = `${todayJoinCount.당일가입} 명`;
          document.querySelector('#mobileAdminOnlineUsers').value = `${countOnlineUsers} 명`;
          switch (navData.P타입) {
            case 0:
              pType = '유저별 설정';
              break;
            case 1:
              pType = '일괄 정품설정 (SD)';
              break;
            case 2:
              pType = '일괄 파싱설정 (DG)';
              break;
          }

          if (document.querySelector('#pTypeMobile')) {
            document.querySelector('#pTypeMobile').innerHTML = pType;
          }

          document.querySelector('#mobileAdminTodayGive').value = `${parseInt(giveTakeData[0].당일지급).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAdminTodayTake').value = `${parseInt(giveTakeData[0].당일회수).toLocaleString('ko-KR')}`;
          let 당일지급회수 = giveTakeData[0].당일지급 - giveTakeData[0].당일회수;
          if (당일지급회수 < 0) {
            document.querySelector('#mobileAdminTodayGiveTake').classList.add('text-danger');
          }
          document.querySelector('#mobileAdminTodayGiveTake').value = `${parseInt(당일지급회수).toLocaleString('ko-KR')}`;

          document.querySelector('#mobileAdminTodayDeposit').value = `${parseInt(summaryData.당일입금).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAdminTodayWithdraw').value = `${parseInt(summaryData.당일출금).toLocaleString('ko-KR')}`;
          if (parseInt(summaryData.당일입출금) < 0) {
            document.querySelector('#mobileAdminTodayDepoWith').classList.add('text-danger');
          }
          document.querySelector('#mobileAdminTodayDepoWith').value = `${parseInt(summaryData.당일입출금).toLocaleString('ko-KR')}`;

          document.querySelector('#mobileAdminTodayCasinoBetting').value = `${parseInt(summaryData.당일카지노베팅).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAdminTodayCasinoWin').value = `${parseInt(summaryData.당일카지노획득).toLocaleString('ko-KR')}`;
          if (parseInt(summaryData.당일카지노벳윈) < 0) {
            document.querySelector('#mobileAdminTodayCasinoBetWin').classList.add('text-danger');
          }
          document.querySelector('#mobileAdminTodayCasinoBetWin').value = `${parseInt(summaryData.당일카지노벳윈).toLocaleString('ko-KR')}`;

          document.querySelector('#mobileAdminTodaySlotBetting').value = `${parseInt(summaryData.당일슬롯베팅).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAdminTodaySlotWin').value = `${parseInt(summaryData.당일슬롯획득).toLocaleString('ko-KR')}`;
          if (parseInt(summaryData.당일슬롯벳윈) < 0) {
            document.querySelector('#mobileAdminTodaySlotBetWin').classList.add('text-danger');
          }
          document.querySelector('#mobileAdminTodaySlotBetWin').value = `${parseInt(summaryData.당일슬롯벳윈).toLocaleString('ko-KR')}`;

          document.querySelector('#mobileAdminTodayCasinoRoll').value = `${parseInt(summaryData.당일카지노롤링).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAdminTodaySlotRoll').value = `${parseInt(summaryData.당일슬롯롤링).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAdminTodaySumRoll').value = `${parseInt(summaryData.당일롤링합계).toLocaleString('ko-KR')}`;

          let totalSummary =
            parseInt(summaryData.당일카지노벳윈) +
            parseInt(summaryData.당일슬롯벳윈) -
            parseInt(summaryData.당일카지노롤링) -
            parseInt(summaryData.당일슬롯롤링);

          document.querySelector('#mobileAdminTodayLose').value = `${parseInt(totalSummary).toLocaleString('ko-KR')} 원`;
        }

        //? 에이전트 지급, 회수모달
        document.querySelector('#agent-give-balance-cur-money').innerHTML = `${remainBalance.toLocaleString('ko-KR')} `;
        document.querySelector('#agent-take-cur-money').innerHTML = `${remainBalance.toLocaleString('ko-KR')} `;
      } else if (navData.타입 !== 4) {
        //? PC 에이전트 네비바
        if (navData.타입 == 0) {
          agentType = `<img src="/public/images/platinum.png" alt="platinum" width="17.5" height="20"> 플래티넘`;
        } else if (navData.타입 == 1) {
          agentType = `<img src="/public/images/gold.png" alt="gold" width="17.5" height="20"> 골드`;
        } else if (navData.타입 == 2) {
          agentType = `<img src="/public/images/silver.png" alt="silver" width="17.5" height="20"> 실버`;
        } else if (navData.타입 == 3) {
          agentType = `<img src="/public/images/bronze.png" alt="bronze" width="17.5" height="20"> 브론즈`;
        }

        document.querySelector('#navAgentType').innerHTML = agentType;
        document.querySelector('#navAgentNick').innerHTML = navData.닉네임;
        document.querySelector('#navAgentBalance').innerHTML = `${navData.보유금.toLocaleString('ko-KR')} 원`;
        document.querySelector('#navAgentPoint').innerHTML = `${navData.포인트.toLocaleString('ko-KR')} 원`;
        document.querySelector('#navAgentTotalUserNum').innerHTML = `${navData.회원수} 명`;
        document.querySelector('#navAgentNewJoin').innerHTML = `${todayJoinCount.당일가입.toLocaleString('ko-KR')} 명`;
        document.querySelector('#navAgentCasinoRoll').innerHTML = `${navData.카지노롤링요율} %`;
        document.querySelector('#navAgentSlotRoll').innerHTML = `${navData.슬롯롤링요율} %`;
        document.querySelector('#navAgentLosing').innerHTML = `${navData.루징요율} %`;

        //? PC 에이전트 요약정보
        let todayElem = document.querySelector('.todayInfo');
        if (todayElem) {
          document.querySelector('#totalGive').innerHTML = `${parseInt(giveTakeData.당일지급).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalTake').innerHTML = `${parseInt(giveTakeData.당일회수).toLocaleString('ko-KR')} 원`;
          let 당일지급회수 = giveTakeData.당일지급 - giveTakeData.당일회수;

          document.querySelector('#totalGiveTake').innerHTML = `${parseInt(당일지급회수).toLocaleString('ko-KR')} 원`;
          if (parseInt(당일지급회수) < 0) {
            document.querySelector('.todayInfo .giveTake').classList.add('minus-bg');
            document.querySelector('.todayInfo .giveTake').classList.remove('plus-bg');
          } else if (parseInt(당일지급회수) > 0) {
            document.querySelector('.todayInfo .giveTake').classList.add('plus-bg');
            document.querySelector('.todayInfo .giveTake').classList.remove('minus-bg');
          } else {
            document.querySelector('.todayInfo .giveTake').classList.remove('plus-bg');
            document.querySelector('.todayInfo .giveTake').classList.remove('minus-bg');
          }

          document.querySelector('#totalDeposit').innerHTML = `${parseInt(summaryData.당일입금).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalWithdraw').innerHTML = `${parseInt(summaryData.당일출금).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalDepoWith').innerHTML = `${parseInt(summaryData.당일입출금).toLocaleString('ko-KR')} 원`;
          if (parseInt(summaryData.당일입출금) < 0) {
            document.querySelector('.todayInfo .depowith').classList.add('minus-bg');
            document.querySelector('.todayInfo .depowith').classList.remove('plus-bg');
          } else if (parseInt(summaryData.당일입출금) > 0) {
            document.querySelector('.todayInfo .depowith').classList.add('plus-bg');
            document.querySelector('.todayInfo .depowith').classList.remove('minus-bg');
          } else {
            document.querySelector('.todayInfo .depowith').classList.remove('plus-bg');
            document.querySelector('.todayInfo .depowith').classList.remove('minus-bg');
          }

          document.querySelector('#totalCasinoBetting').innerHTML = `${parseInt(summaryData.당일카지노베팅).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalCasinoWin').innerHTML = `${parseInt(summaryData.당일카지노획득).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalCasinoBetWin').innerHTML = `${parseInt(summaryData.당일카지노벳윈).toLocaleString('ko-KR')} 원`;
          if (parseInt(summaryData.당일카지노벳윈) < 0) {
            document.querySelector('.todayInfo .casino').classList.add('minus-bg');
            document.querySelector('.todayInfo .casino').classList.remove('plus-bg');
          } else if (parseInt(summaryData.당일카지노벳윈) > 0) {
            document.querySelector('.todayInfo .casino').classList.add('plus-bg');
            document.querySelector('.todayInfo .casino').classList.remove('minus-bg');
          } else {
            document.querySelector('.todayInfo .casino').classList.remove('plus-bg');
            document.querySelector('.todayInfo .casino').classList.remove('minus-bg');
          }

          document.querySelector('#totalSlotBetting').innerHTML = `${parseInt(summaryData.당일슬롯베팅).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalSlotWin').innerHTML = `${parseInt(summaryData.당일슬롯획득).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalSlotBetWin').innerHTML = `${parseInt(summaryData.당일슬롯벳윈).toLocaleString('ko-KR')} 원`;
          if (parseInt(summaryData.당일슬롯벳윈) < 0) {
            document.querySelector('.todayInfo .slot').classList.add('minus-bg');
            document.querySelector('.todayInfo .slot').classList.remove('plus-bg');
          } else if (parseInt(summaryData.당일슬롯벳윈) > 0) {
            document.querySelector('.todayInfo .slot').classList.add('plus-bg');
            document.querySelector('.todayInfo .slot').classList.remove('minus-bg');
          } else {
            document.querySelector('.todayInfo .slot').classList.remove('plus-bg');
            document.querySelector('.todayInfo .slot').classList.remove('minus-bg');
          }

          document.querySelector('#totalCasinoRolling').innerHTML = `${parseInt(summaryData.당일카지노롤링).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalSlotRolling').innerHTML = `${parseInt(summaryData.당일슬롯롤링).toLocaleString('ko-KR')} 원`;
          document.querySelector('#totalSumRolling').innerHTML = `${parseInt(summaryData.당일롤링합계).toLocaleString('ko-KR')} 원`;

          let totalSummary =
            parseInt(summaryData.당일카지노벳윈) +
            parseInt(summaryData.당일슬롯벳윈) -
            parseInt(summaryData.당일카지노롤링) -
            parseInt(summaryData.당일슬롯롤링);

          document.querySelector('#totalSummary').innerHTML = `${totalSummary.toLocaleString('ko-KR')} 원`;
        }

        // 모바일 에이전트 종합정보
        if (document.querySelector('#mobileAgentSummary')) {
          document.querySelector('#mobileAgentType').innerHTML = agentType;
          document.querySelector('#mobileAgentNick').innerHTML = navData.닉네임;
          document.querySelector('#mobileAgentBalance').value = `${navData.보유금.toLocaleString('ko-KR')} 원`;
          document.querySelector('#mobileAgentPoint').value = `${navData.포인트.toLocaleString('ko-KR')} P`;
          document.querySelector('#mobileAgentTotalUserNum').value = `${navData.회원수} 명`;
          document.querySelector('#mobileAgentNewJoin').value = `${todayJoinCount.당일가입} 명`;

          document.querySelector('#mobileAgentTodayGive').value = `${parseInt(giveTakeData.당일지급).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodayTake').value = `${parseInt(giveTakeData.당일회수).toLocaleString('ko-KR')}`;
          let 당일지급회수 = giveTakeData.당일지급 - giveTakeData.당일회수;
          document.querySelector('#mobileAgentTodayGiveTake').value = `${당일지급회수.toLocaleString('ko-KR')}`;

          document.querySelector('#mobileAgentTodayDeposit').value = `${parseInt(summaryData.당일입금).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodayWithdraw').value = `${parseInt(summaryData.당일출금).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodayDepoWith').value = `${parseInt(summaryData.당일입출금).toLocaleString('ko-KR')}`;

          document.querySelector('#mobileAgentTodayCasinoBetting').value = `${parseInt(summaryData.당일카지노베팅).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodayCasinoWin').value = `${parseInt(summaryData.당일카지노획득).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodayCasinoBetWin').value = `${parseInt(summaryData.당일카지노벳윈).toLocaleString('ko-KR')}`;

          document.querySelector('#mobileAgentTodaySlotBetting').value = `${parseInt(summaryData.당일슬롯베팅).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodaySlotWin').value = `${parseInt(summaryData.당일슬롯획득).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodaySlotBetWin').value = `${parseInt(summaryData.당일슬롯벳윈).toLocaleString('ko-KR')}`;

          document.querySelector('#mobileAgentTodayCasinoRoll').value = `${parseInt(summaryData.당일카지노롤링).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodaySlotRoll').value = `${parseInt(summaryData.당일슬롯롤링).toLocaleString('ko-KR')}`;
          document.querySelector('#mobileAgentTodaySlotSumRoll').value = `${parseInt(summaryData.당일롤링합계).toLocaleString('ko-KR')}`;

          let totalSummary =
            parseInt(summaryData.당일카지노벳윈) +
            parseInt(summaryData.당일슬롯벳윈) -
            parseInt(summaryData.당일카지노롤링) -
            parseInt(summaryData.당일슬롯롤링);

          document.querySelector('#mobileAgentTodayLose').value = `${parseInt(totalSummary).toLocaleString('ko-KR')} 원`;
        }

        //? 에이전트 입금모달
        document.querySelector('#agentDepositModal #agentBalance').innerHTML = `${navData.보유금}`;
        document.querySelector('#agentDepositModal #agentBalance').nextElementSibling.innerHTML = `${navData.보유금.toLocaleString('ko-KR')} `;

        //? 에이전트 출금모달
        document.querySelector('#agentWithdrawModal #agentBalance').innerHTML = `${navData.보유금}`;
        document.querySelector('#agentWithdrawModal #agentBalance').nextElementSibling.innerHTML = `${navData.보유금.toLocaleString('ko-KR')} `;
        document.querySelector('#agentBankOwner').value = `${navData.예금주}`;
        document.querySelector('#agentBankName').value = `${navData.은행}`;
        document.querySelector('#agentBankNum').value = `${navData.계좌번호}`;

        //? 에이전트 포인트전환모달
        document.querySelector('#agentExchangeModal #agentBalance').innerHTML = `${navData.보유금}`;
        document.querySelector('#agentExchangeModal #agentBalance').nextElementSibling.innerHTML = `${navData.보유금.toLocaleString('ko-KR')} `;
        document.querySelector('#agentExchangeModal #agentPoint').innerHTML = `${navData.포인트}`;
        document.querySelector('#agentExchangeModal #agentPoint').nextElementSibling.innerHTML = `${navData.포인트.toLocaleString('ko-KR')} `;
        document.querySelector('#after-exchange').value = `${(navData.보유금 + navData.포인트).toLocaleString('ko-KR')} 원`;

        //? 에이전트 지급, 회수모달
        document.querySelector('#agent-give-balance-cur-money').innerHTML = `${navData.보유금.toLocaleString('ko-KR')} `;
        document.querySelector('#agent-take-cur-money').innerHTML = `${navData.보유금.toLocaleString('ko-KR')} `;
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

window.addEventListener('DOMContentLoaded', (event) => {
  if (clientType !== 9) {
    agentCheckNoti();
  }
});

function agentCheckNoti() {
  $.ajax({
    method: 'POST',
    url: '/board/agentchecknoti',
  })
    .done(function (result) {
      if (result.question) {
        document.querySelector('#qnaIcon > span').classList.remove('d-none');
      } else {
        document.querySelector('#qnaIcon > span').classList.add('d-none');
      }

      if (result.message) {
        document.querySelector('#messageIcon > span').classList.remove('d-none');
        console.log('에이전트 메세지가 있습니다');
      } else {
        document.querySelector('#messageIcon > span').classList.add('d-none');
      }

      if (result.question && result.message) {
        document.querySelector('#confirm-text').innerHTML = `<h5 class='my-3'>
                      <p>문의하신 내용에 대한 답변과</p>
                      <p>읽지않은 메시지가 있습니다</p>
                    </h5>`;
        $('#agentConfirmModal').modal('show');
      } else if (result.question && !result.message) {
        document.querySelector('#confirm-text').innerHTML = `<h5 class='my-3'>
                      <p>문의하신 내용에 대한 답변이 있습니다</p>
                    </h5>`;
        $('#agentConfirmModal').modal('show');
      } else if (!result.question && result.message) {
        document.querySelector('#confirm-text').innerHTML = `<h5 class='my-3'>
                      <p>읽지않은 메시지가 있습니다</p>
                    </h5>`;
        $('#agentConfirmModal').modal('show');
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

// #region 에이전트 네비바 QnA
$('#agentQna').DataTable({
  autoWidth: false,
  language: korean,
  responsive: true,
  ajax: {
    url: '/board/agent',
    method: 'POST',
    data: { type: 'agentQna' },
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
      render: function (data, type, row) {
        if (data == '유저문의') {
          return `<button class='btn btn-sm btn-danger questionState' disabled>답변대기</button>`;
        } else if (data == '답변완료') {
          return `<button class='btn btn-sm btn-primary questionState' disabled>답변확인</button>`;
        } else if (data == '답변확인') {
          return `<button class='btn btn-sm btn-success questionState' disabled>완료</button>`;
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
    $('#agentQuestionModal tr').click(function () {
      let selectedQuestion = $('table').DataTable().row($(this)).data();

      switch (selectedQuestion.종류) {
        case '계좌':
          document.querySelector('#agentViewQuestionType').classList.add('asset-danger');
          break;
        case '베팅':
          document.querySelector('#agentViewQuestionType').classList.add('asset-primary');
          break;
        case '계정':
          document.querySelector('#agentViewQuestionType').classList.add('asset-success');
          break;
        case '기타':
          document.querySelector('#agentViewQuestionType').classList.add('asset-warning');
          break;
      }

      if (selectedQuestion.상태 == '유저문의') {
        document.querySelector('#agentViewQuestionLabel').innerHTML = `관리자가 확인 중입니다. 조금만 기다려주세요.`;
      } else {
        document.querySelector('#agentViewQuestionLabel').innerHTML = ` 답변 내용`;
      }

      document.querySelector('#agentViewQuestionType').value = selectedQuestion.종류;
      document.querySelector('#agentViewQuestionTitle').value = selectedQuestion.제목;
      document.querySelector('#agentViewQuestionContent').value = selectedQuestion.내용;
      document.querySelector('#agentViewQuestionAnswer').value = selectedQuestion.답변;

      $('#agentQuestionModal').modal('hide');
      $('#agentViewQuestionModal').modal('show');

      if (selectedQuestion.상태 == '답변완료') {
        changeQuestionState(selectedQuestion);
      }
    });
  },
});

//? 문의하기
if (document.querySelector('#agentRequestQuestionForm')) {
  document.querySelector('#agentRequestQuestionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let question_data = $('#agentRequestQuestionForm').serialize();

    $.ajax({
      method: 'POST',
      url: '/board/agentquestion',
      data: question_data,
    })
      .done((result) => {
        document.querySelector('#confirm-text').innerHTML = `<h3>${result.message}</h3>`;
        $('#agentRequestQuestionModal').modal('hide');
        $('#agentConfirmModal').modal('show');
        agentCheckNoti();

        socket.emit('to_admin', { userId: result.id, type: 'requestQuestion' });
      })
      .fail(function (err) {
        console.log('전송오류');
        console.log(err);
      });
  });
}

//? 문의확인 닫기
$('#agentViewQuestionModal').on('hide.bs.modal', function () {
  let viewQuestionType = document.querySelector('#viewQuestionType');
  let classList = viewQuestionType.classList;

  // asset-로 시작하는 클래스를 모두 삭제합니다.
  for (var i = 0; i < classList.length; i++) {
    if (classList[i].startsWith('asset-')) {
      classList.remove(classList[i]);
      i--; // 클래스가 삭제될 때 인덱스를 조정합니다.
    }
  }
  $('#agentQuestionModal').modal('show');
});

//? 답변완료 > 유저확인 상태변경
function changeQuestionState(params) {
  $.ajax({
    method: 'POST',
    url: '/board/questionstate',
    data: params,
  })
    .done((result) => {
      $('#agentQna').DataTable().ajax.reload(null, false);
      agentCheckNoti();
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}
// #endregion

// #region 에이전트 네비바 메세지
$('#agentMessage').DataTable({
  language: korean,
  responsive: true,
  ajax: {
    url: '/board/agent',
    method: 'POST',
    data: { type: 'agentMessage' },
    dataSrc: '',
  },
  dom: 'tip',
  columns: [{ data: 'IDX' }, { data: '받은일시' }, { data: '종류' }, { data: '제목' }, { data: '내용' }, { data: '읽음여부' }],
  pageLength: 10,
  lengthMenu: [10, 50, 100],
  order: [[1, 'desc']],
  columnDefs: [
    { target: [0, 4], visible: false },
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
    $('#agentMessageModal tr').click(function () {
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
      document.querySelector('#viewMessageContent').value = selectedMessage.내용;

      $('#agentMessageModal').modal('hide');
      $('#agentViewMessageModal').modal('show');

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
    url: '/board/messagestate',
    data: params,
  })
    .done((result) => {
      console.log(result);
      $('#agentMessage').DataTable().ajax.reload(null, false);
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

//? 메세지 확인 및 모달 열기
let alertText = document.querySelector('#alert-text');
let readAllBtn = document.querySelector('#readAllMessageBtn');
let deleteAllBtn = document.querySelector('#deleteAllMessageBtn');
let idx_list;
let idx_array;

//? 모든 메세지 모달 열기
if (document.querySelector('#readAllModalOpen')) {
  document.querySelector('#readAllModalOpen').addEventListener('click', () => {
    idx_list = $('#agentMessage').DataTable().rows().data().pluck('IDX');
    idx_array = Array.from(idx_list);

    $.ajax({
      method: 'POST',
      url: '/board/readcheck',
      data: { idx: idx_array },
    })
      .done((result) => {
        if (result) {
          alertText.innerHTML = `<h4>모든 메세지를 읽음 처리하시겠습니까?</h4>
        <h5 class='pt-1'>확인하지 않은 메세지로 인해<br> 불이익이 발생할 수 있습니다</h5>`;
          readAllBtn.classList.remove('d-none');
        } else if (!result && idx_array.length > 0) {
          alertText.innerHTML = `<h4>모든 메세지가 이미 읽은 상태입니다</h4><h5 class='mt-3 text-danger fw-bold'>모든 메세지를 삭제하시겠습니까?</h5>
        <h5 class='pt-1 text-danger fw-bold'>삭제된 메세지는 복구할 수 없습니다</h5>`;
          deleteAllBtn.classList.remove('d-none');
        } else {
          alertText.innerHTML = `<h4>받은 메세지가 없습니다</h4>`;
        }
        $('#agentAlertModal').modal('show');
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
  $('#agentAlertModal').modal('hide');
});

function readAllMessage(params) {
  console.log(params);
  $.ajax({
    method: 'POST',
    url: '/board/readall',
    data: { idx: params },
  })
    .done((result) => {
      $('#agentMessage').DataTable().ajax.reload(null, false);
      agentCheckNoti();
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}

//? 전체 삭제 모달 열기
if (document.querySelector('#deleteAllModalOpen')) {
  document.querySelector('#deleteAllModalOpen').addEventListener('click', () => {
    idx_list = $('#agentMessage').DataTable().rows().data().pluck('IDX');
    idx_array = Array.from(idx_list);

    $.ajax({
      method: 'POST',
      url: '/board/readcheck',
      data: { idx: idx_array },
    })
      .done((result) => {
        if (result && idx_array.length > 0) {
          alertText.innerHTML = `<h4 class='fw-bold text-danger'>모든 메세지를 삭제하시겠습니까?</h4>
        <h5 class='pt-1 fw-bold text-danger'>삭제된 메세지는 복구할 수 없습니다</h5>`;
          deleteAllBtn.classList.remove('d-none');
          $('#agentAlertModal').modal('show');
        } else if (result) {
          alertText.innerHTML = `<h4>아직 확인하지 않은 메세지가 있습니다</h4>
        <h4 class='pt-1'>메세지를 확인해 주세요</h4>`;
          $('#alertModal').modal('show');
        } else {
          alertText.innerHTML = `<h3>받은 메세지가 없습니다</h3>`;
        }
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
  $('#agentAlertModal').modal('hide');
});

function deleteAllMessage(params) {
  console.log(params);
  $.ajax({
    method: 'POST',
    url: '/board/deleteall',
    data: { idx: params },
  })
    .done((result) => {
      $('#agentMessage').DataTable().ajax.reload(null, false);
      console.log(result);
      checkNoti();
    })
    .fail(function (err) {
      console.log('전송오류');
      console.log(err);
    });
}
// #endregion

setInterval(() => {
  getNavModalData();
  $('#onlineUsers, #userInfo, #userAsset #agentInfo, #userCommission, #dashboardAgentBank, #onlineUsersAgent').DataTable().ajax.reload(null, false);
}, 1000 * 5);
// #endregion

// #region 비밀번호 변경
document.querySelector('.changePasswordBtn').addEventListener('click', function () {
  $('#changePasswordModal').modal('show');
});

function togglePasswordView(buttonId, inputId) {
  document.getElementById(buttonId).addEventListener('click', function () {
    let input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
  });
}

togglePasswordView('newPasswordViewBtn', 'newPassword');
togglePasswordView('newPasswordCheckViewBtn', 'newPasswordCheck');

document.getElementById('changePasswordConfirm').addEventListener('click', function () {
  let oldPassword = document.getElementById('oldPassword');
  let newPassword = document.getElementById('newPassword');
  let newPasswordCheck = document.getElementById('newPasswordCheck');
  let description = document.getElementById('passwordDescription');

  if (!oldPassword.value) {
    description.innerText = '기존 비밀번호를 입력해주세요';
    return;
  }

  // 정규식: 영어, 숫자, 특수문자 최소 6자 이상 16자 이하
  let regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,16}$/;

  if (!regex.test(newPassword.value)) {
    description.innerText = '영어, 숫자, 특수문자를 포함 최소 6자 ~ 최대 16자';
    return;
  }

  if (newPassword.value !== newPasswordCheck.value) {
    description.innerText = '새 비밀번호가 일치하지 않습니다';
    return;
  }

  description.innerText = '';
  let passwordData = $('#passwordChange').serialize();
  changePassword(passwordData);
});

$('#changePasswordModal').on('hidden.bs.modal', function () {
  document.getElementById('oldPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('newPasswordCheck').value = '';
  document.getElementById('passwordDescription').innerText = '';

  document.getElementById('newPassword').type = 'password';
  document.getElementById('newPasswordCheck').type = 'password';
});

async function changePassword(data) {
  $.ajax({
    method: 'POST',
    url: '/user/changepassword',
    data: data,
  })
    .done(function (result) {
      if (result.isChanged) {
        document.getElementById('boardConfirm').innerHTML = result.msg;
        $('#boardConfirmModal').modal('show');
        $('#changePasswordModal').modal('hide');
      } else {
        document.getElementById('passwordDescription').innerText = result.msg;
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

// #endregion

// #region 파싱
//? 파싱타입 설정
$('#dgSelector .dropdown-item').click(function () {
  console.log('클릭');
  let pType = $(this).data('ptype');
  changeParsingType(pType);
});

async function changeParsingType(pType) {
  $.ajax({
    method: 'POST',
    url: '/game/parsing',
    data: { pType: pType },
  })
    .done(function (result) {
      $('.dropdown-label').text(result.msg);
      $('#userInfo').DataTable().ajax.reload(null, false);

      // if (result.success) {
      //   location.reload();
      // }
    })
    .fail(function (err) {
      console.log(err);
    });
}

//? 유저 개별 파싱타입 변경
$('table').on('click', 'tbody tr .pType-btn', function () {
  let btn = $(this);
  selectedUser = $('table').DataTable().row($(this).parent('td')).data();
  console.log(selectedUser);
  changeUserParsingType(selectedUser, btn);
});

async function changeUserParsingType(user, btn) {
  $.ajax({
    method: 'POST',
    url: '/game/parsing',
    data: { pType: user.P타입, isUser: true, userId: user.IDX },
  })
    .done(function (result) {
      if (result.isChange) {
        btn.text(result.msg);
        $('#userInfo').DataTable().ajax.reload(null, false);
      } else {
        alert(result.msg);
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}
// #endregion

// #region 답변 매크로 설정
async function getMacroData() {
  try {
    let result = await $.ajax({
      method: 'POST',
      url: '/board/macro',
      data: { type: 'getMacroData' },
    });
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

document.getElementById('setMacroModal').addEventListener('show.bs.modal', async function (e) {
  let macroData = await getMacroData();

  macroData.forEach((data) => {
    document.querySelector(`[data-slot="${data.macro_id}"] .title-input`).value = data.macro_title;
    document.querySelector(`[data-slot="${data.macro_id}"] .content-textarea`).value = data.macro_content.replace(/\\/g, '');
  });

  let originalValues = [...macroData];

  // input 및 textarea 값 변경 감지
  document.querySelectorAll('.title-input, .content-textarea').forEach((element) => {
    element.addEventListener('input', function () {
      let changesDetected = false;

      for (let i = 0; i < macroData.length; i++) {
        let currentTitle = document.querySelector(`[data-slot="${i + 1}"] .title-input`).value;
        let currentContent = document.querySelector(`[data-slot="${i + 1}"] .content-textarea`).value;

        if (originalValues[i].macro_title !== currentTitle || originalValues[i].macro_content !== currentContent) {
          changesDetected = true;
          break;
        }
      }

      const btnSaveMacro = document.querySelector('#setMacroBtn');
      if (changesDetected) {
        btnSaveMacro.disabled = false;
        btnSaveMacro.classList.remove('btn-secondary');
        btnSaveMacro.classList.add('btn-success');
      } else {
        btnSaveMacro.disabled = true;
        btnSaveMacro.classList.remove('btn-success');
        btnSaveMacro.classList.add('btn-secondary');
      }
    });
  });
});

document.getElementById('setMacroBtn').addEventListener('click', async function () {
  // 모든 매크로 데이터를 배열로 수집합니다.
  let macrosToSend = [];

  for (let i = 1; i <= 10; i++) {
    let title = document.querySelector(`[data-slot="${i}"] .title-input`).value;
    let content = document.querySelector(`[data-slot="${i}"] .content-textarea`).value;
    macrosToSend.push({
      macro_id: i,
      macro_title: title,
      macro_content: content,
    });
  }

  $.ajax({
    method: 'POST',
    url: '/board/macro',
    data: { type: 'updateMacroData', macros: macrosToSend },
  })
    .done(function (result) {
      document.querySelector('#confirmModal .modal-body').innerHTML = `<h5 class='pt-3' style='line-height:2rem'>답변 매크로 설정을 변경하였습니다</h5>`;
      $('#setMacroModal').modal('hide');
      $('#confirmModal').modal('show');
    })
    .fail(function (err) {
      console.log(err);
    });
});

function mapMacroDataToButtons(data) {
  const macroBtnGroup = document.getElementById('macroBtnGroup');
  const buttons = macroBtnGroup.querySelectorAll('button');

  data.forEach((macro, index) => {
    const button = buttons[index];
    button.innerText = macro.macro_title;
    button.addEventListener('click', () => {
      const textarea = document.getElementById('viewQuestionAnswer');
      textarea.value = macro.macro_content.replace(/\\/g, '');
      document.getElementById('anserQuestionBtn').disabled = false;
    });
  });
}

document.getElementById('viewQuestionModal').addEventListener('show.bs.modal', async function () {
  let macroData = await getMacroData();
  mapMacroDataToButtons(macroData);
});
// #endregion

//? 테이블 새로고침
$('#agentConfirmModal, #confirmModal').on('hidden.bs.modal', function () {
  setTimeout(() => {
    initPopover();
    reloadTable();
  }, 1000);
});

// $('table').on('click', 'tbody tr .simple-tree-table-handler', function () {
//   console.log('트리테이블 클릭');
//   treeInfo = localStorage.getItem('KEY');
//   console.log('treeInfo', treeInfo);
// });

// $('#expander').on('click', function () {
//   console.log('트리테이블 클릭');
//   treeInfo = localStorage.getItem('KEY');
//   console.log('treeInfo', treeInfo);
// });

function reloadTable() {
  let tableId = $('main table:first').attr('id');
  $(`#${tableId}`).DataTable().ajax.reload(null, false);
}
