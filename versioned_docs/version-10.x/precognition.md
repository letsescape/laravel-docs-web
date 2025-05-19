# 프리코그니션 (Precognition)

- [소개](#introduction)
- [라이브 유효성 검증](#live-validation)
    - [Vue 사용하기](#using-vue)
    - [Vue와 Inertia 사용하기](#using-vue-and-inertia)
    - [React 사용하기](#using-react)
    - [React와 Inertia 사용하기](#using-react-and-inertia)
    - [Alpine과 Blade 사용하기](#using-alpine)
    - [Axios 설정하기](#configuring-axios)
- [유효성 검증 규칙 커스터마이즈](#customizing-validation-rules)
- [파일 업로드 처리](#handling-file-uploads)
- [사이드 이펙트 관리](#managing-side-effects)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

Laravel Precognition을 사용하면 앞으로 발생할 HTTP 요청의 결과를 미리 예측할 수 있습니다. Precognition의 주요 사용 사례 중 하나는 프론트엔드 JavaScript 애플리케이션에서 백엔드의 유효성 검증 규칙을 중복하지 않고도 "실시간" 유효성 검증 기능을 제공할 수 있다는 점입니다. Precognition은 특히 Laravel의 Inertia 기반 [스타터 킷](/docs/10.x/starter-kits)과 함께 사용할 때 매우 잘 어울립니다.

Laravel이 "프리코그니션 요청(precognitive request)"을 받으면 해당 라우트의 모든 미들웨어를 실행하고, 라우트의 컨트롤러 의존성도 모두 resolve하며, [폼 요청](/docs/10.x/validation#form-request-validation) 유효성 검증도 수행합니다. 단, 실제로 라우트의 컨트롤러 메서드를 실행하지는 않습니다.

<a name="live-validation"></a>
## 라이브 유효성 검증

<a name="using-vue"></a>
### Vue 사용하기

Laravel Precognition을 이용하면 프론트엔드 Vue 애플리케이션에서 유효성 검증 규칙을 중복 없이 사용자에게 실시간 검증을 제공할 수 있습니다. 어떻게 동작하는지 알아보기 위해 새로운 사용자를 생성하는 폼을 예제로 살펴보겠습니다.

먼저, Precognition을 라우트에 적용하려면 `HandlePrecognitiveRequests` 미들웨어를 라우트 정의에 추가해야 합니다. 또한 라우트의 유효성 검증 규칙을 담을 [폼 요청 클래스](/docs/10.x/validation#form-request-validation)도 만들어야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

다음으로, Vue용 Laravel Precognition 프론트엔드 헬퍼를 NPM을 통해 설치합니다.

```shell
npm install laravel-precognition-vue
```

패키지 설치가 완료되면, Precognition의 `useForm` 함수를 사용하여 폼 객체를 만들 수 있습니다. 이때 HTTP 메서드(`post`), 대상 URL(`/users`), 초기 폼 데이터를 전달합니다.

이제 라이브 유효성 검증 기능을 활성화하려면 각 입력 필드의 `change` 이벤트에서 폼의 `validate` 메서드를 호출하고, 인풋의 이름을 인수로 넘기면 됩니다.

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

이제 사용자가 폼을 입력하면, Precognition이 라우트의 폼 요청에 정의된 검증 규칙을 바탕으로 실시간 유효성 검증 결과를 제공합니다. 입력 값이 변경될 때마다 debounce된 "프리코그니션" 유효성 검증 요청이 Laravel 애플리케이션으로 전송됩니다. 필요하다면 폼의 `setValidationTimeout` 함수를 사용해 디바운스 타임아웃을 조정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중일 때는 폼의 `validating` 속성이 `true`가 됩니다.

```html
<div v-if="form.validating">
    Validating...
</div>
```

유효성 검증 요청이거나 폼을 제출할 때 발생한 에러들은 자동으로 폼의 `errors` 객체에 채워집니다.

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

폼에 에러가 있는지 여부는 `hasErrors` 속성으로도 확인할 수 있습니다.

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

입력 필드가 유효성 검증을 통과 또는 실패했는지도 각각 `valid`와 `invalid` 함수를 사용해 확인할 수 있습니다.

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

> [!WARNING]
> 폼 입력값이 실제로 변경되고, 그에 대한 유효성 검증 응답을 받은 이후에만 해당 인풋이 유효/무효 상태로 나타납니다.

폼의 일부 입력만 Precognition으로 유효성 검증할 때는 수동으로 에러를 지워야 할 수 있습니다. 이럴 땐 폼의 `forgetError` 함수를 이용하세요.

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

또한, 폼 제출 응답에 따라 추가로 작업을 수행할 때도 쉽게 처리할 수 있습니다. 예를 들어, 폼의 `submit` 함수는 Axios 요청 프로미스를 반환하므로, 응답을 받아 폼 초기화, 사용자 알림, 에러 처리 등 다양한 동작을 추가할 수 있습니다.

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

폼 제출 요청이 진행 중인지 확인하려면 `processing` 속성을 확인하면 됩니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-vue-and-inertia"></a>
### Vue와 Inertia 사용하기

> [!NOTE]
> Vue와 Inertia로 Laravel 애플리케이션을 개발할 계획이라면, [스타터 킷](/docs/10.x/starter-kits)을 활용해 빠르게 시작하는 것을 추천합니다. 라라벨의 스타터 킷은 새로운 애플리케이션에서 백엔드와 프론트엔드 인증 기능을 기본적으로 제공해줍니다.

Vue와 Inertia에서 Precognition을 사용하기 전에, 먼저 [Vue에서 Precognition 사용하기](#using-vue) 내용을 확인하세요. Vue + Inertia 환경에서는 NPM을 통해 Inertia 호환 Precognition 라이브러리를 설치해야 합니다.

```shell
npm install laravel-precognition-vue-inertia
```

설치가 완료되면, Precognition의 `useForm` 함수는 위에서 설명한 검증 기능들이 추가된 Inertia [form helper](https://inertiajs.com/forms#form-helper)를 반환합니다.

폼 헬퍼의 `submit` 메서드는 더 간단하게 설계되어, HTTP 메서드나 URL을 별도로 지정할 필요가 없습니다. 대신 Inertia의 [visit options](https://inertiajs.com/manual-visits)을 첫 번째 인자이자 유일한 인자로 전달합니다. 또한, 위의 Vue 예제와 달리 해당 `submit` 메서드는 Promise를 반환하지 않습니다. 대신, visit options에 Inertia가 지원하는 [이벤트 콜백](https://inertiajs.com/manual-visits#event-callbacks)을 직접 지정하여 사용할 수 있습니다.

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

Laravel Precognition을 활용하면 프론트엔드 React 애플리케이션 내에서도 유효성 검증 규칙을 중복하지 않고 실시간 검증 기능을 제공할 수 있습니다. 새로운 사용자를 생성하는 폼 예제를 통해 동작 방식을 살펴보겠습니다.

먼저, Precognition을 라우트에 적용하려면 `HandlePrecognitiveRequests` 미들웨어를 라우트에 추가해야 하며, 라우트의 유효성 검증 규칙을 담을 [폼 요청 클래스](/docs/10.x/validation#form-request-validation)를 만들어야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

그 다음, React용 Laravel Precognition 프론트엔드 헬퍼를 NPM을 통해 설치합니다.

```shell
npm install laravel-precognition-react
```

패키지 설치가 끝나면, Precognition의 `useForm` 함수로 폼 객체를 만들 수 있습니다. 이때 HTTP 메서드(`post`), 대상 URL(`/users`), 그리고 초기 폼 데이터를 지정합니다.

실시간 유효성 검증을 위해서는 각 입력값의 `change` 이벤트와 `blur` 이벤트를 감지해야 합니다. `change` 핸들러에서는 `setData`로 데이터를 변경하고, `blur`에서는 `validate` 메서드를 호출해 입력값의 유효성 검증을 실행합니다.

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
            <label for="name">Name</label>
            <input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                onBlur={() => form.validate('name')}
            />
            {form.invalid('name') && <div>{form.errors.name}</div>}

            <label for="email">Email</label>
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

이제 사용자가 폼을 입력할 때, Precognition이 라우트 폼 요청의 유효성 검증 규칙을 활용해 실시간 검증 결과를 제공합니다. 입력값이 변경되면 디바운스된 "프리코그니션" 검증 요청이 애플리케이션으로 전송됩니다. 필요에 따라 `setValidationTimeout` 함수로 디바운스 타임아웃을 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중일 때는 `validating` 속성이 `true`로 표시됩니다.

```jsx
{form.validating && <div>Validating...</div>}
```

유효성 검증 도중이나 폼 제출 시 발생한 에러는 자동으로 `errors` 객체에 채워집니다.

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

폼에 에러가 있는지 여부는 `hasErrors` 속성으로 확인할 수 있습니다.

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

각 입력값이 유효/무효한지도 `valid`와 `invalid` 함수로 확인할 수 있습니다.

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

> [!WARNING]
> 입력값이 실제로 바뀌고, 그에 대한 유효성 검증 응답을 받은 이후에만 인풋이 유효/무효 상태로 표시됩니다.

Precognition으로 폼의 일부 입력만 검증하는 경우, 필요하다면 `forgetError` 함수로 수동 에러 제거가 가능합니다.

```jsx
<input
    id="avatar"
    type="file"
    onChange={(e) => 
        form.setData('avatar', e.target.value);

        form.forgetError('avatar');
    }
>
```

또한, 폼 제출 응답에 따라 추가 작업(예: 폼 초기화, 알림 표시 등)도 쉽게 할 수 있습니다. 폼의 `submit` 함수는 Axios 요청 프로미스를 반환하므로, 성공/실패 응답에 따라 각종 로직을 추가할 수 있습니다.

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

폼 제출 요청 진행 여부는 `processing` 속성으로 알 수 있습니다.

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-react-and-inertia"></a>
### React와 Inertia 사용하기

> [!NOTE]
> React와 Inertia로 Laravel 애플리케이션을 개발하고 싶다면, [스타터 킷](/docs/10.x/starter-kits)을 사용해 빠르게 시작하는 것을 권장합니다. 라라벨의 스타터 킷은 프론트엔드/백엔드 인증 스캐폴딩을 기본으로 제공합니다.

Precognition을 React와 Inertia 조합에서 사용하기 전엔 [React에서 Precognition 사용하기](#using-react)를 반드시 참고하세요. React + Inertia 환경에서는 NPM을 통해 Inertia 전용 Precognition 라이브러리를 설치해야 합니다.

```shell
npm install laravel-precognition-react-inertia
```

설치가 완료되면, Precognition의 `useForm` 함수가 위에서 설명한 검증 기능이 추가된 Inertia [form helper](https://inertiajs.com/forms#form-helper)를 반환합니다.

폼 헬퍼의 `submit` 메서드는 HTTP 메서드나 URL을 별도로 지정할 필요 없이, Inertia의 [visit options](https://inertiajs.com/manual-visits)을 첫 번째 인자로 전달합니다. 또한, React 예제와 달리 해당 `submit` 메서드는 Promise를 반환하지 않습니다. 대신, visit options에 Inertia가 지원하는 [이벤트 콜백](https://inertiajs.com/manual-visits#event-callbacks)을 직접 지정해 사용할 수 있습니다.

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

Laravel Precognition을 활용하면 프론트엔드 Alpine 애플리케이션에서도 유효성 검증 규칙을 중복하지 않고 사용자에게 실시간 검증을 제공할 수 있습니다. 새로운 사용자를 생성하는 폼 예시로 기능을 설명합니다.

먼저 Precognition을 라우트에 적용하려면 `HandlePrecognitiveRequests` 미들웨어를 추가해야 하며, 라우트의 유효성 검증 규칙을 포함할 [폼 요청 클래스](/docs/10.x/validation#form-request-validation)도 작성해야 합니다.

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

다음으로 Alpine용 Laravel Precognition 프론트엔드 헬퍼를 NPM으로 설치해야 합니다.

```shell
npm install laravel-precognition-alpine
```

설치가 끝나면, `resources/js/app.js` 파일에서 Precognition 플러그인을 Alpine에 등록합니다.

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

Precognition 패키지까지 정상이면, Precognition의 `$form` "매직"을 사용해 폼 객체를 만들 수 있습니다. 이때 HTTP 메서드(`post`), 대상 URL(`/users`), 초기 폼 데이터를 지정하세요.

실시간 유효성 검증을 위해서는 폼의 데이터를 각 입력값에 바인딩하고, 입력 필드별로 `change` 이벤트를 감지해 폼의 `validate` 메서드를 해당 인풋 이름과 함께 호출해야 합니다.

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

이제 사용자가 폼을 작성하면 라우트의 폼 요청에 정의된 유효성 검증 규칙을 기반으로 Precognition이 실시간 검증 결과를 보여줍니다. 입력값이 변경되면 디바운스된 검증 요청이 Laravel 애플리케이션에 전송됩니다. 필요하다면 `setValidationTimeout` 함수로 디바운스 대기시간을 조정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중에는 폼의 `validating` 속성이 `true`가 됩니다.

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

검증 과정 또는 폼 제출 시 발생한 에러는 폼의 `errors` 객체에 자동으로 채워집니다.

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

폼에 에러가 있는지는 `hasErrors` 속성으로 확인할 수 있습니다.

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

입력값 유효/무효 상태도 각각 `valid`와 `invalid` 함수로 확인할 수 있습니다.

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> [!WARNING]
> 입력값이 실제로 바뀌고, 그에 대한 유효성 검증 응답을 받은 경우에만 해당 인풋이 유효/무효로 표시됩니다.

폼 제출 요청 진행 중 여부는 `processing` 속성으로 알 수 있습니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="repopulating-old-form-data"></a>
#### 이전 폼 데이터 복원하기

위 사용 예시에서는 Precognition으로 라이브 유효성 검증만 사용하고, 실제 폼 제출은 서버에서 처리하고 있습니다. 따라서 서버측 폼 제출 후 반환되는 "이전" 입력값 및 검증 에러가 있다면, 폼에 반영해줄 필요가 있습니다.

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

또는 만약 XHR로 폼을 제출하고 싶다면 폼의 `submit` 함수를 사용하세요. 이 함수는 Axios 요청 프로미스를 반환합니다.

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
                    form.reset();

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

Precognition 유효성 검증 라이브러리는 [Axios](https://github.com/axios/axios) HTTP 클라이언트를 사용해 애플리케이션 백엔드에 요청을 보냅니다. 필요하다면 Axios 인스턴스를 커스터마이즈할 수 있습니다. 예를 들어 `laravel-precognition-vue` 라이브러리를 사용할 때, `resources/js/app.js` 파일에서 요청마다 Authorization 헤더를 추가할 수 있습니다.

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

또는 이미 커스텀 Axios 인스턴스가 있다면 Precognition이 해당 인스턴스를 사용하도록 지정할 수도 있습니다.

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

> [!WARNING]
> Inertia 전용 Precognition 라이브러리는 유효성 검증 요청에만 설정된 Axios 인스턴스를 사용합니다. 폼 제출은 항상 Inertia가 직접 전송합니다.

<a name="customizing-validation-rules"></a>
## 유효성 검증 규칙 커스터마이즈

프리코그니션 요청에서 실행되는 유효성 검증 규칙은 요청의 `isPrecognitive` 메서드를 이용해 커스터마이즈할 수 있습니다.

예를 들어, 사용자 생성 폼에서 실제 최종 제출 때만 비밀번호가 "보안 위협에 노출되지 않았는지" 확인하고 싶을 수 있습니다. 프리코그니션 유효성 검증 요청인 경우엔 비밀번호의 길이 조건만 검사하고, 실제 제출 때만 uncompromised 조건을 추가합니다. `isPrecognitive` 메서드를 활용하면 폼 요청 클래스에서 아래와 같이 규칙을 다르게 지정할 수 있습니다.

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
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

기본적으로, Laravel Precognition은 프리코그니션 유효성 검증 요청 중에는 파일을 업로드하거나 검증하지 않습니다. 이로 인해 불필요하게 대용량 파일이 여러 번 업로드되는 일을 막아줍니다.

이러한 기본 동작을 고려해, [관련 폼 요청의 유효성 검증 규칙을 커스터마이즈](#customizing-validation-rules)하여 실제 폼 최종 제출에서만 해당 필드가 필수임을 지정해야 합니다.

```php
/**
 * Get the validation rules that apply to the request.
 *
 * @return array
 */
protected function rules()
{
    return [
        'avatar' => [
            ...$this->isPrecognitive() ? [] : ['required'],
            'image',
            'mimes:jpg,png'
            'dimensions:ratio=3/2',
        ],
        // ...
    ];
}
```

매번 유효성 검증 요청마다 파일도 함께 전달하고 싶다면, 클라이언트 측 폼 인스턴스에서 `validateFiles` 함수를 호출하면 됩니다.

```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## 사이드 이펙트 관리

라우트에 `HandlePrecognitiveRequests` 미들웨어를 추가할 때, 프리코그니션 요청에서는 *다른* 미들웨어에서 발생할 수 있는 사이드 이펙트를 건너뛰어야 하는지 고려해야 합니다.

예를 들어, 사용자가 애플리케이션과 상호작용(interaction)할 때마다 카운트를 올리는 미들웨어가 있다면, 프리코그니션 요청은 이러한 상호작용으로 간주하지 않는 것이 바람직할 수 있습니다. 이럴 땐 아래처럼 미들웨어 내에서 `isPrecognitive` 호출로 처리할 수 있습니다.

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
## 테스트

테스트에서 프리코그니션 요청을 보내고 싶을 때, Laravel의 `TestCase`는 `withPrecognition` 헬퍼를 제공합니다. 이 헬퍼는 `Precognition` 요청 헤더를 자동으로 추가해줍니다.

또한 프리코그니션 요청이 성공했는지(=유효성 검증 에러가 없는지) 확인하고 싶다면, 응답 객체에 `assertSuccessfulPrecognition` 메서드를 사용할 수 있습니다.

```php
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
