ntf-error =
    .unknown = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Произошла ошибка.</i>
    .permission-denied = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>У вас недостаточно прав.</i>
    .log-not-found = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Лог файл не найден.</i>
    .logs-disabled = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Логирование в файл отключено.</i>
    
    .lost-context = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Произошла ошибка. Перезапустите диалог командой /start.</i>
    .lost-context-restart = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Произошла ошибка. Диалог перезапущен.</i>

ntf-common =
    .trial-unavailable = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Пробная подписка временно недоступна.</i>
    .throttling = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Вы отправляете слишком много запросов. Пожалуйста, подождите.</i>
    .double-click-confirm = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Нажмите еще раз, чтобы подтвердить действие.</i>
    .squads-empty = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Сквады не найдены. Проверьте их наличие в панели.</i>

    .withdraw-points = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>У вас недостаточно баллов для выполнения обмена.</i>
    .internal-squads-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Выберите хотя бы один внутренний сквад.</i>

    .invalid-value = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Некорректное значение.</i>
    .value-updated = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Параметр успешно обновлен.</i>
    .cooldown-active = <tg-emoji emoji-id="5451732530048802485">⏳</tg-emoji> <i>Временно недоступно. Попробуйте снова через { $available_at }.</i>

    .plan-not-found = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>План не найден или недоступен.</i>
    .connect-not-available =
    <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> { $status ->
    [LIMITED]
    Вы израсходовали весь доступный объем трафика. { $is_trial ->
    [0] { $traffic_strategy ->
        [NO_RESET] Продлите подписку, чтобы сбросить трафик и продолжить пользоваться сервисом!
        *[RESET] Трафик будет восстановлен через { $reset_time }. Вы также можете продлить подписку, чтобы сбросить трафик.
        }
    *[1] { $traffic_strategy ->
        [NO_RESET] Оформите подписку, чтобы продолжить пользоваться сервисом!
        *[RESET] Трафик будет восстановлен через { $reset_time }. Вы также можете оформить подписку, чтобы пользоваться сервисом без ограничений.
        }
    }
    [EXPIRED]  
    { $is_trial ->
    [0] Срок действия вашей подписки истек. Продлите подписку или оформите новую.
    *[1] Бесплатный пробный период завершен. Оформите подписку, чтобы продолжить пользоваться сервисом.
    }
    *[OTHER] Произошла ошибка при проверке статуса или подписка была отключена. Обратитесь в поддержку.
    }
    
ntf-command =
    .paysupport = <tg-emoji emoji-id="5472030678633684592">💸</tg-emoji> <b>Чтобы запросить возврат, обратитесь в службу поддержки.</b>
    .rules = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <b>Пожалуйста, ознакомьтесь с <a href="{ $url }">Условиями использования</a> перед использованием сервиса.</b>
    .help = <tg-emoji emoji-id="5238025132177369293">🆘</tg-emoji> <b>Нажмите кнопку ниже, чтобы связаться с поддержкой.</b>

ntf-requirement =
    .channel-join-required = <tg-emoji emoji-id="">❇️</tg-emoji> Подпишитесь на наш канал и получайте <b>бесплатные дни, акции и новости</b>. После подписки нажмите «Подтвердить».
    .channel-join-required-left = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> Вы отписались от канала. Подпишитесь, чтобы продолжить пользоваться ботом.
    .rules-accept-required = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <b>Перед использованием сервиса ознакомьтесь и примите <a href="{ $url }">Условия использования</a>.</b>
    .channel-join-error = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> Мы не видим вашу подписку на канал. Проверьте подписку и попробуйте снова.
    .trial-paused = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> Пробный период приостановлен — вы отписались от канала. Подпишитесь снова, чтобы возобновить доступ.
    .trial-restored = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Пробный период возобновлен.
    
