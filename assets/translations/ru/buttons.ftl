btn-back =
    .general = <tg-emoji emoji-id="5974120159491657171">⬅️</tg-emoji> Назад
    .menu = <tg-emoji emoji-id="5974120159491657171">↩️</tg-emoji> Главное меню
    .menu-return = <tg-emoji emoji-id="5974120159491657171">↩️</tg-emoji> Вернуться в главное меню
    .dashboard = <tg-emoji emoji-id="5974120159491657171">↩️</tg-emoji> Вернуться в панель управления
    .referrals = <tg-emoji emoji-id="5409132617750555920">👪</tg-emoji> К списку рефералов

btn-common =
    .notification-close = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Закрыть
    .devices-empty = <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> У вас нет подключенных устройств
    .cancel = Отмена
    .next = <tg-emoji emoji-id="5253767677670862169">▶️</tg-emoji> Далее
    .prev = <tg-emoji emoji-id="5255703720078879038">◀️</tg-emoji> Назад

    .squad-choice = { $selected -> 
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } { $name }

    .duration = <tg-emoji emoji-id="5440671202555215608">⌛</tg-emoji> { $value ->
    [0] { unlimited }
    *[OTHER] { unit-day }
    }

btn-devices =
    .delete-all = <tg-emoji emoji-id="5445267414562389170">🗑</tg-emoji> Удалить все устройства
    .reissue = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Перевыпустить подписку
    .confirm-delete = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Да, удалить
    .confirm-reissue = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Да, сбросить
    .cancel-reissue = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Нет

    .item = { $platform_icon } { $platform } { $device_model -> 
    [0] { space }
    *[HAS] ({ $device_model }){ space }
    }— { $created_at }

btn-backup =
    .active-toggle = { $enabled ->
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включен
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключен
    }
    .set-interval = <tg-emoji emoji-id="5316575093269214796">🕐</tg-emoji> Интервал
    .set-max-files = <tg-emoji emoji-id="5433653135799228968">📁</tg-emoji> Кол-во файлов
    .send-toggle = { $send_to_chat ->
        [1] <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Отправка в чат: включена
        *[0] <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Отправка в чат: выключена
    }
    .backup-assets = <tg-emoji emoji-id="5359741159566484212">📦</tg-emoji> Запустить бэкап ассетов
    .backup-db = <tg-emoji emoji-id="4985967215405695597">🗄</tg-emoji> Запустить бэкап базы данных
    
btn-remnashop-info =
    .release-latest = <tg-emoji emoji-id="5280881372418816002">👀</tg-emoji> Посмотреть
    .how-upgrade = <tg-emoji emoji-id="5452069934089641166">❓</tg-emoji> Как обновить
    .github = <tg-emoji emoji-id="5438496463044752972">⭐</tg-emoji> GitHub
    .telegram = <tg-emoji emoji-id="5409132617750555920">👪</tg-emoji> Telegram
    .donate = <tg-emoji emoji-id="5357461124637794049">💰</tg-emoji> Поддержать разработчика
    .docs = <tg-emoji emoji-id="5226512880362332956">📖</tg-emoji> Документация

btn-requirement =
    .rules-accept = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Принять правила
    .channel-join = <tg-emoji emoji-id="5471924412552849893">❤️</tg-emoji> Перейти в канал
    .channel-confirm = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Подтвердить

