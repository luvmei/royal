const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('mybatis-mapper');
const moment = require('moment-timezone');
const axios = require('axios');
const JSONbig = require('json-bigint');
const userRouter = require('./user');

// #region 테이블 전송
function handleLogRequest(req, res, sqlType = null) {
  req.body.id = req.user[0].id;
  req.body.agentType = req.user[0].type;
  req.body.node_id = req.user[0].node_id;
  req.body.sqlType = sqlType;

  getData(res, req.body);
}

router.post('/balance', (req, res) => {
  handleLogRequest(req, res, 'getBalanceLog');
});

router.post('/point', (req, res) => {
  handleLogRequest(req, res, 'getPointLog');
});

router.post('/detail', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  req.body.agentType = req.user[0].type;

  if (req.body.type == 'sport') {
    getDetailLog(req, res, 'getSportDetailLog');
  } else if (req.body.type == 'casino') {
    getDetailLog(req, res, 'getCasinoDetailLog');
  } else if (req.body.type == 'slot') {
    getDetailLog(req, res, 'getSlotDetailLog');
  }
});

router.post('/summary', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  req.body.agentType = req.user[0].type;
  
  if (req.body.type == 'sport') {
    getSummaryLog(req, res, 'getSportSummaryLog');
  } else if (req.body.type == 'casino') {
    getSummaryLog(req, res, 'getCasinoSummaryLog');
  } else if (req.body.type == 'slot') {
    getSummaryLog(req, res, 'getSlotSummaryLog');
  }
});
// #endregion

// #region 로그 관련 함수
async function getData(res, params) {
  let conn = await pool.getConnection();
  let getLogData = mybatisMapper.getStatement('log', params.sqlType, params, sqlFormat);

  try {
    let result = await conn.query(getLogData);
    result = JSONbig.stringify(result);

    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getDetailLog(req, res, type) {
  let params = req.body;

  let conn = await pool.getConnection();

  params.pageSize = params.length;
  params.offset = params.start;
  params.searchValue = params.search.value;
  params.orderColumn = params.columns[params.order[0].column].data;
  params.orderDirection = params.order[0].dir;

  let getLogData = mybatisMapper.getStatement('log', type, params, sqlFormat);
  let getLogDataCount = mybatisMapper.getStatement('log', 'getTotalDetailRecordsCount', params, sqlFormat);

  try {
    let result = await conn.query(getLogData);

    let totalRecordsCount = await conn.query(getLogDataCount);
    totalRecordsCount = Number(totalRecordsCount[0].totalRecordsCount);

    let response = {
      draw: params.draw,
      recordsTotal: totalRecordsCount,
      recordsFiltered: totalRecordsCount,
      data: result,
    };

    res.send(response);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getSummaryLog(req, res, type) {
  let params = req.body;

  if (req.user[0].node_id) {
    params.node_id = req.user[0].node_id;
  }

  if (req.user[0].type == 3) {
    params.isBronze = true;
  }

  let conn = await pool.getConnection();

  params.pageSize = params.length;
  params.offset = params.start;
  params.searchValue = params.search.value;
  params.orderColumn = params.columns[params.order[0].column].data;
  params.orderDirection = params.order[0].dir;

  let getLogData = mybatisMapper.getStatement('log', type, params, sqlFormat);
  let getLogDataCount = mybatisMapper.getStatement('log', 'getTotalSummaryRecordsCount', params, sqlFormat);

  try {
    let result = await conn.query(getLogData);
    let totalRecordsCount = await conn.query(getLogDataCount);
    totalRecordsCount = Number(totalRecordsCount[0].totalRecordsCount);

    let response = {
      draw: params.draw,
      recordsTotal: totalRecordsCount,
      recordsFiltered: totalRecordsCount,
      data: result.map((item) => {
        if (typeof item['결과'] === 'bigint') {
          item['결과'] = Number(item['결과']);
        }
        return item;
      }),
    };

    res.send(response);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

module.exports = router;
