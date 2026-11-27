import type creemCopy from "./creem-preview.json";

type DeliveryCopy = { bindHelp: string; paymentPending: string };

export const accountDeliveryCopy = {
  en: {
    bindHelp: "Open AnyTranslator and go to Account, then tap Sign in. In your browser, sign in with the email you subscribed with using the 6-digit code we send you, then approve the matching code.",
    paymentPending: "We’re still waiting for payment confirmation. If you completed checkout, refresh your access below.",
  },
  ko: {
    bindHelp: "AnyTranslator에서 계정 화면을 열고 로그인을 탭하세요. 브라우저에서 구독할 때 사용한 이메일 주소와 해당 주소로 보내 드리는 6자리 인증 코드로 로그인하세요. 그런 다음 코드가 일치하면 연결을 승인하세요.",
    paymentPending: "결제 확인을 기다리는 중입니다. 결제를 마쳤다면 아래에서 이용 권한을 새로고침하세요.",
  },
  ja: {
    bindHelp: "AnyTranslator のアカウント画面を開き、ログインをタップします。ブラウザーでは、申し込み時のメールアドレスと、そのアドレスに届く6桁の認証コードでログインします。その後、コードが一致したら連携を承認してください。",
    paymentPending: "決済の確認を待っています。お支払い済みの場合は、下のボタンで利用状況を更新してください。",
  },
  fr: {
    bindHelp: "Dans AnyTranslator, ouvrez la rubrique Compte et touchez Se connecter. Dans votre navigateur, connectez-vous avec l’adresse e-mail utilisée pour vous abonner et le code de vérification à 6 chiffres que nous vous envoyons à cette adresse. Approuvez ensuite la connexion si les codes correspondent.",
    paymentPending: "Nous attendons la confirmation du paiement. Si vous avez terminé le paiement, actualisez votre accès ci-dessous.",
  },
  de: {
    bindHelp: "Öffne in AnyTranslator den Bereich Konto und tippe auf Anmelden. Melde dich im Browser mit der E-Mail-Adresse deines Abos und dem 6-stelligen Bestätigungscode an, den wir dir dorthin senden. Bestätige anschließend die Verbindung, wenn die Codes übereinstimmen.",
    paymentPending: "Wir warten auf die Zahlungsbestätigung. Wenn du die Zahlung abgeschlossen hast, aktualisiere deinen Zugriff unten.",
  },
  es: {
    bindHelp: "Abre la sección Cuenta de AnyTranslator y toca Iniciar sesión. En el navegador, inicia sesión con el correo electrónico que usaste para suscribirte y el código de verificación de 6 dígitos que te enviamos a esa dirección. Después, aprueba la conexión si los códigos coinciden.",
    paymentPending: "Estamos esperando la confirmación del pago. Si ya has pagado, actualiza tu acceso con el botón de abajo.",
  },
  it: {
    bindHelp: "In AnyTranslator, apri Account e tocca Accedi. Nel browser, accedi con l’indirizzo e-mail che hai usato per abbonarti e il codice di verifica a 6 cifre che ti inviamo a quell’indirizzo. Poi conferma il collegamento se i codici corrispondono.",
    paymentPending: "Il pagamento è in attesa di conferma. Se hai completato il pagamento, aggiorna il tuo accesso qui sotto.",
  },
  "pt-br": {
    bindHelp: "No AnyTranslator, abra Conta e toque em Entrar. No navegador, entre com o e-mail que você usou para assinar e com o código de verificação de 6 dígitos que enviamos para esse endereço. Depois, aprove a conexão se os códigos coincidirem.",
    paymentPending: "Estamos aguardando a confirmação do pagamento. Se você já pagou, atualize seu acesso abaixo.",
  },
  fi: {
    bindHelp: "Avaa AnyTranslatorissa Tili ja napauta Kirjaudu sisään. Kirjaudu selaimessa sisään tilauksen yhteydessä käyttämälläsi sähköpostiosoitteella ja siihen lähettämällämme 6-numeroisella vahvistuskoodilla. Hyväksy sitten yhdistäminen, kun koodit täsmäävät.",
    paymentPending: "Odotamme maksun vahvistusta. Jos olet jo maksanut, päivitä käyttöoikeutesi alla olevalla painikkeella.",
  },
  da: {
    bindHelp: "Åbn Konto i AnyTranslator, og tryk på Log ind. Log ind i browseren med den e-mailadresse, du brugte til at tegne abonnementet, og den 6-cifrede bekræftelseskode, vi sender til den adresse. Godkend derefter forbindelsen, når koderne matcher.",
    paymentPending: "Vi afventer bekræftelse af betalingen. Hvis du har gennemført købet, kan du opdatere din adgang nedenfor.",
  },
  nl: {
    bindHelp: "Open Account in AnyTranslator en tik op Inloggen. Log in de browser in met het e-mailadres waarmee je je hebt geabonneerd en de 6-cijferige verificatiecode die we naar dat adres sturen. Bevestig daarna de koppeling als de codes overeenkomen.",
    paymentPending: "We wachten op de bevestiging van je betaling. Heb je al afgerekend? Vernieuw dan hieronder je toegang.",
  },
  no: {
    bindHelp: "Åpne Konto i AnyTranslator, og trykk på Logg inn. Logg inn i nettleseren med e-postadressen du brukte da du tegnet abonnementet, og den 6-sifrede bekreftelseskoden vi sender til den adressen. Godkjenn deretter tilkoblingen når kodene stemmer overens.",
    paymentPending: "Vi venter på betalingsbekreftelsen. Hvis du har fullført betalingen, kan du oppdatere tilgangen din nedenfor.",
  },
  sv: {
    bindHelp: "Öppna Konto i AnyTranslator och tryck på Logga in. Logga in i webbläsaren med e-postadressen du använde när du tecknade prenumerationen och den 6-siffriga verifieringskod vi skickar till den adressen. Godkänn sedan anslutningen om koderna stämmer överens.",
    paymentPending: "Vi väntar på betalningsbekräftelsen. Om du redan har betalat kan du uppdatera din åtkomst nedan.",
  },
  "zh-cn": {
    bindHelp: "打开 AnyTranslator 的「账户」并点按「登录」。在浏览器中使用订阅时的邮箱和我们发送到该邮箱的 6 位验证码登录，确认代码一致后批准连接。",
    paymentPending: "正在等待付款确认。如果你已完成付款，请在下方刷新使用权限。",
  },
  "zh-tw": {
    bindHelp: "開啟 AnyTranslator 的「帳號」並點選「登入」。在瀏覽器使用訂閱時的 email 和我們寄到該信箱的 6 位數驗證碼登入，確認代碼相符後核准連結。",
    paymentPending: "正在等待付款確認。如果你已完成付款，請在下方重新整理使用權限。",
  },
  id: {
    bindHelp: "Buka Akun di AnyTranslator, lalu ketuk Masuk. Di browser, masuk dengan email yang Anda gunakan saat berlangganan dan kode verifikasi 6 digit yang kami kirim ke alamat tersebut. Setelah itu, setujui koneksi jika kodenya cocok.",
    paymentPending: "Kami sedang menunggu konfirmasi pembayaran. Jika pembayaran sudah selesai, perbarui akses Anda di bawah ini.",
  },
  vi: {
    bindHelp: "Trong AnyTranslator, mở mục Tài khoản và chạm vào Đăng nhập. Trên trình duyệt, đăng nhập bằng email bạn đã dùng để đăng ký gói và mã xác minh 6 chữ số chúng tôi gửi đến địa chỉ đó. Sau đó, chấp thuận liên kết nếu mã trùng khớp.",
    paymentPending: "Đang chờ xác nhận thanh toán. Nếu bạn đã thanh toán, hãy làm mới quyền truy cập bên dưới.",
  },
  th: {
    bindHelp: "เปิดหน้าบัญชีใน AnyTranslator แล้วแตะเข้าสู่ระบบ ในเบราว์เซอร์ ให้เข้าสู่ระบบด้วยอีเมลที่ใช้สมัครสมาชิกและรหัสยืนยัน 6 หลักที่เราส่งไปยังอีเมลนั้น จากนั้นอนุมัติการเชื่อมต่อเมื่อรหัสตรงกัน",
    paymentPending: "กำลังรอการยืนยันการชำระเงิน หากชำระเงินแล้ว ให้รีเฟรชสิทธิ์การใช้งานด้านล่าง",
  },
  ru: {
    bindHelp: "Откройте раздел «Аккаунт» в AnyTranslator и нажмите «Войти». Для входа в браузере используйте адрес электронной почты, указанный при оформлении подписки, и 6-значный код подтверждения, который мы отправим на этот адрес. Затем подтвердите подключение, если коды совпадают.",
    paymentPending: "Ожидаем подтверждения оплаты. Если вы уже оплатили подписку, обновите доступ кнопкой ниже.",
  },
} satisfies Record<keyof typeof creemCopy, DeliveryCopy>;
