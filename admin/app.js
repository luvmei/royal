const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, { cors: { origin: '*' }, methods: ['GET', 'POST'] });
const path = require('path');
const ejs = require('ejs');
const { pool, sqlFormat } = require('./mariadb');
const mybatisMapper = require('./mybatis-mapper');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const moment = require('moment-timezone');
const userRouter = require('./routes/user');
const JSONbig = require('json-bigint');
const betHandler = require('./public/js/betApiHandler');
const api = require(`./public/js/api/${process.env.API_TYPE}`);
const socket = require('./socket');
const xss = require('xss');

// 기본 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views/ejs'));
app.use('/public', express.static(path.join(__dirname, './public')));
app.set('trust proxy', 1);

// #region 미들웨어
// 바디파서
app.use(express.urlencoded({ extended: true }));

// #region 블랙리스트
let blacklistedIps = [];

updateBlacklistedIps();
setInterval(updateBlacklistedIps, 1000 * 60 * 60);

async function updateBlacklistedIps() {
  let conn;
  const sql = mybatisMapper.getStatement('user', 'getBlackList', null, sqlFormat);

  try {
    conn = await pool.getConnection();
    const results = await conn.query(sql);
    blacklistedIps = results.map((row) => row.ip);
  } catch (error) {
    console.error('DB error:', error);
  } finally {
    if (conn) return conn.release();
  }
}

app.use((req, res, next) => {
  if (blacklistedIps.includes(req.ip)) {
    return res.status(403).send('네트워크 오류 발생');
  }
  next();
});
// #endregion

// #region 세션
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  clearExpired: true,
  checkExpirationInterval: 1000 * 60 * 10,
  expiration: 1000 * 60 * 60,
};

const sessionStore = new MySQLStore(dbConfig);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: 'connect.sid.a',
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
    rolling: true,
  })
);

app.use((req, res, next) => {
  // 원래의 touch 함수를 백업
  const originalTouch = req.session.touch;

  req.session.touch = function () {
    // noSessionTouch 플래그가 true인 경우 touch를 수행하지 않음
    if (!req.noSessionTouch) {
      originalTouch.call(this);
    }
  };
  next();
});
app.use(cors());
// #endregion

// #region 보안
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ddos 공격 예방

// let requestCounter = 0;

// app.use((req, res, next) => {
//   requestCounter += 1;
//   console.log(`Request number: ${requestCounter}`);
//   next();
// });

