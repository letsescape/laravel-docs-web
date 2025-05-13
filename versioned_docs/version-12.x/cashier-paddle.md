# 라라벨 Cashier (Paddle)

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
    - [Paddle 샌드박스](#paddle-sandbox)
- [환경설정](#configuration)
    - [Billable 모델](#billable-model)
    - [API 키](#api-keys)
    - [Paddle JS](#paddle-js)
    - [통화 설정](#currency-configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [빠른 시작](#quickstart)
    - [제품 판매하기](#quickstart-selling-products)
    - [구독 상품 판매하기](#quickstart-selling-subscriptions)
- [체크아웃 세션](#checkout-sessions)
    - [오버레이 체크아웃](#overlay-checkout)
    - [인라인 체크아웃](#inline-checkout)
    - [비회원 체크아웃](#guest-checkouts)
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
    - [구독 단일 결제](#subscription-single-charges)
    - [결제 정보 업데이트](#updating-payment-information)
    - [플랜 변경](#changing-plans)
    - [구독 수량](#subscription-quantity)
    - [여러 상품의 구독](#subscriptions-with-multiple-products)
    - [여러 구독](#multiple-subscriptions)
    - [구독 일시중지](#pausing-subscriptions)
    - [구독 취소](#canceling-subscriptions)
- [구독 체험 기간](#subscription-trials)
    - [선결제 방식 체험](#with-payment-method-up-front)
    - [비선결제 방식 체험](#without-payment-method-up-front)
    - [체험 기간 연장 또는 활성화](#extend-or-activate-a-trial)
- [Paddle 웹훅 처리](#handling-paddle-webhooks)
    - [웹훅 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [웹훅 서명 검증](#verifying-webhook-signatures)
- [단일 결제](#single-charges)
    - [제품 결제 처리](#charging-for-products)
    - [거래 환불](#refunding-transactions)
    - [거래 크레딧 지급](#crediting-transactions)
- [거래 내역](#transactions)
    - [과거 및 예정 결제 내역](#past-and-upcoming-payments)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

> [!WARNING]
> 본 문서는 Cashier Paddle 2.x의 Paddle Billing 연동에 관한 문서입니다. 만약 아직 Paddle Classic을 사용 중이라면 [Cashier Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x) 문서를 참고해야 합니다.

[Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)은 [Paddle](https://paddle.com)의 구독 결제 서비스를 쉽고 유연하게 연동할 수 있도록 해주는 도구입니다. 구독 결제 시스템 개발 시 반복적으로 작성하게 되는 보일러플레이트 코드 대부분을 Cashier가 대신 처리해줍니다. 기본 구독 관리 외에도 Cashier는 구독 플랜 교체, 구독 "수량", 구독 일시중지, 취소 유예 기간 등 다양한 기능도 지원합니다.

Cashier Paddle을 본격적으로 사용하기 전에, Paddle의 [개념 가이드](https://developer.paddle.com/concepts/overview)와 [API 문서](https://developer.paddle.com/api-reference/overview)도 함께 참고하시기 바랍니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier의 새 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md)를 꼭 꼼꼼히 확인하시기 바랍니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 사용하여 Paddle 전용 Cashier 패키지를 설치합니다.

```shell
composer require laravel/cashier-paddle
```

다음으로, `vendor:publish` 아티즌 명령어를 사용해 Cashier 마이그레이션 파일을 발행합니다.

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

이제 애플리케이션의 데이터베이스 마이그레이션을 실행해야 합니다. Cashier 마이그레이션은 새로운 `customers` 테이블을 생성합니다. 또한, 모든 고객의 구독 정보 관리를 위해 `subscriptions` 및 `subscription_items` 테이블도 생성됩니다. 마지막으로, 고객과 연결된 Paddle 거래 내역을 저장하는 `transactions` 테이블도 함께 만들어집니다.

```shell
php artisan migrate
```

> [!WARNING]
> Cashier가 모든 Paddle 이벤트를 제대로 처리할 수 있도록, 반드시 [Cashier 웹훅 처리 설정](#handling-paddle-webhooks)을 완료해야 합니다.

<a name="paddle-sandbox"></a>
### Paddle 샌드박스

로컬 또는 스테이징 개발 환경에서는 [Paddle Sandbox 계정](https://sandbox-login.paddle.com/signup)을 등록하여 사용해야 합니다. 샌드박스 환경은 실제 결제 없이, 결제 및 멤버십 관련 기능을 안전하게 테스트하고 개발할 수 있게 해줍니다. 다양한 결제 시나리오를 시험하려면 Paddle에서 제공하는 [테스트용 카드 번호](https://developer.paddle.com/concepts/payment-methods/credit-debit-card)도 사용할 수 있습니다.

샌드박스 환경을 사용할 때는 애플리케이션의 `.env` 파일에 `PADDLE_SANDBOX` 환경 변수를 `true`로 설정해야 합니다.

```ini
PADDLE_SANDBOX=true
```

개발이 완료된 후에는 [Paddle 벤더 계정](https://paddle.com)에 신청하여 실제 결제 환경을 개설해야 합니다. 프로덕션에 배포하기 전에, Paddle 측에서 애플리케이션의 도메인을 승인하는 과정이 필요합니다.

<a name="configuration"></a>
## 환경설정

<a name="billable-model"></a>
### Billable 모델

Cashier를 사용하려면, 먼저 `Billable` 트레이트를 사용자 모델에 추가해야 합니다. 이 트레이트는 구독 생성, 결제 방법 정보 갱신 등 일반적인 결제 관련 작업을 위한 여러 메서드를 제공합니다.

```php
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

만약 유저가 아닌 다른 엔터티(예: 조직, 팀 등)도 결제 기능이 필요하다면 해당 클래스에도 이 트레이트를 추가할 수 있습니다.

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

이제 Paddle API 키를 `.env` 파일에 설정해야 합니다. Paddle API 키는 Paddle 관리 콘솔에서 발급받을 수 있습니다.

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

`PADDLE_SANDBOX` 환경 변수는 [Paddle 샌드박스 환경](#paddle-sandbox)을 사용할 때에는 `true`로, 프로덕션(실서비스) 환경에서 Paddle의 실제 벤더 계정을 쓸 때에는 `false`로 설정해야 합니다.

`PADDLE_RETAIN_KEY`는 선택 사항이며, [Retain](https://developer.paddle.com/paddlejs/retain) 기능을 사용하는 경우에만 설정하면 됩니다.

<a name="paddle-js"></a>
### Paddle JS

Paddle 체크아웃 위젯을 실행하려면 자체 제공하는 자바스크립트 라이브러리를 로드해야 합니다. 이 라이브러리는 애플리케이션 레이아웃의 `</head>` 태그 바로 위에 `@paddleJS` Blade 지시어를 추가하여 쉽게 불러올 수 있습니다.

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### 통화 설정

인보이스에 표시되는 금액을 지정한 로케일에 맞게 포맷하고 싶을 때는, 환경 변수로 로케일을 지정할 수 있습니다. Cashier는 내부적으로 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 활용해 통화 포맷을 처리합니다.

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> `en` 외의 로케일을 사용하려면 PHP 확장 모듈인 `ext-intl`이 서버에 설치 및 설정되어 있어야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Cashier가 내부적으로 사용하는 모델을 확장하여 사용자 정의 모델을 사용할 수 있습니다. 이를 위해 Cashier의 해당 모델을 상속받아 직접 모델을 구현하면 됩니다.

```php
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 뒤에는, `Laravel\Paddle\Cashier` 클래스를 통해 Cashier에 사용자 정의 모델을 사용하도록 지정해야 합니다. 일반적으로 이 설정은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 수행합니다.

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
### 제품 판매하기

> [!NOTE]
> Paddle Checkout을 사용하기 전에, 반드시 Paddle 대시보드에서 고정 가격이 지정된 상품(Products)을 등록해야 합니다. 그리고 [Paddle 웹훅 처리](#handling-paddle-webhooks) 설정도 해주셔야 합니다.

애플리케이션에서 상품 및 구독 결제 기능을 제공하려면 복잡해 보일 수 있습니다. 하지만 Cashier와 [Paddle의 Checkout Overlay](https://www.paddle.com/billing/checkout) 덕분에, 모던하고 견고한 결제 연동 기능을 간편하게 구축할 수 있습니다.

일회성(비구독) 상품을 결제 처리할 때는, Cashier를 통해 Paddle의 Checkout Overlay를 띄워 고객이 결제 정보를 입력하고 구매를 확정하도록 합니다. 결제가 정상적으로 완료되면, 사용자가 지정해둔 성공(완료) 페이지로 리다이렉트됩니다.

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout('pri_deluxe_album')
        ->returnTo(route('dashboard'));

    return view('buy', ['checkout' => $checkout]);
})->name('checkout');
```

위 예시처럼 Cashier의 `checkout` 메서드를 사용해, 특정 "가격 식별자(price identifier)"에 대응하는 Paddle Checkout Overlay를 생성합니다. Paddle에서 "prices"란 [개별 상품에 지정된 가격 정보](https://developer.paddle.com/build/products/create-products-prices)를 뜻합니다.

필요하다면 `checkout` 메서드는 Paddle 고객 계정을 자동으로 생성하고, 해당 Paddle 고객 정보를 내 애플리케이션의 사용자와 연결해줍니다. 사용자가 체크아웃을 마치면, 설정해둔 성공 페이지로 이동하여 결제 완료 메시지 등 안내를 보여줄 수 있습니다.

`buy` 뷰에서는 Checkout Overlay를 띄우는 버튼을 추가해야 합니다. Cashier Paddle에는 `paddle-button` Blade 컴포넌트가 기본 제공되지만, [Overlay 체크아웃을 직접 렌더링](#manually-rendering-an-overlay-checkout)할 수도 있습니다.

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a name="providing-meta-data-to-paddle-checkout"></a>
#### Paddle Checkout에 메타데이터 제공하기

상품을 판매할 때, 완료된 주문과 구매한 상품 정보를 관리하기 위해 자체적으로 `Cart` 및 `Order` 모델을 운용하는 것이 일반적입니다. 고객을 Paddle Checkout Overlay를 통해 결제 페이지로 리다이렉트할 때, 결제 완료 후 맞는 주문과 연결하려면 주문 식별자 등 정보를 전달해야 할 수 있습니다.

이를 위해 `checkout` 메서드에 커스텀 데이터 배열을 전달할 수 있습니다. 예를 들어, 사용자가 결제 과정을 시작하면 미완료 상태의 `Order` 객체가 생성되었다고 가정해보겠습니다. (`Cart`와 `Order` 모델은 예시일 뿐 Cashier에서 직접 제공하는 것은 아닙니다. 각자의 비즈니스 요구에 맞게 구현하시면 됩니다.)

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

위와 같이, 사용자가 결제를 시작하면 담긴 카트/주문의 Paddle 가격 식별자 전체를 `checkout` 메서드에 전달합니다. 이러한 아이템 관리(장바구니 및 주문 연동)는 사용자의 시나리오에 맞게 직접 구현하셔야 합니다. 또한, `customData` 메서드를 활용해 Paddle Checkout Overlay로 주문의 ID도 함께 전달할 수 있습니다.

물론 결제 완료 후 주문을 "complete" 상태로 변경해야 합니다. 이 작업은 Paddle에서 전송하는 웹훅을 Cashier가 받아 이벤트로 발생시킬 때 후처리 함수를 통해 주문 정보를 업데이트하는 방식으로 처리할 수 있습니다.

먼저, Cashier가 발생시키는 `TransactionCompleted` 이벤트를 수신하면 됩니다. 일반적으로 이 이벤트 리스너는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 등록합니다.

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

`CompleteOrder` 리스너는 아래와 같이 구현될 수 있습니다.

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

`transaction.completed` 이벤트에 포함되는 데이터 등에 대한 자세한 내용은 [Paddle 공식 문서](https://developer.paddle.com/webhooks/transactions/transaction-completed)를 참조하세요.

<a name="quickstart-selling-subscriptions"></a>
### 구독 상품 판매하기

> [!NOTE]
> Paddle Checkout을 사용하기 전에, 반드시 Paddle 대시보드에서 고정 가격이 지정된 상품(Products)을 등록해야 합니다. 그리고 [Paddle 웹훅 처리](#handling-paddle-webhooks) 설정도 해주셔야 합니다.

애플리케이션에서 상품 및 구독 결제 기능을 제공하려면 복잡해 보일 수 있습니다. 하지만 Cashier와 [Paddle의 Checkout Overlay](https://www.paddle.com/billing/checkout) 덕분에, 모던하고 견고한 결제 연동 기능을 간편하게 구축할 수 있습니다.

Cashier와 Paddle Checkout Overlay를 활용한 구독 판매 예제를 살펴보겠습니다. 가령, 월간(`price_basic_monthly`) 및 연간(`price_basic_yearly`) 플랜이 있는 기본 구독 상품(예: `pro_basic`)과, 전문가용 플랜(예: `pro_expert`)이 있다고 가정할 수 있습니다.

먼저, 고객이 구독을 시작하는 과정을 살펴보겠습니다. 예를 들어, 애플리케이션의 요금제 페이지에서 "구독하기" 버튼을 클릭하면, Paddle Checkout Overlay가 뜨고 사용자가 원하는 요금제를 구독할 수 있습니다. 아래는 `checkout` 메서드로 체크아웃 세션을 시작하는 예시입니다.

```php
use Illuminate\Http\Request;

Route::get('/subscribe', function (Request $request) {
    $checkout = $request->user()->checkout('price_basic_monthly')
        ->returnTo(route('dashboard'));

    return view('subscribe', ['checkout' => $checkout]);
})->name('subscribe');
```

`subscribe` 뷰에서는 Checkout Overlay를 띄우는 버튼을 추가합니다. Cashier Paddle에서는 `paddle-button` Blade 컴포넌트가 기본 제공되며, [Overlay 체크아웃을 직접 렌더링](#manually-rendering-an-overlay-checkout)할 수도 있습니다.

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

이제 사용자가 Subscribe 버튼을 클릭하면 결제 정보를 입력하고 구독을 시작할 수 있습니다. 일부 결제 수단의 경우 결제가 실제로 승인되려면 시간이 조금 소요될 수 있으니, 구독이 실제 활성화되는 시점을 정확히 판단하려면 [Cashier의 웹훅 처리](#handling-paddle-webhooks)도 반드시 설정해야 합니다.

고객이 구독을 시작한 이후에는, 구독 중인 사용자만 접근 가능한 애플리케이션 메뉴나 화면 등을 제한해야 할 수 있습니다. Cashier의 `Billable` 트레이트가 제공하는 `subscribed` 메서드로 현재 사용자의 구독 여부를 쉽게 확인할 수 있습니다.

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

특정 상품이나 가격에 대해 구독 중인지도 간단히 체크할 수 있습니다.

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### 구독 사용자 미들웨어 만들기

편의상, 들어오는 요청의 사용자가 구독 중인지 판단하는 [미들웨어](/docs/middleware)를 만들어 사용할 수도 있습니다. 이 미들웨어를 라우트에 할당하면, 구독하지 않은 사용자가 해당 라우트에 접근하지 못하도록 제어할 수 있습니다.

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
            // 결제 안내 페이지로 리다이렉트하고, 구독하라고 안내...
            return redirect('/subscribe');
        }

        return $next($request);
    }
}
```

미들웨어를 정의한 후에는, 라우트에 쉽게 할당할 수 있습니다.

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### 고객이 직접 결제 플랜을 관리할 수 있도록 하기

물론 고객이 현재의 구독 상품이나 "등급"을 변경하고 싶어 하는 경우가 많습니다. 예시처럼, 월간 구독을 연간 구독으로 바꿀 수 있도록 변경 버튼이 있는 라우트를 구현할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::put('/subscription/{price}/swap', function (Request $request, $price) {
    $user->subscription()->swap($price); // "$price"는 예를 들면 "price_basic_yearly"가 될 수 있습니다.

    return redirect()->route('dashboard');
})->name('subscription.swap');
```

플랜 교체 외에도, 구독 해지 역시 사용자가 직접 할 수 있어야 합니다. 플랜 변경과 마찬가지로 버튼 등을 통해 아래와 같이 라우트를 연동할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::put('/subscription/cancel', function (Request $request, $price) {
    $user->subscription()->cancel();

    return redirect()->route('dashboard');
})->name('subscription.cancel');
```

이렇게 하면, 현재 결제 주기 마지막에 구독이 자동으로 해지됩니다.

> [!NOTE]
> Cashier 웹훅 처리가 정상적으로 설정되어 있다면, Paddle에서 발생하는 모든 구독 변경 이벤트가 Cashier 관련 데이터베이스 테이블과 자동으로 동기화됩니다. 예를 들어 Paddle 대시보드에서 고객의 구독을 취소하면, 해당 웹훅을 받아 Cashier가 해당 구독을 DB상에서도 "취소됨"으로 표기합니다.

<a name="checkout-sessions"></a>
## 체크아웃 세션

대부분의 결제 관련 작업은 Paddle의 [Checkout Overlay 위젯](https://developer.paddle.com/build/checkout/build-overlay-checkout)이나 [인라인 체크아웃](https://developer.paddle.com/build/checkout/build-branded-inline-checkout)을 이용해 "체크아웃"을 기반으로 처리합니다.

Paddle을 이용해 체크아웃 결제를 처리하기 전에, 반드시 애플리케이션에 사용할 [기본 결제 링크](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link)를 Paddle 체크아웃 설정 대시보드에 등록해야 합니다.

<a name="overlay-checkout"></a>
### 오버레이 체크아웃

Checkout Overlay 위젯을 띄우기 전에, Cashier를 통해 체크아웃 세션을 먼저 생성해야 합니다. 이 체크아웃 세션은 결제 위젯이 어떤 결제 작업을 수행해야 하는지 알려주는 역할을 합니다.

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Cashier는 `paddle-button` [Blade 컴포넌트](/docs/blade#components)를 내장하고 있습니다. 체크아웃 세션을 "prop"으로 전달한 후, 버튼을 클릭하면 Paddle의 체크아웃 위젯이 표시됩니다.

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

기본적으로 Paddle의 기본 스타일이 적용된 위젯이 표시됩니다. 원하는 경우, [Paddle에서 지원하는 속성](https://developer.paddle.com/paddlejs/html-data-attributes) 예를 들어 `data-theme='light'` 와 같은 속성을 컴포넌트에 추가해 스타일을 커스터마이징할 수도 있습니다.

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

Paddle 체크아웃 위젯은 비동기로 처리됩니다. 사용자가 위젯에서 구독을 생성하면, Paddle이 웹훅을 통해 애플리케이션에 결제 정보를 알려주고, 이를 기반으로 DB 내 구독 정보를 갱신하게 됩니다. 따라서 Paddle의 상태 변화를 반영할 수 있도록 [웹훅 설정](#handling-paddle-webhooks)을 올바르게 해주는 것이 매우 중요합니다.

> [!WARNING]
> 구독 상태 변경 후 해당 웹훅을 수신하는 데는 보통 짧은 시간이 소요되지만, 사용자 경험을 고려해 결제 직후 바로 구독 상태가 적용되지 않을 수 있다는 점을 감안해야 합니다.

<a name="manually-rendering-an-overlay-checkout"></a>
#### 오버레이 체크아웃 직접 렌더링하기

라라벨의 기본 Blade 컴포넌트를 사용하지 않고, 직접 Overlay 체크아웃을 구현할 수도 있습니다. 먼저, [위 예시와 같이](#overlay-checkout) 체크아웃 세션을 생성합니다.

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

그 다음, Paddle.js를 사용해 체크아웃을 초기화할 수 있습니다. 아래 예제는 `paddle_button` 클래스를 가진 링크를 만들고, 이 링크가 클릭되면 Paddle.js가 Overlay 체크아웃을 띄워주는 방식입니다.

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

Paddle의 "오버레이" 스타일 체크아웃을 원하지 않는 경우, Paddle은 체크아웃 위젯을 페이지 내에 직접 표시하는 "인라인" 옵션도 제공합니다. 이 방식은 체크아웃 폼의 HTML 필드를 조정할 수는 없지만, 애플리케이션 내부에 위젯을 임베드할 수 있다는 장점이 있습니다.

Cashier는 인라인 체크아웃을 손쉽게 구현할 수 있도록 `paddle-checkout` Blade 컴포넌트를 제공합니다. 우선, [위 예시처럼](#overlay-checkout) 체크아웃 세션을 생성하세요.

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

그 후, 컴포넌트의 `checkout` 속성에 체크아웃 세션을 전달하여 렌더링합니다.

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

인라인 체크아웃 컴포넌트의 높이를 조정하려면 `height` 속성을 추가로 지정할 수 있습니다.

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

인라인 체크아웃의 커스터마이징 옵션 등 자세한 사용법은 Paddle의 [Inline Checkout 가이드](https://developer.paddle.com/build/checkout/build-branded-inline-checkout)와 [체크아웃 설정 문서](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings)를 참고하세요.

<a name="manually-rendering-an-inline-checkout"></a>
#### 인라인 체크아웃 직접 렌더링하기

라라벨의 기본 Blade 컴포넌트 대신 직접 인라인 체크아웃을 구현할 수도 있습니다. 먼저, [위 예시처럼](#inline-checkout) 체크아웃 세션을 생성하세요.

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

그 다음, Paddle.js를 활용해 직접 체크아웃을 초기화할 수 있습니다. 여기서는 [Alpine.js](https://github.com/alpinejs/alpine)를 활용한 예시를 보여드리지만, 본인의 프론트엔드 구조에 맞게 얼마든지 변경하셔도 됩니다.

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

### 비회원 결제

애플리케이션에 계정이 필요 없는 사용자에게 체크아웃 세션을 생성해야 할 때가 있습니다. 이럴 때는 `guest` 메서드를 사용하면 됩니다.

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Checkout;

Route::get('/buy', function (Request $request) {
    $checkout = Checkout::guest(['pri_34567'])
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

이렇게 생성한 체크아웃 세션은 [Paddle 버튼](#overlay-checkout) 또는 [인라인 체크아웃](#inline-checkout) Blade 컴포넌트에 전달해서 사용할 수 있습니다.

<a name="price-previews"></a>
## 가격 미리보기

Paddle에서는 통화별로 가격을 맞춤 설정할 수 있어 여러 국가에 대해 서로 다른 가격을 지정할 수 있습니다. Cashier Paddle은 `previewPrices` 메서드를 통해 이러한 모든 가격 정보를 조회할 수 있습니다. 이 메서드는 조회하고자 하는 가격 ID 목록을 인수로 받습니다.

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

통화 정보는 요청한 사용자의 IP 주소를 기반으로 자동 결정됩니다. 하지만 필요하다면 특정 국가의 가격을 지정해서 조회할 수도 있습니다.

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
    'country_code' => 'BE',
    'postal_code' => '1234',
]]);
```

가격 정보를 받아온 후에는 원하는 방식으로 가격을 표시할 수 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

또한, 합계(subtotal) 금액과 세금 금액을 각각 따로 보여줄 수도 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

자세한 내용은 [Paddle의 가격 미리보기 API 문서](https://developer.paddle.com/api-reference/pricing-preview/preview-prices)를 참고하십시오.

<a name="customer-price-previews"></a>
### 고객 기준 가격 미리보기

이미 고객이 된 사용자가 있고, 그 사용자에게 적용될 가격을 보여주고 싶다면 고객 인스턴스에서 직접 가격을 조회할 수 있습니다.

```php
use App\Models\User;

$prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

내부적으로 Cashier는 사용자의 고객 ID를 사용해 해당 통화로 가격을 가져옵니다. 예를 들어, 미국에 거주하는 사용자는 미국 달러(USD)로 가격을, 벨기에 사용자는 유로(EUR)로 가격을 보게 됩니다. 만약 해당 통화에 맞는 가격이 없다면, 제품의 기본 통화가 사용됩니다. 모든 제품이나 구독 플랜의 가격은 Paddle 관리 패널에서 직접 설정할 수 있습니다.

<a name="price-discounts"></a>
### 할인가 적용 가격 미리보기

할인 적용 후의 가격을 표시할 수도 있습니다. `previewPrices` 메서드를 호출할 때 `discount_id` 옵션으로 할인 ID를 전달하면 됩니다.

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
    'discount_id' => 'dsc_123'
]);
```

이후 할인이 적용된 가격 정보를 출력하면 됩니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

<a name="customers"></a>
## 고객

<a name="customer-defaults"></a>
### 고객 기본값

Cashier에서는 체크아웃 세션을 생성할 때 고객에 대해 유용한 기본값을 정의할 수 있습니다. 이런 기본값을 설정해두면 고객의 이메일 주소와 이름이 미리 채워져, 고객이 곧바로 결제 단계로 이동할 수 있게 됩니다. 아래와 같이 과금(billable) 모델에서 관련 메서드를 오버라이드해 기본값을 지정할 수 있습니다.

```php
/**
 * Paddle에 연동할 고객 이름을 반환합니다.
 */
public function paddleName(): string|null
{
    return $this->name;
}

/**
 * Paddle에 연동할 고객 이메일 주소를 반환합니다.
 */
public function paddleEmail(): string|null
{
    return $this->email;
}
```

이렇게 지정한 기본값은 Cashier에서 [체크아웃 세션](#checkout-sessions)을 생성하는 모든 동작에 사용됩니다.

<a name="retrieving-customers"></a>
### 고객 정보 조회

`Cashier::findBillable` 메서드를 사용하면 Paddle 고객 ID로 고객을 조회할 수 있습니다. 이 메서드는 과금 가능한(billable) 모델의 인스턴스를 반환합니다.

```php
use Laravel\Paddle\Cashier;

$user = Cashier::findBillable($customerId);
```

<a name="creating-customers"></a>
### 고객 생성

가끔은 구독을 시작하지 않고 Paddle에 고객을 먼저 생성하고 싶을 때가 있습니다. 이럴 때는 `createAsCustomer` 메서드를 사용하면 됩니다.

```php
$customer = $user->createAsCustomer();
```

이 메서드는 `Laravel\Paddle\Customer` 인스턴스를 반환합니다. 고객이 Paddle에 생성된 후, 언제든 구독을 시작할 수 있습니다. 또한, 추가로 [Paddle API에서 지원하는 고객 생성 파라미터](https://developer.paddle.com/api-reference/customers/create-customer)를 넘길 수 있도록 `$options` 배열을 전달할 수도 있습니다.

```php
$customer = $user->createAsCustomer($options);
```

<a name="subscriptions"></a>
## 구독(Subscription)

<a name="creating-subscriptions"></a>
### 구독 생성하기

구독을 만들려면, 우선 데이터베이스에서 과금 모델 인스턴스(일반적으로 `App\Models\User`)를 조회해야 합니다. 모델 인스턴스를 얻은 뒤에는 `subscribe` 메서드를 사용해 해당 모델의 체크아웃 세션을 만들 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

`subscribe` 메서드의 첫 번째 인수는 사용자가 구독할 가격의 ID로, Paddle의 가격 식별자와 일치해야 합니다. `returnTo` 메서드에는 구독이 정상적으로 완료된 뒤 사용자가 리디렉션될 URL을 지정합니다. `subscribe` 메서드의 두 번째 인수는 구독의 내부 "타입"을 뜻합니다. 하나의 구독만 제공하는 애플리케이션이라면 `default`나 `primary`와 같이 명명하면 되고, 이 타입은 내부 용도로만 사용되며 사용자에게 노출되지 않습니다. 또한 구독 타입에는 띄어쓰기가 없어야 하며, 구독 생성 후에는 절대 변경하면 안 됩니다.

구독에 관한 추가 메타데이터가 필요하다면 `customData` 메서드로 배열을 건네줄 수도 있습니다.

```php
$checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
    ->customData(['key' => 'value'])
    ->returnTo(route('home'));
```

구독 체크아웃 세션이 생성되면, 해당 세션을 Cashier Paddle에 포함된 `paddle-button` [Blade 컴포넌트](#overlay-checkout)로 전달해 사용할 수 있습니다.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

사용자가 체크아웃을 완료하면, Paddle에서 `subscription_created` 웹훅이 전송됩니다. Cashier는 이 웹훅을 받아 사용자의 구독 상태를 설정합니다. 모든 웹훅이 애플리케이션에서 제대로 수신되고 처리되도록 [웹훅 처리 설정](#handling-paddle-webhooks)이 제대로 되어 있는지 꼭 확인해야 합니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인

사용자가 애플리케이션에 구독했다면, 여러 가지 편리한 메서드를 통해 구독 상태를 확인할 수 있습니다. 먼저, `subscribed` 메서드는 사용자가 유효한 구독을 가지고 있다면(체험 기간일 경우도 포함) `true`를 반환합니다.

```php
if ($user->subscribed()) {
    // ...
}
```

여러 개의 구독을 제공하는 애플리케이션은, `subscribed` 메서드 호출 시 구독 타입을 지정할 수도 있습니다.

```php
if ($user->subscribed('default')) {
    // ...
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/middleware)로 사용하기에도 적합하여, 사용자의 구독 상태에 따라 라우트와 컨트롤러 접근을 제한할 수 있습니다.

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
            // 과금 고객이 아닌 경우...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

사용자가 체험 기간 내에 있는지 확인하려면 `onTrial` 메서드를 쓸 수 있습니다. 이를 이용해 체험 기간 경고 등 특정 메시지를 띄울 수 있습니다.

```php
if ($user->subscription()->onTrial()) {
    // ...
}
```

`subscribedToPrice` 메서드는 사용자가 Paddle 가격 ID 기준으로 특정 플랜에 구독되어 있는지 확인할 때 사용합니다. 예를 들어, 아래처럼 사용자의 `default` 구독이 월간 요금제에 구독되어 있는지 알 수 있습니다.

```php
if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
    // ...
}
```

`recurring` 메서드는 사용자가 현재 구독(체험 기간 및 유예 기간 제외)에 정상적으로 가입 중임을 확인할 수 있습니다.

```php
if ($user->subscription()->recurring()) {
    // ...
}
```

<a name="canceled-subscription-status"></a>
#### 해지된 구독 상태

이전에 유효한 구독자였다가 현재는 구독을 취소한 경우, `canceled` 메서드로 확인할 수 있습니다.

```php
if ($user->subscription()->canceled()) {
    // ...
}
```

또한 사용자가 구독을 취소했지만, 구독 만료일까지 유예 기간("grace period")이 남아있는지 확인하려면 다음처럼 `onGracePeriod` 메서드를 사용할 수 있습니다. 예를 들어, 3월 5일에 구독이 취소되어도 만료일이 3월 10일이라면, 3월 10일까지는 유예 기간이 적용됩니다. 이 기간 동안에는 `subscribed` 메서드 역시 계속 `true`를 반환합니다.

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

<a name="past-due-status"></a>
#### 연체(Past Due) 상태

구독 결제에 실패하면, 해당 구독이 `past_due`(연체) 상태로 표시됩니다. 이 상태에서는 고객이 결제 정보를 갱신하기 전까지 구독이 활성화되지 않습니다. 구독 인스턴스에서 `pastDue` 메서드를 호출해 연체 여부를 확인할 수 있습니다.

```php
if ($user->subscription()->pastDue()) {
    // ...
}
```

구독이 연체 상태라면, [결제 정보 업데이트](#updating-payment-information)를 안내해야 합니다.

연체 상태(`past_due`)일 때도 구독을 유효하다고 간주하고 싶다면, Cashier의 `keepPastDueSubscriptionsActive` 메서드를 사용할 수 있습니다. 주로 `AppServiceProvider`의 `register` 메서드에서 호출하면 됩니다.

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
> 구독이 `past_due` 상태일 때는 결제 정보가 갱신되기 전까지 구독 변경이 불가능합니다. 따라서 `swap` 및 `updateQuantity` 메서드는 `past_due` 상태에서 호출하면 예외가 발생합니다.

<a name="subscription-scopes"></a>
#### 구독 쿼리 스코프

대부분의 구독 상태는 쿼리 스코프로도 제공되므로, 특정 상태의 구독을 데이터베이스에서 손쉽게 조회할 수 있습니다.

```php
// 유효한 모든 구독 가져오기
$subscriptions = Subscription::query()->valid()->get();

// 사용자의 해지된 구독 모두 가져오기
$subscriptions = $user->subscriptions()->canceled()->get();
```

아래는 사용 가능한 스코프 전체 목록입니다.

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
### 구독 단일(One-time) 청구

구독 단일 청구 기능을 이용하면, 구독에 추가로 1회성 청구(추가 상품 요금 등)를 할 수 있습니다. 이때 `charge` 메서드에 가격 ID 하나 혹은 여러 개를 전달합니다.

```php
// 단일 가격 청구
$response = $user->subscription()->charge('pri_123');

// 여러 가격을 한 번에 청구
$response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

`charge` 메서드는 실제로는 구독의 다음 결제 주기가 시작될 때 고객에게 청구합니다. 즉시 청구하고 싶다면 `chargeAndInvoice` 메서드를 사용하세요.

```php
$response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a name="updating-payment-information"></a>
### 결제 정보 업데이트

Paddle은 구독별로 결제 수단을 저장합니다. 구독의 기본 결제 수단을 업데이트하려면, 구독 모델에서 `redirectToUpdatePaymentMethod` 메서드를 호출해 Paddle에서 제공하는 결제 정보 변경 페이지로 고객을 리디렉션해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/update-payment-method', function (Request $request) {
    $user = $request->user();

    return $user->subscription()->redirectToUpdatePaymentMethod();
});
```

사용자가 결제 정보를 수정하면 Paddle에서 `subscription_updated` 웹훅을 전송하고, 애플리케이션의 데이터베이스에도 구독 정보가 갱신됩니다.

<a name="changing-plans"></a>
### 요금제 변경

구독이 시작된 후에 사용자가 다른 구독 플랜으로 변경하고 싶어질 수 있습니다. 이 경우, 해당 구독의 `swap` 메서드에 Paddle 가격 식별자를 전달하여 요금제를 변경할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->subscription()->swap($premium = 'pri_456');
```

구독을 즉시 변경 후, 곧바로 인보이스를 발행해 사용자를 청구하고 싶다면 `swapAndInvoice` 메서드를 사용하면 됩니다.

```php
$user = User::find(1);

$user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a name="prorations"></a>
#### 비례청구(Proration)

기본적으로, Paddle은 플랜 변경 시 자동으로 비례청구(prorate)를 적용합니다. 만약 비례청구 없이 구독을 변경하고 싶다면 `noProrate` 메서드를 사용하세요.

```php
$user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

비례청구 없이 즉시 인보이스를 발행하려면, `swapAndInvoice`와 `noProrate`를 함께 사용할 수 있습니다.

```php
$user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

구독 변경 시 고객에게 청구하지 않으려면, `doNotBill` 메서드를 이용할 수 있습니다.

```php
$user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Paddle의 비례청구 정책은 [공식 문서](https://developer.paddle.com/concepts/subscriptions/proration)를 참고하세요.

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

특정 구독은 "수량(quantity)"에 따라 청구 금액이 달라지기도 합니다. 예를 들어, 프로젝트 관리 애플리케이션에서 프로젝트 하나당 매월 10달러를 청구하는 식입니다. 구독 수량을 쉽게 증가/감소시키려면 `incrementQuantity` 및 `decrementQuantity` 메서드를 사용합니다.

```php
$user = User::find(1);

$user->subscription()->incrementQuantity();

// 구독 수량에 5 추가
$user->subscription()->incrementQuantity(5);

$user->subscription()->decrementQuantity();

// 구독 수량에서 5 감소
$user->subscription()->decrementQuantity(5);
```

또는 `updateQuantity` 메서드로 원하는 수량을 직접 설정할 수도 있습니다.

```php
$user->subscription()->updateQuantity(10);
```

비례청구 없이 수량만 변경하고 싶다면 `noProrate`와 함께 사용할 수 있습니다.

```php
$user->subscription()->noProrate()->updateQuantity(10);
```

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 다중 상품 구독의 수량 조정

[여러 상품을 포함한 구독](#subscriptions-with-multiple-products)에서는, 수량을 조정하고 싶은 가격 ID를 두 번째 인수로 넘겨 `incrementQuantity` 또는 `decrementQuantity` 메서드를 호출해야 합니다.

```php
$user->subscription()->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 여러 상품이 포함된 구독

[여러 상품을 포함하는 구독](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons) 기능을 이용하면 여러 개의 과금 상품을 하나의 구독에 묶을 수 있습니다. 예를 들어, 고객 지원용 "헬프데스크" 앱에서 월 10달러의 기본 구독료와, 월 15달러의 실시간 채팅 애드온(add-on) 상품을 별도로 제공할 수 있습니다.

구독 체크아웃 세션을 생성할 때, `subscribe`의 첫 번째 인수에 여러 가격을 배열로 전달하면 됩니다.

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

위 예제에서는 고객이 `default` 구독에 두 가지 가격을 함께 등록하게 됩니다. 각 가격에 지정된 결제 주기대로 과금이 이루어집니다. 필요하다면, 가격별 수량을 지정하는 키-값 쌍 형태의 연관 배열을 넘길 수도 있습니다.

```php
$user = User::find(1);

$checkout = $user->subscribe('default', ['price_monthly', 'price_chat' => 5]);
```

기존 구독에 다른 가격을 추가하려면, 해당 구독의 `swap` 메서드를 사용해야 하며, 이때 기존 가격과 수량 정보도 함께 넘겨야 합니다.

```php
$user = User::find(1);

$user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

위 예시는 새 가격을 추가하지만, 고객에게는 다음 결제 주기까지 요금이 청구되지 않습니다. 즉시 청구하려면 `swapAndInvoice`를 사용하세요.

```php
$user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

구독에서 특정 가격을 제거하고 싶으면, `swap`에서 해당 가격을 전달하지 않으면 됩니다.

```php
$user->subscription()->swap(['price_original' => 2]);
```

> [!WARNING]
> 구독에서 마지막 가격을 제거할 수는 없습니다. 이런 경우에는 구독을 그냥 취소해야 합니다.

<a name="multiple-subscriptions"></a>
### 다중 구독

Paddle을 사용하면 고객이 여러 개의 구독을 동시에 가질 수 있습니다. 예를 들어, 헬스클럽에서 수영 구독과 웨이트 구독을 각각 별도의 가격으로 제공할 수 있습니다. 고객은 두 플랜 중 하나 또는 둘 다 구독할 수 있습니다.

애플리케이션에서 구독을 생성할 때는, `subscribe` 메서드의 두 번째 인수로 구독 타입을 지정하면 됩니다. 이 타입은 사용자가 시작하는 구독의 종류를 나타내는 문자열이면 됩니다.

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

    return view('billing', ['checkout' => $checkout]);
});
```

이 예제에서는 고객에게 월간 수영 구독을 시작했습니다. 나중에 연간 구독으로 변경하고 싶다면, 해당 구독의 가격을 `swap`으로 바꿔주면 됩니다.

```php
$user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

물론, 구독을 완전히 취소할 수도 있습니다.

```php
$user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>
### 구독 일시 중지

구독을 일시 중지하려면, 사용자의 구독에서 `pause` 메서드를 호출하면 됩니다.

```php
$user->subscription()->pause();
```

구독이 일시 중지되면, Cashier는 데이터베이스에서 자동으로 `paused_at` 컬럼을 설정합니다. 이 컬럼으로 인해, `paused` 메서드가 반환하는 값이 언제부터 `true`가 될지 결정합니다. 예를 들어, 고객이 3월 1일에 구독을 중지했지만 원래 결제가 3월 5일로 예정되어 있다면, 3월 5일까지는 `paused`가 `false`를 반환하다가 3월 5일부터 `true`로 바뀝니다. 즉, 결제 주기가 끝날 때까지는 일반적으로 애플리케이션 사용이 허용됩니다.

기본적으로는 다음 결제 주기부터 일시 중지가 적용되어, 고객이 결제한 기간까지 쓸 수 있도록 처리됩니다. 만약 즉시 구독을 일시 중지하려면, `pauseNow` 메서드를 사용할 수 있습니다.

```php
$user->subscription()->pauseNow();
```

`pauseUntil` 메서드로는 특정 시점까지 구독을 일시 중지할 수 있습니다.

```php
$user->subscription()->pauseUntil(now()->addMonth());
```

또는, 바로 일시 중지하면서 특정 시점까지 중지 상태를 유지하고 싶다면 `pauseNowUntil`을 사용할 수 있습니다.

```php
$user->subscription()->pauseNowUntil(now()->addMonth());
```

고객이 구독을 일시 중지했지만, 아직 "유예 기간(grace period)"에 있는지 확인하고 싶다면 `onPausedGracePeriod` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription()->onPausedGracePeriod()) {
    // ...
}
```

일시 중지된 구독을 다시 활성화하려면 구독에서 `resume` 메서드를 호출하면 됩니다.

```php
$user->subscription()->resume();
```

> [!WARNING]
> 구독이 일시 중지 상태일 때는 구독을 변경할 수 없습니다. 다른 요금제로 변경하거나 수량을 업데이트하려면 먼저 구독을 재개(resume)해야 합니다.

<a name="canceling-subscriptions"></a>

### 구독 취소하기

구독을 취소하려면, 사용자 구독에 대해 `cancel` 메서드를 호출하면 됩니다.

```php
$user->subscription()->cancel();
```

구독이 취소되면, Cashier는 자동으로 데이터베이스의 `ends_at` 컬럼을 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 하는지 판단하는 데 사용됩니다. 예를 들어, 고객이 3월 1일에 구독을 취소했지만, 실제 구독 종료가 3월 5일로 예정되어 있다면 `subscribed` 메서드는 3월 5일까지 계속 `true`를 반환합니다. 이는 사용자가 일반적으로 결제 주기 끝까지 애플리케이션을 계속 이용할 수 있도록 하기 위한 동작입니다.

구독이 취소되었더라도 아직 "유예 기간(grace period)"에 있는지 확인하려면 `onGracePeriod` 메서드를 사용합니다.

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

구독을 즉시 취소하고 싶다면, 구독에 대해 `cancelNow` 메서드를 호출하면 됩니다.

```php
$user->subscription()->cancelNow();
```

유예 기간 중인 구독의 취소를 중단하려면, `stopCancelation` 메서드를 호출하십시오.

```php
$user->subscription()->stopCancelation();
```

> [!WARNING]
> Paddle의 구독은 한 번 취소하면 다시 재개할 수 없습니다. 고객이 구독을 다시 사용하고 싶다면 새로운 구독을 생성해야 합니다.

<a name="subscription-trials"></a>
## 구독 체험 기간(Trial)

<a name="with-payment-method-up-front"></a>
### 결제수단을 미리 받아서 제공하는 체험

고객에게 체험 기간을 제공하면서 결제수단 정보를 미리 받고 싶다면, Paddle 대시보드에서 고객이 구독할 요금제(가격)에 대해 체험 기간(Trial time)을 설정해야 합니다. 그런 다음 평소처럼 체크아웃 세션을 시작하면 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

애플리케이션이 `subscription_created` 이벤트를 수신하면, Cashier는 구독 레코드에 체험 기간 종료 날짜를 설정하고, Paddle에게 이 날짜 후부터 결제가 시작되도록 지시합니다.

> [!WARNING]
> 고객의 구독이 체험 종료일 이전에 취소되지 않으면, 체험 기간이 끝나는 즉시 요금이 청구됩니다. 반드시 사용자가 체험 종료일을 알 수 있도록 미리 안내해야 합니다.

사용자가 체험 기간 중인지 확인하려면 사용자 인스턴스의 `onTrial` 메서드를 사용합니다.

```php
if ($user->onTrial()) {
    // ...
}
```

기존의 체험이 만료되었는지 확인하려면 `hasExpiredTrial` 메서드를 사용하세요.

```php
if ($user->hasExpiredTrial()) {
    // ...
}
```

특정 구독 유형의 체험인지 확인하려면, `onTrial` 또는 `hasExpiredTrial` 메서드에 구독 유형(타입)을 인자로 전달할 수 있습니다.

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->hasExpiredTrial('default')) {
    // ...
}
```

<a name="without-payment-method-up-front"></a>
### 결제수단 없이 제공하는 체험

결제수단 정보를 사전에 받지 않고 체험 기간을 제공하고 싶다면, 사용자에 연결된 고객 레코드(`customer record`)의 `trial_ends_at` 컬럼에 원하는 체험 종료일을 직접 지정하면 됩니다. 일반적으로 회원가입 시 이 작업을 수행합니다.

```php
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->addDays(10)
]);
```

Cashier에서는 이와 같이 구독과 연결되지 않은 체험을 "일반(Generic) 체험"이라고 하며, `User` 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at`을 지나지 않았다면 `true`를 반환합니다.

```php
if ($user->onTrial()) {
    // 사용자는 체험 기간 내에 있습니다...
}
```

사용자가 실제 구독을 생성할 준비가 되면, 평소와 같이 `subscribe` 메서드를 사용하여 구독을 생성할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

사용자의 체험 종료일을 가져오려면 `trialEndsAt` 메서드를 사용하면 됩니다. 이 메서드는 사용자가 체험 중이면 Carbon 날짜 인스턴스를 반환하고, 그렇지 않으면 `null`을 반환합니다. 기본이 아닌 특정 구독에 대한 체험 종료일이 필요한 경우, 구독 유형을 인자로 전달할 수도 있습니다.

```php
if ($user->onTrial('default')) {
    $trialEndsAt = $user->trialEndsAt();
}
```

정확히 "일반(Generic) 체험"인지(아직 실제 구독이 없는지) 확인하고 싶다면 `onGenericTrial` 메서드를 사용할 수 있습니다.

```php
if ($user->onGenericTrial()) {
    // 사용자가 "일반(Generic) 체험" 기간에 있습니다...
}
```

<a name="extend-or-activate-a-trial"></a>
### 체험 기간 연장 또는 즉시 활성화

구독에서 기존 체험 기간을 연장하고 싶다면, `extendTrial` 메서드를 호출하고 언제까지 체험을 유지할지 시점을 지정하면 됩니다.

```php
$user->subscription()->extendTrial(now()->addDays(5));
```

또는, 체험 기간을 바로 종료하고 구독을 즉시 활성화하려면 구독에 대해 `activate` 메서드를 호출하세요.

```php
$user->subscription()->activate();
```

<a name="handling-paddle-webhooks"></a>
## Paddle 웹훅(Webhook) 처리

Paddle은 다양한 이벤트를 웹훅을 통해 애플리케이션에 알릴 수 있습니다. Cashier 서비스 프로바이더가 기본적으로 Cashier의 웹훅 컨트롤러로 연결된 라우트를 등록합니다. 이 컨트롤러가 들어오는 모든 웹훅 요청을 처리합니다.

기본적으로 이 컨트롤러는 결제 실패가 누적된 구독의 자동 취소, 구독 정보 및 결제수단 변경 등의 이벤트를 자동으로 처리합니다. 하지만 원하는 경우, 추가적으로 Paddle의 웹훅 이벤트를 직접 처리하도록 이 컨트롤러를 확장할 수 있습니다.

애플리케이션이 Paddle 웹훅을 정상적으로 받을 수 있게 하려면, 반드시 [Paddle 관리 콘솔에서 웹훅 URL을 설정](https://vendors.paddle.com/alerts-webhooks)해야 합니다. 기본적으로 Cashier의 웹훅 컨트롤러는 `/paddle/webhook` 경로로 요청을 받습니다. Paddle 관리 패널에서 활성화해야 할 전체 웹훅 목록은 아래와 같습니다.

- Customer Updated
- Transaction Completed
- Transaction Updated
- Subscription Created
- Subscription Updated
- Subscription Paused
- Subscription Canceled

> [!WARNING]
> 들어오는 요청이 Cashier의 [웹훅 서명 검증](/docs/cashier-paddle#verifying-webhook-signatures) 미들웨어로 보호되고 있는지 반드시 확인하세요.

<a name="webhooks-csrf-protection"></a>
#### 웹훅과 CSRF 보호

Paddle 웹훅이 Laravel의 [CSRF 보호](/docs/csrf)를 우회할 수 있게 하려면, Paddle 웹훅 요청에 대해 Laravel이 CSRF 토큰 검증을 시도하지 않도록 설정해야 합니다. 이를 위해 애플리케이션의 `bootstrap/app.php` 파일에서 `paddle/*` 경로를 CSRF 보호 예외에 추가해야 합니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'paddle/*',
    ]);
})
```

<a name="webhooks-local-development"></a>
#### 웹훅과 로컬 개발환경

로컬 개발 환경에서 Paddle이 애플리케이션에 웹훅을 전송할 수 있게 하려면, [Ngrok](https://ngrok.com/)이나 [Expose](https://expose.dev/docs/introduction)와 같은 사이트 공유 서비스를 통해 애플리케이션을 외부에 노출해야 합니다. [Laravel Sail](/docs/sail)을 사용한다면 Sail의 [사이트 공유 명령어](/docs/sail#sharing-your-site)를 이용할 수도 있습니다.

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의하기

Cashier는 구독 결제 실패에 따른 취소나 기타 주요 Paddle 웹훅 이벤트를 자동으로 처리합니다. 그러나 추가로 처리하고 싶은 웹훅 이벤트가 있다면, Cashier가 발생시키는 다음 이벤트들을 리스닝하여 직접 처리할 수 있습니다.

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

이벤트에는 Paddle 웹훅의 전체 payload가 포함되어 있습니다. 예를 들어, `transaction.billed` 웹훅을 처리하고 싶다면 [리스너](/docs/events#defining-listeners)를 등록하면 됩니다.

```php
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * 받은 Paddle 웹훅 처리
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['event_type'] === 'transaction.billed') {
            // 들어온 이벤트 처리...
        }
    }
}
```

Cashier는 받은 웹훅의 타입별로 전용 이벤트도 발생시킵니다. 이 이벤트에는 Paddle의 전체 payload와 함께 처리에 사용된 billable 모델, 구독, 영수증 등 관련 모델도 포함되어 있습니다.

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\CustomerUpdated`
- `Laravel\Paddle\Events\TransactionCompleted`
- `Laravel\Paddle\Events\TransactionUpdated`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionPaused`
- `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

내장된 기본 웹훅 라우트를 직접 오버라이드하고 싶다면, 애플리케이션의 `.env` 파일에 `CASHIER_WEBHOOK` 환경 변수를 정의하면 됩니다. 이 값은 웹훅 라우트의 전체 URL이어야 하며, Paddle 관리 패널에 설정한 URL과 일치해야 합니다.

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### 웹훅 서명(Signature) 검증

웹훅의 보안을 위해 [Paddle의 웹훅 서명](https://developer.paddle.com/webhook-reference/verifying-webhooks)을 사용할 수 있습니다. Cashier는 들어오는 Paddle 웹훅 요청이 유효한지 자동으로 검증해 주는 미들웨어를 포함하고 있습니다.

웹훅 검증을 활성화하려면, 애플리케이션의 `.env` 파일에 `PADDLE_WEBHOOK_SECRET` 환경 변수를 반드시 설정해야 합니다. 해당 값은 Paddle 계정의 대시보드에서 확인할 수 있습니다.

<a name="single-charges"></a>
## 단일 결제

<a name="charging-for-products"></a>
### 상품별 결제하기

특정 상품에 대해 고객에게 구매 결제를 시작하고 싶다면, 결제 가능한(billable) 모델 인스턴스의 `checkout` 메서드를 이용해 해당 상품의 체크아웃 세션을 생성할 수 있습니다. `checkout` 메서드는 하나 또는 여러 개의 가격 ID를 받을 수 있으며, 구매 수량이 필요한 경우 연관 배열 형태로 지정할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

    return view('buy', ['checkout' => $checkout]);
});
```

체크아웃 세션을 생성한 후, Cashier가 제공하는 `paddle-button` [Blade 컴포넌트](#overlay-checkout)를 활용하여 사용자가 Paddle 체크아웃 위젯을 통해 결제를 완료하도록 할 수 있습니다.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

체크아웃 세션에는 `customData` 메서드를 통해 원하는 커스텀 데이터를 트랜잭션 생성에 추가로 전달할 수 있습니다. 전달 가능한 옵션에 대한 더 자세한 내용은 [Paddle 공식 문서](https://developer.paddle.com/build/transactions/custom-data)를 참고하세요.

```php
$checkout = $user->checkout('pri_tshirt')
    ->customData([
        'custom_option' => $value,
    ]);
```

<a name="refunding-transactions"></a>
### 트랜잭션 환불 처리

트랜잭션 환불은 해당 결제를 진행했던 고객의 결제수단으로 환불 금액을 반환합니다. Paddle 결제를 환불하려면 `Cashier\Paddle\Transaction` 모델의 `refund` 메서드를 사용하면 됩니다. 이 메서드는 첫 번째 인수로 환불 사유를 받고, 환불할 하나 이상의 가격 ID 및 (필요하다면) 부분 환불 금액이 포함된 연관 배열을 인자로 전달할 수 있습니다. 사용자의 트랜잭션은 `transactions` 메서드를 통해 조회할 수 있습니다.

예시로, `pri_123`과 `pri_456` 가격에 대해 특정 트랜잭션을 환불한다고 가정합니다. `pri_123`은 전체 금액을 환불하고, `pri_456`은 2달러만 부분 환불하는 경우입니다.

```php
use App\Models\User;

$user = User::find(1);

$transaction = $user->transactions()->first();

$response = $transaction->refund('Accidental charge', [
    'pri_123', // 이 가격은 전액 환불...
    'pri_456' => 200, // 이 가격은 일부(2달러)만 환불...
]);
```

이 예시처럼 트랜잭션의 개별 항목(line item)만 선택적으로 환불할 수 있습니다. 전체 트랜잭션을 모두 환불하려면 단순히 환불 사유만 전달하면 됩니다.

```php
$response = $transaction->refund('Accidental charge');
```

환불에 대한 더 자세한 정보는 [Paddle 공식 환불 문서](https://developer.paddle.com/build/transactions/create-transaction-adjustments)를 참고하세요.

> [!WARNING]
> 환불은 반드시 Paddle의 승인을 거쳐야 최종적으로 처리됩니다.

<a name="crediting-transactions"></a>
### 트랜잭션 크레딧 지급

환불과 마찬가지로, 트랜잭션에 대해 크레딧을 지급(credit)할 수도 있습니다. 트랜잭션에 크레딧을 지급하면 해당 금액이 고객의 잔액(balance)으로 적립되어 추후 결제에 사용될 수 있습니다. 크레딧 지급은 수동 결제(Manually-collected transactions)에만 가능하며, 자동 결제(자동 구독 등)에는 사용할 수 없습니다. (구독 크레딧은 Paddle에서 자동으로 관리합니다.)

```php
$transaction = $user->transactions()->first();

// 특정 항목에 전액 크레딧 지급
$response = $transaction->credit('Compensation', 'pri_123');
```

자세한 내용은 [Paddle의 크레딧 문서](https://developer.paddle.com/build/transactions/create-transaction-adjustments)를 참고하세요.

> [!WARNING]
> 크레딧은 수동 결제 트랜잭션에만 적용할 수 있습니다. 자동 결제 트랜잭션은 Paddle에서 자동으로 크레딧을 처리합니다.

<a name="transactions"></a>
## 트랜잭션(Transactions)

결제 가능한(billable) 모델의 트랜잭션 목록을 배열 형태로 `transactions` 속성을 통해 간단히 조회할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$transactions = $user->transactions;
```

트랜잭션은 상품 및 서비스 구매에 대한 결제를 나타내며, 인보이스와 함께 저장됩니다. 오직 완료된 트랜잭션만 애플리케이션 데이터베이스에 저장됩니다.

고객의 트랜잭션 목록을 출력할 때, 트랜잭션 인스턴스의 여러 메서드를 활용하여 필요한 결제 정보를 표시할 수 있습니다. 예를 들어, 모든 트랜잭션을 표로 나열하고, 사용자가 원하는 인보이스를 쉽게 다운로드할 수 있도록 할 수 있습니다.

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

`download-invoice` 라우트는 다음과 같이 구현할 수 있습니다.

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Transaction;

Route::get('/download-invoice/{transaction}', function (Request $request, Transaction $transaction) {
    return $transaction->redirectToInvoicePdf();
})->name('download-invoice');
```

<a name="past-and-upcoming-payments"></a>
### 이전 및 예정 결제 내역

구독 결제 내역 중 지난 결제, 또는 다가오는 예정결제를 조회하려면 `lastPayment`, `nextPayment` 메서드를 사용하면 됩니다.

```php
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription();

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

이 두 메서드는 모두 `Laravel\Paddle\Payment` 인스턴스를 반환합니다. 단, `lastPayment`는 웹훅을 통해 트랜잭션이 아직 동기화되지 않았다면 `null`을 반환하고, `nextPayment`는 결제 주기가 종료된 경우(예: 구독이 취소된 경우) `null`을 반환합니다.

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="testing"></a>
## 테스트

테스트를 진행할 때는 실제 결제 흐름을 수동으로 여러 번 점검하여 통합이 정상적으로 동작하는지 반드시 확인해야 합니다.

CI 환경을 포함한 자동화 테스트에서는 [Laravel의 HTTP 클라이언트](/docs/http-client#testing)를 사용하여 Paddle과의 HTTP 통신을 가짜로 처리할 수 있습니다. 이 방식은 실제로 Paddle의 응답을 검증하지는 못하지만, Paddle API를 직접 호출하지 않고도 애플리케이션 테스트가 가능합니다.