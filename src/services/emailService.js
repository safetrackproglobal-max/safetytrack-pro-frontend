export const sendEmail = async (to, template, data, language = 'en') => {
  const localizedTemplate = getEmailTemplate(template, language);
  const localizedSubject = getLocalizedSubject(template, language);
  
  const content = generateEmailContent(localizedTemplate, data, language);
  
  // Send email with localized content
  return await sendMail(to, localizedSubject, content);
};

const getEmailTemplate = (template, language) => {
  // Return email template in the specified language
  const templates = {
    welcome: {
      en: `
        <h2>Welcome to SafetyTrack Pro!</h2>
        <p>Dear {{name}},</p>
        <p>Thank you for joining SafetyTrack Pro. We're excited to help you manage safety and compliance.</p>
        <p>Get started by uploading your first document for analysis.</p>
        <br>
        <p>Best regards,<br>SafetyTrack Pro Team</p>
      `,
      es: `
        <h2>¡Bienvenido a SafetyTrack Pro!</h2>
        <p>Estimado/a {{name}},</p>
        <p>Gracias por unirse a SafetyTrack Pro. Estamos emocionados de ayudarle a gestionar la seguridad y el cumplimiento.</p>
        <p>Comience subiendo su primer documento para su análisis.</p>
        <br>
        <p>Atentamente,<br>Equipo de SafetyTrack Pro</p>
      `,
      fr: `
        <h2>Bienvenue sur SafetyTrack Pro !</h2>
        <p>Cher/chère {{name}},</p>
        <p>Merci d'avoir rejoint SafetyTrack Pro. Nous sommes ravis de vous aider à gérer la sécurité et la conformité.</p>
        <p>Commencez par télécharger votre premier document pour analyse.</p>
        <br>
        <p>Cordialement,<br>L'équipe SafetyTrack Pro</p>
      `,
      ar: `
        <h2>مرحباً بك في SafetyTrack Pro!</h2>
        <p>عزيزي/عزيزتي {{name}},</p>
        <p>شكراً لانضمامك إلى SafetyTrack Pro. نحن متحمسون لمساعدتك في إدارة السلامة والامتثال.</p>
        <p>ابدأ برفع أول وثيقة لك للتحليل.</p>
        <br>
        <p>مع أطيب التحيات,<br>فريق SafetyTrack Pro</p>
      `,
      zh: `
        <h2>欢迎使用 SafetyTrack Pro！</h2>
        <p>尊敬的 {{name}},</p>
        <p>感谢您加入 SafetyTrack Pro。我们很高兴能帮助您管理安全与合规。</p>
        <p>开始上传您的第一个文档进行分析。</p>
        <br>
        <p>此致敬礼,<br>SafetyTrack Pro 团队</p>
      `,
      hi: `
        <h2>SafetyTrack Pro में आपका स्वागत है!</h2>
        <p>प्रिय {{name}},</p>
        <p>SafetyTrack Pro में शामिल होने के लिए धन्यवाद। हम आपकी सुरक्षा और अनुपालन प्रबंधन में मदद करने के लिए उत्साहित हैं。</p>
        <p>विश्लेषण के लिए अपना पहला दस्तावेज़ अपलोड करके शुरुआत करें।</p>
        <br>
        <p>सादर,<br>SafetyTrack Pro टीम</p>
      `,
      pt: `
        <h2>Bem-vindo ao SafetyTrack Pro!</h2>
        <p>Caro/a {{name}},</p>
        <p>Obrigado por se juntar ao SafetyTrack Pro. Estamos animados em ajudá-lo a gerenciar segurança e conformidade.</p>
        <p>Comece enviando seu primeiro documento para análise.</p>
        <br>
        <p>Atenciosamente,<br>Equipe SafetyTrack Pro</p>
      `,
      ru: `
        <h2>Добро пожаловать в SafetyTrack Pro!</h2>
        <p>Уважаемый/Уважаемая {{name}},</p>
        <p>Спасибо за присоединение к SafetyTrack Pro. Мы рады помочь вам управлять безопасностью и соответствием требованиям.</p>
        <p>Начните с загрузки вашего первого документа для анализа.</p>
        <br>
        <p>С уважением,<br>Команда SafetyTrack Pro</p>
      `,
      ja: `
        <h2>SafetyTrack Proへようこそ！</h2>
        <p>{{name}}様</p>
        <p>SafetyTrack Proにご参加いただきありがとうございます。安全性とコンプライアンスの管理をお手伝いできることを嬉しく思います。</p>
        <p>最初の文書をアップロードして分析を開始してください。</p>
        <br>
        <p>敬具,<br>SafetyTrack Proチーム</p>
      `,
      de: `
        <h2>Willkommen bei SafetyTrack Pro!</h2>
        <p>Sehr geehrte/r {{name}},</p>
        <p>Vielen Dank, dass您 SafetyTrack Pro beigetreten sind. Wir freuen uns, Sie bei der Verwaltung von Sicherheit und Compliance zu unterstützen.</p>
        <p>Beginnen Sie mit dem Hochladen Ihres ersten Dokuments zur Analyse.</p>
        <br>
        <p>Mit freundlichen Grüßen,<br>SafetyTrack Pro Team</p>
      `
    },
    verification: {
      en: `
        <h2>Verify Your Email</h2>
        <p>Dear {{name}},</p>
        <p>Your verification code is:</p>
        <h3>{{code}}</h3>
        <p>Enter this code in the app to verify your email address.</p>
        <p>This code will expire in 10 minutes.</p>
        <br>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>SafetyTrack Pro Team</p>
      `,
      es: `
        <h2>Verifique su correo electrónico</h2>
        <p>Estimado/a {{name}},</p>
        <p>Su código de verificación es:</p>
        <h3>{{code}}</h3>
        <p>Ingrese este código in la aplicación para verificar su dirección de correo electrónico.</p>
        <p>Este código expirará en 10 minutos.</p>
        <br>
        <p>Si no creó una cuenta, ignore este correo electrónico.</p>
        <p>Atentamente,<br>Equipo de SafetyTrack Pro</p>
      `,
      fr: `
        <h2>Vérifiez votre adresse e-mail</h2>
        <p>Cher/chère {{name}},</p>
        <p>Votre code de vérification est :</p>
        <h3>{{code}}</h3>
        <p>Entrez ce code dans l'application pour vérifier votre adresse e-mail.</p>
        <p>Ce code expirera dans 10 minutes.</p>
        <br>
        <p>Si vous n'avez pas créé de compte, veuillez ignorer cet e-mail.</p>
        <p>Cordialement,<br>L'équipe SafetyTrack Pro</p>
      `,
      ar: `
        <h2>تحقق من بريدك الإلكتروني</h2>
        <p>عزيزي/عزيزتي {{name}},</p>
        <p>رمز التحقق الخاص بك هو:</p>
        <h3>{{code}}</h3>
        <p>أدخل هذا الرمز في التطبيق للتحقق من عنوان بريدك الإلكتروني.</p>
        <p>سينتهي صلاحية هذا الرمز خلال 10 دقائق.</p>
        <br>
        <p>إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد الإلكتروني.</p>
        <p>مع أطيب التحيات,<br>فريق SafetyTrack Pro</p>
      `,
      zh: `
        <h2>验证您的电子邮件</h2>
        <p>尊敬的 {{name}},</p>
        <p>您的验证码是：</p>
        <h3>{{code}}</h3>
        <p>在应用程序中输入此代码以验证您的电子邮件地址。</p>
        <p>此代码将在10分钟后过期。</p>
        <br>
        <p>如果您没有创建帐户，请忽略此电子邮件。</p>
        <p>此致敬礼,<br>SafetyTrack Pro 团队</p>
      `,
      hi: `
        <h2>अपना ईमेल सत्यापित करें</h2>
        <p>प्रिय {{name}},</p>
        <p>आपका सत्यापन कोड है:</p>
        <h3>{{code}}</h3>
        <p>अपने ईमेल पते को सत्यापित करने के लिए ऐप में यह कोड दर्ज करें।</p>
        <p>यह कोड 10 मिनट में समाप्त हो जाएगा।</p>
        <br>
        <p>यदि आपने कोई खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।</p>
        <p>सादर,<br>SafetyTrack Pro टीम</p>
      `,
      pt: `
        <h2>Verifique seu e-mail</h2>
        <p>Caro/a {{name}},</p>
        <p>Seu código de verificação é:</p>
        <h3>{{code}}</h3>
        <p>Digite este código no aplicativo para verificar seu endereço de e-mail.</p>
        <p>Este código expirará em 10 minutos.</p>
        <br>
        <p>Se você não criou uma cuenta, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe SafetyTrack Pro</p>
      `,
      ru: `
        <h2>Подтвердите ваш адрес электронной почты</h2>
        <p>Уважаемый/Уважаемая {{name}},</p>
        <p>Ваш код подтверждения:</p>
        <h3>{{code}}</h3>
        <p>Введите этот код в приложении, чтобы подтвердить ваш адрес электронной почты.</p>
        <p>Этот код истечет через 10 минут.</p>
        <br>
        <p>Если вы не создавали учетную запись, проигнорируйте это письмо.</p>
        <p>С уважением,<br>Команда SafetyTrack Pro</p>
      `,
      ja: `
        <h2>メールアドレスを確認してください</h2>
        <p>{{name}}様</p>
        <p>確認コードは次のとおりです：</p>
        <h3>{{code}}</h3>
        <p>このコードをアプリに入力して、メールアドレスを確認してください。</p>
        <p>このコードは10分で期限切れになります。</p>
        <br>
        <p>アカウントを作成していない場合は、このメールを無視してください。</p>
        <p>敬具,<br>SafetyTrack Proチーム</p>
      `,
      de: `
        <h2>Bestätigen Sie Ihre E-Mail-Adresse</h2>
        <p>Sehr geehrte/r {{name}},</p>
        <p>Ihr Bestätigungscode lautet:</p>
        <h3>{{code}}</h3>
        <p>Geben Sie diesen Code in der App ein, um Ihre E-Mail-Adresse zu bestätigen.</p>
        <p>Dieser Code läuft in 10 Minuten ab.</p>
        <br>
        <p>Wenn Sie kein Konto erstellt haben, ignorieren Sie diese E-Mail.</p>
        <p>Mit freundlichen Grüßen,<br>SafetyTrack Pro Team</p>
      `
    },
    password_reset: {
      en: `
        <h2>Password Reset Request</h2>
        <p>Dear {{name}},</p>
        <p>You requested to reset your password for SafetyTrack Pro.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{{reset_link}}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <br>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>SafetyTrack Pro Team</p>
      `,
      es: `
        <h2>Solicitud de restablecimiento de contraseña</h2>
        <p>Estimado/a {{name}},</p>
        <p>Solicitó restablecer su contraseña para SafetyTrack Pro.</p>
        <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
        <p><a href="{{reset_link}}">Restablecer contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <br>
        <p>Si no solicitó esto, ignore este correo electrónico.</p>
        <p>Atentamente,<br>Equipo de SafetyTrack Pro</p>
      `,
      fr: `
        <h2>Demande de réinitialisation de mot de passe</h2>
        <p>Cher/chère {{name}},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe pour SafetyTrack Pro.</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
        <p><a href="{{reset_link}}">Réinitialiser le mot de passe</a></p>
        <p>Ce lien expirera dans 1 heure.</p>
        <br>
        <p>Si vous n'avez pas fait cette demande, veuillez ignorer cet e-mail.</p>
        <p>Cordialement,<br>L'équipe SafetyTrack Pro</p>
      `,
      ar: `
        <h2>طلب إعادة تعيين كلمة المرور</h2>
        <p>عزيزي/عزيزتي {{name}},</p>
        <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك لـ SafetyTrack Pro.</p>
        <p>انقر على الرابط أدناه لإعادة تعيين كلمة المرور الخاصة بك:</p>
        <p><a href="{{reset_link}}">إعادة تعيين كلمة المرور</a></p>
        <p>سينتهي صلاحية هذا الرابط خلال ساعة واحدة.</p>
        <br>
        <p>إذا لم تطلب هذا, يرجى تجاهل هذا البريد الإلكتروني.</p>
        <p>مع أطيب التحيات,<br>فريق SafetyTrack Pro</p>
      `,
      zh: `
        <h2>密码重置请求</h2>
        <p>尊敬的 {{name}},</p>
        <p>您请求重置 SafetyTrack Pro 的密码。</p>
        <p>点击下面的链接重置您的密码：</p>
        <p><a href="{{reset_link}}">重置密码</a></p>
        <p>此链接将在1小时后过期。</p>
        <br>
        <p>如果您没有请求此操作，请忽略此电子邮件。</p>
        <p>此致敬礼,<br>SafetyTrack Pro 团队</p>
      `,
      hi: `
        <h2>पासवर्ड रीसेट अनुरोध</h2>
        <p>प्रिय {{name}},</p>
        <p>आपने SafetyTrack Pro के लिए अपना पासवर्ड रीसेट करने का अनुरोध किया है।</p>
        <p>अपना पासवर्ड रीसेट करने के लिए नीचे दिए गए लिंक पर क्लिक करें:</p>
        <p><a href="{{reset_link}}">पासवर्ड रीसेट करें</a></p>
        <p>यह लिंक 1 घंटे में समाप्त हो जाएगा।</p>
        <br>
        <p>यदि आपने यह अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें।</p>
        <p>सादर,<br>SafetyTrack Pro टीम</p>
      `,
      pt: `
        <h2>Solicitação de redefinição de senha</h2>
        <p>Caro/a {{name}},</p>
        <p>Você solicitou a redefinição de sua senha para o SafetyTrack Pro.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="{{reset_link}}">Redefinir senha</a></p>
        <p>Este link expirará em 1 hora.</p>
        <br>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe SafetyTrack Pro</p>
      `,
      ru: `
        <h2>Запрос на сброс пароля</h2>
        <p>Уважаемый/Уважаемая {{name}},</p>
        <p>Вы запросили сброс пароля для SafetyTrack Pro.</p>
        <p>Нажмите на ссылку ниже, чтобы сбросить пароль:</p>
        <p><a href="{{reset_link}}">Сбросить пароль</a></p>
        <p>Эта ссылка истечет через 1 час.</p>
        <br>
        <p>Если вы не делали этот запрос, проигнорируйте это письмо.</p>
        <p>С уважением,<br>Команда SafetyTrack Pro</p>
      `,
      ja: `
        <h2>パスワードリセットのリクエスト</h2>
        <p>{{name}}様</p>
        <p>SafetyTrack Proのパスワードリセットをリクエストされました。</p>
        <p>以下のリンクをクリックしてパスワードをリセットしてください：</p>
        <p><a href="{{reset_link}}">パスワードをリセット</a></p>
        <p>このリンクは1時間で期限切れになります。</p>
        <br>
        <p>リクエストされていない場合は、このメールを無視してください。</p>
        <p>敬具,<br>SafetyTrack Proチーム</p>
      `,
      de: `
        <h2>Anforderung zur Passwortzurücksetzung</h2>
        <p>Sehr geehrte/r {{name}},</p>
        <p>Sie haben die Zurücksetzung Ihres Passworts für SafetyTrack Pro angefordert.</p>
        <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
        <p><a href="{{reset_link}}">Passwort zurücksetzen</a></p>
        <p>Dieser Link läuft in 1 Stunde ab.</p>
        <br>
        <p>Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.</p>
        <p>Mit freundlichen Grüßen,<br>SafetyTrack Pro Team</p>
      `
    },
    document_analysis: {
      en: `
        <h2>Document Analysis Complete</h2>
        <p>Dear {{name}},</p>
        <p>Your document "{{document_name}}" has been analyzed.</p>
        <p><strong>Risk Score:</strong> {{risk_score}}/100</p>
        <p><strong>Compliance Score:</strong> {{compliance_score}}/100</p>
        <p>View the full report in your SafetyTrack Pro dashboard.</p>
        <br>
        <p>Best regards,<br>SafetyTrack Pro Team</p>
      `,
      es: `
        <h2>Análisis de documento completado</h2>
        <p>Estimado/a {{name}},</p>
        <p>Su documento "{{document_name}}" ha sido analizado.</p>
        <p><strong>Puntuación de riesgo:</strong> {{risk_score}}/100</p>
        <p><strong>Puntuación de cumplimiento:</strong> {{compliance_score}}/100</p>
        <p>Vea el informe completo en su panel de SafetyTrack Pro.</p>
        <br>
        <p>Atentamente,<br>Equipo de SafetyTrack Pro</p>
      `,
      fr: `
        <h2>Analyse de document terminée</h2>
        <p>Cher/chère {{name}},</p>
        <p>Votre document "{{document_name}}" a été analysé.</p>
        <p><strong>Score de risque:</strong> {{risk_score}}/100</p>
        <p><strong>Score de conformité:</strong> {{compliance_score}}/100</p>
        <p>Consultez le rapport completo dans votre tableau de bord SafetyTrack Pro.</p>
        <br>
        <p>Cordialement,<br>L'équipe SafetyTrack Pro</p>
      `,
      ar: `
        <h2>اكتمل تحليل المستند</h2>
        <p>عزيزي/عزيزتي {{name}},</p>
        <p>تم تحليل المستند "{{document_name}}" الخاص بك.</p>
        <p><strong>نتيجة المخاطر:</strong> {{risk_score}}/100</p>
        <p><strong>نتيجة الامتثال:</strong> {{compliance_score}}/100</p>
        <p>عرض التقرير الكامل في لوحة تحكم SafetyTrack Pro الخاصة بك.</p>
        <br>
        <p>مع أطيب التحيات,<br>فريق SafetyTrack Pro</p>
      `,
      zh: `
        <h2>文档分析完成</h2>
        <p>尊敬的 {{name}},</p>
        <p>您的文档"{{document_name}}"已分析完成。</p>
        <p><strong>风险评分:</strong> {{risk_score}}/100</p>
        <p><strong>合规评分:</strong> {{compliance_score}}/100</p>
        <p>请在您的 SafetyTrack Pro 仪表板中查看完整报告。</p>
        <br>
        <p>此致敬礼,<br>SafetyTrack Pro 团队</p>
      `,
      hi: `
        <h2>दस्तावेज़ विश्लेषण पूर्ण</h2>
        <p>प्रिय {{name}},</p>
        <p>आपका दस्तावेज़ "{{document_name}}" विश्लेषित किया गया है।</p>
        <p><strong>जोखिम स्कोर:</strong> {{risk_score}}/100</p>
        <p><strong>अनुपालन स्कोर:</strong> {{compliance_score}}/100</p>
        <p>पूरी रिपोर्ट अपने SafetyTrack Pro डैशबोर्ड में देखें।</p>
        <br>
        <p>सादर,<br>SafetyTrack Pro टीम</p>
      `,
      pt: `
        <h2>Análise de documento concluída</h2>
        <p>Caro/a {{name}},</p>
        <p>Seu documento "{{document_name}}" foi analisado.</p>
        <p><strong>Pontuação de risco:</strong> {{risk_score}}/100</p>
        <p><strong>Pontuação de conformidade:</strong> {{compliance_score}}/100</p>
        <p>Visualize o relatório completo em seu painel SafetyTrack Pro.</p>
        <br>
        <p>Atenciosamente,<br>Equipe SafetyTrack Pro</p>
      `,
      ru: `
        <h2>Анализ документа завершен</h2>
        <p>Уважаемый/Уважаемая {{name}},</p>
        <p>Ваш документ "{{document_name}}" был проанализирован.</p>
        <p><strong>Оценка риска:</strong> {{risk_score}}/100</p>
        <p><strong>Оценка соответствия:</strong> {{compliance_score}}/100</p>
        <p>Просмотрите полный отчет в вашей панели управления SafetyTrack Pro.</p>
        <br>
        <p>С уважением,<br>Команда SafetyTrack Pro</p>
      `,
      ja: `
        <h2>文書分析完了</h2>
        <p>{{name}}様</p>
        <p>文書"{{document_name}}"の分析が完了しました。</p>
        <p><strong>リスクスコア:</strong> {{risk_score}}/100</p>
        <p><strong>コンプライアンススコア:</strong> {{compliance_score}}/100</p>
        <p>SafetyTrack Proダッシュボードで完全なレポートを表示してください。</p>
        <br>
        <p>敬具,<br>SafetyTrack Proチーム</p>
      `,
      de: `
        <h2>Dokumentenanalyse abgeschlossen</h2>
        <p>Sehr geehrte/r {{name}},</p>
        <p>Ihr Dokument "{{document_name}}" wurde analysiert.</p>
        <p><strong>Risikobewertung:</strong> {{risk_score}}/100</p>
        <p><strong>Compliance-Bewertung:</strong> {{compliance_score}}/100</p>
        <p>Sehen Sie sich den vollständigen Bericht in Ihrem SafetyTrack Pro-Dashboard an.</p>
        <br>
        <p>Mit freundlichen Grüßen,<br>SafetyTrack Pro Team</p>
      `
    }
  };
  
  return templates[template]?.[language] || templates[template]?.en || '';
};

