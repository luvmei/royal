const { spinnerToggle } = require('./common');

// 게임리스트 받아오기
let pageNumber = 1;

// #region 인기게임 리스트
// getPopularList();

// function getPopularList() {
//   $.ajax({
//     method: 'POST',
//     url: '/game/list',
//     data: { type: 'popular' },
//   })
//     .done(function (result) {
//       const { reqList, api_type } = result;

//       let elements = '';

//       reqList.forEach((game) => {
//         let providerName = game.provider_name || game.provider;
//         if (api_type === 'hl') {
//           switch (game.provider) {
//             case 'kagaming':
//               providerName = 'KAG 게이밍';
//               break;
//             case 'MicroGaming Plus Slo':
//               providerName = '마이크로 게이밍';
//               break;
//             case 'PragmaticPlay':
//               providerName = '프라그마틱 플레이';
//               break;
//             case 'spinomenal':
//               providerName = '스피노메날';
//               break;
//             case 'playngo':
//               providerName = '플레이 앤 고';
//               break;
//             case 'wazdan':
//             case 'Wazdan':
//               providerName = '와즈단';
//               break;
//             case 'redtiger':
//               providerName = '레드 타이거';
//               break;
//             case 'CQ9':
//               providerName = '씨큐나인';
//               break;
//             case 'greentube':
//               providerName = '그린튜브';
//               break;
//             case 'EVOPLAY':
//               providerName = '에보플레이';
//               break;
//             case 'Blueprint Gaming':
//               providerName = '블루프린트 게이밍';
//               break;
//             case 'Habanero':
//               providerName = '하바네로';
//               break;
//             case 'amatic':
//               providerName = '아마틱';
//               break;
//             case 'endorphina':
//               providerName = '엔도르피나';
//               break;
//             case 'platingaming':
//               providerName = '플레이팅 게이밍';
//               break;
//             case 'dreamtech':
//               providerName = '드림테크';
//               break;
//             case 'netent':
//               providerName = '넷엔트';
//               break;
//             case 'egtjackpot':
//               providerName = 'EGT 잭팟';
//               break;
//             case 'booming':
//               providerName = '부밍';
//               break;
//             case 'PG Soft':
//               providerName = 'PG 소프트';
//               break;
//             case 'eagaming':
//               providerName = 'EA 게이밍';
//               break;
//             case 'Asia Gaming Slot':
//               providerName = '아시아 게이밍 슬롯';
//               break;
//             case 'platipus':
//               providerName = '프라티푸스';
//               break;
//             case 'GameArt':
//               providerName = '게임아트';
//               break;
//             case 'redrake':
//               providerName = '레드 레이크';
//               break;
//             case 'merkur':
//               providerName = '멀커';
//               break;
//             case 'bfgames':
//               providerName = 'BF 게임즈';
//               break;
//             case 'Elk Studios':
//               providerName = '엘크 스튜디오';
//               break;
//             case 'Booongo':
//               providerName = '부운고';
//               break;
//             case 'Nolimit City':
//               providerName = '노리밋 시티';
//               break;
//             case 'intouch-games':
//               providerName = '인터치 게임즈';
//               break;
//             case 'Playson':
//               providerName = '플레이슨';
//               break;
//             case 'PlayPearls':
//               providerName = '플레이 펄스';
//               break;
//             case 'Thunderkick':
//               providerName = '썬더킥';
//               break;
//             case 'retrogames':
//               providerName = '레트로 게임즈';
//               break;
//             case 'Mobilots':
//               providerName = '모빌롯츠';
//               break;
//             case 'PlayStar':
//               providerName = '플레이 스타';
//               break;
//             case 'caletagaming':
//               providerName = '카르타 게이밍';
//               break;
//             case 'netgame':
//               providerName = '넷 게임';
//               break;
//             case 'Relax Gaming':
//               providerName = '릴렉스 게이밍';
//               break;
//             case 'Dragoon Soft':
//               providerName = '드라군 소프트';
//               break;
//             case '1X2 Gaming':
//               providerName = '1X2 게이밍';
//               break;
//             case 'fils':
//               providerName = '필스';
//               break;
//             case 'smartsoft':
//               providerName = '스마트 소프트';
//               break;
//             case 'mancala':
//               providerName = '만칼라';
//               break;
//             case 'onetouch':
//               providerName = '원터치';
//               break;
//             case 'popok':
//               providerName = '포폭';
//               break;
//             case 'Triple Profit Gaming':
//               providerName = '트리플 프로핏 게이밍';
//               break;
//             case 'quickspin':
//               providerName = '퀵스핀';
//               break;
//             case '7777':
//               providerName = '7777';
//               break;
//             case 'classic casino':
//               providerName = '클래식 카지노';
//               break;
//             case '7-mojos-slots':
//               providerName = '세븐 모조스 슬롯';
//               break;
//             case 'iconix':
//               providerName = '아이코닉';
//               break;
//             case 'macaw':
//               providerName = '마카우';
//               break;
//             case 'BigTimeGaming':
//               providerName = '빅타임 게이밍';
//               break;
//             case 'galaxsys':
//               providerName = '갤럭시스';
//               break;
//           }
//         }

