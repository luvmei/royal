let login_form = document.querySelector('#login-data');

login_form.addEventListener('submit', function (e) {
  e.preventDefault();

  let login_data = $('#login-data').serialize();
  $.ajax({
    method: 'POST',
    url: '/auth/login',
    data: login_data,
  })
    .done(function (result) {
      if (result.isLogin) {
        location.href = '/';
        // location.reload();
      } else {
        document.querySelector('#login-data').reset();
        document.querySelector('#login-alert').classList.remove('d-none');
      }
      // checkLogin(result);
    })
    .fail(function (err) {
      console.log(err);
    });
});
