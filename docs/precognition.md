# 프리코그니션 (Precognition)

- [소개](#introduction)
- [라이브 유효성 검증](#live-validation)
    - [Vue 사용하기](#using-vue)
    - [Vue와 Inertia 함께 사용하기](#using-vue-and-inertia)
    - [React 사용하기](#using-react)
    - [React와 Inertia 함께 사용하기](#using-react-and-inertia)
    - [Alpine과 Blade 사용하기](#using-alpine)
    - [Axios 설정하기](#configuring-axios)
- [유효성 검증 규칙 커스터마이즈](#customizing-validation-rules)
- [파일 업로드 처리](#handling-file-uploads)
- [사이드 이펙트 관리](#managing-side-effects)
- [테스트 작성](#testing)

<a name="introduction"></a>
## 소개

Laravel Precognition을 사용하면 미래에 발생할 HTTP 요청의 결과를 미리 예측할 수 있습니다. Precognition의 주요 활용 사례 중 하나는, 프론트엔드 자바스크립트 애플리케이션의 유효성 검증 규칙을 백엔드에 중복 작성할 필요 없이 "실시간" 유효성 검증을 제공하는 것입니다. Precognition은 Laravel Inertia 기반의 [스타터 키트](/docs/starter-kits)와 함께 사용할 때 특히 효과적입니다.

Laravel이 "프리코그니티브(precognitive) 요청"을 수신하면, 해당 라우트의 모든 미들웨어를 실행하고 컨트롤러 의존성도 해결합니다. 여기에는 [폼 리퀘스트](/docs/validation#form-request-validation) 기반의 유효성 검증도 포함됩니다. 단, 실제로 라우트의 컨트롤러 메서드는 실행하지 않습니다.

<a name="live-validation"></a>
## 라이브 유효성 검증

<a name="using-vue"></a>
### Vue 사용하기

Laravel Precognition을 이용하면 프론트엔드 Vue 애플리케이션에서 유효성 검증 규칙을 별도로 중복하지 않고도, 사용자에게 실시간 라이브 유효성 검증 경험을 제공할 수 있습니다. 동작 방식을 이해하기 위해, 애플리케이션 내의 사용자 생성 폼을 예시로 살펴보겠습니다.

먼저 Precognition을 라우트에 적용하려면, 해당 라우트 정의에 `HandlePrecognitiveRequests` 미들웨어를 추가해야 합니다. 또한 해당 라우트의 유효성 검증 규칙을 담을 [폼 리퀘스트](/docs/validation#form-request-validation)를 만들어야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

이제 NPM으로 Vue용 Laravel Precognition 프론트엔드 헬퍼를 설치합니다.

```shell
npm install laravel-precognition-vue
```

패키지 설치가 끝나면, Precognition의 `useForm` 함수를 이용해 폼 객체를 생성할 수 있습니다. 이때 HTTP 메서드(`post`), 타겟 URL(`/users`), 그리고 초기 폼 데이터를 전달합니다.

이후, 인풋의 `change` 이벤트마다 폼의 `validate` 메서드를 호출해 실시간 유효성 검증을 활성화할 수 있습니다. 이벤트에 입력 이름을 전달합니다.

```vue
<script setup>
import { useForm } from 'laravel-precognition-vue';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = () => form.submit();
</script>

<template>
    <form @submit.prevent="submit">
        <label for="name">Name</label>
        <input
            id="name"
            v-model="form.name"
            @change="form.validate('name')"
        />
        <div v-if="form.invalid('name')">
            {{ form.errors.name }}
        </div>

        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            v-model="form.email"
            @change="form.validate('email')"
        />
        <div v-if="form.invalid('email')">
            {{ form.errors.email }}
        </div>

        <button :disabled="form.processing">
            Create User
        </button>
    </form>
</template>
```

이제 사용자가 폼을 입력하면, 해당 폼 리퀘스트 내의 유효성 검증 규칙으로 실시간 검증 결과를 받게 됩니다. 인풋값이 변경될 때마다, Laravel 애플리케이션으로 디바운스된(일시적으로 모아서 보내는) "precognitive" 요청이 전송됩니다. 디바운스 지연 시간은 `setValidationTimeout` 함수를 통해 조정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중이면 폼 객체의 `validating` 속성이 `true`가 됩니다.

```html
<div v-if="form.validating">
    Validating...
</div>
```

검증 요청 중 에러가 발생하거나 폼 전송 시 에러가 발생하면, 자동으로 `form.errors` 객체가 채워집니다.

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

폼에 에러가 존재하는지 확인하려면 `hasErrors` 속성을 사용할 수 있습니다.

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

특정 인풋이 검증을 통과했는지 또는 실패했는지는 각각 `valid`와 `invalid` 함수에 인풋 이름을 전달해서 확인합니다.

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

> [!WARNING]
> 폼 인풋은 값이 변경되어 유효성 검증 응답을 받은 경우에만 정상 또는 비정상 상태로 표시됩니다.

Precognition을 통해 일부 인풋만 검증하는 경우, 수동으로 에러를 초기화하고 싶을 때가 있습니다. 이럴 때는 `forgetError` 함수를 활용할 수 있습니다.

```html
<input
    id="avatar"
    type="file"
    @change="(e) => {
        form.avatar = e.target.files[0]

        form.forgetError('avatar')
    }"
>
```

위 사례처럼 인풋의 `change` 이벤트에 연결하여 인풋 단위로 실시간 검증할 수 있지만, 사용자가 아직 입력하지 않은 인풋도 미리 검증해야 할 때가 있습니다. 이는 "다단계 폼(wizard)"을 구현할 때 유용하며, 사용자의 상호작용 여부와 상관없이 모든 보이는 인풋을 다음 단계로 진행하기 전에 검증하고자 할 때 필요합니다.

이와 같은 경우, `validate` 메서드에서 `only` 옵션으로 검증 대상 필드명을 전달하면 됩니다. 응답 결과는 `onSuccess` 또는 `onValidationError` 콜백을 이용해 처리할 수 있습니다.

```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```

또한, 폼 전송 후 응답 결과에 따라 추가 작업을 실행할 수도 있습니다. `submit` 함수는 Axios 요청 프로미스를 반환하므로, 성공 시 입력값을 리셋하거나, 실패 시 오류 처리를 쉽게 할 수 있습니다.

```js
const submit = () => form.submit()
    .then(response => {
        form.reset();

        alert('User created.');
    })
    .catch(error => {
        alert('An error occurred.');
    });
```

폼 전송 요청이 진행 중인지 여부는 `processing` 속성으로 확인할 수 있습니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-vue-and-inertia"></a>
### Vue와 Inertia 함께 사용하기

> [!NOTE]
> Vue와 Inertia로 Laravel 애플리케이션 개발을 빠르게 시작하고 싶다면, [스타터 키트](/docs/starter-kits)를 활용해보세요. Laravel의 스타터 키트는 백엔드와 프론트엔드 인증까지 기본적으로 구현해줍니다.

Vue와 Inertia에서 Precognition을 활용하기 전에, [Vue용 Precognition 사용법](#using-vue)을 먼저 참고하세요. Inertia와 함께 사용할 경우 Precognition의 Inertia 호환 라이브러리를 NPM으로 설치해야 합니다.

```shell
npm install laravel-precognition-vue-inertia
```

설치가 끝나면, Precognition의 `useForm` 함수는 Inertia의 [form helper](https://inertiajs.com/forms#form-helper) 기능을 포함하여 위에서 설명한 검증 기능들을 사용할 수 있게 확장됩니다.

`submit` 메서드는 HTTP 메서드나 URL을 명시하지 않아도 되고, 대신 Inertia의 [visit 옵션](https://inertiajs.com/manual-visits)을 첫 번째 인자로 넘기면 됩니다. 또한 `submit` 메서드는 Vue 예제와 달리 Promise를 반환하지 않으므로, Inertia에서 제공하는 [이벤트 콜백](https://inertiajs.com/manual-visits#event-callbacks)을 visit 옵션에 지정해 활용할 수 있습니다.

```vue
<script setup>
import { useForm } from 'laravel-precognition-vue-inertia';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = () => form.submit({
    preserveScroll: true,
    onSuccess: () => form.reset(),
});
</script>
```

<a name="using-react"></a>
### React 사용하기

Laravel Precognition을 활용하면 프론트엔드 React 애플리케이션에서도 유효성 검증 규칙을 중복하지 않고, 사용자에게 실시간 검증 경험을 제공할 수 있습니다. 동작 방식을 이해하기 위해, 신규 사용자 생성 폼 예제를 살펴보겠습니다.

먼저 Precognition을 라우트에 적용하려면, `HandlePrecognitiveRequests` 미들웨어를 라우트에 추가해야 하며, 해당 라우트의 유효성 검증 규칙을 위한 [폼 리퀘스트](/docs/validation#form-request-validation)를 생성해야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

그런 다음, React용 Laravel Precognition 프론트엔드 헬퍼를 NPM으로 설치합니다.

```shell
npm install laravel-precognition-react
```

이제 Precognition 패키지를 설치한 후, `useForm` 함수를 사용해 폼 객체를 만들 수 있습니다. HTTP 메서드(`post`), URL(`/users`), 초기 폼 데이터를 전달하면 됩니다.

라이브 유효성 검증을 구현하려면 각 인풋의 `change` 및 `blur` 이벤트를 감지해야 합니다. `change` 이벤트에서는 `setData` 함수를 사용해 값을 갱신하고, `blur` 이벤트에서는 `validate` 메서드로 해당 인풋의 검증을 실행합니다.

```jsx
import { useForm } from 'laravel-precognition-react';

export default function Form() {
    const form = useForm('post', '/users', {
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.submit();
    };

    return (
        <form onSubmit={submit}>
            <label htmlFor="name">Name</label>
            <input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                onBlur={() => form.validate('name')}
            />
            {form.invalid('name') && <div>{form.errors.name}</div>}

            <label htmlFor="email">Email</label>
            <input
                id="email"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
                onBlur={() => form.validate('email')}
            />
            {form.invalid('email') && <div>{form.errors.email}</div>}

            <button disabled={form.processing}>
                Create User
            </button>
        </form>
    );
};
```

이제 사용자가 폼을 입력하면, 포럼 리퀘스트에 정의된 유효성 검증 규칙에 따라 실시간 검증 결과가 표시됩니다. 인풋값이 변경될 때마다, Laravel 애플리케이션으로 디바운스된 precognitive 요청이 전송됩니다. 디바운스 대기 시간은 `setValidationTimeout` 함수를 이용해 조정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중일 때는 폼의 `validating` 속성이 `true`가 됩니다.

```jsx
{form.validating && <div>Validating...</div>}
```

검증 요청이나 폼 전송 때 발생한 에러는 자동으로 `errors` 객체에 포함됩니다.

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

폼에 에러가 있는지 확인하려면 `hasErrors` 속성을 사용하면 됩니다.

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

인풋이 검증을 통과하거나 실패했는지는 `valid`와 `invalid` 함수에 이름을 넣어서 확인합니다.

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

> [!WARNING]
> 폼 인풋은 값이 변경되고, 검증 응답을 받은 뒤에만 정상 또는 비정상으로 표시됩니다.

Precognition을 통해 일부 인풋만 검증하는 경우, 필요에 따라 수동으로 에러를 지울 수 있습니다. 이럴 때는 `forgetError` 함수를 사용할 수 있습니다.

```jsx
<input
    id="avatar"
    type="file"
    onChange={(e) => {
        form.setData('avatar', e.target.value);

        form.forgetError('avatar');
    }}
>
```

위처럼 인풋의 `blur` 이벤트에 연결해 개별 인풋 검증도 할 수 있지만, 사용자가 아직 건드리지 않은 인풋 모두를 검증해야 할 때도 있습니다. 이런 상황은 여러 단계로 되어 있는 "마법사(wizard)" 형태 폼의 각 단계 진입 전 흔히 필요합니다.

이럴 때는 `validate` 메서드에서 `only` 옵션으로 원하는 필드명을 배열로 전달하고, 결과는 `onSuccess` 및 `onValidationError` 콜백으로 처리하세요.

```jsx
<button
    type="button"
    onClick={() => form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })}
>Next Step</button>
```

폼 전송 후 응답을 처리하는 로직도 추가할 수 있습니다. `submit` 함수는 Axios 프로미스를 반환하여, 성공 시 입력값을 리셋하거나 실패 시 오류 처리를 할 수 있게 해줍니다.

```js
const submit = (e) => {
    e.preventDefault();

    form.submit()
        .then(response => {
            form.reset();

            alert('User created.');
        })
        .catch(error => {
            alert('An error occurred.');
        });
};
```

폼 전송 요청이 진행 중인지 여부는 `processing` 속성을 확인하면 됩니다.

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-react-and-inertia"></a>
### React와 Inertia 함께 사용하기

> [!NOTE]
> React와 Inertia로 Laravel 애플리케이션을 빠르게 개발하고 싶다면, [스타터 키트](/docs/starter-kits)를 사용해보세요. 백엔드와 프론트엔드 인증이 기본으로 구현되어 있습니다.

React와 Inertia에서 Precognition을 활용하기 전에, [React에서 Precognition 사용법](#using-react)을 먼저 참고하세요. Inertia와 함께 사용하려면 Inertia 전용 Precognition 라이브러리를 NPM으로 설치해야 합니다.

```shell
npm install laravel-precognition-react-inertia
```

설치가 끝나면, Precognition의 `useForm` 함수는 Inertia의 [form helper](https://inertiajs.com/forms#form-helper) 기능을 포함하여 위에서 설명한 검증 기능을 사용할 수 있게 확장됩니다.

`submit` 메서드는 HTTP 메서드와 URL을 명시할 필요 없이, Inertia의 [visit 옵션](https://inertiajs.com/manual-visits)만 첫 번째 인자로 넘기면 됩니다. 또한, `submit`은 React 예제와 달리 Promise를 반환하지 않으므로, Inertia에서 제공하는 [이벤트 콜백](https://inertiajs.com/manual-visits#event-callbacks)을 옵션에 지정해 활용할 수 있습니다.

```js
import { useForm } from 'laravel-precognition-react-inertia';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = (e) => {
    e.preventDefault();

    form.submit({
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });
};
```

<a name="using-alpine"></a>
### Alpine과 Blade 사용하기

Laravel Precognition을 활용하면 프론트엔드 Alpine 애플리케이션에서도 유효성 검증 규칙 중복 없이, 실시간 검증 경험을 제공할 수 있습니다. 동작 방식을 예시로, 사용자 생성 폼을 직접 구현해 보겠습니다.

먼저 Precognition을 라우트에 적용하려면, 해당 라우트에 `HandlePrecognitiveRequests` 미들웨어를 추가하고, [폼 리퀘스트](/docs/validation#form-request-validation)를 만들어서 유효성 검증 규칙을 정의해야 합니다.

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

이어 NPM으로 Alpine용 Laravel Precognition 프론트엔드 헬퍼를 설치합니다.

```shell
npm install laravel-precognition-alpine
```

그 다음, `resources/js/app.js` 파일에서 Precognition 플러그인을 Alpine에 등록합니다.

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

패키지 설치 및 등록이 끝나면, Precognition의 `$form` 매직 기능을 사용하는 폼 객체를 생성할 수 있습니다. HTTP 메서드(`post`), URL(`/users`), 초기 폼 데이터를 전달하면 됩니다.

라이브 유효성 검증 활성화를 위해, 폼 데이터를 인풋에 바인딩한 뒤 각 인풋의 `change` 이벤트마다 `validate` 메서드를 호출합니다.

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '',
        email: '',
    }),
}">
    @csrf
    <label for="name">Name</label>
    <input
        id="name"
        name="name"
        x-model="form.name"
        @change="form.validate('name')"
    />
    <template x-if="form.invalid('name')">
        <div x-text="form.errors.name"></div>
    </template>

    <label for="email">Email</label>
    <input
        id="email"
        name="email"
        x-model="form.email"
        @change="form.validate('email')"
    />
    <template x-if="form.invalid('email')">
        <div x-text="form.errors.email"></div>
    </template>

    <button :disabled="form.processing">
        Create User
    </button>
</form>
```

이제 사용자가 폼을 입력하면, 폼 리퀘스트에 정의된 유효성 검증 규칙에 따라 실시간 결과가 표시됩니다. 입력값이 변할 때마다 Laravel에 디바운스된 precognitive 요청이 전송됩니다. 디바운스 대기 시간은 `setValidationTimeout` 함수로 조절할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중일 때는 폼의 `validating` 속성이 `true`입니다.

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

검증 중 오류가 발생하거나 폼 전송 시 오류가 발생하면, `errors` 객체가 자동으로 채워집니다.

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

폼에 에러가 존재하는지 확인하려면 `hasErrors` 속성을 이용하면 됩니다.

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

개별 인풋이 검증을 통과하거나 실패했는지는 각각 `valid`, `invalid` 함수에 인풋명을 넣어 확인할 수 있습니다.

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> [!WARNING]
> 폼 인풋은 값이 변경되고 검증 응답을 받은 경우에만 검증 상태로 표시됩니다.

앞서 본 것처럼, 인풋의 `change` 이벤트에 연결해 실시간 검증을 할 수 있지만, 사용자가 아직 건드리지 않은 필드들도 검증이 필요할 수 있습니다. 이는 여러 단계를 거치는 "마법사" 형태의 폼에서 각 단계로 진행 전 모든 보이는 인풋을 검증할 때 흔히 요구됩니다.

이 경우 `validate` 메서드에서 검증할 필드명을 `only` 옵션으로 배열에 담아 전달하면 되고, 결과는 `onSuccess` 또는 `onValidationError` 콜백으로 처리합니다.

```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```

폼 전송 요청이 진행 중인지 확인하려면 `processing` 속성을 사용하면 됩니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="repopulating-old-form-data"></a>
#### 이전 폼 데이터 다시 채우기

앞서 소개한 사용자 생성 예제에서는 Precognition으로 라이브 검증만 수행하고, 폼 제출 자체는 기존 서버 렌더링 방식으로 처리하고 있습니다. 따라서 서버가 반환한 "이전(old)" 입력값과 유효성 에러 메시지로 폼을 채워야 할 수 있습니다.

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

반대로 폼을 XHR로 전송하고 싶다면, 폼 객체의 `submit` 함수를 사용할 수 있습니다. 이 함수는 Axios 요청 프로미스를 반환합니다.

```html
<form
    x-data="{
        form: $form('post', '/register', {
            name: '',
            email: '',
        }),
        submit() {
            this.form.submit()
                .then(response => {
                    this.form.reset();

                    alert('User created.')
                })
                .catch(error => {
                    alert('An error occurred.');
                });
        },
    }"
    @submit.prevent="submit"
>
```

<a name="configuring-axios"></a>
### Axios 설정하기

Precognition 유효성 검증 라이브러리는 [Axios](https://github.com/axios/axios) HTTP 클라이언트를 이용해 백엔드로 요청을 전송합니다. 필요하다면 Axios 인스턴스 설정을 수정할 수 있습니다. 예를 들어, `laravel-precognition-vue` 라이브러리의 경우, `resources/js/app.js` 파일에서 요청마다 헤더를 추가할 수 있습니다.

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

이미 별도로 Axios 인스턴스를 만들어서 사용 중이라면, Precognition에 해당 인스턴스를 사용하도록 지정할 수도 있습니다.

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

> [!WARNING]
> Inertia용 Precognition 라이브러리는 유효성 검증 요청에 대해서만 지정한 Axios 인스턴스를 사용합니다. 실제 폼 전송 요청은 항상 Inertia가 처리합니다.

<a name="customizing-validation-rules"></a>
## 유효성 검증 규칙 커스터마이즈

프리코그니티브 요청이 들어왔을 때 실행되는 유효성 검증 규칙은 `isPrecognitive` 메서드를 활용해 커스터마이즈할 수 있습니다.

예를 들어, 사용자 생성 폼에서 password 필드를 마지막 제출 단계에서만 "유출 여부"까지 검증하고, precognitive 유효성 검증에서는 단순히 필수/최소 길이만 체크하도록 만들 수 있습니다. 이를 위해 폼 리퀘스트에서 `isPrecognitive` 메서드를 활용해 아래와 같이 구현할 수 있습니다.

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * 이 요청에 적용할 유효성 검증 규칙을 반환합니다.
     *
     * @return array
     */
    protected function rules()
    {
        return [
            'password' => [
                'required',
                $this->isPrecognitive()
                    ? Password::min(8)
                    : Password::min(8)->uncompromised(),
            ],
            // ...
        ];
    }
}
```

<a name="handling-file-uploads"></a>
## 파일 업로드 처리

기본적으로, Laravel Precognition은 프리코그니티브(precognitive) 유효성 검증 요청 시 파일 업로드나 해당 필드의 검증을 수행하지 않습니다. 이는 대용량 파일이 여러 번 업로드되는 것을 방지하기 위한 설계입니다.

이러한 특성 때문에, 실제 폼 제출이 아닐 때에는 파일 필드를 필수로 검증하지 않도록 [폼 리퀘스트의 유효성 검증 규칙](#customizing-validation-rules)을 조정해야 합니다.

```php
/**
 * 이 요청에 적용할 유효성 검증 규칙을 반환합니다.
 *
 * @return array
 */
protected function rules()
{
    return [
        'avatar' => [
            ...$this->isPrecognitive() ? [] : ['required'],
            'image',
            'mimes:jpg,png',
            'dimensions:ratio=3/2',
        ],
        // ...
    ];
}
```

반대로 모든 유효성 검증 요청마다 파일도 반드시 포함하고 싶다면, 클라이언트 쪽 폼 인스턴스에서 `validateFiles` 함수를 호출하면 됩니다.

```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## 사이드 이펙트 관리

`HandlePrecognitiveRequests` 미들웨어를 라우트에 추가할 때, 프리코그니티브 요청 시 생략해야 할 "사이드 이펙트"를 일으키는 _다른_ 미들웨어가 있는지 고려해야 합니다.

예를 들어, 사용자가 애플리케이션과 상호작용할 때마다 "interaction" 카운터를 증가시키는 미들웨어가 있다고 가정해봅시다. Precognition 요청이 이런 상호작용으로 집계되길 원하지 않을 수 있습니다. 이럴 때는 아래처럼, 카운터 증가 전에 요청의 `isPrecognitive` 메서드를 확인하세요.

```php
<?php

namespace App\Http\Middleware;

use App\Facades\Interaction;
use Closure;
use Illuminate\Http\Request;

class InteractionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->isPrecognitive()) {
            Interaction::incrementFor($request->user());
        }

        return $next($request);
    }
}
```

<a name="testing"></a>
## 테스트 작성

테스트에서 프리코그니티브 요청을 보내고 싶다면, Laravel의 `TestCase` 클래스에 내장된 `withPrecognition` 헬퍼를 사용할 수 있습니다. 이 헬퍼는 `Precognition` 요청 헤더를 자동으로 추가합니다.

또한, 프리코그니티브 요청이 성공(즉, 유효성 검증 에러가 없는 상태)했음을 확인하고 싶다면, 응답 객체의 `assertSuccessfulPrecognition` 메서드를 활용할 수 있습니다.

```php tab=Pest
it('validates registration form with precognition', function () {
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();

    expect(User::count())->toBe(0);
});
```

```php tab=PHPUnit
public function test_it_validates_registration_form_with_precognition()
{
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();
    $this->assertSame(0, User::count());
}
```