btn-menu =
    .trial = <tg-emoji emoji-id="5199749070830197566">🎁</tg-emoji> ПОПРОБОВАТЬ БЕСПЛАТНО
    .trial-paid = <tg-emoji emoji-id="5188481279963715781">🚀</tg-emoji> ПОПРОБОВАТЬ ЗА { $trial_price }
    .connect = <tg-emoji emoji-id="5188481279963715781">🚀</tg-emoji> Подключиться
    .connect-reserve = <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> Подключиться (резерв)
    .devices = <tg-emoji emoji-id="5427252019620504695">📱</tg-emoji> Устройства
    .subscription = <tg-emoji emoji-id="5472250091332993630">💳</tg-emoji> Подписка
    .invite = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Пригласить
    .support = <tg-emoji emoji-id="5238025132177369293">🆘</tg-emoji> Поддержка
    .web-cabinet = <tg-emoji emoji-id="6019602127989510280">🌐</tg-emoji> Личный кабинет
    .dashboard = <tg-emoji emoji-id="5334882760735598374">🛠</tg-emoji> Панель управления

    .connect-not-available =
    <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji> { $status ->
    [LIMITED] ПРЕВЫШЕН ЛИМИТ ТРАФИКА
    [EXPIRED] СРОК ДЕЙСТВИЯ ИСТЕК
    *[OTHER] ВАША ПОДПИСКА НЕ РАБОТАЕТ
    } <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji>

btn-invite =
    .about = <tg-emoji emoji-id="5452069934089641166">❓</tg-emoji> Подробнее о награде
    .copy = <tg-emoji emoji-id="5467397594332275071">📋</tg-emoji> Скопировать ссылку
    .send = <tg-emoji emoji-id="5319166753845026372">📩</tg-emoji> Пригласить
    .qr = <tg-emoji emoji-id="5440410042773824003">🧾</tg-emoji> QR-код
    .withdraw-points = <tg-emoji emoji-id="5427168083074628963">💎</tg-emoji> Обменять баллы
    .reset-referral = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Сбросить реф. ссылку

btn-dashboard =
    .statistics = <tg-emoji emoji-id="5190806721286657692">📊</tg-emoji> Статистика
    .users = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Пользователи
    .broadcast = <tg-emoji emoji-id="5388632425314140043">📢</tg-emoji> Рассылка
    .promocodes = <tg-emoji emoji-id="5330139858415397734">🎟</tg-emoji> Промокоды
    .access = <tg-emoji emoji-id="5301054868167876393">🔓</tg-emoji> Режим доступа
    .remnawave = <tg-emoji emoji-id="">🌊</tg-emoji> RemnaWave
    .remnashop = <tg-emoji emoji-id="5373052667671093676">🛍</tg-emoji> RemnaShop
    .transactions = <tg-emoji emoji-id="5821310218146943846">🧾</tg-emoji> Транзакции
    .importer = <tg-emoji emoji-id="5449683594425410231">📥</tg-emoji> Импорт пользователей

btn-statistics =
    .users = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Пользователи
    .subscriptions = <tg-emoji emoji-id="5472250091332993630">💳</tg-emoji> Подписки
    .transactions = <tg-emoji emoji-id="5821310218146943846">🧾</tg-emoji> Транзакции
    .promocodes = <tg-emoji emoji-id="5199749070830197566">🎁</tg-emoji> Промокоды
    .referrals = <tg-emoji emoji-id="5409132617750555920">👪</tg-emoji> Рефералы

    .subscription-page =
    { $page ->
        [0] { $is_current ->
            [1] [ Общая статистика ]
            *[0] Общая статистика
        }
        *[OTHER] { $is_current ->
            [1] [ { $plan_name } ]
            *[0] { $plan_name }
        }
    }

    .transaction-page =
    { $page ->
        [0] { $is_current ->
            [1] [ Общая статистика ]
            *[0] Общая статистика
        }
        *[OTHER] { $is_current ->
            [1] [ { gateway-type } ]
            *[0] { gateway-type }
        }
    }

btn-users =
    .search = <tg-emoji emoji-id="5188217332748527444">🔍</tg-emoji> Поиск пользователя
    .recent-registered = <tg-emoji emoji-id="5361979468887893611">🆕</tg-emoji> Последние зарегистрированные
    .recent-activity = <tg-emoji emoji-id="5334882760735598374">📝</tg-emoji> Последние взаимодействующие
    .blacklist = <tg-emoji emoji-id="5260293700088511294">🚫</tg-emoji> Черный список
    .unblock-all = <tg-emoji emoji-id="5301054868167876393">🔓</tg-emoji> Разблокировать всех
    .blacklist-view = <tg-emoji emoji-id="">🗒️</tg-emoji> Список заблокированных
    .blacklist-block = <tg-emoji emoji-id="5260293700088511294">⛔</tg-emoji> Заблокировать по ID
    .blacklist-sources = <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> Автообновляемые списки
    .blacklist-sources-sync = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Синхронизировать
    .blacklist-block-clear = <tg-emoji emoji-id="5445267414562389170">🗑</tg-emoji> Очистить список ID

    .blacklist-source = <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> { $source }

