# 라라벨 Cashier, Paddle (Laravel Cashier (Paddle))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
    - [Paddle 샌드박스](#paddle-sandbox)
    - [데이터베이스 마이그레이션](#database-migrations)
- [설정](#configuration)
    - [청구 가능 모델(Billable Model)](#billable-model)
    - [API 키](#api-keys)
    - [Paddle JS](#paddle-js)
    - [통화 설정](#currency-configuration)
    - [기본 모델 오버라이딩](#overriding-default-models)
- [핵심 개념](#core-concepts)
    - [결제 링크(Pay Links)](#pay-links)
    - [인라인 결제(Inline Checkout)](#inline-checkout)
    - [사용자 식별(User Identification)](#user-identification)
- [가격](#prices)
- [고객](#customers)
    - [고객 기본값(Customer Defaults)](#customer-defaults)
- [구독](#subscriptions)
    - [구독 생성](#creating-subscriptions)
    - [구독 상태 확인](#checking-subscription-status)
    - [구독 단일 청구](#subscription-single-charges)
    - [결제 정보 업데이트](#updating-payment-information)
    - [요금제 변경](#changing-plans)
    - [구독 수량](#subscription-quantity)
    - [구독 수정자(Subscription Modifiers)](#subscription-modifiers)
    - [복수 구독](#multiple-subscriptions)
    - [구독 일시 정지](#pausing-subscriptions)
    - [구독 취소](#cancelling-subscriptions)
- [구독 체험판(Subscription Trials)](#subscription-trials)
    - [사전 결제 수단 입력(With Payment Method Up Front)](#with-payment-method-up-front)
    - [사전 결제 수단 입력 없이(Without Payment Method Up Front)](#without-payment-method-up-front)
- [Paddle 웹훅 처리](#handling-paddle-webhooks)
    - [웹훅 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [웹훅 시그니처 검증](#verifying-webhook-signatures)
- [단일 결제(Single Charges)](#single-charges)
    - [간단 결제(Simple Charge)](#simple-charge)
    - [상품 결제(Charging Products)](#charging-products)
    - [주문 환불(Refunding Orders)](#refunding-orders)
- [영수증](#receipts)
    - [이전 및 예정 결제 내역(Past & Upcoming Payments)](#past-and-upcoming-payments)
- [결제 실패 처리](#handling-failed-payments)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[라라벨 Cashier Paddle](https://github.com/laravel/cashier-paddle)은 [Paddle](https://paddle.com)의 구독 청구 서비스를 쉽고 유연하게 사용할 수 있도록 인터페이스를 제공합니다. 이 패키지는 번거로운 구독 청구 관련 코드를 대부분 대신 처리해줍니다. 기본적인 구독 관리 외에도 Cashier는 쿠폰 관리, 구독 변경, 구독 "수량", 구독 취소 유예 기간 등 다양한 기능을 지원합니다.

Cashier를 사용하면서, Paddle의 [사용자 가이드](https://developer.paddle.com/guides)와 [API 문서](https://developer.paddle.com/api-reference)도 함께 참고하시길 권장합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier의 새 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md)를 꼼꼼히 확인하십시오.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용해 Paddle용 Cashier 패키지를 설치합니다.

```shell
composer require laravel/cashier-paddle
```

> [!WARNING]
> Cashier가 모든 Paddle 이벤트를 올바르게 처리하려면 반드시 [Cashier의 웹훅 처리 방법](#handling-paddle-webhooks)을 설정해야 한다는 점을 기억하세요.

<a name="paddle-sandbox"></a>
### Paddle 샌드박스

로컬 또는 스테이징 환경에서 개발을 진행할 때는, [Paddle 샌드박스 계정](https://developer.paddle.com/getting-started/sandbox)을 등록해야 합니다. 이 계정은 실제 결제 없이 애플리케이션을 테스트하고 개발할 수 있는 샌드박스 환경을 제공합니다. 다양한 결제 시나리오를 시뮬레이션하려면 Paddle의 [테스트 카드 번호](https://developer.paddle.com/getting-started/sandbox#test-cards)를 사용할 수 있습니다.

Paddle 샌드박스 환경을 사용할 때는, 애플리케이션의 `.env` 파일에 `PADDLE_SANDBOX` 환경 변수를 `true`로 설정해야 합니다.

```ini
PADDLE_SANDBOX=true
```

애플리케이션 개발이 끝나면 [Paddle 벤더 계정](https://paddle.com)을 신청할 수 있습니다. 애플리케이션을 실제 서비스 환경에 배포하기 전에, Paddle에서 애플리케이션의 도메인을 반드시 승인해주어야 합니다.

<a name="database-migrations"></a>
### 데이터베이스 마이그레이션

Cashier 서비스 프로바이더는 자체 데이터베이스 마이그레이션 디렉터리를 등록합니다. 따라서 패키지 설치 후 반드시 데이터베이스 마이그레이션을 실행해야 합니다. Cashier 마이그레이션을 실행하면 새로운 `customers` 테이블이 생성됩니다. 또한, 고객의 모든 구독 정보를 저장할 새로운 `subscriptions` 테이블과, 애플리케이션의 모든 영수증 정보를 저장할 `receipts` 테이블도 함께 생성됩니다.

```shell
php artisan migrate
```

Cashier에 기본 포함된 마이그레이션 파일을 직접 수정하고 싶다면, `vendor:publish` Artisan 명령어를 사용해 파일을 퍼블리시할 수 있습니다.

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Cashier의 마이그레이션 자체를 실행하지 않으려는 경우, Cashier에서 제공하는 `ignoreMigrations` 메서드를 사용할 수 있습니다. 보통, 이 메서드는 `AppServiceProvider`의 `register` 메서드에서 호출해야 합니다.

```
use Laravel\Paddle\Cashier;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    Cashier::ignoreMigrations();
}
```

<a name="configuration"></a>
## 설정

<a name="billable-model"></a>
### 청구 가능 모델(Billable Model)

Cashier를 사용하려면 먼저, 사용자 모델에 `Billable` 트레이트를 추가해야 합니다. 이 트레이트는 구독 생성, 쿠폰 적용, 결제 정보 업데이트 등 자주 사용하는 청구 관련 작업을 간단하게 처리할 수 있도록 여러 메서드를 제공합니다.

```
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

만약 사용자가 아닌 청구 가능한 엔터티가 있다면, 해당 클래스에도 이 트레이트를 추가할 수 있습니다.

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

다음으로, 애플리케이션의 `.env` 파일에 Paddle API 키를 설정해야 합니다. Paddle 사이트의 컨트롤 패널에서 관련 API 키들을 가져올 수 있습니다.

```ini
PADDLE_VENDOR_ID=your-paddle-vendor-id
PADDLE_VENDOR_AUTH_CODE=your-paddle-vendor-auth-code
PADDLE_PUBLIC_KEY="your-paddle-public-key"
PADDLE_SANDBOX=true
```

`PADDLE_SANDBOX` 환경 변수는 [Paddle 샌드박스 환경](#paddle-sandbox)을 사용할 때에는 `true`로 설정해야 하며, 실제 프로덕션 환경(라이브 벤더 계정)에서는 `false`로 설정해야 합니다.

<a name="paddle-js"></a>
### Paddle JS

Paddle은 자신의 결제 위젯을 초기화하는 별도의 자바스크립트 라이브러리를 사용합니다. 이 라이브러리를 불러오려면, 애플리케이션 레이아웃의 `</head>` 태그 바로 앞에 `@paddleJS` Blade 디렉티브를 추가하면 됩니다.

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### 통화 설정

Cashier에서 기본 통화는 미국 달러(USD)입니다. 애플리케이션의 `.env` 파일에서 `CASHIER_CURRENCY` 환경 변수를 설정해 기본 통화를 변경할 수 있습니다.

```ini
CASHIER_CURRENCY=EUR
```

Cashier의 통화 외에도, 청구서에 표시되는 금액의 지역화(로케일)를 지정할 수 있습니다. 내부적으로 Cashier는 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 이용해 통화 로케일을 적용합니다.

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> `en` 이외의 로케일을 사용하려면 서버에 `ext-intl` PHP 확장 모듈이 반드시 설치 및 설정되어 있어야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이딩

Cashier 내부적으로 사용하는 모델을 자유롭게 확장하여 직접 정의할 수 있습니다. 예를 들어, Cashier의 기본 모델을 상속받아 자신만의 모델을 구현할 수 있습니다.

```
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 후에는, `Laravel\Paddle\Cashier` 클래스를 이용해 Cashier가 새로운 모델을 사용하도록 지정해야 합니다. 보통, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 이를 설정합니다.

```
use App\Models\Cashier\Receipt;
use App\Models\Cashier\Subscription;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Cashier::useReceiptModel(Receipt::class);
    Cashier::useSubscriptionModel(Subscription::class);
}
```

<a name="core-concepts"></a>
## 핵심 개념

<a name="pay-links"></a>
### 결제 링크(Pay Links)

Paddle은 구독 상태 변경을 위한 완전한 CRUD API를 제공하지 않기 때문에, 대부분의 Paddle과의 상호작용은 [결제 위젯(checkout widget)](https://developer.paddle.com/guides/how-tos/checkout/paddle-checkout)을 통해 이루어집니다. 결제 위젯을 표시하기 전에, Cashier를 사용해 반드시 "결제 링크(pay link)"를 먼저 생성해야 합니다. 이 링크는 결제 위젯에 어떤 청구 작업을 수행할 것인지 알려줍니다.

```
use App\Models\User;
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $payLink = $request->user()->newSubscription('default', $premium = 34567)
        ->returnTo(route('home'))
        ->create();

    return view('billing', ['payLink' => $payLink]);
});
```

Cashier에는 `paddle-button` [Blade 컴포넌트](/docs/9.x/blade#components)가 포함되어 있습니다. 결제 링크 URL을 prop(속성)으로 이 컴포넌트에 전달할 수 있습니다. 이 버튼을 누르면 Paddle의 결제 위젯이 표시됩니다.

```html
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

기본적으로 이 버튼은 Paddle의 기본 스타일로 표시됩니다. Paddle의 스타일을 모두 제거하려면, 컴포넌트에 `data-theme="none"` 속성을 추가하면 됩니다.

```html
<x-paddle-button :url="$payLink" class="px-8 py-4" data-theme="none">
    Subscribe
</x-paddle-button>
```

Paddle 결제 위젯은 비동기 방식으로 동작합니다. 사용자가 위젯에서 구독을 생성하거나 변경하면, Paddle은 웹훅을 통해 애플리케이션에 해당 정보를 전달하므로, 반드시 데이터베이스의 구독 상태도 함께 업데이트해야 합니다. 이처럼 결제 및 구독 상태 변경을 정확하게 반영하려면, 반드시 [웹훅 처리 기능](#handling-paddle-webhooks)이 잘 설정되어 있어야 합니다.

결제 링크에 대해 더 자세한 정보가 필요하다면 [Paddle API 문서(결제 링크 생성)](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)를 참고하세요.

> [!WARNING]
> 구독 상태가 변경되면, 해당 웹훅을 받기까지 보통은 짧은 지연 시간이 있지만, 사용자가 결제를 완료했더라도 구독이 즉시 활성화되지 않을 수 있음을 애플리케이션에서 반드시 고려해야 합니다.

<a name="manually-rendering-pay-links"></a>
#### 결제 링크 수동 렌더링

Blade 컴포넌트를 사용하지 않고 결제 링크를 직접 렌더링할 수도 있습니다. 결제 링크 URL은 앞선 예시처럼 생성할 수 있습니다.

```
$payLink = $request->user()->newSubscription('default', $premium = 34567)
    ->returnTo(route('home'))
    ->create();
```

그 다음, 단순히 해당 결제 링크 URL을 HTML의 `a` 태그에 연결하면 됩니다.

```
<a href="#!" class="ml-4 paddle_button" data-override="{{ $payLink }}">
    Paddle Checkout
</a>
```

<a name="payments-requiring-additional-confirmation"></a>
#### 추가 확인이 필요한 결제

가끔 결제를 완료하려면 추가 인증이 필요한 경우가 있습니다. 이럴 때는 Paddle이 결제 확인 화면을 제공합니다. 이러한 확인 화면은 Paddle이나 Cashier에서 카드사 또는 은행의 인증 절차에 맞게 맞춤으로 보여줄 수 있으며, 카드 추가 확인, 소액 임시 청구, 별도의 기기 인증 등 다양한 방식이 사용될 수 있습니다.

<a name="inline-checkout"></a>
### 인라인 결제(Inline Checkout)

Paddle의 오버레이 스타일 결제 위젯을 사용하고 싶지 않은 경우, Paddle은 결제 위젯을 페이지 내에 인라인으로 표시하는 기능도 제공합니다. 이 방식은 결제 HTML 필드를 따로 커스터마이즈할 수는 없지만, 결제 위젯을 애플리케이션 내에 직접 임베드할 수 있습니다.

Cashier에서는 인라인 결제 시작이 쉽도록 `paddle-checkout` Blade 컴포넌트를 제공합니다. [결제 링크](#pay-links)를 생성한 후, 해당 링크를 컴포넌트의 `override` 속성에 전달하면 됩니다.

```blade
<x-paddle-checkout :override="$payLink" class="w-full" />
```

인라인 결제 컴포넌트의 높이를 조절하려면 `height` 속성을 활용할 수 있습니다.

```blade
<x-paddle-checkout :override="$payLink" class="w-full" height="500" />
```

<a name="inline-checkout-without-pay-links"></a>
#### 결제 링크 없이 인라인 결제

또는, 결제 링크를 사용하지 않고도 몇 가지 옵션을 직접 전달하여 결제 위젯을 커스터마이즈할 수 있습니다.

```blade
@php
$options = [
    'product' => $productId,
    'title' => 'Product Title',
];
@endphp

<x-paddle-checkout :options="$options" class="w-full" />
```

인라인 결제에서 사용할 수 있는 다양한 옵션은 Paddle의 [인라인 결제 가이드](https://developer.paddle.com/guides/how-tos/checkout/inline-checkout) 및 [파라미터 레퍼런스](https://developer.paddle.com/reference/paddle-js/parameters)를 참고하시기 바랍니다.

> [!WARNING]
> 커스텀 옵션으로 `passthrough` 옵션을 사용하고 싶다면, 반드시 key/value 배열 형태로 전달해야 합니다. Cashier가 자동으로 해당 배열을 JSON 문자열로 변환해줍니다. 단, `customer_id` passthrough 옵션은 Cashier 내부적으로 사용되므로 별도로 지정하실 필요가 없습니다.

<a name="manually-rendering-an-inline-checkout"></a>
#### 인라인 결제 직접 렌더링

라라벨의 Blade 컴포넌트를 사용하지 않고 인라인 결제를 직접 렌더링할 수도 있습니다. 먼저, [앞선 예시](#pay-links)처럼 결제 링크 URL을 생성합니다.

그 다음, Paddle.js를 이용해 결제 창을 초기화하면 됩니다. 이 예제에서는 [Alpine.js](https://github.com/alpinejs/alpine)를 사용하지만, 여러분이 사용하는 다른 프론트엔드 프레임워크로 자유롭게 변경할 수 있습니다.

```alpine
<div class="paddle-checkout" x-data="{}" x-init="
    Paddle.Checkout.open({
        override: {{ $payLink }},
        method: 'inline',
        frameTarget: 'paddle-checkout',
        frameInitialHeight: 366,
        frameStyle: 'width: 100%; background-color: transparent; border: none;'
    });
">
</div>
```

<a name="user-identification"></a>
### 사용자 식별(User Identification)

Stripe와는 달리, Paddle의 사용자 계정은 Paddle 전체에서 고유하게 관리됩니다(즉, Paddle 계정별로 구분되는 것이 아님). 이러한 이유로, 현재 Paddle API에서는 사용자의 이메일 주소 같은 세부 정보를 업데이트하는 기능이 제공되지 않습니다. 결제 링크를 생성할 때에는 Paddle이 `customer_email` 파라미터로 사용자를 식별합니다. 구독을 생성할 때, Paddle은 입력된 이메일 주소와 동일한 이메일을 가진 기존 사용자가 있다면 해당 사용자와 연결을 시도합니다.

이러한 동작 방식 때문에 Cashier와 Paddle을 사용할 때 꼭 주의해야 할 점이 있습니다. 우선, Cashier에서는 하나의 애플리케이션 사용자와 구독이 연결되어 있더라도, **Paddle의 내부 시스템에서는 서로 다른 사용자에 연결될 수 있습니다.** 또한, 각 구독별로 개별적인 결제 정보, 이메일 주소를 별도로 관리할 수 있으며(구독 생성 시에 어떤 이메일을 할당받았는지에 따라 다름) 서로 다를 수도 있습니다.

따라서, 구독 정보를 보여줄 때마다 반드시 각 구독이 Paddle 시스템 내에서 어떤 이메일/결제 정보와 연결되어 있는지 사용자에게 알려주는 것이 좋습니다. 이러한 정보는 `Laravel\Paddle\Subscription` 모델의 다음과 같은 메서드로 확인할 수 있습니다.

```
$subscription = $user->subscription('default');

$subscription->paddleEmail();
$subscription->paymentMethod();
$subscription->cardBrand();
$subscription->cardLastFour();
$subscription->cardExpirationDate();
```

현재로서는 Paddle API를 통해 사용자의 이메일 주소를 직접 수정할 수 있는 기능이 없습니다. 사용자가 Paddle 내 이메일을 변경하고 싶은 경우, Paddle 고객 지원에 직접 연락해야 하며, 이 때 구독의 `paddleEmail` 값을 제공해야 정확한 사용자 정보 수정에 도움이 됩니다.

<a name="prices"></a>
## 가격

Paddle은 각 통화별로 가격을 개별적으로 지정할 수 있으므로, 국가별로 서로 다른 가격을 설정할 수 있습니다. Cashier Paddle을 사용하면, `productPrices` 메서드를 통해 한 번에 여러 상품의 가격 정보를 받아올 수 있습니다. 이 메서드는 가격 정보를 조회할 상품의 ID 배열을 인수로 받습니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::productPrices([123, 456]);
```

통화 종류는 일반적으로 요청자의 IP 주소로 자동 결정되지만, 명시적으로 특정 국가의 가격을 조회하고 싶다면 두 번째 파라미터로 국가 정보를 전달할 수 있습니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::productPrices([123, 456], ['customer_country' => 'BE']);
```

가격 정보를 가져온 뒤에는 원하는 방식으로 화면에 표시할 수 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->gross() }}</li>
    @endforeach
</ul>
```

세금 제외 금액(순액)을 표시하거나, 세금액을 별도로 표시할 수도 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->net() }} (+ {{ $price->price()->tax() }} tax)</li>
    @endforeach
</ul>
```

구독 요금제에 대한 가격 정보를 가져왔다면, 최초 결제 금액과 반복 결제 금액을 따로 표시할 수도 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - Initial: {{ $price->initialPrice()->gross() }} - Recurring: {{ $price->recurringPrice()->gross() }}</li>
    @endforeach
</ul>
```

더 자세한 정보는 [Paddle의 가격 조회 API 문서](https://developer.paddle.com/api-reference/checkout-api/prices/getprices)를 참고하십시오.

<a name="prices-customers"></a>
#### 고객 단위 가격 조회

이미 가입한 사용자가 있다면, 해당 고객에게 적용되는 가격을 그 고객 인스턴스에서 직접 조회할 수 있습니다.

```
use App\Models\User;

$prices = User::find(1)->productPrices([123, 456]);
```

내부적으로 Cashier는 사용자의 [`paddleCountry` 메서드](#customer-defaults)를 활용해 해당 국가의 통화로 가격을 받아옵니다. 예를 들어, 미국 거주자일 경우 USD, 벨기에 거주자일 경우 EUR로 가격이 표시됩니다. 만약 일치하는 통화를 찾지 못하면 상품의 기본 통화를 사용합니다. 모든 상품이나 구독 요금제의 가격은 Paddle 컨트롤 패널에서 자유롭게 변경할 수 있습니다.

<a name="prices-coupons"></a>
#### 쿠폰 적용 가격 조회

쿠폰 할인이 적용된 가격을 함께 표시하고 싶은 경우, `productPrices` 메서드에서 `coupons` 파라미터로 콤마로 구분된 쿠폰 코드를 전달하면 됩니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::productPrices([123, 456], [
    'coupons' => 'SUMMERSALE,20PERCENTOFF'
]);
```

이렇게 조회한 가격은 `price` 메서드로 사용할 수 있습니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->gross() }}</li>
    @endforeach
</ul>
```

쿠폰 할인이 적용되지 않은 원래 가격이 필요하다면 `listPrice` 메서드를 사용하면 됩니다.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->listPrice()->gross() }}</li>
    @endforeach
</ul>
```

> [!WARNING]
> 가격 조회 API를 사용할 때, Paddle은 쿠폰 적용을 일회성 결제 상품에만 허용하며 구독 요금제에는 적용할 수 없습니다.

<a name="customers"></a>
## 고객

<a name="customer-defaults"></a>
### 고객 기본값(Customer Defaults)

Cashier를 이용하면 결제 링크 생성 시 고객을 위한 유용한 기본값을 미리 지정할 수 있습니다. 기본값을 미리 지정해두면, 고객의 이메일, 국가, 우편번호를 자동으로 입력란에 채워주어, 결제 과정을 더 빠르게 진행할 수 있습니다. 이러한 기본값은 청구 가능 모델에서 아래와 같이 메서드를 오버라이드 하는 방식으로 지정할 수 있습니다.

```
/**
 * Paddle에 등록할 고객 이메일 주소 반환
 *
 * @return string|null
 */
public function paddleEmail()
{
    return $this->email;
}

/**
 * Paddle에 등록할 고객 국가 코드 반환
 *
 * 반드시 2자리 국가 코드여야 합니다. 지원 국가 목록은 아래 링크를 참조하세요.
 *
 * @return string|null
 * @link https://developer.paddle.com/reference/platform-parameters/supported-countries
 */
public function paddleCountry()
{
    //
}

/**
 * Paddle에 등록할 고객 우편번호 반환
 *
 * 우편번호가 필요한 국가 목록은 아래 링크 참고
 *
 * @return string|null
 * @link https://developer.paddle.com/reference/platform-parameters/supported-countries#countries-requiring-postcode
 */
public function paddlePostcode()
{
    //
}
```

이 기본값은 Cashier에서 [결제 링크](#pay-links)를 생성하는 모든 작업에 사용됩니다.

<a name="subscriptions"></a>
## 구독

<a name="creating-subscriptions"></a>
### 구독 생성

구독을 생성하려면 먼저 데이터베이스에서 청구 가능 모델 인스턴스를 가져와야 합니다. 일반적으로 이 모델은 `App\Models\User`의 인스턴스입니다. 모델 인스턴스를 가져온 다음, `newSubscription` 메서드를 사용해 해당 모델의 구독 결제 링크를 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $payLink = $request->user()->newSubscription('default', $premium = 12345)
        ->returnTo(route('home'))
        ->create();

    return view('billing', ['payLink' => $payLink]);
});
```

`newSubscription`의 첫 번째 인자는 구독의 내부 이름입니다. 만약 애플리케이션에서 하나의 구독만 제공한다면, 이 값을 `default` 또는 `primary` 등으로 지정할 수 있습니다. 이 구독 이름은 사용자에게 보이는 값이 아니라 애플리케이션 내부적으로만 사용되며, 띄어쓰기를 포함하지 않아야 하며 구독 생성 후에는 절대로 변경하면 안 됩니다. 두 번째 인자는 사용자가 가입할 요금제의 ID(상품 ID)로, Paddle에서 정의된 요금제 식별자와 일치해야 합니다. `returnTo` 메서드에는 사용자가 결제를 성공적으로 마친 후 리다이렉트될 URL을 지정합니다.

`create` 메서드는 결제 버튼을 생성할 수 있는 결제 링크를 반환합니다. 결제 버튼은 Cashier Paddle에 포함된 `paddle-button` [Blade 컴포넌트](/docs/9.x/blade#components)를 사용해 만들 수 있습니다.

```blade
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

결제가 완료되면 Paddle에서 `subscription_created` 웹훅이 발송됩니다. Cashier가 이 웹훅을 수신해 고객의 구독을 정상적으로 설정하게 됩니다. 모든 웹훅이 정확히 수신되고 처리되도록 하려면, 반드시 [웹훅 처리 설정](#handling-paddle-webhooks)이 올바로 이루어져야 합니다.

<a name="additional-details"></a>
#### 추가 정보 전달

구독 생성 시, 고객이나 구독에 대한 기타 세부 정보를 지정하고 싶다면, `create` 메서드에 key/value 배열 형태로 전달할 수 있습니다. Paddle에서 지원하는 입력 필드에 대한 자세한 내용은 [결제 링크 생성 관련 문서](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)를 참고하세요.

```
$payLink = $user->newSubscription('default', $monthly = 12345)
    ->returnTo(route('home'))
    ->create([
        'vat_number' => $vatNumber,
    ]);
```

<a name="subscriptions-coupons"></a>

#### 쿠폰

구독을 생성할 때 쿠폰을 적용하고 싶다면, `withCoupon` 메서드를 사용할 수 있습니다.

```
$payLink = $user->newSubscription('default', $monthly = 12345)
    ->returnTo(route('home'))
    ->withCoupon('code')
    ->create();
```

<a name="metadata"></a>
#### 메타데이터

`withMetadata` 메서드를 사용해 메타데이터 배열을 함께 전달할 수도 있습니다.

```
$payLink = $user->newSubscription('default', $monthly = 12345)
    ->returnTo(route('home'))
    ->withMetadata(['key' => 'value'])
    ->create();
```

> [!WARNING]
> 메타데이터를 제공할 때 `subscription_name`을 메타데이터 키로 사용하지 마십시오. 이 키는 Cashier 내부적으로 예약되어 있습니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인

사용자가 애플리케이션에 구독한 이후에는 다양한 편리한 메서드로 해당 사용자의 구독 상태를 확인할 수 있습니다. 먼저, `subscribed` 메서드는 사용자가 활성 구독을 보유 중이면, 무료 체험(Trial) 기간이어도 `true`를 반환합니다.

```
if ($user->subscribed('default')) {
    //
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/9.x/middleware)로 사용하기에 적합하므로, 사용자의 구독 상태에 따라 라우트 및 컨트롤러 접근을 제한할 수 있습니다.

```
<?php

namespace App\Http\Middleware;

use Closure;

class EnsureUserIsSubscribed
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->user() && ! $request->user()->subscribed('default')) {
            // 이 사용자는 유료 사용자가 아닙니다...
            return redirect('billing');
        }

        return $next($request);
    }
}
```

사용자가 여전히 체험(Trial) 기간 내에 있는지 확인하고 싶다면, `onTrial` 메서드를 사용할 수 있습니다. 이 메서드를 활용하면 사용자가 아직 체험 기간임을 알리는 안내 메시지를 표시하는 등 다양한 처리가 가능합니다.

```
if ($user->subscription('default')->onTrial()) {
    //
}
```

`subscribedToPlan` 메서드는 특정 Paddle 플랜 ID를 기준으로 사용자가 해당 플랜에 구독되어 있는지 확인할 때 사용할 수 있습니다. 예를 들어, 아래는 사용자의 `default` 구독이 월간 플랜에 활성 구독되어 있는지 확인하는 예시입니다.

```
if ($user->subscribedToPlan($monthly = 12345, 'default')) {
    //
}
```

`subscribedToPlan` 메서드에 배열을 전달하면, 사용자의 `default` 구독이 월간 또는 연간 플랜 중 하나라도 활성 구독이면 `true`를 반환합니다.

```
if ($user->subscribedToPlan([$monthly = 12345, $yearly = 54321], 'default')) {
    //
}
```

`recurring` 메서드는 사용자가 현재 구독되어 있고, 체험 기간이 이미 종료된 경우에 `true`를 반환합니다.

```
if ($user->subscription('default')->recurring()) {
    //
}
```

<a name="cancelled-subscription-status"></a>
#### 구독 취소 상태

사용자가 한때 활성 구독자였지만 현재 구독을 취소했는지 확인하려면 `cancelled` 메서드를 사용하면 됩니다.

```
if ($user->subscription('default')->cancelled()) {
    //
}
```

또한 사용자가 구독을 취소했지만, 아직 구독이 완전히 만료되지 않아 "유예 기간(grace period)"에 있는지도 확인할 수 있습니다. 예를 들어, 사용자가 3월 5일에 구독을 취소했지만 원래 만료일이 3월 10일이라면, 3월 10일까지는 유예 기간이 됩니다. 이 기간 동안 `subscribed` 메서드는 계속해서 `true`를 반환합니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    //
}
```

구독을 취소했고, 더 이상 "유예 기간"도 남아있지 않은 상태인지는 `ended` 메서드로 확인할 수 있습니다.

```
if ($user->subscription('default')->ended()) {
    //
}
```

<a name="past-due-status"></a>
#### 연체(past due) 상태

구독 결제가 실패하면 해당 구독은 `past_due` 상태로 표시됩니다. 이 상태에서는 고객이 결제 정보를 업데이트하기 전까지 구독이 활성화되지 않습니다. 구독 인스턴스의 `pastDue` 메서드를 사용해 연체 상태인지 확인할 수 있습니다.

```
if ($user->subscription('default')->pastDue()) {
    //
}
```

구독이 연체 상태일 때, 사용자에게 [결제 정보 업데이트](#updating-payment-information)를 안내해야 합니다. 연체 구독 처리 방식은 [Paddle 구독 설정](https://vendors.paddle.com/subscription-settings)에서 직접 구성할 수도 있습니다.

연체(`past_due`) 상태의 구독도 여전히 활성으로 간주하고 싶다면, Cashier에서 제공하는 `keepPastDueSubscriptionsActive` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 `AppServiceProvider`의 `register` 메서드에서 호출하면 됩니다.

```
use Laravel\Paddle\Cashier;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    Cashier::keepPastDueSubscriptionsActive();
}
```

> [!WARNING]
> 구독이 `past_due` 상태인 동안에는 결제 정보가 갱신되기 전까지 구독을 변경할 수 없습니다. 따라서 이 상태에서는 `swap` 및 `updateQuantity` 메서드를 사용할 경우 예외가 발생합니다.

<a name="subscription-scopes"></a>
#### 구독 스코프

대부분의 구독 상태는 쿼리 스코프로도 제공되므로, 데이터베이스에서 특정 상태의 구독을 쉽게 조회할 수 있습니다.

```
// 모든 활성 구독 조회...
$subscriptions = Subscription::query()->active()->get();

// 특정 사용자의 취소된 구독 모두 조회...
$subscriptions = $user->subscriptions()->cancelled()->get();
```

사용 가능한 모든 스코프는 다음과 같습니다.

```
Subscription::query()->active();
Subscription::query()->onTrial();
Subscription::query()->notOnTrial();
Subscription::query()->pastDue();
Subscription::query()->recurring();
Subscription::query()->ended();
Subscription::query()->paused();
Subscription::query()->notPaused();
Subscription::query()->onPausedGracePeriod();
Subscription::query()->notOnPausedGracePeriod();
Subscription::query()->cancelled();
Subscription::query()->notCancelled();
Subscription::query()->onGracePeriod();
Subscription::query()->notOnGracePeriod();
```

<a name="subscription-single-charges"></a>
### 구독 단일 청구

구독 단일 청구 기능을 사용하면 기존 구독에 일회성 요금을 추가로 청구할 수 있습니다.

```
$response = $user->subscription('default')->charge(12.99, 'Support Add-on');
```

[단일 청구](#single-charges)와 달리, 이 방식은 구독에 저장된 결제 수단으로 즉시 요금을 청구합니다. 청구 금액은 구독과 동일한 통화 단위로 지정해야 합니다.

<a name="updating-payment-information"></a>
### 결제 정보 업데이트

Paddle은 구독마다 결제 수단을 개별로 저장합니다. 특정 구독의 기본 결제 수단을 변경하려면, 먼저 구독 모델의 `updateUrl` 메서드를 사용해 '구독 업데이트 URL'을 생성해야 합니다.

```
use App\Models\User;

$user = User::find(1);

$updateUrl = $user->subscription('default')->updateUrl();
```

생성된 URL은 Cashier에서 제공하는 `paddle-button` Blade 컴포넌트와 결합해 사용자가 Paddle 위젯을 통해 결제 정보를 직접 수정할 수 있도록 할 수 있습니다.

```html
<x-paddle-button :url="$updateUrl" class="px-8 py-4">
    Update Card
</x-paddle-button>
```

사용자가 정보를 모두 수정하면 Paddle에서 `subscription_updated` 웹훅이 전송되며, 구독 정보가 애플리케이션 데이터베이스에 반영됩니다.

<a name="changing-plans"></a>
### 플랜 변경

사용자가 구독을 시작한 후, 새로운 구독 플랜으로 변경하고 싶을 수 있습니다. 사용자 구독의 플랜을 업데이트하려면, 구독 모델의 `swap` 메서드에 변경할 Paddle 플랜 ID를 전달하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap($premium = 34567);
```

플랜을 변경하며 바로 청구서를 발행하고 싶다면, 즉시 청구가 발생하도록 `swapAndInvoice` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->swapAndInvoice($premium = 34567);
```

> [!WARNING]
> 체험 기간이 활성화되어 있는 경우에는 플랜을 변경할 수 없습니다. 해당 제약 조건에 대한 상세 내용은 [Paddle 공식 문서](https://developer.paddle.com/api-reference/subscription-api/users/updateuser#usage-notes)를 참고해 주세요.

<a name="prorations"></a>
#### 비례 계산(Prorations)

기본적으로 Paddle은 플랜 변경 시 비용을 비례 배분해 계산합니다. 만약 비례 계산 없이 구독을 업데이트하려면 `noProrate` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->noProrate()->swap($premium = 34567);
```

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

경우에 따라 구독 요금이 "수량"에 따라 달라질 수 있습니다. 예를 들어, 프로젝트 관리 앱에서 프로젝트당 매월 $10씩 청구하는 경우가 이에 해당합니다. 구독의 수량을 간편하게 증가/감소시키려면 `incrementQuantity`와 `decrementQuantity` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// 현재 수량에 5를 추가...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// 현재 수량에서 5를 감소...
$user->subscription('default')->decrementQuantity(5);
```

또는 `updateQuantity` 메서드로 특정 수량을 지정할 수도 있습니다.

```
$user->subscription('default')->updateQuantity(10);
```

`noProrate` 메서드를 사용해 비례 계산 없이 구독 수량을 업데이트할 수도 있습니다.

```
$user->subscription('default')->noProrate()->updateQuantity(10);
```

<a name="subscription-modifiers"></a>
### 구독 모디파이어(Modifier)

구독 모디파이어를 이용하면 [계량형 청구(metered billing)](https://developer.paddle.com/guides/how-tos/subscriptions/metered-billing#using-subscription-price-modifiers)나, 구독에 추가 요소(Add-on)를 더할 수 있습니다.

예를 들어, 표준 구독에 "프리미엄 지원(Premium Support)" 추가 기능을 제공하고 싶다면 아래와 같이 모디파이어를 생성할 수 있습니다.

```
$modifier = $user->subscription('default')->newModifier(12.99)->create();
```

위 예시는 구독에 $12.99짜리 추가 기능을 더하는 예입니다. 기본적으로 이 금액은 구독에 설정된 청구 주기마다 반복해서 청구됩니다. 필요하다면 `description` 메서드로 모디파이어에 설명을 추가할 수도 있습니다.

```
$modifier = $user->subscription('default')->newModifier(12.99)
    ->description('Premium Support')
    ->create();
```

계량형 청구를 모디파이어로 구현하는 또 다른 예로, 사용자가 보낸 SMS 한 건당 요금을 청구하는 애플리케이션을 생각해봅시다. Paddle 대시보드에 $0 플랜을 생성하고, 사용자가 이 플랜에 구독한 뒤 각 요금마다 별도의 모디파이어를 추가하는 방식입니다.

```
$modifier = $user->subscription('default')->newModifier(0.99)
    ->description('New text message')
    ->oneTime()
    ->create();
```

여기서는 `oneTime` 메서드를 사용했습니다. 이 메서드는 해당 모디파이어가 한 번만 청구되고, 이후 반복 청구되지 않도록 합니다.

<a name="retrieving-modifiers"></a>
#### 모디파이어 조회

구독에 적용된 모든 모디파이어 목록은 `modifiers` 메서드로 조회할 수 있습니다.

```
$modifiers = $user->subscription('default')->modifiers();

foreach ($modifiers as $modifier) {
    $modifier->amount(); // $0.99
    $modifier->description; // New text message.
}
```

<a name="deleting-modifiers"></a>
#### 모디파이어 삭제

`Laravel\Paddle\Modifier` 인스턴스에서 `delete` 메서드를 호출하면 해당 모디파이어를 삭제할 수 있습니다.

```
$modifier->delete();
```

<a name="multiple-subscriptions"></a>
### 복수 구독

Paddle은 고객이 동시에 여러 개의 구독을 가질 수 있도록 허용합니다. 예를 들어, 헬스클럽 운영자가 수영장 구독과 헬스장 구독을 각각 별도 가격으로 운영할 수 있습니다. 물론 고객은 두 플랜 중 하나만, 혹은 모두 구독할 수도 있습니다.

응용 프로그램에서 구독 생성 시, `newSubscription` 메서드에 구독명을 직접 지정해줄 수 있습니다. 이 이름은 사용자가 시작하려는 구독 종류를 나타내는 임의의 문자열이어도 무방합니다.

```
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()
        ->newSubscription('swimming', $swimmingMonthly = 12345)
        ->create($request->paymentMethodId);

    // ...
});
```

위 예시에서는 사용자를 위해 월간 수영 구독을 생성했습니다. 사용자가 나중에 연간 구독으로 전환하고 싶다면, 해당 사용자의 `swimming` 구독에서 요금만 바꿔주면 됩니다.

```
$user->subscription('swimming')->swap($swimmingYearly = 34567);
```

물론 해당 구독을 아예 취소할 수도 있습니다.

```
$user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>
### 구독 일시정지(일시중단)

구독을 일시적으로 멈추고 싶을 때는 사용자 구독의 `pause` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->pause();
```

구독이 일시정지되면, Cashier는 데이터베이스의 `paused_from` 컬럼을 자동으로 설정합니다. 이 컬럼은 언제부터 `paused` 메서드가 `true`를 반환해야 할지 판단하는 기준 시점으로 사용됩니다. 예를 들어, 3월 1일에 사용자가 구독 일시정지를 요청했으나 실제 청구 주기가 3월 5일이었다면, `paused` 메서드는 3월 5일부터 `true`를 반환하게 됩니다. 대부분의 경우 사용자는 결제 주기가 끝날 때까지 애플리케이션을 계속 사용할 수 있기 때문입니다.

일시정지됐지만 아직 "유예 기간(grace period)"에 있는지 여부는 `onPausedGracePeriod` 메서드로 확인할 수 있습니다.

```
if ($user->subscription('default')->onPausedGracePeriod()) {
    //
}
```

일시정지된 구독을 다시 활성화(재개)하고 싶다면, `unpause` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->unpause();
```

> [!WARNING]
> 구독이 일시정지된 상태에서는 어떤 변경도 할 수 없습니다. 다른 플랜으로 변경하거나 수량을 업데이트하려면, 먼저 구독을 재개해야 합니다.

<a name="cancelling-subscriptions"></a>
### 구독 취소

구독을 취소하려면, 사용자 구독의 `cancel` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->cancel();
```

구독이 취소되면, Cashier는 데이터베이스의 `ends_at` 컬럼을 자동으로 갱신합니다. 이 컬럼은 언제부터 `subscribed` 메서드가 `false`를 반환해야 할지 판단하는 데 사용됩니다. 예를 들어, 고객이 3월 1일에 구독을 취소했지만, 실제로 3월 5일에 종료될 예정이었다면, 3월 5일까지는 `subscribed`가 계속 `true`를 반환합니다. 대부분의 경우, 사용자는 결제 주기가 끝날 때까지 애플리케이션을 계속 사용할 수 있기 때문입니다.

또한 사용자가 구독을 취소했으나 아직 "유예 기간"에 있는지 `onGracePeriod` 메서드로 확인할 수 있습니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    //
}
```

바로 구독을 즉시 취소하고 싶다면, `cancelNow` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->cancelNow();
```

> [!WARNING]
> Paddle 구독은 일단 취소하면 다시 재개(resume)할 수 없습니다. 고객이 구독을 재개하고자 할 경우, 반드시 새 구독 생성이 필요합니다.

<a name="subscription-trials"></a>
## 구독 체험(Trial) 기간

<a name="with-payment-method-up-front"></a>
### 결제 수단 선등록 방식

> [!WARNING]
> 체험 기간 적용 시 결제 수단을 미리 등록받는 경우, Paddle은 플랜 변경이나 수량 업데이트 등 구독의 모든 변경 작업을 막습니다. 체험 중 플랜을 바꾸고 싶다면 해당 구독을 취소한 뒤 새로 생성해야 합니다.

체험(Trial) 기간을 제공하면서도 결제 수단을 미리 수집하고자 한다면, 구독 결제 링크 생성 시 `trialDays` 메서드를 활용하세요.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $payLink = $request->user()->newSubscription('default', $monthly = 12345)
                ->returnTo(route('home'))
                ->trialDays(10)
                ->create();

    return view('billing', ['payLink' => $payLink]);
});
```

이 방식은 구독 레코드에 체험 종료일을 저장하며, Paddle도 체험 종료일까지는 고객에게 청구하지 않습니다.

> [!WARNING]
> 체험이 끝나기 전에 사용자가 구독을 취소하지 않으면, 체험 종료 즉시 자동으로 과금이 진행됩니다. 반드시 체험 종료일을 사용자에게 미리 안내해 주세요.

사용자가 체험 기간 내에 있는지 여부는 사용자 인스턴스의 `onTrial` 메서드 또는 구독 인스턴스의 `onTrial` 메서드로 모두 확인할 수 있습니다. 두 방법은 동일한 효과를 가집니다.

```
if ($user->onTrial('default')) {
    //
}

if ($user->subscription('default')->onTrial()) {
    //
}
```

기존 체험 기간이 만료됐는지 확인하고 싶을 때는 `hasExpiredTrial` 메서드를 사용합니다.

```
if ($user->hasExpiredTrial('default')) {
    //
}

if ($user->subscription('default')->hasExpiredTrial()) {
    //
}
```

<a name="defining-trial-days-in-paddle-cashier"></a>
#### Paddle / Cashier에서 체험 일수 설정

플랜별 체험 기간은 Paddle 대시보드에서 설정하거나, Cashier에서 구독 생성 시 항상 명시적으로 지정할 수 있습니다. Paddle 대시보드에 체험 기간을 설정했다면, 신규 구독(이전에 구독한 고객의 신규 구독 포함)에는 항상 체험 기간이 적용됩니다. 체험 없이 바로 구독을 시작하고 싶다면, 반드시 `trialDays(0)` 메서드를 명시적으로 호출해야 합니다.

<a name="without-payment-method-up-front"></a>
### 결제 수단 없이 체험 기간 제공

사용자에게 결제 수단을 미리 요구하지 않고도 체험 기간을 제공하고 싶다면, 사용자 레코드에 연결된 고객(Customer) 레코드의 `trial_ends_at` 컬럼을 원하는 체험 종료일로 설정하면 됩니다. 이는 보통 사용자 등록 시 처리합니다.

```
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->addDays(10)
]);
```

이 방식을 Cashier에서는 "일반 체험(generic trial)"이라 부릅니다. 별도의 구독에 연결된 체험이 아니라서 그렇습니다. 사용자의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at` 이후가 아닌 경우에만 `true`를 반환합니다.

```
if ($user->onTrial()) {
    // 사용자가 체험(Trial) 기간 내에 있습니다...
}
```

사용자의 실제 구독 생성을 준비가 끝났다면, 기존과 동일하게 `newSubscription` 메서드를 사용해 구독을 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $payLink = $user->newSubscription('default', $monthly = 12345)
        ->returnTo(route('home'))
        ->create();

    return view('billing', ['payLink' => $payLink]);
});
```

사용자의 체험 종료일을 조회하려면 `trialEndsAt` 메서드를 사용하세요. 사용자가 체험 중이라면 Carbon 날짜 인스턴스를 반환하고, 아니라면 `null`을 반환합니다. 기본 구독 이외의 특정 구독에 대해 체험 종료일을 알고 싶다면, 해당 구독명을 인자로 전달할 수도 있습니다.

```
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

"일반 체험(generic trial)" 상태, 즉 실제 구독 없이 고객에만 체험이 설정되어 있는지 알고 싶다면 `onGenericTrial` 메서드를 사용할 수 있습니다.

```
if ($user->onGenericTrial()) {
    // 사용자가 "일반 체험" 상태에 있습니다...
}
```

> [!WARNING]
> 한 번 생성된 Paddle 구독의 체험 기간은 연장하거나 수정할 수 없습니다.

<a name="handling-paddle-webhooks"></a>
## Paddle 웹훅 처리

Paddle은 다양한 이벤트가 발생할 때 웹훅을 통해 애플리케이션에 알릴 수 있습니다. 기본적으로 Cashier 서비스 제공자가 Cashier의 웹훅 컨트롤러를 가리키는 라우트를 등록합니다. 이 컨트롤러가 모든 웹훅 요청을 처리합니다.

기본적으로 이 컨트롤러는 결제 실패(지나치게 많이 실패한 경우 - [Paddle의 연체(dunning) 설정](https://vendors.paddle.com/recover-settings#dunning-form-id) 기준), 구독 갱신, 결제 정보 변경 등의 이벤트를 자동으로 처리합니다. 물론 여러분이 원하는 어떤 Paddle 웹훅 이벤트든 컨트롤러를 확장해서 직접 처리할 수도 있습니다.

애플리케이션이 Paddle 웹훅을 올바르게 처리하려면, 반드시 [Paddle 관리 패널에서 웹훅 URL을 올바르게 설정](https://vendors.paddle.com/alerts-webhooks)해야 합니다. Cashier의 기본 웹훅 컨트롤러는 `/paddle/webhook` 경로를 사용합니다. Paddle 관리 패널에서 활성화해야 하는 모든 웹훅 목록은 아래와 같습니다.

- Subscription Created
- Subscription Updated
- Subscription Cancelled
- Payment Succeeded
- Subscription Payment Succeeded

> [!WARNING]
> 웹훅 요청이 Cashier에 포함된 [웹훅 서명(Signature) 검증](/docs/9.x/cashier-paddle#verifying-webhook-signatures) 미들웨어로 보호되고 있는지 반드시 확인하세요.

<a name="webhooks-csrf-protection"></a>

#### 웹훅(Webhook)과 CSRF 보호

Paddle 웹훅은 라라벨의 [CSRF 보호](/docs/9.x/csrf)를 우회해야 하므로, `App\Http\Middleware\VerifyCsrfToken` 미들웨어에서 해당 URI를 예외 목록에 등록하거나 해당 라우트를 `web` 미들웨어 그룹 외부에서 정의해야 합니다.

```
protected $except = [
    'paddle/*',
];
```

<a name="webhooks-local-development"></a>
#### 웹훅과 로컬 개발 환경

Paddle이 로컬 개발 환경에서 애플리케이션으로 웹훅을 전송할 수 있도록 하려면 [Ngrok](https://ngrok.com/) 또는 [Expose](https://expose.dev/docs/introduction)와 같은 사이트 공유 서비스를 통해 애플리케이션을 외부에 노출해야 합니다. [Laravel Sail](/docs/9.x/sail)을 이용해 로컬에서 개발 중이라면, Sail의 [사이트 공유 명령어](/docs/9.x/sail#sharing-your-site)를 사용할 수도 있습니다.

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의하기

Cashier는 결제 실패 시 구독 취소 등과 같은 일반적인 Paddle 웹훅을 자동으로 처리합니다. 그러나 추가적으로 처리하고 싶은 웹훅 이벤트가 있다면, Cashier에서 발생시키는 아래 이벤트를 리스닝하여 직접 처리할 수 있습니다.

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

이 이벤트들은 모두 Paddle 웹훅의 전체 페이로드를 포함합니다. 예를 들어, `invoice.payment_succeeded` 웹훅을 처리하고 싶다면, 아래와 같이 [리스너](/docs/9.x/events#defining-listeners)를 등록할 수 있습니다.

```
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * Paddle 웹훅을 처리합니다.
     *
     * @param  \Laravel\Paddle\Events\WebhookReceived  $event
     * @return void
     */
    public function handle(WebhookReceived $event)
    {
        if ($event->payload['alert_name'] === 'payment_succeeded') {
            // 웹훅 이벤트를 처리하는 코드...
        }
    }
}
```

리스너를 정의한 후에는, 애플리케이션의 `EventServiceProvider`에 등록해야 합니다.

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

Cashier는 수신된 웹훅의 종류에 따라 전용 이벤트도 발생시킵니다. 이들 이벤트에는 Paddle에서 받은 전체 페이로드뿐 아니라, 웹훅 처리 시 사용된 관련 모델(청구 모델, 구독, 영수증 등)도 함께 전달됩니다.

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\PaymentSucceeded`
- `Laravel\Paddle\Events\SubscriptionPaymentSucceeded`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionCancelled`

</div>

기본 내장 웹훅 라우트를 오버라이드하고 싶다면, 애플리케이션의 `.env` 파일에서 `CASHIER_WEBHOOK` 환경 변수를 정의하면 됩니다. 이 값은 반드시 전체 웹훅 라우트 URL이어야 하며, Paddle 관리 패널에 등록된 URL과 일치해야 합니다.

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### 웹훅 서명 검증

웹훅을 보호하기 위해 [Paddle의 웹훅 서명](https://developer.paddle.com/webhook-reference/verifying-webhooks)을 활용할 수 있습니다. Cashier는 Paddle에서 수신한 웹훅 요청이 유효한지 자동으로 검증해 주는 미들웨어를 포함하고 있습니다.

웹훅 검증을 활성화하려면, 애플리케이션의 `.env` 파일에 `PADDLE_PUBLIC_KEY` 환경 변수를 반드시 정의해야 합니다. 공개 키는 Paddle 계정 대시보드에서 가져올 수 있습니다.

<a name="single-charges"></a>
## 단건 결제

<a name="simple-charge"></a>
### 일반 결제

고객에게 단회성 결제를 진행하고 싶다면, 청구 가능한 모델 인스턴스에서 `charge` 메서드를 사용하여 결제용 페이 링크(pay link)를 만들 수 있습니다. `charge` 메서드의 첫 번째 인수로는 결제 금액(float), 두 번째 인수로는 결제 설명을 입력합니다.

```
use Illuminate\Http\Request;

Route::get('/store', function (Request $request) {
    return view('store', [
        'payLink' => $user->charge(12.99, 'Action Figure')
    ]);
});
```

페이 링크를 생성한 후에는 Cashier에서 제공하는 `paddle-button` Blade 컴포넌트를 사용하여 사용자가 Paddle 위젯을 실행하고 결제를 마칠 수 있도록 할 수 있습니다.

```blade
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Buy
</x-paddle-button>
```

`charge` 메서드는 세 번째 인수로 배열을 받아, Paddle에게 결제 링크 생성 시 원하는 다양한 옵션을 전달할 수 있습니다. 사용할 수 있는 옵션에 관한 자세한 내용은 [Paddle 공식 문서](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)를 참고하세요.

```
$payLink = $user->charge(12.99, 'Action Figure', [
    'custom_option' => $value,
]);
```

결제는 `cashier.currency` 설정 옵션에 명시된 통화 단위로 이루어집니다. 기본 값은 USD입니다. 애플리케이션의 `.env` 파일에서 `CASHIER_CURRENCY` 환경 변수를 설정하여 기본 통화 단위를 변경할 수 있습니다.

```ini
CASHIER_CURRENCY=EUR
```

또한, Paddle의 동적 가격 매칭 시스템을 이용해 [통화별 가격을 지정](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink#price-overrides)할 수도 있습니다. 이 경우 고정 금액 대신 통화별 가격 배열을 전달합니다.

```
$payLink = $user->charge([
    'USD:19.99',
    'EUR:15.99',
], 'Action Figure');
```

<a name="charging-products"></a>
### 상품별 결제

Paddle에 미리 등록된 특정 상품에 대해 단회성 결제를 진행하고 싶다면, 청구 가능한 모델 인스턴스의 `chargeProduct` 메서드를 사용해 페이 링크를 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/store', function (Request $request) {
    return view('store', [
        'payLink' => $request->user()->chargeProduct($productId = 123)
    ]);
});
```

이후, `paddle-button` 컴포넌트에 해당 페이 링크를 넘겨 사용자가 Paddle 위젯을 실행할 수 있도록 하면 됩니다.

```blade
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Buy
</x-paddle-button>
```

`chargeProduct` 메서드 역시 두 번째 인수로 배열을 받을 수 있어, Paddle 결제 링크 생성 시 다양한 옵션을 전달할 수 있습니다. 옵션 관련 사항은 [Paddle 공식 문서](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)를 참고하세요.

```
$payLink = $user->chargeProduct($productId, [
    'custom_option' => $value,
]);
```

<a name="refunding-orders"></a>
### 주문 환불

Paddle 주문을 환불할 필요가 있다면, `refund` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 Paddle 주문 ID를 받습니다. 청구 가능한 모델에 대한 영수증은 `receipts` 메서드로 조회할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$receipt = $user->receipts()->first();

$refundRequestId = $user->refund($receipt->order_id);
```

환불 금액이나 환불 사유를 별도로 지정할 수도 있습니다.

```
$receipt = $user->receipts()->first();

$refundRequestId = $user->refund(
    $receipt->order_id, 5.00, 'Unused product time'
);
```

> [!NOTE]
> Paddle 지원팀에 문의 시 `$refundRequestId`를 환불 참조값으로 사용할 수 있습니다.

<a name="receipts"></a>
## 영수증(Receipts)

청구 가능한 모델의 영수증 배열은 `receipts` 프로퍼티를 통해 쉽게 조회할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$receipts = $user->receipts;
```

고객의 영수증을 나열할 때는 각 영수증 인스턴스의 메서드를 이용해 표시할 정보를 불러올 수 있습니다. 예를 들어, 모든 영수증을 표로 나열하고 사용자가 원하는 영수증을 바로 다운로드할 수 있도록 할 수 있습니다.

```html
<table>
    @foreach ($receipts as $receipt)
        <tr>
            <td>{{ $receipt->paid_at->toFormattedDateString() }}</td>
            <td>{{ $receipt->amount() }}</td>
            <td><a href="{{ $receipt->receipt_url }}" target="_blank">Download</a></td>
        </tr>
    @endforeach
</table>
```

<a name="past-and-upcoming-payments"></a>
### 과거 및 예정된 결제 내역

`lastPayment`와 `nextPayment` 메서드를 사용하여 반복 구독에 대한 고객의 과거 및 예정 결제 내역을 조회하고 표시할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription('default');

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

이 두 메서드는 모두 `Laravel\Paddle\Payment` 인스턴스를 반환합니다. 단, 구독이 해지되어 결제 주기가 끝난 경우 `nextPayment`는 `null`을 반환합니다.

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="handling-failed-payments"></a>
## 실패한 결제 처리

구독 결제는 카드 만료, 한도 초과 등 다양한 원인으로 실패할 수 있습니다. 이런 경우에는 Paddle에서 결제 실패 처리를 담당하도록 하는 것이 좋습니다. Paddle 대시보드에서 [자동 청구 이메일](https://vendors.paddle.com/subscription-settings) 설정을 통해 처리할 수 있습니다.

그리고, 더 세밀한 제어가 필요하다면 Cashier에서 디스패치하는 `WebhookReceived` 이벤트를 리스닝하여 `subscription_payment_failed` Paddle 이벤트를 직접 처리할 수도 있습니다. Paddle 대시보드의 Webhook 설정에서 "Subscription Payment Failed" 옵션이 활성화되어 있는지도 확인하세요.

```
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * Paddle 웹훅을 처리합니다.
     *
     * @param  \Laravel\Paddle\Events\WebhookReceived  $event
     * @return void
     */
    public function handle(WebhookReceived $event)
    {
        if ($event->payload['alert_name'] === 'subscription_payment_failed') {
            // 실패한 구독 결제 처리...
        }
    }
}
```

리스너를 정의한 뒤에는, 애플리케이션의 `EventServiceProvider`에 반드시 등록해야 합니다.

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

<a name="testing"></a>
## 테스트

빌링(Billing) 플로우의 예상 동작을 확인하려면 실제로 수동 테스트를 하는 것이 좋습니다.

CI 환경 등 자동화된 테스트에서는 [라라벨의 HTTP 클라이언트](/docs/9.x/http-client#testing)를 이용해 Paddle로 보내는 HTTP 요청을 페이크로 처리할 수 있습니다. 이 방식은 실제 Paddle의 응답을 테스트하지는 않지만, Paddle API를 호출하지 않고 애플리케이션 동작을 검증하는 데 유용하게 활용할 수 있습니다.