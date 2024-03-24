const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('../mybatis-mapper');
const JSONbig = require('json-bigint');
const moment = require('moment-timezone');
const axios = require('axios');
const socket = require('../socket');
const api = require(`../public/js/api/${process.env.API_TYPE}`);
const cron = require('node-cron');

// #region 테이블 전송
function handleBankRequest(req, res, sqlType) {
  req.user[0].sqlType = sqlType;
  req.user[0].startDate = req.body.startDate;
  req.user[0].endDate = req.body.endDate;
  getData(res, req.user[0]);
}

router.post('/depowith', function (req, res) {
  handleBankRequest(req, res, 'depositwithdraw');
});

router.post('/deposit', function (req, res) {
  handleBankRequest(req, res, 'deposit');
});

router.post('/withdraw', function (req, res) {
  handleBankRequest(req, res, 'withdraw');
});

router.post('/give', function (req, res) {
  handleBankRequest(req, res, 'give');
});

router.post('/take', function (req, res) {
  handleBankRequest(req, res, 'take');
});

router.post('/givetake', function (req, res) {
  handleBankRequest(req, res, 'giveTake');
});
// #endregion

// #region 유저 입출금
//? 입금 처리현황 변경
router.post('/deposit/status', function (req, res) {
  updateState(res, req.body, 'deposit');
});

//? 출금 처리현황 변경
router.post('/withdraw/status', function (req, res) {
  updateState(res, req.body, 'withdraw');
});

//? 유저 입금승인
router.post('/deposit/confirm', function (req, res) {
  confirmDepositRequest(res, req.body);
});

//? 유저 출금승인
router.post('/withdraw/confirm', function (req, res) {
  let result = confirmWithdrawRequest(req.body);
  if (result) {
    res.send('출금이 처리되었습니다');
  } else {
    res.send('출금이 처리되지 않았습니다');
  }
});

//? 일괄 출금승인
router.post('/withdraw/batchconfirm', async function (req, res) {
  let resultArr = [];
  console.log(req.body.selectedData);

  for (const object of req.body.selectedData) {
    console.log(object.currentStatus);
    if (object.currentStatus === '출금승인' || object.currentStatus === '신청취소' || object.currentStatus === '출금신청') {
      continue;
    } else if (object.currentStatus === '출금대기') {
      console.log('출금신청입니다.');
      let result = await confirmWithdrawRequest(object);
      resultArr.push(result);
    }
  }

  console.log(resultArr);

  if (resultArr.length > 0 && resultArr.every((result) => result === true)) {
    console.log('모든 출금이 처리되었습니다');
    res.send('모든 출금이 처리되었습니다');
  } else {
    console.log('하나 이상의 출금이 처리되지 않았습니다');
    res.send('하나 이상의 출금이 처리되지 않았습니다');
  }
});

//? 승인 후 입금 취소
router.post('/deposit/confirmcancel', function (req, res) {
  cancelConfirm(res, req.body, 'deposit');
});

//? 승인 전 입금 취소
router.post('/deposit/cancel', function (req, res) {
  cancelRequest(res, req.body, 'cancelDeposit');
});

//? 승인 후 출금 취소
router.post('/withdraw/confirmcancel', function (req, res) {
  console.log(req.body);
  cancelConfirm(res, req.body, 'withdraw');
});

//? 승인 전 출금 취소
router.post('/withdraw/cancel', function (req, res) {
  cancelRequest(res, req.body, 'cancelWithdraw');
});
// #endregion

// #region 에이전트 입출금
//? 에이전트 입금계좌 문의
router.post('/agent/banknum', function (req, res) {
  if (req.user == undefined) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    let params = { id: req.user[0].id };
    requestBankNum(res, params);
  }
});

//? 에이전트 입금 신청
router.post('/agent/deposit', function (req, res) {
  if (req.user == undefined) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    let params = req.body;
    req.body.id = req.user[0].id;
    req.body.time = getCurrentTime();
    req.body.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
    req.body.agentType = req.user[0].type;
    req.body.type = '입금';
    req.body.balance = req.user[0].balance;
    insertRequestQuery(res, 'deposit', params);
  }
});

//? 에이전트 출금 신청
router.post('/agent/withdraw', async function (req, res) {
  if (req.user == undefined) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    let { balance } = await beforeBalanceCheck(req.user[0].id);
    if (balance < req.body.reqMoney) {
      res.send({ balanceCheck: false });
      return;
    }

    let params = req.body;
    req.body.id = req.user[0].id;
    req.body.time = getCurrentTime();
    req.body.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
    req.body.agentType = req.user[0].type;
    req.body.type = '출금';
    req.body.balance = req.user[0].balance;
    insertRequestQuery(res, 'withdraw', params);
  }
});

router.post('/agent/exchange', function (req, res) {
  if (req.user == undefined) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    let params = req.body;
    params.id = req.user[0].id;
    params.time = getCurrentTime();
    params.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
    params.agentType = req.user[0].type;
    params.type = '포인트전환';
    params.balance = req.user[0].balance;
    params.afterPoint = req.user[0].point - req.body.reqPoint;

    if (params.afterPoint < 0) {
      res.send({ error: true, msg: '포인트가 부족합니다' });
    } else {
      exchangePoint(res, params);
    }
  }
});

