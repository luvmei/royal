const axios = require('axios');
const { pool, sqlFormat } = require('../../../mariadb');
const mybatisMapper = require('mybatis-mapper');
const moment = require('moment-timezone');

// #region Unique private functions
let insertLogCount = 0;
let reqDate;

function getCurrentTime() {
  let dateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');
  return dateTime;
}

async function insertUniqueAccount(playerId) {
  let conn = await pool.getConnection();
  let params = { unique_id: playerId };

  let insertPlayerId = mybatisMapper.getStatement('user', 'insertUniqueAccount', params, sqlFormat);

  try {
    await conn.query(insertPlayerId);
    console.log(`${playerId} 플레이어 아이디 삽입 성공`);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function insertDetailLog(params) {
  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('log', 'insertDetailLog', params, sqlFormat);

  try {
    let result = await conn.query(sql);
    if (result.affectedRows != 0) {
      insertLogCount++;
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

function selectRequestDate() {
  let today = moment.tz('Asia/Seoul').format('YYYY-MM-DD');
  let yesterday = moment.tz('Asia/Seoul').subtract(1, 'days').format('YYYY-MM-DD');
  let now = moment(); // 현재 시간

  if (now.hours() === 0 && now.minutes() < 15) {
    // 현재 시간이 00:15 이전
    reqDate = yesterday;
  } else {
    // 현재 시간이 00:15 이후
    reqDate = today;
  }
  return reqDate;
}

async function checkBettingInfo(latest) {
  let nowDate = moment.tz('Asia/Seoul').format('YYYY-MM-DD');
  let betting = latest;
  let hierarchyData;
  let hierarchy;
  let rollingPoint;
  betting.mem_id = latest.mem_id.substr(3);
  if (nowDate == reqDate) {
    betting.currentTime = getCurrentTime();
  } else {
    reqDate = reqDate + ' 23:59';
    betting.currentTime = reqDate;
  }
  let conn = await pool.getConnection();
  let checkBetting = mybatisMapper.getStatement('log', 'checkUserBetting', betting, sqlFormat);

  try {
    let current = await conn.query(checkBetting);
    hierarchyData = await getHierarchyData(betting);

    betting.user_id = current[0].user_id;
    betting.casinoBetting = latest.livemoney - current[0].c_bet;
    betting.casinoWin = latest.winbet_live - current[0].c_win;
    betting.slotBetting = latest.slotmoney - current[0].s_bet;
    betting.slotWin = latest.winbet - current[0].s_win;

    if (
      current[0].c_bet > latest.livemoney ||
      current[0].s_bet > latest.slotmoney ||
      current[0].c_win > latest.winbet_live ||
      current[0].s_win > latest.winbet
    ) {
      // todo 베팅값 오류발생 관리자 확인요망
      // todo 소켓으로 관리자에게 알림
      console.log(`${betting.mem_id} 회원의 합산베팅 수신값 오류(DB 베팅정보보다 작음), 관리자에게 문의 해주세요`);
      return;
    } else if (current[0].c_bet == latest.livemoney && current[0].s_bet == latest.slotmoney) {
      if (current[0].c_win < latest.winbet_live || current[0].s_win < latest.winbet) {
        await updateBettingInfo(betting);
        for (item of hierarchyData[0]) {
          await updateCombineBettingInfo(item, betting);
        }
        insertSummaryLog(betting);
      }
      // console.log('[합산베팅정보 변동없음] ID:', betting.mem_id);
      return;
    } else if (current[0].c_bet < latest.livemoney || current[0].s_bet < latest.slotmoney) {
      await updateBettingInfo(betting);
      for (item of hierarchyData[0]) {
        await updateCombineBettingInfo(item, betting);
      }
      await insertSummaryLog(betting);
      await insertBalanceLog(betting);

      hierarchy = userRouter.getUserHierarchy(hierarchyData);
      console.log(hierarchy);

      rollingPoint = calcRollingPoint(betting, hierarchy);

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

async function updateBettingInfo(betting) {
  console.log(betting.mem_id, '의 베팅 업데이트');

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

async function insertSummaryLog(betting) {
  let result;
  let conn = await pool.getConnection();
  let summaryCasino = mybatisMapper.getStatement('log', 'insertSummaryCasinoLog', betting, sqlFormat);
  let summarySlot = mybatisMapper.getStatement('log', 'insertSummarySlotLog', betting, sqlFormat);

  try {
    await conn.beginTransaction();
    if (betting.casinoBetting != 0 || betting.casinoWin != 0) {
      result = await conn.query(summaryCasino);
      console.log('카지노베팅', result);
    }
    if (betting.slotBetting != 0 || betting.slotWin) {
      result = await conn.query(summarySlot);
      console.log('슬롯베팅', result);
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

  try {
    let balance = await conn.query(getBalance);
    betting.balance = balance[0].balance - betting.casinoWin + betting.casinoBetting + betting.slotBetting - betting.slotWin;

    if (betting.casinoBetting != 0) {
      let casinoBetting = mybatisMapper.getStatement('log', 'casinoBetting', betting, sqlFormat);
      await conn.query(casinoBetting);
      betting.balance = betting.balance - betting.casinoBetting;
    }
    if (betting.casinoWin != 0) {
      let casinoWin = mybatisMapper.getStatement('log', 'casinoWin', betting, sqlFormat);
      await conn.query(casinoWin);
      betting.balance = betting.balance + betting.casinoWin;
    }
    if (betting.slotBetting != 0) {
      let slotBetting = mybatisMapper.getStatement('log', 'slotBetting', betting, sqlFormat);
      await conn.query(slotBetting);
      betting.balance = betting.balance - betting.slotBetting;
    }
    if (betting.slotWin != 0) {
      let slotWin = mybatisMapper.getStatement('log', 'slotWin', betting, sqlFormat);
      await conn.query(slotWin);
      betting.balance = betting.balance + betting.slotWin;
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
  logParams.c_amount = hierarchyData.c_amount;
  logParams.s_amount = hierarchyData.s_amount;

  if (hierarchyData.agent_type != 3) {
    logParams.c_rate = `${hierarchyData.c_rate} (${hierarchyData.c_real_rate})`;
    logParams.s_rate = `${hierarchyData.s_rate} (${hierarchyData.s_real_rate})`;
  } else if (hierarchyData.agent_type == 3) {
    logParams.c_rate = hierarchyData.c_rate;
    logParams.s_rate = hierarchyData.s_rate;
  }

  let conn = await pool.getConnection();
  let casinoLog = mybatisMapper.getStatement('log', 'insertCasinoLog', logParams, sqlFormat);
  let slotLog = mybatisMapper.getStatement('log', 'insertSlotLog', logParams, sqlFormat);
  try {
    if (hierarchyData.c_amount != 0) {
      await conn.query(casinoLog);
    }
    if (hierarchyData.s_amount != 0) {
      await conn.query(slotLog);
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    console.log(`포인트로그: ID: ${logParams.id} 삽입완료`);
    if (conn) return conn.release();
  }
}

function calcRollingPoint(betting, hierarchy) {
  let rollParams = [
    {
      id: hierarchy.p_id,
      agent_type: 0,
      c_amount: (betting.casinoBetting * (hierarchy.p_c_roll - hierarchy.g_c_roll)) / 100,
      s_amount: (betting.slotBetting * (hierarchy.p_s_roll - hierarchy.g_s_roll) * (100 - hierarchy.p_margin)) / 10000,
      c_rate: hierarchy.p_c_roll,
      c_real_rate: hierarchy.p_c_roll - hierarchy.g_c_roll,
      s_rate: hierarchy.p_s_roll,
      s_real_rate: hierarchy.p_s_roll - hierarchy.g_s_roll,
    },
    {
      id: hierarchy.g_id,
      agent_type: 1,
      c_amount: (betting.casinoBetting * (hierarchy.g_c_roll - hierarchy.s_c_roll)) / 100,
      s_amount: (betting.slotBetting * (hierarchy.g_s_roll - hierarchy.s_s_roll) * (100 - hierarchy.g_margin)) / 10000,
      c_rate: hierarchy.g_c_roll,
      c_real_rate: hierarchy.g_c_roll - hierarchy.s_c_roll,
      s_rate: hierarchy.g_s_roll,
      s_real_rate: hierarchy.g_s_roll - hierarchy.s_s_roll,
    },
    {
      id: hierarchy.s_id,
      agent_type: 2,
      c_amount: (betting.casinoBetting * (hierarchy.s_c_roll - hierarchy.b_c_roll)) / 100,
      s_amount: (betting.slotBetting * (hierarchy.s_s_roll - hierarchy.b_s_roll) * (100 - hierarchy.s_margin)) / 10000,
      c_rate: hierarchy.s_c_roll,
      c_real_rate: hierarchy.s_c_roll - hierarchy.b_c_roll,
      s_rate: hierarchy.s_s_roll,
      s_real_rate: hierarchy.s_s_roll - hierarchy.b_s_roll,
    },
    {
      id: hierarchy.b_id,
      agent_type: 3,
      c_amount: (betting.casinoBetting * hierarchy.b_c_roll) / 100,
      s_amount: (betting.slotBetting * hierarchy.b_s_roll * (100 - hierarchy.b_margin)) / 10000,
      c_rate: hierarchy.b_c_roll,
      c_real_rate: hierarchy.b_c_roll,
      s_rate: hierarchy.b_s_roll,
      s_real_rate: hierarchy.b_s_roll,
    },
  ];

  let filteredRollParams = rollParams.filter((item) => item.id !== '');

  return filteredRollParams;
}
// #endregion

// #region Unique export functions
function createUser(params) {
  let url = `${process.env.UNIQUE_API_ENDPOINT}/create`;

  let postData = {
    agentid: process.env.UNIQUE_AGENT_ID,
    userid: '',
  };

  if (params.new_id) {
    postData.userid = params.new_id;
  } else {
    postData.userid = params.id !== undefined ? params.id : params.아이디;
  }

  console.log(postData);

  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };

  axios
    .post(url, postData, config)
    .then((result) => {
      console.log(result.data);
      if (result.data.error == '0') {
        console.log(`[API]유저생성 성공: ID: ${postData.userid}`);
        insertUniqueAccount(postData.userid);
      }
    })
    .catch((error) => {
      console.log(`[API]유저생성 실패: ID: ${params.아이디}`);
      console.log(error);
    });
}

function requestAsset(params) {
  let url;

  params.IDX = moment().format('YYMMDDHHmmss');

  if (params.타입 == '입금') {
    url = `${process.env.UNIQUE_API_ENDPOINT}/deposit`;
    params.midx = `${process.env.UNIQUE_DEPOSIT_PREFIX}${params.IDX}`;
  } else if (params.타입 == '출금') {
    url = `${process.env.UNIQUE_API_ENDPOINT}/withdraw`;
    params.midx = `${process.env.UNIQUE_WITHDRAW_PREFIX}${params.IDX}`;
  } else if (params.type == '지급') {
    url = `${process.env.UNIQUE_API_ENDPOINT}/deposit`;
    params.midx = `${process.env.UNIQUE_GIVE_PREFIX}${params.IDX}`;
    params.id = params.receiverId;
  } else if (params.type == '회수') {
    url = `${process.env.UNIQUE_API_ENDPOINT}/withdraw`;
    params.midx = `${process.env.UNIQUE_TAKE_PREFIX}${params.IDX}`;
    params.id = params.receiverId;
  }

  let postData = {
    agentid: process.env.UNIQUE_AGENT_ID,
    userid: params.id,
    amount: params.reqMoney,
    midx: params.midx,
  };
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };

  return axios
    .post(url, postData, config)
    .then((result) => result.data)
    .catch((error) => {
      console.log(error);
    });
}

async function updateUserBalance(user) {
  let url = `${process.env.UNIQUE_API_ENDPOINT}/userbalance`;
  let postData = {
    agentid: process.env.UNIQUE_AGENT_ID,
    userid: user,
  };

  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };

  let params = {};

  await axios
    .post(url, postData, config)
    .then((result) => {
      params.id = user;
      params.balance = result.data.balance;
    })
    .catch((error) => {
      console.log(error);
    });

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

async function updateAdminBalance() {
  let url = `${process.env.UNIQUE_API_ENDPOINT}/agentbalance`;
  let postData = {
    agentid: process.env.UNIQUE_AGENT_ID,
  };
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };

  let params = {};

  await axios
    .post(url, postData, config)
    .then((result) => {
      params.id = 'admin';
      params.balance = result.data.balance;
    })
    .catch((error) => {
      console.log(error);
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

async function requestDetailLog(user, startTime, endTime) {
  let url = `${process.env.UNIQUE_LOG_ENDPOINT}/log/detail?memid=${user}&prefix=ryl&sdate=${startTime}&edate=${endTime}`;

  await axios
    .get(url)
    .then((result) => {
      let getLog = result.data.data;
      reciveLogCount = getLog.length;
      if (getLog.length != 0) {
        for (item of getLog.reverse()) {
          insertDetailLog(item);
        }
      }
      console.log('[상세베팅정보 요청결과] ID: ' + user + ' / 받아온 로그갯수: ' + getLog.length + ' / 삽입 된 로그갯수: ' + insertLogCount);
      insertLogCount = 0;
    })
    .catch((error) => {
      console.log('[상세베팅정보 수신에러] ID:', user);
      // console.log(error);
    });
}

async function requestSummaryLog(onlineUsers) {
  let requestDate = selectRequestDate();
  let filterdUser;

  let url = `${process.env.UNIQUE_LOG_ENDPOINT}/log/log?prefix=${process.env.UNIQUE_AGENT_PREFIX}&dday=${requestDate}`;

  await axios
    .get(url)
    .then((result) => {
      let getLog = result.data.data;

      filterdUser = getLog.filter((user) => onlineUsers.includes(user.mem_id.substr(3)));
    })
    .catch((error) => {
      console.log(error);
    });

  if (filterdUser.length != 0) {
    for (item of filterdUser) {
      await checkBettingInfo(item);
    }
  }
}

async function updateGameList(res) {
  let brand = ['pragmaticplay', 'bng', 'cq9', 'habanero', 'playson', 'micro', 'qtech'];
  const gameList = [];

  const fetchGames = async (brandName, page = 1) => {
    try {
      const response = await axios.get(`${process.env.UNIQUE_LOG_ENDPOINT}/gamelist/gamelist?brand=${brandName}&page=${page}`);
      const { data } = response.data;
      console.log(brandName, page);
      console.log(data);
      if (data.length > 0) {
        gameList.push(...data);
        if (page === 2 && brandName === 'qtech') {
          await fetchGames(brandName, page + 2);
        } else {
          await fetchGames(brandName, page + 1);
        }
      } else if (brand.length > 0) {
        await fetchGames(brand.shift());
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function insertGameList() {
    let conn = await pool.getConnection();
    console.log(gameList);

    try {
      await conn.beginTransaction();
      // Wrapping gameList into an object under the 'games' property
      let paramObj = { games: gameList };
      let insertGameList = mybatisMapper.getStatement('game', 'insertGameList', paramObj, sqlFormat);
      await conn.query(insertGameList);
      await conn.commit();
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      if (conn) conn.release();
    }
  }

  fetchGames(brand[0])
    .then(async () => {
      await insertGameList();
      res.send('게임리스트 업데이트 완료');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('게임리스트 업데이트 실패');
    });
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
