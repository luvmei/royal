const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('mybatis-mapper');
const JSONbig = require('json-bigint');
const { route } = require('./bank');

// #region 입금 보너스
router.post('/bonus/get', (req, res) => {
  getBonusStatus(req, res);
});

router.post('/bonus/set', (req, res) => {
  setBonusState(req, res);
});

async function getBonusStatus(req, res) {
  const conn = await pool.getConnection();

  const sql = mybatisMapper.getStatement('setting', 'getBonusStatus', null, sqlFormat);

  try {
    const result = await conn.query(sql);
    res.send(result[0]);
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function setBonusState(req, res) {
  const conn = await pool.getConnection();

  const sql = mybatisMapper.getStatement('setting', 'setBonusState', req.body, sqlFormat);

  try {
    await conn.query(sql);
    res.send({ msg: '입금 보너스 설정 변경완료' });
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 레벨별 자동안내 계좌정보
router.post('/autobank/get', (req, res) => {
  getAutoBankInfo(req, res);
});

router.post('/autobank/set', (req, res) => {
  setAutoBankInfo(req, res);
});

async function getAutoBankInfo(req, res) {
  const conn = await pool.getConnection();

  const virtualAccount = mybatisMapper.getStatement('setting', 'getVirtualAccount', null, sqlFormat);
  const accountInfo = mybatisMapper.getStatement('setting', 'getAutoBankInfo', null, sqlFormat);

  try {
    await conn.beginTransaction();
    let virtualAccountState = await conn.query(virtualAccount);
    let levelAccount = await conn.query(accountInfo);
    await conn.commit();

    res.send({ levelAccounts: levelAccount, virtualAccountState: virtualAccountState[0] });
  } catch (e) {
    await conn.rollback();
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function setAutoBankInfo(req, res) {
  console.log(req.body.virtualAccount);
  let virtualBtnState = req.body.virtualAccount == 'true' ? 1 : 0;
  console.log(virtualBtnState);

  const conn = await pool.getConnection();
  const virtualAccountState = mybatisMapper.getStatement('setting', 'setVirtualAccount', { state: virtualBtnState }, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(virtualAccountState);
    for (let item of req.body.levelBankAccount) {
      const sql = mybatisMapper.getStatement('setting', 'setAutoBankInfo', item, sqlFormat);
      await conn.query(sql);
    }
    await conn.commit();
    res.send({ msg: '자동안내 계좌정보 설정 변경완료' });
  } catch (e) {
    await conn.rollback();
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

// #endregion

// #region 마진 설정
router.post('/margin/get', (req, res) => {
  getMarginState(req, res);
});

router.post('/margin/set', (req, res) => {
  setMarginState(req, res);
});

async function getMarginState(req, res) {
  const conn = await pool.getConnection();

  const sql = mybatisMapper.getStatement('setting', 'getMarginState', null, sqlFormat);

  try {
    const result = await conn.query(sql);
    res.send(result[0]);
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function setMarginState(req, res) {
  const conn = await pool.getConnection();

  const sql = mybatisMapper.getStatement('setting', 'setMarginState', req.body, sqlFormat);

  try {
    await conn.query(sql);
    res.send({ msg: '마진 설정 변경완료' });
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

// #endregion

// #region 잭팟 설정
router.post('/jackpot/get', (req, res) => {
  getJackpotState(req, res);
});

router.post('/jackpot/set', (req, res) => {
  let params = transformToNumber(req.body);
  setJackpotState(params, res);
});

async function getJackpotState(req, res) {
  const conn = await pool.getConnection();

  const sql = mybatisMapper.getStatement('setting', 'getJackpotState', null, sqlFormat);

  try {
    const result = await conn.query(sql);
    res.send(result[0]);
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function setJackpotState(params, res) {
  console.log(params);
  const conn = await pool.getConnection();
  if (params.stateRandom === 0) {
    params.setJackpot = params.manual;
  } else if (params.stateRandom == 1) {
    params.setJackpot = getRandomInt(params.min, params.max);
  }

  const sql = mybatisMapper.getStatement('setting', 'setJackpotState', params, sqlFormat);

  try {
    await conn.query(sql);
    res.send({ msg: '잭팟 설정 변경완료' });
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

const transformToNumber = (data) => {
  let transformed = {};

  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      let value = data[key].replace(/,/g, ''); // 콤마 제거
      transformed[key] = isNaN(value) ? data[key] : Number(value);
    }
  }

  return transformed;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// #endregion

// #region 로또 설정
router.post('/lotto/get', (req, res) => {
  getLottoInfo(req, res);
});

router.post('/lotto/set', (req, res) => {
  setLottoInfo(req, res);
});

async function getLottoInfo(req, res) {
  const conn = await pool.getConnection();
  const sql = mybatisMapper.getStatement('setting', 'getLottoSetting', null, sqlFormat);

  try {
    const result = await conn.query(sql);
    res.send(result[0]);
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function setLottoInfo(req, res) {
  const params = req.body;
  console.log(params);
  const conn = await pool.getConnection();
  const sql = mybatisMapper.getStatement('setting', 'setLottoSetting', params, sqlFormat);

  try {
    await conn.query(sql);
    res.end();
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

// #region 출석체크 설정
router.post('/attendance/get', (req, res) => {
  getAttendanceState(req, res);
});

router.post('/attendance/set', (req, res) => {
  setAttendanceState(req, res);
});

async function getAttendanceState(req, res) {
  const conn = await pool.getConnection();

  const stateSql = mybatisMapper.getStatement('setting', 'getAttendanceState', null, sqlFormat);
  const rewardSql = mybatisMapper.getStatement('setting', 'getAttRewardInfo', null, sqlFormat);

  try {
    const eventCount = await conn.query(stateSql);
    const rewardInfo = await conn.query(rewardSql);

    res.send({ eventAmount: eventCount[0].attEventAmount, eventCount: eventCount[0].attEventCount, rewardInfo: rewardInfo });
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function setAttendanceState(req, res) {
  const { eventAmount, eventCount, rewardValues } = req.body;

  const attSetting = {
    attEventAmount: eventAmount,
    attEventCount: eventCount,
  };

  const attRewards = [];
  for (let i = 0; i < rewardValues.length; i += 2) {
    attRewards.push({
      reward_id: i / 2 + 1,
      continueCounter: parseInt(rewardValues[i]),
      reward_amount: parseInt(rewardValues[i + 1]),
    });
  }

  const conn = await pool.getConnection();
  const attSetSql = mybatisMapper.getStatement('setting', 'setAttendanceState', attSetting, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(attSetSql);
    for (let reward of attRewards) {
      const attRewardSql = mybatisMapper.getStatement('setting', 'setAttRewardInfo', reward, sqlFormat);
      await conn.query(attRewardSql);
    }
    await conn.commit();
    res.send({ msg: '출석체크 설정 변경완료' });
  } catch (e) {
    await conn.rollback();
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 가상 입출금 내역 설정
router.post('/virtual/get', (req, res) => {
  getVirtualState(req, res);
});

router.post('/virtual/set', (req, res) => {
  setVirtualState(req, res);
});

async function getVirtualState(req, res) {
  const conn = await pool.getConnection();

  const sql = mybatisMapper.getStatement('setting', 'getVirtualState', null, sqlFormat);

  try {
    const result = await conn.query(sql);
    res.send(result[0]);
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function setVirtualState(req, res) {
  console.log(req.body);
  const conn = await pool.getConnection();

  const sql = mybatisMapper.getStatement('setting', 'setVirtualState', req.body, sqlFormat);

  try {
    await conn.query(sql);
    res.send({ msg: '가상 입출금 내역 설정 변경완료' });
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

module.exports = router;
