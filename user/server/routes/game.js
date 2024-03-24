const express = require('express');
const router = express.Router();
const mybatisMapper = require('../mybatis-mapper');
const { pool, sqlFormat } = require('../mariadb');
const api = require(`../../client/public/js/api/${process.env.API_TYPE}`);

router.post('/list', (req, res) => {
  if (req.body.type == 'slot' && process.env.API_TYPE == 'go') {
    req.body.provider = req.body.provider.toLowerCase() + '_slot';
    if (req.body.provider == 'evolution_redtiger_slot') {
      req.body.provider = req.body.provider.replace('_slot', '');
    }
  }
  getList(req, res);
});

async function getList(req, res) {
  let reqList;
  let reqListSql;
  let conn = await pool.getConnection();

  const capitalizedAPIType = process.env.API_TYPE.charAt(0).toUpperCase() + process.env.API_TYPE.slice(1).toLowerCase();
  if (req.body.type == 'provider') {
    reqListSql = mybatisMapper.getStatement('game', `get${capitalizedAPIType}ProviderList`, {}, sqlFormat);
  } else if (req.body.type == 'popular') {
    reqListSql = mybatisMapper.getStatement('game', `get${capitalizedAPIType}PopularList`, {}, sqlFormat);
  } else if (req.body.type == 'new') {
    reqListSql = mybatisMapper.getStatement('game', `get${capitalizedAPIType}NewList`, {}, sqlFormat);
  } else if (req.body.type == 'slot') {
    req.body.offset = (req.body.pageNumber - 1) * 72;
    reqListSql = mybatisMapper.getStatement('game', `get${capitalizedAPIType}SlotList`, req.body, sqlFormat);
  } else if (req.body.type == 'casino') {
    reqListSql = mybatisMapper.getStatement('game', `get${capitalizedAPIType}CasinoList`, req.body, sqlFormat);
  }

  try {
    reqList = await conn.query(reqListSql);
    if (req.body.type == 'casino') {
    }
    let providerSet;
    if (req.body.type == 'provider') {
      if (process.env.API_TYPE === 'hl') {
        providerSet = [...new Set(reqList.map((game) => game.provider))];
      } else if (process.env.API_TYPE === 'go') {
        providerSet = reqList.map((game) => ({
          provider: game.provider,
          providerName: game.provider_name.replace('_slot', '').toUpperCase(),
        }));
      }
      res.send({ providerSet: providerSet, api_type: process.env.API_TYPE, listType: process.env.LIST_TYPE });
    } else {
      res.send({ reqList: reqList, api_type: process.env.API_TYPE, listType: process.env.LIST_TYPE });
    }
  } catch (e) {
    console.log(e);
    return done(e);
  } finally {
    if (conn) return conn.release();
  }
}

router.post('/start', async (req, res) => {
  if (!req.user) {
    res.send({ msg: '로그인이 필요합니다', isLogin: false });
  } else {
    await api.requestGameUrl(req, res);
  }
});

// #region 파싱을 위한 함수
// async function checkAndSyncUserBalance(user) {
//   await syncUserBalance(user);
//   let dbResult = await getUserBalanceFromDB(user);
//   let sdApiResult = await sd.getUserBalance(user);
//   let dgApiResult = await dg.getUserBalance(user);

//   return {
//     dbBalance: dbResult,
//     sdBalance: sdApiResult.balance,
//     dgBalance: dgApiResult.balance,
//   };
// }

// async function syncUserBalance(user) {
//   let maxApiBalance = await getMaxApiBalance(user);
//   let params = { id: user, balance: maxApiBalance };

//   await updateUserBalanceInDB(params, 'updateUserBalance');
// }

// async function getMaxApiBalance(user) {
//   let sdBalance = await sd.getUserBalance(user);
//   let dgBalance = await dg.getUserBalance(user);

//   return Math.max(sdBalance.balance, dgBalance.balance);
// }

// async function getUserBalanceFromDB(user) {
//   let result = await executeDBQuery('getUserBalance', { id: user });
//   return 'dbBalance', result[0].balance;
// }

// async function updateUserBalanceInDB(params, queryType) {
//   let checkTypeResult = await executeDBQuery('checkUserType', params);
//   if (checkTypeResult[0].type == 4) {
//     await executeDBQuery(queryType, params);
//   }
// }

// async function executeDBQuery(query, params) {
//   let conn = await pool.getConnection();
//   let statement = mybatisMapper.getStatement('game', query, params, sqlFormat);

//   try {
//     return await conn.query(statement);
//   } catch (e) {
//     console.log(e);
//     return done(e);
//   } finally {
//     if (conn) conn.release();
//   }
// }

// async function checkUserBalance(user) {
//   await updateUserBalance();
//   let dbResult = await getUserBalance(user);
//   let sdApiResult = await sd.getUserBalance(user);
//   let dgApiResult = await dg.getUserBalance(user);

//   let dbBalance = dbResult.balance;
//   let sdBalance = sdApiResult.balance;
//   let dgBalance = dgApiResult.balance;

//   return { dbBalance, sdBalance, dgBalance };
// }

// async function getUserBalance(user) {
//   let conn = await pool.getConnection();
//   let params = { id: user };

//   let getUserBalance = mybatisMapper.getStatement('game', 'getUserBalance', params, sqlFormat);

//   try {
//     let result = await conn.query(getUserBalance);
//     params.balance = result[0].balance;
//     return params;
//   } catch (e) {
//     console.log(e);
//     return done(e);
//   } finally {
//     if (conn) conn.release();
//   }
// }

// async function updateUserBalance(user){
//   let sdBalance = await sd.getUserBalance(user);
//   let dgBalance = await dg.getUserBalance(user);
//   console.log('sdBalance', sdBalance);
//   console.log('dgBalance', dgBalance);

//   let userBalanceInfo = Math.max(sdBalance.balance, dgBalance.balance);
//   console.log('userBalanceInfo', userBalanceInfo);

//   let params = { id: el, balance: userBalanceInfo };

//   updateUserBalanceInDB(params);
// }

// async function updateUserBalanceInDB(params) {
//   let conn = await pool.getConnection();
//   let checkType = mybatisMapper.getStatement('game', 'checkUserType', params, sqlFormat);
//   let updateBalance = mybatisMapper.getStatement('game', 'updateUserBalance', params, sqlFormat);

//   try {
//     let result = await conn.query(checkType);
//     if (result[0].type == 4) {
//       await conn.query(updateBalance);
//     }
//   } catch (e) {
//     console.log(e);
//     return done(e);
//   } finally {
//     if (conn) return conn.release();
//   }
// }

// async function checkUserPtype(req) {
//   let conn = await pool.getConnection();
//   let params = { id: req.user[0].id };

//   let getUserPtype = mybatisMapper.getStatement('user', 'getUserPtype', params, sqlFormat);

//   try {
//     let result = await conn.query(getUserPtype);
//     return result[0].p_set;
//   } catch (e) {
//     console.log(e);
//     return done(e);
//   } finally {
//     if (conn) conn.release();
//   }
// }
// #endregion

module.exports = router;
