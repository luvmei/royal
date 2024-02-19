const express = require('express');
const router = express.Router();
const { pool, sqlFormat } = require('../mariadb');
const mybatisMapper = require('mybatis-mapper');
const axios = require('axios');
const JSONbig = require('json-bigint');
const moment = require('moment-timezone');
const cron = require('node-cron');
const api = require(`../public/js/api/${process.env.API_TYPE}`);

// #region 테이블 뷰
router.post('/table', async (req, res) => {
  getData(req, res);
});

async function getData(req, res) {
  let params = req.body;
  let conn = await pool.getConnection();
  let lottoSql;

  if (req.body.type == 'lotto') {
    lottoSql = mybatisMapper.getStatement('event', 'getLottoData', params, sqlFormat);
  }

  try {
    const result = await conn.query(lottoSql);
    res.send(result);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}
// #endregion

// #region 출석체크 이벤트
//? 매월 1일 출석일 내역 초기화
cron.schedule(
  '0 0 1 * *',
  async function () {
    let conn = await pool.getConnection();
    let params = {};
    let resetAttendance = mybatisMapper.getStatement('event', 'resetAttendance', params, sqlFormat);

    try {
      await conn.query(resetAttendance);
    } catch (e) {
      console.log(e);
      return done(e);
    } finally {
      if (conn) conn.release();
    }
  },
  {
    timezone: 'Asia/Seoul',
  }
);

// #endregion

// #region 로또 이벤트
if (process.env.EVENT_LOTTERY == 1) {
  let virtualParticipationCount = 0;
  let winnerAmount = 0;

  getLottoSetting();
  async function getLottoSetting() {
    const conn = await pool.getConnection();
    const sql = mybatisMapper.getStatement('setting', 'getLottoSetting', null, sqlFormat);

    try {
      const result = await conn.query(sql);
      winnerAmount = result[0].lottoWinnerAmount;
      virtualParticipationCount = result[0].lottoNextParticipation;
    } catch (e) {
      console.log(e);
    } finally {
      if (conn) return conn.release();
    }
  }

  function getCurrentRound() {
    const firstRoundStartDate = moment.tz('2023-10-21 20:00:00', 'Asia/Seoul');
    const nowInKST = moment.tz('Asia/Seoul');
    const diffInMinutes = nowInKST.diff(firstRoundStartDate, 'minutes');
    const diffInWeeks = Math.floor(diffInMinutes / 10080);
    const currentRound = 1091 + diffInWeeks;

    if (nowInKST.isSameOrAfter(firstRoundStartDate.clone().add(diffInWeeks + 1, 'weeks'))) {
      currentRound++;
    }

    return currentRound;
  }

  // #region 가상 유저 참여 데이터 생성
  async function getRandomVirtualIds() {
    let conn = await pool.getConnection();
    const query = mybatisMapper.getStatement('event', 'getRandomVirtualIds', null, sqlFormat);

    try {
      const result = await conn.query(query);
      return result;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  function getRoundStartAndEndTime(round) {
    const roundDuration = 7 * 24 * 60;
    const roundStartDate = moment.tz('2023-10-21 21:00:00', 'Asia/Seoul');

    const start = roundStartDate.add((round - 1091) * roundDuration, 'minutes');
    const end = moment(start).add(roundDuration, 'minutes').subtract(2, 'hours');

    return { start, end };
  }

  function generateRandomSixNumbers() {
    let numbers = Array.from({ length: 45 }, (_, i) => i + 1);

    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    return numbers.slice(0, 6).sort((a, b) => a - b);
  }

  async function createLotteryData() {
    let users = await getRandomVirtualIds();
    let lotteryData = [];
    const currentRound = getCurrentRound();
    const { start, end } = getRoundStartAndEndTime(currentRound);
    const roundDurationInMinutes = end.diff(start, 'minutes');
    const intervalMinutes = roundDurationInMinutes / virtualParticipationCount;
    const offsetMinutes = 20;

    for (let i = 0; i < virtualParticipationCount; i++) {
      let submitTime = moment(start).add(intervalMinutes * i, 'minutes');

      // Add random offset, ensuring it doesn't exceed the round's end time
      submitTime.add(Math.floor(Math.random() * offsetMinutes), 'minutes');
      if (submitTime.isAfter(end)) {
        submitTime = moment(end);
      }

      const selectedNumbers = generateRandomSixNumbers();

      lotteryData.push({
        round: currentRound,
        submit_datetime: submitTime.format('YYYY-MM-DD HH:mm:ss'),
        id: users[i].id,
        selected_numbers: selectedNumbers,
        is_virtual: 1,
      });
    }

    return lotteryData;
  }

  async function insertVirtualLotteryData(lotteryData) {
    let conn = await pool.getConnection();
    let params = {
      lotteryData: lotteryData,
    };
    let insertLotteryData = mybatisMapper.getStatement('event', 'insertVirtualLotteryHistory', params, sqlFormat);

    try {
      await conn.query(insertLotteryData);
    } catch (e) {
      console.log(e);
      return done(e);
    } finally {
      if (conn) conn.release();
    }
  }

  async function checkIfRoundDataExists(round) {
    let conn = await pool.getConnection();
    let params = {
      round: round,
    };
    let checkRound = mybatisMapper.getStatement('event', 'checkVirtualLotteryDataByRound', params, sqlFormat);

    try {
      const result = await conn.query(checkRound);
      return result.length > 0;
    } catch (e) {
      console.log(e);
      return done(e);
    } finally {
      if (conn) conn.release();
    }
  }

  async function deleteOlderRoundData(oldRound) {
    let conn = await pool.getConnection();
    let checkRound = mybatisMapper.getStatement('event', 'deleteOlderRoundData', { oldRound: oldRound }, sqlFormat);

    try {
      await conn.query(checkRound);
    } catch (e) {
      console.log(e);
      return done(e);
    } finally {
      if (conn) conn.release();
    }
  }

  async function createWeeklyVirtualLotteryData() {
    const currentRound = getCurrentRound();
    const olderRound = currentRound - 4;
    console.log(`현재 ${currentRound}회차, ${olderRound}회차 이전 데이터는 삭제`);
    const roundDataExists = await checkIfRoundDataExists(currentRound);

    if (!roundDataExists) {
      const virtualLotteryData = await createLotteryData();
      await insertVirtualLotteryData(virtualLotteryData);
      console.log(`${currentRound}회차의 가상 유저 참여데이터 ${virtualParticipationCount}개가 생성되었습니다.`);
    } else {
      console.log(`${currentRound}회차의 가상 유저 참여데이터가 이미 있어서 스킵합니다.`);
    }

    deleteOlderRoundData(olderRound);
  }
  // #endregion

  // #region 당첨 번호 추첨
  async function getWinningNumbers(drwNo) {
    const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;
    try {
      const response = await axios.get(url);
      const data = response.data;
      return [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6];
    } catch (error) {
      console.error('API 요청 중 오류가 발생했습니다:', error);
      return null; // 오류 발생 시 null 반환
    }
  }

  async function checkWinningNumbers() {
    const conn = await pool.getConnection();

    const currentRound = getCurrentRound() - 1;
    const winningNumbers = await getWinningNumbers(currentRound);

    try {
      const randomSelectLotteryHistory = mybatisMapper.getStatement(
        'event',
        'randomSelectLotteryHistory',
        { drwNo: currentRound, count: winnerAmount },
        sqlFormat
      );
      const getLotteryHistory = mybatisMapper.getStatement('event', 'getLotteryHistory', { drwNo: currentRound }, sqlFormat);

      const winners = await conn.query(randomSelectLotteryHistory);
      winners.forEach((winner) => {
        const partialWinningNumbers = selectPartialWinningNumbers(winningNumbers);
        const forcedUpdateHistory = mybatisMapper.getStatement(
          'event',
          'forcedUpdateHistory',
          { lotteryId: winner.lottery_id, winningNumbers: partialWinningNumbers },
          sqlFormat
        );
        conn.query(forcedUpdateHistory);
      });

      const results = await conn.query(getLotteryHistory);

      results.forEach((record) => {
        const selectedNumbers = JSON.parse(record.selected_numbers);
        const matchedNumbers = selectedNumbers.filter((num) => winningNumbers.includes(num));

        if (matchedNumbers.length === 2) {
          prizeAmount = 10000;
        } else if (matchedNumbers.length === 3) {
          prizeAmount = 100000;
        } else if (matchedNumbers.length >= 4) {
          prizeAmount = 3000000;
        } else {
          prizeAmount = 0;
        }

        const params = {
          lotteryId: record.lottery_id,
          winningNumbers: matchedNumbers,
          winningCount: matchedNumbers.length,
          paidPrize: matchedNumbers.length >= 2 ? 2 : 1,
          prizeAmount: prizeAmount,
        };

        const updateLotteryHistory = mybatisMapper.getStatement('event', 'updateLotteryHistory', params, sqlFormat);
        conn.query(updateLotteryHistory);
      });
      // return result;
    } catch (e) {
      console.log(e);
      return done(e);
    } finally {
      if (conn) conn.release();
    }
  }

  function selectPartialWinningNumbers(winningNumbers) {
    const count = Math.random() < 0.95 ? 4 : 5;
    const selectedNumbers = winningNumbers.slice(0, count);
    const remainingNumbers = Array.from({ length: 45 }, (_, i) => i + 1).filter((n) => !winningNumbers.includes(n));
    const shuffledRemainingNumbers = remainingNumbers.sort(() => 0.5 - Math.random());
    const additionalNumbers = shuffledRemainingNumbers.slice(0, 6 - count);
    const finalNumbers = selectedNumbers.concat(additionalNumbers);

    return finalNumbers.sort((a, b) => a - b);
  }

  async function resetLottoState() {
    console.log('로또 이벤트 상태를 초기화합니다.');
    let conn = await pool.getConnection();
    let params = {};
    let resetLottoState = mybatisMapper.getStatement('user', 'resetLottoState', params, sqlFormat);

    try {
      conn.query(resetLottoState);
    } catch (e) {
      console.log(e);
      return done(e);
    } finally {
      if (conn) conn.release();
    }
  }
  // #endregion

  // #region 매주 반복실행
  // checkWinningNumbers();

  createWeeklyVirtualLotteryData();

  cron.schedule(
    '0 20 * * 6',
    async function () {
      await createWeeklyVirtualLotteryData();
      await resetLottoState();
    },
    {
      timezone: 'Asia/Seoul',
    }
  );

  cron.schedule(
    '0 21 * * 6',
    async function () {
      await checkWinningNumbers();
    },
    {
      timezone: 'Asia/Seoul',
    }
  );
  // #endregion
} else {
  console.log('로또 이벤트가 비활성화 되었습니다.');
}
// #endregion

module.exports = router;
