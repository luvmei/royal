const express = require('express');
const router = express.Router();
const mybatisMapper = require('../mybatis-mapper');
const { pool, sqlFormat } = require('../mariadb');
const JSONbig = require('json-bigint');
const axios = require('axios');
const moment = require('moment-timezone');

// #region 출석체크
router.post('/state', async (req, res) => {
  if (req.user) {
    const eventState = await checkUserEventState(req.user[0]);
    res.send(eventState);
  } else {
    res.send(false);
  }
});

async function checkUserEventState(user) {
  let conn = await pool.getConnection();
  let params = { id: user.id };
  let checkUserEventState = mybatisMapper.getStatement('event', 'checkUserEventState', params, sqlFormat);

  try {
    let result = await conn.query(checkUserEventState);

    return result[0];
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

router.post('/attendance', (req, res) => {
  if (req.user) {
    checkAttendance(res, req.user[0]);
  } else {
    res.send(false);
  }
});

async function checkAttendance(res, user) {
  let conn = await pool.getConnection();
  let params = { id: user.id };
  let checkAttendance = mybatisMapper.getStatement('event', 'checkAttendance', params, sqlFormat);

  try {
    let result = await conn.query(checkAttendance);

    if (result.length == 0) {
      res.send({ continueCounter: 0, attendanceDays: '' });
    } else {
      res.send({ continueCounter: result[0].continueCounter, attendanceDays: result[0].monthlyAttDays });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

router.post('/attendance/submit', async (req, res) => {
  const { attendance_state } = await checkUserEventState(req.user[0]);

  if (req.user && attendance_state == 1) {
    submitAttendance(res, req.user[0]);
  } else {
    res.send(false);
  }
});

async function submitAttendance(res, params) {
  let newAttInfo;
  let conn = await pool.getConnection();
  const stateSql = mybatisMapper.getStatement('event', 'getAttendanceState', null, sqlFormat);
  const rewardSql = mybatisMapper.getStatement('event', 'getAttRewardInfo', null, sqlFormat);
  let getAttendance = mybatisMapper.getStatement('event', 'getAttendance', params, sqlFormat);

  try {
    const eventState = await conn.query(stateSql);
    const rewardInfo = await conn.query(rewardSql);
    let { attEventAmount, attEventCount } = eventState[0];

    let attInfo = await conn.query(getAttendance);
    attInfo = attInfo[0];

    let currentDate = moment.tz('Asia/Seoul');
    currentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    let day = currentDate.date();
    newAttInfo = {
      id: params.id,
      monthlyAttDays: `${day}`,
    };

    let todayDepositSum = await checkTodayDepositSum(params.id);
    console.log('당일 총 입금액: ' + parseInt(todayDepositSum).toLocaleString('ko-KR'));

    if (todayDepositSum < attEventAmount) {
      console.log(
        `${parseInt(attEventAmount).toLocaleString('ko-KR')}원 미만으로 출석조건 미달 (현재 ${parseInt(todayDepositSum).toLocaleString('ko-KR')}원 입금)`
      );
      return false;
    }

    let insertAttendance = mybatisMapper.getStatement('event', 'insertAttendance', newAttInfo, sqlFormat);
    let updateNewAttendanceUserState = mybatisMapper.getStatement('event', 'updateNewAttendanceUserState', params, sqlFormat);

    if (!attInfo) {
      console.log('출석유형: 신규출석');
      await conn.beginTransaction();
      await conn.query(insertAttendance);
      await conn.query(updateNewAttendanceUserState);
      await conn.commit();
      let grantMsg = `<h2>출석 완료</h2><h3 class="mt-4">오늘 처음 출석하셨습니다!</h3>`;
      res.send({ isAttendance: true, attendanceMsg: grantMsg });
      return;
    }

    let recentDate = moment.tz(attInfo.recentAttDate, 'Asia/Seoul');
    recentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    console.log('최근 출석일: ' + recentDate.format('YYYY-MM-DD'));

    let timeDiff = currentDate - recentDate;

    let dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    console.log('출석일 차이: ' + dayDiff);

    if (dayDiff == 0) {
      console.log('이미 출석함');
      return false;
    } else {
      if (!attInfo.monthlyAttDays.includes(day.toString())) {
        attInfo.monthlyAttDays += `,${day}`;
      }
      if (dayDiff == 1) {
        attInfo.continueCounter++;
        console.log('출석유형: 연속출석');
      } else {
        attInfo.continueCounter = 1;
        console.log('출석유형: 일반출석');
      }

      let { userContinueCounter, grantMsg } = await grantReward(attInfo.user_id, attInfo.continueCounter, attEventCount, rewardInfo);
      attInfo.continueCounter = userContinueCounter;

      res.send({ isAttendance: await updateAttendanceInfo(attInfo), attendanceMsg: grantMsg });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function grantReward(userId, userContinueCounter, attEventCount, rewardInfo) {
  let params;
  let attendanceReward;
  let maxContinueCounter = 0;

  for (let i = 0; i < attEventCount; i++) {
    if (rewardInfo[i].continueCounter === userContinueCounter) {
      attendanceReward = rewardInfo[i].reward_amount;
    }

    if (rewardInfo[i].continueCounter > maxContinueCounter) {
      maxContinueCounter = rewardInfo[i].continueCounter;
    }
  }

  if (userContinueCounter > maxContinueCounter) {
    userContinueCounter = 1; // 이 경우 userContinueCounter를 1로 재설정합니다.
    let grantMsg = `<h2>출석 완료</h2><h3 class="mt-4">새 출석이벤트 시작  |  ${userContinueCounter}일 연속출석</h3>`;
    return { userContinueCounter, grantMsg };
  }

  if (!attendanceReward) {
    let grantMsg = `<h2>출석 완료</h2><h3 class="mt-4">${userContinueCounter}일 연속출석</h3>`;
    return { userContinueCounter, grantMsg };
  }

  params = { userId: userId, rewardPoint: attendanceReward };

  let conn = await pool.getConnection();
  let grantReward = mybatisMapper.getStatement('event', 'grantAttendanceReward', params, sqlFormat);

  try {
    await conn.query(grantReward);
    let grantMsg = `<h2>출석 완료</h2><h3 class="mt-4">${userContinueCounter}일 연속출석  |  보상 지급: ${parseInt(attendanceReward).toLocaleString(
      'ko-KR'
    )}P</h3>`;
    return { userContinueCounter, grantMsg };
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function checkTodayDepositSum(id) {
  let conn = await pool.getConnection();
  let params = { id: id };
  let getTodayDepositSum = mybatisMapper.getStatement('event', 'getTodayDepositSum', params, sqlFormat);

  try {
    let todayDepositSum = await conn.query(getTodayDepositSum);
    todayDepositSum = todayDepositSum[0].today_deposit_sum;
    return todayDepositSum;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function updateAttendanceInfo(attInfo, day) {
  let conn = await pool.getConnection();

  let updateStatement = mybatisMapper.getStatement('event', 'updateAttendance', attInfo, sqlFormat);
  let updateUserEventState = mybatisMapper.getStatement('event', 'updateUserAttendanceState', attInfo, sqlFormat);

  try {
    conn.beginTransaction();
    conn.query(updateStatement);
    conn.query(updateUserEventState);
    conn.commit();

    return true;
  } catch (e) {
    conn.rollback();
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}
// #endregion

// #region 로또
router.post('/lotto', async (req, res) => {
  if (!req.user) {
    return res.status(401).send(false);
  }

  let lottoState;
  let lottoInfo;
  let params = req.body;
  params.userId = req.user[0].id;

  switch (params.type) {
    case 'check':
      lottoState = await checkLottoState(params);
      lottoInfo = await getLottoInfo(params);
      res.send({ lottoState: lottoState, lottoInfo: lottoInfo });
      break;

    case 'submit':
      lottoState = await checkLottoState(params);
      if (lottoState == 1) {
        params.isVirtual = 0;
        submitLotto(res, params);
      } else {
        res.send(false);
      }
      break;

    case 'list':
    case 'detail':
      getLottoData(res, params);
      break;

    default:
      res.status(400).send('Invalid request type');
      break;
  }
});

async function getLottoData(res, params) {
  let conn;
  let lottoList;
  let lottoDetail;

  try {
    conn = await pool.getConnection();

    if (params.type == 'detail') {
      let getLottoDataQuery = mybatisMapper.getStatement('event', 'getLottoDetail', params, sqlFormat);
      lottoDetail = await conn.query(getLottoDataQuery);
    }

    let getLottoDataQuery = mybatisMapper.getStatement('event', 'getLottoList', params, sqlFormat);
    lottoList = await conn.query(getLottoDataQuery);

    lottoList = JSONbig.parse(JSONbig.stringify(lottoList));

    const lottoListData = await Promise.all(
      lottoList.map(async (lotto) => {
        let winningNumbers = await getWinningNumbers(lotto['회차']);
        let isDraw = true;

        if (winningNumbers.some((number) => number === undefined)) {
          winningNumbers = [];
          isDraw = false;
        }
        return {
          ...lotto,
          winningNumbers: winningNumbers,
          isDraw: isDraw,
        };
      })
    );

    if (params.type == 'detail') {
      res.send({ listData: lottoListData, detailData: lottoDetail });
    } else if (params.type == 'list') {
      res.send(lottoListData);
    }
  } catch (e) {
    console.log(e);
    res.status(500).send('서버 에러가 발생했습니다.');
  } finally {
    if (conn) conn.release();
  }
}

async function getWinningNumbers(drwNo) {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6];
  } catch (error) {
    console.error('API 요청 중 오류가 발생했습니다:', error);
    return null;
  }
}

async function checkLottoState(params) {
  let conn = await pool.getConnection();
  let checkLottoState = mybatisMapper.getStatement('event', 'checkLottoState', params, sqlFormat);

  try {
    let result = await conn.query(checkLottoState);
    const lottoState = result[0].lotto_state;
    return lottoState;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function getLottoInfo(params) {
  let conn = await pool.getConnection();
  let getLottoInfo = mybatisMapper.getStatement('event', 'getLottoInfo', params, sqlFormat);

  try {
    let result = await conn.query(getLottoInfo);
    return result[0];
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function submitLotto(res, params) {
  //todo 신청유저의 자격조건 재확인
  let conn = await pool.getConnection();
  const lottoState = await checkLottoState(params);
  params.numbers = params.numbers.map((num) => parseInt(num, 10));

  if (lottoState != 1) {
    res.send(false);
    return;
  }

  try {
    let updateLottoState = mybatisMapper.getStatement('event', 'updateLottoState', params, sqlFormat);
    let submitLotto = mybatisMapper.getStatement('event', 'insertLottoHistory', params, sqlFormat);

    await conn.beginTransaction();
    await conn.query(updateLottoState);
    await conn.query(submitLotto);
    await conn.commit();

    res.send({ lottoSubmitMsg: `${params.round}회차 로또 신청이 완료되었습니다.` });
  } catch (e) {
    console.log(e);
    await conn.rollback();
    res.status(500).send('서버 에러가 발생했습니다.');
  } finally {
    if (conn) conn.release();
  }
}
// #endregion
module.exports = router;
