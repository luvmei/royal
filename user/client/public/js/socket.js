export let clientId;
export let clientType;
export let socket;
export let socketPath;

socketConnect();

function socketConnect() {
  $.ajax({
    method: 'POST',
    url: '/socket',
    async: false,
  })
    .done(function (result) {
      if (result.user) {
        clientId = result.user[0].id;
        clientType = result.user[0].type;
        socketPath = result.socketPath;
      } else {
        socketPath = result.socketPath;
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

//? 소켓 연결
if (clientId) {
  socket = io(socketPath, {
    query: { clientId: clientId, clientType: clientType },
  });
  // 소켓 응답
  socket.on('to_user', (data) => {
    let audio;

    if (data.type === 'confirmDeposit') {
      $('#confirm-text').html(`${data.msg}`);
      audio = new Audio('../../public/mp3/deposit_confirm.mp3');
    } else if (data.type === 'confirmDepositAttendant') {
      $('#confirm-text').html(`${data.msg}`);
      audio = new Audio('../../public/mp3/attendance_deposit_confirm.mp3');
    } else if (data.type === 'confirmWithdraw') {
      $('#confirm-text').html(`
      <h3>신청하신 출금요청이 처리되었습니다</h3>
      `);
      audio = new Audio('../../public/mp3/withdraw_confirm.mp3');
    } else if (data.type === 'answerQuestion') {
      $('#confirm-text').html(`
      <h3>문의하신 내용에 대한<br>답변을 확인해 주세요</h3>
      `);
      audio = new Audio('../../public/mp3/answer.mp3');
    } else if (data.type === 'confirmJoin') {
      $('#confirm-text').html(`
      <h3>가입이 승인되었습니다</h3>
      <h3>찾아주셔서 감사합니다</h3>
      `);
      audio = new Audio('../../public/mp3/join_confirm.mp3');
    } else if (data.type === 'sendMessage') {
      $('#confirm-text').html(`
      <h3>메세지가 도착했습니다</h3>
      `);
      audio = new Audio('../../public/mp3/message.mp3');
    } else if (data.type === 'cancelDeposit' || data.type === 'cancelWithdraw') {
      $('#confirm-text').html(`${data.msg}`);
    }


    $('#confirmModal').modal('show');
    audio.play();
  });

  setInterval(() => {
    socket.emit('heartbeat', { timestamp: Date.now() });
  }, 10000); // 예를 들어 10초마다 하트비트를 보냅니다.
}