//todo 하는 중
async function exchangePoint(res, params) {
  let conn = await pool.getConnection();
  let exchangePoint = mybatisMapper.getStatement('bank', 'exchangePoint', params, sqlFormat);
  let exchangePointLog = mybatisMapper.getStatement('bank', 'exchangePointLog', params, sqlFormat);
  let exchangeBalanceLog = mybatisMapper.getStatement('bank', 'exchangeBalanceLog', params, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(exchangePoint);
    await conn.query(exchangePointLog);
    await conn.query(exchangeBalanceLog);
    await conn.commit();
    res.send('포인트 전환완료');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 지급회수
//? 보유금 지급
router.post('/agent/give', async function (req, res) {
  if (req.user == undefined) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    if (req.user[0].type != 9) {
      let { balance } = await beforeBalanceCheck(req.user[0].id);
      if (balance < req.body.reqMoney) {
        res.send({ balanceCheck: false });
        return;
      }
    }

    let params = req.body;
    params.senderId = req.user[0].id;
    params.time = getCurrentTime();
    params.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
    params.senderType = req.user[0].type;
    params.type = '지급';
    params.balance = req.user[0].balance;

    if (parseInt(params.reqMoney) > parseInt(req.user[0].balance)) {
      res.send({ msg: '비정상적인 신청입니다.' });
    } else {
      giveTakeBalance(res, params);
    }
  }
});

//? 보유금 회수
router.post('/agent/take', async function (req, res) {
  if (req.user == undefined) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    if (req.user[0].type != 9) {
      let { balance } = await beforeBalanceCheck(req.body.receiverId);
      if (balance < req.body.reqMoney) {
        res.send({ balanceCheck: false });
        return;
      }
    }

    let params = req.body;
    req.body.senderId = req.user[0].id;
    req.body.time = getCurrentTime();
    req.body.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
    req.body.senderType = req.user[0].type;
    req.body.type = '회수';
    req.body.balance = req.user[0].balance;

    if (parseInt(params.reqMoney) > parseInt(params.userBalance)) {
      res.send({ msg: '비정상적인 신청입니다.' });
    } else {
      giveTakeBalance(res, params);
    }
  }
});

async function giveTakeBalance(res, params) {
  params.id = params.senderId;
  console.log(`[${params.type}신청] 신청: ${params.senderId} / 대상: ${params.receiverId} / 금액: ${parseInt(params.reqMoney).toLocaleString('ko-KR')}`);
  let conn = await pool.getConnection();
  let apiResult = {};
  params.receiverType = Number(params.receiverType);
  params.transactionId = moment().format('YYMMDDHHmmss');

  try {
    // 로또 당첨 지급 시
    if (params.giveType && params.giveType == 'lottery') {
      params.paidPrize = 3;
      let updatePaidPrize = mybatisMapper.getStatement('event', 'updatePaidPrize', params, sqlFormat);
      await conn.query(updatePaidPrize);
    }

    if (params.senderType === 9) {
      if (params.receiverType === 4) {
        apiResult = await api.requestAsset(params);

        if (apiResult.status !== 200) {
          let errMsg = `${params.receiverId} 회원에게 ${params.type}실패`;
          console.log(errMsg);
          res.send(errMsg);
          return;
        }
      } else {
        console.log(`${params.receiverId} 에이전트에게 ${params.type}합니다.`);
      }

      await updateDatabase(conn, params);
      res.send(`${params.type}완료`);
    } else {
      let checkBankState = mybatisMapper.getStatement('bank', 'checkBankState', params, sqlFormat);
      let bankState = await conn.query(checkBankState);

      if (bankState[0].bank_req_state == 'n') {
        if (params.receiverType === 4) {
          apiResult = await api.requestAsset(params);

          if (apiResult.status !== 200) {
            let errMsg = `${params.receiverId} 회원에게 ${params.type}실패`;
            console.log(errMsg);
            res.send(errMsg);
            return;
          }
        } else {
          console.log(`${params.receiverId} 에이전트에게 ${params.type}합니다.`);
        }

        await updateDatabase(conn, params);
        console.log(`[${params.type}완료] 신청: ${params.senderId} / 대상: ${params.receiverId} / 금액: ${parseInt(params.reqMoney).toLocaleString('ko-KR')}`);
        res.send('지급완료');
      } else {
        res.send({
          request: 'fail',
          msg: '입금 또는 출금신청이 처리 중입니다',
        });
      }
    }
  } catch (e) {
    console.error(e);
    conn.rollback();
    res.status(500).send('An error occurred while processing the request.');
  } finally {
    if (conn) conn.release();
  }
}

