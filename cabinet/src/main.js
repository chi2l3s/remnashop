import './style.css';
import { api, safeUrl } from './api.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = { home:'M3 10 12 3l9 7v11h-6v-7H9v7H3z', plans:'M4 5h16v14H4z M4 10h16 M8 15h3', devices:'M8 2h9v20H8z M11 18h3', profile:'M20 21v-2a7 7 0 0 0-14 0v2 M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0', arrow:'m9 5 7 7-7 7', shield:'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6z M8 12l3 3 5-6', copy:'M8 8h12v13H8z M16 8V3H3v13h5', plus:'M12 5v14 M5 12h14', gift:'M3 8h18v4H3z M5 12v9h14v-9 M12 8v13 M12 8C2 8 6-2 12 8c6-10 10 0 0 0', refresh:'M20 7v5h-5 M4 17v-5h5 M6 7a7 7 0 0 1 14 5 M18 17a7 7 0 0 1-14-5', logout:'M9 3H3v18h6 M9 12h12 m-5-5 5 5-5 5' };
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.arrow}"/></svg>`;
const state = { user:null, subscription:null, page:'home', busy:false, authMode:'login' };
const tg = window.Telegram?.WebApp;
tg?.ready(); tg?.expand();
const date = value => new Date(value).toLocaleDateString('ru-RU', {day:'numeric',month:'long',year:'numeric'});
const button = (text, action, cls = '', symbol = '') => `<button class="${cls}" data-action="${action}">${symbol ? icon(symbol) : ''}${text}</button>`;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),5000); }
function modal(content) { $('#dialog').innerHTML = `<button class="close" data-action="close" aria-label="Закрыть">×</button>${content}`; $('#dialog').showModal(); }
function shell(content) {
  $('#app').innerHTML = `<aside><a class="brand" href="/cabinet/">${icon('shield')}<span>hutep<span class="brand-vpn">VPN</span></span></a><nav aria-label="Основная навигация">${[['home','Главная'],['plans','Тарифы'],['devices','Устройства'],['profile','Профиль']].map(([id,label])=>`<button data-page="${id}" class="nav-item ${state.page===id?'selected':''}" ${state.page===id?'aria-current="page"':''}>${icon(id)}<span>${label}</span></button>`).join('')}</nav><div class="aside-note">Ваш личный<br>маршрут в интернет <span>↗</span></div></aside><main><header><span>Личный кабинет</span><button class="avatar" data-page="profile" aria-label="Открыть профиль">${esc(state.user?.name?.[0]?.toUpperCase() || 'H')}</button></header><div id="content">${content}</div><footer>HUTEP VPN <span>На связи. Где бы вы ни были.</span></footer></main>`;
}
function auth(error='') {
  state.user=null;
  shell(`<div class="auth-layout"><section class="welcome"><span class="eyebrow">ПРОСТО БЫТЬ НА СВЯЗИ</span><h1>Ваш интернет.<br><em>Ваши правила.</em></h1><div class="orbit">${icon('shield')}<span class="orbit-star">✳</span></div><p>Подписка, подключение и все ваши устройства — в одном месте.</p></section><section class="card auth-card"><span class="eyebrow">HUTEP ID</span><h2>${state.authMode==='login'?'С возвращением':'Создать аккаунт'}</h2><p>Откройте кабинет из меню Telegram-бота для входа в свой VPN-аккаунт. Или войдите по почте.</p>${error?`<div class="error" role="alert">${esc(error)}</div>`:''}<form id="auth-form">${state.authMode==='register'?'<label>Ваше имя<input name="name" autocomplete="name" maxlength="128" required></label>':''}<label>Электронная почта<input type="email" name="email" autocomplete="email" required maxlength="255" placeholder="you@example.com"></label><label>Пароль<input type="password" name="password" autocomplete="${state.authMode==='login'?'current-password':'new-password'}" minlength="${state.authMode==='login'?1:8}" maxlength="256" required placeholder="${state.authMode==='login'?'Ваш пароль':'Не менее 8 символов'}"></label><button class="primary" type="submit">${state.authMode==='login'?'Войти':'Зарегистрироваться'} ${icon('arrow')}</button></form>${button(state.authMode==='login'?'Создать аккаунт по почте':'Уже есть аккаунт? Войти','auth-toggle','text-button')}${tg?.initData?button('Повторить вход через Telegram','telegram','tonal'):''}<small>Вход защищён. Ключ подключения доступен только вам.</small></section></div>`);
}
function home() {
  const s=state.subscription;
  const active=s?.status==='ACTIVE';
  const days=s?Math.max(0,Math.ceil((new Date(s.expire_at)-Date.now())/86400000)):0;
  shell(`<div class="page-title"><div><span class="eyebrow">ВАШЕ ПРОСТРАНСТВО</span><h1>Привет, ${esc(state.user.name)} <span class="wave">✳</span></h1></div>${button('Обновить','refresh','icon-button','refresh')}</div><div class="dashboard"><section class="subscription-card"><div class="card-top"><span class="chip">${active?'● Подписка активна':s?'○ '+esc(({EXPIRED:'Срок истёк',DISABLED:'Отключена',LIMITED:'Лимит исчерпан'})[s.status]||s.status):'○ Нет подписки'}</span>${icon('shield')}</div><p class="eyebrow">${s?'ВАШ ТАРИФ':'НАЧНЁМ С ПОДКЛЮЧЕНИЯ'}</p><h2>${esc(s?.plan_name || 'Интернет без границ')}</h2><p>${s?`До ${date(s.expire_at)}${s.is_trial?' · Пробный период':''}`:'Выберите подходящий тариф и добавьте первое устройство.'}</p><div class="subscription-bottom"><span class="days">${s?days:'↗'}<small>${s?'дней осталось':'всё под рукой'}</small></span>${button(s?'Продлить подписку':'Выбрать тариф','plans','dark','plus')}</div></section><section class="connect-card"><div class="flower">${icon('copy')}</div><h2>Ваш ключ<br>к свободе</h2><p>Скопируйте ссылку подписки и добавьте её в VPN-приложение.</p><button class="primary" data-action="copy-key" ${!s?.url?'disabled':''}>${icon('copy')} Скопировать ключ</button>${s?.url?button('Открыть подключение ↗','connect','text-button'):''}</section><section class="stat-card"><span class="stat-icon">${icon('devices')}</span><p>Устройства</p><strong>${s?(s.device_limit===0?'Без лимита':`До ${s.device_limit}`):'—'}</strong><button class="text-button" data-page="devices">Управлять ${icon('arrow')}</button></section><section class="stat-card lavender"><span class="stat-icon">↗</span><p>Использовано трафика</p><strong>${s?.used_traffic_bytes!=null?(s.used_traffic_bytes/1073741824).toLocaleString('ru-RU',{maximumFractionDigits:1})+' ГБ':'—'}</strong><small>${s?(s.traffic_limit===0?'Без ограничения':`из ${s.traffic_limit} ГБ`):'Данные появятся после подключения'}</small></section></div><div class="section-title"><h2>Больше возможностей</h2></div><div class="quick-grid">${[['gift','Есть промокод?','Активировать бонус','promo'],['plus','Попробовать VPN','Доступность проверим для вас','trial'],['profile','Пригласить друзей','Ваша реферальная программа','referral']].map(([i,t,d,a])=>`<button class="quick" data-action="${a}"><span>${icon(i)}</span><div><strong>${t}</strong><small>${d}</small></div>${icon('arrow')}</button>`).join('')}</div>`);
}
async function loadHome() { state.subscription=await api('/subscription/current'); home(); }
async function navigate(page) {
  if (!state.user) return toast('Сначала войдите в аккаунт.');
  state.page=page; shell('<div class="loading" role="status">Загружаем ваш кабинет…</div>');
  try {
    if(page==='home') return await loadHome();
    if(page==='profile') return profile();
    if(page==='plans') {
      const offers=await api('/subscription/offers'); state.offers=offers;
      shell(`<div class="page-title"><div><span class="eyebrow">БОЛЬШЕ СВОБОДЫ</span><h1>Ваш следующий маршрут</h1><p>Выберите тариф и удобный срок подписки.</p></div></div>${!state.user.is_email_verified?'<div class="notice">Для оплаты подтвердите почту в разделе «Профиль».</div>':''}<div class="plans-grid">${offers.plans.map((p,index)=>`<section class="card plan"><span class="chip">${p.recommended_purchase_type==='RENEW'?'Ваш текущий тариф':'VPN-подписка'}</span><h2>${esc(p.name)}</h2><p>${esc(p.description || 'Подключайтесь на любимых устройствах')}</p><p>${p.traffic_limit||'∞'} ГБ · ${p.device_limit||'∞'} устройств</p><form class="purchase-form" data-index="${index}"><label>Срок и способ оплаты<select name="offer" required>${p.durations.flatMap((d,di)=>d.prices.map((price,pi)=>`<option value="${di}:${pi}">${d.days===0?'Бессрочно':d.days+' дней'} · ${esc(price.final_amount)} ${esc(price.currency_symbol)} · ${esc(price.gateway_type)}</option>`)).join('')}</select></label><button class="primary" ${!p.durations.some(d=>d.prices.length)||!state.user.is_email_verified?'disabled':''}>${p.recommended_purchase_type==='RENEW'?'Продлить':'Выбрать тариф'}</button></form></section>`).join('') || '<section class="card"><h2>Пока нет доступных тарифов</h2><p>Попробуйте вернуться позже.</p></section>'}</div>${!offers.gateways.length?'<div class="notice">Оплата на сайте пока недоступна. Доступные способы оплаты можно проверить в боте.</div>':''}`);
    }
    if(page==='devices') {
      const devices=state.subscription?await api('/subscription/devices'):{devices:[],current_count:0,max_count:0};
      shell(`<div class="page-title"><div><span class="eyebrow">ВСЕГДА РЯДОМ</span><h1>Ваши устройства</h1><p>${devices.current_count} подключено${devices.max_count?' из '+devices.max_count:''}</p></div></div><section class="card device-list">${devices.devices.map(d=>`<div class="device">${icon('devices')}<div><strong>${esc(d.device_model || d.platform || 'Устройство')}</strong><p>${esc([d.platform,d.os_version].filter(Boolean).join(' · '))}</p></div><button class="tonal" data-delete="${esc(d.hwid)}">Отключить</button></div>`).join('')||'<h2>Здесь появятся ваши устройства</h2><p>Скопируйте ключ на главной странице и добавьте его в VPN-приложение.</p>'}</section>${state.subscription?`<section class="card safety"><h2>Управление подключением</h2><p>Новый ключ заменит старый. После перевыпуска обновите подписку на своих устройствах.</p>${button('Перевыпустить ключ','reissue','tonal')}${devices.devices.length?button('Отключить все устройства','delete-all','text-button'):''}</section>`:''}`);
    }
  } catch(e) { handleError(e); if(state.user) shell(`<section class="card"><h2>Не получилось загрузить данные</h2><p role="alert">${esc(e.message)}</p>${button('Повторить','retry','primary')}</section>`); }
}
function profile() { const u=state.user; shell(`<div class="page-title"><div><span class="eyebrow">ВАШ АККАУНТ</span><h1>Настройки профиля</h1></div></div><div class="profile-grid"><section class="card"><div class="profile-avatar">${esc(u.name[0])}</div><h2>${esc(u.name)}</h2><p>${u.username?'@'+esc(u.username):'Личный аккаунт'}</p><p>${u.telegram_id?'Telegram подключён':'Вход по электронной почте'}</p>${button('Выйти из аккаунта','logout','tonal','logout')}</section><section class="card"><h2>Электронная почта</h2><p>${esc(u.email || 'Добавьте почту для оплаты подписки')}</p><span class="chip">${u.is_email_verified?'✓ Подтверждена':'Ожидает подтверждения'}</span><form id="email-form"><label>Почта для подтверждения<input name="email" type="email" value="${esc(u.pending_email || u.email || '')}" required></label><button class="primary">Получить код</button></form><form id="verify-form"><label>Код из письма<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="000000" required autocomplete="one-time-code"></label><button class="tonal">Подтвердить почту</button></form></section></div>`); }
function handleError(e) { if(e.status===401) auth(e.message); toast(e.message); }
async function run(task) { if(state.busy)return; state.busy=true; document.body.classList.add('busy'); try { await task(); } catch(e){handleError(e);} finally {state.busy=false;document.body.classList.remove('busy');} }
async function start() {
  shell('<div class="loading" role="status">Подключаем ваш кабинет…</div>');
  try {
    if(tg?.initData) await api('/auth/telegram/webapp',{method:'POST',body:{init_data:tg.initData}});
    else { try { state.user=await api('/auth/me'); } catch(e) { if(e.status!==401) throw e; await api('/auth/refresh',{method:'POST'}); } }
    state.user=await api('/auth/me'); await navigate('home');
  } catch(e) { auth(e.status===401?'':e.message); }
}
async function payment(result) {
  $('#dialog').close();
  if(result.is_free || result.status==='COMPLETED') { toast('Подписка обновлена'); return navigate('home'); }
  const url=safeUrl(result.payment_url);
  modal(`<h2>Счёт готов</h2><p>К оплате: ${esc(result.final_amount)} ${esc(result.currency)}</p>${url?`<a class="button primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Перейти к оплате ↗</a>`:'<p>Ссылка на оплату отсутствует. Проверьте счёт в боте.</p>'}<p>После оплаты вернитесь и обновите подписку.</p>${button('Проверить подписку','payment-check','tonal')}`);
}
document.addEventListener('click', (event)=> {
  const b=event.target.closest('button'); if(!b)return;
  if(b.dataset.page)return run(()=>navigate(b.dataset.page));
  if(b.dataset.delete) return modal(`<h2>Отключить устройство?</h2><p>Его можно будет подключить снова.</p><button class="primary" data-confirm-delete="${esc(b.dataset.delete)}">Отключить</button>`);
  if(b.dataset.confirmDelete) return run(async()=>{const r=await api('/subscription/devices/'+encodeURIComponent(b.dataset.confirmDelete),{method:'DELETE'});if(!r.deleted)throw new Error('Устройство не отключено. Обновите список.');$('#dialog').close();await navigate('devices');toast('Устройство отключено');});
  const a=b.dataset.action;
  if(a==='close')return $('#dialog').close();
  if(a==='auth-toggle'){state.authMode=state.authMode==='login'?'register':'login';return auth();}
  if(a==='promo')return modal('<h2>Немного приятного</h2><p>Введите промокод, чтобы получить бонус.</p><form id="promo-form"><label>Промокод<input name="code" required maxlength="128"></label><button class="primary">Активировать</button></form>');
  if(a==='reissue'||a==='delete-all')return modal(`<h2>${a==='reissue'?'Заменить ключ?':'Отключить все устройства?'}</h2><p>${a==='reissue'?'Старая ссылка перестанет работать. Скопируйте новый ключ после замены.':'Доступ потребуется настроить заново на каждом устройстве.'}</p>${button('Подтвердить',a+'-confirm','primary')}`);
  run(async()=>{
    if(a==='telegram')return start();
    if(a==='plans')return navigate('plans');
    if(a==='retry')return navigate(state.page);
    if(a==='refresh')return navigate('home');
    if(a==='payment-check'){$('#dialog').close();return navigate('home');}
    if(a==='copy-key'){await navigator.clipboard.writeText(state.subscription.url);toast('Ключ скопирован');}
    if(a==='connect'){const url=safeUrl(state.subscription.url);if(url)window.open(url,'_blank','noopener,noreferrer');}
    if(a==='reissue-confirm'||a==='delete-all-confirm'){await api(a==='reissue-confirm'?'/subscription/reissue':'/subscription/devices',{method:a==='reissue-confirm'?'POST':'DELETE'});$('#dialog').close();state.subscription=await api('/subscription/current');await navigate('devices');toast('Готово');}
    if(a==='logout'){await api('/auth/logout',{method:'POST'});state.subscription=null;auth();}
    if(a==='trial'){const r=await api('/subscription/trial',{method:'POST'});if(r.activated){toast('Пробная подписка активирована');await navigate('home');}else{state.trial=r;modal(`<h2>Пробный период · ${r.duration_days} дней</h2><form id="trial-form"><label>Способ оплаты<select name="gateway">${r.gateways.map(p=>`<option value="${esc(p.gateway_type)}">${esc(p.final_amount)} ${esc(p.currency_symbol)} · ${esc(p.gateway_type)}</option>`).join('')}</select></label><button class="primary" ${!r.gateways.length?'disabled':''}>Создать счёт</button></form>`);}}
    if(a==='referral'){const r=await api('/referral/program');modal(`<h2>Вместе интереснее</h2><p>Приглашено: ${r.invited_count} · С оплатой: ${r.invited_with_payment_count}</p><label>Ваш реферальный код<input readonly value="${esc(r.referral_code)}"></label><p>Поделитесь кодом с другом при регистрации.</p>`);}
  });
});
document.addEventListener('submit',(event)=>{ event.preventDefault(); const f=event.target; const data=Object.fromEntries(new FormData(f)); run(async()=>{
  if(f.id==='auth-form'){await api('/auth/'+state.authMode,{method:'POST',body:data});state.user=await api('/auth/me');await navigate('home');}
  if(f.id==='email-form'){const r=await api('/auth/email/request-verification',{method:'POST',body:data});toast('Код отправлен на '+r.target_email);}
  if(f.id==='verify-form'){await api('/auth/email/confirm',{method:'POST',body:data});state.user=await api('/auth/me');profile();toast('Почта подтверждена');}
  if(f.id==='promo-form'){await api('/subscription/promocode',{method:'POST',body:data});$('#dialog').close();await navigate('home');toast('Промокод активирован');}
  if(f.classList.contains('purchase-form')){const p=state.offers.plans[Number(f.dataset.index)];const [di,pi]=data.offer.split(':').map(Number);const d=p.durations[di];const price=d.prices[pi];state.purchase={p,d,price};modal(`<h2>${p.recommended_purchase_type==='RENEW'?'Продление':'Оформление'} подписки</h2><p>${esc(p.name)} · ${d.days||'∞'} дней</p><h3>${esc(price.final_amount)} ${esc(price.currency_symbol)}</h3><p>Будет создан счёт. Оплату вы подтвердите на странице платёжного сервиса.</p><form id="confirm-purchase"><button class="primary">Создать счёт</button></form>`);}
  if(f.id==='confirm-purchase'){const {p,d,price}=state.purchase;const renew=p.recommended_purchase_type==='RENEW';await payment(await api('/subscription/'+(renew?'extend':'purchase'),{method:'POST',body:{...(renew?{}:{plan_code:p.public_code}),duration_days:d.days,gateway_type:price.gateway_type}}));}
  if(f.id==='trial-form')await payment(await api('/subscription/trial/purchase',{method:'POST',body:{gateway_type:data.gateway}}));
});});
start();
