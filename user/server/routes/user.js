const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const mybatisMapper = require('../mybatis-mapper');
const { pool, sqlFormat } = require('../mariadb');
const bcrypt = require('bcrypt');
const crypto = require('../cryptojs');
const parser = require('ua-parser-js');
const moment = require('moment-timezone');
const svgCaptcha = require('svg-captcha');
const xss = require('xss');

// #region 미들웨어
router.use(session({ secret: 'dog_cat', resave: true, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session());
// #endregion

// #region 로그인
router.get('/captcha', (req, res) => {
  if (!req.user) {
    const captcha = svgCaptcha.create({
      size: 3,
      noise: 1,
      fontSize: 50,
      charPreset: '0123456789',
      width: 120,
      height: 50,
    });
    req.session.captcha = captcha.text; // 세션에 CAPTCHA 텍스트 저장
    res.type('svg');
    res.status(200).send(captcha.data);
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: 'id',
      passwordField: 'pw',
      session: true,
      passReqToCallback: false,
    },
    async function (id, pw, done) {
      const regex = /^[a-zA-Z0-9]+$/;

      if (!id.match(regex)) {
        console.log('존재하지 않는 아이디입니다');
        return done(null, false, { message: '존재하지 않는 아이디입니다' });
      }

      let conn = await pool.getConnection();
      try {
        let findUser = mybatisMapper.getStatement('user', 'findUser', { id: id }, sqlFormat);
        let getOnlineUser = mybatisMapper.getStatement('user', 'getOnlineUser', {}, sqlFormat);

        let findUserResult = await conn.query(findUser);
        let onlineUser = await conn.query(getOnlineUser);

        let onlineUserArr = onlineUser
          .map((item) => {
            const parsedData = JSON.parse(item.data);
            return parsedData.passport ? parsedData.passport.user : null;
          })
          .filter((user) => user && user !== 'admin');

        // let onlineUserArr = onlineUser.map((item) => JSON.parse(item.data).passport.user).filter((user) => user !== 'admin');

        if (findUserResult.length == 0) {
          console.log('아이디와 비밀번호를 확인하세요');
          return done(null, false, { message: '아이디와 비밀번호를 확인하세요' });
        }

        const match = crypto.checkPassword(pw, findUserResult[0].pw, id);
        // const match = bcrypt.compareSync(pw, findUserResult[0].pw);

        if (match) {
          if (onlineUserArr.indexOf(id) == -1) {
            // sd.loginUser(id);
            // dg.loginUser(id);
            return done(null, findUserResult, { message: '로그인 완료' });
          } else {
            //todo 세션만료 체크 후 로그인, 거부
            console.log('중복 로그인 시도');
            await expireSession(id);
            // 접속시도 아이디의 기존 세션 삭제하는 코드

            return done(null, false, { message: '기존 접속을 종료합니다. 다시 로그인 해 주세요.' });
          }
        } else {
          console.log('아이디와 비밀번호를 확인하세요');
          return done(null, false, { message: '아이디와 비밀번호를 확인하세요' });
        }
      } catch (e) {
        console.log(e);
        return done(e);
      } finally {
        if (conn) return conn.release();
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log(`로그인: [ id: ${user[0].id} / 닉네임: ${user[0].nickname} ]`);
  done(null, user[0].id);
});

passport.deserializeUser(async function (id, done) {
  let conn = await pool.getConnection();

  try {
    let query = mybatisMapper.getStatement('user', 'findUserInfo', { id: id }, sqlFormat);
    let result = await conn.query(query);
    done(null, result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
});

router.post('/login', (req, res, next) => {
  const { captcha } = req.body; // 사용자가 입력한 CAPTCHA 값
  if (req.session.captcha !== captcha) {
    return res.send({ message: 'CAPTCHA가 일치하지 않습니다.', isLogin: false });
  }
  delete req.session.captcha;

  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({ message: info.message, isLogin: false });
    }
    req.login(user, async function (err) {
      if (err) {
        return next(err);
      }
      let loginParams = new redefineConnectParams(req, '로그인');
      insertConnectInfo(loginParams);
      return res.send({ message: info.message, isLogin: true });
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  if (!req.user || !req.user[0]) {
    console.log('로그인되어있지 않은 상태에서 로그아웃 시도');
    return res.redirect('/');
  }
  let logoutParams = new redefineConnectParams(req, '로그아웃');

  console.log(`로그아웃: [ ID: ${req.user[0].id} / 닉네임: ${req.user[0].nickname} ]`);

  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    req.session.destroy(() => {
      insertConnectInfo(logoutParams);
      res.clearCookie('connect.sid.u');
      res.send('logout');
    });
  });
});

router.post('/asset', (req, res) => {
  if (req.user) {
    getAsset(res, req.user[0]);
  } else {
    res.send(false);
  }
});

async function getAsset(res, params) {
  let conn = await pool.getConnection();
  let query = mybatisMapper.getStatement('user', 'getAsset', { id: params.id }, sqlFormat);
  try {
    let result = await conn.query(query);
    res.send(result[0]);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function redefineConnectParams(req, type) {
  let ua = parser(req.headers['user-agent']);
  let connect_time = getCurrentTime();

  if (type === '회원가입') {
    this.id = req.body.id;
  } else {
    this.id = req.user[0].id;
  }
  this.time = connect_time;
  this.type = type;
  this.ip_adress = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;
  this.domain = req.protocol + '://' + req.get('host');
  this.device = ua.os.name;
  this.browser = ua.browser.name;
}

async function insertConnectInfo(connectParams) {
  let conn = await pool.getConnection();

  try {
    let insertConnectInfo = mybatisMapper.getStatement('user', 'insertConnectInfo', connectParams, sqlFormat);
    await conn.query(insertConnectInfo);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 회원가입
router.post('/signup', (req, res) => {
  req.body.name = req.body.bank_owner;
  insertJoinInfo(res, req.body, req);
});

router.post('/doublecheck', (req, res) => {
  this.ip_adress = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress;

  if (req.body.type == 'id') {
    console.log(`[중복체크] 아이디: ${req.body.id} / ip: ${this.ip_adress}`);
    doubleCheck(req, res, 'checkId');
  } else if (req.body.type == 'nickname') {
    console.log(`[중복체크] 닉네임: ${req.body.nickname} / ip: ${this.ip_adress}`);
    doubleCheck(req, res, 'checkNick');
  } else if (req.body.type == 'phone') {
    console.log(`[중복체크] 전화번호: ${req.body.phone} / ip: ${this.ip_adress}`);
    doubleCheck(req, res, 'checkPhone');
  } else if (req.body.type == 'code') {
    console.log(`[코드체크] 가입코드: ${req.body.join_code} / ip: ${this.ip_adress}`);
    doubleCheck(req, res, 'checkCode');
  } else if (req.body.type == 'recommend') {
    console.log(`[추천인체크] 추천인: ${req.body.recommend} / ip: ${this.ip_adress}`);
    doubleCheck(req, res, 'checkRecommend');
  }
});

async function doubleCheck(req, res, sqlType) {
  let params = req.body;
  let conn = await pool.getConnection();

  let query = mybatisMapper.getStatement('user', sqlType, params, sqlFormat);

  try {
    let result = await conn.query(query);
    if (result.length != 0) {
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

function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}

function redefineJoinParams(params) {
  params.type = 4;
  params.join_date = getCurrentTime();
  params.pw = crypto.encrypt(params.pw, params.id);
  // params.pw = bcrypt.hashSync(params.pw, salt);
  return params;
}

async function insertJoinInfo(res, data, req) {
  let joinParams = new redefineConnectParams(req, '회원가입');

  let params = redefineJoinParams(data);
  params.join_ip = joinParams.ip_adress;
  params.join_domain = joinParams.domain;

  let conn = await pool.getConnection();

  let insertUserInfo = mybatisMapper.getStatement('user', 'insertUserInfo', params, sqlFormat);
  let insertAssetInfo = mybatisMapper.getStatement('user', 'insertAssetInfo', {}, sqlFormat);
  let insertCommissionInfo = mybatisMapper.getStatement('user', 'insertCommisionInfo', {}, sqlFormat);
  let insertBettingInfo = mybatisMapper.getStatement('user', 'insertBettingInfo', {}, sqlFormat);
  let insertConnectInfo = mybatisMapper.getStatement('user', 'insertConnectInfo', joinParams, sqlFormat);
  let insertNotification = mybatisMapper.getStatement('user', 'insertNotification', params, sqlFormat);
  try {
    await conn.beginTransaction();
    await conn.query(insertUserInfo);
    await conn.query(insertAssetInfo);
    await conn.query(insertCommissionInfo);
    await conn.query(insertBettingInfo);
    await conn.query(insertConnectInfo);
    await conn.query(insertNotification);
    await conn.commit();

    res.send({ msg: '회원가입 완료', userId: params.id });
  } catch (e) {
    console.log(`에러메시지: ${e}`);
    await conn.rollback();
    throw err;
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

// #region 정보변경
router.post('/change', (req, res) => {
  if (req.user && req.body.type == 'password') {
    changePassword(req, res);
  }
});

async function checkPassword(req) {
  let conn = await pool.getConnection();
  let params = { id: req.user[0].id };
  let checkPassword = mybatisMapper.getStatement('user', 'checkPassword', params, sqlFormat);

  try {
    let result = await conn.query(checkPassword);
    const match = crypto.encrypt(req.body.beforeChange, result[0].pw);

    if (match) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function changePassword(req, res) {
  let isMatch = await checkPassword(req);
  if (isMatch) {
    if (req.body.beforeChange == req.body.setChange && req.body.setChange != '') {
      res.send({ isChange: false, msg: '기존 비밀번호와 변경할 비밀번호가 일치합니다' });
    } else if (req.body.setChange != req.body.setChangeCheck) {
      res.send({ isChange: false, msg: '변경할 비밀번호가 일치하지 않습니다' });
    } else if (req.body.setChange == req.body.setChangeCheck) {
      let conn = await pool.getConnection();
      let newPassword = crypto.encrypt(req.body.setChange, req.user[0].id);
      let params = { id: req.user[0].id, pw: newPassword };

      let changePassword = mybatisMapper.getStatement('user', 'changePassword', params, sqlFormat);

      try {
        await conn.query(changePassword);
        res.send({ isChange: true, msg: '비밀번호 변경 완료' });
      } catch (e) {
        console.log(e);
        return done(e);
      } finally {
        if (conn) return conn.release();
      }
    } else {
      res.send({ isChange: false, msg: '변경할 비밀번호가 일치하지 않습니다' });
    }
  } else {
    res.send({ isChange: false, msg: '기존 비밀번호가 일치하지 않습니다' });
  }
}
// #endregion

// #region 정보확인
//? 유저정보
router.post('/info', (req, res) => {
  if (req.user) {
    getUserInfo(req, res);
  } else {
    res.send(false);
  }
});

async function getUserInfo(req, res) {
  let params = req.user[0];
  let conn = await pool.getConnection();

  let getUserInfo = mybatisMapper.getStatement('user', 'getUserInfo', params, sqlFormat);

  try {
    let result = await conn.query(getUserInfo);
    result = maskUserInfo(result[0]);
    res.send(result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function maskUserInfo(userInfo) {
  const nameLength = userInfo.name.length;
  const thirdOfName = Math.ceil(nameLength / 3);
  const startOfAsterisk = Math.floor((nameLength - thirdOfName) / 2);
  const endOfAsterisk = startOfAsterisk + thirdOfName;

  userInfo.id = userInfo.id.slice(0, -3) + '***';
  userInfo.name = userInfo.name
    .split('')
    .map((char, index) => (index >= startOfAsterisk && index < endOfAsterisk ? '*' : char))
    .join('');
  userInfo.phone = userInfo.phone.replace(/(\d{3})(\d{4})/, '$1****');
  userInfo.bank_num = userInfo.bank_num.slice(0, -5) + '*****';
  userInfo.bank_owner = userInfo.name;

  return userInfo;
}

//? 로그인정보
router.get('/checklogin', (req, res) => {
  if (req.user) {
    res.send(true);
  } else {
    res.send(false);
  }
});

//? 유저타입
router.post('/type', (req, res) => {
  if (req.user == undefined) {
    res.send({ isLogin: false });
  } else {
    getUserType(req, res);
  }
});

async function getUserType(req, res) {
  let params = req.user[0];
  let conn = await pool.getConnection();

  let getUserType = mybatisMapper.getStatement('user', 'getUserType', params, sqlFormat);

  try {
    let result = await conn.query(getUserType);
    if (result[0].join_code) {
      res.send({ isLogin: true, hasCode: true });
    } else {
      res.send({ isLogin: true, hasCode: false });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//? 로그아웃
async function expireSession(id) {
  let conn = await pool.getConnection();
  let params = { id: id };
  let expireSession = mybatisMapper.getStatement('user', 'expireSession', params, sqlFormat);

  try {
    await conn.query(expireSession);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}
// #endregion

module.exports = router;