btn-user =
    .discount = <tg-emoji emoji-id="5472030678633684592">💸</tg-emoji> Скидка
    .discount-personal = <tg-emoji emoji-id="5409132617750555920">👤</tg-emoji> Персональная скидка
    .discount-purchase = <tg-emoji emoji-id="5330139858415397734">🎟</tg-emoji> На следующую покупку
    .points = <tg-emoji emoji-id="5427168083074628963">💎</tg-emoji> Баллы
    .statistics = <tg-emoji emoji-id="5190806721286657692">📊</tg-emoji> Статистика
    .referrals = <tg-emoji emoji-id="5409132617750555920">👪</tg-emoji> Рефералы
    .message = <tg-emoji emoji-id="5319166753845026372">📩</tg-emoji> Сообщение
    .role = <tg-emoji emoji-id="5377754411319698237">👮‍♂️</tg-emoji> Роль
    .transactions = <tg-emoji emoji-id="5821310218146943846">🧾</tg-emoji> Транзакции
    .give-access = <tg-emoji emoji-id="5330115548900501467">🔑</tg-emoji> Доступ к планам
    .current-subscription = <tg-emoji emoji-id="5472250091332993630">💳</tg-emoji> Текущая подписка
    .subscription-traffic-limit = <tg-emoji emoji-id="6019602127989510280">🌐</tg-emoji> Лимит трафика
    .subscription-device-limit = <tg-emoji emoji-id="5427252019620504695">📱</tg-emoji> Лимит устройств
    .subscription-expire-time = <tg-emoji emoji-id="5451732530048802485">⏳</tg-emoji> Время истечения
    .subscription-squads = <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> Сквады
    .subscription-traffic-reset = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Сбросить трафик
    .subscription-devices = <tg-emoji emoji-id="">🗒️</tg-emoji> Список устройств
    .subscription-url = <tg-emoji emoji-id="5467397594332275071">📋</tg-emoji> Скопировать ссылку
    .subscription-delete = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Удалить
    .subscription-reissue = <tg-emoji emoji-id="">♻️</tg-emoji> Перевыпустить
    .message-preview = <tg-emoji emoji-id="5280881372418816002">👀</tg-emoji> Предпросмотр
    .message-confirm = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Отправить
    .referral-reset = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Сбросить реф. ссылку
    .sync = <tg-emoji emoji-id="">🌀</tg-emoji> Синхронизировать
    .sync-remnawave = <tg-emoji emoji-id="">🌊</tg-emoji> Использовать данные Remnawave
    .sync-remnashop = <tg-emoji emoji-id="5373052667671093676">🛍</tg-emoji> Использовать данные Remnashop
    .give-subscription = <tg-emoji emoji-id="5199749070830197566">🎁</tg-emoji> Выдать подписку
    .subscription-internal-squads = <tg-emoji emoji-id="5411225014148014586">⏺️</tg-emoji> Внутренние сквады
    .subscription-external-squads = <tg-emoji emoji-id="">⏹️</tg-emoji> Внешний сквад

    .allowed-plan-choice = { $selected ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } { $plan_name }

    .subscription-active-toggle = { $is_active ->
    [1] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключить
    *[0] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включить
    }

    .transaction = { $status ->
    [PENDING] <tg-emoji emoji-id="5330157467781312171">🕓</tg-emoji>
    [COMPLETED] <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji>
    [CANCELED] <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji>
    [REFUNDED] <tg-emoji emoji-id="5472030678633684592">💸</tg-emoji>
    [FAILED] <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji>
    *[OTHER] { $status }
    } { $created_at } · { gateway-type }
    
    .trial-toggle = { $is_trial_available ->
    [1] <tg-emoji emoji-id="5411512278740640309">🧪</tg-emoji> Пробник: доступен
    *[0] <tg-emoji emoji-id="5411512278740640309">🧪</tg-emoji> Пробник: не доступен
    }

    .block = { $is_blocked ->
    [1] <tg-emoji emoji-id="5301054868167876393">🔓</tg-emoji> Разблокировать
    *[0] <tg-emoji emoji-id="5296369303661067030">🔒</tg-emoji> Заблокировать
    }

