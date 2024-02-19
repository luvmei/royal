const axios = require('axios');
const { pool, sqlFormat } = require('../../../mariadb');
const mybatisMapper = require('mybatis-mapper');
const moment = require('moment-timezone');
const crypto = require('crypto');

// #region SD private functions
const BATCH_SIZE = 1000; // 더 작거나 큰 수로 조정 가능

async function insertGameList(gameList) {
  // 1. gameList를 배치 크기로 분할
  const batches = [];
  for (let i = 0; i < gameList.length; i += BATCH_SIZE) {
    batches.push(gameList.slice(i, i + BATCH_SIZE));
  }

  // 2. 각 배치에 대해 처리
  for (const batch of batches) {
    let conn = await pool.getConnection();
    try {
      let params = { games: batch };
      let insertGameList = mybatisMapper.getStatement('game', 'insertGoGameList', params, sqlFormat);

      await conn.query(insertGameList);
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      if (conn) conn.release();
    }
  }
  console.log(`게임리스트 업데이트 완료`);
}

async function getUserBalance(id) {
  let conn = await pool.getConnection();

  let getUserBalance = mybatisMapper.getStatement('user', 'getUserAsset', { id: id }, sqlFormat);

  try {
    let result = await conn.query(getUserBalance);
    console.log(`[GO API]${id} 유저의 현재 보유금: ${result[0].balance.toLocaleString('ko-KR')}`);
    return result[0].balance;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}

// #region HL Detail Log
async function getLatestIdx() {
  let conn = await pool.getConnection();
  let params = {};
  let getLatestGameHistory = mybatisMapper.getStatement('log', 'getLatestIdx', params, sqlFormat);

  try {
    let result = await conn.query(getLatestGameHistory);
    if (result.length == 0) {
      return 0;
    }
    return result[0].transaction_id;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
}

async function getBetHistory() {
  let lastestIdx = await getLatestIdx();

  let currentTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
  console.log(`[GO API] 베팅내역 가져오기 시작: ${currentTime} / 마지막 업데이트 idx: ${lastestIdx}`);

  let postData = {
    opkey: process.env.GO_API_KEY,
    idx: lastestIdx,
  };

  const config = {
    method: 'post',
    url: `${process.env.GO_API_ENDPOINT}/getGameHistoryIdx`,
    data: postData,
  };

  return await axios(config)
    .then((result) => {
      console.log(`[GO API] 베팅내역 가져오기 성공: [${result.data.data.length}]개 내역`);
      return result.data.data;
    })
    .catch((error) => {
      console.log(`[GO API] 베팅내역 가져오기 실패`);
      console.log(error);
    });
}

async function tieChecker(transactions) {
  const modifiedTransactions = [];

  for (let i = 0; i < transactions.length; i++) {
    let transaction = transactions[i];

    // 'BET' 유형의 거래를 확인
    if (transaction.transaction_type === 'BET' && transaction.type === 'live') {
      let nextTransaction = transactions[i + 1];

      // 다음 거래가 있는지, 'WIN' 유형인지 그리고 같은 transactionid를 가지는지 확인
      if (nextTransaction && nextTransaction.transaction_type === 'WIN' && transaction.transactionid === nextTransaction.transactionid) {
        if (transaction.bet === nextTransaction.prize) {
          // 이건 무승부(Tie)입니다. 'BET' 거래를 수정하고 'WIN' 거래를 건너뛴다
          transaction.transaction_type = 'TIE';
          transaction.bet = '0';
          transaction.ef_bet = '0';
          transaction.prize = '0';
          transaction.amoney = transaction.bmoney;
          modifiedTransactions.push(transaction);
          i++; // 다음 'WIN' 거래를 건너뛴다
        } else {
          // 이건 일반 bet-win 쌍입니다. 두 거래 모두 추가한다
          modifiedTransactions.push(transaction);
          modifiedTransactions.push(nextTransaction);
          i++; // 이미 추가했으므로 다음 거래를 건너뛴다
        }
      } else {
        // 해당하는 'WIN'이 없는 단독 'BET'. 그냥 추가한다
        modifiedTransactions.push(transaction);
      }
    } else {
      // 다른 모든 거래 유형에 대해서는 그냥 추가한다
      modifiedTransactions.push(transaction);
    }
  }

  console.log('modifiedTransactions', modifiedTransactions);

  return modifiedTransactions;
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
    opkey: process.env.GO_API_KEY,
    userid: params.아이디 || params.new_id,
  };

  const config = {
    method: 'post',
    url: `${process.env.GO_API_ENDPOINT}/createUser`,
    data: postData,
  };

  axios(config)
    .then((result) => {
      if (result.data.state == '0') {
        console.log(`[GO API]유저생성 성공: ID: ${postData.userid}`);
      } else {
        console.log(`[GO API]유저생성 실패: ID: ${postData.userid}`);
      }
    })
    .catch((error) => {
      console.log('[GO API]유저생성 API에 오류가 있습니다');
    });
}

// async function requestAsset(params) {
//   let url;
//   if (params.reqType == 'give' || params.reqType == 'take') {
//     params.id = params.receiverId;
//     params.nick = params.receiverNick;
//   }

//   let curUserBalance = await getUserBalance(params.id);
//   let remainBalance = curUserBalance - params.reqMoney;

//   if (params.타입 == '입금') {
//     url = `${process.env_GO_API_ENDPOINT}/deposit`;
//   } else if (params.타입 == '출금') {
//     url = `${process.env_GO_API_ENDPOINT}/withdraw`;
//   } else if (params.type == '지급') {
//     url = `${process.env_GO_API_ENDPOINT}/deposit`;
//     params.타입 = params.type;
//   } else if (params.type == '회수') {
//     url = `${process.env_GO_API_ENDPOINT}/withdraw`;
//     params.타입 = params.type;
//   }

//   let postData = {
//     opkey: process.env.GO_API_KEY,
//     userid: params.id
//   };

//   if (['입금', '지급'].includes(params.type)) {
//     postData.amount = params.reqMoney;
//   }

//   const config = {
//     method: 'post',
//     url: url,
//     data: postData,
//   };

//   try {
//     let result = await axios(config);
//     await updateUserBalance(params.id);
//     console.log(`[${params.타입}완료] 신청: ${params.senderId} / 대상: ${params.id} / 금액: ${parseInt(params.reqMoney).toLocaleString('ko-KR')}`);
//     return result;
//   } catch (error) {
//     console.log(error.response.data.message);
//     console.log(`${params.타입}처리 실패: ID: ${params.id}`);
//     createUser(params);
//   }
// }

async function requestAsset(params) {
  if (params.reqType == 'give' || params.reqType == 'take') {
    params.id = params.receiverId;
    params.nick = params.receiverNick;
  }

  let curUserBalance = await getUserBalance(params.id);
  let remainBalance = curUserBalance - params.reqMoney;

  let url = `${process.env.GO_API_ENDPOINT}`;
  let postData = {
    opkey: process.env.GO_API_KEY,
    userid: params.id,
  };

  if (['지급', '회수'].includes(params.type)) {
    params.타입 = params.type;
  }

  if (['입금', '지급'].includes(params.타입)) {
    url += `/deposit`;
    postData.amount = params.reqMoney;
  } else if (['출금', '회수'].includes(params.타입)) {
    url += `/withdraw`;
  }

  const config = {
    method: 'post',
    url: url,
    data: postData,
  };

  try {
    let result = await axios(config);

    if (['출금', '회수'].includes(params.타입) && curUserBalance != params.reqMoney) {
      // 보유금이 0이 된 후, remainBalance만큼 다시 입금
      let depositConfig = {
        method: 'post',
        url: `${process.env.GO_API_ENDPOINT}/deposit`,
        data: {
          opkey: process.env.GO_API_KEY,
          userid: params.id,
          amount: remainBalance,
        },
      };
      await axios(depositConfig);
    }

    await updateUserBalance(params.id);
    if (params.타입 == '지급' || params.타입 == '회수') {
      console.log(`[${params.타입}완료] 신청: ${params.senderId} / 대상: ${params.id} / 금액: ${parseInt(params.reqMoney).toLocaleString('ko-KR')}`);
    } else if (params.타입 == '입금' || params.타입 == '출금') {
      console.log(`[${params.타입}완료] 대상: ${params.id} / 금액: ${parseInt(params.reqMoney).toLocaleString('ko-KR')}`);
    }
    return result;
  } catch (error) {
    await updateUserBalance(params.id);
    createUser(params);
    console.log(`${params.타입}처리 실패: ID: ${params.id}`);
  }
}

async function updateUserBalance(user) {
  let postData = {
    opkey: process.env.GO_API_KEY,
    userid: user,
  };

  const config = {
    method: 'post',
    url: `${process.env.GO_API_ENDPOINT}/getBalance`,
    data: postData,
  };

  let params = {};
  params.id = user;

  try {
    const result = await axios(config);
    if (result.data.state == 0) {
      params.balance = result.data.data[0].balance;
      params.status = parseInt(result.data.state);
      return params;
    } else {
      console.log(`[GO API] 유저 밸런스 업데이트 실패: [${params.id}]유저 없음`);
      createUser(user);
    }
  } catch (error) {
    console.log(error);
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
  let postData = {
    opkey: process.env.GO_API_KEY,
  };

  const config = {
    method: 'post',
    url: `${process.env.GO_API_ENDPOINT}/getAgentBalance`,
    data: postData,
  };

  await axios(config)
    .then((result) => {
      params.id = 'admin';
      params.balance = result.data.data[0].balance;
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
  console.log(`게임리스트 업데이트 시작`);
  let providers = [];
  let slotProviders = [];
  let liveProviders = [];
  let gameList = [];
  let params = {};
  let postData = {
    opkey: process.env.GO_API_KEY,
  };

  const config = {
    method: 'post',
    url: `${process.env.GO_API_ENDPOINT}/getProviderList`,
    data: postData,
  };

  await axios(config)
    .then(async (result) => {
      providers = [...result.data.data];

      for (let provider of providers) {
        postData.gameCode = provider.gamecode;
        const config = {
          method: 'post',
          url: `${process.env.GO_API_ENDPOINT}/getGameList`,
          data: postData,
        };
        await axios(config).then((result) => {
          gameList = gameList.concat(result.data.data);
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });

  if (gameList !== undefined) {
    for (let game of gameList) {
      game.gameName_Kor = game.gameName_Kor.replace(/'/g, '').trim();
      game.gameName_Kor = game.gameName_Kor.replace(/:/g, '').trim();
      game.image = game.image.replace(/'/g, '').trim();
    }
    await insertGameList(gameList);
  }
}

async function requestDetailLog() {
  let getBetArr = await getBetHistory();

  if (getBetArr === undefined || getBetArr.length === 0) {
    console.log('[GO API] 새로운 베팅내역 없음');
    return;
  }

  let checkTieArr = await tieChecker(getBetArr);

  let mappedArr = checkTieArr.map((betting) => {
    return {
      created_date: moment(betting.play_date, 'MM/DD/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
      transaction_id: betting.idx,
      round_id: betting.transactionid,
      username: betting.userid,
      provider_name: betting.gameCode.replace('_slot', '').replace('_casino', ''),
      category: betting.type == 'live' ? 'casino' : betting.type,
      game_id: betting.gameSeq,
      game_title: '',
      transaction_type: betting.transaction_type.toLowerCase(),
      transaction_amount: betting.transaction_type === 'BET' || betting.transaction_type === 'TIE' ? betting.bet : betting.prize,
      previous_balance: betting.bmoney,
      available_balance: betting.amoney,
    };
  });

  let betUsers = [...new Set(mappedArr.map((betting) => betting.username))];

  if (mappedArr.length > 0) {
    await insertDetailHlLog(mappedArr);
  }

  console.log('betUsers', betUsers);
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
