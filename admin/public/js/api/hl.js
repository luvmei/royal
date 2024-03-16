const axios = require('axios');
const { pool, sqlFormat } = require('../../../mariadb');
const mybatisMapper = require('mybatis-mapper');
const moment = require('moment-timezone');

// #region SD private functions
async function getUserInfo(user) {
  let conn = await pool.getConnection();
  let params = { id: user };

  let getUserInfo = mybatisMapper.getStatement('user', 'getUserInfo', params, sqlFormat);

  try {
    let result = await conn.query(getUserInfo);
    let userInfo = { id: user, nickname: result[0].nickname };
    return userInfo;
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) conn.release();
  }
}

async function insertHlAccount(params) {
  let conn = await pool.getConnection();
  let insertSdAccount = mybatisMapper.getStatement('user', 'insertHlAccount', params, sqlFormat);

  try {
    await conn.query(insertSdAccount);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

const BATCH_SIZE = 1000;

async function insertGameList(gameList) {
  console.log(`게임리스트 업데이트 시작`);

  // 1. gameList를 배치 크기로 분할
  const batches = [];
  for (let i = 0; i < gameList.length; i += BATCH_SIZE) {
    batches.push(gameList.slice(i, i + BATCH_SIZE));
  }

  // 2. 각 배치에 대해 처리
  for (const batch of batches) {
    let conn = await pool.getConnection();
    try {
      const filteredBatch = batch.filter((game) => game.thumbnail && !game.thumbnail.includes("'"));

      let params = { games: filteredBatch };
      let insertGameList = mybatisMapper.getStatement('game', 'insertHlGameList', params, sqlFormat);

      await conn.query(insertGameList);
    } catch (e) {
      console.error('Error:', e);
      console.error('Error stack:', e.stack); // 스택 트레이스도 출력합니다.
      throw e;
    } finally {
      if (conn) conn.release();
    }
  }
  console.log(`게임리스트 업데이트 완료`);
}

// #region HL Detail Log
let processedBetIds = new Map();

async function getBetHistory() {
  let intervalTime = 20;
  let localTime = {
    start: moment().tz('Asia/Seoul').subtract(intervalTime, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
    end: moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
  };
  let time = {
    start: moment().utc().subtract(intervalTime, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
    end: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
  };

  console.log(`[HL API] 베팅내역 가져오기: [시작]${localTime.start} ~ [종료]${localTime.end}`);

  let postData = {
    start: time.start,
    end: time.end,
    page: 1,
    perPage: 1000,
    withDetails: 1,
    order: 'asc',
  };

  const config = {
    method: 'get',
    url: `${process.env.HL_API_ENDPOINT}/transactions`,
    headers: {
      Authorization: `Bearer ${process.env.HL_API_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: postData,
  };

  try {
    const response = await axios(config);
    const data = response.data.data;

    const now = Date.now();
    const twentyMinutes = 20 * 60 * 1000;

    processedBetIds.forEach((value, key) => {
      if (now - value > twentyMinutes) {
        processedBetIds.delete(key);
      }
    });

    const newData = data.filter((item) => {
      if (item.type !== 'bet' && item.type !== 'win') {
        return false;
      }

      // if (item.details.game.type !== 'slot' && item.external.detail == null) {
      //   console.log(item.details.game.type, item.external.detail)
      //   return false;
      // }

      return !processedBetIds.has(item.id);
    });

    newData.forEach((item) => processedBetIds.set(item.id, now));

    const processedData = newData.map((item) => {
      const isTie = item.external?.detail?.data?.result?.outcome === 'Tie';

      return {
        ...item,
        transaction_type: isTie ? 'tie' : item.type,
      };
    });

    return processedData;
  } catch (error) {
    console.log('[HL API]베팅내역 가져오기 실패');
    console.error(error);
    return [];
  }
}

async function insertDetailHlLog(betHistory) {
  let conn = await pool.getConnection();

  let params = { betHistory: betHistory };

  let insertBetHistory = mybatisMapper.getStatement('log', 'insertDetailHlLog', params, sqlFormat);

  try {
    let result = await conn.query(insertBetHistory);
    console.log(`[HL API]베팅내역 업데이트 완료: 받아온 [${betHistory.length}]개 내역 중 [${result.affectedRows}]개 업데이트`);
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}
// #endregion

// #endregion

// #region SD export functions
function createUser(params) {
  let postData = {
    username: params.new_id || params.id || params.아이디,
    nickname: params.new_nickname || params.닉네임 || params.nick,
  };

  const config = {
    method: 'post',
    url: `${process.env.HL_API_ENDPOINT}/user/create`,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    data: postData,
  };

  axios(config)
    .then((result) => {
      if (result.status == 200) {
        insertHlAccount(result.data);
        console.log(`[HL API]유저생성 성공: ID: ${result.data.username}`);
      }
    })
    .catch((error) => {
      console.log(error.response.data);
      console.log(`[HL API]유저생성 실패: ID: ${params.아이디}`);
    });
}

async function requestAsset(params) {
  let url;
  if (params.reqType == 'give' || params.reqType == 'take') {
    params.id = params.receiverId;
    params.nick = params.receiverNick;
  }

  if (params.타입 == '입금' || params.type == '지급' || params.type == '출금취소') {
    url = `${process.env.HL_API_ENDPOINT}/user/add-balance`;
  } else if (params.타입 == '출금' || params.type == '회수') {
    const userBalanceInfo = await updateUserBalance(params.id);
    if (params.reqMoney > userBalanceInfo.balance) {
      params.reqMoney = userBalanceInfo.balance;
    }
    url = `${process.env.HL_API_ENDPOINT}/user/sub-balance`;
  }

  let postData = {
    username: params.id,
    amount: parseInt(params.reqMoney) + parseInt(params.bonusMoney || 0),
  };

  const config = {
    method: 'post',
    url: url,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    data: postData,
  };

  try {
    let result = await axios(config);
    await updateUserBalance(params.id);
    if (params.senderId) {
      console.log(
        `[${params.type}완료] 신청: ${params.senderId} / 대상: ${params.id} / 금액: ${parseInt(params.reqMoney + params.reqBonus).toLocaleString('ko-KR')}`
      );
    } else {
      console.log(`[${params.타입}완료] 대상: ${params.id} / 금액: ${parseInt(params.reqMoney + params.reqBonus).toLocaleString('ko-KR')}`);
    }
    return result;
  } catch (error) {
    console.log(error.response.data.message);
    console.log(`${params.타입 || params.type}처리 실패: ID: ${params.id}`);
    createUser(params);
  }
}

async function updateUserBalance(user) {
  let postData = {
    username: user,
  };

  const config = {
    method: 'get',
    url: `${process.env.HL_API_ENDPOINT}/user`,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    data: postData,
  };

  let params = {};
  params.id = user;

  try {
    const result = await axios(config);
    params.balance = result.data.balance;
    params.status = result.status;
    return params;
  } catch (error) {
    // console.log(error.response);
    console.log(`[HL API] 유저 밸런스 업데이트 실패: [${params.id}]유저 없음`);
    let userInfo = await getUserInfo(user);
    createUser(userInfo);
    return params;
  }
}

async function updateAllUserBalance() {
  const config = {
    method: 'get',
    url: `${process.env.HL_API_ENDPOINT}/user-list`,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
  };

  try {
    const result = await axios(config);
    // console.log('allUserInfo', result.data);
    return result.data;
  } catch (error) {
    // console.log(`에러분석: [${params.id}]유저는 존재하지 않습니다`)
    console.log('allUserInfoError', error);

    // params.status = error.response.status;
    // return params;
  }
}

async function updateAdminBalance() {
  let params = {};

  const config = {
    method: 'get',
    url: `${process.env.HL_API_ENDPOINT}/my-info`,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
  };

  await axios(config)
    .then((result) => {
      params.id = 'admin';
      params.balance = Math.floor(parseFloat(result.data.balance));
    })
    .catch((error) => {
      console.log(error);
      return;
    });

  if (params.balance !== undefined) {
    let conn;
    try {
      conn = await pool.getConnection();
      let sql = mybatisMapper.getStatement('log', 'updateAdminBalance', params, sqlFormat);
      await conn.query(sql);
    } catch (e) {
      console.log(e);
      return done(e);
    } finally {
      if (conn) conn.release();
    }
  } else {
    console.log('관리자의 보유금 정보를 받아오지 못했습니다');
  }
}

async function updateGameList() {
  let gameList = [];
  let params = {};
  let postData = {
    vendor: 'PragmaticPlay',
  };

  const config = {
    method: 'get',
    url: `${process.env.HL_API_ENDPOINT}/game-list`,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    // data: postData,
  };

  await axios(config)
    .then((result) => {
      // gameList = result.data.slice(28, 29);
      gameList = result.data;
    })
    .catch((error) => {
      console.log(error);
    });

  if (gameList !== undefined) {
    for (let game of gameList) {
      // console.log('게임정보', game)
      if (game.langs == null) {
        game.langs = { ko: '' };
      }
      game.title = game.title.replace(/'/g, '').trim();
      game.langs.ko = game.langs.ko.replace(/'/g, '').trim();
    }
    await insertGameList(gameList);
  }
}

async function isTie(betting) {
  if (!betting.external || betting.external?.detail?.data?.result?.outcome !== 'Tie') return false;

  let participants = betting.external?.detail?.data?.participants || [];

  if (participants.length === 0) return false;

  for (let participant of participants) {
    let bets = participant.bets || [];
    if (bets.length === 0) return false;

    for (let bet of bets) {
      if (bet.stake !== bet.payout) return false;
    }
  }
  return true;
}

async function requestDetailLog() {
  let getBetArr = await getBetHistory();

  if (!getBetArr || getBetArr.length === 0) {
    console.log('[HL API] 새로운 베팅내역 없음');
    return;
  }

  let mappedBetArr = getBetArr.map((betting) => ({
    created_date: moment(betting.processed_at).format('YYYY-MM-DD HH:mm:ss'),
    transaction_id: betting.id,
    round_id: betting.details.game.round,
    username: betting.user.username,
    provider_name: betting.details.game.vendor,
    category: betting.details.game.type === 'slot' ? 'slot' : betting.details.game.type === 'live-sport' ? 'live-sport' : 'casino',
    game_id: betting.details.game.id,
    game_title: betting.details.game.title.replace(/'/g, ''),
    transaction_type: betting.transaction_type,
    transaction_amount: betting.amount,
    previous_balance: betting.before,
    available_balance: betting.before + betting.amount,
  }));

  let betUsers = [...new Set(mappedBetArr.map((betting) => betting.username))];

  if (mappedBetArr.length > 0) {
    await insertDetailHlLog(mappedBetArr);
  }

  return betUsers;
}

// #endregion

module.exports = {
  createUser,
  requestAsset,
  updateUserBalance,
  updateAllUserBalance,
  updateAdminBalance,
  requestDetailLog,
  updateGameList,
  getBetHistory,
};
