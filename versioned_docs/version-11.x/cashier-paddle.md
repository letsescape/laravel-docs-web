# 라라벨 Cashier, Paddle (Laravel Cashier (Paddle))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
    - [Paddle Sandbox](#paddle-sandbox)
- [구성](#configuration)
    - [결제 대상 모델](#billable-model)
    - [API 키](#api-keys)
    - [Paddle JS](#paddle-js)
    - [통화 설정](#currency-configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [빠른 시작](#quickstart)
    - [제품 판매하기](#quickstart-selling-products)
    - [구독 판매하기](#quickstart-selling-subscriptions)
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
    - [단일 구독 결제](#subscription-single-charges)
    - [결제 정보 업데이트](#updating-payment-information)
    - [요금제 변경](#changing-plans)
    - [구독 수량](#subscription-quantity)
    - [여러 상품이 포함된 구독](#subscriptions-with-multiple-products)
    - [다중 구독](#multiple-subscriptions)
    - [구독 일시정지](#pausing-subscriptions)
    - [구독 취소](#canceling-subscriptions)
- [구독 체험 기간](#subscription-trials)
    - [결제수단 선등록 체험](#with-payment-method-up-front)
    - [결제수단 미등록 체험](#without-payment-method-up-front)
    - [체험 기간 연장 또는 활성화](#extend-or-activate-a-trial)
- [Paddle Webhook 처리하기](#handling-paddle-webhooks)
    - [Webhook 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [Webhook 서명 검증](#verifying-webhook-signatures)
- [단발 결제](#single-charges)
    - [제품 결제](#charging-for-products)
    - [거래 환불](#refunding-transactions)
    - [거래 크레딧 발급](#crediting-transactions)
- [거래](#transactions)
    - [지나간 결제 및 다가오는 결제](#past-and-upcoming-payments)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

> [!WARNING]  
> 이 문서는 Cashier Paddle 2.x와 Paddle Billing의 연동을 다룹니다. 아직 Paddle Classic을 사용하고 있다면 [Cashier Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x)를 사용해야 합니다.

[라라벨 Cashier Paddle](https://github.com/laravel/cashier-paddle)은 [Paddle](https://paddle.com)의 구독 결제 서비스와 연동되는 직관적이고 유연한 인터페이스를 제공합니다. 이 패키지는 여러분이 직접 작성하기 번거로운 반복적인 구독 결제 관련 코드를 대부분 처리해줍니다. 기본적인 구독 관리 기능 외에도, Cashier는 구독 "스왑"(요금제 변경), 구독 수량, 일시정지, 취소 유예 기간 등 다양한 기능을 지원합니다.

Cashier Paddle을 본격적으로 사용하기 전에, Paddle의 [개념 가이드](https://developer.paddle.com/concepts/overview)와 [API 문서](https://developer.paddle.com/api-reference/overview)도 함께 살펴보기를 권장합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier를 새로운 버전으로 업그레이드할 때는, 반드시 [업그레이드 가이드](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md)를 꼼꼼하게 확인해야 합니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용해 Paddle용 Cashier 패키지를 설치합니다:

```shell
composer require laravel/cashier-paddle
```

다음으로, `vendor:publish` 아티즌 명령어를 이용해 Cashier의 마이그레이션 파일을 애플리케이션에 게시합니다:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

이제 애플리케이션의 데이터베이스 마이그레이션을 실행해야 합니다. Cashier 마이그레이션은 새로운 `customers` 테이블을 생성합니다. 또한, 모든 고객의 구독 정보를 저장하기 위한 `subscriptions`와 `subscription_items` 테이블이 생성됩니다. 마지막으로 고객과 연관된 모든 Paddle 거래 내역을 저장하기 위한 `transactions` 테이블도 생성됩니다:

```shell
php artisan migrate
```

> [!WARNING]  
> Cashier가 모든 Paddle 이벤트를 올바르게 처리할 수 있도록, 반드시 [Cashier의 Webhook 처리 기능을 설정](#handling-paddle-webhooks)해야 합니다.

<a name="paddle-sandbox"></a>
### Paddle Sandbox

로컬 및 스테이징 환경에서 개발할 때는, [Paddle Sandbox 계정](https://sandbox-login.paddle.com/signup)을 등록해 테스트 환경을 마련하는 것이 좋습니다. 이 샌드박스 계정은 실제 결제가 발생하지 않는 테스트용 환경에서 애플리케이션을 개발, 테스트할 수 있게 해줍니다. Paddle의 [테스트 카드 번호](https://developer.paddle.com/concepts/payment-methods/credit-debit-card)를 활용해 다양한 결제 시나리오도 시뮬레이션할 수 있습니다.

Paddle Sandbox를 사용하는 경우 애플리케이션의 `.env` 파일에 `PADDLE_SANDBOX` 환경 변수를 `true`로 설정해야 합니다:

```ini
PADDLE_SANDBOX=true
```

개발을 모두 마친 후에는 [Paddle 벤더(판매자) 계정](https://paddle.com)을 신청할 수 있습니다. 본격적인 운영 환경(프로덕션)에 애플리케이션을 배포하기 전, Paddle에서는 여러분의 애플리케이션 도메인에 대한 승인 절차를 거칠 수 있습니다.

<a name="configuration"></a>
## 구성

<a name="billable-model"></a>
### 결제 대상 모델

Cashier를 사용하기 전에, 반드시 사용자(User) 모델에 `Billable` 트레이트를 추가해야 합니다. 이 트레이트는 구독 생성, 결제수단 정보 업데이트 등 다양한 결제 관련 작업을 쉽게 수행할 수 있도록 여러 메서드를 제공합니다:

```
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

사용자 이외의 다른 엔티티(예: 팀 등)도 결제 대상이 될 필요가 있다면, 해당 클래스에도 `Billable` 트레이트를 추가해 활용할 수 있습니다:

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

다음으로, Paddle에서 발급받은 키 값을 애플리케이션의 `.env` 파일에 설정해야 합니다. Paddle API 키는 Paddle 관리 콘솔에서 확인할 수 있습니다:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

`PADDLE_SANDBOX` 환경 변수는 [Paddle Sandbox 환경](#paddle-sandbox)를 사용할 때 `true`로 설정해야 합니다. 실 운영 환경에서 Paddle의 라이브 벤더 계정을 사용할 경우, 이 변수를 `false`로 변경해야 합니다.

`PADDLE_RETAIN_KEY`는 선택 사항이며, Paddle의 [Retain](https://developer.paddle.com/paddlejs/retain) 기능을 사용하는 경우에만 설정하면 됩니다.

<a name="paddle-js"></a>
### Paddle JS

Paddle 결제 위젯은 자체 JavaScript 라이브러리(Paddle.js)에 의존합니다. 이 라이브러리를 불러오기 위해 애플리케이션 레이아웃의 `</head>` 태그 바로 앞에 `@paddleJS` Blade 디렉티브를 추가하세요:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### 통화 설정

인보이스 등에 표시되는 금액의 형식(locale)을 지정할 수도 있습니다. 내부적으로 Cashier는 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 이용해 통화 형식을 설정합니다:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]  
> `en`이 아닌 로케일(locale)을 사용하려면, 반드시 `ext-intl` PHP 확장 모듈이 서버에 설치되어 있고, 올바르게 설정되어 있어야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Cashier에서 내부적으로 사용하는 모델(예: 구독, 거래 등)을 확장하려면, Cashier의 기본 모델을 상속받아 자체 모델을 정의할 수 있습니다:

```
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

커스텀 모델을 정의한 후, Cashier가 해당 커스텀 모델을 사용하도록 `Laravel\Paddle\Cashier` 클래스에서 설정해줘야 합니다. 보통 이 작업은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 수행합니다:

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
> Paddle Checkout을 사용하기 전에, Paddle 대시보드에서 반드시 고정 가격의 제품(Product)을 먼저 정의해야 합니다. 또한, [Paddle webhook 처리](#handling-paddle-webhooks)도 반드시 설정해야 합니다.

애플리케이션에서 상품 또는 구독 결제를 제공하는 것은 다소 복잡하게 느껴질 수 있습니다. 하지만 Cashier와 [Paddle의 Checkout Overlay](https://www.paddle.com/billing/checkout)를 활용하면, 쉽고 견고한 결제 통합 기능을 구현할 수 있습니다.

일회성 상품(정기 결제가 아닌 단일 결제)의 경우, Cashier를 이용해 Paddle의 Checkout Overlay를 통해 고객이 직접 결제 정보를 입력하고 구매를 완료하도록 할 수 있습니다. 결제가 완료되면 Paddle Checkout Overlay에서 애플리케이션 내 원하는 성공 URL로 고객이 리다이렉트됩니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout('pri_deluxe_album')
        ->returnTo(route('dashboard'));

    return view('buy', ['checkout' => $checkout]);
})->name('checkout');
```

위 예시에서 볼 수 있듯, Cashier가 제공하는 `checkout` 메서드를 사용하여 Paddle Checkout Overlay에 전달할 "가격 식별자(price identifier)"로 체크아웃 객체를 만듭니다. Paddle에서 "prices"는 [특정 상품에 대한 고정 가격 정보](https://developer.paddle.com/build/products/create-products-prices)를 의미합니다.

`checkout` 메서드는 필요시 Paddle에 고객 정보를 자동으로 생성하고, 해당 Paddle 고객 레코드를 애플리케이션 데이터베이스의 사용자와 연동합니다. 결제가 끝나면 고객은 별도의 성공 페이지로 이동시키게 되며, 여기서 안내 메시지를 보여줄 수 있습니다.

`buy` 뷰에서는, Checkout Overlay를 띄울 버튼을 추가해야 합니다. Cashier Paddle은 `paddle-button` Blade 컴포넌트를 기본 제공합니다. 별도로 [오버레이 체크아웃을 수동 렌더링](#manually-rendering-an-overlay-checkout)할 수도 있습니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a name="providing-meta-data-to-paddle-checkout"></a>
#### Paddle Checkout에 메타 데이터 전달하기

제품을 판매할 때, 보통 주문 완료 내역과 상품 구매 정보를 자체적으로 정의한 `Cart` 및 `Order` 모델에 저장하고자 합니다. Paddle의 Checkout Overlay로 결제 페이지로 이동시킬 때, 기존 주문의 식별자 등 추가 정보가 필요할 수 있습니다. 이렇게 하면 결제 후 고객이 애플리케이션으로 돌아올 때 해당 주문과 구매를 연결할 수 있습니다.

이를 위해, `checkout` 메서드에 커스텀 데이터를 배열 형식으로 전달할 수 있습니다. 예를 들어, 사용자가 결제 프로세스를 시작하면, 애플리케이션에서 미완료 상태의 `Order`를 미리 생성한다고 가정해 봅시다. (`Cart`와 `Order` 모델은 Cashier에서 직접 제공하는 것이 아니며, 여러분이 자체적으로 구현해야 하는 예제 개념임에 유의하세요.)

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

위 예시처럼, 결제 프로세스가 시작되면 장바구니/주문에 연관된 Paddle 가격 식별자 배열을 `checkout` 메서드에 전달합니다. 이 항목들은 애플리케이션이 장바구니 또는 주문과 연동하여 관리해야 합니다. 추가로, 주문의 ID를 `customData` 메서드를 이용해 Paddle Checkout Overlay로도 전달할 수 있습니다.

물론, 고객의 결제가 정말 끝났을 때 해당 주문(status)을 "완료"로 바꾸고 싶을 것입니다. 이를 위해서는 Paddle이 발송하는 webhook을 Cashier가 이벤트로 발생시키는데, 이 이벤트를 감지해서 주문 정보를 저장할 수 있습니다.

먼저, Cashier가 디스패치하는 `TransactionCompleted` 이벤트를 리스닝해야 합니다. 보통 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 이벤트 리스너를 등록합니다:

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

이때, `CompleteOrder` 리스너는 대략 아래처럼 구현할 수 있습니다:

```
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

`transaction.completed` 이벤트에 포함된 데이터에 대한 자세한 내용은 Paddle 공식 문서를 참고하시기 바랍니다: [Paddle 문서에서 확인하기](https://developer.paddle.com/webhooks/transactions/transaction-completed).

<a name="quickstart-selling-subscriptions"></a>
### 구독 판매하기

> [!NOTE]  
> Paddle Checkout을 사용하기 전에, Paddle 대시보드에서 반드시 고정 가격의 제품(Product)을 먼저 정의해야 합니다. 또한, [Paddle webhook 처리](#handling-paddle-webhooks)도 반드시 설정해야 합니다.

애플리케이션에서 상품 또는 구독 결제를 제공하는 것은 다소 복잡하게 느껴질 수 있습니다. 하지만 Cashier와 [Paddle의 Checkout Overlay](https://www.paddle.com/billing/checkout)를 활용하면, 쉽고 견고한 결제 통합 기능을 구현할 수 있습니다.

Cashier와 Paddle Checkout Overlay를 사용하여 구독 상품을 판매하는 방법을 살펴보겠습니다. 예를 들어, 월간(`price_basic_monthly`)과 연간(`price_basic_yearly`)으로 나뉜 기본 요금제를 운영한다고 가정합니다. 이 두 가격은 Paddle 대시보드의 "Basic" 상품(`pro_basic`)에 묶어서 사용할 수 있습니다. 또한, 전문가용(Expert) 요금제는 `pro_expert`로 제공한다고 가정할 수 있습니다.

먼저, 고객이 실제로 구독을 시작하는 방법을 예로 들어보겠습니다. 예를 들어, 애플리케이션의 가격 안내 페이지에서 "구독하기" 버튼을 눌렀을 때, 선택한 요금제에 맞게 Paddle Checkout Overlay가 열리게 구현할 수 있습니다. `checkout` 메서드를 통해 체크아웃 세션을 시작하는 방식은 다음과 같습니다:

```
use Illuminate\Http\Request;

Route::get('/subscribe', function (Request $request) {
    $checkout = $request->user()->checkout('price_basic_monthly')
        ->returnTo(route('dashboard'));

    return view('subscribe', ['checkout' => $checkout]);
})->name('subscribe');
```

`subscribe` 뷰에서는, Checkout Overlay를 띄울 버튼을 추가해야 합니다. Cashier Paddle은 `paddle-button` Blade 컴포넌트를 기본 제공합니다. 별도로 [오버레이 체크아웃을 수동 렌더링](#manually-rendering-an-overlay-checkout)할 수도 있습니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

이제 구독 버튼을 클릭하면, 고객이 결제 정보를 입력해 구독을 바로 시작할 수 있습니다. 단, 일부 결제수단은 결제 처리에 시간이 다소 걸릴 수도 있으므로, 구독이 실제로 시작됐는지 확인할 수 있도록 [Cashier의 Webhook 처리](#handling-paddle-webhooks)도 꼭 설정해야 합니다.

고객이 구독을 할 수 있게 됐다면, 이제 애플리케이션에서 구독된 사용자만 접근할 수 있는 특정 영역(페이지 등)을 제한하는 것이 필요합니다. Cashier의 `Billable` 트레이트가 제공하는 `subscribed` 메서드를 활용해, 사용자의 현재 구독 상태를 쉽게 확인할 수 있습니다:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

특정 상품(Product)이나 가격(Price)에 구독했는지도 아주 쉽게 판별할 수 있습니다:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### 구독 미들웨어 만들기

실제 현업에서는, 요청이 구독한 사용자인지를 판단하는 [미들웨어](/docs/11.x/middleware)를 구현해두면 편리합니다. 이 미들웨어를 관련 라우트에 지정하면, 구독하지 않은 사용자의 접근을 손쉽게 차단할 수 있습니다:

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
            // 사용자를 결제 페이지로 리다이렉트하고, 구독을 안내...
            return redirect('/subscribe');
        }

        return $next($request);
    }
}
```

이제 미들웨어를 원하는 라우트에 적용하면 됩니다:

```
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### 고객의 구독 플랜 변경 허용하기

고객은 구독 중인 요금제를 다른 상품이나 "티어"로 바꾸고 싶을 수 있습니다. 앞서 예시처럼, 월간 구독에서 연간 구독으로 플랜을 변경할 수 있도록 기능을 제공해야 합니다. 이를 위해, 아래와 같이 새로운 가격ID가 전달되는 라우트와 버튼을 구현할 수 있습니다:

```
use Illuminate\Http\Request;

Route::put('/subscription/{price}/swap', function (Request $request, $price) {
    $user->subscription()->swap($price); // 이 예시에서는 "$price"가 "price_basic_yearly"가 될 것입니다.

    return redirect()->route('dashboard');
})->name('subscription.swap');
```

플랜 스왑 외에도, 고객이 구독을 취소할 수 있도록 하는 기능 역시 필요합니다. 플랜 변경과 마찬가지로 아래와 같이 버튼과 라우트를 구현합니다:

```
use Illuminate\Http\Request;

Route::put('/subscription/cancel', function (Request $request, $price) {
    $user->subscription()->cancel();

    return redirect()->route('dashboard');
})->name('subscription.cancel');
```

이렇게 하면, 구독은 현재 청구 기간이 끝나는 시점에 취소됩니다.

> [!NOTE]  
> Cashier의 webhook 처리를 올바르게 설정해 놓았다면, Cashier는 Paddle로부터 수신된 웹훅을 분석하여 애플리케이션의 Cashier 관련 DB 테이블이 항상 동기화되도록 자동으로 관리해줍니다. 예를 들어, Paddle 대시보드 상에서 직접 고객의 구독을 취소했을 때도, Cashier는 해당 웹훅을 받아와 애플리케이션의 구독 상태를 "취소됨"으로 즉시 갱신합니다.

<a name="checkout-sessions"></a>
## 체크아웃 세션

실제 고객 결제 작업의 대부분은 Paddle의 [Checkout Overlay 위젯](https://developer.paddle.com/build/checkout/build-overlay-checkout)이나 [인라인 체크아웃](https://developer.paddle.com/build/checkout/build-branded-inline-checkout)을 활용해 "체크아웃"을 통해 이뤄집니다.

Paddle로 체크아웃 결제를 진행하기 전, 여러분의 애플리케이션 Paddle 대시보드에서 [기본 결제 링크](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link)를 반드시 정의해야 합니다.

<a name="overlay-checkout"></a>
### 오버레이 체크아웃

체크아웃 Overlay 위젯을 띄우기 전에, Cashier를 통해 체크아웃 세션을 먼저 생성해야 합니다. 이 체크아웃 세션을 통해 어떤 결제 작업을 진행할지 웹 위젯에 알려줍니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Cashier는 `paddle-button` [Blade 컴포넌트](/docs/11.x/blade#components)를 제공합니다. 이 컴포넌트에 체크아웃 세션 객체를 prop으로 넘기면, 버튼 클릭 시 Paddle의 결제 위젯이 표시됩니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

기본적으로 Paddle의 기본 스타일링이 적용된 위젯이 표시됩니다. `data-theme='light'`와 같이 [Paddle에서 지원하는 속성(attribute)들](https://developer.paddle.com/paddlejs/html-data-attributes)로 위젯을 커스터마이즈할 수도 있습니다:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

Paddle의 결제 위젯은 비동기적으로 작동합니다. 사용자가 위젯에서 구독을 생성하면 Paddle은 웹훅을 발송하여 애플리케이션의 구독 상태 변경 정보를 전달합니다. 그러므로 Paddle에서 상태 변동이 생겼을 때 제대로 처리가 되도록, 반드시 [웹훅을 올바르게 설정](#handling-paddle-webhooks)해야 합니다.

> [!WARNING]  
> 구독 상태가 변할 경우, 해당 웹훅이 도착하기까지의 지연은 아주 짧은 편이지만, 실제 결제가 끝났다고 바로 구독상태가 갱신되지 않을 수 있음을 감안해야 합니다.

<a name="manually-rendering-an-overlay-checkout"></a>
#### 오버레이 체크아웃 수동 렌더링

라라벨이 제공하는 Blade 컴포넌트 대신 오버레이 체크아웃을 직접 구현해서 렌더링할 수도 있습니다. 먼저, [이전 예시와 동일하게](#overlay-checkout) 체크아웃 세션을 생성합니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

이제 Paddle.js를 사용해 체크아웃을 초기화할 수 있습니다. 아래 예시는 `paddle_button` 클래스를 가진 링크를 만들고, Paddle.js가 이를 감지해 클릭 시 Overlay 체크아웃을 표시하도록 한 예시입니다:

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

Paddle의 "오버레이" 방식 대신, 결제 위젯을 화면 내부에 직접 표출(임베드)할 수도 있습니다. 이 방식은 결제 HTML 필드를 마크업 수준에서 직접 조정할 수는 없지만, 애플리케이션 내에서 결제되지도록 위젯을 삽입하는 데에 적합합니다.

Cashier는 인라인 체크아웃도 쉽게 구현할 수 있도록 `paddle-checkout` Blade 컴포넌트를 제공합니다. 먼저, [체크아웃 세션을 생성](#overlay-checkout)합니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

이제 Blade 컴포넌트의 `checkout` 속성에 체크아웃 세션을 넘겨주면 됩니다:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

인라인 체크아웃 컴포넌트의 높이는 `height` 속성을 지정해 조정할 수 있습니다:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

인라인 체크아웃의 커스터마이징 옵션에 대해서는 Paddle의 [Inline Checkout 가이드](https://developer.paddle.com/build/checkout/build-branded-inline-checkout)와 [설정 문서](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings)를 참고하세요.

<a name="manually-rendering-an-inline-checkout"></a>
#### 인라인 체크아웃 수동 렌더링

라라벨의 Blade 컴포넌트를 사용하지 않고 직접 인라인 체크아웃을 렌더링할 수 있습니다. 먼저, [이전 예시처럼](#inline-checkout) 체크아웃 세션을 생성합니다:

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

그 다음, Paddle.js를 사용해 체크아웃을 초기화합니다. 아래 예시는 [Alpine.js](https://github.com/alpinejs/alpine)를 활용한 방식이며, 프론트엔드 스택에 맞게 자유롭게 수정할 수 있습니다:

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

애플리케이션에 계정을 만들지 않은 사용자도 결제 세션을 생성해야 할 때가 있습니다. 이럴 때는 `guest` 메서드를 사용할 수 있습니다.

```
use Illuminate\Http\Request;
use Laravel\Paddle\Checkout;

Route::get('/buy', function (Request $request) {
    $checkout = Checkout::guest(['pri_34567'])
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

이렇게 생성한 체크아웃 세션을 [Paddle 버튼](#overlay-checkout) 또는 [인라인 체크아웃](#inline-checkout) Blade 컴포넌트에 전달해 사용할 수 있습니다.

<a name="price-previews"></a>
## 가격 미리보기

Paddle에서는 통화별로 가격을 다르게 지정할 수 있어, 국가마다 서로 다른 가격을 설정할 수 있습니다. Cashier Paddle을 사용하면 `previewPrices` 메서드를 통해 이러한 모든 가격 정보를 조회할 수 있습니다. 이 메서드에는 조회하고 싶은 가격 ID들을 배열로 전달합니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

기본적으로 통화는 요청의 IP 주소를 바탕으로 판단됩니다. 하지만 특정 국가의 가격을 조회하고 싶다면 추가로 국가 정보를 명시할 수도 있습니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
    'country_code' => 'BE',
    'postal_code' => '1234',
]]);
```

가격 정보를 받아온 후에는 원하는 방식으로 가격 목록을 보여주면 됩니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

또한, 아래와 같이 상품별로 소계와 세금을 따로 표시할 수도 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

자세한 내용은 [Paddle의 가격 미리보기 API 문서](https://developer.paddle.com/api-reference/pricing-preview/preview-prices)를 참고하세요.

<a name="customer-price-previews"></a>
### 고객별 가격 미리보기

이미 Paddle에 고객 정보가 등록되어 있다면, 해당 고객에게 적용되는 가격을 직접 조회할 수 있습니다. 이를 위해 고객 인스턴스에서 가격을 미리보기 하면 됩니다.

```
use App\Models\User;

$prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

내부적으로 Cashier는 사용자의 고객 ID를 이용해 해당 고객의 통화로 가격을 조회합니다. 예를 들어, 미국에 사는 사용자는 달러(USD)로, 벨기에에 사는 사용자는 유로(EUR)로 가격이 표시됩니다. 만약 해당 사용자와 일치하는 통화가 없으면 상품의 기본 통화가 사용됩니다. 상품이나 구독 요금제의 모든 가격은 Paddle 관리자 페이지에서 커스터마이즈할 수 있습니다.

<a name="price-discounts"></a>
### 할인 적용 가격

할인된 가격을 보여주고 싶다면, `previewPrices` 메서드의 두 번째 인자로 `discount_id` 옵션을 전달하면 됩니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
    'discount_id' => 'dsc_123'
]);
```

그리고 계산된 금액을 아래와 같이 출력하면 됩니다.

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
### 고객 기본값 설정

Cashier에서는 결제 세션 생성 시 고객 정보를 일부 자동으로 입력할 수 있도록 디폴트 값을 지정할 수 있습니다. 이렇게 하면 고객의 이메일과 이름을 미리 입력시켜 결제 위젯에서 바로 결제 단계로 넘어갈 수 있습니다. 이 기본값들은 billable 모델에서 아래와 같이 메서드를 오버라이드해 설정합니다.

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

이렇게 지정한 기본값은 Cashier에서 [결제 세션](#checkout-sessions)을 생성할 때마다 자동으로 사용됩니다.

<a name="retrieving-customers"></a>
### 고객 조회

Paddle 고객 ID로 고객을 조회하려면 `Cashier::findBillable` 메서드를 사용할 수 있습니다. 이 메서드는 billable 모델 인스턴스를 반환합니다.

```
use Laravel\Paddle\Cashier;

$user = Cashier::findBillable($customerId);
```

<a name="creating-customers"></a>
### 고객 생성

경우에 따라 Paddle 고객을 만들지만 곧바로 구독을 시작하지 않을 수 있습니다. 이럴 때는 `createAsCustomer` 메서드를 사용할 수 있습니다.

```
$customer = $user->createAsCustomer();
```

이 메서드는 `Laravel\Paddle\Customer` 인스턴스를 반환합니다. Paddle에 고객이 등록된 후 언제든지 구독을 시작할 수 있습니다. 또한, Paddle API에서 지원하는 [고객 생성 파라미터](https://developer.paddle.com/api-reference/customers/create-customer)들을 `$options` 배열로 전달할 수도 있습니다.

```
$customer = $user->createAsCustomer($options);
```

<a name="subscriptions"></a>
## 구독

<a name="creating-subscriptions"></a>
### 구독 생성

구독을 생성하려면, 먼저 billable 모델 인스턴스를 데이터베이스에서 조회합니다. 일반적으로 `App\Models\User` 인스턴스가 될 것입니다. 그런 다음, `subscribe` 메서드를 사용해 해당 모델의 결제 세션을 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($premium = 12345, 'default')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

`subscribe` 메서드의 첫 번째 인자는 사용자가 구독할 구체적인 가격(Price) 식별자입니다. 이 값은 Paddle에서 가격을 구분하는 식별자와 일치해야 합니다. `returnTo` 메서드는 사용자가 결제를 완료한 후 리다이렉트할 URL을 받습니다. `subscribe` 메서드의 두 번째 인자는 해당 구독의 내부용 "타입"을 지정합니다. 애플리케이션에서 하나의 구독만 제공한다면 이 값을 `default`나 `primary` 정도로 사용할 수 있습니다. 이 구독 타입은 어디까지나 내부적으로 사용하는 값이며, 사용자에게 보여주거나 변경해서는 안 됩니다. 또한, 타입 값에는 공백이 들어가면 안 되고, 한 번 생성한 후에는 절대 바뀌지 않아야 합니다.

구독과 관련해 기본 제공 필드 외에 추가적인 정보를 전달하고 싶다면 `customData` 메서드를 이용해 메타데이터 배열을 넘길 수 있습니다.

```
$checkout = $request->user()->subscribe($premium = 12345, 'default')
    ->customData(['key' => 'value'])
    ->returnTo(route('home'));
```

구독 결제 세션이 생성되면 `paddle-button` [Blade 컴포넌트](#overlay-checkout)에 아래처럼 전달해 사용할 수 있습니다.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

사용자가 결제를 끝내면, Paddle로부터 `subscription_created` 웹훅이 전송됩니다. Cashier는 이 웹훅을 받아 해당 고객의 구독을 애플리케이션에 자동으로 반영합니다. 모든 웹훅이 올바르게 수신 및 처리되도록 반드시 [웹훅 처리 설정](#handling-paddle-webhooks)을 마쳐 주셔야 합니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인

사용자가 구독한 후, 다양한 편의 메서드를 활용해 구독 상태를 쉽게 확인할 수 있습니다. 먼저, `subscribed` 메서드는 사용자가 유효한 구독(체험 기간(trial)도 포함)에 있는지 여부를 반환합니다.

```
if ($user->subscribed()) {
    // ...
}
```

애플리케이션이 여러 종류의 구독을 제공한다면, `subscribed` 메서드에 특정 구독 타입을 인자로 지정할 수도 있습니다.

```
if ($user->subscribed('default')) {
    // ...
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/11.x/middleware)로 활용해 사용자의 구독 상태에 따라 접근을 제한하는 데도 유용하게 쓸 수 있습니다.

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
            // 이 사용자는 결제 고객이 아닙니다...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

체험 기간(trial) 여부를 확인하고 싶다면 `onTrial` 메서드를 사용할 수 있습니다. 이를 통해, 아직 체험 기간인 사용자에게 경고 문구를 보여주는 등의 처리가 가능합니다.

```
if ($user->subscription()->onTrial()) {
    // ...
}
```

`subscribedToPrice` 메서드를 사용하면 주어진 Paddle 가격 ID로 해당 사용자가 특정 구독 요금제에 실제로 구독되어 있는지 확인할 수 있습니다. 예를 들어, 사용자의 `default` 구독이 월간 요금제에 가입되어 있는지 아래와 같이 검사할 수 있습니다.

```
if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
    // ...
}
```

`recurring` 메서드는 사용자가 체험 기간이나 유예 기간이 아닌, 실제로 활성 상태의 구독에 있는지도 확인할 수 있습니다.

```
if ($user->subscription()->recurring()) {
    // ...
}
```

<a name="canceled-subscription-status"></a>
#### 취소된 구독 상태

이전에 활성 구독이었지만 이제는 구독을 해지한 경우, `canceled` 메서드로 확인할 수 있습니다.

```
if ($user->subscription()->canceled()) {
    // ...
}
```

사용자가 구독을 해지했지만 아직 구독이 완전히 만료되지 않은 "유예 기간(grace period)"인지 여부도 아래처럼 확인하려면, `onGracePeriod` 메서드를 사용합니다. 예를 들어, 3월 5일에 구독을 해지했더라도 만료일이 3월 10일이었다면 3월 10일까지는 유예 기간입니다. 이 기간 동안에는 `subscribed` 메서드 역시 계속 `true`를 반환합니다.

```
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

<a name="past-due-status"></a>
#### 미납(past due) 상태

구독 결제에 실패하면, 해당 구독은 `past_due` 상태로 표시됩니다. 이때에는 고객이 결제 정보를 변경할 때까지 구독이 비활성화됩니다. 구독 인스턴스에서 `pastDue` 메서드로 현재 미납 상태인지 확인할 수 있습니다.

```
if ($user->subscription()->pastDue()) {
    // ...
}
```

구독이 미납상태라면 사용자가 [결제 정보를 업데이트](#updating-payment-information)하도록 안내해 주세요.

만약 `past_due` 상태에서도 구독이 유효한 것으로 간주하고 싶다면, Cashier에서 제공하는 `keepPastDueSubscriptionsActive` 메서드를 사용할 수 있습니다. 이 메서드는 보통 `AppServiceProvider`의 `register` 메서드에서 호출하면 됩니다.

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
> 구독이 `past_due` 상태일 때는 결제 정보를 갱신하기 전까지 변경이 불가능합니다. 따라서, `swap` 및 `updateQuantity` 메서드는 이 상태에서 예외를 발생시킵니다.

<a name="subscription-scopes"></a>
#### 구독 쿼리 스코프

대부분의 구독 상태는 쿼리 스코프로도 제공되어, 데이터베이스 내 특정 상태의 구독만 쉽게 조회할 수 있습니다.

```
// 모든 유효한 구독 조회...
$subscriptions = Subscription::query()->valid()->get();

// 특정 사용자의 취소된 구독만 조회...
$subscriptions = $user->subscriptions()->canceled()->get();
```

아래는 사용 가능한 모든 스코프 목록입니다.

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

구독 단일 청구 기능을 통해 기존 구독에 추가로 일회성 결제를 발생시킬 수 있습니다. `charge` 메서드 호출 시 하나 혹은 여러 가격 ID를 지정하면 됩니다.

```
// 하나의 가격 청구...
$response = $user->subscription()->charge('pri_123');

// 여러 개의 가격을 한 번에 청구...
$response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

`charge` 메서드는 실제 고객에게 바로 청구하지 않고, 다음 청구 주기 때 함께 부과합니다. 즉시 청구서를 발행하려면 `chargeAndInvoice` 메서드를 사용하면 됩니다.

```
$response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a name="updating-payment-information"></a>
### 결제 정보 업데이트

Paddle은 구독별로 항상 결제 수단을 저장합니다. 구독의 결제 수단을 변경하려면 구독 모델의 `redirectToUpdatePaymentMethod` 메서드를 이용해 Paddle에서 제공하는 결제 정보 변경 페이지로 리디렉션 시켜야 합니다.

```
use Illuminate\Http\Request;

Route::get('/update-payment-method', function (Request $request) {
    $user = $request->user();

    return $user->subscription()->redirectToUpdatePaymentMethod();
});
```

사용자가 결제 정보를 다 변경하면, Paddle에서 `subscription_updated` 웹훅을 전송하고, 이후 애플리케이션의 데이터베이스에도 변경 사항이 반영됩니다.

<a name="changing-plans"></a>
### 요금제 변경

사용자가 구독을 한 뒤에 요금제를 바꾸고 싶어할 수도 있습니다. 이때, 구독 인스턴스의 `swap` 메서드에 변경하려는 Paddle 가격 식별자를 전달하면 요금제를 갱신할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription()->swap($premium = 'pri_456');
```

즉시 요금제를 변경하고 바로 청구서도 발행하고 싶다면 `swapAndInvoice` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a name="prorations"></a>
#### 일할 계산(Prorations)

기본적으로 Paddle은 요금제 변경 시 요금을 일할 계산하여 환불 또는 추가 청구합니다. 일할 계산 없이 구독을 업데이트하려면 `noProrate` 메서드를 연결해 사용하면 됩니다.

```
$user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

일할 계산도 하지 않고, 즉시 청구까지 하고 싶다면 `noProrate`와 `swapAndInvoice`를 조합해서 사용하세요.

```
$user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

구독 변경에 대해 아예 요금을 청구하지 않으려면 `doNotBill` 메서드를 사용할 수도 있습니다.

```
$user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Paddle의 일할 계산 정책에 대한 더 자세한 내용은 [Paddle 공식 문서](https://developer.paddle.com/concepts/subscriptions/proration)를 참고하세요.

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

일부 구독은 "수량(quantity)"의 영향을 받기도 합니다. 예를 들어, 프로젝트 관리 앱에서 프로젝트당 월 $10을 부과하는 경우를 들 수 있습니다. 이럴 때 `incrementQuantity`와 `decrementQuantity` 메서드로 수량을 간편하게 증감시킬 수 있습니다.

```
$user = User::find(1);

$user->subscription()->incrementQuantity();

// 현재 구독 수량에 5 추가...
$user->subscription()->incrementQuantity(5);

$user->subscription()->decrementQuantity();

// 현재 구독 수량에서 5 차감...
$user->subscription()->decrementQuantity(5);
```

또는 `updateQuantity` 메서드로 원하는 수량을 명시적으로 지정할 수 있습니다.

```
$user->subscription()->updateQuantity(10);
```

일할 계산 없이 수량을 변경하려면 `noProrate` 메서드를 같이 사용합니다.

```
$user->subscription()->noProrate()->updateQuantity(10);
```

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 여러 상품이 포함된 구독에서의 수량

[여러 상품이 포함된 구독](#subscriptions-with-multiple-products)이라면, 수량을 변경할 가격의 ID를 두 번째 인자로 함께 전달해야 합니다.

```
$user->subscription()->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 여러 상품이 포함된 구독

[여러 상품이 포함된 구독](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons)을 사용하면 하나의 구독에 여러 결제 상품을 할당할 수 있습니다. 예를 들면, $10/월의 기본 구독에 $15/월 라이브챗 추가상품을 한 번에 제공하는 "헬프데스크" 앱을 생각해볼 수 있습니다.

구독 결제 세션을 생성할 때, `subscribe` 메서드의 첫 번째 인자로 가격 배열을 전달하면 하나의 구독에 여러 상품을 연결할 수 있습니다.

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

위 예시에서는 고객의 `default` 구독에 두 개의 가격이 연결됩니다. 두 상품 모두 각각의 청구 주기대로 별도로 요금이 부과됩니다. 필요하다면 key/value 쌍의 연관 배열을 사용해, 각 상품에 대한 수량도 지정할 수 있습니다.

```
$user = User::find(1);

$checkout = $user->subscribe('default', ['price_monthly', 'price_chat' => 5]);
```

기존 구독에 상품(가격)을 추가하고 싶다면 구독 인스턴스의 `swap` 메서드를 이용해야 합니다. 이때도 현재 구독에 속한 모든 가격과 수량을 함께 넘겨야 합니다.

```
$user = User::find(1);

$user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

이렇게 하면 새 가격이 추가되지만, 실제로 고객이 청구되는 것은 다음 결제 주기 때입니다. 즉시 빌링을 하려면 `swapAndInvoice` 메서드를 이용하세요.

```
$user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

특정 가격만 구독에서 제거하려면, `swap` 메서드의 배열에서 빼주면 됩니다.

```
$user->subscription()->swap(['price_original' => 2]);
```

> [!WARNING]  
> 구독에서 마지막 가격을 제거하는 것은 허용되지 않습니다. 그 대신 구독을 아예 취소해야 합니다.

<a name="multiple-subscriptions"></a>
### 여러 개의 구독

Paddle은 한 사용자가 동시에 여러 구독을 가질 수 있도록 지원합니다. 예를 들어, 헬스장에서 수영 구독과 웨이트 구독을 별도로 운용할 수 있습니다. 고객은 두 종류 모두, 혹은 원하는 한 가지만 선택해 구독할 수 있습니다.

애플리케이션에서 구독 생성 시, 두 번째 인자로 구독 타입을 지정할 수 있으며, 사용자가 원하는 구독을 구분하는 임의의 문자열을 사용할 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

    return view('billing', ['checkout' => $checkout]);
});
```

이 예시에서는 고객에게 월간 수영 구독을 생성했습니다. 나중에 연간 구독으로 변경하고 싶다면 해당 구독 타입에 대해 가격만 변경해주면 됩니다.

```
$user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

물론, 구독 자체를 완전히 취소할 수도 있습니다.

```
$user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>
### 구독 일시 중지

구독을 일시적으로 중지하고 싶다면, 구독 인스턴스에서 `pause` 메서드를 호출하세요.

```
$user->subscription()->pause();
```

구독이 일시 중지되면, Cashier는 데이터베이스의 `paused_at` 컬럼을 자동으로 설정합니다. 이 필드는 언제부터 `paused` 메서드가 `true`를 반환해야 하는지를 결정하는 용도로 사용됩니다. 예를 들어, 3월 1일에 구독을 일시 중지해도 실제 결제 주기가 3월 5일이었다면 3월 5일까지는 `paused`가 계속 `false`를 반환합니다. 일반적으로 사용자는 결제 기간이 끝날 때까지 애플리케이션을 계속 이용할 수 있기 때문입니다.

기본적으로는 다음 결제 주기에 맞춰 일시 중지가 적용되어, 남은 결제 기간 동안은 서비스를 계속 이용할 수 있습니다. 즉시 일시 중지하려면 `pauseNow` 메서드를 사용하세요.

```
$user->subscription()->pauseNow();
```

또는 `pauseUntil` 메서드로 원하는 시점까지 일시 중지하도록 예약할 수 있습니다.

```
$user->subscription()->pauseUntil(now()->addMonth());
```

즉시 일시 중지한 뒤, 특정 시점까지 중지를 유지하려면 `pauseNowUntil` 메서드를 사용합니다.

```
$user->subscription()->pauseNowUntil(now()->addMonth());
```

구독이 일시 중지됐지만 아직 "유예 기간"에 있는지도 `onPausedGracePeriod` 메서드로 판단할 수 있습니다.

```
if ($user->subscription()->onPausedGracePeriod()) {
    // ...
}
```

일시 중지된 구독을 다시 활성화하려면 `resume` 메서드를 호출하면 됩니다.

```
$user->subscription()->resume();
```

> [!WARNING]  
> 구독이 일시 중지된 상태에서는 어떠한 변경도 할 수 없습니다. 다른 요금제로 변경하거나 수량을 수정하고 싶다면 먼저 구독을 재개(resume)해야 합니다.

<a name="canceling-subscriptions"></a>

### 구독 취소

구독을 취소하려면, 사용자 구독 인스턴스에서 `cancel` 메서드를 호출합니다.

```
$user->subscription()->cancel();
```

구독이 취소되면, Cashier는 데이터베이스의 `ends_at` 컬럼을 자동으로 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 하는지를 판별하는 데 사용됩니다. 예를 들어, 사용자가 3월 1일에 구독을 취소했지만, 구독이 실제로는 3월 5일에 종료될 예정이라면, `subscribed` 메서드는 3월 5일까지 계속 `true`를 반환합니다. 이는 보통 사용자가 결제 주기 마지막까지 애플리케이션을 계속 이용할 수 있도록 허용하기 위해서입니다.

사용자가 구독은 취소했지만 아직 "유예 기간(grace period)"이 남아있는지 확인하려면 `onGracePeriod` 메서드를 사용할 수 있습니다.

```
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

구독을 즉시 취소하고 싶다면, 구독 인스턴스에서 `cancelNow` 메서드를 호출할 수 있습니다.

```
$user->subscription()->cancelNow();
```

유예 기간 중인 구독의 취소 상태를 중지하려면, `stopCancelation` 메서드를 사용할 수 있습니다.

```
$user->subscription()->stopCancelation();
```

> [!WARNING]  
> Paddle의 구독은 일단 취소하면 다시 재개할 수 없습니다. 만약 고객이 구독을 다시 시작하길 원한다면, 새로 구독을 만들어야 합니다.

<a name="subscription-trials"></a>
## 구독 체험 기간(Trial)

<a name="with-payment-method-up-front"></a>
### 결제 수단 선등록(With Payment Method Up Front)

고객으로부터 결제 수단 정보를 미리 받고 체험 기간을 제공하고 싶다면, Paddle 대시보드에서 가입할 가격(Price) 항목에 체험 기간(trial time)을 설정하세요. 그런 다음 평소처럼 체크아웃 세션을 시작합니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

애플리케이션이 `subscription_created` 이벤트를 받으면, Cashier는 구독 레코드에 체험 기간 종료 날짜를 설정하며, Paddle에게 이 날짜까지 결제가 시작되지 않도록 전달합니다.

> [!WARNING]  
> 고객의 구독이 체험 기간 종료 전에 취소되지 않으면, 체험 기간이 끝나자마자 바로 요금이 청구됩니다. 따라서 사용자가 체험 기간 종료일을 꼭 안내받을 수 있도록 하세요.

사용자가 체험 기간 중인지 확인하려면, 사용자 인스턴스의 `onTrial` 또는 구독 인스턴스의 `onTrial` 메서드를 사용할 수 있습니다. 아래 두 예시는 동일하게 동작합니다.

```
if ($user->onTrial()) {
    // ...
}

if ($user->subscription()->onTrial()) {
    // ...
}
```
기존 체험 기간이 만료되었는지 확인하려면 `hasExpiredTrial` 메서드들을 사용할 수 있습니다.

```
if ($user->hasExpiredTrial()) {
    // ...
}

if ($user->subscription()->hasExpiredTrial()) {
    // ...
}
```

특정한 구독 종류에 대해 현재 체험 중인지, 아니면 만료되었는지 확인하고 싶다면 해당 구독 타입을 `onTrial` 또는 `hasExpiredTrial` 메서드에 인자로 전달할 수 있습니다.

```
if ($user->onTrial('default')) {
    // ...
}

if ($user->hasExpiredTrial('default')) {
    // ...
}
```

<a name="without-payment-method-up-front"></a>
### 결제 수단 미등록(Without Payment Method Up Front)

결제 수단 정보를 미리 받지 않고 체험 기간을 제공하고 싶다면, 사용자에 연결된 고객 레코드의 `trial_ends_at` 컬럼에 원하는 체험 기간 종료 날짜를 직접 지정하세요. 이 작업은 일반적으로 회원가입 시에 진행합니다.

```
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->addDays(10)
]);
```

Cashier에서는 이 방식을 "일반(generic) 체험 기간"이라고 부르며, 특정 구독에 연결되지 않은 체험 기간입니다. `User` 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at` 값보다 이전이면 `true`를 반환합니다.

```
if ($user->onTrial()) {
    // 사용자가 체험 기간 내에 있습니다...
}
```

이제 실제 구독을 생성하려면, 평소처럼 `subscribe` 메서드를 사용하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

사용자의 체험 기간 종료 날짜를 가져오려면 `trialEndsAt` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 체험 기간 중일 때는 Carbon 날짜 인스턴스를, 그렇지 않으면 `null`을 반환합니다. 기본 구독 외에 특정 구독 타입의 체험 기간 종료일을 구하고 싶다면, 옵션 파라미터로 구독 타입을 전달하면 됩니다.

```
if ($user->onTrial('default')) {
    $trialEndsAt = $user->trialEndsAt();
}
```

아직 실제 구독을 만들지 않은 "일반(generic)" 체험 기간 상태임을 구분해서 확인하고 싶을 때는 `onGenericTrial` 메서드를 사용할 수 있습니다.

```
if ($user->onGenericTrial()) {
    // 사용자가 "일반(generic) 체험 기간"에 있습니다...
}
```

<a name="extend-or-activate-a-trial"></a>
### 체험 기간 연장 또는 즉시 활성화

구독의 기존 체험 기간을 연장하려면 `extendTrial` 메서드에 체험 만료 희망일을 지정해 호출하면 됩니다.

```
$user->subscription()->extendTrial(now()->addDays(5));
```

또는, 구독의 체험 기간을 종료해서 즉시 구독을 활성화하려면 구독 인스턴스에 `activate` 메서드를 호출하세요.

```
$user->subscription()->activate();
```

<a name="handling-paddle-webhooks"></a>
## Paddle 웹훅 처리

Paddle은 다양한 이벤트에 대해 웹훅(webhook)으로 애플리케이션에 알림을 보낼 수 있습니다. 기본적으로 Cashier 서비스 프로바이더는 Cashier의 웹훅 컨트롤러로 향하는 라우트를 등록합니다. 이 컨트롤러가 모든 웹훅 요청을 처리합니다.

이 컨트롤러는 구독 결제 실패 횟수 초과로 인한 자동 구독 취소, 구독 정보 갱신, 결제수단 변경 등 일반적인 웹훅 이벤트를 자동 처리합니다. 나중에 설명할 수 있듯이, 직접 컨트롤러를 확장해서 원하는 Paddle 웹훅 이벤트를 다양하게 처리할 수 있습니다.

애플리케이션이 Paddle 웹훅을 잘 처리할 수 있도록 하려면 반드시 [Paddle 관리 페이지에서 웹훅 URL을 구성](https://vendors.paddle.com/alerts-webhooks)해야 합니다. 기본적으로 Cashier의 웹훅 컨트롤러는 `/paddle/webhook` URL 경로에 응답합니다. Paddle 관리 페이지에서 활성화해야 할 전체 웹훅 목록은 다음과 같습니다.

- Customer Updated
- Transaction Completed
- Transaction Updated
- Subscription Created
- Subscription Updated
- Subscription Paused
- Subscription Canceled

> [!WARNING]  
> Cashier에서 제공하는 [웹훅 서명 검증](/docs/11.x/cashier-paddle#verifying-webhook-signatures) 미들웨어로 들어오는 요청을 반드시 보호하세요.

<a name="webhooks-csrf-protection"></a>
#### 웹훅과 CSRF 보호

Paddle 웹훅은 Laravel의 [CSRF 보호](/docs/11.x/csrf)를 우회해야 합니다. 따라서 Paddle 웹훅에 대해서는 라라벨이 CSRF 토큰 검증을 시도하지 않도록 해야 합니다. 이를 위해 애플리케이션의 `bootstrap/app.php` 파일에서 `paddle/*` 경로를 CSRF 보호에서 제외하세요.

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'paddle/*',
    ]);
})
```

<a name="webhooks-local-development"></a>
#### 웹훅과 로컬 개발 환경

로컬 개발 환경에서 Paddle이 웹훅을 애플리케이션에 보낼 수 있도록 하려면, [Ngrok](https://ngrok.com/)이나 [Expose](https://expose.dev/docs/introduction)와 같은 사이트 공유 서비스를 이용해 외부에서 접근 가능한 주소로 애플리케이션을 공개해야 합니다. [Laravel Sail](/docs/11.x/sail)을 사용하는 경우 Sail의 [사이트 공유 명령어](/docs/11.x/sail#sharing-your-site)를 사용할 수 있습니다.

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의

Cashier는 결제 실패로 인한 구독 취소 및 주요 Paddle 웹훅은 기본적으로 자동 처리합니다. 만약 추가적으로 처리하고 싶은 웹훅 이벤트가 있다면, Cashier가 디스패치(dispatch)하는 다음 이벤트를 리스닝(listen)해서 직접 처리할 수 있습니다.

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

이벤트에는 Paddle 웹훅의 전체 페이로드(payload)가 포함되어 있습니다. 예를 들어, `transaction.billed` 웹훅을 처리하려면 [리스너](/docs/11.x/events#defining-listeners)를 등록하여 해당 이벤트를 다룰 수 있습니다.

```
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * Paddle 웹훅 수신시 처리.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['event_type'] === 'transaction.billed') {
            // 이 이벤트 처리...
        }
    }
}
```

Cashier는 웹훅의 타입 별로 전용 이벤트도 발행합니다. 이 전용 이벤트는 Paddle이 보낸 전체 페이로드 외에도 처리에 사용된 관련 모델(예: 과금 대상 모델, 구독, 영수증 등)을 함께 제공합니다.

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\CustomerUpdated`
- `Laravel\Paddle\Events\TransactionCompleted`
- `Laravel\Paddle\Events\TransactionUpdated`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionPaused`
- `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

기본(내장) 웹훅 라우트를 재정의하고 싶다면, 애플리케이션의 `.env` 파일에 `CASHIER_WEBHOOK` 환경변수를 설정하면 됩니다. 이 값은 전체 웹훅 라우트 URL이어야 하고, Paddle 관리 패널에 지정하는 URL과 일치해야 합니다.

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### 웹훅 서명(Signature) 검증

웹훅의 보안을 위해 [Paddle의 웹훅 서명](https://developer.paddle.com/webhook-reference/verifying-webhooks)을 활용할 수 있습니다. Cashier는 Paddle 웹훅 요청의 유효성을 검증하는 미들웨어를 기본 포함하고 있습니다.

웹훅 검증을 활성화하려면, 애플리케이션의 `.env` 파일에 `PADDLE_WEBHOOK_SECRET` 환경변수 값을 설정하세요. 이 비밀키는 Paddle 계정 대시보드에서 획득할 수 있습니다.

<a name="single-charges"></a>
## 단일 결제 처리

<a name="charging-for-products"></a>
### 상품에 대한 결제

고객이 상품을 결제하도록 하려면, 청구 가능 모델 인스턴스(billable model instance)에서 `checkout` 메서드를 사용하면 됩니다. 이 메서드는 하나 또는 여러 개의 가격 ID(Price ID)를 인자로 받을 수 있습니다. 여러 상품 및 수량을 지정하려면 연관 배열을 사용하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

    return view('buy', ['checkout' => $checkout]);
});
```

체크아웃 세션을 생성한 후, Cashier에서 제공하는 `paddle-button` [Blade 컴포넌트](#overlay-checkout)를 활용하면, 사용자가 Paddle 체크아웃 위젯을 띄우고 결제를 완료할 수 있습니다.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

체크아웃 세션에는 `customData` 메서드가 있어서 거래 생성 시 전달하고 싶은 커스텀 데이터를 마음대로 넣을 수 있습니다. 자세한 옵션은 [Paddle 공식 문서](https://developer.paddle.com/build/transactions/custom-data)를 참고하세요.

```
$checkout = $user->checkout('pri_tshirt')
    ->customData([
        'custom_option' => $value,
    ]);
```

<a name="refunding-transactions"></a>
### 거래 환불 처리

거래 환불 시, 결제 시 사용한 결제 수단으로 환불된 금액이 반환됩니다. Paddle 구매를 환불하려면, `Cashier\Paddle\Transaction` 모델에서 `refund` 메서드를 사용하세요. 이 메서드는 환불 사유를 첫 번째 인자로 받고, 환불할 가격 ID(들)과 선택적으로 환불 금액을 연관 배열로 넘길 수 있습니다. 특정 청구 가능 모델의 거래를 가져오려면 `transactions` 메서드를 사용하세요.

예를 들어, `pri_123`과 `pri_456` 가격에 해당하는 거래를 환불하려고 합니다. `pri_123`은 전액 환불, `pri_456`은 2달러만 일부 환불한다고 가정해보세요.

```
use App\Models\User;

$user = User::find(1);

$transaction = $user->transactions()->first();

$response = $transaction->refund('Accidental charge', [
    'pri_123', // 이 가격은 전액 환불...
    'pri_456' => 200, // 이 가격은 일부(200 단위만) 환불...
]);
```

위 예시는 거래 내에서 특정 항목을 환불하는 예입니다. 거래 전체를 환불하려면 그냥 사유만 넘기면 됩니다.

```
$response = $transaction->refund('Accidental charge');
```

환불에 대한 추가 안내는 [Paddle의 환불 관련 공식 문서](https://developer.paddle.com/build/transactions/create-transaction-adjustments)를 참고하세요.

> [!WARNING]  
> 환불은 항상 Paddle의 승인이 필요하며, Paddle이 완전히 처리하기 전까지 효력이 없습니다.

<a name="crediting-transactions"></a>
### 거래 크레딧(적립) 처리

환불과 마찬가지로 트랜잭션에 금액을 크레딧(적립)할 수도 있습니다. 거래에 크레딧을 추가하면 고객 계정 예치금으로 쌓여 이후 구매에 사용할 수 있습니다. 크레딧 적립은 수동으로 징수된 거래(수동 결제)에만 적용할 수 있으며, 정기 결제(예: 구독) 등 자동 결제에는 사용할 수 없습니다. 구독의 경우 Paddle에서 자동으로 크레딧을 관리합니다.

```
$transaction = $user->transactions()->first();

// 특정 항목 전액 크레딧...
$response = $transaction->credit('Compensation', 'pri_123');
```

자세한 내용은 [Paddle의 크레딧 관련 문서](https://developer.paddle.com/build/transactions/create-transaction-adjustments)를 확인하세요.

> [!WARNING]  
> 크레딧은 수동 결제에만 적용할 수 있습니다. 자동 결제 거래에 대해서는 Paddle에서 자체적으로 관리합니다.

<a name="transactions"></a>
## 거래(Transactions)

청구 가능 모델의 모든 거래(Transactions) 배열을 `transactions` 속성을 통해 쉽게 조회할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$transactions = $user->transactions;
```

각 거래는 상품이나 구매에 대한 결제를 나타내며, 인보이스(invoice)가 함께 생성됩니다. 완료된 거래만 애플리케이션 데이터베이스에 저장됩니다.

고객의 거래 내역을 화면에 표시할 때, 각 거래 인스턴스의 메서드를 이용해 관련 결제 정보를 보여줄 수 있습니다. 예를 들어 모든 거래를 표로 나열하여, 사용자가 각 인보이스를 바로 다운로드할 수 있도록 만들 수 있습니다.

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

`download-invoice` 라우트는 아래처럼 만들 수 있습니다.

```
use Illuminate\Http\Request;
use Laravel\Paddle\Transaction;

Route::get('/download-invoice/{transaction}', function (Request $request, Transaction $transaction) {
    return $transaction->redirectToInvoicePdf();
})->name('download-invoice');
```

<a name="past-and-upcoming-payments"></a>
### 이전/예정 결제 내역

정기 구독의 경우, `lastPayment` 및 `nextPayment` 메서드를 이용해 사용자의 이전 결제 내역과 다음에 예정된 결제를 조회할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription();

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

이 두 메서드는 모두 `Laravel\Paddle\Payment` 인스턴스를 반환합니다. 단, 거래 내용이 아직 웹훅으로 동기화되지 않았다면 `lastPayment`에서는 `null`을 반환할 수 있고, 결제 주기가 끝났거나(예: 구독 취소)한 경우 `nextPayment`는 `null`을 반환합니다.

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="testing"></a>
## 테스트

빌링 플로우(결제 흐름)는 실제로 수동으로 테스트하여, 정상적으로 통합이 이루어졌는지 꼭 확인하시기 바랍니다.

CI 환경 등에서 자동화 테스트(자동화된 단위/통합 테스트)를 할 때는, [Laravel의 HTTP 클라이언트](/docs/11.x/http-client#testing)를 활용해 Paddle에 대한 HTTP 호출을 페이크(fake) 처리할 수 있습니다. 이 방식은 Paddle의 실제 응답을 테스트하지는 않지만, Paddle API를 직접 호출하지 않고도 애플리케이션 동작을 검증할 수 있는 방법입니다.