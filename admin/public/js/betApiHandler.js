const { pool, sqlFormat } = require('../../mariadb');
const mybatisMapper = require('mybatis-mapper');
const moment = require('moment-timezone');

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

async function getUserBetMarginRate(userId) {
  let conn = await pool.getConnection();
  let params = { id: userId };
  let getUserMarginRate = mybatisMapper.getStatement('user', 'getUserBetMarginRate', params, sqlFormat);

  try {
    let result = await conn.query(getUserMarginRate);
    return result[0];
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

// #region SD Summary Log

async function getSummarylog() {
  let conn = await pool.getConnection();

  let params = {};
  let getSummaryLog = mybatisMapper.getStatement('log', 'getSummaryLog', params, sqlFormat);

  try {
    let result = await conn.query(getSummaryLog);
    return result;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}

async function makeSummaryData() {
  let result = await getSummarylog();

  let data = [];
  let users = [...new Set(result.map((item) => item.user_id))];

  for (let user of users) {
    let userBets = result.filter((item) => item.user_id === user);

    let sportMoney = 0;
    let winbet_sport = 0;
    let slotmoney = 0;
    let winbet = 0;
    let livemoney = 0;
    let winbet_live = 0;

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
      } else if (bet.category === 'live-sport') {
        if (bet.transaction_type === 'bet') sportMoney += Math.abs(bet['sum(transaction_amount)']);
        if (bet.transaction_type === 'win') winbet_sport += Math.abs(bet['sum(transaction_amount)']);
      }
    });

    data.push({
      mem_id: user,
      sportMoney: sportMoney.toFixed(2),
      winbet_sport: winbet_sport.toFixed(2),
      slotmoney: slotmoney.toFixed(2),
      winbet: winbet.toFixed(2),
      livemoney: livemoney.toFixed(2),
      winbet_live: winbet_live.toFixed(2),
    });
  }

  let finalData = { data };
  return finalData.data;
}

