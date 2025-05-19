# 라라벨 Cashier, Stripe (Laravel Cashier (Stripe))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
- [설정](#configuration)
    - [청구 모델(Billable Model)](#billable-model)
    - [API 키](#api-keys)
    - [통화 설정](#currency-configuration)
    - [세금 설정](#tax-configuration)
    - [로깅](#logging)
    - [사용자 지정 모델 사용](#using-custom-models)
- [빠른 시작](#quickstart)
    - [상품 판매하기](#quickstart-selling-products)
    - [구독 판매하기](#quickstart-selling-subscriptions)
- [고객](#customers)
    - [고객 조회하기](#retrieving-customers)
    - [고객 생성하기](#creating-customers)
    - [고객 정보 업데이트하기](#updating-customers)
    - [잔고 관리(Balances)](#balances)
    - [세금 ID](#tax-ids)
    - [Stripe와 고객 데이터 동기화](#syncing-customer-data-with-stripe)
    - [결제 포털(Billing Portal)](#billing-portal)
- [결제 수단](#payment-methods)
    - [결제 수단 저장](#storing-payment-methods)
    - [결제 수단 조회](#retrieving-payment-methods)
    - [결제 수단 존재 여부 확인](#payment-method-presence)
    - [기본 결제 수단 업데이트](#updating-the-default-payment-method)
    - [결제 수단 추가](#adding-payment-methods)
    - [결제 수단 삭제](#deleting-payment-methods)
- [구독](#subscriptions)
    - [구독 생성하기](#creating-subscriptions)
    - [구독 상태 확인](#checking-subscription-status)
    - [가격 변경하기](#changing-prices)
    - [구독 수량(Quantity)](#subscription-quantity)
    - [여러 상품이 포함된 구독](#subscriptions-with-multiple-products)
    - [복수 구독](#multiple-subscriptions)
    - [측정형(Metered) 청구](#metered-billing)
    - [구독 세금](#subscription-taxes)
    - [구독 기준일(anchor date)](#subscription-anchor-date)
    - [구독 취소](#cancelling-subscriptions)
    - [구독 재개](#resuming-subscriptions)
- [구독 체험(Trial)](#subscription-trials)
    - [카드 정보 선입력으로 체험 시작](#with-payment-method-up-front)
    - [카드 정보 없이 체험 시작](#without-payment-method-up-front)
    - [체험 기간 연장](#extending-trials)
- [Stripe Webhook 처리](#handling-stripe-webhooks)
    - [Webhook 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [Webhook 서명 검증](#verifying-webhook-signatures)
- [단일 결제(One-time/Single Charges)](#single-charges)
    - [간단 결제](#simple-charge)
    - [인보이스와 함께 결제](#charge-with-invoice)
    - [Payment Intent 생성](#creating-payment-intents)
    - [결제 환불 처리](#refunding-charges)
- [체크아웃(Checkout)](#checkout)
    - [상품 체크아웃](#product-checkouts)
    - [단일 결제 체크아웃](#single-charge-checkouts)
    - [구독 체크아웃](#subscription-checkouts)
    - [세금 ID 수집](#collecting-tax-ids)
    - [비회원 체크아웃(Guest Checkout)](#guest-checkouts)
- [인보이스](#invoices)
    - [인보이스 조회](#retrieving-invoices)
    - [예정된 인보이스](#upcoming-invoices)
    - [구독 인보이스 미리보기](#previewing-subscription-invoices)
    - [인보이스 PDF 생성](#generating-invoice-pdfs)
- [결제 실패 처리](#handling-failed-payments)
    - [결제 승인 확인](#confirming-payments)
- [강화된 고객 인증(SCA)](#strong-customer-authentication)
    - [추가 확인이 필요한 결제](#payments-requiring-additional-confirmation)
    - [오프 세션 결제 알림](#off-session-payment-notifications)
- [Stripe SDK](#stripe-sdk)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe)는 [Stripe](https://stripe.com)의 구독 결제 서비스를 쉽고 유연하게 사용할 수 있는 인터페이스를 제공합니다. Cashier를 사용하면 반복적이고 번거로운 구독 청구 코드의 대부분을 직접 작성할 필요가 없습니다. 기본적인 구독 관리뿐만 아니라, 쿠폰 적용, 구독 상품 변경, 구독 수량("quantity") 지정, 구독 취소 유예 기간 관리, 인보이스 PDF 생성 등 여러 추가 기능도 제공합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier를 새로운 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.md)를 주의 깊게 확인하시기 바랍니다.

> [!NOTE]
> 하위 호환성 파괴(breaking changes)를 방지하기 위해, Cashier는 Stripe API 버전을 고정하여 사용합니다. Cashier 15는 Stripe API 버전 `2023-10-16`을 사용합니다. Stripe API 버전은 Stripe의 새로운 기능과 개선사항을 도입할 필요가 있을 때 마이너 릴리즈에서 업데이트됩니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용하여 Stripe용 Cashier 패키지를 설치합니다.

```shell
composer require laravel/cashier
```

패키지를 설치한 후, `vendor:publish` 아티즌 명령어를 이용해 Cashier의 마이그레이션 파일을 게시합니다.

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

그 다음 데이터베이스 마이그레이션을 실행합니다.

```shell
php artisan migrate
```

Cashier의 마이그레이션은 `users` 테이블에 여러 컬럼을 추가합니다. 또한 모든 고객의 구독 정보를 저장할 `subscriptions` 테이블, 그리고 여러 가격이 포함된 구독을 위한 `subscription_items` 테이블도 생성됩니다.

필요하다면, 다음의 `vendor:publish` 아티즌 명령어를 사용하여 Cashier의 설정 파일(config)도 게시할 수 있습니다.

```shell
php artisan vendor:publish --tag="cashier-config"
```

마지막으로, Cashier가 Stripe의 모든 이벤트를 정상적으로 처리할 수 있도록 반드시 [Cashier의 Webhook 설정](#handling-stripe-webhooks)을 완료해 주세요.

> [!NOTE]
> Stripe에서는 Stripe 식별자를 저장하는 모든 컬럼이 대소문자 구분(case-sensitive)으로 설정될 것을 권장합니다. 따라서 MySQL을 사용하는 경우, `stripe_id` 컬럼의 collation이 `utf8_bin`으로 지정되어 있는지 꼭 확인해야 합니다. 자세한 내용은 [Stripe 문서](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible)를 참고하세요.

<a name="configuration"></a>
## 설정

<a name="billable-model"></a>
### 청구 모델(Billable Model)

Cashier를 사용하기 전, 청구가능 모델에 `Billable` 트레이트를 추가해야 합니다. 일반적으로는 `App\Models\User` 모델이 사용됩니다. 이 트레이트는 구독 생성, 쿠폰 적용, 결제 수단 정보 갱신 등 여러 청구 관련 작업을 손쉽게 수행할 수 있는 다양한 메서드를 제공합니다.

```
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Cashier는 기본적으로 `App\Models\User` 클래스를 청구 모델로 가정합니다. 만약 다른 모델을 사용하고자 한다면, `useCustomerModel` 메서드를 통해 다른 모델을 지정할 수 있습니다. 이 메서드는 보통 `AppServiceProvider` 클래스의 `boot` 메서드 안에서 호출합니다.

```
use App\Models\Cashier\User;
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useCustomerModel(User::class);
}
```

> [!NOTE]
> 라라벨에서 제공하는 기본 `App\Models\User` 모델이 아닌 다른 모델을 사용할 경우, 제공된 [Cashier 마이그레이션 파일](#installation)을 게시(publish) 및 수정하여 자신의 모델 테이블명과 일치하도록 변경해야 합니다.

<a name="api-keys"></a>
### API 키

다음으로, Stripe API 키를 애플리케이션의 `.env` 파일에 설정해야 합니다. Stripe API 키는 Stripe 관리자 페이지에서 확인할 수 있습니다.

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> [!NOTE]
> `.env` 파일에 반드시 `STRIPE_WEBHOOK_SECRET` 환경 변수가 정의되어야 합니다. 이 변수는 Stripe에서 발송되는 Webhook의 진위(실제 Stripe에서 보내졌는지)를 확인하는 데 사용됩니다.

<a name="currency-configuration"></a>
### 통화 설정

Cashier의 기본 통화는 미국 달러(USD)입니다. 기본 통화를 변경하려면, 애플리케이션의 `.env` 파일에 `CASHIER_CURRENCY` 환경 변수를 지정하면 됩니다.

```ini
CASHIER_CURRENCY=eur
```

Cashier의 통화 설정 외에도, 인보이스 금액 표시 등에 사용할 지역(locale) 정보를 `CASHIER_CURRENCY_LOCALE` 환경 변수로 지정할 수 있습니다. Cashier 내부에서는 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 활용하여 통화 표시 형식을 맞춥니다.

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!NOTE]
> `en`(영어) 외의 다른 언어 locale을 사용하려면, PHP의 `ext-intl` 확장 기능이 서버에 설치되어 있고 정상 동작하도록 구성되어 있어야 합니다.

<a name="tax-configuration"></a>
### 세금 설정

[Stripe Tax](https://stripe.com/tax) 기능을 이용하면 Stripe에서 생성된 모든 인보이스에 대해 세금을 자동으로 계산할 수 있습니다. 자동 세금 계산 기능을 활성화하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 안에서 `calculateTaxes` 메서드를 호출하세요.

```
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::calculateTaxes();
}
```

세금 계산 기능을 활성화하면, 새로 생성되는 모든 구독 및 단일 청구 인보이스에 대해 자동으로 세금이 계산됩니다.

이 기능이 정상 작동하려면, 고객의 이름, 주소, 세금 ID 등 결제 정보가 Stripe에 동기화되어야 합니다. Cashier가 제공하는 [고객 데이터 동기화](#syncing-customer-data-with-stripe) 및 [Tax ID](#tax-ids) 관련 메서드를 활용하면 됩니다.

> [!NOTE]
> [단일 결제(Single Charges)](#single-charges)나 [단일 결제 체크아웃](#single-charge-checkouts)에는 세금이 자동 계산되지 않습니다.

<a name="logging"></a>
### 로깅

Cashier는 Stripe와의 통신 중 발생한 치명적(fatal) 오류를 로깅할 채널을 환경 변수로 지정할 수 있게 해줍니다. 애플리케이션의 `.env` 파일에서 `CASHIER_LOGGER` 환경 변수를 정의하세요.

```ini
CASHIER_LOGGER=stack
```

Stripe API 호출로 인해 발생한 예외(Exception)는 애플리케이션의 기본 로그 채널(default log channel)을 통해 기록됩니다.

<a name="using-custom-models"></a>
### 사용자 지정 모델 사용

Cashier 내부적으로 사용하는 모델을 확장하여 커스텀 모델을 직접 정의할 수도 있습니다. 자신의 모델을 정의하고 Cashier의 해당 모델을 확장하면 됩니다.

```
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 후, `Laravel\Cashier\Cashier` 클래스의 메서드를 이용해 Cashier에 커스텀 모델을 알려줄 수 있습니다. 보통은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 등록합니다.

```
use App\Models\Cashier\Subscription;
use App\Models\Cashier\SubscriptionItem;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useSubscriptionItemModel(SubscriptionItem::class);
}
```

<a name="quickstart"></a>
## 빠른 시작

<a name="quickstart-selling-products"></a>
### 상품 판매하기

> [!NOTE]
> Stripe Checkout을 사용하기 전에 Stripe 대시보드에서 고정 가격이 지정된 Product를 먼저 등록해야 합니다. 또한, 반드시 [Cashier의 Webhook 처리](#handling-stripe-webhooks)도 미리 설정해야 합니다.

애플리케이션에서 상품 및 구독 청구 기능을 제공하는 일은 생각보다 어렵게 느껴질 수 있습니다. 그러나 Cashier와 [Stripe Checkout](https://stripe.com/payments/checkout)을 이용하면 쉽고 견고한 최신 결제 연동을 빠르게 구축할 수 있습니다.

반복 결제가 아닌 단일 상품(일회성 상품) 결제의 경우, Cashier의 `checkout` 메서드를 활용하여 고객을 Stripe Checkout으로 리디렉션 한 뒤, 결제 정보를 입력받아 구매를 완료시킬 수 있습니다. 결제가 완료되면 Stripe Checkout에서 구매 성공 페이지로, 결제가 취소되면 취소 페이지로 고객을 리디렉션하게 됩니다.

```
use Illuminate\Http\Request;

Route::get('/checkout', function (Request $request) {
    $stripePriceId = 'price_deluxe_album';

    $quantity = 1;

    return $request->user()->checkout([$stripePriceId => $quantity], [
        'success_url' => route('checkout-success'),
        'cancel_url' => route('checkout-cancel'),
    ]);
})->name('checkout');

Route::view('checkout.success')->name('checkout-success');
Route::view('checkout.cancel')->name('checkout-cancel');
```

위 예시 코드에서 볼 수 있듯, Cashier에서 제공하는 `checkout` 메서드를 사용하면 고객을 Stripe Checkout으로 리디렉션하여 상품의 "price 식별자"로 결제할 수 있습니다. Stripe에서 "prices"는 [특정 상품에 대한 가격 정의](https://stripe.com/docs/products-prices/how-products-and-prices-work)를 의미합니다.

필요하다면, `checkout` 메서드는 Stripe에 고객을 자동으로 생성하여, 해당 Stripe 고객 레코드를 애플리케이션의 사용자와 연동해줍니다. 체크아웃 세션이 완료되면, 고객은 성공 혹은 취소에 따라 설정한 전용 페이지로 리디렉션되며, 해당 페이지에서 안내 메시지를 보여줄 수 있습니다.

<a name="providing-meta-data-to-stripe-checkout"></a>
#### Stripe Checkout으로 메타 데이터 보내기

상품을 판매할 때는 주문 완료 및 구매 내역을 애플리케이션의 `Cart`, `Order` 모델 등으로 직접 관리하는 경우가 많습니다. 결제 완료 후 Stripe Checkout에서 다시 애플리케이션으로 돌아올 때, 특정 주문과 연동하려면, 미리 주문 ID와 같은 메타데이터를 Stripe Checkout에 전달해야 할 수 있습니다.

이럴 때는 `checkout` 메서드에 `metadata` 배열을 넘겨주면 됩니다. 예를 들어, 사용자가 결제 과정을 시작하면 `Order` 인스턴스(진행 중)를 생성하고, 그 정보를 Checkout으로 전달할 수 있습니다. (아래 예시의 `Cart`, `Order` 모델은 단순 참고이며, Cashier에서 기본 제공하지 않으니 필요에 따라 직접 구현해야 합니다.)

```
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/cart/{cart}/checkout', function (Request $request, Cart $cart) {
    $order = Order::create([
        'cart_id' => $cart->id,
        'price_ids' => $cart->price_ids,
        'status' => 'incomplete',
    ]);

    return $request->user()->checkout($order->price_ids, [
        'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout-cancel'),
        'metadata' => ['order_id' => $order->id],
    ]);
})->name('checkout');
```

위 코드에서는 결제 과정이 시작될 때, 장바구니/주문의 모든 Stripe price 식별자를 `checkout` 메서드에 전달합니다. 가격과 주문 항목들을 장바구니/주문에 연동해서 관리하는 것은 애플리케이션의 몫입니다. 또한, Stripe Checkout 세션에 `metadata` 배열로 주문 ID도 함께 넘기는 것을 볼 수 있습니다. 마지막으로, Checkout 성공 URL에 `CHECKOUT_SESSION_ID` 템플릿 변수가 추가돼 있습니다. Stripe가 결제 완료 후 고객을 리디렉션 할 때 이 템플릿 변수에는 실제 체크아웃 세션 ID 값이 자동으로 대입됩니다.

이제, 결제 완료 시 Stripe Checkout에서 리디렉션되는 성공 페이지 라우트를 구현해봅니다. 해당 라우트에서 우리는 Stripe Checkout 세션 ID 및 세션 객체를 조회해, 전달한 메타데이터와 주문 정보를 확인하고, 필요에 따라 주문 상태를 변경할 수 있습니다.

```
use App\Models\Order;
use Illuminate\Http\Request;
use Laravel\Cashier\Cashier;

Route::get('/checkout/success', function (Request $request) {
    $sessionId = $request->get('session_id');

    if ($sessionId === null) {
        return;
    }

    $session = Cashier::stripe()->checkout->sessions->retrieve($sessionId);

    if ($session->payment_status !== 'paid') {
        return;
    }

    $orderId = $session['metadata']['order_id'] ?? null;

    $order = Order::findOrFail($orderId);

    $order->update(['status' => 'completed']);

    return view('checkout-success', ['order' => $order]);
})->name('checkout-success');
```

Checkout 세션 객체에 어떤 데이터가 포함되어 있는지 더 자세히 알고 싶다면, Stripe 공식 문서 [Checkout 세션 객체](https://stripe.com/docs/api/checkout/sessions/object)를 참고하세요.

<a name="quickstart-selling-subscriptions"></a>
### 구독 판매하기

> [!NOTE]
> Stripe Checkout을 사용하기 전에 Stripe 대시보드에서 고정 가격이 지정된 Product를 먼저 등록해야 합니다. 또한, 반드시 [Cashier의 Webhook 처리](#handling-stripe-webhooks)도 미리 설정해야 합니다.

애플리케이션에서 상품과 구독 기능을 제공하는 일은 처음엔 어려울 수도 있지만, Cashier와 [Stripe Checkout](https://stripe.com/payments/checkout)을 활용하면 견고하면서도 현대적인 결제 시스템을 손쉽게 구현할 수 있습니다.

Cashier와 Stripe Checkout을 사용해 구독을 판매하는 방법을 살펴보겠습니다. 예를 들어, 기본 월간(`price_basic_monthly`), 연간(`price_basic_yearly`) 요금제 구성이 있다고 가정하겠습니다. 이 두 가격은 Stripe 대시보드 내 "Basic" 상품(`pro_basic`) 아래 지정할 수 있습니다. 필요하다면 "Expert" 요금제도 `pro_expert`로 제공할 수 있습니다.

먼저, 사용자가 어떻게 구독을 시작하는지 과정부터 알아봅니다. 보통 사용자는 애플리케이션의 요금제 페이지에서 Basic 요금제 구독 버튼을 클릭하겠죠. 이 버튼 혹은 링크는 사용자를 선택한 요금제의 Stripe Checkout 세션을 생성하는 라라벨 라우트로 연결해주어야 합니다.

```
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_basic_monthly')
        ->trialDays(5)
        ->allowPromotionCodes()
        ->checkout([
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

위 예시에서 알 수 있듯, 고객을 Stripe Checkout 세션으로 리디렉션해 Basic 요금제 구독을 신청할 수 있습니다. 결제 성공 후 또는 취소 시에는 `checkout` 메서드에 지정한 URL로 고객이 돌아오게 됩니다. (일부 결제 방식은 실제 구독이 활성화될 때까지 몇 초가 필요할 수 있으니) 실제 구독이 시작됐는지 확인하려면 [Cashier의 Webhook 처리](#handling-stripe-webhooks)도 꼭 설정해야 합니다.

이제 사용자가 구독을 시작할 수 있게 됐으니, 애플리케이션 내 일부 페이지는 구독한 사용자만 접근할 수 있도록 제한해야 할 수도 있습니다. Cashier의 `Billable` 트레이트가 제공하는 `subscribed` 메서드를 이용해 사용자의 구독 상태를 쉽게 확인할 수 있습니다.

```blade
@if ($user->subscribed())
    <p>구독 중입니다.</p>
@endif
```

특정 상품이나 가격에 구독되어 있는지도 아래와 같이 간단히 확인할 수 있습니다.

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>Basic 상품을 구독 중입니다.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>월간 Basic 요금제를 구독 중입니다.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### 구독 여부를 판별하는 미들웨어 만들기

편의상, 요청이 구독 중인 사용자로부터 온 것인지를 쉽게 판별할 수 있는 [미들웨어](/docs/10.x/middleware)를 직접 만들어 사용할 수도 있습니다. 미들웨어를 정의한 후 필요한 라우트에 적용하면, 구독하지 않은 사용자가 해당 경로에 접근하지 못하도록 차단할 수 있습니다.

```
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Subscribed
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->subscribed()) {
            // 사용자를 결제 페이지로 리디렉션하고 구독을 유도합니다...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

미들웨어를 만들었으면, 아래처럼 라우트에 지정할 수 있습니다.

```
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### 고객이 자신의 요금제(구독)를 직접 관리할 수 있게 하기

물론 고객이 구독 중인 플랜을 다른 상품이나 상위/하위 등급으로 변경하고 싶을 수도 있습니다. 이 때 가장 쉬운 방법은, Stripe에서 제공하는 [Customer Billing Portal](https://stripe.com/docs/no-code/customer-portal)로 고객을 안내하는 것입니다. 고객 포털은 구독 변경, 결제 수단 갱신, 인보이스 다운로드 등 여러 기능을 위한 Stripe의 공식 UI입니다.

먼저, 애플리케이션 내에 결제/구독 관리로 이동할 수 있는 버튼이나 링크를 만들어 해당 라우트로 연결시킵니다.

```blade
<a href="{{ route('billing') }}">
    결제 관리
</a>
```

다음으로, Stripe Customer Billing Portal 세션을 생성하고 해당 포털로 사용자를 리디렉션하는 라우트를 정의합니다. `redirectToBillingPortal` 메서드는 포털을 나간 후 돌아올 URL을 인자로 받습니다.

```
use Illuminate\Http\Request;

Route::get('/billing', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('dashboard'));
})->middleware(['auth'])->name('billing');
```

> [!NOTE]
> Cashier의 Webhook 처리가 정상적으로 설정되어 있으면, Stripe의 Customer Billing Portal에서 고객이 직접 구독을 취소/변경하더라도 Cashier가 Stripe로부터 Webhook을 수신해, 애플리케이션 DB 내 Cashier 관련 데이터들과 동기화시켜줍니다. 예를 들어 사용자가 Stripe 포털에서 스스로 구독을 취소하면, Cashier가 Webhook을 받아 해당 구독 상태를 DB에서 "취소됨(cancelled)"으로 변경합니다.

<a name="customers"></a>
## 고객

<a name="retrieving-customers"></a>
### 고객 조회하기

`Cashier::findBillable` 메서드를 사용하면 Stripe ID로 고객을 조회할 수 있습니다. 이 메서드는 청구모델의 인스턴스를 반환합니다.

```
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a name="creating-customers"></a>
### 고객 생성하기

가끔은 구독을 시작하지 않고 Stripe 고객만 미리 생성하려는 경우도 있습니다. 이럴 때는 `createAsStripeCustomer` 메서드를 사용하면 됩니다.

```
$stripeCustomer = $user->createAsStripeCustomer();
```

Stripe에 고객이 정상 생성된 이후에는 나중에 구독을 시작해도 문제 없습니다. 필요하다면, Stripe API에서 허용하는 [고객 생성 옵션 파라미터](https://stripe.com/docs/api/customers/create)를 `$options` 배열로 전달할 수 있습니다.

```
$stripeCustomer = $user->createAsStripeCustomer($options);
```

청구 모델에 해당하는 Stripe 고객 객체를 반환받고 싶다면 `asStripeCustomer` 메서드를 사용하세요.

```
$stripeCustomer = $user->asStripeCustomer();
```

해당 청구모델이 이미 Stripe 고객인지 확실치 않은 경우에는 `createOrGetStripeCustomer` 메서드를 사용할 수 있습니다. Stripe에 고객이 없으면 새로 만들고, 이미 있으면 가져옵니다.

```
$stripeCustomer = $user->createOrGetStripeCustomer();
```

<a name="updating-customers"></a>
### 고객 정보 업데이트하기

가끔 Stripe 고객 정보를 직접 갱신해야 할 때도 있습니다. 이럴 때는 `updateStripeCustomer` 메서드를 사용하면 됩니다. Stripe API에서 허용하는 [고객 정보 옵션](https://stripe.com/docs/api/customers/update) 배열을 인자로 전달하면 됩니다.

```
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a name="balances"></a>
### 잔고 관리(Balances)

Stripe에서는 고객의 "잔고(balance)"에 대한 적립(credit) 또는 차감(debit)이 가능합니다. 이렇게 적립·차감된 금액은 새로운 인보이스 결제 시 자동으로 반영됩니다. 고객의 전체 잔고를 확인하려면, 청구 모델에서 제공하는 `balance` 메서드를 사용할 수 있습니다. 이 메서드는 고객 통화 단위로 포맷된 문자열을 반환합니다.

```
$balance = $user->balance();
```

고객 잔고에 금액을 적립하려면 `creditBalance` 메서드를 사용하면 되고, 필요하다면 설명도 함께 적을 수 있습니다.

```
$user->creditBalance(500, '우수 고객 적립금');
```

`debitBalance` 메서드를 사용하면 해당 금액만큼 고객 잔고를 차감합니다.

```
$user->debitBalance(300, '부적절 사용 벌점');
```

`applyBalance` 메서드는 고객에게 잔고 트랜잭션을 새롭게 생성해줍니다. 이 트랜잭션 내역은 `balanceTransactions` 메서드를 통해 조회하여 고객에게 신용/차감 내역 로그를 보여줄 수도 있습니다.

```
// 전체 트랜잭션 조회...
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // 트랜잭션 금액...
    $amount = $transaction->amount(); // $2.31

    // 연관된 인보이스가 있다면 가져오기...
    $invoice = $transaction->invoice();
}
```

<a name="tax-ids"></a>

### 세금 ID(Tax IDs)

Cashier는 고객의 세금 ID를 손쉽게 관리할 수 있는 기능을 제공합니다. 예를 들어, `taxIds` 메서드를 사용하면 고객에게 할당된 [세금 ID](https://stripe.com/docs/api/customer_tax_ids/object) 전체를 컬렉션 형태로 조회할 수 있습니다.

```
$taxIds = $user->taxIds();
```

특정 세금 ID를 식별자를 통해 고객으로부터 조회할 수도 있습니다.

```
$taxId = $user->findTaxId('txi_belgium');
```

유효한 [type](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type)과 값을 `createTaxId` 메서드에 전달하여 새로운 세금 ID를 생성할 수 있습니다.

```
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

`createTaxId` 메서드는 고객의 계정에 즉시 VAT ID를 추가합니다. [VAT ID의 검증도 Stripe에서 수행](https://stripe.com/docs/invoicing/customer/tax-ids#validation)되지만, 이 과정은 비동기적으로 처리됩니다. 검증 결과가 업데이트될 때 알림을 받으려면, `customer.tax_id.updated` 웹훅 이벤트를 구독하고 [VAT ID의 `verification` 파라미터](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification)를 확인하면 됩니다. 웹훅 처리 방법에 대해서는 [웹훅 핸들러 정의 문서](#handling-stripe-webhooks)를 참고하십시오.

세금 ID를 삭제하려면 `deleteTaxId` 메서드를 사용하면 됩니다.

```
$user->deleteTaxId('txi_belgium');
```

<a name="syncing-customer-data-with-stripe"></a>
### Stripe와 고객 데이터 동기화하기

일반적으로 애플리케이션 사용자가 이름, 이메일, 기타 정보를 업데이트하면 Stripe에도 동일한 정보가 저장되어 있다면 이를 Stripe에 알려야 합니다. 이렇게 하면 Stripe와 애플리케이션 간의 정보가 항상 일치하게 됩니다.

이 과정을 자동화하기 위해, Billable 모델의 `updated` 이벤트에 반응하는 이벤트 리스너를 정의할 수 있습니다. 이벤트 리스너 내부에서 모델의 `syncStripeCustomerDetails` 메서드를 호출하면 됩니다.

```
use App\Models\User;
use function Illuminate\Events\queueable;

/**
 * 모델의 "booted" 메서드.
 */
protected static function booted(): void
{
    static::updated(queueable(function (User $customer) {
        if ($customer->hasStripeId()) {
            $customer->syncStripeCustomerDetails();
        }
    }));
}
```

이제 고객 모델이 업데이트될 때마다 해당 정보가 Stripe와 동기화됩니다. 참고로, Cashier는 고객을 처음 생성할 때에도 자동으로 Stripe와 고객 정보를 동기화합니다.

Stripe에 동기화할 고객 정보 컬럼을 직접 지정하고 싶다면, Cashier에서 제공하는 여러 메서드를 오버라이드하면 됩니다. 예를 들어, Cashier가 Stripe에 "name"으로 간주해야 할 속성을 변경하고 싶다면 `stripeName` 메서드를 오버라이드할 수 있습니다.

```
/**
 * Stripe에 동기화할 고객 이름을 반환합니다.
 */
public function stripeName(): string|null
{
    return $this->company_name;
}
```

이와 유사하게, `stripeEmail`, `stripePhone`, `stripeAddress`, `stripePreferredLocales` 등의 메서드도 오버라이드해서 동기화 시 사용할 정보를 변경할 수 있습니다. 이 메서드들은 [Stripe 고객 객체를 업데이트](https://stripe.com/docs/api/customers/update)할 때 해당하는 파라미터로 동기화됩니다. 고객 정보 동기화 과정을 완전히 직접 제어하고 싶다면 `syncStripeCustomerDetails` 메서드를 오버라이드하면 됩니다.

<a name="billing-portal"></a>
### 청구 포털

Stripe는 [청구 포털을 쉽게 설정할 수 있는 방법](https://stripe.com/docs/billing/subscriptions/customer-portal)을 제공합니다. 이를 통해 고객이 직접 자신의 구독, 결제 수단, 결제 내역을 관리할 수 있습니다. 컨트롤러나 라우트에서 Billable 모델의 `redirectToBillingPortal` 메서드를 호출하면 손쉽게 사용자를 청구 포털로 리디렉션할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

기본적으로 사용자가 구독 관리를 마치면, Stripe 청구 포털 내 링크를 통해 애플리케이션의 `home` 라우트로 돌아올 수 있습니다. 사용자가 돌아갈 URL을 커스텀 지정하려면 URL을 인수로 전달하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

HTTP 리디렉션 응답을 생성하지 않고 청구 포털 URL만을 얻고 싶다면 `billingPortalUrl` 메서드를 사용할 수 있습니다.

```
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a name="payment-methods"></a>
## 결제 수단(Payment Methods)

<a name="storing-payment-methods"></a>
### 결제 수단 저장하기

Stripe로 구독을 생성하거나 "1회성" 결제를 수행하려면 결제 수단을 저장하고 그 식별자(identifier)를 Stripe에서 받아와야 합니다. 이 과정은 결제 수단을 구독에 사용할지, 단일 결제에 사용할지에 따라 접근 방식이 달라집니다. 두 경우를 모두 아래에서 설명합니다.

<a name="payment-methods-for-subscriptions"></a>
#### 구독을 위한 결제 수단

향후 구독 결제에 사용할 고객의 신용카드 정보를 저장하려면 Stripe의 "Setup Intents" API를 이용해 결제 수단 정보를 안전하게 수집해야 합니다. "Setup Intent"는 Stripe에 고객의 결제 수단에서 금액을 청구할 의도가 있음을 알리는 역할을 합니다. Cashier의 `Billable` 트레이트는 `createSetupIntent` 메서드를 포함하고 있으므로, 이 메서드를 사용해 쉽게 새로운 Setup Intent를 만들 수 있습니다. 결제 수단 정보를 입력받는 폼을 렌더링하는 라우트나 컨트롤러에서 이 메서드를 호출하세요.

```
return view('update-payment-method', [
    'intent' => $user->createSetupIntent()
]);
```

Setup Intent를 생성해 뷰로 전달한 다음에는, 해당 Intent의 secret 값을 결제 수단 정보를 입력받는 요소에 포함시켜야 합니다. 예를 들어, 다음과 같은 "결제 수단 수정" 폼을 생각해볼 수 있습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    결제 수단 수정
</button>
```

다음 단계로, Stripe.js 라이브러리를 사용하여 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 연결하고 고객의 결제 정보를 안전하게 입력받을 수 있습니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

이제 [Stripe의 `confirmCardSetup` 메서드](https://stripe.com/docs/js/setup_intents/confirm_card_setup)를 이용해 카드 정보를 확인하고, Stripe로부터 안전한 "결제 수단 식별자"를 받아올 수 있습니다.

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');
const clientSecret = cardButton.dataset.secret;

cardButton.addEventListener('click', async (e) => {
    const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: { name: cardHolderName.value }
            }
        }
    );

    if (error) {
        // 사용자에게 "error.message"를 표시...
    } else {
        // 카드 인증이 성공적으로 완료됨...
    }
});
```

카드 인증이 Stripe에서 성공적으로 처리되면, 결과로 얻은 `setupIntent.payment_method` 식별자를 Laravel 애플리케이션에 전달하여 해당 결제 수단을 고객에게 연결할 수 있습니다. 이 결제 수단 식별자는 [새 결제 수단으로 추가](#adding-payment-methods)하거나 [기본 결제 수단을 업데이트](#updating-the-default-payment-method)하는 데 사용할 수 있습니다. 물론, 이 식별자를 이용해 즉시 [새 구독을 생성](#creating-subscriptions)할 수도 있습니다.

> [!NOTE]
> Setup Intents 및 고객 결제 정보 수집에 대한 자세한 내용은 [Stripe에서 제공하는 개요](https://stripe.com/docs/payments/save-and-reuse#php)를 참고해 주세요.

<a name="payment-methods-for-single-charges"></a>
#### 단일 청구(single charge)를 위한 결제 수단

단일로 고객의 결제 수단에 청구를 진행할 경우 식별자를 한 번만 사용하면 충분합니다. Stripe 정책상, 고객의 저장된 기본 결제 수단은 단일 결제에는 사용할 수 없습니다. 고객이 직접 결제 정보 입력을 할 수 있도록 Stripe.js 라이브러리를 사용해야 합니다. 예를 들어, 다음과 같은 폼을 만들 수 있습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button">
    결제 진행
</button>
```

이와 같은 폼을 정의한 다음, Stripe.js 라이브러리를 이용해 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 연결하고 고객의 결제 정보를 안전하게 수집할 수 있습니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

그 다음 [Stripe의 `createPaymentMethod` 메서드](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method)를 이용해 카드 정보를 확인하고, Stripe에서 안전한 "결제 수단 식별자"를 받을 수 있습니다.

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');

cardButton.addEventListener('click', async (e) => {
    const { paymentMethod, error } = await stripe.createPaymentMethod(
        'card', cardElement, {
            billing_details: { name: cardHolderName.value }
        }
    );

    if (error) {
        // 사용자에게 "error.message"를 표시...
    } else {
        // 카드 인증이 성공적으로 완료됨...
    }
});
```

카드 인증이 성공적으로 완료되면 `paymentMethod.id`를 Laravel 애플리케이션에 전달하여 [단일 결제](#simple-charge)를 진행할 수 있습니다.

<a name="retrieving-payment-methods"></a>
### 결제 수단 조회하기

Billable 모델 인스턴스의 `paymentMethods` 메서드는 `Laravel\Cashier\PaymentMethod` 인스턴스들의 컬렉션을 반환합니다.

```
$paymentMethods = $user->paymentMethods();
```

기본적으로 이 메서드는 모든 유형의 결제 수단을 반환합니다. 특정 유형의 결제 수단만 조회하려면 `type`을 인수로 전달할 수 있습니다.

```
$paymentMethods = $user->paymentMethods('sepa_debit');
```

고객의 기본 결제 수단을 조회하려면 `defaultPaymentMethod` 메서드를 사용하세요.

```
$paymentMethod = $user->defaultPaymentMethod();
```

Billable 모델에 연결된 특정 결제 수단을 조회하려면 `findPaymentMethod` 메서드를 사용할 수 있습니다.

```
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a name="payment-method-presence"></a>
### 결제 수단 보유 여부 확인

Billable 모델이 계정에 기본 결제 수단을 가지고 있는지 확인하려면 `hasDefaultPaymentMethod` 메서드를 호출합니다.

```
if ($user->hasDefaultPaymentMethod()) {
    // ...
}
```

계정에 적어도 하나 이상의 결제 수단을 가지고 있는지 확인하려면 `hasPaymentMethod` 메서드를 사용할 수 있습니다.

```
if ($user->hasPaymentMethod()) {
    // ...
}
```

이 메서드는 Billable 모델에 결제 수단이 하나라도 존재하는지 확인합니다. 특정 유형의 결제 수단이 존재하는지 확인하려면 `type`을 인수로 지정하여 사용할 수 있습니다.

```
if ($user->hasPaymentMethod('sepa_debit')) {
    // ...
}
```

<a name="updating-the-default-payment-method"></a>
### 기본 결제 수단 업데이트

`updateDefaultPaymentMethod` 메서드는 고객의 기본 결제 수단 정보를 업데이트하는 데 사용합니다. 이 메서드는 Stripe 결제 수단 식별자를 인수로 받고, 해당 결제 수단을 새로운 기본 결제 수단으로 설정합니다.

```
$user->updateDefaultPaymentMethod($paymentMethod);
```

Stripe에서 가지고 있는 고객의 기본 결제 수단 정보와 동기화하려면 `updateDefaultPaymentMethodFromStripe` 메서드를 사용할 수 있습니다.

```
$user->updateDefaultPaymentMethodFromStripe();
```

> [!WARNING]
> Stripe의 제한 사항으로 인해 고객의 기본 결제 수단은 인보이스 발행 및 신규 구독 생성에만 사용할 수 있습니다. 단일 결제에는 사용할 수 없습니다.

<a name="adding-payment-methods"></a>
### 결제 수단 추가하기

새로운 결제 수단을 추가하려면 Billable 모델에서 `addPaymentMethod` 메서드를 호출하고 결제 수단 식별자를 전달하면 됩니다.

```
$user->addPaymentMethod($paymentMethod);
```

> [!NOTE]
> 결제 수단 식별자를 조회하는 방법은 [결제 수단 저장 문서](#storing-payment-methods)를 참고하십시오.

<a name="deleting-payment-methods"></a>
### 결제 수단 삭제하기

결제 수단을 삭제하려면 삭제하고 싶은 `Laravel\Cashier\PaymentMethod` 인스턴스에서 `delete` 메서드를 호출하면 됩니다.

```
$paymentMethod->delete();
```

`deletePaymentMethod` 메서드를 사용하면 Billable 모델에서 특정 결제 수단만 삭제할 수 있습니다.

```
$user->deletePaymentMethod('pm_visa');
```

`deletePaymentMethods` 메서드는 Billable 모델에 연결된 모든 결제 수단 정보를 삭제합니다.

```
$user->deletePaymentMethods();
```

기본적으로 모든 결제 수단 유형이 삭제됩니다. 특정 유형만 삭제하려면 `type`을 인수로 전달할 수 있습니다.

```
$user->deletePaymentMethods('sepa_debit');
```

> [!WARNING]
> 사용자가 활성 구독 상태라면 애플리케이션에서 기본 결제 수단을 삭제하도록 허용하지 않아야 합니다.

<a name="subscriptions"></a>
## 구독(Subscriptions)

구독은 고객에게 반복 결제(정기 결제)를 설정하는 기능을 제공합니다. Cashier에서 관리하는 Stripe 구독은 다중 구독 가격, 구독 수량, 체험 기간(trial) 등 다양한 기능을 지원합니다.

<a name="creating-subscriptions"></a>
### 구독 생성하기

구독을 생성하려면 먼저 Billable 모델 인스턴스(일반적으로 `App\Models\User`)를 조회해야 합니다. 모델 인스턴스를 얻은 후에는 `newSubscription` 메서드를 사용해 구독을 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

`newSubscription` 메서드의 첫 번째 인수는 구독의 내부 타입입니다. 애플리케이션에 구독이 하나라면 일반적으로 `default` 또는 `primary` 등으로 설정합니다. 이 구독 타입은 내부적으로만 사용되며, 사용자에게 보여지는 값이 아닙니다. 또한, 공백이 포함되면 안 되며, 구독 생성 후에는 절대 변경해서는 안 됩니다. 두 번째 인수는 사용자에게 적용할 Stripe 상의 가격 식별자입니다.

`create` 메서드는 [Stripe 결제 수단 식별자](#storing-payment-methods) 또는 Stripe `PaymentMethod` 객체를 인수로 받아, 구독을 시작하고, Billable 모델의 Stripe 고객 ID 및 관련 청구 정보를 데이터베이스에 업데이트합니다.

> [!WARNING]
> 결제 수단 식별자를 `create` 구독 메서드에 직접 전달하면 해당 결제 수단이 자동으로 사용자의 저장된 결제 수단 목록에도 추가됩니다.

<a name="collecting-recurring-payments-via-invoice-emails"></a>
#### 인보이스 이메일을 통한 반복 결제 수금

고객의 반복 결제금을 자동으로 청구하는 대신, Stripe가 인보이스를 이메일로 발송하도록 설정할 수 있습니다. 고객은 인보이스를 받은 후 직접 결제할 수 있으며, 구독을 시작할 때 결제 수단을 미리 등록할 필요가 없습니다.

```
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

고객이 인보이스를 결제하지 않을 경우 구독이 취소되기까지 대기하는 기간은 `days_until_due` 옵션에 의해 결정됩니다. 기본 값은 30일이지만, 원하는 값으로 지정할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
    'days_until_due' => 30
]);
```

<a name="subscription-quantities"></a>
#### 구독 수량(Quantities)

구독 생성 시 가격에 특정 [수량(Quantity)](https://stripe.com/docs/billing/subscriptions/quantities)을 지정하려면, 구독 빌더에서 `quantity` 메서드를 호출하면 됩니다.

```
$user->newSubscription('default', 'price_monthly')
     ->quantity(5)
     ->create($paymentMethod);
```

<a name="additional-details"></a>
#### 추가 정보(Additional Details) 지정

Stripe에서 지원하는 [고객](https://stripe.com/docs/api/customers/create) 또는 [구독](https://stripe.com/docs/api/subscriptions/create) 옵션 중 추가로 지정하고 싶은 값이 있다면, `create` 메서드에 두 번째 및 세 번째 인수로 전달할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a name="coupons"></a>
#### 쿠폰(Coupons)

구독을 생성할 때 쿠폰을 적용하려면 `withCoupon` 메서드를 사용할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')
     ->withCoupon('code')
     ->create($paymentMethod);
```

또는, [Stripe 프로모션 코드(Promotion Code)](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 적용하려면 `withPromotionCode` 메서드를 사용합니다.

```
$user->newSubscription('default', 'price_monthly')
     ->withPromotionCode('promo_code_id')
     ->create($paymentMethod);
```

전달하는 프로모션 코드 ID는 Stripe에서 실제로 할당된 API ID이어야 하며, 고객에게 보여지는 프로모션 코드 자체가 아닙니다. 고객에게 제공하는 프로모션 코드(실제 코드)로부터 프로모션 코드 ID를 찾으려면 `findPromotionCode` 메서드를 사용할 수 있습니다.

```
// 고객 제공 코드로 프로모션 코드 ID를 찾기
$promotionCode = $user->findPromotionCode('SUMMERSALE');

// 활성 프로모션 코드 ID 찾기
$promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

위 예시에서 반환되는 `$promotionCode` 객체는 `Laravel\Cashier\PromotionCode` 인스턴스입니다. 이 클래스는 내부적으로 `Stripe\PromotionCode` 객체를 감쌉니다. 프로모션 코드에 연결된 쿠폰 정보를 알고 싶다면 `coupon` 메서드를 호출할 수 있습니다.

```
$coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

쿠폰 인스턴스를 활용해 할인 금액이 얼마인지, 혹은 정액 할인이 적용되는지 비율 할인이 적용되는지 확인할 수 있습니다.

```
if ($coupon->isPercentage()) {
    return $coupon->percentOff().'%'; // 21.5%
} else {
    return $coupon->amountOff(); // $5.99
}
```

현재 고객 혹은 구독에 적용된 할인 정보를 조회할 수도 있습니다.

```
$discount = $billable->discount();

$discount = $subscription->discount();
```

반환된 `Laravel\Cashier\Discount` 인스턴스는 내부적으로 `Stripe\Discount` 객체를 감싸고 있습니다. 마찬가지로, 이 객체에서 `coupon` 메서드를 통해 연결된 쿠폰 정보를 확인할 수 있습니다.

```
$coupon = $subscription->discount()->coupon();
```

고객이나 구독에 새 쿠폰 또는 프로모션 코드를 적용하고 싶다면 `applyCoupon` 또는 `applyPromotionCode` 메서드를 사용할 수 있습니다.

```
$billable->applyCoupon('coupon_id');
$billable->applyPromotionCode('promotion_code_id');

$subscription->applyCoupon('coupon_id');
$subscription->applyPromotionCode('promotion_code_id');
```

여기서도 Stripe API에서 발급받은 프로모션 코드 ID를 꼭 사용해야 하며, 고객에게 보여주는 코드 자체를 사용해서는 안 됩니다. 한 시점에 한 고객이나 구독에는 하나의 쿠폰 또는 프로모션 코드만 적용할 수 있습니다.

자세한 내용은 Stripe의 [쿠폰](https://stripe.com/docs/billing/subscriptions/coupons), [프로모션 코드](https://stripe.com/docs/billing/subscriptions/coupons/codes) 공식 문서를 참고하세요.

<a name="adding-subscriptions"></a>
#### 구독 추가하기

이미 기본 결제 수단이 등록된 고객에게 추가로 구독을 생성하려면 구독 빌더에서 `add` 메서드를 호출하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a name="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Stripe 대시보드에서 구독 생성하기

Stripe 대시보드 자체에서도 구독을 생성할 수 있습니다. 이렇게 하면 Cashier에서 새로 추가된 구독을 동기화하고, 해당 구독 타입을 `default`로 지정합니다. 대시보드에서 만들어진 구독에 할당되는 구독 타입을 변경하고 싶다면 [웹훅 이벤트 핸들러 정의](#defining-webhook-event-handlers)를 참고하세요.

또한 Stripe 대시보드에서는 한 종류의 구독 타입(예: `default`)만 생성할 수 있습니다. 애플리케이션에서 여러 구독 타입을 제공 중이라면, 대시보드를 통해서는 한 타입만 추가할 수 있다는 점에 유의하세요.

마지막으로, 애플리케이션에서 지원하는 각 구독 타입마다 고객에게 한 개의 활성 구독만 존재하도록 반드시 관리해야 합니다. 만약 고객에게 `default` 타입의 구독이 두 개 있다면, Cashier는 최근에 추가된 구독만 사용하며, 이전 구독은 데이터베이스에 이력 용도로만 남습니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인하기

고객이 애플리케이션에 구독을 시작하면, 다양한 편리한 메서드를 통해 구독 상태를 쉽게 확인할 수 있습니다. 먼저, `subscribed` 메서드는 고객이 활성 구독에 가입되어 있으면(체험 기간 포함) `true`를 반환합니다. 이 메서드는 첫 번째 인수로 구독 타입을 받습니다.

```
if ($user->subscribed('default')) {
    // ...
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/10.x/middleware)로 활용하여 사용자의 구독 상태에 따라 라우트, 컨트롤러 접근을 제한하는 데 매우 유용합니다.

```
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSubscribed
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->subscribed('default')) {
            // 이 사용자는 유료 구독자가 아닙니다...
            return redirect('billing');
        }

        return $next($request);
    }
}
```

만약 사용자가 아직 체험 기간(trial)에 있는지 확인하려면 `onTrial` 메서드를 사용할 수 있습니다. 이 메서드는 고객이 체험 기간에 있는지 경고 메시지를 띄워야 할 때 유용합니다.

```
if ($user->subscription('default')->onTrial()) {
    // ...
}
```

`subscribedToProduct` 메서드는 Stripe 상품(product)의 식별자를 바탕으로 사용자가 특정 상품에 구독 중인지 확인할 수 있습니다. Stripe에서 상품은 여러 가격(Price)로 구성된 단위입니다. 예를 들어, 아래 코드는 사용자의 `default` 구독이 애플리케이션의 "premium" 상품에 활성 구독 중인지 확인합니다. 여기서 전달하는 Stripe 상품 식별자는 Stripe 대시보드의 상품 식별자와 일치해야 합니다.

```
if ($user->subscribedToProduct('prod_premium', 'default')) {
    // ...
}
```

또한, 배열을 넘겨서 사용자의 `default` 구독이 "basic" 또는 "premium" 상품 둘 중 하나에 속하는지 확인할 수 있습니다.

```
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    // ...
}
```

`subscribedToPrice` 메서드는 구독이 특정 가격 ID에 해당하는지 판별할 때 사용합니다.

```
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    // ...
}
```

`recurring` 메서드는 사용자가 현재 구독 중이며 더 이상 체험 기간이 아닌지 확인하는 데 사용할 수 있습니다.

```
if ($user->subscription('default')->recurring()) {
    // ...
}
```

> [!WARNING]
> 고객이 동일한 타입의 구독을 두 개 가지고 있는 경우 `subscription` 메서드는 항상 가장 최근의 구독만 반환합니다. 예를 들어, 사용자에게 `default` 타입 구독이 두 개 있을 수 있는데, 하나는 과거에 만료된 구독이고, 다른 하나는 현재 사용 중인 구독일 수 있습니다. 이때 항상 최신 구독이 반환되며, 이전 구독은 이력 정보로 데이터베이스에 저장됩니다.

<a name="cancelled-subscription-status"></a>

#### 취소된 구독 상태

사용자가 한때 활성 구독자였으나 현재 구독을 취소했는지 확인하려면 `canceled` 메서드를 사용할 수 있습니다.

```
if ($user->subscription('default')->canceled()) {
    // ...
}
```

또한, 사용자가 구독을 취소했지만 구독이 완전히 만료되기 전까지는 여전히 '유예 기간(grace period)'에 있는지 확인할 수도 있습니다. 예를 들어, 사용자가 3월 5일에 구독을 취소했지만 원래 만료일이 3월 10일이면, 해당 사용자는 3월 10일까지 유예 기간에 있게 됩니다. 이 기간 동안에도 `subscribed` 메서드는 여전히 `true`를 반환합니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

사용자가 구독을 취소했고 더 이상 '유예 기간'에도 속하지 않을 경우에는 `ended` 메서드를 사용해서 확인할 수 있습니다.

```
if ($user->subscription('default')->ended()) {
    // ...
}
```

<a name="incomplete-and-past-due-status"></a>
#### 불완전(Incomplete) 및 연체(Past Due) 상태

구독을 생성한 후 추가 결제 작업이 필요한 경우, 해당 구독은 `incomplete` 상태로 표시됩니다. 구독 상태는 Cashier의 `subscriptions` 데이터베이스 테이블 내 `stripe_status` 컬럼에 저장됩니다.

마찬가지로 가격 변경 시 추가 결제 작업이 필요하면 구독은 `past_due` 상태가 됩니다. 구독이 이들 상태 중 하나에 있으면, 고객이 결제를 확인할 때까지 활성 상태가 아닙니다. 구독에 불완전 결제가 있는지 확인하려면 청구 가능한 모델이나 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용할 수 있습니다.

```
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

구독에 미결제 금액이 있을 때는, 사용자를 Cashier의 결제 확인 페이지로 안내하고 `latestPayment` 식별자를 전달해야 합니다. 이 식별자는 구독 인스턴스의 `latestPayment` 메서드를 통해 가져올 수 있습니다.

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    결제를 확인해 주세요.
</a>
```

구독이 `past_due` 또는 `incomplete` 상태일 때도 활성 상태로 간주하고 싶다면, Cashier에서 제공하는 `keepPastDueSubscriptionsActive` 및 `keepIncompleteSubscriptionsActive` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 `App\Providers\AppServiceProvider`의 `register` 메서드에서 호출해야 합니다.

```
use Laravel\Cashier\Cashier;

/**
 * Register any application services.
 */
public function register(): void
{
    Cashier::keepPastDueSubscriptionsActive();
    Cashier::keepIncompleteSubscriptionsActive();
}
```

> [!NOTE]
> 구독이 `incomplete` 상태일 때는 결제가 확인되기 전까지 구독 상태를 변경할 수 없습니다. 따라서, 구독이 `incomplete` 상태면 `swap` 및 `updateQuantity` 메서드는 예외를 발생시킵니다.

<a name="subscription-scopes"></a>
#### 구독 상태 쿼리 스코프

대부분의 구독 상태는 쿼리 스코프로도 제공되어, 데이터베이스에서 특정 상태의 구독을 쉽게 조회할 수 있습니다.

```
// 모든 활성 구독 조회...
$subscriptions = Subscription::query()->active()->get();

// 한 사용자의 취소된 구독 전체 조회...
$subscriptions = $user->subscriptions()->canceled()->get();
```

사용할 수 있는 전체 스코프 목록은 다음과 같습니다.

```
Subscription::query()->active();
Subscription::query()->canceled();
Subscription::query()->ended();
Subscription::query()->incomplete();
Subscription::query()->notCanceled();
Subscription::query()->notOnGracePeriod();
Subscription::query()->notOnTrial();
Subscription::query()->onGracePeriod();
Subscription::query()->onTrial();
Subscription::query()->pastDue();
Subscription::query()->recurring();
```

<a name="changing-prices"></a>
### 구독 가격 변경

고객이 애플리케이션에 구독한 이후, 새로운 구독 가격으로 변경하고 싶어할 수 있습니다. 사용자를 새로운 가격으로 변경하려면 Stripe 가격의 식별자를 `swap` 메서드에 전달하면 됩니다. 가격을 변경할 때, 이전에 취소되었던 구독도 재활성화되는 것으로 간주합니다. 전달하는 가격 식별자는 Stripe 대시보드에서 조회할 수 있는 Stripe 가격 식별자여야 합니다.

```
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

고객이 트라이얼(체험 기간) 중이라면, 해당 기간은 그대로 유지됩니다. 또한 구독에 "수량(quantity)"이 존재한다면, 그 수량도 유지됩니다.

만약 가격을 변경하면서 고객의 현재 트라이얼을 즉시 취소하고 싶다면, `skipTrial` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')
        ->skipTrial()
        ->swap('price_yearly');
```

가격을 변경하면서 다음 청구 주기를 기다리지 않고 즉시 고객에게 인보이스를 발행하려면, `swapAndInvoice` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a name="prorations"></a>
#### 부분 청구(Prorations)

기본적으로 Stripe는 가격 변경 시 비용을 일할 계산(부분 청구)합니다. `noProrate` 메서드를 사용하면 구독 가격을 변경할 때 일할 계산을 적용하지 않을 수 있습니다.

```
$user->subscription('default')->noProrate()->swap('price_yearly');
```

구독의 부분 청구(proration)에 대한 더 자세한 사항은 [Stripe 문서](https://stripe.com/docs/billing/subscriptions/prorations)를 참고하세요.

> [!NOTE]
> `swapAndInvoice` 전에 `noProrate` 메서드를 실행해도 부분 청구에는 영향을 주지 않습니다. 인보이스는 항상 발행됩니다.

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

구독이 '수량' 값에 영향을 받는 경우가 있습니다. 예를 들어, 프로젝트 관리 애플리케이션에서 프로젝트당 월 $10을 청구하는 경우, `incrementQuantity` 및 `decrementQuantity` 메서드로 구독 수량을 간편하게 증감시킬 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// 구독의 현재 수량에 5 추가...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// 구독의 현재 수량에서 5 감소...
$user->subscription('default')->decrementQuantity(5);
```

또한 `updateQuantity` 메서드를 사용해 수량을 특정 값으로 직접 지정할 수도 있습니다.

```
$user->subscription('default')->updateQuantity(10);
```

`noProrate` 메서드는 구독 수량 변경 시 부분 청구 없이 적용할 수 있습니다.

```
$user->subscription('default')->noProrate()->updateQuantity(10);
```

구독 수량에 대한 자세한 내용은 [Stripe 문서](https://stripe.com/docs/subscriptions/quantities)를 참고하세요.

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 다중 상품 구독의 수량 지정

[다중 상품 구독](#subscriptions-with-multiple-products)인 경우, 증감하려는 가격의 ID를 `increment`/`decrement` 관련 메서드의 두 번째 인자로 전달해야 합니다.

```
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 다중 상품 구독

[다중 상품 구독](https://stripe.com/docs/billing/subscriptions/multiple-products)은 하나의 구독에 여러 결제 상품을 추가할 수 있게 해줍니다. 예를 들어, 고객 지원 헬프데스크 애플리케이션에서 기본 구독은 월 $10, 실시간 채팅 추가 상품은 월 $15로 제공할 수 있습니다. 이때 관련 정보는 Cashier의 `subscription_items` 테이블에 저장됩니다.

특정 구독에 여러 상품을 지정하려면 `newSubscription` 메서드의 두 번째 인자에 가격 배열을 전달합니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', [
        'price_monthly',
        'price_chat',
    ])->create($request->paymentMethodId);

    // ...
});
```

위 예시에서는 고객의 `default` 구독에 두 개의 가격이 할당되고, 각 가격마다 별도의 청구 주기에 따라 결제됩니다. 필요하다면, 각 가격별로 `quantity` 메서드를 사용해 수량을 지정할 수 있습니다.

```
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

기존 구독에 다른 가격을 추가하고 싶다면 구독의 `addPrice` 메서드를 호출합니다.

```
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

위 예시는 새로운 가격을 추가하고, 고객은 다음 청구 주기에 부과됩니다. 바로 청구하고 싶다면 `addPriceAndInvoice` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

특정 수량으로 가격을 추가하고 싶을 때는 `addPrice`나 `addPriceAndInvoice` 메서드의 두 번째 인자로 수량을 전달할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

`removePrice` 메서드를 사용하면 구독에서 가격을 제거할 수 있습니다.

```
$user->subscription('default')->removePrice('price_chat');
```

> [!NOTE]
> 구독의 마지막 남은 가격은 제거할 수 없습니다. 대신 구독을 취소해야 합니다.

<a name="swapping-prices"></a>
#### 가격 변경

다중 상품 구독에서 연결된 가격 자체를 변경할 수도 있습니다. 예를 들어, 고객이 `price_basic` 구독에 `price_chat` 추가 상품이 있을 때, `price_basic`을 `price_pro`로 업그레이드하려는 상황입니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

위 예시를 실행하면, 내부적으로 `price_basic`에 해당하는 구독 아이템이 삭제되고 `price_chat`은 그대로 유지됩니다. 그리고 `price_pro`에 해당하는 새 구독 아이템이 생성됩니다.

구독 아이템별로 옵션을 지정해야 할 때는 `swap` 메서드에 키/값 쌍의 배열을 전달할 수 있습니다. 예시처럼 가격별 수량을 지정할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

단일 가격만 변경하고 싶을 땐, 구독 아이템 자체의 `swap` 메서드를 활용하세요. 이 방법은 구독의 다른 가격에 있는 메타데이터를 모두 보존하고 싶을 때 유용합니다.

```
$user = User::find(1);

$user->subscription('default')
        ->findItemOrFail('price_basic')
        ->swap('price_pro');
```

<a name="proration"></a>
#### 부분 청구(Proration)

기본적으로 Stripe는 다중 상품 구독에서 가격을 추가하거나 제거할 때 비용을 일할로 계산합니다. proration 없이 가격을 조정하고 싶다면 가격 작업에 `noProrate` 메서드를 체이닝하세요.

```
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a name="swapping-quantities"></a>
#### 수량(Quantities)

개별 구독 가격의 수량을 업데이트하려면, 관련 [수량 메서드](#subscription-quantity)에 가격 ID를 추가 인자로 전달하세요.

```
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> [!NOTE]
> 구독에 여러 개의 가격이 연결된 경우, `Subscription` 모델의 `stripe_price` 및 `quantity` 속성은 `null`이 됩니다. 개별 가격 속성에 접근하려면 `Subscription` 모델의 `items` 연관관계를 사용해야 합니다.

<a name="subscription-items"></a>
#### 구독 아이템(Subscription Items)

구독에 가격이 여러 개인 경우, 데이터베이스의 `subscription_items` 테이블에 여러 개의 구독 '아이템'이 저장됩니다. `items` 관계를 통해 각 아이템에 접근할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// 해당 아이템의 Stripe 가격과 수량 조회
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

특정 가격에 해당하는 아이템만 조회하려면 `findItemOrFail` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a name="multiple-subscriptions"></a>
### 다중 구독

Stripe에서는 한 고객이 동시에 여러 구독을 가질 수 있습니다. 예를 들어, 헬스장을 운영하는 경우 수영 구독과 웨이트 구독을 별도로 제공하고, 각각 다른 요금제를 적용할 수 있습니다. 물론 고객은 두 가지 플랜을 모두 또는 일부만 구독할 수 있습니다.

애플리케이션에서 구독을 생성할 때, `newSubscription` 메서드의 첫 번째 인자에 구독의 유형을 지정할 수 있습니다. 이 값은 사용자가 시작하는 구독의 유형을 나타내는 문자열이면 됩니다.

```
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()->newSubscription('swimming')
        ->price('price_swimming_monthly')
        ->create($request->paymentMethodId);

    // ...
});
```

이 예시에서는 고객에게 월간 수영 구독을 시작한 것입니다. 고객이 나중에 연간 구독으로 변경하고 싶을 때에는 해당 구독의 가격을 간단히 변경하면 됩니다.

```
$user->subscription('swimming')->swap('price_swimming_yearly');
```

당연히 구독 전체를 취소할 수도 있습니다.

```
$user->subscription('swimming')->cancel();
```

<a name="metered-billing"></a>
### 계량형 청구(Metered Billing)

[계량형 청구](https://stripe.com/docs/billing/subscriptions/metered-billing)는 고객의 상품 사용량에 따라 청구하는 방식입니다. 예를 들어, 고객이 한 달에 보낸 문자 메시지나 이메일 건수에 비례해 요금을 부과할 수 있습니다.

계량형 청구를 시작하려면 먼저 Stripe 대시보드에서 계량형 가격이 설정된 새 상품을 생성해야 합니다. 그런 다음 `meteredPrice`를 이용해 구독에 계량 가격 ID를 추가합니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

또한, [Stripe Checkout](#checkout)을 통해 계량형 구독을 시작할 수도 있습니다.

```
$checkout = Auth::user()
        ->newSubscription('default', [])
        ->meteredPrice('price_metered')
        ->checkout();

return view('your-checkout-view', [
    'checkout' => $checkout,
]);
```

<a name="reporting-usage"></a>
#### 사용량(usage) 보고

고객이 애플리케이션을 이용하면서 발생한 사용량을 Stripe에 보고하여 정확한 청구가 이뤄지도록 해야 합니다. 계량형 구독의 사용량을 추가하려면 `reportUsage` 메서드를 사용하세요.

```
$user = User::find(1);

$user->subscription('default')->reportUsage();
```

기본적으로 한 청구 기간에 '1'의 사용량이 추가됩니다. 또는 원하는 사용량만큼 구체적인 값을 전달할 수도 있습니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsage(15);
```

애플리케이션에서 한 구독에 여러 가격이 있을 경우, `reportUsageFor` 메서드로 보고하려는 계량 가격을 명시할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsageFor('price_metered', 15);
```

가끔 이전에 보고한 사용량을 수정해야 하는 경우도 있습니다. 이를 위해 `reportUsage`의 두 번째 인자로 타임스탬프 또는 `DateTimeInterface` 객체를 전달하면 됩니다. 이렇게 하면 Stripe는 해당 시점에 보고된 사용량을 업데이트합니다. 지정한 일시가 현재 청구 기간 내라면 언제든 이전 기록을 계속 수정할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsage(5, $timestamp);
```

<a name="retrieving-usage-records"></a>
#### 사용량 기록 조회

고객의 과거 사용량을 조회하려면, 구독 인스턴스의 `usageRecords` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$usageRecords = $user->subscription('default')->usageRecords();
```

한 구독에 여러 가격이 있는 경우, 원하는 계량 가격의 사용량 기록만 조회하려면 `usageRecordsFor` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$usageRecords = $user->subscription('default')->usageRecordsFor('price_metered');
```

`usageRecords` 및 `usageRecordsFor` 메서드는 usage record의 연관 배열이 담긴 컬렉션 인스턴스를 반환합니다. 이 배열을 순회하여 고객의 총 사용량 등을 표시할 수 있습니다.

```
@foreach ($usageRecords as $usageRecord)
    - Period Starting: {{ $usageRecord['period']['start'] }}
    - Period Ending: {{ $usageRecord['period']['end'] }}
    - Total Usage: {{ $usageRecord['total_usage'] }}
@endforeach
```

반환되는 모든 usage 데이터와 Stripe의 커서 기반 페이지네이션에 대한 전체 참조는 [Stripe 공식 API 문서](https://stripe.com/docs/api/usage_records/subscription_item_summary_list)를 참고하세요.

<a name="subscription-taxes"></a>
### 구독 세금(Subscription Taxes)

> [!NOTE]
> 세율을 수동으로 계산하는 대신, [Stripe Tax를 이용한 자동 세금 계산](#tax-configuration)을 사용할 수 있습니다.

사용자가 구독에 대해 지불해야 할 세율을 지정하려면, 빌러블(billable) 모델에 `taxRates` 메서드를 구현하고 Stripe 세금률 ID가 담긴 배열을 반환해야 합니다. 이 세금률은 [Stripe 대시보드](https://dashboard.stripe.com/test/tax-rates)에서 정의할 수 있습니다.

```
/**
 * The tax rates that should apply to the customer's subscriptions.
 *
 * @return array<int, string>
 */
public function taxRates(): array
{
    return ['txr_id'];
}
```

`taxRates` 메서드는 고객별로 서로 다른 세율을 적용하고 싶을 때 유용합니다. (여러 국가 등 다양한 세율 적용 시)

만약 여러 상품에 대한 구독을 제공한다면, 각 가격별로 다른 세율을 지정해야 할 수 있습니다. 이 때는 빌러블 모델에 `priceTaxRates` 메서드를 추가로 구현하세요.

```
/**
 * The tax rates that should apply to the customer's subscriptions.
 *
 * @return array<string, array<int, string>>
 */
public function priceTaxRates(): array
{
    return [
        'price_monthly' => ['txr_id'],
    ];
}
```

> [!NOTE]
> `taxRates` 메서드는 구독 청구에만 적용됩니다. Cashier를 이용해 "일회성 결제"를 진행하는 경우, 해당 시점에 세율을 직접 지정해야 합니다.

<a name="syncing-tax-rates"></a>
#### 세율 동기화

`taxRates` 메서드에서 반환하는 하드코딩된 세금률 ID가 변경되더라도, 기존 사용자의 구독에 부여된 세금 설정은 그대로 유지됩니다. 기존 구독에 새 `taxRates` 값을 반영하고 싶다면, 사용자의 구독 인스턴스에서 `syncTaxRates` 메서드를 호출하세요.

```
$user->subscription('default')->syncTaxRates();
```

이 메서드는 다중 상품 구독의 각 아이템 세율도 동기화합니다. 애플리케이션에서 다중 상품 구독을 제공하는 경우, 빌러블 모델에 위에서 설명한 `priceTaxRates` 메서드를 반드시 구현해야 합니다.

<a name="tax-exemption"></a>
#### 세금 면제

Cashier는 고객이 세금 면제 대상인지 확인할 수 있도록, `isNotTaxExempt`, `isTaxExempt`, `reverseChargeApplies` 메서드도 제공합니다. 이 메서드는 Stripe API를 호출해 고객의 면세 상태를 확인합니다.

```
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> [!NOTE]
> 이 메서드들은 `Laravel\Cashier\Invoice` 객체에서도 사용할 수 있습니다. 단, `Invoice` 객체에서 실행할 경우 인보이스 생성 시점의 면세 여부를 확인합니다.

<a name="subscription-anchor-date"></a>
### 구독 기준 날짜(Anchor Date)

기본적으로 청구 주기의 기준(anchor)은 구독이 생성된 날짜 또는 체험 기간이 있는 경우 그 체험 기간의 종료일입니다. 청구 기준 날짜를 변경하고 싶을 때는 `anchorBillingCycleOn` 메서드를 사용할 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $anchor = Carbon::parse('first day of next month');

    $request->user()->newSubscription('default', 'price_monthly')
                ->anchorBillingCycleOn($anchor->startOfDay())
                ->create($request->paymentMethodId);

    // ...
});
```

구독 청구 주기 관리에 대한 자세한 내용은 [Stripe 청구 주기 문서](https://stripe.com/docs/billing/subscriptions/billing-cycle)를 참고하세요.

<a name="cancelling-subscriptions"></a>

### 구독 취소

구독을 취소하려면, 사용자 구독 객체에서 `cancel` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->cancel();
```

구독이 취소되면, Cashier는 자동으로 `subscriptions` 데이터베이스 테이블의 `ends_at` 컬럼을 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 하는지 판단하는 데 사용됩니다.

예를 들어, 어떤 고객이 3월 1일에 구독을 취소하지만 해당 구독이 실제로는 3월 5일에 종료될 예정일 경우, `subscribed` 메서드는 3월 5일까지 계속해서 `true`를 반환합니다. 일반적으로 사용자가 청구 주기가 끝날 때까지 애플리케이션을 계속 사용할 수 있기 때문에 이렇게 처리됩니다.

사용자가 구독을 취소했으나 아직 "유예 기간" 내에 있는지 확인하려면, `onGracePeriod` 메서드를 사용할 수 있습니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

즉시 구독을 취소하려면, `cancelNow` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->cancelNow();
```

즉시 구독을 취소함과 동시에 청구되지 않은 측정 사용량(미터 사용량)이나 새로운/보류 중인 비례 배분 인보이스 항목을 모두 청구하려면, `cancelNowAndInvoice` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->cancelNowAndInvoice();
```

구독을 특정 시점에 취소하도록 예약할 수도 있습니다.

```
$user->subscription('default')->cancelAt(
    now()->addDays(10)
);
```

마지막으로, 관련된 사용자 모델을 삭제하기 전에 항상 사용자 구독을 먼저 취소해야 합니다.

```
$user->subscription('default')->cancelNow();

$user->delete();
```

<a name="resuming-subscriptions"></a>
### 구독 재개

고객이 구독을 취소한 뒤 다시 재개하고 싶을 때는, 구독의 `resume` 메서드를 사용합니다. 이때 고객은 반드시 "유예 기간" 안에 있어야만 구독을 재개할 수 있습니다.

```
$user->subscription('default')->resume();
```

고객이 구독을 취소한 후 완전히 만료되기 전에 재개한다면, 즉시 결제되는 것이 아니라 구독이 다시 활성화되고 원래의 청구 주기에 따라 결제가 진행됩니다.

<a name="subscription-trials"></a>
## 구독 체험(Trial) 제공

<a name="with-payment-method-up-front"></a>
### 결제 수단을 미리 받고 체험 제공

고객에게 체험 기간을 제공하면서, 동시에 결제 수단 정보를 미리 수집하고 싶다면, 구독 생성 시 `trialDays` 메서드를 사용하면 됩니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
                ->trialDays(10)
                ->create($request->paymentMethodId);

    // ...
});
```

이 메서드는 구독 레코드의 trial 종료일을 데이터베이스에 저장하고, Stripe에는 trial이 끝난 후에 청구를 시작하도록 안내합니다. `trialDays` 메서드를 사용하면 Stripe에서 가격에 대해 기본적으로 설정된 체험 기간이 있더라도 이를 덮어씁니다.

> [!WARNING]
> 체험 기간이 끝나기 전에 구독이 취소되지 않으면 체험이 끝나자마자 사용자는 바로 결제됩니다. 따라서 사용자가 체험 종료일을 알고 있도록 꼭 안내해주어야 합니다.

`trialUntil` 메서드는 체험 기간의 종료일을 명확하게 지정할 수 있는 `DateTime` 인스턴스를 받을 수 있습니다.

```
use Carbon\Carbon;

$user->newSubscription('default', 'price_monthly')
            ->trialUntil(Carbon::now()->addDays(10))
            ->create($paymentMethod);
```

사용자가 체험 기간 중인지 확인하려면, 사용자 인스턴스의 `onTrial` 메서드나 구독 인스턴스의 `onTrial` 메서드를 사용하면 됩니다. 아래 두 예시는 동일하게 동작합니다.

```
if ($user->onTrial('default')) {
    // ...
}

if ($user->subscription('default')->onTrial()) {
    // ...
}
```

`endTrial` 메서드를 사용하면 구독 체험을 즉시 종료할 수 있습니다.

```
$user->subscription('default')->endTrial();
```

이미 체험 기간이 만료되었는지 확인하려면, `hasExpiredTrial` 메서드를 사용할 수 있습니다.

```
if ($user->hasExpiredTrial('default')) {
    // ...
}

if ($user->subscription('default')->hasExpiredTrial()) {
    // ...
}
```

<a name="defining-trial-days-in-stripe-cashier"></a>
#### Stripe / Cashier에서 체험 일수 정의하기

Stripe 대시보드에서 가격(Price)별 체험 일수를 지정하거나, Cashier를 통해 명시적으로 전달할 수 있습니다. Stripe에서 가격마다 체험 일수를 지정한 경우, 신규 구독(과거에 구독했던 고객의 신규 구독 포함)은 항상 체험 기간을 부여받게 됩니다. 체험을 생략하려면 반드시 `skipTrial()` 메서드를 명시적으로 호출해야 합니다.

<a name="without-payment-method-up-front"></a>
### 결제 수단 없이 체험 제공

결제 수단 정보를 미리 수집하지 않고 체험 기간을 제공하고 싶다면, 사용자 레코드의 `trial_ends_at` 컬럼에 원하는 체험 종료일을 설정하면 됩니다. 보통 회원 가입 시점에 이 작업을 수행합니다.

```
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->addDays(10),
]);
```

> [!WARNING]
> 과금 대상 모델 클래스 정의에는 반드시 `trial_ends_at` 속성에 대해 [date cast](/docs/10.x/eloquent-mutators#date-casting) 처리를 추가하세요.

Cashier는 이 방식을 "일반(Generic) 체험"으로 분류합니다. 이는 기존 구독에 연결되어 있지 않은 체험입니다. 과금 가능(Billable) 모델 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at` 값보다 이전일 경우 `true`를 반환합니다.

```
if ($user->onTrial()) {
    // User is within their trial period...
}
```

사용자에게 실제 구독을 생성할 준비가 되면, `newSubscription` 메서드를 평소와 같이 사용하면 됩니다.

```
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

사용자의 체험 종료일을 가져오려면, `trialEndsAt` 메서드를 사용할 수 있습니다. 체험 기간 중이라면 Carbon 날짜 인스턴스가 반환되고, 아니면 `null`이 반환됩니다. 기본값이 아닌 다른 구독에 대해 체험 종료일을 구하고 싶다면, 구독 타입을 파라미터로 전달할 수 있습니다.

```
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

아직 실제 구독을 만든 적이 없는 "일반(Generic) 체험" 상태인지 확인하고 싶다면, `onGenericTrial` 메서드를 사용하면 됩니다.

```
if ($user->onGenericTrial()) {
    // User is within their "generic" trial period...
}
```

<a name="extending-trials"></a>
### 체험 기간 연장

`extendTrial` 메서드를 사용하면, 구독 생성 이후에도 추가로 체험 기간을 연장할 수 있습니다. 이미 체험이 만료되어 구독 요금이 청구 중이더라도, 추가 체험 기간을 제공할 수 있습니다. 체험 기간만큼의 시간은 다음 인보이스에서 차감되어 계산됩니다.

```
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// 지금부터 7일 후에 체험 종료...
$subscription->extendTrial(
    now()->addDays(7)
);

// 현재 trial 종료일 기준 5일 더 추가...
$subscription->extendTrial(
    $subscription->trial_ends_at->addDays(5)
);
```

<a name="handling-stripe-webhooks"></a>
## Stripe 웹훅(Webhook) 처리

> [!NOTE]
> Stripe 웹훅 테스트에는 [Stripe CLI](https://stripe.com/docs/stripe-cli)를 활용할 수 있습니다.

Stripe는 웹훅을 통해 애플리케이션에 다양한 이벤트가 발생했음을 알릴 수 있습니다. Cashier 서비스 프로바이더는 기본적으로 Cashier의 웹훅 컨트롤러로 연결되는 라우트를 자동으로 등록합니다. 이 컨트롤러가 모든 웹훅 요청을 처리합니다.

기본적으로 Cashier의 웹훅 컨트롤러는 결제 실패 횟수가 (Stripe 설정에 따라) 일정 수를 초과한 구독 취소, 고객 정보 및 삭제, 구독 정보 및 결제 수단 변경 등을 자동으로 처리합니다. 하지만 이후에 설명할 방법대로, 원하는 Stripe 웹훅 이벤트를 자유롭게 추가적으로 처리할 수도 있습니다.

애플리케이션이 Stripe 웹훅을 정상적으로 처리할 수 있으려면, Stripe 관리자 페이지에서 웹훅 URL을 반드시 설정해야 합니다. Cashier의 기본 웹훅 컨트롤러는 `/stripe/webhook` URL 경로로 응답합니다. Stripe 관리자 패널에서 반드시 활성화해야 할 웹훅 이벤트 전체 목록은 아래와 같습니다.

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

편의를 위해, Cashier에는 `cashier:webhook` Artisan 명령어가 포함되어 있습니다. 이 명령어를 실행하면, Cashier가 필요로 하는 모든 이벤트를 수신하는 웹훅을 Stripe에 생성할 수 있습니다.

```shell
php artisan cashier:webhook
```

생성된 웹훅은 기본적으로 `APP_URL` 환경 변수와 Cashier에 포함된 `cashier.webhook` 라우트가 결합된 URL을 사용합니다. 명령어 실행 시 `--url` 옵션으로 별도의 URL을 지정할 수도 있습니다.

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

생성되는 웹훅의 Stripe API 버전은 Cashier가 호환되는 Stripe 버전으로 자동 지정됩니다. 다른 Stripe 버전을 사용하려면 `--api-version` 옵션을 지정할 수 있습니다.

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

웹훅 생성 후에는 즉시 활성 상태가 됩니다. 준비가 될 때까지 웹훅을 비활성 상태로 두고 싶다면, 명령어 실행 시 `--disabled` 옵션을 사용할 수 있습니다.

```shell
php artisan cashier:webhook --disabled
```

> [!WARNING]
> Cashier에 포함된 [웹훅 서명 검증](#verifying-webhook-signatures) 미들웨어로 Stripe 웹훅 요청을 반드시 보호해야 합니다.

<a name="webhooks-csrf-protection"></a>
#### 웹훅과 CSRF 보호

Stripe 웹훅은 Laravel의 [CSRF 보호](/docs/10.x/csrf)를 우회해야 하므로, 애플리케이션의 `App\Http\Middleware\VerifyCsrfToken` 미들웨어에서 해당 URI를 예외로 등록하거나, 라우트 자체를 `web` 미들웨어 그룹 밖에 두어야 합니다.

```
protected $except = [
    'stripe/*',
];
```

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의하기

Cashier는 실패한 결제에 대한 구독 취소 및 기타 일반적인 Stripe 웹훅 이벤트를 자동으로 처리합니다. 그 외에 추가로 웹훅 이벤트를 처리하고 싶다면, Cashier가 디스패치하는 아래 이벤트를 리슨하면 됩니다.

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

이 이벤트들에는 Stripe 웹훅의 전체 페이로드가 포함되어 있습니다. 예를 들어 `invoice.payment_succeeded` 웹훅을 처리하고 싶다면, [리스너](/docs/10.x/events#defining-listeners)를 등록해 이벤트를 처리할 수 있습니다.

```
<?php

namespace App\Listeners;

use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    /**
     * Handle received Stripe webhooks.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            // Handle the incoming event...
        }
    }
}
```

리스너를 정의한 후에는, 애플리케이션의 `EventServiceProvider`에 등록해야 합니다.

```
<?php

namespace App\Providers;

use App\Listeners\StripeEventListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Laravel\Cashier\Events\WebhookReceived;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        WebhookReceived::class => [
            StripeEventListener::class,
        ],
    ];
}
```

<a name="verifying-webhook-signatures"></a>
### 웹훅 서명 검증

웹훅의 보안을 위해 [Stripe의 웹훅 서명](https://stripe.com/docs/webhooks/signatures)을 사용할 수 있습니다. Cashier에는 Stripe 웹훅 요청이 유효한지 검증하는 미들웨어가 기본으로 포함되어 있습니다.

웹훅 검증을 활성화하려면, 애플리케이션의 `.env` 파일에 `STRIPE_WEBHOOK_SECRET` 환경 변수를 반드시 설정해야 합니다. 웹훅 `secret`은 Stripe 관리자 대시보드에서 확인할 수 있습니다.

<a name="single-charges"></a>
## 단일 결제(One-time Charge)

<a name="simple-charge"></a>
### 단순 결제

고객에게 한 번만 결제(일회성 결제)를 진행하고 싶다면, 과금 가능한(billable) 모델 인스턴스에서 `charge` 메서드를 사용할 수 있습니다. 이때 [결제 수단 식별자](#payment-methods-for-single-charges)를 두 번째 인자로 반드시 전달해야 합니다.

```
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $stripeCharge = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

`charge` 메서드는 세 번째 인자로 배열을 받아, Stripe 결제 생성 시 필요한 각종 옵션을 전달할 수 있습니다. 사용할 수 있는 옵션에 대한 자세한 안내는 [Stripe 공식 문서](https://stripe.com/docs/api/charges/create)에서 확인하세요.

```
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

고객이나 사용자가 미리 존재하지 않아도, `charge` 메서드를 통해 결제를 생성할 수 있습니다. 이 경우, 애플리케이션의 billable 모델의 새 인스턴스에서 `charge` 메서드를 호출하면 됩니다.

```
use App\Models\User;

$stripeCharge = (new User)->charge(100, $paymentMethod);
```

`charge` 메서드는 결제에 실패하면 예외를 발생시킵니다. 결제가 성공하면, `Laravel\Cashier\Payment` 인스턴스를 반환합니다.

```
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    // ...
}
```

> [!WARNING]
> `charge` 메서드는 애플리케이션에서 사용하는 통화의 최소 단위로 결제 금액을 받습니다. 예를 들어 미국 달러(USD)로 결제할 경우, 금액을 센트(1달러=100센트) 단위로 지정해야 합니다.

<a name="charge-with-invoice"></a>
### 인보이스가 포함된 결제

때로는 일회성 결제와 동시에 PDF 인보이스를 고객에게 제공해야 할 수 있습니다. `invoicePrice` 메서드를 사용하면 바로 그런 상황에서 유용합니다. 예를 들어 티셔츠 5벌에 대해 인보이스를 발행하려면 다음과 같이 할 수 있습니다.

```
$user->invoicePrice('price_tshirt', 5);
```

인보이스는 사용자의 기본 결제 수단으로 즉시 청구됩니다. `invoicePrice` 메서드는 세 번째 인자로 배열을 받아 인보이스 항목에 대한 결제 옵션을 지정할 수 있습니다. 네 번째 인자 역시 배열로, 인보이스 자체의 결제 옵션을 지정할 수 있습니다.

```
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

`invoicePrice`와 유사하게, `tabPrice` 메서드를 활용하면 여러 개의 일회성 아이템(인보이스당 최대 250개)을 "탭"에 추가했다가 한 번에 인보이스로 청구할 수 있습니다. 예를 들어 티셔츠 5벌과 머그컵 2개에 대해 인보이스를 발행하고 싶다면 다음과 같이 구현할 수 있습니다.

```
$user->tabPrice('price_tshirt', 5);
$user->tabPrice('price_mug', 2);
$user->invoice();
```

또는, `invoiceFor` 메서드를 사용해 고객의 기본 결제 수단으로 "일회용" 결제를 발생시킬 수도 있습니다.

```
$user->invoiceFor('One Time Fee', 500);
```

`invoiceFor` 메서드 역시 사용할 수 있지만, 미리 정의된 가격(Price)을 사용하는 `invoicePrice`, `tabPrice` 메서드의 사용을 권장합니다. 이렇게 하면 Stripe 대시보드에서 제품별 매출 분석 등 더 나은 데이터와 분석 기능을 얻을 수 있습니다.

> [!WARNING]
> `invoice`, `invoicePrice`, `invoiceFor` 메서드는 모두 Stripe 인보이스를 생성하며, 결제 실패 시 자동으로 재시도합니다. 결제 실패시 인보이스의 재시도를 원하지 않는다면, Stripe API를 이용해 첫 결제 실패 후 인보이스를 직접 종료(close)해야 합니다.

<a name="creating-payment-intents"></a>
### 결제 의도(Payment Intent) 생성

Stripe 결제 의도를 새로 만들려면, billable 모델 인스턴스에서 `pay` 메서드를 호출하면 됩니다. 이 메서드는 `Laravel\Cashier\Payment` 인스턴스에 래핑된(감싼) Stripe 결제 의도를 생성합니다.

```
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->pay(
        $request->get('amount')
    );

    return $payment->client_secret;
});
```

결제 의도를 만든 후, 반환된 client secret을 프론트엔드로 전송해 사용자가 브라우저상에서 결제를 완료할 수 있도록 하면 됩니다. Stripe 결제 의도를 이용한 전체 결제 흐름 구현에 대해 더 자세한 내용은 [Stripe 공식 문서](https://stripe.com/docs/payments/accept-a-payment?platform=web)를 참고하세요.

`pay` 메서드는 Stripe 대시보드에서 활성화된 기본 결제 수단 모두를 사용할 수 있습니다. 특정 결제 수단만 허용하려면 `payWith` 메서드를 활용할 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->payWith(
        $request->get('amount'), ['card', 'bancontact']
    );

    return $payment->client_secret;
});
```

> [!WARNING]
> `pay` 및 `payWith` 메서드 모두 결제 금액을 애플리케이션이 사용하는 통화의 최소 단위(예: USD는 센트)로 입력해야 합니다.

<a name="refunding-charges"></a>
### 결제 환불 처리

Stripe 결제를 환불하려면, `refund` 메서드를 사용할 수 있습니다. 이때 첫 번째 인자로 Stripe의 [payment intent ID](#payment-methods-for-single-charges)를 전달해야 합니다.

```
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a name="invoices"></a>
## 인보이스(Invoice)

<a name="retrieving-invoices"></a>
### 인보이스 조회

과금 가능한 모델의 인보이스 배열을 간단히 조회하려면, `invoices` 메서드를 사용하세요. `invoices` 메서드는 `Laravel\Cashier\Invoice` 인스턴스의 컬렉션을 반환합니다.

```
$invoices = $user->invoices();
```

대기 중인(pending) 인보이스까지 결과에 포함하고 싶다면, `invoicesIncludingPending` 메서드를 사용할 수 있습니다.

```
$invoices = $user->invoicesIncludingPending();
```

특정 인보이스를 ID로 조회하려면, `findInvoice` 메서드를 사용할 수 있습니다.

```
$invoice = $user->findInvoice($invoiceId);
```

<a name="displaying-invoice-information"></a>
#### 인보이스 정보 표시하기

고객의 인보이스 목록을 표시할 때, 인보이스 객체의 메서드로 각 인보이스의 정보를 쉽게 보여줄 수 있습니다. 예를 들어, 각 인보이스를 테이블로 나열하고 다운로드 링크를 제공하는 코드는 다음과 같습니다.

```
<table>
    @foreach ($invoices as $invoice)
        <tr>
            <td>{{ $invoice->date()->toFormattedDateString() }}</td>
            <td>{{ $invoice->total() }}</td>
            <td><a href="/user/invoice/{{ $invoice->id }}">Download</a></td>
        </tr>
    @endforeach
</table>
```

<a name="upcoming-invoices"></a>
### 예정 인보이스 조회

고객의 예정된(Upcoming) 인보이스를 조회하려면, `upcomingInvoice` 메서드를 사용하세요.

```
$invoice = $user->upcomingInvoice();
```

고객이 여러 개의 구독을 가지고 있는 경우, 특정 구독의 예정 인보이스도 조회할 수 있습니다.

```
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a name="previewing-subscription-invoices"></a>
### 구독 인보이스 미리보기

`previewInvoice` 메서드를 사용하면, 가격 변경 전 인보이스를 미리 확인할 수 있습니다. 이 기능을 통해 가격 변경 후 고객의 인보이스가 어떻게 변경될지 미리 알 수 있습니다.

```
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

여러 개의 가격을 배열로 전달해, 여러 새로운 가격이 반영된 인보이스 미리보기 역시 가능합니다.

```
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a name="generating-invoice-pdfs"></a>
### 인보이스 PDF 생성

인보이스 PDF 생성을 위해서는, Cashier의 기본 PDF 렌더러인 Dompdf 라이브러리를 Composer로 설치해야 합니다.

```php
composer require dompdf/dompdf
```

라우트나 컨트롤러에서, `downloadInvoice` 메서드를 사용해 특정 인보이스의 PDF 다운로드를 생성할 수 있습니다. 이 메서드는 PDF 다운로드에 필요한 올바른 HTTP 응답을 자동으로 반환합니다.

```
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId);
});
```

기본적으로 인보이스의 모든 데이터는 Stripe에 저장된 고객 및 인보이스 정보를 기준으로 합니다. 파일명은 `app.name` 설정값을 따릅니다. 그러나, `downloadInvoice`의 두 번째 인자로 배열을 전달해 회사나 제품 정보 등 일부 데이터를 자유롭게 커스터마이즈할 수 있습니다.

```
return $request->user()->downloadInvoice($invoiceId, [
    'vendor' => 'Your Company',
    'product' => 'Your Product',
    'street' => 'Main Str. 1',
    'location' => '2000 Antwerp, Belgium',
    'phone' => '+32 499 00 00 00',
    'email' => 'info@example.com',
    'url' => 'https://example.com',
    'vendorVat' => 'BE123456789',
]);
```

`downloadInvoice` 메서드는 세 번째 인자로 커스텀 파일명을 지정할 수도 있습니다. 이 파일명에는 `.pdf` 확장자가 자동 붙습니다.

```
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a name="custom-invoice-render"></a>

#### 커스텀 인보이스 렌더러

Cashier는 커스텀 인보이스 렌더러도 사용할 수 있도록 지원합니다. 기본적으로 Cashier는 `DompdfInvoiceRenderer` 구현체를 사용하며, 이는 [dompdf](https://github.com/dompdf/dompdf) PHP 라이브러리를 활용해 인보이스 PDF를 생성합니다. 그러나, 여러분이 원하는 어떤 렌더러도 직접 구현하여 사용할 수 있으며, 이를 위해서는 `Laravel\Cashier\Contracts\InvoiceRenderer` 인터페이스를 구현하면 됩니다. 예를 들어, 외부 PDF 렌더링 서비스의 API를 이용해 인보이스 PDF를 생성하고자 할 때 다음과 같이 구현할 수 있습니다.

```
use Illuminate\Support\Facades\Http;
use Laravel\Cashier\Contracts\InvoiceRenderer;
use Laravel\Cashier\Invoice;

class ApiInvoiceRenderer implements InvoiceRenderer
{
    /**
     * Render the given invoice and return the raw PDF bytes.
     */
    public function render(Invoice $invoice, array $data = [], array $options = []): string
    {
        $html = $invoice->view($data)->render();

        return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
    }
}
```

인보이스 렌더러 계약을 직접 구현한 후, 애플리케이션의 `config/cashier.php` 설정 파일에서 `cashier.invoices.renderer` 설정 값을 커스텀 렌더러 구현 클래스명으로 변경해주어야 합니다.

<a name="checkout"></a>
## 체크아웃(Checkout)

Cashier Stripe는 또한 [Stripe Checkout](https://stripe.com/payments/checkout)을 지원합니다. Stripe Checkout은 사전 구축된 호스팅 결제 페이지를 제공하여, 직접 결제 페이지를 구현하는 번거로움을 줄여줍니다.

다음 문서는 Cashier에서 Stripe Checkout을 시작하는 방법에 대해 안내합니다. Stripe Checkout에 대해 더 알고 싶다면 [Stripe의 공식 Checkout 문서](https://stripe.com/docs/payments/checkout)도 참고하시기 바랍니다.

<a name="product-checkouts"></a>
### 상품 결제

Stripe 대시보드에서 이미 생성한 상품의 결제를 처리하려면, 빌링 가능한(billable) 모델에서 `checkout` 메서드를 사용하면 됩니다. `checkout` 메서드는 새로운 Stripe Checkout 세션을 생성합니다. 기본적으로 Stripe Price ID를 전달해야 합니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout('price_tshirt');
});
```

필요하다면 상품의 수량도 지정할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 15]);
});
```

고객이 위 라우트로 방문하면 Stripe의 Checkout 페이지로 리디렉션됩니다. 기본적으로 결제 완료 또는 취소 시 사용자는 `home` 라우트로 자동 이동되지만, `success_url`과 `cancel_url` 옵션으로 콜백 URL을 커스터마이즈할 수도 있습니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

`success_url` 옵션을 정의할 때, Stripe가 체크아웃 세션 ID를 쿼리 스트링 파라미터로 추가하도록 할 수 있습니다. 이를 위해 `success_url`의 쿼리 스트링에 `{CHECKOUT_SESSION_ID}`라는 리터럴 문자열을 추가하면, Stripe가 해당 플레이스홀더를 실제 세션 ID로 변경해 전달합니다.

```
use Illuminate\Http\Request;
use Stripe\Checkout\Session;
use Stripe\Customer;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout-cancel'),
    ]);
});

Route::get('/checkout-success', function (Request $request) {
    $checkoutSession = $request->user()->stripe()->checkout->sessions->retrieve($request->get('session_id'));

    return view('checkout.success', ['checkoutSession' => $checkoutSession]);
})->name('checkout-success');
```

<a name="checkout-promotion-codes"></a>
#### 프로모션 코드

기본적으로 Stripe Checkout은 [사용자가 직접 입력하는 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 허용하지 않습니다. 하지만, Checkout 페이지에서 프로모션 코드를 활성화하는 방법이 있습니다. `allowPromotionCodes` 메서드를 호출하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a name="single-charge-checkouts"></a>
### 단건 결제

Stripe 대시보드에서 미리 생성하지 않은 임시(ad-hoc) 상품에 대해 단건 결제를 진행할 수도 있습니다. 이 경우, `checkoutCharge` 메서드를 빌링 가능한(billable) 모델에서 호출하고, 금액, 상품명, (선택적으로) 수량을 전달하면 됩니다. 고객이 해당 라우트로 접근하면 Stripe Checkout 페이지로 리디렉션됩니다.

```
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> [!WARNING]
> `checkoutCharge` 메서드를 사용할 경우, Stripe 대시보드에 항상 새로운 상품과 가격이 생성됩니다. 따라서, Stripe 대시보드에서 사전에 상품을 등록하고 `checkout` 메서드를 사용하는 방식을 권장합니다.

<a name="subscription-checkouts"></a>
### 구독 결제

> [!WARNING]
> Stripe Checkout을 사용해 구독을 등록하려면 Stripe 대시보드에서 `customer.subscription.created` 웹훅을 반드시 활성화해야 합니다. 이 웹훅은 구독 정보를 데이터베이스에 저장하고, 관련 구독 항목도 모두 기록합니다.

Stripe Checkout을 통해 구독을 시작할 수도 있습니다. Cashier의 구독 빌더 메서드를 통해 구독을 정의한 후, `checkout` 메서드를 호출하세요. 고객이 해당 라우트로 이동하면 Stripe Checkout 페이지로 이동하게 됩니다.

```
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

상품 결제와 마찬가지로, 결제 성공 및 취소 시 이동할 URL을 직접 지정할 수도 있습니다.

```
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout([
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

물론, 구독 결제 시에도 프로모션 코드를 활성화할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->allowPromotionCodes()
        ->checkout();
});
```

> [!WARNING]
> Stripe Checkout을 통한 구독 시작 시에는 모든 구독 청구 옵션이 지원되지 않습니다. 구독 빌더의 `anchorBillingCycleOn` 메서드 사용, 청구금액 할당 방식(proration behavior), 결제 방식(payment behavior) 지정은 Stripe Checkout 세션에서는 효과가 없습니다. 어떤 파라미터를 사용할 수 있는지 확인하려면 [Stripe Checkout Session API 문서](https://stripe.com/docs/api/checkout/sessions/create)를 참고하십시오.

<a name="stripe-checkout-trial-periods"></a>
#### Stripe Checkout과 체험 기간

Stripe Checkout으로 완료할 구독 생성 시, 체험 기간도 정의할 수 있습니다.

```
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

단, Stripe Checkout에서 지원하는 최소 체험 기간은 48시간이므로, 체험 기간은 반드시 48시간 이상이어야 합니다.

<a name="stripe-checkout-subscriptions-and-webhooks"></a>
#### 구독과 웹훅

Stripe와 Cashier는 웹훅을 통해 구독 상태를 동기화합니다. 이 때문에 고객이 결제 정보를 입력한 뒤 애플리케이션으로 돌아왔을 때, 구독이 아직 활성화되지 않은 경우도 발생할 수 있습니다. 이러한 상황에는 결제 또는 구독이 처리 중임을 사용자에게 안내하는 메시지를 표시하는 것이 좋습니다.

<a name="collecting-tax-ids"></a>
### 세금 ID(Tax ID) 수집

Checkout은 고객의 세금 ID(Tax ID) 수집도 지원합니다. 체크아웃 세션 생성 시 `collectTaxIds` 메서드를 호출하면 됩니다.

```
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

이 메서드를 호출하면, 고객이 기업 ID로 구매하는 경우를 체크할 수 있는 새로운 체크박스가 나타나며, 고객은 자신의 세금 ID 번호도 입력할 수 있게 됩니다.

> [!WARNING]
> 애플리케이션 서비스 프로바이더에서 [자동 세금 징수 설정](#tax-configuration)을 이미 구성했다면, 이 기능은 자동으로 활성화됩니다. 이런 경우 `collectTaxIds` 메서드를 따로 호출할 필요가 없습니다.

<a name="guest-checkouts"></a>
### 비회원(게스트) 체크아웃

`Checkout::guest` 메서드를 사용해 애플리케이션의 계정이 없는 비회원(게스트) 고객에 대해서도 체크아웃 세션을 시작할 수 있습니다.

```
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()->create('price_tshirt', [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

기존 사용자용 체크아웃 세션 생성 시와 마찬가지로, `Laravel\Cashier\CheckoutBuilder` 인스턴스의 다양한 메서드를 활용해 게스트 체크아웃 세션을 커스터마이즈할 수 있습니다.

```
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()
        ->withPromotionCode('promo-code')
        ->create('price_tshirt', [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

게스트 체크아웃이 완료된 후, Stripe는 `checkout.session.completed` 웹훅 이벤트를 전송할 수 있습니다. 따라서 [Stripe 웹훅을 설정](https://dashboard.stripe.com/webhooks)하여 해당 이벤트가 애플리케이션에 올바르게 전달되도록 해야 합니다. Stripe 대시보드에서 웹훅을 등록했다면, 이후에는 [Cashier로 웹훅을 처리](#handling-stripe-webhooks)하면 됩니다. 웹훅 페이로드에는 [`checkout` 객체](https://stripe.com/docs/api/checkout/sessions/object)가 담기며, 이를 활용해 고객 주문 처리가 가능합니다.

<a name="handling-failed-payments"></a>
## 결제 실패 처리

구독 또는 단건 결제 진행 중 결제가 실패하는 경우가 발생할 수 있습니다. 이때 Cashier는 결제 실패 상황을 알리는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 던집니다. 이 예외를 잡은 후에는 두 가지 방식으로 후속 처리를 할 수 있습니다.

첫째, Cashier에 내장된 결제 확인 전용 페이지로 고객을 리디렉션할 수 있습니다. 이 페이지는 Cashier의 서비스 프로바이더가 이미 등록한 네임드 라우트와 연결되어 있습니다. 따라서 예외를 캐치한 후, 사용자에게 결제 확인 페이지로 리디렉션할 수 있습니다.

```
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $subscription = $user->newSubscription('default', 'price_monthly')
                            ->create($paymentMethod);
} catch (IncompletePayment $exception) {
    return redirect()->route(
        'cashier.payment',
        [$exception->payment->id, 'redirect' => route('home')]
    );
}
```

결제 확인 페이지에서는 고객에게 다시 카드 정보를 입력하도록 안내하거나, Stripe가 요구하는 "3D Secure" 같은 추가 조치를 진행하도록 유도합니다. 결제 완료 후에는 위 코드 예시의 `redirect` 파라미터로 지정한 URL로 다시 이동됩니다. 이때 URL에는 `message`(문자열)와 `success`(정수형) 쿼리 스트링 변수가 추가됩니다. 현재 결제 페이지에서 지원하는 결제 방법은 다음과 같습니다.

<div class="content-list" markdown="1">

- 신용 카드(Credit Cards)
- Alipay
- Bancontact
- BECS Direct Debit
- EPS
- Giropay
- iDEAL
- SEPA Direct Debit

</div>

또는 Stripe가 결제 확인을 대신 처리하도록 할 수도 있습니다. 이 경우, 결제 확인 페이지로 리디렉션하지 않고 Stripe 대시보드에서 [자동 반복 결제 이메일](https://dashboard.stripe.com/account/billing/automatic)을 설정하면 됩니다. 그러나 여전히 `IncompletePayment` 예외가 캐치되는 경우, 사용자가 추가 결제 확인 안내 이메일을 받게 될 것임을 알려주어야 합니다.

결제 예외는 `Billable` 트레이트가 적용된 모델의 `charge`, `invoiceFor`, `invoice` 메서드에서 발생할 수 있습니다. 구독을 다룰 때는 `SubscriptionBuilder`의 `create` 메서드, `Subscription` 및 `SubscriptionItem` 모델의 `incrementAndInvoice`, `swapAndInvoice` 메서드도 불완전 결제 예외를 발생시킬 수 있습니다.

기존 구독이 불완전 결제 상태인지 확인하려면 빌링 가능한 모델 또는 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용합니다.

```
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

구체적인 결제 실패 상태를 확인하려면 예외 인스턴스의 `payment` 속성을 활용하세요.

```
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // 결제 intent 상태 확인...
    $exception->payment->status;

    // 세부 조건별 분기...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a name="confirming-payments"></a>
### 결제 확인(Confirming Payments)

일부 결제 방식은 결제 확인 시 추가 데이터가 필요할 수 있습니다. 예를 들어 SEPA 결제방법은 결제 과정 중 "mandate" 관련 추가 정보가 필요합니다. 이런 데이터는 `withPaymentConfirmationOptions` 메서드를 통해 Cashier에 전달할 수 있습니다.

```
$subscription->withPaymentConfirmationOptions([
    'mandate_data' => '...',
])->swap('price_xxx');

```
결제 확인 시 사용할 수 있는 모든 옵션은 [Stripe API 문서](https://stripe.com/docs/api/payment_intents/confirm)에서 확인할 수 있습니다.

<a name="strong-customer-authentication"></a>
## 강력한 고객 인증(SCA)

여러분의 사업체나 고객 중 일부가 유럽에 기반을 두고 있다면, EU의 강력한 고객 인증(Strong Customer Authentication, SCA) 규정을 반드시 준수해야 합니다. 이 규정은 2019년 9월부터 유럽 연합이 결제 사기를 방지하고자 도입한 규정입니다. Stripe와 Cashier는 SCA 대응 애플리케이션 구현에 이미 대비되어 있습니다.

> [!WARNING]
> 시작하기 전에 [Stripe의 PSD2 및 SCA 안내서](https://stripe.com/guides/strong-customer-authentication)와 [SCA API 관련 공식 문서](https://stripe.com/docs/strong-customer-authentication)를 꼭 확인하십시오.

<a name="payments-requiring-additional-confirmation"></a>
### 추가 인증이 필요한 결제

SCA 규정이 적용되는 경우, 결제 처리를 위해 추가 인증이 필요합니다. 이런 상황이 발생하면 Cashier는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시켜, 더 많은 인증이 필요함을 알립니다. 이러한 예외 처리는 [결제 실패 처리](#handling-failed-payments) 문서에서도 자세히 다루고 있습니다.

Stripe 또는 Cashier가 제공하는 결제 인증 화면은 은행 또는 카드사별 결제 플로우에 따라 맞춤 적용될 수 있습니다. 여기에는 카드 추가 인증, 소액 임시 결제, 별도 디바이스 인증 등 다양한 인증 절차가 포함될 수 있습니다.

<a name="incomplete-and-past-due-state"></a>
#### 불완전 및 연체(Past Due) 상태

결제에 추가 인증이 필요한 경우, 구독은 `stripe_status` 데이터베이스 컬럼에 따라 `incomplete` 또는 `past_due` 상태에 머무르게 됩니다. Cashier는 결제 인증이 완료되어 Stripe로부터 웹훅 알림을 받으면 자동으로 구독을 활성화합니다.

`incomplete` 및 `past_due` 상태에 대한 더 자세한 설명은 [별도 문서](#incomplete-and-past-due-status)를 참고하십시오.

<a name="off-session-payment-notifications"></a>
### 오프 세션 결제 알림

SCA 규정에 따라, 구독이 계속 활성 상태이더라도 주기적으로 결제 정보를 추가 인증해야 하는 경우가 발생할 수 있습니다. 이런 경우 Cashier는 오프 세션 결제 인증이 필요할 때 고객에게 알림(Notification)을 보낼 수 있습니다. 예를 들어, 구독이 갱신되는 시점에 이런 일이 발생할 수 있습니다. Cashier의 결제 알림은 `CASHIER_PAYMENT_NOTIFICATION` 환경 변수에 알림 클래스명을 지정해 활성화할 수 있습니다. 기본적으로 이 알림 기능은 비활성화되어 있습니다. Cashier에 내장된 알림 클래스를 사용할 수도 있고, 원한다면 직접 커스텀 알림 클래스를 지정할 수도 있습니다.

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

오프 세션 결제 인증 알림이 제대로 동작하려면, [Stripe 웹훅이 정상적으로 구성](#handling-stripe-webhooks)되어 있어야 하며 Stripe 대시보드에서 `invoice.payment_action_required` 웹훅도 반드시 활성화해야 합니다. 또한, 여러분의 `Billable` 모델에도 Laravel의 `Illuminate\Notifications\Notifiable` 트레이트가 사용되어 있어야 합니다.

> [!WARNING]
> 알림(Notification)은 고객이 직접 결제 인증을 수행하는 경우에도 전송될 수 있습니다. Stripe에서는 결제 처리가 수동(manual)로 이루어졌는지, "off-session"으로 이루어졌는지 구분하지 않기 때문입니다. 만약 고객이 결제 후 결제 페이지를 다시 방문한다면 "결제 성공" 메시지만 노출되며, 동일 결제를 중복해서 확인하여 이중 결제가 발생하지는 않습니다.

<a name="stripe-sdk"></a>
## Stripe SDK

Cashier의 많은 객체는 Stripe SDK 객체의 래퍼(wrapper)입니다. Stripe의 원본 객체에 직접 접근하고 싶다면, `asStripe` 메서드를 이용해 쉽게 받아올 수 있습니다.

```
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

Stripe 구독을 직접 업데이트하려면 `updateStripeSubscription` 메서드를 사용할 수도 있습니다.

```
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

`Stripe\StripeClient` 클라이언트를 직접 사용하고 싶다면 `Cashier` 클래스의 `stripe` 메서드를 호출하시면 됩니다. 예를 들어, Stripe 계정의 가격 정보를 가져오는 코드는 다음과 같습니다.

```
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a name="testing"></a>
## 테스트

Cashier를 사용하는 애플리케이션을 테스트할 때, Stripe API로의 실제 HTTP 요청을 Mocking(가짜 처리)할 수도 있지만, 이 경우 Cashier의 동작 일부를 직접 구현해야 하므로 추천하지 않습니다. 실제 Stripe API를 호출하는 실통신 테스트가 약간 느릴 수는 있지만, 그만큼 테스트 신뢰도는 더 높고 느린 테스트들은 별도의 PHPUnit 그룹으로 분류해 관리하면 됩니다.

테스트 시 Cashier 자체에도 이미 충분한 테스트 스위트가 포함되어 있으니, 여러분은 애플리케이션의 구독/결제 흐름만 집중 테스트하면 됩니다. Cashier의 내부 동작까지 모두 검증할 필요는 없습니다.

먼저 테스트용 Stripe Secret Key를 `phpunit.xml`에 다음과 같이 추가하세요.

```
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

이제 테스트에서 Cashier를 사용할 때마다 Stripe 테스트 환경으로 실제 API 요청이 전송됩니다. 편의를 위해 Stripe 테스트 계정에 테스트용 구독/가격을 미리 준비해두면 좋습니다.

> [!NOTE]
> 신용카드 거절, 결제 실패 등 다양한 시나리오를 테스트하려면, Stripe에서 제공하는 [테스트 카드 번호와 토큰](https://stripe.com/docs/testing)을 활용하실 수 있습니다.