const getLocalizedSubject = (template, language) => {
  const subjects = {
    welcome: {
      en: 'Welcome to SafetyTrack Pro!',
      es: '¡Bienvenido a SafetyTrack Pro!',
      fr: 'Bienvenue sur SafetyTrack Pro !',
      ar: 'مرحباً بك في SafetyTrack Pro!',
      zh: '欢迎使用 SafetyTrack Pro！',
      hi: 'SafetyTrack Pro में आपका स्वागत है!',
      pt: 'Bem-vindo ao SafetyTrack Pro!',
      ru: 'Добро пожаловать в SafetyTrack Pro!',
      ja: 'SafetyTrack Proへようこそ！',
      de: 'Willkommen bei SafetyTrack Pro!'
    },
    verification: {
      en: 'Verify Your SafetyTrack Pro Account',
      es: 'Verifique su cuenta de SafetyTrack Pro',
      fr: 'Vérifiez votre compte SafetyTrack Pro',
      ar: 'تحقق من حساب SafetyTrack Pro الخاص بك',
      zh: '验证您的 SafetyTrack Pro 帐户',
      hi: 'अपना SafetyTrack Pro खाता सत्यापित करें',
      pt: 'Verifique sua conta SafetyTrack Pro',
      ru: 'Подтвердите ваш аккаунт SafetyTrack Pro',
      ja: 'SafetyTrack Proアカウントを確認してください',
      de: 'Bestätigen Sie Ihr SafetyTrack Pro-Konto'
    },
    password_reset: {
      en: 'Reset Your SafetyTrack Pro Password',
      es: 'Restablecer su contraseña de SafetyTrack Pro',
      fr: 'Réinitialiser votre mot de passe SafetyTrack Pro',
      ar: 'إعادة تعيين كلمة مرور SafetyTrack Pro الخاصة بك',
      zh: '重置您的 SafetyTrack Pro 密码',
      hi: 'अपना SafetyTrack Pro पासवर्ड रीसेट करें',
      pt: 'Redefinir sua senha SafetyTrack Pro',
      ru: 'Сбросить пароль SafetyTrack Pro',
      ja: 'SafetyTrack Proのパスワードをリセット',
      de: 'Setzen Sie Ihr SafetyTrack Pro-Passwort zurück'
    },
    document_analysis: {
      en: 'Document Analysis Complete - SafetyTrack Pro',
      es: 'Análisis de documento completado - SafetyTrack Pro',
      fr: 'Analyse de document terminée - SafetyTrack Pro',
      ar: 'اكتمل تحليل المستند - SafetyTrack Pro',
      zh: '文档分析完成 - SafetyTrack Pro',
      hi: 'दस्तावेज़ विश्लेषण पूर्ण - SafetyTrack Pro',
      pt: 'Análise de documento concluída - SafetyTrack Pro',
      ru: 'Анализ документа завершен - SafetyTrack Pro',
      ja: '文書分析完了 - SafetyTrack Pro',
      de: 'Dokumentenanalyse abgeschlossen - SafetyTrack Pro'
    }
  };
  
  return subjects[template]?.[language] || subjects[template]?.en || '';
};