//         if (game.provider_name) {
//           game.provider_name = game.provider_name.replace('_slot', '').toUpperCase();
//         }
//         elements += `
//         <div class="col-4 col-lg-2">
//           <img src="${game.img_url}" class="w-100 rounded-3 slot-icon"/>
//           <div class="overlay">
//             <div class="name">${game.title}</div>
//               <a href="#" class="popularGames" data-game_id="${game.uuid}" data-provider="${game.provider}" data-game_type="SLOT">
//               <i class="bi bi-play-circle-fill play"></i>
//               </a>
//             <div class="provider">${providerName}</div>
//           </div>
//         </div>`;
//       });

//       document.querySelector('#nav-popular .row').innerHTML = elements;
//       addEventListenersToGameStartButtons('popularGames');
//     })
//     .fail(function (err) {
//       console.log(err);
//     });
// }
// #endregion

// #region 신작게임 리스트
// getNewList();

// function getNewList() {
//   $.ajax({
//     method: 'POST',
//     url: '/game/list',
//     data: { type: 'new' },
//   })
//     .done(function (result) {
//       const { reqList, api_type } = result;
//       let elements = '';

//       reqList.forEach((game) => {
//         let providerName = game.provider_name || game.provider;
//         if (api_type === 'hl') {
//           switch (game.provider) {
//             case 'kagaming':
//               providerName = 'KAG 게이밍';
//               break;
//             case 'MicroGaming Plus Slo':
//               providerName = '마이크로 게이밍';
//               break;
//             case 'PragmaticPlay':
//               providerName = '프라그마틱 플레이';
//               break;
//             case 'spinomenal':
//               providerName = '스피노메날';
//               break;
//             case 'playngo':
//               providerName = '플레이 앤 고';
//               break;
//             case 'wazdan':
//             case 'Wazdan':
//               providerName = '와즈단';
//               break;
//             case 'redtiger':
//               providerName = '레드 타이거';
//               break;
//             case 'CQ9':
//               providerName = '씨큐나인';
//               break;
//             case 'greentube':
//               providerName = '그린튜브';
//               break;
//             case 'EVOPLAY':
//               providerName = '에보플레이';
//               break;
//             case 'Blueprint Gaming':
//               providerName = '블루프린트 게이밍';
//               break;
//             case 'Habanero':
//               providerName = '하바네로';
//               break;
//             case 'amatic':
//               providerName = '아마틱';
//               break;
//             case 'endorphina':
//               providerName = '엔도르피나';
//               break;
//             case 'platingaming':
//               providerName = '플레이팅 게이밍';
//               break;
//             case 'dreamtech':
//               providerName = '드림테크';
//               break;
//             case 'netent':
//               providerName = '넷엔트';
//               break;
//             case 'egtjackpot':
//               providerName = 'EGT 잭팟';
//               break;
//             case 'booming':
//               providerName = '부밍';
//               break;
//             case 'PG Soft':
//               providerName = 'PG 소프트';
//               break;
//             case 'eagaming':
//               providerName = 'EA 게이밍';
//               break;
//             case 'Asia Gaming Slot':
//               providerName = '아시아 게이밍 슬롯';
//               break;
//             case 'platipus':
//               providerName = '프라티푸스';
//               break;
//             case 'GameArt':
//               providerName = '게임아트';
//               break;
//             case 'redrake':
//               providerName = '레드 레이크';
//               break;
//             case 'merkur':
//               providerName = '멀커';
//               break;
//             case 'bfgames':
//               providerName = 'BF 게임즈';
//               break;
//             case 'Elk Studios':
//               providerName = '엘크 스튜디오';
//               break;
//             case 'Booongo':
//               providerName = '부운고';
//               break;
//             case 'Nolimit City':
//               providerName = '노리밋 시티';
//               break;
//             case 'intouch-games':
//               providerName = '인터치 게임즈';
//               break;
//             case 'Playson':
//               providerName = '플레이슨';
//               break;
//             case 'PlayPearls':
//               providerName = '플레이 펄스';
//               break;
//             case 'Thunderkick':
//               providerName = '썬더킥';
//               break;
//             case 'retrogames':
//               providerName = '레트로 게임즈';
//               break;
//             case 'Mobilots':
//               providerName = '모빌롯츠';
//               break;
//             case 'PlayStar':
//               providerName = '플레이 스타';
//               break;
//             case 'caletagaming':
//               providerName = '카르타 게이밍';
//               break;
//             case 'netgame':
//               providerName = '넷 게임';
//               break;
//             case 'Relax Gaming':
//               providerName = '릴렉스 게이밍';
//               break;
//             case 'Dragoon Soft':
//               providerName = '드라군 소프트';
//               break;
//             case '1X2 Gaming':
//               providerName = '1X2 게이밍';
//               break;
//             case 'fils':
//               providerName = '필스';
//               break;
//             case 'smartsoft':
//               providerName = '스마트 소프트';
//               break;
//             case 'mancala':
//               providerName = '만칼라';
//               break;
//             case 'onetouch':
//               providerName = '원터치';
//               break;
//             case 'popok':
//               providerName = '포폭';
//               break;
//             case 'Triple Profit Gaming':
//               providerName = '트리플 프로핏 게이밍';
//               break;
//             case 'quickspin':
//               providerName = '퀵스핀';
//               break;
//             case '7777':
//               providerName = '7777';
//               break;
//             case 'classic casino':
//               providerName = '클래식 카지노';
//               break;
//             case '7-mojos-slots':
//               providerName = '세븐 모조스 슬롯';
//               break;
//             case 'iconix':
//               providerName = '아이코닉';
//               break;
//             case 'macaw':
//               providerName = '마카우';
//               break;
//             case 'BigTimeGaming':
//               providerName = '빅타임 게이밍';
//               break;
//             case 'galaxsys':
//               providerName = '갤럭시스';
//               break;
//           }
//         }

