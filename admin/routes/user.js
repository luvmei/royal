const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('mybatis-mapper');
const JSONbig = require('json-bigint');
const axios = require('axios');
const moment = require('moment-timezone');
const socket = require('../socket');
const bcrypt = require('bcrypt');
const crypto = require('../cryptojs');
const parser = require('ua-parser-js');
const api = require(`../public/js/api/${process.env.API_TYPE}`);
// #region 테이블 전송
router.post('/info', (req, res) => {
  let params = req.body;
  if (req.user && req.user[0] && req.user[0].node_id) {
    params.nodeId = req.user[0].node_id;
  } else {
    params.nodeId = null;
  }
  getData(res, req.body.table, params);
});

router.post('/asset', (req, res) => {
  let params = { node_id: req.user[0].node_id };
  getData(res, 'userAsset', params);
});

router.post('/commission', (req, res) => {
  let params = { node_id: req.user[0].node_id };
  getData(res, 'userCommission', params);
});

router.post('/betting', (req, res) => {
  let params = { node_id: req.user[0].node_id };
  getData(res, 'userBetting', params);
});

router.post('/connect', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  getData(res, 'userConnect', req.body);
});

router.post('/block', (req, res) => {
  req.body.node_id = req.user[0].node_id;
  getData(res, 'userBlock', req.body);
});

router.post('/confirm', (req, res) => {
  getData(res, 'userConfirm');
});
// #endregion

// #region 상세정보 보기 및 수정
router.post('/detail', (req, res) => {
  getUserDetail(req, res);
});

async function getUserDetail(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();

  let userDetail = mybatisMapper.getStatement('user', 'userDetail', params, sqlFormat);
  let agentHierarchy = mybatisMapper.getStatement('user', 'agentHierarchy', params, sqlFormat);
  let lowerMaxRate = mybatisMapper.getStatement('user', 'lowerMaxRate', params, sqlFormat);

  try {
    let result = await conn.query(userDetail);
    if (result[0] && 'pw' in result[0]) {
      delete result[0].pw;
    }
    result[0].recommend_count = Number(result[0].recommend_count);

    let hierarchyData = await conn.query(agentHierarchy);

    let hierarchy = getUserHierarchy(hierarchyData);

    let lowerMaxRateData = await conn.query(lowerMaxRate);

    res.send({ user: result[0], hierarchy: hierarchy, login_user: req.user[0], lowerMaxRate: lowerMaxRateData[0] });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/modify', async (req, res) => {
  await modifyUserDetail(req, res);
});

