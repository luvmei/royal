const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('../mybatis-mapper');
const JSONbig = require('json-bigint');

router.post('/deposit', (req, res) => {
  getData(req, res);
});

router.post('/withdraw', (req, res) => {
  getData(req, res);
});

router.post('/give', (req, res) => {
  getData(req, res);
});

router.post('/take', (req, res) => {
  getData(req, res);
});

router.post('/balance', (req, res) => {
  getData(req, res);
});

router.post('/point', (req, res) => {
  getData(req, res);
});

router.post('/betting', (req, res) => {
  getServerSideData(req, res);
});

router.post('/summarybetting', (req, res) => {
  getData(req, res);
});

router.post('/connect', (req, res) => {
  getData(req, res);
});

router.post('/message', (req, res) => {
  getData(req, res);
});

router.post('/qna', (req, res) => {
  getData(req, res);
});

router.post('/recommend', (req, res) => {
  getData(req, res);
});

router.post('/needinfo', (req, res) => {
  getData(req, res);
});

async function getData(req, res) {
  let params = req.body;

  let conn = await pool.getConnection();
  let getData = mybatisMapper.getStatement('detail', params.tableType, params, sqlFormat);
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

async function getServerSideData(req, res) {
  let params = req.body;
  params.pageSize = params.length;
  params.offset = params.start;
  params.searchValue = params.search.value;
  params.orderColumn = params.columns[params.order[0].column].data;
  params.orderDirection = params.order[0].dir;

  let conn = await pool.getConnection();
  let getData = mybatisMapper.getStatement('detail', params.tableType, params, sqlFormat);
  let getDataCount = mybatisMapper.getStatement('detail', 'getTotalDetailRecordsCount', params, sqlFormat);

  try {
    let result = await conn.query(getData);
    result = JSONbig.stringify(result);
    result = JSONbig.parse(result);

    let totalRecordsCount = await conn.query(getDataCount);
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
module.exports = router;
