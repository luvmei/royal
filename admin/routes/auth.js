const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('../mybatis-mapper');
const parser = require('ua-parser-js');
const crypto = require('../cryptojs');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');

router.use(session({ secret: 'dog_cat', resave: true, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: 'id',
      passwordField: 'pw',
      session: true,
      passReqToCallback: false,
    },
    async function (id, pw, done) {
      const regex = /^[a-z0-9]+$/;

      if (!id.match(regex)) {
        console.log('존재하지 않는 아이디입니다');
        return done(null, false, { message: '존재하지 않는 아이디입니다' });
      }

      let conn = await pool.getConnection();
      try {
        let findAdmin = mybatisMapper.getStatement('auth', 'findAdmin', { id: id }, sqlFormat);
        let getOnlineAdmin = mybatisMapper.getStatement('auth', 'getOnlineAdmin', {}, sqlFormat);
        let findAdminResult = await conn.query(findAdmin);

        if (findAdminResult.length == 0) {
          let findAgent = mybatisMapper.getStatement('auth', 'findAgent', { id: id }, sqlFormat);
          let findAgentResult = await conn.query(findAgent);

          if (findAgentResult.length == 0) {
            console.log('존재하지 않는 아이디입니다');
            return done(null, false, { message: '존재하지 않는 아이디입니다' });
          } else {
            findAdminResult = findAgentResult;
          }
        }

        let onlineAdmin = await conn.query(getOnlineAdmin);
        let onlineAdminArr = onlineAdmin.map((item) => {
          const data = JSON.parse(item.data);
          return data.passport?.user; // 옵셔널 체이닝 사용
        });
        // let onlineAdminArr = onlineAdmin.map((item) => JSON.parse(item.data).passport.user);

        const match = crypto.checkPassword(pw, findAdminResult[0].pw, id);

        if (match) {
          if (onlineAdminArr.indexOf(id) == -1) {
            return done(null, findAdminResult, { message: '로그인 완료' });
          } else {
            //todo 세션만료 체크 후 로그인, 거부
            return done(null, findAdminResult, { message: '로그인 완료' });
            // console.log('중복 로그인 시도');
            // return done(null, false, { message: '이미 접속되어있는 계정입니다' });
          }
        } else {
          console.log('비밀번호를 확인하세요');
          return done(null, false, { message: '비밀번호를 확인하세요' });
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
  console.log(`로그인: [ id: ${user[0].id} ]`);
  done(null, user[0].id);
});

passport.deserializeUser(async function (id, done) {
  let conn = await pool.getConnection();
  try {
    let query = mybatisMapper.getStatement('auth', 'findAdminInfo', { id: id }, sqlFormat);
    let result = await conn.query(query);
    if (result.length == 0) {
      query = mybatisMapper.getStatement('auth', 'findAgentInfo', { id: id }, sqlFormat);
      result = await conn.query(query);
    }
    done(null, result);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
});

router.post('/login', (req, res, next) => {
  const host = req.get('host');
  const isAdminSubdomain = host.includes('super') || host.includes('best') || host.includes('localhost');
  const isAdminId = req.body.id === 'admin';

  if (isAdminSubdomain) {
    if (host.includes('localhost') || isAdminId) {
    } else {
      return res.send({ message: '접근이 거절되었습니다.', isLogin: false });
    }
  }

  let specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  let pwSpecialCharRegex = /[^!@#A-Za-z0-9]/;

  if (specialCharRegex.test(req.body.id) || pwSpecialCharRegex.test(req.body.pw)) {
    console.log('비정상적인 접근 시도', req.body);
    return res.send({ message: '로그인 정보를 확인하세요', isLogin: false });
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({ message: info.message, isLogin: false });
    }
    // 패스포트 인증 결과에 따라 로그인 진행
    req.login(user, async function (err) {
      if (err) {
        return next(err);
      }
      // todo 어드민 로그인 시 접속정보 저장
      let loginParams = new redefineConnectParams(req, '로그인');
      if (req.user[0].type != 9) {
        insertConnectInfo(loginParams);
      }
      return res.send({ message: info.message, isLogin: true });
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  let logoutParams = new redefineConnectParams(req, '로그아웃');
  console.log(`로그아웃: [ ID: ${req.user[0].id} ]`);

  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    req.session.destroy(() => {
      if (logoutParams.id != 'admin') {
        insertConnectInfo(logoutParams);
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

router.post('/check', (req, res) => {
  if (req.user) {
    res.send({ isLogin: true });
  } else {
    res.send({ isLogin: false });
  }
});

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
    let insertConnectInfo = mybatisMapper.getStatement('auth', 'insertConnectInfo', connectParams, sqlFormat);
    await conn.query(insertConnectInfo);
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

module.exports = router;
