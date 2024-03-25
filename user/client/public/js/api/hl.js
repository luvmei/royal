const axios = require('axios');

// #region HL export functions
async function requestGameUrl(req, res) {
  //? 스포츠 테스트
  // let postData = {
  //   username: req.user[0].id,
  //   game_id: 'live_sport',
  //   vendor: 'live-inplay',
  // };

  let postData = {
    username: req.user[0].id,
    game_id: req.body.gameId,
    vendor: req.body.provider,
  };

  const config = {
    method: 'get',
    url: `${process.env.HL_API_ENDPOINT}/game-launch-link`,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    data: postData,
  };

  await axios(config)
    .then((result) => {
      res.send({ url: result.data.link, isLogin: true, provider: req.body.provider });
    })
    .catch((error) => {
      console.log(error.response.data);
      res.send({ url: '', isLogin: true });
    });
}

async function exchangePointToBalance(params) {
  let url = `${process.env.HL_API_ENDPOINT}/user/add-balance`;

  let postData = {
    username: params.id,
    amount: params.reqPoint,
  };

  const config = {
    method: 'post',
    url: url,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    data: postData,
  };

  try {
    let result = await axios(config);
    return result.status;
  } catch (error) {
    console.log(error.response.data.message);
    console.log(`${params.타입}처리 실패: ID: ${params.id}`);
  }
}

async function requestAssetWithdraw(params) {
  const url = `${process.env.HL_API_ENDPOINT}/user/sub-balance`;
  const userBalanceInfo = await updateUserBalance(params.id);

  if (params.reqMoney > userBalanceInfo.balance) {
    params.reqMoney = userBalanceInfo.balance;
  }

  let postData = {
    username: params.id,
    amount: params.reqMoney,
  };

  const config = {
    method: 'post',
    url: url,
    headers: { Authorization: `Bearer ${process.env.HL_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    data: postData,
  };

  try {
    let result = await axios(config);
    //todo 과연 아래의 업데이트 유저 밸런스가 필요할까?
    // await updateUserBalance(params.id);
    console.log(`[${params.타입 || params.type}완료] 대상: ${params.id} / 금액: ${parseInt(params.reqMoney).toLocaleString('ko-KR')}`);

    return result;
  } catch (error) {
    console.log(error.response.data.message);
    console.log(`${params.타입}처리 실패: ID: ${params.id}`);
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

module.exports = {
  requestGameUrl,
  exchangePointToBalance,
  requestAssetWithdraw,
};
