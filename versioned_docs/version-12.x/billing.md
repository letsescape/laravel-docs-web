# 라라벨 Cashier (Stripe) (Laravel Cashier (Stripe))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
- [설정](#configuration)
    - [청구 대상 모델](#billable-model)
    - [API 키](#api-keys)
    - [통화 설정](#currency-configuration)
    - [세금 설정](#tax-configuration)
    - [로깅](#logging)
    - [커스텀 모델 사용](#using-custom-models)
- [빠른 시작](#quickstart)
    - [제품 판매하기](#quickstart-selling-products)
    - [구독 상품 판매하기](#quickstart-selling-subscriptions)
- [고객](#customers)
    - [고객 조회](#retrieving-customers)
    - [고객 생성](#creating-customers)
    - [고객 정보 업데이트](#updating-customers)
    - [잔액 관리](#balances)
    - [세금 ID](#tax-ids)
    - [Stripe와 고객 데이터 동기화](#syncing-customer-data-with-stripe)
    - [청구 포털](#billing-portal)
- [결제 수단](#payment-methods)
    - [결제 수단 저장](#storing-payment-methods)
    - [결제 수단 조회](#retrieving-payment-methods)
    - [결제 수단 존재 여부](#payment-method-presence)
    - [기본 결제 수단 변경](#updating-the-default-payment-method)
    - [결제 수단 추가](#adding-payment-methods)
    - [결제 수단 삭제](#deleting-payment-methods)
- [구독](#subscriptions)
    - [구독 생성](#creating-subscriptions)
    - [구독 상태 확인](#checking-subscription-status)
    - [가격 변경](#changing-prices)
    - [구독 수량](#subscription-quantity)
    - [여러 제품 구독](#subscriptions-with-multiple-products)
    - [복수 구독](#multiple-subscriptions)
    - [사용량 기반 과금](#usage-based-billing)
    - [구독 세금](#subscription-taxes)
    - [구독 기준일(앵커 날짜)](#subscription-anchor-date)
    - [구독 취소](#cancelling-subscriptions)
    - [구독 재개](#resuming-subscriptions)
- [구독 체험판](#subscription-trials)
    - [결제 수단을 미리 받는 경우](#with-payment-method-up-front)
    - [결제 수단 없이 시작하는 경우](#without-payment-method-up-front)
    - [체험판 연장](#extending-trials)
- [Stripe Webhook 처리](#handling-stripe-webhooks)
    - [Webhook 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [Webhook 시그니처 검증](#verifying-webhook-signatures)
- [단일 결제](#single-charges)
    - [간단 결제](#simple-charge)
    - [인보이스 결제](#charge-with-invoice)
    - [Payment Intents 생성](#creating-payment-intents)
    - [결제 환불](#refunding-charges)
- [Checkout](#checkout)
    - [제품 Checkout](#product-checkouts)
    - [단일 결제 Checkout](#single-charge-checkouts)
    - [구독 Checkout](#subscription-checkouts)
    - [세금 ID 수집](#collecting-tax-ids)
    - [비회원 Checkout](#guest-checkouts)
- [인보이스(청구서)](#invoices)
    - [인보이스 조회](#retrieving-invoices)
    - [예상 인보이스 조회](#upcoming-invoices)
    - [구독 인보이스 미리보기](#previewing-subscription-invoices)
    - [인보이스 PDF 생성](#generating-invoice-pdfs)
- [결제 실패 처리](#handling-failed-payments)
    - [결제 확인](#confirming-payments)
- [강화된 고객 인증(SCA)](#strong-customer-authentication)
    - [추가 인증이 필요한 결제](#payments-requiring-additional-confirmation)
    - [오프세션 결제 알림](#off-session-payment-notifications)
- [Stripe SDK](#stripe-sdk)
- [테스트하기](#testing)

<a name="introduction"></a>
## 소개

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe)는 [Stripe](https://stripe.com)의 구독 청구 서비스를 쉽고 직관적인 형태로 제공합니다. Cashier를 이용하면 여러분이 직접 작성하기 부담스러웠던 반복적인 구독 및 청구 관련 코드를 거의 모두 대신 처리해줍니다. 기본적인 구독 관리 뿐 아니라, 쿠폰 처리, 구독 교체, 구독 수량(quantity) 변경, 구독 취소 유예 기간 설정, 인보이스 PDF 생성 등 다양한 기능도 지원합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

새로운 Cashier 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.md)를 주의 깊게 확인해야 합니다.

> [!WARNING]
> 호환성에 영향을 주는 변경을 방지하기 위해 Cashier는 고정된 Stripe API 버전을 사용합니다. Cashier 15 버전에서는 Stripe API 버전 `2023-10-16`이 적용되어 있습니다. Stripe API 버전은 새로운 Stripe 기능 및 개선 사항을 활용하기 위해 마이너 릴리즈 시점에 업데이트될 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 사용하여 Stripe용 Cashier 패키지를 설치합니다:

```shell
composer require laravel/cashier
```

패키지 설치 후, `vendor:publish` 아티즌 명령어를 이용해 Cashier의 마이그레이션을 배포합니다:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

그다음, 데이터베이스 마이그레이션을 실행합니다:

```shell
php artisan migrate
```

Cashier 마이그레이션은 여러분의 `users` 테이블에 몇 가지 컬럼을 추가합니다. 또한 모든 고객의 구독 정보를 저장하는 `subscriptions` 테이블, 여러 가격이 있는 구독의 상세 항목을 저장하는 `subscription_items` 테이블도 새로 생성합니다.

원한다면, 다음 아티즌 명령어로 Cashier의 설정 파일도 배포할 수 있습니다:

```shell
php artisan vendor:publish --tag="cashier-config"
```

마지막으로, Cashier가 Stripe의 모든 이벤트를 올바르게 처리할 수 있도록 [Cashier의 Webhook 처리 설정](#handling-stripe-webhooks)을 잊지 말고 완료해 주세요.

> [!WARNING]
> Stripe에서는 Stripe 식별자를 저장하는 컬럼이 대소문자 구분(case-sensitive)이어야 한다고 권장합니다. 따라서, MySQL을 사용할 경우 `stripe_id` 컬럼의 collation을 반드시 `utf8_bin`으로 설정해야 합니다. 이와 관련한 더 자세한 내용은 [Stripe 공식 문서](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible)를 참고하세요.

<a name="configuration"></a>
## 설정

<a name="billable-model"></a>
### 청구 대상 모델

Cashier를 사용하기 전에, `Billable` 트레이트를 청구 대상 모델에 추가해야 합니다. 보통은 `App\Models\User` 모델에 적용합니다. 이 트레이트는 구독 생성, 쿠폰 적용, 결제 수단 정보 갱신 등 주요 청구 관련 작업을 손쉽게 수행할 수 있는 다양한 메서드를 제공합니다:

```php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Cashier는 기본적으로 여러분의 청구 대상 모델이 라라벨에서 제공하는 `App\Models\User` 클래스라고 가정합니다. 만약 이를 다른 모델로 바꾸고 싶다면, `useCustomerModel` 메서드를 사용해 다른 모델을 지정할 수 있습니다. 이 메서드는 일반적으로 여러분의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

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
> 라라벨 기본 `App\Models\User`가 아닌 다른 모델을 사용할 경우, [Cashier 마이그레이션](#installation)을 직접 배포하여 해당 모델의 테이블 이름에 맞게 수정해주셔야 합니다.

<a name="api-keys"></a>
### API 키

다음으로, 애플리케이션의 `.env` 파일에 Stripe API 키를 설정해야 합니다. Stripe API 키는 Stripe 관리 패널에서 발급받을 수 있습니다:

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> [!WARNING]
> `.env` 파일에 `STRIPE_WEBHOOK_SECRET` 환경 변수가 반드시 정의되어 있는지 확인하세요. 이 변수는 Stripe에서 오는 Webhook이 실제로 Stripe에서 보낸 것인지 검증하는 데 사용됩니다.

<a name="currency-configuration"></a>
### 통화 설정

Cashier의 기본 통화는 미국 달러(USD)입니다. 기본 통화를 변경하려면 애플리케이션의 `.env` 파일에 `CASHIER_CURRENCY` 환경 변수를 추가하면 됩니다:

```ini
CASHIER_CURRENCY=eur
```

Cashier 통화 설정 외에도 인보이스에 표시되는 금액을 포맷할 때 사용할 로케일도 지정할 수 있습니다. Cashier는 내부적으로 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 사용해 통화 로케일을 적용합니다:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> `en` 이외의 로케일을 사용하려면, 서버에 `ext-intl` PHP 확장 모듈이 설치되어 있고 정상적으로 설정되어 있어야 합니다.

<a name="tax-configuration"></a>
### 세금 설정

[Stripe Tax](https://stripe.com/tax) 기능 덕분에 Stripe가 생성하는 모든 인보이스에 대해 세금을 자동으로 계산할 수 있습니다. 이 자동 세금 계산 기능을 활성화하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `calculateTaxes` 메서드를 호출하세요:

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

세금 계산 기능을 활성화하면, 신규 구독 및 Stripe에서 생성되는 단일 인보이스에 세금이 자동으로 계산됩니다.

이 기능이 제대로 동작하려면 고객의 이름, 주소, 세금 ID 등 청구서 정보가 Stripe와 동기화되어야 합니다. [고객 데이터 동기화](#syncing-customer-data-with-stripe) 및 [Tax ID](#tax-ids) 관련 Cashier 메서드를 이용하면 쉽게 처리할 수 있습니다.

<a name="logging"></a>
### 로깅

Cashier는 Stripe에서 발생하는 치명적 오류(fatal error) 로그를 남길 로그 채널을 지정할 수 있습니다. 사용하려는 로그 채널을 애플리케이션의 `.env` 파일에서 `CASHIER_LOGGER` 환경 변수로 정의하세요:

```ini
CASHIER_LOGGER=stack
```

Stripe API 호출에서 발생한 예외는 여러분의 애플리케이션에서 기본적으로 사용하는 로그 채널을 통해 기록됩니다.

<a name="using-custom-models"></a>
### 커스텀 모델 사용

원한다면 Cashier에서 내부적으로 사용하는 모델을 확장해 직접 구현한 모델을 사용할 수 있습니다. Cashier 모델을 상속받아 여러분만의 모델을 정의하면 됩니다:

```php
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 후에는 `Laravel\Cashier\Cashier` 클래스를 통해 Cashier가 여러분의 커스텀 모델을 사용하도록 지정할 수 있습니다. 보통은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스 `boot` 메서드에서 지정합니다:

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
### 제품 판매하기

> [!NOTE]
> Stripe Checkout을 사용하기 전 먼저 Stripe 대시보드에서 고정 가격의 Product(제품)를 정의해야 합니다. 또한 [Cashier의 Webhook 처리](#handling-stripe-webhooks) 구성도 끝내야 합니다.

애플리케이션에서 상품 및 구독 상품을 판매하는 과정은 다소 복잡하게 느껴질 수 있습니다. 하지만 Cashier와 [Stripe Checkout](https://stripe.com/payments/checkout) 덕분에 쉽고 강력한 결제 시스템을 빠르게 구축할 수 있습니다.

단건 결제(비정기) 상품을 판매하려면, Cashier를 이용해 고객을 Stripe Checkout으로 이동시키고, 결제 정보를 입력받아 구매가 완료되면 애플리케이션 내부의 원하는 URL로 리다이렉트할 수 있습니다:

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

위 예시에서 볼 수 있듯, Cashier가 제공하는 `checkout` 메서드를 이용해 해당 "가격 식별자"로 Stripe Checkout에 고객이 리다이렉트됩니다. Stripe에서 말하는 "가격(prices)"은 [특정 상품에 대해 미리 정의된 가격](https://stripe.com/docs/products-prices/how-products-and-prices-work)을 의미합니다.

필요하다면, `checkout` 메서드는 Stripe 내에 자동으로 고객 레코드를 생성하고 해당 사용자를 애플리케이션 데이터베이스의 유저와 연결해줍니다. 결제 세션이 끝나면, 고객은 성공 혹은 취소 페이지로 리다이렉트되어 안내 메시지를 확인할 수 있습니다.

<a name="providing-meta-data-to-stripe-checkout"></a>
#### Stripe Checkout에 메타데이터 제공하기

제품 판매 시, 여러분의 애플리케이션에서 정의한 `Cart` 및 `Order` 모델을 통해 주문 완료 및 구매 상품 목록을 별도로 관리하는 것이 일반적입니다. Stripe Checkout 페이지로 리다이렉트할 때 기존 주문의 식별자를 함께 제공하면, 결제 완료 후 고객이 다시 애플리케이션으로 돌아올 때 해당 주문과 연동하여 처리할 수 있습니다.

이를 위해, `checkout` 메서드에 `metadata` 배열을 전달하면 됩니다. 예를 들어, 사용자가 Checkout을 시작하면 `Order`를 미리 생성하고 아래처럼 사용합니다. 참고로, 이 예시에 등장하는 `Cart`와 `Order` 모델은 설명을 위한 예시일 뿐 Cashier에서 제공하지 않습니다. 애플리케이션에 맞게 자유롭게 구현할 수 있습니다:

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

위 예시처럼 사용자가 결제를 시작하면, 해당 장바구니/주문의 Stripe 가격 식별자 리스트를 `checkout` 메서드에 전달합니다. 물론, 이 항목들을 고객이 장바구니에 담았을 때 애플리케이션에서 직접 연동해야 합니다. 또한 Checkout 세션에 `order_id` 값을 전달하여 추가적인 정보를 Stripe에 남기고, 결제 성공 후 반환 URL에 `CHECKOUT_SESSION_ID` 템플릿 변수를 활용하도록 추가했습니다. Stripe가 고객을 애플리케이션으로 리다이렉트할 때 이 변수에는 실제 Checkout 세션 ID가 자동으로 채워집니다.

이제 Checkout 성공 후 리다이렉트되는 라우트를 살펴봅니다. 이 라우트에서는 Stripe Checkout 세션 ID로 Stripe 세션 객체를 조회한 뒤, 전달해둔 메타데이터를 참조하여 고객의 주문 정보를 업데이트할 수 있습니다:

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

Stripe Checkout 세션 객체에 포함된 데이터에 대한 자세한 설명은 [Stripe 공식 문서](https://stripe.com/docs/api/checkout/sessions/object)를 참고하세요.

<a name="quickstart-selling-subscriptions"></a>
### 구독 상품 판매하기

> [!NOTE]
> Stripe Checkout을 사용하기 전 먼저 Stripe 대시보드에서 고정 가격의 Product(제품)를 정의해야 합니다. 또한 [Cashier의 Webhook 처리](#handling-stripe-webhooks) 구성도 끝내야 합니다.

애플리케이션에서 상품 및 구독 상품을 판매하는 과정은 다소 복잡하게 느껴질 수 있습니다. 하지만 Cashier와 [Stripe Checkout](https://stripe.com/payments/checkout) 덕분에 쉽고 강력한 결제 시스템을 빠르게 구축할 수 있습니다.

Cashier와 Stripe Checkout으로 구독 서비스를 판매하는 방법을 알아보겠습니다. 여기에서는 기본 월간 플랜(`price_basic_monthly`)과 연간 플랜(`price_basic_yearly`)이 있는 구독 서비스를 예시로 듭니다. 이 두 가격은 Stripe 대시보드의 "Basic" 상품(`pro_basic`) 아래에 그룹화할 수 있습니다. 또한, 별도의 고급 플랜(Expert Plan)을 `pro_expert`로 제공할 수도 있습니다.

먼저 고객이 어떻게 구독을 시작할 수 있는지 살펴보겠습니다. 실제 상황에서는, 고객이 애플리케이션 내 요금제 페이지에서 Basic 플랜 구독 버튼을 누르면, 해당 플랜의 Stripe Checkout 세션을 생성하는 라라벨 라우트로 이동합니다:

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

위 코드처럼 고객을 Stripe Checkout 세션으로 리다이렉트해 Basic 플랜에 구독하도록 할 수 있습니다. 결제 성공 또는 취소 후 고객은 `checkout` 메서드에 지정한 URL로 다시 이동하게 됩니다. 일부 결제 수단은 처리에 시간이 소요될 수 있으므로, 구독이 실제로 시작되는 시점을 아는 것이 중요하며, 이를 위해 [Cashier의 Webhook 처리](#handling-stripe-webhooks) 설정이 필요합니다.

이제 고객이 구독을 시작할 수 있게 되었으니, 애플리케이션 내 특정 기능을 구독한 사용자만 사용할 수 있도록 제한해야 합니다. Cashier의 `Billable` 트레이트가 제공하는 `subscribed` 메서드를 이용하면 사용자의 현재 구독 상태를 손쉽게 판별할 수 있습니다:

```blade
@if ($user->subscribed())
    <p>구독 중입니다.</p>
@endif
```

특정 상품이나 가격에 구독 중인지도 간단하게 판별할 수 있습니다:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>귀하는 Basic 상품에 구독 중입니다.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>귀하는 Basic 플랜(월간)에 구독 중입니다.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### 구독 여부 확인 미들웨어 만들기

실제 환경에서는, [미들웨어](/docs/middleware)를 만들어서 요청이 구독한 사용자에게서 온 것인지 판단할 수 있습니다. 이 미들웨어를 특정 라우트에 적용하면, 구독하지 않은 사용자가 해당 경로에 접근하는 것을 쉽고 안전하게 막을 수 있습니다:

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
            // 유저를 청구 페이지로 리다이렉트 시키고, 구독을 유도...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

미들웨어를 만든 후에는 아래처럼 라우트에 할당할 수 있습니다:

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### 고객이 스스로 결제 플랜을 관리할 수 있도록 하기

고객이 다른 상품이나 등급(tier)으로 구독 플랜을 변경하고 싶을 수 있습니다. 가장 간단하게 이를 지원하는 방법은 Stripe가 호스팅하는 [Customer Billing Portal](https://stripe.com/docs/no-code/customer-portal)을 이용하는 것입니다. 이 포털에서는 고객이 인보이스를 다운로드하거나, 결제 수단을 변경하거나, 구독 플랜을 스스로 변경할 수 있습니다.

먼저, 사용자가 Billing Portal 세션을 시작할 수 있도록 애플리케이션에 라라벨 라우트로 연결되는 버튼이나 링크를 만듭니다:

```blade
<a href="{{ route('billing') }}">
    Billing
</a>
```

그 다음, Stripe Customer Billing Portal 세션을 시작하고 Portal로 리다이렉트하는 라우트를 정의합니다. `redirectToBillingPortal` 메서드는 사용자가 Portal에서 나갈 때 돌아와야 할 URL을 인자로 받습니다:

```php
use Illuminate\Http\Request;

Route::get('/billing', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('dashboard'));
})->middleware(['auth'])->name('billing');
```

> [!NOTE]
> Cashier의 Webhook 처리가 잘 설정되어 있다면, Cashier는 Stripe에서 날아오는 Webhook을 자동으로 감지하여 애플리케이션의 Cashier 관련 데이터베이스 테이블을 항상 동기화합니다. 예를 들어, 사용자가 Customer Billing Portal에서 직접 구독을 취소하면, 관련 Webhook을 받았을 때 Cashier가 데이터베이스의 해당 구독을 '취소됨'으로 자동 반영해줍니다.

<a name="customers"></a>
## 고객

<a name="retrieving-customers"></a>
### 고객 조회

`Cashier::findBillable` 메서드를 사용하면 Stripe ID로 고객을 조회할 수 있습니다. 이 메서드는 해당 청구 모델의 인스턴스를 반환합니다:

```php
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a name="creating-customers"></a>
### 고객 생성

가끔은 곧바로 구독을 시작하지 않고 Stripe 고객만 미리 만들어두고 싶을 수 있습니다. 이럴 때는 `createAsStripeCustomer` 메서드를 사용하세요:

```php
$stripeCustomer = $user->createAsStripeCustomer();
```

Stripe에 고객이 생성되고 나면, 추후 언제든 구독을 시작할 수 있습니다. Stripe API에서 지원하는 [고객 생성 파라미터](https://stripe.com/docs/api/customers/create)를 옵션 배열로 넘겨줄 수도 있습니다:

```php
$stripeCustomer = $user->createAsStripeCustomer($options);
```

청구 모델 인스턴스의 Stripe 고객 객체를 반환받고 싶으면 `asStripeCustomer` 메서드를 사용할 수 있습니다:

```php
$stripeCustomer = $user->asStripeCustomer();
```

해당 청구 모델이 Stripe에 이미 고객으로 등록되어 있는지 확실하지 않다면, `createOrGetStripeCustomer` 메서드를 사용하세요. 해당 모델이 이미 Stripe에 존재한다면 고객 객체를, 아니라면 새로 생성해서 반환합니다:

```php
$stripeCustomer = $user->createOrGetStripeCustomer();
```

<a name="updating-customers"></a>
### 고객 정보 업데이트

가끔은 Stripe의 고객 정보를 추가로 업데이트하고 싶을 수 있습니다. 이럴 때는 `updateStripeCustomer` 메서드를 사용하면 됩니다. 이 메서드는 Stripe API가 지원하는 [고객 정보 업데이트 옵션](https://stripe.com/docs/api/customers/update) 배열을 받습니다:

```php
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a name="balances"></a>
### 잔액 관리

Stripe에서는 고객의 "잔액(balance)"에 크레딧 또는 차감(디빗) 처리가 가능합니다. 이 잔액은 이후 발행되는 인보이스에서 다시 정산됩니다. 고객의 전체 잔액을 확인하려면, 청구 대상 모델에서 `balance` 메서드를 사용하세요. 이 메서드는 고객 통화 기준의 서식화된 문자열을 반환합니다:

```php
$balance = $user->balance();
```

고객의 잔액을 적립하려면, `creditBalance` 메서드에 값을 전달하면 됩니다. 필요하다면 설명도 추가할 수 있습니다:

```php
$user->creditBalance(500, 'Premium customer top-up.');
```

`debitBalance` 메서드에 값을 전달하면 고객 잔액이 차감됩니다:

```php
$user->debitBalance(300, 'Bad usage penalty.');
```

`applyBalance` 메서드는 고객에 대한 새 잔액 트랜잭션을 생성합니다. `balanceTransactions` 메서드로 이러한 트랜잭션 기록을 조회할 수 있으니, 고객에게 크레딧/차감 내역 제공이 필요할 때 유용하게 쓸 수 있습니다:

```php
// 모든 트랜잭션 조회...
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // 트랜잭션 금액...
    $amount = $transaction->amount(); // $2.31

    // 연관된 인보이스가 있다면 조회...
    $invoice = $transaction->invoice();
}
```

<a name="tax-ids"></a>
### 세금 ID

Cashier는 고객의 세금 ID 관리도 쉽게 지원합니다. 예를 들어, `taxIds` 메서드로 [모든 세금 ID](https://stripe.com/docs/api/customer_tax_ids/object)를 컬렉션 형태로 조회할 수 있습니다:

```php
$taxIds = $user->taxIds();
```

특정 세금 ID를 식별자 기준으로 조회할 수도 있습니다:

```php
$taxId = $user->findTaxId('txi_belgium');
```

`createTaxId` 메서드에 Stripe에서 인정하는 [타입](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type)과 값을 전달하면 새 세금 ID를 생성할 수 있습니다:

```php
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

`createTaxId` 메서드를 호출하면 즉시 고객 계정에 VAT ID가 추가됩니다. [VAT ID 검증은 Stripe에서도 이뤄지며](https://stripe.com/docs/invoicing/customer/tax-ids#validation), 이 과정은 비동기로 처리됩니다. 검증 업데이트를 받아보고 싶다면 `customer.tax_id.updated` Webhook 이벤트를 구독해서, [VAT ID의 `verification` 파라미터](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification)를 확인하세요. Webhook 처리에 대한 자세한 내용은 [Webhook 핸들러 정의 문서](#handling-stripe-webhooks)를 참고하세요.

`deleteTaxId` 메서드를 이용하면 세금 ID를 삭제할 수 있습니다:

```php
$user->deleteTaxId('txi_belgium');
```

<a name="syncing-customer-data-with-stripe"></a>

### Stripe와 고객 데이터 동기화하기

일반적으로, 애플리케이션의 사용자가 이름, 이메일 주소 등 Stripe에 저장된 정보와 동일한 정보를 업데이트할 경우 이 변경 사항을 Stripe에도 알려주는 것이 좋습니다. 이렇게 하면 Stripe의 정보와 애플리케이션의 정보가 항상 일치하게 됩니다.

이 과정을 자동화하려면, 결제 가능(billable) 모델의 `updated` 이벤트에 반응하는 이벤트 리스너를 정의하면 됩니다. 이벤트 리스너 내에서 모델의 `syncStripeCustomerDetails` 메서드를 호출할 수 있습니다.

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

이렇게 하면 고객 모델이 업데이트될 때마다 해당 정보가 Stripe와 동기화됩니다. 참고로, Cashier는 고객이 처음 생성될 때 자동으로 Stripe와 고객 정보를 동기화해줍니다.

Stripe에 동기화할 고객 정보 컬럼을 커스터마이징하려면 Cashier가 제공하는 다양한 메서드를 오버라이드하면 됩니다. 예를 들어, Cashier가 Stripe로 고객 정보를 동기화할 때 ‘이름’으로 취급할 속성을 지정하고 싶다면 `stripeName` 메서드를 오버라이드하면 됩니다.

```php
/**
 * Stripe에 동기화할 고객 이름을 반환합니다.
 */
public function stripeName(): string|null
{
    return $this->company_name;
}
```

마찬가지로, `stripeEmail`, `stripePhone`, `stripeAddress`, `stripePreferredLocales` 메서드도 오버라이드할 수 있습니다. 이 메서드들은 [Stripe 고객 객체 업데이트](https://stripe.com/docs/api/customers/update) 시 각 파라미터에 해당하는 정보를 동기화합니다. 만약 고객 정보 동기화 과정을 완전히 직접 제어하고 싶다면, `syncStripeCustomerDetails` 메서드를 오버라이드할 수 있습니다.

<a name="billing-portal"></a>
### 결제 포털(Billing Portal)

Stripe는 [결제 포털을 손쉽게 설정할 수 있는 방법](https://stripe.com/docs/billing/subscriptions/customer-portal)을 제공하여, 고객이 자신의 구독, 결제 수단, 결제 내역을 직접 관리할 수 있도록 합니다. 컨트롤러나 라우트에서 결제 가능(billable) 모델의 `redirectToBillingPortal` 메서드를 호출하여 사용자를 결제 포털로 리다이렉트할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

기본적으로 사용자가 구독 관리를 마치면, Stripe 결제 포털 내 링크를 통해 애플리케이션의 `home` 라우트로 돌아올 수 있습니다. 사용자가 돌아올 URL을 변경하고 싶을 때는 `redirectToBillingPortal` 메서드에 URL을 인수로 전달하면 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

HTTP 리다이렉트 응답을 생성하지 않고 결제 포털로 이동할 URL만 얻고 싶을 때는 `billingPortalUrl` 메서드를 사용할 수 있습니다.

```php
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a name="payment-methods"></a>
## 결제 수단

<a name="storing-payment-methods"></a>
### 결제 수단 저장하기

Stripe에서 구독을 생성하거나 "일회성 결제"를 처리하려면, 결제 수단을 저장하고 Stripe에서 해당 식별자를 받아와야 합니다. 이 과정을 수행하는 방식은 해당 결제 수단을 구독에 사용할지, 단일 결제에 사용할지에 따라 다르므로 아래에서 각각 설명합니다.

<a name="payment-methods-for-subscriptions"></a>
#### 구독을 위한 결제 수단

고객의 신용카드 정보를 구독에 사용할 목적으로 저장할 때는 Stripe의 "Setup Intents" API를 사용하여 결제 수단을 안전하게 수집해야 합니다. "Setup Intent"는 Stripe에 결제 수단을 청구할 의도가 있음을 알리는 객체입니다. Cashier의 `Billable` 트레이트에는 Setup Intent를 쉽게 생성할 수 있는 `createSetupIntent` 메서드가 포함되어 있습니다. 이 메서드는 결제 수단 정보를 입력받는 폼을 렌더링하는 라우트나 컨트롤러에서 호출하면 됩니다.

```php
return view('update-payment-method', [
    'intent' => $user->createSetupIntent()
]);
```

Setup Intent를 생성해 뷰로 전달했다면, 해당 Setup Intent의 secret을 결제 수단 정보를 입력받는 엘리먼트에 바인딩해야 합니다. 예를 들어 아래와 같은 "결제 수단 업데이트" 폼을 생각해볼 수 있습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    Update Payment Method
</button>
```

다음으로 Stripe.js 라이브러리를 이용해 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 추가하고, 고객의 결제 정보를 안전하게 수집할 수 있습니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

이제 [Stripe의 `confirmCardSetup` 메서드](https://stripe.com/docs/js/setup_intents/confirm_card_setup)를 활용해 카드 정보를 검증하고 Stripe에서 안전한 "결제 수단 식별자"를 받아올 수 있습니다.

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
        // Display "error.message" to the user...
    } else {
        // The card has been verified successfully...
    }
});
```

카드가 Stripe에 의해 성공적으로 인증된 후에는, 생성된 `setupIntent.payment_method` 식별자를 라라벨 애플리케이션에 전달해 해당 결제 수단을 고객에게 연결할 수 있습니다. 이 결제 수단은 [새로운 결제 수단으로 추가](#adding-payment-methods)하거나 [기본 결제 수단을 갱신](#updating-the-default-payment-method)할 때 사용할 수 있습니다. 또는 바로 이 결제 수단 식별자를 이용해 [새 구독을 생성](#creating-subscriptions)할 수도 있습니다.

> [!NOTE]
> Setup Intent나 고객 결제 정보 수집에 대해 더 자세한 내용을 보고 싶으시다면 [Stripe에서 제공하는 개요 문서](https://stripe.com/docs/payments/save-and-reuse#php)를 참고하세요.

<a name="payment-methods-for-single-charges"></a>
#### 단일 결제의 결제 수단

고객의 결제 수단으로 단일 결제(한 번만 결제)를 진행하고자 할 때는 결제 수단 식별자를 한 번만 사용하게 됩니다. Stripe의 제한상, 고객이 저장해둔 기본 결제 수단은 단일 결제에 사용할 수 없습니다. 대신 Stripe.js 라이브러리를 사용해 고객이 직접 결제 수단 정보를 입력하도록 해야 합니다. 예를 들어 아래와 같은 폼을 사용할 수 있습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button">
    Process Payment
</button>
```

이처럼 폼을 정의한 후에는 Stripe.js 라이브러리를 이용해 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 붙이고, 안전하게 고객의 결제 정보를 수집합니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

그리고 [Stripe의 `createPaymentMethod` 메서드](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method)를 이용해 카드 정보를 인증하고 Stripe에서 안전한 "결제 수단 식별자"를 받아올 수 있습니다.

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
        // Display "error.message" to the user...
    } else {
        // The card has been verified successfully...
    }
});
```

카드 인증이 성공하면, `paymentMethod.id`를 라라벨 애플리케이션에 전달해 [단일 결제](#simple-charge)를 처리하면 됩니다.

<a name="retrieving-payment-methods"></a>
### 결제 수단 조회

결제 가능(billable) 모델 인스턴스의 `paymentMethods` 메서드는 `Laravel\Cashier\PaymentMethod` 인스턴스 컬렉션을 반환합니다.

```php
$paymentMethods = $user->paymentMethods();
```

기본적으로 이 메서드는 모든 타입의 결제 수단을 반환합니다. 특정 타입의 결제 수단만 조회하려면 `type` 값을 인수로 전달할 수 있습니다.

```php
$paymentMethods = $user->paymentMethods('sepa_debit');
```

고객의 기본 결제 수단을 가져오려면 `defaultPaymentMethod` 메서드를 사용합니다.

```php
$paymentMethod = $user->defaultPaymentMethod();
```

결제 가능(billable) 모델에 연결된 특정 결제 수단을 조회하려면 `findPaymentMethod` 메서드를 사용할 수 있습니다.

```php
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a name="payment-method-presence"></a>
### 결제 수단 존재 여부 확인

결제 가능(billable) 모델이 기본 결제 수단을 계정에 연결했는지 확인하려면 `hasDefaultPaymentMethod` 메서드를 호출합니다.

```php
if ($user->hasDefaultPaymentMethod()) {
    // ...
}
```

최소 한 개라도 결제 수단이 연결되어 있는지 확인하려면 `hasPaymentMethod` 메서드를 사용할 수 있습니다.

```php
if ($user->hasPaymentMethod()) {
    // ...
}
```

이 메서드는 결제 가능(billable) 모델에 결제 수단이 하나라도 존재하는지를 확인합니다. 특정 타입의 결제 수단이 있는지 확인하고 싶다면, `type` 값을 인수로 전달할 수 있습니다.

```php
if ($user->hasPaymentMethod('sepa_debit')) {
    // ...
}
```

<a name="updating-the-default-payment-method"></a>
### 기본 결제 수단 업데이트

고객의 기본 결제 수단 정보를 업데이트하려면 `updateDefaultPaymentMethod` 메서드를 사용할 수 있습니다. 이 메서드는 Stripe 결제 수단 식별자를 인수로 받아, 해당 결제 수단을 새로운 기본 청구 수단으로 지정합니다.

```php
$user->updateDefaultPaymentMethod($paymentMethod);
```

Stripe 상의 고객 기본 결제 수단 정보를 내 애플리케이션과 동기화하려면 `updateDefaultPaymentMethodFromStripe` 메서드를 사용할 수 있습니다.

```php
$user->updateDefaultPaymentMethodFromStripe();
```

> [!WARNING]
> 고객의 기본 결제 수단은 인보이스 청구나 새 구독 생성에만 사용할 수 있습니다. Stripe의 제한으로 인해 단일 결제엔 사용할 수 없습니다.

<a name="adding-payment-methods"></a>
### 결제 수단 추가

새로운 결제 수단을 추가하려면, 결제 가능(billable) 모델에서 `addPaymentMethod` 메서드를 호출하고 결제 수단 식별자를 인수로 전달하면 됩니다.

```php
$user->addPaymentMethod($paymentMethod);
```

> [!NOTE]
> 결제 수단 식별자 획득 방법을 알고 싶다면 [결제 수단 저장하기](#storing-payment-methods) 문서를 참고하세요.

<a name="deleting-payment-methods"></a>
### 결제 수단 삭제

결제 수단을 삭제하려면, 삭제하려는 `Laravel\Cashier\PaymentMethod` 인스턴스에서 `delete` 메서드를 호출합니다.

```php
$paymentMethod->delete();
```

`deletePaymentMethod` 메서드를 사용하면 결제 가능(billable) 모델에 연결된 특정 결제 수단만 삭제할 수 있습니다.

```php
$user->deletePaymentMethod('pm_visa');
```

`deletePaymentMethods` 메서드는 결제 가능(billable) 모델에 연결된 모든 결제 수단 정보를 삭제합니다.

```php
$user->deletePaymentMethods();
```

기본적으로 이 메서드는 모든 타입의 결제 수단을 삭제합니다. 특정 타입의 결제 수단만 삭제하고 싶다면 `type` 값을 인수로 넘기면 됩니다.

```php
$user->deletePaymentMethods('sepa_debit');
```

> [!WARNING]
> 사용자가 활성화된 구독이 있을 경우, 애플리케이션에서는 기본 결제 수단 삭제를 허용하면 안 됩니다.

<a name="subscriptions"></a>
## 구독

구독은 고객에게 반복 결제를 설정하는 방법을 제공합니다. Cashier로 관리되는 Stripe 구독은 여러 구독 가격, 구독 수량, 체험(트라이얼) 등 다양한 기능을 지원합니다.

<a name="creating-subscriptions"></a>
### 구독 생성하기

구독을 생성하려면 먼저 결제 가능(billable) 모델의 인스턴스를 가져와야 합니다. 일반적으로 이 인스턴스는 `App\Models\User`입니다. 모델 인스턴스를 가져온 후, `newSubscription` 메서드를 사용해 구독을 생성할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

`newSubscription` 메서드의 첫 번째 인수는 구독의 내부 타입입니다. 애플리케이션에서 하나의 구독만 제공한다면, `default`나 `primary` 같은 값을 사용할 수 있습니다. 이 구독 타입은 내부적으로만 사용하며, 사용자에게 보여지는 값은 아닙니다. 또한 띄어쓰기를 포함해서는 안 되며, 구독 생성 후에는 절대로 변경하면 안 됩니다. 두 번째 인수는 사용자가 구독할 가격 상품의 고유 식별자입니다. 이 값은 Stripe 내 가격의 식별자와 일치해야 합니다.

[a Stripe 결제 수단 식별자](#storing-payment-methods) 또는 Stripe `PaymentMethod` 객체를 인수로 받는 `create` 메서드는 구독을 실제로 시작하며, 결제 가능 모델의 Stripe 고객 ID 및 결제 관련 정보도 데이터베이스에 업데이트합니다.

> [!WARNING]
> 결제 수단 식별자를 직접 `create` 구독 메서드에 넘기면 해당 결제 수단이 자동으로 사용자의 저장 결제 수단 목록에도 추가됩니다.

<a name="collecting-recurring-payments-via-invoice-emails"></a>
#### 인보이스 이메일을 통한 반복 결제 수금

고객의 반복 결제를 자동으로 수금하는 대신, Stripe가 결제 기한이 될 때마다 고객에게 인보이스 이메일을 보내고, 고객이 수동으로 결제하도록 할 수 있습니다. 이 경우 고객은 미리 결제 수단을 등록할 필요가 없습니다.

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

고객이 인보이스를 결제하지 않으면 구독이 취소되기까지 걸리는 기한은 `days_until_due` 옵션으로 결정됩니다. 기본값은 30일이지만, 원한다면 아래와 같이 원하는 값을 지정할 수 있습니다.

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
    'days_until_due' => 30
]);
```

<a name="subscription-quantities"></a>
#### 수량(Quantities)

구독 생성 시 가격 상품에 대한 [수량](https://stripe.com/docs/billing/subscriptions/quantities)을 지정하려면, 구독 빌더에서 `quantity` 메서드를 호출한 뒤 구독을 생성하세요.

```php
$user->newSubscription('default', 'price_monthly')
    ->quantity(5)
    ->create($paymentMethod);
```

<a name="additional-details"></a>
#### 추가 상세 정보

Stripe에서 지원하는 [고객](https://stripe.com/docs/api/customers/create) 또는 [구독](https://stripe.com/docs/api/subscriptions/create) 관련 추가 옵션을 지정하고 싶다면, 이 옵션들을 각각 `create` 메서드의 두 번째와 세 번째 인수로 전달할 수 있습니다.

```php
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a name="coupons"></a>
#### 쿠폰

구독 생성 시 쿠폰을 적용하고 싶다면, `withCoupon` 메서드를 사용할 수 있습니다.

```php
$user->newSubscription('default', 'price_monthly')
    ->withCoupon('code')
    ->create($paymentMethod);
```

또는, [Stripe 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 적용하고 싶을 때는 `withPromotionCode` 메서드를 사용할 수 있습니다.

```php
$user->newSubscription('default', 'price_monthly')
    ->withPromotionCode('promo_code_id')
    ->create($paymentMethod);
```

프로모션 코드 ID는 고객에게 노출되는 코드가 아니라 Stripe에서 프로모션 코드에 할당된 API ID여야 합니다. 만약 고객이 입력한 프로모션 코드에 해당되는 프로모션 코드 ID를 찾아야 한다면, `findPromotionCode` 메서드를 이용할 수 있습니다.

```php
// 고객이 입력한 코드로 프로모션 코드 ID 조회...
$promotionCode = $user->findPromotionCode('SUMMERSALE');

// 활성화된 프로모션 코드 ID만 조회...
$promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

위 예시에서 반환된 `$promotionCode` 객체는 `Laravel\Cashier\PromotionCode` 인스턴스입니다. 이 클래스는 내부적으로 `Stripe\PromotionCode` 객체를 감쌉니다. 프로모션 코드에 연결된 쿠폰 정보를 얻고 싶다면 `coupon` 메서드를 사용하면 됩니다.

```php
$coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

쿠폰 인스턴스를 이용하면 할인 금액, 할인 방식(정액 할인/퍼센트 할인)을 쉽게 확인할 수 있습니다.

```php
if ($coupon->isPercentage()) {
    return $coupon->percentOff().'%'; // 21.5%
} else {
    return $coupon->amountOff(); // $5.99
}
```

고객 또는 구독에 현재 적용되어 있는 할인 내역도 조회할 수 있습니다.

```php
$discount = $billable->discount();

$discount = $subscription->discount();
```

반환되는 `Laravel\Cashier\Discount` 인스턴스는 내부적으로 `Stripe\Discount` 객체를 감쌉니다. 이 할인 대상에 연결된 쿠폰을 조회하려면 역시 `coupon` 메서드를 사용합니다.

```php
$coupon = $subscription->discount()->coupon();
```

새 쿠폰 또는 프로모션 코드를 고객이나 구독에 적용하고 싶다면, `applyCoupon` 혹은 `applyPromotionCode` 메서드를 사용합니다.

```php
$billable->applyCoupon('coupon_id');
$billable->applyPromotionCode('promotion_code_id');

$subscription->applyCoupon('coupon_id');
$subscription->applyPromotionCode('promotion_code_id');
```

Stripe에서 프로모션 코드에 할당된 API ID를 사용해야 하며, 고객에게 노출되는 코드를 사용하면 안 됩니다. 한 시점에 고객 또는 구독에는 단 하나의 쿠폰이나 프로모션 코드만 적용할 수 있습니다.

이 주제에 관한 추가 정보는 Stripe의 [쿠폰](https://stripe.com/docs/billing/subscriptions/coupons) 및 [프로모션 코드](https://stripe.com/docs/billing/subscriptions/coupons/codes) 공식 문서를 참고하세요.

<a name="adding-subscriptions"></a>
#### 구독 추가

이미 기본 결제 수단을 등록한 고객에게 구독을 추가하려면 구독 빌더의 `add` 메서드를 호출하세요.

```php
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a name="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Stripe 대시보드에서 구독 생성

Stripe 대시보드 자체에서 직접 구독을 생성할 수도 있습니다. 이 경우 Cashier는 새로 추가된 구독을 동기화하며 타입을 `default`로 지정합니다. 대시보드에서 생성된 구독의 타입을 변경하고 싶다면, [Webhook 이벤트 핸들러를 정의해야](#defining-webhook-event-handlers) 합니다.

또한 Stripe 대시보드에서는 한 가지 타입의 구독만 추가할 수 있습니다. 애플리케이션에서 여러 종류의 구독 유형을 제공하는 경우, 대시보드를 통해서는 오직 한 가지 타입만 추가할 수 있습니다.

마지막으로, 애플리케이션이 제공하는 각 구독 타입별로 오직 하나의 활성 구독만 추가해야 한다는 점에 유의하세요. 만약 고객에게 두 개의 `default` 구독이 존재한다면, 두 구독 모두 애플리케이션 DB에 동기화되긴 하지만 Cashier는 가장 최근에 추가된 구독만 사용합니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인

고객이 애플리케이션에 구독한 이후에는 다양한 메서드를 이용해 구독 상태를 쉽게 확인할 수 있습니다. 우선, `subscribed` 메서드는 고객이 활성 구독을 가지고 있다면(체험 기간인지 여부와 상관없이) `true`를 반환합니다. 이 메서드는 첫 번째 인수로 구독 타입을 받습니다.

```php
if ($user->subscribed('default')) {
    // ...
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/middleware)로도 활용 가능하여, 사용자의 구독 상태에 따라 라우트나 컨트롤러 접근 권한을 제어할 수 있습니다.

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
            // 이 사용자는 유료 회원이 아닙니다...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

사용자가 아직 체험 기간인지 확인하고 싶다면, `onTrial` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 체험 기간 중일 때 경고 메시지를 보여줄지 결정하는 데 유용합니다.

```php
if ($user->subscription('default')->onTrial()) {
    // ...
}
```

`subscribedToProduct` 메서드는 Stripe 상품의 식별자를 기반으로 사용자가 해당 상품에 구독되어 있는지 확인할 수 있습니다. Stripe에서 '상품'은 가격 상품들의 모음입니다. 아래 예시에서는 사용자의 `default` 구독이 애플리케이션의 "premium" 상품을 구독 중인지 확인합니다. 인수로 넘기는 Stripe 상품 식별자는 Stripe 대시보드의 상품 식별자와 일치해야 합니다.

```php
if ($user->subscribedToProduct('prod_premium', 'default')) {
    // ...
}
```

`subscribedToProduct` 메서드에 배열을 전달하면, 사용자의 `default` 구독이 "basic" 또는 "premium" 상품을 구독 중인지 한 번에 확인할 수 있습니다.

```php
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    // ...
}
```

`subscribedToPrice` 메서드는 고객의 구독이 특정 가격 ID에 해당하는지 여부를 확인할 때 사용합니다.

```php
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    // ...
}
```

`recurring` 메서드를 사용하면, 사용자가 현재 구독 중이고 더 이상 체험 기간이 아님을 확인할 수 있습니다.

```php
if ($user->subscription('default')->recurring()) {
    // ...
}
```

> [!WARNING]
> 같은 타입의 구독이 두 개 이상 존재할 경우, `subscription` 메서드는 항상 가장 최근의 구독을 반환합니다. 예를 들어 사용자가 `default` 타입 구독을 두 개 가지고 있다면, 하나는 이전에 만료된 구독일 수 있고, 다른 하나는 현재 활성 구독일 수 있습니다. 가장 최신 구독만 반환되며, 이전 구독들은 기록 용도로 데이터베이스에 남아 있게 됩니다.

<a name="cancelled-subscription-status"></a>

#### 구독 취소 상태

사용자가 한때 활성 구독자였으나 구독을 취소했는지 확인하려면 `canceled` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription('default')->canceled()) {
    // ...
}
```

또한 사용자가 구독을 취소했지만 구독이 완전히 만료되기 전까지 "유예 기간(grace period)"에 있는지도 확인할 수 있습니다. 예를 들어, 사용자가 3월 5일에 구독을 취소했지만 원래 구독 만료일이 3월 10일이었다면, 사용자는 3월 10일까지 유예 기간에 있게 됩니다. 이 기간 동안 `subscribed` 메서드는 여전히 `true`를 반환한다는 점에 유의해야 합니다.

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

사용자의 구독이 취소되었고 더 이상 "유예 기간"에도 해당하지 않는지 확인하려면 `ended` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription('default')->ended()) {
    // ...
}
```

<a name="incomplete-and-past-due-status"></a>
#### 미완료 및 연체 상태

구독 생성 후 추가 결제 작업이 필요한 경우, 해당 구독은 `incomplete` 상태로 표시됩니다. 구독의 상태는 Cashier의 `subscriptions` 데이터베이스 테이블 내 `stripe_status` 컬럼에 저장됩니다.

마찬가지로, 가격을 변경(swap)할 때 추가 결제 작업이 필요한 경우에는 구독이 `past_due` 상태로 표시됩니다. 이 두 상태 중 어느 하나라도 결제가 완료되어 고객이 결제를 확인하기 전까지는 구독이 활성화되지 않습니다. 구독에 미완료 결제가 있는지 여부는 결제 모델 또는 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용해 확인할 수 있습니다.

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

구독에 미완료 결제가 있는 경우, 사용자를 Cashier의 결제 확인 페이지로 안내해야 합니다. 이때 `latestPayment` 식별자를 전달해야 하며, 구독 인스턴스의 `latestPayment` 메서드를 통해 해당 식별자를 가져올 수 있습니다.

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    결제를 확인해 주세요.
</a>
```

구독이 `past_due` 또는 `incomplete` 상태에서도 활성 상태로 간주하고 싶을 때는 Cashier에서 제공하는 `keepPastDueSubscriptionsActive` 및 `keepIncompleteSubscriptionsActive` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드들은 `App\Providers\AppServiceProvider`의 `register` 메서드 내에서 호출해야 합니다.

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
> 구독이 `incomplete` 상태일 때는 결제 확인이 이루어지기 전까지 계약을 변경할 수 없습니다. 따라서 구독이 `incomplete` 상태일 땐 `swap` 및 `updateQuantity` 메서드는 예외를 발생시킵니다.

<a name="subscription-scopes"></a>
#### 구독 스코프(Scopes)

대부분의 구독 상태는 쿼리 스코프(Query Scopes)로도 제공되기 때문에, 데이터베이스에서 원하는 상태의 구독을 쉽게 조회할 수 있습니다.

```php
// 모든 활성 구독 가져오기...
$subscriptions = Subscription::query()->active()->get();

// 한 사용자의 모든 취소된 구독 가져오기...
$subscriptions = $user->subscriptions()->canceled()->get();
```

아래와 같이 사용 가능한 모든 스코프 목록이 제공됩니다.

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
### 구독 요금제(Price) 변경

고객이 애플리케이션에 구독한 후, 새로운 구독 금액(요금제)으로 변경을 원하는 경우가 있습니다. 고객의 구독 요금제를 변경하려면 `swap` 메서드에 Stripe의 가격 식별자를 전달하면 됩니다. 가격 변경 시, 이전에 취소된 구독이라도 다시 활성화하는 것으로 간주됩니다. 여기서 전달하는 가격 식별자는 Stripe 대시보드에서 사용할 수 있는 실제 Stripe 가격 식별자여야 합니다.

```php
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

고객이 체험 기간(Trial)에 있는 경우, 체험 기간이 그대로 유지됩니다. 또한 구독에 "수량(quantity)"이 존재한다면 그 수량 역시 유지됩니다.

가격을 변경하면서 고객의 체험 기간을 종료하고 싶다면 `skipTrial` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')
    ->skipTrial()
    ->swap('price_yearly');
```

가격을 변경한 후 다음 청구 주기를 기다리지 않고 즉시 고객에게 인보이스를 발행하고 싶다면, `swapAndInvoice` 메서드를 사용할 수 있습니다.

```php
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a name="prorations"></a>
#### 일할 계산(Prorations, 부분 정산)

기본적으로 Stripe는 가격을 교체할 때 청구 금액을 일할 계산(부분 정산)합니다. 이를 원하지 않고 구독 금액을 업데이트할 때 금액을 일할 계산 없이 적용하려면 `noProrate` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')->noProrate()->swap('price_yearly');
```

구독의 일할 정산에 대한 자세한 내용은 [Stripe 공식 문서](https://stripe.com/docs/billing/subscriptions/prorations)를 참고하세요.

> [!WARNING]
> `swapAndInvoice` 메서드 앞에서 `noProrate`를 실행해도 일할 계산에는 아무런 영향이 없습니다. 항상 인보이스가 발행됩니다.

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

특정 서비스에서는 구독이 "수량"에 영향을 받을 수 있습니다. 예를 들어, 프로젝트 관리 애플리케이션에서 프로젝트 한 개당 월 10달러씩 청구하고 싶을 때 사용할 수 있습니다. `incrementQuantity` 및 `decrementQuantity` 메서드를 통해 구독의 수량을 쉽게 증가 또는 감소시킬 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// 현재 수량에서 다섯 개를 추가...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// 현재 수량에서 다섯 개를 차감...
$user->subscription('default')->decrementQuantity(5);
```

또는, `updateQuantity` 메서드를 사용해 특정 수량으로 직접 설정할 수도 있습니다.

```php
$user->subscription('default')->updateQuantity(10);
```

`noProrate` 메서드를 함께 사용하면, 수량 변경 시 일할 계산 없이 바로 적용합니다.

```php
$user->subscription('default')->noProrate()->updateQuantity(10);
```

구독의 수량(quantity)에 대한 더 자세한 사항은 [Stripe 공식 문서](https://stripe.com/docs/subscriptions/quantities)를 참고하세요.

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 여러 상품이 포함된 구독에서의 수량

구독이 [여러 상품이 포함된 구독](#subscriptions-with-multiple-products)인 경우, 수량을 조정하려는 가격의 ID를 두 번째 인자로 넘겨서 `incrementQuantity`, `decrementQuantity` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 여러 상품이 포함된 구독

[여러 상품이 포함된 구독](https://stripe.com/docs/billing/subscriptions/multiple-products)을 사용하면, 하나의 구독에 여러 개의 청구 상품을 할당할 수 있습니다. 예를 들어, 고객 지원 헬프데스크 애플리케이션에서 기본 구독료로 월 10달러, 라이브 채팅 추가 상품으로 월 15달러를 받을 수 있습니다. 여러 상품이 포함된 구독 정보는 Cashier의 `subscription_items` 데이터베이스 테이블에 저장됩니다.

`newSubscription` 메서드의 두 번째 인자로 가격이 담긴 배열을 전달하면 해당 구독에 여러 상품(가격)을 지정할 수 있습니다.

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

위 예시에서, 고객은 `default` 구독에 두 가지 가격이 모두 연결됩니다. 각 가격은 자신에게 맞는 청구 주기에 따라 각각 청구됩니다. 필요하다면 `quantity` 메서드를 사용해 특정 가격에 대해 별도의 수량을 지정할 수도 있습니다.

```php
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

기존 구독에 가격을 추가하고 싶다면 구독의 `addPrice` 메서드를 호출할 수 있습니다.

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

위 예시처럼 하면 새 가격이 추가되고, 다음 청구 주기에 비용이 청구됩니다. 즉시 청구를 원한다면 `addPriceAndInvoice` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

특정 수량으로 가격을 추가하고 싶다면, `addPrice` 또는 `addPriceAndInvoice` 메서드의 두 번째 인자로 수량을 넘겨주면 됩니다.

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

구독에서 가격을 제거할 때는 `removePrice` 메서드를 사용하면 됩니다.

```php
$user->subscription('default')->removePrice('price_chat');
```

> [!WARNING]
> 구독에서 마지막 가격은 제거할 수 없습니다. 마지막 상품을 제거해야 할 경우, 구독 자체를 취소해야 합니다.

<a name="swapping-prices"></a>
#### 가격 변경(Swapping Prices)

여러 상품이 묶인 구독에서도 적용된 가격들을 변경할 수 있습니다. 예를 들어, 고객이 `price_basic` 가격과 `price_chat` 추가 상품이 묶인 구독 상태에서, `price_basic`을 `price_pro`로 업그레이드하고 싶다면 다음과 같이 사용할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

위 예시를 실행하면, 기존에 `price_basic`으로 연결된 구독 항목은 삭제되고, `price_chat`은 남으며 새로 `price_pro` 구독 항목이 생성됩니다.

또한, 가격별 옵션이 필요한 경우에는 `swap` 메서드에 키-값 쌍의 배열을 전달할 수 있습니다. 예를 들어, 가격별 수량을 지정하고 싶다면 다음과 같이 사용할 수 있습니다.

```php
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

하나의 가격만 변경(swap)하고 싶다면, 구독 아이템에서 직접 `swap` 메서드를 호출할 수 있습니다. 이 방법은 구독의 다른 가격에 대한 모든 메타데이터를 유지하고자 할 때 유용합니다.

```php
$user = User::find(1);

$user->subscription('default')
    ->findItemOrFail('price_basic')
    ->swap('price_pro');
```

<a name="proration"></a>
#### 부분 정산(Proration)

여러 상품이 포함된 구독에 가격을 추가하거나 제거하면 Stripe는 기본적으로 부분 정산 처리를 적용합니다. 일할 정산 없이 가격을 조정하고 싶다면, 해당 동작 전에 `noProrate` 메서드를 체이닝하여 사용할 수 있습니다.

```php
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a name="swapping-quantities"></a>
#### 개별 가격 수량 조정

여러 가격이 할당된 구독에서 가격별 수량을 변경하고 싶으면, [앞서 소개한 수량 관련 메서드](#subscription-quantity)에 가격 ID를 추가 인자로 넘겨주면 됩니다.

```php
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> [!WARNING]
> 여러 가격이 포함된 구독의 경우, `Subscription` 모델의 `stripe_price`와 `quantity` 속성은 `null`이 됩니다. 개별 가격 속성에 접근하려면 `Subscription` 모델의 `items` 관계를 이용해야 합니다.

<a name="subscription-items"></a>
#### 구독 항목(Subscription Items)

구독에 여러 가격이 포함된 경우, 데이터베이스의 `subscription_items` 테이블에 여러 개의 구독 항목이 저장됩니다. 이 항목들은 구독의 `items` 관계를 통해 불러올 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// 특정 항목의 Stripe 가격과 수량 조회
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

또한, `findItemOrFail` 메서드로 특정 가격의 구독 항목만 조회할 수도 있습니다.

```php
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a name="multiple-subscriptions"></a>
### 다중 구독(Multiple Subscriptions)

Stripe는 고객이 동시에 여러 개의 구독을 가질 수 있도록 지원합니다. 예를 들어, 수영 구독과 헬스 구독이 각각 가격이 다르고, 고객은 둘 중 하나 또는 둘 다를 선택할 수 있습니다.

애플리케이션에서 구독을 생성할 때, `newSubscription` 메서드에 구독의 타입을 전달할 수 있습니다. 이 타입은 사용자가 생성하고자 하는 구독 유형을 나타내는 아무 문자열이나 가능합니다.

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()->newSubscription('swimming')
        ->price('price_swimming_monthly')
        ->create($request->paymentMethodId);

    // ...
});
```

이 예시에서는 고객에게 월간 수영 구독을 생성했습니다. 이후 연간 구독으로 변경하고 싶다면 해당 구독의 가격만 변경(swap)하면 됩니다.

```php
$user->subscription('swimming')->swap('price_swimming_yearly');
```

구독을 완전히 취소하려면 다음과 같이 하면 됩니다.

```php
$user->subscription('swimming')->cancel();
```

<a name="usage-based-billing"></a>
### 사용량 기반 청구(Usage Based Billing)

[사용량 기반 청구](https://stripe.com/docs/billing/subscriptions/metered-billing)를 활용하면, 고객의 청구 주기 동안 상품 사용량에 따라 비용을 부과할 수 있습니다. 예를 들어, 한 달에 발송한 문자 또는 이메일 개수만큼 고객에게 청구할 수 있습니다.

사용량 기반 청구를 시작하려면, 먼저 Stripe 대시보드에서 [사용량 기반 모델](https://docs.stripe.com/billing/subscriptions/usage-based/implementation-guide)과 [meter](https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage#configure-meter)를 활용해 새 상품을 생성해야 합니다. meter 설정이 끝나면, 관련 이벤트명과 meter ID를 저장해두어 사용량 보고·조회 시 사용합니다. 그리고 `meteredPrice` 메서드를 통해 측정 대상 가격 ID를 구독에 추가합니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

[Stripe Checkout](#checkout)을 통해서도 사용량 기반 구독을 시작할 수 있습니다.

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
#### 사용량 보고하기(Reporting Usage)

고객이 애플리케이션을 이용하는 동안 실제 사용량을 Stripe에 보고해야 정확한 청구가 이뤄집니다. 이벤트 단위 사용량을 보고하려면 `Billable` 모델에서 `reportMeterEvent` 메서드를 사용할 수 있습니다.

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent');
```

기본적으로 "사용량 수치" 1이 결제 기간에 추가됩니다. 또는, 원하는 사용량만큼 직접 지정하려면 아래와 같이 할 수 있습니다.

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent', quantity: 15);
```

특정 meter의 이벤트 요약을 조회하려면, `Billable` 인스턴스의 `meterEventSummaries` 메서드를 사용할 수 있습니다.

```php
$user = User::find(1);

$meterUsage = $user->meterEventSummaries($meterId);

$meterUsage->first()->aggregated_value // 10
```

meter 이벤트 요약에 대한 더 자세한 내용은 Stripe의 [Meter Event Summary 객체 공식 문서](https://docs.stripe.com/api/billing/meter-event_summary/object)를 참고하세요.

[모든 meter 목록을 조회](https://docs.stripe.com/api/billing/meter/list)하려면, `Billable` 인스턴스의 `meters` 메서드를 사용하면 됩니다.

```php
$user = User::find(1);

$user->meters();
```

<a name="subscription-taxes"></a>
### 구독 세금

> [!WARNING]
> 세율을 직접 계산하는 대신, Stripe Tax를 사용하여 [자동으로 세금을 계산할 수 있습니다](#tax-configuration).

사용자가 구독 시 내야 할 세율을 지정하려면, 청구 모델에 `taxRates` 메서드를 구현하고 Stripe 세금 요율 ID가 담긴 배열을 반환해야 합니다. 이 세율은 [Stripe 대시보드](https://dashboard.stripe.com/test/tax-rates)에서 정의할 수 있습니다.

```php
/**
 * 고객 구독에 적용할 세율.
 *
 * @return array<int, string>
 */
public function taxRates(): array
{
    return ['txr_id'];
}
```

`taxRates` 메서드를 사용하면, 고객마다 다르게 세율을 적용할 수 있으므로 여러 국가/세율이 혼재된 사용자 기반에 유용합니다.

여러 상품이 묶인 구독을 제공하는 경우, 청구 모델에 `priceTaxRates` 메서드를 구현해 각 가격별로 다른 세율을 지정할 수 있습니다.

```php
/**
 * 고객 구독에 적용할 세율.
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
> `taxRates` 메서드는 구독 청구에만 적용됩니다. Cashier에서 "일회성" 청구를 진행한다면, 세율을 직접 지정해 주어야 합니다.

<a name="syncing-tax-rates"></a>
#### 세율 동기화

`taxRates` 메서드를 통해 하드코딩된 세금 ID를 변경하더라도, 기존 가입 중인 구독의 세팅은 그대로 유지됩니다. 기존 구독의 세금 값을 새 `taxRates` 값으로 업데이트하려면, 사용자의 구독 인스턴스에서 `syncTaxRates` 메서드를 호출해야 합니다.

```php
$user->subscription('default')->syncTaxRates();
```

이 방법은 여러 상품이 포함된 구독의 각 항목의 세율까지 동기화해 줍니다. 애플리케이션이 여러 상품이 묶인 구독을 제공한다면, 반드시 모델에 위에서 언급한 `priceTaxRates` 메서드도 함께 구현해야 합니다.

<a name="tax-exemption"></a>
#### 세금 면제(Tax Exemption)

Cashier에서는 고객이 세금 면제 대상인지 확인할 수 있는 `isNotTaxExempt`, `isTaxExempt`, `reverseChargeApplies` 메서드를 제공합니다. 이 메서드는 Stripe API를 호출해 고객의 세금 면제 상태를 판단합니다.

```php
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> [!WARNING]
> 이 메서드들은 `Laravel\Cashier\Invoice` 객체에도 사용할 수 있습니다. 다만, `Invoice` 객체에서 호출될 때는 인보이스가 생성된 시점의 면제 상태를 반환합니다.

<a name="subscription-anchor-date"></a>
### 구독 기준일(Anchor Date)

기본적으로 청구 주기의 앵커(anchor) 날짜는 구독 생성일이거나, 체험 기간이 존재할 경우 체험 생성일이 됩니다. 이 기준일을 변경하려면, `anchorBillingCycleOn` 메서드를 사용할 수 있습니다.

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

구독 청구 주기 관리에 관한 자세한 내용은 [Stripe의 청구 주기 공식 문서](https://stripe.com/docs/billing/subscriptions/billing-cycle)를 참고하세요.

<a name="cancelling-subscriptions"></a>
### 구독 취소

구독을 취소하려면, 사용자의 구독에서 `cancel` 메서드를 호출하면 됩니다.

```php
$user->subscription('default')->cancel();
```

구독이 취소되면, Cashier는 자동으로 `subscriptions` 데이터베이스 테이블의 `ends_at` 컬럼을 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 하는지 판단하는 데 사용됩니다.

예를 들어, 고객이 3월 1일에 구독을 취소했는데 실제 구독 만료일이 3월 5일이라면, `subscribed` 메서드는 3월 5일까지는 `true`를 계속 반환합니다. 대부분의 애플리케이션에서는 고객이 남은 청구 기간까지 서비스를 사용할 수 있도록 하기 위해 이와 같이 동작합니다.

사용자가 구독을 취소했지만 여전히 "유예 기간(grace period)"에 있는지 확인하려면 `onGracePeriod` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

구독을 즉시 취소하고 싶다면, 사용자의 구독에 대해 `cancelNow` 메서드를 사용하면 됩니다.

```php
$user->subscription('default')->cancelNow();
```

구독을 즉시 취소하면서, 아직 청구되지 않은 사용량 기반 혹은 신규/대기 중인 부분 정산 인보이스 항목까지 모두 인보이스에 반영하려면, `cancelNowAndInvoice` 메서드를 사용하면 됩니다.

```php
$user->subscription('default')->cancelNowAndInvoice();
```

특정 시점에 구독 취소를 예약하고자 할 땐, 아래처럼 할 수 있습니다.

```php
$user->subscription('default')->cancelAt(
    now()->addDays(10)
);
```

마지막으로, 사용자 모델을 삭제하기 전에는 항상 사용자 구독을 먼저 취소해야 합니다.

```php
$user->subscription('default')->cancelNow();

$user->delete();
```

<a name="resuming-subscriptions"></a>

### 구독 재개

고객이 구독을 해지한 후, 해당 구독을 다시 활성화하고자 한다면 구독 인스턴스에서 `resume` 메서드를 호출하면 됩니다. 단, 고객은 반드시 아직 "유예 기간" 내에 있어야만 구독을 재개할 수 있습니다.

```php
$user->subscription('default')->resume();
```

고객이 구독을 해지한 후, 구독이 완전히 만료되기 전에 이를 재개하면 즉시 결제가 발생하지 않습니다. 구독이 다시 활성화되며, 원래의 결제 주기에 따라 다음 청구가 진행됩니다.

<a name="subscription-trials"></a>
## 구독 체험 기간

<a name="with-payment-method-up-front"></a>
### 결제 수단 정보를 미리 수집하는 체험 가입

결제 수단 정보를 미리 수집하면서 고객에게 체험 기간을 제공하고 싶다면, 구독을 생성할 때 `trialDays` 메서드를 사용하면 됩니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
        ->trialDays(10)
        ->create($request->paymentMethodId);

    // ...
});
```

이 메서드는 데이터베이스 내 구독 레코드에 체험 종료 날짜를 설정하고, Stripe에게 해당 날짜 이후부터 결제를 시작하도록 지시합니다. `trialDays` 메서드를 사용할 경우, Cashier는 Stripe에서 가격에 기본으로 설정된 체험 기간을 덮어씁니다.

> [!WARNING]
> 고객의 구독이 체험 종료 전에 해지되지 않으면, 체험 기간이 끝나는 즉시 요금이 부과됩니다. 따라서 체험 종료일을 사용자에게 반드시 알려주는 것이 좋습니다.

`trialUntil` 메서드를 사용하면 체험 기간의 종료일을 특정 `DateTime` 인스턴스로 지정할 수 있습니다.

```php
use Carbon\Carbon;

$user->newSubscription('default', 'price_monthly')
    ->trialUntil(Carbon::now()->addDays(10))
    ->create($paymentMethod);
```

사용자가 체험 기간 내에 있는지 확인하려면 사용자 인스턴스의 `onTrial` 메서드나 구독 인스턴스의 `onTrial` 메서드를 사용할 수 있습니다. 아래 두 예시는 동일한 결과를 반환합니다.

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->subscription('default')->onTrial()) {
    // ...
}
```

구독 체험을 즉시 종료시키고 싶다면 `endTrial` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')->endTrial();
```

기존 체험 기간이 만료되었는지 확인하려면 `hasExpiredTrial` 메서드를 사용할 수 있습니다.

```php
if ($user->hasExpiredTrial('default')) {
    // ...
}

if ($user->subscription('default')->hasExpiredTrial()) {
    // ...
}
```

<a name="defining-trial-days-in-stripe-cashier"></a>
#### Stripe 및 Cashier에서 체험 기간 일수 설정하기

Stripe 대시보드에서 가격의 기본 체험 일수를 정의할 수도 있고, Cashier에서 항상 명시적으로 전달할 수도 있습니다. Stripe에서 기본 체험 일수를 정의했다면, 과거에 구독했던 고객의 신규 구독을 포함해, 새로운 구독에는 항상 체험 기간이 적용됩니다. 단, `skipTrial()` 메서드를 명시적으로 호출하면 체험 기간 없이 바로 적용할 수 있습니다.

<a name="without-payment-method-up-front"></a>
### 결제 수단 정보를 미리 받지 않는 체험 가입

결제 수단 정보를 미리 수집하지 않고 체험 기간을 제공하고 싶다면, 사용자 레코드의 `trial_ends_at` 컬럼에 원하는 체험 종료 날짜를 지정하면 됩니다. 보통 회원가입 시에 이 작업을 수행합니다.

```php
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->addDays(10),
]);
```

> [!WARNING]
> 빌링 가능한 모델 클래스 정의에 [date cast](/docs/eloquent-mutators#date-casting)를 추가하여, `trial_ends_at` 속성이 날짜형으로 다뤄지도록 처리해야 합니다.

Cashier에서는 이런 형태의 체험을 "일반(Generic) 체험"이라고 합니다. 이는 아직 구독에 연결되지 않은 체험 기간을 의미합니다. 모델 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at`보다 이전이면 `true`를 반환합니다.

```php
if ($user->onTrial()) {
    // 사용자가 체험 기간 내에 있습니다...
}
```

실제 구독을 생성할 준비가 되면, 평소와 같이 `newSubscription` 메서드를 사용하면 됩니다.

```php
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

사용자의 체험 종료 날짜를 조회하려면 `trialEndsAt` 메서드를 사용하면 됩니다. 사용자가 체험 중이면 Carbon 날짜 인스턴스를 반환하고, 아니라면 `null`을 반환합니다. 기본 구독이 아닌 특정 구독의 체험 종료일을 알고 싶을 때는 해당 구독의 타입을 파라미터로 넘길 수 있습니다.

```php
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

특히 "일반(Generic) 체험 기간"에만 해당하는지를 알고 싶을 때는 `onGenericTrial` 메서드를 사용할 수 있습니다.

```php
if ($user->onGenericTrial()) {
    // 사용자가 "일반(Generic) 체험" 기간 내에 있습니다...
}
```

<a name="extending-trials"></a>
### 체험 기간 연장

`extendTrial` 메서드를 사용하면, 구독 생성 후에도 체험 기간을 연장할 수 있습니다. 만약 체험 기간이 이미 끝나고 구독에 대한 결제가 이루어지고 있더라도, 추가 체험을 제공할 수 있습니다. 연장된 체험 기간만큼은 다음 청구서에서 차감됩니다.

```php
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// 체험을 지금부터 7일 뒤에 종료...
$subscription->extendTrial(
    now()->addDays(7)
);

// 체험에 5일 추가...
$subscription->extendTrial(
    $subscription->trial_ends_at->addDays(5)
);
```

<a name="handling-stripe-webhooks"></a>
## Stripe Webhook 처리

> [!NOTE]
> [Stripe CLI](https://stripe.com/docs/stripe-cli)를 사용하면 로컬 개발 환경에서 Webhook 테스트를 도울 수 있습니다.

Stripe는 다양한 이벤트 발생 시 Webhook을 통해 애플리케이션에 알릴 수 있습니다. 기본적으로, Cashier 서비스 프로바이더가 Cashier의 Webhook 컨트롤러로 연결된 라우트를 자동으로 등록합니다. 이 컨트롤러가 모든 Webhook 요청을 처리합니다.

Cashier Webhook 컨트롤러는 기본적으로, 결제가 여러 번 실패한 구독 해지, 고객 정보/삭제, 구독 정보 갱신, 결제 수단 변경 등 Stripe의 주요 이벤트를 자동으로 처리합니다. 그리고 필요하다면, 이 컨트롤러를 확장하여 원하는 Stripe Webhook 이벤트를 추가로 처리할 수도 있습니다.

애플리케이션이 Stripe Webhook 이벤트를 안전하게 처리하려면, Stripe 컨트롤 패널에서 Webhook URL을 반드시 등록해야 합니다. 기본적으로, Cashier의 Webhook 컨트롤러는 `/stripe/webhook` URL 경로로 응답합니다. Stripe 컨트롤 패널에서 반드시 활성화해야 하는 Webhook 이벤트는 다음과 같습니다.

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

편의를 위해 Cashier에서는 `cashier:webhook` 아티즌 명령어를 제공합니다. 이 명령어는 Cashier가 필요로 하는 Stripe 이벤트 전체를 수신하는 Webhook을 Stripe에 등록해줍니다.

```shell
php artisan cashier:webhook
```

기본적으로 생성된 Webhook은 `APP_URL` 환경 변수 값과 Cashier에 포함된 `cashier.webhook` 라우트를 기준으로 지정됩니다. 명령 실행 시 `--url` 옵션을 사용하면 다른 URL을 지정할 수도 있습니다.

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

생성된 Webhook은 Cashier 버전에 호환되는 Stripe API 버전을 사용하며, 다른 Stripe 버전을 사용하려면 `--api-version` 옵션을 추가해주면 됩니다.

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

Webhook은 생성과 함께 즉시 활성화됩니다. 만약 Webhook을 미리 만들어두되, 준비가 완료될 때까지 비활성화하고 싶다면 `--disabled` 옵션을 사용할 수 있습니다.

```shell
php artisan cashier:webhook --disabled
```

> [!WARNING]
> Cashier에 포함된 [Webhook 서명 검증](#verifying-webhook-signatures) 미들웨어로, Stripe에서 유입되는 Webhook 요청을 반드시 보호해야 합니다.

<a name="webhooks-csrf-protection"></a>
#### Webhook과 CSRF 보호

Stripe Webhook 요청이 라라벨의 [CSRF 보호](/docs/csrf)를 우회할 수 있도록, Stripe Webhook 경로에 대해서는 CSRF 토큰 검증을 하지 않도록 설정해야 합니다. 이를 위해 애플리케이션의 `bootstrap/app.php` 파일에서 `stripe/*`를 CSRF 보호 예외로 추가해 주어야 합니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'stripe/*',
    ]);
})
```

<a name="defining-webhook-event-handlers"></a>
### Webhook 이벤트 핸들러 정의

Cashier는 결제 실패로 인한 구독 해지와 같은 기본 Stripe Webhook 이벤트를 자동으로 처리합니다. 그러나 추가로 원하는 Webhook 이벤트가 있다면, Cashier가 발행하는 다음 이벤트를 리스너로 등록해 처리할 수 있습니다.

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

두 이벤트 모두 Stripe Webhook의 전체 페이로드를 포함하고 있습니다. 예를 들어, `invoice.payment_succeeded` Webhook을 처리하려면 아래와 같이 [리스너](/docs/events#defining-listeners) 를 등록하여 사용할 수 있습니다.

```php
<?php

namespace App\Listeners;

use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    /**
     * Stripe Webhook 수신 처리
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            // 이벤트 처리 로직...
        }
    }
}
```

<a name="verifying-webhook-signatures"></a>
### Webhook 서명 검증

안전한 Webhook 처리를 위해 [Stripe의 Webhook 서명](https://stripe.com/docs/webhooks/signatures) 기능을 사용할 수 있습니다. Cashier는 Stripe Webhook 요청이 유효한지 자동으로 검증하는 미들웨어를 포함하고 있습니다.

Webhook 서명 검증을 활성화하려면, 애플리케이션의 `.env` 파일에 `STRIPE_WEBHOOK_SECRET` 환경 변수를 설정해야 합니다. 이 Webhook `secret` 값은 Stripe 계정의 대시보드에서 확인할 수 있습니다.

<a name="single-charges"></a>
## 단일 결제

<a name="simple-charge"></a>
### 단순 결제

고객에게 한 번만 단일로 결제를 수행하려면, 빌링 가능한 모델 인스턴스에서 `charge` 메서드를 사용할 수 있습니다. 이때, [결제 수단 식별자](#payment-methods-for-single-charges)를 두 번째 인자로 전달해야 합니다.

```php
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $stripeCharge = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

`charge` 메서드의 세 번째 인자에는 배열로 Stripe 결제(Charge) 생성 시 전달할 옵션들을 지정할 수 있습니다. 사용 가능한 옵션에 대해 더 자세히 알고 싶다면 [Stripe 공식 문서](https://stripe.com/docs/api/charges/create)를 참고하세요.

```php
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

고객 또는 사용자 정보 없이도 `charge` 메서드를 사용할 수 있습니다. 이 경우, 애플리케이션의 빌링 가능한 모델을 새로 생성한 인스턴스에서 `charge`를 호출하면 됩니다.

```php
use App\Models\User;

$stripeCharge = (new User)->charge(100, $paymentMethod);
```

결제 실패 시 `charge` 메서드는 예외를 발생시킵니다. 결제가 성공하면, `Laravel\Cashier\Payment` 인스턴스가 반환됩니다.

```php
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    // ...
}
```

> [!WARNING]
> `charge` 메서드의 결제 금액은 애플리케이션에서 사용하는 통화의 최소 단위(예: 미국 달러라면 센트, 즉 100 = \$1)로 입력해야 합니다.

<a name="charge-with-invoice"></a>
### 인보이스(송장) 결제

한 번만 결제하면서, 고객에게 PDF 인보이스(송장)를 발급해 주고 싶을 때는 `invoicePrice` 메서드를 사용할 수 있습니다. 예를 들어, 고객이 새 티셔츠 5개를 주문해 청구하려는 경우 아래처럼 작성합니다.

```php
$user->invoicePrice('price_tshirt', 5);
```

인보이스는 즉시 사용자의 기본 결제 수단으로 결제됩니다. `invoicePrice`는 세 번째 인자로 인보이스 항목의 청구 설정을 담은 배열을, 네 번째 인자로는 인보이스 자체의 청구 설정을 담은 배열을 받을 수 있습니다.

```php
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

비슷하게, `invoicePrice`처럼 여러 개의 항목(최대 250개)을 한 번에 "탭(tab)"으로 추가한 뒤 청구하고 싶을 때는 `tabPrice` 메서드를 사용할 수 있습니다. 예를 들어, 티셔츠 5개와 머그컵 2개를 청구하려면 다음과 같이 작성합니다.

```php
$user->tabPrice('price_tshirt', 5);
$user->tabPrice('price_mug', 2);
$user->invoice();
```

또한, `invoiceFor` 메서드를 사용하면 고객의 기본 결제 수단에 대해 "단건(one-off)"으로 결제할 수 있습니다.

```php
$user->invoiceFor('One Time Fee', 500);
```

`invoiceFor` 메서드도 사용할 수 있지만, Stripe 대시보드에서 상품별로 더 나은 분석 및 데이터 관리를 위해서는 사전에 가격(Price)이 정의된 `invoicePrice`와 `tabPrice` 방식의 사용을 권장합니다.

> [!WARNING]
> `invoice`, `invoicePrice`, `invoiceFor` 메서드는 결제 실패 시 재시도를 진행하는 Stripe 인보이스를 생성합니다. 만약 결제 실패 시 즉시 인보이스를 닫고 재시도를 중단하려면 Stripe API를 이용해 해당 인보이스를 직접 닫아야 합니다.

<a name="creating-payment-intents"></a>
### 결제 의도(Payment Intents) 생성

빌링 가능한 모델 인스턴스에서 `pay` 메서드를 호출하면 새로운 Stripe 결제 의도(Payment Intent)를 생성할 수 있습니다. 이 메서드는 `Laravel\Cashier\Payment` 인스턴스로 감싸진 결제 의도를 반환합니다.

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->pay(
        $request->get('amount')
    );

    return $payment->client_secret;
});
```

결제 의도 생성 후, 반환된 클라이언트 시크릿(client secret)을 프론트엔드로 전달해 브라우저에서 결제가 완료되도록 할 수 있습니다. Stripe 결제 의도를 사용해 결제 전체 흐름을 구현하는 방법은 [Stripe 공식 문서](https://stripe.com/docs/payments/accept-a-payment?platform=web)에서 확인할 수 있습니다.

`pay` 메서드를 사용할 경우 Stripe 대시보드에서 활성화된 기본 결제 방식을 고객이 선택할 수 있습니다. 특정 결제 방식만 허용하고 싶다면 `payWith` 메서드를 사용할 수 있습니다.

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
> `pay`와 `payWith` 메서드의 결제 금액 역시 해당 통화의 최소 단위(예: 미국 달러라면 센트)로 전달해야 합니다.

<a name="refunding-charges"></a>
### 결제 환불

Stripe 결제를 환불하고 싶다면 `refund` 메서드를 사용할 수 있습니다. 첫 번째 인자로 Stripe [payment intent ID](#payment-methods-for-single-charges)를 전달하면 됩니다.

```php
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a name="invoices"></a>
## 인보이스(송장)

<a name="retrieving-invoices"></a>
### 인보이스 조회

빌링 가능한 모델의 모든 인보이스 목록을 쉽게 조회하고 싶다면 `invoices` 메서드를 이용할 수 있습니다. 이 메서드는 `Laravel\Cashier\Invoice` 인스턴스의 컬렉션을 반환합니다.

```php
$invoices = $user->invoices();
```

진행 중인(미결) 인보이스까지 포함하고 싶다면 `invoicesIncludingPending` 메서드를 사용할 수 있습니다.

```php
$invoices = $user->invoicesIncludingPending();
```

특정 인보이스를 ID로 조회하려면 `findInvoice` 메서드를 사용하면 됩니다.

```php
$invoice = $user->findInvoice($invoiceId);
```

<a name="displaying-invoice-information"></a>
#### 인보이스 정보 표시

고객에게 인보이스 목록을 보여주려고 할 때, 각 인보이스 인스턴스의 메서드를 사용해 주요 정보를 표시할 수 있습니다. 예를 들어, 표(table)로 모든 인보이스를 나열하고, 사용자가 직접 다운로드할 수 있도록 할 수 있습니다.

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
### 예정된 인보이스(Upcoming Invoices)

고객의 다음 예정 인보이스를 조회하려면 `upcomingInvoice` 메서드를 사용할 수 있습니다.

```php
$invoice = $user->upcomingInvoice();
```

고객이 여러 개의 구독을 가지고 있다면, 특정 구독의 예정 인보이스도 조회할 수 있습니다.

```php
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a name="previewing-subscription-invoices"></a>
### 구독 인보이스 미리보기

`previewInvoice` 메서드를 사용하면 가격을 변경하기 전에 인보이스를 미리 확인할 수 있습니다. 이를 통해 특정 가격 변경 시, 고객에게 발급될 인보이스가 어떤 모습일지 예측할 수 있습니다.

```php
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

배열로 여러 가격을 전달하여, 여러 새로운 가격에 대한 인보이스 미리보기도 할 수 있습니다.

```php
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a name="generating-invoice-pdfs"></a>
### 인보이스 PDF 생성하기

인보이스 PDF를 생성하려면, 기본 인보이스 렌더러인 Dompdf 라이브러리를 Composer로 설치해야 합니다.

```shell
composer require dompdf/dompdf
```

라우트나 컨트롤러에서 `downloadInvoice` 메서드를 이용하면 특정 인보이스에 대한 PDF 다운로드를 생성할 수 있습니다. 이 메서드는 인보이스 다운로드에 필요한 적절한 HTTP 응답을 자동으로 반환합니다.

```php
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId);
});
```

기본적으로 인보이스의 모든 데이터는 Stripe에 저장된 고객 및 인보이스 정보를 기반으로 하며, 파일명은 `app.name` 설정 값을 따릅니다. 그러나 두 번째 인자로 배열을 전달하여 회사, 상품 등 일부 정보를 커스터마이징할 수 있습니다.

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

또한, 세 번째 인자로 파일명을 지정할 수 있으며, 지정한 파일명 뒤에 `.pdf` 확장자가 자동으로 붙습니다.

```php
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a name="custom-invoice-render"></a>
#### 커스텀 인보이스 렌더러

Cashier는 기본적으로 `DompdfInvoiceRenderer`를 사용하여 [dompdf](https://github.com/dompdf/dompdf) PHP 라이브러리로 인보이스를 생성합니다. 하지만 원한다면, `Laravel\Cashier\Contracts\InvoiceRenderer` 인터페이스를 구현해 커스텀 렌더러를 사용할 수도 있습니다. 예를 들어, 외부 PDF 렌더링 서비스의 API를 통해 인보이스 PDF를 렌더링하고 싶다면 아래처럼 구현할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;
use Laravel\Cashier\Contracts\InvoiceRenderer;
use Laravel\Cashier\Invoice;

class ApiInvoiceRenderer implements InvoiceRenderer
{
    /**
     * 인보이스를 렌더링하여 원시 PDF 바이트를 반환
     */
    public function render(Invoice $invoice, array $data = [], array $options = []): string
    {
        $html = $invoice->view($data)->render();

        return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
    }
}
```

커스텀 인보이스 렌더러를 구현했다면, 애플리케이션의 `config/cashier.php` 설정 파일 내 `cashier.invoices.renderer` 값을 해당 렌더러 클래스명으로 변경해야 합니다.

<a name="checkout"></a>
## 체크아웃(Checkout)

Cashier Stripe는 [Stripe Checkout](https://stripe.com/payments/checkout)도 지원합니다. Stripe Checkout은 결제용 커스텀 페이지를 직접 구현하는 번거로움 없이, Stripe가 미리 제공하는 호스팅 결제 페이지를 활용할 수 있게 해줍니다.

Stripe Checkout과 Cashier를 함께 사용하는 방법은 아래 설명을 참고하시고, 추가적으로 [Stripe의 Checkout 공식 문서](https://stripe.com/docs/payments/checkout)도 살펴보시는 것을 권장합니다.

<a name="product-checkouts"></a>
### 상품 체크아웃

Stripe 대시보드에서 이미 생성해 둔 상품의 체크아웃을 진행하려면, 빌링 가능한 모델 인스턴스의 `checkout` 메서드를 사용합니다. 이 메서드는 새로운 Stripe Checkout 세션을 생성합니다. 기본적으로 Stripe Price ID를 전달해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout('price_tshirt');
});
```

필요하다면 상품 수량도 명시할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 15]);
});
```

고객이 이 라우트로 접근하면 Stripe의 Checkout 페이지로 자동으로 리다이렉트됩니다. 결제 성공 또는 취소 후 기본적으로 사용자는 `home` 라우트로 이동되지만, `success_url`, `cancel_url` 옵션을 사용해 리디렉션 URL을 직접 지정할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

`success_url`에 Stripe Checkout 세션 ID를 쿼리스트링 파라미터로 포함하고 싶다면, URL에 `{CHECKOUT_SESSION_ID}`라는 리터럴 문자열을 추가하세요. Stripe에서 해당 부분을 실제 Checkout 세션 ID로 치환해 전달합니다.

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

기본적으로 Stripe Checkout은 [사용자가 직접 입력할 수 있는 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 허용하지 않습니다. 다행히 Checkout 페이지에서 이러한 기능을 활성화하는 방법이 있습니다. 이를 위해서는 `allowPromotionCodes` 메서드를 호출하면 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a name="single-charge-checkouts"></a>
### 단일 결제 체크아웃

Stripe 대시보드에 등록되지 않은 상품에 대해 즉석에서 단일 결제를 처리할 수도 있습니다. 이를 위해, 결제 대상 금액, 상품 이름, 선택적으로 수량을 `Billable` 모델의 `checkoutCharge` 메서드에 전달하면 됩니다. 고객이 이 라우트를 방문하면 Stripe의 Checkout 페이지로 리디렉션됩니다.

```php
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> [!WARNING]
> `checkoutCharge` 메서드를 사용하면 Stripe 대시보드에 항상 새로운 상품과 가격이 생성됩니다. 따라서 Stripe 대시보드에서 미리 상품을 만들어 두고, `checkout` 메서드를 사용하는 것을 권장합니다.

<a name="subscription-checkouts"></a>
### 구독 체크아웃

> [!WARNING]
> 구독을 위해 Stripe Checkout을 사용할 때는 Stripe 대시보드에서 `customer.subscription.created` 웹훅을 활성화해야 합니다. 이 웹훅은 데이터베이스에 구독 레코드를 생성하고, 관련된 구독 아이템 정보를 저장합니다.

Stripe Checkout을 사용하여 구독을 시작할 수도 있습니다. Cashier의 구독 빌더 메서드로 구독을 정의한 후, `checkout` 메서드를 호출하면 됩니다. 고객이 해당 라우트를 방문하면 Stripe의 Checkout 페이지로 이동합니다.

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

상품 체크아웃과 마찬가지로, 성공 및 취소 URL을 커스터마이즈할 수 있습니다.

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

물론, 구독 체크아웃에도 프로모션 코드를 활성화할 수 있습니다.

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
> Stripe Checkout에서는 구독 시작 시 모든 구독 청구 옵션을 지원하지 않습니다. 구독 빌더의 `anchorBillingCycleOn` 메서드 사용, 비례 배분 동작 설정, 결제 동작 설정 등은 Stripe Checkout 세션에서 적용되지 않습니다. 어떤 파라미터를 사용할 수 있는지 확인하려면 [Stripe Checkout Session API 문서](https://stripe.com/docs/api/checkout/sessions/create)를 참고하시기 바랍니다.

<a name="stripe-checkout-trial-periods"></a>
#### Stripe Checkout과 체험 기간

Stripe Checkout을 사용하는 구독에도 체험 기간을 설정할 수 있습니다.

```php
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

단, 체험 기간은 최소 48시간 이상이어야 하며, 이는 Stripe Checkout에서 지원하는 최소 체험 기간입니다.

<a name="stripe-checkout-subscriptions-and-webhooks"></a>
#### 구독과 웹훅

Stripe와 Cashier는 웹훅을 통해 구독 상태를 업데이트하므로, 사용자가 결제 정보를 입력한 후 애플리케이션으로 돌아올 때 구독이 아직 활성화되지 않았을 수도 있습니다. 이런 경우에는 결제 또는 구독이 처리 중임을 알리는 메시지를 표시하는 것이 좋습니다.

<a name="collecting-tax-ids"></a>
### 세금 ID(Tax ID) 수집

Checkout은 고객의 세금 ID도 수집할 수 있습니다. 세션 생성 시 `collectTaxIds` 메서드를 호출하면 기능을 활성화할 수 있습니다.

```php
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

이 메서드를 사용하면 고객이 회사로 구매하는지 체크박스를 선택할 수 있고, 회사인 경우 세금 ID 번호를 입력할 수 있는 기회가 제공됩니다.

> [!WARNING]
> 애플리케이션의 서비스 프로바이더에서 이미 [자동 세금 징수](#tax-configuration)를 설정한 경우, 이 기능은 자동으로 활성화되므로 `collectTaxIds` 메서드를 별도로 호출할 필요가 없습니다.

<a name="guest-checkouts"></a>
### 비회원(게스트) 체크아웃

`Checkout::guest` 메서드를 사용하면 "계정"이 없는 애플리케이션의 방문자(게스트)에게도 체크아웃 세션을 시작할 수 있습니다.

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

기존 사용자 대상으로 체크아웃 세션을 생성할 때와 마찬가지로, `Laravel\Cashier\CheckoutBuilder` 인스턴스에서 제공하는 다양한 메서드로 게스트 체크아웃 세션도 원하는 대로 커스터마이즈할 수 있습니다.

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

게스트 체크아웃이 완료되면 Stripe에서 `checkout.session.completed` 웹훅 이벤트를 전송할 수 있으므로, 반드시 [Stripe 웹훅을 구성](https://dashboard.stripe.com/webhooks)하여 이 이벤트가 애플리케이션으로 전송되도록 해야 합니다. Stripe 대시보드에서 웹훅을 활성화했다면 [Cashier에서 해당 웹훅 처리](#handling-stripe-webhooks)를 할 수 있습니다. 웹훅 payload에 포함된 객체는 [checkout 객체](https://stripe.com/docs/api/checkout/sessions/object)이며, 고객 주문 처리를 위해 활용할 수 있습니다.

<a name="handling-failed-payments"></a>
## 결제 실패 처리

구독 또는 단일 결제 시 결제가 실패할 수 있습니다. 이 경우 Cashier는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시켜 결제가 실패했다는 사실을 알려줍니다. 이 예외를 처리한 뒤에는 두 가지 방법으로 후속 처리를 할 수 있습니다.

첫 번째로, Cashier에서 기본 제공하는 결제 확인(confirmation) 페이지로 고객을 리디렉션할 수 있습니다. 이 페이지는 Cashier의 서비스 프로바이더에 의해 이미 라우트가 등록되어 있습니다. 따라서 `IncompletePayment` 예외를 캐치하여 아래와 같이 결제 확인 페이지로 리디렉션할 수 있습니다.

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

결제 확인 페이지에서는 고객이 신용카드 정보를 다시 입력하거나 Stripe가 요구하는 "3D Secure" 확인 등 추가 절차를 진행하게 됩니다. 결제 확인이 끝나면 위에서 `redirect` 파라미터로 지정한 URL로 이동됩니다. 이때 URL에는 `message`(문자열)와 `success`(정수) 쿼리 스트링 변수가 추가됩니다. 해당 결제 페이지는 현재 다음 결제 수단을 지원합니다.

<div class="content-list" markdown="1">

- 신용카드
- Alipay
- Bancontact
- BECS Direct Debit
- EPS
- Giropay
- iDEAL
- SEPA Direct Debit

</div>

두 번째 방법은 Stripe가 자체적으로 결제 확인을 처리하도록 맡기는 것입니다. 이 경우 결제 확인 페이지로 리디렉션하는 대신, Stripe 대시보드에서 [자동 결제 이메일](https://dashboard.stripe.com/account/billing/automatic)을 설정하면 됩니다. 다만 `IncompletePayment` 예외가 발생했을 때, 고객에게 추가 결제 확인 안내 이메일이 발송될 것임을 안내해야 합니다.

결제 예외는 `charge`, `invoiceFor`, `invoice` 등 `Billable` 트레이트를 사용하는 모델의 메서드에서 발생할 수 있습니다. 구독 관련 메서드에서는 `SubscriptionBuilder`의 `create`, 그리고 `Subscription` 및 `SubscriptionItem` 모델의 `incrementAndInvoice`, `swapAndInvoice` 메서드가 실패 시 예외를 던질 수 있습니다.

특정 구독의 결제 미완료(incomplete) 여부는 `Billable` 모델이나 구독 인스턴스에서 `hasIncompletePayment` 메서드로 판단할 수 있습니다.

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

예외 인스턴스의 `payment` 속성을 확인하면 미완료 결제의 상세 상태를 확인할 수 있습니다.

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // 결제 의도(payment intent) 상태 가져오기...
    $exception->payment->status;

    // 특정 조건 체크...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a name="confirming-payments"></a>
### 결제 확인 처리

일부 결제 수단은 결제 확인을 위해 추가 데이터가 필요합니다. 예를 들어, SEPA 결제 방식은 결제 과정에서 추가 "mandate" 데이터가 필요할 수 있습니다. 이런 데이터는 `withPaymentConfirmationOptions` 메서드로 Cashier에 전달할 수 있습니다.

```php
$subscription->withPaymentConfirmationOptions([
    'mandate_data' => '...',
])->swap('price_xxx');
```

결제 확인 시 가능한 모든 옵션은 [Stripe API 문서](https://stripe.com/docs/api/payment_intents/confirm)에서 자세히 확인할 수 있습니다.

<a name="strong-customer-authentication"></a>
## 강력한 고객 인증(SCA)

귀사 또는 고객이 유럽에 기반을 둘 경우, 유럽연합(EU)에서 2019년 9월부터 의무화한 강력한 고객 인증(SCA) 규정을 반드시 따라야 합니다. 이는 결제 사기를 방지하기 위한 규정입니다. Stripe와 Cashier는 SCA를 준수하는 애플리케이션 개발에 대비가 되어 있습니다.

> [!WARNING]
> 시작하기 전에 [Stripe의 PSD2 및 SCA 가이드](https://stripe.com/guides/strong-customer-authentication)와 [SCA API 관련 문서](https://stripe.com/docs/strong-customer-authentication)를 반드시 확인하세요.

<a name="payments-requiring-additional-confirmation"></a>
### 추가 확인이 필요한 결제

SCA 규정에 따라 결제 시 추가 인증이 필요한 경우가 자주 발생합니다. 이럴 때 Cashier는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시켜 추가 확인이 필요함을 알려줍니다. 이러한 예외 처리 방법은 [결제 실패 처리](#handling-failed-payments) 항목에서 자세히 다루고 있습니다.

Stripe 또는 Cashier에서 제공하는 결제 확인 화면은 각 은행이나 카드사의 결제 흐름에 맞게 구성될 수 있으며, 추가 신용카드 인증, 소액 임시 승인, 별도 기기 인증 등 다양한 인증 방식이 적용될 수 있습니다.

<a name="incomplete-and-past-due-state"></a>
#### 미완료 및 연체(past due) 상태

결제 확인이 추가로 필요한 경우 구독은 `stripe_status` 컬럼 기준으로 `incomplete` 또는 `past_due` 상태로 유지됩니다. 결제 확인이 완료되고 Stripe 웹훅을 통해 애플리케이션에 완료 알림이 도달하면 Cashier가 자동으로 고객의 구독을 활성화합니다.

`incomplete`와 `past_due` 상태에 대한 더 자세한 사항은 [관련 추가 문서](#incomplete-and-past-due-status)를 참고하시기 바랍니다.

<a name="off-session-payment-notifications"></a>
### 오프 세션 결제 알림

SCA 규정에 따라 구독이 활성 상태여도 때때로 고객이 결제 정보를 직접 인증해야 할 수 있습니다. 이런 경우 Cashier는 오프 세션 결제 확인이 필요함을 고객에게 알리는 알림을 전송할 수 있습니다. 예를 들어, 구독이 갱신될 때 이러한 상황이 발생할 수 있습니다. Cashier의 결제 알림은 `CASHIER_PAYMENT_NOTIFICATION` 환경 변수를 알림 클래스 명으로 설정하면 활성화됩니다. 기본적으로 이 알림은 비활성화 상태이며 Cashier에서 제공하는 클래스를 사용할 수도 있고, 직접 커스텀 알림 클래스를 지정해도 됩니다.

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

오프 세션 결제 확인 알림이 제대로 전송되려면, [Stripe 웹훅이 구성되어](#handling-stripe-webhooks) 있어야 하고 Stripe 대시보드에서 `invoice.payment_action_required` 웹훅도 활성화해야 합니다. 그리고, `Billable` 모델에서 Laravel의 `Illuminate\Notifications\Notifiable` 트레이트를 반드시 사용해야 합니다.

> [!WARNING]
> 고객이 직접 결제를 진행하면서 추가 인증이 필요한 경우에도 알림이 발송될 수 있습니다. Stripe에서 결제가 수동으로 이루어졌는지, 오프 세션에서 이루어진 것인지는 구분할 방법이 없습니다. 하지만 고객이 이미 결제를 마쳤다면 결제 페이지에서 "결제 성공" 메시지가 표출될 뿐, 동일 결제를 중복 인증 또는 중복 결제할 일은 없습니다.

<a name="stripe-sdk"></a>
## Stripe SDK

Cashier에서 제공하는 객체의 상당수는 Stripe SDK 객체를 감싸는 역할을 합니다. Stripe 객체에 직접 접근하고 싶다면 `asStripe` 메서드를 사용하여 해당 객체를 편리하게 얻을 수 있습니다.

```php
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

Stripe 구독을 직접 업데이트하고 싶다면 `updateStripeSubscription` 메서드를 사용할 수 있습니다.

```php
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

`Cashier` 클래스의 `stripe` 메서드를 호출하면 `Stripe\StripeClient` 인스턴스에 직접 접근할 수 있습니다. 예를 들어, 이 클라이언트를 사용해 Stripe 계정에서 가격 목록을 가져올 수도 있습니다.

```php
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a name="testing"></a>
## 테스트

Cashier를 사용하는 애플리케이션을 테스트할 때 Stripe API로 실제 HTTP 요청을 모킹(mock)할 수도 있지만, 이 방법은 Cashier의 동작 일부를 직접 구현해야 하므로 권장되지 않습니다. 대신 테스트가 Stripe의 실제 API를 호출하도록 두는 것이 좋습니다. 다소 느리긴 하지만 애플리케이션이 정상 동작하는지 신뢰할 수 있으며, 느린 테스트는 별도의 Pest/PHPUnit 테스트 그룹으로 분리해서 관리할 수 있습니다.

테스트 시 Cashier 자체에도 이미 충분한 테스트가 마련되어 있으므로, 개발자는 구독/결제 흐름 등 자신이 작성한 로직에만 집중해서 테스트하면 됩니다. Cashier의 내부 동작까지 일일이 테스트할 필요는 없습니다.

테스트를 시작하려면 `phpunit.xml` 파일에 Stripe의 **테스트** 시크릿 키를 추가합니다.

```xml
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

이제 Cashier와 상호작용할 때 실제 Stripe 테스트 환경으로 API 요청이 전송됩니다. 효율적인 테스트를 위해 Stripe 테스트 계정에서 미리 구독/가격 정보를 생성해 두는 것이 좋습니다.

> [!NOTE]
> 신용카드 거절, 결제 실패 등 다양한 시나리오를 테스트하려면 Stripe에서 [제공하는 테스트용 카드 번호와 토큰](https://stripe.com/docs/testing) 목록을 활용할 수 있습니다.