async function modifyUserDetail(req, res) {
  let params = req.body;
  params.join_memo = params.join_memo.replace(/'/g, '"');
  let conn = await pool.getConnection();

  //* 전체 롤링 마진율 수정(에이전트에서 변경 시)
  if (req.body.type == '0') {
    changeAllRollMarginRate(req);
  }

  let beforeUserNickname = mybatisMapper.getStatement('user', 'beforeUserNickname', params, sqlFormat);
  let beforeNickname = await conn.query(beforeUserNickname);
  params.beforeUserNickname = beforeNickname[0].nickname;

  let userInfoModify = mybatisMapper.getStatement('user', 'userInfoModify', params, sqlFormat);
  let userHierarchyModify = mybatisMapper.getStatement('user', 'userHierarchyModify', params, sqlFormat);
  let rateModify = mybatisMapper.getStatement('user', 'rateModify', params, sqlFormat);

  try {
    await conn.beginTransaction();
    let userInfo = await conn.query(userInfoModify);
    if (params.type != '4') {
      await conn.query(userHierarchyModify);
    }
    let rateInfo = await conn.query(rateModify);
    if (userInfo.affectedRows != 0 || rateInfo.affectedRows != 0) {
      res.send('유저정보가 수정되었습니다');
    } else {
      res.send('유저정보 수정에 실패했습니다');
    }
    await conn.commit();
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//todo 마진요율 전체 수정
async function changeAllRollMarginRate(req) {
  let conn = await pool.getConnection();
  let params = req.body;
  let changeTotalMarginRate = mybatisMapper.getStatement('user', 'changeTotalMarginRate', params, sqlFormat);
  try {
    await conn.query(changeTotalMarginRate);
    console.log('모든 하위 에이전트의 마진율이 수정되었습니다');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/forcelogout', (req, res) => {
  forceUserLogout(req, res);
});

async function forceUserLogout(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();
  let sessionId = await getSessionData(req);

  if (!sessionId) {
    res.send('해당 유저는 현재 접속중이 아닙니다');
    return;
  }

  params.session_id = sessionId;

  let forceUserLogout = mybatisMapper.getStatement('user', 'forceUserLogout', params, sqlFormat);

  try {
    let result = await conn.query(forceUserLogout);
    if (result.affectedRows != 0) {
      console.log(`[강제 로그아웃] ID: ${params.id}`);
      res.send('로그아웃 되었습니다');
    } else {
      res.send('강제 로그아웃에 실패했습니다');
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getSessionData(req) {
  let conn = await pool.getConnection();
  let userId = req.body.id;
  let getSessionData = mybatisMapper.getStatement('user', 'getSessionData', {}, sqlFormat);
  let targetSessionId;

  try {
    let sessionData = await conn.query(getSessionData);

    for (let item of sessionData) {
      let parsedData = JSON.parse(item.data);

      if (parsedData.passport && parsedData.passport.user) {
        let sessionUser = parsedData.passport.user;

        if (sessionUser === userId) {
          targetSessionId = item.session_id;
          break;
        }
      }
    }
    return targetSessionId;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

// #endregion

// #region 가입승인
router.post('/joinconfirm', (req, res) => {
  console.log('회원가입 승인 시작');
  confirmUserJoin(req.body);
  res.send('회원가입 승인완료');
});

async function confirmUserJoin(params) {
  params.join_memo = params.join_memo.replace(/'/g, '"');
  let conn = await pool.getConnection();

  let confirmUserJoin = mybatisMapper.getStatement('user', 'confirmUserJoin', params, sqlFormat);
  let insertJoinMemo = mybatisMapper.getStatement('user', 'insertJoinMemo', params, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(confirmUserJoin);
    await conn.query(insertJoinMemo);
    await conn.commit();
    if (params.타입 == '4') {
      await makeUserHierarchy(params);
      await api.createUser(params);
      // await sd.createUser(params);
    }
    socket.emit('to_user', { id: params.아이디, type: 'confirmJoin' });
    // await unique.createUser(params);
    // await createUserApi(params);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 차단
router.post('/userblock', (req, res) => {
  changeBlockState(res, req.body);
});
// #endregion

// #region 임의생성
router.post('/doublecheck', (req, res) => {
  if (req.body.nickname == undefined) {
    console.log('아이디 중복검사 시작');
    doubleCheck(res, 'checkUserId', req.body);
  } else {
    console.log('닉네임 중복검사 시작');
    doubleCheck(res, 'checkUserNick', req.body);
  }
});

router.post('/add', async (req, res) => {
  let userParams = await redefineUser(req, req.body);
  repeatInsertUser(userParams);
  res.send('유저생성이 완료되었습니다');
});

async function doubleCheck(res, sqlType, params = {}) {
  let conn = await pool.getConnection();

  let query = mybatisMapper.getStatement('user', sqlType, params, sqlFormat);

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

async function redefineUser(req, params) {
  if (!params.upper_id) {
    params.upper_id = req.user[0].id;
  }

  // const salt = 8;
  let ua = parser(req.headers['user-agent']);

  // params.pw = bcrypt.hashSync(params.pw, salt);
  params.phone = '';
  params.bank = '';
  params.bank_num = '';
  params.bank_owner = '';
  params.bank_pw = '';
  params.join_ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
  params.join_date = getCurrentTime();
  params.ip_adress = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
  params.domain = req.protocol + '://' + req.get('host');
  params.device = ua.os.name;
  params.browser = ua.browser.name;

  let conn = await pool.getConnection();

  let getData = mybatisMapper.getStatement('user', 'getUpperInfo', params, sqlFormat);

  try {
    let result = await conn.query(getData);
    params.upper_agt = result[0].user_id;
    params.join_code = result[0].reg_code;
    params.join_domain = result[0].reg_domain;
    return params;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function repeatInsertUser(params) {
  let conn;
  let originalPassword = params.pw;

  console.log(`[유저 임의생성 시작] ID: ${params.id} / 닉네임: ${params.nickname} / 수량: ${params.count}`);
  for (let i = 1; i <= params.count; i++) {
    let id = params.id;
    let nick = params.nickname;
    params.new_id = i < 10 ? `${id}0${i}` : `${id}${i}`;
    params.new_nickname = i < 10 ? `${nick}0${i}` : `${nick}${i}`;

    params.pw = crypto.encrypt(originalPassword, params.new_id);

    let insertUserInfo = mybatisMapper.getStatement('user', 'insertUserInfo', params, sqlFormat);
    let insertAssetInfo = mybatisMapper.getStatement('user', 'insertAssetInfo', {}, sqlFormat);
    let insertCommissionInfo = mybatisMapper.getStatement('user', 'insertCommisionInfo', {}, sqlFormat);
    let insertBettingInfo = mybatisMapper.getStatement('user', 'insertBettingInfo', {}, sqlFormat);

    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      await conn.query(insertUserInfo);
      await conn.query(insertAssetInfo);
      await conn.query(insertCommissionInfo);
      await conn.query(insertBettingInfo);

      await conn.commit();

      await makeUserHierarchy(params);
      api.createUser(params);
      // await sd.createUser(params);
      // await dg.createUser(params);
      // await unique.createUser(params);
      // await createUserApi(params);
    } catch (e) {
      if (conn) {
        await conn.rollback(); // 롤백
      }
      console.error(e);
    } finally {
      if (conn) {
        await conn.release(); // 연결 해제
      }
    }
    await new Promise((r) => setTimeout(r, 1000)); // 1초 딜레이 추가
  }
  console.log(`[유저 임의생성 완료] ID: ${params.id}01 ~ ${params.count} / 닉네임: ${params.nickname}01 ~ ${params.count} / 수량: ${params.count}`);
}

// #endregion

// #region 비밀번호 관련
router.post('/checkpassword', (req, res) => {
  console.log('비밀번호 확인 시작');
  checkUserPassword(req, res);
});

async function checkUserPassword(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();

  let checkUserPassword = mybatisMapper.getStatement('user', 'checkUserPassword', params, sqlFormat);

  try {
    let result = await conn.query(checkUserPassword);
    let originalText = crypto.decrypt(result[0].pw, params.id);
    res.send(originalText);
    // if (result.length != 0) {
    //   res.send(true);
    // } else {
    //   res.send(false);
    // }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

router.post('/changeuserpassword', (req, res) => {
  if (!req.user) {
    res.send('로그인이 필요합니다');
    return;
  } else if (req.body.type == 'userPassword') {
    console.log(`${req.body.id}유저 비밀번호 변경`);
    changeUserPassword(req, res);
  } else if (req.body.type == 'userWithdrawPassword') {
    console.log(`${req.body.id}유저 출금비밀번호 변경`);
    changeUserWithdrawPassword(req, res);
  }
});

async function changeUserPassword(req, res) {
  let params = req.body;
  // const salt = 8;
  // params.pw = bcrypt.hashSync('aaa111', salt);

  params.pw = crypto.encrypt(params.newPw, params.id);
  let conn = await pool.getConnection();

  let resetUserPassword = mybatisMapper.getStatement('user', 'resetUserPassword', params, sqlFormat);

  try {
    let result = await conn.query(resetUserPassword);
    if (result.affectedRows != 0) {
      console.log(`[비밀번호 변경완료] ID: ${params.id}`);
      res.send(`<h3 class="my-3">[비밀번호 변경완료]</h3><h4>ID: ${params.id}</h4>`);
    } else {
      console.log(`[비밀번호 변경실패] ID: ${params.id}`);
      res.send(`<h3 class="my-3">[비밀번호 변경실패]</h3><h4>ID: ${params.id}</h4s=>`);
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/checkwithdrawpassword', (req, res) => {
  checkUserWithdrawPassword(req, res);
});

async function checkUserWithdrawPassword(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();

  let checkUserWithdrawPassword = mybatisMapper.getStatement('user', 'checkUserWithdrawPassword', params, sqlFormat);

  try {
    let result = await conn.query(checkUserWithdrawPassword);
    res.send(result[0].bank_pw);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function changeUserWithdrawPassword(req, res) {
  let conn = await pool.getConnection();
  let params = req.body;

  let resetUserWithdrawPassword = mybatisMapper.getStatement('user', 'resetUserWithdrawPassword', params, sqlFormat);

  try {
    let result = await conn.query(resetUserWithdrawPassword);
    if (result.affectedRows != 0) {
      console.log(`[출금비밀번호 변경완료] ID: ${params.id}`);
      res.send(`<h3 class="my-3">[출금비밀번호 변경완료]</h3><h4>ID: ${params.id}</h4>`);
    } else {
      console.log(`[출금비밀번호 변경실패] ID: ${params.id}`);
      res.send(`<h3 class="my-3">[출금비밀번호 변경실패]</h3><h4">ID: ${params.id}</h4>`);
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/changepassword', (req, res) => {
  changeAdminPassword(req, res);
});

async function changePassword(conn, params, getPwQuery, updatePwQuery) {
  let result = await conn.query(getPwQuery);
  if (result[0].pw == params.oldPassword) {
    if (params.newPassword == params.oldPassword) {
      return { msg: '기존 비밀번호와 변경할 비밀번호가 동일합니다', isChanged: false };
      return;
    }
    try {
      await conn.query(updatePwQuery);
      return { msg: '비밀번호가 변경되었습니다', isChanged: true };
    } catch (e) {
      throw e;
    }
  } else {
    return { msg: '기존 비밀번호가 일치하지 않습니다', isChanged: false };
  }
}

async function changeAdminPassword(req, res) {
  let conn = await pool.getConnection();

  let params = req.body;
  params.id = req.user[0].id;
  params.oldPassword = crypto.encrypt(params.oldPassword, req.user[0].id);
  params.newPassword = crypto.encrypt(params.newPassword, req.user[0].id);

  try {
    let result;
    if (req.user[0].id == 'admin') {
      let getPw = mybatisMapper.getStatement('user', 'getAdminPw', params, sqlFormat);
      let updatePw = mybatisMapper.getStatement('user', 'updateAdminPw', params, sqlFormat);
      result = await changePassword(conn, params, getPw, updatePw);
    } else {
      let getPw = mybatisMapper.getStatement('agent', 'getAgentPw', params, sqlFormat);
      let updatePw = mybatisMapper.getStatement('agent', 'updateAgentPw', params, sqlFormat);
      result = await changePassword(conn, params, getPw, updatePw);
    }
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send(e.result);
  } finally {
    if (conn) conn.release();
  }
}

// #endregion

// #region 유저 관련 함수
async function getData(res, type, params = {}) {
  if (params.nodeId) {
    params.node_id = params.nodeId;
  }

  if (params.node_id && params.node_id.split('.').length === 4) {
    params.isBronze = true;
  }

  let conn = await pool.getConnection();
  let getData = mybatisMapper.getStatement('user', type, params, sqlFormat);
  try {
    let result = await conn.query(getData);
    if (
      type == 'userInfoTotal' ||
      type == 'userInfoLocal' ||
      type == 'userInfoOnline' ||
      type == 'userAsset' ||
      type == 'userInfoDate' ||
      type == 'userBetting' ||
      type == 'userConfirm'
    ) {
      result = JSONbig.stringify(result);
      result = JSONbig.parse(result);
    }

    if (type == 'userInfoDate') {
      result = result[0];
    }
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function changeBlockState(res, params) {
  let conn = await pool.getConnection();
  if (params.상태 == '승인대기' || params.상태 == '정상') {
    params.block_type = '차단설정';
  } else {
    params.block_type = '차단해제';
  }
  params.time = getCurrentTime();
  params.id = params.아이디;

  let changeBlockState = mybatisMapper.getStatement('user', 'changeBlockState', params, sqlFormat);
  let insertBlockInfo = mybatisMapper.getStatement('user', 'insertBlockInfo', params, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(changeBlockState);
    await conn.query(insertBlockInfo);
    await conn.commit();
    if (params.상태 == '승인대기') {
      await makeUserHierarchy(params);
      socket.emit('checkIcon', 'blockJoin');
    }

    res.send(params.block_type);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function makeUserHierarchy(params) {
  let id = {};
  if (params.new_id) {
    id.id = params.new_id;
  } else {
    id.id = params.id !== undefined ? params.id : params.아이디;
  }

  let conn = await pool.getConnection();
  let getHierarchy = mybatisMapper.getStatement('user', 'agentHierarchy', id, sqlFormat);

  try {
    let hierarchyData = await conn.query(getHierarchy);
    let hierarchy = getUserHierarchy(hierarchyData);
    let insertHierarchy = mybatisMapper.getStatement('user', 'insertUserHierarchy', hierarchy, sqlFormat);
    await conn.query(insertHierarchy);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function getUserHierarchy(data) {
  let hierarchy = {};

  const userFields = ['p_id', 'g_id', 's_id', 'b_id', 'u_id'];
  const nickFields = ['p_nick', 'g_nick', 's_nick', 'b_nick', 'u_nick'];
  const casinoRollRate = ['p_c_roll', 'g_c_roll', 's_c_roll', 'b_c_roll', 'u_c_roll'];
  const slotRollRate = ['p_s_roll', 'g_s_roll', 's_s_roll', 'b_s_roll', 'u_s_roll'];
  const loseRate = ['p_lose', 'g_lose', 's_lose', 'b_lose', 'u_lose'];
  const casinoBetMarginRate = ['p_c_bet_margin', 'g_c_bet_margin', 's_c_bet_margin', 'b_c_bet_margin', 'u_c_bet_margin'];
  const slotBetMarginRate = ['p_s_bet_margin', 'g_s_bet_margin', 's_s_bet_margin', 'b_s_bet_margin', 'u_s_bet_margin'];
  const casinoRollMarginRate = ['p_c_roll_margin', 'g_c_roll_margin', 's_c_roll_margin', 'b_c_roll_margin', 'u_c_roll_margin'];
  const slotRollMarginRate = ['p_s_roll_margin', 'g_s_roll_margin', 's_s_roll_margin', 'b_s_roll_margin', 'u_s_roll_margin'];

  // 각 type에 대한 기본 템플릿
  let template = Array.from({ length: 5 }, () => ({
    user_id: null,
    nickname: null,
    c_roll_rate: null,
    s_roll_rate: null,
    lose_rate: null,
    c_bet_margin_rate: null,
    s_bet_margin_rate: null,
    c_roll_margin_rate: null,
    s_roll_margin_rate: null,
  }));

  // 입력 데이터를 템플릿에 맞게 채워넣기
  for (let obj of data[0]) {
    template[obj.type] = obj;
  }

  // 최종 hierarchy 구성
  for (let i = 0; i < template.length; i++) {
    hierarchy[userFields[i]] = template[i].user_id;
    hierarchy[nickFields[i]] = template[i].nickname;
    hierarchy[casinoRollRate[i]] = template[i].c_roll_rate;
    hierarchy[slotRollRate[i]] = template[i].s_roll_rate;
    hierarchy[loseRate[i]] = template[i].lose_rate;
    hierarchy[casinoBetMarginRate[i]] = template[i].c_bet_margin_rate;
    hierarchy[slotBetMarginRate[i]] = template[i].s_bet_margin_rate;
    hierarchy[casinoRollMarginRate[i]] = template[i].c_roll_margin_rate;
    hierarchy[slotRollMarginRate[i]] = template[i].s_roll_margin_rate;
  }

  return hierarchy;
}

// function getUserHierarchy(data) {
//   //todo 유저 콤프 줄 때 여기서 요율입력
//   let hierarchy = {};
//   const userFields = ['p_id', 'g_id', 's_id', 'b_id', 'u_id'];
//   const nickFields = ['p_nick', 'g_nick', 's_nick', 'b_nick', 'u_nick'];
//   const casinoRollRate = ['p_c_roll', 'g_c_roll', 's_c_roll', 'b_c_roll', 'u_c_roll'];
//   const slotRollRate = ['p_s_roll', 'g_s_roll', 's_s_roll', 'b_s_roll', 'u_s_roll'];
//   const loseRate = ['p_lose', 'g_lose', 's_lose', 'b_lose', 'u_lose'];
//   const betMarginRate = ['p_bet_margin', 'g_bet_margin', 's_bet_margin', 'b_bet_margin', 'u_bet_margin'];
//   const rollMarginRate = ['p_roll_margin', 'g_roll_margin', 's_roll_margin', 'b_roll_margin', 'u_roll_margin'];

//   for (let i = 0; i < userFields.length; i++) {
//     const userObj = data[0][i];
//     if (userObj) {
//       hierarchy[userFields[i]] = userObj.user_id;
//       hierarchy[nickFields[i]] = userObj.nickname;
//       hierarchy[casinoRollRate[i]] = userObj.c_roll_rate;
//       hierarchy[slotRollRate[i]] = userObj.s_roll_rate;
//       hierarchy[loseRate[i]] = userObj.lose_rate;
//       hierarchy[betMarginRate[i]] = userObj.bet_margin_rate;
//       hierarchy[rollMarginRate[i]] = userObj.roll_margin_rate;
//     } else {
//       hierarchy[userFields[i]] = null;
//       hierarchy[nickFields[i]] = null;
//       hierarchy[casinoRollRate[i]] = null;
//       hierarchy[slotRollRate[i]] = null;
//       hierarchy[loseRate[i]] = null;
//       hierarchy[betMarginRate[i]] = null;
//       hierarchy[rollMarginRate[i]] = null;
//     }
//   }

//   return hierarchy;
// }

function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}
// #endregion

// #region 가상 유저 관련
makeVirtualUser();

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

async function makeVirtualUser() {
  // 가상유저 갯수
  const virtualSetCount = 1000;
  let conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let getVirtualUserCount = mybatisMapper.getStatement('user', 'countVirtualUser', null, sqlFormat);
    let virtualUserCount = await conn.query(getVirtualUserCount);
    let count = virtualUserCount[0]['COUNT(*)'];

    if (typeof count === 'bigint') {
      count = Number(count);
    }

    if (count < virtualSetCount) {
      let ids = [];
      for (let i = 0; i < virtualSetCount - count; i++) {
        let level = (i + 1) % 5 || 5;
        ids.push({ id: generateRandomId(), level: level });
      }

      let insertVirtualUser = mybatisMapper.getStatement('user', 'batchInsertVirtualUser', { list: ids }, sqlFormat);
      await conn.query(insertVirtualUser);

      await conn.commit();
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

module.exports = { router, getUserHierarchy, getCurrentTime, getUserHierarchy };