//         if (game.provider_name) {
//           game.provider_name = game.provider_name.replace('_slot', '').toUpperCase();
//         }
//         elements += `
//         <div class="col-4 col-lg-2">
//           <img src="${game.img_url}" class="w-100 rounded-3 slot-icon"/>
//           <div class="overlay">
//             <div class="name">${game.title}</div>
//               <a href="#" class="newGames" data-game_id="${game.uuid}" data-provider="${game.provider}" data-game_type="SLOT">
//               <i class="bi bi-play-circle-fill play"></i>
//               </a>
//             <div class="provider">${providerName}</div>
//           </div>
//         </div>`;
//       });
//       document.querySelector('#nav-new .row').innerHTML = elements;
//       addEventListenersToGameStartButtons('newGames');
//     })
//     .fail(function (err) {
//       console.log(err);
//     });
// }
// #endregion

// #region 카지노 리스트
getCasinoList();

function getCasinoList() {
  $.ajax({
    method: 'POST',
    url: '/game/list',
    data: { type: 'casino' },
  })
    .done(function (result) {
      const { reqList, api_type, listType } = result;
      let elements = '';

      reqList.forEach((list, i) => {
        if (api_type === 'hl') {
          switch (list.provider_name) {
            case 'Evolution':
              list.provider_name = '에볼루션 카지노';
              break;
            case 'PragmaticPlay Live':
              list.provider_name = '프라그마틱 플레이';
              break;
            case 'EZUGI':
              list.provider_name = '에즈기';
              break;
            case 'VIVO CASINO':
              list.provider_name = '비보 카지노';
              break;
            case 'DREAM GAMING':
              list.provider_name = '드림 게이밍';
              break;
            case 'Micro Gaming':
              list.provider_name = '마이크로 게이밍';
              break;
            case 'ASIA GAMING':
              list.provider_name = '아시아 게이밍';
              break;
            case 'WM Casino':
              list.provider_name = 'WM 카지노';
              break;
            case 'Dowin Casino':
              list.provider_name = '두윈 카지노';
              break;
            case 'BOTA CASINO':
              list.provider_name = '보타 카지노';
              break;
            case 'All Bet':
              list.provider_name = '올벳';
          }
        }

        if (listType == 1) {
          const indexStr = String(i + 1).padStart(2, '0');

          elements += `
        <div class="col">
          <div class="image-container">
            <div class="overlay">
              <div class="name">${list.provider_name}</div>
              <a href="#" class="liveCasino" data-game_id="${list.lobby_code}" data-provider="${list.provider_code}" data-game_type="live">
                <i class="bi bi-play-circle-fill play"></i>
              </a>
            </div>
            <img src="/public/images/casino/img/casino_img_${indexStr}.png" class="w-100 rounded-3 main-image" />
            <img src="/public/images/casino/logo/${list.provider_img}" class="w-100 rounded-3 logo-image" />
            <div class="logo-text">${list.provider_name}</div>
          </div>
        </div>
        `;
        } else if (listType == 2) {
          elements += `
        <div class="col">
                  <img src="/public/images/casino/${list.provider_img}" class="w-100 rounded-3" />
                  <div class="overlay">
                    <div class="name">${list.provider_name}</div>
                    <a href="#" class="liveCasino" data-game_id="${list.lobby_code}" data-provider="${list.provider_code}" data-game_type="live">
                      <i class="bi bi-play-circle-fill play"></i>
                    </a>
                  </div>
                </div>
        `;

          // const providers = [...result.providerSet];
          // console.log('providers', providers);
          // makeSlotProvider(providers, result.api_type);
        }
      });
      document.querySelector('#nav-casino .row').innerHTML = elements;
      addEventListenersToGameStartButtons('liveCasino');
    })
    .fail(function (err) {
      console.log(err);
    });
}
// #endregion