btn-broadcast =
    .list = <tg-emoji emoji-id="">🗒️</tg-emoji> Список всех рассылок
    .all = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Всем
    .plan = <tg-emoji emoji-id="5359741159566484212">📦</tg-emoji> По плану
    .subscribed = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> С подпиской
    .unsubscribed = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Без подписки
    .expired = <tg-emoji emoji-id="5440671202555215608">⌛</tg-emoji> Просроченным
    .trial = <tg-emoji emoji-id="">✳️</tg-emoji> С пробником
    .content = <tg-emoji emoji-id="5253742260054409879">✉️</tg-emoji> Редактировать содержимое
    .buttons = <tg-emoji emoji-id="">✳️</tg-emoji> Редактировать кнопки
    .preview = <tg-emoji emoji-id="5280881372418816002">👀</tg-emoji> Предпросмотр
    .confirm = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Запустить рассылку
    .refresh = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Обновить данные
    .cancel = <tg-emoji emoji-id="5260293700088511294">⛔</tg-emoji> Остановить рассылку
    .delete = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Удалить отправленное

    .plan-title = { $is_active ->
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> 
    } { $name }
    
    .button-choice = { $selected ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    }
    
    .title = { $status ->
    [PROCESSING] <tg-emoji emoji-id="5451732530048802485">⏳</tg-emoji>
    [COMPLETED] <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji>
    [CANCELED] <tg-emoji emoji-id="5260293700088511294">⛔</tg-emoji>
    [DELETED] <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji>
    [ERROR] <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji>
    *[OTHER] { $status }
    } { $created_at }
    
btn-goto =
    .subscription = <tg-emoji emoji-id="5472250091332993630">💳</tg-emoji> Купить подписку
    .promocode = <tg-emoji emoji-id="5330139858415397734">🎟</tg-emoji> Активировать промокод
    .invite = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Пригласить
    .subscription-renew = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Продлить подписку
    .user-profile = <tg-emoji emoji-id="5409132617750555920">👤</tg-emoji> Перейти к пользователю
    .referrer-profile = <tg-emoji emoji-id="5357080225463149588">🤝</tg-emoji> Перейти к пригласителю
    .contact-support = <tg-emoji emoji-id="5319166753845026372">📩</tg-emoji> Перейти в поддержку

btn-promocodes =
    .save = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Сохранить
    .create = <tg-emoji emoji-id="5361979468887893611">🆕</tg-emoji> Создать промокод
    .confirm = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Создать промокод
    .delete = <tg-emoji emoji-id="">🗑️</tg-emoji> Удалить
    .regenerate = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Перегенерировать
    .code = <tg-emoji emoji-id="5406683434124859552">🏷️</tg-emoji> Код
    .type = <tg-emoji emoji-id="5222444124698853913">🔖</tg-emoji> Тип награды
    .availability = <tg-emoji emoji-id="">✴️</tg-emoji> Доступ
    .reward = <tg-emoji emoji-id="5199749070830197566">🎁</tg-emoji> Награда
    .plan = <tg-emoji emoji-id="5359741159566484212">📦</tg-emoji> План
    .expires = <tg-emoji emoji-id="5440671202555215608">⌛</tg-emoji> Срок действия
    .max-activations = <tg-emoji emoji-id="">🔢</tg-emoji> Лимит активаций
    .reset = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Сбросить

    .plan-duration = { $days -> 
        [one] { $days } день
        [few] { $days } дня
        *[more] { $days } дней
    }

    .item = <tg-emoji emoji-id="5330139858415397734">🎟</tg-emoji> { $code } — { promocode-type }

    .active-toggle = { $is_active ->
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включен
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключен
    }

    .reusable-toggle = <tg-emoji emoji-id="4970142833605345805">🔁</tg-emoji> { $is_reusable ->
    [1] Повтор: да
    *[0] Повтор: нет
    }

