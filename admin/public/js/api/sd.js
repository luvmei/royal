const axios = require('axios');
const { pool, sqlFormat } = require('../../../mariadb');
const mybatisMapper = require('mybatis-mapper');
const moment = require('moment-timezone');
const crypto = require('crypto');

// #region SD private functions
function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}

async function getMarginState() {
  let conn = await pool.getConnection();
  let getMarginState = mybatisMapper.getStatement('setting', 'getMarginState', null, sqlFormat);
  try {
    let result = await conn.query(getMarginState);
    return result[0];
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function checkUserLoginTime(user) {
  let conn = await pool.getConnection();
  let params = { id: user };
  let checkUserLoginTime = mybatisMapper.getStatement('user', 'checkUserLoginTime', params, sqlFormat);
  try {
    let result = await conn.query(checkUserLoginTime);
    if (result.length == 0) {
      return { isChecked: false };
    } else {
      return { isChecked: true, time: result[0].time };
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

function makeAuthKey(requestBody) {
  const secretKey = process.env.SD_SECRET_KEY;
  const requestObj = requestBody;
  const bodyData = JSON.stringify(requestObj);
  const authKey = crypto
    .createHash('md5')
    .update(secretKey + bodyData)
    .digest('hex');
  return authKey;
}

async function insertSdAccount(data) {
  let conn = await pool.getConnection();
  let params = { id: data.username, usercode: data.usercode, token: data.token };

  let insertSdAccount = mybatisMapper.getStatement('user', 'insertSdAccount', params, sqlFormat);

  try {
    await conn.query(insertSdAccount);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getUserCodeToken(id) {
  let conn = await pool.getConnection();
  let params = { id: id };
  let getUserCodeToken = mybatisMapper.getStatement('user', 'getUserCodeToken', params, sqlFormat);

  try {
    let result = await conn.query(getUserCodeToken);
    return result[0];
  } catch (e) {
    console.log('getUserCodeToken error');
    // console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function getProviderList() {
  let providerList = [];
  let postData = {
    language_id: '2',
  };

  let authKey = makeAuthKey(postData);
  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: `${process.env.SD_API_ENDPOINT}/getproviders`,
    headers: { Authorization: `Bearer ${authKey}`, client_id: process.env.SD_CLIENT_ID, 'Content-Type': 'application/json' },
    data: postData,
  };

  return axios(config)
    .then((result) => {
      insertProviderList(result.data.data);
      providerList = result.data.data.map((item) => ({ id: item.provider_id, name: item.provider_title }));
      return providerList;
    })
    .catch((error) => {
      console.log(error.response.data.message);
      // console.log(error);
    });
}

async function insertProviderList(providerList) {
  console.log('providerList', providerList);
  let conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    let params = { providerList: providerList };
    let insertGameList = mybatisMapper.getStatement('game', 'insertProviderList', params, sqlFormat);
    await conn.query(insertGameList);
    await conn.commit();
    console.log('게임리스트 업데이트 완료');
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}

function getGameList(providerId) {
  let postData = {
    language_id: '2',
    provider_id: providerId,
    limit: '1000',
    offset: '0',
  };

  let authKey = makeAuthKey(postData);
  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: `${process.env.SD_API_ENDPOINT}/getgames`,
    headers: { Authorization: `Bearer ${authKey}`, client_id: process.env.SD_CLIENT_ID, 'Content-Type': 'application/json' },
    data: postData,
  };

  return axios(config)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.log(error.response.data.message);
      // console.log(error);
    });
}

async function insertGameList(gameList, provider) {
  let conn = await pool.getConnection();
  await conn.beginTransaction();
  let params = { games: gameList };
  let insertGameList = mybatisMapper.getStatement('game', 'insertGameList', params, sqlFormat);

  try {
    await conn.query(insertGameList);
    await conn.commit();
    console.log(`${provider} 업데이트 완료`);
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}

async function getUserBetMarginRate(userId) {
  let conn = await pool.getConnection();
  let params = { id: userId };
  let getUserMarginRate = mybatisMapper.getStatement('user', 'getUserBetMarginRate', params, sqlFormat);

  try {
    let result = await conn.query(getUserMarginRate);
    return result[0].bet_margin_rate;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

// #region SD Detail Log
async function getBetUserList() {
  let time = {
    strat: moment().tz('Asia/Seoul').subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: moment().tz('Asia/Seoul').subtract(1, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
  };

  console.log(`[SD API]베팅유저리스트 가져오기: [시작]${time.strat} ~ [종료]${time.end}`);

  let postData = {
    start_date: time.strat,
    end_date: time.end,
  };

  let authKey = makeAuthKey(postData);
  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: `${process.env.SD_API_ENDPOINT}/getplayedusercodeV2`,
    headers: { Authorization: `Bearer ${authKey}`, client_id: process.env.SD_CLIENT_ID, 'Content-Type': 'application/json' },
    data: postData,
  };

  return axios(config)
    .then((result) => {
      let usercodes = result.data.data.map((item) => item.usercode);
      console.log(`[SD API]베팅유저리스트 가져오기 성공: [ ${usercodes} ]`);
      return usercodes;
    })
    .catch((error) => {
      console.log(`[SD API]베팅유저리스트 가져오기 실패: ${error.response.data.message}`);
    });
}

async function getBetHistory(user) {
  let time = {
    strat: moment().tz('Asia/Seoul').subtract(5, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
    end: moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
  };

  console.log(`[SD API] ${user} 베팅내역 가져오기: [시작]${time.strat} ~ [종료]${time.end}`);

  let postData = {
    usercode: user,
    start_date: time.strat,
    end_date: time.end,
    limit: '1000',
    offset: '0',
  };

  let authKey = makeAuthKey(postData);
  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: `${process.env.SD_API_ENDPOINT}/getbethistory`,
    headers: { Authorization: `Bearer ${authKey}`, client_id: process.env.SD_CLIENT_ID, 'Content-Type': 'application/json' },
    data: postData,
  };

  return await axios(config)
    .then((result) => {
      return result.data.data;
    })
    .catch((error) => {
      console.log(`[SD API]베팅내역 가져오기 실패: ${error.response.data.message}`);
    });
}

async function insertDetailSdLog(betHistory) {
  let conn = await pool.getConnection();

  let params = { betHistory: betHistory };

  let insertBetHistory = mybatisMapper.getStatement('log', 'insertDetailSdLog', params, sqlFormat);

  try {
    let result = await conn.query(insertBetHistory);
    console.log(`[SD API]베팅내역 업데이트 완료: 받아온 [${betHistory.length}]개 내역 중 [${result.affectedRows}]개 업데이트`);
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}
// #endregion

// #region SD Summary Log
// 당일 날짜로만 데이터기록을 해서 필요없어질 듯함
function selectRequestDate() {
  let today = moment.tz('Asia/Seoul').format('YYYY-MM-DD');
  let yesterday = moment.tz('Asia/Seoul').subtract(1, 'days').format('YYYY-MM-DD');
  let now = moment.tz('Asia/Seoul');

  if (now.hours() === 0 && now.minutes() < 15) {
    // 현재 시간이 00:15 이전
    reqDate = yesterday;
  } else {
    // 현재 시간이 00:15 이후
    reqDate = today;
  }
  console.log(`[SD API] 요청날짜: ${reqDate}`);
  return reqDate;
}

async function getSdSummarylog() {
  // let requestDate = selectRequestDate();
  let conn = await pool.getConnection();

  let params = {};
  let getSummarySdlog = mybatisMapper.getStatement('log', 'getSummarySdLog', params, sqlFormat);

  try {
    let result = await conn.query(getSummarySdlog);
    return result;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}

async function makeSdSummaryData() {
  let result = await getSdSummarylog();

  let data = [];
  let users = [...new Set(result.map((item) => item.user_id))]; // unique user_ids

  for (let user of users) {
    let userBets = result.filter((item) => item.user_id === user);

    let slotmoney = 0;
    let winbet = 0;
    let livemoney = 0;
    let winbet_live = 0;
    let m_slotmoney = 0;
    let m_winbet = 0;
    let m_livemoney = 0;
    let m_winbet_live = 0;
    // let bet_margin_rate = await getUserBetMarginRate(user);

    userBets.forEach(async (bet) => {
      if (bet.category === 'slot') {
        if (bet.transaction_type === 'bet') slotmoney += Math.abs(bet['sum(transaction_amount)']);
        if (bet.transaction_type === 'win') winbet += Math.abs(bet['sum(transaction_amount)']);
      } else if (bet.category === 'fishing') {
        if (bet.transaction_type === 'bet') slotmoney += Math.abs(bet['sum(transaction_amount)']);
        if (bet.transaction_type === 'win') winbet += Math.abs(bet['sum(transaction_amount)']);
      } else if (bet.category === 'casino') {
        if (bet.transaction_type === 'bet') livemoney += Math.abs(bet['sum(transaction_amount)']);
        if (bet.transaction_type === 'win') winbet_live += Math.abs(bet['sum(transaction_amount)']);
      } else if (bet.category === 'live casino') {
        if (bet.transaction_type === 'bet') livemoney += Math.abs(bet['sum(transaction_amount)']);
        if (bet.transaction_type === 'win') winbet_live += Math.abs(bet['sum(transaction_amount)']);
      }
    });

    // m_slotmoney = (slotmoney * (100 - bet_margin_rate)) / 100;
    // m_winbet = m_slotmoney - slotmoney + winbet;
    // m_livemoney = (livemoney * (100 - bet_margin_rate)) / 100;
    // m_winbet_live = m_livemoney - livemoney + winbet_live;

    data.push({
      mem_id: user,
      slotmoney: slotmoney.toFixed(2),
      winbet: winbet.toFixed(2),
      livemoney: livemoney.toFixed(2),
      winbet_live: winbet_live.toFixed(2),
      // m_slotmoney: m_slotmoney.toFixed(2),
      // m_winbet: m_winbet.toFixed(2),
      // m_livemoney: m_livemoney.toFixed(2),
      // m_winbet_live: m_winbet_live.toFixed(2),
    });
  }

  let finalData = { data };
  return finalData.data;
}

const transformToNumber = (obj) => {
  const newObj = { ...obj }; // 객체를 복제합니다.
  for (const key in newObj) {
    if (key !== 'user_id' && typeof newObj[key] === 'bigint') {
      newObj[key] = Number(newObj[key]);
    }
  }
  return newObj;
};

async function checkBettingInfo(latest) {
  let { casinoBetMarginState, slotBetMarginState, casinoRollMarginState, slotRollMarginState } = await getMarginState();
  let betting = latest;
  let betMarginRate;
  let hierarchyData;
  let hierarchy;
  let rollingPoint;
  betting.currentTime = getCurrentTime();
  latest = {
    livemoney: Math.ceil(latest.livemoney),
    slotmoney: Math.ceil(latest.slotmoney),
    winbet_live: Math.ceil(latest.winbet_live),
    winbet: Math.ceil(latest.winbet),
  };

  let conn = await pool.getConnection();
  let checkBetting = mybatisMapper.getStatement('log', 'checkUserBetting', betting, sqlFormat);

  try {
    let current = await conn.query(checkBetting);
    hierarchyData = await getHierarchyData(betting);
    betMarginRate = await getUserBetMarginRate(betting.mem_id);
    current[0] = transformToNumber(current[0]);
    betting.user_id = current[0].user_id;
    betting.casinoBetMarginRate = betMarginRate;
    betting.slotBetMarginRate = betMarginRate;
    betting.casinoBetting = latest.livemoney - current[0].c_bet;
    betting.casinoWin = latest.winbet_live - current[0].c_win;
    betting.slotBetting = latest.slotmoney - current[0].s_bet;
    betting.slotWin = latest.winbet - current[0].s_win;

    if (casinoBetMarginState === 0) {
      betting.marginCasinoBetting = betting.casinoBetting;
      betting.marginCasinoWin = betting.casinoWin;
      betting.casinoBetMarginRate = 0;
    } else if (casinoBetMarginState === 1) {
      betting.marginCasinoBetting = Math.round((betting.casinoBetting * (100 - betting.casinoBetMarginRate)) / 1000) * 10;
      betting.marginCasinoWin = betting.marginCasinoBetting - betting.casinoBetting + betting.casinoWin;
    }

    if (slotBetMarginState === 0) {
      betting.marginSlotBetting = betting.slotBetting;
      betting.marginSlotWin = betting.slotWin;
      betting.slotBetMarginRate = 0;
    } else if (slotBetMarginState === 1) {
      betting.marginSlotBetting = Math.round((betting.slotBetting * (100 - betting.slotBetMarginRate)) / 1000) * 10;
      betting.marginSlotWin = betting.marginSlotBetting - betting.slotBetting + betting.slotWin;
    }

    if (
      current[0].c_bet > latest.livemoney ||
      current[0].s_bet > latest.slotmoney ||
      current[0].c_win > latest.winbet_live ||
      current[0].s_win > latest.winbet
    ) {
      // todo 베팅값 오류발생 관리자 확인요망
      // todo 소켓으로 관리자에게 알림
      console.log('당일 베팅값', current[0]);
      console.log('당일 베팅값 + 최신 베팅값', latest);
      console.log(`${betting.mem_id} 회원의 합산베팅 수신값 오류(DB 베팅정보보다 작음), 관리자에게 문의 해주세요`);
      return;
    } else if (current[0].c_bet == latest.livemoney && current[0].s_bet == latest.slotmoney) {
      if (current[0].c_win < latest.winbet_live || current[0].s_win < latest.winbet) {
        await updateBettingInfo(betting);
        await updateUpperBettingInfo(item, betting);
        // for (item of hierarchyData[0]) {
        //   await updateCombineBettingInfo(item, betting);
        // }
        insertSummaryLog(betting);
      }
      // console.log('[합산베팅정보 변동없음] ID:', betting.mem_id);
      return;
    } else if (current[0].c_bet < latest.livemoney || current[0].s_bet < latest.slotmoney) {
      await updateBettingInfo(betting);
      await updateUpperBettingInfo(item, betting);
      // for (item of hierarchyData[0]) {
      //   await updateCombineBettingInfo(item, betting);
      // }
      await insertSummaryLog(betting);
      await insertBalanceLog(betting);

      hierarchy = getUserHierarchy(hierarchyData);
      rollingPoint = calcRollingPoint(betting, hierarchy, casinoRollMarginState, slotRollMarginState);

      for (item of rollingPoint.reverse()) {
        await insertRollingCommission(item);
        await insertPointLog(betting, item);
        await addAssetPoint(item);
      }

      console.log('[합산베팅정보 업데이트] ID:', betting.mem_id);
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function getHierarchyData(betting) {
  let conn = await pool.getConnection();
  let hierarchySql = mybatisMapper.getStatement('log', 'agentHierarchy', betting, sqlFormat);

  try {
    let hierarchyData = await conn.query(hierarchySql);
    return hierarchyData;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function updateBettingInfo(betting) {
  let conn = await pool.getConnection();
  let bettingInfo = mybatisMapper.getStatement('log', 'updateBettingInfo', betting, sqlFormat);

  try {
    await conn.query(bettingInfo);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

//* 상위 계층의 합산베팅 업데이트
async function updateCombineBettingInfo(user, betting) {
  betting.user_id = user.user_id;
  console.log(betting.user_id, '의 컴바인 베팅 업데이트');

  let conn = await pool.getConnection();
  let combineBettingInfo = mybatisMapper.getStatement('log', 'updateCombineBettingInfo', betting, sqlFormat);

  try {
    await conn.query(combineBettingInfo);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function updateUpperBettingInfo(user, betting) {
  betting.user_id = user.user_id;
  let conn = await pool.getConnection();
  let combineBettingInfo = mybatisMapper.getStatement('log', 'updateUpperBettingInfo', betting, sqlFormat);

  try {
    await conn.query(combineBettingInfo);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function insertSummaryLog(betting) {
  let result;
  let conn = await pool.getConnection();
  let summaryCasino = mybatisMapper.getStatement('log', 'insertSummaryCasinoLog', betting, sqlFormat);
  let summarySlot = mybatisMapper.getStatement('log', 'insertSummarySlotLog', betting, sqlFormat);

  try {
    await conn.beginTransaction();
    if (betting.casinoBetting != 0 || betting.casinoWin != 0) {
      result = await conn.query(summaryCasino);
    }
    if (betting.slotBetting != 0 || betting.slotWin) {
      result = await conn.query(summarySlot);
    }
    await conn.commit();

    console.log(`[베팅요약로그 인서트 완료] ID: ${betting.mem_id}`);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function insertBalanceLog(betting) {
  let conn = await pool.getConnection();
  let getBalance = mybatisMapper.getStatement('log', 'getUserBalance', betting, sqlFormat);
  let getDefaultBalance = mybatisMapper.getStatement('log', 'getUserDefaultBalance', betting, sqlFormat);
  let beforeBalance;

  try {
    let balance = await conn.query(getBalance);
    if (balance.length == 0) {
      balance = await conn.query(getDefaultBalance);
      beforeBalance = balance[0].balance + betting.casinoBetting - betting.casinoWin + betting.slotBetting - betting.slotWin;
    }
    betting.balance = balance[0].after_balance == undefined ? beforeBalance : balance[0].after_balance;
    // betting.balance = balance[0].balance + betting.casinoBetting - betting.casinoWin + betting.slotBetting - betting.slotWin;
    betting.afterBalance = betting.balance;

    // Define operations and corresponding log messages
    const operations = [
      { type: 'marginCasinoBetting', message: '카지노베팅 밸런스로그 인서트 완료', multiplier: -1 },
      { type: 'marginCasinoWin', message: '카지노베팅 밸런스로그 인서트 완료', multiplier: 1 },
      { type: 'marginSlotBetting', message: '슬롯베팅 밸런스로그 인서트 완료', multiplier: -1 },
      { type: 'marginSlotWin', message: '슬롯베팅 밸런스로그 인서트 완료', multiplier: 1 },
    ];

    // const operations = [
    //   { type: 'casinoBetting', message: '카지노베팅 밸런스로그 인서트 완료', multiplier: -1 },
    //   { type: 'casinoWin', message: '카지노베팅 밸런스로그 인서트 완료', multiplier: 1 },
    //   { type: 'slotBetting', message: '슬롯베팅 밸런스로그 인서트 완료', multiplier: -1 },
    //   { type: 'slotWin', message: '슬롯베팅 밸런스로그 인서트 완료', multiplier: 1 },
    // ];

    // Iterate over operations
    for (const operation of operations) {
      if (betting[operation.type] != 0) {
        betting.afterBalance = betting.balance + operation.multiplier * betting[operation.type];
        let sqlQuery = mybatisMapper.getStatement('log', operation.type, betting, sqlFormat);
        await conn.query(sqlQuery);
        betting.balance = betting.afterBalance;
      }
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function calcRollingPoint(betting, hierarchy, casinoRollMarginState, slotRollMarginState) {
  let rollParams = [
    {
      id: hierarchy.p_id,
      agent_type: 0,
      bet_margin_rate: hierarchy.p_bet_margin,
      roll_margin_rate: hierarchy.p_roll_margin,
      c_roll_amount: Math.round((betting.marginCasinoBetting * (hierarchy.p_c_roll * 100 - hierarchy.g_c_roll * 100)) / 10000),
      c_m_roll_amount: Math.round(
        Math.round((betting.marginCasinoBetting * (hierarchy.p_c_roll * 100 - hierarchy.g_c_roll * 100)) / 10000) *
          ((10000 - hierarchy.p_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.round((betting.marginSlotBetting * (hierarchy.p_s_roll * 100 - hierarchy.g_s_roll * 100)) / 10000),
      s_m_roll_amount: Math.round(
        Math.round((betting.marginSlotBetting * (hierarchy.p_s_roll * 100 - hierarchy.g_s_roll * 100)) / 10000) *
          ((10000 - hierarchy.p_roll_margin * 100) / 10000)
      ),
      c_roll_rate: hierarchy.p_c_roll,
      c_roll_real_rate: parseFloat((hierarchy.p_c_roll - hierarchy.g_c_roll).toFixed(2)),
      s_roll_rate: hierarchy.p_s_roll,
      s_roll_real_rate: parseFloat((hierarchy.p_s_roll - hierarchy.g_s_roll).toFixed(2)),
    },
    {
      id: hierarchy.g_id,
      agent_type: 1,
      bet_margin_rate: hierarchy.g_bet_margin,
      roll_margin_rate: hierarchy.g_roll_margin,
      c_roll_amount: Math.round((betting.marginCasinoBetting * (hierarchy.g_c_roll * 100 - hierarchy.s_c_roll * 100)) / 10000),
      c_m_roll_amount: Math.round(
        Math.round((betting.marginCasinoBetting * (hierarchy.g_c_roll * 100 - hierarchy.s_c_roll * 100)) / 10000) *
          ((10000 - hierarchy.g_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.round((betting.marginSlotBetting * (hierarchy.g_s_roll * 100 - hierarchy.s_s_roll * 100)) / 10000),
      s_m_roll_amount: Math.round(
        Math.round((betting.marginSlotBetting * (hierarchy.g_s_roll * 100 - hierarchy.s_s_roll * 100)) / 10000) *
          ((10000 - hierarchy.g_roll_margin * 100) / 10000)
      ),
      c_roll_rate: hierarchy.g_c_roll,
      c_roll_real_rate: parseFloat((hierarchy.g_c_roll - hierarchy.s_c_roll).toFixed(2)),
      s_roll_rate: hierarchy.g_s_roll,
      s_roll_real_rate: parseFloat((hierarchy.g_s_roll - hierarchy.s_s_roll).toFixed(2)),
    },
    {
      id: hierarchy.s_id,
      agent_type: 2,
      bet_margin_rate: hierarchy.s_bet_margin,
      roll_margin_rate: hierarchy.s_roll_margin,
      c_roll_amount: Math.round((betting.marginCasinoBetting * (hierarchy.s_c_roll * 100 - hierarchy.b_c_roll * 100)) / 10000),
      c_m_roll_amount: Math.round(
        Math.round((betting.marginCasinoBetting * (hierarchy.s_c_roll * 100 - hierarchy.b_c_roll * 100)) / 10000) *
          ((10000 - hierarchy.s_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.round((betting.marginSlotBetting * (hierarchy.s_s_roll * 100 - hierarchy.b_s_roll * 100)) / 10000),
      s_m_roll_amount: Math.round(
        Math.round((betting.marginSlotBetting * (hierarchy.s_s_roll * 100 - hierarchy.b_s_roll * 100)) / 10000) *
          ((10000 - hierarchy.s_roll_margin * 100) / 10000)
      ),
      c_roll_rate: hierarchy.s_c_roll,
      c_roll_real_rate: parseFloat((hierarchy.s_c_roll - hierarchy.b_c_roll).toFixed(2)),
      s_roll_rate: hierarchy.s_s_roll,
      s_roll_real_rate: parseFloat((hierarchy.s_s_roll - hierarchy.b_s_roll).toFixed(2)),
    },
    {
      id: hierarchy.b_id,
      agent_type: 3,
      bet_margin_rate: hierarchy.b_bet_margin,
      roll_margin_rate: hierarchy.b_roll_margin,
      c_roll_amount: Math.round((betting.marginCasinoBetting * (hierarchy.b_c_roll * 100 - hierarchy.u_c_roll * 100)) / 10000),
      c_m_roll_amount: Math.round(
        Math.round((betting.marginCasinoBetting * (hierarchy.b_c_roll * 100 - hierarchy.u_c_roll * 100)) / 10000) *
          ((10000 - hierarchy.b_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.round((betting.marginSlotBetting * (hierarchy.b_s_roll * 100 - hierarchy.u_s_roll * 100)) / 10000),
      s_m_roll_amount: Math.round(
        Math.round((betting.marginSlotBetting * (hierarchy.b_s_roll * 100 - hierarchy.u_s_roll * 100)) / 10000) *
          ((10000 - hierarchy.b_roll_margin * 100) / 10000)
      ),
      c_roll_rate: hierarchy.b_c_roll,
      c_roll_real_rate: parseFloat((hierarchy.b_c_roll - hierarchy.u_c_roll).toFixed(2)),
      s_roll_rate: hierarchy.b_s_roll,
      s_roll_real_rate: parseFloat((hierarchy.b_s_roll - hierarchy.u_s_roll).toFixed(2)),
    },
    {
      id: hierarchy.u_id,
      agent_type: 4,
      bet_margin_rate: hierarchy.u_bet_margin,
      roll_margin_rate: hierarchy.u_roll_margin,
      c_roll_amount: Math.round((betting.marginCasinoBetting * hierarchy.u_c_roll * 100) / 10000),
      c_m_roll_amount: Math.round(
        Math.round((betting.marginCasinoBetting * hierarchy.u_c_roll * 100) / 10000) * ((10000 - hierarchy.u_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.round((betting.marginSlotBetting * hierarchy.u_s_roll * 100) / 10000),
      s_m_roll_amount: Math.round(Math.round((betting.marginSlotBetting * hierarchy.u_s_roll * 100) / 10000) * ((100 - hierarchy.u_roll_margin * 100) / 10000)),
      c_roll_rate: hierarchy.u_c_roll,
      c_roll_real_rate: parseFloat(hierarchy.u_c_roll.toFixed(2)),
      s_roll_rate: hierarchy.u_s_roll,
      s_roll_real_rate: parseFloat(hierarchy.u_s_roll.toFixed(2)),
    },
  ];

  if (casinoRollMarginState === 0) {
    rollParams.forEach((el) => {
      el.c_m_roll_amount = el.c_roll_amount;
    });
  }

  if (slotRollMarginState === 0) {
    rollParams.forEach((el) => {
      el.s_m_roll_amount = el.s_roll_amount;
    });
  }

  let filteredRollParams = rollParams.filter((item) => item.id !== '');

  return filteredRollParams;
}

async function insertRollingCommission(hierarchyData) {
  let conn = await pool.getConnection();
  let insertCommission = mybatisMapper.getStatement('log', 'insertRollingCommission', hierarchyData, sqlFormat);
  try {
    await conn.query(insertCommission);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function addAssetPoint(hierarchyData) {
  let conn = await pool.getConnection();
  let addAssetPoint = mybatisMapper.getStatement('log', 'addAssetPoint', hierarchyData, sqlFormat);

  try {
    await conn.query(addAssetPoint);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function insertPointLog(betting, hierarchyData) {
  let logParams = {};
  logParams.currentTime = betting.currentTime;
  logParams.id = hierarchyData.id;
  logParams.agent_type = hierarchyData.agent_type;
  logParams.c_bet_margin_rate = betting.casinoBetMarginRate;
  logParams.s_bet_margin_rate = betting.slotBetMarginRate;
  logParams.c_roll_margin_rate = hierarchyData.roll_margin_rate;
  logParams.s_roll_margin_rate = hierarchyData.roll_margin_rate;
  logParams.c_roll_amount = hierarchyData.c_roll_amount;
  logParams.s_roll_amount = hierarchyData.s_roll_amount;
  logParams.c_m_roll_amount = hierarchyData.c_m_roll_amount;
  logParams.s_m_roll_amount = hierarchyData.s_m_roll_amount;
  logParams.triger = betting.user_id;
  logParams.casinoBetting = betting.casinoBetting;
  logParams.slotBetting = betting.slotBetting;
  logParams.marginCasinoBetting = betting.marginCasinoBetting;
  logParams.marginSlotBetting = betting.marginSlotBetting;

  if (hierarchyData.agent_type != 4) {
    logParams.c_roll_rate = `${hierarchyData.c_roll_rate} (${hierarchyData.c_roll_real_rate})`;
    logParams.s_roll_rate = `${hierarchyData.s_roll_rate} (${hierarchyData.s_roll_real_rate})`;
  } else if (hierarchyData.agent_type == 4) {
    logParams.c_roll_rate = hierarchyData.c_roll_rate;
    logParams.s_roll_rate = hierarchyData.s_roll_rate;
  }

  let conn = await pool.getConnection();
  let casinoLog = mybatisMapper.getStatement('log', 'insertCasinoLog', logParams, sqlFormat);
  let slotLog = mybatisMapper.getStatement('log', 'insertSlotLog', logParams, sqlFormat);

  try {
    if (hierarchyData.c_roll_amount != 0) {
      await conn.query(casinoLog);
      console.log(`카지노로그: ID: ${logParams.id} 삽입완료`);
    }
    if (hierarchyData.s_roll_amount != 0) {
      await conn.query(slotLog);
      console.log(`슬롯로그: ID: ${logParams.id} 삽입완료`);
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    console.log(`포인트로그: ID: ${logParams.id} 삽입완료`);
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
  const betMarginRate = ['p_bet_margin', 'g_bet_margin', 's_bet_margin', 'b_bet_margin', 'u_bet_margin'];
  const rollMarginRate = ['p_roll_margin', 'g_roll_margin', 's_roll_margin', 'b_roll_margin', 'u_roll_margin'];

  // 각 type에 대한 기본 템플릿
  let template = Array.from({ length: 5 }, () => ({
    user_id: null,
    nickname: null,
    c_roll_rate: null,
    s_roll_rate: null,
    lose_rate: null,
    bet_margin_rate: null,
    roll_margin_rate: null,
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
    hierarchy[betMarginRate[i]] = template[i].bet_margin_rate;
    hierarchy[rollMarginRate[i]] = template[i].roll_margin_rate;
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
//       hierarchy[casinoRollRate[i]] = parseFloat(userObj.c_roll_rate);
//       hierarchy[slotRollRate[i]] = parseFloat(userObj.s_roll_rate);
//       hierarchy[loseRate[i]] = parseFloat(userObj.lose_rate);
//       hierarchy[betMarginRate[i]] = parseFloat(userObj.bet_margin_rate);
//       hierarchy[rollMarginRate[i]] = parseFloat(userObj.roll_margin_rate);
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
// #endregion

// #endregion

// #region SD export functions
function createUser(params) {
  let postData = {
    username: params.new_id || params.id || params.아이디,
    password: process.env.SD_DEFAULT_PASSWORD,
  };

  let authKey = makeAuthKey(postData);
  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: `${process.env.SD_API_ENDPOINT}/createaccount`,
    headers: { Authorization: `Bearer ${authKey}`, client_id: process.env.SD_CLIENT_ID, 'Content-Type': 'application/json' },
    data: postData,
  };

  axios(config)
    .then((result) => {
      if (result.data.status == '0') {
        console.log(`[SD API]유저생성 성공: ID: ${result.data.data.username}`);
        insertSdAccount(result.data.data);
      }
    })
    .catch((error) => {
      console.log(`[API]유저생성 실패: ID: ${params.아이디}`);
      // console.log(error);
    });
}

async function requestAsset(params) {
  let url;
  let userInfo;
  if (params.reqType == 'give' || params.reqType == 'take') {
    params.id = params.receiverId;
  }

  let givenDate = await checkUserLoginTime(params.id); // 주어진 시간 (UTC 기준)

  if (givenDate.isChecked) {
    let currentDate = new Date(); // 현재 시간
    let givenDateTime = new Date(givenDate.time); // 문자열 시간을 Date 객체로 변환

    let hoursDiff = Math.abs(currentDate - givenDateTime) / 36e5;
    if (hoursDiff > 22) {
      createUser(params);
      console.log(`[유저 토큰갱신] ID: ${params.id}`);
    }
  } else {
    createUser(params);
    console.log(`[유저 토큰갱신] ID: ${params.id}`);
  }

  userInfo = await getUserCodeToken(params.id);

  console.log(`[코드 및 토큰획득 성공] ID: ${params.id}`);

  params.usercode = userInfo.sd_usercode;
  params.token = userInfo.sd_token;

  if (params.타입 == '입금') {
    url = `${process.env.SD_API_ENDPOINT}/addmemberpoint`;
  } else if (params.타입 == '출금') {
    url = `${process.env.SD_API_ENDPOINT}/subtractmemberpoint`;
  } else if (params.type == '지급') {
    url = `${process.env.SD_API_ENDPOINT}/addmemberpoint`;
    params.타입 = params.type;
  } else if (params.type == '회수') {
    url = `${process.env.SD_API_ENDPOINT}/subtractmemberpoint`;
    params.타입 = params.type;
  }

  let postData = {
    usercode: params.usercode,
    token: params.token,
    transaction_amount: params.reqMoney,
  };

  let authKey = makeAuthKey(postData);
  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: url,
    headers: { Authorization: `Bearer ${authKey}`, client_id: process.env.SD_CLIENT_ID, 'Content-Type': 'application/json' },
    data: postData,
  };

  return axios(config)
    .then((result) => {
      updateUserBalance(params.id);
      if (result.data.status == '0') {
        console.log(`[${params.타입}완료] ID: ${params.id} / 금액: ${parseInt(params.reqMoney).toLocaleString('ko-KR')}`);
        return result.data; // Ensure that we return the data here
      } else {
        console.log(error);
        throw new Error(`${params.타입}처리 실패: ID: ${params.id}`); // Throw an error if status is not '0'
      }
    })
    .catch((error) => {
      console.log(`${params.타입}처리 실패: ID: ${params.id}`);
      // console.log(error);
      throw error;
    });
}

async function updateUserBalance(user) {
  let userInfo = await getUserCodeToken(user);

  if (userInfo.sd_usercode == null || userInfo.sd_token == null) {
    let params = {};
    params.id = user;
    userInfo = await updateUserBalance(user);
  }

  let postData = {
    usercode: userInfo.sd_usercode,
    token: userInfo.sd_token,
  };
  let authKey = makeAuthKey(postData);
  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: `${process.env.SD_API_ENDPOINT}/getaccountbalance`,
    headers: { Authorization: `Bearer ${authKey}`, client_id: process.env.SD_CLIENT_ID, 'Content-Type': 'application/json' },
    data: postData,
  };

  let params = {};
  params.id = user;
  try {
    const result = await axios(config);
    params.balance = parseInt(parseFloat(result.data.data.available_balance));
    return params;
  } catch (error) {
    console.log('에러 분석', error.response);
    console.log('[SD API] 유저 토큰 갱신 후 밸런스 체크 재시도');
  }
}

async function updateAdminBalance() {
  let postData = {};

  let authKey = makeAuthKey(postData);
  postData = JSON.stringify(postData);

  const config = {
    method: 'get',
    url: `${process.env.SD_API_ENDPOINT}/getClientBalance/${process.env.SD_CLIENT_ID}`,
    headers: { Authorization: `Bearer ${authKey}`, client_id: process.env.SD_CLIENT_ID, 'Content-Type': 'application/json' },
    data: postData,
  };

  let params = {};

  await axios(config)
    .then((result) => {
      params.id = 'admin';
      params.balance = parseInt(parseFloat(result.data.data.available_balance));
    })
    .catch((error) => {
      // console.log(error.response.data.message);
      console.log(error);
      return;
    });

  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('log', 'updateAdminBalance', params, sqlFormat);
  try {
    await conn.query(sql);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function updateGameList() {
  let providerList = await getProviderList();
  // console.log(providerList);

  for (let provider of providerList) {
    let eachGameList = await getGameList(provider.id);
    // console.log(eachGameList);

    if (eachGameList !== undefined) {
      for (let game of eachGameList.data) {
        game.provider_name = provider.name;
        game.game_title = game.game_title.replace(/'/g, '').trim();
        game.game_name = game.game_name.replace(/'/g, '').trim();
      }

      await insertGameList(eachGameList.data, provider.name);
    }
  }
}

async function requestDetailLog() {
  let result = await getBetUserList();
  if (result != undefined) {
    let newBetArr = [];
    for (let user of result) {
      let getBetArr = await getBetHistory(user);
      if (getBetArr != undefined) {
        let mappedArr = await getBetArr.map((betting) => {
          return {
            created_date: betting.created_date,
            transaction_id: betting.transaction_id,
            round_id: betting.round_id,
            username: betting.username,
            provider_name: betting.game_details.provider_name,
            category: betting.game_details.category,
            game_id: betting.game_details.game_id,
            game_title_korean: betting.game_details.game_title_korean,
            transaction_type: betting.transaction_type,
            transaction_amount: betting.transaction_amount,
            previous_balance: betting.previous_balance,
            available_balance: betting.available_balance,
          };
        });
        newBetArr = [...newBetArr, ...mappedArr];
      }
    }

    if (newBetArr.length == 0) {
      console.log('새로운 베팅내역 없음');
      return;
    }

    await insertDetailSdLog(newBetArr);
  }
}

async function requestSummaryLog() {
  let summaryData = await makeSdSummaryData();

  if (summaryData.length != 0) {    
    for (item of summaryData) {
      await checkBettingInfo(item);
    }
  }
}
// #endregion

module.exports = {
  createUser,
  requestAsset,
  updateUserBalance,
  updateAdminBalance,
  requestDetailLog,
  requestSummaryLog,
  updateGameList,
};