// #region (슬롯)프로바이더 리스트
getProviderList();

function getProviderList() {
  $.ajax({
    method: 'POST',
    url: '/game/list',
    data: { type: 'provider' },
  })
    .done(function (result) {
      const providers = [...result.providerSet];
      makeSlotProvider(providers, result.api_type, result.listType);
    })
    .fail(function (err) {
      console.log(err);
    });
}

function makeSlotProvider(providers, api_type, listType) {
  const navSlotList = document.querySelector('#navSlotList');
  providers.forEach((provider, i) => {
    let providerName;

    if (api_type === 'hl') {
      switch (provider) {
        case 'amatic':
          providerName = '아마틱';
          break;
        case 'bgaming':
          providerName = '비게이밍';
          break;
        case 'expanse':
          providerName = '익스펜스';
          break;
        case 'Hacksaw':
          providerName = '핵쏘';
          break;
        case 'JDB':
          providerName = 'JDB';
          break;
        case 'Kalamba':
          providerName = '칼람바';
          break;
        case 'mplay':
          providerName = '엠플레이';
          break;
        case 'revolver':
          providerName = '리볼버';
          break;
        case 'RubyPlay':
          providerName = '루비플레이';
          break;
        case 'Slotmill':
          providerName = '스롯밀';
          break;
        case 'kagaming':
          providerName = 'KAG 게이밍';
          break;
        case 'MicroGaming Plus Slo':
          providerName = '마이크로 게이밍';
          break;
        case 'micro-gaming':
          providerName = '마이크로 게이밍';
          break;
        case 'PragmaticPlay':
          providerName = '프라그마틱 플레이';
          break;
        case 'spinomenal':
          providerName = '스피노메날';
          break;
        case 'playngo':
          providerName = '플레이 앤 고';
          break;
        case 'wazdan':
          providerName = '와즈단';
          break;
        case 'redtiger':
          providerName = '레드 타이거';
          break;
        case 'CQ9':
          providerName = '씨큐나인';
          break;
        case 'greentube':
          providerName = '그린튜브';
          break;
        case 'evoplay':
          providerName = '에보플레이';
          break;
        case 'Blueprint Gaming':
          providerName = '블루프린트 게이밍';
          break;
        case 'Habanero':
          providerName = '하바네로';
          break;
        case 'amatic':
          providerName = '아마틱';
          break;
        case 'endorphina':
          providerName = '엔도르피나';
          break;
        case 'platingaming':
          providerName = '플레이팅 게이밍';
          break;
        case 'dreamtech':
          providerName = '드림테크';
          break;
        case 'netent':
          providerName = '넷엔트';
          break;
        case 'egtjackpot':
          providerName = 'EGT 잭팟';
          break;
        case 'booming':
          providerName = '부밍';
          break;
        case 'PG Soft':
          providerName = 'PG 소프트';
          break;
        case 'eagaming':
          providerName = 'EA 게이밍';
          break;
        case 'Asia Gaming Slot':
          providerName = '아시아 게이밍 슬롯';
          break;
        case 'platipus':
          providerName = '프라티푸스';
          break;
        case 'GameArt':
          providerName = '게임아트';
          break;
        case 'redrake':
          providerName = '레드 레이크';
          break;
        case 'merkur':
          providerName = '멀커';
          break;
        case 'bfgames':
          providerName = 'BF 게임즈';
          break;
        case 'Elk Studios':
          providerName = '엘크 스튜디오';
          break;
        case 'Booongo':
          providerName = '부운고';
          break;
        case 'Nolimit City':
          providerName = '노리밋 시티';
          break;
        case 'intouch-games':
          providerName = '인터치 게임즈';
          break;
        case 'Playson':
          providerName = '플레이슨';
          break;
        case 'PlayPearls':
          providerName = '플레이 펄스';
          break;
        case 'Thunderkick':
          providerName = '썬더킥';
          break;
        case 'retrogames':
          providerName = '레트로 게임즈';
          break;
        case 'Mobilots':
          providerName = '모빌롯츠';
          break;
        case 'PlayStar':
          providerName = '플레이 스타';
          break;
        case 'caletagaming':
          providerName = '카르타 게이밍';
          break;
        case 'netgame':
          providerName = '넷 게임';
          break;
        case 'Relax Gaming':
          providerName = '릴렉스 게이밍';
          break;
        case 'Dragoon Soft':
          providerName = '드라군 소프트';
          break;
        case '1X2 Gaming':
          providerName = '1X2 게이밍';
          break;
        case 'fils':
          providerName = '필스';
          break;
        case 'smartsoft':
          providerName = '스마트 소프트';
          break;
        case 'mancala':
          providerName = '만칼라';
          break;
        case 'onetouch':
          providerName = '원터치';
          break;
        case 'popok':
          providerName = '포폭';
          break;
        case 'Triple Profit Gaming':
          providerName = '트리플 프로핏 게이밍';
          break;
        case 'quickspin':
          providerName = '퀵스핀';
          break;
        case '7777':
          providerName = '7777';
          break;
        case 'classic casino':
          providerName = '클래식 카지노';
          break;
        case '7-mojos-slots':
          providerName = '세븐 모조스 슬롯';
          break;
        case 'iconix':
          providerName = '아이코닉';
          break;
        case 'macaw':
          providerName = '마카우';
          break;
        case 'BigTimeGaming':
          providerName = '빅타임 게이밍';
          break;
        case 'galaxsys':
          providerName = '갤럭시스';
          break;
        case 'Skywind':
          providerName = '스카이윈드';
          break;
      }
      if (!providerName) {
        return;
      } else if (listType == 1) {
        const indexStr = String(i + 1).padStart(3, '0');
        let newList = `<div class="col-4 col-md-3 col-lg-2 provider-banner">                                                   
                          <div class="image-container">
                          <div class="overlay">
                            <div class="name">${providerName}</div>
                              <a href="#" class="openSlotModal" data-provider="${provider}">
                                <i class="bi bi-play-circle-fill play"></i>
                              </a>                            
                          </div>
                          <img src="/public/images/slots/img/slot_img_${indexStr}.png" class="w-100 rounded-3 main-image" />               
                          <img src="/public/images/slots/logo/${provider}.png" class="w-100 rounded-3 logo-image" />
                          <div class="logo-text">${providerName}</div>
                          </div>
                        </div>`;
        navSlotList.innerHTML += newList;
      } else if (listType == 2) {
        let newList = `<div class="col-4 col-md-3 col-lg-2 provider-banner">
                          <img src="/public/images/slots/${provider.toLowerCase()}.png" class="w-100 rounded-3" />               
                          <div class="overlay">
                            <div class="name">${providerName}</div>
                              <a href="#" class="openSlotModal" data-provider="${provider}">
                                <i class="bi bi-play-circle-fill play"></i>
                              </a>                            
                          </div>
                        </div>`;
        navSlotList.innerHTML += newList;
      }
    }

    $('.openSlotModal').on('click', function (e) {
      let provider = $(this).data('providername') || $(this).data('provider');
      $.ajax({
        method: 'POST',
        url: '/bank/modal',
      }).done(function (result) {
        if (result) {
          $('#slotModal').data('provider', provider).modal('show');
        } else {
          $('#notLoginModal').modal('show');
        }
      });
    });
  });
}
// #endregion

