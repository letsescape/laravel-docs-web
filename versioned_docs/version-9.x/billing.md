# 라라벨 Cashier, Stripe (Laravel Cashier (Stripe))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
    - [데이터베이스 마이그레이션](#database-migrations)
- [설정](#configuration)
    - [과금 모델](#billable-model)
    - [API 키](#api-keys)
    - [통화 설정](#currency-configuration)
    - [세금 설정](#tax-configuration)
    - [로그 기록](#logging)
    - [커스텀 모델 사용](#using-custom-models)
- [고객 관리](#customers)
    - [고객 정보 조회](#retrieving-customers)
    - [고객 생성](#creating-customers)
    - [고객 정보 업데이트](#updating-customers)
    - [잔액 관리](#balances)
    - [세금 ID](#tax-ids)
    - [Stripe와 고객 데이터 동기화](#syncing-customer-data-with-stripe)
    - [청구 포털](#billing-portal)
- [결제 수단](#payment-methods)
    - [결제 수단 저장](#storing-payment-methods)
    - [결제 수단 조회](#retrieving-payment-methods)
    - [사용자의 결제 수단 보유 여부 확인](#check-for-a-payment-method)
    - [기본 결제 수단 업데이트](#updating-the-default-payment-method)
    - [결제 수단 추가](#adding-payment-methods)
    - [결제 수단 삭제](#deleting-payment-methods)
- [구독 관리](#subscriptions)
    - [구독 생성](#creating-subscriptions)
    - [구독 상태 확인](#checking-subscription-status)
    - [가격 변경](#changing-prices)
    - [구독 수량](#subscription-quantity)
    - [다중 상품 구독](#subscriptions-with-multiple-products)
    - [여러 개의 구독 관리](#multiple-subscriptions)
    - [측정 기준 청구](#metered-billing)
    - [구독 세금](#subscription-taxes)
    - [구독 기준일(Anchor Date)](#subscription-anchor-date)
    - [구독 취소](#cancelling-subscriptions)
    - [구독 재개](#resuming-subscriptions)
- [구독 체험(Trial) 기능](#subscription-trials)
    - [사전에 결제 수단 제공](#with-payment-method-up-front)
    - [사전에 결제 수단 미제공](#without-payment-method-up-front)
    - [체험 기간 연장](#extending-trials)
- [Stripe Webhook 처리](#handling-stripe-webhooks)
    - [Webhook 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [Webhook 서명 검증](#verifying-webhook-signatures)
- [단일 청구](#single-charges)
    - [간단한 청구](#simple-charge)
    - [인보이스 발행과 함께 청구](#charge-with-invoice)
    - [Payment Intents 생성](#creating-payment-intents)
    - [청구 환불](#refunding-charges)
- [Checkout](#checkout)
    - [상품 Checkout](#product-checkouts)
    - [단일 청구 Checkout](#single-charge-checkouts)
    - [구독 Checkout](#subscription-checkouts)
    - [세금 ID 수집](#collecting-tax-ids)
    - [비회원 Checkout](#guest-checkouts)
- [인보이스 관리](#invoices)
    - [인보이스 조회](#retrieving-invoices)
    - [예정된 인보이스](#upcoming-invoices)
    - [구독 인보이스 미리보기](#previewing-subscription-invoices)
    - [인보이스 PDF 생성](#generating-invoice-pdfs)
- [실패한 결제 처리](#handling-failed-payments)
- [강화된 고객 인증(SCA)](#strong-customer-authentication)
    - [추가 인증이 필요한 결제](#payments-requiring-additional-confirmation)
    - [오프 세션 결제 알림](#off-session-payment-notifications)
- [Stripe SDK](#stripe-sdk)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe)는 [Stripe](https://stripe.com)의 구독 결제 서비스를 쉽고 유연하게 사용할 수 있도록 하는 직관적인 인터페이스를 제공합니다. Cashier는 여러분이 작성하기 번거로울 수 있는 구독 결제 관련 기본 코드를 대부분 대신 처리해줍니다. 기본적인 구독 관리 외에도, Cashier는 쿠폰, 구독 변경, 구독 "수량", 구독 취소 유예 기간, 인보이스 PDF 생성 등 다양한 기능을 제공합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier를 새로운 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.md)를 꼼꼼히 확인하시기 바랍니다.

> [!WARNING]
> 중요한 변경 사항을 방지하기 위해, Cashier는 고정된 Stripe API 버전을 사용합니다. Cashier 14는 Stripe API 버전 `2022-11-15`를 사용합니다. Stripe API 버전은 Stripe의 새로운 기능과 개선 사항을 활용하기 위해 소규모 릴리즈에서 업데이트될 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 사용하여 Stripe용 Cashier 패키지를 설치합니다.

```shell
composer require laravel/cashier
```

> [!WARNING]
> Cashier가 Stripe의 모든 이벤트를 제대로 처리할 수 있도록 반드시 [Cashier의 webhook 처리 설정](#handling-stripe-webhooks)을 진행해야 합니다.

<a name="database-migrations"></a>
### 데이터베이스 마이그레이션

Cashier의 서비스 프로바이더는 자체 마이그레이션 디렉토리를 등록하므로, 패키지를 설치한 후에는 데이터베이스 마이그레이션을 꼭 실행해야 합니다. Cashier 마이그레이션은 여러분의 `users` 테이블에 여러 컬럼을 추가하고, 고객의 구독 정보를 저장할 `subscriptions` 테이블을 새롭게 생성합니다.

```shell
php artisan migrate
```

Cashier에서 기본 제공하는 마이그레이션을 직접 수정하려면, `vendor:publish` Artisan 명령어를 사용해 마이그레이션 파일을 퍼블리시할 수 있습니다.

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Cashier의 마이그레이션을 아예 실행하지 않도록 하려면, Cashier에서 제공하는 `ignoreMigrations` 메서드를 사용할 수 있습니다. 이 메서드는 일반적으로 여러분의 `AppServiceProvider`의 `register` 메서드 내부에서 호출해야 합니다.

```
use Laravel\Cashier\Cashier;

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

> [!WARNING]
> Stripe에서는 Stripe 식별자를 저장하는 컬럼에 대하여 대소문자 구분을 권장합니다. 따라서 MySQL을 사용할 때 `stripe_id` 컬럼의 collation이 `utf8_bin`으로 설정되어 있는지 확인해야 합니다. 보다 자세한 내용은 [Stripe 문서](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible)를 참고하십시오.

<a name="configuration"></a>
## 설정

<a name="billable-model"></a>
### 과금 모델

Cashier를 사용하기 전에, 과금 모델 정의에 `Billable` 트레이트를 추가해야 합니다. 일반적으로 이 모델은 `App\Models\User`가 됩니다. 해당 트레이트는 구독 생성, 쿠폰 적용, 결제 수단 정보 업데이트 등 일반적인 과금 작업을 간편하게 수행할 수 있도록 다양한 메서드를 제공합니다.

```
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Cashier는 과금 모델이 라라벨에서 기본 제공되는 `App\Models\User` 클래스라고 가정합니다. 만약 이를 변경하고 싶다면, `useCustomerModel` 메서드를 통해 다른 모델을 지정할 수 있습니다. 보통 이 메서드는 여러분의 `AppServiceProvider` 클래스의 `boot` 메서드에 추가하면 됩니다.

```
use App\Models\Cashier\User;
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Cashier::useCustomerModel(User::class);
}
```

> [!WARNING]
> 라라벨에서 기본 제공하는 `App\Models\User` 모델이 아닌 다른 모델을 사용하는 경우, Cashier에서 제공하는 [마이그레이션을 퍼블리시 및 수정](#installation)하여 새로운 모델의 테이블 명에 맞게 변경해야 합니다.

<a name="api-keys"></a>
### API 키

다음으로, 애플리케이션의 `.env` 파일에 Stripe API 키를 설정해야 합니다. Stripe API 키는 Stripe 관리 페이지에서 발급받을 수 있습니다.

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> [!WARNING]
> `STRIPE_WEBHOOK_SECRET` 환경 변수가 애플리케이션의 `.env` 파일에 반드시 정의되어 있어야 합니다. 이 변수는 웹훅이 실제로 Stripe로부터 온 것인지 확인하는 데 사용됩니다.

<a name="currency-configuration"></a>
### 통화 설정

Cashier의 기본 통화는 미국 달러(USD)입니다. 기본 통화를 변경하려면 애플리케이션의 `.env` 파일에서 `CASHIER_CURRENCY` 환경 변수를 설정하면 됩니다.

```ini
CASHIER_CURRENCY=eur
```

Cashier의 통화 설정 외에도, 인보이스에 표시될 금액 포맷을 위한 로케일(locale)을 설정할 수도 있습니다. 내부적으로 Cashier는 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 사용하여 통화 로케일을 지정합니다.

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> `en` 이외의 로케일을 사용하려면 서버에 `ext-intl` PHP 확장 프로그램이 설치되고 설정되어 있어야 합니다.

<a name="tax-configuration"></a>
### 세금 설정

[Stripe Tax](https://stripe.com/tax)를 통해 Stripe에서 생성된 모든 인보이스에 대해 세금을 자동으로 계산할 수 있습니다. 자동 세금 계산을 활성화하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `calculateTaxes` 메서드를 호출하면 됩니다.

```
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Cashier::calculateTaxes();
}
```

세금 계산을 활성화하면, 생성되는 모든 새로운 구독(Subscription)과 단일 인보이스에 대해 자동으로 세금이 계산됩니다.

이 기능이 제대로 작동하려면, 고객의 이름, 주소, 세금 ID 등 결제 관련 세부 정보가 Stripe에 동기화되어 있어야 합니다. Cashier가 제공하는 [고객 데이터 동기화](#syncing-customer-data-with-stripe) 및 [Tax ID](#tax-ids) 관련 기능을 사용해 이 작업을 할 수 있습니다.

> [!WARNING]
> [단일 청구](#single-charges)나 [단일 청구 Checkout](#single-charge-checkouts)에는 세금이 계산되지 않습니다.

<a name="logging"></a>
### 로그 기록

Cashier에서는 Stripe에서 발생하는 치명적인(fatal) 오류를 로깅할 때 사용할 로그 채널을 지정할 수 있습니다. `.env` 파일에서 `CASHIER_LOGGER` 환경 변수를 설정하여 로그 채널을 지정하세요.

```ini
CASHIER_LOGGER=stack
```

Stripe API 호출로 인해 발생하는 예외는 애플리케이션의 기본 로그 채널을 통해 로그로 기록됩니다.

<a name="using-custom-models"></a>
### 커스텀 모델 사용

Cashier가 내부적으로 사용하는 모델을 직접 확장해서 사용할 수도 있습니다. 여러분만의 커스텀 모델을 정의하고, 해당 모델이 Cashier 모델을 상속하도록 만드면 됩니다.

```
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 후에는, `Laravel\Cashier\Cashier` 클래스를 통해 Cashier가 여러분의 커스텀 모델을 사용하도록 설정할 수 있습니다. 일반적으로 해당 설정은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 진행하면 됩니다.

```
use App\Models\Cashier\Subscription;
use App\Models\Cashier\SubscriptionItem;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useSubscriptionItemModel(SubscriptionItem::class);
}
```

<a name="customers"></a>
## 고객 관리

<a name="retrieving-customers"></a>
### 고객 정보 조회

`Cashier::findBillable` 메서드를 사용하면 Stripe ID를 기준으로 고객을 조회할 수 있습니다. 이 메서드는 과금 모델의 인스턴스를 반환합니다.

```
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a name="creating-customers"></a>
### 고객 생성

가끔은 구독을 시작하지 않고 Stripe 고객만 먼저 생성하고 싶을 수 있습니다. 이럴 때는 `createAsStripeCustomer` 메서드를 사용할 수 있습니다.

```
$stripeCustomer = $user->createAsStripeCustomer();
```

고객이 Stripe에 생성된 후에는 나중에 구독을 시작할 수 있습니다. 필요하다면 `$options` 배열을 추가로 전달하여 [Stripe API에서 지원하는 고객 생성 파라미터](https://stripe.com/docs/api/customers/create)를 지정할 수 있습니다.

```
$stripeCustomer = $user->createAsStripeCustomer($options);
```

과금 모델에 연결된 Stripe 고객 객체를 반환하려면 `asStripeCustomer` 메서드를 사용할 수 있습니다.

```
$stripeCustomer = $user->asStripeCustomer();
```

주어진 과금 모델이 Stripe의 고객인지 확실치 않은 경우에는 `createOrGetStripeCustomer` 메서드를 사용할 수 있습니다. 이 메서드는 Stripe에 고객이 이미 존재하면 그 객체를, 없으면 새로 생성하여 반환합니다.

```
$stripeCustomer = $user->createOrGetStripeCustomer();
```

<a name="updating-customers"></a>
### 고객 정보 업데이트

때때로 Stripe의 고객 정보를 직접 추가로 업데이트하고 싶을 수 있습니다. 이때는 `updateStripeCustomer` 메서드를 사용하세요. 이 메서드는 [Stripe API에서 지원하는 고객 업데이트 옵션](https://stripe.com/docs/api/customers/update)을 배열로 받아 처리합니다.

```
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a name="balances"></a>
### 잔액 관리

Stripe에서는 고객의 "잔액"을 충전(적립)하거나 차감할 수 있습니다. 나중에 이 잔액은 신규 인보이스에서 사용되거나 차감됩니다. 해당 고객의 잔액 총액을 확인하려면, 과금 모델에서 `balance` 메서드를 사용할 수 있습니다. 이 메서드는 고객 통화 기준으로 포매팅된 잔액 문자열을 반환합니다.

```
$balance = $user->balance();
```

고객의 잔액을 충전하려면 `creditBalance` 메서드에 값을 전달합니다. 원하는 경우 설명(Description)도 함께 추가할 수 있습니다.

```
$user->creditBalance(500, 'Premium customer top-up.');
```

`debitBalance` 메서드에 값을 전달하면 고객의 잔액이 차감됩니다.

```
$user->debitBalance(300, 'Bad usage penalty.');
```

`applyBalance` 메서드는 고객에게 새로운 잔액 거래(트랜잭션)를 생성합니다. 이런 거래 내역들은 `balanceTransactions` 메서드로 조회할 수 있으며, 고객에게 충전과 차감 내역의 로그 화면을 제공하고 싶을 때 유용합니다.

```
// 모든 거래 내역 조회...
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // 거래 금액...
    $amount = $transaction->amount(); // $2.31

    // 관련 인보이스가 있는 경우 조회...
    $invoice = $transaction->invoice();
}
```

<a name="tax-ids"></a>
### 세금 ID

Cashier를 이용하면 고객의 세금 ID를 쉽게 관리할 수 있습니다. 예를 들어, `taxIds` 메서드를 사용하면, 고객에게 할당된 [모든 세금 ID](https://stripe.com/docs/api/customer_tax_ids/object)를 컬렉션 형태로 받아올 수 있습니다.

```
$taxIds = $user->taxIds();
```

또한, 식별자를 이용해 특정 세금 ID를 조회할 수 있습니다.

```
$taxId = $user->findTaxId('txi_belgium');
```

유효한 [type](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type)과 값을 입력해 `createTaxId` 메서드로 새로운 세금 ID를 만들 수도 있습니다.

```
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

`createTaxId` 메서드는 즉시 해당 VAT ID를 고객 계정에 추가합니다. [VAT ID 검증은 Stripe에 의해 비동기로 처리](https://stripe.com/docs/invoicing/customer/tax-ids#validation)되며, 완료 시점에 알림을 받을 수 있습니다. 검증 관련 업데이트는 `customer.tax_id.updated` 웹훅 이벤트를 구독하고, [VAT ID `verification` 파라미터](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification)를 확인하면 됩니다. 웹훅 처리에 대한 자세한 내용은 [웹훅 핸들러 정의 문서](#handling-stripe-webhooks)를 참고하세요.

`deleteTaxId` 메서드로 세금 ID를 삭제할 수 있습니다.

```
$user->deleteTaxId('txi_belgium');
```

<a name="syncing-customer-data-with-stripe"></a>
### Stripe와 고객 데이터 동기화

보통, 애플리케이션의 사용자가 이름, 이메일 등만 아니라 Stripe에도 저장되는 정보를 업데이트할 경우, Stripe에도 해당 업데이트 내용을 반영해야 합니다. 이렇게 하면 Stripe의 고객 정보와 애플리케이션의 데이터가 항상 동기화된 상태가 됩니다.

이 과정을 자동화하려면, 과금 모델의 `updated` 이벤트에 반응하는 이벤트 리스너를 정의할 수 있습니다. 이벤트 리스너 내에서 `syncStripeCustomerDetails` 메서드를 호출해 Stripe와 정보를 동기화합니다.

```
use function Illuminate\Events\queueable;

/**
 * The "booted" method of the model.
 *
 * @return void
 */
protected static function booted()
{
    static::updated(queueable(function ($customer) {
        if ($customer->hasStripeId()) {
            $customer->syncStripeCustomerDetails();
        }
    }));
}
```

이제 고객 모델이 업데이트될 때마다 Stripe와 정보가 자동으로 동기화됩니다. 참고로, Cashier는 신규 고객 생성 시 고객 정보를 Stripe와 자동으로 동기화합니다.

Stripe로 동기화되는 고객 정보 컬럼을 커스터마이즈하려면, Cashier에서 제공하는 다양한 메서드를 오버라이드할 수 있습니다. 예를 들어, `stripeName` 메서드를 오버라이드해 Stripe에 동기화할 "이름" 필드를 변경할 수 있습니다.

```
/**
 * Get the customer name that should be synced to Stripe.
 *
 * @return string|null
 */
public function stripeName()
{
    return $this->company_name;
}
```

마찬가지로, `stripeEmail`, `stripePhone`, `stripeAddress`, `stripePreferredLocales` 메서드도 오버라이드할 수 있습니다. 이 메서드들은 [Stripe 고객 객체 업데이트](https://stripe.com/docs/api/customers/update) 시 해당 파라미터에 정보를 동기화합니다. 만약 고객 정보 동기화 과정을 완전히 커스터마이즈하고 싶다면, `syncStripeCustomerDetails` 메서드를 직접 오버라이드하면 됩니다.

<a name="billing-portal"></a>
### 청구 포털

Stripe에서는 [청구 포털을 간단하게 설정](https://stripe.com/docs/billing/subscriptions/customer-portal)할 수 있게 해줍니다. 이를 통해 고객은 구독, 결제 수단, 결제 내역 등을 직접 관리할 수 있습니다. 컨트롤러나 라우트에서 과금 모델의 `redirectToBillingPortal` 메서드를 호출해 사용자를 Stripe 청구 포털로 리다이렉트할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

사용자가 Stripe 청구 포털에서 구독 관리를 마치면, 기본적으로 애플리케이션의 `home` 라우트로 돌아올 수 있습니다. 사용자가 돌아올 URL을 직접 지정하고 싶다면, `redirectToBillingPortal` 메서드에 원하는 URL을 인수로 전달하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

만약 HTTP 리다이렉트 응답을 생성하지 않고 청구 포털의 URL만 생성하고 싶다면, `billingPortalUrl` 메서드를 활용하면 됩니다.

```
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a name="payment-methods"></a>
## 결제 수단

<a name="storing-payment-methods"></a>
### 결제 수단 저장

Stripe로 구독을 생성하거나 "단일 청구"를 처리하려면 우선 결제 수단을 저장하고, Stripe에서 결제 수단의 식별자(ID)를 받아와야 합니다. 이 방법은 결제 수단이 구독용인지 단일 청구용인지에 따라 다르니, 각각의 상황을 아래에서 설명합니다.

<a name="payment-methods-for-subscriptions"></a>
#### 구독용 결제 수단

구독을 위해 고객의 신용카드 정보를 추후 사용할 목적으로 저장하려면 Stripe의 "Setup Intents" API를 이용해 결제 수단 정보를 안전하게 수집해야 합니다. "Setup Intent"란 Stripe에 고객 결제 수단에 대한 결제 의도가 있음을 미리 알려주는 역할을 합니다. Cashier의 `Billable` 트레이트에는 새 Setup Intent를 쉽게 생성할 수 있는 `createSetupIntent` 메서드가 포함되어 있습니다. 이 메서드는 결제 수단 입력 폼을 렌더링하는 라우트나 컨트롤러에서 호출해야 합니다.

```
return view('update-payment-method', [
    'intent' => $user->createSetupIntent()
]);
```

Setup Intent를 생성해 뷰로 전달했다면, 해당 secret 값을 결제 수단을 입력받는 요소에 할당해야 합니다. 아래는 "결제 수단 업데이트" 폼 예시입니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    Update Payment Method
</button>
```

그 다음 Stripe.js 라이브러리를 이용해 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 연결하면, 고객의 결제 정보를 안전하게 수집할 수 있습니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

이제 카드를 인증하고 Stripe에서 보안 "결제 수단 식별자"를 받아오려면, [Stripe의 `confirmCardSetup` 메서드](https://stripe.com/docs/js/setup_intents/confirm_card_setup)를 사용할 수 있습니다.

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

카드 인증이 Stripe에서 정상적으로 완료되면, 생성된 `setupIntent.payment_method` 식별자를 라라벨 애플리케이션으로 전달하여 고객에게 연결할 수 있습니다. 이 결제 수단은 [새 결제 수단으로 추가](#adding-payment-methods)하거나, [기본 결제 수단 업데이트](#updating-the-default-payment-method) 등에 사용할 수 있습니다. 또는 즉시 해당 식별자로 [새 구독 생성](#creating-subscriptions)도 가능합니다.

> [!NOTE]
> Setup Intents와 고객 결제 정보 수집에 대해 더 자세한 내용을 알고 싶다면 [Stripe에서 제공하는 개요 문서](https://stripe.com/docs/payments/save-and-reuse#php)를 참고하세요.

<a name="payment-methods-for-single-charges"></a>
#### 단일 청구용 결제 수단

물론, 고객의 결제 수단으로 단 한 번만 결제할 계획이라면 해당 결제 수단 식별자는 한 번만 사용하면 됩니다. Stripe의 제한으로 인해 고객의 저장된 기본 결제 수단으로 단일 청구를 처리할 수는 없습니다. Stripe.js 라이브러리를 통해 고객이 직접 결제 정보를 입력할 수 있게 해야 합니다. 예를 들어 아래와 같은 폼을 사용할 수 있습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button">
    Process Payment
</button>
```

이후 Stripe.js 라이브러리로 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 연결하면 고객의 결제 정보를 안전하게 수집할 수 있습니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

그 다음, 카드를 인증하고 Stripe에서 보안 "결제 수단 식별자"를 받아오려면, [Stripe의 `createPaymentMethod` 메서드](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method)를 사용할 수 있습니다.

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

카드 인증이 정상적으로 완료되면, `paymentMethod.id`를 라라벨 애플리케이션으로 전달하여 [단일 청구](#simple-charge)를 처리할 수 있습니다.

<a name="retrieving-payment-methods"></a>

### 결제 수단 조회하기

청구 가능한 모델 인스턴스에서 `paymentMethods` 메서드를 호출하면 `Laravel\Cashier\PaymentMethod` 인스턴스의 컬렉션을 반환합니다.

```
$paymentMethods = $user->paymentMethods();
```

기본적으로 이 메서드는 `card` 타입의 결제 수단만 반환합니다. 만약 다른 타입의 결제 수단을 조회하고 싶다면, 메서드의 인수로 `type`을 전달하면 됩니다.

```
$paymentMethods = $user->paymentMethods('sepa_debit');
```

고객의 기본 결제 수단을 조회하려면 `defaultPaymentMethod` 메서드를 사용할 수 있습니다.

```
$paymentMethod = $user->defaultPaymentMethod();
```

청구 가능한 모델에 연결된 특정 결제 수단을 조회하려면 `findPaymentMethod` 메서드를 사용할 수 있습니다.

```
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a name="check-for-a-payment-method"></a>
### 사용자가 결제 수단을 보유하고 있는지 확인하기

청구 가능한 모델이 계정에 기본 결제 수단이 연결되어 있는지 확인하려면 `hasDefaultPaymentMethod` 메서드를 호출하면 됩니다.

```
if ($user->hasDefaultPaymentMethod()) {
    //
}
```

청구 가능한 모델이 적어도 하나 이상의 결제 수단을 가지는지 확인하려면 `hasPaymentMethod` 메서드를 사용할 수 있습니다.

```
if ($user->hasPaymentMethod()) {
    //
}
```

이 메서드는 모델이 `card` 타입의 결제 수단을 가지고 있는지 판단합니다. 만약 다른 타입의 결제 수단을 확인하고 싶다면, 해당 `type`을 인수로 전달할 수 있습니다.

```
if ($user->hasPaymentMethod('sepa_debit')) {
    //
}
```

<a name="updating-the-default-payment-method"></a>
### 기본 결제 수단 업데이트하기

고객의 기본 결제 수단 정보를 업데이트하려면 `updateDefaultPaymentMethod` 메서드를 사용할 수 있습니다. 이 메서드는 Stripe 결제 수단 식별자를 받아 새로운 결제 수단을 기본 청구 결제 수단으로 지정해줍니다.

```
$user->updateDefaultPaymentMethod($paymentMethod);
```

Stripe에 저장된 고객의 기본 결제 수단 정보와 동기화하려면 `updateDefaultPaymentMethodFromStripe` 메서드를 사용할 수 있습니다.

```
$user->updateDefaultPaymentMethodFromStripe();
```

> [!WARNING]
> 고객의 기본 결제 수단은 송장 처리 또는 신규 구독 생성에만 사용할 수 있습니다. Stripe의 제한으로 인해 단건 결제에는 사용할 수 없습니다.

<a name="adding-payment-methods"></a>
### 결제 수단 추가하기

새로운 결제 수단을 추가하려면 결제 수단 식별자를 전달하여 청구 가능한 모델의 `addPaymentMethod` 메서드를 호출하면 됩니다.

```
$user->addPaymentMethod($paymentMethod);
```

> [!NOTE]
> 결제 수단 식별자를 조회하는 방법에 대해서는 [결제 수단 저장 문서](#storing-payment-methods)를 참고해 주세요.

<a name="deleting-payment-methods"></a>
### 결제 수단 삭제하기

결제 수단을 삭제하려면 삭제하려는 `Laravel\Cashier\PaymentMethod` 인스턴스에서 `delete` 메서드를 호출하면 됩니다.

```
$paymentMethod->delete();
```

특정 결제 수단을 청구 가능한 모델에서 삭제하려면 `deletePaymentMethod` 메서드를 사용할 수 있습니다.

```
$user->deletePaymentMethod('pm_visa');
```

모델에 저장된 모든 결제 수단 정보를 삭제하려면 `deletePaymentMethods` 메서드를 사용할 수 있습니다.

```
$user->deletePaymentMethods();
```

기본적으로 이 메서드는 `card` 타입의 결제 수단만 삭제합니다. 다른 타입의 결제 수단을 삭제하고 싶다면 해당 `type`을 인수로 전달할 수 있습니다.

```
$user->deletePaymentMethods('sepa_debit');
```

> [!WARNING]
> 사용자가 활성 구독을 가지고 있는 경우, 기본 결제 수단을 삭제하지 못하도록 애플리케이션에서 반드시 제한해야 합니다.

<a name="subscriptions"></a>
## 구독

구독 기능은 고객의 반복 결제를 설정하는 방법을 제공합니다. Cashier가 관리하는 Stripe 구독은 복수의 구독 가격, 구독 수량, 체험 기간 등 다양한 기능을 지원합니다.

<a name="creating-subscriptions"></a>
### 구독 생성하기

구독을 생성하려면 먼저 보통 `App\Models\User` 인스턴스인 청구 가능한 모델을 가져와야 합니다. 모델 인스턴스를 가져온 다음, `newSubscription` 메서드를 사용해 구독을 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

`newSubscription` 메서드에 전달하는 첫 번째 인수는 구독의 내부 이름입니다. 애플리케이션에서 구독이 하나만 있다면 `default` 또는 `primary`와 같은 이름을 사용할 수 있습니다. 이 구독 이름은 내부적으로만 사용되며, 사용자에게 표시하지 않습니다. 또한 공백을 포함하지 않아야 하고, 구독 생성 후에는 변경하지 않아야 합니다. 두 번째 인수는 사용자가 가입할 Stripe의 가격 식별자입니다.

`create` 메서드는 [Stripe 결제 수단 식별자](#storing-payment-methods)나 Stripe `PaymentMethod` 객체를 받아 해당 구독을 시작하며, 모델의 Stripe 고객 ID 등 관련 결제 정보를 데이터베이스에 업데이트합니다.

> [!WARNING]
> 결제 수단 식별자를 `create` 구독 메서드에 직접 전달하면, 그 결제 수단이 사용자의 저장된 결제 수단 목록에도 자동으로 추가됩니다.

<a name="collecting-recurring-payments-via-invoice-emails"></a>
#### 송장 이메일을 통한 반복 결제 수집

반복 결제를 자동으로 청구하는 대신, Stripe가 반복 결제일마다 고객에게 송장 이메일을 보내도록 지시할 수 있습니다. 이 경우, 고객은 송장을 받은 뒤 직접 결제할 수 있습니다. 송장 이메일을 통한 반복 결제에서는 최초에 결제 수단을 등록하지 않아도 됩니다.

```
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

송장 만료(= 구독 취소) 전까지 고객이 송장을 결제할 수 있는 기간은 `days_until_due` 옵션으로 설정됩니다. 기본값은 30일이며, 필요하다면 이 옵션에 원하는 값을 지정할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
    'days_until_due' => 30
]);
```

<a name="subscription-quantities"></a>
#### 수량 (Quantities)

구독 생성 시 가격에 대해 원하는 [수량](https://stripe.com/docs/billing/subscriptions/quantities)을 지정하려면, 구독 빌더에서 `quantity` 메서드를 구독 생성 전에 호출해야 합니다.

```
$user->newSubscription('default', 'price_monthly')
     ->quantity(5)
     ->create($paymentMethod);
```

<a name="additional-details"></a>
#### 추가 정보 지정하기

Stripe에서 지원하는 추가 [고객](https://stripe.com/docs/api/customers/create) 또는 [구독](https://stripe.com/docs/api/subscriptions/create) 옵션을 지정하고 싶다면, `create` 메서드의 두 번째와 세 번째 인수에 배열로 전달할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a name="coupons"></a>
#### 쿠폰

구독 생성 시 쿠폰을 적용하고 싶다면, `withCoupon` 메서드를 사용할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')
     ->withCoupon('code')
     ->create($paymentMethod);
```

또는 [Stripe 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 적용하고 싶으면, `withPromotionCode` 메서드를 사용할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')
     ->withPromotionCode('promo_code_id')
     ->create($paymentMethod);
```

여기서 전달해야 하는 프로모션 코드 ID는 고객이 보는 코드가 아닌, Stripe에서 해당 프로모션 코드에 할당한 API ID여야 합니다. 만약 고객에게 보여지는 프로모션 코드로부터 할당된 ID를 찾고 싶다면, `findPromotionCode` 메서드를 사용할 수 있습니다.

```
// 고객에게 보여지는 코드로 프로모션 코드 ID 찾기
$promotionCode = $user->findPromotionCode('SUMMERSALE');

// 활성화된 프로모션 코드만 찾기
$promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

위 예시에서 반환되는 `$promotionCode` 객체는 `Laravel\Cashier\PromotionCode` 인스턴스입니다. 이 클래스는 내부적으로 Stripe의 `PromotionCode` 객체를 감싸고 있습니다. 프로모션 코드와 연결된 쿠폰 정보를 가져오려면 `coupon` 메서드를 호출하면 됩니다.

```
$coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

쿠폰 인스턴스를 통해 할인 금액이 얼마이고, 고정 금액 할인인지, 퍼센트 할인인지도 알 수 있습니다.

```
if ($coupon->isPercentage()) {
    return $coupon->percentOff().'%'; // 21.5%
} else {
    return $coupon->amountOff(); // $5.99
}
```

또한, 현재 고객이나 구독에 적용된 할인 내역도 조회할 수 있습니다.

```
$discount = $billable->discount();

$discount = $subscription->discount();
```

반환되는 `Laravel\Cashier\Discount` 인스턴스는 내부적으로 Stripe의 `Discount` 객체를 감싸고 있습니다. 관련 쿠폰 정보를 조회하려면 `coupon` 메서드를 호출하면 됩니다.

```
$coupon = $subscription->discount()->coupon();
```

고객 또는 구독에 새로운 쿠폰이나 프로모션 코드를 적용하려면, `applyCoupon` 또는 `applyPromotionCode` 메서드를 사용하면 됩니다.

```
$billable->applyCoupon('coupon_id');
$billable->applyPromotionCode('promotion_code_id');

$subscription->applyCoupon('coupon_id');
$subscription->applyPromotionCode('promotion_code_id');
```

중요: 반드시 고객에게 보여지는 코드가 아니라 Stripe에서 프로모션 코드에 할당한 API ID를 사용해야 합니다. 한 시점에 한 고객이나 구독에는 하나의 쿠폰 또는 프로모션 코드만 적용할 수 있습니다.

더 자세한 정보는 Stripe 문서의 [쿠폰](https://stripe.com/docs/billing/subscriptions/coupons)과 [프로모션 코드](https://stripe.com/docs/billing/subscriptions/coupons/codes) 관련 자료를 참고해 주세요.

<a name="adding-subscriptions"></a>
#### 구독 추가하기

이미 기본 결제 수단이 등록되어 있는 고객에게 구독을 추가하고 싶다면, 구독 빌더에서 `add` 메서드를 호출하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a name="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Stripe 대시보드에서 구독 생성하기

Stripe 대시보드에서도 직접 구독을 생성할 수 있습니다. 이 경우 Cashier는 새로 추가된 구독을 `default`라는 이름으로 동기화합니다. 대시보드에서 생성된 구독에 할당되는 이름을 커스터마이즈하려면, [`WebhookController`를 확장하여](#defining-webhook-event-handlers) `newSubscriptionName` 메서드를 오버라이드 해야 합니다.

또한, Stripe 대시보드에서는 한 종류의 구독만 생성할 수 있습니다. 즉, 애플리케이션에서 여러 구독 종류(다른 이름)를 제공하더라도, 대시보드에서는 한 종류만 추가할 수 있습니다.

마지막으로, 애플리케이션에서 제공하는 구독 종류마다 한 번에 하나의 활성 구독만 추가해야 합니다. 고객이 두 개의 `default` 구독을 가지게 될 경우, Cashier는 데이터베이스와 동기화는 하더라도 가장 최근에 추가된 구독만 사용합니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인하기

고객이 구독에 가입한 뒤에는, 여러 편리한 메서드를 사용해서 구독 상태를 쉽게 확인할 수 있습니다. 먼저, `subscribed` 메서드는 고객이 현재 활성 구독을 가지고 있으면(시범 이용 기간도 포함) `true`를 반환합니다. 첫 번째 인수로 구독 이름을 전달할 수 있습니다.

```
if ($user->subscribed('default')) {
    //
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/9.x/middleware)로 활용해, 사용자의 구독 상태에 따라 특정 라우트 또는 컨트롤러 접근을 필터링하는 데에도 유용합니다.

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

사용자가 아직 시범 이용(trial) 기간 중인지 확인하려면 `onTrial` 메서드를 사용할 수 있습니다. 이를 통해 사용자에게 여전히 시범 이용 중임을 알리는 경고 등을 표시할지 판단할 수 있습니다.

```
if ($user->subscription('default')->onTrial()) {
    //
}
```

`subscribedToProduct` 메서드는, Stripe의 제품 식별자를 기반으로 사용자가 해당 제품에 대해 구독 중인지 확인할 수 있습니다. Stripe에서 제품은 여러 가격의 집합입니다. 아래 예시에서는 사용자의 `default` 구독이 애플리케이션의 "premium" 제품에 해당하는지 확인합니다. Stripe 제품 식별자는 대시보드에서 확인할 수 있습니다.

```
if ($user->subscribedToProduct('prod_premium', 'default')) {
    //
}
```

배열을 사용해서 사용자가 "basic" 또는 "premium" 제품에 대해 구독 중인지도 확인할 수 있습니다.

```
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    //
}
```

`subscribedToPrice` 메서드는 고객의 구독이 특정 가격 ID에 해당하는지 확인하는 데 사용할 수 있습니다.

```
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    //
}
```

`recurring` 메서드는 사용자가 현재 구독 중이고, 시범 이용 기간을 벗어났는지 확인하는 데 사용합니다.

```
if ($user->subscription('default')->recurring()) {
    //
}
```

> [!WARNING]
> 동일한 이름을 가진 여러 개의 구독이 있을 경우, `subscription` 메서드는 항상 가장 최근 구독만 반환합니다. 예를 들어, 사용자가 `default`라는 이름으로 두 개의 구독 정보를 가지게 되면, 그 중 하나가 예전 만료된 구독이고 다른 하나가 현재 활성 구독이더라도, 항상 가장 최근 구독만 반환하고 이전 구독 데이터는 기록 목적으로 데이터베이스에 남아 있게 됩니다.

<a name="cancelled-subscription-status"></a>
#### 구독 취소 상태 확인하기

사용자가 한때 구독을 했었지만 현재는 취소한 상태임을 확인하려면 `canceled` 메서드를 사용할 수 있습니다.

```
if ($user->subscription('default')->canceled()) {
    //
}
```

또한 사용자가 구독 취소는 했지만, 아직 "유예 기간(grace period)"이 남아 있는지도 확인할 수 있습니다. 예를 들어 사용자가 3월 5일에 구독을 취소했는데, 원래 만료일이 3월 10일이었다면, 3월 10일까지는 유예 기간입니다. 이 기간 동안 `subscribed` 메서드는 여전히 `true`를 반환합니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    //
}
```

마지막으로 사용자 구독이 취소되었고, 유예 기간도 끝났는지 확인하려면 `ended` 메서드를 사용합니다.

```
if ($user->subscription('default')->ended()) {
    //
}
```

<a name="incomplete-and-past-due-status"></a>
#### 미완료(incomplete) 및 연체(past due) 상태

구독이 생성된 후 추가 결제 처리가 필요하면, 해당 구독 상태는 `incomplete`로 표시됩니다. 구독 상태는 Cashier의 `subscriptions` 데이터베이스 테이블 내 `stripe_status` 컬럼에 저장됩니다.

마찬가지로, 가격을 변경(swap)할 때 추가 결제 처리가 필요하면, 구독 상태는 `past_due`로 표시됩니다. 이들 상태에서는 고객이 결제를 확정할 때까지 구독이 활성화되지 않습니다. 구독이 미완료 결제 상태인지 확인하려면, 청구 가능한 모델 또는 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용할 수 있습니다.

```
if ($user->hasIncompletePayment('default')) {
    //
}

if ($user->subscription('default')->hasIncompletePayment()) {
    //
}
```

구독이 미완료 결제 상태라면, 사용자를 Cashier의 결제 확인 페이지로 안내해야 합니다. 이때 `latestPayment` 식별자를 전달해야 하며, 구독 인스턴스의 `latestPayment` 메서드로 해당 식별자를 가져올 수 있습니다.

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    결제를 확인해 주세요.
</a>
```

만약 구독이 `past_due` 또는 `incomplete` 상태일 때도 활성 구독으로 간주하고 싶다면, Cashier의 `keepPastDueSubscriptionsActive` 및 `keepIncompleteSubscriptionsActive` 메서드를 사용할 수 있습니다. 보통 이 메서드들은 `App\Providers\AppServiceProvider`의 `register` 메서드에서 호출하면 됩니다.

```
use Laravel\Cashier\Cashier;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    Cashier::keepPastDueSubscriptionsActive();
    Cashier::keepIncompleteSubscriptionsActive();
}
```

> [!WARNING]
> 구독이 `incomplete` 상태일 때는 결제를 확정하기 전까지 변경할 수 없습니다. 따라서 해당 상태에서는 `swap` 및 `updateQuantity` 메서드가 예외를 발생시킵니다.

<a name="subscription-scopes"></a>
#### 구독 쿼리 스코프

대부분의 구독 상태는 쿼리 스코프로도 제공되어, 특정 상태의 구독을 데이터베이스에서 쉽게 조회할 수 있습니다.

```
// 모든 활성 구독 가져오기...
$subscriptions = Subscription::query()->active()->get();

// 사용자의 취소된 구독 모두 가져오기...
$subscriptions = $user->subscriptions()->canceled()->get();
```

사용 가능한 모든 스코프 목록은 아래와 같습니다.

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
### 구독 가격 변경하기

고객이 애플리케이션 구독 후 새 가격으로 변경하고 싶어 하는 경우가 있습니다. 고객의 구독 가격을 변경하려면 Stripe 가격의 식별자를 `swap` 메서드에 전달하면 됩니다. 가격 변경(swap)시, 만약 구독이 이전에 취소된 상태라면 재활성화한다고 간주합니다. Stripe 가격 식별자는 Stripe 대시보드에서 확인할 수 있습니다.

```
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

만약 고객이 시범 이용(trial) 중이라면, 시범 기간이 유지됩니다. 또한 "수량(quantity)"이 지정되어 있다면, 그 수량도 그대로 유지됩니다.

가격을 변경하면서 시범 이용(trial) 기간을 바로 취소하고 싶다면, `skipTrial` 메서드를 호출하면 됩니다.

```
$user->subscription('default')
        ->skipTrial()
        ->swap('price_yearly');
```

가격을 변경하면서, 다음 결제 주기를 기다리지 않고 즉시 고객에게 송장을 발행하려면, `swapAndInvoice` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a name="prorations"></a>
#### 일할 계산(Prorations)

Stripe는 가격 변경(swap) 시 기본적으로 비용을 일할 계산(prorate)합니다. 비용을 일할 계산하지 않고 구독 가격만 갱신하려면 `noProrate` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->noProrate()->swap('price_yearly');
```

구독 비용의 일할 계산에 대해 더 자세히 알고 싶다면 [Stripe 공식 문서](https://stripe.com/docs/billing/subscriptions/prorations)를 참고하시기 바랍니다.

> [!WARNING]
> `swapAndInvoice` 메서드 전에 `noProrate` 메서드를 실행하더라도 비용 일할 계산에는 영향을 주지 않습니다. 항상 송장이 발급됩니다.

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

일부 구독은 "수량"에 따라 요금이 책정됩니다. 예를 들어, 프로젝트 관리 애플리케이션에서 프로젝트당 월 10달러를 청구한다고 가정해볼 수 있습니다. `incrementQuantity`와 `decrementQuantity` 메서드를 사용하면 구독 수량을 쉽게 증가/감소시킬 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// 현재 수량에 5 추가...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// 현재 수량에서 5 차감...
$user->subscription('default')->decrementQuantity(5);
```

또는 `updateQuantity` 메서드를 통해 특정 수량을 설정할 수도 있습니다.

```
$user->subscription('default')->updateQuantity(10);
```

수량 변경시 비용을 일할 계산 없이 처리하고 싶을 때는 `noProrate` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->noProrate()->updateQuantity(10);
```

구독 수량에 대해 더 알고 싶다면, [Stripe 문서](https://stripe.com/docs/subscriptions/quantities)를 참고해 주세요.

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 여러 가지 상품이 있는 구독의 수량

구독이 [여러 상품을 포함한 구독](#subscriptions-with-multiple-products)인 경우, 수량을 변경할 가격의 ID를 두 번째 인수로 전달해야 합니다.

```
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 여러 상품을 포함하는 구독

[여러 상품을 포함하는 구독](https://stripe.com/docs/billing/subscriptions/multiple-products)은 하나의 구독에 여러 결제 상품을 할당할 수 있도록 합니다. 예를 들어, 고객 지원(헬프데스크) 애플리케이션을 예로 들면, 기본 구독 가격은 월 $10이고, 실시간 채팅 추가 상품(add-on)은 월 $15로 추가 요금을 부과할 수 있습니다. 이러한 여러 상품에 대한 정보는 Cashier의 `subscription_items` 데이터베이스 테이블에 저장됩니다.

하나의 구독에 여러 상품을 할당하려면, `newSubscription`의 두 번째 인수로 가격 배열을 전달합니다.

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

위 예시에서는 고객의 `default` 구독에 두 개의 가격이 연결됩니다. 두 가격 모두 각각의 청구 주기에 따라 결제됩니다. 필요한 경우 `quantity` 메서드를 사용해 각 가격별로 별도의 수량도 지정할 수 있습니다.

```
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

이미 생성된 구독에 가격을 추가하고 싶다면, 구독의 `addPrice` 메서드를 호출하면 됩니다.

```
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

위 코드는 다음 청구 주기에 새 가격이 반영되어 고객에게 청구됩니다. 바로 청구를 진행하고 싶다면, `addPriceAndInvoice` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

특정 가격에 대해 수량까지 지정해서 추가하려면, `addPrice` 또는 `addPriceAndInvoice` 메서드의 두 번째 인수로 수량을 전달하면 됩니다.

```
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

구독에서 가격을 제거하려면 `removePrice` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->removePrice('price_chat');
```

> [!WARNING]
> 구독의 마지막 가격은 제거할 수 없습니다. 마지막 가격을 없애고 싶다면 구독을 취소해야 합니다.

<a name="swapping-prices"></a>

#### 가격 교체(Swapping Prices)

여러 개의 제품이 포함된 구독에 연결된 가격을 변경할 수도 있습니다. 예를 들어, 고객이 `price_basic` 구독에 `price_chat` 추가 제품을 사용 중이고, 이 고객을 `price_basic`에서 `price_pro` 가격으로 업그레이드하려 한다고 가정해보겠습니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

위 예시를 실행하면, `price_basic`이 적용된 구독 아이템은 삭제되고, `price_chat`이 적용된 아이템은 그대로 유지됩니다. 그리고 `price_pro`에 대한 새로운 구독 아이템이 생성됩니다.

또한, `swap` 메서드에 키/값 쌍이 포함된 배열을 전달하여 구독 아이템의 옵션도 지정할 수 있습니다. 예를 들어, 각각의 구독 가격에 대해 수량(quantity)을 지정해야 할 수도 있습니다.

```
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

단일 가격만 교체하고 싶을 때는, 해당 구독 아이템의 `swap` 메서드를 직접 사용할 수 있습니다. 이 방식은 구독 내 다른 가격들의 모든 기존 메타데이터를 유지하고 싶을 때 특히 유용합니다.

```
$user = User::find(1);

$user->subscription('default')
        ->findItemOrFail('price_basic')
        ->swap('price_pro');
```

<a name="proration"></a>
#### 비례 청구(Proration)

기본적으로 Stripe는 여러 제품이 포함된 구독에서 가격을 추가하거나 제거할 때 자동으로 비례 청구(프레이션)를 적용합니다. 만약 비례 청구 없이 가격을 조정하려면, 가격 변동 관련 메서드에 `noProrate` 메서드를 체이닝하여 사용해야 합니다.

```
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a name="swapping-quantities"></a>
#### 수량 관리(Quantities)

각 구독 가격의 수량을 개별적으로 업데이트하려면, 기존의 [수량 관련 메서드](#subscription-quantity)를 사용할 때 가격 이름을 추가 인수로 전달하면 됩니다.

```
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> [!WARNING]
> 구독에 여러 가격이 있는 경우, `Subscription` 모델의 `stripe_price` 및 `quantity` 속성은 `null`이 됩니다. 개별 가격 속성에 접근하려면, `Subscription` 모델에서 제공하는 `items` 연관관계를 사용해야 합니다.

<a name="subscription-items"></a>
#### 구독 아이템(Subscription Items)

여러 가격이 적용된 구독은 데이터베이스의 `subscription_items` 테이블에 여러 구독 "아이템"이 저장됩니다. 해당 구독의 `items` 관계를 통해 이 아이템들에 접근할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// 특정 아이템의 Stripe 가격 및 수량을 가져오기
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

또한, `findItemOrFail` 메서드를 사용하여 특정 가격의 아이템을 직접 조회할 수도 있습니다.

```
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a name="multiple-subscriptions"></a>
### 여러 구독(Multiple Subscriptions)

Stripe는 고객이 동시에 여러 개의 구독을 가질 수 있도록 지원합니다. 예를 들어, 체육관을 운영하면서 수영 구독권과 웨이트 트레이닝 구독권을 각각 별도로 판매할 수 있으며, 각 구독은 서로 다른 가격을 가질 수 있습니다. 물론 사용자는 두 플랜 중 하나 또는 모두를 구독할 수 있어야 합니다.

애플리케이션에서 구독을 생성할 때는 `newSubscription` 메서드에 구독의 이름을 전달할 수 있습니다. 이 이름은 사용자가 시작하는 구독 유형을 나타내는 임의의 문자열이면 됩니다.

```
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()->newSubscription('swimming')
        ->price('price_swimming_monthly')
        ->create($request->paymentMethodId);

    // ...
});
```

이 예제에서는 고객의 월간 수영 구독을 시작했습니다. 그러나 나중에 연간 요금제로 전환하고 싶어질 수도 있습니다. 사용자의 구독을 조정할 때는 `swimming` 구독의 가격만 간단히 교체하면 됩니다.

```
$user->subscription('swimming')->swap('price_swimming_yearly');
```

물론 구독을 완전히 취소할 수도 있습니다.

```
$user->subscription('swimming')->cancel();
```

<a name="metered-billing"></a>
### 사용량 기반 과금(Metered Billing)

[사용량 기반 과금](https://stripe.com/docs/billing/subscriptions/metered-billing)은 고객의 제품 사용량에 따라 청구하는 방식입니다. 예를 들어, 고객이 한 달 동안 전송한 문자 메시지나 이메일 개수에 따라 요금을 부과할 수 있습니다.

사용량 기반 과금을 시작하려면 Stripe 대시보드에서 사용량 기반 가격(metered price)이 적용된 새로운 제품을 생성하세요. 그리고 `meteredPrice`를 사용해 해당 가격 ID를 구독에 추가합니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

또한, [Stripe Checkout](#checkout)을 통해 사용량 기반 구독을 시작할 수도 있습니다.

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
#### 사용량 보고(Reporting Usage)

고객이 애플리케이션을 사용할 때마다 Stripe에 사용량을 보고해야 정확한 청구가 이루어집니다. 사용량 기반 구독의 사용량을 증가시키려면 `reportUsage` 메서드를 사용하면 됩니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsage();
```

기본적으로 한 번 호출하면 "사용량"이 1만큼 추가됩니다. 원한다면 이번 청구 기간에 추가할 "사용량"의 양을 직접 지정할 수도 있습니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsage(15);
```

애플리케이션에서 하나의 구독에 여러 가격 옵션이 있을 경우, `reportUsageFor` 메서드를 사용해 어떤 사용량 기반 가격(metered price)에 대해 사용량을 보고할지 지정해야 합니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsageFor('price_metered', 15);
```

가끔 이전에 보고한 사용량을 업데이트해야 할 수도 있습니다. 이런 경우 두 번째 인수로 타임스탬프 또는 `DateTimeInterface` 인스턴스를 전달하면 됩니다. 이렇게 하면 Stripe는 해당 시간에 보고된 사용량을 업데이트합니다. 지정한 날짜와 시간이 현재 청구 기간 내라면 여러 번 업데이트할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsage(5, $timestamp);
```

<a name="retrieving-usage-records"></a>
#### 사용량 기록 조회

고객의 과거 사용량을 조회하려면 구독 인스턴스의 `usageRecords` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$usageRecords = $user->subscription('default')->usageRecords();
```

하나의 구독에 여러 가격 옵션이 있을 경우, `usageRecordsFor` 메서드를 이용해 특정 사용량 기반 가격에 대한 사용량 기록만 조회할 수 있습니다.

```
$user = User::find(1);

$usageRecords = $user->subscription('default')->usageRecordsFor('price_metered');
```

이 `usageRecords` 및 `usageRecordsFor` 메서드는 사용량 기록의 연관 배열이 담긴 Collection 인스턴스를 반환합니다. 이 배열을 반복하여 고객의 총 사용량을 표시할 수 있습니다.

```
@foreach ($usageRecords as $usageRecord)
    - Period Starting: {{ $usageRecord['period']['start'] }}
    - Period Ending: {{ $usageRecord['period']['end'] }}
    - Total Usage: {{ $usageRecord['total_usage'] }}
@endforeach
```

반환되는 모든 사용 데이터와 Stripe의 커서 기반 페이징 기능에 대해 더 자세히 알고 싶다면 [Stripe 공식 API 문서](https://stripe.com/docs/api/usage_records/subscription_item_summary_list)를 참고하세요.

<a name="subscription-taxes"></a>
### 구독 세금(Subscription Taxes)

> [!WARNING]
> 세율을 수동으로 계산하는 대신 [Stripe Tax를 사용해 세금을 자동으로 계산](#tax-configuration)할 수 있습니다.

사용자가 구독에 대해 내야 할 세율을 지정하려면, 청구가 가능한(billable) 모델에 `taxRates` 메서드를 구현하여 Stripe 세율 ID 배열을 반환해야 합니다. [Stripe 대시보드](https://dashboard.stripe.com/test/tax-rates)에서 해당 세율을 등록할 수 있습니다.

```
/**
 * 고객의 구독에 적용할 세율.
 *
 * @return array
 */
public function taxRates()
{
    return ['txr_id'];
}
```

`taxRates` 메서드를 사용하면 각 고객별로 세율을 다르게 적용할 수 있으므로, 여러 국가 및 다양한 세율을 가진 사용자 기반을 관리할 때 유용합니다.

여러 상품이 포함된 구독을 제공하는 경우, 청구가 가능한 모델에서 `priceTaxRates` 메서드를 구현하여 각 가격에 대해 다른 세율을 정의할 수 있습니다.

```
/**
 * 고객의 구독에 적용할 세율.
 *
 * @return array
 */
public function priceTaxRates()
{
    return [
        'price_monthly' => ['txr_id'],
    ];
}
```

> [!WARNING]
> `taxRates` 메서드는 구독 요금에만 적용됩니다. Cashier로 "일회성" 청구를 하려면, 해당 시점에 세율을 직접 지정해야 합니다.

<a name="syncing-tax-rates"></a>
#### 세율 동기화(Syncing Tax Rates)

`taxRates` 메서드에서 반환되는 하드코딩된 세율 ID를 변경해도, 해당 사용자의 기존 구독의 세금 설정은 그대로 남아 있습니다. 기존 구독에 대해 새로운 `taxRates` 값을 적용하려면, 해당 사용자의 구독 인스턴스에서 `syncTaxRates` 메서드를 호출해야 합니다.

```
$user->subscription('default')->syncTaxRates();
```

이 메서드는 여러 상품이 포함된 구독의 각 아이템 세율도 동기화합니다. 여러 상품 구독을 제공 중이라면 위에서 설명한 대로 모델에 `priceTaxRates` 메서드를 구현해야 합니다.

<a name="tax-exemption"></a>
#### 세금 면제(Tax Exemption)

Cashier는 고객이 세금 면제 대상인지 확인할 수 있는 `isNotTaxExempt`, `isTaxExempt`, `reverseChargeApplies` 메서드도 제공합니다. 이 메서드들은 Stripe API를 호출하여 고객의 세금 면제 상태를 확인합니다.

```
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> [!WARNING]
> 이러한 메서드들은 `Laravel\Cashier\Invoice` 객체에서도 사용할 수 있습니다. 단, `Invoice` 객체에서 호출할 경우, 송장이 생성될 당시의 세금 면제 상태를 기준으로 확인합니다.

<a name="subscription-anchor-date"></a>
### 구독 시작일(Subscription Anchor Date)

기본적으로 결제 주기의 기준일(billing cycle anchor)은 구독이 생성된 날짜, 또는 체험 기간이 있다면 체험이 끝나는 날짜입니다. 기준일을 수정하려면 `anchorBillingCycleOn` 메서드를 사용할 수 있습니다.

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

구독 결제 주기 관리에 대한 더 자세한 정보는 [Stripe 결제 주기 문서](https://stripe.com/docs/billing/subscriptions/billing-cycle)를 참고하세요.

<a name="cancelling-subscriptions"></a>
### 구독 취소(Cancelling Subscriptions)

구독을 취소하려면, 해당 사용자의 구독에서 `cancel` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->cancel();
```

구독이 취소되면, Cashier는 자동으로 데이터베이스의 `subscriptions` 테이블에 있는 `ends_at` 컬럼을 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 하는지 판단하는 데 사용됩니다.

예를 들어, 사용자가 3월 1일에 구독을 취소했다 하더라도 구독이 3월 5일까지 유효하다면, `subscribed` 메서드는 3월 5일까지 계속해서 `true`를 반환합니다. 이는 일반적으로 사용자가 결제 주기 종료 시점까지 애플리케이션을 계속 사용할 수 있도록 허용하기 위함입니다.

구독을 취소했지만 아직 "유예 기간(grace period)"에 해당하는지 확인하려면 `onGracePeriod` 메서드를 사용할 수 있습니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    //
}
```

즉시 구독을 취소하려면 `cancelNow` 메서드를 호출합니다.

```
$user->subscription('default')->cancelNow();
```

즉시 구독을 취소하고, 청구되지 않은 사용량이나 새로 추가된/보류 중인 청구 항목(proration invoice item)이 있다면 즉시 인보이스를 발생시키려면 `cancelNowAndInvoice` 메서드를 사용합니다.

```
$user->subscription('default')->cancelNowAndInvoice();
```

특정 시점에 구독이 취소되도록 지정할 수도 있습니다.

```
$user->subscription('default')->cancelAt(
    now()->addDays(10)
);
```

<a name="resuming-subscriptions"></a>
### 구독 재개(Resuming Subscriptions)

고객이 구독을 취소한 뒤, 다시 재개할 수 있도록 하려면 해당 구독에서 `resume` 메서드를 호출하세요. 단, 고객이 아직 "유예 기간" 내에 있어야만 구독을 재개할 수 있습니다.

```
$user->subscription('default')->resume();
```

고객이 구독을 취소한 뒤 만료되기 전에 다시 재개하면, 즉시 청구되지 않고 구독이 다시 활성화되며 원래 결제 주기에 따라 다음 결제가 이루어집니다.

<a name="subscription-trials"></a>
## 구독 체험 기간(Subscription Trials)

<a name="with-payment-method-up-front"></a>
### 결제 수단 선입력 방식(With Payment Method Up Front)

고객에게 체험 기간을 제공하되, 결제 수단 정보를 미리 수집하고 싶다면 구독 생성 시 `trialDays` 메서드를 사용해야 합니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
                ->trialDays(10)
                ->create($request->paymentMethodId);

    // ...
});
```

이 메서드는 데이터베이스의 구독 레코드에 체험 기간 종료 날짜를 저장하며, Stripe에는 해당 날짜 이후에만 결제가 시작되도록 지시합니다. `trialDays` 메서드를 사용할 경우, Stripe에서 해당 가격에 기본 체험 기간이 설정되어 있더라도 이를 덮어씁니다.

> [!WARNING]
> 고객의 구독이 체험 기간 만료 전에 취소되지 않을 경우, 체험 기간이 끝나는 즉시 즉시 결제가 진행됩니다. 따라서 반드시 사용자에게 체험 종료일을 미리 안내해야 합니다.

`trialUntil` 메서드를 이용하면, 체험 기간이 종료되어야 할 정확한 시점을 `DateTime` 인스턴스로 지정할 수 있습니다.

```
use Carbon\Carbon;

$user->newSubscription('default', 'price_monthly')
            ->trialUntil(Carbon::now()->addDays(10))
            ->create($paymentMethod);
```

현재 사용자가 체험 기간 내에 있는지 확인하려면 사용자 인스턴스의 `onTrial` 메서드 또는 구독 인스턴스의 `onTrial` 메서드를 사용할 수 있습니다. 아래 두 예제는 동일하게 동작합니다.

```
if ($user->onTrial('default')) {
    //
}

if ($user->subscription('default')->onTrial()) {
    //
}
```

체험 기간을 즉시 종료하려면 `endTrial` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->endTrial();
```

기존 체험 기간이 만료되었는지 확인하려면 `hasExpiredTrial` 메서드를 사용할 수 있습니다.

```
if ($user->hasExpiredTrial('default')) {
    //
}

if ($user->subscription('default')->hasExpiredTrial()) {
    //
}
```

<a name="defining-trial-days-in-stripe-cashier"></a>
#### Stripe / Cashier에서 체험 일수 정의하기

Stripe 대시보드에서 각 가격별 체험 기간(일수)을 지정하거나 Cashier를 통해 명시적으로 지정할 수 있습니다. Stripe에서 가격별 체험 기간을 지정하면, 과거에 구독 이력이 있던 고객을 포함해 새로운 구독 생성 시마다 항상 체험 기간이 적용됩니다. 단, `skipTrial()` 메서드를 명시적으로 호출하면 체험 기간 없이 바로 결제가 시작됩니다.

<a name="without-payment-method-up-front"></a>
### 결제 수단 없이 체험 제공(Without Payment Method Up Front)

결제 수단 정보를 미리 받지 않고 체험 기간을 제공하고 싶다면, 사용자 레코드의 `trial_ends_at` 컬럼에 원하는 체험 종료 날짜를 설정하면 됩니다. 보통 회원 가입 시 이 작업을 처리합니다.

```
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->addDays(10),
]);
```

> [!WARNING]
> 청구가 가능한(billable) 모델의 클래스에서 `trial_ends_at` 속성에 대해 [date cast](/docs/9.x/eloquent-mutators#date-casting)를 반드시 추가해야 합니다.

Cashier에서는 이런 유형의 체험을 "일반(generic) 체험"이라고 부릅니다. 이는 실제 구독에 연결되지 않은 상태이기 때문입니다. billable 모델 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at` 속성의 값보다 전이면 `true`를 반환합니다.

```
if ($user->onTrial()) {
    // 사용자가 체험 기간 내에 있습니다...
}
```

실제 구독을 생성하고 싶으면, 평소처럼 `newSubscription` 메서드를 사용하면 됩니다.

```
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

사용자의 체험 종료 날짜를 조회하고 싶다면 `trialEndsAt` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 체험 중이면 Carbon 인스턴스를 반환하고, 아니면 `null`을 반환합니다. 기본이 아닌 특정 구독의 체험 종료 날짜를 조회하려면 인수로 구독 이름을 전달할 수도 있습니다.

```
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

특히 사용자가 "일반(generic) 체험" 상태임을 알고 싶다면, 즉 실제 구독을 아직 생성하지 않은 상태라면 `onGenericTrial` 메서드를 사용할 수 있습니다.

```
if ($user->onGenericTrial()) {
    // 사용자가 '일반' 체험 기간 내에 있습니다...
}
```

<a name="extending-trials"></a>
### 체험 기간 연장(Extending Trials)

`extendTrial` 메서드를 사용하면 구독이 이미 생성된 후에도 체험 기간을 연장할 수 있습니다. 심지어 체험 기간이 만료되어 이미 결제가 시작된 경우에도 체험을 연장해줄 수 있습니다. 체험 기간에 속해 있었던 일차 기간은 고객의 다음 인보이스에서 차감됩니다.

```
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// 체험을 7일 뒤에 종료하도록 설정
$subscription->extendTrial(
    now()->addDays(7)
);

// 체험 기간에 5일 추가
$subscription->extendTrial(
    $subscription->trial_ends_at->addDays(5)
);
```

<a name="handling-stripe-webhooks"></a>
## Stripe 웹훅 처리하기(Handling Stripe Webhooks)

> [!NOTE]
> [Stripe CLI](https://stripe.com/docs/stripe-cli)를 사용하면 로컬 개발 중 웹훅 테스트를 쉽게 할 수 있습니다.

Stripe는 다양한 이벤트 발생 시 웹훅을 통해 애플리케이션에 알릴 수 있습니다. 기본적으로 Cashier 서비스 프로바이더가 Cashier의 웹훅 컨트롤러로 연결되는 라우트를 자동으로 등록합니다. 이 컨트롤러가 모든 웹훅 요청을 처리하게 됩니다.

Cashier 웹훅 컨트롤러는 Stripe 설정에 따라 미결제 건이 너무 많을 때 구독 취소, 고객 정보 업데이트, 고객 삭제, 구독 업데이트, 결제 수단 변경을 자동으로 처리합니다. 필요하다면 이 컨트롤러를 확장해 원하는 Stripe 웹훅 이벤트를 직접 처리할 수 있습니다.

Stripe 웹훅이 올바르게 동작하려면, Stripe 관리 패널에서 웹훅 URL을 설정해야 합니다. 기본적으로 Cashier의 웹훅 컨트롤러는 `/stripe/webhook` URL 경로로 요청을 받습니다. Stripe 관리 패널에서 활성화해야 하는 웹훅 이벤트 목록은 다음과 같습니다.

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

편의를 위해 Cashier에는 `cashier:webhook` 아티즌 명령어가 제공됩니다. 이 명령어는 Cashier에서 필요한 모든 Stripe 이벤트를 수신하는 웹훅을 Stripe에 등록합니다.

```shell
php artisan cashier:webhook
```

기본적으로 생성되는 웹훅은 `APP_URL` 환경 변수와 Cashier에서 포함하는 `cashier.webhook` 라우트의 URL을 사용합니다. 다른 URL로 생성하고 싶다면 명령어 실행 시 `--url` 옵션을 사용할 수 있습니다.

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

생성된 웹훅은 현재 Cashier 버전과 호환되는 Stripe API 버전을 사용합니다. 다른 Stripe 버전을 원한다면 `--api-version` 옵션을 사용하세요.

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

웹훅을 생성하자마자 즉시 활성 상태가 됩니다. 준비 전까지 비활성 상태로 생성하려면 `--disabled` 옵션을 사용할 수 있습니다.

```shell
php artisan cashier:webhook --disabled
```

> [!WARNING]
> 반드시 Cashier에서 제공하는 [웹훅 서명 검증](#verifying-webhook-signatures) 미들웨어를 사용하여 Stripe 웹훅 요청을 보호하세요.

<a name="webhooks-csrf-protection"></a>
#### 웹훅과 CSRF 보호(Webhooks & CSRF Protection)

Stripe 웹훅은 Laravel의 [CSRF 보호](/docs/9.x/csrf)를 우회해야 하므로, 반드시 애플리케이션의 `App\Http\Middleware\VerifyCsrfToken` 미들웨어에서 해당 URI를 예외 목록에 넣거나, 해당 라우트를 `web` 미들웨어 그룹 외부에 두어야 합니다.

```
protected $except = [
    'stripe/*',
];
```

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의하기(Defining Webhook Event Handlers)

Cashier는 결제 실패 등으로 인한 구독 취소 등 자주 발생하는 Stripe 웹훅 이벤트는 자동으로 처리해줍니다. 그러나 추가적으로 처리하고 싶은 웹훅 이벤트가 있다면 Cashier가 디스패치하는 다음 이벤트를 리스닝하여 직접 처리할 수 있습니다.

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

두 이벤트 모두 Stripe 웹훅의 전체 페이로드를 포함합니다. 예를 들어, `invoice.payment_succeeded` 웹훅을 직접 처리하고 싶다면 [리스너](/docs/9.x/events#defining-listeners)를 등록하여 이벤트를 처리하면 됩니다.

```
<?php

namespace App\Listeners;

use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    /**
     * Stripe 웹훅 처리.
     *
     * @param  \Laravel\Cashier\Events\WebhookReceived  $event
     * @return void
     */
    public function handle(WebhookReceived $event)
    {
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            // 이벤트 처리...
        }
    }
}
```

리스너를 정의한 뒤에는 애플리케이션의 `EventServiceProvider`에 리스너를 등록하면 됩니다.

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

웹훅(Webhook)의 보안을 강화하기 위해 [Stripe의 웹훅 서명](https://stripe.com/docs/webhooks/signatures)을 사용할 수 있습니다. 편의를 위해, Cashier는 Stripe에서 들어오는 웹훅 요청이 유효한지 자동으로 검증하는 미들웨어를 기본으로 제공합니다.

웹훅 검증을 활성화하려면, 애플리케이션의 `.env` 파일에서 `STRIPE_WEBHOOK_SECRET` 환경 변수가 반드시 설정되어 있어야 합니다. 이 웹훅 `secret` 값은 Stripe 계정 대시보드에서 확인할 수 있습니다.

<a name="single-charges"></a>
## 단일 결제

<a name="simple-charge"></a>
### 간단 결제

고객에게 일회성 결제를 받으려면, 청구 가능한 모델 인스턴스에서 `charge` 메서드를 사용할 수 있습니다. 이때 [결제 수단 식별자](#payment-methods-for-single-charges)를 `charge` 메서드의 두 번째 인수로 전달해야 합니다.

```
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $stripeCharge = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

`charge` 메서드는 세 번째 인수로 배열을 받아, Stripe의 결제 생성에 필요한 다양한 옵션을 전달할 수 있습니다. 사용 가능한 옵션에 대한 자세한 내용은 [Stripe 공식 문서](https://stripe.com/docs/api/charges/create)를 참고하십시오.

```
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

또한, 고객이나 사용자와 연결된 인스턴스 없이 `charge` 메서드를 사용할 수도 있습니다. 이때는 애플리케이션의 billable 모델의 새 인스턴스에서 메서드를 호출하면 됩니다.

```
use App\Models\User;

$stripeCharge = (new User)->charge(100, $paymentMethod);
```

`charge` 메서드는 결제에 실패할 경우 예외를 발생시킵니다. 성공적으로 결제가 처리되면, `Laravel\Cashier\Payment` 인스턴스가 반환됩니다.

```
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    //
}
```

> [!WARNING]
> `charge` 메서드는 결제 금액을 애플리케이션이 사용하는 통화의 최소 단위(예: USD의 경우 센트 단위)로 지정해야 합니다.

<a name="charge-with-invoice"></a>
### 인보이스 결제

단발성 결제와 함께 고객에게 PDF 영수증을 제공해야 할 때가 있습니다. 이럴 때 `invoicePrice` 메서드를 사용할 수 있습니다. 예를 들어, 고객에게 티셔츠 5장을 청구하는 방법은 다음과 같습니다.

```
$user->invoicePrice('price_tshirt', 5);
```

이 청구서는 즉시 해당 사용자의 기본 결제 수단으로 결제됩니다. `invoicePrice` 메서드는 세 번째 인수로 배열을 받을 수 있으며, 이 배열에는 인보이스 항목의 청구 옵션을 설정합니다. 네 번째 인수는 인보이스 자체의 청구 옵션을 담은 배열입니다.

```
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

`invoicePrice`와 유사하게, `tabPrice` 메서드를 이용해 고객의 "탭"에 여러 개의 일회성 항목(최대 250개)을 추가한 후 인보이스를 발행할 수 있습니다. 예를 들어, 티셔츠 5장과 머그컵 2개를 추가하는 코드는 다음과 같습니다.

```
$user->tabPrice('price_tshirt', 5);
$user->tabPrice('price_mug', 2);
$user->invoice();
```

또 다른 방법으로, `invoiceFor` 메서드를 사용해 고객의 기본 결제 수단으로 임의의 특별 결제(예: "일회성 요금")를 청구할 수 있습니다.

```
$user->invoiceFor('One Time Fee', 500);
```

`invoiceFor` 메서드도 사용 가능하지만, 미리 생성한 가격 ID를 이용해 `invoicePrice` 및 `tabPrice` 메서드를 사용하는 것이 Stripe 대시보드에서 상품별 판매 분석 등 더 나은 데이터를 얻을 수 있으므로 권장합니다.

> [!WARNING]
> `invoice`, `invoicePrice`, `invoiceFor` 메서드는 Stripe 인보이스를 생성하며, 결제 실패 시 재시도를 수행합니다. 인보이스에서 결제 실패 시 재시도를 원하지 않는다면, 첫 결제 실패 후 Stripe API를 사용하여 인보이스를 종료(close)해야 합니다.

<a name="creating-payment-intents"></a>
### Payment Intent 생성

청구 가능한 모델 인스턴스에서 `pay` 메서드를 호출하면 Stripe Payment Intent(결제 의도)를 새로 만들 수 있습니다. 이 메서드를 호출하면 결제 의도가 `Laravel\Cashier\Payment` 인스턴스에 래핑되어 반환됩니다.

```
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->pay(
        $request->get('amount')
    );

    return $payment->client_secret;
});
```

결제 의도 생성 후 반환된 client secret을 프론트엔드로 전달하여, 사용자가 브라우저에서 결제를 완료할 수 있습니다. Stripe Payment Intent를 이용한 다양한 결제 플로우 구축에 대해 궁금하다면 [Stripe 공식 문서](https://stripe.com/docs/payments/accept-a-payment?platform=web)를 참고하세요.

`pay` 메서드를 사용할 때 Stripe 대시보드의 기본 결제 수단들이 고객에게 제공됩니다. 특정 결제 수단만 허용하고 싶으면 `payWith` 메서드를 사용할 수 있습니다.

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
> `pay` 및 `payWith` 메서드는 결제 금액을 애플리케이션이 사용하는 통화의 최소 단위(예: USD의 경우 센트)로 입력해야 합니다.

<a name="refunding-charges"></a>
### 결제 환불

Stripe 결제를 환불하려면 `refund` 메서드를 사용할 수 있습니다. 이 메서드는 Stripe의 [payment intent ID](#payment-methods-for-single-charges)를 첫 번째 인수로 받습니다.

```
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a name="invoices"></a>
## 인보이스

<a name="retrieving-invoices"></a>
### 인보이스 조회

청구 가능한 모델의 인보이스 목록을 배열 형태로 간편하게 조회하려면 `invoices` 메서드를 사용합니다. 이 메서드는 `Laravel\Cashier\Invoice` 인스턴스의 컬렉션을 반환합니다.

```
$invoices = $user->invoices();
```

결제 대기 중인 인보이스도 결과에 포함하려면 `invoicesIncludingPending` 메서드를 사용하면 됩니다.

```
$invoices = $user->invoicesIncludingPending();
```

특정 인보이스를 ID로 조회하려면 `findInvoice` 메서드를 사용할 수 있습니다.

```
$invoice = $user->findInvoice($invoiceId);
```

<a name="displaying-invoice-information"></a>
#### 인보이스 정보 표시

고객의 인보이스 목록을 표시할 때, 각 인보이스의 다양한 정보를 메서드로 호출하여 보여줄 수 있습니다. 예를 들어, 모든 인보이스를 테이블로 나열하고, 각 인보이스를 쉽게 다운로드할 수 있는 예시는 다음과 같습니다.

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
### 예정 인보이스 확인

고객의 다가오는 예정 인보이스를 조회하려면 `upcomingInvoice` 메서드를 사용할 수 있습니다.

```
$invoice = $user->upcomingInvoice();
```

만약 고객이 여러 구독을 가지고 있다면, 특정 구독에 대한 예정 인보이스도 다음과 같이 조회할 수 있습니다.

```
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a name="previewing-subscription-invoices"></a>
### 구독 인보이스 미리보기

`previewInvoice` 메서드를 사용하면 가격 변경 전 인보이스를 미리 볼 수 있어, 새로운 가격 적용 시 고객의 인보이스가 어떻게 표시될지 확인할 수 있습니다.

```
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

새로운 가격이 여러 개인 경우 배열로 전달하여 해당 가격들이 적용된 인보이스를 미리 볼 수 있습니다.

```
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a name="generating-invoice-pdfs"></a>
### 인보이스 PDF 생성

인보이스 PDF 생성 전, Cashier의 기본 인보이스 렌더러인 Dompdf 라이브러리를 Composer로 설치해야 합니다.

```php
composer require dompdf/dompdf
```

컨트롤러나 라우트 내에서 `downloadInvoice` 메서드를 사용해 지정한 인보이스의 PDF 파일을 생성하여 다운로드 받을 수 있습니다. 이 메서드는 인보이스 다운로드에 적합한 HTTP 응답을 자동으로 반환합니다.

```
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId);
});
```

기본적으로 인보이스의 모든 데이터는 Stripe에 저장된 고객 및 인보이스 정보를 바탕으로 합니다. 파일명은 `app.name` 설정 값을 기반으로 지정됩니다. 하지만 두 번째 인수로 배열을 전달하여, 회사 정보 및 상품 정보 등 일부 데이터를 커스터마이징할 수도 있습니다.

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

`downloadInvoice` 메서드는 세 번째 인수로 파일 이름을 직접 지정할 수 있으며, 자동으로 `.pdf` 확장자가 붙습니다.

```
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a name="custom-invoice-render"></a>
#### 커스텀 인보이스 렌더러

Cashier에서는 커스텀 인보이스 렌더러 구현도 가능합니다. 기본적으로 Cashier는 `DompdfInvoiceRenderer` 구현체를 사용하고, 여기서 [dompdf](https://github.com/dompdf/dompdf) PHP 라이브러리를 활용해 인보이스를 만듭니다. 하지만 직접 `Laravel\Cashier\Contracts\InvoiceRenderer` 인터페이스를 구현하여 원하는 방식의 렌더러를 사용할 수 있습니다. 예를 들어, 외부의 PDF 렌더링 API를 호출하여 인보이스 PDF를 생성할 수 있습니다.

```
use Illuminate\Support\Facades\Http;
use Laravel\Cashier\Contracts\InvoiceRenderer;
use Laravel\Cashier\Invoice;

class ApiInvoiceRenderer implements InvoiceRenderer
{
    /**
     * Render the given invoice and return the raw PDF bytes.
     *
     * @param  \Laravel\Cashier\Invoice. $invoice
     * @param  array  $data
     * @param  array  $options
     * @return string
     */
    public function render(Invoice $invoice, array $data = [], array $options = []): string
    {
        $html = $invoice->view($data)->render();

        return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
    }
}
```

인보이스 렌더러 계약(Contract)을 구현한 뒤에는 애플리케이션의 `config/cashier.php` 설정 파일에서 `cashier.invoices.renderer` 설정 값을 커스텀 렌더러 클래스명으로 지정해야 합니다.

<a name="checkout"></a>
## 체크아웃(Checkout)

Cashier Stripe는 또한 [Stripe Checkout](https://stripe.com/payments/checkout)도 지원합니다. Stripe Checkout은 결제 페이지를 직접 구현하지 않아도 되도록, Stripe에서 미리 만들어 둔 호스팅 결제 페이지를 제공합니다.

아래 문서에서는 Cashier와 Stripe Checkout을 연동하는 방법을 안내합니다. Stripe Checkout에 대한 더 자세한 내용은 [Stripe 공식 Checkout 문서](https://stripe.com/docs/payments/checkout)도 참고하십시오.

<a name="product-checkouts"></a>
### 상품별 체크아웃

Stripe 대시보드에서 생성된 상품을 대상으로, 청구 가능한 모델에서 `checkout` 메서드를 사용해 체크아웃을 진행할 수 있습니다. 이 메서드는 Stripe Checkout 세션을 새로 시작하고, 기본적으로 Stripe Price ID를 인수로 전달해야 합니다.

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

이 라우트에 방문한 고객은 Stripe Checkout 결제 페이지로 리디렉션됩니다. 기본적으로 결제가 성공하거나 취소되면 `home` 라우트로 리디렉션되지만, `success_url`과 `cancel_url` 옵션을 사용해 콜백 URL을 직접 지정할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

`success_url` 옵션에 Stripe가 체크아웃 세션 ID를 쿼리스트링 파라미터로 추가해주길 원한다면, URL의 쿼리스트링에 `{CHECKOUT_SESSION_ID}` 문자열을 그대로 넣으십시오. Stripe가 이 플레이스홀더를 실제 세션 ID로 치환합니다.

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

기본적으로 Stripe Checkout 결제 페이지는 [사용자 적용 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 허용하지 않습니다. 하지만, Cashier에서 `allowPromotionCodes` 메서드를 호출하면 이 기능을 쉽게 활성화할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a name="single-charge-checkouts"></a>
### 단일 결제 체크아웃

Stripe 대시보드에 등록되어 있지 않은 임시 제품에 대해서도 단일 결제를 진행할 수 있습니다. 이때는 billable 모델에서 `checkoutCharge` 메서드를 사용해 금액, 상품명, 선택적으로 수량을 지정해줍니다. 고객이 해당 라우트에 방문하면 Stripe Checkout 페이지로 리디렉션됩니다.

```
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> [!WARNING]
> `checkoutCharge` 메서드를 사용할 경우 Stripe는 Stripe 대시보드에 새로운 상품과 가격을 항상 생성합니다. 따라서 미리 Stripe 대시보드에서 상품을 만들어두고, `checkout` 메서드를 사용하는 방식을 권장합니다.

<a name="subscription-checkouts"></a>
### 구독 결제 체크아웃

> [!WARNING]
> Stripe Checkout으로 구독을 시작하려면 Stripe 대시보드에서 `customer.subscription.created` 웹훅을 반드시 활성화해야 합니다. 이 웹훅이 구독 정보를 데이터베이스에 기록하고 관련 구독 항목도 저장합니다.

Stripe Checkout을 이용해 구독을 시작할 수도 있습니다. Cashier의 구독 빌더 메서드로 구독을 정의한 뒤, `checkout` 메서드를 호출하면 준비가 완료됩니다. 고객이 해당 라우트에 방문할 경우 Stripe Checkout 결제 페이지로 이동합니다.

```
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

상품별 체크아웃과 마찬가지로, 성공 및 취소 시 리디렉션될 URL도 지정할 수 있습니다.

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

또한 구독 결제 체크아웃에서도 프로모션 코드 사용을 허용할 수 있습니다.

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
> Stripe Checkout을 사용해 구독을 시작할 때는 일부 구독 청구 옵션(예: `anchorBillingCycleOn` 메서드, 체증(proration) 설정, 결제 동작 설정 등)이 지원되지 않습니다. 사용 가능한 파라미터는 [Stripe Checkout 세션 API 문서](https://stripe.com/docs/api/checkout/sessions/create)를 참고하십시오.

<a name="stripe-checkout-trial-periods"></a>
#### Stripe Checkout & 체험 기간

Stripe Checkout으로 진행하는 구독에도 체험 기간을 설정할 수 있습니다.

```
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

단, Stripe Checkout에서 지원하는 최소 체험 기간은 48시간 이상이어야 합니다.

<a name="stripe-checkout-subscriptions-and-webhooks"></a>
#### 구독 & 웹훅

Stripe와 Cashier는 웹훅을 통해 구독 상태를 갱신하므로, 고객이 결제 정보를 입력하고 애플리케이션으로 돌아왔을 때 아직 구독이 활성화되지 않았을 수도 있습니다. 이런 경우 사용자가 결제 또는 구독이 처리 중임을 알리는 메시지를 화면에 띄우는 것을 권장합니다.

<a name="collecting-tax-ids"></a>
### 세금 번호(Tax ID) 수집

Checkout은 고객의 세금 번호(Tax ID)를 수집하는 기능도 지원합니다. 체크아웃 세션을 시작할 때 `collectTaxIds` 메서드를 호출하면 해당 기능이 활성화됩니다.

```
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

이렇게 하면 고객이 회사로 결제하는 경우 세금 번호(Tax ID)를 입력할 수 있는 체크박스가 표시됩니다.

> [!WARNING]
> 만약 애플리케이션의 서비스 프로바이더에서 이미 [자동 세금 징수](#tax-configuration)를 설정하였다면, 이 기능은 자동으로 활성화되므로 `collectTaxIds` 메서드를 별도로 호출할 필요가 없습니다.

<a name="guest-checkouts"></a>
### 비회원(게스트) 체크아웃

`Checkout::guest` 메서드를 사용하면, 계정이 없는 애플리케이션 게스트 사용자용 체크아웃 세션도 시작할 수 있습니다.

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

사용자 계정이 있는 경우와 마찬가지로, `Laravel\Cashier\CheckoutBuilder` 인스턴스에서 제공하는 다양한 메서드를 활용하여 게스트 체크아웃 세션을 커스터마이징할 수 있습니다.

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

비회원 체크아웃이 완료된 후, Stripe는 `checkout.session.completed` 웹훅 이벤트를 보낼 수 있으니, 반드시 [Stripe 웹훅을 구성](https://dashboard.stripe.com/webhooks)하여 이 이벤트가 애플리케이션에 전달되게 해야 합니다. Stripe 대시보드에서 웹훅을 활성화한 뒤, [Cashier로 웹훅을 처리](#handling-stripe-webhooks)할 수 있습니다. 웹훅 본문에서는 [`checkout` 객체](https://stripe.com/docs/api/checkout/sessions/object)가 전달되므로, 이를 활용해 고객의 주문을 처리하십시오.

<a name="handling-failed-payments"></a>
## 결제 실패 처리

가끔 구독이나 단일 결제에 실패할 수 있습니다. 이 경우 Cashier는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시켜 결제 실패를 알립니다. 이 예외를 캐치한 뒤 두 가지 방식으로 대응할 수 있습니다.

첫째, Cashier가 자체 제공하는 결제 확인 페이지로 고객을 리디렉션할 수 있습니다. 이 페이지는 Cashier의 서비스 프로바이더에서 이미 명명된 라우트로 등록되어 있습니다. 따라서, `IncompletePayment` 예외를 캐치하고, 아래와 같이 사용자를 결제 확인 페이지로 리디렉션하면 됩니다.

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

결제 확인 페이지에서는 사용자가 신용카드 정보를 다시 입력하거나, Stripe에서 요구하는 추가 인증(예: "3D Secure")을 진행할 수 있습니다. 결제 완료 후에는 위 예시에서 `redirect` 파라미터로 지정한 URL로 리디렉션됩니다. 이때 `message`(문자열)와 `success`(정수) 쿼리 문자열 변수가 URL에 추가됩니다. 현재 결제 페이지에서 지원하는 결제 수단은 다음과 같습니다.

<div class="content-list" markdown="1">

- 신용카드(Credit Cards)
- Alipay
- Bancontact
- BECS Direct Debit
- EPS
- Giropay
- iDEAL
- SEPA Direct Debit

</div>

또 다른 방법으로, Stripe의 결제 확인을 Stripe 자체에서 처리하도록 할 수도 있습니다. 이 경우, 별도의 결제 확인 페이지로 리디렉션하지 않고, Stripe 대시보드에서 [자동 청구 이메일](https://dashboard.stripe.com/account/billing/automatic)을 활성화하면 됩니다. 단, 이 방법 역시 `IncompletePayment` 예외가 발생했을 때 사용자가 이메일로 안내를 받게 된다는 점을 사전에 꼭 알려야 합니다.

`charge`, `invoiceFor`, `invoice`와 같은 billable 모델의 메서드에서 결제 예외가 발생할 수 있습니다. 구독 관련 기능을 사용할 때는 `SubscriptionBuilder`의 `create` 메서드와 `Subscription`, `SubscriptionItem` 모델의 `incrementAndInvoice`, `swapAndInvoice` 등에서도 불완전 결제 예외가 발생할 수 있습니다.

기존 구독(Subscription)의 결제가 미완료 상태인지 확인하려면 billable 모델이나 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용하면 됩니다.

```
if ($user->hasIncompletePayment('default')) {
    //
}

if ($user->subscription('default')->hasIncompletePayment()) {
    //
}
```

불완전 결제의 구체적 상태는 예외 객체의 `payment` 속성을 통해 확인할 수 있습니다.

```
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // 결제 의도의 상태 얻기...
    $exception->payment->status;

    // 특정 상황 체크하기...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a name="strong-customer-authentication"></a>

## 강력한 고객 인증 (Strong Customer Authentication)

귀하의 비즈니스 또는 고객 중 일부가 유럽에 기반을 두고 있다면, 유럽연합(EU)에서 정한 강력한 고객 인증(SCA) 규정을 반드시 준수해야 합니다. 이 규정은 2019년 9월에 결제 사기를 방지하기 위해 도입되었습니다. 다행히 Stripe와 Cashier는 SCA 규정에 부합하는 애플리케이션을 손쉽게 구축할 수 있도록 준비되어 있습니다.

> [!WARNING]
> 시작하기 전에, [Stripe의 PSD2 및 SCA 가이드](https://stripe.com/guides/strong-customer-authentication)와 [SCA 관련 새로운 API 문서](https://stripe.com/docs/strong-customer-authentication)를 반드시 검토하시기 바랍니다.

<a name="payments-requiring-additional-confirmation"></a>
### 추가 인증이 필요한 결제

SCA 규정에 따라 결제를 승인∙처리하려면 추가 인증이 요구되는 경우가 많습니다. 이러한 상황이 발생하면, Cashier는 추가 인증이 필요하다는 사실을 알리는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시킵니다. 이러한 예외를 어떻게 처리해야 하는지는 [결제 실패 처리](#handling-failed-payments) 문서를 참고하시기 바랍니다.

Stripe 또는 Cashier가 제공하는 결제 인증 화면은 각 은행이나 카드 발급사별 결제 방식에 맞춰 제공되며, 추가 카드 인증, 소액 임시 결제, 별도의 기기 인증 등 다양한 형태의 추가 인증 절차를 포함할 수 있습니다.

<a name="incomplete-and-past-due-state"></a>
#### 미완료 및 연체 상태

결제에 추가 인증이 필요하면, 해당 구독의 `stripe_status` 데이터베이스 컬럼에 따라 구독 상태가 `incomplete`(미완료) 또는 `past_due`(연체)로 유지됩니다. 결제 인증이 완료되고 Stripe에서 웹훅을 통해 완료 사실이 애플리케이션에 통지되는 즉시, Cashier는 자동으로 해당 고객의 구독을 활성화합니다.

`incomplete` 및 `past_due` 상태에 대한 자세한 내용은 [추가 문서](#incomplete-and-past-due-status)를 참고하시기 바랍니다.

<a name="off-session-payment-notifications"></a>
### 오프 세션 결제 알림

SCA 규정에 따라, 구독이 활성화된 상태에서도 고객이 결제 정보를 주기적으로 다시 인증해야 할 수 있습니다. Cashier는 오프 세션(off-session, 즉 사용자가 직접 결제 페이지를 방문하지 않았을 때) 결제 인증이 필요할 때 고객에게 알림을 발송할 수 있습니다. 예를 들어, 구독이 갱신되는 시점에 이러한 상황이 발생할 수 있습니다. Cashier의 결제 알림 기능은 `CASHIER_PAYMENT_NOTIFICATION` 환경 변수에 알림 클래스를 지정하여 활성화할 수 있습니다. 기본적으로는 이 알림 기능이 비활성화되어 있습니다. 물론, Cashier에서 제공하는 기본 알림 클래스를 사용할 수 있지만, 필요하다면 직접 정의한 알림 클래스를 사용해도 됩니다.

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

오프 세션 결제 인증 알림이 제대로 발송되도록 하려면, [Stripe 웹훅 구성](#handling-stripe-webhooks)이 완료되어 있어야 하며, Stripe 대시보드에서 `invoice.payment_action_required` 웹훅 이벤트가 활성화되어 있어야 합니다. 추가로, `Billable` 모델에 Laravel의 `Illuminate\Notifications\Notifiable` 트레이트도 적용되어 있어야 합니다.

> [!WARNING]
> 고객이 수동으로 결제를 진행하다가 추가 인증이 필요한 경우에도 알림이 전송됩니다. Stripe에서는 결제가 수동으로 이루어진 것인지(수동 결제) 또는 오프 세션 결제인지를 구분할 방법이 없기 때문입니다. 하지만, 고객이 이미 결제를 완료한 뒤 결제 페이지를 다시 방문하면 단순히 "결제 성공" 메시지만 확인하게 되고, 동일 결제를 두 번 인증해 중복 결제가 발생할 일은 없으니 안심하셔도 됩니다.

<a name="stripe-sdk"></a>
## Stripe SDK

Cashier의 다양한 객체들은 Stripe SDK 객체를 감싸는 래퍼(wrapper) 역할을 합니다. Stripe의 실제 객체와 직접 상호작용하고 싶다면, `asStripe` 메서드를 사용해 간편하게 해당 객체를 얻을 수 있습니다.

```
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

또한, Stripe 구독을 직접 업데이트하려면 `updateStripeSubscription` 메서드를 사용할 수 있습니다.

```
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

`Stripe\StripeClient`를 직접 사용해 Stripe API를 호출하고 싶다면, `Cashier` 클래스의 `stripe` 메서드를 사용할 수 있습니다. 예를 들어, Stripe 계정에 등록된 가격 정보를 조회하려면 다음과 같이 사용할 수 있습니다.

```
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a name="testing"></a>
## 테스트

Cashier를 사용하는 애플리케이션을 테스트할 때, 실제 Stripe API로 보내는 HTTP 요청을 모킹(mock)할 수 있습니다. 하지만, 이 방법은 Cashier 내부 동작을 일부 재구현해야 하므로 권장하지 않습니다. 따라서 실제 Stripe API를 테스트가 직접 호출하도록 하는 것이 더 좋습니다. 비록 테스트가 조금 느려질 수 있지만, 실제 애플리케이션이 의도대로 동작한다는 신뢰성을 확보할 수 있고, 느린 테스트는 별도의 PHPUnit 테스트 그룹으로 분리하면 됩니다.

Cashier는 이미 자체적으로 훌륭한 테스트 스위트를 보유하고 있으므로, 여러분은 자신의 애플리케이션에서 사용하는 구독 및 결제 흐름 위주로만 테스트를 수행하면 됩니다. Cashier 내부의 모든 행동까지 직접 테스트할 필요는 없습니다.

테스트를 시작하려면, Stripe 시크릿의 **테스트** 버전을 `phpunit.xml` 파일에 추가하면 됩니다.

```
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

이제 테스트 시 Cashier와 상호작용하는 모든 과정에서 실제 Stripe 테스트 환경으로 API 요청이 전송됩니다. 편의를 위해, 테스트용 Stripe 계정에 구독/가격 정보를 미리 등록해 두면 좋습니다.

> [!NOTE]
> 다양한 결제 시나리오(예: 카드 거절, 결제 실패)를 테스트하려면, Stripe에서 제공하는 [테스트용 카드 번호 및 토큰](https://stripe.com/docs/testing)을 활용할 수 있습니다.