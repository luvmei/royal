const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('../mybatis-mapper');
const JSONbig = require('json-bigint');
const moment = require('moment-timezone');
const axios = require('axios');
const api = require(`../public/js/api/${process.env.API_TYPE}`);
// #region 테이블 전송
router.post('/table', (req, res) => {
  getData(res, req.body.type);
});

async function getData(res, type, params = {}) {
  let conn = await pool.getConnection();
  let getLogData = mybatisMapper.getStatement('game', type, params, sqlFormat);

  try {
    let result = await conn.query(getLogData);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 파싱 설정
router.post('/parsing', (req, res) => {
  if (req.body.isUser) {
    changeUserParsingType(req.body, res);
  } else {
    changeParsingType(req.body, res);
  }
});

async function changeParsingType(params, res) {
  let conn = await pool.getConnection();
  let changeParsingSet;

  if (params.pType === '1') {
    params.pSet = 0;
  } else if (params.pType === '2') {
    params.pSet = 1;
  }

  let changeParsingType = mybatisMapper.getStatement('game', 'changeParsingType', params, sqlFormat);

  if (params.pType !== '0') {
    changeParsingSet = mybatisMapper.getStatement('game', 'changeParsingSet', params, sqlFormat);
  }

  const msgMapping = {
    0: '유저별 설정',
    1: '일괄 정품설정 (SD)',
    2: '일괄 파싱설정 (DG)',
  };

  try {
    await conn.query(changeParsingType);

    if (params.pType !== '0') {
      await conn.query(changeParsingSet);
    }

    res.send({ msg: msgMapping[params.pType] });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function changeUserParsingType(params, res) {
  let isChangePossible = await checkPtypeSetting();
  if (!isChangePossible) {
    res.send({ msg: '일괄 파싱설정이 아닌 경우에만 유저별 설정이 가능합니다.', isChange: false });
    return;
  }

  if (params.pType == '0') {
    params.pType = '1';
  } else if (params.pType == '1') {
    params.pType = '0';
  }

  let conn = await pool.getConnection();
  let changeUserParsingType = mybatisMapper.getStatement('game', 'changeUserParsingType', params, sqlFormat);

  const msgMapping = {
    0: '정',
    1: '파',
  };

  try {
    await conn.query(changeUserParsingType);
    res.send({ msg: msgMapping[params.pType], isChange: true });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function checkPtypeSetting() {
  let conn = await pool.getConnection();
  let checkPtypeSetting = mybatisMapper.getStatement('game', 'checkPtypeSetting', {}, sqlFormat);

  try {
    let result = await conn.query(checkPtypeSetting);
    if (result[0].p_type == 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}
// #endregion

// #region 게임 및 프로바이더 노출설정
//? region 개별 노출 설정
router.post('/display', (req, res) => {
  updateDisplayState(req.body, res);
});

async function updateDisplayState(params, res) {
  let conn = await pool.getConnection();
  let updateDisplayState = mybatisMapper.getStatement('game', 'updateDisplayState', params, sqlFormat);

  try {
    await conn.query(updateDisplayState);
    res.send({ msg: '게임노출 업데이트 완료' });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 프로바이더 리스트
router.post('/providerlist', (req, res) => {
  getProviderList(res);
});

async function getProviderList(res) {
  let getProviderList;
  let conn = await pool.getConnection();

  if (process.env.API_TYPE === 'hl') {
    getProviderList = mybatisMapper.getStatement('game', 'getHlProviderList', {}, sqlFormat);
  } else if (process.env.API_TYPE === 'go') {
    getProviderList = mybatisMapper.getStatement('game', 'getGoProviderList', {}, sqlFormat);
  }

  try {
    let result = await conn.query(getProviderList);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

let timers = [];
//? 노출 및 점검 예약 요청
router.post('/providerdisplay', async (req, res) => {
  console.log(req.body);

  if (req.body.displayState) {
    let result = await updateProviderDisplayState(req.body);
    res.send({ provider: true, msg: result });
  }
  if (req.body.reserve) {
    let now = new Date();
    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.endDate);
    let startMargin = startDate - now;
    let endMargin = endDate - now;

    console.log(startMargin);
    console.log(endMargin);

    if (startMargin < 300000) {
      res.send({ msg: `시작시간을 현재시간 보다 5분 이후로 설정해주세요`, reserved: false });
      return;
    } else if (endMargin > 172800000) {
      res.send({ msg: '종료시간을 48시간 이내로 다시 설정해주세요', reserved: false });
      return;
    }

    let result = await reserveMaintenance(req.body);
    res.send({ reserved: true, startTimer: result[0], endTimer: result[1], msg: '프로바이더 점검 예약 완료' });
  }
  if (req.body.cancelReserve) {
    await cancelReserve(req.body, res);
  }
});

//? 프로바이더 숨기기/감추기 설정
async function updateProviderDisplayState(params) {
  let conn = await pool.getConnection();
  let updateProviderDisplayState;

  params.containsAll = params.providerName.includes('all');
  updateProviderDisplayState = mybatisMapper.getStatement('game', 'updateProviderDisplayState', params, sqlFormat);

  try {
    await conn.query(updateProviderDisplayState);
    if (params.displayState == 'show') {
      return '프로바이더 보이기 완료';
    } else {
      return '프로바이더 감추기 완료';
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

//? 프로바이더 점검 예약
async function reserveMaintenance(params) {
  let conn = await pool.getConnection();
  let reserveMaintenance;
  let deleteReserve;

  let now = new Date();
  let start = new Date(params.startDate);
  let end = new Date(params.endDate);

  let startDelay = start.getTime() - now.getTime();
  let endDelay = end.getTime() - now.getTime();

  params.containsAll = params.providerName.includes('all');
  reserveMaintenance = mybatisMapper.getStatement('game', 'reserveMaintenance', params, sqlFormat);
  deleteReserve = mybatisMapper.getStatement('game', 'cancelReserve', params, sqlFormat);

  try {
    await conn.query(reserveMaintenance);

    // startDelay가 음수이면 startDate가 이미 지난 것이므로, 즉시 실행하거나 오류를 처리합니다.
    if (startDelay < 0) {
      console.log('시작시간이 이미 지났습니다. 즉시 실행합니다.');
      params.displayState = 'hide';
      updateProviderDisplayState(params);
    } else {
      const startTimer = setTimeout(() => {
        params.displayState = 'hide';
        updateProviderDisplayState(params);
      }, startDelay);
      timers.push(startTimer);
    }

    // endDelay가 음수이면 endDate가 이미 지난 것이므로, 오류를 처리합니다.
    if (endDelay < 0) {
      console.log('종료시간이 이미 지났습니다. 즉시 실행합니다.');
      params.displayState = 'show';
      updateProviderDisplayState(params);
    } else {
      const endTimer = setTimeout(() => {
        params.displayState = 'show';
        updateProviderDisplayState(params);
        for (let timerId of timers) {
          clearTimeout(timerId);
        }
        timers = [];
        conn.query(reserveMaintenance);
      }, endDelay);
      timers.push(endTimer);
    }

    return [startDelay, endDelay];
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

//? 프로바이더 점검 예약 취소
async function cancelReserve(params, res) {
  let conn = await pool.getConnection();
  let cancelReserve;

  cancelReserve = mybatisMapper.getStatement('game', 'cancelReserve', params, sqlFormat);

  try {
    await conn.query(cancelReserve);
    for (let timerId of timers) {
      clearTimeout(timerId);
    }
    timers = [];
    res.send({ cancel: true, msg: `프로바이더 점검 예약 취소 완료` });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 게임리스트
//? 게임리스트 업데이트
router.post('/updategamelist', (req, res) => {
  api.updateGameList();
  // unique.updateGameList(res);
  res.send({ msg: '모든 프로바이더 게임리스트 업데이트 완료' });
});
// #endregion

module.exports = router;