// #region 슬롯 모달 리스트업
$('#slotModal').on('show.bs.modal', function (event) {
  let provider = $(this).data('provider');
  document.querySelector('#slotModal').dataset.provider = provider;
  document.querySelector('#slotModal .modal-title').innerHTML = `${provider}`;
  document.querySelector('#slotModal .modal-body .row').innerHTML = '';
  $.ajax({
    method: 'POST',
    url: '/game/list',
    data: { type: 'slot', provider: provider, pageNumber: pageNumber },
  })
    .done(function (result) {
      const { reqList, api_type } = result;
      insertGameBanner(reqList);
    })
    .fail(function (err) {
      console.log(err);
    });
});

$('#slotModal').on('hide.bs.modal', function () {
  document.querySelector('#slotModal .modal-body .row').innerHTML = '';
  pageNumber = 1;
});

//? 스크롤 끝 추가로딩
let slotModal = document.querySelector('#slotModal');

slotModal.addEventListener('scroll', function handleScroll(event) {
  let scrollPosition = slotModal.scrollTop;
  let scrollHeight = slotModal.scrollHeight;
  let clientHeight = slotModal.clientHeight;

  event.stopPropagation(); // 이벤트 버블링 막기

  // 스크롤이 맨 아래에 도달했을 때 함수 실행
  if (scrollPosition + clientHeight >= scrollHeight - 300) {
    pageNumber++;
    let provider = slotModal.dataset.provider;
    document.querySelector('#slotModal .modal-title').innerHTML = `${provider}`;

    // 스크롤 이벤트 리스너 제거
    slotModal.removeEventListener('scroll', handleScroll);

    $.ajax({
      method: 'POST',
      url: '/game/list',
      data: { type: 'slot', provider: provider, pageNumber: pageNumber },
    })
      .done(function (result) {
        if (result.length !== 0) {
          const { reqList, api_type } = result;
          insertGameBanner(reqList);
          // 스크롤 이벤트 리스너 다시 추가
          slotModal.addEventListener('scroll', handleScroll);
        }
      })
      .fail(function (err) {
        console.log(err);
        // 스크롤 이벤트 리스너 다시 추가
        slotModal.addEventListener('scroll', handleScroll);
      });
  }
});

