# 프리코그니션 (Precognition)

- [소개](#introduction)
- [라이브 유효성 검증](#live-validation)
    - [Vue 사용하기](#using-vue)
    - [Vue와 Inertia 함께 사용하기](#using-vue-and-inertia)
    - [React 사용하기](#using-react)
    - [React와 Inertia 함께 사용하기](#using-react-and-inertia)
    - [Alpine과 Blade 사용하기](#using-alpine)
    - [Axios 설정](#configuring-axios)
- [유효성 검증 규칙 커스터마이즈](#customizing-validation-rules)
- [파일 업로드 처리](#handling-file-uploads)
- [사이드 이펙트 관리](#managing-side-effects)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

Laravel Precognition은 미래의 HTTP 요청 결과를 미리 예측할 수 있게 해주는 기능입니다. Precognition의 주요 활용 사례 중 하나는 프론트엔드 JavaScript 애플리케이션에서 백엔드 유효성 검증 규칙을 중복 작성하지 않고도 "실시간" 유효성 검증(라이브 검증)을 구현할 수 있다는 점입니다. Precognition은 특히 라라벨의 Inertia 기반 [스타터 키트](/docs/12.x/starter-kits)와 잘 어울립니다.

라라벨이 "프리코그니티브(precognitive) 요청"을 받으면, 해당 라우트의 모든 미들웨어를 실행하고, 컨트롤러의 의존성을 해결하며, [폼 리퀘스트](/docs/12.x/validation#form-request-validation) 검증까지 수행합니다. 하지만 실제로 컨트롤러의 메서드는 실행되지 않습니다.

<a name="live-validation"></a>
## 라이브 유효성 검증

<a name="using-vue"></a>
### Vue 사용하기

Laravel Precognition을 사용하면 프런트엔드 Vue 애플리케이션에서 유효성 검증 규칙을 중복 작성하지 않고도 실시간 검증을 사용자에게 제공할 수 있습니다. 이를 예시로, 신규 사용자 생성 폼을 만드는 과정을 살펴보겠습니다.

먼저, 특정 라우트에 Precognition을 활성화하려면, 해당 라우트에 `HandlePrecognitiveRequests` 미들웨어를 추가해야 합니다. 또한, 라우트의 유효성 검증 규칙을 담을 [폼 리퀘스트](/docs/12.x/validation#form-request-validation)를 생성해야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

그 다음, Vue용 Laravel Precognition 프런트엔드 헬퍼를 NPM으로 설치합니다.

```shell
npm install laravel-precognition-vue
```

이제 Laravel Precognition 패키지가 설치되었다면, Precognition의 `useForm` 함수를 이용해 폼 객체를 생성할 수 있습니다. 이때 HTTP 메서드(`post`), 대상 URL(`/users`), 초기 폼 데이터 등을 전달합니다.

라이브 유효성 검증을 활성화하려면, 각 입력 필드의 `change` 이벤트에서 폼의 `validate` 메서드를 호출하며, 입력 필드의 이름을 인수로 넘깁니다.

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

이제 사용자가 폼을 채울 때 Precognition이 해당 라우트의 폼 리퀘스트에 정의된 검증 규칙을 기반으로 실시간 유효성 검증 결과를 제공합니다. 입력 필드가 변경되면, 디바운스되어 "프리코그니티브" 유효성 검증 요청이 라라벨 애플리케이션으로 전송됩니다. 디바운스 타임아웃은 폼의 `setValidationTimeout` 함수를 호출하여 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중일 때는 폼의 `validating` 속성이 `true`가 됩니다.

```html
<div v-if="form.validating">
    Validating...
</div>
```

유효성 검증 요청이나 폼 제출 시 반환되는 검증 오류는 자동으로 폼의 `errors` 객체에 채워집니다.

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

폼에 오류가 있는지 여부는 `hasErrors` 속성으로 확인할 수 있습니다.

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

특정 입력 필드의 유효성 통과 여부는 해당 이름을 `valid` 또는 `invalid` 함수에 전달하여 각각 확인할 수 있습니다.

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

> [!WARNING]
> 입력 필드는 값이 변경되고, 유효성 검증 응답을 받은 후에야 유효(validation 통과) 또는 무효(validation 실패)로 표시됩니다.

폼의 입력 필드 일부만 Precognition으로 검증할 경우, 수동으로 오류를 지워야 할 때가 있습니다. 이 경우 폼의 `forgetError` 함수를 사용할 수 있습니다.

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

위에서 확인한 것과 같이, 입력 필드의 `change` 이벤트에 연결해 개별 입력값을 실시간으로 검증할 수 있습니다. 하지만 사용자가 아직 직접 입력하지 않은 필드들도 검증이 필요한 경우가 있습니다. 예를 들어 "다음 단계"로 이동하기 전에 화면에 보이는 모든 필드를 한 번에 검증하고 싶을 때가 여기에 해당합니다.

이럴 땐 `validate` 메서드를 호출하면서, 검증하고자 하는 필드 이름들을 `only` 옵션에 배열로 전달합니다. 그리고 검증 결과는 `onSuccess`, `onValidationError` 콜백으로 처리할 수 있습니다.

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

폼 제출 이후의 응답에 따라 추가 동작을 수행하려면, 폼의 `submit` 함수가 반환하는 Axios 요청 프라미스를 활용하세요. 이를 통해 응답 결과를 받고, 제출이 성공하면 입력값을 리셋하거나, 실패 시 추가 처리를 쉽게 할 수 있습니다.

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

폼 제출 요청이 진행 중인지 여부는 `processing` 속성으로 확인할 수 있습니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-vue-and-inertia"></a>
### Vue와 Inertia 함께 사용하기

> [!NOTE]
> Vue와 Inertia를 함께 사용하는 라라벨 애플리케이션을 개발할 때 빠르게 시작하고 싶다면, [스타터 키트](/docs/12.x/starter-kits)를 활용하는 것을 추천합니다. 라라벨 스타터 키트는 새 프로젝트에 백엔드 및 프런트엔드 인증 스캐폴딩을 제공합니다.

Vue와 Inertia에서 Precognition을 사용하기 전에, [Vue에서의 Precognition 사용법](#using-vue) 문서를 먼저 참고하는 것이 좋습니다. Inertia 환경에서는 Inertia 전용 Precognition 라이브러리를 NPM으로 설치해야 합니다.

```shell
npm install laravel-precognition-vue-inertia
```

설치가 완료되면, Precognition의 `useForm` 함수는 앞서 소개한 유효성 검증 기능이 추가된 Inertia [form helper](https://inertiajs.com/forms#form-helper)를 반환합니다.

Inertia 환경의 form helper에서는 `submit` 메서드가 더욱 간결해져 HTTP 메서드나 URL을 별도로 지정할 필요가 없습니다. 대신, Inertia의 [visit options](https://inertiajs.com/manual-visits)를 첫 번째 인자이자 유일한 인자로 넘깁니다. 그리고 `submit` 메서드는 앞서 설명한 Vue 예제와 달리 프라미스를 반환하지 않습니다. 대신, [Inertia가 지원하는 이벤트 콜백](https://inertiajs.com/manual-visits#event-callbacks)을 visit options에서 직접 지정할 수 있습니다.

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

Laravel Precognition을 사용하면 프런트엔드 React 애플리케이션에서도 유효성 검증 규칙을 중복 작성하지 않고 실시간 검증을 구현할 수 있습니다. 신규 사용자 생성 폼을 만드는 예시로 이를 설명하겠습니다.

먼저 Precognition을 위한 라우트에는 `HandlePrecognitiveRequests` 미들웨어를 추가하고, 폼의 검증 규칙을 담을 [폼 리퀘스트](/docs/12.x/validation#form-request-validation)를 생성해야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

그 다음, React용 Laravel Precognition 프런트엔드 헬퍼를 NPM으로 설치합니다.

```shell
npm install laravel-precognition-react
```

패키지 설치 후에는 Precognition의 `useForm` 함수를 사용하여 폼 객체를 생성합니다. HTTP 메서드(`post`), 대상 URL(`/users`), 그리고 초기 폼 데이터를 전달하면 됩니다.

라이브 유효성 검증을 활성화하려면 각 입력 필드에서 `change` 및 `blur` 이벤트를 감지해야 합니다. `change` 이벤트 핸들러에서는 `setData` 함수를 이용해 폼 데이터를 갱신하고, `blur` 이벤트 핸들러에서는 `validate` 메서드를 호출하며 입력 필드의 이름을 전달합니다.

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

사용자가 입력값을 채우는 동안, Precognition이 해당 라우트의 폼 리퀘스트에 정의된 검증 규칙을 기반으로 실시간 검증 결과를 반환합니다. 입력값 변경 시 디바운스된 프리코그니티브 검증 요청이 라라벨 애플리케이션으로 전송됩니다. 디바운스 타임아웃은 다음과 같이 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

검증 요청이 진행 중일 때는 `validating` 속성이 `true`가 됩니다.

```jsx
{form.validating && <div>Validating...</div>}
```

검증 오류가 발생하면 `errors` 객체에 자동으로 채워집니다.

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

폼 전체에 오류가 있는지는 `hasErrors` 속성으로 확인합니다.

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

각 입력 필드의 유효 여부는 `valid` 또는 `invalid` 함수로 개별적으로 확인할 수 있습니다.

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

> [!WARNING]
> 입력값이 변경되어 유효성 검증 응답을 받은 후에만, 필드가 유효 또는 무효로 표시됩니다.

Precognition을 통해 일부 입력값만 검증하면서 수동으로 오류를 지우고 싶을 경우, `forgetError` 함수를 이용하세요.

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

앞서 본 예제와 같이, 입력의 `blur` 이벤트에서 각 필드를 검증할 수 있습니다. 하지만 아직 유저가 상호작용하지 않은 입력까지도 검증이 필요할 수 있습니다. 예를 들어, "마법사" 스타일 단계 폼에서 다음 단계로 넘어가기 전 화면에 보이는 모든 입력을 검증해야 할 때가 그렇습니다.

이럴 때는, `validate` 메서드를 호출하면서, 원하는 필드명들을 `only` 옵션에 배열로 전달하세요. 검증 결과는 `onSuccess`, `onValidationError` 콜백으로 처리할 수 있습니다.

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

폼 제출 후 응답에 맞게 추가 동작을 실행하려면, `submit` 함수가 반환하는 Axios 프라미스를 활용하세요. 성공 시 폼 입력값을 리셋하거나 실패 시 별도의 처리를 구현할 수 있습니다.

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

현재 폼 제출 요청이 진행 중인지 여부는 `processing` 속성으로 확인할 수 있습니다.

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-react-and-inertia"></a>
### React와 Inertia 함께 사용하기

> [!NOTE]
> React와 Inertia를 함께 사용하는 라라벨 애플리케이션을 빠르게 개발하고 싶다면, [스타터 키트](/docs/12.x/starter-kits)를 이용해 백엔드와 프론트엔드 인증 스캐폴딩을 바로 적용할 수 있습니다.

React와 Inertia에서 Precognition을 사용하기 전에 [React에서 Precognition 사용하기](#using-react) 문서를 먼저 확인하세요. Inertia 환경에서는 NPM으로 Inertia 전용 Precognition 라이브러리를 별도로 설치해야 합니다.

```shell
npm install laravel-precognition-react-inertia
```

설치 후에는 Precognition의 `useForm` 함수가, 앞에서 설명한 유효성 검증 기능이 결합된 Inertia [form helper](https://inertiajs.com/forms#form-helper)를 반환합니다.

Inertia 환경의 form helper에서는 `submit` 메서드가 한층 더 간편해집니다. HTTP 메서드나 URL을 추가로 지정할 필요 없이, Inertia의 [visit options](https://inertiajs.com/manual-visits)를 첫 번째 인자이자 유일한 인자로 넘깁니다. 또한, React 예제와 달리 `submit` 메서드는 프라미스를 반환하지 않습니다. 대신, visit options에 [이벤트 콜백](https://inertiajs.com/manual-visits#event-callbacks)을 직접 지정하여 처리할 수 있습니다.

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

Laravel Precognition을 사용하면 프런트엔드 Alpine 애플리케이션에서도 유효성 검증 규칙을 중복 작성하지 않고 사용자에게 실시간 검증을 제공할 수 있습니다. 예시로 신규 사용자 생성 폼을 만드는 과정을 살펴보겠습니다.

가장 먼저 Precognition을 적용할 라우트에는 `HandlePrecognitiveRequests` 미들웨어를 추가해야 합니다. 그리고 해당 라우트의 유효성 검증 규칙을 지정할 [폼 리퀘스트](/docs/12.x/validation#form-request-validation)를 생성하세요.

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

다음으로 Alpine용 Laravel Precognition 프런트엔드 헬퍼를 NPM으로 설치합니다.

```shell
npm install laravel-precognition-alpine
```

그리고 `resources/js/app.js` 파일에서 Precognition 플러그인을 Alpine에 등록합니다.

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

Precognition 패키지를 설치 및 등록한 후에는, Precognition의 `$form` "매직"을 활용하여 폼 객체를 만들 수 있습니다. 이때 HTTP 메서드(`post`), 대상 URL(`/users`), 초기 폼 데이터를 전달합니다.

라이브 유효성 검증을 활성화하려면, 각 입력값과 폼 데이터를 바인딩한 뒤, 입력 필드의 `change` 이벤트에서 폼 객체의 `validate` 메서드를 호출하세요.

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

사용자가 폼을 채울 때, Precognition은 해당 라우트 폼 리퀘스트의 검증 규칙에 따라 실시간 검증 결과를 반환합니다. 입력값 변경 시 디바운스된 "프리코그니티브" 유효성 검증 요청이 라라벨 애플리케이션으로 전송됩니다. 디바운스 타임아웃은 아래와 같이 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

검증 요청이 진행 중일 때는 `validating` 속성이 `true`로 설정됩니다.

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

유효성 검증 요청 또는 폼 제출 시 반환된 검증 오류는 자동으로 `errors` 객체에 채워집니다.

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

폼에 오류가 있는지 여부는 `hasErrors` 속성으로 확인합니다.

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

개별 입력의 유효 여부(통과/실패)는 필드명을 각각 `valid`, `invalid` 함수에 넘겨 확인할 수 있습니다.

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> [!WARNING]
> 입력 필드는 값이 변경되고, 유효성 검증 응답을 받은 후에만 유효 또는 무효로 표시됩니다.

지금까지 본 예시처럼 입력의 `change` 이벤트에 연결해서 개별적으로 검증이 가능합니다. 하지만 "마법사" 스타일 단계 폼 등에서는, 아직 사용자 상호작용이 없었던 입력도 포함하여 모든 노출된 필드를 검증해야 하는 경우가 있습니다.

이럴 때는 `validate` 메서드에 `only` 옵션으로 필드명 리스트를 전달해 원하는 필드만 동시에 검증할 수 있습니다. 검증 결과는 `onSuccess`, `onValidationError` 콜백으로 처리할 수 있습니다.

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

폼 제출 요청이 진행 중인지 여부는 `processing` 속성으로 확인할 수 있습니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="repopulating-old-form-data"></a>
#### 기존 폼 데이터 다시 채우기

위 신규 사용자 생성 예시에서는 Precognition을 이용해 실시간 유효성 검증을 제공하지만, 실제 폼 제출 단계에서는 서버로 전통적인 폼 전송을 합니다. 이때 서버에서 반환하는 "old" 입력값과 검증 오류를 다시 폼에 적용해야 합니다.

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

또는 원하는 경우 폼 제출도 XHR로 처리할 수 있으며, 폼의 `submit` 함수(Axios 프라미스 반환)를 사용할 수 있습니다.

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
### Axios 설정

Precognition 유효성 검증 라이브러리는 [Axios](https://github.com/axios/axios) HTTP 클라이언트를 사용해 백엔드로 요청을 전송합니다. 필요하다면 Axios 인스턴스를 자유롭게 커스터마이즈할 수 있습니다. 예를 들어, `laravel-precognition-vue` 라이브러리 사용 시 `resources/js/app.js` 파일에서 모든 요청에 추가 헤더를 부여할 수 있습니다.

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

또한 이미 설정해둔 Axios 인스턴스가 있다면, Precognition이 그 인스턴스를 사용하게 만들 수도 있습니다.

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

> [!WARNING]
> Inertia 전용 Precognition 라이브러리들은 유효성 검증 요청에만 설정된 Axios 인스턴스를 사용합니다. 폼 제출은 항상 Inertia가 자체적으로 처리합니다.

<a name="customizing-validation-rules"></a>
## 유효성 검증 규칙 커스터마이즈

프리코그니티브 요청을 처리할 때, 요청 객체의 `isPrecognitive` 메서드를 활용하면 검증 규칙을 커스터마이즈할 수 있습니다.

예를 들어, 사용자 생성 폼에서 암호 필드의 "유출 여부(uncompromised)" 검사는 실제 폼 최종 제출 시에만 적용하고, 실시간 프리코그니티브 요청에서는 필수 입력 및 8자 이상 길이만 검사하고 싶을 수 있습니다. 이럴 때 `isPrecognitive` 메서드를 사용해서 폼 리퀘스트의 규칙을 조건에 따라 분기할 수 있습니다.

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

기본적으로, 라라벨 Precognition은 프리코그니티브 유효성 검증 요청에서는 파일을 업로드하거나 해당 필드를 검증하지 않습니다. 이는 대용량 파일이 불필요하게 반복 업로드되는 것을 방지하기 위해서입니다.

이 동작에 맞춰, 애플리케이션에서는 [해당 폼 리퀘스트의 유효성 검증 규칙](#customizing-validation-rules)을 커스터마이즈하여, 전체 폼 제출 단계에서만 파일 필드를 필수로 검사하도록 설정하는 것이 좋습니다.

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
            'mimes:jpg,png',
            'dimensions:ratio=3/2',
        ],
        // ...
    ];
}
```

반드시 모든 유효성 검증 요청마다 파일을 포함하고 싶을 때는, 클라이언트 폼 인스턴스에서 `validateFiles` 함수를 호출하세요.

```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## 사이드 이펙트 관리

특정 라우트에 `HandlePrecognitiveRequests` 미들웨어를 추가할 때는, 프리코그니티브 요청에서는 _다른_ 미들웨어의 사이드 이펙트(부수 효과)를 생략해야 할지도 고려해야 합니다.

예를 들어, 사용자가 애플리케이션에 접근할 때마다 "상호작용 횟수"를 하나씩 증가시키는 미들웨어가 있을 수 있습니다. 그러나 프리코그니티브 요청은 실제 상호작용이 아니니 이 횟수에 포함하고 싶지 않을 수 있습니다. 이럴 때는, 카운트를 증가시키기 전 요청의 `isPrecognitive` 메서드를 활용해 분기할 수 있습니다.

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

테스트 환경에서 프리코그니티브 요청을 만들고 싶을 때, 라라벨의 `TestCase`는 `withPrecognition` 헬퍼를 제공합니다. 이 헬퍼는 `Precognition` 요청 헤더를 자동으로 추가해줍니다.

추가로, 프리코그니티브 요청이 성공적(즉, 유효성 검증 오류가 없음)임을 단언하고 싶을 땐, 응답 객체의 `assertSuccessfulPrecognition` 메서드를 사용할 수 있습니다.

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