const transformToNumber = (obj) => {
  const newObj = { ...obj };
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
  let hierarchyData;
  let hierarchy;
  let rollingPoint;
  betting.currentTime = getCurrentTime();

  // latest = {
  //   sportMoney: Math.floor(latest.sportMoney * 10) / 10,
  //   livemoney: Math.floor(latest.livemoney * 10) / 10,
  //   slotmoney: Math.floor(latest.slotmoney * 10) / 10,
  //   winbet_sport: Math.floor(latest.winbet_sport * 10) / 10,
  //   winbet_live: Math.floor(latest.winbet_live * 10) / 10,
  //   winbet: Math.floor(latest.winbet * 10) / 10,
  // };

  latest = {
    sportMoney: Math.round(latest.sportMoney),
    livemoney: Math.round(latest.livemoney),
    slotmoney: Math.round(latest.slotmoney),
    winbet_sport: Math.round(latest.winbet_sport),
    winbet_live: Math.round(latest.winbet_live),
    winbet: Math.round(latest.winbet),
  };

  let conn = await pool.getConnection();
  let checkBetting = mybatisMapper.getStatement('log', 'checkUserBetting', betting, sqlFormat);

  try {
    let current = await conn.query(checkBetting);
    hierarchyData = await getHierarchyData(betting);
    let { c_bet_margin_rate, s_bet_margin_rate } = await getUserBetMarginRate(betting.mem_id);
    betting.casinoBetMarginRate = c_bet_margin_rate;
    betting.slotBetMarginRate = s_bet_margin_rate;
    current[0] = transformToNumber(current[0]);
    betting.user_id = current[0].user_id;
    betting.sportBetting = latest.sportMoney - current[0].sp_bet;
    betting.sportWin = latest.winbet_sport - current[0].sp_win;
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
      current[0].sp_bet > latest.sportMoney ||
      current[0].sp_win > latest.winbet_sport ||
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
    } else if (current[0].sp_bet == latest.sportMoney && current[0].c_bet == latest.livemoney && current[0].s_bet == latest.slotmoney) {
      if (current[0].sp_win < latest.winbet_sport || current[0].c_win < latest.winbet_live || current[0].s_win < latest.winbet) {
        //todo 이 부분도 아래처럼 하이어라키의 목록에다가 bettingInfo 합산
        hierarchy = await getUserHierarchy(hierarchyData);
        await updateBettingInfo(betting);
        await updateUpperCombineBettingInfo(hierarchy, betting);
        await updateUpperBettingInfo(betting);
        await insertSummaryLog(betting);
      }
      return;
    } else if (current[0].sp_bet < latest.sportMoney || current[0].c_bet < latest.livemoney || current[0].s_bet < latest.slotmoney) {
      //todo 아래 두 함수를 빼고 주석처리 된 부분을 살려서 해당 하이어라키의 목록에다가 bettingInfo 합산
      hierarchy = await getUserHierarchy(hierarchyData);
      await updateBettingInfo(betting);
      await updateUpperCombineBettingInfo(hierarchy, betting);
      await updateUpperBettingInfo(betting);
      await insertSummaryLog(betting);
      await insertBalanceLog(betting);

      if (current[0].c_bet < latest.livemoney || current[0].s_bet < latest.slotmoney) {
        rollingPoint = calcRollingPoint(betting, hierarchy, casinoRollMarginState, slotRollMarginState);

        for (item of rollingPoint.reverse()) {
          await insertRollingCommission(item);
          await insertPointLog(betting, item);
          await addAssetPoint(item);
        }
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

async function updateUpperBettingInfo(betting) {
  // betting.user_id = user.user_id;
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

async function updateUpperCombineBettingInfo(hierarchy, betting) {
  let conn;
  try {
    conn = await pool.getConnection();
    const agentTypes = ['p_id', 'g_id', 's_id', 'b_id'];

    for (const agentType of agentTypes) {
      const agentId = hierarchy[agentType];
      if (agentId !== null) {
        betting.agent_id = agentId;
        let bettingInfo = mybatisMapper.getStatement('log', 'updateCombineBettingInfo', betting, sqlFormat);
        await conn.query(bettingInfo);
      }
    }
  } catch (e) {
    console.log(e);
    // 적절한 오류 처리 수행
  } finally {
    if (conn) conn.release();
  }
}

async function insertSummaryLog(betting) {
  let conn = await pool.getConnection();
  let summarySport = mybatisMapper.getStatement('log', 'insertSummarySportLog', betting, sqlFormat);
  let summaryCasino = mybatisMapper.getStatement('log', 'insertSummaryCasinoLog', betting, sqlFormat);
  let summarySlot = mybatisMapper.getStatement('log', 'insertSummarySlotLog', betting, sqlFormat);

  try {
    await conn.beginTransaction();
    if (betting.sportBetting != 0 || betting.sportWin != 0) {
      result = await conn.query(summarySport);
    }
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
      beforeBalance =
        balance[0].balance + betting.sportBetting - betting.sportWin + betting.casinoBetting - betting.casinoWin + betting.slotBetting - betting.slotWin;
    }
    betting.balance = balance[0].after_balance == undefined ? beforeBalance : balance[0].after_balance;
    betting.afterBalance = betting.balance;

    const operations = [
      { type: 'marginCasinoBetting', message: '카지노베팅 밸런스로그 인서트 완료', multiplier: -1 },
      { type: 'marginCasinoWin', message: '카지노베팅 밸런스로그 인서트 완료', multiplier: 1 },
      { type: 'marginSlotBetting', message: '슬롯베팅 밸런스로그 인서트 완료', multiplier: -1 },
      { type: 'marginSlotWin', message: '슬롯베팅 밸런스로그 인서트 완료', multiplier: 1 },
    ];

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
  //? 롤링포인트 계산(반올림)
  // let rollParams = [
  //   {
  //     id: hierarchy.p_id,
  //     agent_type: 0,
  //     bet_margin_rate: hierarchy.p_bet_margin,
  //     roll_margin_rate: hierarchy.p_roll_margin,
  //     c_roll_amount: Math.round(
  //       (betting.marginCasinoBetting * (hierarchy.p_c_roll * 100 - (hierarchy.g_id ? hierarchy.g_c_roll : hierarchy.u_c_roll) * 100)) / 10000
  //     ),
  //     c_m_roll_amount: Math.round(
  //       Math.round((betting.marginCasinoBetting * (hierarchy.p_c_roll * 100 - (hierarchy.g_id ? hierarchy.g_c_roll : hierarchy.u_c_roll) * 100)) / 10000) *
  //         ((10000 - hierarchy.p_roll_margin * 100) / 10000)
  //     ),
  //     s_roll_amount: Math.round(
  //       (betting.marginSlotBetting * (hierarchy.p_s_roll * 100 - (hierarchy.g_id ? hierarchy.g_s_roll : hierarchy.u_s_roll) * 100)) / 10000
  //     ),
  //     s_m_roll_amount: Math.round(
  //       Math.round((betting.marginSlotBetting * (hierarchy.p_s_roll * 100 - (hierarchy.g_id ? hierarchy.g_s_roll : hierarchy.u_s_roll) * 100)) / 10000) *
  //         ((10000 - hierarchy.p_roll_margin * 100) / 10000)
  //     ),
  //     c_roll_rate: hierarchy.p_c_roll,
  //     c_roll_real_rate: parseFloat((hierarchy.p_c_roll - (hierarchy.g_id ? hierarchy.g_c_roll : hierarchy.u_c_roll)).toFixed(2)),
  //     s_roll_rate: hierarchy.p_s_roll,
  //     s_roll_real_rate: parseFloat((hierarchy.p_s_roll - (hierarchy.g_id ? hierarchy.g_s_roll : hierarchy.u_s_roll)).toFixed(2)),
  //   },
  //   {
  //     id: hierarchy.g_id,
  //     agent_type: 1,
  //     bet_margin_rate: hierarchy.g_bet_margin,
  //     roll_margin_rate: hierarchy.g_roll_margin,
  //     c_roll_amount: Math.round(
  //       (betting.marginCasinoBetting * (hierarchy.g_c_roll * 100 - (hierarchy.s_id ? hierarchy.s_c_roll : hierarchy.u_c_roll) * 100)) / 10000
  //     ),
  //     c_m_roll_amount: Math.round(
  //       Math.round((betting.marginCasinoBetting * (hierarchy.g_c_roll * 100 - (hierarchy.s_id ? hierarchy.s_c_roll : hierarchy.u_c_roll) * 100)) / 10000) *
  //         ((10000 - hierarchy.g_roll_margin * 100) / 10000)
  //     ),
  //     s_roll_amount: Math.round(
  //       (betting.marginSlotBetting * (hierarchy.g_s_roll * 100 - (hierarchy.s_id ? hierarchy.s_s_roll : hierarchy.u_s_roll) * 100)) / 10000
  //     ),
  //     s_m_roll_amount: Math.round(
  //       Math.round((betting.marginSlotBetting * (hierarchy.g_s_roll * 100 - (hierarchy.s_id ? hierarchy.s_s_roll : hierarchy.u_s_roll) * 100)) / 10000) *
  //         ((10000 - hierarchy.g_roll_margin * 100) / 10000)
  //     ),
  //     c_roll_rate: hierarchy.g_c_roll,
  //     c_roll_real_rate: parseFloat((hierarchy.g_c_roll - (hierarchy.s_id ? hierarchy.s_c_roll : hierarchy.u_c_roll)).toFixed(2)),
  //     s_roll_rate: hierarchy.g_s_roll,
  //     s_roll_real_rate: parseFloat((hierarchy.g_s_roll - (hierarchy.s_id ? hierarchy.s_s_roll : hierarchy.u_s_roll)).toFixed(2)),
  //   },
  //   {
  //     id: hierarchy.s_id,
  //     agent_type: 2,
  //     bet_margin_rate: hierarchy.s_bet_margin,
  //     roll_margin_rate: hierarchy.s_roll_margin,
  //     c_roll_amount: Math.round(
  //       (betting.marginCasinoBetting * (hierarchy.s_c_roll * 100 - (hierarchy.b_id ? hierarchy.b_c_roll : hierarchy.u_c_roll) * 100)) / 10000
  //     ),
  //     c_m_roll_amount: Math.round(
  //       Math.round((betting.marginCasinoBetting * (hierarchy.s_c_roll * 100 - (hierarchy.b_id ? hierarchy.b_c_roll : hierarchy.u_c_roll) * 100)) / 10000) *
  //         ((10000 - hierarchy.s_roll_margin * 100) / 10000)
  //     ),
  //     s_roll_amount: Math.round(
  //       (betting.marginSlotBetting * (hierarchy.s_s_roll * 100 - (hierarchy.b_id ? hierarchy.b_s_roll : hierarchy.u_s_roll) * 100)) / 10000
  //     ),
  //     s_m_roll_amount: Math.round(
  //       Math.round((betting.marginSlotBetting * (hierarchy.s_s_roll * 100 - (hierarchy.b_id ? hierarchy.b_s_roll : hierarchy.u_s_roll) * 100)) / 10000) *
  //         ((10000 - hierarchy.s_roll_margin * 100) / 10000)
  //     ),
  //     c_roll_rate: hierarchy.s_c_roll,
  //     c_roll_real_rate: parseFloat((hierarchy.s_c_roll - (hierarchy.b_id ? hierarchy.b_c_roll : hierarchy.u_c_roll)).toFixed(2)),
  //     s_roll_rate: hierarchy.s_s_roll,
  //     s_roll_real_rate: parseFloat((hierarchy.s_s_roll - (hierarchy.b_id ? hierarchy.b_s_roll : hierarchy.u_s_roll)).toFixed(2)),
  //   },
  //   {
  //     id: hierarchy.b_id,
  //     agent_type: 3,
  //     bet_margin_rate: hierarchy.b_bet_margin,
  //     roll_margin_rate: hierarchy.b_roll_margin,
  //     c_roll_amount: Math.round((betting.marginCasinoBetting * (hierarchy.b_c_roll * 100 - hierarchy.u_c_roll * 100)) / 10000),
  //     c_m_roll_amount: Math.round(
  //       Math.round((betting.marginCasinoBetting * (hierarchy.b_c_roll * 100 - hierarchy.u_c_roll * 100)) / 10000) *
  //         ((10000 - hierarchy.b_roll_margin * 100) / 10000)
  //     ),
  //     s_roll_amount: Math.round((betting.marginSlotBetting * (hierarchy.b_s_roll * 100 - hierarchy.u_s_roll * 100)) / 10000),
  //     s_m_roll_amount: Math.round(
  //       Math.round((betting.marginSlotBetting * (hierarchy.b_s_roll * 100 - hierarchy.u_s_roll * 100)) / 10000) *
  //         ((10000 - hierarchy.b_roll_margin * 100) / 10000)
  //     ),
  //     c_roll_rate: hierarchy.b_c_roll,
  //     c_roll_real_rate: parseFloat((hierarchy.b_c_roll - hierarchy.u_c_roll).toFixed(2)),
  //     s_roll_rate: hierarchy.b_s_roll,
  //     s_roll_real_rate: parseFloat((hierarchy.b_s_roll - hierarchy.u_s_roll).toFixed(2)),
  //   },
  //   {
  //     id: hierarchy.u_id,
  //     agent_type: 4,
  //     bet_margin_rate: hierarchy.u_bet_margin,
  //     roll_margin_rate: hierarchy.u_roll_margin,
  //     c_roll_amount: Math.round((betting.marginCasinoBetting * hierarchy.u_c_roll * 100) / 10000),
  //     c_m_roll_amount: Math.round(
  //       Math.round((betting.marginCasinoBetting * hierarchy.u_c_roll * 100) / 10000) * ((10000 - hierarchy.u_roll_margin * 100) / 10000)
  //     ),
  //     s_roll_amount: Math.round((betting.marginSlotBetting * hierarchy.u_s_roll * 100) / 10000),
  //     s_m_roll_amount: Math.round(Math.round((betting.marginSlotBetting * hierarchy.u_s_roll * 100) / 10000) * ((100 - hierarchy.u_roll_margin * 100) / 10000)),
  //     c_roll_rate: hierarchy.u_c_roll,
  //     c_roll_real_rate: parseFloat(hierarchy.u_c_roll.toFixed(2)),
  //     s_roll_rate: hierarchy.u_s_roll,
  //     s_roll_real_rate: parseFloat(hierarchy.u_s_roll.toFixed(2)),
  //   },
  // ];

  //? 롤링포인트 계산(내림)
  let rollParams = [
    {
      id: hierarchy.p_id,
      agent_type: 0,
      c_bet_margin_rate: hierarchy.p_c_bet_margin,
      s_bet_margin_rate: hierarchy.p_s_bet_margin,
      c_roll_margin_rate: hierarchy.p_c_roll_margin,
      s_roll_margin_rate: hierarchy.p_s_roll_margin,
      c_roll_amount: Math.floor(
        (betting.marginCasinoBetting * (hierarchy.p_c_roll * 100 - (hierarchy.g_id ? hierarchy.g_c_roll : hierarchy.u_c_roll) * 100)) / 10000
      ),
      c_m_roll_amount: Math.floor(
        Math.floor((betting.marginCasinoBetting * (hierarchy.p_c_roll * 100 - (hierarchy.g_id ? hierarchy.g_c_roll : hierarchy.u_c_roll) * 100)) / 10000) *
          ((10000 - hierarchy.p_c_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.floor(
        (betting.marginSlotBetting * (hierarchy.p_s_roll * 100 - (hierarchy.g_id ? hierarchy.g_s_roll : hierarchy.u_s_roll) * 100)) / 10000
      ),
      s_m_roll_amount: Math.floor(
        Math.floor((betting.marginSlotBetting * (hierarchy.p_s_roll * 100 - (hierarchy.g_id ? hierarchy.g_s_roll : hierarchy.u_s_roll) * 100)) / 10000) *
          ((10000 - hierarchy.p_s_roll_margin * 100) / 10000)
      ),
      c_roll_rate: hierarchy.p_c_roll,
      c_roll_real_rate: parseFloat((hierarchy.p_c_roll - (hierarchy.g_id ? hierarchy.g_c_roll : hierarchy.u_c_roll)).toFixed(2)),
      s_roll_rate: hierarchy.p_s_roll,
      s_roll_real_rate: parseFloat((hierarchy.p_s_roll - (hierarchy.g_id ? hierarchy.g_s_roll : hierarchy.u_s_roll)).toFixed(2)),
    },
    {
      id: hierarchy.g_id,
      agent_type: 1,
      s_bet_margin_rate: hierarchy.g_s_bet_margin,
      c_bet_margin_rate: hierarchy.g_c_bet_margin,
      s_roll_margin_rate: hierarchy.g_s_roll_margin,
      c_roll_margin_rate: hierarchy.g_c_roll_margin,
      c_roll_amount: Math.floor(
        (betting.marginCasinoBetting * (hierarchy.g_c_roll * 100 - (hierarchy.s_id ? hierarchy.s_c_roll : hierarchy.u_c_roll) * 100)) / 10000
      ),
      c_m_roll_amount: Math.floor(
        Math.floor((betting.marginCasinoBetting * (hierarchy.g_c_roll * 100 - (hierarchy.s_id ? hierarchy.s_c_roll : hierarchy.u_c_roll) * 100)) / 10000) *
          ((10000 - hierarchy.g_c_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.floor(
        (betting.marginSlotBetting * (hierarchy.g_s_roll * 100 - (hierarchy.s_id ? hierarchy.s_s_roll : hierarchy.u_s_roll) * 100)) / 10000
      ),
      s_m_roll_amount: Math.floor(
        Math.floor((betting.marginSlotBetting * (hierarchy.g_s_roll * 100 - (hierarchy.s_id ? hierarchy.s_s_roll : hierarchy.u_s_roll) * 100)) / 10000) *
          ((10000 - hierarchy.g_s_roll_margin * 100) / 10000)
      ),
      c_roll_rate: hierarchy.g_c_roll,
      c_roll_real_rate: parseFloat((hierarchy.g_c_roll - (hierarchy.s_id ? hierarchy.s_c_roll : hierarchy.u_c_roll)).toFixed(2)),
      s_roll_rate: hierarchy.g_s_roll,
      s_roll_real_rate: parseFloat((hierarchy.g_s_roll - (hierarchy.s_id ? hierarchy.s_s_roll : hierarchy.u_s_roll)).toFixed(2)),
    },
    {
      id: hierarchy.s_id,
      agent_type: 2,
      c_bet_margin_rate: hierarchy.s_c_bet_margin,
      s_bet_margin_rate: hierarchy.s_s_bet_margin,
      c_roll_margin_rate: hierarchy.s_c_roll_margin,
      s_roll_margin_rate: hierarchy.s_s_roll_margin,
      c_roll_amount: Math.floor(
        (betting.marginCasinoBetting * (hierarchy.s_c_roll * 100 - (hierarchy.b_id ? hierarchy.b_c_roll : hierarchy.u_c_roll) * 100)) / 10000
      ),
      c_m_roll_amount: Math.floor(
        Math.floor((betting.marginCasinoBetting * (hierarchy.s_c_roll * 100 - (hierarchy.b_id ? hierarchy.b_c_roll : hierarchy.u_c_roll) * 100)) / 10000) *
          ((10000 - hierarchy.s_c_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.floor(
        (betting.marginSlotBetting * (hierarchy.s_s_roll * 100 - (hierarchy.b_id ? hierarchy.b_s_roll : hierarchy.u_s_roll) * 100)) / 10000
      ),
      s_m_roll_amount: Math.floor(
        Math.floor((betting.marginSlotBetting * (hierarchy.s_s_roll * 100 - (hierarchy.b_id ? hierarchy.b_s_roll : hierarchy.u_s_roll) * 100)) / 10000) *
          ((10000 - hierarchy.s_s_roll_margin * 100) / 10000)
      ),
      c_roll_rate: hierarchy.s_c_roll,
      c_roll_real_rate: parseFloat((hierarchy.s_c_roll - (hierarchy.b_id ? hierarchy.b_c_roll : hierarchy.u_c_roll)).toFixed(2)),
      s_roll_rate: hierarchy.s_s_roll,
      s_roll_real_rate: parseFloat((hierarchy.s_s_roll - (hierarchy.b_id ? hierarchy.b_s_roll : hierarchy.u_s_roll)).toFixed(2)),
    },
    {
      id: hierarchy.b_id,
      agent_type: 3,
      c_bet_margin_rate: hierarchy.b_c_bet_margin,
      s_bet_margin_rate: hierarchy.b_s_bet_margin,
      c_roll_margin_rate: hierarchy.b_c_roll_margin,
      s_roll_margin_rate: hierarchy.b_s_roll_margin,
      c_roll_amount: Math.floor((betting.marginCasinoBetting * (hierarchy.b_c_roll * 100 - hierarchy.u_c_roll * 100)) / 10000),
      c_m_roll_amount: Math.floor(
        Math.floor((betting.marginCasinoBetting * (hierarchy.b_c_roll * 100 - hierarchy.u_c_roll * 100)) / 10000) *
          ((10000 - hierarchy.b_c_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.floor((betting.marginSlotBetting * (hierarchy.b_s_roll * 100 - hierarchy.u_s_roll * 100)) / 10000),
      s_m_roll_amount: Math.floor(
        Math.floor((betting.marginSlotBetting * (hierarchy.b_s_roll * 100 - hierarchy.u_s_roll * 100)) / 10000) *
          ((10000 - hierarchy.b_s_roll_margin * 100) / 10000)
      ),
      c_roll_rate: hierarchy.b_c_roll,
      c_roll_real_rate: parseFloat((hierarchy.b_c_roll - hierarchy.u_c_roll).toFixed(2)),
      s_roll_rate: hierarchy.b_s_roll,
      s_roll_real_rate: parseFloat((hierarchy.b_s_roll - hierarchy.u_s_roll).toFixed(2)),
    },
    {
      id: hierarchy.u_id,
      agent_type: 4,
      c_bet_margin_rate: hierarchy.u_c_bet_margin,
      s_bet_margin_rate: hierarchy.u_s_bet_margin,
      c_roll_margin_rate: hierarchy.u_c_roll_margin,
      s_roll_margin_rate: hierarchy.u_s_roll_margin,
      c_roll_amount: Math.floor((betting.marginCasinoBetting * hierarchy.u_c_roll * 100) / 10000),
      c_m_roll_amount: Math.floor(
        Math.floor((betting.marginCasinoBetting * hierarchy.u_c_roll * 100) / 10000) * ((10000 - hierarchy.u_c_roll_margin * 100) / 10000)
      ),
      s_roll_amount: Math.floor((betting.marginSlotBetting * hierarchy.u_s_roll * 100) / 10000),
      s_m_roll_amount: Math.floor(
        Math.floor((betting.marginSlotBetting * hierarchy.u_s_roll * 100) / 10000) * ((10000 - hierarchy.u_s_roll_margin * 100) / 10000)
      ),
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
  logParams.c_bet_margin_rate = hierarchyData.c_bet_margin_rate;
  logParams.s_bet_margin_rate = hierarchyData.s_bet_margin_rate;
  logParams.c_roll_margin_rate = hierarchyData.c_roll_margin_rate;
  logParams.s_roll_margin_rate = hierarchyData.s_roll_margin_rate;
  logParams.c_roll_amount = hierarchyData.c_roll_amount;
  logParams.s_roll_amount = hierarchyData.s_roll_amount;
  logParams.c_m_roll_amount = hierarchyData.c_m_roll_amount;
  logParams.s_m_roll_amount = hierarchyData.s_m_roll_amount;
  logParams.triger = betting.user_id;
  logParams.casinoBetting = betting.casinoBetting;
  logParams.slotBetting = betting.slotBetting;
  logParams.marginCasinoBetting = betting.marginCasinoBetting;
  logParams.marginSlotBetting = betting.marginSlotBetting;

  if (logParams.id == null) {
    let agentText;

    switch (logParams.agent_type) {
      case 1:
        agentText = '골드';
        break;
      case 2:
        agentText = '실버';
        break;
      case 3:
        agentText = '브론즈';
        break;
      default:
        agentText = '';
    }

    // console.log(`포인트를 지급할 ${agentText} 에이전트가 없습니다.`);
    return;
  }

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
      // console.log(`카지노로그: ID: ${logParams.id} 삽입완료`);
    }
    if (hierarchyData.s_roll_amount != 0) {
      await conn.query(slotLog);
      // console.log(`슬롯로그: ID: ${logParams.id} 삽입완료`);
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    // console.log(`포인트로그: ID: ${logParams.id} 삽입완료`);
    if (conn) return conn.release();
  }
}

async function getUserHierarchy(data) {
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

  for (let obj of data[0]) {
    template[obj.type] = obj;
  }

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
// #endregion

// #endregion

// #region SD export functions
async function requestSummaryLog() {
  let summaryData = await makeSummaryData();

  if (summaryData.length != 0) {
    for (item of summaryData) {
      await checkBettingInfo(item);
    }
  }
}
// #endregion

module.exports = {
  requestSummaryLog,
};