function insertGameBanner(gameList) {
  const gameModal = document.querySelector(`#slotModal .modal-body .row`);

  gameList.forEach((game) => {
    let newBanner;
    if (game.provider_name) {
      game.provider_name = game.provider_name.replace('_slot', '').toUpperCase();
      newBanner = `
      <div class="col-4 col-md-3 col-lg-2 text-center">
      <img src="${game.img_url}" class="w-100 rounded-3 slot-icon" />
      <div class="overlay ms-auto">
        <div class="name">${game.title}</div>
        <a href="#" class="instanceBanner" data-game_id="${game.uuid}" data-provider="${game.provider}" data-game_type="${game.category}">
          <i class="bi bi-play-circle-fill play"></i>
          </a>    
          <div class="provider">${game.provider_name}</div>
        </div>
      </div>`;
    } else {
      newBanner = `
      <div class="col-4 col-md-3 col-lg-2 text-center">
      <img src="${game.img_url}" class="rounded-3 slot-icon" />
      <div class="overlay ms-auto img-thumbnail">
      <div class="name">${game.title}</div>
      <a href="#" class="instanceBanner" data-game_id="${game.uuid}" data-provider="${game.provider}" data-game_type="${game.category}">
        <i class="bi bi-play-circle-fill play"></i>
        </a>    
        <div class="provider">${game.provider}</div>
        </div>
      </div>`;
    }

    gameModal.insertAdjacentHTML('beforeend', newBanner);
    // gameModal.innerHTML += newBanner;
  });
  // 모달안에 게임배너 만들고 이벤트리스너 추가
  addEventListenersToGameStartButtons('instanceBanner');
}
// #endregion

