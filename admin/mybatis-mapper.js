const mybatisMapper = require('mybatis-mapper');

mybatisMapper.createMapper([
  './mapper/agent.xml',
  './mapper/bank.xml',
  './mapper/dashboard.xml',
  './mapper/income.xml',
  './mapper/log.xml',
  './mapper/socket.xml',
  './mapper/user.xml',
  './mapper/auth.xml',
  './mapper/board.xml',
  './mapper/game.xml',
  './mapper/setting.xml',
  './mapper/detail.xml',
  './mapper/event.xml',
]);

module.exports = mybatisMapper;