ntf-user =
    .not-found = <i><tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Пользователь не найден.</i>
    .transaction-not-found = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Транзакция не найдена.</i>
    .transactions-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Список транзакций пуст.</i>
    .subscription-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Активная подписка не найдена.</i>
    .subscription-deleted = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Подписка успешно удалена.</i>
    .plans-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Нет доступных планов.</i>
    .devices-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Список устройств пуст.</i>
    .allowed-plans-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Нет доступных планов для предоставления доступа.</i>
    .referral-reset = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Реферальная ссылка успешно сброшена.</i>
    .message-success = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Сообщение успешно отправлено.</i>
    .message-failed = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Не удалось отправить сообщение.</i>

    .sync-already = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Данные подписки идентичны.</i>
    .sync-missing-data = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Синхронизация невозможна. Данные подписки отсутствуют в панели и в боте.</i>
    .sync-success = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Синхронизация подписки выполнена.</i>

    .invalid-expire-time = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Невозможно { $operation ->
    [ADD] продлить
    *[SUB] сократить
    } срок подписки на указанное количество дней.</i>

    .invalid-points = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Невозможно { $operation ->
    [ADD] добавить
    *[SUB] списать
    } указанное количество баллов.</i>

ntf-access =
    .maintenance = <tg-emoji emoji-id="">🚧</tg-emoji> <i>Бот находится на обслуживании. Попробуйте позже.</i>
    .registration-disabled = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Регистрация новых пользователей отключена.</i>
    .registration-invite-only = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Регистрация доступна только по приглашению.</i>
    .payments-disabled = <tg-emoji emoji-id="">🚧</tg-emoji> <i>Платежи временно недоступны! Вы получите уведомление после восстановления.</i>
    .payments-restored = <tg-emoji emoji-id="">❇️</tg-emoji> <i>Платежи восстановлены! Теперь вы можете купить или продлить подписку. Спасибо за ожидание.</i>

ntf-plan =
    .not-file = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Отправьте планы в виде json файла.</i>
    .import-failed = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Не удалось импортировать.</i>
    .import-success = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Успешно импортировано.</i>
    .export-plans-not-selected = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Выберите хотя бы один план для экспорта.</i>
    .export-failed = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Не удалось экспортировать.</i>
    .export-success = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Выбранные планы экспортированы.</i>
    .trial-single-duration = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Пробный план может иметь только одну длительность.</i>
    .duration-already-exists = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Такая длительность уже существует.</i>
    .name-already-exists = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>План с таким именем уже существует.</i>
    .user-already-allowed = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Идентификатор пользователя уже добавлен.</i>

    .updated = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>План успешно обновлен.</i>
    .created = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>План успешно создан.</i>
    .deleted = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>План успешно удален.</i>

ntf-gateway =
    .not-configured = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Платежный шлюз не настроен.</i>
    .not-configurable = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>У платежного шлюза отсутствуют настройки.</i>
    .test-payment-created = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i><a href="{ $url }">Тестовый платеж</a> успешно создан.</i>
    .test-payment-error = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Ошибка при создании тестового платежа.</i>
    .test-payment-confirmed = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Тестовый платеж успешно обработан.</i>
    .field-reset = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Значение поля очищено.</i>
    .field-reset-deactivated = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Значение поля очищено. Шлюз отключён: не хватает обязательных настроек.</i>

ntf-subscription =
    .plans-unavailable = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>В данный момент нет доступных планов.</i>
    .gateways-unavailable = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>В данный момент нет доступных платежных систем.</i>
    .renew-plan-unavailable = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Текущий план устарел и недоступен для продления.</i>
    .payment-creation-failed = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Ошибка при создании платежа. Попробуйте позже.</i>

