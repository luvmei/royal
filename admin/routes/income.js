const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('../mybatis-mapper');
const JSONbig = require('json-bigint');
const moment = require('moment-timezone');
const axios = require('axios');

// #region 테이블 전송
router.post('/headquarters', (req, res) => {
  getData(res, 'headquarters', req.body);
});

router.post('/agent', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  req.body.agentType = req.user[0].type;

  if (req.body.type == 'depoWith') {
    getData(res, 'agentDepoWith', req.body);
  } else if (req.body.type == 'betwin') {
    getData(res, 'agentBetWin', req.body);
  } else if (req.body.type == 'betwinAcc') {
    getData(res, 'agentBetWinAcc', req.body);
  } else if (req.body.type == 'death') {
    getData(res, 'agentDeath', req.body);
  }
});

router.post('/detail', (req, res) => {
  req.body.agentType = req.user[0].type;

  if (req.body.type == 'depowith') {
    getDetailIncome(res, 'detailIncomeDepoWith', req.body);
  } else if (req.body.type == 'betwin') {
    getDetailIncome(res, 'detailIncomeBetWin', req.body);
  } else if (req.body.type == 'betwinAcc') {
    getDetailIncome(res, 'detailIncomeBetWinAcc', req.body);
  }
});

router.post('/user', (req, res) => {
  if (req.body.type == 'depoWith') {
    getData(res, 'userDepoWith', req.body);
  } else if (req.body.type == 'betwin') {
    getData(res, 'userBetWin', req.body);
  }
});
// #endregion

// #region 인컴 관련 함수
async function getData(res, type, params = {}) {
  let conn = await pool.getConnection();
  let getData = mybatisMapper.getStatement('income', type, params, sqlFormat);

  try {
    let result = await conn.query(getData);
    result = JSONbig.stringify(result);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getDetailIncome(res, type, params = {}) {
  let conn = await pool.getConnection();
  let getDetailIncome = mybatisMapper.getStatement('income', type, params, sqlFormat);
  try {

    let result = await conn.query(getDetailIncome);
    result = JSONbig.stringify(result);
    result = JSON.parse(result);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}
// #endregion

module.exports = router;
