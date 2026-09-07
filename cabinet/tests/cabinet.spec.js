import { test, expect } from '@playwright/test';

// Fixtures are scoped to the test browser; the running application has no demo login.
const user={name:'Алексей',email:'test@example.com',is_email_verified:true,username:'alex',telegram_id:123};
const subscription={status:'ACTIVE',plan_name:'Свободный',expire_at:'2026-12-10T00:00:00Z',device_limit:5,traffic_limit:0,used_traffic_bytes:12884901888,url:'https://example.com/sub/test',plan_duration_days:30};
test('authenticated cabinet: renewal, devices, profile and responsive layout',async({page})=>{
  let renewal;
  await page.route('**/api/v1/public/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    let data={};
    if(path.endsWith('/auth/me'))data=user;
    if(path.endsWith('/subscription/current'))data=subscription;
    if(path.endsWith('/subscription/devices'))data={devices:[{hwid:'test-device',platform:'iOS',device_model:'iPhone'}],current_count:1,max_count:5};
    if(path.endsWith('/subscription/offers'))data={gateways:[{gateway_type:'YOOKASSA'}],plans:[{name:'Свободный',public_code:'free-plan',device_limit:5,traffic_limit:0,recommended_purchase_type:'RENEW',durations:[{days:30,prices:[{gateway_type:'YOOKASSA',final_amount:'250',currency_symbol:'₽'}]}]}]};
    if(path.endsWith('/subscription/extend')){renewal=route.request().postDataJSON();data={payment_url:'https://example.com/pay',final_amount:'250',currency:'₽',status:'PENDING'};}
    await route.fulfill({json:data});
  });
  await page.goto('http://127.0.0.1:5173/cabinet/');
  await expect(page.getByRole('heading',{name:'Привет, Алексей'})).toBeVisible();
  await page.screenshot({path:'test-results/desktop.png',fullPage:true,animations:'disabled'});
  await page.getByRole('button',{name:'Продлить подписку'}).click();
  await page.getByRole('button',{name:'Продлить',exact:true}).click();
  expect(renewal).toBeUndefined();
  await page.getByRole('button',{name:'Создать счёт'}).click();
  await expect(page.getByRole('link',{name:'Перейти к оплате'})).toHaveAttribute('href','https://example.com/pay');
  expect(renewal).toEqual({duration_days:30,gateway_type:'YOOKASSA'});
  await page.getByRole('button',{name:'Закрыть',exact:true}).click();
  await page.getByRole('button',{name:'Устройства',exact:true}).click();
  await expect(page.getByText('iPhone', {exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Отключить',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Отключить устройство?'})).toBeVisible();
  await page.getByRole('button',{name:'Закрыть',exact:true}).click();
  await page.getByRole('button',{name:'Профиль',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Настройки профиля'})).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Главная',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Привет, Алексей'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/mobile.png',fullPage:true,animations:'disabled'});
});
test('server outage shows real error with usable sign-in form',async({page})=>{
  await page.route('**/api/v1/public/**',route=>route.fulfill({status:503,json:{}}));
  await page.goto('http://127.0.0.1:5173/cabinet/');
  await expect(page.getByRole('alert')).toContainText('Сервер недоступен');
  await expect(page.getByRole('button',{name:'Войти',exact:true})).toBeVisible();
  await expect(page.getByText('Подписка активна')).toHaveCount(0);
});
