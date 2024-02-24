const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config({ path: './server/.env' });
const axios = require('axios');
const { pool, sqlFormat } = require('./server/mariadb');
const mybatisMapper = require('./server/mybatis-mapper');
const xss = require('xss');

// #region 기본 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './client/views/ejs'));
app.use('/public', express.static(path.join(__dirname, './client/public')));
app.set('trust proxy', 1);
const type1Domains = process.env.TYPE_1_DOMAINS.split(',').map((domain) => domain.trim());
const type2Domains = process.env.TYPE_2_DOMAINS.split(',').map((domain) => domain.trim());
let templateName;
let joinCode;
let title;
// #endregion

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
};

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: 'connect.sid.u',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(dbConfig),
    cookie: {
      expires: false,
    },
  })
);
// #endregion

// 보안
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// #region ddos 공격 예방
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5분
  max: 300,
});

function conditionalLimiter(req, res, next) {
  if (req.path === '/bank/jackpot') {
    return next();
  }

  return limiter(req, res, next);
}

app.use(conditionalLimiter);
// #endregion

// #region passport
app.use(passport.initialize());

app.use(passport.session());
// #endregion

// #region XSS 공격 예방
let ipAttackCounts = {};

async function checkXssAttack(req, res, next) {
  if (
    req.path.startsWith('/user/login') ||
    req.path.startsWith('/user/signup') ||
    req.path.startsWith('/board/question') ||
    req.path.startsWith('/user/doublecheck') ||
    req.path.startsWith('/user/change')
  ) {
    let params = {};
    params.ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;

    const sanitizedBody = {};
    let isSanitized = false;

    for (const key in req.body) {
      const originalValue = req.body[key];
      const sanitizedValue = xss(originalValue);
      let isDangerous;

      if (key === 'pw') {
        isDangerous = containsSpecialCharacters(originalValue, true);
      } else {
        isDangerous = containsSpecialCharacters(originalValue, false);
      }

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
  } else {
    return next();
  }
}

function containsSpecialCharacters(input, isPassword) {
  if (isPassword) {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const specialCharactersPassword = /[!@#$%^*+=-]/;
    return !(specialCharactersPassword.test(input) || alphanumericRegex.test(input));
  } else {
    // 기타 입력값에 대한 XSS 및 SQL 인젝션 문자 검사
    const specialCharactersXSS = /[<>"'&;:()#]/;
    const specialCharactersSQL = /['";%\-#||&&\/\*]/;
    return specialCharactersXSS.test(input) || specialCharactersSQL.test(input);
  }
}
// function containsSpecialCharacters(input) {
//   const specialCharactersXSS = /[<>"'&;:()#]/;
//   const specialCharactersSQL = /['";%\-#||&&\/\*]/;

//   return specialCharactersXSS.test(input) || specialCharactersSQL.test(input);
// }

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
app.use('/user', require('./server/routes/user.js'));
app.use('/bank', require('./server/routes/bank.js'));
app.use('/game', require('./server/routes/game.js'));
app.use('/board', require('./server/routes/board.js'));
app.use('/event', require('./server/routes/event.js'));
// #endregion

// #region 라우트
app.get('/:code?', (req, res) => {
  joinCode = req.params.code || '';
  const domainAdress = getDomain(req.headers.host);

  if (type1Domains.includes(domainAdress)) {
    templateName = `index_1.ejs`;
    theme_type = 1;
    title = process.env.TYPE_1_TITLE;
  } else if (type2Domains.includes(domainAdress)) {
    templateName = `index_2.ejs`;
    theme_type = 2;
    title = process.env.TYPE_2_TITLE;
  } else {
    templateName = `index_${process.env.DEFAULT_THEME_TYPE}.ejs`;
    theme_type = process.env.DEFAULT_THEME_TYPE;
    if (theme_type == 1) {
      title = process.env.TYPE_1_TITLE;
    } else if (theme_type == 2) {
      title = process.env.TYPE_2_TITLE;
    }
  }

  if (req.user) {
    res.render(templateName, {
      user: req.user,
      isLogin: true,
      theme_type: theme_type,
      client_title: process.env.SERVER_TITLE,
      lotto: process.env.EVENT_LOTTERY,
      attendance: process.env.EVENT_ATTENDANCE,
      joinCode: joinCode,
      title: title,
      recommend: process.env.EVENT_RECOMMEND,
      sport: process.env.SPORT_VIEW,
      landing: true,
    });
  } else {
    req.session.destroy(() => {
      res.clearCookie('connect.sid.u');
      res.render(templateName, {
        isLogin: false,
        theme_type: theme_type,
        client_title: process.env.SERVER_TITLE,
        lotto: process.env.EVENT_LOTTERY,
        attendance: process.env.EVENT_ATTENDANCE,
        joinCode: joinCode,
        title: title,
        recommend: process.env.EVENT_RECOMMEND,
        sport: process.env.SPORT_VIEW,
        landing: true,
      });
    });
  }
});

function getDomain(host) {
  let domainParts = host.split(':');
  let domain = domainParts[0];
  // let domainSegments = domain.split('.');
  // let rootDomain = domainSegments.slice(-2).join('.');

  return domain;
}

app.post('/joincode', (req, res) => {
  res.send(joinCode);
});

app.post('/popup', (req, res) => {
  getPopupData(res);
});

async function getPopupData(res) {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('user', 'getPopupData', null, sqlFormat);

  try {
    let result = await conn.query(sql);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

app.post('/report', (req, res) => {
  res.end();
});

app.post('/socket', (req, res) => {
  if (req.user) {
    res.send({ user: req.user, socketPath: process.env.USER_SOCKET_PATH, api_type: process.env.API_TYPE });
  } else {
    res.send({ socketPath: process.env.USER_SOCKET_PATH, api_type: process.env.API_TYPE });
  }
});

let currentJackpot;
let setJackpot;
getJackpot();

async function getJackpot() {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('bank', 'getJackpot', null, sqlFormat);

  try {
    let result = await conn.query(sql);
    currentJackpot = result[0].currentJackpot;
    setJackpot = result[0].setJackpot;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function updateJackpot(currentJackpot) {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('bank', 'updateJackpot', { currentJackpot: currentJackpot }, sqlFormat);

  try {
    await conn.query(sql);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}

app.listen(process.env.USER_PORT, '0.0.0.0', () => {
  console.log(`Example app listening on port ${process.env.USER_PORT}`);

  setInterval(async () => {
    if (currentJackpot >= setJackpot) {
      currentJackpot = 0;
    } else {
      let randomIncrement = (Math.round(getRandomValue(490, 3000)) / 10).toFixed(1);
      currentJackpot = (Number(currentJackpot) + Number(randomIncrement)).toFixed(1);
    }
    await updateJackpot(Number(currentJackpot));
  }, 5000);
});
// #endregion
