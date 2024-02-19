const axios = require('axios');
const { pool, sqlFormat } = require('../../../mariadb');
const mybatisMapper = require('mybatis-mapper');
const moment = require('moment-timezone');
const crypto = require('crypto');

// #region DG private functions

// #region DG Detail Log
function convertTimeToSeoul(data) {
  return data.map((item) => {
    let startTime = item.start_time.slice(0, 19); // 밀리초 제거
    let endTime = item.end_time.slice(0, 19); // 밀리초 제거

    let seoulStartTime = moment.utc(startTime).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    let seoulEndTime = moment.utc(endTime).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

    return {
      ...item,
      start_time: seoulStartTime,
      end_time: seoulEndTime,
    };
  });
}

async function getBetHistory() {
  let time = {
    strat: moment().utc().subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
  };

  console.log(`[DG API] 베팅내역 가져오기: [시작]${time.strat} ~ [종료]${time.end}`);

  let postData = {
    start: time.strat,
    end: time.end,
    store_key: process.env.DG_STORE_KEY,
    limit: 1000,
  };

  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: `${process.env.DG_API_ENDPOINT}/history_evo`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: postData,
  };

  return await axios(config)
    .then((result) => {
      let betResult = result.data.result;
      let convertedData = convertTimeToSeoul(betResult);
      return convertedData;
    })
    .catch((error) => {
      console.log(`[DG API]베팅내역 가져오기 실패: ${error.response.data.message}`);
    });
}

async function insertDetailDgLog(betHistory) {
  let conn = await pool.getConnection();

  let params = { betHistory: betHistory };

  let insertBetHistory = mybatisMapper.getStatement('log', 'insertDetailSdLog', params, sqlFormat);

  try {
    let result = await conn.query(insertBetHistory);
    console.log(`[DG API]베팅내역 업데이트 완료: 받아온 [${betHistory.length}]개 내역 중 [${result.affectedRows}]개 업데이트`);
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}
// #endregion

// #endregion

// #region DG export functions
async function createUser(params) {
  const postData = {
    id: params.new_id || params.id || params.아이디,
    pass: process.env.DG_DEFAULT_PASSWORD,
    store_key: process.env.DG_STORE_KEY,
  };

  const config = {
    method: 'post',
    url: `${process.env.DG_API_ENDPOINT}/login`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: postData,
  };

  await axios(config)
    .then((result) => {
      console.log('[DG API]유저생성 성공', result.data);
      // console.log(`[API]유저생성 성공: ID: ${result.data.data.username}`);
    })
    .catch((error) => {
      console.error(error);
    });
}

async function updateAdminBalance() {
  const postData = {
    store_key: process.env.DG_STORE_KEY,
  };

  const config = {
    method: 'post',
    url: `${process.env.DG_API_ENDPOINT}/agent`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: postData,
  };

  let params = {};

  await axios(config)
    .then((result) => {
      params.id = 'admin';
      params.balance = result.data.result.list[0].balance;
    })
    .catch((error) => {
      console.error(error);
    });

  let conn = await pool.getConnection();
  let sql = mybatisMapper.getStatement('log', 'updateDgBalance', params, sqlFormat);
  try {
    await conn.query(sql);
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

async function updateUserBalance(user) {
  let postData = {
    id: user,
    store_key: process.env.DG_STORE_KEY,
  };

  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: `${process.env.DG_API_ENDPOINT}/balance`,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    data: postData,
  };

  let params = {};
  params.id = user;
  try {
    const result = await axios(config);
    params.balance = result.data.result.balance;
    return params;
  } catch (error) {
    console.log('[DG API] 유저 등록 후 밸런스 체크 재시도');
    // throw error;
  }
}

async function requestDetailLog() {
  let newBetArr = [];
  let getBetArr = await getBetHistory();
  if (getBetArr != undefined) {
    let mappedArr = await getBetArr.flatMap((betting) => {
      let betLog = {
        created_date: betting.start_time,
        transaction_id: betting.idx,
        round_id: betting.game_round,
        username: betting.user_id,
        provider_name: 'Evolution',
        category: 'Live Casino',
        game_id: 'dragon',
        game_title_korean: betting.game_type,
        transaction_type: 'Bet',
        transaction_amount: betting.bet_amount,
        previous_balance: betting.before_amount,
        available_balance: betting.before_amount - betting.bet_amount,
      };

      let winLog = {
        created_date: betting.end_time,
        transaction_id: betting.idx,
        round_id: betting.game_round,
        username: betting.user_id,
        provider_name: 'Evolution',
        category: 'Live Casino',
        game_id: 'dragon',
        game_title_korean: betting.game_type,
        transaction_type: 'Win',
        transaction_amount: betting.win_amount,
        previous_balance: betting.before_amount - betting.bet_amount,
        available_balance: betting.after_amount,
      };

      return [betLog, winLog];
    });
    newBetArr = [...newBetArr, ...mappedArr];
  }

  if (newBetArr.length == 0) {
    console.log('새로운 베팅내역 없음');
    return;
  }

  await insertDetailDgLog(newBetArr);
}

async function requestAsset(params) {
  let url;
  if (params.reqType == 'give' || params.reqType == 'take') {
    params.id = params.receiverId;
  }

  if (params.타입 == '입금') {
    url = `${process.env.DG_API_ENDPOINT}/transaction/deposit`;
  } else if (params.타입 == '출금') {
    url = `${process.env.DG_API_ENDPOINT}/transaction/withdraw`;
  } else if (params.type == '지급') {
    url = `${process.env.DG_API_ENDPOINT}/transaction/deposit`;
    params.타입 = params.type;
  } else if (params.type == '회수') {
    url = `${process.env.DG_API_ENDPOINT}/transaction/withdraw`;
    params.타입 = params.type;
  }

  let postData = {
    id: params.id,
    store_key: process.env.DG_STORE_KEY,
    balance: params.reqMoney,
  };

  postData = JSON.stringify(postData);

  const config = {
    method: 'post',
    url: url,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    data: postData,
  };

  return axios(config)
    .then((result) => {
      console.log('dg asset', result);
      updateUserBalance(params.id);
      if (result.data.error == 0) {
        console.log(`${params.타입}처리 완료: ID: ${params.id}`);
        return result.data.error; // Ensure that we return the data here
      } else {
        throw new Error(`${params.타입}처리 실패: ID: ${params.id}`); // Throw an error if status is not '0'
      }
    })
    .catch((error) => {
      console.log(`${params.타입}처리 실패: ID: ${params.id}`);
      // console.log(error);
      console.log('이 함수가 문제');
      // throw error;
    });
}
// #endregion

module.exports = {
  createUser,
  requestDetailLog,
  updateUserBalance,
  updateAdminBalance,
  requestAsset,
  // requestDetailLog,
  // requestSummaryLog,
};
