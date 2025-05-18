# 라라벨 Cashier, Paddle (Laravel Cashier (Paddle))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
    - [Paddle Sandbox](#paddle-sandbox)
- [구성](#configuration)
    - [결제 가능 모델](#billable-model)
    - [API 키](#api-keys)
    - [Paddle JS](#paddle-js)
    - [통화 설정](#currency-configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [빠른 시작](#quickstart)
    - [제품 판매하기](#quickstart-selling-products)
    - [구독 판매하기](#quickstart-selling-subscriptions)
- [결제 세션](#checkout-sessions)
    - [오버레이 결제창](#overlay-checkout)
    - [인라인 결제창](#inline-checkout)
    - [비회원 결제](#guest-checkouts)
- [가격 미리보기](#price-previews)
    - [고객별 가격 미리보기](#customer-price-previews)
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
    - [여러 상품을 포함한 구독](#subscriptions-with-multiple-products)
    - [다중 구독](#multiple-subscriptions)
    - [구독 일시정지](#pausing-subscriptions)
    - [구독 취소](#canceling-subscriptions)
- [구독 체험판](#subscription-trials)
    - [결제 정보를 먼저 받는 경우](#with-payment-method-up-front)
    - [결제 정보 없이 체험 시작](#without-payment-method-up-front)
    - [체험기간 연장 또는 활성화](#extend-or-activate-a-trial)
- [Paddle 웹훅 처리](#handling-paddle-webhooks)
    - [웹훅 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [웹훅 서명 검증](#verifying-webhook-signatures)
- [단일 결제](#single-charges)
    - [상품 결제](#charging-for-products)
    - [거래 환불](#refunding-transactions)
    - [거래에 크레딧 적용](#crediting-transactions)
- [거래](#transactions)
    - [과거 및 예정 결제 내역](#past-and-upcoming-payments)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

> [!WARNING]
> 이 문서는 Cashier Paddle 2.x에서 Paddle Billing을 통합하는 방법에 대한 내용입니다. Paddle Classic을 아직 사용 중이라면 [Cashier Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x) 문서를 참고해야 합니다.

[라라벨 Cashier Paddle](https://github.com/laravel/cashier-paddle)은 [Paddle](https://paddle.com)의 구독 결제 서비스를 보다 직관적이고 유연하게 사용할 수 있도록 도와주는 인터페이스를 제공합니다. Cashier를 사용하면 반복적으로 작성해야 하는 구독 결제 관련 코드를 대부분 손쉽게 처리할 수 있습니다. 기본적인 구독 관리 외에도, 구독 변경, 구독 "수량", 구독 일시정지, 취소 유예 기간 등 다양한 기능을 지원합니다.

Cashier Paddle을 본격적으로 사용하기 전에 Paddle의 [콘셉트 가이드](https://developer.paddle.com/concepts/overview)와 [API 문서](https://developer.paddle.com/api-reference/overview)도 함께 살펴보시길 권장합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier를 새 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md)를 꼼꼼히 확인하시기 바랍니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 매니저를 이용해 Paddle용 Cashier 패키지를 설치합니다:

```shell
composer require laravel/cashier-paddle
```

다음으로, `vendor:publish` 아티즌 명령어를 사용하여 Cashier에서 제공하는 마이그레이션 파일을 퍼블리시해야 합니다:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

그 다음에는 애플리케이션의 데이터베이스 마이그레이션을 실행해야 합니다. Cashier 마이그레이션을 실행하면 새로운 `customers` 테이블이 생성됩니다. 또한, 고객의 구독을 저장하는 `subscriptions` 및 `subscription_items` 테이블도 생성됩니다. 마지막으로, 고객과 연동된 모든 Paddle 거래 내역을 저장하기 위한 `transactions` 테이블이 추가로 생성됩니다.

```shell
php artisan migrate
```

> [!WARNING]
> Cashier가 모든 Paddle 이벤트를 올바르게 처리할 수 있도록 [Cashier의 웹훅 처리 설정](#handling-paddle-webhooks)을 반드시 해주셔야 합니다.

<a name="paddle-sandbox"></a>
### Paddle Sandbox

로컬 또는 스테이징 환경에서 개발할 때는 [Paddle Sandbox 계정](https://sandbox-login.paddle.com/signup)을 등록해 사용하는 것이 좋습니다. 해당 계정을 사용하면 실제 결제 없이도 결제 환경을 테스트하고 개발할 수 있습니다. 또한, 다양한 결제 시나리오를 시뮬레이션하기 위해 Paddle에서 제공하는 [테스트 카드 번호](https://developer.paddle.com/concepts/payment-methods/credit-debit-card)를 사용할 수 있습니다.

Paddle Sandbox 환경을 사용할 때는, 애플리케이션의 `.env` 파일에 `PADDLE_SANDBOX` 환경 변수를 `true`로 설정해야 합니다:

```ini
PADDLE_SANDBOX=true
```

애플리케이션 개발이 끝나면 [Paddle 벤더 계정](https://paddle.com)에 신청할 수 있습니다. 실서비스(프로덕션)로 배포하기 전에, Paddle 측에서 사용자의 애플리케이션 도메인을 승인해야 합니다.

<a name="configuration"></a>
## 구성

<a name="billable-model"></a>
### 결제 가능 모델

Cashier를 사용하기 전에, 사용자 모델에 `Billable` 트레이트를 추가해야 합니다. 이 트레이트는 구독 생성, 결제 수단 정보 업데이트 등 다양한 결제 작업을 쉽게 수행할 수 있는 여러 메서드를 제공합니다:

```
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

만약 사용자 이외의 결제가 가능한 엔터티가 있다면, 해당 클래스에도 역시 Billable 트레이트를 추가할 수 있습니다:

```
use Illuminate\Database\Eloquent\Model;
use Laravel\Paddle\Billable;

class Team extends Model
{
    use Billable;
}
```

<a name="api-keys"></a>
### API 키

다음으로, 애플리케이션의 `.env` 파일에 Paddle 키를 설정해야 합니다. Paddle API 키는 Paddle 관리 콘솔에서 얻을 수 있습니다:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

`PADDLE_SANDBOX` 환경 변수를 `true`로 설정하면 [Paddle Sandbox 환경](#paddle-sandbox)을 사용할 수 있습니다. 서비스를 프로덕션 환경에 배포하고 실제 Paddle 벤더 계정을 사용할 때는 이 변수를 `false`로 설정해야 합니다.

`PADDLE_RETAIN_KEY` 항목은 선택 사항이며, [Retain](https://developer.paddle.com/paddlejs/retain) 기능과 함께 Paddle을 사용할 때만 설정하면 됩니다.

<a name="paddle-js"></a>
### Paddle JS

Paddle은 자체 자바스크립트 라이브러리를 이용해 Paddle 결제 위젯을 초기화합니다. 이 JS 라이브러리는 애플리케이션 레이아웃의 `</head>` 닫는 태그 바로 앞에 `@paddleJS` Blade 디렉티브를 추가하여 쉽게 불러올 수 있습니다:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### 통화 설정

인보이스에 표시되는 금액을 포맷팅할 때 사용할 로캘을 지정할 수 있습니다. Cashier는 내부적으로 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 사용하여 통화 로캘을 설정합니다:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> `en` 외의 로캘을 사용하려면 서버에 `ext-intl` PHP 확장 모듈이 반드시 설치되어 있어야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Cashier에서 내부적으로 사용하는 모델을 직접 확장(커스터마이즈)할 수 있습니다. 직접 모델을 정의하고, Cashier 모델을 상속받으면 됩니다:

```
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 뒤에는 `Laravel\Paddle\Cashier` 클래스를 통해 Cashier가 해당 커스텀 모델을 사용하도록 설정할 수 있습니다. 보통 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 이를 등록합니다:

```
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
> Paddle Checkout을 사용하기 전에, 반드시 Paddle 대시보드에서 고정 가격으로 상품을 정의해야 합니다. 또한 [Paddle 웹훅 처리 설정](#handling-paddle-webhooks)도 필수로 적용해주셔야 합니다.

애플리케이션에서 제품 및 구독 결제를 적용하는 일은 다소 복잡하게 느껴질 수 있습니다. 그러나 Cashier와 [Paddle의 Checkout Overlay](https://www.paddle.com/billing/checkout)를 함께 활용하면, 현대적이고 견고한 결제 연동을 매우 쉽게 구축할 수 있습니다.

비정기(싱글 차지) 결제 상품을 고객에게 판매하려면, Cashier의 헬퍼를 사용하여 Paddle의 Checkout Overlay를 띄우고 고객이 결제 정보를 입력한 뒤 결제를 완료하도록 만들 수 있습니다. 결제가 완료된 후에는, 사용자가 설정한 성공 URL로 리다이렉션됩니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout('pri_deluxe_album')
        ->returnTo(route('dashboard'));

    return view('buy', ['checkout' => $checkout]);
})->name('checkout');
```

위 예시에서 볼 수 있듯이, Cashier의 `checkout` 메서드를 사용해 결제할 상품의 "가격 식별자"에 해당하는 Paddle Checkout Overlay를 띄울 수 있는 체크아웃 객체를 생성합니다. 여기서 "price"란, [특정 상품에 대해 Paddle에서 정의된 가격 항목](https://developer.paddle.com/build/products/create-products-prices)을 의미합니다.

필요하다면, `checkout` 메서드는 내부적으로 Paddle에서 고객 정보를 자동으로 생성하고, 해당 고객 레코드를 애플리케이션의 유저 DB와 연결해줍니다. 결제 세션 완료 후에는 사용자를 별도의 성공 페이지로 이동시켜 안내 메시지를 띄울 수 있습니다.

`buy` 뷰에서는 Checkout Overlay 버튼을 포함해야 합니다. Cashier Paddle에는 `paddle-button` Blade 컴포넌트가 기본 내장되어 있지만, [수동으로 오버레이 결제창을 구현](#manually-rendering-an-overlay-checkout)할 수도 있습니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a name="providing-meta-data-to-paddle-checkout"></a>
#### Paddle Checkout에 메타데이터 제공하기

상품을 판매할 때, 애플리케이션에서 자체적으로 정의한 `Cart`, `Order` 모델 등을 활용해 주문 및 구매된 상품 정보를 추적하는 경우가 많습니다. Paddle의 Checkout Overlay로 사용자를 리다이렉트할 때, 이미 생성해둔 주문의 식별자를 전달하면, 결제 후 다시 애플리케이션으로 돌아올 때 해당 주문과 결제 내역을 연결할 수 있습니다.

이를 위해 `checkout` 메서드에 커스텀 데이터를 배열로 전달할 수 있습니다. 예를 들어, 사용자가 결제를 시작하면 애플리케이션 내에서 대기 상태의 `Order`가 생성된다고 가정해봅니다. (`Cart`, `Order` 모델은 예시를 위한 것이며 Cashier에서 기본 제공하지 않습니다. 자신의 애플리케이션에 맞게 구현해야 합니다.)

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

    $checkout = $request->user()->checkout($order->price_ids)
        ->customData(['order_id' => $order->id]);

    return view('billing', ['checkout' => $checkout]);
})->name('checkout');
```

위 예시처럼 체크아웃이 시작될 때, 장바구니 또는 주문에 포함된 모든 Paddle 가격 ID를 `checkout` 메서드에 전달합니다. 어떤 아이템이든 고객이 장바구니에 추가할 때, 이 과정은 여러분의 애플리케이션에서 책임지고 관리해야 합니다. 그리고 `customData` 메서드를 이용해 주문의 ID를 Paddle Checkout Overlay에 전달할 수 있습니다.

물론, 고객이 결제를 완료했다면 해당 주문의 상태를 "완료"로 변경하는 것이 필요합니다. 이를 위해 Paddle이 발송하는 웹훅을 Cashier에서 이벤트로 받아, 데이터베이스에 주문 정보를 저장할 수 있습니다.

먼저, Cashier에서 발생하는 `TransactionCompleted` 이벤트를 리스닝해야 합니다. 일반적으로 이 이벤트 리스너는 애플리케이션의 서비스 프로바이더의 `boot` 메서드에 등록합니다:

```
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

여기서 `CompleteOrder` 리스너는 다음과 같이 구현할 수 있습니다:

```
namespace App\Listeners;

use App\Models\Order;
use Laravel\Cashier\Cashier;
use Laravel\Cashier\Events\TransactionCompleted;

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

`transaction.completed` 이벤트에 포함된 데이터에 대한 자세한 내용은 Paddle 공식 문서를 참고해주세요: [관련 문서 보기](https://developer.paddle.com/webhooks/transactions/transaction-completed).

<a name="quickstart-selling-subscriptions"></a>
### 구독 판매하기

> [!NOTE]
> Paddle Checkout을 사용하기 전에, 반드시 Paddle 대시보드에서 고정 가격으로 상품을 정의해야 합니다. 또한 [Paddle 웹훅 처리 설정](#handling-paddle-webhooks)도 필수로 적용해주셔야 합니다.

애플리케이션에서 제품 및 구독 결제를 적용하는 일은 다소 복잡하게 느껴질 수 있습니다. 그러나 Cashier와 [Paddle의 Checkout Overlay](https://www.paddle.com/billing/checkout)를 함께 활용하면, 현대적이고 견고한 결제 연동을 손쉽게 구축할 수 있습니다.

Cashier 및 Paddle의 Checkout Overlay로 구독 상품을 판매하는 방법을 알아보기 위해, 기본 월간(`price_basic_monthly`) 및 연간(`price_basic_yearly`) 플랜을 가진 구독 서비스를 예로 들어보겠습니다. 이 두 가격은 Paddle 대시보드의 "Basic" 상품(`pro_basic`) 아래 묶일 수 있습니다. 또한, "Expert" 플랜(`pro_expert`)을 추가로 제공할 수도 있습니다.

먼저, 고객이 서비스에 가입(구독)하는 방법을 살펴보겠습니다. 예를 들어, 고객이 애플리케이션의 가격 페이지에서 Basic 플랜에 대한 "구독" 버튼을 클릭할 수 있습니다. 이 버튼이 Paddle Checkout Overlay를 띄우고, 고객이 원하는 플랜에 가입하게 됩니다. 아래 예시처럼 `checkout` 메서드를 통해 체크아웃 세션을 생성할 수 있습니다:

```
use Illuminate\Http\Request;

Route::get('/subscribe', function (Request $request) {
    $checkout = $request->user()->checkout('price_basic_monthly')
        ->returnTo(route('dashboard'));

    return view('subscribe', ['checkout' => $checkout]);
})->name('subscribe');
```

`subscribe` 뷰에서는 Checkout Overlay 버튼을 포함해야 합니다. Cashier Paddle에는 `paddle-button` Blade 컴포넌트가 기본 내장되어 있지만, [수동으로 오버레이 결제창을 구현](#manually-rendering-an-overlay-checkout)할 수도 있습니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

이제 구독 버튼을 클릭하면 고객은 결제 정보를 입력하고 구독을 시작할 수 있습니다. 결제가 실제로 시작된 시점을 애플리케이션에서 감지하기 위해, 일부 결제 방식의 경우 처리에 몇 초가 소요될 수 있으므로 [Cashier의 웹훅 처리 설정](#handling-paddle-webhooks)도 꼭 해주십시오.

이제 고객이 구독을 시작했으므로, 애플리케이션의 일부 영역은 구독 중인 사용자만 접근하도록 제한해야 합니다. 이를 위해 Cashier의 `Billable` 트레이트에 포함된 `subscribed` 메서드를 활용해 사용자의 현재 구독 상태를 손쉽게 확인할 수 있습니다:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

특정 상품이나 가격에 대해 사용자가 구독 중인지도 쉽게 확인할 수 있습니다:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### 구독 여부를 확인하는 미들웨어 만들기

편의를 위해, 요청이 구독 중인 사용자인지 판단하는 [미들웨어](/docs/10.x/middleware)를 만들 수도 있습니다. 이 미들웨어를 생성하면 해당 미들웨어를 라우트에 할당해 구독 중이 아닌 사용자의 접근을 막을 수 있습니다:

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
            // 유저를 결제 페이지로 리다이렉트하고 구독을 유도합니다...
            return redirect('/subscribe');
        }

        return $next($request);
    }
}
```

이제 작성한 미들웨어를 해당 라우트에 할당할 수 있습니다:

```
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### 고객이 본인의 결제 플랜을 직접 관리할 수 있도록 허용하기

고객이 자신의 구독 플랜(상품 또는 "티어")을 변경하고 싶어할 수 있습니다. 앞선 예시에서는, 사용자가 월간 구독에서 연간 구독으로 플랜을 변경할 수 있도록 허용해야 할 수도 있습니다. 이를 위해 아래와 같은 경로로 연결되는 버튼을 화면에 구현하면 됩니다:

```
use Illuminate\Http\Request;

Route::put('/subscription/{price}/swap', function (Request $request, $price) {
    $user->subscription()->swap($price); // 이 예시에서는 "$price"가 "price_basic_yearly"에 해당합니다.

    return redirect()->route('dashboard');
})->name('subscription.swap');
```

플랜 변경 외에도, 고객이 구독을 해지할 수 있도록 버튼을 제공해야 합니다. 플랜 변경과 마찬가지로 다음과 같은 경로로 이동하는 버튼을 구현합니다:

```
use Illuminate\Http\Request;

Route::put('/subscription/cancel', function (Request $request, $price) {
    $user->subscription()->cancel();

    return redirect()->route('dashboard');
})->name('subscription.cancel');
```

이제 해당 구독은 결제 기간이 종료될 때 자동으로 해지됩니다.

> [!NOTE]
> Cashier의 웹훅 처리 설정을 완료했다면, Paddle에서 들어오는 웹훅을 확인하여 Cashier 관련 데이터베이스 테이블이 자동으로 동기화됩니다. 따라서 Paddle 대시보드에서 수동으로 구독을 취소하더라도 해당 이벤트가 Cashier로 전달되어 애플리케이션 DB에서 구독 상태가 "취소됨"으로 갱신됩니다.

<a name="checkout-sessions"></a>
## 결제 세션

대부분의 결제 관련 작업은 Paddle의 [Checkout Overlay 위젯](https://developer.paddle.com/build/checkout/build-overlay-checkout) 또는 [인라인 결제창](https://developer.paddle.com/build/checkout/build-branded-inline-checkout)을 통해 "결제 세션(checkout)" 기반으로 처리됩니다.

Paddle을 이용해 실제 결제 처리를 시작하기 전에, 애플리케이션의 [기본 결제 링크](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link)를 Paddle 결제 설정 대시보드에서 먼저 정의해두어야 합니다.

<a name="overlay-checkout"></a>
### 오버레이 결제창

Checkout Overlay 위젯을 표시하기 전에, Cashier를 이용하여 결제 세션(checkout session)을 먼저 생성해야 합니다. 이 결제 세션이 결제 위젯에 어떤 결제 작업을 처리해야 하는지 정보를 알려줍니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Cashier는 `paddle-button` [Blade 컴포넌트](/docs/10.x/blade#components)를 제공합니다. "checkout 세션"을 이 컴포넌트의 prop으로 전달할 수 있습니다. 버튼 클릭 시 Paddle의 결제 위젯이 화면에 표시됩니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

기본적으로 Paddle의 기본 스타일링이 적용된 위젯이 표시됩니다. 보다 다양한 디자인을 적용하고 싶다면 [Paddle에서 공식 지원하는 HTML 속성](https://developer.paddle.com/paddlejs/html-data-attributes) 중 `data-theme='light'`와 같은 속성을 추가할 수 있습니다:

```html
<x-paddle-button :url="$payLink" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

Paddle 결제 위젯은 비동기 방식으로 작동합니다. 사용자가 위젯 내에서 구독을 생성하면, Paddle에서 애플리케이션으로 웹훅을 전송해 구독 상태를 데이터베이스에 자동으로 반영할 수 있습니다. 따라서 Paddle로부터 상태 변경 웹훅이 올바로 처리될 수 있도록 미리 [웹훅 설정](#handling-paddle-webhooks)을 완료해야 합니다.

> [!WARNING]
> 구독 상태가 변경되는 경우, 관련 웹훅이 도착하기까지의 지연 시간이 대개 짧지만, 결제 완료 직후 사용자 구독이 바로 사용할 수 있는 것은 아닐 수 있으므로 이 부분을 애플리케이션 설계에서 고려해야 합니다.

<a name="manually-rendering-an-overlay-checkout"></a>
#### 오버레이 결제창 수동 렌더링

라라벨이 제공하는 Blade 컴포넌트를 사용하지 않고, 오버레이 결제창을 직접 수동으로 표시할 수도 있습니다. 먼저, 앞선 예시에서 봤던 것처럼 [결제 세션을 생성](#overlay-checkout)해야 합니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

그 다음 Paddle.js를 이용하여 결제창을 초기화할 수 있습니다. 아래 예제에서는 `paddle_button` 클래스를 가진 링크를 만들어주는데, Paddle.js가 이 클래스를 감지해 버튼 클릭 시 오버레이 방식의 결제창을 띄워줍니다:

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
### 인라인 결제창

Paddle의 "오버레이" 스타일 결제 위젯을 사용하고 싶지 않다면, 결제창을 인라인 형태로 애플리케이션 안에 직접 삽입(임베드)하는 방식도 지원됩니다. 이 방법은 결제창의 HTML 필드를 수정할 수는 없지만, 애플리케이션 화면 내에서 결제창을 자연스럽게 통합할 수 있는 장점이 있습니다.

Cashier는 인라인 결제창을 쉽게 시작할 수 있도록 `paddle-checkout` Blade 컴포넌트를 제공합니다. 먼저, [결제 세션을 생성](#overlay-checkout)합니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

이제 checkout 세션을 컴포넌트의 `checkout` 속성에 전달하면 됩니다:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

인라인 결제 컴포넌트의 높이를 조절하고 싶을 경우, `height` 속성을 지정할 수 있습니다:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

인라인 결제창의 커스터마이징 옵션에 대해서는 Paddle의 [Inline Checkout 가이드](https://developer.paddle.com/build/checkout/build-branded-inline-checkout) 및 [결제 설정 관련 문서](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings)를 참고해 주세요.

<a name="manually-rendering-an-inline-checkout"></a>

#### 인라인 체크아웃 수동 렌더링

라라벨의 내장 Blade 컴포넌트를 사용하지 않고도 인라인 체크아웃을 수동으로 렌더링할 수 있습니다. 먼저, [이전 예시](#inline-checkout)에서와 같이 체크아웃 세션을 생성합니다.

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

다음으로, Paddle.js를 사용해 체크아웃을 초기화할 수 있습니다. 아래 예시에서는 [Alpine.js](https://github.com/alpinejs/alpine)를 사용하지만, 여러분의 프론트엔드 환경에 맞게 자유롭게 수정할 수 있습니다.

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
### 게스트 체크아웃

가끔 사용자가 애플리케이션 계정 없이 결제해야 하는 상황이 있을 수 있습니다. 이럴 때는 `guest` 메서드를 사용할 수 있습니다.

```
use Illuminate\Http\Request;
use Laravel\Paddle\Checkout;

Route::get('/buy', function (Request $request) {
    $checkout = Checkout::guest('pri_34567')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

이렇게 생성한 체크아웃 세션은 [Paddle 버튼](#overlay-checkout) 또는 [인라인 체크아웃](#inline-checkout) Blade 컴포넌트에 제공하면 됩니다.

<a name="price-previews"></a>
## 가격 미리보기

Paddle은 통화별로 가격을 커스터마이즈할 수 있게 해주므로, 국가마다 다른 가격을 설정할 수 있습니다. Cashier Paddle을 사용하면 `previewPrices` 메서드로 이러한 모든 가격 정보를 조회할 수 있습니다. 이 메서드는 가격을 조회할 price ID 배열을 인수로 받습니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

통화 정보는 요청자의 IP 주소를 기준으로 자동 결정됩니다. 하지만, 특정 국가의 가격을 조회하려면 다음처럼 옵션을 전달할 수도 있습니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::productPrices(['pri_123', 'pri_456'], ['address' => [
    'country_code' => 'BE',
    'postal_code' => '1234',
]]);
```

가격 정보를 가져온 후에는 원하는 방식대로 표시할 수 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

또한, 소계 가격과 세금 금액을 각각 별도로 표시할 수도 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

자세한 내용은 [Paddle의 가격 미리보기 API 문서](https://developer.paddle.com/api-reference/pricing-preview/preview-prices)를 참고하세요.

<a name="customer-price-previews"></a>
### 고객별 가격 미리보기

이미 고객으로 등록되어 있는 사용자가 있다면, 해당 고객에게 적용되는 가격을 직접 조회해 표시할 수 있습니다. 고객 인스턴스에서 가격 정보를 조회하는 방식입니다.

```
use App\Models\User;

$prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

내부적으로 Cashier는 사용자의 고객 ID를 이용해 각 사용자에게 맞는 통화로 가격을 조회합니다. 예를 들어 미국에 거주하는 사용자는 미국 달러로, 벨기에에 거주하는 사용자는 유로화로 가격을 볼 수 있습니다. 만약 일치하는 통화가 없으면, 상품의 기본 통화가 사용됩니다. Paddle 관리 콘솔에서는 상품 또는 구독 플랜의 모든 가격을 자유롭게 설정할 수 있습니다.

<a name="price-discounts"></a>
### 할인 적용 가격

할인이 적용된 가격을 표시할 수도 있습니다. `previewPrices` 메서드 호출 시, `discount_id` 옵션에 할인 ID를 전달하면 됩니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
    'discount_id' => 'dsc_123'
]);
```

그 후, 계산된 가격을 아래와 같이 표시하면 됩니다.

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
### 고객 정보 기본값

Cashier에서는 체크아웃 세션을 생성할 때 고객의 기본 정보를 미리 지정할 수 있습니다. 이렇게 하면 체크아웃 위젯에서 고객의 이메일 주소와 이름을 자동으로 채워줄 수 있어, 결제 과정이 한층 빨라집니다. 이 기본값은 과금이 가능한 모델에서 다음 메서드들을 오버라이드하여 설정합니다.

```
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

이 설정은 Cashier가 [체크아웃 세션](#checkout-sessions)을 생성하는 모든 동작에 기본적으로 적용됩니다.

<a name="retrieving-customers"></a>
### 고객 조회

Paddle 고객 ID로 고객 정보를 조회하고 싶다면 `Cashier::findBillable` 메서드를 사용하세요. 이 메서드는 과금 가능한(billable) 모델 인스턴스를 반환합니다.

```
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($customerId);
```

<a name="creating-customers"></a>
### 고객 생성

가끔 구독을 시작하지 않고 Paddle 고객만 먼저 만들고 싶은 경우가 있을 수 있습니다. 이때는 `createAsCustomer` 메서드를 사용하면 됩니다.

```
$customer = $user->createAsCustomer();
```

이렇게 하면 `Laravel\Paddle\Customer` 인스턴스가 반환됩니다. 고객이 Paddle에 정상적으로 등록된 뒤, 나중에 구독을 시작해도 괜찮습니다. 추가 파라미터를 전달하고 싶다면 `$options` 배열을 넘길 수 있습니다. ([Paddle API에서 지원하는 고객 생성 파라미터](https://developer.paddle.com/api-reference/customers/create-customer) 참조)

```
$customer = $user->createAsCustomer($options);
```

<a name="subscriptions"></a>
## 구독(서브스크립션)

<a name="creating-subscriptions"></a>
### 구독 생성

구독을 생성하려면 먼저 데이터베이스에서 과금 가능 모델(대부분의 경우 `App\Models\User` 인스턴스일 것)을 가져와야 합니다. 모델 인스턴스를 가져온 뒤, `subscribe` 메서드를 사용해 체크아웃 세션을 만듭니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($premium = 12345, 'default')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

`subscribe` 메서드의 첫 번째 인수는 사용자가 구독할 가격(price)의 ID입니다. 이 값은 Paddle에 등록된 가격 식별자와 일치해야 합니다. `returnTo`에는 결제 완료 후 사용자가 리디렉션될 URL을 지정합니다. 두 번째 인수는 구독의 내부 "타입"입니다. 애플리케이션에 단일 구독만 있다면, `default`나 `primary`와 같이 지을 수 있습니다. 이 구독 타입은 내부적으로만 사용하는 값이며, 사용자에게 노출되지 않습니다. 또한 공백이 없어야 하며, 구독을 만든 후에는 절대 변경해서는 안 됩니다.

구독에 관련된 커스텀 메타데이터를 추가하려면 `customData` 메서드를 사용해 배열로 전달할 수 있습니다.

```
$checkout = $request->user()->subscribe($premium = 12345, 'default')
    ->customData(['key' => 'value'])
    ->returnTo(route('home'));
```

구독 체크아웃 세션이 생성되면, 해당 체크아웃 세션을 Cashier Paddle에 포함된 `paddle-button` [Blade 컴포넌트](#overlay-checkout)에 전달할 수 있습니다.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

사용자가 결제를 마치면, Paddle에서 `subscription_created` webhook이 발송됩니다. Cashier가 이 webhook을 받아서 고객의 구독을 세팅합니다. 모든 webhook이 제대로 수신되고 처리되는지 확인하려면, [webhook 처리 설정](#handling-paddle-webhooks)이 제대로 되었는지 꼭 확인하세요.

<a name="checking-subscription-status"></a>
### 구독 상태 확인

사용자가 애플리케이션을 구독하면, 다양한 편리한 메서드를 통해 구독 상태를 확인할 수 있습니다. 먼저, `subscribed` 메서드는 사용자가 유효한 구독을 가지고 있을 때(체험 기간 중이어도) `true`를 반환합니다.

```
if ($user->subscribed()) {
    // ...
}
```

여러 종류의 구독이 있다면, `subscribed` 메서드에 구독 타입을 지정해 확인할 수 있습니다.

```
if ($user->subscribed('default')) {
    // ...
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/10.x/middleware)로도 활용하기 좋습니다. 이를 통해 사용자의 구독 상태에 따라 라우트와 컨트롤러 접근을 제어할 수 있습니다.

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
        if ($request->user() && ! $request->user()->subscribed()) {
            // 이 사용자는 유료 구독자가 아닙니다...
            return redirect('billing');
        }

        return $next($request);
    }
}
```

사용자가 아직 체험(트라이얼) 기간 중인지 확인하고 싶다면 `onTrial` 메서드를 사용하세요. 이 메서드는 사용자가 체험 기간임을 알림으로써 경고 메시지를 띄우는 데 유용하게 사용할 수 있습니다.

```
if ($user->subscription()->onTrial()) {
    // ...
}
```

`subscribedToPrice` 메서드는 사용자가 특정 Paddle price ID의 플랜에 구독 중인지 확인할 때 사용할 수 있습니다. 아래는 사용자의 `default` 구독이 월별 가격으로 활성화되어 있는지 확인하는 예시입니다.

```
if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
    // ...
}
```

`recurring` 메서드는 사용자가 현재 활성화된 유료 구독 상태(체험 기간이나 유예 기간은 아님)인지를 확인할 때 사용합니다.

```
if ($user->subscription()->recurring()) {
    // ...
}
```

<a name="canceled-subscription-status"></a>
#### 구독 취소 상태

이전에 한 번이라도 활성 구독자였으나 구독을 취소한 사용자인지 확인하려면 `canceled` 메서드를 사용하세요.

```
if ($user->subscription()->canceled()) {
    // ...
}
```

구독은 취소했지만, 아직 완전히 만료되기 전 '유예 기간(grace period)'인 사용자인지도 확인할 수 있습니다. 예를 들어, 3월 5일에 구독을 취소했지만 원래 만기일이 3월 10일이라면, 3월 10일까지는 유예 기간입니다. 이 기간 동안에도 `subscribed` 메서드는 여전히 `true`를 반환합니다.

```
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

<a name="past-due-status"></a>
#### 미납(past due) 상태

구독 결제에 실패하면, 해당 구독은 `past_due` 상태로 표시됩니다. 이 상태에서는 고객이 결제 정보를 갱신하기 전까지 구독이 활성화되지 않습니다. `pastDue` 메서드를 통해 구독이 미납 상태인지 확인할 수 있습니다.

```
if ($user->subscription()->pastDue()) {
    // ...
}
```

구독이 미납 상태라면, 반드시 [결제 정보 업데이트](#updating-payment-information)를 안내해야 합니다.

만약 미납 상태에서도 구독을 유효(활성)로 간주하고 싶다면, Cashier가 제공하는 `keepPastDueSubscriptionsActive` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 `AppServiceProvider`의 `register` 메서드에서 호출하면 됩니다.

```
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
> 구독이 `past_due` 상태일 때는 결제 정보가 갱신되기 전까지 구독 변경이 불가능합니다. 따라서, 이 상태에서 `swap`이나 `updateQuantity` 메서드를 호출하면 예외가 발생합니다.

<a name="subscription-scopes"></a>
#### 구독 상태 스코프

대부분의 구독 상태는 쿼리 스코프(query scope)로도 제공되어, 특정 상태의 구독만 데이터베이스에서 쉽게 조회할 수 있습니다.

```
// 유효한 모든 구독 가져오기...
$subscriptions = Subscription::query()->valid()->get();

// 사용자의 취소된 모든 구독 가져오기...
$subscriptions = $user->subscriptions()->canceled()->get();
```

사용 가능한 스코프 목록은 아래와 같습니다.

```
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
### 구독 단일 청구

구독 단일 청구(single charges)를 이용하면 기존 구독 결제에 추가로 한 번 더 단일 청구를 할 수 있습니다. `charge` 메서드를 호출할 때 하나 또는 여러 개의 price ID를 지정합니다.

```
// 단일 price 청구...
$response = $user->subscription()->charge('pri_123');

// 여러 price를 한 번에 청구...
$response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

`charge` 메서드는 실질적으로 고객에게 실제 청구가 일어나는 시점을 다음 청구 주기로 예약합니다. 고객에게 즉시 청구하고 싶다면 `chargeAndInvoice` 메서드를 사용하세요.

```
$response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a name="updating-payment-information"></a>
### 결제 정보 업데이트

Paddle은 구독마다 결제 수단을 저장합니다. 구독의 기본 결제 수단을 변경하려면, 구독 모델의 `redirectToUpdatePaymentMethod` 메서드를 사용하여 Paddle에서 제공하는 결제 수단 업데이트 페이지로 사용자를 리디렉션해야 합니다.

```
use Illuminate\Http\Request;

Route::get('/update-payment-method', function (Request $request) {
    $user = $request->user();

    return $user->subscription()->redirectToUpdatePaymentMethod();
});
```

사용자가 정보를 모두 입력해 수정하면, Paddle에서 `subscription_updated` webhook이 발송되고, 애플리케이션의 데이터베이스에도 구독 정보가 자동 갱신됩니다.

<a name="changing-plans"></a>
### 구독 플랜 변경

사용자가 애플리케이션을 구독한 뒤에 가끔 다른 구독 플랜으로 변경하고 싶을 수 있습니다. 이때는 구독 인스턴스의 `swap` 메서드에 변경할 Paddle 가격 식별자(price ID)를 넘겨주면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription()->swap($premium = 'pri_456');
```

구독 플랜을 즉시 청구와 함께 변경하고 싶다면, `swapAndInvoice` 메서드를 사용하세요.

```
$user = User::find(1);

$user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a name="prorations"></a>
#### 일할 계산(Prorations)

기본적으로 Paddle은 플랜 변경 시 일할 계산(Prorate)을 적용합니다. 만약 일할 계산 없이 변경하고 싶으면, `noProrate` 메서드를 사용해 구독을 갱신할 수 있습니다.

```
$user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

일할 계산 없이 즉시 청구를 하고 싶다면, `swapAndInvoice`와 `noProrate`를 함께 사용할 수 있습니다.

```
$user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

구독 변경 시 고객에게 청구하지 않으려면 `doNotBill` 메서드를 이용하세요.

```
$user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Paddle의 일할 계산 정책에 대해 더 알고 싶다면 [proration 관련 공식 문서](https://developer.paddle.com/concepts/subscriptions/proration)를 참고하세요.

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

일부 구독 상품은 '수량' 개념이 적용됩니다. 예를 들어, 프로젝트 관리 앱이 프로젝트당 월 $10을 청구하는 경우가 있습니다. 구독 수량을 쉽게 올리고 내리려면 `incrementQuantity`와 `decrementQuantity` 메서드를 사용하세요.

```
$user = User::find(1);

$user->subscription()->incrementQuantity();

// 현재 수량에서 다섯 개 늘리기
$user->subscription()->incrementQuantity(5);

$user->subscription()->decrementQuantity();

// 현재 수량에서 다섯 개 줄이기
$user->subscription()->decrementQuantity(5);
```

특정 수량으로 바로 설정할 때는 `updateQuantity` 메서드를 사용합니다.

```
$user->subscription()->updateQuantity(10);
```

`noProrate`를 함께 사용하면, 수량 변경 시 일할 계산을 적용하지 않습니다.

```
$user->subscription()->noProrate()->updateQuantity(10);
```

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 다중 상품 구독의 수량

구독이 [여러 상품을 포함](#subscriptions-with-multiple-products)하는 경우에는, 수량을 변경할 가격(price)의 ID를 두 번째 인수로 넘겨야 합니다.

```
$user->subscription()->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 여러 상품을 포함한 구독

[여러 상품을 포함한 구독](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons)을 통해 하나의 구독에 여러 결제 상품을 할당할 수 있습니다. 예를 들어, 고객 지원 "헬프데스크" 애플리케이션은 기본 구독 가격이 월 $10이고, 추가로 라이브 채팅 부가 상품은 월 $15로 설정할 수 있습니다.

구독 체크아웃 세션을 만들 때, 특정 구독에 여러 product를 설정하고 싶으면 `subscribe` 메서드의 첫 번째 인수로 prices 배열을 전달하세요.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe([
        'price_monthly',
        'price_chat',
    ]);

    return view('billing', ['checkout' => $checkout]);
});
```

위 예시처럼 고객의 `default` 구독에는 두 개의 price가 할당됩니다. 각각의 price는 설정된 청구 주기에 따라 과금됩니다. 가격별로 수량을 다르게 지정하고 싶으면 연관 배열을 사용하면 됩니다.

```
$user = User::find(1);

$checkout = $user->subscribe('default', ['price_monthly', 'price_chat' => 5]);
```

만약 기존 구독에 price를 추가하고 싶다면, 구독 인스턴스의 `swap` 메서드를 사용해야 합니다. 이때, 현재 구독의 price와 수량도 모두 포함해 전달해야 합니다.

```
$user = User::find(1);

$user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

이렇게 하면 새 price가 추가되지만 다음 청구 주기까지는 별도 청구가 발생하지 않습니다. 고객에게 즉시 청구하고 싶으면 `swapAndInvoice` 메서드를 사용하세요.

```
$user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

구독에서 price를 제거하고 싶다면, 제거할 price를 제외하고 나머지 price들만 `swap`에 전달하세요.

```
$user->subscription()->swap(['price_original' => 2]);
```

> [!WARNING]
> 구독에서 마지막 price를 제거할 수 없습니다. 대신 구독 자체를 취소해야 합니다.

<a name="multiple-subscriptions"></a>
### 다중 구독

Paddle은 고객이 동시 여러 개의 구독을 가질 수 있습니다. 예를 들어 헬스클럽 운영자가 수영 구독과 웨이트트레이닝 구독을 각각 제공해서, 고객이 원하는 대로 하나 혹은 둘 다 구독할 수 있습니다.

구독을 생성할 때 `subscribe` 메서드의 두 번째 인수로 구독 타입(임의의 문자열)을 지정하면, 서로 다른 구독을 쉽게 관리할 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

    return view('billing', ['checkout' => $checkout]);
});
```

이 예시에서 고객은 월간 수영 구독을 시작했습니다. 추후 연간 구독으로 변경하고 싶은 경우, 해당 구독 타입으로 `swap`을 호출하면 됩니다.

```
$user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

물론, 구독 전체를 취소할 수도 있습니다.

```
$user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>

### 구독 일시 중지하기

구독을 일시 중지하려면, 사용자 구독 인스턴스에서 `pause` 메서드를 호출합니다.

```
$user->subscription()->pause();
```

구독이 일시 중지되면, Cashier는 자동으로 데이터베이스의 `paused_at` 컬럼을 설정합니다. 이 컬럼은 `paused` 메서드가 언제 `true`를 반환해야 할지 판단하는 데 사용됩니다. 예를 들어, 고객이 3월 1일에 구독을 일시 중지했지만 실제로 구독이 3월 5일에 다시 결제될 예정이었다면, `paused` 메서드는 3월 5일까지 계속해서 `false`를 반환합니다. 이는 일반적으로 사용자가 결제 주기가 끝날 때까지 애플리케이션을 계속 사용할 수 있도록 허용하기 때문입니다.

기본적으로, 일시 중지는 다음 결제 주기에 적용되어, 고객이 결제한 기간의 남은 부분을 모두 사용할 수 있습니다. 만약 즉시 구독을 일시 중지하고 싶다면 `pauseNow` 메서드를 사용할 수 있습니다.

```
$user->subscription()->pauseNow();
```

`pauseUntil` 메서드를 사용하면, 구독을 특정 시점까지 일시 중지할 수 있습니다.

```
$user->subscription()->pauseUntil(now()->addMonth());
```

또는, `pauseNowUntil` 메서드를 통해 즉시 구독을 특정 시점까지 일시 중지할 수 있습니다.

```
$user->subscription()->pauseNowUntil(now()->addMonth());
```

사용자가 구독을 일시 중지했지만 아직 "유예 기간" 내에 있는지도 `onPausedGracePeriod` 메서드로 확인할 수 있습니다.

```
if ($user->subscription()->onPausedGracePeriod()) {
    // ...
}
```

일시 중지된 구독을 다시 활성화하려면, 구독에 대해 `resume` 메서드를 호출하면 됩니다.

```
$user->subscription()->resume();
```

> [!WARNING]
> 구독이 일시 중지되어 있을 때는 수정할 수 없습니다. 다른 요금제(plan)로 변경하거나 수량을 업데이트하려면 먼저 구독을 다시 활성화해야 합니다.

<a name="canceling-subscriptions"></a>
### 구독 취소하기

구독을 취소하려면, 사용자 구독 인스턴스에서 `cancel` 메서드를 호출합니다.

```
$user->subscription()->cancel();
```

구독이 취소되면, Cashier는 자동으로 데이터베이스의 `ends_at` 컬럼을 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 할지 판단하는 데 사용됩니다. 예를 들어, 고객이 3월 1일에 구독을 취소했지만 구독이 3월 5일까지 유효하다면, `subscribed` 메서드는 3월 5일까지 계속해서 `true`를 반환합니다. 이는 일반적으로 사용자가 결제 주기가 끝날 때까지 애플리케이션을 계속 사용할 수 있도록 허용하기 때문입니다.

고객이 구독을 취소했지만 아직 "유예 기간" 내에 있는지도 `onGracePeriod` 메서드로 확인할 수 있습니다.

```
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

즉시 구독을 취소하려면, 구독에 대해 `cancelNow` 메서드를 호출하면 됩니다.

```
$user->subscription()->cancelNow();
```

유예 기간 중인 구독이 취소되지 않도록 하려면, `stopCancelation` 메서드를 사용할 수 있습니다.

```
$user->subscription()->stopCancelation();
```

> [!WARNING]
> Paddle의 구독은 한 번 취소되면 다시 활성화할 수 없습니다. 만약 고객이 구독을 다시 이용하고자 한다면 새로운 구독을 생성해야 합니다.

<a name="subscription-trials"></a>
## 구독 체험 기간(Trial)

<a name="with-payment-method-up-front"></a>
### 결제 정보를 미리 받는 체험 기간

고객에게 결제 정보를 미리 받은 상태로 체험 기간을 제공하려면, Paddle 대시보드에서 고객이 구독할 가격(Price)에 대해 체험 기간을 설정해야 합니다. 그런 다음, 평소처럼 checkout 세션을 생성합니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe('pri_monthly')
                ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

애플리케이션이 `subscription_created` 이벤트를 받으면, Cashier는 구독 레코드에 체험 기간 종료일을 저장하고 Paddle에게 이 날짜 이후부터 청구를 시작하도록 안내합니다.

> [!WARNING]
> 고객의 구독이 체험 기간 종료일 이전에 취소되지 않으면, 체험 기간이 끝난 즉시 요금이 청구되므로, 사용자에게 체험 기간 종료일을 반드시 알려주어야 합니다.

사용자 인스턴스의 `onTrial` 메서드 또는 구독 인스턴스의 `onTrial` 메서드를 사용하여 사용자가 체험 기간 내에 있는지 확인할 수 있습니다. 아래 두 예시는 동일하게 동작합니다.

```
if ($user->onTrial()) {
    // ...
}

if ($user->subscription()->onTrial()) {
    // ...
}
```
기존 체험 기간이 만료되었는지 확인하려면 `hasExpiredTrial` 메서드를 사용할 수 있습니다.

```
if ($user->hasExpiredTrial()) {
    // ...
}

if ($user->subscription()->hasExpiredTrial()) {
    // ...
}
```

특정 구독 타입에 대해 사용자가 체험 중인지 확인하려면, 타입을 파라미터로 전달하면 됩니다.

```
if ($user->onTrial('default')) {
    // ...
}

if ($user->hasExpiredTrial('default')) {
    // ...
}
```

<a name="without-payment-method-up-front"></a>
### 결제 정보 없이 제공하는 체험 기간

결제 정보를 미리 받지 않고 체험 기간을 제공하고 싶다면, 사용자의 고객 레코드에 있는 `trial_ends_at` 컬럼에 원하는 체험 기간 종료 날짜를 지정하면 됩니다. 이는 주로 회원가입 시 아래와 같이 처리할 수 있습니다.

```
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->addDays(10)
]);
```

Cashier는 이러한 체험 기간을 "일반(generic) 체험 기간"이라고 부릅니다. 이 유형은 특정 구독에 연결되어 있지 않습니다. `User` 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at` 이전이면 `true`를 반환합니다.

```
if ($user->onTrial()) {
    // 사용자가 체험 기간 내에 있습니다...
}
```

실제 구독을 생성할 준비가 되었다면, 평소처럼 `subscribe` 메서드를 사용합니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $user->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

사용자의 체험 기간 종료일을 알아내려면 `trialEndsAt` 메서드를 사용할 수 있습니다. 이 메서드는 체험 기간 중이라면 Carbon 날짜 인스턴스를 반환하고, 그렇지 않으면 `null`을 반환합니다. 구독 타입을 파라미터로 전달하면 기본이 아닌 특정 구독의 체험 종료일도 조회할 수 있습니다.

```
if ($user->onTrial('default')) {
    $trialEndsAt = $user->trialEndsAt();
}
```

아직 실제 구독은 생성하지 않았고, "일반적인(generic)" 체험 기간 상태인지 알고 싶다면, `onGenericTrial` 메서드를 사용할 수 있습니다.

```
if ($user->onGenericTrial()) {
    // 사용자가 "일반(generic)" 체험 기간 내에 있습니다...
}
```

<a name="extend-or-activate-a-trial"></a>
### 체험 기간 연장 또는 즉시 활성화

현재 구독의 체험 기간을 연장하려면 `extendTrial` 메서드를 호출하고, 체험 기간이 끝나는 시점을 지정합니다.

```
$user->subsription()->extendTrial(now()->addDays(5));
```

혹은, 구독의 체험 기간을 즉시 종료시키고 구독을 활성화하려면 `activate` 메서드를 사용할 수 있습니다.

```
$user->subscription()->activate();
```

<a name="handling-paddle-webhooks"></a>
## Paddle 웹훅(Webhook) 처리하기

Paddle은 다양한 이벤트를 웹훅을 통해 애플리케이션에 알릴 수 있습니다. 기본적으로, Cashier의 서비스 프로바이더는 Cashier의 웹훅 컨트롤러로 연결되는 라우트를 등록합니다. 이 컨트롤러가 모든 웹훅 요청을 처리합니다.

이 기본 컨트롤러는 결제 실패로 인한 구독 취소, 구독 업데이트, 결제 수단 변경 등 일반적인 Paddle 웹훅을 자동으로 처리합니다. 하지만 필요하다면 이 컨트롤러를 확장하여 원하는 Paddle 웹훅 이벤트를 처리할 수도 있습니다.

애플리케이션이 Paddle 웹훅을 올바르게 처리할 수 있도록, 반드시 [Paddle 컨트롤 패널에서 웹훅 URL을 설정](https://vendors.paddle.com/alerts-webhooks)해야 합니다. 기본적으로 Cashier의 웹훅 컨트롤러는 `/paddle/webhook` 경로로 요청을 받습니다. Paddle 컨트롤 패널에서 활성화해야 할 웹훅의 전체 목록은 다음과 같습니다.

- Customer Updated
- Transaction Completed
- Transaction Updated
- Subscription Created
- Subscription Updated
- Subscription Paused
- Subscription Canceled

> [!WARNING]
> Cashier가 제공하는 [웹훅 서명 검증](/docs/10.x/cashier-paddle#verifying-webhook-signatures) 미들웨어로 들어오는 웹훅 요청을 반드시 보호해야 합니다.

<a name="webhooks-csrf-protection"></a>
#### 웹훅과 CSRF 보호

Paddle 웹훅이 Laravel의 [CSRF 보호](/docs/10.x/csrf)를 우회해야 하므로, `App\Http\Middleware\VerifyCsrfToken` 미들웨어에서 해당 URI를 예외로 등록하거나, `web` 미들웨어 그룹 외부에 해당 라우트를 정의해야 합니다.

```
protected $except = [
    'paddle/*',
];
```

<a name="webhooks-local-development"></a>
#### 웹훅과 로컬 개발 환경

로컬 개발 환경에서 Paddle이 애플리케이션에 웹훅을 보낼 수 있으려면, [Ngrok](https://ngrok.com/)이나 [Expose](https://expose.dev/docs/introduction)와 같은 사이트 공유 서비스를 사용해 애플리케이션을 외부에 노출해야 합니다. [Laravel Sail](/docs/10.x/sail)을 사용 중이라면, Sail의 [사이트 공유 명령어](/docs/10.x/sail#sharing-your-site)를 활용할 수 있습니다.

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의하기

Cashier는 결제 실패에 따른 구독 취소 등 일반적인 Paddle 웹훅을 자동으로 처리합니다. 추가적으로 처리하고 싶은 웹훅 이벤트가 있다면, Cashier가 디스패치하는 다음과 같은 이벤트들을 청취(listen)함으로써 직접 핸들러를 구현할 수 있습니다.

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

이 두 이벤트 모두 Paddle 웹훅의 전체 페이로드를 포함합니다. 예를 들어, `transaction_billed` 웹훅을 직접 처리하고 싶다면, 아래와 같이 [리스너](/docs/10.x/events#defining-listeners)를 등록할 수 있습니다.

```
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * Paddle 웹훅을 처리합니다.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['alert_name'] === 'transaction_billed') {
            // 웹훅 이벤트 처리...
        }
    }
}
```

리스너를 정의했다면, 애플리케이션의 `EventServiceProvider`에 등록합니다.

```
<?php

namespace App\Providers;

use App\Listeners\PaddleEventListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Laravel\Paddle\Events\WebhookReceived;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        WebhookReceived::class => [
            PaddleEventListener::class,
        ],
    ];
}
```

Cashier는 수신된 웹훅 타입에 따라 전용 이벤트도 발생시킵니다. 이 전용 이벤트에는 Paddle에서 받은 전체 페이로드와 함께, 웹훅 처리에 사용된 관련 모델(청구 대상 모델, 구독, 영수증 등)도 포함됩니다.

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\CustomerUpdated`
- `Laravel\Paddle\Events\TransactionCompleted`
- `Laravel\Paddle\Events\TransactionUpdated`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionPaused`
- `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

기본 제공되는 웹훅 라우트를 오버라이드(재정의)하려면, 애플리케이션의 `.env` 파일에서 `CASHIER_WEBHOOK` 환경 변수를 정의하면 됩니다. 이 값에는 웹훅 라우트의 전체 URL을 입력해야 하며, Paddle 컨트롤 패널에서 설정한 URL과 일치해야 합니다.

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### 웹훅 서명 검증

웹훅의 보안을 강화하려면 [Paddle의 웹훅 서명 기능](https://developer.paddle.com/webhook-reference/verifying-webhooks)을 사용해야 합니다. Cashier는 Paddle 웹훅 요청의 유효성을 검증하는 미들웨어를 자동으로 포함하고 있습니다.

웹훅 서명 검증을 사용하려면, 애플리케이션의 `.env` 파일에서 `PADDLE_WEBHOOK_SECRET` 환경 변수를 반드시 정의해야 합니다. 서명 비밀값은 Paddle 계정 대시보드에서 확인할 수 있습니다.

<a name="single-charges"></a>
## 단건 결제

<a name="charging-for-products"></a>
### 상품에 대한 결제 생성

고객이 상품을 구매할 수 있도록 하려면, 청구 대상 모델 인스턴스에 `checkout` 메서드를 사용하여 상품 구매용 checkout 세션을 생성할 수 있습니다. `checkout` 메서드는 하나 또는 여러 개의 Price ID를 인자로 받을 수 있으며, 필요한 경우 배열로 수량을 지정할 수도 있습니다.

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

    return view('buy', ['checkout' => $checkout]);
});
```

checkout 세션을 생성한 후, Cashier에서 제공하는 `paddle-button` [Blade 컴포넌트](#overlay-checkout)를 사용하여 사용자가 Paddle checkout 위젯을 통해 결제를 마치도록 할 수 있습니다.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

Checkout 세션에는 `customData` 메서드가 있어서, 생성되는 거래 정보에 원하는 커스텀 데이터를 추가로 전달할 수 있습니다. 커스텀 데이터 사용에 대한 자세한 내용은 [Paddle 공식 문서](https://developer.paddle.com/build/transactions/custom-data)를 참고하세요.

```
$checkout = $user->checkout('pri_tshirt')
    ->customData([
        'custom_option' => $value,
    ]);
```

<a name="refunding-transactions"></a>
### 거래 환불하기(Refund)

거래를 환불하면, 금액이 고객이 결제에 사용한 결제 수단으로 반환됩니다. Paddle 구매를 환불하려면 `Cashier\Paddle\Transaction` 모델의 `refund` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인자로 환불 사유, 그리고 환불할 Price ID 목록과 (필요하다면) 환불 금액을 설정하는 배열을 받을 수 있습니다. 특정 청구 대상 모델의 거래 내역은 `transactions` 메서드를 통해 조회할 수 있습니다.

예를 들어, 가격 `pri_123`과 `pri_456`에 해당하는 거래를 환불한다고 가정해 봅시다. `pri_123`은 전액 환불하고, `pri_456`은 2달러만 부분 환불하려고 할 때의 예시입니다.

```
use App\Models\User;

$user = User::find(1);

$transaction = $user->transactions()->first();

$response = $transaction->refund('Accidental charge', [
    'pri_123', // 이 항목은 전체 환불...
    'pri_456' => 200, // 이 항목은 부분 환불(200 단위, 예시)...
]);
```

위 예시는 거래 내 특정 항목만을 환불합니다. 전체 거래를 전액 환불하려면 사유만 전달하면 됩니다.

```
$response = $transaction->refund('Accidental charge');
```

환불에 대한 더 자세한 내용은 [Paddle의 환불 공식 문서](https://developer.paddle.com/build/transactions/create-transaction-adjustments)를 참고하세요.

> [!WARNING]
> Paddle에서 환불이 최종 승인되어야만 실제로 환불 처리가 완료됩니다.

<a name="crediting-transactions"></a>
### 거래에 크레딧 지급하기

환불과 마찬가지로, 거래에 금액을 크레딧(적립)할 수도 있습니다. 거래에 크레딧을 지급하면, 고객의 잔액에 해당 금액이 추가되어 다음 결제에 사용할 수 있게 됩니다. 크레딧은 수동으로 결제된 거래에만 적용할 수 있으며, 자동으로 결제되는 거래(예: 구독)에는 적용할 수 없습니다. 구독 크레딧의 경우 Paddle이 자동으로 처리합니다.

```
$transaction = $user->transactions()->first();

// 특정 항목에 전체 크레딧 지급...
$response = $transaction->credit('Compensation', 'pri_123');
```

자세한 내용은 [Paddle의 크레딧 관련 공식 문서](https://developer.paddle.com/build/transactions/create-transaction-adjustments)를 참고하세요.

> [!WARNING]
> 크레딧은 반드시 수동 결제 거래에만 적용할 수 있습니다. 자동 결제 거래는 Paddle이 자체적으로 크레딧을 처리합니다.

<a name="transactions"></a>
## 거래(Transactions)

구독 또는 상품 구매 등에서 발생한 거래 내역은 청구 대상 모델의 `transactions` 속성을 통해 배열로 쉽게 조회할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$transactions = $user->transactions;
```

거래는 상품 및 구매에 대한 결제 내역을 나타내며, 인보이스와 함께 저장됩니다. 오직 완료된 거래만이 애플리케이션 데이터베이스에 저장됩니다.

고객의 거래 내역 목록을 표시할 때는 거래 인스턴스의 다양한 메서드를 활용하여 결제 정보를 보여줄 수 있습니다. 예를 들어, 거래 내역을 테이블로 나열하고 각 인보이스를 다운로드할 수 있도록 아래와 같이 구현할 수 있습니다.

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

`download-invoice` 라우트는 아래와 같이 정의할 수 있습니다.

```
use Illuminate\Http\Request;
use Laravel\Cashier\Transaction;

Route::get('/download-invoice/{transaction}', function (Request $request, Transaction $transaction) {
    return $transaction->redirectToInvoicePdf();
})->name('download-invoice');
```

<a name="past-and-upcoming-payments"></a>
### 과거 및 예정 결제 내역 조회

`lastPayment`, `nextPayment` 메서드를 사용하여 반복 결제 구독의 과거 결제 내역 또는 향후 예정된 결제 정보를 확인할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription();

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

이 두 메서드는 모두 `Laravel\Paddle\Payment` 인스턴스를 반환합니다. 단, 트랜잭션이 아직 웹훅으로 동기화되지 않았다면 `lastPayment`는 `null`을 반환하고, 결제 주기가 종료되었다면(예: 구독 취소 시) `nextPayment`도 `null`을 반환합니다.

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="testing"></a>
## 테스트

테스트를 진행할 때는 실제 결제 플로우를 수동으로 여러 차례 실행하여 결제 연동이 정상 동작하는지 반드시 확인해야 합니다.

CI 환경을 포함한 자동화 테스트를 위해서는 [Laravel의 HTTP 클라이언트](/docs/10.x/http-client#testing)를 사용해 Paddle로 전송하는 HTTP 호출을 fake 처리할 수 있습니다. 이 방법은 실제로 Paddle의 응답을 테스트하는 것은 아니지만, Paddle API를 직접 호출하지 않아도 애플리케이션의 로직을 검증할 수 있도록 도와줍니다.