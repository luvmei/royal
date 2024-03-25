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

module.exports = router;