async function updateDatabase(conn, params) {
  const { reqType, receiverType } = params;

  switch (params.giveType) {
    case 'default':
      params.giveType = '일반';
      break;
    case 'losing':
      params.giveType = '루징';
      break;
    case 'lottery':
      params.giveType = '로또';
      break;
    case 'recommend':
      params.giveType = '지인추천';
      break;
    default:
      params.giveType = '일반';
  }

  if (reqType === 'give') {
    params.eventType = `${params.senderId} ▶ ${params.receiverId}`;
  } else if (reqType === 'take') {
    params.eventType = `${params.receiverId} ▶ ${params.senderId}`;
  }

  const historyQuery = mybatisMapper.getStatement('bank', `insert${capitalize(reqType)}History`, params, sqlFormat);
  const senderBalanceQuery = mybatisMapper.getStatement('bank', `updateSender${capitalize(reqType)}Balance`, params, sqlFormat);
  const receiverBalanceQuery = mybatisMapper.getStatement('bank', `updateReceiver${capitalize(reqType)}Balance`, params, sqlFormat);
  const senderLogQuery = mybatisMapper.getStatement('bank', `insert${capitalize(reqType)}SenderBalanceLog`, params, sqlFormat);
  const receiverLogQuery = mybatisMapper.getStatement('bank', `insert${capitalize(reqType)}ReceiverBalanceLog`, params, sqlFormat);

  await conn.beginTransaction();
  await conn.query(historyQuery);
  await conn.query(senderBalanceQuery);
  await conn.query(receiverBalanceQuery);
  await conn.query(senderLogQuery);
  await conn.query(receiverLogQuery);

  if (receiverType === 4) {
    const transactionQuery = mybatisMapper.getStatement('bank', `update${capitalize(reqType)}Transaction`, params, sqlFormat);
    await conn.query(transactionQuery);
  }

  await conn.commit();
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// #endregion

// #region 입출금 관련 함수
async function getData(res, params) {
  params.agentType = params.type;

  let conn = await pool.getConnection();
  let getData = mybatisMapper.getStatement('bank', params.sqlType, params, sqlFormat);

  try {
    let result = await conn.query(getData);
    result = JSONbig.stringify(result);
    result = JSONbig.parse(result);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function updateState(res, params, type) {
  let sqlType = type == 'deposit' ? 'updateDepositStatus' : 'updateWithdrawStatus';

  let conn = await pool.getConnection();
  let query = mybatisMapper.getStatement('bank', sqlType, params, sqlFormat);

  // if (sqlType == 'updateDepositStatus') {
  //   console.log('입금상태 변경');
  // } else if (sqlType == 'updateWithdrawStatus') {
  //   console.log('출금상태 변경');
  // }

  try {
    await conn.query(query);
    offAlram();
    res.send('변경완료');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function offAlram() {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('socket', 'offAlram', {}, sqlFormat);

  try {
    await conn.query(sql);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function updateReqstate(params) {
  let conn = await pool.getConnection();
  let query = mybatisMapper.getStatement('bank', 'updateReqState', params, sqlFormat);

  try {
    await conn.query(query);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function makeTransactionId() {
  var now = new Date();
  var year = now.getFullYear().toString().slice(-2); // YY
  var month = String(now.getMonth() + 1).padStart(2, '0'); // MM
  var day = String(now.getDate()).padStart(2, '0'); // DD
  var hours = String(now.getHours()).padStart(2, '0'); // HH
  var minutes = String(now.getMinutes()).padStart(2, '0'); // mm
  var seconds = String(now.getSeconds()).padStart(2, '0'); // ss

  return year + month + day + hours + minutes + seconds;
}

async function confirmDepositRequest(res, params) {
  let status;
  let asset;
  let memo;
  let confirmTime;
  let log;
  let conn = await pool.getConnection();

  try {
    let bonusStateSql = mybatisMapper.getStatement('bank', 'checkBonusState', params, sqlFormat);
    let bonusStateResult = await conn.query(bonusStateSql);
    let bonusState = bonusStateResult[0].bonusState;

    if (bonusState === 1) {
      switch (params.bonusType) {
        case '0':
          params.confirmStatus = '입금승인';
          params.bonusType = 0;
          break;
        case '1':
          params.confirmStatus = '입금승인(매일 첫충전)';
          params.bonusType = 3;
          break;
        case '2':
          params.confirmStatus = '입금승인(가입 첫충전)';
          params.bonusType = 4;
          break;
        case '3':
          params.confirmStatus = '입금승인(재충전)';
          params.bonusType = 3;
          break;
        case '4':
          params.confirmStatus = '입금승인(가입 재충전)';
          params.bonusType = 4;
      }
    } else {
      params.confirmStatus = '입금승인';
      params.bonusType = 0;
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (conn) conn.release();
  }

  params.타입 = '입금';
  params.transactionId = 'D' + makeTransactionId();
  status = mybatisMapper.getStatement('bank', 'updateDepositStatus', params, sqlFormat);
  asset = mybatisMapper.getStatement('bank', 'updateAssetDepositConfirm', params, sqlFormat);
  memo = mybatisMapper.getStatement('bank', 'insertDepositMemo', params, sqlFormat);
  confirmTime = mybatisMapper.getStatement('bank', 'confirmDepositTime', params, sqlFormat);
  log = mybatisMapper.getStatement('bank', 'insertConfirmDepositLog', params, sqlFormat);
  updateBonus = mybatisMapper.getStatement('bank', 'updateBonus', params, sqlFormat);

  let apiResult;
  if (params.type == 4) {
    apiResult = await api.requestAsset(params);

    if (apiResult.status !== 200) {
      let errMsg = `입금승인 실패: ${apiResult.response.data.message}`;
      console.log(errMsg);
      res.send(false);
      return;
    }

    if (api == 'hl') {
      params.transactionId = apiResult.data.transaction_id;
    }
  }

  if (params.type != 4 || (params.type == 4 && apiResult.status == 200)) {
    try {
      await conn.beginTransaction();
      await conn.query(status);
      await conn.query(asset);
      await conn.query(memo);
      await conn.query(confirmTime);
      await conn.query(log);
      await conn.commit();

      if (params.타입 == '입금') {
        await conn.query(updateBonus);
        let confirmMsg = await updateEventState(params.id);
        socket.emit('to_user', { id: params.id, type: 'confirmDeposit', msg: confirmMsg });

        //todo 아래 주석 이벤트.js 코드로 이전
        // let { isAttendance, attendanceMsg } = await checkAttendance(params);
        // console.log('출석여부: ', isAttendance);
        // console.log('출석메세지: ', attendanceMsg);
        // if (isAttendance) {
        //   socket.emit('to_user', { id: params.id, type: 'confirmDepositAttendant', msg: attendanceMsg });
        // } else {
        //   socket.emit('to_user', { id: params.id, type: 'confirmDeposit' });
        // }
      }

      if (params.type == 4) {
        await insertAssetTransId(params);
      }
      await insertLineAsset(params);
      console.log(`${params.타입}승인 성공`);
      params.bankState = 'n';
      updateReqstate(params);
      res.send(true);
    } catch (e) {
      console.log(e);
      console.log(`${params.타입}승인 실패`);
      return false;
    } finally {
      if (conn) conn.release();
    }
  } else {
    socket.emit('error', `${params.타입}신청 응답오류`);
    res.send(`${params.타입}요청 실패`);
  }
}

async function updateEventState(id) {
  let conn = await pool.getConnection();
  let confirmMsg = `<h3 class="mb-4">신청하신 입금요청이 처리되었습니다</h3>`;

  try {
    let params = { id: id };

    const stateSql = mybatisMapper.getStatement('setting', 'getAttendanceState', null, sqlFormat);
    const [{ attEventAmount }] = await conn.query(stateSql);

    const ckeckEventState = mybatisMapper.getStatement('user', 'ckeckEventState', params, sqlFormat);
    const [{ attendance_state, lotto_state }] = await conn.query(ckeckEventState);
    params.attendance_state = attendance_state;
    params.lotto_state = lotto_state;

    let { todayDepositSum, weeklyDepositSum } = await getDepositSums(id);

    if (attendance_state == 0 && todayDepositSum >= attEventAmount && process.env.EVENT_ATTENDANCE == 1) {
      params.attendance_state = 1;
      confirmMsg += `<h3 class="mt-3">📌 당일 출석체크 조건 충족 📌</h3>`;
    }

    //todo 로또 입금충족액 정해야함
    if (lotto_state == 0 && weeklyDepositSum >= 300000) {
      params.lotto_state = 1;
      // confirmMsg += `<h3 class="mt-3">💰 이번주 로또 참여조건 충족 💰</div>`;
    }

    let updateEventState = mybatisMapper.getStatement('user', 'updateEventState', params, sqlFormat);
    await conn.query(updateEventState);

    return confirmMsg;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function getDepositSums(id) {
  let conn = await pool.getConnection();
  let { start, end } = getWeeklyRange();
  let params = { id: id };
  params.weeklyStart = start;
  params.weeklyEnd = end;

  let todayDepositSql = mybatisMapper.getStatement('bank', 'getTodayDepositSum', params, sqlFormat);
  let weeklyDepositSql = mybatisMapper.getStatement('bank', 'getWeeklyDepositSum', params, sqlFormat);

  try {
    let todayDepositResult = await conn.query(todayDepositSql);
    let todayDepositSum = todayDepositResult[0].today_deposit_sum;

    let weeklyDepositResult = await conn.query(weeklyDepositSql);
    let weeklyDepositSum = weeklyDepositResult[0].weekly_deposit_sum;

    return {
      todayDepositSum: todayDepositSum,
      weeklyDepositSum: weeklyDepositSum,
    };
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}

function getWeeklyRange() {
  const now = new Date();
  const currentDay = now.getDay();
  const saturday = 6; // JavaScript에서 주의 날짜는 0(일요일)부터 6(토요일)입니다.

  // 지난 주 토요일 오후 8시 계산
  let lastSaturday = new Date(now);
  lastSaturday.setDate(now.getDate() - currentDay - 1);
  lastSaturday.setHours(20, 0, 0, 0);

  // 이번 주 토요일 저녁 7시 계산
  let thisSaturday = new Date(now);
  thisSaturday.setDate(now.getDate() + (saturday - currentDay));
  thisSaturday.setHours(19, 0, 0, 0);

  return { start: lastSaturday, end: thisSaturday };
}

async function confirmWithdrawRequest(params) {
  let status;
  let asset;
  let memo;
  let confirmTime;
  let log;
  let conn = await pool.getConnection();

  bonusType = await getUserBonusType(params);
  //todo 보너스 타입이 '재충전'일 때 출금 승인 시 보너스 지급 해제 됨. 정의 필요
  params.bonusType = 0;

  params.타입 = '출금';
  params.transactionId = 'W' + makeTransactionId();
  status = mybatisMapper.getStatement('bank', 'updateWithdrawStatus', params, sqlFormat);
  asset = mybatisMapper.getStatement('bank', 'updateAssetWithdrawConfirm', params, sqlFormat);
  memo = mybatisMapper.getStatement('bank', 'insertWithdrawMemo', params, sqlFormat);
  confirmTime = mybatisMapper.getStatement('bank', 'confirmWithdrawTime', params, sqlFormat);
  log = mybatisMapper.getStatement('bank', 'insertConfirmWithdrawLog', params, sqlFormat);
  updateBonus = mybatisMapper.getStatement('bank', 'updateBonus', params, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(status);
    await conn.query(asset);
    await conn.query(memo);
    await conn.query(confirmTime);
    await conn.query(log);
    await conn.query(updateBonus);
    await conn.commit();

    socket.emit('to_user', { id: params.id, type: 'confirmWithdraw' });
    await insertLineAsset(params);
    console.log(`${params.타입}승인 성공`);
    params.bankState = 'n';
    updateReqstate(params);
    return true;
  } catch (e) {
    console.log(e);
    console.log(`${params.타입}승인 실패`);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

async function cancelConfirm(res, params, type) {
  let status;
  let asset;
  let memo;
  let log;
  let conn = await pool.getConnection();

  if (type == 'deposit') {
    params.requestType = '입금';
    status = mybatisMapper.getStatement('bank', 'updateDepositConfirmCancel', params, sqlFormat);
    asset = mybatisMapper.getStatement('bank', 'updateAssetDepositCancel', params, sqlFormat);
    memo = mybatisMapper.getStatement('bank', 'insertDepositMemo', params, sqlFormat);
    confirmTime = mybatisMapper.getStatement('bank', 'confirmDepositTime', params, sqlFormat);
    log = mybatisMapper.getStatement('bank', 'insertCancelDepositLog', params, sqlFormat);
  } else if (type == 'withdraw') {
    params.requestType = '출금';
    status = mybatisMapper.getStatement('bank', 'updateWithdrawConfirmCancel', params, sqlFormat);
    asset = mybatisMapper.getStatement('bank', 'updateAssetWithdrawCancel', params, sqlFormat);
    memo = mybatisMapper.getStatement('bank', 'insertWithdrawMemo', params, sqlFormat);
    confirmTime = mybatisMapper.getStatement('bank', 'confirmWithdrawTime', params, sqlFormat);
    log = mybatisMapper.getStatement('bank', 'insertCancelWithdrawLog', params, sqlFormat);
  }

  params.타입 = params.타입 == '입금' ? '출금' : '입금';

  //$ API 모듈 사용
  let apiResult;

  if (params.userType == 4) {
    apiResult = await api.requestAsset(params);

    if (apiResult.status !== 200) {
      let errMsg = `${params.타입}승인취소 실패: ${apiResult.response.data.message}`;
      console.log(errMsg);
      res.send(errMsg);
      return;
    }
  }

  if (params.userType != 4 || (params.userType == 4 && apiResult.status == 200)) {
    try {
      await conn.beginTransaction();
      await conn.query(status);
      await conn.query(asset);
      await conn.query(memo);
      await conn.query(confirmTime);
      await conn.query(log);
      await conn.commit();

      params.타입 = params.타입 == '입금' ? '입금취소' : '출금취소';
      await insertLineAsset(params);
      console.log(`${params.타입}승인취소 성공`);
      res.send(`${params.타입}승인취소 성공`);
    } catch (e) {
      console.log(e);
      console.log(`${params.타입}승인취소 실패`);
      res.send(`${params.타입}승인취소 성공`);
      return done(e);
    } finally {
      if (conn) return conn.release();
    }
  } else {
    socket.emit('error', '취소신청API 응답오류');
    return;
  }
}

async function cancelRequest(res, params, type) {
  let status;
  let memo;
  let conn = await pool.getConnection();
  let confirmMsg;

  if (type == 'cancelDeposit') {
    params.타입 = '입금';
    status = mybatisMapper.getStatement('bank', 'updateDepositCancel', params, sqlFormat);
    memo = mybatisMapper.getStatement('bank', 'insertDepositMemo', params, sqlFormat);
    confirmTime = mybatisMapper.getStatement('bank', 'confirmDepositTime', params, sqlFormat);
    confirmMsg = `<h3 class="mb-4">신청하신 입금요청이 취소되었습니다</h3>`;
  } else if (type == 'cancelWithdraw') {
    params.타입 = '출금';
    status = mybatisMapper.getStatement('bank', 'updateWithdrawCancel', params, sqlFormat);
    asset = mybatisMapper.getStatement('bank', 'rollbackWithdrawRequestBalance', params, sqlFormat);
    memo = mybatisMapper.getStatement('bank', 'insertWithdrawMemo', params, sqlFormat);
    confirmTime = mybatisMapper.getStatement('bank', 'confirmWithdrawTime', params, sqlFormat);
    confirmMsg = `<h3 class="mb-4">신청하신 출금요청이 취소되었습니다</h3>`;
  }

  try {
    if (type == 'cancelDeposit') {
      await conn.beginTransaction();
      await conn.query(status);
      await conn.query(memo);
      await conn.query(confirmTime);
      await conn.commit();

      socket.emit('to_user', { id: params.id, type: 'cancelDeposit', msg: confirmMsg });
    } else if (type == 'cancelWithdraw') {
      if (params.userType == 4) {
        params.type = '출금취소';
        let apiResult = await api.requestAsset(params);

        if (apiResult.status == 200) {
          await conn.beginTransaction();
          await conn.query(status);
          await conn.query(asset);
          await conn.query(memo);
          await conn.query(confirmTime);
          await conn.commit();

          socket.emit('to_user', { id: params.id, type: 'cancelWithdraw', msg: confirmMsg });
        } else {
          console.log('출금취소API 응답오류');
          res.send(`[${params.타입}취소] 실패 / API 응답오류`);
          return;
        }
      } else {
        await conn.beginTransaction();
        await conn.query(status);
        await conn.query(asset);
        await conn.query(memo);
        await conn.query(confirmTime);
        await conn.commit();
      }
    }

    socket.emit('checkIcon', type);
    console.log(`[${params.타입}취소] 성공`);
    params.bankState = 'n';
    updateReqstate(params);
    res.send(`[${params.타입}취소] 성공`);
  } catch (e) {
    console.log(e);
    console.log(`${params.타입}취소 실패`);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function insertLineAsset(params) {
  let conn = await pool.getConnection();
  let hierarchySql = mybatisMapper.getStatement('bank', 'agentHierarchy', params, sqlFormat);

  try {
    let hierarchy = await conn.query(hierarchySql);
    let user = await getUserId(params.id);
    // let filteredData = hierarchy[0].filter((obj) => obj.user_id !== user[0].user_id);
    for (agent of hierarchy[0]) {
      let agentParams = { user_id: agent.user_id, reqMoney: params.reqMoney };
      let updateDeposit = mybatisMapper.getStatement('bank', 'updateLineDeposit', agentParams, sqlFormat);
      let updateWithdraw = mybatisMapper.getStatement('bank', 'updateLineWithdraw', agentParams, sqlFormat);
      let rollbackDeposit = mybatisMapper.getStatement('bank', 'rollbackLineDeposit', agentParams, sqlFormat);
      let rollbackWithdraw = mybatisMapper.getStatement('bank', 'rollbackLineWithdraw', agentParams, sqlFormat);
      try {
        if (params.타입 == '입금') {
          await conn.query(updateDeposit);
        } else if (params.타입 == '출금') {
          await conn.query(updateWithdraw);
        } else if (params.타입 == '입금취소') {
          await conn.query(rollbackDeposit);
        } else if (params.타입 == '출금취소취소') {
          await conn.query(rollbackWithdraw);
        }
      } catch (e) {
        console.log(e);
        return done(e);
      } finally {
        if (conn) conn.release();
      }
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function getUserId(id) {
  let params = { id: id };
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('bank', 'getUserId', params, sqlFormat);

  try {
    let user_id = await conn.query(sql);
    return user_id;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function insertAssetTransId(params) {
  let conn = await pool.getConnection();
  let assetParams = params;
  let apiTransId;
  if (params.타입 == '입금') {
    apiTransId = mybatisMapper.getStatement('bank', 'insertDepositId', assetParams, sqlFormat);
  } else if (params.타입 == '출금') {
    apiTransId = mybatisMapper.getStatement('bank', 'insertWithdrawId', assetParams, sqlFormat);
  }

  try {
    let result = await conn.query(apiTransId);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function offAlram() {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('socket', 'offAlram', {}, sqlFormat);

  try {
    await conn.query(sql);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getUserBonusType(params) {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('bank', 'getUserBonusType', params, sqlFormat);

  try {
    let result = await conn.query(sql);
    return result[0].bonus_type;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

// #endregion

// #region 출석체크 관련함수
// 매일 자정 전일 출석체크 여부확인 후 초기화
async function resetCountinueCounter() {
  const yesterdayDate = moment().tz('Asia/Seoul').subtract(1, 'days').format('YYYY-MM-DD');

  let conn = await pool.getConnection();
  let resetCountinueCounter = mybatisMapper.getStatement('user', 'resetCountinueCounter', { yesterdayDate: yesterdayDate }, sqlFormat);
  let resetAttendanceState = mybatisMapper.getStatement('user', 'resetAttendanceState', {}, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(resetCountinueCounter);
    await conn.query(resetAttendanceState);
    await conn.commit();
    console.log('출석이벤트 연속출석 및 출석 상태 초기화 완료');
  } catch (e) {
    await conn.rollback();
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

cron.schedule('0 0 * * *', () => {
  console.log('매일 자정에 실행됩니다.');
  resetCountinueCounter();
});
// #endregion

// #region API 관련 함수
// async function checkAndSyncUserBalance(user) {
//   let dbResult = await getUserBalanceFromDB(user);
//   let sdApiResult = await sd.updateUserBalance(user);
//   let dgApiResult = await dg.updateUserBalance(user);

//   return {
//     dbBalance: dbResult,
//     sdBalance: sdApiResult.balance,
//     dgBalance: dgApiResult.balance,
//   };
// }

// async function syncUserBalance(user) {
//   let maxApiBalance = await getMaxApiBalance(user);
//   let params = { id: user, balance: maxApiBalance };

//   await updateUserBalanceInDB(params, 'updateUserBalance');
// }

// async function getMaxApiBalance(user) {
//   let sdBalance = await sd.updateUserBalance(user);
//   let dgBalance = await dg.updateUserBalance(user);

//   return Math.max(sdBalance.balance, dgBalance.balance);
// }

async function getUserBalanceFromDB(user) {
  let result = await executeDBQuery('getUserBalance', { id: user });
  return 'dbBalance', result[0].balance;
}

async function executeDBQuery(query, params) {
  let conn = await pool.getConnection();
  let statement = mybatisMapper.getStatement('bank', query, params, sqlFormat);

  try {
    return await conn.query(statement);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

// #endregion

// #region 에이전트 관련 함수
async function requestBankNum(res, params) {
  let conn = await pool.getConnection();
  let getBankNum = mybatisMapper.getStatement('bank', 'getBankNum', params, sqlFormat);

  try {
    let sqlResult = await conn.query(getBankNum);
    let agentType;
    switch (sqlResult[0].type) {
      case 0:
        agentType = '플래티넘';
        break;
      case 1:
        agentType = '골드';
        break;
      case 2:
        agentType = '실버';
        break;
      case 3:
        agentType = '브론즈';
        break;
    }

    console.log(`계좌요청: LV: ${sqlResult[0].level} / ID: ${sqlResult[0].id}  /  타입: ${agentType}`);
    res.send({ sqlResult: sqlResult, isLogin: true });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

// async function insertRequestQuery(res, type, params) {
//   console.log('insertRequestQuery', params);
//   switch (params.agentType) {
//     case 0:
//       params.agentType = '플래티넘';
//       break;
//     case 1:
//       params.agentType = '골드';
//       break;
//     case 2:
//       params.agentType = '실버';
//       break;
//     case 3:
//       params.agentType = '브론즈';
//       break;
//   }

//   let conn = await pool.getConnection();
//   let sqlType = type == 'deposit' ? 'insertReqDeposit' : 'insertReqWithdraw';
//   let insertReqSql = mybatisMapper.getStatement('bank', sqlType, params, sqlFormat);
//   let checkBankState = mybatisMapper.getStatement('bank', 'checkBankState', params, sqlFormat);

//   try {
//     let bankState = await conn.query(checkBankState);
//     console.log(bankState[0].bank_req_state);
//     if (bankState[0].bank_req_state == 'n') {
//       params.bankState = 'y';
//       updateReqstate(params);
//       if (type == 'deposit') {
//         await conn.query(insertReqSql);
//         console.log(`입금신청: ${params.agentType} / ${params.id} / ${params.reqMoney} 원`);
//         res.send({
//           request: 'success',
//           msg: '입금신청완료',
//           type: 'requestAgentDeposit',
//           userId: params.id,
//         });
//       } else if (type == 'withdraw') {
//         await conn.query(insertReqSql);
//         console.log(`출금신청: ${params.id} / ${params.reqMoney} 원`);
//         res.send({
//           request: 'success',
//           msg: '출금신청완료',
//           type: 'requestAgentWithdraw',
//           userId: params.id,
//         });
//       }
//     } else {
//       res.send({
//         request: 'fail',
//         msg: '이전 신청이 처리 중입니다',
//       });
//     }
//   } catch (e) {
//     console.log(e);
//     return done(e);
//   } finally {
//     if (conn) return conn.release();
//   }
// }

async function insertRequestQuery(res, type, params) {
  switch (params.agentType) {
    case 0:
      params.agentType = '플래티넘';
      break;
    case 1:
      params.agentType = '골드';
      break;
    case 2:
      params.agentType = '실버';
      break;
    case 3:
      params.agentType = '브론즈';
      break;
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // Start transaction

    let checkBankState = mybatisMapper.getStatement('bank', 'checkBankState', params, sqlFormat);
    let bankState = await conn.query(checkBankState);
    console.log(bankState[0].bank_req_state);

    if (bankState[0].bank_req_state == 'n') {
      params.bankState = 'y';
      updateReqstate(params);

      let sqlType = type == 'deposit' ? 'insertReqDeposit' : 'insertReqWithdraw';
      let insertReqSql = mybatisMapper.getStatement('bank', sqlType, params, sqlFormat);
      await conn.query(insertReqSql);

      if (type == 'withdraw') {
        let updateBalance = mybatisMapper.getStatement('bank', 'updateAgentBalanceForWithdraw', params, sqlFormat);
        await conn.query(updateBalance);
      }

      if (type == 'deposit') {
        console.log(`입금신청: ${params.agentType} / ${params.id} / ${params.reqMoney} 원`);
        res.send({
          request: 'success',
          msg: '입금신청완료',
          type: 'requestAgentDeposit',
          userId: params.id,
        });
      } else if (type == 'withdraw') {
        console.log(`출금신청: ${params.id} / ${params.reqMoney} 원`);
        res.send({
          request: 'success',
          msg: '출금신청완료',
          type: 'requestAgentWithdraw',
          userId: params.id,
        });
      }

      await conn.commit();
    } else {
      res.send({
        request: 'fail',
        msg: '이전 신청이 처리 중입니다',
      });
    }
  } catch (e) {
    if (conn) await conn.rollback(); // Rollback transaction in case of error
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  } finally {
    if (conn) conn.release();
  }
}

async function beforeBalanceCheck(id) {
  let conn = await pool.getConnection();
  let params = { id: id };

  let blanceInfo = mybatisMapper.getStatement('bank', 'getBalanceInfo', params, sqlFormat);

  try {
    let result = await conn.query(blanceInfo);
    return result[0];
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}
// #endregion

// #region 가상내역 관련 함수
let virtualValue;

async function scheduleVirtualDeposit() {
  let virtualSetValue = await getVirtualSetValue();
  let { virtualAutoState, depoAutoMinTime, depoAutoMaxTime } = virtualSetValue;

  depoAutoMinTime *= 60000;
  depoAutoMaxTime *= 60000;

  let depositTimeInterval = Math.floor(Math.random() * (depoAutoMaxTime - depoAutoMinTime + 1)) + depoAutoMinTime;

  setTimeout(async () => {
    let currentTime = getCurrentTime();
    if (virtualAutoState == 1) {
      await insertVirtualDepositList(virtualSetValue, currentTime);
    }
    scheduleVirtualDeposit();
  }, depositTimeInterval);
}

async function scheduleVirtualWithdraw() {
  let virtualSetValue = await getVirtualSetValue();
  let { virtualAutoState, withAutoMinTime, withAutoMaxTime } = virtualSetValue;

  withAutoMinTime *= 60000;
  withAutoMaxTime *= 60000;

  let withdrawTimeInterval = Math.floor(Math.random() * (withAutoMaxTime - withAutoMinTime + 1)) + withAutoMinTime;

  setTimeout(async () => {
    let currentTime = getCurrentTime();
    if (virtualAutoState == 1) {
      await insertVirtualWithdrawList(virtualSetValue, currentTime);
    }
    scheduleVirtualWithdraw();
  }, withdrawTimeInterval);
}

async function getVirtualSetValue() {
  let conn = await pool.getConnection();

  let checkVirtualValue = mybatisMapper.getStatement('bank', 'getVirtualSetValue', null, sqlFormat);

  try {
    virtualValue = await conn.query(checkVirtualValue);
    return virtualValue[0];
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function insertVirtualDepositList(virtualSetValue, currentTime) {
  let conn = await pool.getConnection();
  let params = {};
  let minMoney = virtualSetValue.depoAutoMinMoney;
  let maxMoney = virtualSetValue.depoAutoMaxMoney;

  params.submitTime = currentTime;
  params.randomId = generateRandomId();
  params.randomMoney = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
  params.randomMoney = Math.floor(params.randomMoney / 10000) * 10000;

  let insertVirtualDeposit = mybatisMapper.getStatement('bank', 'insertVirtualDeposit', params, sqlFormat);
  let deleteOverLimitVirtualDeposit = mybatisMapper.getStatement('bank', 'deleteOverLimitVirtualDeposit', params, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(insertVirtualDeposit);
    await conn.query(deleteOverLimitVirtualDeposit);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function insertVirtualWithdrawList(virtualSetValue, currentTime) {
  let conn = await pool.getConnection();
  let params = {};
  let minMoney = virtualSetValue.withAutoMinMoney;
  let maxMoney = virtualSetValue.withAutoMaxMoney;

  params.submitTime = currentTime;
  params.randomId = generateRandomId();
  params.randomMoney = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
  params.randomMoney = Math.floor(params.randomMoney / 10000) * 10000;

  let insertVirtualWithdraw = mybatisMapper.getStatement('bank', 'insertVirtualWithdraw', params, sqlFormat);
  let deleteOverLimitVirtualWithdraw = mybatisMapper.getStatement('bank', 'deleteOverLimitVirtualWithdraw', params, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(insertVirtualWithdraw);
    await conn.query(deleteOverLimitVirtualWithdraw);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

function generateRandomId() {
  // 알파벳 소문자를 생성하는 함수
  function generateRandomAlphaChars(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // 숫자를 생성하는 함수
  function generateRandomNumbers(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  // 알파벳 부분은 3에서 6자리 사이의 랜덤한 길이로 생성
  const alphaPartLength = Math.floor(Math.random() * 4) + 3; // 3에서 6까지의 랜덤한 정수
  const alphaPart = generateRandomAlphaChars(alphaPartLength);

  // 숫자 부분은 3에서 4자리 사이의 랜덤한 길이로 생성
  const numberPartLength = Math.floor(Math.random() * 2) + 3; // 3에서 4까지의 랜덤한 정수
  const numberPart = generateRandomNumbers(numberPartLength);

  // 최종 ID 생성
  const id = alphaPart + numberPart;

  return id;
}

// 초기 스케줄링 시작
scheduleVirtualDeposit();
scheduleVirtualWithdraw();
// #endregion

module.exports = router;
