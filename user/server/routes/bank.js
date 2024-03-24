const express = require('express');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
const mybatisMapper = require('../mybatis-mapper');
const { pool, sqlFormat } = require('../mariadb');
const moment = require('moment-timezone');
const JSONbig = require('json-bigint');
const api = require(`../../client/public/js/api/${process.env.API_TYPE}`);

// #region 미들웨어
router.use(session({ secret: 'dog_cat', resave: true, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session());

// #endregion

// #region 라우트
router.post('/table', function (req, res) {
  if (!req.user) {
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    let params = { id: req.user[0].id, type: req.body.type };
    getTableData(res, params);
  }
});

async function getTableData(res, params) {
  let conn = await pool.getConnection();
  let historySql;

  if (params.type == 'depositHistory') {
    historySql = mybatisMapper.getStatement('bank', `getDepositHistory`, params, sqlFormat);
  } else if (params.type == 'withdrawHistory') {
    historySql = mybatisMapper.getStatement('bank', `getWithdrawHistory`, params, sqlFormat);
  } else if (params.type == 'rewardHistory') {
    historySql = mybatisMapper.getStatement('bank', `getRewardHistory`, params, sqlFormat);
  } else if (params.type == 'recommendHistory') {
    historySql = mybatisMapper.getStatement('user', `getRecommendHistory`, params, sqlFormat);
  }

  try {
    let result = await conn.query(historySql);
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

router.post('/banknum', function (req, res) {
  if (req.user == undefined) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    let params = { id: req.user[0].id };
    requestBankNum(res, params);
  }
});

router.post('/userbankinfo', function (req, res) {
  if (req.user == undefined) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    let params = { id: req.user[0].id };
    requestUserBankInfo(res, params);
  }
});

async function requestUserBankInfo(res, params) {
  let conn = await pool.getConnection();
  let getUserBankInfo = mybatisMapper.getStatement('bank', 'getUserBankInfo', params, sqlFormat);

  try {
    let sqlResult = await conn.query(getUserBankInfo);
    res.send({ userBankInfo: sqlResult[0] });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/deposit', function (req, res) {
  if (!req.user) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else if (req.body.reqMoney <= 0) {
    res.send({ msg: '신청금액을 확인하세요.', isValid: false });
  } else {
    req.body.id = req.user[0].id;
    req.body.time = getCurrentTime();
    req.body.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
    req.body.type = '입금';
    req.body.balance = req.user[0].balance;
    let params = req.body;
    insertRequestQuery(res, 'deposit', params);
  }
});

router.post('/withdraw', function (req, res) {
  if (!req.user) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else if (req.body.reqMoney <= 0) {
    res.send({ msg: '신청금액을 확인하세요.', isValid: false });
  } else {
    req.body.id = req.user[0].id;
    req.body.time = getCurrentTime();
    req.body.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
    req.body.type = '출금';
    req.body.balance = req.user[0].balance;
    let params = req.body;
    insertRequestQuery(res, 'withdraw', params);
  }
});

router.post('/password', function (req, res) {
  if (!req.user) {
    console.log('비정상 접근');
    res.send({ msg: '비정상적인 접근입니다.', isLogin: false });
  } else {
    let params = { id: req.user[0].id, password: req.body.password };
    checkWithdrawPassword(res, params);
  }
});

async function checkWithdrawPassword(res, params) {
  let conn = await pool.getConnection();
  let checkPassword = mybatisMapper.getStatement('bank', 'checkPassword', params, sqlFormat);

  try {
    let withdrawPassword = await conn.query(checkPassword);
    if (params.password == withdrawPassword[0].bank_pw) {
      res.send({ isValid: true });
    } else {
      res.send({ isValid: false });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/modal', function (req, res) {
  let result = req.user ? true : false;
  res.send(result);
});

router.post('/bonus', async function (req, res) {
  if (req.user) {
    let bonus = await checkDepositBonus(req.user[0]);
    res.send(bonus);
  } else {
    res.send({ bonusType: 0 });
  }
});

router.post('/jackpot', function (req, res) {
  getJackpotData(req.body, res);
});

router.post('/bankdata', function (req, res) {
  getVirtualTableData(res);
});

router.post('/asset', function (req, res) {
  let params = { id: req.user[0].id };
  getUserAsset(res, params);
});

router.post('/reward', function (req, res) {
  let params = {
    id: req.user[0].id,
    balance: req.user[0].balance,
    point: req.user[0].point,
    reqPoint: parseInt(req.body.reqPoints),
    time: getCurrentTime(),
    type: '포인트 전환',
  };
  if (params.point != params.reqPoint) {
    res.send(`포인트 전환이 실패하였습니다 (포인트 불일치)`);
  }
  exchangeReward(res, params);
});
// #endregion

// #region 관련 함수
async function getJackpotData(params, res) {
  let conn = await pool.getConnection();
  let jackpotSql = mybatisMapper.getStatement('bank', 'getJackpot', params, sqlFormat);

  try {
    let jackpotData = await conn.query(jackpotSql);
    res.send({ jackpotData: jackpotData[0].currentJackpot });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function requestBankNum(res, params) {
  let conn = await pool.getConnection();
  const getVirtualState = mybatisMapper.getStatement('bank', 'getVirtualState', params, sqlFormat);
  let getBankNum = mybatisMapper.getStatement('bank', 'getBankNum', params, sqlFormat);

  try {
    let virtualState = await conn.query(getVirtualState);

    if (virtualState[0].virtualAccountState == 1) {
      res.send({ virtualMsg: '입금계좌는 고객센터로 문의해주세요', isLogin: true, isVirtual: true });
      return;
    }

    let sqlResult = await conn.query(getBankNum);
    console.log(`계좌요청: ${sqlResult[0].id}  /  LV ${sqlResult[0].level}`);
    res.send({ sqlResult: sqlResult, isLogin: true, isVirtual: false });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function insertRequestQuery(res, type, params) {
  let reqState;
  let bonus = await checkDepositBonus(params);
  params.bonusType = bonus.bonus_type;
  params.bonusState = bonus.bonusState;
  params.joinBonusRate = bonus.joinBonusRate;
  params.joinEveryBonusRate = bonus.joinEveryBonusRate;
  params.dailyBonusRate = bonus.dailyBonusRate;
  params.everyBonusRate = bonus.everyBonusRate;

  if (params.bonusState == 1) {
    if (params.bonusType == 0) {
      params.bonusMoney = 0;
    } else if (params.bonusType == 1) {
      params.bonusMoney = (params.reqMoney * bonus.dailyBonusRate) / 100;
    } else if (params.bonusType == 2) {
      params.bonusMoney = (params.reqMoney * bonus.joinBonusRate) / 100;
    } else if (params.bonusType == 3) {
      params.bonusMoney = (params.reqMoney * bonus.everyBonusRate) / 100;
    } else if (params.bonusType == 4) {
      params.bonusMoney = (params.reqMoney * bonus.joinEveryBonusRate) / 100;
    }
  } else {
    params.bonusMoney = 0;
  }

  let conn = await pool.getConnection();
  let sqlType = type == 'deposit' ? 'insertReqDeposit' : 'insertReqWithdraw';
  let insertReqSql = mybatisMapper.getStatement('bank', sqlType, params, sqlFormat);
  let insertReqState = mybatisMapper.getStatement('bank', 'insertReqState', params, sqlFormat);

  try {
    reqState = await checkRequestState(params);

    if (reqState == 'd') {
      res.send({
        msg: `<h3>이미 입금신청 중입니다</h3>
      <h4>나중에 다시 신청해 주세요</h4>`,
        type: 'requestUserDeposit',
        userId: params.id,
        reqState: 'd',
      });
    } else if (reqState == 'w') {
      res.send({
        msg: `<h3>이미 출금신청 중입니다</h3>
      <h4>나중에 다시 신청해 주세요</h4>`,
        type: 'requestUserWithdraw',
        userId: params.id,
        reqState: 'w',
      });
    } else {
      if (type == 'deposit') {
        await conn.query(insertReqSql);
        await conn.query(insertReqState);
        console.log(`[입금신청]: ${params.id}  /  ${parseInt(params.reqMoney).toLocaleString('ko-KR')} 원`);
        res.send({ msg: '입금이 신청되었습니다', type: 'requestUserDeposit', userId: params.id, reqState: 'n', isValid: true });
      } else if (type == 'withdraw') {
        let apiWithdraw = await api.requestAssetWithdraw(params);
        params.transactionId = apiWithdraw.data.transaction_id;
        insertReqSql = mybatisMapper.getStatement('bank', 'insertReqWithdraw', params, sqlFormat);
        await conn.query(insertReqSql);
        await conn.query(insertReqState);
        console.log(`[출금신청]: ${params.id}  /  ${parseInt(params.reqMoney).toLocaleString('ko-KR')} 원`);
        res.send({ msg: '출금이 신청되었습니다', type: 'requestUserWithdraw', userId: params.id, reqState: 'n', isValid: true });
      }
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function checkDepositBonus(params) {
  let conn = await pool.getConnection();
  let checkDepositBonus = mybatisMapper.getStatement('bank', 'checkDepositBonus', params, sqlFormat);

  try {
    let result = await conn.query(checkDepositBonus);
    return result[0];
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) conn.release();
  }
}

async function checkRequestState(params) {
  let reqState;

  let conn = await pool.getConnection();
  let checkReqState = mybatisMapper.getStatement('bank', 'checkReqState', params, sqlFormat);

  try {
    reqState = await conn.query(checkReqState);
    reqState = reqState[0].bank_req_state;
    return reqState;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function getVirtualTableData(res) {
  let conn = await pool.getConnection();
  let getDepositData = mybatisMapper.getStatement('bank', 'getVirtualDepositData', {}, sqlFormat);
  let getWithdrawData = mybatisMapper.getStatement('bank', 'getVirtualWithdrawData', {}, sqlFormat);

  try {
    await conn.beginTransaction();
    let depositData = await conn.query(getDepositData);
    let withdrawData = await conn.query(getWithdrawData);
    await conn.commit();

    depositData = formatData(depositData);
    withdrawData = formatData(withdrawData);

    res.send({ depositData: depositData, withdrawData: withdrawData });
  } catch (e) {
    await conn.rollback();
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getUserAsset(res, params) {
  let conn = await pool.getConnection();
  let getUserAsset = mybatisMapper.getStatement('bank', 'getUserAsset', params, sqlFormat);

  try {
    let result = await conn.query(getUserAsset);
    res.send(result[0]);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function exchangeReward(res, params) {
  let conn = await pool.getConnection();
  let exchangeReward = mybatisMapper.getStatement('bank', 'exchangeReward', params, sqlFormat);
  let exchangePointLog = mybatisMapper.getStatement('bank', 'exchangePointLog', params, sqlFormat);
  let exchangeBalanceLog = mybatisMapper.getStatement('bank', 'exchangeBalanceLog', params, sqlFormat);

  try {
    let apiStatus = await api.exchangePointToBalance(params);
    if (apiStatus == 200) {
      console.log('포인트 전환 성공');
      await conn.beginTransaction();
      await conn.query(exchangeReward);
      await conn.query(exchangePointLog);
      await conn.query(exchangeBalanceLog);
      await conn.commit();
      res.send(`${params.reqPoint.toLocaleString('ko-KR')} 포인트가 보유금으로 전환되었습니다`);
    } else {
      await conn.rollback();
      res.send(`포인트 전환이 실패하였습니다`);
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function formatData(data) {
  return data.map((item) => {
    let processedId;

    if (item.id.length > 8) {
      processedId = item.id.slice(0, 5) + '***';
    } else {
      processedId = item.id.slice(0, -3) + '***';
    }

    return {
      time: item.time.slice(2),
      id: processedId,
      money: item.money.toLocaleString('ko-KR'),
    };
  });
}

function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}
// #endregion

module.exports = router;
