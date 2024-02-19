//? JS
import 'bootstrap';
import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import '../vendor/i18next/i18next.js';
import { io } from 'socket.io-client';
import '@popperjs/core';
import 'jquery.marquee';
import moment from 'moment';
import 'moment-timezone';

import { korean } from './common.js';
import { clientId, clientType, socket, socketPath } from './socket.js';
import './user.js';
import './bank.js';
import './board.js';
import './game.js';
import './event.js';
import './info.js';

//? CSS
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import 'datatables.net-dt/css/jquery.dataTables.css';
// import 'datatables.net-responsive-dt/css/responsive.dataTables.css';
// import '../vendor/aos/aos.css';
// if (process.env.THEME_TYPE === '1') {
//   import('../custom/type_1/css/style_1.css');
// } else if (process.env.THEME_TYPE === '2') {
//   import('../custom/type_2/css/style_2.css');
// }
