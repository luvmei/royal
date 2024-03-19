const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('../mybatis-mapper');
const crypto = require('../cryptojs');
const bcrypt = require('bcrypt');
const JSONbig = require('json-bigint');
const moment = require('moment-timezone');
const userRouter = require('./user');

// #region 테이블 전송
router.post('/info', (req, res) => {
  req.user[0].sqlType = 'agentInfo';
  getData(res, req.user[0]);
});

router.post('/asset', (req, res) => {
  req.user[0].sqlType = 'agentAsset';
  getData(res, req.user[0]);
});

router.post('/commission', (req, res) => {
  req.user[0].sqlType = 'agentCommission';
  getData(res, req.user[0]);
});

router.post('/betting', (req, res) => {
  req.user[0].sqlType = 'agentBetting';
  getData(res, req.user[0]);
});

router.post('/connect', (req, res) => {
  req.user[0].sqlType = 'agentConnect';
  req.user[0].startDate = req.body.startDate;
  req.user[0].endDate = req.body.endDate;
  getData(res, req.user[0]);
});

router.post('/block', (req, res) => {
  req.user[0].sqlType = 'agentBlock';
  getData(res, req.user[0]);
});
// #endregion

//? 에이전트 타입 확인
router.post('/checkadmin', (req, res) => {
  let isAdmin = false;
  if (req.user[0].type == 9) {
    isAdmin = true;
  }
  res.send(isAdmin);
});

// #region 에이전트 생성
router.post('/doublecheck', (req, res) => {
  if (req.body.nickname == undefined) {
    console.log('아이디 중복검사 시작');
    doubleCheck(res, 'checkAgentId', req.body);
  } else {
    console.log('닉네임 중복검사 시작');
    doubleCheck(res, 'checkAgentNick', req.body);
  }
});

router.post('/add', (req, res) => {
  if (req.body.type != 3) {
    req.body.reg_domain = null;
    // req.body.reg_code = null;
  }
  insertAgentInfo(req, res, req.body);
});

//? 유저 자동생성
router.post('/usercounter', (req, res) => {
  countUser(res, req.body);
});