// #region 게임 시작
// 기존에 HTML에 직접 타이핑 된 요소에 이벤트 리스너 추가
addEventListenersToGameStartButtons('staticBanner');

function addEventListenersToGameStartButtons(className) {
  const gameStartButtons = document.querySelectorAll(`.${className}`);
  gameStartButtons.forEach((button) => {
    if (button.clickHandler) {
      button.removeEventListener('click', button.clickHandler);
    }

    button.clickHandler = (event) => {
      spinnerToggle();
      const gameId = event.currentTarget.dataset.game_id;
      const provider = event.currentTarget.dataset.provider;

      sendGameStartRequest(gameId, provider);
    };
    button.addEventListener('click', button.clickHandler);
  });
}

function sendGameStartRequest(gameId, provider) {
  $.ajax({
    method: 'POST',
    url: '/game/start',
    data: { gameId: gameId, provider: provider },
  })
    .done(function (result) {
      spinnerToggle();
      if (result.isLogin === true) {
        if (result.url !== '') {
          window.open(result.url, '', 'width=' + window.screen.width + ', height=' + window.screen.height + ', top=0, left=0');
        } else if (result.url === '') {
          $('#slotModal').modal('hide');
          document.querySelector('#alertModal .modal-body').innerHTML = `<div class='fs-5'>현재 점검 중인 게임입니다</div>`;
          $('#alertModal').modal('show');
        }
      } else {
        $('#slotModal').modal('hide');
        $('#notLoginModal').modal('show');
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

if (document.getElementById('nav-sport-tab')) {
  document.getElementById('nav-sport-tab').addEventListener('click', async function () {
    $('#sportModal').modal('show');
  });

  document.getElementById('sport-start').addEventListener('click', async function () {
    spinnerToggle();
    sendGameStartRequest('live_sport', 'live-inplay');
  });
}
// #endregion

// #region back-to-top
let mybutton = document.getElementById('btn-back-to-top');

// When the user scrolls down 20px from the top of the document, show the button
slotModal.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (slotModal.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = 'block';
  } else {
    mybutton.style.display = 'none';
  }
}
// When the user clicks on the button, scroll to the top of the document
mybutton.addEventListener('click', backToTop);

function backToTop() {
  slotModal.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
// #endregion