app.use(
  rateLimit({
    windowMs: 1000 * 60 * 3,
    max: 3000,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(async (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user[0];
  } else {
    res.locals.user = null;
  }
  next();
});
// #endregion

// #region 로그인 풀림 시
app.use((req, res, next) => {
  if (req.path === '/auth/login') {
    return next();
  }
  if (!req.user) {
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
      return res.json([]);
    } else {
      return res.render(`login`, { layout: false });
    }
  }
  next();
});
// #endregion

// #region XSS 공격 예방
let ipAttackCounts = {};

function containsSpecialCharacters(input) {
  const specialCharactersXSS = /[<>"';:()]/;
  const specialCharactersSQL = /['";%\-#||&&\/\*]/;

  return specialCharactersXSS.test(input) || specialCharactersSQL.test(input);
}

async function checkXssAttack(req, res, next) {
  if (!req.path.startsWith('/auth')) {
    return next();
  }

  let params = {};
  params.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;

  const sanitizedBody = {};
  let isSanitized = false;

  for (const key in req.body) {
    if (key === '문의일시' || key === '답변일시') {
      sanitizedBody[key] = req.body[key];
      continue;
    }
    const originalValue = req.body[key];
    const sanitizedValue = xss(originalValue);
    const isDangerous = containsSpecialCharacters(originalValue);

    sanitizedBody[key] = sanitizedValue;

    if (originalValue !== sanitizedValue || isDangerous) {
      params.pattern = originalValue;
      console.log(`[XSS 공격감지] ${key}:`, originalValue);
      isSanitized = true;
    }
  }

  if (isSanitized) {
    if (!ipAttackCounts[params.ip]) {
      ipAttackCounts[params.ip] = 0;
    }

    checkBlackList(params, 'add');
    ipAttackCounts[params.ip]++;

    console.log('공격횟수:', ipAttackCounts[params.ip]);

    if (ipAttackCounts[params.ip] >= 3) {
      await checkBlackList(params, 'confirm');
      console.log(`공격IP: ${req.ip} / 공격횟수 초과로 차단`);
      delete ipAttackCounts[params.ip];
      await updateBlacklistedIps();
      return res.status(403).send({ message: '네트워크 오류 발생' });
    }

    if (req.path === '/user/login') {
      return res.send({ message: '아이디와 비밀번호를 확인하세요', isLogin: false });
    } else if (req.path === '/user/doublecheck') {
      let type;

      switch (req.body.type) {
        case 'id':
          type = '아이디';
          break;
        case 'nickname':
          type = '닉네임';
          break;
        case 'phone':
          type = '전화번호';
          break;
        case 'code':
          type = '가입코드';
          break;
        case 'recommend':
          type = '추천인';
          break;
      }
      console.log(`공격감지로 ${type} 중복확인 차단`);
      return res.send(false);
    } else if (req.path === '/user/join') {
      console.log('공격감지로 회원가입 차단');
      return res.send({ message: '회원가입에 실패했습니다. 다시 시도해주세요', isLogin: false });
    }
  }

  req.body = sanitizedBody;
  next();
}

async function checkBlackList(params, type) {
  let conn = await pool.getConnection();
  let sql;

  if (type == 'add') {
    sql = mybatisMapper.getStatement('user', 'addBlackList', params, sqlFormat);
  } else if (type == 'confirm') {
    sql = mybatisMapper.getStatement('user', 'confirmBlackList', params, sqlFormat);
  }

  try {
    await conn.query(sql);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

app.use(checkXssAttack);
// #endregion

// #endregion

// #region 라우터 등록
app.use('/user', userRouter.router);
app.use('/bank', require('./routes/bank.js'));
app.use('/auth', require('./routes/auth.js'));
app.use('/log', require('./routes/log'));
app.use('/agent', require('./routes/agent.js'));
app.use('/income', require('./routes/income.js'));
app.use('/board', require('./routes/board.js'));
app.use('/game', require('./routes/game.js'));
app.use('/setting', require('./routes/setting.js'));
app.use('/detail', require('./routes/detail.js'));
app.use('/event', require('./routes/event.js'));
// #endregion

// #region 라우트
//? 테이블 뷰
let sport = process.env.SPORT_VIEW;
let lotto = process.env.EVENT_LOTTERY;
let death = process.env.DEATH_VIEW;

app.get('/', async (req, res) => {
  if (req.user) {
    let summary = await getData(res, 'getAgentSummary');
    summary = JSON.parse(summary);
    summary = getAgentSummary(summary);
    res.render('index.ejs', { summary: summary, user: req.user[0], sport: sport, lotto: lotto, death: death });
  } else {
    res.render('login.ejs', { sport: sport });
  }
});

function getAgentSummary(summary) {
  const types = [0, 1, 2, 3, 4];
  for (const type of types) {
    if (!summary.some((item) => item.type == type)) {
      summary.push({ type: type, total_count: 0, total_balance: 0, total_point: 0 });
    }
  }
  summary.sort((a, b) => a.type - b.type);
  return summary;
}

app.get('/:menu', (req, res) => {
  if (req.params.menu === 'favicon.ico') {
    return res.status(204).send(); // 또는 적절한 처리
  }

  if (req.user) {
    req.user[0].lotto = process.env.EVENT_LOTTERY;
    res.render(req.params.menu, { user: req.user[0], sport: sport, lotto: lotto, death: death });
  } else {
    res.redirect('/');
  }
});

//? 대시보드
app.post('/adminonline', async (req, res) => {
  if (onlineUsers.length != 0 && req.user) {
    params = { ids: onlineUsers, node_id: req.user[0].node_id };
    let result = await getData(res, 'adminOnlineUsers', params);
    res.send(result);
  } else {
    res.send([]);
  }
});

app.post('/agentonline', async (req, res) => {
  if (req.user && onlineUsers.length != 0) {
    params = { ids: onlineUsers, node_id: req.user[0].node_id };
    let result = await getData(res, 'agentOnlineUsers', params);
    res.send(result);
  } else {
    res.send([]);
  }
});

app.post('/navbar', async (req, res) => {
  if (req.user) {
    getNavbarData(req, res, onlineUsers);
  } else {
    res.send('로그인이 필요합니다.');
  }
});

app.post('/adminbalance', async (req, res) => {
  if (req.user && req.user[0].type === 9) {
    res.send({ balance: req.user[0].balance });
  } else {
    res.send('로그인이 필요합니다.');
  }
});

const getQueryResult = async (conn, queryData) => {
  let result = await conn.query(queryData);
  result = JSONbig.stringify(result[0]);
  return JSON.parse(result);
};

async function getNavbarData(req, res, onlineUsers) {
  const userType = req.user[0].type;
  const isAdmin = userType === 9;
  const isAgent = userType !== 4;
  let conn = await pool.getConnection();

  try {
    let dashboardQueries = {
      giveTakeData: isAdmin ? 'getAdminGiveTakeData' : isAgent ? 'getAgentGiveTakeData' : null,
      summaryData: isAdmin ? 'getAdminSummaryData' : isAgent ? 'getAgentSummaryData' : null,
      navData: isAdmin ? 'getAdminNavData' : isAgent ? 'getAgentNavData' : null,
      todayJoinCount: 'countTodayJoinUser',
    };

    let responseData = {};
    for (let key in dashboardQueries) {
      if (dashboardQueries[key]) {
        const queryData = mybatisMapper.getStatement('dashboard', dashboardQueries[key], isAdmin ? {} : req.user[0], sqlFormat);
        responseData[key] = await getQueryResult(conn, queryData);
      }
    }
    responseData.countOnlineUsers = (onlineUsers || []).length;

    res.send(responseData);
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) conn.release();
  }
}

app.post('/tempclear', async (req, res) => {
  clearTempBettingInfo(res, req.body);
});

app.post('/bankchart', async (req, res) => {
  let result = await getData(res, 'getBankChart');
  res.send(result);
});

//? 소켓
app.post('/clientId', (req, res) => {
  if (req.user) {
    res.send(req.user[0]);
  } else {
    res.send('로그인이 필요합니다.');
  }
});

app.post('/notification', (req, res) => {
  getNotificationCount(req, res);
});

app.post('/offalram', (req, res) => {
  offAlram();
  res.send('알림끄기');
});

app.post('/bet'),
  (req, res) => {
    console.log(req.body);
    res.send('ok');
  };

app.post('/envinfo', (req, res) => {
  let envInfo = {
    lotto: process.env.EVENT_LOTTERY,
  };
  res.send(envInfo);
});
// #endregion

// #region 소켓서버
let onlineUsers = [];
const disconnectTimeouts = {};
const clients = {};

io.on('connection', async (socket) => {
  const clientId = socket.handshake.query.clientId;
  const clientType = socket.handshake.query.clientType;

  if (clientType == 4) {
    if (disconnectTimeouts[clientId]) {
      clearTimeout(disconnectTimeouts[clientId]);
      delete disconnectTimeouts[clientId];
    }

    for (const [id, client] of Object.entries(clients)) {
      if ((client.clientId === clientId && id !== socket.id) || clientId == undefined) {
        // 기존 소켓 연결 해제
        const existingSocket = io.sockets.sockets.get(id);
        if (existingSocket) {
          existingSocket.disconnect(true);
        }
        // clients 객체에서 제거
        delete clients[id];
      }
    }
  }

  // 새로운 클라이언트 정보 등록
  clients[socket.id] = { clientId, clientType, lastHeartbeat: Date.now() };

  // 클라이언트 목록 출력
  Object.values(clients).forEach((client, index) => {
    // console.log(`접속자 ${index}번:`);
    // console.log(client);
  });

  // userId로 룸에 참가하기
  socket.join(clientId);
  // userType으로 룸에 참가하기
  socket.join(clientType);

  socket.on('error', function (error) {
    console.error('Error:', error);
  });

  socket.on('to_admin', (data) => {
    if (data.type !== 'updateOnlineUsers') {
      updateNotification(data.type);
    }
    io.to('admin').emit(data.type, data.userId);
  });

  socket.on('to_user', (data) => {
    if (data.type !== 'sendMessage') {
      updateNotification(data.type);
      io.to('admin').emit('update_icon', data.type);
    }
    io.to(data.id).emit('to_user', data);
  });

  socket.on('checkIcon', (data) => {
    updateNotification(data);
  });

  socket.on('forceDisconnect', (data) => {
    console.log('강제종료:', data);
    // io.to(data).emit('forceDisconnect');
  });

  // socket.on('error', (data) => {
  //   console.log('오류메시지 수신:', data);
  //   io.emit('error', data);
  // });

  socket.on('heartbeat', () => {
    if (clients[socket.id]) {
      clients[socket.id].lastHeartbeat = Date.now();
    }
  });

  socket.on('disconnect', async () => {
    // const sessionOutInterval = 3;
    // const client = clients[socket.id];
    // if (client && client.clientType === '4') {
    //   updateUserBalances();
    //   if (disconnectTimeouts[client.clientId]) {
    //     console.log('연결해제 타이머있었음', disconnectTimeouts[client.clientId]);
    //     clearTimeout(disconnectTimeouts[client.clientId]);
    //     delete disconnectTimeouts[client.clientId];
    //   }
    //   disconnectTimeouts[client.clientId] = setTimeout(async () => {
    //     let checkSession = await checkDisconnectedUser(client.clientId);
    //     if (checkSession == 1) {
    //       deleteDisconectedUser(client.clientId);
    //       let loginInfo = await getLoginInfo(client.clientId);
    //       loginInfo.time = userRouter.getCurrentTime();
    //       loginInfo.type = '세션아웃';
    //       loginInfo.domain = loginInfo.connect_domain;
    //       insertConnectInfo(loginInfo);
    //       console.log(`세션아웃: [ ID: ${client.clientId} ]`);
    //     }
    //     delete clients[socket.id];
    //     delete disconnectTimeouts[client.clientId];
    //   }, 1000 * 60 * sessionOutInterval);
    // }
  });
});

const connectedSockets = io.sockets.sockets;
connectedSockets.forEach((socket, socketId) => {
  console.log(`Socket connected with id: ${socketId}`);
});
// #endregion

// #region 소켓관련 함수
async function getNotificationCount(req, res) {
  let conn = await pool.getConnection();

  let sql = mybatisMapper.getStatement('socket', 'checkNotification', {}, sqlFormat);
  let offAlram = mybatisMapper.getStatement('socket', 'offAlram', {}, sqlFormat);

  try {
    result = await conn.query(sql);
    if (result[0].deposit == 0 && result[0].withdraw == 0 && result[0].join == 0 && result[0].question == 0) {
      await conn.query(offAlram);
    }
    if (req.user && req.user[0]) {
      res.send({ result: result, user: req.user[0] });
    } else {
      res.send({ result: result, user: null });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function updateNotification(type) {
  let conn = await pool.getConnection();

  if (type == 'requestUserDeposit' || type == 'requestAgentDeposit') {
    type = 'requestDeposit';
  } else if (type == 'requestUserWithdraw' || type == 'requestAgentWithdraw') {
    type = 'requestWithdraw';
  } else if (type == 'confirmDepositAttendant') {
    type = 'confirmDeposit';
  } else if (type == 'cancelDeposit') {
    type = 'cancelDeposit';
  } else if (type == 'confirmWithdraw') {
    type = 'confirmWithdraw';
  }

  let sql = mybatisMapper.getStatement('socket', type, {}, sqlFormat);

  try {
    result = await conn.query(sql);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function checkDisconnectedUser(clientId) {
  let conn = await pool.getConnection();
  let chaeckDisconectedUser = mybatisMapper.getStatement('socket', 'checkDisconnectedUser', { userId: clientId }, sqlFormat);

  try {
    let result = await conn.query(chaeckDisconectedUser);
    return result.length;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function deleteDisconectedUser(clientId) {
  let conn = await pool.getConnection();
  let deleteDisconectedUser = mybatisMapper.getStatement('socket', 'deleteDisconnectedUser', { userId: clientId }, sqlFormat);

  try {
    await conn.query(deleteDisconectedUser);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getLoginInfo(clientId) {
  let conn = await pool.getConnection();
  let getLoginInfo = mybatisMapper.getStatement('socket', 'getLoginInfo', { userId: clientId }, sqlFormat);

  try {
    let result = await conn.query(getLoginInfo);
    return result[0];
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function insertConnectInfo(connectParams) {
  let conn = await pool.getConnection();

  try {
    let insertConnectInfo = mybatisMapper.getStatement('auth', 'insertConnectInfo', connectParams, sqlFormat);
    await conn.query(insertConnectInfo);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function offAlram() {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('socket', 'offAlram', {}, sqlFormat);

  try {
    await conn.query(sql);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

// 하트비트 관련 현재 사용안함
function checkClientConnections() {
  let deleteInterval;

  for (const [id, client] of Object.entries(clients)) {
    let lastActivity = (Date.now() - client.lastHeartbeat) / 1000;
    console.log(`[클라이언트] 아이디: ${client.clientId} / 타입: ${client.clientType} / 마지막 활동 후: ${lastActivity}초`);

    if (client.clientType == 4) {
      deleteInterval = 60000;
    } else if (client.clientType == 9) {
      deleteInterval = 120000;
    }

    if (client.clientType == 4) {
      if (Date.now() - client.lastHeartbeat > deleteInterval) {
        const socket = io.sockets.sockets.get(id);
        if (socket) {
          socket.disconnect(true);
          delete clients[id];
        }
      }
    }
  }
}
// #endregion

// #region 데이터베이스
let betUsers = [];

async function getData(res, type, params = {}) {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('dashboard', type, params, sqlFormat);

  try {
    let result = await conn.query(sql);
    result = JSONbig.stringify(result);
    return result;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function updateCombineAssets() {
  let allUsers;
  let conn = await pool.getConnection();
  let getAllUsers = mybatisMapper.getStatement('log', 'getAllUsers', {}, sqlFormat);
  try {
    allUsers = await conn.query(getAllUsers);
    allUsers.forEach(async (el) => {
      let getParams = el;
      let getCombineAssets = mybatisMapper.getStatement('log', 'getCombineAssets', getParams, sqlFormat);
      let combineAssets = await conn.query(getCombineAssets);

      let updateParams = combineAssets[0][0];
      let updateCombineAssets = mybatisMapper.getStatement('log', 'updateCombineAssets', updateParams, sqlFormat);
      await conn.query(updateCombineAssets);
    });
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function clearTempBettingInfo(res, params) {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('dashboard', 'clearTempBettingInfo', params, sqlFormat);
  try {
    await conn.query(sql);
    res.send('임시내역 삭제 완료');
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function filterUsers(userIds) {
  let conn = await pool.getConnection();
  let getUsersWithType4 = mybatisMapper.getStatement('user', 'getUsersWithType4', { userIds }, sqlFormat);

  try {
    let result = await conn.query(getUsersWithType4);
    return result.map((row) => row.id);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function getLoggedId() {
  let conn = await pool.getConnection();
  let getLoggedId = mybatisMapper.getStatement('socket', 'getLoggedId', {}, sqlFormat);

  try {
    let result = await conn.query(getLoggedId);
    return result.map((row) => row.id);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function insertSessionOutInfo(id) {
  let loginInfo = await getLoginInfo(id);
  loginInfo.time = userRouter.getCurrentTime();
  loginInfo.type = '세션아웃';
  loginInfo.domain = loginInfo.connect_domain;
  insertConnectInfo(loginInfo);
  console.log(`세션아웃: [ ID: ${id} ]`);
}

async function getUserId(username) {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('user', 'getUserId', { id: username }, sqlFormat);

  try {
    const result = await conn.query(sql);

    if (!result[0] || result[0].user_id === undefined) {
      return null;
    }

    const userId = result[0].user_id;
    return userId;
  } catch (error) {
    console.error('유저 ID 조회 중 오류 발생:', error);
  } finally {
    if (conn) conn.release();
  }
}

async function updateUserAssetInfo(userAssetParams) {
  let conn;
  try {
    conn = await pool.getConnection();

    let sql = mybatisMapper.getStatement('user', 'upsertUserAssetInfoTune', { userAssetParams: userAssetParams }, sqlFormat);
    await conn.query(sql);
  } catch (error) {
    if (conn) await conn.rollback(); // 오류 발생 시 트랜잭션 롤백
    console.error('Batch update of user asset info failed:', error);
  } finally {
    if (conn) conn.release(); // 데이터베이스 연결 해제
  }
}
// #endregion

// #region 유저밸런스 업데이트
async function checkOnlineUsers() {
  const previousOnlineUsers = [...onlineUsers];

  let loggedIds = await getLoggedId();
  onlineUsers = [...new Set([...loggedIds])];

  const loggedOutIds = previousOnlineUsers.filter((id) => !onlineUsers.includes(id));

  loggedOutIds.forEach((id) => insertSessionOutInfo(id));
}

async function updateUserBalanceInDB(params) {
  let conn = await pool.getConnection();
  let checkType = mybatisMapper.getStatement('log', 'checkUserType', params, sqlFormat);
  let updateBalance = mybatisMapper.getStatement('log', 'updateUserBalance', params, sqlFormat);
  try {
    let result = await conn.query(checkType);
    if (result[0].type == 4) {
      await conn.query(updateBalance);
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

const updateUserBalances = async () => {
  await checkOnlineUsers();

  if (onlineUsers.length != 0) {
    onlineUsers = await filterUsers(onlineUsers);
    await Promise.all(
      onlineUsers.map(async (el) => {
        let apiInfo = await api.updateUserBalance(el);
        if (!apiInfo) {
          return;
        } else if (apiInfo.status == 200) {
          let params = { id: el, balance: apiInfo.balance };
          updateUserBalanceInDB(params);
        }
      })
    );

    if (onlineUsers.length != 0) {
      updateCombineAssets();
    }
  }
  api.updateAdminBalance();
  socket.emit('to_admin', { id: '', type: 'updateOnlineUsers' });
};

async function updateAllUserBalance() {
  const userAssetParams = [];

  const updateAllUserBalance = await api.updateAllUserBalance();

  for (const { username, balance } of updateAllUserBalance) {
    try {
      const userId = await getUserId(username);
      if (userId) {
        userAssetParams.push({
          user_id: userId,
          username,
          balance,
        });
      }
    } catch (error) {
      console.error('오류발생:', username, error);
    }
  }

  if (userAssetParams.length !== 0) {
    await updateUserAssetInfo(userAssetParams);
  }
}

// #endregion

const logOnlineUsersAndRequestDetails = async () => {
  await checkOnlineUsers();
  betUsers = (await api.requestDetailLog()) || [];
  await betHandler.requestSummaryLog();

  onlineUsers = [...new Set([...betUsers, ...onlineUsers])];

  if (onlineUsers.length != 0) {
    console.log('접속 유저목록: ', onlineUsers);
  } else {
    console.log('[ 접속한 유저가 없습니다 ]');
  }
};

http.listen(process.env.ADMIN_PORT, '0.0.0.0', () => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const timeUntilMidnight = midnight - now - 1000;

  setTimeout(updateUserBalances, timeUntilMidnight);
  setInterval(updateUserBalances, 1000 * 5);
  setInterval(updateAllUserBalance, 1000 * 20);
  setInterval(logOnlineUsersAndRequestDetails, 1000 * 90);

  // setInterval(checkClientConnections, 1000 * 5);

  console.log(`Example app listening on port ${process.env.ADMIN_PORT}`);
});
