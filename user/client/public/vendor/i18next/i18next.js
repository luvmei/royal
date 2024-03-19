var gameLang = localStorage.getItem('gameLang');
var contents = `<img src="public/images/flag/1x1/${gameLang}.svg" />`;

if (gameLang == null) {
  gameLang = navigator.language;
} else {
  document.querySelectorAll('.langBtn')[0].innerHTML = contents;
  document.querySelectorAll('.langBtn')[1].innerHTML = contents;
  // document.querySelectorAll('.langBtn')[2].innerHTML = contents;
}

i18next.init(
  {
    lng: gameLang,
    fallbackLng: 'en',
    debug: true,
    resources: {
      ko: {
        translation: {
          landing: {
            login: '로그인',
            join: '회원가입',
          },
          nav: {
            notice: '공지',
            deposit: '입금',
            withdraw: '출금',
            reward: '콤프',
            question: '문의',
            message: '메세지',
            attendance: '출석체크',
            userinfo: '회원정보',
            lotto: '로또',
            login: '로그인',
            m_login: '로그인',
            join: '가입',
            m_join: '가입',
            logout: '로그아웃',
          },
          main: {
            popular: '인기게임',
            new: '신작게임',
            casino: '라이브카지노',
            slots: '슬롯게임',
            showAll: '모두보기',
          },
          login: {
            title: '로그인',
            id: '아이디',
            pw: '비밀번호',
            forget: '비밀번호를 잊으셨나요?',
            button: '로그인',
            notyet: '아직 계정이 없으신가요?',
            join: '회원가입',
            not_login: '로그인 후 이용해주세요',
            login_btn: '로그인',
            success: '로그인 되었습니다. 찾아주셔서 감사합니다.',
            logout_btn: '로그아웃',
          },
          join: {
            title: '회원가입',
            id: '아이디',
            id_placeholder: '아이디',
            id_btn: '중복확인',
            id_desc: '영문, 숫자 조합 6~12자',
            pw: '비밀번호',
            pw_placeholder: '비밀번호',
            pw_btn: '비밀번호 확인',
            pw_desc: '영문, 숫자 조합 6~16자',
            nick: '닉네임',
            nick_placeholder: '닉네임',
            nick_btn: '중복확인',
            nick_desc: '한글, 영문, 숫자 3~8자',
            name_placeholder: '이름',
            name_desc: '예금주와 동일한 실명',
            phone_num: '전화번호',
            phone_placeholder: '전화번호',
            phone_btn: '중복확인',
            phone_desc: '( - ) 없이 숫자만 입력',
            bank_select: '은행선택',
            account_num: '계좌번호',
            account_num_placeholder: '계좌번호',
            account_num_desc: '( - ) 없이 숫자만 입력',
            account_holder: '예금주',
            account_holder_placeholder: '예금주',
            account_holder_desc: '실명만 가능',
            withdraw_pw: '출금 비밀번호',
            withdraw_pw_placeholder: '출금 비밀번호',
            withdraw_pw_btn: '비밀번호 확인',
            withdraw_pw_desc: '숫자 6자',
            join_code: '가입코드',
            join_code_placeholder: '가입코드',
            join_code_desc: '가입코드 입력',
            join_code_btn: '가입코드 확인',
            button: '회원가입',
            already: '이미 계정이 있으신가요?',
            login: '로그인',
          },
          bank: {
            bank_01: '국민',
            bank_02: '기업',
            bank_03: '농협',
            bank_04: '신한',
            bank_05: '우리',
            bank_06: '하나',
            bank_07: '카카오뱅크',
            bank_08: '토스뱅크',
            bank_09: '케이뱅크',
            bank_10: '우체국',
            bank_11: 'SC제일',
            bank_12: '한국씨티',
            bank_13: '새마을금고',
            bank_14: '수협',
            bank_15: '신협',
            bank_16: '경남',
            bank_17: '부산',
            bank_18: '광주',
            bank_19: '대구',
            bank_20: '제주',
            bank_21: '전북',
          },
          deposit: {
            title: '입금신청',
            sub: '입금신청 전 필수 확인사항',
            content_1: '- 입금계좌를 확인하지 않으시고 이전 계좌로 입금 시 책임은 본인에게 있습니다.',
            content_2: '- 입금계좌는 수시로 변경되오니 반드시 계좌번호를 확인하신 후 입금해 주시기 바랍니다.',
            content_3: '- 입금 시 입금자명은 반드시 회원님의 실명으로 입금해 주시기 바랍니다.',
            content_4: '- 은행 점검 시간에는 입금이 지연될 수 있으니 점검 시간을 확인해 주시기 바랍니다.',
            content_5: '- 자세한 문의사항은 고객센터를 이용해 주시기 바랍니다.',
            banktime: '은행 업무시간 확인하기',
            cur_money: '현재보유금',
            won: '원',
            account: '입금계좌',
            req_account: '계좌문의하기',
            req_text: '계좌문의하기 버튼을 눌러주세요',
            app_money: '입금신청 할 금액',
            man: '만',
            modify: '정정',
            bonus_text: '입금 보너스',
            after_text: '입금 후 보유금',
            history: '입금 내역 확인',
            submit: '입금 신청',
          },
          withdraw: {
            title: '출금신청',
            sub: '출금신청 전 필수 확인사항',
            content_1: '- 출금신청은 신청한 금액만큼 보유머니에서 차감되어 계좌로 입금됩니다.',
            content_2: '- 출금은 회원가입 시 입력한 계좌정보로만 가능합니다.',
            content_3: '- 출금신청 시 회원가입 시 등록한 출금비밀번호를 입력 해 주세요.',
            content_4: '- 은행 점검 시간에는 입금이 지연될 수 있으니 점검 시간을 확인해 주시기 바랍니다.',
            content_5: '- 자세한 문의사항은 고객센터를 이용해 주시기 바랍니다.',
            banktime: '은행 업무시간 확인하기',
            cur_money: '현재보유금',
            won: '원',
            holder: '예금주',
            bank: '은행',
            account: '계좌번호',
            app_money: '출금신청 할 금액',
            man: '만',
            modify: '정정',
            after_text: '출금 후 보유금',
            history: '출금 내역 확인',
            submit: '출금 신청',
          },
        },
      },
      en: {
        translation: {
          landing: {
            login: 'Login',
            join: 'Sign Up',
          },
          nav: {
            notice: 'Notice',
            deposit: 'Deposit',
            withdraw: 'Withdrawal',
            reward: 'Reward',
            question: 'Question',
            message: 'Message',
            attendance: 'Attendance',
            userinfo: 'User Info',
            lotto: 'Lotto',
            login: 'Login',
            m_login: 'Login',
            join: 'Join',
            m_join: 'Join',
            logout: 'Logout',
          },
          main: {
            popular: 'Popular',
            new: 'New',
            casino: 'Live Casino',
            slots: 'Slots',
            showAll: 'Show All',
          },
          login: {
            title: 'Login',
            id: 'ID',
            pw: 'Password',
            forget: 'Forgot your password?',
            button: 'Login',
            notyet: 'Not a member?',
            join: 'Join Now',
            not_login: 'Please log in first',
            login_btn: 'Login',
            success: 'You have been logged in. Thank you for visiting.',
            logout_btn: 'Logout',
          },
          join: {
            title: 'Sign Up',
            id: 'ID',
            id_btn: 'Double Check',
            id_desc: '6 to 12 alphabetic and numeric combinations',
            pw: 'Password',
            pw_btn: 'Password Check',
            pw_desc: '8 to 16 letters, numbers, and special characters in combination',
            nick: 'Nick Name',
            nick_btn: 'Double Check',
            nick_desc: 'Korean, English, 2 to 8 numbers',
            phone_num: 'Phone Number',
            phone_desc: '( - ) without input, Only numbe',
            bank_select: 'Bank Select',
            account_num: 'Account Number',
            account_num_desc: '( - ) without input, Only number',
            account_holder: 'Account Holder',
            account_holder_desc: 'Real name only',
            withdraw_pw: 'Withdrawal password',
            withdraw_pw_btn: 'Password Check',
            withdraw_pw_desc: '6 digits Number',
            join_code: 'Join Code',
            button: 'Sign Up',
            already: 'Already have an account?',
            login: 'Login',
          },
          bank: {
            bank_01: 'KOOKMIN BANK',
            bank_02: 'INDUSTRIAL BANK OF KOREA',
            bank_03: 'NONGHYUP BANK(NH BANK)',
            bank_04: 'SHINHAN BANK',
            bank_05: 'WOORI BANK',
            bank_06: 'HANA BANK',
            bank_07: 'KAKAO BANK',
            bank_08: 'TOSS BANK',
            bank_09: 'K-BANK',
            bank_10: 'KOREA POST OFFCE',
            bank_11: 'STANDARD CHARTERED BANK KOREA LIMITED',
            bank_12: 'CITIBANK KOREA INC',
            bank_13: '',
            bank_14: 'SUHYUP BANK',
            bank_15: 'SINHYUP BANK',
            bank_16: 'KYONGNAM BANK',
            bank_17: 'KOREA DEVELOPMENT BANK',
            bank_18: 'THE KWANGJU BANK',
            bank_19: 'DAEGU BANK',
            bank_20: 'JEJU BANK',
            bank_21: 'THE JEONBUK BANK',
          },
          deposit: {
            title: 'Deposit Request',
            sub: 'Required Checks Before Applying for Deposit',
            content_1: '- If you do not check the deposit account and deposit money to the previous account, you are responsible for it.',
            content_2: '- The deposit account changes frequently, so be sure to check the account number before depositing.',
            content_3: '- When making a deposit, please make sure to enter the name of the depositor under your real name.',
            content_4: '- Deposits and withdrawals may be delayed during bank inspection hours. Please check the bank inspection times.',
            content_5: '- For further inquiries, please use the customer center.',
            banktime: 'Check the bank inspection hours',
            cur_money: 'Current Money',
            won: ' won',
            account: 'Deposit Account',
            req_account: 'Account Request',
            req_text: 'Please click the Inquire Account button',
            app_money: 'Money to Apply',
            man: 'man',
            modify: 'Modify',
            bonus_text: 'Deposit Bonus',
            after_text: 'After Deposit',
            history: 'History',
            submit: 'Submit',
          },
          withdraw: {
            title: 'Withdrawal Request',
            sub: 'Required Checks Before Applying for Withdrawal',
            content_1: '- For withdrawal requests, the amount requested is deducted from the holding money and deposited into the account.',
            content_2: '- Withdrawal is possible only with the account information entered when registering as a member.',
            content_3: '- When applying for withdrawal, please enter the withdrawal password registered at the time of membership registration.',
            content_4: '- Deposits and withdrawals may be delayed during bank inspection hours. Please check the bank inspection times.',
            content_5: '- For further inquiries, please use the customer center.',
            banktime: 'Check the bank inspection hours',
            cur_money: 'Current Money',
            won: ' won',
            holder: 'Holder',
            bank: 'Bank',
            account: 'Account',
            app_money: 'Money to Apply',
            man: 'man',
            modify: 'Modify',
            after_text: 'After Deposit',
            history: 'History',
            submit: 'Submit',
          },
        },
      },
      cn: {
        translation: {
          landing: {
            login: '登录',
            join: '报名',
          },
          nav: {
            notice: '注意',
            deposit: '订金',
            withdraw: '取款',
            reward: '报酬',
            question: '询问',
            message: '信息',
            attendance: '出席',
            userinfo: '用户信息',
            lotto: '乐透',
            login: '登录',
            m_login: '登录',
            join: '报名',
            m_join: '报名',
            logout: '登出',
          },
          main: {
            popular: '人气',
            new: '新的',
            casino: '真人娱乐场',
            slots: '插槽',
            showAll: '显示所有',
          },
          login: {
            title: '登录',
            id: 'ID',
            pw: 'Password',
            forget: '忘记密码了吗?',
            button: '登录',
            notyet: '还没有帐户?',
            join: '报名',
            not_login: '请先登录',
            login_btn: '登录',
            success: '您已登录。 谢谢您的光临。',
            logout_btn: '登出',
          },
          join: {
            title: '报名',
            id: 'ID',
            id_btn: '重复检查',
            id_desc: '6 到 12 个字母和数字组合',
            pw: '密码',
            pw_btn: '确认密码',
            pw_desc: '8 到 16 个字母、数字和特殊字符的组合',
            nick: '昵称',
            nick_btn: '重复检查',
            nick_desc: '韩文、英文、数字、2~8个字符',
            phone_num: '电话号码',
            phone_desc: '不包括 ( - )，仅输入数字',
            bank_select: '银行选择',
            account_num: '帐号',
            account_num_desc: '不包括 ( - )，仅输入数字',
            account_holder: '账户持有人',
            account_holder_desc: '仅实名',
            withdraw_pw: '提款密码',
            withdraw_pw_btn: '确认密码',
            withdraw_pw_desc: '6个字符的数字',
            join_code: '加入代码',
            button: '报名',
            already: '已经有一个帐户?',
            login: '登录',
          },
          bank: {
            bank_01: 'KOOKMIN BANK',
            bank_02: 'INDUSTRIAL BANK OF KOREA',
            bank_03: 'NONGHYUP BANK(NH BANK)',
            bank_04: 'SHINHAN BANK',
            bank_05: 'WOORI BANK',
            bank_06: 'HANA BANK',
            bank_07: 'KAKAO BANK',
            bank_08: 'TOSS BANK',
            bank_09: 'K-BANK',
            bank_10: 'KOREA POST OFFCE',
            bank_11: 'STANDARD CHARTERED BANK KOREA LIMITED',
            bank_12: 'CITIBANK KOREA INC',
            bank_13: 'THE SAEMAEUL FINANCE FIRM',
            bank_14: 'SUHYUP BANK',
            bank_15: 'SINHYUP BANK',
            bank_16: 'KYONGNAM BANK',
            bank_17: 'KOREA DEVELOPMENT BANK',
            bank_18: 'THE KWANGJU BANK',
            bank_19: 'DAEGU BANK',
            bank_20: 'JEJU BANK',
            bank_21: 'THE JEONBUK BANK',
          },
          deposit: {
            title: '汇款申请',
            sub: '存款申请前所需的清单',
            content_1: '- 未确认汇款账号，往前账户汇款时，责任在于本人.',
            content_2: '- 汇款账号随时变更，请务必确认账号后再汇款.',
            content_3: '- 汇款时请务必以会员实名汇款。.',
            content_4: '- 在银行检查时间内，存款和取款可能会延迟. 请检查银行检查时间.',
            content_5: '- 详细咨询事项请到客服中心咨询.',
            banktime: '查看银行检查时间',
            cur_money: '现存金额',
            won: 'won',
            account: '汇款账号',
            req_account: '咨询账户',
            req_text: '请点击咨询账号按钮',
            app_money: '要申请的金额',
            man: 'man',
            modify: '订正',
            bonus_text: '汇款奖金',
            after_text: '汇款后持有金',
            history: '汇款明细确认',
            submit: '汇款申请',
          },
          withdraw: {
            title: '取款申请',
            sub: '取款申请前必须确认事项',
            content_1: '- 取款申请会按照申请的金额从持有资金中扣除后汇入账户.',
            content_2: '- 取款申请是注册会员时只能通过输入的账户信息进行.',
            content_3: '- 取款申请是注册会员时请输入已登记的取款密码.',
            content_4: '- 在银行检查时间内，存款和取款可能会延迟. 请检查银行检查时间.',
            content_5: '- 详细咨询事项请到客服中心咨询.',
            banktime: '查看银行检查时间',
            cur_money: '现存金额',
            won: 'won',
            holder: '储户',
            bank: '银行',
            account: '汇款账号',
            app_money: '要申请的金额',
            man: 'man',
            modify: '订正',
            after_text: '取款后持有金',
            history: '取款明细确认',
            submit: '取款申请',
          },
        },
      },
      th: {
        translation: {
          landing: {
            login: 'เข้าสู่ระบบ',
            join: 'สมัครสมาชิก',
          },
          nav: {
            notice: 'สังเกต',
            deposit: 'เงินฝาก',
            withdraw: 'เงินถอน',
            reward: 'รางวัล',
            question: 'คำถาม',
            message: 'ข้อความ',
            attendance: 'รางวัล',
            userinfo: 'ข้อมูลสมาชิก',
            lotto: 'ล็อตโต้',
            login: 'เข้าสู่ระบบ',
            m_login: 'เข้าสู่ระบบ',
            join: 'สมัครสมาชิก',
            m_join: 'สมัครสมาชิก',
            logout: 'ออกจากระบบ',
          },
          main: {
            popular: 'อินดี้',
            new: 'ใหม่',
            casino: 'คาสิโนสด',
            slots: 'สล็อต',
            showAll: 'แสดงทั้งหมด',
          },
          login: {
            title: 'เข้าสู่ระบบ',
            id: 'ID',
            pw: 'Password',
            forget: 'ลืมรหัสผ่านหรือไม่?',
            button: 'เข้าสู่ระบบ',
            notyet: 'อย่ามีบัญชีหรือยัง?',
            join: 'สมัครสมาชิก',
            not_login: 'กรุณาเข้าสู่ระบบก่อน',
            login_btn: 'เข้าสู่ระบบ',
            success: 'เข้าสู่ระบบแล้ว ขอบคุณสำหรับการเยี่ยมชม',
            logout_btn: 'ออกจากระบบ',
          },
          join: {
            title: 'สมัครสมาชิก',
            id: 'ID',
            id_btn: 'ตรวจสอบอีกครั้ง',
            id_desc: 'ชุดตัวอักษรและตัวเลข 6 ถึง 12 ชุด',
            pw: 'รหัสผ่าน',
            pw_btn: 'รหัสผ่าน ยืนยัน',
            pw_desc: 'อักขระ 8 ถึง 16 ตัวจากตัวอักษรภาษาอังกฤษ ตัวเลข และอักขระพิเศษผสมกัน',
            nick: 'นามแฝง',
            nick_btn: 'ตรวจสอบอีกครั้ง',
            nick_desc: 'เกาหลี อังกฤษ ตัวเลข 2~8 ตัวอักษร',
            phone_num: 'หมายเลขโทรศัพท์',
            phone_desc: 'ยกเว้น ( - ) ให้ป้อนเฉพาะตัวเลข',
            bank_select: 'ทางเลือกธนาคาร',
            account_num: 'หมายเลขบัญชี',
            account_num_desc: 'ยกเว้น ( - ) ให้ป้อนเฉพาะตัวเลข',
            account_holder: 'ผู้ถือบัญชี',
            account_holder_desc: 'Chỉ tên thật',
            withdraw_pw: 'รหัสผ่านการถอน',
            withdraw_pw_btn: 'รหัสผ่าน ยืนยัน',
            withdraw_pw_desc: 'ตัวเลข 6 ตัว',
            join_code: 'เข้าร่วมรหัส',
            button: 'สมัครสมาชิก',
            already: 'มีบัญชีอยู่แล้ว?',
            login: 'เข้าสู่ระบบ',
          },
          bank: {
            bank_01: 'KOOKMIN BANK',
            bank_02: 'INDUSTRIAL BANK OF KOREA',
            bank_03: 'NONGHYUP BANK(NH BANK)',
            bank_04: 'SHINHAN BANK',
            bank_05: 'WOORI BANK',
            bank_06: 'HANA BANK',
            bank_07: 'KAKAO BANK',
            bank_08: 'TOSS BANK',
            bank_09: 'K-BANK',
            bank_10: 'KOREA POST OFFCE',
            bank_11: 'STANDARD CHARTERED BANK KOREA LIMITED',
            bank_12: 'CITIBANK KOREA INC',
            bank_13: 'THE SAEMAEUL FINANCE FIRM',
            bank_14: 'SUHYUP BANK',
            bank_15: 'SINHYUP BANK',
            bank_16: 'KYONGNAM BANK',
            bank_17: 'KOREA DEVELOPMENT BANK',
            bank_18: 'THE KWANGJU BANK',
            bank_19: 'DAEGU BANK',
            bank_20: 'JEJU BANK',
            bank_21: 'THE JEONBUK BANK',
          },
          deposit: {
            title: 'การขอฝากเงิน',
            sub: 'สิ่งที่ต้องยืนยันก่อนฝากเงิน',
            content_1: '- ไม่ตรวจสอบบัญชีเงินฝากและไม่รับผิดชอบเมื่อฝากเงินเข้าบัญชีอื่นค่ะ.',
            content_2: '- บัญชีเงินฝากมีการเปลี่ยนแปลงบ่อยๆ โปรดตรวจสอบเลขบัญชีและโอนเงินด้วยค่ะ.',
            content_3: '- เมื่อโอนเงินแล้วต้องโอนเงินด้วยชื่อจริงของสมาชิกค่ะ.',
            content_4: '- การฝากและถอนอาจล่าช้าในระหว่างเวลาตรวจสอบธนาคาร โปรดตรวจสอบเวลาเช็คธนาคาร.',
            content_5: '- สำหรับข้อมูลเพิ่มเติมกรุณาใช้ศูนย์บริการลูกค้า.',
            banktime: 'ตรวจสอบเวลาตรวจสอบธนาคาร',
            cur_money: 'เงินที่เก็บไว้',
            won: ' won',
            account: 'เลขบัญชีที่จะฝาก',
            req_account: 'สอบถามเลขบัญชี',
            req_text: 'กรุณากดปุ่มสอบถามเลขบัญชีค่ะ',
            app_money: 'จำนวนเงินที่สมัคร',
            man: 'man',
            modify: 'แก้ไข',
            bonus_text: 'โบนัสฝากเงิน',
            after_text: 'จำนวนเงินหลังจากฝาก',
            history: 'ตรวจสอบประวัติ',
            submit: 'การขอฝากเงิน',
          },
          withdraw: {
            title: 'การขอถอนเงิน',
            sub: 'ข้อควรทราบก่อนขอถอนเงิน',
            content_1: '- การขอถอนเงินจะถูกหักจากจำนวนเงินที่ถูกร้องขอและฝากเข้าบัญชีค่ะ.',
            content_2: '- การถอนเงินสามารถทำได้ด้วยข้อมูลบัญชีที่ป้อนเมื่อสมัครสมาชิกเท่านั้น.',
            content_3: '- เมื่อขอถอนเงิน กรุณากรอกรหัสผ่านที่ขอถอนเงินลงทะเบียนเมื่อสมัครสมาชิกค่ะ.',
            content_4: '- การฝากและถอนอาจล่าช้าในระหว่างเวลาตรวจสอบธนาคาร โปรดตรวจสอบเวลาเช็คธนาคาร.',
            content_5: '- สำหรับข้อมูลเพิ่มเติมกรุณาใช้ศูนย์บริการลูกค้า.',
            banktime: 'ตรวจสอบเวลาตรวจสอบธนาคาร',
            cur_money: 'เงินที่เก็บไว้',
            won: ' won',
            holder: 'ผู้ถือบัญชี',
            bank: 'ธนาคาร',
            account: 'หมายเลขบัญชี',
            app_money: 'จำนวนเงินที่สมัคร',
            man: 'man',
            modify: 'แก้ไข',
            after_text: 'จำนวนเงินหลังการถอน',
            history: 'ตรวจสอบประวัติ',
            submit: 'การขอถอนเงิน',
          },
        },
      },
      vn: {
        translation: {
          landing: {
            login: 'đăng nhập',
            join: 'Đăng ký tài khoản',
          },
          nav: {
            notice: 'thông báo',
            deposit: 'Nạp Tiền',
            withdraw: 'Rút Tiền',
            reward: 'Giải thưởng',
            question: 'câu hỏi',
            message: 'tin nhắn',
            attendance: 'tham dự',
            userinfo: 'Thông tin khách hàng',
            lotto: 'Vé số',
            login: 'đăng nhập',
            m_login: 'đăng nhập',
            join: 'Đăng ký',
            m_join: 'Đăng ký',
            logout: 'đăng xuất',
          },
          main: {
            popular: 'nổi tiếng',
            new: 'Mới',
            casino: 'sòng bạc',
            slots: 'khe cắm',
            showAll: 'hiển thị tất cả',
          },
          login: {
            title: 'đăng nhập',
            id: 'ID',
            pw: 'Password',
            forget: 'Quên mật khẩu?',
            button: 'đăng nhập',
            notyet: 'Vẫn chưa có tài khoản?',
            join: 'tham gia',
            not_login: 'Vui lòng đăng nhập trước',
            login_btn: 'đăng nhập',
            success: 'Bạn đã đăng nhập. Cảm ơn bạn đã ghé thăm.',
            logout_btn: 'đăng xuất',
          },
          join: {
            title: 'Đăng ký tài khoản',
            id: 'ID',
            id_placeholder: 'Tên đăng nhập',
            id_btn: 'kiểm tra hai lần',
            id_desc: '6-12 ký tự  chữ in hoa và số',
            pw: 'mật khẩu',
            pw_placeholder: 'Nhập mật khẩu',
            pw_btn: 'Kiểm tra',
            pw_desc: 'Tiếng Anh, 6 đến 16 ký tự số',
            nick: 'tên nick',
            nick_placeholder: 'Nick Name',
            nick_btn: 'kiểm tra hai lần',
            nick_desc: 'Tiếng Hàn, tiếng Anh, số, 2 ~ 8 ký tự',
            name_placeholder: 'Nhập tên thật',
            name_desc: 'Cùng tên thật với người gửi tiền',
            phone_num: 'Số điện thoại',
            phone_placeholder: 'Nhập số điện thoại',
            phone_btn: 'kiểm tra hai lần',
            phone_desc: 'Không bao gồm ( - ), chỉ nhập số',
            bank_select: 'ựa chọn ngân hàng',
            account_num: 'Số tài khoản',
            account_num_placeholder: 'số tài khoản ngân hàng',
            account_num_desc: 'Nhập số tài khoản ngân hàng',
            account_holder: 'Chủ tài khoản',
            account_holder_placeholder: 'chủ tài khoản ngân hàng',
            account_holder_desc: 'Nhập lại họ và tên chủ tài khoản',
            withdraw_pw: 'Mật khẩu Rút Tiền',
            withdraw_pw_placeholder: 'Tạo mật khẩu rút tiền',
            withdraw_pw_btn: 'Kiểm tra',
            withdraw_pw_desc: '6 ký tự số',
            join_code: 'Mã đăng ký',
            join_code_placeholder: 'Nhập mã giới thiệu',
            join_code_desc: 'Nhập mã đăng ký của bạn',
            join_code_btn: 'Thẩm định',
            button: 'Đăng ký tài khoản',
            already: 'Đã đăng ký?',
            login: 'đăng nhập',
          },
          bank: {
            bank_01: 'KOOKMIN BANK',
            bank_02: 'INDUSTRIAL BANK OF KOREA',
            bank_03: 'NONGHYUP BANK(NH BANK)',
            bank_04: 'SHINHAN BANK',
            bank_05: 'WOORI BANK',
            bank_06: 'HANA BANK',
            bank_07: 'KAKAO BANK',
            bank_08: 'TOSS BANK',
            bank_09: 'K-BANK',
            bank_10: 'KOREA POST OFFCE',
            bank_11: 'STANDARD CHARTERED BANK KOREA LIMITED',
            bank_12: 'CITIBANK KOREA INC',
            bank_13: 'THE SAEMAEUL FINANCE FIRM',
            bank_14: 'SUHYUP BANK',
            bank_15: 'SINHYUP BANK',
            bank_16: 'KYONGNAM BANK',
            bank_17: 'KOREA DEVELOPMENT BANK',
            bank_18: 'THE KWANGJU BANK',
            bank_19: 'DAEGU BANK',
            bank_20: 'JEJU BANK',
            bank_21: 'THE JEONBUK BANK',
          },
          deposit: {
            title: 'Yêu cầu gửi tiền',
            sub: 'Kiểm tra Bắt buộc Trước khi Đăng ký Tiền gửi',
            content_1: '- Nếu bạn chuyển tiền sang tài khoản khác mà không xác minh tài khoản chuyển tiền thì bạn phải chịu trách nhiệm về việc đó.',
            content_2: '- Tài khoản tiền gửi thay đổi thường xuyên, vì vậy hãy nhớ kiểm tra số tài khoản trước khi gửi tiền.',
            content_3: '- Khi gửi tiền, hãy nhớ nhập tên người gửi tiền dưới tên thật của bạn.',
            content_4: '- Việc gửi tiền và Rút Tiền có thể bị trì hoãn trong giờ kiểm tra của ngân hàng. Vui lòng kiểm tra thời gian kiểm tra ngân hàng.',
            content_5: '- Để biết thêm thông tin, vui lòng sử dụng trung tâm khách hàng.',
            banktime: 'Kiểm tra giờ kiểm tra ngân hàng',
            cur_money: 'số tiền nắm giữ',
            won: ' won',
            account: 'tài khoản tiền gửi',
            req_account: 'Truy vấn tài khoản',
            req_text: 'Vui lòng nhấp vào nút Yêu cầu tài khoản',
            app_money: 'số tiền ứng dụng',
            man: 'man',
            modify: 'cài lại',
            bonus_text: 'Tiền thưởng gửi tiền',
            after_text: 'Số dư sau khi nộp đơn',
            history: 'Xem lịch sử',
            submit: 'Nạp Tiền',
          },
          withdraw: {
            title: 'Yêu cầu Rút Tiền',
            sub: 'Kiểm tra Bắt buộc Trước khi Đăng ký Rút Tiền',
            content_1: '- Yêu cầu Rút Tiền sẽ được khấu trừ từ số tiền đang giữ và được gửi vào tài khoản của bạn với số tiền được yêu cầu.',
            content_2: '- Bạn chỉ có thể Rút Tiền với thông tin tài khoản đã nhập khi đăng ký làm thành viên.',
            content_3: '- Khi đăng ký Rút Tiền, vui lòng nhập mật khẩu Rút Tiền đã đăng ký tại thời điểm đăng ký thành viên.',
            content_4: '- Việc gửi tiền và Rút Tiền có thể bị trì hoãn trong giờ kiểm tra của ngân hàng. Vui lòng kiểm tra thời gian kiểm tra ngân hàng.',
            content_5: '- Để biết thêm thông tin, vui lòng sử dụng trung tâm khách hàng.',
            banktime: 'Kiểm tra giờ kiểm tra ngân hàng',
            cur_money: 'số tiền nắm giữ',
            won: ' won',
            holder: 'Chủ tài khoản',
            bank: 'Ngân hàng',
            account: 'Số tài khoản',
            app_money: 'số tiền để áp dụng',
            man: 'man',
            modify: 'cài lại',
            after_text: 'Số dư sau khi nộp đơn',
            history: 'Xem lịch sử',
            submit: 'Rút Tiền',
          },
        },
      },
    },
  },

  function (err, t) {
    if (err) {
      console.error(err);
    } else {
      updateContent();
    }
  }
);