async function countUser(res, params) {
  let conn = await pool.getConnection();

  let counterUser = mybatisMapper.getStatement('agent', 'counterUser', params, sqlFormat);
  try {
    let result = await conn.query(counterUser);
    result = JSONbig.stringify(result);
    result = JSON.parse(result);
    let count = 30 - result[0].count;
    res.send({ count: count });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 에이전트 관련 함수
async function getData(res, params) {
  params.agentType = params.type;
  let conn = await pool.getConnection();

  let agentData = mybatisMapper.getStatement('agent', params.sqlType, params, sqlFormat);

  try {
    let result = await conn.query(agentData);
    if (params.sqlType === 'agentInfo' || params.sqlType === 'agentAsset' || params.sqlType === 'agentBetting') {
      result = JSONbig.stringify(result);
    }
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function doubleCheck(res, sqlType, params = {}) {
  let conn = await pool.getConnection();

  let query = mybatisMapper.getStatement('agent', sqlType, params, sqlFormat);

  try {
    let result = await conn.query(query);
    if (result.length == 0) {
      res.send(false);
    } else {
      res.send(true);
    }
  } catch (e) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
}

function redefineJoinParams(req, params) {
  params.pw = crypto.encrypt(params.pw, params.id).toString();
  params.join_date = getCurrentTime();
  // params.state = '정상';
  if (req.user[0].type == 9) {
    params.state = '정상';
  } else {
    params.state = '승인대기';
  }

  // const salt = 8;
  // params.pw = bcrypt.hashSync(params.pw, salt);
  return params;
}

async function insertAgentInfo(req, res, data) {
  let params = redefineJoinParams(req, data);
  let conn = await pool.getConnection();

  let agentType;
  let countAgent;
  let defaultAgent;
  let insertAgent;

  switch (params.type) {
    case '0':
      agentType = '플래티넘';
      params.upper_agt = null;
      countAgent = await conn.query(mybatisMapper.getStatement('agent', 'countPlatinum', params, sqlFormat));
      defaultAgent = mybatisMapper.getStatement('agent', 'defaultPlatinum', params, sqlFormat);
      insertAgent = mybatisMapper.getStatement('agent', 'insertPlatinum', params, sqlFormat);
      break;
    case '1':
      agentType = '골드';
      params.upper_agt = params.platinum;
      countAgent = await conn.query(mybatisMapper.getStatement('agent', 'countGold', params, sqlFormat));
      defaultAgent = mybatisMapper.getStatement('agent', 'defaultGold', params, sqlFormat);
      insertAgent = mybatisMapper.getStatement('agent', 'insertGold', params, sqlFormat);
      break;
    case '2':
      agentType = '실버';
      params.upper_agt = params.gold;
      countAgent = await conn.query(mybatisMapper.getStatement('agent', 'countSilver', params, sqlFormat));
      defaultAgent = mybatisMapper.getStatement('agent', 'defaultSilver', params, sqlFormat);
      insertAgent = mybatisMapper.getStatement('agent', 'insertSilver', params, sqlFormat);
      break;
    case '3':
      agentType = '브론즈';
      params.upper_agt = params.silver;
      countAgent = await conn.query(mybatisMapper.getStatement('agent', 'countBronze', params, sqlFormat));
      defaultAgent = mybatisMapper.getStatement('agent', 'defaultBronze', params, sqlFormat);
      insertAgent = mybatisMapper.getStatement('agent', 'insertBronze', params, sqlFormat);
      break;
  }

  countAgent = Number(countAgent[0].count);

  console.log('에이전트 생성 파라미터', params);

  let insertAgentInfo = mybatisMapper.getStatement('agent', 'insertAgentInfo', params, sqlFormat);
  let insertAssetInfo = mybatisMapper.getStatement('agent', 'insertAssetInfo', {}, sqlFormat);
  let insertCommissionInfo = mybatisMapper.getStatement('agent', 'insertCommisionInfo', params, sqlFormat);
  let insertBettingInfo = mybatisMapper.getStatement('agent', 'insertBettingInfo', {}, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(insertAgentInfo);
    await conn.query(insertAssetInfo);
    await conn.query(insertCommissionInfo);
    await conn.query(insertBettingInfo);

    // 트리노드 관련코드
    if (countAgent == 0) {
      await conn.query(defaultAgent);
    } else {
      await conn.query(insertAgent);
    }
    insertNodeId(params);
    makeAgentHierarchy(params);
    // userRouter.createUserApi(params);
    await conn.commit();
    console.log(`[에이전트 추가 성공] [${agentType}] ${params.id}(${params.nickname})`);
    res.send({ agentType: agentType, isAdmin: req.user[0].type });
  } catch (e) {
    console.log(`에러메시지: ${e}`);
    await conn.rollback();
    throw err;
  } finally {
    if (conn) return conn.release();
  }
}

async function insertNodeId(params) {
  let nodeId;
  let nodePid;
  let conn = await pool.getConnection();
  let node = mybatisMapper.getStatement('agent', 'findNode', params, sqlFormat);

  try {
    let nodeResult = await conn.query(node);

    if (nodeResult[0].platinum != null) {
      nodeId = nodeResult[0].platinum;
    }
    if (nodeResult[0].gold != null) {
      nodeId = nodeId + '.' + nodeResult[0].gold;
    }
    if (nodeResult[0].silver != null) {
      nodeId = nodeId + '.' + nodeResult[0].silver;
    }
    if (nodeResult[0].bronze != null) {
      nodeId = nodeId + '.' + nodeResult[0].bronze;
    }
    if (nodeId == undefined) {
      console.log('nodeId가 Undefined이면 문제가 있는 상태입니다');
    }

    params.nodeId = nodeId;
    params.nodePid = null;

    let idx = String(nodeId).lastIndexOf('.');
    if (idx != -1) {
      nodePid = nodeId.substring(0, idx);
      params.nodePid = nodePid;
    }

    await conn.query(mybatisMapper.getStatement('agent', 'insertNode', params, sqlFormat));
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function makeAgentHierarchy(params) {
  let conn = await pool.getConnection();
  let getHierarchy = mybatisMapper.getStatement('user', 'agentHierarchy', params, sqlFormat);

  try {
    let hierarchyData = await conn.query(getHierarchy);
    let hierarchy = userRouter.getUserHierarchy(hierarchyData);

    hierarchy.id = params.id;
    let insertHierarchy = mybatisMapper.getStatement('agent', 'insertAgentHierarchy', hierarchy, sqlFormat);
    await conn.query(insertHierarchy);
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
