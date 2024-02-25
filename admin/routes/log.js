const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('mybatis-mapper');
const moment = require('moment-timezone');
const axios = require('axios');
const JSONbig = require('json-bigint');
const userRouter = require('./user');

// #region 테이블 전송
router.post('/balance', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  req.body.type = req.user[0].type;
  req.body.id = req.user[0].id;
  getData(res, 'getBalanceLog', req.body);
});

router.post('/point', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  getData(res, 'getPointLog', req.body);
});

router.post('/detail', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  if (req.body.type == 'sport') {
    getDetailLog(res, 'getSportDetailLog', req.body);
  } else if (req.body.type == 'casino') {
    getDetailLog(res, 'getCasinoDetailLog', req.body);
  } else if (req.body.type == 'slot') {
    getDetailLog(res, 'getSlotDetailLog', req.body);
  }
});

router.post('/summary', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  if (req.body.type == 'sport') {
    getSummaryLog(res, 'getSportSummaryLog', req.body);
  } else if (req.body.type == 'casino') {
    getSummaryLog(res, 'getCasinoSummaryLog', req.body);
  } else if (req.body.type == 'slot') {
    getSummaryLog(res, 'getSlotSummaryLog', req.body);
  }
});
// #endregion

// #region 로그 관련 함수
async function getData(res, type, params = {}) {
  let conn = await pool.getConnection();
  //todo params.node_id 정보 필요
  let getLogData = mybatisMapper.getStatement('log', type, params, sqlFormat);

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

async function getDetailLog(res, type, params = {}) {
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

async function getSummaryLog(res, type, params = {}) {
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
