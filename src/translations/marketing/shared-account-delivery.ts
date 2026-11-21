import type creemCopy from "./creem-preview.json";

type DeliveryCopy = { bindHelp: string; paymentPending: string };

export const accountDeliveryCopy = {
  en: {
    bindHelp: "Open AnyTranslator and go to Account, then tap Sign in. In your browser, use the passkey you subscribed with and approve the matching code.",
    paymentPending: "We’re still waiting for payment confirmation. If you completed checkout, refresh your access below.",
  },
  ko: {
    bindHelp: "AnyTranslator에서 계정 화면을 열고 로그인을 탭하세요. 브라우저에서 구독에 사용한 패스키로 로그인하고 코드가 일치하면 연결을 승인하세요.",
    paymentPending: "결제 확인을 기다리는 중입니다. 결제를 마쳤다면 아래에서 이용 권한을 새로고침하세요.",
  },
  ja: {
    bindHelp: "AnyTranslator のアカウント画面を開き、ログインをタップします。ブラウザーで申し込み時のパスキーを使い、コードが一致したら連携を承認してください。",
    paymentPending: "決済の確認を待っています。お支払い済みの場合は、下のボタンで利用状況を更新してください。",
  },
  fr: {
    bindHelp: "Dans AnyTranslator, ouvrez la rubrique Compte et touchez Se connecter. Dans votre navigateur, utilisez la clé d’accès de votre abonnement et confirmez le code correspondant.",
    paymentPending: "Nous attendons la confirmation du paiement. Si vous avez terminé le paiement, actualisez votre accès ci-dessous.",
  },
  de: {
    bindHelp: "Öffne in AnyTranslator den Bereich Konto und tippe auf Anmelden. Melde dich im Browser mit dem Passkey deines Abos an und bestätige den passenden Code.",
    paymentPending: "Wir warten auf die Zahlungsbestätigung. Wenn du die Zahlung abgeschlossen hast, aktualisiere deinen Zugriff unten.",
  },
  es: {
    bindHelp: "Abre la sección Cuenta de AnyTranslator y toca Iniciar sesión. En el navegador, usa la llave de acceso de tu suscripción y confirma que el código coincide.",
    paymentPending: "Estamos esperando la confirmación del pago. Si ya has pagado, actualiza tu acceso con el botón de abajo.",
  },
  it: {
    bindHelp: "In AnyTranslator, apri Account e tocca Accedi. Nel browser, usa la passkey del tuo abbonamento e conferma che il codice corrisponda.",
    paymentPending: "Il pagamento è in attesa di conferma. Se hai completato il pagamento, aggiorna il tuo accesso qui sotto.",
  },
  "pt-br": {
    bindHelp: "No AnyTranslator, abra Conta e toque em Entrar. No navegador, use a chave de acesso da sua assinatura e confirme se o código é o mesmo.",
    paymentPending: "Estamos aguardando a confirmação do pagamento. Se você já pagou, atualize seu acesso abaixo.",
  },
  fi: {
    bindHelp: "Avaa AnyTranslatorissa Tili ja napauta Kirjaudu sisään. Käytä selaimessa tilauksesi pääsyavainta ja vahvista yhteys, kun koodit täsmäävät.",
    paymentPending: "Odotamme maksun vahvistusta. Jos olet jo maksanut, päivitä käyttöoikeutesi alla olevalla painikkeella.",
  },
  da: {
    bindHelp: "Åbn Konto i AnyTranslator, og tryk på Log ind. Brug den samme adgangsnøgle som til dit abonnement i browseren, og godkend, når koden matcher.",
    paymentPending: "Vi afventer bekræftelse af betalingen. Hvis du har gennemført købet, kan du opdatere din adgang nedenfor.",
  },
  nl: {
    bindHelp: "Open Account in AnyTranslator en tik op Inloggen. Gebruik in je browser de passkey van je abonnement en bevestig de koppeling als de code klopt.",
    paymentPending: "We wachten op de bevestiging van je betaling. Heb je al afgerekend? Vernieuw dan hieronder je toegang.",
  },
  no: {
    bindHelp: "Åpne Konto i AnyTranslator, og trykk på Logg inn. Bruk samme tilgangsnøkkel som til abonnementet i nettleseren, og godkjenn når kodene stemmer.",
    paymentPending: "Vi venter på betalingsbekreftelsen. Hvis du har fullført betalingen, kan du oppdatere tilgangen din nedenfor.",
  },
  sv: {
    bindHelp: "Öppna Konto i AnyTranslator och tryck på Logga in. Använd prenumerationens nyckel i webbläsaren och godkänn när koderna stämmer överens.",
    paymentPending: "Vi väntar på betalningsbekräftelsen. Om du redan har betalat kan du uppdatera din åtkomst nedan.",
  },
  "zh-cn": {
    bindHelp: "打开 AnyTranslator 的「账户」并点按「登录」。在浏览器中使用订阅时的通行密钥登录，核对代码后批准连接。",
    paymentPending: "正在等待付款确认。如果你已完成付款，请在下方刷新使用权限。",
  },
  "zh-tw": {
    bindHelp: "開啟 AnyTranslator 的「帳號」並點選「登入」。在瀏覽器使用訂閱時的通行密鑰登入，核對代碼後核准連結。",
    paymentPending: "正在等待付款確認。如果你已完成付款，請在下方重新整理使用權限。",
  },
  id: {
    bindHelp: "Buka Akun di AnyTranslator, lalu ketuk Masuk. Di browser, gunakan passkey yang dipakai saat berlangganan dan setujui penautan jika kodenya cocok.",
    paymentPending: "Kami sedang menunggu konfirmasi pembayaran. Jika pembayaran sudah selesai, perbarui akses Anda di bawah ini.",
  },
  vi: {
    bindHelp: "Trong AnyTranslator, mở mục Tài khoản và chạm vào Đăng nhập. Trên trình duyệt, dùng khóa truy cập bạn đã dùng để đăng ký và chấp nhận liên kết khi mã trùng khớp.",
    paymentPending: "Đang chờ xác nhận thanh toán. Nếu bạn đã thanh toán, hãy làm mới quyền truy cập bên dưới.",
  },
  th: {
    bindHelp: "เปิดหน้าบัญชีใน AnyTranslator แล้วแตะเข้าสู่ระบบ ใช้พาสคีย์ที่ใช้สมัครสมาชิกในเบราว์เซอร์ และอนุมัติการเชื่อมต่อเมื่อรหัสตรงกัน",
    paymentPending: "กำลังรอการยืนยันการชำระเงิน หากชำระเงินแล้ว ให้รีเฟรชสิทธิ์การใช้งานด้านล่าง",
  },
  ru: {
    bindHelp: "Откройте раздел «Аккаунт» в AnyTranslator и нажмите «Войти». В браузере используйте ключ доступа, с которым вы оформили подписку, и подтвердите совпадающий код.",
    paymentPending: "Ожидаем подтверждения оплаты. Если вы уже оплатили подписку, обновите доступ кнопкой ниже.",
  },
} satisfies Record<keyof typeof creemCopy, DeliveryCopy>;
