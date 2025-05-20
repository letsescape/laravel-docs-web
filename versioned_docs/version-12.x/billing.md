# 라라벨 Cashier, Stripe (Laravel Cashier (Stripe))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
- [환경설정](#configuration)
    - [빌링 모델](#billable-model)
    - [API 키](#api-keys)
    - [통화 설정](#currency-configuration)
    - [세금 설정](#tax-configuration)
    - [로깅](#logging)
    - [커스텀 모델 사용](#using-custom-models)
- [빠른 시작](#quickstart)
    - [상품 판매](#quickstart-selling-products)
    - [구독 판매](#quickstart-selling-subscriptions)
- [고객](#customers)
    - [고객 조회](#retrieving-customers)
    - [고객 생성](#creating-customers)
    - [고객 정보 수정](#updating-customers)
    - [잔액](#balances)
    - [세금 ID](#tax-ids)
    - [Stripe와 고객 데이터 동기화](#syncing-customer-data-with-stripe)
    - [청구 포털](#billing-portal)
- [결제 수단](#payment-methods)
    - [결제 수단 저장](#storing-payment-methods)
    - [결제 수단 조회](#retrieving-payment-methods)
    - [결제 수단 존재 여부 확인](#payment-method-presence)
    - [기본 결제 수단 업데이트](#updating-the-default-payment-method)
    - [결제 수단 추가](#adding-payment-methods)
    - [결제 수단 삭제](#deleting-payment-methods)
- [구독](#subscriptions)
    - [구독 생성](#creating-subscriptions)
    - [구독 상태 확인](#checking-subscription-status)
    - [가격 변경](#changing-prices)
    - [구독 수량 설정](#subscription-quantity)
    - [여러 상품 구독](#subscriptions-with-multiple-products)
    - [복수 구독](#multiple-subscriptions)
    - [사용량 기반 청구](#usage-based-billing)
    - [구독 세금](#subscription-taxes)
    - [구독 기준 날짜(Anchor Date)](#subscription-anchor-date)
    - [구독 취소](#cancelling-subscriptions)
    - [구독 재개](#resuming-subscriptions)
- [구독 체험(Trial)](#subscription-trials)
    - [결제 수단 선등록 시 체험](#with-payment-method-up-front)
    - [결제 수단 없이 체험](#without-payment-method-up-front)
    - [체험 기간 연장](#extending-trials)
- [Stripe Webhook 처리](#handling-stripe-webhooks)
    - [Webhook 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [Webhook 서명 검증](#verifying-webhook-signatures)
- [단일 결제(1회 결제)](#single-charges)
    - [간단 결제](#simple-charge)
    - [인보이스 결제](#charge-with-invoice)
    - [결제 인텐트 생성](#creating-payment-intents)
    - [결제 환불](#refunding-charges)
- [체크아웃](#checkout)
    - [상품 체크아웃](#product-checkouts)
    - [단일 결제 체크아웃](#single-charge-checkouts)
    - [구독 체크아웃](#subscription-checkouts)
    - [세금 ID 수집](#collecting-tax-ids)
    - [비회원 체크아웃](#guest-checkouts)
- [인보이스(청구서)](#invoices)
    - [인보이스 조회](#retrieving-invoices)
    - [예정 인보이스 확인](#upcoming-invoices)
    - [구독 인보이스 미리보기](#previewing-subscription-invoices)
    - [인보이스 PDF 생성](#generating-invoice-pdfs)
- [결제 실패 처리](#handling-failed-payments)
    - [결제 확인](#confirming-payments)
- [강력한 고객 인증(SCA)](#strong-customer-authentication)
    - [추가 인증이 필요한 결제](#payments-requiring-additional-confirmation)
    - [오프 세션 결제 알림](#off-session-payment-notifications)
- [Stripe SDK](#stripe-sdk)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe)는 [Stripe](https://stripe.com)의 구독(Subscription) 결제 서비스를 쉽고 유연하게 다룰 수 있도록 도와주는 인터페이스를 제공합니다. Cashier를 사용하면 반복적인 구독 결제 관련 코드 대부분을 직접 작성하지 않아도 됩니다. 기본적인 구독 관리 뿐 아니라, 쿠폰 적용, 구독 변경, 구독 "수량" 처리, 취소 유예 기간, 인보이스 PDF 생성 기능까지 지원합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier를 새 버전으로 업그레이드하기 전에는 반드시 [업그레이드 가이드](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.md)를 꼼꼼히 확인해야 합니다.

> [!WARNING]
> 예기치 않은 변화로 인한 장애를 막기 위해, Cashier는 고정된 Stripe API 버전을 사용합니다. Cashier 15 버전에서는 Stripe API 버전 `2023-10-16`을 사용합니다. Stripe API 버전은 Stripe의 새로운 기능과 개선 사항을 활용하기 위해 마이너 릴리즈 때마다 업데이트될 수 있습니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 매니저를 사용해 Stripe용 Cashier 패키지를 설치합니다.

```shell
composer require laravel/cashier
```

패키지 설치 후, `vendor:publish` Artisan 명령어로 Cashier의 마이그레이션을 배포합니다.

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

그 다음, 데이터베이스 마이그레이션을 실행합니다.

```shell
php artisan migrate
```

이렇게 하면, Cashier의 마이그레이션이 `users` 테이블에 여러 컬럼을 추가하고, 모든 고객의 구독 정보를 담을 `subscriptions` 테이블과, 여러 가격이 포함된 구독을 위한 `subscription_items` 테이블을 생성합니다.

필요하다면, `vendor:publish` Artisan 명령어를 사용해 Cashier의 환경설정 파일도 배포할 수 있습니다.

```shell
php artisan vendor:publish --tag="cashier-config"
```

마지막으로 Stripe 관련 이벤트를 Cashier가 올바르게 처리할 수 있도록, [Cashier의 webhook 처리 기능](#handling-stripe-webhooks)을 꼭 설정해야 합니다.

> [!WARNING]
> Stripe에서는 Stripe 식별자(Stripe ID 등)를 저장하는 컬럼은 대소문자 구분이 반드시 필요하다고 권고합니다. 따라서 MySQL을 사용할 경우 `stripe_id` 컬럼의 collation을 `utf8_bin`으로 설정했는지 확인해야 합니다. 이에 대한 자세한 내용은 [Stripe 문서](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible)를 참고하세요.

<a name="configuration"></a>
## 환경설정

<a name="billable-model"></a>
### 빌링 모델

Cashier를 사용하기 전에 결제(빌링) 가능한 모델 정의에 `Billable` 트레이트를 추가해야 합니다. 일반적으로 `App\Models\User` 모델에 추가하게 됩니다. 이 트레이트를 적용하면 구독 생성, 쿠폰 적용, 결제 수단 정보 업데이트 등 자주 쓰는 결제용 메서드를 사용할 수 있습니다.

```php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Cashier는 기본적으로 라라벨의 `App\Models\User` 클래스를 결제 가능한 모델로 가정합니다. 만약 이를 변경하고 싶다면 `useCustomerModel` 메서드를 사용해 다른 모델을 지정할 수 있습니다. 일반적으로 `AppServiceProvider`의 `boot` 메서드 내에서 호출하면 됩니다.

```php
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

> [!WARNING]
> 라라벨 기본 `App\Models\User`가 아닌 다른 모델을 사용하는 경우, [Cashier 마이그레이션](#installation)을 직접 배포하고, 해당 모델의 테이블명에 맞게 수정해야 합니다.

<a name="api-keys"></a>
### API 키

다음으로, 라라벨 애플리케이션의 `.env` 파일에 Stripe API 키를 설정해야 합니다. Stripe 대시보드에서 API 키를 발급 받으실 수 있습니다.

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> [!WARNING]
> 웹훅이 실제로 Stripe에서 온 것임을 검증하기 위해, `STRIPE_WEBHOOK_SECRET` 환경 변수도 `.env` 파일에 반드시 정의되어 있어야 합니다.

<a name="currency-configuration"></a>
### 통화 설정

Cashier의 기본 통화는 미국 달러(USD)입니다. 애플리케이션의 `.env` 파일에 `CASHIER_CURRENCY` 환경 변수를 설정하면 기본 통화를 변경할 수 있습니다.

```ini
CASHIER_CURRENCY=eur
```

Cashier의 통화 설정과 더불어, 인보이스 등 금액을 표시할 때 사용되는 지역(locale)도 지정할 수 있습니다. 내부적으로 Cashier는 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 사용하여 화폐 표시에 로케일을 적용합니다.

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> `en` 이외의 로케일을 사용하려면 서버에 `ext-intl` PHP 확장 모듈이 설치되어 활성화되어 있어야 합니다.

<a name="tax-configuration"></a>
### 세금 설정

[Stripe Tax](https://stripe.com/tax) 기능을 이용하면 Stripe가 발행하는 모든 인보이스(청구서)에 대해 세금을 자동으로 계산할 수 있습니다. 자동 세금 계산을 활성화하려면 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `calculateTaxes` 메서드를 호출하세요.

```php
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::calculateTaxes();
}
```

세금 계산이 활성화되면 새 구독이나 1회성 인보이스를 생성할 때마다 자동으로 세금이 계산됩니다.

이 기능이 제대로 작동하려면 고객의 이름, 주소, 세금 ID 등 결제 관련 정보가 Stripe와 동기화되어 있어야 합니다. [고객 데이터 동기화](#syncing-customer-data-with-stripe), [세금 ID](#tax-ids) 등의 Cashier 메서드를 활용해 이를 처리할 수 있습니다.

<a name="logging"></a>
### 로깅

Cashier는 Stripe 관련 치명적 오류 발생 시 어떤 로그 채널에 기록할 것인지 설정할 수 있습니다. 애플리케이션의 `.env` 파일에 `CASHIER_LOGGER` 환경 변수를 지정하세요.

```ini
CASHIER_LOGGER=stack
```

Stripe로의 API 호출에서 발생한 예외는 애플리케이션의 기본 로그 채널을 통해 기록됩니다.

<a name="using-custom-models"></a>
### 커스텀 모델 사용

Cashier가 내부적으로 사용하는 모델들을 확장해서 여러분만의 커스텀 모델로 교체할 수도 있습니다. 직접 모델을 정의하고, 관련 Cashier 모델을 확장(extends)해 주세요.

```php
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

이렇게 모델을 정의한 후, `Laravel\Cashier\Cashier` 클래스를 통해 Cashier가 커스텀 모델을 사용하도록 지정합니다. 보통은 애플리케이션의 `App\Providers\AppServiceProvider`의 `boot` 메서드에서 아래처럼 설정합니다.

```php
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
### 상품 판매

> [!NOTE]
> Stripe Checkout을 사용하기 전에, Stripe 대시보드에서 고정 가격의 상품을 먼저 등록해 두어야 합니다. 또한 [Cashier의 webhook 처리](#handling-stripe-webhooks)도 반드시 설정하세요.

애플리케이션을 통한 상품 및 구독 결제 기능 구현은 다소 막막하게 느껴질 수 있습니다. 하지만 Cashier와 [Stripe Checkout](https://stripe.com/payments/checkout) 덕분에, 현대적인 결제 시스템을 쉽게 구축할 수 있습니다.

반복 결제가 아닌 1회성 상품에 대한 결제는 Cashier를 사용해 고객을 Stripe Checkout으로 리다이렉트하는 방식으로 처리합니다. 고객이 Checkout에서 결제 정보를 입력해 결제를 완료하면, 지정한 성공(성공시) URL로 리디렉션됩니다.

```php
use Illuminate\Http\Request;

Route::get('/checkout', function (Request $request) {
    $stripePriceId = 'price_deluxe_album';

    $quantity = 1;

    return $request->user()->checkout([$stripePriceId => $quantity], [
        'success_url' => route('checkout-success'),
        'cancel_url' => route('checkout-cancel'),
    ]);
})->name('checkout');

Route::view('/checkout/success', 'checkout.success')->name('checkout-success');
Route::view('/checkout/cancel', 'checkout.cancel')->name('checkout-cancel');
```

위 예시에서처럼, Cashier에서 제공하는 `checkout` 메서드를 통해 지정한 "가격 식별자"로 Stripe Checkout으로 고객을 리다이렉트할 수 있습니다. Stripe에서는 "Prices"가 [특정 상품에 대한 가격 정보](https://stripe.com/docs/products-prices/how-products-and-prices-work)를 의미합니다.

필요하다면, `checkout` 메서드는 Stripe 내에 고객을 자동으로 생성하고, 그 정보를 애플리케이션의 사용자와 연결시켜 줍니다. 결제가 완료되면 고객은 성공 또는 취소 페이지로 이동하며, 해당 페이지에서 고객에게 안내 메시지를 표시할 수 있습니다.

<a name="providing-meta-data-to-stripe-checkout"></a>
#### Stripe Checkout에 메타데이터 제공하기

상품을 판매할 때, 완료된 주문과 구매 상품을 추적할 목적으로 보통 애플리케이션에 직접 `Cart`, `Order` 모델을 구현합니다. Stripe Checkout으로 결제 처리 시, 기존 주문의 식별자를 제공해 완료된 구매를 애플리케이션의 주문 데이터와 연동하고 싶을 때가 많습니다.

이럴 땐 `checkout` 메서드에 `metadata` 배열을 추가로 전달하면 됩니다. 예를 들어, 사용자가 체크아웃을 시작할 때 사전에 `Order` 테이블에 주문을 만듭니다. (참고: `Cart`, `Order` 모델은 예시일 뿐이며, Cashier에서 제공하지 않으므로 애플리케이션 요구사항에 맞게 직접 구현해야 합니다.)

```php
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

위 예시에서 볼 수 있듯이, 사용자가 체크아웃을 시작하면 장바구니/주문과 연결된 Stripe 가격 식별자 전체를 `checkout` 메서드에 전달합니다. 이처럼 장바구니 또는 주문에 포함된 항목들을 고객이 추가하는 대로 애플리케이션 로직으로 관리하고, 주문의 ID를 `metadata` 배열을 통해 Stripe Checkout 세션에 넘깁니다. 그리고 체크아웃 성공 라우트에 `CHECKOUT_SESSION_ID` 템플릿 변수를 추가하였는데, Stripe에서 고객이 다시 애플리케이션으로 돌아오면 이 변수가 자동으로 체크아웃 세션 ID로 채워집니다.

다음으로는 실제 결제 성공 라우트를 구현해보겠습니다. 사용자가 Stripe Checkout에서 결제를 마치고 돌아올 때 이 라우트가 호출되며, 여기서 Stripe Checkout 세션 ID와 관련 세션 정보를 불러와 메타데이터를 사용해 주문 상태를 갱신할 수 있습니다.

```php
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

Stripe Checkout 세션 오브젝트에 포함된 데이터에 대해서는 [Stripe 공식 문서](https://stripe.com/docs/api/checkout/sessions/object)를 참고하세요.

<a name="quickstart-selling-subscriptions"></a>
### 구독 판매

> [!NOTE]
> Stripe Checkout을 사용하기 전에, Stripe 대시보드에서 고정 가격의 상품을 먼저 등록해 두어야 합니다. 또한 [Cashier의 webhook 처리](#handling-stripe-webhooks)도 반드시 설정하세요.

애플리케이션을 통한 상품 및 구독 결제 기능 구현은 다소 막막하게 느껴질 수 있습니다. 하지만 Cashier와 [Stripe Checkout](https://stripe.com/payments/checkout) 덕분에, 현대적인 결제 시스템을 쉽게 구축할 수 있습니다.

Cashier와 Stripe Checkout을 사용해 구독을 판매하는 방법을 간단한 사례로 살펴보겠습니다. 예를 들어, 월간(`price_basic_monthly`), 연간(`price_basic_yearly`) 두 개의 요금제를 제공하는 구독 서비스가 있다고 가정합니다. 이 두 가격은 Stripe 대시보드에서 "Basic"이라는 상품(`pro_basic`) 하위에 묶어둘 수 있습니다. 필요에 따라 전문가용 플랜은 `pro_expert` 등으로 추가할 수 있습니다.

고객이 서비스에 가입하는 흐름을 살펴보겠습니다. 예를 들어, 애플리케이션 가격표에서 고객이 Basic 플랜의 "구독" 버튼을 클릭하면 구독에 대한 Stripe Checkout 세션을 만드는 라라벨 라우트로 이동할 수 있습니다.

```php
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

위 예시에서처럼, 고객은 Stripe Checkout 세션으로 리다이렉트되어 Basic 플랜에 가입할 수 있습니다. 결제가 성공하거나 취소될 경우, 지정한 URL로 리디렉션됩니다. 일부 결제 수단은 실제 결제 완료까지 시간이 걸릴 수 있으므로, 구독이 실제로 시작되었는지 확인하려면 반드시 [Cashier의 webhook 처리](#handling-stripe-webhooks)를 같이 설정해야 합니다.

이제 고객이 실제로 구독을 시작할 수 있게 되었으므로, 구독 중인 사용자만 접근 가능한 영역을 애플리케이션 내에서 제한하는 것이 필요하겠죠. Cashier의 `Billable` 트레이트에서 제공하는 `subscribed` 메서드를 활용해 특정 사용자의 구독 상태를 쉽게 확인할 수 있습니다.

```blade
@if ($user->subscribed())
    <p>구독 중입니다.</p>
@endif
```

또한 사용자가 특정 상품이나 가격에 구독 중인지도 손쉽게 확인할 수 있습니다.

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>Basic 상품에 구독 중입니다.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>Basic 월간 요금제에 구독 중입니다.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### 구독 여부 체크 미들웨어 만들기

보다 편리하게 구현하고 싶다면, 요청이 구독 중인 사용자에게서 온 것인지 판단하는 [미들웨어](/docs/12.x/middleware)를 만들 수도 있습니다. 미들웨어를 만들면 구독 중이 아닌 사용자가 라우트에 접근하지 못하도록 쉽게 제어할 수 있습니다.

```php
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
            // 결제 페이지로 리다이렉트하여 구독을 유도합니다...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

이후에는 해당 미들웨어를 라우트에 할당하면 됩니다.

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### 고객이 직접 구독 요금제를 관리할 수 있게 하기

고객은 자신의 구독 플랜을 다른 상품이나 "티어"로 변경하고 싶어할 수도 있습니다. 가장 간단한 방법은 Stripe의 [고객 청구 포털(Customer Billing Portal)](https://stripe.com/docs/no-code/customer-portal)로 리다이렉트하는 것입니다. 이 포털은 고객이 직접 인보이스를 다운로드하고, 결제 수단을 변경하며, 구독 플랜도 바꿀 수 있는 Stripe 제공 대시보드입니다.

우선 애플리케이션 내에 아래와 같이 Laravel 라우트로 이동하는 링크나 버튼을 정의합니다.

```blade
<a href="{{ route('billing') }}">
    결제 관리
</a>
```

다음으로, Stripe 고객 청구 포털 세션을 시작하고 포털로 리다이렉트하는 라우트를 정의합니다. `redirectToBillingPortal` 메서드에는 포털 이용을 마친 뒤 돌아올 URL을 인자로 넘깁니다.

```php
use Illuminate\Http\Request;

Route::get('/billing', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('dashboard'));
})->middleware(['auth'])->name('billing');
```

> [!NOTE]
> Cashier의 webhook 처리가 설정되어 있는 한, Stripe에서 들어오는 webhook을 Cashier가 수신 및 처리하여 애플리케이션의 관련 데이터베이스 테이블을 자동으로 동기화합니다. 예를 들어, 사용자가 Stripe 고객 청구 포털에서 구독을 취소하면, Cashier는 해당 webhook을 받아서 구독을 "취소됨" 상태로 데이터베이스에 반영합니다.

<a name="customers"></a>
## 고객

<a name="retrieving-customers"></a>
### 고객 조회

`Cashier::findBillable` 메서드를 사용하면 Stripe ID로 고객을 조회할 수 있습니다. 이 메서드는 결제 모델 인스턴스를 반환합니다.

```php
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a name="creating-customers"></a>
### 고객 생성

경우에 따라 구독을 시작하지 않고 Stripe 고객만 미리 생성해야 할 수도 있습니다. 이럴 때는 `createAsStripeCustomer` 메서드를 사용하세요.

```php
$stripeCustomer = $user->createAsStripeCustomer();
```

고객이 Stripe에 생성된 이후에는, 나중에 구독을 시작해도 됩니다. Stripe 고객 생성 시 추가 파라미터를 넣고 싶다면, [Stripe API에서 지원하는 고객 생성 파라미터](https://stripe.com/docs/api/customers/create)를 `$options` 배열로 전달할 수 있습니다.

```php
$stripeCustomer = $user->createAsStripeCustomer($options);
```

`asStripeCustomer` 메서드를 사용해 결제 모델에 연결된 Stripe 고객 객체를 직접 반환받을 수도 있습니다.

```php
$stripeCustomer = $user->asStripeCustomer();
```

`createOrGetStripeCustomer` 메서드를 활용하면, Stripe에 이미 고객이 존재하는지 확실하지 않을 때 해당 객체를 조회하거나 없으면 새로 생성할 수 있습니다.

```php
$stripeCustomer = $user->createOrGetStripeCustomer();
```

<a name="updating-customers"></a>
### 고객 정보 수정

가끔 Stripe의 고객 정보를 직접 수정해야 할 때는 `updateStripeCustomer` 메서드를 사용할 수 있습니다. 이 메서드는 [Stripe API에서 지원하는 고객 업데이트 옵션](https://stripe.com/docs/api/customers/update) 배열을 인자로 받습니다.

```php
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a name="balances"></a>
### 잔액

Stripe에서는 고객의 "잔액(balance)"을 수동으로 입금 또는 차감할 수 있습니다. 나중에는 이 잔액이 새 인보이스에 자동으로 반영됩니다. 고객의 전체 잔액은 빌링 모델에 있는 `balance` 메서드로 확인할 수 있으며, 이 메서드는 고객의 통화로 포맷된 문자열을 반환합니다.

```php
$balance = $user->balance();
```

고객 잔액을 충전(credit)하려면 `creditBalance` 메서드에 값을 전달하면 됩니다. 필요하다면 설명도 함께 넣을 수 있습니다.

```php
$user->creditBalance(500, '프리미엄 고객 충전.');
```

`debitBalance` 메서드에 값을 전달하면 고객의 잔액이 차감됩니다.

```php
$user->debitBalance(300, '잘못된 사용 패널티.');
```

`applyBalance` 메서드는 고객에게 새 잔액 거래(트랜잭션)를 생성합니다. `balanceTransactions` 메서드로 이 트랜잭션 레코드를 조회할 수 있으므로, 고객이 직접 확인 가능한 입·출금 내역 로그를 제공할 때 유용합니다.

```php
// 전체 트랜잭션 조회
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // 트랜잭션 금액
    $amount = $transaction->amount(); // $2.31

    // 관련 인보이스가 있다면 조회 가능
    $invoice = $transaction->invoice();
}
```

<a name="tax-ids"></a>
### 세금 ID

Cashier는 고객의 세금 ID 관리를 위한 쉬운 방법도 지원합니다. 예를 들어, `taxIds` 메서드를 사용하면 고객에 할당된 [모든 세금 ID](https://stripe.com/docs/api/customer_tax_ids/object)를 컬렉션으로 가져올 수 있습니다.

```php
$taxIds = $user->taxIds();
```

또한 특정 세금 ID 식별자로 고객의 세금 ID 하나만 조회할 수도 있습니다.

```php
$taxId = $user->findTaxId('txi_belgium');
```

`createTaxId` 메서드는 Stripe가 지원하는 [type](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type)과 값(value)을 입력해 새 Tax ID를 생성합니다.

```php
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

`createTaxId` 메서드는 즉시 VAT ID를 고객 계정에 추가합니다. [VAT ID의 검증](https://stripe.com/docs/invoicing/customer/tax-ids#validation)은 Stripe에서 비동기로 이루어집니다. 검증 결과를 실시간으로 받아보고 싶다면, `customer.tax_id.updated` webhook 이벤트를 구독하고, [VAT ID의 `verification` 파라미터](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification)를 확인하면 됩니다. webhook 관련 자세한 내용은 [Webhook 핸들러 정의 문서](#handling-stripe-webhooks)를 참고하세요.

삭제는 `deleteTaxId` 메서드를 사용합니다.

```php
$user->deleteTaxId('txi_belgium');
```

<a name="syncing-customer-data-with-stripe"></a>

### Stripe와 고객 데이터 동기화

일반적으로, 애플리케이션 사용자가 이름, 이메일 주소 등 Stripe에도 저장되어 있는 정보를 업데이트할 때마다 Stripe에도 해당 변경 사항을 알려주는 것이 좋습니다. 이렇게 하면 Stripe에 저장된 정보와 애플리케이션의 정보가 항상 일치하게 됩니다.

이 작업을 자동화하려면, 청구 대상(billable) 모델의 `updated` 이벤트에 반응하는 이벤트 리스너를 정의할 수 있습니다. 이벤트 리스너 내부에서는 모델의 `syncStripeCustomerDetails` 메서드를 호출하면 됩니다.

```php
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

이제 고객 모델이 업데이트될 때마다 해당 정보가 Stripe와 동기화됩니다. 편의상, Cashier는 고객이 최초로 생성될 때 자동으로 Stripe와 정보 동기화를 수행합니다.

Stripe에 동기화될 고객 정보 컬럼을 커스터마이즈하려면 Cashier에서 제공하는 다양한 메서드를 오버라이드하면 됩니다. 예를 들어, Cashier가 고객 정보 동기화 시 Stripe에 넘겨줄 "이름" 값을 커스터마이즈하려면 `stripeName` 메서드를 오버라이드할 수 있습니다.

```php
/**
 * Stripe에 동기화할 고객 이름을 반환합니다.
 */
public function stripeName(): string|null
{
    return $this->company_name;
}
```

이와 비슷하게, `stripeEmail`, `stripePhone`, `stripeAddress`, `stripePreferredLocales` 메서드도 오버라이드할 수 있습니다. 이 메서드들은 [Stripe 고객 객체를 업데이트할 때](https://stripe.com/docs/api/customers/update) 각 고객 파라미터에 매핑되어 정보를 동기화합니다. 고객 데이터 동기화 과정을 전체적으로 제어하고 싶다면 `syncStripeCustomerDetails` 메서드를 직접 오버라이드할 수도 있습니다.

<a name="billing-portal"></a>
### 결제 포털

Stripe는 [간편하게 결제 포털을 설정할 수 있는 방법](https://stripe.com/docs/billing/subscriptions/customer-portal)을 제공합니다. 이를 통해 고객이 직접 구독, 결제수단, 결제 내역 등을 관리할 수 있습니다. 컨트롤러나 라우트에서 청구 대상 모델의 `redirectToBillingPortal` 메서드를 호출해 사용자를 결제 포털로 리다이렉트할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

기본적으로, 사용자가 결제 포털에서 관리를 마치면 Stripe 포털 내 링크를 통해 애플리케이션의 `home` 라우트로 돌아오게 됩니다. 사용자가 돌아올 URL을 커스터마이즈하고 싶다면 `redirectToBillingPortal` 메서드의 인수로 해당 URL을 넘기면 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

HTTP 리다이렉트 응답을 생성하지 않고 결제 포털의 URL만 생성하고 싶다면, `billingPortalUrl` 메서드를 사용할 수 있습니다.

```php
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a name="payment-methods"></a>
## 결제수단 관리

<a name="storing-payment-methods"></a>
### 결제수단 저장

Stripe에서 구독을 생성하거나 1회성 결제를 진행하려면 먼저 결제수단을 저장하고 Stripe에서 결제수단 식별자를 받아와야 합니다. 결제수단을 사용하는 목적(구독 또는 1회성 결제)에 따라 접근 방식이 달라지므로, 두 가지 경우를 아래에서 각각 살펴봅니다.

<a name="payment-methods-for-subscriptions"></a>
#### 구독을 위한 결제수단

고객의 신용카드 정보를 추후 구독 결제에 사용할 목적으로 저장하려면 Stripe의 "Setup Intents" API를 사용해 결제수단 정보를 안전하게 수집해야 합니다. "Setup Intent"는 Stripe에 결제수단 정보를 청구할 의도가 있음을 알려주는 역할을 합니다. Cashier의 `Billable` 트레이트에는 간편하게 Setup Intent를 생성할 수 있는 `createSetupIntent` 메서드가 포함되어 있습니다. 이 메서드를 결제수단 정보를 입력받는 폼을 렌더링하는 라우트 또는 컨트롤러에서 호출해야 합니다.

```php
return view('update-payment-method', [
    'intent' => $user->createSetupIntent()
]);
```

Setup Intent를 생성해 뷰로 전달했다면, 해당 Setup Intent의 secret 값을 결제수단 입력 요소에 함께 제공해야 합니다. 예를 들어, 아래와 같은 "결제수단 업데이트" 폼을 생각해볼 수 있습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    Update Payment Method
</button>
```

다음으로 Stripe.js 라이브러리를 이용해 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 연결하고, 고객의 결제 정보를 안전하게 수집합니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

이제, [Stripe의 `confirmCardSetup` 메서드](https://stripe.com/docs/js/setup_intents/confirm_card_setup)를 활용해 카드 정보를 검증하고 Stripe에서 안전한 결제수단 식별자를 받아올 수 있습니다.

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
        // 사용자에게 "error.message"를 표시하세요...
    } else {
        // 카드가 성공적으로 인증되었습니다...
    }
});
```

Stripe에서 카드 인증이 완료되면, 그 결과로 생성된 `setupIntent.payment_method` 식별자를 라라벨 애플리케이션에 전달해 고객에게 결제수단을 연결할 수 있습니다. 결제수단은 [새 결제수단으로 추가](#adding-payment-methods)하거나 [기본 결제수단을 업데이트](#updating-the-default-payment-method)하는 데 사용할 수 있습니다. 또는 결제수단 식별자를 즉시 활용해 [새 구독을 생성](#creating-subscriptions)할 수도 있습니다.

> [!NOTE]
> Setup Intent 및 고객 결제 정보 수집에 대한 자세한 내용은 [Stripe에서 제공하는 설명서](https://stripe.com/docs/payments/save-and-reuse#php)를 참고하세요.

<a name="payment-methods-for-single-charges"></a>
#### 1회성 결제를 위한 결제수단

고객의 결제수단으로 1회성 결제를 진행할 때는 결제수단 식별자를 한 번만 사용하면 충분합니다. Stripe의 정책상, 1회성 결제에는 저장된 기본 결제수단을 이용할 수 없으므로 고객이 Stripe.js 라이브러리를 통해 직접 결제수단 정보를 입력하도록 해야 합니다. 예를 들어, 다음과 같은 폼을 사용할 수 있습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button">
    Process Payment
</button>
```

이와 같은 폼을 정의한 후, Stripe.js 라이브러리를 이용해 [Stripe Element](https://stripe.com/docs/stripe-js)를 연결하고 고객의 결제 정보를 안전하게 수집합니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

이제, [Stripe의 `createPaymentMethod` 메서드](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method)를 사용하여 카드를 검증하고 Stripe에서 안전한 결제수단 식별자를 받아올 수 있습니다.

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
        // 사용자에게 "error.message"를 표시하세요...
    } else {
        // 카드가 성공적으로 인증되었습니다...
    }
});
```

카드가 정상적으로 인증되면, `paymentMethod.id`를 라라벨 애플리케이션에 전달해 [1회성 결제](#simple-charge)를 처리할 수 있습니다.

<a name="retrieving-payment-methods"></a>
### 결제수단 조회

청구 대상 모델 인스턴스에서 `paymentMethods` 메서드를 호출하면 `Laravel\Cashier\PaymentMethod` 인스턴스들의 컬렉션이 반환됩니다.

```php
$paymentMethods = $user->paymentMethods();
```

기본적으로 이 메서드는 모든 유형의 결제수단을 반환합니다. 특정 결제수단 타입만 조회하려면 인수로 타입을 넘기면 됩니다.

```php
$paymentMethods = $user->paymentMethods('sepa_debit');
```

고객의 기본 결제수단을 조회하려면 `defaultPaymentMethod` 메서드를 사용할 수 있습니다.

```php
$paymentMethod = $user->defaultPaymentMethod();
```

청구 대상 모델에 연결된 특정 결제수단을 조회하려면 `findPaymentMethod` 메서드를 사용할 수 있습니다.

```php
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a name="payment-method-presence"></a>
### 결제수단 존재 여부 확인

계정에 기본 결제수단이 연결되어 있는지 확인하려면 `hasDefaultPaymentMethod` 메서드를 사용하면 됩니다.

```php
if ($user->hasDefaultPaymentMethod()) {
    // ...
}
```

최소한 하나라도 결제수단이 연결되어 있는지 확인하려면 `hasPaymentMethod` 메서드를 사용할 수 있습니다.

```php
if ($user->hasPaymentMethod()) {
    // ...
}
```

이 메서드는 청구 대상 모델에 어떤 결제수단이라도 있는지 판단합니다. 특정 결제수단 타입의 존재 여부를 확인하려면 타입을 인수로 넘겨주면 됩니다.

```php
if ($user->hasPaymentMethod('sepa_debit')) {
    // ...
}
```

<a name="updating-the-default-payment-method"></a>
### 기본 결제수단 업데이트

고객의 기본 결제수단을 업데이트하려면 `updateDefaultPaymentMethod` 메서드를 사용하면 됩니다. 이 메서드는 Stripe 결제수단 식별자를 인수로 받아 새 결제수단을 기본 결제수단으로 지정합니다.

```php
$user->updateDefaultPaymentMethod($paymentMethod);
```

Stripe에 저장된 고객의 기본 결제수단 정보와 동기화하려면 `updateDefaultPaymentMethodFromStripe` 메서드를 사용할 수 있습니다.

```php
$user->updateDefaultPaymentMethodFromStripe();
```

> [!WARNING]
> Stripe의 정책상, 고객의 기본 결제수단은 인보이스 발행이나 신규 구독 생성에만 사용할 수 있습니다. 1회성 결제에는 사용이 불가하니 유의하세요.

<a name="adding-payment-methods"></a>
### 결제수단 추가

새 결제수단을 추가하려면 청구 대상 모델에서 `addPaymentMethod` 메서드를 호출하고 결제수단 식별자를 넘기면 됩니다.

```php
$user->addPaymentMethod($paymentMethod);
```

> [!NOTE]
> 결제수단 식별자 획득 방법은 [결제수단 저장 문서](#storing-payment-methods)를 참고하세요.

<a name="deleting-payment-methods"></a>
### 결제수단 삭제

결제수단을 삭제하려면, 삭제할 `Laravel\Cashier\PaymentMethod` 인스턴스에서 `delete` 메서드를 호출하면 됩니다.

```php
$paymentMethod->delete();
```

`deletePaymentMethod` 메서드는 청구 대상 모델에서 특정 결제수단을 삭제합니다.

```php
$user->deletePaymentMethod('pm_visa');
```

`deletePaymentMethods` 메서드는 청구 대상 모델에 등록된 모든 결제수단 정보를 삭제합니다.

```php
$user->deletePaymentMethods();
```

이 메서드는 기본적으로 모든 타입의 결제수단을 삭제합니다. 특정 타입의 결제수단만 삭제하고 싶다면 타입을 인수로 넘기면 됩니다.

```php
$user->deletePaymentMethods('sepa_debit');
```

> [!WARNING]
> 사용자가 활성 구독을 가지고 있다면, 애플리케이션에서 기본 결제수단 삭제를 허용해서는 안 됩니다.

<a name="subscriptions"></a>
## 구독(Subscriptions)

구독은 고객에게 정기 결제 기능을 제공하는 방법입니다. Cashier에서 관리하는 Stripe 구독은 여러 가격(Price) 지원, 구독 수량(Quantity), 체험 기간(Trial) 등 다양한 기능을 제공합니다.

<a name="creating-subscriptions"></a>
### 구독 생성

구독을 생성할 때는 먼저 `App\Models\User`와 같이 청구 대상(billable) 모델의 인스턴스를 가져와야 합니다. 모델 인스턴스를 준비한 후에는 `newSubscription` 메서드를 이용해 구독을 생성할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

`newSubscription` 메서드의 첫 번째 인수는 구독의 내부 타입값입니다. 애플리케이션에서 구독이 하나뿐이라면 `default`나 `primary` 등으로 지정할 수 있습니다. 이 구독 타입은 애플리케이션 내부적으로만 사용되는 값이므로 사용자에게 보여줄 필요가 없으며, 띄어쓰기를 포함하면 안 되고, 구독 생성 이후 변경해서도 안 됩니다. 두 번째 인수는 사용자가 가입할 가격(Price)의 식별자이며, Stripe 내 가격의 ID 값이어야 합니다.

이후, [Stripe 결제수단 식별자](#storing-payment-methods) 또는 Stripe `PaymentMethod` 객체를 `create` 메서드에 전달하면 구독이 바로 시작되고, Stripe 고객 ID와 기타 청구 정보가 데이터베이스에 저장됩니다.

> [!WARNING]
> `create` 구독 생성 메서드에 결제수단 식별자를 직접 전달하면 해당 결제수단이 사용자의 저장된 결제수단 목록에도 자동으로 추가됩니다.

<a name="collecting-recurring-payments-via-invoice-emails"></a>
#### 이메일을 통한 반복 결제 청구

고객의 반복 결제를 자동으로 처리하는 대신, 결제될 때마다 Stripe가 인보이스 이메일을 고객에게 발송하도록 할 수도 있습니다. 이 방법을 사용하면 고객이 결제수단 정보를 사전에 제공하지 않아도 되며, 인보이스 수신 후 직접 결제를 진행하는 방식입니다.

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

고객이 인보이스를 결제하지 않고 구독이 취소되기 전까지 대기하는 기간은 `days_until_due` 옵션으로 지정하며, 기본값은 30일입니다. 다른 값으로 설정하고 싶다면 다음과 같이 지정할 수 있습니다.

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
    'days_until_due' => 30
]);
```

<a name="subscription-quantities"></a>
#### 수량(Quantity) 지정

구독 생성 시 [가격에 대한 수량(quantity)](https://stripe.com/docs/billing/subscriptions/quantities)을 지정하고 싶다면, 구독 빌더에서 `quantity` 메서드를 체이닝하여 사용할 수 있습니다.

```php
$user->newSubscription('default', 'price_monthly')
    ->quantity(5)
    ->create($paymentMethod);
```

<a name="additional-details"></a>
#### 추가 상세 정보

Stripe에서 지원하는 [추가 고객 옵션](https://stripe.com/docs/api/customers/create)이나 [구독 옵션](https://stripe.com/docs/api/subscriptions/create)을 지정하고 싶다면, `create` 메서드의 두 번째 및 세 번째 인수로 키-값 배열을 전달하면 됩니다.

```php
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a name="coupons"></a>
#### 쿠폰(Coupon) 적용

구독 생성 시 쿠폰을 적용하려면 `withCoupon` 메서드를 사용하세요.

```php
$user->newSubscription('default', 'price_monthly')
    ->withCoupon('code')
    ->create($paymentMethod);
```

또는 [Stripe 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 적용하려면 `withPromotionCode` 메서드를 사용할 수 있습니다.

```php
$user->newSubscription('default', 'price_monthly')
    ->withPromotionCode('promo_code_id')
    ->create($paymentMethod);
```

여기서 전달하는 프로모션 코드 ID는 Stripe API에서 할당된 식별자여야 하며, 고객이 보는 프로모션 코드 자체가 아닙니다. 고객용 프로모션 코드를 기준으로 프로모션 코드 ID를 찾고 싶다면 `findPromotionCode` 메서드를 사용할 수 있습니다.

```php
// 고객용 프로모션 코드로 프로모션 코드 ID 찾기...
$promotionCode = $user->findPromotionCode('SUMMERSALE');

// 활성화된 프로모션 코드 ID만 찾기...
$promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

위 예시에서 반환된 `$promotionCode` 객체는 `Laravel\Cashier\PromotionCode` 인스턴스입니다. 이 클래스는 내부적으로 `Stripe\PromotionCode` 객체를 감싸고 있습니다. 해당 프로모션 코드와 연관된 쿠폰 정보를 얻으려면 `coupon` 메서드를 사용하시기 바랍니다.

```php
$coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

쿠폰 인스턴스를 통해 할인 금액 및 해당 쿠폰이 고정 금액 할인인지, 퍼센트 할인인지를 확인할 수 있습니다.

```php
if ($coupon->isPercentage()) {
    return $coupon->percentOff().'%'; // 예: 21.5%
} else {
    return $coupon->amountOff(); // 예: $5.99
}
```

또한, 현재 고객 또는 구독에 적용 중인 할인 정보를 조회할 수도 있습니다.

```php
$discount = $billable->discount();

$discount = $subscription->discount();
```

반환된 `Laravel\Cashier\Discount` 인스턴스는 내부적으로 `Stripe\Discount` 객체를 감쌉니다. 해당 할인과 연결된 쿠폰 정보를 얻으려면 다음과 같이 하면 됩니다.

```php
$coupon = $subscription->discount()->coupon();
```

고객이나 구독에 새 쿠폰이나 프로모션 코드를 적용하려면 `applyCoupon` 또는 `applyPromotionCode` 메서드를 사용하세요.

```php
$billable->applyCoupon('coupon_id');
$billable->applyPromotionCode('promotion_code_id');

$subscription->applyCoupon('coupon_id');
$subscription->applyPromotionCode('promotion_code_id');
```

Stripe의 API ID로 할당된 프로모션 코드를 사용해야 하며, 고객이 직접 사용하는 프로모션 코드 값이 아닙니다. 한 시점에 하나의 쿠폰 또는 프로모션 코드만 고객이나 구독에 적용할 수 있습니다.

자세한 내용은 Stripe의 [쿠폰](https://stripe.com/docs/billing/subscriptions/coupons) 및 [프로모션 코드](https://stripe.com/docs/billing/subscriptions/coupons/codes) 공식 문서를 참고하세요.

<a name="adding-subscriptions"></a>
#### 구독 추가

이미 기본 결제수단이 등록된 고객에게 구독을 추가하려면 구독 빌더의 `add` 메서드를 호출하면 됩니다.

```php
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a name="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Stripe 대시보드에서 구독 생성

Stripe 대시보드 자체에서 구독을 생성할 수도 있습니다. 이 경우 Cashier에서 새 구독을 동기화하고 구독 타입을 `default`로 지정합니다. 대시보드 생성 구독의 타입을 커스터마이즈하려면 [웹훅 이벤트 핸들러를 정의](#defining-webhook-event-handlers)하면 됩니다.

그리고, Stripe 대시보드를 통해서는 한 타입의 구독만 생성할 수 있습니다. 여러 가지 타입의 구독을 제공하는 앱이라면 대시보드에서 한 타입만 추가할 수 있고, 여러 개의 구독 타입을 동시에 생성할 수 없습니다.

마지막으로 한 고객에 대해 구독 타입별로 항상 하나의 활성 구독만 추가되어야 합니다. 예를 들어, `default` 타입 구독이 두 개 이상 존재하면 Cashier는 가장 최근에 추가된 구독만 사용하며, 과거 구독 기록은 데이터베이스에 남겨둡니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인

고객이 애플리케이션에 구독한 후에는 다양한 편리한 메서드로 구독 상태를 쉽게 확인할 수 있습니다. 먼저 `subscribed` 메서드는 고객이 활성 구독을 가지고 있는지 여부를 반환합니다(체험 기간 중인 구독 포함). `subscribed` 메서드의 첫 번째 인수로 구독 타입을 지정할 수 있습니다.

```php
if ($user->subscribed('default')) {
    // ...
}
```

`subscribed` 메서드는 사용자 구독 상태에 따라 라우트 및 컨트롤러 접근 허가를 제어하는 [라우트 미들웨어](/docs/12.x/middleware)에 사용하기에 적합합니다.

```php
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
            // 이 사용자는 결제 고객이 아닙니다...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

사용자가 아직 체험 기간 내에 있는지 확인하고 싶다면 `onTrial` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 체험 기간 중임을 감지해 사용자에게 안내를 띄우는 데 유용합니다.

```php
if ($user->subscription('default')->onTrial()) {
    // ...
}
```

`subscribedToProduct` 메서드는 특정 Stripe 상품 식별자를 기반으로 사용자가 해당 상품에 구독 중인지 판단할 수 있습니다. Stripe에서 상품은 여러 가격(Price)의 집합입니다. 아래 예시에서는 사용자의 `default` 구독이 "premium" 상품에 등록되어 있는지 검사합니다. 인수로 넘기는 Stripe 상품 식별자는 Stripe 대시보드에 등록된 상품 ID와 일치해야 합니다.

```php
if ($user->subscribedToProduct('prod_premium', 'default')) {
    // ...
}
```

`subscribedToProduct` 메서드에 배열을 넘기면, 사용자의 `default` 구독이 "basic" 또는 "premium" 상품에 가입되어 있는지 동시에 확인할 수 있습니다.

```php
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    // ...
}
```

`subscribedToPrice` 메서드는 사용자의 구독이 특정 가격 ID와 일치하는지 확인합니다.

```php
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    // ...
}
```

`recurring` 메서드는 사용자가 구독 및 결제 중(체험 기간을 벗어난 상태)인지 판단합니다.

```php
if ($user->subscription('default')->recurring()) {
    // ...
}
```

> [!WARNING]
> 동일한 타입의 구독이 두 개 이상 존재할 경우, `subscription` 메서드는 항상 가장 최근에 생성된 구독만 반환합니다. 즉, 사용자에게 `default` 타입의 구독 레코드가 두 개 있다면, 옛날 구독은 만료된 상태이고, 최신 구독만 활성화되어있더라도 둘 다 데이터베이스에 남아 있을 수 있습니다. 이 경우에도 항상 최신 구독이 사용됩니다.

#### 구독 취소 상태

사용자가 한때 활성 구독자였으나 구독을 취소했는지 확인하려면 `canceled` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription('default')->canceled()) {
    // ...
}
```

또한 사용자가 구독을 취소했지만, 구독이 완전히 만료되기 전까지 "유예 기간(grace period)"에 있는지 확인할 수도 있습니다. 예를 들어, 사용자가 3월 5일에 구독을 취소했는데 원래 구독이 3월 10일에 만료될 예정이라면, 3월 10일까지는 유예 기간에 있게 됩니다. 참고로 이 기간 동안에도 `subscribed` 메서드는 여전히 `true`를 반환합니다.

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

사용자가 구독을 취소했고 더 이상 "유예 기간"에도 속하지 않는지 확인하려면 `ended` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription('default')->ended()) {
    // ...
}
```

<a name="incomplete-and-past-due-status"></a>
#### 미완료 및 연체 상태

구독을 생성한 후 추가 결제 조치가 필요한 경우, 해당 구독은 `incomplete` 상태로 표시됩니다. 구독의 상태는 Cashier의 `subscriptions` 데이터베이스 테이블의 `stripe_status` 컬럼에 저장됩니다.

비슷하게, 가격을 변경(swap)할 때 추가 결제 조치가 필요한 경우 구독은 `past_due` 상태로 표시됩니다. 구독이 이 두 가지 상태 중 하나에 있을 경우, 고객이 결제를 완료할 때까지 활성 상태가 되지 않습니다. 구독에 미완료 결제(incomplete payment)가 있는지 확인하려면 과금 대상(Billable) 모델이나 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용하면 됩니다.

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

구독에 미완료 결제가 있을 때는 사용자를 Cashier의 결제 확인 페이지로 안내하고, `latestPayment` 식별자를 전달해야 합니다. 구독 인스턴스에서 제공하는 `latestPayment` 메서드를 사용해 이 식별자를 가져올 수 있습니다.

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    결제를 완료해 주세요.
</a>
```

구독이 `past_due` 또는 `incomplete` 상태일 때도 여전히 이를 활성 상태로 간주하고 싶다면, Cashier가 제공하는 `keepPastDueSubscriptionsActive`와 `keepIncompleteSubscriptionsActive` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드들은 `App\Providers\AppServiceProvider`의 `register` 메서드 내에서 호출합니다.

```php
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

> [!WARNING]
> 구독이 `incomplete` 상태일 때는 결제가 확정되기 전까지 구독을 변경할 수 없습니다. 따라서 이 상태에서 `swap` 및 `updateQuantity` 메서드를 호출하면 예외가 발생합니다.

<a name="subscription-scopes"></a>
#### 구독 쿼리 스코프

대부분의 구독 상태는 쿼리 스코프(query scope)로도 제공되어, 데이터베이스에서 특정 상태의 구독을 쉽게 조회할 수 있습니다.

```php
// 모든 활성 구독을 가져옵니다...
$subscriptions = Subscription::query()->active()->get();

// 사용자의 모든 취소된 구독을 가져옵니다...
$subscriptions = $user->subscriptions()->canceled()->get();
```

아래는 사용 가능한 모든 스코프의 목록입니다.

```php
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

고객이 애플리케이션에 구독한 이후, 때때로 새로운 구독 가격으로 변경하길 원할 수 있습니다. Stripe 가격 식별자(Stripe price identifier)를 `swap` 메서드에 전달하여 사용자의 구독 가격을 변경할 수 있습니다. 가격을 변경할 때 사용자가 이전에 구독을 취소했다면, 다시 활성화할 의사가 있는 것으로 간주합니다. 전달하는 식별자는 Stripe 대시보드에 등록된 가격 식별자여야 합니다.

```php
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

고객이 체험 기간(trial) 중이라면, 체험 기간이 유지됩니다. 또한, 구독에 "수량(quantity)"이 설정되어 있다면 그 수도 유지됩니다.

만약 가격을 변경하면서 현재 체험 기간(trial)을 취소하고 싶다면 `skipTrial` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')
    ->skipTrial()
    ->swap('price_yearly');
```

가격을 변경한 뒤 다음 청구 주기를 기다리지 않고 바로 고객에게 인보이스를 발행하고 싶다면 `swapAndInvoice` 메서드를 사용할 수 있습니다.

```php
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a name="prorations"></a>
#### 비례 배분(Proration)

기본적으로 Stripe는 가격 변경 시 요금을 비례 배분(prorate)합니다. 요금 변경 시 비례 배분 없이 처리하고 싶다면 `noProrate` 메서드를 사용하면 됩니다.

```php
$user->subscription('default')->noProrate()->swap('price_yearly');
```

구독 요금 비례 배분에 대한 자세한 내용은 [Stripe 공식 문서](https://stripe.com/docs/billing/subscriptions/prorations)를 참고하세요.

> [!WARNING]
> `swapAndInvoice` 메서드보다 먼저 `noProrate` 메서드를 실행해도 비례 배분에는 영향을 주지 않습니다. 인보이스는 항상 발행됩니다.

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

일부 구독은 "수량"에 따라 금액이 달라집니다. 예를 들어, 프로젝트 관리 애플리케이션에서는 프로젝트 당 월 $10씩 부과할 수 있습니다. `incrementQuantity` 및 `decrementQuantity` 메서드를 사용해 구독 수량을 손쉽게 증가시키거나 감소시킬 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// 구독의 현재 수량에 5를 추가합니다...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// 구독의 현재 수량에서 5를 뺍니다...
$user->subscription('default')->decrementQuantity(5);
```

또는 `updateQuantity` 메서드를 통해 특정 수량으로 직접 설정할 수도 있습니다.

```php
$user->subscription('default')->updateQuantity(10);
```

`noProrate` 메서드를 사용해 요금의 비례배분 없이 수량을 변경할 수 있습니다.

```php
$user->subscription('default')->noProrate()->updateQuantity(10);
```

구독 수량에 대한 자세한 내용은 [Stripe 공식 문서](https://stripe.com/docs/subscriptions/quantities)를 참고하세요.

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 여러 상품이 포함된 구독의 수량

[여러 상품이 포함된 구독](#subscriptions-with-multiple-products)에서는 수량을 증가/감소할 가격 ID를 두 번째 인수로 increment / decrement 메서드에 전달해야 합니다.

```php
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 여러 상품이 포함된 구독

[여러 상품이 포함된 구독(multiple products)](https://stripe.com/docs/billing/subscriptions/multiple-products)은 하나의 구독에 여러 과금 상품을 할당할 수 있습니다. 예를 들어, 고객센터 "헬프데스크" 애플리케이션에서 기본 구독료는 월 $10이고, 실시간 채팅(live chat) 추가 상품을 월 $15로 제공할 수 있습니다. 여러 상품이 포함된 구독 정보는 Cashier의 `subscription_items` 데이터베이스 테이블에 저장됩니다.

특정 구독에 여러 상품을 지정하려면, `newSubscription` 메서드의 두 번째 인수로 가격 배열을 전달합니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', [
        'price_monthly',
        'price_chat',
    ])->create($request->paymentMethodId);

    // ...
});
```

위 예시에서 고객은 `default` 구독에 두 개의 가격이 포함됩니다. 두 가격 모두 각각의 청구 주기에 따라 요금이 청구됩니다. 필요하다면 `quantity` 메서드를 사용해 각 가격별 개수를 지정할 수도 있습니다.

```php
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

이미 존재하는 구독에 가격을 추가하려면 구독 인스턴스의 `addPrice` 메서드를 호출하면 됩니다.

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

위 예시는 새 가격을 추가하며, 다음 청구 주기에 청구가 이뤄집니다. 즉시 청구하고 싶으면 `addPriceAndInvoice` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

특정 수량으로 가격을 추가하고 싶다면 수량을 `addPrice` 또는 `addPriceAndInvoice` 메서드의 두 번째 인수로 전달할 수 있습니다.

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

구독에서 가격을 제거할 때는 `removePrice` 메서드를 사용하세요.

```php
$user->subscription('default')->removePrice('price_chat');
```

> [!WARNING]
> 구독에서 마지막 가격은 제거할 수 없습니다. 이 경우 단순히 구독을 취소해야 합니다.

<a name="swapping-prices"></a>
#### 가격 변경

여러 상품이 포함된 구독의 가격도 변경할 수 있습니다. 예를 들어, 한 사용자가 `price_basic`과 `price_chat` 상품을 포함한 구독을 가지고 있는데, `price_basic`에서 `price_pro`로 업그레이드하려는 경우 아래와 같이 처리할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

위 코드를 실행하면 `price_basic`이 포함된 구독 아이템이 삭제되고, `price_chat`은 그대로 유지되며, `price_pro`가 새로운 구독 아이템으로 추가됩니다.

필요하다면 구독 아이템 옵션도 Key/Value 배열로 `swap` 메서드에 전달할 수 있습니다. 예를 들어, 구독 가격별 수량을 지정하려면 다음과 같이 할 수 있습니다.

```php
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

여러 가격이 포함된 구독에서 하나의 가격만 변경하고 싶다면, 개별 구독 아이템의 `swap` 메서드를 사용할 수 있습니다. 이 방식은 나머지 가격의 메타데이터를 그대로 유지하고 싶은 경우에 유용합니다.

```php
$user = User::find(1);

$user->subscription('default')
    ->findItemOrFail('price_basic')
    ->swap('price_pro');
```

<a name="proration"></a>
#### 비례 배분(Proration)

여러 상품이 포함된 구독에 가격을 추가하거나 제거할 때 Stripe는 기본적으로 요금을 비례 배분(proration)합니다. 비례 배분 없이 가격 조정을 하고 싶다면, 가격 작업에 `noProrate` 메서드를 체이닝하면 됩니다.

```php
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a name="swapping-quantities"></a>
#### 수량(Quantities)

개별 구독 가격의 수량을 업데이트하려면, [앞서 설명한 수량 관련 메서드](#subscription-quantity)에 가격 ID를 추가 인수로 전달하면 됩니다.

```php
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> [!WARNING]
> 구독에 여러 가격이 있는 경우, `Subscription` 모델의 `stripe_price` 및 `quantity` 속성은 `null`이 됩니다. 각 가격별 속성에 접근하려면 `Subscription` 모델의 `items` 연관관계를 사용하세요.

<a name="subscription-items"></a>
#### 구독 아이템(Subscription Items)

구독에 여러 가격이 포함되어 있으면, 데이터베이스의 `subscription_items` 테이블에 여러 개의 구독 "아이템"이 저장됩니다. 구독의 `items` 연관관계를 통해 이 아이템들에 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// 특정 아이템의 Stripe 가격 및 수량을 가져옵니다...
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

특정 가격의 아이템을 `findItemOrFail` 메서드로 가져올 수도 있습니다.

```php
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a name="multiple-subscriptions"></a>
### 복수 구독(Multiple Subscriptions)

Stripe는 고객이 동시에 여러 개의 구독을 보유할 수 있도록 지원합니다. 예를 들어, 헬스장에서는 수영 구독과 웨이트 구독을 별개로 두고, 각각 다른 가격을 책정할 수 있습니다. 사용자는 두 구독 중 하나 또는 모두를 구독할 수 있습니다.

애플리케이션에서 구독을 생성할 때 `newSubscription` 메서드의 구독 타입을 지정할 수 있습니다. 이 타입은 사용자가 어떤 종류의 구독을 생성하는지 나타내는 임의의 문자열입니다.

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()->newSubscription('swimming')
        ->price('price_swimming_monthly')
        ->create($request->paymentMethodId);

    // ...
});
```

이 예제에서는 고객에 대해 월간 수영 구독을 생성했습니다. 사용자는 이후 연간 구독으로 변경할 수도 있습니다. 이때는 `swimming` 구독의 가격만 교체(swap)하면 됩니다.

```php
$user->subscription('swimming')->swap('price_swimming_yearly');
```

물론, 구독을 아예 취소할 수도 있습니다.

```php
$user->subscription('swimming')->cancel();
```

<a name="usage-based-billing"></a>
### 사용량 기반 과금(Usage Based Billing)

[사용량 기반 과금](https://stripe.com/docs/billing/subscriptions/metered-billing)은 고객이 청구 주기 동안 제품을 얼마나 사용했는지에 따라 요금을 부과할 수 있게 해 줍니다. 예를 들어, 고객이 한 달 동안 보낸 문자 메시지 수나 이메일 수에 따라 요금을 청구할 수 있습니다.

사용량 기반 구독을 시작하려면, Stripe 대시보드에서 먼저 [사용량 기반 과금 모델](https://docs.stripe.com/billing/subscriptions/usage-based/implementation-guide)이 적용된 새 상품을 만들고, [계량기(meter)](https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage#configure-meter)를 설정해야 합니다. 계량기를 만들면 해당 이벤트 이름과 meter ID를 저장하세요. 이를 통해 사용량을 보고하고 조회할 수 있습니다. 이후, `meteredPrice` 메서드를 사용해 계량 가격 ID(metered price ID)를 구독에 추가하세요.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

또한 [Stripe Checkout](#checkout)을 통해 계량 구독을 시작할 수도 있습니다.

```php
$checkout = Auth::user()
    ->newSubscription('default', [])
    ->meteredPrice('price_metered')
    ->checkout();

return view('your-checkout-view', [
    'checkout' => $checkout,
]);
```

<a name="reporting-usage"></a>
#### 사용량 보고(Reporting Usage)

고객이 애플리케이션을 사용할 때마다, 해당 사용량을 Stripe에 보고해서 정확한 요금이 청구되도록 해야 합니다. 계량 이벤트의 사용량을 보고하려면, `Billable` 모델에서 `reportMeterEvent` 메서드를 사용하면 됩니다.

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent');
```

기본적으로 "사용량 수량"은 1이 추가됩니다. 특정 사용량을 추가하려면, 보고할 수량을 명시적으로 인수로 전달할 수 있습니다.

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent', quantity: 15);
```

고객의 meter 이벤트 사용 요약(Event summary)을 가져오려면, `Billable` 인스턴스의 `meterEventSummaries` 메서드를 사용합니다.

```php
$user = User::find(1);

$meterUsage = $user->meterEventSummaries($meterId);

$meterUsage->first()->aggregated_value // 10
```

Meter event summary에 대한 자세한 정보는 Stripe의 [Meter Event Summary object 문서](https://docs.stripe.com/api/billing/meter-event_summary/object)를 참고하세요.

[모든 meter 리스트](https://docs.stripe.com/api/billing/meter/list)를 조회하려면, `Billable` 인스턴스의 `meters` 메서드를 사용하면 됩니다.

```php
$user = User::find(1);

$user->meters();
```

<a name="subscription-taxes"></a>
### 구독 세금(Subscription Taxes)

> [!WARNING]
> 세율을 직접 계산하는 대신, [Stripe Tax로 세금을 자동 계산](#tax-configuration)할 수 있습니다.

사용자가 구독에 대해 어떤 세금을 낼지 지정하려면, billable 모델에서 `taxRates` 메서드를 구현하고, Stripe 세율 ID(Stripe tax rate ID)가 담긴 배열을 반환해야 합니다. 이 세율들은 [Stripe 대시보드](https://dashboard.stripe.com/test/tax-rates)에서 설정할 수 있습니다.

```php
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

`taxRates` 메서드를 통해 사용자마다 적용 세율을 다르게 지정할 수 있습니다. 특히 여러 국가에 걸친 사용자 베이스에서는 매우 유용합니다.

여러 상품이 포함된 구독을 제공할 경우, 각 가격마다 다른 세율을 적용하고 싶다면 billable 모델에 `priceTaxRates` 메서드를 구현할 수 있습니다.

```php
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

> [!WARNING]
> `taxRates` 메서드는 구독 청구에만 적용됩니다. Cashier로 "단건 결제(one-off charge)"를 하는 경우, 세율을 직접 지정해주어야 합니다.

<a name="syncing-tax-rates"></a>
#### 세율 동기화(Syncing Tax Rates)

`taxRates` 메서드에서 반환하는 세율 ID를 하드코딩 값으로 변경해도, 기존 사용자의 구독 세팅은 그대로 유지됩니다. 기존 구독의 세율을 새 `taxRates` 값으로 업데이트하려면, 해당 사용자의 구독 인스턴스에서 `syncTaxRates` 메서드를 호출해야 합니다.

```php
$user->subscription('default')->syncTaxRates();
```

이 메서드는 여러 상품이 포함된 구독의 세율도 자동으로 동기화합니다. 여러 상품 구독을 제공하는 경우, billable 모델이 위에서 설명한 `priceTaxRates` 메서드를 반드시 구현하도록 해야 합니다.

<a name="tax-exemption"></a>
#### 세금 면제(Tax Exemption)

Cashier는 고객이 세금 면제 대상인지 확인할 수 있도록 `isNotTaxExempt`, `isTaxExempt`, `reverseChargeApplies` 메서드도 제공합니다. 이들 메서드는 Stripe API를 호출해서 고객의 세금 면제 여부를 확인합니다.

```php
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> [!WARNING]
> 이들 메서드는 `Laravel\Cashier\Invoice` 객체에서도 사용할 수 있습니다. 단, Invoice 객체에서 호출할 경우 인보이스가 생성된 시점의 면세 상태를 확인합니다.

<a name="subscription-anchor-date"></a>
### 구독 앵커 날짜(Subscription Anchor Date)

기본적으로 청구 주기 기준(anchor)은 구독 생성일 또는, 체험 기간이 있는 경우 체험 종료일입니다. 청구 anchor 날짜를 변경하려면 `anchorBillingCycleOn` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $anchor = Carbon::parse('first day of next month');

    $request->user()->newSubscription('default', 'price_monthly')
        ->anchorBillingCycleOn($anchor->startOfDay())
        ->create($request->paymentMethodId);

    // ...
});
```

구독 청구 주기 관리에 대한 자세한 내용은 [Stripe Billing Cycle 공식 문서](https://stripe.com/docs/billing/subscriptions/billing-cycle)를 참조하시기 바랍니다.

<a name="cancelling-subscriptions"></a>
### 구독 취소

구독을 취소하려면, 해당 사용자의 구독에서 `cancel` 메서드를 호출합니다.

```php
$user->subscription('default')->cancel();
```

구독이 취소되면 Cashier는 `subscriptions` 데이터베이스 테이블에 있는 `ends_at` 컬럼을 자동으로 설정합니다. 이 컬럼은 언제부터 `subscribed` 메서드가 `false`를 반환해야 하는지 판단하는 데 사용됩니다.

예를 들어, 고객이 3월 1일에 구독을 취소했지만 결제 주기가 3월 5일에 끝난다면, `subscribed` 메서드는 3월 5일까지 계속 `true`를 반환합니다. 이는 일반적으로 사용자가 청구 주기 종료일까지 애플리케이션을 계속 사용할 수 있도록 하기 위함입니다.

사용자가 구독을 취소했지만 아직 "유예 기간(grace period)"에 있는지 확인하려면 `onGracePeriod` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

구독을 즉시 취소하고자 한다면, `cancelNow` 메서드를 호출하세요.

```php
$user->subscription('default')->cancelNow();
```

구독을 즉시 취소하면서, 청구되지 않은 미터 사용량이나 새/대기 중인 비례 배분 인보이스 항목도 모두 인보이스로 처리하고 싶다면 `cancelNowAndInvoice` 메서드를 사용하세요.

```php
$user->subscription('default')->cancelNowAndInvoice();
```

구독을 특정 시점에 취소하고 싶다면 다음과 같이 할 수 있습니다.

```php
$user->subscription('default')->cancelAt(
    now()->addDays(10)
);
```

마지막으로, 관련 사용자 모델을 삭제하기 전에 반드시 구독을 먼저 취소해야 합니다.

```php
$user->subscription('default')->cancelNow();

$user->delete();
```

<a name="resuming-subscriptions"></a>

### 구독 재개

고객이 구독을 취소한 후, 해당 구독을 다시 활성화하려면 `resume` 메서드를 사용하면 됩니다. 단, 구독을 재개하려면 고객이 아직 "유예 기간" 내에 있어야 합니다.

```php
$user->subscription('default')->resume();
```

고객이 구독을 취소하고 다시 만료되기 전에 같은 구독을 재개할 경우, 바로 요금이 청구되지 않습니다. 대신 구독이 다시 활성화되며, 원래의 결제 주기에 따라 요금이 청구됩니다.

<a name="subscription-trials"></a>
## 구독 체험 기간(Trial)

<a name="with-payment-method-up-front"></a>
### 결제 수단을 미리 받아 체험 제공하기

결제 수단 정보를 미리 받으면서도 고객에게 체험 기간을 제공하고 싶다면, 구독 생성 시 `trialDays` 메서드를 사용하시기 바랍니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
        ->trialDays(10)
        ->create($request->paymentMethodId);

    // ...
});
```

이 메서드는 구독 레코드의 데이터베이스에 체험 종료일을 저장하며, Stripe에는 해당 날짜가 지나기 전까지 고객에게 요금 청구를 시작하지 않도록 지시합니다. `trialDays`를 사용할 때는, Stripe에서 가격에 기본적으로 설정된 체험 기간이 있더라도 Cashier가 덮어써서 적용합니다.

> [!WARNING]
> 고객이 체험 종료 전에 구독을 취소하지 않으면 체험이 끝나는 즉시 요금이 자동으로 청구됩니다. 반드시 사용자에게 체험 종료일을 안내해 주시기 바랍니다.

`trialUntil` 메서드를 이용하면, 체험 종료 시점을 지정하는 `DateTime` 인스턴스를 전달할 수 있습니다.

```php
use Carbon\Carbon;

$user->newSubscription('default', 'price_monthly')
    ->trialUntil(Carbon::now()->addDays(10))
    ->create($paymentMethod);
```

유저가 체험 기간 중인지 확인하려면, 사용자 인스턴스의 `onTrial` 또는 구독 인스턴스의 `onTrial` 메서드를 사용할 수 있습니다. 아래 두 예시는 동일하게 동작합니다.

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->subscription('default')->onTrial()) {
    // ...
}
```

`endTrial` 메서드를 사용하면 구독 체험을 즉시 종료할 수 있습니다.

```php
$user->subscription('default')->endTrial();
```

기존 체험이 만료되었는지 확인하려면 `hasExpiredTrial` 메서드를 사용합니다.

```php
if ($user->hasExpiredTrial('default')) {
    // ...
}

if ($user->subscription('default')->hasExpiredTrial()) {
    // ...
}
```

<a name="defining-trial-days-in-stripe-cashier"></a>
#### Stripe / Cashier에서 체험 기간 설정하기

Stripe 대시보드에서 가격별로 기본 체험 기간을 설정하거나, 항상 Cashier에서 명시적으로 설정할 수도 있습니다. Stripe에서 가격의 체험 기간을 설정하면, 과거에 구독이 있던 고객이 새로 가입해도 항상 체험이 적용됩니다. 단, `skipTrial()` 메서드를 명시적으로 호출한 경우는 예외입니다.

<a name="without-payment-method-up-front"></a>
### 결제 수단 없이 체험 제공하기

결제 수단 정보를 미리 받지 않고도 체험 기간을 제공하고 싶다면, 사용자의 레코드에서 `trial_ends_at` 컬럼에 원하는 체험 종료일을 저장하면 됩니다. 일반적으로 회원가입 시에 설정합니다.

```php
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->addDays(10),
]);
```

> [!WARNING]
> Billable 모델 클래스 정의에서 `trial_ends_at` 속성(attribute)에 대해 [날짜 캐스팅](/docs/12.x/eloquent-mutators#date-casting)을 반드시 추가해야 합니다.

Cashier는 이런 유형의 체험을 "일반(Generic) 체험"이라 부릅니다. 이는 어떤 구독에도 연결되지 않은 체험입니다. Billable 모델 인스턴스에서 `onTrial`을 호출하면, 현재 날짜가 `trial_ends_at` 값보다 이전인 경우 참(`true`)을 반환합니다.

```php
if ($user->onTrial()) {
    // 사용자가 체험 기간 내에 있습니다...
}
```

이제 실제 구독을 생성할 준비가 되면 기존대로 `newSubscription` 메서드를 사용하면 됩니다.

```php
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

체험 종료일을 조회하려면 `trialEndsAt` 메서드를 사용할 수 있습니다. 만약 사용자가 체험 중이라면 이 메서드는 Carbon 날짜 인스턴스를 반환하고, 체험 기간이 아니라면 `null`을 반환합니다. 기본 구독이 아닌 특정 구독의 체험 종료일을 조회하려면 구독 타입 파라미터를 추가로 전달할 수 있습니다.

```php
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

또한 사용자가 "일반(Generic) 체험" 중(즉, 아직 실제 구독을 생성하지 않은 상태)인지 명확히 알고 싶다면 `onGenericTrial` 메서드를 사용할 수 있습니다.

```php
if ($user->onGenericTrial()) {
    // 사용자가 "일반(Generic) 체험" 중입니다...
}
```

<a name="extending-trials"></a>
### 체험 기간 연장하기

`extendTrial` 메서드를 사용하면, 구독이 이미 생성된 후에도 체험 기간을 연장할 수 있습니다. 이미 체험이 끝났고, 고객이 구독 요금을 내고 있어도 추가 체험 기간을 제공할 수 있습니다. 추가된 체험 기간만큼 다음 인보이스(청구서)에서 차감됩니다.

```php
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// 지금부터 7일 후에 체험을 끝나도록 연장
$subscription->extendTrial(
    now()->addDays(7)
);

// 현재 체험 기간에 5일을 추가로 연장
$subscription->extendTrial(
    $subscription->trial_ends_at->addDays(5)
);
```

<a name="handling-stripe-webhooks"></a>
## Stripe Webhook 처리하기

> [!NOTE]
> [Stripe CLI](https://stripe.com/docs/stripe-cli)를 사용하여 로컬 개발 환경에서 Webhook 테스트를 쉽게 할 수 있습니다.

Stripe는 웹훅(Webhook)을 통해 다양한 이벤트를 애플리케이션에 알려줄 수 있습니다. 기본적으로 Cashier 서비스 프로바이더는 Cashier의 웹훅 컨트롤러를 가리키는 라우트를 자동으로 등록합니다. 이 컨트롤러에서 모든 Stripe 웹훅 요청을 처리합니다.

기본적으로 Cashier 웹훅 컨트롤러는 Stripe 설정에서 정의된 너무 많은 결제 실패로 인한 구독 취소, 고객 정보 갱신, 고객 삭제, 구독 업데이트, 결제 방법 변경 등 다양한 Stripe 이벤트를 자동으로 처리합니다. 필요하다면 이 컨트롤러를 확장하여 원하는 Stripe 웹훅 이벤트도 직접 처리할 수 있습니다.

애플리케이션이 Stripe 웹훅을 정상적으로 처리하려면, Stripe 대시보드에 웹훅 URL을 등록해야 합니다. 기본적으로 Cashier의 웹훅 컨트롤러는 `/stripe/webhook` URL 경로에 응답합니다. Stripe 대시보드에서 다음 웹훅 이벤트들을 활성화하는 것이 좋습니다.

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

Cashier는 편의상 `cashier:webhook` 아티즌 명령어도 제공합니다. 이 명령어는 Cashier에서 필요한 모든 Stripe 이벤트를 수신하는 Stripe Webhook을 생성합니다.

```shell
php artisan cashier:webhook
```

기본적으로 생성된 웹훅은 `APP_URL` 환경 변수와 Cashier에 포함된 `cashier.webhook` 라우트에 설정됩니다. 다른 URL을 사용하려면 명령어에 `--url` 옵션을 추가하면 됩니다.

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

생성된 웹훅은 현재 사용 중인 Cashier가 호환 가능한 Stripe API 버전을 사용합니다. 다른 Stripe 버전을 사용하고 싶다면 `--api-version` 옵션을 지정할 수 있습니다.

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

웹훅을 생성하면 바로 활성화됩니다. 아직 준비되지 않은 상태로 비활성화된 채로 웹훅을 만들고 싶다면 `--disabled` 옵션을 사용할 수 있습니다.

```shell
php artisan cashier:webhook --disabled
```

> [!WARNING]
> Cashier에 포함되어 있는 [웹훅 서명 검증](#verifying-webhook-signatures) 미들웨어로 Stripe에서 들어오는 웹훅 요청을 반드시 보호해야 합니다.

<a name="webhooks-csrf-protection"></a>
#### Webhook과 CSRF 보호

Stripe 웹훅 요청은 Laravel의 [CSRF 보호](/docs/12.x/csrf)를 우회해야 합니다. 이를 위해 애플리케이션의 `bootstrap/app.php` 파일에서 `stripe/*` 엔드포인트가 CSRF 검증에서 제외되어 있는지 확인하시기 바랍니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'stripe/*',
    ]);
})
```

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의하기

Cashier는 결제 실패로 인한 구독 취소 등 주요 Stripe 웹훅 이벤트를 자동으로 처리합니다. 추가로 처리하고 싶은 웹훅 이벤트가 있다면, Cashier가 발생시키는 다음 이벤트를 리스닝하여 처리할 수 있습니다.

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

두 이벤트 모두 Stripe 웹훅의 전체 payload를 포함합니다. 예를 들어, `invoice.payment_succeeded` 웹훅을 직접 처리하려면 [이벤트 리스너](/docs/12.x/events#defining-listeners)를 등록하여 다음과 같이 구현할 수 있습니다.

```php
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

<a name="verifying-webhook-signatures"></a>
### 웹훅 서명 검증

웹훅 보안을 강화하기 위해 [Stripe의 웹훅 서명](https://stripe.com/docs/webhooks/signatures)을 사용할 수 있습니다. Cashier는 Stripe 웹훅 요청이 올바른지 자동으로 검증하는 미들웨어를 기본적으로 제공합니다.

이 기능을 활성화하려면, 애플리케이션의 `.env` 파일에 `STRIPE_WEBHOOK_SECRET` 환경 변수를 반드시 설정해야 합니다. 이 웹훅 `secret`은 Stripe 계정 대시보드에서 확인할 수 있습니다.

<a name="single-charges"></a>
## 단일 청구(일회성 결제)

<a name="simple-charge"></a>
### 간단한 청구

고객에게 일회성 요금을 청구하려면, billable 모델 인스턴스의 `charge` 메서드를 사용할 수 있습니다. [결제 수단 식별자](#payment-methods-for-single-charges)를 두 번째 인자로 전달해야 합니다.

```php
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $stripeCharge = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

`charge` 메서드는 옵션 배열을 세 번째 인자로 받을 수 있어, Stripe 결제 생성 시 다양한 옵션을 설정할 수 있습니다. 사용 가능한 옵션 정보는 [Stripe 공식 문서](https://stripe.com/docs/api/charges/create)에서 확인할 수 있습니다.

```php
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

별도의 고객 정보나 사용자 없이도 `charge` 메서드를 사용할 수 있습니다. 이 경우 billable 모델의 새 인스턴스에서 메서드를 호출하면 됩니다.

```php
use App\Models\User;

$stripeCharge = (new User)->charge(100, $paymentMethod);
```

`charge`에서 결제가 실패하면 예외가 발생합니다. 결제가 성공하면 `Laravel\Cashier\Payment` 인스턴스가 반환됩니다.

```php
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    // ...
}
```

> [!WARNING]
> `charge` 메서드는 결제 금액을 애플리케이션에서 사용하는 통화의 최소 단위(예: 미국 달러라면 센트, 즉 1달러=100)를 기준으로 입력해야 합니다.

<a name="charge-with-invoice"></a>
### 인보이스를 포함한 청구

때때로 고객에게 일회성 요금을 청구하고, PDF 인보이스(청구서)를 제공하고 싶을 수 있습니다. `invoicePrice` 메서드는 이러한 요구를 쉽게 해결해 줍니다. 예를 들어, 고객에게 티셔츠 5벌에 대한 인보이스를 청구하려면 다음과 같이 할 수 있습니다.

```php
$user->invoicePrice('price_tshirt', 5);
```

인보이스는 즉시 고객의 기본 결제 수단으로 청구됩니다. `invoicePrice` 메서드는 청구 항목의 옵션을 담은 배열을 세 번째 인자로, 인보이스 자체의 옵션을 담은 배열을 네 번째 인자로 받을 수 있습니다.

```php
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

마찬가지로 `invoicePrice`처럼, 여러 품목(인보이스당 최대 250가지)을 "tab"에 추가하고 나중에 청구할 수 있는 `tabPrice` 메서드도 사용할 수 있습니다. 예를 들어, 티셔츠 5개, 머그컵 2개를 한 번에 결제하는 경우:

```php
$user->tabPrice('price_tshirt', 5);
$user->tabPrice('price_mug', 2);
$user->invoice();
```

또한, 고객의 기본 결제 수단에 대해 "일회성" 청구를 하려면 `invoiceFor` 메서드를 사용할 수도 있습니다.

```php
$user->invoiceFor('One Time Fee', 500);
```

하지만 `invoiceFor` 메서드 대신, 미리 정의된 가격 정보를 사용하는 `invoicePrice`와 `tabPrice` 메서드 사용을 권장합니다. 이렇게 하면 Stripe 대시보드에서 제품별 매출을 더 정확하게 분석할 수 있습니다.

> [!WARNING]
> `invoice`, `invoicePrice`, `invoiceFor` 등은 결제가 실패할 경우 Stripe 인보이스가 재시도를 시도합니다. 결제 실패 시 재시도를 원하지 않는다면, Stripe API를 사용하여 인보이스를 수동으로 닫아야 합니다.

<a name="creating-payment-intents"></a>
### Payment Intent 생성

billable 모델 인스턴스의 `pay` 메서드를 사용해 Stripe Payment Intent를 새로 만들 수 있습니다. 이 메서드를 호출하면, `Laravel\Cashier\Payment` 인스턴스로 래핑된 Payment Intent가 생성됩니다.

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->pay(
        $request->get('amount')
    );

    return $payment->client_secret;
});
```

Payment Intent를 생성한 후, 클라이언트 비밀값(`client_secret`)을 프론트엔드에 반환하여 사용자가 브라우저에서 결제를 완료할 수 있도록 하면 됩니다. Stripe Payment Intent를 이용한 전체 결제 흐름은 [Stripe 공식 문서](https://stripe.com/docs/payments/accept-a-payment?platform=web)를 참고하세요.

`pay` 메서드를 사용할 때에는 Stripe 대시보드에서 활성화된 기본 결제 수단이 모두 제공됩니다. 특정한 결제 수단만 허용하고 싶다면 `payWith` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->payWith(
        $request->get('amount'), ['card', 'bancontact']
    );

    return $payment->client_secret;
});
```

> [!WARNING]
> `pay`와 `payWith` 메서드도 결제 금액을 애플리케이션의 통화 최소 단위(예: 달러라면 센트)로 입력해야 합니다.

<a name="refunding-charges"></a>
### 결제 환불하기

Stripe 결제를 환불하려면 `refund` 메서드를 사용합니다. 이 메서드는 첫 번째 인자로 Stripe [Payment Intent ID](#payment-methods-for-single-charges)를 받습니다.

```php
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a name="invoices"></a>
## 인보이스(청구서)

<a name="retrieving-invoices"></a>
### 인보이스 조회

billable 모델 인스턴스에서 `invoices` 메서드를 사용하면 인보이스 배열을 쉽게 조회할 수 있습니다. 이 메서드는 `Laravel\Cashier\Invoice` 인스턴스로 구성된 컬렉션을 반환합니다.

```php
$invoices = $user->invoices();
```

결제 대기 중인 인보이스도 함께 조회하려면 `invoicesIncludingPending` 메서드를 사용할 수 있습니다.

```php
$invoices = $user->invoicesIncludingPending();
```

특정 인보이스를 ID로 조회하려면 `findInvoice` 메서드를 사용합니다.

```php
$invoice = $user->findInvoice($invoiceId);
```

<a name="displaying-invoice-information"></a>
#### 인보이스 정보 표시하기

고객의 인보이스 목록을 표시할 때 인보이스의 다양한 메서드를 사용해 주요 정보를 보여줄 수 있습니다. 예를 들어, 인보이스를 테이블로 나열하여 다운로드 링크를 제공합니다.

```blade
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
### 다가오는 인보이스 조회

고객의 다가오는 인보이스를 조회하려면 `upcomingInvoice` 메서드를 사용합니다.

```php
$invoice = $user->upcomingInvoice();
```

고객이 여러 구독을 가지고 있다면, 특정 구독의 다가오는 인보이스도 다음과 같이 조회할 수 있습니다.

```php
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a name="previewing-subscription-invoices"></a>
### 구독 인보이스 미리보기

`previewInvoice` 메서드를 사용하면 가격을 변경하기 전에 발행될 인보이스를 미리 확인할 수 있습니다. 이를 통해 가격 변경 시, 고객 인보이스가 어떻게 표시되는지 미리 파악할 수 있습니다.

```php
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

여러 신규 가격으로 인보이스를 미리 보고 싶다면 가격 배열을 전달할 수 있습니다.

```php
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a name="generating-invoice-pdfs"></a>
### 인보이스 PDF 생성

인보이스 PDF를 생성하기 전에, Cashier의 기본 인보이스 렌더러인 Dompdf 라이브러리를 Composer로 먼저 설치해야 합니다.

```shell
composer require dompdf/dompdf
```

라우트나 컨트롤러 내에서 `downloadInvoice` 메서드를 사용하면 해당 인보이스의 PDF 파일 다운로드 기능을 쉽게 구현할 수 있습니다. 이 메서드는 인보이스 다운로드에 필요한 적절한 HTTP 응답을 자동으로 생성합니다.

```php
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId);
});
```

기본적으로 인보이스의 모든 데이터는 Stripe의 고객 및 인보이스 정보에서 가져옵니다. 파일 이름은 `app.name` 설정 값을 기반으로 지정됩니다. 회사명이나 제품명 등 일부 정보를 사용자 정의하고 싶으면, 두 번째 인자로 정보를 담은 배열을 전달하는 방식으로 변경할 수 있습니다.

```php
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

또한 세 번째 인자로 파일명을 직접 지정할 수도 있습니다. 이 파일명 뒤에 `.pdf` 확장자가 자동으로 붙습니다.

```php
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a name="custom-invoice-render"></a>
#### 커스텀 인보이스 렌더러 사용하기

Cashier에서는 기본으로 사용하는 `DompdfInvoiceRenderer`(내부적으로 [dompdf](https://github.com/dompdf/dompdf) PHP 라이브러리 활용) 외에 커스텀 인보이스 렌더러도 사용할 수 있습니다. 예를 들어, 써드파티 PDF 렌더링 서비스를 위한 API를 호출하여 인보이스 PDF를 생성할 수도 있습니다.

```php
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

커스텀 렌더러 구현체를 작성한 후에는, 애플리케이션의 `config/cashier.php` 설정 파일 내 `cashier.invoices.renderer` 설정값을 해당 클래스명으로 변경하면 됩니다.

<a name="checkout"></a>
## 체크아웃(Checkout)

Cashier Stripe는 [Stripe Checkout](https://stripe.com/payments/checkout)도 지원합니다. Stripe Checkout은 별도의 결제 페이지 개발 부담 없이 미리 구축된 호스팅 결제 페이지를 사용할 수 있게 해줍니다.

아래는 Cashier에서 Stripe Checkout을 시작하는 방법을 설명합니다. Stripe Checkout에 대한 더 자세한 내용은 [Stripe의 공식 Checkout 문서](https://stripe.com/docs/payments/checkout)도 참고해 보세요.

<a name="product-checkouts"></a>
### 제품 체크아웃

Stripe 대시보드에서 미리 생성해 둔 상품을 대상으로, billable 모델의 `checkout` 메서드를 이용해 체크아웃을 진행할 수 있습니다. `checkout` 메서드는 Stripe Checkout 세션을 시작합니다. 기본적으로 Stripe Price ID를 전달해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout('price_tshirt');
});
```

필요하다면 상품 수량도 지정할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 15]);
});
```

고객이 이 라우트에 접근하면 Stripe의 Checkout 페이지로 리다이렉트됩니다. 기본적으로 결제 성공 또는 취소 후에는 `home` 라우트로 리다이렉트되지만, `success_url` 및 `cancel_url` 옵션을 지정하여 다른 콜백 URL로 보낼 수도 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

`success_url` 옵션에 실제 Stripe Checkout 세션 ID를 특정 파라미터로 추가해 받고 싶다면, URL 쿼리 문자열에 `{CHECKOUT_SESSION_ID}` 리터럴을 포함시키면 됩니다. Stripe가 해당 플레이스홀더를 실제 세션 ID로 자동으로 대체해 전달합니다.

```php
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

기본적으로 Stripe Checkout은 [사용자가 직접 사용할 수 있는 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 허용하지 않습니다. 다행히도, Checkout 페이지에서 이를 활성화하는 방법은 매우 간단합니다. 이를 위해 `allowPromotionCodes` 메서드를 호출하시면 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a name="single-charge-checkouts"></a>
### 단일 결제 Checkout

Stripe 대시보드에 생성되어 있지 않은 상품에 대해서도 간단하게 한 번만 결제를 진행할 수 있습니다. 이를 위해 청구 가능한 금액, 상품명, 선택적으로 수량을 billable 모델의 `checkoutCharge` 메서드에 전달하면 됩니다. 고객이 이 라우트를 방문하면 Stripe의 Checkout 페이지로 리디렉션됩니다.

```php
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> [!WARNING]
> `checkoutCharge` 메서드를 사용하면 Stripe는 항상 Stripe 대시보드에 새로운 상품(product)과 가격(price)을 생성합니다. 따라서, 가능하다면 미리 Stripe 대시보드에서 상품을 만들어두고 `checkout` 메서드를 사용하는 것을 권장합니다.

<a name="subscription-checkouts"></a>
### 구독 Checkout

> [!WARNING]
> Stripe Checkout을 이용한 구독을 지원하려면 Stripe 대시보드에서 `customer.subscription.created` 웹훅을 활성화해야 합니다. 이 웹훅은 데이터베이스에 구독 기록을 생성하고 관련된 구독 아이템 정보를 저장합니다.

Stripe Checkout을 사용해 구독을 시작할 수도 있습니다. Cashier의 구독 빌더 메서드로 구독을 정의한 뒤, `checkout` 메서드를 호출하면 됩니다. 고객이 해당 라우트를 방문하면 Stripe의 Checkout 페이지로 이동하게 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

상품 Checkout과 마찬가지로, 성공 및 취소 URL을 지정해 Checkout 흐름을 원하는 대로 커스터마이즈할 수 있습니다.

```php
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

물론, 구독 Checkout에서도 프로모션 코드를 활성화할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->allowPromotionCodes()
        ->checkout();
});
```

> [!WARNING]
> Stripe Checkout을 사용해 구독을 시작할 때는 Stripe가 제공하는 모든 구독 청구 옵션이 지원되지 않습니다. 예를 들어, 구독 빌더의 `anchorBillingCycleOn` 메서드를 사용하거나, 계산 방식(proration) 또는 결제 방식(payment behavior)을 설정해도 Stripe Checkout 세션에서는 적용되지 않습니다. 사용 가능한 파라미터 목록은 [Stripe Checkout 세션 API 공식 문서](https://stripe.com/docs/api/checkout/sessions/create)를 참고하시기 바랍니다.

<a name="stripe-checkout-trial-periods"></a>
#### Stripe Checkout과 체험 기간(Trial Period)

Stripe Checkout을 이용해 구독을 만들 때, 구독 빌더에서 체험 기간을 지정할 수 있습니다.

```php
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

단, Stripe Checkout에서 지원하는 최소 체험 기간이 48시간이므로, 체험 기간은 최소한 48시간 이상이어야 합니다.

<a name="stripe-checkout-subscriptions-and-webhooks"></a>
#### 구독 및 웹훅

Stripe와 Cashier는 웹훅을 통해 구독 상태를 업데이트하므로, 고객이 결제 정보를 입력한 뒤 애플리케이션으로 돌아왔을 때 구독이 아직 활성화 상태가 아닐 수도 있습니다. 이런 상황을 처리하기 위해, 결제 또는 구독이 아직 처리 중임을 알리는 메시지를 사용자에게 보여줄 수 있습니다.

<a name="collecting-tax-ids"></a>
### 세금 ID(Tax ID) 수집

Stripe Checkout은 고객의 Tax ID(세금 식별번호) 정보 수집도 지원합니다. 세션을 만들 때 `collectTaxIds` 메서드를 호출하면 이 기능을 활성화할 수 있습니다.

```php
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

이 메서드를 사용하면, 구매자가 법인으로 구매하는 경우를 표시할 수 있는 체크박스가 나타납니다. 법인 구매를 선택하면 회사의 Tax ID 번호를 입력하는 칸이 추가됩니다.

> [!WARNING]
> 이미 애플리케이션의 서비스 프로바이더에서 [자동 세금 징수 자동화](#tax-configuration)를 설정해두셨다면, 이 기능은 자동으로 활성화되므로 `collectTaxIds` 메서드를 별도로 호출할 필요가 없습니다.

<a name="guest-checkouts"></a>
### 비회원(Guest) Checkout

`Checkout::guest` 메서드를 이용하면, 애플리케이션에 "계정"이 없는 방문자를 위한 Checkout 세션도 생성할 수 있습니다.

```php
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()->create('price_tshirt', [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

기존 사용자를 위한 Checkout 세션을 생성할 때와 마찬가지로, `Laravel\Cashier\CheckoutBuilder` 인스턴스의 다양한 메서드를 활용하여 비회원 Checkout 세션도 커스터마이즈할 수 있습니다.

```php
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

비회원 Checkout이 완료된 후, Stripe는 `checkout.session.completed` 웹훅 이벤트를 전송할 수 있으므로 반드시 [Stripe 웹훅을 애플리케이션에 전달하도록 설정](https://dashboard.stripe.com/webhooks)해야 합니다. Stripe 대시보드에서 해당 웹훅을 활성화한 후에는 [Cashier에서 웹훅을 처리](#handling-stripe-webhooks)할 수 있습니다. 이때 웹훅 payload에 포함되는 객체는 [checkout 객체](https://stripe.com/docs/api/checkout/sessions/object)로서, 고객 주문을 처리하는 데 활용할 수 있습니다.

<a name="handling-failed-payments"></a>
## 결제 실패 처리

구독이나 단일 결제(single charge)에서도 결제가 실패할 수 있습니다. 이럴 경우 Cashier는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시켜 결제가 완료되지 않았음을 알려줍니다. 이 예외를 처리한 후, 다음 두 가지 방법 중 하나로 흐름을 이어갈 수 있습니다.

첫 번째 방법은 고객을 Cashier에서 기본으로 제공하는 전용 결제 확인 페이지로 리디렉션하는 것입니다. 이 페이지는 Cashier의 서비스 프로바이더에 의해 등록된 별도의 이름 있는(named) 라우트를 갖고 있습니다. 따라서 `IncompletePayment` 예외를 캐치한 뒤, 아래와 같이 결제 확인 페이지로 이동시키면 됩니다.

```php
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

결제 확인 페이지에서는 고객에게 카드 정보를 다시 입력하거나 Stripe가 요구하는 "3D Secure" 인증과 같은 추가 작업을 요청할 수 있습니다. 결제가 완료되면, 위에서 지정한 `redirect` 파라미터의 URL로 이동하게 됩니다. 이때 URL에는 `message`(문자열), `success`(정수) 쿼리 문자열 변수가 함께 추가됩니다. 해당 결제 페이지는 현재 다음 결제 수단 유형을 지원합니다.

<div class="content-list" markdown="1">

- 신용카드(Credit Cards)
- Alipay
- Bancontact
- BECS 다이렉트 디빗(BECS Direct Debit)
- EPS
- Giropay
- iDEAL
- SEPA 다이렉트 디빗(SEPA Direct Debit)

</div>

대안으로 Stripe에서 제공하는 자동 결제 확인(automatic billing emails) 기능을 활용할 수도 있습니다. 이 경우, 결제 확인 페이지로 리디렉션하지 않고 Stripe 대시보드에서 [자동 결제 이메일](https://dashboard.stripe.com/account/billing/automatic)을 설정합니다. 단, `IncompletePayment` 예외가 발생한 경우에는 추가 결제 안내가 이메일로 발송됨을 사용자에게 반드시 안내해야 합니다.

결제 예외는 `Billable` 트레이트를 사용하는 모델의 `charge`, `invoiceFor`, `invoice` 등의 메서드에서 발생할 수 있습니다. 구독과 관련된 경우, `SubscriptionBuilder`의 `create` 메서드, 그리고 `Subscription`, `SubscriptionItem` 모델의 `incrementAndInvoice`, `swapAndInvoice` 메서드에서도 결제 미완료 예외가 발생할 수 있습니다.

기존 구독이 결제 미완료 상태인지 확인하려면, billable 모델이나 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용합니다.

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

`payment` 속성을 통해 결제 미완료의 구체적인 상태도 확인할 수 있습니다.

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // 결제 인텐트 상태 조회...
    $exception->payment->status;

    // 구체적인 조건 확인...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a name="confirming-payments"></a>
### 결제 확인(Confirming Payments)

일부 결제 수단은 결제를 확정할 때 추가 정보가 필요합니다. 예를 들어, SEPA 결제 방식은 "mandate" 데이터가 추가로 필요할 수 있습니다. 이러한 데이터는 `withPaymentConfirmationOptions` 메서드를 통해 Cashier에 전달할 수 있습니다.

```php
$subscription->withPaymentConfirmationOptions([
    'mandate_data' => '...',
])->swap('price_xxx');
```

결제 확정 시 전달할 수 있는 모든 옵션 목록은 [Stripe API 공식 문서](https://stripe.com/docs/api/payment_intents/confirm)를 참고하세요.

<a name="strong-customer-authentication"></a>
## 강력한 고객 인증(Strong Customer Authentication)

비즈니스 또는 고객이 유럽에 위치한 경우, EU의 강력한 고객 인증(SCA, Strong Customer Authentication) 규정을 따라야 합니다. 이 규정은 2019년 9월부터 유럽 연합에 의해 도입되어 결제 사기를 방지하기 위한 목적으로 시행되고 있습니다. Stripe와 Cashier는 SCA를 준수하는 애플리케이션 개발에 최적화되어 있습니다.

> [!WARNING]
> 시작하기 전에, [Stripe의 PSD2 및 SCA 가이드](https://stripe.com/guides/strong-customer-authentication)와 [새로운 SCA API 문서](https://stripe.com/docs/strong-customer-authentication)를 모두 확인하시기 바랍니다.

<a name="payments-requiring-additional-confirmation"></a>
### 추가 확인이 필요한 결제

SCA 규정에 따라 결제 승인을 위해 추가 검증 절차가 요구될 수 있습니다. 이 경우 Cashier는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 던지며, 추가 검증이 필요함을 알려줍니다. 예외 처리 방법에 대한 자세한 내용은 [결제 실패 처리 문서](#handling-failed-payments)에서 확인할 수 있습니다.

Stripe 및 Cashier에서 제공하는 결제 확인 화면은 은행이나 카드 발급사의 결제 플로우에 맞게 조정될 수 있으며, 추가 카드 인증, 일시적인 소액 결제, 별도 기기 인증 등 다양한 검증 절차를 포함할 수 있습니다.

<a name="incomplete-and-past-due-state"></a>
#### 결제 미완료(incomplete) 및 연체(past_due) 상태

결제에 추가 확인이 필요하면, 구독은 데이터베이스의 `stripe_status` 컬럼에서 `incomplete` 또는 `past_due` 상태로 유지됩니다. Cashier는 결제 승인이 완료되고 Stripe로부터 웹훅을 통해 통지가 오면 고객의 구독을 자동으로 활성화합니다.

`incomplete`, `past_due` 상태에 대한 추가 설명은 [별도의 문서](#incomplete-and-past-due-status)를 참고하세요.

<a name="off-session-payment-notifications"></a>
### 세션 외 결제(Off-Session) 알림

SCA 규정 때문에, 구독이 활성 상태인 동안에도 고객이 결제 정보를 재인증해야 하는 상황이 종종 발생할 수 있습니다. Cashier는 이럴 때 고객에게 결제 확인 요청 알림을 보낼 수 있습니다. 예를 들어, 구독 갱신 시 이러한 상황이 발생할 수 있습니다. Cashier의 결제 알림은 `CASHIER_PAYMENT_NOTIFICATION` 환경변수에 알림(Notification) 클래스를 지정하면 활성화할 수 있습니다. 기본적으로는 해당 알림이 비활성화되어 있습니다. Cashier가 제공하는 알림 클래스(`Laravel\Cashier\Notifications\ConfirmPayment`)를 사용하거나, 직접 원하는 알림 클래스를 만들어 사용할 수도 있습니다.

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

세션 외 결제 확인 알림이 정상적으로 동작하려면, [Stripe 웹훅이 애플리케이션에 제대로 설정](#handling-stripe-webhooks)되어 있어야 하며 Stripe 대시보드에서 `invoice.payment_action_required` 웹훅도 활성화되어 있어야 합니다. 또한, `Billable` 모델이 Laravel의 `Illuminate\Notifications\Notifiable` 트레이트를 사용하고 있어야 합니다.

> [!WARNING]
> 사용자가 수동으로 결제를 진행하더라도, 추가 확인이 필요한 경우에는 알림이 전송됩니다. Stripe에서는 수동 결제와 세션 외 결제를 구분할 수 없기 때문입니다. 하지만, 사용자가 이미 결제를 완료한 후 결제 페이지를 다시 방문하면 "결제 성공(Payment Successful)" 메시지만 표시되고, 동일한 결제를 두 번 처리하거나 중복 결제가 발생하지 않습니다.

<a name="stripe-sdk"></a>
## Stripe SDK

Cashier의 많은 객체는 Stripe SDK의 객체를 감싸는 래퍼입니다. Stripe의 객체를 직접 다루고 싶다면 `asStripe` 메서드를 사용하여 손쉽게 원본 객체를 가져올 수 있습니다.

```php
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

또한, `updateStripeSubscription` 메서드를 활용해 Stripe 구독 정보를 바로 업데이트할 수도 있습니다.

```php
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

`Cashier` 클래스의 `stripe` 메서드를 호출하면 `Stripe\StripeClient`를 직접 사용할 수 있습니다. 예를 들어, Stripe 계정에서 가격 목록을 조회하고 싶을 때 해당 인스턴스를 활용할 수 있습니다.

```php
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a name="testing"></a>
## 테스트

Cashier를 사용하는 애플리케이션을 테스트할 때 Stripe API로 실제 HTTP 요청을 보내지 않고 동작을 모킹(mocking)할 수도 있습니다. 하지만 이 방식은 Cashier의 내부 동작 일부를 직접 구현해야 하므로, 테스트 과정에서 Stripe API로 실제로 요청을 보내는 방식을 권장합니다. 비록 속도는 느릴 수 있지만, 애플리케이션이 제대로 동작하는지 더 자신있게 검증할 수 있고, 시간이 많이 걸리는 테스트는 별도의 Pest / PHPUnit 테스트 그룹으로 분리하는 방식도 사용할 수 있습니다.

Cashier 자체는 이미 폭넓은 테스트 스위트를 갖추고 있으므로, 여러분은 애플리케이션의 구독 및 결제 흐름만 테스트하면 충분합니다. Cashier 내부 동작 자체까지 모두 검사할 필요는 없습니다.

먼저, Stripe 비밀키의 **테스트용** 값을 `phpunit.xml` 파일에 추가합니다.

```xml
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

이렇게 설정하면 테스트 중 Cashier를 사용할 때 스트라이프 테스트 환경으로 실제 API 요청이 전송됩니다. 편의를 위해 Stripe 테스트 계정에 필요한 구독, 가격 정보를 미리 등록해두는 것이 좋습니다.

> [!NOTE]
> 신용카드 거절, 결제 실패 등 다양한 결제 시나리오를 테스트하려면 Stripe에서 제공하는 다양한 [테스트용 카드 번호와 토큰](https://stripe.com/docs/testing)을 사용할 수 있습니다.