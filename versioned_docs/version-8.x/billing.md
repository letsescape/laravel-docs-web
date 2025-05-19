# 라라벨 Cashier, Stripe (Laravel Cashier (Stripe))

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
    - [데이터베이스 마이그레이션](#database-migrations)
- [설정](#configuration)
    - [청구 모델(Billable Model)](#billable-model)
    - [API 키](#api-keys)
    - [통화 설정](#currency-configuration)
    - [세금 설정](#tax-configuration)
    - [로깅](#logging)
    - [커스텀 모델 사용하기](#using-custom-models)
- [고객 관리](#customers)
    - [고객 조회하기](#retrieving-customers)
    - [고객 생성하기](#creating-customers)
    - [고객 정보 업데이트하기](#updating-customers)
    - [잔액 관리](#balances)
    - [세금 ID 관리](#tax-ids)
    - [Stripe와 고객 데이터 동기화](#syncing-customer-data-with-stripe)
    - [청구 포털](#billing-portal)
- [결제 수단](#payment-methods)
    - [결제 수단 저장](#storing-payment-methods)
    - [결제 수단 조회](#retrieving-payment-methods)
    - [사용자가 결제 수단을 보유하고 있는지 확인](#check-for-a-payment-method)
    - [기본 결제 수단 업데이트](#updating-the-default-payment-method)
    - [결제 수단 추가](#adding-payment-methods)
    - [결제 수단 삭제](#deleting-payment-methods)
- [구독 관리](#subscriptions)
    - [구독 생성](#creating-subscriptions)
    - [구독 상태 확인](#checking-subscription-status)
    - [가격 변경](#changing-prices)
    - [구독 수량(Quantity)](#subscription-quantity)
    - [다중 가격 구독](#multiprice-subscriptions)
    - [측정형(Metered) 빌링](#metered-billing)
    - [구독 세금 관리](#subscription-taxes)
    - [구독 기준일(Anchor Date)](#subscription-anchor-date)
    - [구독 취소](#cancelling-subscriptions)
    - [구독 재개](#resuming-subscriptions)
- [구독 체험판(Trial) 관리](#subscription-trials)
    - [결제 수단을 먼저 등록할 때](#with-payment-method-up-front)
    - [결제 수단 없이 시작할 때](#without-payment-method-up-front)
    - [체험판(Trial) 기간 연장](#extending-trials)
- [Stripe Webhook 처리](#handling-stripe-webhooks)
    - [Webhook 이벤트 핸들러 정의](#defining-webhook-event-handlers)
    - [Webhook 서명 검증](#verifying-webhook-signatures)
- [단일 청구(1회성 결제)](#single-charges)
    - [간단한 결제](#simple-charge)
    - [인보이스 기반 결제](#charge-with-invoice)
    - [결제 환불](#refunding-charges)
- [Checkout](#checkout)
    - [상품 체크아웃](#product-checkouts)
    - [단일 결제 체크아웃](#single-charge-checkouts)
    - [구독 체크아웃](#subscription-checkouts)
    - [세금 ID 수집](#collecting-tax-ids)
- [인보이스 관리](#invoices)
    - [인보이스 조회](#retrieving-invoices)
    - [예정된 인보이스](#upcoming-invoices)
    - [구독 인보이스 미리보기](#previewing-subscription-invoices)
    - [인보이스 PDF 생성](#generating-invoice-pdfs)
- [결제 실패 처리](#handling-failed-payments)
- [강화된 고객 인증(SCA)](#strong-customer-authentication)
    - [추가 인증이 필요한 결제](#payments-requiring-additional-confirmation)
    - [오프 세션 결제 알림](#off-session-payment-notifications)
- [Stripe SDK](#stripe-sdk)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe)는 [Stripe](https://stripe.com)의 구독 청구 서비스와 쉽게 연동할 수 있도록 직관적이고 유연한 인터페이스를 제공합니다. Cashier는 반복적으로 작성해야 하는 구독 청구 관련 코드 대부분을 대신 처리해줍니다. 구독 기본 관리 기능 외에도, Cashier는 쿠폰 적용, 구독 교체, 구독 수량(quantity) 관리, 취소 유예 기간, 인보이스 PDF 생성까지 폭넓게 지원합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier를 새 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.md)를 꼭 꼼꼼히 확인하시기 바랍니다.

> [!NOTE]
> Cashier는 장애를 유발하는 변경을 막기 위해 Stripe API 버전을 고정해서 사용합니다. Cashier 13 버전은 Stripe API 버전 `2020-08-27`을 활용합니다. Stripe API 버전은 Stripe의 새로운 기능과 개선 사항을 활용하기 위해 마이너 릴리즈에서 업데이트될 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용하여 Stripe용 Cashier 패키지를 설치합니다.

```
composer require laravel/cashier
```

> [!NOTE]
> Cashier가 Stripe의 모든 이벤트를 정상적으로 처리하려면 반드시 [Cashier의 Webhook 처리 기능](#handling-stripe-webhooks)을 설정해야 합니다.

<a name="database-migrations"></a>
### 데이터베이스 마이그레이션

Cashier의 서비스 프로바이더는 자체 데이터베이스 마이그레이션 디렉터리를 등록합니다. 따라서 패키지 설치 후에는 데이터베이스 마이그레이션을 꼭 실행해야 합니다. Cashier 마이그레이션은 `users` 테이블에 여러 컬럼을 추가하고, 모든 고객 구독 정보를 담는 새로운 `subscriptions` 테이블도 생성합니다.

```
php artisan migrate
```

Cashier에서 제공하는 마이그레이션 파일을 수정하거나 덮어쓰고 싶다면, `vendor:publish` 아티즌 명령어로 마이그레이션 파일을 퍼블리시할 수 있습니다.

```
php artisan vendor:publish --tag="cashier-migrations"
```

Cashier의 마이그레이션 자체를 완전히 비활성화하고 싶다면, Cashier에서 제공하는 `ignoreMigrations` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 `AppServiceProvider`의 `register` 메서드에서 호출하는 것이 좋습니다.

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

> [!NOTE]
> Stripe는 Stripe 식별자를 저장하는 컬럼은 대소문자를 구분하도록 설정할 것을 권장합니다. 따라서 MySQL을 사용할 경우 `stripe_id` 컬럼의 collation을 `utf8_bin`으로 설정해야 합니다. 이에 대한 자세한 내용은 [Stripe 문서](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible)에서 확인할 수 있습니다.

<a name="configuration"></a>
## 설정

<a name="billable-model"></a>
### 청구 모델(Billable Model)

Cashier를 사용하기 전에, 청구가 가능한 모델에 `Billable` 트레이트를 추가해야 합니다. 보통은 `App\Models\User` 모델에 이 트레이트를 추가합니다. 이 트레이트를 통해 구독 생성, 쿠폰 적용, 결제 수단 정보 업데이트 등 다양한 청구 관련 메서드를 사용할 수 있습니다.

```
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Cashier는 기본적으로 라라벨에서 제공하는 `App\Models\User` 클래스를 청구 모델로 사용한다고 가정합니다. 만약 이를 변경하고 싶다면, `useCustomerModel` 메서드를 통해 다른 모델을 지정할 수 있습니다. 이 메서드는 일반적으로 `AppServiceProvider`의 `boot` 메서드에서 호출합니다.

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

> [!NOTE]
> 라라벨에서 기본 제공하는 `App\Models\User` 모델이 아닌 다른 모델을 사용한다면, 반드시 [Cashier 마이그레이션 파일](#installation)을 퍼블리시해서 해당 모델의 테이블명에 맞게 수정해야 합니다.

<a name="api-keys"></a>
### API 키

다음으로, Stripe API 키를 애플리케이션의 `.env` 파일에 설정해야 합니다. Stripe API 키는 Stripe 관리 패널에서 확인할 수 있습니다.

```
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
```

<a name="currency-configuration"></a>
### 통화 설정

Cashier의 기본 통화는 미국 달러(USD)입니다. 애플리케이션의 `.env` 파일에서 `CASHIER_CURRENCY` 환경 변수를 설정해 통화를 변경할 수 있습니다.

```
CASHIER_CURRENCY=eur
```

Cashier의 통화를 설정하는 것 외에도, 인보이스에 금액을 표시할 때 사용할 로케일(locale)도 지정할 수 있습니다. Cashier는 내부적으로 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 이용해 금액 표시용 로케일을 지정합니다.

```
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!NOTE]
> `en` 이외의 로케일을 사용하려면 서버에 `ext-intl` PHP 확장 모듈이 설치 및 설정되어 있어야 합니다.

<a name="tax-configuration"></a>
### 세금 설정

[Stripe Tax](https://stripe.com/tax) 덕분에 Stripe에서 생성된 모든 인보이스에 대해 자동으로 세금을 계산할 수 있습니다. 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `calculateTaxes` 메서드를 호출하면 자동 세금 계산이 활성화됩니다.

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

세금 계산 기능이 활성화되면, 새롭게 생성되는 모든 구독과 1회성 인보이스에 대해 자동으로 세금이 계산됩니다.

이 기능이 제대로 작동하려면 고객의 이름, 주소, 세금 ID와 같은 청구 정보가 Stripe에 동기화되어야 합니다. 이를 위해 Cashier에서 제공하는 [고객 데이터 동기화](#syncing-customer-data-with-stripe) 및 [세금 ID](#tax-ids) 관련 메서드를 활용할 수 있습니다.

> [!NOTE]
> 아직까지는 [1회성 결제](#single-charges) 또는 [1회성 결제 체크아웃](#single-charge-checkouts)에는 세금이 계산되지 않습니다. 또한 Stripe Tax는 현재 베타 기간('invite-only')이므로, [Stripe Tax 웹사이트](https://stripe.com/tax#request-access)에서 액세스를 신청할 수 있습니다.

<a name="logging"></a>
### 로깅

Cashier를 사용하면 Stripe의 치명적 오류가 발생할 때 사용할 로그 채널을 지정할 수 있습니다. 애플리케이션 `.env` 파일에 `CASHIER_LOGGER` 환경 변수를 정의해 로그 채널을 선택할 수 있습니다.

```
CASHIER_LOGGER=stack
```

Stripe로의 API 호출에서 발생하는 예외(Exception)는 앱의 기본 로그 채널을 통해 기록됩니다.

<a name="using-custom-models"></a>
### 커스텀 모델 사용하기

Cashier가 내부적으로 사용하는 모델을 확장하고 싶다면, 직접 만든 모델이 Cashier 모델을 상속받도록 구현하면 됩니다.

```
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 뒤에는 `Laravel\Cashier\Cashier` 클래스를 통해 Cashier에 커스텀 모델을 사용하도록 지시할 수 있습니다. 일반적으로 이 설정은 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 수행합니다.

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
### 고객 조회하기

`Cashier::findBillable` 메서드를 사용해서 Stripe ID로 고객을 조회할 수 있습니다. 이 메서드는 청구가 가능한 모델 인스턴스를 반환합니다.

```
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a name="creating-customers"></a>
### 고객 생성하기

때로는 구독을 시작하지 않고 Stripe 고객만 먼저 생성하고 싶을 때가 있습니다. 이럴 때 `createAsStripeCustomer` 메서드를 사용하면 됩니다.

```
$stripeCustomer = $user->createAsStripeCustomer();
```

Stripe에 고객 계정이 생성된 후에는 나중에 구독을 시작할 수 있습니다. Stripe에서 지원하는 [고객 생성 파라미터](https://stripe.com/docs/api/customers/create)를 추가로 전달하고 싶다면, `$options` 배열을 선택적으로 넘길 수 있습니다.

```
$stripeCustomer = $user->createAsStripeCustomer($options);
```

청구가 가능한 모델의 Stripe 고객 객체를 직접 받고 싶을 때는 `asStripeCustomer` 메서드를 사용할 수 있습니다.

```
$stripeCustomer = $user->asStripeCustomer();
```

청구가 가능한 모델이 이미 Stripe에 고객으로 등록되어 있는지 확실하지 않은 경우, `createOrGetStripeCustomer` 메서드를 사용할 수 있습니다. 이 메서드는 이미 고객이 있으면 해당 고객을 조회하고, 없다면 Stripe에 새롭게 생성합니다.

```
$stripeCustomer = $user->createOrGetStripeCustomer();
```

<a name="updating-customers"></a>
### 고객 정보 업데이트하기

특정 정보를 Stripe의 고객 데이터에 직접 업데이트하고 싶을 때는 `updateStripeCustomer` 메서드를 사용할 수 있습니다. 이 메서드는 Stripe API에서 지원하는 [고객 업데이트 옵션](https://stripe.com/docs/api/customers/update)을 배열로 받아 처리합니다.

```
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a name="balances"></a>
### 잔액 관리

Stripe에서는 고객의 "잔액"에 금액을 더하거나 뺄 수 있습니다. 이후 새로 발행되는 인보이스에서 해당 잔액이 차감/증가하게 됩니다. 고객의 전체 잔액을 확인하려면, 청구가 가능한 모델에서 제공하는 `balance` 메서드를 사용할 수 있습니다. 이 메서드는 고객의 화폐 단위로 포맷된 문자열을 반환합니다.

```
$balance = $user->balance();
```

고객의 잔액을 충전하려면(크레딧), `applyBalance` 메서드에 음수 값을 전달합니다. 필요하다면 설명도 추가할 수 있습니다.

```
$user->applyBalance(-500, 'Premium customer top-up.');
```

반대로 잔액을 차감할 때는(데빗) 양수 값을 전달하면 됩니다.

```
$user->applyBalance(300, 'Bad usage penalty.');
```

`applyBalance` 메서드는 해당 고객에 대한 새로운 잔액 거래(balance transaction) 기록을 생성합니다. `balanceTransactions` 메서드를 통해 거래 기록을 조회하여, 고객에게 잔액 내역을 제공할 수 있습니다.

```
// 모든 거래 내역 조회...
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // 거래 금액...
    $amount = $transaction->amount(); // $2.31

    // 가능하다면 연관된 인보이스 조회...
    $invoice = $transaction->invoice();
}
```

<a name="tax-ids"></a>
### 세금 ID 관리

Cashier에서는 고객의 세금 ID 관리도 쉽게 할 수 있습니다. 예를 들어, `taxIds` 메서드를 사용하면 고객에게 할당된 모든 [세금 ID](https://stripe.com/docs/api/customer_tax_ids/object)를 컬렉션으로 가져올 수 있습니다.

```
$taxIds = $user->taxIds();
```

고객의 특정 세금 ID를 식별자를 통해 조회할 수도 있습니다.

```
$taxId = $user->findTaxId('txi_belgium');
```

`createTaxId` 메서드에 유효한 [type](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type)과 값을 전달해 새로운 세금 ID를 생성할 수 있습니다.

```
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

`createTaxId` 메서드를 사용하면 VAT ID가 즉시 고객 계정에 추가됩니다. [VAT ID 검증(verification)은 Stripe에서 진행](https://stripe.com/docs/invoicing/customer/tax-ids#validation)되는데, 이 과정은 비동기로 처리됩니다. `customer.tax_id.updated` webhook 이벤트를 받아 [VAT ID의 `verification` 파라미터](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification)를 확인하면 검증 결과를 실시간으로 알릴 수 있습니다. Webhook 처리 방법에 대해서는 [Webhook 핸들러 정의 문서](#handling-stripe-webhooks)를 참고하시기 바랍니다.

세금 ID를 삭제하고 싶을 때는 `deleteTaxId` 메서드를 사용하면 됩니다.

```
$user->deleteTaxId('txi_belgium');
```

<a name="syncing-customer-data-with-stripe"></a>
### Stripe와 고객 데이터 동기화

일반적으로 애플리케이션에서 사용자의 이름, 이메일, 기타 정보가 변경될 때 Stripe에 해당 변경사항도 알려야 합니다. 이렇게 하면 Stripe 쪽의 고객 정보도 항상 앱과 동일하게 유지됩니다.

이를 자동화하려면, 청구가 가능한 모델의 `updated` 이벤트에 리스너를 정의하고, 그 리스너 안에서 `syncStripeCustomerDetails` 메서드를 호출하면 됩니다.

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

이제 고객 모델이 업데이트될 때마다 Stripe와 정보가 자동으로 동기화됩니다. 참고로, Cashier는 고객이 처음 생성될 때도 Stripe와 정보를 자동으로 동기화합니다.

Stripe로 동기화할 고객 컬럼을 커스터마이징하려면 Cashier에서 제공하는 다양한 메서드를 오버라이드할 수 있습니다. 예를 들어, `stripeName` 메서드를 오버라이드해서 Stripe에 동기화할 고객명으로 사용할 속성(attribute)을 지정할 수 있습니다.

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

이와 마찬가지로, `stripeEmail`, `stripePhone`, `stripeAddress` 메서드도 오버라이드할 수 있습니다. 이 메서드들은 [Stripe 고객 객체를 업데이트](https://stripe.com/docs/api/customers/update)할 때 각각 해당 파라미터에 값을 동기화합니다. Stripe와의 동기화 과정을 직접 제어하고 싶다면 `syncStripeCustomerDetails` 메서드 전체를 오버라이드할 수도 있습니다.

<a name="billing-portal"></a>
### 청구 포털

Stripe에서는 [청구 포털을 쉽게 구축할 수 있는 방법](https://stripe.com/docs/billing/subscriptions/customer-portal)을 제공합니다. 고객은 이 포털을 통해 구독 관리, 결제 수단 관리, 결제 내역 조회 등을 직접 할 수 있습니다. 컨트롤러나 라우트에서 청구가 가능한 모델의 `redirectToBillingPortal` 메서드를 호출하면 사용자를 청구 포털로 리다이렉트할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

기본적으로 사용자가 구독 관리를 마치면 Stripe 청구 포털 안의 링크를 통해 앱의 `home` 라우트로 돌아올 수 있습니다. 반환 경로를 커스텀 URL로 지정하고 싶다면, `redirectToBillingPortal` 메서드에 URL을 인수로 전달하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

HTTP 리다이렉트 없이 청구 포털의 URL만 생성하고 싶을 때는 `billingPortalUrl` 메서드를 사용할 수 있습니다.

```
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a name="payment-methods"></a>
## 결제 수단

<a name="storing-payment-methods"></a>
### 결제 수단 저장

Stripe에서 구독을 생성하거나 1회성 결제를 처리하려면, 먼저 결제 수단을 저장하고 해당 결제 수단의 식별자를 Stripe에서 받아와야 합니다. 구독과 1회성 결제에서는 접근 방법이 조금 다르므로, 두 경우를 모두 살펴보겠습니다.

<a name="payment-methods-for-subscriptions"></a>
#### 구독용 결제 수단 저장

구독에서 고객의 신용카드 정보를 안전하게 저장하려면, Stripe의 "Setup Intents" API를 사용하여 결제 수단 정보를 수집해야 합니다. "Setup Intent"는 고객의 결제 수단을 앞으로 결제에 사용할 것임을 Stripe에 알리는 역할을 합니다. Cashier의 `Billable` 트레이트에는 `createSetupIntent` 메서드가 포함되어 있어 Setup Intent를 쉽게 생성할 수 있습니다. 이 메서드는 결제 수단 정보 입력 폼을 그릴 컨트롤러나 라우트에서 호출하면 됩니다.

```
return view('update-payment-method', [
    'intent' => $user->createSetupIntent()
]);
```

Setup Intent를 생성한 뒤, 해당 secret 값을 결제 수단 정보를 수집할 폼 요소에 포함시켜야 합니다. 예를 들어, 아래와 같이 "결제 수단 업데이트" 폼이 있다고 가정해 보겠습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    Update Payment Method
</button>
```

이제 Stripe.js 라이브러리를 활용해 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 붙여 결제 정보를 안전하게 수집할 수 있습니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

다음으로, 카드 정보를 검증하고 Stripe에서 안전한 "결제 수단 식별자"를 받으려면 [Stripe의 `confirmCardSetup` 메서드](https://stripe.com/docs/js/setup_intents/confirm_card_setup)를 사용합니다.

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

카드가 Stripe에서 정상적으로 인증되면, 반환된 `setupIntent.payment_method` 식별자를 라라벨 애플리케이션으로 전송해서 고객에게 연결할 수 있습니다. 이 결제 수단은 [새로운 결제 수단으로 추가](#adding-payment-methods)하거나 [기본 결제 수단으로 변경](#updating-the-default-payment-method)할 수 있고, 결제 수단 식별자로 바로 [새 구독을 생성](#creating-subscriptions)하는 데 사용할 수도 있습니다.

> [!TIP]
> Setup Intents와 고객 결제 정보 수집 방식에 대해 더 알고 싶다면 [Stripe의 관련 문서 개요](https://stripe.com/docs/payments/save-and-reuse#php)를 참고하세요.

<a name="payment-methods-for-single-charges"></a>
#### 1회성 결제용 결제 수단 저장

고객 결제 수단으로 단 한번만 결제를 진행하는 경우에는 결제 수단 식별자를 한 번만 사용하면 됩니다. Stripe의 제한으로 인해, 고객의 저장된 기본 결제 수단은 1회성 결제에 사용할 수 없습니다. 따라서 Stripe.js를 사용해 결제할 때마다 고객에게 직접 결제 정보를 입력받아야 합니다. 예를 들어, 다음과 같은 폼을 만들 수 있습니다.

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button">
    Process Payment
</button>
```

이런 폼을 만든 뒤 Stripe.js 라이브러리를 사용해 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 연결해 안전하게 결제 정보를 수집합니다.

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

카드 정보를 인증하고 Stripe에서 안전한 "결제 수단 식별자"를 받으려면 [Stripe의 `createPaymentMethod` 메서드](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method)를 사용합니다.

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

카드 인증이 성공하면, `paymentMethod.id` 값을 라라벨 애플리케이션에 전달해서 [1회성 결제 처리](#simple-charge)를 진행할 수 있습니다.

<a name="retrieving-payment-methods"></a>

### 결제 수단 조회하기

Billable 모델 인스턴스에서 `paymentMethods` 메서드를 호출하면 `Laravel\Cashier\PaymentMethod` 인스턴스들의 컬렉션을 반환합니다.

```
$paymentMethods = $user->paymentMethods();
```

기본적으로 이 메서드는 `card` 타입의 결제 수단만 반환합니다. 만약 다른 타입의 결제 수단을 조회하고 싶다면 `type`을 인수로 전달하면 됩니다.

```
$paymentMethods = $user->paymentMethods('sepa_debit');
```

고객의 기본 결제 수단을 조회하려면 `defaultPaymentMethod` 메서드를 사용할 수 있습니다.

```
$paymentMethod = $user->defaultPaymentMethod();
```

Billable 모델에 연결된 특정 결제 수단을 조회하려면 `findPaymentMethod` 메서드를 사용할 수 있습니다.

```
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a name="check-for-a-payment-method"></a>
### 사용자의 결제 수단 보유 여부 확인

Billable 모델이 계정에 기본 결제 수단을 가지고 있는지 확인하려면 `hasDefaultPaymentMethod` 메서드를 사용하면 됩니다.

```
if ($user->hasDefaultPaymentMethod()) {
    //
}
```

Billable 모델이 최소 하나의 결제 수단을 가지고 있는지 확인하려면 `hasPaymentMethod` 메서드를 사용할 수 있습니다.

```
if ($user->hasPaymentMethod()) {
    //
}
```

이 메서드는 기본적으로 `card` 타입의 결제 수단이 있는지 확인합니다. 만약 다른 타입의 결제 수단 존재 여부를 확인하려면 `type`을 인수로 전달하세요.

```
if ($user->hasPaymentMethod('sepa_debit')) {
    //
}
```

<a name="updating-the-default-payment-method"></a>
### 기본 결제 수단 정보 업데이트하기

`updateDefaultPaymentMethod` 메서드를 사용하면 고객의 기본 결제 수단 정보를 업데이트할 수 있습니다. 이 메서드는 Stripe 결제 수단 식별자를 인수로 받아, 해당 결제 수단을 기본 결제 수단으로 지정합니다.

```
$user->updateDefaultPaymentMethod($paymentMethod);
```

Stripe에 저장된 고객의 기본 결제 수단 정보와 동기화하려면 `updateDefaultPaymentMethodFromStripe` 메서드를 사용할 수 있습니다.

```
$user->updateDefaultPaymentMethodFromStripe();
```

> [!NOTE]
> 고객의 기본 결제 수단은 송장 발행 및 새 구독 생성에만 사용할 수 있습니다. Stripe의 정책상, 단일 결제(일회성 청구)에서는 기본 결제 수단을 사용할 수 없습니다.

<a name="adding-payment-methods"></a>
### 결제 수단 추가하기

새로운 결제 수단을 추가하려면, billable 모델의 `addPaymentMethod` 메서드에 결제 수단 식별자를 전달하면 됩니다.

```
$user->addPaymentMethod($paymentMethod);
```

> [!TIP]
> 결제 수단 식별자를 조회하는 방법에 대해서는 [결제 수단 저장 문서](#storing-payment-methods)를 참고하세요.

<a name="deleting-payment-methods"></a>
### 결제 수단 삭제하기

결제 수단을 삭제하려면, 삭제하고 싶은 `Laravel\Cashier\PaymentMethod` 인스턴스에서 `delete` 메서드를 호출하면 됩니다.

```
$paymentMethod->delete();
```

특정 결제 수단을 billable 모델에서 삭제하려면 `deletePaymentMethod` 메서드를 사용하면 됩니다.

```
$user->deletePaymentMethod('pm_visa');
```

모든 결제 수단 정보를 billable 모델에서 삭제하고 싶다면 `deletePaymentMethods` 메서드를 사용합니다.

```
$user->deletePaymentMethods();
```

기본적으로 이 메서드는 `card` 타입의 결제 수단만 삭제합니다. 다른 타입의 결제 수단을 삭제하려면, `type`을 인수로 전달하세요.

```
$user->deletePaymentMethods('sepa_debit');
```

> [!NOTE]
> 사용자가 활성화된 구독을 가지고 있는 경우, 애플리케이션에서는 기본 결제 수단을 삭제하지 못하도록 해야 합니다.

<a name="subscriptions"></a>
## 구독(Subscription)

구독 기능을 이용하면 고객에게 반복 결제를 설정할 수 있습니다. Cashier로 관리되는 Stripe 구독은 여러 구독 가격, 구독 수량, 무료 체험 등 다양한 기능을 지원합니다.

<a name="creating-subscriptions"></a>
### 구독 생성하기

구독을 생성하려면, 먼저 billable 모델의 인스턴스를 가져와야 합니다. 일반적으로 이 인스턴스는 `App\Models\User`가 됩니다. 모델 인스턴스를 가져온 후, `newSubscription` 메서드를 사용해 구독을 생성할 수 있습니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

`newSubscription` 메서드의 첫 번째 인수는 구독의 내부 이름입니다. 애플리케이션에서 단일 구독만 제공한다면 `default`나 `primary` 등 의미 있는 이름을 사용할 수 있습니다. 이 구독 이름은 내부적으로만 사용되며 사용자에게 노출하지 않습니다. 또한, 이름에 공백이 없어야 하고, 구독을 생성한 이후에는 변경하지 않는 것이 좋습니다. 두 번째 인수는 사용자가 구독할 Stripe 가격(Price)의 식별자입니다.

`create` 메서드는 [Stripe 결제 수단 식별자](#storing-payment-methods) 또는 Stripe `PaymentMethod` 객체를 받아, 구독을 시작하고 billable 모델의 Stripe 고객 ID 및 관련 결제 정보를 데이터베이스에 저장합니다.

> [!NOTE]
> 구독 생성 시 결제 수단 식별자를 직접 전달하면, 해당 결제 수단이 자동으로 사용자의 저장된 결제 수단 목록에도 추가됩니다.

<a name="collecting-recurring-payments-via-invoice-emails"></a>
#### 인보이스 이메일을 통한 반복 결제 청구

고객의 반복 결제를 자동으로 청구하는 대신, 결제 시점마다 Stripe가 고객에게 결제 요청 인보이스 이메일을 보내도록 설정할 수 있습니다. 이 방식에서는 고객이 받은 인보이스를 수동으로 결제하면 됩니다. 인보이스 방식으로 반복 결제를 설정할 때는, 결제 수단을 미리 등록할 필요가 없습니다.

```
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

고객이 인보이스를 결제하지 않아 구독이 만료되기까지의 유예 기간은 [Stripe 대시보드](https://dashboard.stripe.com/settings/billing/automatic) 내 구독 및 인보이스 설정을 통해 관리할 수 있습니다.

<a name="subscription-quantities"></a>
#### 수량(Quantity) 지정

구독 생성 시, 가격마다 특정 [수량](https://stripe.com/docs/billing/subscriptions/quantities)을 지정하고 싶다면, 구독 생성 전에 `quantity` 메서드를 사용할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')
     ->quantity(5)
     ->create($paymentMethod);
```

<a name="additional-details"></a>
#### 추가 상세 정보 지정

Stripe에서 지원하는 [고객](https://stripe.com/docs/api/customers/create) 또는 [구독](https://stripe.com/docs/api/subscriptions/create) 옵션을 더 지정하고 싶을 때, `create` 메서드의 두 번째 및 세 번째 인수로 전달할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a name="coupons"></a>
#### 쿠폰 적용하기

구독 생성 시 쿠폰을 적용하려면 `withCoupon` 메서드를 사용할 수 있습니다.

```
$user->newSubscription('default', 'price_monthly')
     ->withCoupon('code')
     ->create($paymentMethod);
```

또는, [Stripe 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 적용하려면 `withPromotionCode` 메서드를 사용할 수 있습니다. 전달하는 값은 고객이 보는 코드가 아니라 Stripe API ID여야 합니다.

```
$user->newSubscription('default', 'price_monthly')
     ->withPromotionCode('promo_code')
     ->create($paymentMethod);
```

<a name="adding-subscriptions"></a>
#### 구독 추가하기

이미 기본 결제 수단이 등록된 고객에게 구독을 추가하려면(subscription builder에서) `add` 메서드를 사용할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a name="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Stripe 대시보드에서 구독 생성하기

Stripe 대시보드에서도 구독을 생성할 수 있습니다. 이 경우, Cashier가 새로 추가된 구독을 동기화하고 구독 이름을 `default`로 지정합니다. 대시보드에서 생성된 구독의 이름을 커스터마이징하려면, [`WebhookController`를 확장](/docs/8.x/billing#defining-webhook-event-handlers)하고 `newSubscriptionName` 메서드를 오버라이드해야 합니다.

또한, Stripe 대시보드에서는 한 종류의 구독만 생성할 수 있습니다. 애플리케이션이 여러 구독을 지원하는 경우, 각 이름별로 하나의 구독만 Stripe 대시보드를 통해 추가할 수 있습니다.

마지막으로, 애플리케이션에서 제공하는 각 구독 종류별로 항상 활성화된 구독이 하나만 존재하도록 관리해야 합니다. 만약 고객에게 두 개의 `default` 구독이 있을 경우, Cashier에서는 가장 최근에 추가된 구독만을 사용하며, 두 구독 모두 애플리케이션의 데이터베이스와 동기화됩니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인하기

고객이 애플리케이션에 구독하게 되면, 다양한 편의 메서드를 활용해 구독 상태를 쉽게 확인할 수 있습니다. 먼저, `subscribed` 메서드는 사용자가 활성화된 구독을 가지고 있다면(트라이얼 기간 포함) `true`를 반환합니다. 이 메서드는 첫 번째 인수로 구독 이름을 받습니다.

```
if ($user->subscribed('default')) {
    //
}
```

또한, `subscribed` 메서드는 [라우트 미들웨어](/docs/8.x/middleware)로 사용하여 사용자의 구독 상태에 따라 라우트와 컨트롤러 접근을 제어하는 데 적합합니다.

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
            // This user is not a paying customer...
            return redirect('billing');
        }

        return $next($request);
    }
}
```

사용자가 아직 트라이얼(체험) 기간 내에 있는지 확인하려면 `onTrial` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 아직 트라이얼 중임을 사용자에게 알림으로써 안내가 필요할 때 유용합니다.

```
if ($user->subscription('default')->onTrial()) {
    //
}
```

`subscribedToProduct` 메서드는 주어진 Stripe 상품(프로덕트) 식별자를 기반으로 사용자가 해당 상품의 구독을 가지고 있는지 확인할 수 있습니다. Stripe에서 상품(Product)은 가격(Price)들의 집합입니다. 아래 예시는 사용자의 `default` 구독이 애플리케이션에서 "premium" 상품에 구독되어 있는지 확인합니다. Stripe 상품 식별자는 대시보드에서 확인할 수 있습니다.

```
if ($user->subscribedToProduct('prod_premium', 'default')) {
    //
}
```

`subscribedToProduct` 메서드에 배열을 전달하면, 예를 들어 사용자의 `default` 구독이 "basic" 또는 "premium" 상품에 구독되어 있는지 한 번에 확인할 수 있습니다.

```
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    //
}
```

`subscribedToPrice` 메서드는 구독이 특정 가격(Price) ID에 해당하는지 확인할 때 사용합니다.

```
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    //
}
```

`recurring` 메서드는 사용자가 현재 구독 중이며 더 이상 트라이얼(체험) 기간이 아닌지를 확인합니다.

```
if ($user->subscription('default')->recurring()) {
    //
}
```

> [!NOTE]
> 사용자가 동일한 이름의 구독을 2개 가지고 있을 경우, `subscription` 메서드는 항상 가장 최근의 구독만 반환합니다. 예를 들어, 사용자가 두 개의 `default` 구독 레코드를 가지고 있을 수 있는데, 하나는 만료된 예전 구독이고 다른 하나는 현재 활성 구독일 수 있습니다. 이 경우 항상 가장 최근의 구독이 반환되며, 예전 구독은 이력 조회를 위해 데이터베이스에 남아 있습니다.

<a name="cancelled-subscription-status"></a>
#### 취소된 구독 상태

사용자가 한때 활성 구독자였지만, 구독을 취소했다는 것을 확인하려면 `canceled` 메서드를 사용할 수 있습니다.

```
if ($user->subscription('default')->canceled()) {
    //
}
```

또한, 사용자가 구독을 취소했지만 완전히 만료되기 전 "유예 기간(grace period)"에 있는지 확인할 수도 있습니다. 예를 들어, 사용자가 3월 5일에 구독을 취소했고 구독 만료 예정일이 3월 10일인 경우, 사용자는 3월 10일까지 유예 기간 상태가 됩니다. 이 기간 동안 `subscribed` 메서드는 여전히 `true`를 반환합니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    //
}
```

유예 기간이 지나고 구독이 완전히 종료되었는지 확인하려면 `ended` 메서드를 사용하세요.

```
if ($user->subscription('default')->ended()) {
    //
}
```

<a name="incomplete-and-past-due-status"></a>
#### 미완료 및 연체(Incomplete & Past Due) 상태

구독 생성 후 추가 결제 처리가 필요한 경우, 해당 구독 상태는 `incomplete`로 표시됩니다. 구독 상태 정보는 Cashier의 `subscriptions` 데이터베이스 테이블의 `stripe_status` 컬럼에 저장됩니다.

마찬가지로, 가격 변경 시 추가 결제 처리가 필요한 경우 구독 상태는 `past_due`로 전환됩니다. 구독이 이들 상태에 있을 때는 고객이 결제 절차를 완료하기 전까지 활성 상태가 아니게 됩니다. 구독에 미완료 결제가 있는지 여부는 billable 모델이나 구독 인스턴스에서 `hasIncompletePayment` 메서드로 확인할 수 있습니다.

```
if ($user->hasIncompletePayment('default')) {
    //
}

if ($user->subscription('default')->hasIncompletePayment()) {
    //
}
```

구독에 미완료 결제가 있을 때는, 사용자에게 Cashier의 결제 확인 페이지로 안내하여 `latestPayment` 식별자를 전달하세요. 이 식별자는 구독 인스턴스의 `latestPayment` 메서드로 가져올 수 있습니다.

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    Please confirm your payment.
</a>
```

구독이 `past_due` 상태일 때도 활성 상태로 간주하길 원한다면, Cashier에서 제공하는 `keepPastDueSubscriptionsActive` 메서드를 사용할 수 있습니다. 보통 이 메서드는 `App\Providers\AppServiceProvider`의 `register` 메서드에서 호출하는 것이 일반적입니다.

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
}
```

> [!NOTE]
> 구독이 `incomplete` 상태인 경우 결제가 완료되기 전에는 변경할 수 없습니다. 따라서, 구독이 `incomplete` 상태일 때는 `swap` 및 `updateQuantity` 메서드가 예외를 발생시킵니다.

<a name="subscription-scopes"></a>
#### 구독 쿼리 스코프

대부분의 구독 상태는 쿼리 스코프로도 제공되어, 특정 상태의 구독을 DB에서 쉽게 조회할 수 있습니다.

```
// 활성화된 모든 구독 가져오기...
$subscriptions = Subscription::query()->active()->get();

// 사용자의 취소된 모든 구독 가져오기...
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

고객이 애플리케이션 구독 중에 가격을 변경하고 싶을 때도 있습니다. Stripe 가격 식별자를 `swap` 메서드에 전달하면 손쉽게 새 가격으로 변경할 수 있습니다. 가격을 변경할 때는 이전에 취소된 구독도 자동으로 다시 활성화된다고 가정합니다. 이때 전달한 식별자는 Stripe 대시보드에 등록된 가격 식별자여야 합니다.

```
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

고객이 트라이얼(체험) 중이라면, 체험 기간이 유지됩니다. 또한 구독에 "수량"이 지정돼 있다면 그 수량도 유지됩니다.

가격을 바꿀 때 현재 체험 기간을 같이 종료하려면, `skipTrial` 메서드를 함께 사용할 수 있습니다.

```
$user->subscription('default')
        ->skipTrial()
        ->swap('price_yearly');
```

가격을 바꾸고 기다릴 필요 없이 즉시 인보이스를 발행하려면 `swapAndInvoice` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a name="prorations"></a>
#### 청구 금액 일할계산(Prorations)

Stripe에서는 기본적으로 가격 변경 시 요금을 일할계산(proration)합니다. 일할계산(co)는 하지 않고 가격만 즉시 변경하고 싶다면 `noProrate` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->noProrate()->swap('price_yearly');
```

구독 일할계산에 대한 자세한 내용은 [Stripe 문서](https://stripe.com/docs/billing/subscriptions/prorations)를 참고하세요.

> [!NOTE]
> `swapAndInvoice` 이전에 `noProrate`를 호출하더라도, 일할계산(proration)은 항상 적용됩니다. 즉, 인보이스는 반드시 발행됩니다.

<a name="subscription-quantity"></a>
### 구독 수량(Quantity)

구독에 "수량" 개념이 도입될 수 있습니다. 예를 들어, 프로젝트 관리 애플리케이션에서 프로젝트 당 월 10달러를 책정할 경우가 이에 해당합니다. `incrementQuantity` 및 `decrementQuantity` 메서드를 통해 구독 수량을 손쉽게 더하거나 뺄 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// 구독 수량을 5만큼 증가...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// 구독 수량을 5만큼 차감...
$user->subscription('default')->decrementQuantity(5);
```

또는, `updateQuantity` 메서드로 특정 수량을 직접 설정할 수도 있습니다.

```
$user->subscription('default')->updateQuantity(10);
```

일할계산 없이 구독 수량을 업데이트하고 싶다면 `noProrate` 메서드와 함께 사용하세요.

```
$user->subscription('default')->noProrate()->updateQuantity(10);
```

구독 수량에 대한 자세한 정보는 [Stripe 공식 문서](https://stripe.com/docs/subscriptions/quantities)를 참고하세요.

<a name="multiprice-subscription-quantities"></a>
#### 멀티프라이스 구독 수량

구독이 [멀티프라이스 구독](#multiprice-subscriptions)인 경우, 수량을 늘리거나 줄이고자 하는 가격 이름을 두 번째 인수로 전달해야 합니다.

```
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a name="multiprice-subscriptions"></a>
### 멀티프라이스(Multiprice) 구독

[멀티프라이스 구독](https://stripe.com/docs/billing/subscriptions/multiple-products)은 한 구독에 여러 결제 가격을 지정할 수 있게 해 줍니다. 예를 들어, 고객지원 헬프데스크 애플리케이션을 만든다고 했을 때, 기본 구독 가격이 월 $10이고, 추가로 라이브 채팅 옵션을 월 $15에 제공하고자 할 때 사용합니다. 멀티프라이스 구독 정보는 Cashier의 `subscription_items` 테이블에 저장됩니다.

구독 생성 시 가격 목록을 배열로 두 번째 인수에 전달하면 여러 가격을 한 번에 지정할 수 있습니다.

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

위 예제에서는 고객의 `default` 구독에 2가지 가격 항목이 추가되어, 각기 다른 청구 주기로 요금이 부과됩니다. 가격마다 별도의 수량이 필요하면 `quantity` 메서드를 사용해 추가로 지정할 수 있습니다.

```
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

기존 구독에 가격 항목을 추가하려면 구독의 `addPrice` 메서드를 사용하세요.

```
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

위 예에서는 새 가격이 추가되고, 다음 결제 주기 시점에 새로운 가격이 함께 청구됩니다. 즉시 고객에게 요금을 부과하고 싶다면 `addPriceAndInvoice` 메서드를 사용하세요.

```
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

특정 수량을 갖는 가격을 추가하려면, 두 번째 인수로 수량을 전달하면 됩니다. 이는 `addPrice`와 `addPriceAndInvoice` 메서드 모두 적용됩니다.

```
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

구독에서 가격을 제거하려면 `removePrice` 메서드를 사용할 수 있습니다.

```
$user->subscription('default')->removePrice('price_chat');
```

> [!NOTE]
> 구독의 마지막 가격 항목은 삭제할 수 없습니다. 대신 구독 자체를 취소해야 합니다.

<a name="swapping-prices"></a>
#### 가격 교체(Swapping Prices)

멀티프라이스 구독에서도 가격 항목을 쉽게 교체할 수 있습니다. 예를 들어, 고객이 `price_basic` 상품과 `price_chat` 추가상품에 구독 중일 때, `price_basic`을 `price_pro`로 업그레이드하려고 한다면 다음과 같이 할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

위 예제처럼 실행하면, 기존의 `price_basic` 구독 항목이 삭제되고 `price_chat` 항목은 유지됩니다. 그리고 새롭게 `price_pro`에 대한 구독 항목이 생성됩니다.

구독 항목 옵션을 지정해야 한다면, `swap` 메서드에 키-값 쌍의 배열을 전달할 수 있습니다. 예를 들어 각 가격별 수량을 지정해야 하는 경우가 해당합니다.

```
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

구독에서 특정 가격만 바꾸고 나머지 가격의 메타데이터는 그대로 유지하고 싶다면, 구독 항목 자체의 `swap` 메서드를 사용할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')
        ->findItemOrFail('price_basic')
        ->swap('price_pro');
```

<a name="proration"></a>

#### 비례 배분(Proration)

기본적으로 Stripe는 멀티 프라이스 구독에서 가격을 추가하거나 제거할 때 요금을 비례 배분하여 부과합니다. 만약 비례 배분 없이 가격을 조정하고자 한다면, 가격 조작 메서드 체이닝에 `noProrate` 메서드를 추가하면 됩니다.

```
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a name="swapping-quantities"></a>
#### 개별 가격별 수량 조정

개별 구독 가격의 수량을 업데이트하려면, [기존 수량 조정 메서드](#subscription-quantity)에 가격 이름을 추가 인자로 전달하면 됩니다.

```
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> [!NOTE]
> 구독에 여러 가격이 포함되어 있을 때는 `Subscription` 모델의 `stripe_price` 및 `quantity` 속성이 `null`이 됩니다. 개별 가격 속성에 접근하고 싶다면, `Subscription` 모델의 `items` 연관관계를 사용해야 합니다.

<a name="subscription-items"></a>
#### 구독 아이템(Subscription Items)

구독에 여러 가격이 연결되어 있으면, 데이터베이스의 `subscription_items` 테이블에 여러 개의 구독 "아이템"이 저장됩니다. 이들은 구독의 `items` 연관관계를 통해 접근할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// 특정 아이템의 Stripe 가격과 수량을 가져오기
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

특정 가격에 해당하는 정보를 가져오려면 `findItemOrFail` 메서드를 사용할 수도 있습니다.

```
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a name="metered-billing"></a>
### 측정 기반 과금(Metered Billing)

[측정 기반 과금](https://stripe.com/docs/billing/subscriptions/metered-billing)을 사용하면, 결제 주기 동안 고객의 상품 사용량에 따라 요금을 부과할 수 있습니다. 예를 들어 고객이 보낸 문자 메시지 수나 이메일 건수 등을 기준으로 매달 과금할 수 있습니다.

측정 기반 과금을 사용하려면 먼저 Stripe 대시보드에서 계량(측정) 가격이 포함된 새 상품을 생성해야 합니다. 그런 다음, `meteredPrice` 메서드를 사용해 해당 측정용 가격 ID를 고객 구독에 추가하면 됩니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

[Stripe Checkout](#checkout)을 통해서도 측정 기반 구독을 시작할 수 있습니다.

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
#### 사용량 보고

고객이 애플리케이션을 사용하는 만큼 Stripe에 해당 사용량을 보고해야 정확한 청구가 가능합니다. 측정 기반 구독의 사용량을 증가시키려면 `reportUsage` 메서드를 이용하세요.

```
$user = User::find(1);

$user->subscription('default')->reportUsage();
```

기본적으로 "사용량" 값 1이 결제 주기에 추가됩니다. 원하는 만큼의 사용량을 추가하려면, 해당 수치를 인자로 전달하면 됩니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsage(15);
```

만약 하나의 구독에 여러 가격이 있다면, 어떤 측정 가격의 사용량을 보고할지 `reportUsageFor` 메서드로 지정해야 합니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsageFor('price_metered', 15);
```

이미 보고한 사용량을 업데이트해야 할 경우, `reportUsage`의 두 번째 인자로 타임스탬프나 `DateTimeInterface` 인스턴스를 넘기면 됩니다. 이 경우, Stripe는 해당 시점에 보고한 사용량을 업데이트합니다. 주어진 날짜 및 시간이 현재 결제 주기 내에 있다면, 계속해서 이전 사용 이력을 수정할 수 있습니다.

```
$user = User::find(1);

$user->subscription('default')->reportUsage(5, $timestamp);
```

<a name="retrieving-usage-records"></a>
#### 사용 이력 조회

고객의 과거 사용 이력을 조회하려면 구독 인스턴스의 `usageRecords` 메서드를 사용하면 됩니다.

```
$user = User::find(1);

$usageRecords = $user->subscription('default')->usageRecords();
```

만약 하나의 구독에 여러 가격이 있다면, 원하는 측정 가격의 사용 이력을 조회하려면 `usageRecordsFor` 메서드를 사용하세요.

```
$user = User::find(1);

$usageRecords = $user->subscription('default')->usageRecordsFor('price_metered');
```

`usageRecords` 및 `usageRecordsFor` 메서드는 usage record들의 연관 배열을 포함한 Collection 인스턴스를 반환합니다. 이를 반복문 등으로 순회하며 고객의 전체 사용량을 표시할 수 있습니다.

```
@foreach ($usageRecords as $usageRecord)
    - Period Starting: {{ $usageRecord['period']['start'] }}
    - Period Ending: {{ $usageRecord['period']['end'] }}
    - Total Usage: {{ $usageRecord['total_usage'] }}
@endforeach
```

사용 데이터의 전체 목록 및 Stripe의 커서 기반 페이지네이션 사용법 등은 [Stripe 공식 API 문서](https://stripe.com/docs/api/usage_records/subscription_item_summary_list)에서 확인할 수 있습니다.

<a name="subscription-taxes"></a>
### 구독 세금(Subscription Taxes)

> [!NOTE]
> 세율을 직접 계산하지 않고도 [Stripe Tax를 사용하여 자동으로 세금을 계산](#tax-configuration)할 수 있습니다.

구독에 대해 사용자가 지불해야 할 세율을 지정하려면, 청구 가능 모델에서 `taxRates` 메서드를 구현하고 Stripe 세금 ID 배열을 반환해야 합니다. 이 세율 ID는 [Stripe 대시보드](https://dashboard.stripe.com/test/tax-rates)에서 정의할 수 있습니다.

```
/**
 * 고객 구독에 적용할 세금률 반환.
 *
 * @return array
 */
public function taxRates()
{
    return ['txr_id'];
}
```

`taxRates` 메서드는 고객별로 구독 세율을 다르게 설정할 수 있어, 다양한 국가나 세율을 가진 사용자층에 유용합니다.

멀티 프라이스 구독을 제공하는 경우, 청구 가능 모델에 `priceTaxRates` 메서드를 구현하여 각 가격별로 다른 세율을 지정할 수도 있습니다.

```
/**
 * 고객 구독에 적용할 세금률 반환.
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

> [!NOTE]
> `taxRates` 메서드는 구독 요금에만 적용됩니다. Cashier로 "일회성" 결제를 진행할 경우, 해당 시점에 직접 세금을 지정해주어야 합니다.

<a name="syncing-tax-rates"></a>
#### 세율 동기화

`taxRates` 메서드에서 반환하는 하드코딩된 세율 ID를 변경해도, 기존 사용자의 구독에는 세팅이 그대로 남아 있습니다. 기존 구독에 대해 새로운 `taxRates` 값을 반영하려면, 해당 사용자의 구독 인스턴스에서 `syncTaxRates` 메서드를 호출하면 됩니다.

```
$user->subscription('default')->syncTaxRates();
```

이 메서드는 멀티 프라이스 구독 아이템의 개별 세율까지 함께 동기화해 줍니다. 멀티 프라이스 구독을 제공하는 경우, 반드시 위에서 설명한 `priceTaxRates` 메서드를 청구 가능 모델에 구현해 두어야 합니다.

<a name="tax-exemption"></a>
#### 세금 면제 확인

Cashier는 고객이 세금 면제 대상인지 판단할 수 있도록 `isNotTaxExempt`, `isTaxExempt`, `reverseChargeApplies` 메서드도 제공합니다. 이들 메서드는 Stripe API를 호출하여 고객의 세금 면제 상태를 확인합니다.

```
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> [!NOTE]
> 위 메서드들은 `Laravel\Cashier\Invoice` 객체에서도 사용할 수 있습니다. 단, `Invoice` 객체에서 호출할 경우 인보이스가 생성된 시점의 면제 상태를 조회합니다.

<a name="subscription-anchor-date"></a>
### 구독 결제일(Subscription Anchor Date)

기본적으로 결제 주기 앵커(시작일)는 구독이 최초 생성된 날짜이거나, 체험 기간(trial)을 사용하는 경우에는 체험이 끝나는 날짜입니다. 결제일 기준(anchor)을 변경하려면, `anchorBillingCycleOn` 메서드를 이용하면 됩니다.

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

구독 결제 주기(anchor) 관리에 대한 더 자세한 사항은 [Stripe 결제 주기 문서](https://stripe.com/docs/billing/subscriptions/billing-cycle)를 참고하세요.

<a name="cancelling-subscriptions"></a>
### 구독 취소하기

구독을 취소하려면, 사용자의 구독 인스턴스에서 `cancel` 메서드를 호출합니다.

```
$user->subscription('default')->cancel();
```

구독이 취소되면, Cashier는 자동으로 `subscriptions` 데이터베이스 테이블의 `ends_at` 컬럼을 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제부터 `false`를 반환해야 하는지를 판단하는 데 사용됩니다.

예를 들어, 고객이 3월 1일 구독을 취소했지만, 구독 만료일이 3월 5일이라면, `subscribed` 메서드는 3월 5일까지 계속 `true`를 반환하게 됩니다. 이는 대부분의 애플리케이션에서 결제 주기 종료일까지 계속 서비스 사용을 허용하는 방식입니다.

사용자가 구독을 취소했지만 "유예 기간(grace period)" 중에 있는지 확인하려면, `onGracePeriod` 메서드를 사용합니다.

```
if ($user->subscription('default')->onGracePeriod()) {
    //
}
```

즉시 구독을 취소하고 싶다면, `cancelNow` 메서드를 사용하세요.

```
$user->subscription('default')->cancelNow();
```

즉시 구독을 취소하면서, 미청구된 측정 사용량 또는 새로 발생했거나 대기 중인 비례 배분 인보이스 항목에 대해 바로 인보이스를 청구하고자 한다면, `cancelNowAndInvoice` 메서드를 사용하면 됩니다.

```
$user->subscription('default')->cancelNowAndInvoice();
```

특정 시점에 구독이 종료되도록 예약하려면 다음과 같이 합니다.

```
$user->subscription('default')->cancelAt(
    now()->addDays(10)
);
```

<a name="resuming-subscriptions"></a>
### 구독 재개하기

고객이 구독을 취소한 후, 다시 구독을 활성화하려면 구독 인스턴스의 `resume` 메서드를 호출하면 됩니다. 이때 고객은 반드시 "유예 기간(grace period)" 내에 있어야 합니다.

```
$user->subscription('default')->resume();
```

고객이 구독을 취소한 뒤 구독 만료 전 재개하는 경우에는 바로 결제되지 않고, 원래 결제 주기에 맞추어 구독이 다시 활성화되어 요금이 청구됩니다.

<a name="subscription-trials"></a>
## 구독 체험 기간(Subscription Trials)

<a name="with-payment-method-up-front"></a>
### 결제 수단을 선등록한 상태의 체험 기간

결제 수단 정보를 미리 받은 상태로 고객에게 체험 기간을 제공하고 싶다면, 구독 생성 시 `trialDays` 메서드를 사용합니다.

```
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
                ->trialDays(10)
                ->create($request->paymentMethodId);

    // ...
});
```

이 메서드는 구독 레코드의 trial 종료 일자를 데이터베이스에 저장하고, Stripe에도 청구 시작을 해당 날짜 이후로 미루라고 지시합니다. `trialDays` 메서드를 사용하면 Stripe에 설정된 가격의 기본 체험 기간도 무시됩니다.

> [!NOTE]
> 고객이 체험 기간 만료 전에 구독을 취소하지 않으면, 만료 즉시 청구가 발생하므로 체험 종료일을 사용자에게 반드시 안내해 주세요.

`trialUntil` 메서드를 사용하면 체험 종료일을 직접 `DateTime` 인스턴스로 지정할 수 있습니다.

```
use Carbon\Carbon;

$user->newSubscription('default', 'price_monthly')
            ->trialUntil(Carbon::now()->addDays(10))
            ->create($paymentMethod);
```

사용자가 체험 기간 내에 있는지 확인하려면, 사용자 인스턴스의 `onTrial` 메서드나 구독 인스턴스의 `onTrial` 메서드를 사용할 수 있습니다. 아래 두 예시는 동일하게 동작합니다.

```
if ($user->onTrial('default')) {
    //
}

if ($user->subscription('default')->onTrial()) {
    //
}
```

체험 기간을 즉시 종료하려면, `endTrial` 메서드를 사용하세요.

```
$user->subscription('default')->endTrial();
```

<a name="defining-trial-days-in-stripe-cashier"></a>
#### Stripe 또는 Cashier에서 체험 일수 지정

Stripe 대시보드에서 가격별 기본 체험 일수를 지정할 수도 있고, 항상 Cashier를 통해 명시적으로 넘기는 방법도 있습니다. Stripe에서 가격별 체험 일수를 지정했다면, 신규 구독(이전에 구독한 적이 있던 고객도 포함)에는 항상 체험 기간이 주어집니다. 체험 기간을 생략하려면 반드시 `skipTrial()` 메서드를 호출해야 합니다.

<a name="without-payment-method-up-front"></a>
### 결제 수단을 선등록하지 않는 체험 기간

결제 수단 정보 없이 체험 기간을 제공하고 싶다면, 사용자 레코드의 `trial_ends_at` 컬럼을 원하는 체험 종료일로 설정하면 됩니다. 보통 회원가입 시점에 이 작업이 이루어집니다.

```
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->addDays(10),
]);
```

> [!NOTE]
> 청구 가능 모델 클래스 정의에 [date cast](/docs/8.x/eloquent-mutators##date-casting)에서 `trial_ends_at` 속성을 날짜로 변환하는 캐스팅 설정을 꼭 추가하세요.

Cashier에서는 이런 체험을 '일반(generic) 체험'으로 부르며, 아직 실제 구독과 연결되지 않은 상태입니다. 청구 가능 모델 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at` 값보다 이전일 때 `true`를 반환합니다.

```
if ($user->onTrial()) {
    // 사용자는 아직 체험 기간 내에 있습니다...
}
```

실제 구독을 생성할 준비가 되면, 평소와 같이 `newSubscription`을 이용하면 됩니다.

```
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

사용자의 체험 종료일을 조회하려면 `trialEndsAt` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 체험 중이면 Carbon 날짜 인스턴스를, 아니면 `null`을 반환합니다. 기본 구독이 아닌 특정 구독의 종료일을 조회하고 싶으면, 인자로 구독 이름을 전달하면 됩니다.

```
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

사용자가 아직 실제 구독을 생성하지 않고 "일반(generic) 체험" 상태인지 확인하려면, `onGenericTrial` 메서드를 사용할 수 있습니다.

```
if ($user->onGenericTrial()) {
    // 사용자는 "일반 체험" 기간 내에 있습니다...
}
```

<a name="extending-trials"></a>
### 체험 기간 연장

`extendTrial` 메서드를 이용하면 구독 생성 후에도 체험 기간을 연장할 수 있습니다. 이미 체험이 만료되어 유료 결제가 진행되고 있는 경우에도 추가로 체험 기간을 제공할 수 있으며, 체험 기간 동안은 청구가 일시 중단되고 다시 기간이 합산되어 차감됩니다.

```
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// 체험 기간을 지금부터 7일 후로 설정
$subscription->extendTrial(
    now()->addDays(7)
);

// 기존 종료일에서 5일 추가
$subscription->extendTrial(
    $subscription->trial_ends_at->addDays(5)
);
```

<a name="handling-stripe-webhooks"></a>
## Stripe 웹훅 처리

> [!TIP]
> [Stripe CLI](https://stripe.com/docs/stripe-cli)를 활용하면 로컬 개발 환경에서 웹훅 테스트를 쉽게 할 수 있습니다.

Stripe는 다양한 이벤트 상황을 웹훅을 통해 애플리케이션에 알려줄 수 있습니다. 기본적으로, Cashier 서비스 프로바이더는 Cashier의 웹훅 컨트롤러로 향하는 라우트를 자동으로 등록합니다. 이 컨트롤러가 모든 웹훅 요청을 처리합니다.

Cashier의 웹훅 컨트롤러는 기본적으로 Stripe 설정에 따라 결제 실패가 누적된 구독 취소, 고객 정보/삭제, 구독 변경, 결제 수단 변경 등 주요 Stripe 웹훅을 자동 처리합니다. 하지만 필요에 따라 이 컨트롤러를 확장해 원하는 Stripe 웹훅 이벤트를 직접 처리할 수도 있습니다.

웹훅 처리를 정상적으로 하려면 Stripe 관리콘솔의 웹훅 URL 설정에 해당 라우트가 등록되어 있어야 합니다. Cashier의 기본 웹훅 URL은 `/stripe/webhook`입니다. Stripe 관리 콘솔에서 반드시 다음 이벤트에 대한 웹훅을 활성화해야 합니다.

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `invoice.payment_action_required`

편의를 위해 Cashier에서는 `cashier:webhook` Artisan 명령어를 제공합니다. 이 명령어를 실행하면 Cashier에 필요한 모든 이벤트를 청취하는 웹훅이 Stripe에 생성됩니다.

```
php artisan cashier:webhook
```

이 명령어로 생성된 웹훅의 URL은 `APP_URL` 환경 변수와 Cashier에 포함된 `cashier.webhook` 라우트를 기준으로 합니다. 명령어 실행 시 `--url` 옵션을 추가해 원하는 URL을 지정할 수 있습니다.

```
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

생성된 웹훅은, 현재 사용하는 Cashier가 호환되는 Stripe API 버전을 자동으로 사용합니다. 다른 Stripe 버전을 사용하고 싶다면, 명령어 실행 시 `--api-version` 옵션을 사용하세요.

```
php artisan cashier:webhook --api-version="2019-12-03"
```

웹훅은 생성된 즉시 활성화됩니다. 웹훅을 생성하되 준비가 될 때까지 비활성화 상태로 두고 싶다면 `--disabled` 옵션을 사용할 수 있습니다.

```
php artisan cashier:webhook --disabled
```

> [!NOTE]
> Stripe 웹훅 요청이 들어올 때는 Cashier가 포함한 [웹훅 시그니처 검증](#verifying-webhook-signatures) 미들웨어를 사용해 반드시 보호해야 합니다.

<a name="webhooks-csrf-protection"></a>
#### 웹훅 & CSRF 보호

Stripe 웹훅은 Laravel의 [CSRF 보호](/docs/8.x/csrf)를 우회해야 하므로, 애플리케이션의 `App\Http\Middleware\VerifyCsrfToken` 미들웨어에 웹훅 URI를 예외로 등록하거나, 해당 라우트를 `web` 미들웨어 그룹 외부에 두어야 합니다.

```
protected $except = [
    'stripe/*',
];
```

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의

Cashier는 결제 실패로 인한 구독 취소 등 흔히 발생하는 Stripe 웹훅 이벤트를 자동 처리합니다. 추가적으로 직접 처리할 웹훅 이벤트가 있다면, Cashier가 디스패치하는 다음 이벤트들을 리스닝하여 구현할 수 있습니다.

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

두 이벤트 모두 Stripe 웹훅의 전체 페이로드 정보를 담고 있습니다. 예를 들어 `invoice.payment_succeeded` 웹훅을 처리하고 싶다면, [리스너](/docs/8.x/events#defining-listeners)를 등록해 이벤트를 처리할 수 있습니다.

```
<?php

namespace App\Listeners;

use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    /**
     * Stripe 웹훅 수신 처리.
     *
     * @param  \Laravel\Cashier\Events\WebhookReceived  $event
     * @return void
     */
    public function handle(WebhookReceived $event)
    {
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            // 이벤트 처리를 여기에 작성하세요...
        }
    }
}
```

리스너를 정의했다면, 애플리케이션의 `EventServiceProvider`에 등록하면 됩니다.

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
### 웹훅 시그니처 검증

웹훅의 보안을 위해 [Stripe의 웹훅 시그니처](https://stripe.com/docs/webhooks/signatures)를 사용할 수 있습니다. Cashier에서는 Stripe 웹훅 요청의 유효성을 검증하는 미들웨어를 자동으로 포함하고 있습니다.

웹훅 검증을 활성화하려면, 애플리케이션의 `.env` 파일에 `STRIPE_WEBHOOK_SECRET` 환경 변수를 반드시 설정해야 합니다. Stripe 계정 대시보드에서 이 웹훅 `secret`을 확인할 수 있습니다.

<a name="single-charges"></a>
## 단일 결제(Single Charges)

<a name="simple-charge"></a>
### 단순 결제(Simple Charge)

> [!NOTE]
> `charge` 메서드는 결제하려는 금액을, 애플리케이션에서 사용하는 통화의 최소 단위로 입력해야 합니다. 예를 들어 달러(USD)를 사용하는 경우, 금액을 센트 단위(예: 100=1달러)로 지정해야 합니다.

한 번만 결제하는 일회성 청구를 하려면 청구 가능 모델 인스턴스의 `charge` 메서드를 사용하세요. [결제에 사용할 결제 수단 식별자](#payment-methods-for-single-charges)를 두 번째 인자로 전달해야 합니다.

```
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $stripeCharge = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

`charge` 메서드는 옵션 배열을 세 번째 인자로 받을 수 있어, Stripe의 결제 생성 옵션을 자유롭게 넘길 수 있습니다. 사용 가능한 옵션의 전체 목록은 [Stripe 공식 문서](https://stripe.com/docs/api/charges/create)에서 확인하세요.

```
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

고객 또는 사용자 정보 없이도 `charge` 메서드를 사용할 수 있습니다. 이럴 때는 애플리케이션의 청구 가능 모델 새 인스턴스에서 `charge`를 호출하면 됩니다.

```
use App\Models\User;

$stripeCharge = (new User)->charge(100, $paymentMethod);
```

`charge` 메서드는 결제가 실패하면 예외를 발생시킵니다. 결제가 성공적으로 처리되면, `Laravel\Cashier\Payment` 인스턴스를 반환합니다.

```
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    //
}
```

<a name="charge-with-invoice"></a>

### 인보이스로 청구하기

가끔 일회성 결제와 함께 PDF 영수증을 고객에게 제공해야 할 때가 있습니다. `invoicePrice` 메서드를 사용하면 이 작업을 손쉽게 처리할 수 있습니다. 예를 들어, 고객에게 새 셔츠 5벌에 대한 인보이스를 발급하려면 다음과 같이 할 수 있습니다.

```
$user->invoicePrice('price_tshirt', 5);
```

이 인보이스는 사용자 기본 결제수단으로 즉시 결제됩니다. `invoicePrice` 메서드는 세 번째 인수로 배열을 받을 수 있습니다. 이 배열에는 인보이스 항목의 청구 옵션을 전달합니다. 또한 네 번째 인수도 배열로 받아 인보이스 자체에 대한 청구 옵션을 지정합니다.

```
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

또는, `invoiceFor` 메서드를 사용해 고객의 기본 결제수단에 대해 "일회성" 청구를 할 수도 있습니다.

```
$user->invoiceFor('One Time Fee', 500);
```

`invoiceFor` 메서드도 사용할 수 있지만, 미리 정의된 가격으로 `invoicePrice` 메서드를 사용하는 것이 더 권장되는 방법입니다. 이렇게 하면 Stripe 대시보드에서 제품별 매출에 대한 더 나은 분석 및 데이터를 얻을 수 있습니다.

> [!NOTE]
> `invoicePrice`와 `invoiceFor` 메서드는 실패한 결제 시 재시도되는 Stripe 인보이스를 생성합니다. 결제 실패 시 인보이스의 재시도를 원하지 않는다면, 첫 번째 결제 실패 이후 Stripe API를 사용해 인보이스를 닫아야 합니다.

<a name="refunding-charges"></a>
### 결제 환불 처리

Stripe 결제를 환불해야 할 경우, `refund` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 Stripe의 [payment intent ID](#payment-methods-for-single-charges)를 받습니다.

```
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a name="invoices"></a>
## 인보이스

<a name="retrieving-invoices"></a>
### 인보이스 조회

빌링 가능한 모델의 인보이스 배열을 손쉽게 조회하려면 `invoices` 메서드를 사용합니다. 이 메서드는 `Laravel\Cashier\Invoice` 인스턴스들로 이루어진 컬렉션을 반환합니다.

```
$invoices = $user->invoices();
```

결과에 미결 인보이스(아직 결제가 완료되지 않은 인보이스)를 포함하려면, `invoicesIncludingPending` 메서드를 사용할 수 있습니다.

```
$invoices = $user->invoicesIncludingPending();
```

특정 인보이스를 ID로 찾아오고 싶다면 `findInvoice` 메서드를 사용할 수 있습니다.

```
$invoice = $user->findInvoice($invoiceId);
```

<a name="displaying-invoice-information"></a>
#### 인보이스 정보 표시

고객의 인보이스 목록을 표시할 때, 각 인보이스의 메서드를 활용해 관련 정보를 출력할 수 있습니다. 예를 들어, 아래와 같이 모든 인보이스를 표로 나열해 사용자가 각 인보이스를 손쉽게 다운로드할 수 있도록 할 수 있습니다.

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
### 발행 예정 인보이스

고객의 발행 예정(곧 정기 결제가 이루어질) 인보이스를 조회하려면 `upcomingInvoice` 메서드를 사용하면 됩니다.

```
$invoice = $user->upcomingInvoice();
```

고객이 여러 개의 구독을 가지고 있는 경우, 특정 구독의 발행 예정 인보이스도 다음과 같이 가져올 수 있습니다.

```
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a name="previewing-subscription-invoices"></a>
### 구독 인보이스 미리보기

`previewInvoice` 메서드를 사용하면 가격 변경 전에 인보이스를 미리 볼 수 있습니다. 이를 통해 사용자가 특정 가격 변경이 적용됐을 때 실제 결제 청구서가 어떻게 보일지 확인할 수 있습니다.

```
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

새로운 가격이 여러 개인 인보이스도 미리보기 위해서는, 가격 배열을 전달할 수 있습니다.

```
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a name="generating-invoice-pdfs"></a>
### 인보이스 PDF 생성

라우트나 컨트롤러에서 `downloadInvoice` 메서드를 사용해 특정 인보이스의 PDF 파일을 다운로드하도록 할 수 있습니다. 이 메서드는 인보이스 다운로드에 필요한 적절한 HTTP 응답을 자동으로 생성해 반환합니다.

```
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId, [
        'vendor' => 'Your Company',
        'product' => 'Your Product',
    ]);
});
```

기본적으로 인보이스의 모든 데이터는 Stripe에 저장된 고객 및 인보이스 정보를 바탕으로 구성됩니다. 하지만, `downloadInvoice`의 두 번째 인수로 배열을 전달해 회사명, 제품명 등 일부 정보를 커스터마이즈할 수 있습니다.

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
], 'my-invoice');
```

세 번째 인수로 파일명을 직접 지정할 수도 있습니다. 지정한 파일명 뒤에 자동으로 `.pdf`가 붙습니다.

```
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a name="custom-invoice-render"></a>
#### 커스텀 인보이스 렌더러

Cashier에서는 커스텀 인보이스 렌더러 사용도 지원합니다. 기본적으로 Cashier는 [dompdf](https://github.com/dompdf/dompdf) PHP 라이브러리를 활용하는 `DompdfInvoiceRenderer` 구현체를 사용하지만, 필요한 경우 `Laravel\Cashier\Contracts\InvoiceRenderer` 인터페이스를 구현해 원하는 렌더러를 만들 수 있습니다. 예를 들어, 외부 PDF 렌더링 API를 통해 인보이스 PDF를 생성하려고 할 때 다음과 같이 구현할 수 있습니다.

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

이렇게 커스텀 인보이스 렌더러를 구현했다면, 애플리케이션의 `config/cashier.php` 설정 파일에서 `cashier.invoices.renderer` 값을 해당 클래스명으로 수정해야 합니다. 이 설정값에 커스텀 렌더러 구현체의 클래스명을 지정하세요.

<a name="checkout"></a>
## 체크아웃

Cashier Stripe는 [Stripe Checkout](https://stripe.com/payments/checkout)도 지원합니다. Stripe Checkout은 미리 만들어진 호스팅 결제 페이지를 제공하므로 커스텀 결제 페이지를 직접 개발하지 않아도 손쉽게 결제 기능을 도입할 수 있습니다.

이 섹션에서는 Cashier와 Stripe Checkout을 연동하는 방법을 설명합니다. Stripe Checkout에 대한 더 자세한 설명은 [Stripe 공식 Checkout 문서](https://stripe.com/docs/payments/checkout)도 참고해 주세요.

<a name="product-checkouts"></a>
### 상품 체크아웃

Stripe 대시보드에서 생성한 기존 상품에 대해 체크아웃을 진행하려면, 빌링 모델에서 `checkout` 메서드를 사용하면 됩니다. `checkout` 메서드는 Stripe Checkout 세션을 시작합니다. 기본적으로는 Stripe 가격 ID(Price ID)를 전달해야 합니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout('price_tshirt');
});
```

필요하다면 제품의 수량도 함께 지정할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 15]);
});
```

고객이 해당 라우트에 접속하면 Stripe의 Checkout 페이지로 리디렉션됩니다. 기본적으로 결제 성공 또는 취소 후에는 애플리케이션의 `home` 라우트로 리디렉션되지만, `success_url`과 `cancel_url` 옵션을 지정해 콜백 URL을 직접 설정할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

`success_url` 체크아웃 옵션을 정의할 때, URL의 쿼리 문자열에 체크아웃 세션 ID를 추가하도록 Stripe에 요청할 수도 있습니다. 이를 위해 쿼리스트링에 `{CHECKOUT_SESSION_ID}` 라는 리터럴 문자열을 추가하면 Stripe가 이 플레이스홀더를 실제 체크아웃 세션 ID로 대체합니다.

```
use Illuminate\Http\Request;
use Stripe\Checkout\Session;
use Stripe\Customer;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('checkout-success') . '?session_id={CHECKOUT_SESSION_ID}',
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

기본적으로 Stripe Checkout에서는 [사용자가 입력 가능한 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 지원하지 않습니다. 다행히, Cashier에서는 `allowPromotionCodes` 메서드를 호출해 이 기능을 쉽게 활성화할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a name="single-charge-checkouts"></a>
### 단일 상품(일회성) 체크아웃

Stripe 대시보드에 등록되지 않은 임시 상품에 대해 단순 결제를 진행할 수도 있습니다. 이때는 빌링 모델에서 `checkoutCharge` 메서드를 사용하고, 결제 금액, 상품명, 옵션으로 수량을 전달하면 됩니다. 고객이 이 라우트로 접속하면 Stripe Checkout 페이지로 리디렉션됩니다.

```
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> [!NOTE]
> `checkoutCharge` 메서드를 사용할 경우 Stripe는 Stripe 대시보드에 새로운 상품과 가격을 항상 생성합니다. 이에 따라, 미리 Stripe 대시보드에서 상품을 생성해 두고 되도록 `checkout` 메서드를 사용할 것을 권장합니다.

<a name="subscription-checkouts"></a>
### 구독 체크아웃

> [!NOTE]
> Stripe Checkout으로 구독을 생성하려면 Stripe 대시보드에서 `customer.subscription.created` 웹훅을 반드시 활성화해야 합니다. 이 웹훅은 데이터베이스에 구독 레코드를 생성하고, 관련 구독 항목 정보를 모두 저장합니다.

Stripe Checkout을 활용하여 구독을 시작할 수도 있습니다. 먼저 Cashier의 구독 빌더 메서드를 사용해 구독을 정의한 후, `checkout` 메서드를 호출하면 됩니다. 고객은 해당 라우트에 접속하면 Stripe Checkout 페이지로 이동합니다.

```
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

상품 체크아웃과 동일하게, 결제 성공·실패(취소) 시 리디렉션될 URL을 직접 지정할 수도 있습니다.

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

그리고, 구독 체크아웃에도 프로모션 코드 사용을 활성화할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->allowPromotionCodes()
        ->checkout();
});
```

> [!NOTE]
> Stripe Checkout에서 구독을 시작할 때 일부 구독 청구 옵션은 지원되지 않습니다. 예를 들어 `anchorBillingCycleOn` 메서드 사용, 비례 배분 옵션(proration behavior) 지정, 결제 방식(payment behavior) 지정 등은 Stripe Checkout 세션에서는 동작하지 않습니다. 지원되는 세부 파라미터들은 [Stripe Checkout Session API 공식 문서](https://stripe.com/docs/api/checkout/sessions/create)를 참고하세요.

<a name="stripe-checkout-trial-periods"></a>
#### Stripe Checkout과 체험 기간

Stripe Checkout을 통한 구독 생성 시에도 체험 기간(trial period)을 정의할 수 있습니다.

```
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

단, 체험 기간은 최소 48시간 이상이어야 하며, 이는 Stripe Checkout이 지원하는 최소 체험 기간입니다.

<a name="stripe-checkout-subscriptions-and-webhooks"></a>
#### 구독 및 웹훅

Stripe와 Cashier는 웹훅을 사용해 구독 상태를 갱신하기 때문에, 고객이 결제 정보를 입력한 후 애플리케이션으로 돌아왔을 때 구독이 아직 활성화되지 않은 경우도 있습니다. 이런 상황을 처리하려면, 결제 또는 구독이 보류 중(pending)임을 사용자에게 안내하는 메시지를 띄우는 것이 좋습니다.

<a name="collecting-tax-ids"></a>
### 세금 ID 수집하기

Checkout 세션에서는 고객의 세금 ID(Tax ID)도 수집할 수 있습니다. 이를 활성화하려면 Checkout 세션 생성 시 `collectTaxIds` 메서드를 호출하면 됩니다.

```
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

이 메서드를 사용하면, 고객이 회사로 구매하는 경우임을 표시하고 해당 세금 ID 번호를 입력할 수 있는 새로운 체크박스가 결제 페이지에 나타납니다.

> [!NOTE]
> 이미 애플리케이션의 서비스 프로바이더에서 [자동 세금 징수](#tax-configuration)를 설정했다면, 이 기능은 자동으로 활성화되므로 `collectTaxIds` 메서드를 별도로 호출할 필요가 없습니다.

<a name="handling-failed-payments"></a>
## 결제 실패 처리

때때로 구독 또는 일회성 결제가 실패할 수 있습니다. 이런 경우 Cashier에서는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시켜 결제 실패를 알려줍니다. 이 예외를 캐치한 후에는, 다음 두 가지 중 한 가지 방식으로 후속 처리를 할 수 있습니다.

첫 번째 방법은 고객을 전용 결제 확인(confirmation) 페이지로 리디렉션하는 것입니다. 이 페이지는 Cashier에 내장되어 있으며, Cashier의 서비스 프로바이더를 통해 이미 명명된 라우트가 등록됩니다. 따라서, `IncompletePayment` 예외를 캐치하여 사용자를 결제 확인 페이지로 리디렉션하면 됩니다.

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

결제 확인 페이지에서는 고객이 신용카드 정보를 다시 입력하고, Stripe에서 요구하는 추가 인증(예: "3D Secure" 확인 등) 과정을 거치게 됩니다. 결제가 정상적으로 확인되면, 사용자는 위에서 전달한 `redirect` 파라미터의 URL로 리디렉션됩니다. 이때 쿼리스트링에는 `message`(문자열)와 `success`(정수) 변수도 함께 전달됩니다. 현재 결제 페이지에서는 다음과 같은 결제 수단을 지원합니다.

<div class="content-list" markdown="1">

- 신용카드
- Alipay
- Bancontact
- BECS 직접 출금
- EPS
- Giropay
- iDEAL
- SEPA 직접 출금

</div>

다른 방법으로는 Stripe가 결제 확인 절차를 대신 처리하도록 맡길 수도 있습니다. 이 경우, 결제 확인 페이지로 리디렉션하지 않고 [Stripe의 자동 청구 이메일](https://dashboard.stripe.com/account/billing/automatic) 기능을 Stripe 대시보드에서 활성화하면 됩니다. 하지만, 여전히 `IncompletePayment` 예외가 발생한 경우 사용자에게 결제 확인 안내 메일을 수신하게 된다는 점을 반드시 안내해야 합니다.

결제 예외는 `Billable` 트레이트를 사용하는 모델에서 `charge`, `invoiceFor`, `invoice` 메서드를 호출할 때 발생할 수 있습니다. 구독 관련 작업의 경우, `SubscriptionBuilder`의 `create` 메서드, `Subscription` 및 `SubscriptionItem` 모델의 `incrementAndInvoice`와 `swapAndInvoice` 메서드에서도 결제 미완료 예외가 발생할 수 있습니다.

기존 구독이 미완료(incomplete) 결제 상태인지 확인하려면, 빌링 가능한 모델이나 구독 인스턴스에서 `hasIncompletePayment` 메서드를 호출하면 됩니다.

```
if ($user->hasIncompletePayment('default')) {
    //
}

if ($user->subscription('default')->hasIncompletePayment()) {
    //
}
```

예외 인스턴스의 `payment` 프로퍼티를 확인하여 미완료 결제의 구체적인 상태를 파악할 수도 있습니다.

```
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // 결제 intent 상태 확인...
    $exception->payment->status;

    // 조건별 분기 처리...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a name="strong-customer-authentication"></a>
## 강력한 고객 인증 (SCA)

비즈니스 또는 고객 중 유럽에 기반을 둔 경우, EU의 강력한 고객 인증(Strong Customer Authentication, SCA) 규정을 준수해야 합니다. 이 규정은 2019년 9월부터 유럽연합(EU)에서 결제 사기 방지를 위해 시행되고 있습니다. 다행히 Stripe와 Cashier는 SCA를 준수하는 애플리케이션 개발을 지원하도록 준비되어 있습니다.

> [!NOTE]
> 시작 전, [Stripe의 PSD2 및 SCA 안내](https://stripe.com/guides/strong-customer-authentication)와 [새로운 SCA API 문서](https://stripe.com/docs/strong-customer-authentication)를 반드시 참고하시기 바랍니다.

<a name="payments-requiring-additional-confirmation"></a>
### 추가 인증이 필요한 결제

SCA 규정에 따라 결제 시 추가 인증이 요구되는 경우가 많습니다. 이런 상황이 발생하면 Cashier에서 `Laravel\Cashier\Exceptions\IncompletePayment` 예외가 발생해 추가 인증이 필요함을 알려줍니다. 예외 처리 방법은 [결제 실패 처리](#handling-failed-payments) 섹션에서 상세히 안내하고 있습니다.

Stripe 또는 Cashier에서 표시하는 결제 확인 화면은 결제 은행이나 카드 발급사가 요구하는 결제 흐름에 맞춰 조정될 수 있으며, 카드 추가 확인, 소액 임시 결제, 별도의 기기 인증 등 다양한 추가 인증 방식이 포함될 수 있습니다.

<a name="incomplete-and-past-due-state"></a>
#### incomplete 및 past_due 상태

추가 인증이 필요한 결제가 발생하면, 구독은 `stripe_status` 데이터베이스 컬럼 값으로 `incomplete` 또는 `past_due` 상태로 유지됩니다. Cashier는 Stripe로부터 결제 완료 웹훅을 받아 인증이 완료된 즉시 자동으로 해당 구독을 활성화합니다.

`incomplete` 및 `past_due` 상태에 대한 자세한 정보는 [추가 문서](#incomplete-and-past-due-status)를 참고하세요.

<a name="off-session-payment-notifications"></a>
### 오프세션 결제 알림

SCA 규정에 따라, 구독이 활성 상태라 하더라도 고객이 가끔 결제 정보를 재확인해야 할 수 있습니다. 예를 들어 구독 결제가 갱신될 때 이런 일이 발생할 수 있습니다. Cashier에서는 오프세션 결제 확인이 요구될 때 고객에게 알림을 전송할 수 있습니다. Cashier에서는 이 알림 클래스를 `CASHIER_PAYMENT_NOTIFICATION` 환경 변수로 지정하여 활성화할 수 있으며, 기본적으로는 비활성화되어 있습니다. Cashier에서 기본으로 제공하는 알림 클래스를 써도 되고, 필요한 경우 직접 구현할 수도 있습니다.

```
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

오프세션 결제 확인 알림이 정상적으로 전송되려면, [Stripe 웹훅 구성](#handling-stripe-webhooks)이 완료되어 있어야 하고, Stripe 대시보드에서 `invoice.payment_action_required` 웹훅도 활성화되어야 합니다. 또한, `Billable` 모델이 Laravel의 `Illuminate\Notifications\Notifiable` 트레이트도 사용하고 있어야 합니다.

> [!NOTE]
> 추가 인증이 필요한 결제를 고객이 직접 진행할 때도 알림이 전송됩니다. Stripe에서는 결제가 수동(수기)으로 이루어졌는지, 오프세션 결제인지 구분할 수 없습니다. 따라서 고객이 결제 페이지를 이미 확인한 뒤 방문하더라도 단순히 "결제 성공" 메시지 하나만 표시됩니다. 동일한 결제를 두 번 확정해 이중 결제가 발생하는 일은 없으니 안심하셔도 됩니다.

<a name="stripe-sdk"></a>
## Stripe SDK

Cashier의 여러 객체들은 Stripe SDK 객체를 감싸는(wrapper) 형식으로 동작합니다. Stripe 객체를 직접 다뤄야 할 경우, `asStripe` 메서드를 사용해 쉽게 접근할 수 있습니다.

```
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

Stripe 구독 객체를 직접 업데이트하려면 `updateStripeSubscription` 메서드를 사용할 수 있습니다.

```
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

`Cashier` 클래스의 `stripe` 메서드를 호출하면 `Stripe\StripeClient` 클라이언트 인스턴스를 직접 사용할 수 있습니다. 예를 들어 Stripe 계정의 가격(Price) 목록을 가져오고 싶을 때 다음과 같이 활용할 수 있습니다.

```
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a name="testing"></a>
## 테스트

Cashier를 사용하는 애플리케이션을 테스트할 때 Stripe API로 실제 HTTP 요청을 보내는 대신 mocking(가짜 응답 처리)을 할 수도 있지만, 이 경우 Cashier의 동작을 직접 일부분 재구현해야 합니다. 따라서, Cashier 기반 테스트는 실제 Stripe API와 통신하도록 두는 방법을 권장합니다. 이 경우 속도는 느릴 수 있지만, 실제 환경과 동일하게 동작하는지 제대로 검증할 수 있으며, 느린 테스트는 별도의 PHPUnit 테스트 그룹으로 분리해 운영하는 것이 좋습니다.

테스트를 작성할 때 Cashier 자체는 이미 우수한 테스트 스위트를 포함하고 있으니, 애플리케이션 내 구독·결제 흐름에만 집중해 테스트 코드를 작성하면 됩니다.

먼저, `phpunit.xml` 파일에 **테스트용** Stripe 비밀키를 추가하세요.

```
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

이제 Cashier와 상호작용하는 테스트는 실제 Stripe 테스트 환경으로 API 요청을 전송하게 됩니다. 편의를 위해, 미리 Stripe 테스트 계정에 구독이나 가격을 등록해두고 활용하는 것이 좋습니다.

> [!TIP]
> 카드 결제 거절, 결제 실패 등 다양한 시나리오를 테스트하려면, Stripe에서 제공하는 [테스트 카드 번호와 토큰](https://stripe.com/docs/testing)을 자유롭게 활용할 수 있습니다.