btn-access =
    .mode = { access-mode }
    .conditions = <tg-emoji emoji-id="5341715473882955310">⚙️</tg-emoji> Условия доступа
    .rules = <tg-emoji emoji-id="">✳️</tg-emoji> Принятие правил
    .channel = <tg-emoji emoji-id="">❇️</tg-emoji> Подписка на канал

    .payments-toggle = { $enabled ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } Платежи

    .registration-toggle = { $enabled ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } Регистрация

    .condition-toggle = { $enabled ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji> Включено
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji> Выключено
    }

btn-remnashop =
    .admins = <tg-emoji emoji-id="5377754411319698237">👮‍♂️</tg-emoji> Администраторы
    .gateways = <tg-emoji emoji-id="6019602127989510280">🌐</tg-emoji> Платежные системы
    .referral = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Реф. система
    .advertising = <tg-emoji emoji-id="5350460637182993292">🎯</tg-emoji> Реклама
    .plans = <tg-emoji emoji-id="5359741159566484212">📦</tg-emoji> Планы
    .notifications = <tg-emoji emoji-id="5242628160297641831">🔔</tg-emoji> Уведомления
    .logs = <tg-emoji emoji-id="">📄</tg-emoji> Логи
    .menu-editor = <tg-emoji emoji-id="">🎛</tg-emoji> Редактор главного меню
    .backup = <tg-emoji emoji-id="">💾</tg-emoji> Бэкап
    .extra = <tg-emoji emoji-id="5341715473882955310">⚙️</tg-emoji> Доп. настройки

btn-remnashop-transaction = { $status ->
    [PENDING] <tg-emoji emoji-id="5330157467781312171">🕓</tg-emoji>
    [COMPLETED] <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji>
    [CANCELED] <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji>
    [REFUNDED] <tg-emoji emoji-id="5472030678633684592">💸</tg-emoji>
    [FAILED] <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji>
    *[OTHER] { $status }
    } #{ $user_id } · { gateway-type } · { $created_at }

btn-remnashop-extra =
    .device-single = { $enabled -> 
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } Удаление устройства

    .device-all = { $enabled -> 
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } Удаление всех устройств

    .link-reset = { $enabled -> 
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } Перевыпуск подписки
    .referral-reset = { $enabled -> 
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } Сброс реф. ссылки

    .trial-channel-guard = { $enabled ->
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } Авто отключение пробника

    .mini-app-reserve = { $enabled ->
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } Резервная кнопка подключения

    .device-purchase = { $enabled ->
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } Докупка устройств

    .device-price = <tg-emoji emoji-id="5357461124637794049">💰</tg-emoji> { $currency } { $price ->
        [0] — не задана
        *[HAS] — { $price }{ $symbol }
    }

    .toggle = { $enabled ->
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включено
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключено
    }

