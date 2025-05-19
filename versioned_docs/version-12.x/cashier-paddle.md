# 라라벨 Cashier, Paddle (Laravel Cashier (Paddle))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
    - [Paddle Sandbox](#paddle-sandbox)
- [설정](#configuration)
    - [청구 가능 모델](#billable-model)
    - [API 키](#api-keys)
    - [Paddle JS](#paddle-js)
    - [통화 설정](#currency-configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [빠른 시작](#quickstart)
    - [상품 판매](#quickstart-selling-products)
    - [구독 상품 판매](#quickstart-selling-subscriptions)
- [체크아웃 세션](#checkout-sessions)
    - [오버레이 체크아웃](#overlay-checkout)
    - [인라인 체크아웃](#inline-checkout)
    - [비회원(Guest) 체크아웃](#guest-checkouts)
- [가격 미리보기](#price-previews)
    - [고객 가격 미리보기](#customer-price-previews)
    - [할인](#price-discounts)
- [고객](#customers)
    - [고객 기본값](#customer-defaults)
    - [고객 조회](#retrieving-customers)
    - [고객 생성](#creating-customers)
- [구독](#subscriptions)
    - [구독 생성](#creating-subscriptions)
    - [구독 상태 확인](#checking-subscription-status)
    - [구독 내 단일 결제](#subscription-single-charges)
    - [결제 정보 갱신](#updating-payment-information)
    - [요금제 변경](#changing-plans)
    - [구독 수량](#subscription-quantity)
    - [다수 상품 구독](#subscriptions-with-multiple-products)
    - [여러 개의 구독](#multiple-subscriptions)
    - [구독 일시중지](#pausing-subscriptions)
    - [구독 취소](#canceling-subscriptions)
- [구독 체험판](#subscription-trials)
    - [결제 정보 선입력 시](#with-payment-method-up-front)
    - [결제 정보 없이](#without-payment-method-up-front)
    - [체험판 연장 또는 활성화](#extend-or-activate-a-trial)
- [Paddle Webhook 처리](#handling-paddle-webhooks)
    - [Webhook 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [Webhook 시그니처 검증](#verifying-webhook-signatures)
- [단일 결제](#single-charges)
    - [상품 결제 처리](#charging-for-products)
    - [트랜잭션 환불](#refunding-transactions)
    - [트랜잭션 크레딧 제공](#crediting-transactions)
- [트랜잭션](#transactions)
    - [이전 및 예정된 결제 내역](#past-and-upcoming-payments)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

> [!WARNING]
> 이 문서는 Cashier Paddle 2.x와 Paddle Billing의 연동에 대한 내용입니다. 아직 Paddle Classic을 사용하고 계시다면 [Cashier Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x) 문서를 참고하시기 바랍니다.

[라라벨 Cashier Paddle](https://github.com/laravel/cashier-paddle)은 [Paddle](https://paddle.com) 구독 결제 서비스에 쉽게 연동할 수 있게 하는 직관적이고 유연한 인터페이스를 제공합니다. 반복적으로 작성해야 하는 구독 결제 관련 대부분의 보일러플레이트 코드를 자동으로 처리해 주어 개발의 부담을 크게 줄여줍니다. 기본적인 구독 관리뿐 아니라, Cashier는 구독 변경, "수량" 기반 구독, 구독 일시중지, 해지 유예 기간(grace period) 등 다양한 기능도 제공합니다.

Cashier Paddle을 본격적으로 사용하기 전에, Paddle의 [개념 설명서](https://developer.paddle.com/concepts/overview)와 [API 문서](https://developer.paddle.com/api-reference/overview)도 함께 살펴보시길 추천합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier를 새 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md)를 꼼꼼하게 확인하시기 바랍니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 이용해 Paddle용 Cashier 패키지를 설치합니다:

```shell
composer require laravel/cashier-paddle
```

그 다음, `vendor:publish` Artisan 명령어를 사용해서 Cashier의 마이그레이션 파일을 공개해야 합니다:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

그리고 애플리케이션의 데이터베이스 마이그레이션을 실행합니다. Cashier 마이그레이션은 새로운 `customers` 테이블을 생성합니다. 또한, 고객의 모든 구독 정보를 저장하기 위한 새로운 `subscriptions` 및 `subscription_items` 테이블이 추가로 생성됩니다. 마지막으로, 고객과 연결된 모든 Paddle 트랜잭션을 저장하는 `transactions` 테이블도 만들어집니다.

```shell
php artisan migrate
```

> [!WARNING]
> Paddle의 이벤트를 Cashier가 제대로 처리할 수 있도록, 반드시 [Cashier의 Webhook 설정](#handling-paddle-webhooks)을 해주셔야 합니다.

<a name="paddle-sandbox"></a>
### Paddle Sandbox

로컬 개발 환경 또는 스테이징 환경에서 작업할 때는 반드시 [Paddle Sandbox 계정](https://sandbox-login.paddle.com/signup)을 등록해 사용해야 합니다. 이 샌드박스 계정은 실제 결제를 발생시키지 않고도 애플리케이션을 테스트하고 개발할 수 있는 환경을 제공합니다. 결제 시나리오 검증을 위해서는 Paddle이 제공하는 [테스트 카드 번호](https://developer.paddle.com/concepts/payment-methods/credit-debit-card)를 활용할 수 있습니다.

Paddle Sandbox 환경을 사용할 때는 애플리케이션의 `.env` 파일에 `PADDLE_SANDBOX` 환경 변수를 `true`로 설정해야 합니다:

```ini
PADDLE_SANDBOX=true
```

개발을 완료한 뒤에는 [Paddle 벤더 계정](https://paddle.com)에 신청할 수 있습니다. 운영 환경(프로덕션) 애플리케이션의 도메인을 Paddle에서 승인해야 실제 결제 처리가 가능합니다.

<a name="configuration"></a>
## 설정

<a name="billable-model"></a>
### 청구 가능 모델

Cashier를 사용하기 전에, 사용자 모델에 `Billable` 트레이트를 추가해야 합니다. 이 트레이트는 구독 생성, 결제 정보 업데이트 등 일반적으로 필요한 빌링 관련 메서드를 제공합니다:

```php
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

만약 청구 가능한 엔티티가 사용자 모델이 아니라면, 해당 클래스에도 위 트레이트를 추가할 수 있습니다:

```php
use Illuminate\Database\Eloquent\Model;
use Laravel\Paddle\Billable;

class Team extends Model
{
    use Billable;
}
```

<a name="api-keys"></a>
### API 키

다음으로, Paddle 키를 애플리케이션의 `.env` 파일에 설정해야 합니다. Paddle API 키들은 Paddle 관리 콘솔에서 확인할 수 있습니다:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

`PADDLE_SANDBOX` 환경 변수는 [Paddle Sandbox 환경](#paddle-sandbox)에서 테스트할 때 `true`로 설정해야 합니다. 실제 운영 환경(프로덕션)에서 Paddle의 라이브 벤더 환경을 사용할 경우, 해당 변수를 `false`로 변경해야 합니다.

`PADDLE_RETAIN_KEY`는 선택 사항이며, [Retain](https://developer.paddle.com/paddlejs/retain)을 사용하는 경우에만 설정하면 됩니다.

<a name="paddle-js"></a>
### Paddle JS

Paddle의 결제 체크아웃 위젯을 사용하려면 Paddle의 자체 자바스크립트 라이브러리가 필요합니다. 이 라이브러리는 애플리케이션 레이아웃의 `</head>` 태그 바로 앞에 `@paddleJS` Blade 지시어를 삽입해 불러올 수 있습니다:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### 통화 설정

송장에 표시되는 금액 값을 표시할 때 사용할 로케일(locale)을 지정할 수 있습니다. Cashier는 내부적으로 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 이용하여 통화 포맷을 처리합니다:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> `en` 이외의 로케일을 사용하려면 PHP의 `ext-intl` 확장 모듈이 서버에 설치되어 있어야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Cashier 내부적으로 사용하는 모델을 자유롭게 확장해 사용할 수도 있습니다. 자체적으로 모델을 정의하고 Cashier의 해당 모델을 상속하면 됩니다:

```php
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 뒤에는 `Laravel\Paddle\Cashier` 클래스의 메서드를 통해 Cashier에 커스텀 모델을 사용하도록 지정해야 합니다. 보통은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 이 작업을 진행합니다:

```php
use App\Models\Cashier\Subscription;
use App\Models\Cashier\Transaction;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useTransactionModel(Transaction::class);
}
```

<a name="quickstart"></a>
## 빠른 시작

<a name="quickstart-selling-products"></a>
### 상품 판매

> [!NOTE]
> Paddle Checkout을 사용하기 전에, Paddle 대시보드에서 고정 가격이 지정된 상품(Products)을 먼저 생성해야 합니다. 또한, [Paddle의 Webhook 설정](#handling-paddle-webhooks)도 해주셔야 합니다.

애플리케이션에서 상품 및 구독 결제 시스템을 도입하는 일은 부담스럽게 느껴질 수 있습니다. 하지만 Cashier와 [Paddle의 체크아웃 오버레이(Checkout Overlay)](https://www.paddle.com/billing/checkout) 덕분에, 쉽고 견고하게 최신 결제 통합 기능을 구현할 수 있습니다.

반복 결제가 아닌, 단순 일회성 상품에 대해 고객에게 결제를 받으려면, Cashier를 활용해 Paddle 체크아웃 오버레이를 띄우고, 고객이 결제 정보를 입력한 후 구매를 완료하도록 만들면 됩니다. 결제가 성공적으로 이루어지면 고객은 설정해둔 성공 페이지로 리디렉션됩니다:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout('pri_deluxe_album')
        ->returnTo(route('dashboard'));

    return view('buy', ['checkout' => $checkout]);
})->name('checkout');
```

위 예시에서 보듯이, Cashier의 `checkout` 메서드를 사용해 고객에게 Paddle 체크아웃 오버레이를 띄울 수 있는 checkout 객체를 생성할 수 있습니다. 여기서 전달하는 "가격 식별자(price identifier)"는 Paddle에서 [특정 상품에 대해 미리 정의된 price](https://developer.paddle.com/build/products/create-products-prices)를 의미합니다.

필요한 경우, `checkout` 메서드는 Paddle에 고객이 없다면 자동으로 고객을 생성하고, Paddle의 고객 정보와 애플리케이션의 사용자 정보를 연결해줍니다. 체크아웃 세션이 완료되면 고객은 지정된 성공 페이지로 리디렉션되어 안내 메시지를 볼 수 있습니다.

`buy` 뷰에서는 체크아웃 오버레이를 띄우는 버튼을 배치하면 됩니다. Cashier Paddle에는 `paddle-button` Blade 컴포넌트가 기본 제공되며, [오버레이 체크아웃을 직접 렌더링](#manually-rendering-an-overlay-checkout)할 수도 있습니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a name="providing-meta-data-to-paddle-checkout"></a>
#### Paddle Checkout에 메타 데이터 제공하기

상품을 판매할 때는, 직접 정의한 `Cart` 및 `Order` 모델을 통해 주문 및 구매 내역을 추적하는 경우가 많습니다. Paddle의 체크아웃 오버레이로 고객을 리디렉션할 때, 기존 주문 ID 같은 정보를 함께 전달하면, 결제 완료 후 고객이 다시 돌아왔을 때 해당 구매가 어떤 주문과 연결된 것인지 식별할 수 있습니다.

이를 위해서는 `checkout` 메서드에 커스텀 데이터 배열을 전달하면 됩니다. 예를 들어, 사용자가 체크아웃을 시작할 때 애플리케이션 내부적으로 미결 상태의 `Order`가 생성된다고 가정해 보겠습니다. 아래의 `Cart`와 `Order` 모델은 예시일 뿐이며, Cashier에서 직접 제공하지 않습니다. 애플리케이션의 요구사항에 맞게 자유롭게 구현하면 됩니다:

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

    $checkout = $request->user()->checkout($order->price_ids)
        ->customData(['order_id' => $order->id]);

    return view('billing', ['checkout' => $checkout]);
})->name('checkout');
```

위 예시처럼, 사용자가 체크아웃을 시작할 때, 장바구니 혹은 주문과 연관된 Paddle price ID 들을 `checkout` 메서드에 전달합니다. 사용자가 장바구니에 상품을 담을 때마다 해당 price를 애플리케이션에서 관리하면 됩니다. 그리고 `customData` 메서드를 이용해 주문 ID를 Paddle 체크아웃 오버레이에 함께 전달합니다.

결제가 완료된 후, 해당 주문을 "완료" 상태로 변경해줘야 할 것입니다. 이를 위해서는 Paddle에서 발송하는 webhook과, 그 webhook을 기반으로 Cashier가 발생시키는 이벤트를 활용해 직접 데이터베이스에 정보를 저장할 수 있습니다.

시작하려면 Cashier에서 발송하는 `TransactionCompleted` 이벤트를 리스닝하면 됩니다. 일반적으로는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 이벤트 리스너를 등록합니다:

```php
use App\Listeners\CompleteOrder;
use Illuminate\Support\Facades\Event;
use Laravel\Paddle\Events\TransactionCompleted;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(TransactionCompleted::class, CompleteOrder::class);
}
```

이 예시에서 `CompleteOrder` 리스너는 다음과 같이 구성할 수 있습니다:

```php
namespace App\Listeners;

use App\Models\Order;
use Laravel\Paddle\Cashier;
use Laravel\Paddle\Events\TransactionCompleted;

class CompleteOrder
{
    /**
     * Handle the incoming Cashier webhook event.
     */
    public function handle(TransactionCompleted $event): void
    {
        $orderId = $event->payload['data']['custom_data']['order_id'] ?? null;

        $order = Order::findOrFail($orderId);

        $order->update(['status' => 'completed']);
    }
}
```

`transaction.completed` 이벤트에 담긴 데이터에 대해서는 Paddle 공식 문서([관련 Webhook 데이터 참고](https://developer.paddle.com/webhooks/transactions/transaction-completed))를 참고하시기 바랍니다.

<a name="quickstart-selling-subscriptions"></a>
### 구독 상품 판매

> [!NOTE]
> Paddle Checkout을 사용하기 전에, Paddle 대시보드에서 고정 가격이 지정된 상품(Products)을 먼저 생성해야 합니다. 또한, [Paddle의 Webhook 설정](#handling-paddle-webhooks)도 해주셔야 합니다.

애플리케이션에서 상품 및 구독 결제 시스템을 도입하는 일은 부담스럽게 느껴질 수 있습니다. 하지만 Cashier와 [Paddle의 체크아웃 오버레이(Checkout Overlay)](https://www.paddle.com/billing/checkout) 덕분에, 쉽고 견고하게 최신 결제 통합 기능을 구현할 수 있습니다.

Cashier와 Paddle 체크아웃 오버레이를 이용해 구독을 판매하는 방법을 알아보기 위해, 기본 월 구독(`price_basic_monthly`)과 연 구독(`price_basic_yearly`)을 제공하는 간단한 구독 서비스를 예로 들겠습니다. 이 가격들은 "Basic" 상품(`pro_basic`)에 묶을 수 있고, 전문가용 요금제는 `pro_expert`로 구분한다고 가정할 수 있습니다.

우선, 고객이 어떻게 구독을 신청할 수 있는지 살펴보겠습니다. 예를 들어, 애플리케이션의 요금제 페이지에서 Basic 요금제를 구독하려고 "구독하기" 버튼을 클릭할 수 있을 것입니다. 이 버튼을 클릭하면 Paddle 체크아웃 오버레이가 열려 원하는 플랜으로 구독을 진행하게 됩니다. 먼저, `checkout` 메서드를 이용해 체크아웃 세션을 시작합니다:

```php
use Illuminate\Http\Request;

Route::get('/subscribe', function (Request $request) {
    $checkout = $request->user()->checkout('price_basic_monthly')
        ->returnTo(route('dashboard'));

    return view('subscribe', ['checkout' => $checkout]);
})->name('subscribe');
```

`subscribe` 뷰에서는 오버레이를 띄우는 버튼을 배치하면 됩니다. Cashier Paddle에는 `paddle-button` Blade 컴포넌트가 포함되어 있으며, [오버레이 체크아웃을 직접 렌더링](#manually-rendering-an-overlay-checkout)할 수도 있습니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

이제 Subscribe 버튼이 클릭되면 고객은 결제 정보를 입력하고 구독 신청을 진행할 수 있습니다. 결제 완료 시점이 즉시 처리되지 않고 결제 수단에 따라 약간의 지연이 있을 수 있으니, 반드시 [Cashier의 Webhook 설정](#handling-paddle-webhooks)을 해주시기 바랍니다.

고객이 구독을 시작할 수 있게 되었다면, 구독한 사용자만 특정 기능이나 페이지에 접근하도록 애플리케이션 일부를 제한해야 할 수도 있습니다. Cashier의 `Billable` 트레이트가 제공하는 `subscribed` 메서드를 사용하면, 사용자의 구독 상태를 쉽게 확인할 수 있습니다:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

특정 상품이나 요금제에 구독 중인지도 간단하게 확인할 수 있습니다:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### 구독 여부 판별 미들웨어 만들기

개발의 편의를 위해, 들어오는 요청이 구독 사용자로부터 온 것인지를 판별하는 [미들웨어](/docs/12.x/middleware)를 정의할 수 있습니다. 이 미들웨어를 라우트에 연결하면, 구독하지 않은 사용자가 해당 라우트에 접근하는 것을 손쉽게 막을 수 있습니다:

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
            // 사용자를 결제 페이지로 리디렉션하여 구독을 유도합니다...
            return redirect('/subscribe');
        }

        return $next($request);
    }
}
```

이제 위에서 정의한 미들웨어를 라우트에 연결할 수 있습니다:

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### 고객이 본인 구독 플랜을 관리할 수 있도록 하기

고객이 본인의 구독 플랜(상품, "계층")을 변경하고 싶어 할 수도 있습니다. 예시에서처럼 월 구독에서 연 구독으로 변경할 수 있도록, 아래와 같은 라우트로 연결되는 버튼을 만들면 됩니다:

```php
use Illuminate\Http\Request;

Route::put('/subscription/{price}/swap', function (Request $request, $price) {
    $user->subscription()->swap($price); // 이 예시에서는 "$price"가 "price_basic_yearly"가 될 수 있습니다.

    return redirect()->route('dashboard');
})->name('subscription.swap');
```

구독 플랜 변경 외에도, 고객이 구독을 취소할 수 있도록 해주어야 합니다. 플랜 변경과 마찬가지로, 취소를 위한 버튼을 만들고 아래와 같은 라우트로 연결하면 됩니다:

```php
use Illuminate\Http\Request;

Route::put('/subscription/cancel', function (Request $request, $price) {
    $user->subscription()->cancel();

    return redirect()->route('dashboard');
})->name('subscription.cancel');
```

이렇게 하면 해당 구독은 현재 결제 주기가 끝나는 시점에 취소 처리가 됩니다.

> [!NOTE]
> Cashier의 Webhook 처리를 설정해두었다면, Paddle에서 들어오는 Webhook을 기반으로 Cashier가 애플리케이션의 관련 데이터베이스 테이블을 자동으로 동기화해 줍니다. 예를 들어, Paddle 대시보드에서 고객의 구독을 취소하면, 해당 Webhook이 도착해 Cashier가 애플리케이션 데이터베이스 내 구독 상태를 "취소됨"으로 바꿉니다.

<a name="checkout-sessions"></a>
## 체크아웃 세션

고객에게 결제를 처리하는 거의 모든 작업은 Paddle의 [Checkout Overlay 위젯](https://developer.paddle.com/build/checkout/build-overlay-checkout) 또는 [인라인 체크아웃](https://developer.paddle.com/build/checkout/build-branded-inline-checkout)을 이용해 "체크아웃"을 통해 이루어집니다.

Paddle을 이용해 결제 처리를 시작하기 전에, 애플리케이션의 [기본 결제 링크](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link)를 Paddle 체크아웃 설정 대시보드에서 설정해야 합니다.

<a name="overlay-checkout"></a>
### 오버레이 체크아웃

체크아웃 오버레이 위젯을 표시하기 전에, Cashier를 이용해서 체크아웃 세션을 먼저 생성해야 합니다. 이 세션은 위젯에 결제 대상 작업 정보를 알려줍니다:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Cashier에는 `paddle-button` [Blade 컴포넌트](/docs/12.x/blade#components)가 포함되어 있습니다. 생성한 체크아웃 세션을 이 컴포넌트의 "prop"으로 전달하면, 버튼 클릭 시 Paddle의 체크아웃 위젯이 화면에 표시됩니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

기본적으로, 이 위젯은 Paddle의 기본 스타일로 표시됩니다. [Paddle에서 지원하는 속성(attribute)](https://developer.paddle.com/paddlejs/html-data-attributes) 중 `data-theme='light'`와 같은 속성을 컴포넌트에 추가해 위젯을 커스터마이즈할 수도 있습니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

Paddle의 체크아웃 위젯은 비동기 방식으로 동작합니다. 사용자가 위젯 내에서 구독을 생성하면, Paddle이 Webhook을 애플리케이션으로 전송하고, 이를 통해 애플리케이션 내 구독 상태를 적절히 업데이트할 수 있습니다. 따라서 Paddle의 상태 변경에도 대응할 수 있도록 [Webhook 설정](#handling-paddle-webhooks)을 반드시 해주셔야 합니다.

> [!WARNING]
> 구독 상태 변경 후에는 Webhook 수신에 약간의 딜레이가 발생할 수 있습니다. 따라서 고객이 체크아웃을 마쳤더라도, 구독 상태가 즉시 반영되지 않을 수 있음을 고려해서 구현해야 합니다.

<a name="manually-rendering-an-overlay-checkout"></a>
#### 오버레이 체크아웃 직접 렌더링하기

라라벨의 내장 Blade 컴포넌트를 사용하지 않고, 수동으로 오버레이 체크아웃을 구현할 수도 있습니다. 우선 [앞서 안내한 방법](#overlay-checkout)으로 체크아웃 세션을 생성합니다:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

그 다음, Paddle.js를 이용해 체크아웃을 초기화할 수 있습니다. 아래 예시에서는 `paddle_button` 클래스를 할당한 링크를 만들고, Paddle.js가 이를 감지해 클릭 시 오버레이 체크아웃을 띄웁니다:

```blade
<?php
$items = $checkout->getItems();
$customer = $checkout->getCustomer();
$custom = $checkout->getCustomData();
?>

<a
    href='#!'
    class='paddle_button'
    data-items='{!! json_encode($items) !!}'
    @if ($customer) data-customer-id='{{ $customer->paddle_id }}' @endif
    @if ($custom) data-custom-data='{{ json_encode($custom) }}' @endif
    @if ($returnUrl = $checkout->getReturnUrl()) data-success-url='{{ $returnUrl }}' @endif
>
    Buy Product
</a>
```

<a name="inline-checkout"></a>
### 인라인 체크아웃

Paddle의 "오버레이" 스타일 체크아웃 위젯 대신, 위젯을 화면 내에 직접 삽입하는 "인라인" 방식으로도 결제 처리가 가능합니다. 이 방식은 체크아웃 HTML 필드는 직접 조정할 수 없지만, 애플리케이션 내 원하는 위치에 위젯을 표시할 수 있습니다.

Cashier는 인라인 체크아웃을 쉽게 처리할 수 있도록 `paddle-checkout` Blade 컴포넌트를 제공합니다. 먼저 [체크아웃 세션을 생성](#overlay-checkout)하세요:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

그 다음, 생성한 체크아웃 세션을 컴포넌트의 `checkout` 속성에 전달합니다:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

인라인 체크아웃 컴포넌트의 높이를 조정하려면 `height` 속성을 Blade 컴포넌트에 전달할 수 있습니다:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

인라인 체크아웃의 추가 커스터마이즈 옵션 등은 Paddle의 [인라인 체크아웃 가이드](https://developer.paddle.com/build/checkout/build-branded-inline-checkout) 및 [체크아웃 설정 관련 문서](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings)를 참고하세요.

<a name="manually-rendering-an-inline-checkout"></a>
#### 인라인 체크아웃 직접 렌더링하기

라라벨의 기본 Blade 컴포넌트를 사용하지 않고, 인라인 체크아웃을 직접 구현할 수도 있습니다. 먼저 [위에서 설명한 대로](#inline-checkout) 체크아웃 세션을 준비합니다:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

그 다음, Paddle.js를 사용해 체크아웃을 직접 띄울 수 있습니다. 예시에서는 [Alpine.js](https://github.com/alpinejs/alpine)를 이용했지만, 프론트엔드 구현 방식은 자유롭게 바꿀 수 있습니다:

```blade
<?php
$options = $checkout->options();

$options['settings']['frameTarget'] = 'paddle-checkout';
$options['settings']['frameInitialHeight'] = 366;
?>

<div class="paddle-checkout" x-data="{}" x-init="
    Paddle.Checkout.open(@json($options));
">
</div>
```

<a name="guest-checkouts"></a>

### 게스트 결제(Guest Checkouts)

때로는, 애플리케이션에 계정이 필요하지 않은 사용자에게도 결제 세션을 생성해야 할 때가 있습니다. 이럴 때는 `guest` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Checkout;

Route::get('/buy', function (Request $request) {
    $checkout = Checkout::guest(['pri_34567'])
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

이렇게 생성한 결제 세션은 [Paddle 버튼](#overlay-checkout)이나 [인라인 결제](#inline-checkout) Blade 컴포넌트에 전달할 수 있습니다.

<a name="price-previews"></a>
## 가격 미리보기(Price Previews)

Paddle은 각 통화(currency)별로 가격을 설정할 수 있어서, 국가별로 다른 가격을 제공할 수 있습니다. Cashier Paddle은 `previewPrices` 메서드를 사용하여 이러한 가격 정보를 모두 받아올 수 있습니다. 이 메서드는 조회하고자 하는 가격 ID 배열을 인수로 받습니다.

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

통화는 기본적으로 요청의 IP 주소를 기반으로 결정됩니다. 하지만, 특정 국가의 가격을 조회하고 싶다면 추가로 국가 정보를 전달할 수 있습니다.

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
    'country_code' => 'BE',
    'postal_code' => '1234',
]]);
```

가격 정보를 받은 뒤에는, 원하는 방식으로 화면에 표시할 수 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

또한, 총액과 세금 금액을 따로 표시할 수도 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

더 자세한 내용은 [Paddle의 가격 미리보기 API 문서](https://developer.paddle.com/api-reference/pricing-preview/preview-prices)를 참고하세요.

<a name="customer-price-previews"></a>
### 고객 가격 미리보기(Customer Price Previews)

이미 Paddle 고객이 된 사용자에게 적용되는 가격을 표시하고 싶다면, 고객 인스턴스에서 직접 가격 정보를 받아올 수 있습니다.

```php
use App\Models\User;

$prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

내부적으로 Cashier는 사용자의 고객 ID를 이용해서 해당 사용자의 통화에 맞는 가격을 조회합니다. 예를 들어, 미국에 거주하는 사용자는 미국 달러로, 벨기에 사용자는 유로로 가격을 볼 수 있습니다. 만약 일치하는 통화를 찾지 못하면 제품의 기본 통화가 사용됩니다. 제품이나 구독 플랜 별 가격은 Paddle 콘솔에서 자유롭게 설정할 수 있습니다.

<a name="price-discounts"></a>
### 할인(Discounts)

할인이 적용된 가격을 표시할 수도 있습니다. `previewPrices` 메서드를 사용할 때 `discount_id` 옵션에 할인 ID를 전달하면 할인이 반영된 금액이 반환됩니다.

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
    'discount_id' => 'dsc_123'
]);
```

그리고 나서 계산된 가격을 출력하면 됩니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

<a name="customers"></a>
## 고객(Customers)

<a name="customer-defaults"></a>
### 고객 기본값(Customer Defaults)

Cashier를 사용하면 결제 세션 생성 시 고객에 대한 여러 기본값을 지정할 수 있습니다. 이 기본값(예: 이메일∙이름)을 미리 설정해두면 사용자가 바로 결제 위젯의 결제 단계로 이동할 수 있습니다. 결제 관련 모델에서 다음 메서드들을 오버라이드해서 기본값을 지정할 수 있습니다.

```php
/**
 * Paddle에 연결할 고객 이름을 반환합니다.
 */
public function paddleName(): string|null
{
    return $this->name;
}

/**
 * Paddle에 연결할 고객 이메일 주소를 반환합니다.
 */
public function paddleEmail(): string|null
{
    return $this->email;
}
```

이렇게 지정된 기본값은 [결제 세션](#checkout-sessions)을 생성하는 Cashier의 모든 동작에 적용됩니다.

<a name="retrieving-customers"></a>
### 고객 조회하기(Retrieving Customers)

`Cashier::findBillable` 메서드를 사용하면 Paddle 고객 ID로 고객을 조회할 수 있습니다. 이 메서드는 결제 가능 모델 인스턴스를 반환합니다.

```php
use Laravel\Paddle\Cashier;

$user = Cashier::findBillable($customerId);
```

<a name="creating-customers"></a>
### 고객 생성하기(Creating Customers)

경우에 따라 바로 구독이 아니라 Paddle 고객만 먼저 생성하고 싶을 수 있습니다. 이때는 `createAsCustomer` 메서드를 사용할 수 있습니다.

```php
$customer = $user->createAsCustomer();
```

`Laravel\Paddle\Customer` 인스턴스가 반환됩니다. Paddle 상에서 고객이 생성된 후, 얼마든지 이후에 구독을 시작할 수 있습니다. 선택적으로 `$options` 배열을 전달해서 [Paddle API에서 지원하는 고객 생성 파라미터](https://developer.paddle.com/api-reference/customers/create-customer)도 함께 넘길 수 있습니다.

```php
$customer = $user->createAsCustomer($options);
```

<a name="subscriptions"></a>
## 구독(Subscriptions)

<a name="creating-subscriptions"></a>
### 구독 생성하기(Creating Subscriptions)

구독을 생성하려면, 먼저 데이터베이스에서 결제 가능 모델 인스턴스를 조회해야 합니다. 일반적으로 `App\Models\User` 인스턴스가 사용됩니다. 모델 인스턴스를 조회한 후 `subscribe` 메서드를 사용해 사용자의 결제 세션을 생성할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

`subscribe` 메서드의 첫 번째 인수는 사용자가 구독할 가격(Price)의 식별자이며, 이 값은 Paddle 콘솔에서 해당 가격의 ID와 일치해야 합니다. `returnTo` 메서드에는 결제 완료 후 사용자가 리디렉션될 URL을 지정합니다. 두 번째 인수는 이 구독의 내부 "타입"을 의미하며, 보통 `default`나 `primary`와 같이 단일 구독일 경우 사용할 수 있습니다. 구독 타입은 오직 내부적으로만 사용되며, 사용자에게 보여주지 않습니다. 또한, 타입 값에는 공백이 포함되면 안 되며, 구독 생성 이후에는 변경해서는 안 됩니다.

구독 정보에 추가로 임의의 메타데이터를 저장하고 싶다면, `customData` 메서드를 사용할 수 있습니다.

```php
$checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
    ->customData(['key' => 'value'])
    ->returnTo(route('home'));
```

구독 결제 세션이 생성된 뒤에는 이 세션을 Cashier Paddle에서 제공하는 `paddle-button` [Blade 컴포넌트](#overlay-checkout)에 전달하면 됩니다.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

사용자가 결제를 마치면, Paddle로부터 `subscription_created` 웹훅이 전송됩니다. Cashier는 이 웹훅을 받아 고객의 구독 정보를 셋업합니다. 모든 웹훅이 제대로 수신 및 처리되도록 미리 [웹훅 처리 설정](#handling-paddle-webhooks)을 완료했는지 꼭 확인해야 합니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인하기(Checking Subscription Status)

사용자가 애플리케이션에 구독을 완료하면, 여러 편리한 메서드를 통해 구독 상태를 확인할 수 있습니다. 먼저, `subscribed` 메서드는 사용자가 올바른 구독을 보유하고 있으면(트라이얼 기간도 포함) `true`를 반환합니다.

```php
if ($user->subscribed()) {
    // ...
}
```

여러 종류의 구독이 있는 경우, `subscribed` 메서드에 구독 타입을 지정할 수 있습니다.

```php
if ($user->subscribed('default')) {
    // ...
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/12.x/middleware)로도 활용할 수 있기 때문에, 사용자의 구독 상태에 따라 특정 라우트나 컨트롤러 접근을 제어할 수 있습니다.

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
        if ($request->user() && ! $request->user()->subscribed()) {
            // 이 유저는 유료 가입자가 아닙니다...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

사용자가 아직 체험(트라이얼) 기간인지 확인하고 싶다면, `onTrial` 메서드를 사용할 수 있습니다. 이 메서드는 체험 중임을 사용자에게 경고 메시지 등으로 알릴 때 유용합니다.

```php
if ($user->subscription()->onTrial()) {
    // ...
}
```

아래 예시처럼, 사용자가 특정 Paddle 가격 ID에 구독 중인지 `subscribedToPrice` 메서드로 판단할 수 있습니다. 예를 들어, 사용자의 `default` 구독이 월간 요금제에 구독 중인지 확인할 때 사용합니다.

```php
if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
    // ...
}
```

사용자가 현재 체험 기간이나 유예 기간(grace period)이 아닌, 정상 활성 구독 상태인지 확인하려면 `recurring` 메서드를 사용합니다.

```php
if ($user->subscription()->recurring()) {
    // ...
}
```

<a name="canceled-subscription-status"></a>
#### 해지된 구독 상태(Canceled Subscription Status)

사용자가 한때 활성 구독자였으나 지금은 구독을 해지했는지 확인하려면, `canceled` 메서드를 사용합니다.

```php
if ($user->subscription()->canceled()) {
    // ...
}
```

또한, 사용자가 구독을 해지했지만 만료 전까지 "유예 기간"에 있을 수도 있습니다. 예를 들어 구독 정상 만료일이 3월 10일인데, 3월 5일에 해지하면 3월 10일까지는 유예 기간입니다. 이 기간 동안에도 `subscribed`는 `true`를 반환합니다.

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

<a name="past-due-status"></a>
#### 미납 상태(Past Due Status)

구독 결제에 실패하면 해당 구독은 `past_due`(미납) 상태로 표시됩니다. 이 상태에서는 고객이 결제 정보를 업데이트하기 전까지 구독이 활성화되지 않습니다. 구독 인스턴스의 `pastDue` 메서드를 사용해서 미납 상태인지를 확인할 수 있습니다.

```php
if ($user->subscription()->pastDue()) {
    // ...
}
```

미납 상태일 때는 사용자에게 [결제 정보 업데이트 안내](#updating-payment-information)를 제공해야 합니다.

만약 `past_due` 상태의 구독도 유효하다고 간주하고 싶다면, Cashier에서 제공하는 `keepPastDueSubscriptionsActive` 메서드를 사용할 수 있습니다. 이 메서드는 보통 `AppServiceProvider`의 register 메서드에서 호출하는 것이 좋습니다.

```php
use Laravel\Paddle\Cashier;

/**
 * Register any application services.
 */
public function register(): void
{
    Cashier::keepPastDueSubscriptionsActive();
}
```

> [!WARNING]
> `past_due` 상태의 구독은 결제 정보가 갱신되기 전까지 변경할 수 없습니다. 따라서, 이 상태에서 `swap`이나 `updateQuantity` 메서드를 사용하면 예외가 발생합니다.

<a name="subscription-scopes"></a>
#### 구독 스코프(Subscription Scopes)

대부분의 구독 상태는 쿼리 스코프로도 제공되어, 특정 상태의 구독을 데이터베이스에서 쉽게 검색할 수 있습니다.

```php
// 모든 유효한 구독 조회
$subscriptions = Subscription::query()->valid()->get();

// 유저의 해지된 구독만 조회
$subscriptions = $user->subscriptions()->canceled()->get();
```

아래는 사용할 수 있는 모든 스코프의 목록입니다.

```php
Subscription::query()->valid();
Subscription::query()->onTrial();
Subscription::query()->expiredTrial();
Subscription::query()->notOnTrial();
Subscription::query()->active();
Subscription::query()->recurring();
Subscription::query()->pastDue();
Subscription::query()->paused();
Subscription::query()->notPaused();
Subscription::query()->onPausedGracePeriod();
Subscription::query()->notOnPausedGracePeriod();
Subscription::query()->canceled();
Subscription::query()->notCanceled();
Subscription::query()->onGracePeriod();
Subscription::query()->notOnGracePeriod();
```

<a name="subscription-single-charges"></a>
### 구독 단일 청구(Subscription Single Charges)

구독 단일 청구 기능을 이용하면, 구독에 추가해서 일회성으로 고객에게 추가 금액을 청구할 수 있습니다. `charge` 메서드를 사용할 때는 하나 이상의 가격 ID를 전달해야 합니다.

```php
// 단일 가격 청구
$response = $user->subscription()->charge('pri_123');

// 여러 가격을 한 번에 청구
$response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

`charge` 메서드는 다음 구독 청구 주기 때 실제 고객에게 금액을 청구합니다. 만약 고객에게 즉시 결제 처리하고 싶다면, `chargeAndInvoice` 메서드를 사용할 수 있습니다.

```php
$response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a name="updating-payment-information"></a>
### 결제 정보 업데이트(Updating Payment Information)

Paddle은 구독마다 결제 수단을 별도로 관리합니다. 특정 구독의 기본 결제 수단을 업데이트하려면, 구독 모델의 `redirectToUpdatePaymentMethod` 메서드를 사용해 Paddle에서 제공하는 결제수단 변경 페이지로 리디렉션해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/update-payment-method', function (Request $request) {
    $user = $request->user();

    return $user->subscription()->redirectToUpdatePaymentMethod();
});
```

사용자가 정보를 모두 변경하고 나면, Paddle에서 `subscription_updated` 웹훅이 전송되고, 애플리케이션 데이터베이스에 구독 정보가 자동으로 업데이트됩니다.

<a name="changing-plans"></a>
### 구독 플랜 변경하기(Changing Plans)

사용자가 구독 후 새로운 요금제로 변경하고 싶을 때가 있을 수 있습니다. Paddle 가격의 식별자를 구독의 `swap` 메서드에 전달하면 구독 요금제를 바로 변경할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->subscription()->swap($premium = 'pri_456');
```

플랜 변경 후 바로 고객에게 결제까지 하고 싶다면, `swapAndInvoice` 메서드를 이용하면 됩니다.

```php
$user = User::find(1);

$user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a name="prorations"></a>
#### 차감 계산(Prorations)

Paddle은 플랜 변경 시 기본적으로 이전 금액을 일할(차감) 계산해서 청구합니다. 차감 계산을 원하지 않는 경우 `noProrate` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

차감 없이 즉시 결제까지 하고 싶을 때는, `noProrate`와 `swapAndInvoice`를 함께 사용하면 됩니다.

```php
$user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

구독 변경 시 어떠한 추가 결제도 하지 않으려면, `doNotBill` 메서드를 활용합니다.

```php
$user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Paddle의 자세한 차감 정책은 [차감 문서](https://developer.paddle.com/concepts/subscriptions/proration)를 참고하세요.

<a name="subscription-quantity"></a>
### 구독 수량(Subscription Quantity)

어떤 구독은 "수량(quantity)"에 따라 금액이 정해지기도 합니다. 예를 들어, 프로젝트 관리 애플리케이션에서 프로젝트당 월 10달러를 청구한다면, 구독 수량만큼 요금이 올라갑니다. `incrementQuantity`, `decrementQuantity` 메서드로 구독 수량을 쉽게 증감할 수 있습니다.

```php
$user = User::find(1);

$user->subscription()->incrementQuantity();

// 구독의 수량을 5만큼 추가
$user->subscription()->incrementQuantity(5);

$user->subscription()->decrementQuantity();

// 구독의 수량을 5만큼 감소
$user->subscription()->decrementQuantity(5);
```

또는 `updateQuantity` 메서드로 원하는 수량을 직접 지정할 수도 있습니다.

```php
$user->subscription()->updateQuantity(10);
```

`noProrate` 메서드를 함께 사용하면, 수량 변경 시 차감 계산 없이 구독 정보를 갱신할 수 있습니다.

```php
$user->subscription()->noProrate()->updateQuantity(10);
```

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 여러 상품이 포함된 구독의 수량(Quantities for Subscriptions With Multiple Products)

구독이 [여러 상품이 포함된 구독](#subscriptions-with-multiple-products)인 경우, 수량을 증가/감소시키려는 가격의 ID를 두 번째 인수로 전달하면 됩니다.

```php
$user->subscription()->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 여러 상품이 포함된 구독(Subscriptions With Multiple Products)

[여러 상품이 포함된 구독](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons)을 이용하면 하나의 구독에 여러 청구 상품을 할당할 수 있습니다. 예를 들어, 헬프데스크 애플리케이션에서 월 10달러의 기본 구독과, 15달러의 실시간 채팅 추가 상품을 묶을 수 있습니다.

구독 결제 세션을 생성할 때, 가격 배열을 `subscribe` 메서드의 첫 번째 인수로 전달하면 한 번에 여러 상품을 추가할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe([
        'price_monthly',
        'price_chat',
    ]);

    return view('billing', ['checkout' => $checkout]);
});
```

위 예시처럼, 고객의 `default` 구독에 두 개의 가격이 함께 연결됩니다. 각 가격에 대한 청구는 각 상품별로 진행됩니다. 필요하다면, 각 가격별 수량도 전달할 수 있습니다.

```php
$user = User::find(1);

$checkout = $user->subscribe('default', ['price_monthly', 'price_chat' => 5]);
```

이미 존재하는 구독에 상품을 추가하려면, 구독의 `swap` 메서드를 사용해야 합니다. 이때 기존 가격과 수량도 함께 지정해주어야 합니다.

```php
$user = User::find(1);

$user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

위 예시는 새로운 가격을 추가하지만, 고객에게는 다음 결제 주기가 올 때까지 요금이 청구되지 않습니다. 만약 즉시 청구를 원한다면 `swapAndInvoice` 메서드를 사용할 수 있습니다.

```php
$user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

특정 가격을 구독에서 제거하려면, 제거하려는 가격을 누락시키고 나머지 가격만 전달해서 `swap` 메서드를 호출하면 됩니다.

```php
$user->subscription()->swap(['price_original' => 2]);
```

> [!WARNING]
> 구독에서 마지막 가격을 제거할 수는 없습니다. 이 경우에는 구독을 해지해야 합니다.

<a name="multiple-subscriptions"></a>
### 다중 구독(Multiple Subscriptions)

Paddle은 고객이 동시에 여러 종류의 구독을 가질 수 있도록 지원합니다. 예를 들어, 헬스장을 운영하며 수영 구독과 웨이트 구독을 각각 제공할 수 있고, 고객은 두 구독에 모두 가입하거나 하나만 선택할 수도 있습니다.

애플리케이션에서 구독을 생성할 때, `subscribe` 메서드의 두 번째 인수로 구독 타입을 지정할 수 있습니다. 이 타입은 해당 구독을 구별하는 임의의 문자열이어도 됩니다.

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

    return view('billing', ['checkout' => $checkout]);
});
```

위 예시에서는 고객의 수영 월간 구독을 새로 시작합니다. 나중에 연간 요금제로 변경하고 싶다면 해당 구독의 가격만 바꿔주면 됩니다.

```php
$user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

물론 전체 구독을 해지하는 것도 가능합니다.

```php
$user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>
### 구독 일시중지(Pausing Subscriptions)

구독을 일시중지하려면, 사용자의 구독에서 `pause` 메서드를 호출합니다.

```php
$user->subscription()->pause();
```

구독이 일시중지되면 Cashier는 자동으로 데이터베이스의 `paused_at` 컬럼을 설정합니다. 이 컬럼은 `paused` 메서드가 언제부터 `true`를 반환할지 판단하는 데 사용됩니다. 예를 들어, 고객이 3월 1일에 구독을 일시중지했지만, 다음 결제 예정일이 3월 5일이라면, 3월 5일까지는 `paused`가 `false`를 반환합니다. 일반적으로 사용자는 결제한 기간이 끝날 때까지 애플리케이션을 계속 사용할 수 있기 때문입니다.

기본적으로 일시중지는 다음 결제 주기에 맞춰 이루어지므로 고객은 결제한 기간의 남은 부분을 사용할 수 있습니다. 즉시 일시중지하려면, `pauseNow` 메서드를 사용할 수 있습니다.

```php
$user->subscription()->pauseNow();
```

`pauseUntil` 메서드를 사용하면, 특정 시점까지 구독을 일시중지할 수 있습니다.

```php
$user->subscription()->pauseUntil(now()->addMonth());
```

또는 `pauseNowUntil` 메서드로 바로 일시중지하고, 지정된 시점까지 정지 상태를 유지할 수 있습니다.

```php
$user->subscription()->pauseNowUntil(now()->addMonth());
```

구독을 일시중지했지만 아직 "유예 기간"에 있는지도 `onPausedGracePeriod` 메서드로 확인할 수 있습니다.

```php
if ($user->subscription()->onPausedGracePeriod()) {
    // ...
}
```

일시중지된 구독을 다시 활성화하려면, 구독에서 `resume` 메서드를 호출하면 됩니다.

```php
$user->subscription()->resume();
```

> [!WARNING]
> 구독이 일시중지된 상태에서는 어떠한 변경도 할 수 없습니다. 요금제 변경이나 수량 조정을 하려면 구독을 우선 재개해야 합니다.

<a name="canceling-subscriptions"></a>

### 구독 취소하기

구독을 취소하려면 사용자 객체의 `subscription` 메서드에서 `cancel` 메서드를 호출하면 됩니다.

```php
$user->subscription()->cancel();
```

구독이 취소되면, Cashier는 데이터베이스의 `ends_at` 컬럼을 자동으로 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 하는지를 판단하는 데 사용됩니다. 예를 들어, 어떤 사용자가 3월 1일에 구독을 취소했지만 해당 구독이 3월 5일까지 계속 사용 가능할 예정이었다면, `subscribed` 메서드는 3월 5일까지 계속 `true`를 반환합니다. 이는 사용자가 일반적으로 결제 주기가 끝날 때까지 애플리케이션을 계속 사용할 수 있도록 허용하는 방식입니다.

사용자가 구독은 취소했지만 아직 "유예 기간(grace period)" 내에 있는지 확인하려면 `onGracePeriod` 메서드를 사용합니다.

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

구독을 즉시 취소하고 싶을 때는 subscription의 `cancelNow` 메서드를 사용할 수 있습니다.

```php
$user->subscription()->cancelNow();
```

유예 기간 중인 구독의 취소를 철회하고 싶다면, `stopCancelation` 메서드를 호출합니다.

```php
$user->subscription()->stopCancelation();
```

> [!WARNING]
> Paddle의 구독은 취소 후 재개(resume)가 불가능합니다. 만약 사용자가 구독을 다시 사용하고자 한다면, 반드시 새 구독을 생성해야 합니다.

<a name="subscription-trials"></a>
## 구독 체험 기간

<a name="with-payment-method-up-front"></a>
### 결제 수단을 미리 받는 체험 기간

결제 수단 정보를 미리 수집하면서도 고객에게 체험 기간(Trial)을 제공하고 싶다면, Paddle 대시보드에서 사용자가 구독할 가격(Price)에 체험 기간을 설정해야 합니다. 그런 다음, 평소와 같이 체크아웃 세션을 시작할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

애플리케이션이 `subscription_created` 이벤트를 받으면, Cashier는 애플리케이션 데이터베이스 내의 구독 레코드에 체험 기간 종료일을 세팅하며, Paddle에도 해당 날짜 이후부터 청구가 시작되도록 전달합니다.

> [!WARNING]
> 사용자의 구독이 체험 종료일 이전에 취소되지 않으면, 체험이 끝나는 즉시 청구가 진행됩니다. 반드시 사용자에게 체험 종료일을 미리 알려주세요.

사용자가 현재 체험 기간 중인지 확인하려면, 사용자 인스턴스의 `onTrial` 메서드를 사용할 수 있습니다.

```php
if ($user->onTrial()) {
    // ...
}
```

이미 시작된 체험 기간이 만료되었는지 확인하려면 `hasExpiredTrial` 메서드를 사용할 수 있습니다.

```php
if ($user->hasExpiredTrial()) {
    // ...
}
```

특정 구독 종류에 대해 사용자가 체험 중인지, 또는 만료되었는지 확인하려면 `onTrial`이나 `hasExpiredTrial` 메서드에 구독 타입을 인자로 전달하면 됩니다.

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->hasExpiredTrial('default')) {
    // ...
}
```

<a name="without-payment-method-up-front"></a>
### 결제 수단 없는 체험 기간

결제 수단 정보를 미리 받지 않고 체험 기간을 제공하려면, 사용자에 연결된 고객 레코드의 `trial_ends_at` 컬럼에 원하는 체험 종료일을 지정하면 됩니다. 일반적으로 회원가입 시 이 작업을 처리합니다.

```php
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->addDays(10)
]);
```

Cashier는 이런 종류의 체험 기간을 "일반 체험(generic trial)"이라고 부릅니다. 이는 실제 구독에 종속되지 않은 체험 기간이라는 의미입니다. `User` 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at` 이전이면 `true`를 반환합니다.

```php
if ($user->onTrial()) {
    // 사용자는 현재 체험 기간 내에 있습니다...
}
```

사용자에게 실제 구독을 생성할 준비가 되었다면, 평소처럼 `subscribe` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

사용자의 체험 종료일을 확인하고 싶다면 `trialEndsAt` 메서드를 사용하면 됩니다. 이 메서드는 사용자가 체험 중이면 Carbon 날짜 인스턴스를, 아니라면 `null`을 반환합니다. 또한 기본 구독이 아닌 특정 구독 유형의 체험 종료일을 얻으려면 선택적으로 구독 타입도 인자로 전달할 수 있습니다.

```php
if ($user->onTrial('default')) {
    $trialEndsAt = $user->trialEndsAt();
}
```

특히 사용자가 아직 실제 구독을 만들지 않은 "일반 체험" 상태인지 확인하려면, `onGenericTrial` 메서드를 사용할 수 있습니다.

```php
if ($user->onGenericTrial()) {
    // 사용자는 아직 "일반 체험" 상태입니다...
}
```

<a name="extend-or-activate-a-trial"></a>
### 체험 기간 연장 또는 즉시 활성화

기존 구독의 체험 기간을 연장하려면 `extendTrial` 메서드를 호출하고, 체험 기간이 끝나야 할 시점을 인자로 전달합니다.

```php
$user->subscription()->extendTrial(now()->addDays(5));
```

반대로, 구독의 체험 기간을 즉시 종료하고 구독을 바로 활성화하고 싶을 때는, subscription 객체에 `activate` 메서드를 호출하면 됩니다.

```php
$user->subscription()->activate();
```

<a name="handling-paddle-webhooks"></a>
## Paddle 웹훅(Webhook) 처리

Paddle은 다양한 이벤트를 웹훅을 통해 애플리케이션에 통지할 수 있습니다. Cashier 서비스 프로바이더에서는 기본적으로 Cashier의 웹훅 컨트롤러로 연결되는 라우트가 자동 등록됩니다. 이 컨트롤러가 모든 웹훅 요청을 처리합니다.

이 컨트롤러는 자동으로 결제 실패가 누적된 구독 취소, 구독 변경, 결제 수단 변경 등의 이벤트를 처리합니다. 하지만 필요하다면 이 컨트롤러를 확장하여 어떠한 Paddle 웹훅 이벤트도 직접 처리할 수 있습니다.

애플리케이션이 Paddle 웹훅을 제대로 처리하려면, 반드시 [Paddle 관리 패널에서 웹훅 URL을 설정](https://vendors.paddle.com/alerts-webhooks)해야 합니다. 기본적으로 Cashier 웹훅 컨트롤러는 `/paddle/webhook` URL 경로로 요청을 처리합니다. Paddle 관리 패널에서 활성화해야 할 웹훅 목록은 다음과 같습니다.

- Customer Updated
- Transaction Completed
- Transaction Updated
- Subscription Created
- Subscription Updated
- Subscription Paused
- Subscription Canceled

> [!WARNING]
> Cashier에 내장된 [웹훅 서명 검증](/docs/12.x/cashier-paddle#verifying-webhook-signatures) 미들웨어로 들어오는 요청을 반드시 보호해야 합니다.

<a name="webhooks-csrf-protection"></a>
#### 웹훅과 CSRF 보호

Paddle 웹훅이 라라벨의 [CSRF 보호](/docs/12.x/csrf)를 우회해야 하므로, Paddle 웹훅에 대해 Laravel이 CSRF 토큰을 확인하지 않게 설정해야 합니다. 이를 위해, 애플리케이션의 `bootstrap/app.php` 파일에서 `paddle/*`을 CSRF 예외 처리 대상에 추가해야 합니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'paddle/*',
    ]);
})
```

<a name="webhooks-local-development"></a>
#### 웹훅과 로컬 개발 환경

로컬 개발 환경에서 Paddle이 애플리케이션으로 웹훅을 전송할 수 있도록 하려면, [Ngrok](https://ngrok.com/)이나 [Expose](https://expose.dev/docs/introduction)와 같은 사이트 공유 서비스를 이용해 애플리케이션을 외부에 노출해야 합니다. 만약 [Laravel Sail](/docs/12.x/sail)로 개발 중이라면, Sail에서 제공하는 [사이트 공유 명령어](/docs/12.x/sail#sharing-your-site)를 사용할 수 있습니다.

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의

Cashier는 결제 실패에 따른 구독 취소 등 주요 Paddle 웹훅을 자동으로 처리합니다. 그러나 추가로 직접 처리하고 싶은 웹훅 이벤트가 있다면, Cashier가 발행하는 다음 이벤트를 리스닝하면 됩니다.

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

이 이벤트들은 Paddle 웹훅의 전체 페이로드를 포함하고 있습니다. 예를 들어, `transaction.billed` 웹훅을 별도로 처리하고자 할 때 [리스너](/docs/12.x/events#defining-listeners)를 등록할 수 있습니다.

```php
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * 받은 Paddle 웹훅 처리.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['event_type'] === 'transaction.billed') {
            // 이벤트 처리 코드...
        }
    }
}
```

Cashier는 수신된 웹훅의 종류에 따라 더 구체적인 이벤트도 발행합니다. 여기에는 Paddle의 전체 페이로드 뿐만 아니라, 영수증, billable 모델, subscription 등 웹훅 처리에 사용된 관련 모델도 포함되어 있습니다.

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\CustomerUpdated`
- `Laravel\Paddle\Events\TransactionCompleted`
- `Laravel\Paddle\Events\TransactionUpdated`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionPaused`
- `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

기본으로 제공되는 웹훅 라우트를 변경하려면, `.env` 파일의 `CASHIER_WEBHOOK` 환경 변수에 전체 웹훅 엔드포인트 URL을 지정하면 됩니다. 이 값은 Paddle 관리 패널에 입력한 URL과 동일해야 합니다.

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### 웹훅 서명 검증

웹훅의 보안을 위해 [Paddle의 웹훅 서명](https://developer.paddle.com/webhook-reference/verifying-webhooks)을 사용할 수 있습니다. Cashier에는 Paddle에서 전달된 웹훅 요청이 유효한지 확인하는 미들웨어가 기본적으로 포함되어 있습니다.

서명 검증을 활성화하려면, `.env` 파일에서 `PADDLE_WEBHOOK_SECRET` 환경 변수를 반드시 설정해야 합니다. 이 비밀 키는 Paddle 계정 대시보드에서 확인할 수 있습니다.

<a name="single-charges"></a>
## 단일 결제

<a name="charging-for-products"></a>
### 상품에 대한 결제

구매자가 상품 결제를 진행하도록 하려면, billable 모델 인스턴스에서 `checkout` 메서드를 사용해 해당 결제에 대한 체크아웃 세션을 생성할 수 있습니다. `checkout` 메서드는 하나 혹은 여러 개의 가격 ID를 받을 수 있고, 필요하다면 상품 수량 정보를 가진 연관 배열 형태로도 전달할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

    return view('buy', ['checkout' => $checkout]);
});
```

체크아웃 세션을 생성한 후에는 Cashier에서 제공하는 `paddle-button` [Blade 컴포넌트](#overlay-checkout)를 활용해서 사용자가 Paddle 결제 위젯을 통해 결제를 완료하도록 할 수 있습니다.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

체크아웃 세션에는 `customData` 메서드가 있어서 원하는 커스텀 데이터를 Paddle 트랜잭션 생성에 전달할 수 있습니다. 커스텀 데이터 전달 방식에 관한 추가 옵션은 [Paddle 공식 문서](https://developer.paddle.com/build/transactions/custom-data)를 참고하세요.

```php
$checkout = $user->checkout('pri_tshirt')
    ->customData([
        'custom_option' => $value,
    ]);
```

<a name="refunding-transactions"></a>
### 거래 환불하기

트랜잭션을 환불하면, 환불 금액이 구매 당시 사용한 결제 수단으로 반환됩니다. Paddle 구매를 환불하려면, `Cashier\Paddle\Transaction` 모델의 `refund` 메서드를 사용하면 됩니다. 이 메서드는 첫 번째 인수로 환불 사유를 받고, 추가적으로 환불할 가격 ID 리스트 및 각 금액 정보를 연관 배열로 전달할 수 있습니다. 특정 billable 모델의 트랜잭션은 `transactions` 메서드로 조회할 수 있습니다.

예를 들어, 어떤 거래에서 `pri_123`은 전액 환불하고, `pri_456`은 2달러만 환불한다고 가정해봅니다.

```php
use App\Models\User;

$user = User::find(1);

$transaction = $user->transactions()->first();

$response = $transaction->refund('Accidental charge', [
    'pri_123', // 이 가격은 전액 환불...
    'pri_456' => 200, // 이 가격은 부분 환불(200 단위로)...
]);
```

위 예제는 트랜잭션의 특정 품목만 선택적으로 환불하는 방법입니다. 전체 트랜잭션을 모두 환불하려면 환불 사유만 전달하면 됩니다.

```php
$response = $transaction->refund('Accidental charge');
```

환불과 관련된 더 많은 정보는 [Paddle 환불 관련 공식 문서](https://developer.paddle.com/build/transactions/create-transaction-adjustments)를 참고해주세요.

> [!WARNING]
> 환불은 반드시 Paddle의 승인을 거쳐야 최종적으로 처리됩니다.

<a name="crediting-transactions"></a>
### 거래 금액 크레딧하기

환불과 비슷하게, 거래에 대해 크레딧도 적용할 수 있습니다. 트랜잭션 크레딧은 해당 금액을 고객의 잔액(balance)으로 지급하여, 추후 구매에 사용할 수 있게 해주는 방식입니다. 단, 크레딧은 수동 결제(manually-collected) 거래에만 적용할 수 있습니다. 자동 결제(예: 구독)에는 직접 적용할 수 없으며 구독 크레딧은 Paddle이 자동으로 처리합니다.

```php
$transaction = $user->transactions()->first();

// 특정 품목에 대해 전액 크레딧 지급...
$response = $transaction->credit('Compensation', 'pri_123');
```

자세한 내용은 [Paddle의 거래 크레딧 공식 문서](https://developer.paddle.com/build/transactions/create-transaction-adjustments)를 참고하세요.

> [!WARNING]
> 크레딧은 반드시 수동 결제 트랜잭션에서만 가능합니다. 자동 결제 거래(예: 구독)는 Paddle에서 자체적으로 처리됩니다.

<a name="transactions"></a>
## 거래 내역(Transactions)

다양한 billable 모델의 트랜잭션 배열은 `transactions` 프로퍼티로 쉽게 조회할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$transactions = $user->transactions;
```

트랜잭션은 상품 및 구매에 대한 결제 내역을 의미하며, 각 트랜잭션에는 인보이스도 함께 저장됩니다. 오직 완료(completed)된 트랜잭션만 애플리케이션 데이터베이스에 저장됩니다.

고객의 거래 내역을 리스트업할 때, 트랜잭션 인스턴스의 메서드를 활용하여 다양한 결제 정보를 표시할 수 있습니다. 예를 들어, 모든 트랜잭션을 표로 나열하고 각 인보이스 다운로드 링크도 제공할 수 있습니다.

```html
<table>
    @foreach ($transactions as $transaction)
        <tr>
            <td>{{ $transaction->billed_at->toFormattedDateString() }}</td>
            <td>{{ $transaction->total() }}</td>
            <td>{{ $transaction->tax() }}</td>
            <td><a href="{{ route('download-invoice', $transaction->id) }}" target="_blank">Download</a></td>
        </tr>
    @endforeach
</table>
```

`download-invoice` 라우트는 다음처럼 구현할 수 있습니다.

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Transaction;

Route::get('/download-invoice/{transaction}', function (Request $request, Transaction $transaction) {
    return $transaction->redirectToInvoicePdf();
})->name('download-invoice');
```

<a name="past-and-upcoming-payments"></a>
### 이전 및 예정 결제 정보

구독과 관련된 고객의 과거 결제 또는 다음 결제 정보를 조회·표시하려면 `lastPayment`와 `nextPayment` 메서드를 사용할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription();

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

이 두 메서드는 모두 `Laravel\Paddle\Payment` 인스턴스를 반환합니다. 단, 트랜잭션이 아직 웹훅을 통해 동기화되지 않았을 때는 `lastPayment`가 `null`을, 결제 주기가 끝난(구독이 취소된 등) 경우에는 `nextPayment`가 `null`을 반환합니다.

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="testing"></a>
## 테스트

빌링 플로우가 예상대로 동작하는지 항상 직접 수작업 테스트를 진행해야 합니다.

또한, CI 환경 등에서 자동화된 테스트를 실행할 때에는 [Laravel HTTP 클라이언트의 테스트 기능](/docs/12.x/http-client#testing)을 활용해 Paddle로 전송하는 HTTP 요청을 반드시 모의(faking)해야 합니다. 이렇게 하면 실제로 Paddle API를 호출하지 않고도 애플리케이션이 정상적으로 작동하는지 시험할 수 있습니다.