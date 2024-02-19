const express = require('express');
const router = express.Router();
const mybatisMapper = require('../mybatis-mapper');
const { pool, sqlFormat } = require('../mariadb');
const moment = require('moment-timezone');

// #region 공지사항, 문의, 메세지 리스트 열기
router.post('/list', async (req, res) => {
  if (req.user) {
    getList(req, res);
  }
});

async function getList(req, res) {
  let params = req.body;
  params.id = req.user[0].id;
  let conn = await pool.getConnection();
  let list;

  if (params.type == 'notice') {
    list = mybatisMapper.getStatement('board', 'getNoticeList', params, sqlFormat);
  } else if (params.type == 'question') {
    list = mybatisMapper.getStatement('board', 'getQuestionList', params, sqlFormat);
  } else if (params.type == 'message') {
    list = mybatisMapper.getStatement('board', 'getMessageList', params, sqlFormat);
  }

  try {
    let result = await conn.query(list);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 알림 확인
router.post('/checknoti', (req, res) => {
  if (req.user) {
    checkUserNoti(req, res);
  } else {
    res.send(false);
  }
});

async function checkUserNoti(req, res) {
  let newQuestion = false;
  let newMessage = false;
  let conn = await pool.getConnection();

  let question = mybatisMapper.getStatement('board', 'checkQuestion', { id: req.user[0].id }, sqlFormat);
  let message = mybatisMapper.getStatement('board', 'checkMessage', { id: req.user[0].id }, sqlFormat);

  try {
    let questionResult = await conn.query(question);
    let messageResult = await conn.query(message);

    newQuestion = Number(questionResult[0].count) > 0 ? true : false;
    newMessage = Number(messageResult[0].count) > 0 ? true : false;

    res.send({ isLogin: true, question: newQuestion, message: newMessage });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 공지사항
router.post('/info', async (req, res) => {
  getBoardInfo(req, res);
});

router.post('/content', async (req, res) => {
  getBoardContent(req, res);
});

async function getBoardInfo(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();

  let notice = mybatisMapper.getStatement('board', 'getNoticeList', params, sqlFormat);

  try {
    let result = await conn.query(notice);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getBoardContent(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();

  let content = mybatisMapper.getStatement('board', 'getNoticeContent', params, sqlFormat);

  // if (params.type == 'notice') {

  // } else if (params.type == 'question') {
  //   content = mybatisMapper.getStatement('board', 'getQuestionContent', params, sqlFormat);
  // } else if (params.type == 'message') {
  //   content = mybatisMapper.getStatement('board', 'getMessageContent', params, sqlFormat);
  // }

  try {
    let result = await conn.query(content);
    res.send(result[0]);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 이벤트
router.post('/event', async (req, res) => {
  getEventList(req, res);
});

async function getEventList(req, res) {
  let sql;
  let latestRound;
  let conn = await pool.getConnection();
  let params = req.body;

  switch (params.eventType) {
    case 'lottery':
      sql = 'getLotteryParticipationList';
      break;
  }

  let event = mybatisMapper.getStatement('board', sql, params, sqlFormat);
  try {
    let result = await conn.query(event);
    if (result.length == 0) {
      latestRound = await getLastRound();
      res.send({
        latestRound: latestRound,
        data: result,
      });
    } else {
      latestRound = result[0] ? result[0].round : null;
      res.send({
        latestRound: latestRound,
        data: result,
      });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getLastRound() {
  let conn = await pool.getConnection();

  let lastRoundSql = mybatisMapper.getStatement('board', 'getLotteryLastRound', null, sqlFormat);
  try {
    let result = await conn.query(lastRoundSql);
    return result[0].latestRound;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}
// #endregion

// #region 문의
//? 문의 등록
router.post('/question', async (req, res) => {
  if (req.user) {
    insertQuestion(req, res);
  }
});

async function insertQuestion(req, res) {
  let params = req.body;
  params.id = req.user[0].id;
  params.user_type = req.user[0].type;
  params.time = getCurrentTime();

  let conn = await pool.getConnection();
  let question = mybatisMapper.getStatement('board', 'insertQuestion', params, sqlFormat);

  try {
    await conn.query(question);
    res.send({ message: '문의가 접수되었습니다', id: req.user[0] });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 문의 상태변경
router.post('/state', (req, res) => {
  updateQuestionState(req, res);
});
// #endregion

// #region 메시지
async function updateQuestionState(req, res) {
  let params = req.body;
  let updateState;
  let conn = await pool.getConnection();

  if (params.상태 && params.상태 == '답변완료') {
    params.state = '답변확인';
    updateState = mybatisMapper.getStatement('board', 'updateQuestionState', params, sqlFormat);
  }
  if (params.읽음여부 && params.읽음여부 == 0) {
    params.읽음여부 = 1;
    updateState = mybatisMapper.getStatement('board', 'updateMessageState', params, sqlFormat);
  }
  try {
    await conn.query(updateState);
    res.send('상태변경 완료');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 읽지않은 메시지 확인
router.post('/readcheck', (req, res) => {
  checkReadMessage(req, res);
});

async function checkReadMessage(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();

  if (Object.keys(params).length === 0) {
    res.send(false);
    return;
  }

  let findUnreadMessage = mybatisMapper.getStatement('board', 'findUnreadMessage', params, sqlFormat);

  try {
    result = await conn.query(findUnreadMessage);
    if (Number(result[0].count) > 0) {
      result = true;
    } else {
      result = false;
    }
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 모두 읽음
router.post('/readall', (req, res) => {
  readAllMessage(req, res);
});

async function readAllMessage(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();

  let readAllMessage = mybatisMapper.getStatement('board', 'readAllMessage', params, sqlFormat);

  try {
    await conn.query(readAllMessage);
    res.send('모든 메세지를 읽음처리 하였습니다');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 모두 삭제
router.post('/deleteall', (req, res) => {
  deleteAllMessage(req, res);
});

async function deleteAllMessage(req, res) {
  let params = req.user[0];
  let conn = await pool.getConnection();

  let deleteAllMessage = mybatisMapper.getStatement('board', 'deleteAllMessage', params, sqlFormat);

  try {
    await conn.query(deleteAllMessage);
    res.send('모든 메세지를 삭제처리 하였습니다');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}
module.exports = router;
