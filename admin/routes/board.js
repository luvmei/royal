const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('../mybatis-mapper');
const moment = require('moment-timezone');
const socket = require('../socket');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// 파일 필터 함수 생성
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  }
};

// Multer 설정
const popupStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/popup');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/banner');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadNotice = multer({
  storage: popupStorage,
  fileFilter: fileFilter,
}).single('uploadFile');

const uploadBanner = multer({
  storage: bannerStorage,
  fileFilter: fileFilter,
}).fields([
  { name: 'uploadBannerFile', maxCount: 1 },
  { name: 'uploadContentFile', maxCount: 1 },
]);

// socket.io 설정

// #region 테이블 뷰
router.post('/table', (req, res) => {
  if (req.body.type === 'notice') {
    getData(res, req.body.type, { noticeRange: req.user[0].type });
  } else {
    getData(res, req.body.type, req.user[0]);
  }
});

router.post('/agent', (req, res) => {
  if (req.user[0].type != 9) {
    getData(res, req.body.type, req.user[0]);
  } else {
    res.send({ message: 'No Data' });
  }
});

async function getData(res, type, params = {}) {
  let conn = await pool.getConnection();

  let getData = mybatisMapper.getStatement('board', type, params, sqlFormat);

  try {
    let result = await conn.query(getData);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 공지사항
//? 공지 등록
router.post(
  '/write',
  uploadNotice,
  (req, res, next) => {
    if (req.file) {
      req.body.filename = req.file.originalname;
    }
    writeNotice(req, res, req.body).catch(next);
  },
  (error, req, res, next) => {
    res.send({ isSuccess: false, msg: '이미지 파일만 업로드 가능' });
  }
);

async function writeNotice(req, res, params) {
  if (!params.filename) {
    params.filename = '';
  }

  let conn = await pool.getConnection();
  let writeNotice;
  let modifyPopup;

  if (req.file) {
    const sourcePath = path.join(__dirname, '../public/uploads/popup', req.file.filename);
    const destPath = path.join(__dirname, '../../user/client/public/uploads/popup', req.file.filename);

    fs.copyFile(sourcePath, destPath, (err) => {
      if (err) {
        console.error('Error while copying file:', err);
        return res.status(500).send('Failed to copy file.');
      }
    });
  }

  if (params.isNew == 'true') {
    writeNotice = mybatisMapper.getStatement('board', 'insertNotice', params, sqlFormat);
  } else if (params.isNew == 'false') {
    writeNotice = mybatisMapper.getStatement('board', 'updateNotice', params, sqlFormat);
    modifyPopup = mybatisMapper.getStatement('board', 'modifyPopup', params, sqlFormat);
  }

  try {
    await conn.query(writeNotice);
    if (params.isNew == 'true') {
      res.send({ isSuccess: true, msg: '새 글 등록이 완료되었습니다' });
    } else if (params.isNew == 'false') {
      await conn.query(modifyPopup);
      res.send({ isSuccess: true, msg: '글 수정이 완료되었습니다' });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 글 삭제
router.post('/delete', (req, res) => {
  deleteContent(res, req.body);
});

async function deleteContent(res, params) {
  let conn = await pool.getConnection();
  let deleteContent;

  if (params.카테고리 == 'notice') {
    deleteContent = mybatisMapper.getStatement('board', 'deleteNotice', params, sqlFormat);
  }

  try {
    await conn.query(deleteContent);
    res.send('글이 삭제되었습니다');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 팝업
router.post('/insertpopup', async (req, res) => {
  let emptyPopup = await countEmptyPopup();

  if (emptyPopup === 0) {
    res.send({ isUpdate: false, msg: '사용할 수 있는 팝업이 없습니다' });
  } else {
    req.body.popupIdx = emptyPopup;
    req.body.title = req.body.제목;
    req.body.content = req.body.내용;
    req.body.file = req.body.파일명;
    await updateNoticeToPopup(req.body);
    res.send({ isUpdate: true, msg: '팝업이 변경되었습니다' });
  }
});

async function countEmptyPopup() {
  let conn = await pool.getConnection();
  let countInsertedNotice = mybatisMapper.getStatement('board', 'countInsertedNotice', {}, sqlFormat);

  try {
    let result = await conn.query(countInsertedNotice);

    if (result.length === 0) {
      return 0;
    } else {
      return result[0].popup_id;
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function updateNoticeToPopup(params) {
  let conn = await pool.getConnection();
  let updatePopup = mybatisMapper.getStatement('board', 'updatePopup', params, sqlFormat);
  let updateNotice = mybatisMapper.getStatement('board', 'updateNoticePopupInfo', params, sqlFormat);

  try {
    await conn.beginTransaction();
    let result = await conn.query(updatePopup);
    await conn.query(updateNotice);
    await conn.commit();
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/deletepopup', async (req, res) => {
  req.body.popupIdx = req.body.팝업;
  deleteNoticeToPopup(req.body);
  res.send({ msg: '팝업이 삭제되었습니다' });
});

async function deleteNoticeToPopup(params) {
  let conn = await pool.getConnection();
  let deletePopup = mybatisMapper.getStatement('board', 'deletePopup', params, sqlFormat);
  let deleteNotice = mybatisMapper.getStatement('board', 'deleteNoticePopupInfo', params, sqlFormat);

  try {
    await conn.beginTransaction();
    await conn.query(deletePopup);
    await conn.query(deleteNotice);
    await conn.commit();
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

// #endregion

// #region 메세지
router.post('/send', (req, res) => {
  req.body.sendTime = getCurrentTime();
  console.log(req.body);
  if (req.body.selectedUser) {
    req.body.messageType = '개별';
  }
  sendMessage(res, req.body);
});

async function sendMessage(res, params) {
  console.log(params);
  if (params.sendRange) {
    switch (params.sendRange) {
      case '0':
        params.receiver = '플래티넘만';
        break;
      case '1':
        params.receiver = '골드까지';
        break;
      case '2':
        params.receiver = '실버까지';
        break;
      case '3':
        params.receiver = '브론즈까지';
        break;
      case '4':
        params.receiver = '전체유저';
        break;
    }
  } else {
    params.receiver = params.selectedUser;
  }

  let conn = await pool.getConnection();
  let checkUser = mybatisMapper.getStatement('board', 'checkUser', params, sqlFormat);
  let insertSendMessage = mybatisMapper.getStatement('board', 'insertSendMessage', params, sqlFormat);
  let insertReceiveMessage = mybatisMapper.getStatement('board', 'insertReceiveMessage', params, sqlFormat);
  try {
    if (!params.sendRange) {
      let isUser = await conn.query(checkUser);
      if (Number(isUser[0].count) === 0) {
        res.send({ msg: '존재하지 않는 유저입니다', send: false });
        return;
      }
    }
    await conn.beginTransaction();
    await conn.query(insertSendMessage);
    await conn.query(insertReceiveMessage);
    await conn.commit();

    // todo 에이전트 메세지 전송
    switch (params.sendRange) {
      case '0':
        socket.emit('to_user', { id: '0', type: 'sendMessage' });
        break;
      case '1':
        socket.emit('to_user', { id: '0', type: 'sendMessage' });
        socket.emit('to_user', { id: '1', type: 'sendMessage' });
        break;
      case '2':
        socket.emit('to_user', { id: '0', type: 'sendMessage' });
        socket.emit('to_user', { id: '1', type: 'sendMessage' });
        socket.emit('to_user', { id: '2', type: 'sendMessage' });
        break;
      case '3':
        socket.emit('to_user', { id: '0', type: 'sendMessage' });
        socket.emit('to_user', { id: '1', type: 'sendMessage' });
        socket.emit('to_user', { id: '2', type: 'sendMessage' });
        socket.emit('to_user', { id: '3', type: 'sendMessage' });
        break;
      case '4':
        socket.emit('to_user', { id: '0', type: 'sendMessage' });
        socket.emit('to_user', { id: '1', type: 'sendMessage' });
        socket.emit('to_user', { id: '2', type: 'sendMessage' });
        socket.emit('to_user', { id: '3', type: 'sendMessage' });
        socket.emit('to_user', { id: '4', type: 'sendMessage' });
        break;
      default:
        socket.emit('to_user', { id: params.selectedUser, type: 'sendMessage' });
        break;
    }

    res.send({ msg: '메세지 전송완료', send: true });
  } catch (e) {
    conn.rollback();
    console.log('오류로인한 롤백');
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/messagestate', (req, res) => {
  updateMessageState(req, res);
});

async function updateMessageState(req, res) {
  let params = req.body;
  let updateState;
  let conn = await pool.getConnection();

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

router.post('/readcheck', (req, res) => {
  checkReadMessage(req, res);
});

//? 모두 읽음
async function checkReadMessage(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();

  if (Object.keys(params).length === 0) {
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

// #region 문의사항
router.post('/answer', (req, res) => {
  req.body.reply = req.body.답변;
  req.body.answerTime = getCurrentTime();
  answerQuestion(res, req.body);
});

async function answerQuestion(res, params) {
  let conn = await pool.getConnection();
  let answerQuestion = mybatisMapper.getStatement('board', 'answerQuestion', params, sqlFormat);
  try {
    await conn.query(answerQuestion);
    socket.emit('to_user', { id: params.아이디, type: 'answerQuestion' });

    res.send('답변을 등록했습니다');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/modifyanswer', (req, res) => {
  req.body.reply = req.body.답변;
  req.body.answerTime = getCurrentTime();
  modifyAnswer(res, req.body);
});

async function modifyAnswer(res, params) {
  let conn = await pool.getConnection();
  let modifyAnswer = mybatisMapper.getStatement('board', 'modifyAnswer', params, sqlFormat);
  try {
    await conn.query(modifyAnswer);
    res.send('답변을 수정했습니다');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/agentquestion', (req, res) => {
  insertAgentQuestion(req, res);
});

async function insertAgentQuestion(req, res) {
  let params = req.body;
  params.id = req.user[0].id;
  params.user_type = req.user[0].type;
  params.time = getCurrentTime();

  let conn = await pool.getConnection();
  let agentQuestion = mybatisMapper.getStatement('board', 'insertAgentQuestion', params, sqlFormat);

  try {
    await conn.query(agentQuestion);
    res.send({ message: '문의가 접수되었습니다', id: req.user[0] });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/questionstate', (req, res) => {
  updateQuestionState(req, res);
});

async function updateQuestionState(req, res) {
  let params = req.body;
  let updateState;
  let conn = await pool.getConnection();

  if (params.상태 && params.상태 == '답변완료') {
    params.state = '답변확인';
    updateState = mybatisMapper.getStatement('board', 'updateQuestionState', params, sqlFormat);
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

router.post('/macro', (req, res) => {
  if (req.body.type == 'getMacroData') {
    getData(res, req.body.type);
  } else if (req.body.type == 'updateMacroData') {
    updateMacroData(res, req.body);
  }
});

async function updateMacroData(res, params) {
  delete params.type;
  let conn = await pool.getConnection();

  try {
    for (let macro of params.macros) {
      let updateMacroData = mybatisMapper.getStatement('board', 'updateMacroData', macro, sqlFormat);
      await conn.query(updateMacroData);
    }
    res.json({ isChange: true, msg: '매크로 업데이트 성공' });
  } catch (error) {
    res.json({ isChange: false, msg: '매크로 업데이트 실패' });
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 이벤트배너
//? 이벤트 배너 등록
router.post(
  '/banner/write',
  uploadBanner,
  (req, res, next) => {
    if (req.files.uploadBannerFile) {
      req.body.bannerFilename = req.files.uploadBannerFile[0].originalname;
    }
    if (req.files.uploadContentFile) {
      req.body.contentFilename = req.files.uploadContentFile[0].originalname;
    }
    writeEventBanner(req, res, req.body).catch(next);
  },
  (error, req, res, next) => {
    res.send({ isSuccess: false, msg: '이미지 파일만 업로드 가능' });
  }
);

async function writeEventBanner(req, res, params) {
  if (!params.bannerFilename) {
    params.bannerFilename = '';
  }
  if (!params.contentFilename) {
    params.contentFilename = '';
  }

  let conn = await pool.getConnection();
  let bannerSql;

  for (let fileKey of ['uploadBannerFile', 'uploadContentFile']) {
    if (req.files[fileKey] && req.files[fileKey][0]) {
      const file = req.files[fileKey][0];
      const sourcePath = path.join(__dirname, '../public/uploads/banner', file.filename);
      const destPath = path.join(__dirname, '../../user/public/uploads/banner', file.filename);

      fs.copyFile(sourcePath, destPath, (err) => {
        if (err) {
          console.error('Error while copying file:', err);
          return res.status(500).send('Failed to copy file.');
        }
      });
    }
  }

  if (params.isNew == 'true') {
    bannerSql = mybatisMapper.getStatement('board', 'insertEventBanner', params, sqlFormat);
  } else if (params.isNew == 'false') {
    console.log('수정 시 파라미터 : ', params);
    bannerSql = mybatisMapper.getStatement('board', 'updateEventBanner', params, sqlFormat);
  }
  try {
    await conn.query(bannerSql);
    if (params.isNew == 'true') {
      res.send({ isSuccess: true, msg: '새 이벤트배너 등록이 완료되었습니다' });
    } else if (params.isNew == 'false') {
      res.send({ isSuccess: true, msg: '이벤트배너의 수정이 완료되었습니다' });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 이벤트 배너 삭제
router.post('/banner/delete', (req, res) => {
  deleteEventBanner(req, res);
});

async function deleteEventBanner(req, res) {
  let params = req.body;
  params.idx = parseInt(params.순번);
  let conn = await pool.getConnection();

  let deleteBanner = mybatisMapper.getStatement('board', 'deleteEventBanner', params, sqlFormat);

  try {
    await conn.query(deleteBanner);

    // DB에서 정보를 삭제한 후 실제 파일 삭제
    if (params.배너이미지) {
      await deleteEventBannerImage(params.배너이미지);
    }
    if (params.내용이미지) {
      await deleteEventBannerImage(params.내용이미지);
    }

    res.send({ isSuccess: true, msg: '이벤트배너 삭제가 완료되었습니다' });
  } catch (e) {
    console.log(e);
    res.status(500).send({ isSuccess: false, msg: '이벤트배너 삭제 중 문제가 발생했습니다' });
  } finally {
    if (conn) return conn.release();
  }
}

async function deleteEventBannerImage(fileName) {
  // 삭제할 경로 두 개를 배열로 정의합니다.
  const basePaths = [
    path.join(__dirname, '..', 'public', 'uploads', 'banner'), // admin 경로
    path.join(__dirname, '..', '..', 'user', 'public', 'uploads', 'banner'), // user 경로
  ];

  // 각 경로에 대해 파일 삭제 작업을 수행합니다.
  const deletePromises = basePaths.map((directoryPath) => {
    const filePath = path.join(directoryPath, fileName);

    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          // 파일이 없거나 다른 문제가 발생했을 때 거부합니다.
          reject(`파일삭제 실패 : ${fileName}. Error: ${err.message}`);
        } else {
          console.log(`파일삭제 성공: ${fileName}`);
          resolve();
        }
      });
    });
  });

  // 모든 삭제 프로미스가 완료될 때까지 대기합니다.
  return Promise.all(deletePromises);
}
// async function deleteEventBannerImage(fileName) {
//   const directoryPath = path.join(__dirname, '..', 'public', 'uploads', 'banner');
//   const filePath = path.join(directoryPath, fileName);

//   return new Promise((resolve, reject) => {
//     fs.unlink(filePath, (err) => {
//       if (err) {
//         reject(`파일삭제 실패 : ${fileName}. Error: ${err.message}`);
//       } else {
//         console.log(`파일삭제 성공: ${fileName}`);
//         resolve();
//       }
//     });
//   });
// }
// #endregion

// #region 에이전트 노티체크
router.post('/agentchecknoti', (req, res) => {
  if (req.user) {
    agentCheckNoti(req, res);
  } else {
    res.send(false);
  }
});

async function agentCheckNoti(req, res) {
  let newQuestion = false;
  let newMessage = false;
  let conn = await pool.getConnection();

  let question = mybatisMapper.getStatement('board', 'agentCheckQuestion', { id: req.user[0].id }, sqlFormat);
  let message = mybatisMapper.getStatement('board', 'agentCheckMessage', { id: req.user[0].id }, sqlFormat);

  try {
    let questionResult = await conn.query(question);
    let messageResult = await conn.query(message);

    newQuestion = Number(questionResult[0].count) > 0 ? true : false;
    newMessage = Number(messageResult[0].count) > 0 ? true : false;

    res.send({ question: newQuestion, message: newMessage });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 기타 함수
function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}
// #endregion

module.exports = router;