function updateContent() {
  // navbar
  document.getElementById('nav-notice').innerHTML = i18next.t('nav.notice');
  document.getElementById('nav-deposit').innerHTML = i18next.t('nav.deposit');
  document.getElementById('nav-withdraw').innerHTML = i18next.t('nav.withdraw');
  document.getElementById('nav-reward').innerHTML = i18next.t('nav.reward');
  document.getElementById('nav-question').innerHTML = i18next.t('nav.question');
  document.getElementById('nav-message').innerHTML = i18next.t('nav.message');
  document.getElementById('nav-attendance').innerHTML = i18next.t('nav.attendance');
  document.getElementById('nav-userInfo').innerHTML = i18next.t('nav.userinfo');
  document.querySelector('.login-buttons #nav-login').innerHTML = i18next.t('nav.login');
  document.querySelector('.login-buttons #nav-join').innerHTML = i18next.t('nav.join');
  if (document.querySelector('.m_login #mobile-login-btn')) {
    document.querySelector('.m_login #mobile-login-btn').innerHTML = i18next.t('nav.m_login');
  }
  if (document.querySelector('.m_login #nav-join')) {
    document.querySelector('.m_login #nav-join').innerHTML = i18next.t('nav.m_join');
  }
  document.getElementById('nav-logout').innerHTML = i18next.t('nav.logout');

  // main-section
  document.getElementById('main-popular').innerHTML = i18next.t('main.popular');
  document.getElementById('main-new').innerHTML = i18next.t('main.new');
  document.getElementById('main-casino').innerHTML = i18next.t('main.casino');
  document.getElementById('main-slots').innerHTML = i18next.t('main.slots');
  document.getElementById('main-showAll').innerHTML = i18next.t('main.showAll');

  //login-modal
  document.getElementById('login-title').innerHTML = i18next.t('login.title');
  document.getElementById('login-id').innerHTML = i18next.t('login.id');
  document.getElementById('login-pw').innerHTML = i18next.t('login.pw');
  document.getElementById('login-forget').innerHTML = i18next.t('login.forget');
  document.getElementById('login-btn').innerHTML = i18next.t('login.button');
  document.getElementById('login-notyet').innerHTML = i18next.t('login.notyet');
  document.getElementById('login-join').innerHTML = i18next.t('login.join');
  document.getElementById('not-login-text').innerHTML = i18next.t('login.not_login');
  document.querySelector('#notLoginModal .btn-warning').innerHTML = i18next.t('login.login_btn');
  document.getElementById('confirm-text').innerHTML = i18next.t('login.success');
  document.getElementById('notice-logout-btn').innerHTML = i18next.t('login.logout_btn');

  //join-modal
  document.getElementById('join-title').innerHTML = i18next.t('join.title');
  document.getElementById('join-id').innerHTML = i18next.t('join.id');
  document.getElementById('join-id').nextElementSibling.innerHTML = i18next.t('join.id_placeholder');
  document.getElementById('join-id-btn').innerHTML = i18next.t('join.id_btn');
  document.getElementById('join-id-desc').innerHTML = i18next.t('join.id_desc');
  document.getElementById('join-pw').innerHTML = i18next.t('join.pw');
  document.getElementById('join-pw').nextElementSibling.innerHTML = i18next.t('join.pw_placeholder');
  document.getElementById('join-pw-btn').innerHTML = i18next.t('join.pw_btn');
  document.getElementById('join-pw-desc').innerHTML = i18next.t('join.pw_desc');
  document.getElementById('join-nick').innerHTML = i18next.t('join.nick');
  document.getElementById('join-nick').nextElementSibling.innerHTML = i18next.t('join.nick_placeholder');
  document.getElementById('join-nick-btn').innerHTML = i18next.t('join.nick_btn');
  document.getElementById('join-nick-desc').innerHTML = i18next.t('join.nick_desc');
  // document.getElementById('join-name').innerHTML = i18next.t('join.name');
  // document.getElementById('join-name').nextElementSibling.innerHTML = i18next.t('join.name_placeholder');
  // document.getElementById('join-name-desc').innerHTML = i18next.t('join.name_desc');
  document.getElementById('join-phone-num').innerHTML = i18next.t('join.phone_num');
  document.getElementById('join-phone-num').nextElementSibling.innerHTML = i18next.t('join.phone_placeholder');
  document.getElementById('join-phone-btn').innerHTML = i18next.t('join.phone_btn');
  document.getElementById('join-phone-desc').innerHTML = i18next.t('join.phone_desc');
  document.getElementById('join-bank-select').innerHTML = i18next.t('join.bank_select');
  document.getElementById('join-account-num').innerHTML = i18next.t('join.account_num');
  document.getElementById('join-account-num').nextElementSibling.innerHTML = i18next.t('join.account_num_placeholder');
  document.getElementById('join-account-num-desc').innerHTML = i18next.t('join.account_num_desc');
  document.getElementById('join-account-holder').innerHTML = i18next.t('join.account_holder');
  document.getElementById('join-account-holder').nextElementSibling.innerHTML = i18next.t('join.account_holder_placeholder');
  document.getElementById('join-account-holder-desc').innerHTML = i18next.t('join.account_holder_desc');
  document.getElementById('join-withdraw-pw').innerHTML = i18next.t('join.withdraw_pw');
  document.getElementById('join-withdraw-pw').nextElementSibling.innerHTML = i18next.t('join.withdraw_pw_placeholder');
  document.getElementById('join-withdraw-pw-btn').innerHTML = i18next.t('join.withdraw_pw_btn');
  document.getElementById('join-withdraw-pw-desc').innerHTML = i18next.t('join.withdraw_pw_desc');
  document.getElementById('join-code').innerHTML = i18next.t('join.join_code');
  document.getElementById('join-code').nextElementSibling.innerHTML = i18next.t('join.join_code_placeholder');
  document.getElementById('join-code-desc').innerHTML = i18next.t('join.join_code_desc');
  document.getElementById('join-code-btn').innerHTML = i18next.t('join.join_code_btn');
  document.getElementById('join-btn').innerHTML = i18next.t('join.button');
  document.getElementById('join-already').innerHTML = i18next.t('join.already');
  document.getElementById('join-login').innerHTML = i18next.t('join.login');

  //bank-name
  document.getElementById('bank-01').innerHTML = i18next.t('bank.bank_01');
  document.getElementById('bank-02').innerHTML = i18next.t('bank.bank_02');
  document.getElementById('bank-03').innerHTML = i18next.t('bank.bank_03');
  document.getElementById('bank-04').innerHTML = i18next.t('bank.bank_04');
  document.getElementById('bank-05').innerHTML = i18next.t('bank.bank_05');
  document.getElementById('bank-06').innerHTML = i18next.t('bank.bank_06');
  document.getElementById('bank-07').innerHTML = i18next.t('bank.bank_07');
  document.getElementById('bank-08').innerHTML = i18next.t('bank.bank_08');
  document.getElementById('bank-09').innerHTML = i18next.t('bank.bank_09');
  document.getElementById('bank-10').innerHTML = i18next.t('bank.bank_10');
  document.getElementById('bank-11').innerHTML = i18next.t('bank.bank_11');
  document.getElementById('bank-12').innerHTML = i18next.t('bank.bank_12');
  document.getElementById('bank-13').innerHTML = i18next.t('bank.bank_13');
  document.getElementById('bank-14').innerHTML = i18next.t('bank.bank_14');
  document.getElementById('bank-15').innerHTML = i18next.t('bank.bank_15');
  document.getElementById('bank-16').innerHTML = i18next.t('bank.bank_16');
  document.getElementById('bank-17').innerHTML = i18next.t('bank.bank_17');
  document.getElementById('bank-18').innerHTML = i18next.t('bank.bank_18');
  document.getElementById('bank-19').innerHTML = i18next.t('bank.bank_19');
  document.getElementById('bank-20').innerHTML = i18next.t('bank.bank_20');
  document.getElementById('bank-21').innerHTML = i18next.t('bank.bank_21');

  //deposit
  document.getElementById('deposit-title').innerHTML = i18next.t('deposit.title');
  document.getElementById('deposit-sub').innerHTML = i18next.t('deposit.sub');
  document.getElementById('deposit-content-1').innerHTML = i18next.t('deposit.content_1');
  document.getElementById('deposit-content-2').innerHTML = i18next.t('deposit.content_2');
  document.getElementById('deposit-content-3').innerHTML = i18next.t('deposit.content_3');
  document.getElementById('deposit-content-4').innerHTML = i18next.t('deposit.content_4');
  document.getElementById('deposit-content-5').innerHTML = i18next.t('deposit.content_5');
  document.getElementById('deposit-banktime').innerHTML = i18next.t('deposit.banktime');
  document.getElementById('deposit-cur-money').innerHTML = i18next.t('deposit.cur_money');
  document.getElementsByName('deposit-won').forEach((e) => {
    e.innerHTML = i18next.t('deposit.won');
  });
  document.getElementById('deposit-account').innerHTML = i18next.t('deposit.account');
  document.getElementById('deposit-req-bank').innerHTML = i18next.t('deposit.req_account');
  document.getElementById('deposit-req-text').value = i18next.t('deposit.req_text');
  document.getElementById('deposit-req-text').innerHTML = i18next.t('deposit.app_money');
  document.getElementsByName('deposit-man').forEach((e) => {
    e.innerHTML = i18next.t('deposit.man');
  });
  document.getElementById('deposit-modify').innerHTML = i18next.t('deposit.modify');

  document.getElementById('deposit-bonus-text').innerHTML = i18next.t('deposit.bonus_text');
  document.getElementById('deposit-after-text').innerHTML = i18next.t('deposit.after_text');
  document.getElementById('deposit-history').innerHTML = i18next.t('deposit.history');
  document.getElementById('deposit-submit').innerHTML = i18next.t('deposit.submit');

  //withdraw
  document.getElementById('withdraw-title').innerHTML = i18next.t('withdraw.title');
  document.getElementById('withdraw-sub').innerHTML = i18next.t('withdraw.sub');
  document.getElementById('withdraw-content-1').innerHTML = i18next.t('withdraw.content_1');
  document.getElementById('withdraw-content-2').innerHTML = i18next.t('withdraw.content_2');
  document.getElementById('withdraw-content-3').innerHTML = i18next.t('withdraw.content_3');
  document.getElementById('withdraw-content-4').innerHTML = i18next.t('withdraw.content_4');
  document.getElementById('withdraw-content-5').innerHTML = i18next.t('withdraw.content_5');
  document.getElementById('withdraw-banktime').innerHTML = i18next.t('withdraw.banktime');
  document.getElementById('withdraw-cur-money').innerHTML = i18next.t('withdraw.cur_money');
  document.getElementsByName('withdraw-won').forEach((e) => {
    e.innerHTML = i18next.t('withdraw.won');
  });
  document.getElementById('withdraw-holder').innerHTML = i18next.t('withdraw.holder');
  document.getElementById('withdraw-bank').innerHTML = i18next.t('withdraw.bank');
  document.getElementById('withdraw-account').innerHTML = i18next.t('withdraw.account');
  document.getElementById('withdraw-app-money').innerHTML = i18next.t('withdraw.app_money');
  document.getElementsByName('withdraw-man').forEach((e) => {
    e.innerHTML = i18next.t('withdraw.man');
  });
  document.getElementById('withdraw-modify').innerHTML = i18next.t('withdraw.modify');
  document.getElementById('withdraw-after-text').innerHTML = i18next.t('withdraw.after_text');
  document.getElementById('withdraw-history').innerHTML = i18next.t('withdraw.history');
  document.getElementById('withdraw-submit').innerHTML = i18next.t('withdraw.submit');

  //offcanvas
  document.querySelector('.offcanvas-body .login').innerHTML = i18next.t('nav.login');
  document.querySelector('.offcanvas-body .logout').innerHTML = i18next.t('nav.logout');
  document.querySelector('.offcanvas-body .notice').innerHTML = i18next.t('nav.notice');
  document.querySelector('.offcanvas-body .deposit').innerHTML = i18next.t('nav.deposit');
  document.querySelector('.offcanvas-body .withdraw').innerHTML = i18next.t('nav.withdraw');
  document.querySelector('.offcanvas-body .reward').innerHTML = i18next.t('nav.reward');
  document.querySelector('.offcanvas-body .question').innerHTML = i18next.t('nav.question');
  document.getElementById('mobileUserInfo').innerHTML = i18next.t('nav.userinfo');
  document.getElementById('mobileMessage').innerHTML = i18next.t('nav.message');
  document.getElementById('mobileLotteryList').innerHTML = i18next.t('nav.lotto');
  document.getElementById('mobileAttendance').innerHTML = i18next.t('nav.attendance');

  //landing
  if (document.getElementById('landing-login-btn') && document.getElementById('landing-join-btn')) {
    document.getElementById('landing-login-btn').innerHTML = i18next.t('landing.login');
    document.getElementById('landing-join-btn').innerHTML = i18next.t('landing.join');
  }
}

i18next.on('languageChanged', () => {
  updateContent();
});