const generateEmailContent = (template, data, language) => {
  // Replace placeholders with actual data
  let content = template;
  
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    content = content.replace(new RegExp(placeholder, 'g'), value);
  }
  
  // Add language-specific formatting
  return wrapEmailTemplate(content, language);
};

const wrapEmailTemplate = (content, language) => {
  const direction = ['ar', 'he'].includes(language) ? 'rtl' : 'ltr';
  const textAlign = ['ar', 'he'].includes(language) ? 'right' : 'left';
  
  return `
    <!DOCTYPE html>
    <html dir="${direction}" lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SafetyTrack Pro</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: ${textAlign};
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 0 0 8px 8px;
        }
        .footer {
          margin-top: 20px;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 0;
        }
        .code {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          letter-spacing: 3px;
          padding: 10px;
          background-color: #f3f4f6;
          border-radius: 6px;
          text-align: center;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SafetyTrack Pro</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© 2024 SafetyTrack Pro. All rights reserved.</p>
        <p>This email was sent to you as part of your SafetyTrack Pro account.</p>
      </div>
    </body>
    </html>
  `;
};

const sendMail = async (to, subject, content) => {
  // Implementation for sending email using your email service
  // This could be Nodemailer, SendGrid, AWS SES, etc.
  
  try {
    // Example using a hypothetical email service
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html: content
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Example usage:
// sendEmail('user@example.com', 'welcome', {name: 'John Doe'}, 'es')
// sendEmail('user@example.com', 'verification', {name: 'John Doe', code: '123456'}, 'en')
// sendEmail('user@example.com', 'password_reset', {name: 'John Doe', reset_link: 'https://example.com/reset?token=abc123'}, 'fr')
// sendEmail('user@example.com', 'document_analysis', {name: 'John Doe', document_name: 'Safety Manual', risk_score: 85, compliance_score: 92}, 'ja')

export default {
  sendEmail,
  getEmailTemplate,
  getLocalizedSubject,
  generateEmailContent
};