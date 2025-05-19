# 라라벨 Cashier, Paddle (Laravel Cashier (Paddle))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
    - [Paddle 샌드박스](#paddle-sandbox)
    - [데이터베이스 마이그레이션](#database-migrations)
- [설정](#configuration)
    - [청구 가능 모델](#billable-model)
    - [API 키](#api-keys)
    - [Paddle JS](#paddle-js)
    - [통화 설정](#currency-configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [핵심 개념](#core-concepts)
    - [페이 링크(Pay Links)](#pay-links)
    - [인라인 결제(Checkout)](#inline-checkout)
    - [사용자 식별](#user-identification)
- [가격](#prices)
- [고객](#customers)
    - [고객 기본값](#customer-defaults)
- [구독](#subscriptions)
    - [구독 생성](#creating-subscriptions)
    - [구독 상태 확인](#checking-subscription-status)
    - [구독 단일 청구](#subscription-single-charges)
    - [결제 정보 업데이트](#updating-payment-information)
    - [플랜 변경](#changing-plans)
    - [구독 수량(Quantity)](#subscription-quantity)
    - [구독 Modifier](#subscription-modifiers)
    - [구독 일시 중지](#pausing-subscriptions)
    - [구독 취소](#cancelling-subscriptions)
- [구독 트라이얼(체험)](#subscription-trials)
    - [선결제 방식 트라이얼](#with-payment-method-up-front)
    - [무결제 방식 트라이얼](#without-payment-method-up-front)
- [Paddle Webhook 처리](#handling-paddle-webhooks)
    - [Webhook 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [Webhook 서명 검증](#verifying-webhook-signatures)
- [단일 청구](#single-charges)
    - [간단한 결제](#simple-charge)
    - [상품 결제](#charging-products)
    - [주문 환불](#refunding-orders)
- [영수증](#receipts)
    - [과거 및 예정된 결제 내역](#past-and-upcoming-payments)
- [실패한 결제 처리](#handling-failed-payments)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[라라벨 Cashier Paddle](https://github.com/laravel/cashier-paddle)은 [Paddle](https://paddle.com)의 구독 과금 서비스를 직관적이고 쉽게 사용할 수 있는 인터페이스로 제공합니다. 번거로운 구독 과금 관련 반복 코드를 거의 모두 알아서 처리합니다. 기본적인 구독 관리 외에도, Cashier는 쿠폰, 구독 플랜 변경, 구독 "수량(Quantity)", 구독 취소 유예 기간 등 다양한 기능도 제공합니다.

Cashier를 사용할 때에는 Paddle의 [사용자 가이드](https://developer.paddle.com/guides)와 [API 문서](https://developer.paddle.com/api-reference/intro)도 함께 참고하시기를 권장합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier의 새로운 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md)를 반드시 꼼꼼히 확인해야 합니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 사용하여 Paddle용 Cashier 패키지를 설치합니다.

```
composer require laravel/cashier-paddle
```

> [!NOTE]
> Cashier가 모든 Paddle 이벤트를 제대로 처리할 수 있도록, 반드시 [Cashier의 Webhook 처리](#handling-paddle-webhooks)를 설정해두어야 합니다.

<a name="paddle-sandbox"></a>
### Paddle 샌드박스

로컬 혹은 스테이징 개발 단계에서는 반드시 [Paddle Sandbox 계정](https://developer.paddle.com/getting-started/sandbox)을 등록하세요. 이 계정을 사용하면 실제 결제가 발생하지 않는 샌드박스 환경에서 안전하게 애플리케이션을 테스트하고 개발할 수 있습니다. 다양한 결제 상황을 시뮬레이션하려면 Paddle의 [테스트 카드 번호](https://developer.paddle.com/getting-started/sandbox#test-cards)를 사용할 수 있습니다.

Paddle 샌드박스 환경을 사용 중이라면, 애플리케이션의 `.env` 파일에서 `PADDLE_SANDBOX` 환경 변수를 `true`로 설정해야 합니다.

PADDLE_SANDBOX=true

애플리케이션 개발을 마쳤다면 [Paddle 벤더 계정](https://paddle.com)을 신청할 수 있습니다.

<a name="database-migrations"></a>
### 데이터베이스 마이그레이션

Cashier 서비스 프로바이더는 자체 마이그레이션 디렉터리를 등록합니다. 패키지 설치 후 반드시 데이터베이스 마이그레이션을 실행하세요. Cashier가 제공하는 마이그레이션은 새로운 `customers` 테이블을 생성합니다. 또한, 모든 고객의 구독 정보를 저장하는 `subscriptions` 테이블, 애플리케이션의 영수증 정보를 관리하는 `receipts` 테이블도 함께 생성됩니다.

```
php artisan migrate
```

Cashier에서 제공하는 기본 마이그레이션 파일을 직접 수정하고 싶다면, 아래의 Artisan 명령어로 마이그레이션 파일을 퍼블리시할 수 있습니다.

```
php artisan vendor:publish --tag="cashier-migrations"
```

반대로, Cashier가 제공하는 마이그레이션을 아예 실행하지 않을 수도 있습니다. 이 경우, Cashier에서 제공하는 `ignoreMigrations` 메서드를 사용할 수 있습니다. 일반적으로, 이 메서드는 `AppServiceProvider`의 `register` 메서드에서 호출합니다.

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

Cashier를 사용하기 전에 반드시 사용자(User) 모델에 `Billable` 트레이트를 추가해야 합니다. 이 트레이트를 추가하면 구독 생성, 쿠폰 적용, 결제 수단 정보 갱신 등 다양한 과금 관련 작업을 쉽게 수행할 수 있습니다.

```
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

사용자가 아닌 다른 엔터티(예: 팀 등)도 과금 대상으로 만들고 싶다면, 해당 클래스에 이 트레이트를 추가하면 됩니다.

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

다음으로, Paddle 키 정보를 애플리케이션의 `.env` 파일에 설정해야 합니다. Paddle API 키는 Paddle 관리 콘솔에서 확인할 수 있습니다.

```
PADDLE_VENDOR_ID=your-paddle-vendor-id
PADDLE_VENDOR_AUTH_CODE=your-paddle-vendor-auth-code
PADDLE_PUBLIC_KEY="your-paddle-public-key"
PADDLE_SANDBOX=true
```

`PADDLE_SANDBOX` 환경 변수는 [Paddle 샌드박스 환경](#paddle-sandbox) 사용 시 `true`로 설정해야 합니다. 운영 환경(프로덕션)에서 Paddle의 실제 벤더 환경을 사용할 때에는 `PADDLE_SANDBOX` 값을 `false`로 변경해야 합니다.

<a name="paddle-js"></a>
### Paddle JS

Paddle의 결제 위젯을 띄우려면 전용 자바스크립트 라이브러리를 로드해야 합니다. 이 라이브러리는 애플리케이션 레이아웃의 `</head>` 태그 바로 앞에 `@paddleJS` Blade 디렉티브를 삽입하면 자동으로 로드할 수 있습니다.

```
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### 통화 설정

Cashier는 기본적으로 미국 달러(USD)를 통화로 사용합니다. 다른 통화를 기본값으로 사용하려면, `.env` 파일에 `CASHIER_CURRENCY` 환경 변수를 추가하세요.

```
CASHIER_CURRENCY=EUR
```

통화 외에도, 청구서에 표시될 금액의 로캘(언어 및 지역)을 설정할 수도 있습니다. 내부적으로 Cashier는 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 통해 금액 로캘을 지정합니다.

```
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!NOTE]
> `en`(영어) 외의 로캘을 사용하려면, 서버에 `ext-intl` PHP 확장 모듈이 설치 및 구성되어 있어야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Cashier 내부에서 사용하는 모델을 직접 확장하여 원하는 방식(필드 추가 등)으로 정의할 수 있습니다. Cashier 모델을 상속받아 새 모델을 만든 후, Cashier에 이를 사용하도록 지정만 하면 됩니다.

```
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의했다면, `Laravel\Paddle\Cashier` 클래스의 메서드로 커스텀 모델을 Cashier에 등록하세요. 일반적으로 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 지정합니다.

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
### 페이 링크(Pay Links)

Paddle은 구독 상태를 변경하는 전용 CRUD API가 충분하지 않습니다. 그래서 대부분의 Paddle과의 상호작용은 [결제 위젯(Checkout Widget)](https://developer.paddle.com/guides/how-tos/checkout/paddle-checkout)을 통해 이루어집니다. 결제 위젯을 띄우려면 먼저 Cashier를 사용해 "페이 링크(pay link)"를 발급받아야 합니다. 이 페이 링크는 어떤 과금 작업을 할지 결제 위젯에 알려주는 역할을 합니다.

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

Cashier에는 `paddle-button` [Blade 컴포넌트](/docs/8.x/blade#components)가 준비되어 있습니다. 이 컴포넌트의 prop으로 페이 링크 URL을 전달하면, 버튼 클릭 시 Paddle 결제 위젯이 자동으로 나타납니다.

```html
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

기본적으로 이 버튼에는 표준 Paddle 스타일이 적용됩니다. 모든 Paddle 스타일을 제거하고 싶다면, 컴포넌트에 `data-theme="none"` 속성을 추가하면 됩니다.

```html
<x-paddle-button :url="$payLink" class="px-8 py-4" data-theme="none">
    Subscribe
</x-paddle-button>
```

Paddle 결제 위젯은 비동기적으로 동작합니다. 사용자가 위젯에서 구독을 생성하거나 수정하면, Paddle은 웹훅(Webhook)을 여러분의 애플리케이션으로 전송하여 데이터베이스에 올바르게 구독 상태를 반영할 수 있도록 도와줍니다. 따라서 Paddle에서의 상태 변경을 반영하려면 반드시 [웹훅 처리](#handling-paddle-webhooks)를 올바르게 설정해 두어야 합니다.

페이 링크에 대한 더 자세한 정보는 [Paddle API 문서(페이 링크 생성)](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)에서 확인하실 수 있습니다.

> [!NOTE]
> 구독 상태 변경 이후 해당 웹훅을 수신하기까지는 일반적으로 딜레이가 거의 없지만, 결제가 끝난 즉시 구독 정보가 바로 반영되지 않을 수도 있음을 염두에 두어야 합니다.

<a name="manually-rendering-pay-links"></a>
#### 페이 링크 수동 렌더링

라라벨의 기본 제공 Blade 컴포넌트를 사용하지 않아도, 페이 링크를 직접 HTML에 연결할 수 있습니다. 먼저, 이전 예시처럼 페이 링크 URL을 생성합니다.

```
$payLink = $request->user()->newSubscription('default', $premium = 34567)
    ->returnTo(route('home'))
    ->create();
```

그런 다음, 생성된 페이 링크 URL을 HTML의 `a` 요소에 단순히 연결하여 사용할 수 있습니다.

```
<a href="#!" class="ml-4 paddle_button" data-override="{{ $payLink }}">
    Paddle Checkout
</a>
```

<a name="payments-requiring-additional-confirmation"></a>
#### 추가 확인이 필요한 결제

일부 결제의 경우, 추가적인 확인 절차가 필요할 수 있습니다. 이럴 때 Paddle은 별도의 결제 확인 화면을 보여줍니다. Paddle이 보여주는 결제 확인 화면은, 결제 은행 또는 카드사에 따라 추가 카드 인증, 임시 소액 청구, 별도 디바이스 인증 등 여러 종류가 있을 수 있습니다.

<a name="inline-checkout"></a>
### 인라인 결제(Checkout)

Paddle의 "오버레이" 스타일 결제 위젯 대신, 위젯을 인라인으로 페이지 내에 직접 표시할 수도 있습니다. 이 방식은 결제 위젯의 HTML 필드를 커스터마이즈할 수는 없지만, 애플리케이션 내부에 바로 임베드해서 사용할 수 있습니다.

Cashier는 인라인 결제를 쉽게 구현할 수 있는 `paddle-checkout` Blade 컴포넌트를 지원합니다. [페이 링크를 생성](#pay-links)한 뒤, 이 컴포넌트의 `override` 속성에 페이 링크를 전달하세요.

```html
<x-paddle-checkout :override="$payLink" class="w-full" />
```

인라인 결제 컴포넌트의 높이를 조정하려면 `height` 속성을 추가하면 됩니다.

```
<x-paddle-checkout :override="$payLink" class="w-full" height="500" />
```

<a name="inline-checkout-without-pay-links"></a>
#### 페이 링크 없이 인라인 결제 구현

페이 링크를 사용하지 않고, 사용자 정의 옵션을 지정하여 위젯을 커스터마이즈할 수도 있습니다.

```
$options = [
    'product' => $productId,
    'title' => 'Product Title',
];

<x-paddle-checkout :options="$options" class="w-full" />
```

인라인 결제에서 사용할 수 있는 옵션에 대한 자세한 내용은 Paddle의 [Inline Checkout 가이드](https://developer.paddle.com/guides/how-tos/checkout/inline-checkout)와 [파라미터 레퍼런스](https://developer.paddle.com/reference/paddle-js/parameters)를 참고하세요.

> [!NOTE]
> 직접 옵션을 지정하여 `passthrough`(임의 데이터 전달)를 사용하려면, 키/값 배열을 값으로 넘기면 됩니다. Cashier가 자동으로 배열을 JSON 문자열로 변환해줍니다. 참고로, `customer_id` passthrough 옵션은 Cashier 내부적으로 사용되므로, 별도 지정하지 않아야 합니다.

<a name="manually-rendering-an-inline-checkout"></a>
#### 인라인 결제 수동 렌더링

라라벨의 Blade 컴포넌트를 사용하지 않고 인라인 결제를 직접 구현할 수도 있습니다. [앞선 예시와 같이 페이 링크 URL을 생성](#pay-links)하세요.

그다음, Paddle.js를 사용해서 결제 위젯을 초기화할 수 있습니다. 아래 예시는 [Alpine.js](https://github.com/alpinejs/alpine)를 이용한 것이지만, 여러분의 프론트엔드 환경에 맞게 참고해 구현 가능합니다.

```html
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
### 사용자 식별

Stripe와는 다르게, Paddle의 사용자는 모든 Paddle 전체에서 고유합니다. 즉, 각 Paddle 계정별로 고유한 사용자가 존재하지 않습니다. 이런 구조 때문에, Paddle의 API는 현재 사용자의 이메일 주소 등 세부 정보를 수정할 수 없습니다. 페이 링크 생성 시 Paddle은 `customer_email` 파라미터로 사용자를 식별하며, 구독 생성 시에도 입력받은 이메일을 이미 등록된 Paddle 사용자와 매칭하려 시도합니다.

이런 특성 때문에 Cashier와 Paddle을 사용할 때 반드시 주의해야 할 점이 있습니다. 첫째, Cashier에서는 같은 애플리케이션 사용자와 구독이 연결되어 있어도, **내부적으로 Paddle에서는 각기 다른 사용자(이메일 등)와 매칭될 수 있습니다.** 둘째, 구독마다 개별 결제 수단이나 이메일 주소가 따로 지정될 수 있습니다(Paddle에서 구독 생성 당시의 이메일이 그대로 사용됨).

따라서 구독 정보를 사용자에게 보여줄 때에는, 구독별로 어떤 이메일과 결제 정보가 연결되어 있는지를 반드시 안내해야 합니다. 아래와 같이 `Laravel\Paddle\Subscription` 모델이 제공하는 메서드로 이 정보를 확인할 수 있습니다.

```
$subscription = $user->subscription('default');

$subscription->paddleEmail();
$subscription->paymentMethod();
$subscription->cardBrand();
$subscription->cardLastFour();
$subscription->cardExpirationDate();
```

현재 Paddle API를 통해 사용자의 이메일 주소를 직접 변경할 방법은 없습니다. 사용자가 Paddle 내에서 이메일을 바꾸고 싶은 경우, Paddle 고객 지원팀에 직접 문의해야 합니다. 이때, 올바른 사용자를 식별하기 위해 해당 구독의 `paddleEmail` 값을 Paddle 측에 전달해야 합니다.

<a name="prices"></a>
## 가격

Paddle은 통화별로 가격을 다르게 설정할 수 있어, 국가별로 서로 다른 가격을 지정하는 것이 가능합니다. Cashier Paddle은 `productPrices` 메서드로 특정 상품의 모든 가격 정보를 가져올 수 있습니다. 이 메서드에는 가격을 확인하고 싶은 상품 ID 배열을 전달합니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::productPrices([123, 456]);
```

기본적으로 통화는 요청의 IP 주소로 판단되지만, 특정 국가의 가격을 확인하고 싶다면 다음과 같이 `customer_country` 옵션을 추가할 수 있습니다.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::productPrices([123, 456], ['customer_country' => 'BE']);
```

가져온 가격 정보는 원하는 형태로 출력할 수 있습니다.

```html
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->gross() }}</li>
    @endforeach
</ul>
```

세금이 빠진 실제 가격(순액) 및 세금 금액만 분리해서 보여줄 수도 있습니다.

```html
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->net() }} (+ {{ $price->price()->tax() }} tax)</li>
    @endforeach
</ul>
```

구독 플랜의 가격을 가져온 경우, 최초 결제료와 반복 결제료를 별도로 표시할 수 있습니다.

```html
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - Initial: {{ $price->initialPrice()->gross() }} - Recurring: {{ $price->recurringPrice()->gross() }}</li>
    @endforeach
</ul>
```

자세한 내용은 [Paddle의 API 문서(가격)](https://developer.paddle.com/api-reference/checkout-api/prices/getprices)를 참고하세요.

<a name="prices-customers"></a>
#### 고객별 가격

이미 고객으로 등록된 사용자가 있다면, 해당 고객에게 적용되는 가격을 직접 조회할 수도 있습니다. 고객 인스턴스에서 바로 `productPrices`를 호출하세요.

```
use App\Models\User;

$prices = User::find(1)->productPrices([123, 456]);
```

내부적으로 Cashier는 사용자의 [`paddleCountry` 메서드](#customer-defaults)를 활용해, 해당 국가의 통화로 가격을 조회합니다. 예를 들어 미국에 사는 사용자는 USD, 벨기에 사용자는 EUR로 가격이 표시됩니다. 만약 매칭되는 통화가 없다면 상품의 기본 통화가 사용됩니다. 모든 상품 및 플랜의 가격은 Paddle 콘솔에서 자유롭게 수정할 수 있습니다.

<a name="prices-coupons"></a>
#### 쿠폰

쿠폰이 적용된 최종 가격을 미리 보여줄 수도 있습니다. `productPrices` 호출 시 쿠폰을 콤마로 구분한 문자열로 전달하세요.

```
use Laravel\Paddle\Cashier;

$prices = Cashier::productPrices([123, 456], [
    'coupons' => 'SUMMERSALE,20PERCENTOFF'
]);
```

계산된 가격은 `price` 메서드로 가져올 수 있습니다.

```html
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->gross() }}</li>
    @endforeach
</ul>
```

쿠폰 할인 없이 원래 표시된 가격을 보이고 싶다면 `listPrice` 메서드를 사용하세요.

```html
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->listPrice()->gross() }}</li>
    @endforeach
</ul>
```

> [!NOTE]
> 가격 API를 사용할 때 Paddle은 오직 일회성 상품에만 쿠폰 적용을 지원하며, 구독 플랜에는 쿠폰을 적용할 수 없습니다.

<a name="customers"></a>
## 고객

<a name="customer-defaults"></a>
### 고객 기본값

Cashier에서는 페이 링크 생성 시 고객의 이메일, 국가, 우편번호 등 여러 정보를 기본값으로 미리 입력할 수 있습니다. 이를 통해 체크아웃 위젯에서 해당 정보를 바로 입력한 채로 결제 단계로 넘어갈 수 있습니다. 청구 가능 모델에서 아래 메서드들을 오버라이드하여 이러한 기본값을 설정할 수 있습니다.

```
/**
 * Get the customer's email address to associate with Paddle.
 *
 * @return string|null
 */
public function paddleEmail()
{
    return $this->email;
}

/**
 * Get the customer's country to associate with Paddle.
 *
 * This needs to be a 2 letter code. See the link below for supported countries.
 *
 * @return string|null
 * @link https://developer.paddle.com/reference/platform-parameters/supported-countries
 */
public function paddleCountry()
{
    //
}

/**
 * Get the customer's postal code to associate with Paddle.
 *
 * See the link below for countries which require this.
 *
 * @return string|null
 * @link https://developer.paddle.com/reference/platform-parameters/supported-countries#countries-requiring-postcode
 */
public function paddlePostcode()
{
    //
}
```

설정한 기본값은 Cashier에서 [페이 링크](#pay-links)를 생성하는 모든 작업에 적용됩니다.

<a name="subscriptions"></a>
## 구독

<a name="creating-subscriptions"></a>
### 구독 생성

구독을 생성하려면 먼저 청구 가능 모델(일반적으로 `App\Models\User` 인스턴스)을 가져와야 합니다. 모델 인스턴스를 준비한 다음, `newSubscription` 메서드로 구독 페이 링크를 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $payLink = $user->newSubscription('default', $premium = 12345)
        ->returnTo(route('home'))
        ->create();

    return view('billing', ['payLink' => $payLink]);
});
```

`newSubscription` 메서드의 첫 번째 인수는 구독의 내부 명칭입니다. 애플리케이션이 단일 구독만 제공하는 경우라면 `default` 또는 `primary`처럼 명명하면 됩니다. 이 구독 이름은 내부 애플리케이션 로직에서만 사용되므로, 사용자에게 노출하거나 변경하지 않아야 하며, 공백 없이 설정해야 합니다. 두 번째 인수는 사용자가 가입할 구체적인 플랜(Plan)의 식별자입니다. 이 값은 Paddle에서 플랜을 구분하는 값과 일치해야 합니다. `returnTo` 메서드에는 결제가 성공적으로 완료된 뒤 사용자를 리다이렉트할 URL을 지정합니다.

`create` 메서드는 실제로 사용할 수 있는 페이 링크를 생성합니다. 결제 버튼은 Cashier Paddle이 제공하는 `paddle-button` [Blade 컴포넌트](/docs/8.x/blade#components)를 사용해 만들 수 있습니다.

```html
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

사용자가 결제를 완료하면, Paddle에서 `subscription_created` 웹훅이 발송됩니다. Cashier가 이 웹훅을 수신하여 해당 고객의 구독을 설정해줍니다. 모든 웹훅이 제대로 수신/처리되는지 반드시 [웹훅 처리 설정](#handling-paddle-webhooks)이 필요한 점을 유념하세요.

<a name="additional-details"></a>
#### 추가 정보 지정

구독 또는 고객에 대한 추가 정보를 더 지정하고 싶다면, `create` 메서드에서 키/값 배열로 함께 전달할 수 있습니다. 지원되는 필드와 자세한 내용은 [Paddle 문서(페이 링크 생성)](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)를 참고하세요.

```
$payLink = $user->newSubscription('default', $monthly = 12345)
    ->returnTo(route('home'))
    ->create([
        'vat_number' => $vatNumber,
    ]);
```

<a name="subscriptions-coupons"></a>
#### 쿠폰

구독 생성 시 쿠폰을 함께 적용하고 싶다면, `withCoupon` 메서드를 이용하세요.

```
$payLink = $user->newSubscription('default', $monthly = 12345)
    ->returnTo(route('home'))
    ->withCoupon('code')
    ->create();
```

<a name="metadata"></a>

#### 메타데이터

`withMetadata` 메서드를 사용하여 메타데이터 배열을 전달할 수도 있습니다.

```
$payLink = $user->newSubscription('default', $monthly = 12345)
    ->returnTo(route('home'))
    ->withMetadata(['key' => 'value'])
    ->create();
```

> [!NOTE]
> 메타데이터를 제공할 때는 `subscription_name`을 메타데이터 키로 사용하지 마십시오. 이 키는 Cashier 내부적으로 예약되어 있습니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인하기

사용자가 애플리케이션에 구독한 이후에는 여러 편리한 메서드를 사용하여 구독 상태를 확인할 수 있습니다. 먼저, `subscribed` 메서드는 사용자가 활성 구독 상태라면(체험 기간(trial period) 중이더라도) `true`를 반환합니다.

```
if ($user->subscribed('default')) {
    //
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/8.x/middleware)에 활용하기에도 적합합니다. 이를 통해 사용자의 구독 상태에 따라 라우트와 컨트롤러의 접근을 제한할 수 있습니다.

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
            // 이 사용자는 유료 고객이 아닙니다...
            return redirect('billing');
        }

        return $next($request);
    }
}
```

사용자가 아직 체험 기간(trial period) 중인지 확인하고 싶다면 `onTrial` 메서드를 사용할 수 있습니다. 예를 들어, 체험 기간임을 유저에게 경고 메시지로 안내할 때 활용할 수 있습니다.

```
if ($user->subscription('default')->onTrial()) {
    //
}
```

`subscribedToPlan` 메서드는 지정한 Paddle 요금제(plan) ID를 바탕으로 사용자가 해당 요금제에 구독 중인지 여부를 확인할 때 사용할 수 있습니다. 예를 들어, 사용자의 `default` 구독이 월간 요금제에 등록되어 있는지 확인하려면 다음과 같이 할 수 있습니다.

```
if ($user->subscribedToPlan($monthly = 12345, 'default')) {
    //
}
```

`subscribedToPlan` 메서드에 배열을 전달하면 사용자의 `default` 구독이 월간 요금제나 연간 요금제 중 하나에 등록되어 있는지 확인할 수 있습니다.

```
if ($user->subscribedToPlan([$monthly = 12345, $yearly = 54321], 'default')) {
    //
}
```

`recurring` 메서드는 사용자가 현재 구독 중이며, 체험 기간이 지난 상태인지를 확인할 때 사용할 수 있습니다.

```
if ($user->subscription('default')->recurring()) {
    //
}
```

<a name="cancelled-subscription-status"></a>
#### 구독 취소 상태

사용자가 한때 활성 구독자였으나 구독을 취소한 경우, 이를 확인하려면 `cancelled` 메서드를 사용할 수 있습니다.

```
if ($user->subscription('default')->cancelled()) {
    //
}
```

구독 취소 후, 완전히 만료되기 전까지 "유예 기간(grace period)"이 남아 있는지도 확인할 수 있습니다. 예를 들어, 3월 5일에 구독을 취소했으나 원래 만료일이 3월 10일이었다면 3월 10일까지 유예 기간이 남은 상태입니다. 이 기간에도 `subscribed` 메서드는 여전히 `true`를 반환합니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    //
}
```

사용자가 구독을 취소했고, 더 이상 유예 기간에 있지 않은 상태인지 확인하려면 `ended` 메서드를 사용합니다.

```
if ($user->subscription('default')->ended()) {
    //
}
```

<a name="past-due-status"></a>
#### 연체 상태 (Past Due)

구독 결제에 실패하면 해당 구독의 상태가 `past_due`로 표시됩니다. 이 상태에서는 고객이 결제 정보를 갱신할 때까지 구독이 활성 상태가 아니게 됩니다. 구독 인스턴스의 `pastDue` 메서드를 사용하여 연체 상태인지 확인할 수 있습니다.

```
if ($user->subscription('default')->pastDue()) {
    //
}
```

구독이 연체 상태라면, 사용자에게 [결제 정보 갱신](#updating-payment-information)을 안내해야 합니다. 연체 구독 처리 방식은 [Paddle의 구독 설정](https://vendors.paddle.com/subscription-settings)에서 구성할 수 있습니다.

연체(`past_due`) 상태에서도 구독을 활성 상태로 간주하고 싶다면, Cashier에서 제공하는 `keepPastDueSubscriptionsActive` 메서드를 사용할 수 있습니다. 이 메서드는 일반적으로 `AppServiceProvider`의 `register` 메서드에서 호출해야 합니다.

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

> [!NOTE]
> 구독이 `past_due` 상태일 때는 결제 정보가 갱신되기 전까지 상태를 변경할 수 없습니다. 따라서 `swap` 및 `updateQuantity` 메서드가 `past_due` 상태에서 호출되면 예외가 발생합니다.

<a name="subscription-scopes"></a>
#### 구독 조회 스코프(Scopes)

대부분의 구독 상태는 쿼리 스코프(scope)로도 제공되어, 특정 상태에 해당하는 구독을 데이터베이스에서 쉽게 조회할 수 있습니다.

```
// 활성 구독 모두 조회하기...
$subscriptions = Subscription::query()->active()->get();

// 해당 사용자의 모든 취소된 구독 조회하기...
$subscriptions = $user->subscriptions()->cancelled()->get();
```

사용 가능한 전체 스코프 목록은 다음과 같습니다.

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
### 구독 단일 청구(Subscription Single Charges)

구독 단일 청구 기능을 사용하면 구독자에게 구독 금액에 더해 1회성 추가 금액을 청구할 수 있습니다.

```
$response = $user->subscription('default')->charge(12.99, 'Support Add-on');
```

[단일 청구](#single-charges)와 달리, 이 메서드는 구독에 저장된 결제 수단으로 즉시 청구가 이루어집니다. 청구 금액은 반드시 구독의 통화로 지정해야 합니다.

<a name="updating-payment-information"></a>
### 결제 정보 갱신

Paddle은 구독별로 결제 수단을 저장합니다. 구독의 기본 결제 수단을 갱신하려면 우선 구독 모델의 `updateUrl` 메서드를 사용하여 구독 "업데이트 URL"을 생성해야 합니다.

```
use App\Models\User;

$user = User::find(1);

$updateUrl = $user->subscription('default')->updateUrl();
```

그런 다음, Cashier에서 제공하는 `paddle-button` Blade 컴포넌트와 함께 생성된 URL을 사용하여 사용자가 Paddle 위젯을 열고 결제 정보를 갱신할 수 있도록 할 수 있습니다.

```html
<x-paddle-button :url="$updateUrl" class="px-8 py-4">
    Update Card
</x-paddle-button>
```

사용자가 결제 정보를 갱신하면, Paddle에서 `subscription_updated` 웹훅이 전송되며, 애플리케이션의 데이터베이스에 구독 정보가 자동으로 업데이트됩니다.

<a name="changing-plans"></a>
### 요금제 변경

사용자가 애플리케이션에 구독한 후, 새로운 구독 요금제로 변경하고 싶어 할 수 있습니다. 사용자의 구독 요금제를 변경하려면, 구독의 `swap` 메서드에 Paddle 요금제의 식별자를 전달하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap($premium = 34567);
```

요금제 변경 시 다음 결제 주기까지 기다리지 않고 곧바로 사용자를 청구하려면 `swapAndInvoice` 메서드를 사용하세요.

```
$user = User::find(1);

$user->subscription('default')->swapAndInvoice($premium = 34567);
```

> [!NOTE]
> 체험(trial) 중에는 요금제 변경이 불가능합니다. 이 제한에 대한 추가 정보는 [Paddle 공식 문서](https://developer.paddle.com/api-reference/subscription-api/users/updateuser#usage-notes)를 참고하세요.

<a name="prorations"></a>
#### 일할 계산(Prorations)

기본적으로, Paddle은 요금제를 변경할 때 금액을 일할 계산하여 청구합니다. 일할 계산 없이 구독 정보를 갱신하려면 `noProrate` 메서드를 사용합니다.

```
$user->subscription('default')->noProrate()->swap($premium = 34567);
```

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

특정 상황에서는 구독이 "수량(quantity)"에 따라 사용될 수 있습니다. 예를 들어, 프로젝트 관리 애플리케이션이 프로젝트 1개당 월 $10을 부과하는 경우가 이에 해당합니다. 구독 수량을 간편하게 증가 또는 감소하려면, `incrementQuantity`와 `decrementQuantity` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// 구독의 수량을 5개만큼 추가...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// 구독의 수량을 5개만큼 차감...
$user->subscription('default')->decrementQuantity(5);
```

또는 `updateQuantity` 메서드를 사용하여 특정 수량으로 직접 설정할 수도 있습니다.

```
$user->subscription('default')->updateQuantity(10);
```

일할 계산 없이 구독 수량을 갱신하고 싶다면, `noProrate` 메서드를 함께 사용할 수 있습니다.

```
$user->subscription('default')->noProrate()->updateQuantity(10);
```

<a name="subscription-modifiers"></a>
### 구독 수정자(Subscription Modifiers)

구독 수정자(modifier)를 사용하면 [측정형 청구(metered billing)](https://developer.paddle.com/guides/how-tos/subscriptions/metered-billing#using-subscription-price-modifiers)나 부가 기능(add-on)을 구독에 적용할 수 있습니다.

예를 들어, 표준 구독에 "프리미엄 지원" 부가 기능을 제공하고 싶다면 아래와 같이 수정자를 추가할 수 있습니다.

```
$modifier = $user->subscription('default')->newModifier(12.99)->create();
```

위 예시에서는 구독에 $12.99의 부가 비용이 추가됩니다. 기본적으로 이 금액은 구독에서 설정한 주기마다 계속 반복 청구됩니다. 만약 수정자에 사람이 보기 쉬운 설명을 추가하고 싶다면, `description` 메서드를 사용할 수 있습니다.

```
$modifier = $user->subscription('default')->newModifier(12.99)
    ->description('Premium Support')
    ->create();
```

수정자(modifier)를 활용해 측정형 청구를 구현하는 예시로, 사용자가 SMS 메시지를 보낼 때마다 과금을 하려면 Paddle 대시보드에서 $0 요금제를 만들고, 사용자가 이 요금제에 구독하면 각각의 청구에 해당하는 수정자를 추가하면 됩니다.

```
$modifier = $user->subscription('default')->newModifier(0.99)
    ->description('New text message')
    ->oneTime()
    ->create();
```

위 코드에서 `oneTime` 메서드를 호출하였으므로, 해당 수정자는 한 번만 과금되고 매 결제주기마다 반복되지 않습니다.

<a name="retrieving-modifiers"></a>
#### 수정자 목록 조회

`modifiers` 메서드를 통해 해당 구독의 모든 수정자 목록을 조회할 수 있습니다.

```
$modifiers = $user->subscription('default')->modifiers();

foreach ($modifiers as $modifier) {
    $modifier->amount(); // $0.99
    $modifier->description; // New text message.
}
```

<a name="deleting-modifiers"></a>
#### 수정자 삭제

`Laravel\Paddle\Modifier` 인스턴스의 `delete` 메서드를 호출하여 수정자를 삭제할 수 있습니다.

```
$modifier->delete();
```

<a name="pausing-subscriptions"></a>
### 구독 일시정지

구독을 일시정지하려면 사용자의 구독에 `pause` 메서드를 호출합니다.

```
$user->subscription('default')->pause();
```

구독이 일시정지되면, Cashier가 데이터베이스의 `paused_from` 컬럼 값을 자동으로 설정합니다. 이 컬럼은 `paused` 메서드가 언제부터 `true`를 반환해야 하는지 판단하는 기준으로 사용됩니다. 예를 들어 고객이 3월 1일에 구독을 일시정지했으나, 구독의 다음 결제 주기가 3월 5일이었다면, `paused` 메서드는 3월 5일까지는 계속 `false`를 반환합니다. 이는 사용자가 일반적으로 결제 주기 종료일까지 서비스를 계속 이용하도록 허용하기 때문입니다.

구독을 일시정지했지만 아직 "유예 기간"에 있는 사용자인지 여부는 `onPausedGracePeriod` 메서드로 확인할 수 있습니다.

```
if ($user->subscription('default')->onPausedGracePeriod()) {
    //
}
```

일시정지된 구독을 다시 활성화(재개)하려면, 해당 구독에 `unpause` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->unpause();
```

> [!NOTE]
> 구독이 일시정지 중에는 수정이 불가능합니다. 만약 요금제를 변경하거나 수량을 수정하고 싶다면 먼저 구독을 재개해야 합니다.

<a name="cancelling-subscriptions"></a>
### 구독 취소

구독을 취소하려면 사용자의 구독에 `cancel` 메서드를 호출합니다.

```
$user->subscription('default')->cancel();
```

구독이 취소되면 Cashier가 데이터베이스의 `ends_at` 컬럼을 자동으로 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 할지 판단하는데 사용됩니다. 예를 들어, 고객이 구독을 3월 1일에 취소했으나 실제 만료일이 3월 5일이었다면, 3월 5일까지는 계속 `subscribed` 메서드가 `true`를 반환합니다. 일반적으로 결제 주기 종료일까지 서비스를 계속 이용하도록 허용하기 때문입니다.

구독을 취소했으나 아직 "유예 기간"이 남은 사용자인지 확인하려면 `onGracePeriod` 메서드를 사용합니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    //
}
```

즉시 구독을 취소하고 싶을 땐, 사용자의 구독 인스턴스에서 `cancelNow` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->cancelNow();
```

> [!NOTE]
> Paddle의 구독은 취소 후 재개가 불가능합니다. 고객이 구독을 다시 사용하기 원한다면, 새 구독을 생성해야 합니다.

<a name="subscription-trials"></a>
## 구독 체험 기간(Trial)

<a name="with-payment-method-up-front"></a>
### 결제 정보 선등록 방식

> [!NOTE]
> 체험 기간 중 결제 정보를 미리 수집하는 경우, Paddle은 요금제 변경(swap)이나 수량(quantity) 업데이트 등 구독의 변경을 허용하지 않습니다. 체험 중에 요금제 변경을 허용하고 싶다면, 해당 구독을 취소 후 다시 생성해야 합니다.

결제 정보를 선등록받으면서 체험 기간을 제공하고 싶다면, 구독 페이링크 생성 시 `trialDays` 메서드를 사용하세요.

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

이 메서드는 구독 레코드에 체험 기간의 종료 날짜를 저장하며, Paddle에도 그 날짜까지 결제가 시작되지 않도록 지시합니다.

> [!NOTE]
> 체험 기간 종료 시 구독이 취소되지 않았다면, 체험 기간이 만료되는 즉시 결제가 이루어집니다. 따라서 체험 종료일을 사용자에게 반드시 안내해야 합니다.

사용자가 체험 기간 중인지 확인할 때는, 사용자 인스턴스의 `onTrial` 메서드와 구독 인스턴스의 `onTrial` 메서드 둘 중 어느 것을 사용해도 됩니다. 아래 두 예시는 동등하게 동작합니다.

```
if ($user->onTrial('default')) {
    //
}

if ($user->subscription('default')->onTrial()) {
    //
}
```

<a name="defining-trial-days-in-paddle-cashier"></a>
#### Paddle / Cashier에서 체험 일수 지정하기

요금제별 체험 일수는 Paddle 대시보드에서 설정하거나, Cashier를 통해 명시적으로 해당 값을 전달할 수 있습니다. Paddle에서 요금제별로 체험 기간을 지정한 경우, 과거에 구독 이력이 있던 고객을 포함해 새 구독마다 항상 체험 기간이 할당됨에 유의해야 합니다. 만약 체험 기간이 필요 없으면 반드시 `trialDays(0)`을 명시적으로 호출해야 합니다.

<a name="without-payment-method-up-front"></a>
### 결제 정보 없이 체험 기간 제공하기

결제 정보를 미리 수집하지 않고 체험 기간을 제공하려면, 사용자의 고객 레코드에 연결된 `trial_ends_at` 컬럼에 원하는 체험 종료 날짜를 저장하면 됩니다. 보통 회원가입 단계에서 이 처리를 합니다.

```
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->addDays(10)
]);
```

이와 같은 방식의 체험 구독을 Cashier에서는 "일반(generic) 체험"이라고 부릅니다. 이는 실제 구독과 연결되지 않은 체험이기 때문입니다. 사용자가 현재 체험 기간인지 여부는 `User` 인스턴스의 `onTrial` 메서드가 현재 날짜와 `trial_ends_at`을 비교해 결정합니다.

```
if ($user->onTrial()) {
    // 사용자는 체험 기간 중입니다...
}
```

실제 구독을 생성할 준비가 되었다면, 평소처럼 `newSubscription` 메서드를 사용할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $payLink = $user->newSubscription('default', $monthly = 12345)
        ->returnTo(route('home'))
        ->create();

    return view('billing', ['payLink' => $payLink]);
});
```

사용자의 체험 기간 종료일을 조회하려면, `trialEndsAt` 메서드를 사용할 수 있습니다. 이 메서드는 체험 중인 사용자는 Carbon 인스턴스를 반환하고, 그렇지 않으면 `null`을 반환합니다. 기본이 아닌 다른 구독의 체험 종료일을 조회하려면 구독 이름을 인수로 전달할 수도 있습니다.

```
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

아직 실제 구독을 생성하지 않고 "일반(generic) 체험"만 진행 중인지 확인하려면 `onGenericTrial` 메서드를 사용할 수 있습니다.

```
if ($user->onGenericTrial()) {
    // 사용자는 "일반(Generic) 체험 기간" 중입니다...
}
```

> [!NOTE]
> Paddle 구독이 한 번 생성된 후에는 체험 기간을 연장하거나 수정할 수 있는 방법이 없습니다.

<a name="handling-paddle-webhooks"></a>
## Paddle 웹훅(Webhook) 처리

Paddle은 다양한 이벤트를 웹훅을 통해 애플리케이션에 알릴 수 있습니다. 기본적으로, Cashier 서비스 프로바이더에서 Cashier의 웹훅 컨트롤러로 연결되는 라우트가 자동 등록됩니다. 이 컨트롤러는 모든 수신 웹훅 요청을 처리합니다.

기본적으로 이 컨트롤러는 결제 실패가 반복된 구독의 자동 취소([Paddle 구독 설정에서 정의한 기준](https://vendors.paddle.com/subscription-settings)), 구독 정보 업데이트, 결제 수단 변경 등을 자동으로 처리합니다. 추가로, 원하는 모든 Paddle 웹훅 이벤트를 직접 다룰 수도 있습니다.

애플리케이션이 Paddle 웹훅을 받으려면 [Paddle 관리 패널에서 웹훅 URL을 반드시 설정](https://vendors.paddle.com/alerts-webhooks)해야 합니다. Cashier의 웹훅 컨트롤러는 기본적으로 `/paddle/webhook` 경로를 사용합니다. Paddle 관리 패널에서 활성화해야 할 웹훅 이벤트 목록은 다음과 같습니다.

- Subscription Created
- Subscription Updated
- Subscription Cancelled
- Payment Succeeded
- Subscription Payment Succeeded

> [!NOTE]
> Cashier에서 제공하는 [웹훅 서명 검증](/docs/8.x/cashier-paddle#verifying-webhook-signatures) 미들웨어로 수신 요청을 안전하게 보호해야 합니다.

<a name="webhooks-csrf-protection"></a>
#### 웹훅 & CSRF 보호

Paddle 웹훅은 Laravel의 [CSRF 보호](/docs/8.x/csrf)를 우회해야 하므로, 반드시 `App\Http\Middleware\VerifyCsrfToken` 미들웨어에서 이 URI를 예외 목록에 추가하거나, `web` 미들웨어 그룹 밖에서 라우트를 선언해야 합니다.

```
protected $except = [
    'paddle/*',
];
```

<a name="webhooks-local-development"></a>
#### 웹훅 & 로컬 개발 환경

로컬 개발 단계에서 Paddle이 웹훅을 전송할 수 있도록 하려면 [Ngrok](https://ngrok.com/)이나 [Expose](https://expose.dev/docs/introduction)와 같은 사이트 공유 서비스로 애플리케이션을 외부에 노출시켜야 합니다. [Laravel Sail](/docs/8.x/sail)로 개발한다면 Sail의 [사이트 공유 명령어](/docs/8.x/sail#sharing-your-site)를 사용할 수 있습니다.

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의

Cashier는 결제 실패 시 구독 자동 취소 등 일반적인 Paddle 웹훅을 자동으로 처리합니다. 추가적으로 더 많은 웹훅 이벤트를 처리하고 싶다면, Cashier에서 디스패치하는 다음 이벤트를 리스닝하면 됩니다.

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

각 이벤트에는 Paddle의 전체 페이로드가 담겨 있습니다. 예를 들어, `invoice.payment_succeeded` 웹훅을 처리하려면 [리스너](/docs/8.x/events#defining-listeners)를 등록하여 다음과 같이 구현할 수 있습니다.

```
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * Handle received Paddle webhooks.
     *
     * @param  \Laravel\Paddle\Events\WebhookReceived  $event
     * @return void
     */
    public function handle(WebhookReceived $event)
    {
        if ($event->payload['alert_name'] === 'payment_succeeded') {
            // 이벤트 처리...
        }
    }
}
```

이제 위에서 정의한 리스너는 애플리케이션의 `EventServiceProvider`에 다음과 같이 등록할 수 있습니다.

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

Cashier는 수신된 웹훅 타입별로 전용 이벤트도 발생시킵니다. Paddle에서 받은 전체 페이로드뿐 아니라 처리에 사용된 관련 모델(구독, 청구 가능 모델, 영수증 등)도 포함합니다.

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\PaymentSucceeded`
- `Laravel\Paddle\Events\SubscriptionPaymentSucceeded`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionCancelled`

</div>

또한, `.env` 파일에 `CASHIER_WEBHOOK` 환경 변수를 정의하면 기본 내장 웹훅 라우트를 원하는 값으로 변경할 수 있습니다. 반드시 Paddle 제어 패널에 설정한 웹훅 URL과 일치해야 합니다.

```bash
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>

### 웹훅 서명 검증하기

웹훅의 보안을 위해 [Paddle의 웹훅 서명](https://developer.paddle.com/webhook-reference/verifying-webhooks)을 사용할 수 있습니다. 편의를 위해 Cashier는 들어오는 Paddle 웹훅 요청의 유효성을 자동으로 검증하는 미들웨어를 포함하고 있습니다.

웹훅 검증을 활성화하려면, 애플리케이션의 `.env` 파일에 `PADDLE_PUBLIC_KEY` 환경 변수가 정의되어 있는지 확인해야 합니다. 퍼블릭 키는 Paddle 계정 대시보드에서 가져올 수 있습니다.

<a name="single-charges"></a>
## 단일 청구

<a name="simple-charge"></a>
### 단순 결제

고객에게 일회성 결제를 진행하고 싶다면, billable 모델 인스턴스에서 `charge` 메서드를 사용해 결제 pay 링크를 생성할 수 있습니다. `charge` 메서드는 첫 번째 인수로 결제 금액(float), 두 번째 인수로 결제 설명을 받습니다.

```
use Illuminate\Http\Request;

Route::get('/store', function (Request $request) {
    return view('store', [
        'payLink' => $user->charge(12.99, 'Action Figure')
    ]);
});
```

pay 링크를 생성한 후, Cashier에서 제공하는 `paddle-button` Blade 컴포넌트를 통해 사용자가 Paddle 위젯을 실행하고 결제를 완료할 수 있도록 할 수 있습니다.

```html
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Buy
</x-paddle-button>
```

`charge` 메서드는 세 번째 인수로 배열을 받을 수 있으므로, pay 링크 생성 시 원하는 옵션을 전달할 수 있습니다. 사용 가능한 옵션에 대해서는 [Paddle 공식 문서](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)를 참고하시기 바랍니다.

```
$payLink = $user->charge(12.99, 'Action Figure', [
    'custom_option' => $value,
]);
```

결제는 `cashier.currency` 설정 옵션에 지정된 통화로 진행됩니다. 기본값은 USD(미국 달러)입니다. `.env` 파일에 `CASHIER_CURRENCY` 환경 변수를 정의하여 기본 통화를 변경할 수 있습니다.

```bash
CASHIER_CURRENCY=EUR
```

또한, Paddle의 동적 가격 일치 기능을 사용해 [통화별로 가격을 오버라이드](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink#price-overrides)할 수도 있습니다. 이 경우, 고정 금액 대신 여러 통화가 포함된 배열을 전달합니다.

```
$payLink = $user->charge([
    'USD:19.99',
    'EUR:15.99',
], 'Action Figure');
```

<a name="charging-products"></a>
### 상품 단일 결제

Paddle에 등록된 특정 상품에 대해 일회성 결제를 진행하고자 한다면, billable 모델 인스턴스에서 `chargeProduct` 메서드를 사용해 pay 링크를 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/store', function (Request $request) {
    return view('store', [
        'payLink' => $request->user()->chargeProduct($productId = 123)
    ]);
});
```

이후, 이 pay 링크를 `paddle-button` 컴포넌트에 제공하면 사용자가 Paddle 위젯을 실행할 수 있습니다.

```html
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Buy
</x-paddle-button>
```

`chargeProduct` 메서드는 두 번째 인수로 배열을 전달할 수 있어, pay 링크 생성 시 원하는 옵션을 설정할 수 있습니다. 사용 가능한 옵션에 대해서는 [Paddle 공식 문서](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)를 참고하시기 바랍니다.

```
$payLink = $user->chargeProduct($productId, [
    'custom_option' => $value,
]);
```

<a name="refunding-orders"></a>
### 주문 환불

Paddle 주문을 환불해야 하는 경우, `refund` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 Paddle 주문 ID를 받습니다. 해당 billable 모델에 대한 영수증(receipt)는 `receipts` 메서드를 통해 조회할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$receipt = $user->receipts()->first();

$refundRequestId = $user->refund($receipt->order_id);
```

필요하다면 환불할 금액과 환불 사유도 추가 인수로 함께 지정할 수 있습니다.

```
$receipt = $user->receipts()->first();

$refundRequestId = $user->refund(
    $receipt->order_id, 5.00, 'Unused product time'
);
```

> [!TIP]
> Paddle 지원팀에 환불 관련 문의할 때 `$refundRequestId`를 참조용으로 사용할 수 있습니다.

<a name="receipts"></a>
## 영수증

`receipts` 속성을 통해 billable 모델의 영수증 배열을 쉽게 불러올 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$receipts = $user->receipts;
```

고객의 영수증 목록을 표시할 때, 각 receipt 인스턴스의 메서드를 사용해 관련 정보를 출력할 수 있습니다. 예를 들어, 모든 영수증을 표로 나열해 사용자가 원하는 영수증을 쉽게 다운로드할 수 있도록 할 수 있습니다.

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
### 이전 및 예정 결제 내역

정기 구독의 과거 결제 내역이나 다가오는 결제 일정을 조회하고 싶을 때는 `lastPayment` 및 `nextPayment` 메서드를 사용할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription('default');

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

이 두 메서드는 모두 `Laravel\Paddle\Payment` 인스턴스를 반환합니다. 다만, 구독이 취소되는 등 결제 주기가 종료된 경우 `nextPayment`는 `null`을 반환합니다.

```
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="handling-failed-payments"></a>
## 결제 실패 처리

구독 결제는 카드 만료, 잔액 부족 등 다양한 이유로 실패할 수 있습니다. 이런 상황에서는 Paddle이 결제 실패 처리를 담당하도록 맡기는 것이 좋습니다. 구체적으로, Paddle 대시보드에서 [자동 결제 이메일](https://vendors.paddle.com/subscription-settings)을 설정할 수 있습니다.

좀 더 세밀한 처리가 필요하다면 [`subscription_payment_failed`](https://developer.paddle.com/webhook-reference/subscription-alerts/subscription-payment-failed) 웹훅을 수신해, Paddle 대시보드의 Webhook 설정에서 "Subscription Payment Failed" 옵션을 활성화하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use Laravel\Paddle\Http\Controllers\WebhookController as CashierController;

class WebhookController extends CashierController
{
    /**
     * Handle subscription payment failed.
     *
     * @param  array  $payload
     * @return void
     */
    public function handleSubscriptionPaymentFailed($payload)
    {
        // Handle the failed subscription payment...
    }
}
```

<a name="testing"></a>
## 테스트

빌링 플로우가 정상적으로 동작하는지 수동으로 테스트해보는 것이 좋습니다.

CI 환경을 포함한 자동화 테스트에서는 [라라벨 HTTP 클라이언트](/docs/8.x/http-client#testing)를 사용해 Paddle로의 HTTP 호출을 가짜로 만들어 처리할 수 있습니다. 비록 Paddle의 실제 응답을 테스트할 수는 없지만, Paddle API에 실제로 요청을 보내지 않고도 애플리케이션의 동작을 검증할 수 있습니다.