ntf-broadcast =
    .text-too-long = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Превышено максимальное кол-во символов ({ $max_limit }).
    .list-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Список рассылок пуст.</i>
    .plans-unavailable = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Нет доступных планов.</i>
    .audience-unavailable = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Нет пользователей для выбранной аудитории.</i>
    .content-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Контент пуст.</i>
    .content-saved = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Контент успешно сохранен.</i>

    .not-cancelable = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Рассылку невозможно отменить.</i>
    .canceled = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Рассылка успешно отменена.</i>
    .deleting = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Выполняется удаление отправленных сообщений.</i>
    .already-deleted = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Рассылка уже удалена или находится в процессе удаления.</i>

    .deleted-success =
        <tg-emoji emoji-id="5323442290708985472">ℹ️</tg-emoji> Результат удаления рассылки <code>{ $task_id }</code>.

        <blockquote>
        • <b>Всего сообщений</b>: { $total_count }
        • <b>Удалено</b>: { $deleted_count }
        • <b>Не удалось удалить</b>: { $failed_count }
        </blockquote>

ntf-importer =
    .not-file = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Отправьте базу данных в виде файла.</i>
    .db-failed = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Ошибка при экспорте пользователей из базы данных.</i>
    .users-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Список пользователей в базе данных пуст.</i>

    .started = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Импорт запущен. Дождитесь завершения...</i>
    .already-running = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Импорт уже выполняется. Пожалуйста, подождите.</i>

ntf-sync =
    .from-panel-started = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Синхронизация панель → бот запущена. Дождитесь завершения...</i>
    .from-bot-started = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Синхронизация бот → панель запущена. Дождитесь завершения...</i>
    .users-not-found = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Пользователи для синхронизации не найдены.</i>
    .already-running = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> <i>Синхронизация уже выполняется. Пожалуйста, подождите.</i>

ntf-menu-editor =
    .button-saved = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Кнопка успешно сохранена.</i>
    .invalid-payload = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Недопустимый формат URL.</i>

ntf-devices =
    .deleted = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Устройство удалено.</i>
    .all-deleted = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Все устройства удалены.</i>
    .reissued = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Подписка успешно перевыпущена.</i>

ntf-backup =
    .assets-started = <tg-emoji emoji-id="5451732530048802485">⏳</tg-emoji> <i>Создание бэкапа ассетов...</i>
    .db-started = <tg-emoji emoji-id="5451732530048802485">⏳</tg-emoji> <i>Создание бэкапа базы данных...</i>
    .error = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Ошибка при создании бэкапа</i>

ntf-blacklist =
    .list-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Список заблокированных пуст.</i>
    .no-ids-found = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>По ссылке не найдено ни одного ID.</i>
    .source-removed = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Список удален.</i>
    .blocked-ids-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Список заблокированных ID пуст.</i>
    .blocked-ids-cleared = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Очищено { $count } ID.</i>
    
    .block-result =
    <tg-emoji emoji-id="5323442290708985472">ℹ️</tg-emoji> Результат блокировки.

    <blockquote>
    • <b>Всего ID</b>: { $total }
    • <b>Заблокировано пользователей</b>: { $blocked_users }
    • <b>Заблокировано ID</b>: { $blocked_ids }
    • <b>Уже заблокированные</b>: { $already_blocked }
    </blockquote>

ntf-invite =
    .referral-reset = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Реферальная ссылка обновлена.</i>

ntf-promocode =
    .not-found = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Промокод не найден или недействителен.</i>
    .not-available = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Промокод недоступен.</i>
    .expired = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Срок действия промокода истек.</i>
    .already-activated = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Вы уже активировали данный промокод.</i>
    .activated = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Промокод успешно активирован!</i>
    .activation-failed = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Не удалось активировать промокод. Попробуйте позже.</i>
    .code-exists = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Промокод с таким кодом уже существует.</i>
    .created = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Промокод создан.</i>
    .deleted = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Промокод удален.</i>
    .fields-required = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Заполните значение награды.</i>
    .invalid-code = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Код может содержать только латинские буквы, цифры, дефис и подчёркивание.</i>
    .plans-empty = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> <i>Нет доступных планов.</i>
    .updated = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Промокод обновлен.</i>

ntf-ad-link =
    .created = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Рекламная ссылка создана.</i>
    .updated = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Рекламная ссылка обновлена.</i>
    .deleted = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> <i>Рекламная ссылка удалена.</i>