btn-menu-editor =
    .text = <tg-emoji emoji-id="5406683434124859552">🏷️</tg-emoji> Текст
    .availability = <tg-emoji emoji-id="">✴️</tg-emoji> Доступ
    .type = <tg-emoji emoji-id="5222444124698853913">🔖</tg-emoji> Тип
    .payload = <tg-emoji emoji-id="">📄</tg-emoji> Данные
    .color = <tg-emoji emoji-id="5431456208487716895">🎨</tg-emoji> Цвет
    .confirm = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Сохранить
    .color-default = Без цвета
    .color-primary = Основной
    .color-success = Зеленый
    .color-danger = Красный

    .button = { $is_active ->
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } { $text }

    .active-toggle = { $is_active ->
        [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включена
        *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключена
    }

    .subscribers-only-toggle = { $subscribers_only ->
        [1] <tg-emoji emoji-id="5472250091332993630">💳</tg-emoji> С подпиской
        *[0] <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Всем
    }

btn-gateway =
    .title = { gateway-type }
    .setting = { $field }
    .display-name = <tg-emoji emoji-id="5406683434124859552">🏷️</tg-emoji> Отображаемое название
    .webhook-copy = <tg-emoji emoji-id="5467397594332275071">📋</tg-emoji> Скопировать вебхук
    .test = <tg-emoji emoji-id="5368487491097601104">🐞</tg-emoji> Тест
    .default-currency = <tg-emoji emoji-id="5472030678633684592">💸</tg-emoji> Валюта по умолчанию
    .placement = <tg-emoji emoji-id="">🔢</tg-emoji> Изменить позиционирование
    .field-reset = <tg-emoji emoji-id="">♻️</tg-emoji> Сбросить значение

    .active-toggle = { $is_active ->
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включено
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключено
    }

    .default-currency-choice = { $enabled ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } { $symbol } { $currency }

btn-referral =
    .level = <tg-emoji emoji-id="">🔢</tg-emoji> Уровень
    .reward-type = <tg-emoji emoji-id="5375152498656961898">🎀</tg-emoji> Тип награды
    .accrual-strategy = <tg-emoji emoji-id="5391032818111363540">📍</tg-emoji> Условие начисления
    .reward-strategy = <tg-emoji emoji-id="">⚖️</tg-emoji> Форма начисления
    .reward = <tg-emoji emoji-id="5199749070830197566">🎁</tg-emoji> Награда
    
    .active-toggle = { $is_enable -> 
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включена
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключена
    }

    .level-choice = { $type -> 
    [1] <tg-emoji emoji-id="">1️⃣</tg-emoji>
    [2] <tg-emoji emoji-id="">2️⃣</tg-emoji>
    [3] <tg-emoji emoji-id="">3️⃣</tg-emoji>
    *[OTHER] { $type }
    }

    .reward-choice = { $type -> 
    [POINTS] <tg-emoji emoji-id="5427168083074628963">💎</tg-emoji> Баллы
    [EXTRA_DAYS] <tg-emoji emoji-id="5451732530048802485">⏳</tg-emoji> Дни
    *[OTHER] { $type }
    }

    .accrual-strategy-choice = { $type -> 
    [ON_FIRST_PAYMENT] <tg-emoji emoji-id="5472250091332993630">💳</tg-emoji> Первый платеж
    [ON_EACH_PAYMENT] <tg-emoji emoji-id="5472030678633684592">💸</tg-emoji> Каждый платеж
    *[OTHER] { $type }
    }

    .reward-strategy-choice = { $type -> 
    [AMOUNT] <tg-emoji emoji-id="">🔸</tg-emoji> Фиксированная
    [PERCENT] <tg-emoji emoji-id="">🔹</tg-emoji> Процентная
    *[OTHER] { $type }
    }

btn-notifications =
    .user = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Пользовательские
    .system = <tg-emoji emoji-id="5341715473882955310">⚙️</tg-emoji> Системные
    .route = <tg-emoji emoji-id="">📡</tg-emoji> Маршрут
    .default-route = <tg-emoji emoji-id="">📡</tg-emoji> Общий маршрут
    .chat-id = <tg-emoji emoji-id="5465300082628763143">💬</tg-emoji> Изменить чат
    .thread-id = <tg-emoji emoji-id="5433653135799228968">📁</tg-emoji> Изменить тред
    .route-clear = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Удалить маршрут
    
    .user-choice = { $enabled ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } { notification-type }

    .system-choice = { $enabled -> 
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } { $has_route ->
    [1] <tg-emoji emoji-id="">📡</tg-emoji>
    *[0] { space }
    } { notification-type }

    .active-toggle = { $is_active ->
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включено
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключено
    }

btn-plans =
    .save = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Сохранить
    .create = <tg-emoji emoji-id="5361979468887893611">🆕</tg-emoji> Создать план
    .create-confirm = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Создать план
    .delete = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Удалить
    .name = <tg-emoji emoji-id="5406683434124859552">🏷️</tg-emoji> Название
    .description = <tg-emoji emoji-id="5465300082628763143">💬</tg-emoji> Описание
    .description-remove = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Удалить текущее описание
    .tag = <tg-emoji emoji-id="5397782960512444700">📌</tg-emoji> Тег
    .tag-remove = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Удалить текущий тег
    .type = <tg-emoji emoji-id="5222444124698853913">🔖</tg-emoji> Тип
    .availability = <tg-emoji emoji-id="">✴️</tg-emoji> Доступ
    .durations-prices = <tg-emoji emoji-id="5451732530048802485">⏳</tg-emoji> Длительности и <tg-emoji emoji-id="5357461124637794049">💰</tg-emoji> Цены
    .traffic = <tg-emoji emoji-id="6019602127989510280">🌐</tg-emoji> Трафик
    .devices = <tg-emoji emoji-id="5427252019620504695">📱</tg-emoji> Устройства
    .allowed = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Разрешенные пользователи
    .squads = <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> Сквады
    .internal-squads = <tg-emoji emoji-id="5411225014148014586">⏺️</tg-emoji> Внутренние сквады
    .external-squads = <tg-emoji emoji-id="">⏹️</tg-emoji> Внешний сквад
    .duration-add = <tg-emoji emoji-id="5361979468887893611">🆕</tg-emoji> Добавить длительность
    .price-choice = <tg-emoji emoji-id="5472030678633684592">💸</tg-emoji> { $price } { $currency }
    .export = <tg-emoji emoji-id="5433614747381538714">📤</tg-emoji> Экспорт
    .import = <tg-emoji emoji-id="5449683594425410231">📥</tg-emoji> Импорт
    .exporting = <tg-emoji emoji-id="5433614747381538714">📤</tg-emoji> Экспортировать
    .importing = <tg-emoji emoji-id="5449683594425410231">📥</tg-emoji> Импортировать
    .url = <tg-emoji emoji-id="5467397594332275071">📋</tg-emoji> Скопировать ссылку на план

    .trial = { $is_trial ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } Пробник 

    .export-choice = { $selected ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji>
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji>
    } { $name }

    .title = { $is_active ->
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> 
    } { $name }

    .active-toggle = { $is_active -> 
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включен
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключен
    }
    
    .type-choice = { $type -> 
    [TRAFFIC] <tg-emoji emoji-id="6019602127989510280">🌐</tg-emoji> Трафик
    [DEVICES] <tg-emoji emoji-id="5427252019620504695">📱</tg-emoji> Устройства
    [BOTH] <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> Трафик + устройства
    [UNLIMITED] <tg-emoji emoji-id="">♾️</tg-emoji> Безлимит
    *[OTHER] { $type }
    }

    .availability-choice = { $type -> 
    [ALL] <tg-emoji emoji-id="5399898266265475100">🌍</tg-emoji> Для всех
    [NEW] <tg-emoji emoji-id="5449885771420934013">🌱</tg-emoji> Для новых
    [EXISTING] <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Для клиентов
    [INVITED] <tg-emoji emoji-id="5253742260054409879">✉️</tg-emoji> Для приглашенных
    [ALLOWED] <tg-emoji emoji-id="5472308992514464048">🔐</tg-emoji> Для разрешенных
    [LINK] <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> По ссылке
    *[OTHER] { $type }
    }

    .traffic-strategy-choice = { $selected ->
    [1] <tg-emoji emoji-id="5386575135979348751">🔘</tg-emoji> { traffic-strategy }
    *[0] <tg-emoji emoji-id="5359744969202474972">⚪</tg-emoji> { traffic-strategy }
    }

    
btn-remnawave =
    .users = <tg-emoji emoji-id="5409132617750555920">👥</tg-emoji> Пользователи
    .hosts = <tg-emoji emoji-id="6019602127989510280">🌐</tg-emoji> Хосты
    .nodes = <tg-emoji emoji-id="5929096876321149063">🖥️</tg-emoji> Ноды
    .inbounds = <tg-emoji emoji-id="">🔌</tg-emoji> Инбаунды

btn-importer =
    .from-xui = <tg-emoji emoji-id="5371035398841571673">💩</tg-emoji> Импорт из панели 3X-UI
    .sync-from-panel = <tg-emoji emoji-id="">🌀</tg-emoji> Синхронизация: панель → бот
    .sync-from-bot = <tg-emoji emoji-id="6019330475603004839">🤖</tg-emoji> Синхронизация: бот → панель
    .sync-start = <tg-emoji emoji-id="5253767677670862169">▶️</tg-emoji> Синхронизировать
    .squads = <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> Внутренние сквады
    .import-all = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Импортировать всех
    .import-active = <tg-emoji emoji-id="">❇️</tg-emoji> Импортировать активных

btn-subscription =
    .plan = <tg-emoji emoji-id="5472250091332993630">💳</tg-emoji> Перейти к оформлению подписки
    .new = <tg-emoji emoji-id="5472030678633684592">💸</tg-emoji> Купить подписку
    .renew = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Продлить
    .change = <tg-emoji emoji-id="5375338737028841420">🔃</tg-emoji> Изменить
    .promocode = <tg-emoji emoji-id="5330139858415397734">🎟</tg-emoji> Активировать промокод
    .promocode-confirm = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Подтвердить
    .pay = <tg-emoji emoji-id="5472250091332993630">💳</tg-emoji> Оплатить
    .get = <tg-emoji emoji-id="5199749070830197566">🎁</tg-emoji> Получить бесплатно
    .back-plans = ⬅️ Назад к выбору плана
    .back-duration = ⬅️ Изменить длительность
    .back-payment-method = ⬅️ Изменить способ оплаты
    .connect = <tg-emoji emoji-id="5188481279963715781">🚀</tg-emoji> Подключиться
    .devices = <tg-emoji emoji-id="5226945370684140473">➕</tg-emoji> Докупить устройства
    .devices-count = { $count } шт.
    .devices-count-priced = { $count } шт. | { $final_amount }{ $currency }
    .devices-back-count = ⬅️ Изменить количество
    .devices-back-method = ⬅️ Изменить способ оплаты

    .payment-method = { $gateway_title } | { $final_amount ->
    [0] <tg-emoji emoji-id="5199749070830197566">🎁</tg-emoji>
    *[HAS] { $final_amount }{ $currency }
    }
    
    .duration = { $period } | { $final_amount -> 
    [0] <tg-emoji emoji-id="5199749070830197566">🎁</tg-emoji>
    *[HAS] { $final_amount }{ $currency }
    }

btn-ad-links =
    .save = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Сохранить
    .create = <tg-emoji emoji-id="5361979468887893611">🆕</tg-emoji> Создать ссылку
    .create-confirm = <tg-emoji emoji-id="5206607081334906820">✅</tg-emoji> Создать ссылку
    .delete = <tg-emoji emoji-id="5834629976883732083">❌</tg-emoji> Удалить ссылку
    .name = <tg-emoji emoji-id="5406683434124859552">🏷️</tg-emoji> Название
    .code = <tg-emoji emoji-id="5379742233853451967">🔗</tg-emoji> Код
    .regenerate = <tg-emoji emoji-id="5030872266716480568">🔄</tg-emoji> Перегенерировать
    .stats = <tg-emoji emoji-id="5190806721286657692">📊</tg-emoji> Статистика
    .url = <tg-emoji emoji-id="5467397594332275071">📋</tg-emoji> Скопировать ссылку

    .title = { $is_active ->
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji>
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji>
    } { $name }

    .active-toggle = { $is_active ->
    [1] <tg-emoji emoji-id="5316865463123195600">🟢</tg-emoji> Включена
    *[0] <tg-emoji emoji-id="5316596104249224956">🔴</tg-emoji> Выключена
    }