const mybatisMapper = require('mybatis-mapper');

mybatisMapper.createMapper([
  './server/mapper/api.xml',
  './server/mapper/bank.xml',
  './server/mapper/user.xml',
  './server/mapper/game.xml',
  './server/mapper/board.xml',
  './server/mapper/event.xml',
]);

module.exports = mybatisMapper;
