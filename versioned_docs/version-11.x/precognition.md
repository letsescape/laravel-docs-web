# 프리코그니션 (Precognition)

- [소개](#introduction)
- [실시간 유효성 검증](#live-validation)
    - [Vue 사용하기](#using-vue)
    - [Vue와 Inertia 사용하기](#using-vue-and-inertia)
    - [React 사용하기](#using-react)
    - [React와 Inertia 사용하기](#using-react-and-inertia)
    - [Alpine과 Blade 사용하기](#using-alpine)
    - [Axios 설정하기](#configuring-axios)
- [유효성 검증 규칙 커스터마이징](#customizing-validation-rules)
- [파일 업로드 처리](#handling-file-uploads)
- [부수효과 관리](#managing-side-effects)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

Laravel 프리코그니션(Precognition)을 사용하면, 앞으로 발생할 HTTP 요청의 결과를 미리 예측할 수 있습니다. 프리코그니션의 대표적인 활용 사례는, 프런트엔드 자바스크립트 애플리케이션에서 이미 정의한 백엔드 검증 규칙을 중복해서 구현하지 않고도 "실시간" 유효성 검증 기능을 제공하는 것입니다. 프리코그니션은 특히 Laravel의 Inertia 기반 [스타터 키트](/docs/11.x/starter-kits)와 함께 사용할 때 매우 유용합니다.

Laravel이 "프리코그니티브(precognitive) 요청"을 받으면, 해당 라우트의 모든 미들웨어를 실행하고 라우트 컨트롤러의 의존성도 모두 해결합니다(여기에는 [폼 리퀘스트](/docs/11.x/validation#form-request-validation)를 통한 유효성 검증도 포함됩니다). 단, 실제로 라우트의 컨트롤러 메서드 자체는 실행되지 않습니다.

<a name="live-validation"></a>
## 실시간 유효성 검증

<a name="using-vue"></a>
### Vue 사용하기

Laravel 프리코그니션을 활용하면, 프런트엔드 Vue 애플리케이션에서 유효성 검증 규칙을 중복 정의할 필요 없이 사용자에게 실시간 유효성 검증을 제공할 수 있습니다. 예시로 새로운 사용자를 생성하는 폼을 만드는 과정을 살펴보겠습니다.

먼저, 라우트에서 프리코그니션을 활성화하려면, 해당 라우트에 `HandlePrecognitiveRequests` 미들웨어를 추가해야 합니다. 또한, 해당 라우트의 유효성 검증 규칙을 담을 [폼 리퀘스트](/docs/11.x/validation#form-request-validation) 클래스를 생성해야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

다음으로, 프런트엔드에서 Vue용 Laravel 프리코그니션 헬퍼를 NPM을 통해 설치합니다.

```shell
npm install laravel-precognition-vue
```

패키지 설치가 완료되면, 프리코그니션의 `useForm` 함수를 사용하여 폼 오브젝트를 생성할 수 있습니다. 이때 HTTP 메서드(`post`), 요청 URL(`/users`), 초기 폼 데이터 등을 전달합니다.

실시간 유효성 검증을 사용하려면 각 입력값의 `change` 이벤트 발생 시 폼의 `validate` 메서드를 호출하고, 해당 입력의 이름을 인수로 넘겨줍니다.

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

이제 사용자가 폼을 입력하는 동안, 라우트의 폼 리퀘스트에 정의된 유효성 검증 규칙을 기반으로 프리코그니션이 실시간 검증 결과를 제공합니다. 폼 입력값이 변경되면 디바운스된(지연 처리되는) "프리코그니티브" 유효성 검증 요청이 Laravel 애플리케이션에 전송됩니다. 디바운스 타임아웃은 `setValidationTimeout` 함수로 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중일 때는 폼의 `validating` 속성이 `true`가 됩니다.

```html
<div v-if="form.validating">
    Validating...
</div>
```

유효성 검증 또는 폼 제출 시 발생한 모든 검증 오류는 자동으로 폼의 `errors` 객체에 저장됩니다.

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

폼에 검증 오류가 있는지 여부는 폼의 `hasErrors` 속성을 통해 확인할 수 있습니다.

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

특정 입력값의 검증 통과 또는 실패 여부는 각 입력의 이름을 `valid` 또는 `invalid` 함수에 전달해서 확인할 수도 있습니다.

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

> [!WARNING]  
> 입력 필드는 사용자가 값을 변경하고, 그에 대한 검증 응답이 도착한 경우에만 유효(Valid) 혹은 무효(Invalid)로 표시됩니다.

폼의 일부 입력값만 프리코그니션으로 검증하는 경우, 오류를 직접 지워야 할 수도 있습니다. 폼의 `forgetError` 함수를 사용하면 특정 입력값의 오류를 수동으로 제거할 수 있습니다.

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

이처럼 입력값의 `change` 이벤트에 검증 로직을 연결해 개별 입력값을 검증할 수 있지만, 사용자가 아직 한 번도 만지지 않은 다른 입력값도 검증이 필요한 경우가 있습니다. 예를 들어, "다음 단계"로 넘어가기 전 모든 표시된 입력값의 유효성을 확인하고 싶을 때 많이 사용됩니다.

이 경우에는 `validate` 메서드에 `only` 옵션을 사용하여 검증할 필드명을 배열로 넘겨줍니다. 검증 결과에 따라 `onSuccess` 또는 `onValidationError` 콜백도 등록할 수 있습니다.

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

또한 폼 서버 제출 응답에 따른 후속 처리를 할 수도 있습니다. `submit` 함수는 Axios 요청 Promise를 반환하므로, 응답을 받아 폼 입력값 초기화, 성공/실패 처리 등을 할 수 있습니다.

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

폼 전송 요청이 진행 중인지 여부는 폼의 `processing` 속성을 확인하면 됩니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-vue-and-inertia"></a>
### Vue와 Inertia 사용하기

> [!NOTE]  
> Vue와 Inertia로 Laravel 애플리케이션을 개발할 때 시작을 쉽게 하려면, [스타터 키트](/docs/11.x/starter-kits)를 사용하는 것이 좋습니다. 스타터 키트에는 백엔드와 프런트엔드의 인증 관련 기본 구조가 포함되어 있습니다.

Vue와 Inertia에서 프리코그니션을 사용하기 전, [Vue에서의 프리코그니션 사용](#using-vue) 문서도 함께 읽어보시기 바랍니다. Inertia와 함께 Vue를 사용할 때는, Inertia 호환 프리코그니션 라이브러리를 NPM으로 설치해야 합니다.

```shell
npm install laravel-precognition-vue-inertia
```

설치가 완료되면, 프리코그니션의 `useForm` 함수가 Inertia의 [폼 헬퍼](https://inertiajs.com/forms#form-helper)에 위에서 설명한 유효성 검증 기능을 결합하여 반환합니다.

폼 헬퍼의 `submit` 메서드는, HTTP 메서드나 URL을 별도로 지정할 필요 없이 Inertia의 [visit options](https://inertiajs.com/manual-visits)를 첫 번째(그리고 유일한) 인자로 받습니다. 또한 `submit` 메서드는 이전 예시와 달리 Promise를 반환하지 않습니다. 대신, Inertia에서 지원하는 [이벤트 콜백](https://inertiajs.com/manual-visits#event-callbacks)을 visit 옵션에 지정하면 됩니다.

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

Laravel 프리코그니션을 활용하면, 프런트엔드 React 애플리케이션에서도 유효성 검증 규칙을 중복 정의하지 않고 실시간 검증을 제공할 수 있습니다. 새로운 사용자를 생성하는 폼 예시를 통해 동작 방식을 설명하겠습니다.

먼저, 라우트에서 프리코그니션을 사용하려면 `HandlePrecognitiveRequests` 미들웨어를 등록해야 하며, 해당 라우트의 유효성 검증 규칙을 담을 [폼 리퀘스트](/docs/11.x/validation#form-request-validation) 클래스를 생성해야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

이후, React용 Laravel 프리코그니션 프런트엔드 헬퍼를 NPM으로 설치합니다.

```shell
npm install laravel-precognition-react
```

패키지 설치가 완료되면, `useForm` 함수를 사용해 폼 오브젝트를 만들 수 있습니다. HTTP 메서드(`post`), 라우트 경로(`/users`), 초기 폼 데이터를 인수로 넘깁니다.

실시간 유효성 검증을 위해 각 입력의 `change`와 `blur` 이벤트를 모두 감지해야 합니다. `change` 이벤트에서는 `setData` 함수로 폼 데이터를 갱신하고, `blur` 이벤트에서는 `validate` 메서드를 호출하면서 해당 입력의 이름을 전달합니다.

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

이제 사용자가 폼을 입력하는 동안, 라우트 폼 리퀘스트에 정의된 유효성 검증 규칙에 기반해 프리코그니션이 실시간 검증 결과를 제공합니다. 입력값이 변경되면 프리코그니티브 검증 요청이 디바운스되어 전송됩니다. 디바운스 타임아웃은 `setValidationTimeout` 함수로 조정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중일 때는 폼의 `validating` 속성이 `true`가 됩니다.

```jsx
{form.validating && <div>Validating...</div>}
```

유효성 검증이나 폼 제출 시 발생한 모든 검증 오류는 폼의 `errors` 객체에 자동으로 저장됩니다.

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

폼 전체에 검증 오류가 있는지는 `hasErrors` 속성으로 확인할 수 있습니다.

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

특정 입력값의 검증 성공/실패 여부도 `valid`, `invalid` 함수에 입력값 이름을 넘겨 판단합니다.

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

> [!WARNING]  
> 입력 필드는 값이 변경되고, 해당 값에 대한 검증 응답을 받은 뒤에만 유효(Valid)/무효(Invalid)로 보여집니다.

폼의 일부 입력값만 프리코그니션으로 검증할 경우, 오류를 수동으로 지워야 할 때가 있습니다. 이때는 `forgetError` 함수를 사용할 수 있습니다.

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

위와 같이 각 입력의 `blur` 이벤트에서 개별 검증을 할 수 있지만, 사용자가 아직 만지지 않은 입력값이 남아 있는 상태에서, "다음 단계"로 넘어가기에 앞서 모든 표시 입력값을 검증해야 하는 경우가 있습니다.

이럴 때는 `validate` 메서드에 `only` 옵션을 사용해서 검증할 입력값 배열을 지정하고, 결과에 따라 `onSuccess`, `onValidationError` 콜백을 등록하면 됩니다.

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

폼 제출 과정의 응답에 따라 추가 작업을 하고 싶다면, `submit` 함수가 반환하는 Axios의 Promise에서 응답을 받아 활용할 수 있습니다.

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

폼 전송 요청이 진행 중인지 여부는 `processing` 속성으로 확인할 수 있습니다.

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-react-and-inertia"></a>
### React와 Inertia 사용하기

> [!NOTE]  
> React와 Inertia로 Laravel 애플리케이션을 개발할 때 시작을 쉽게 하려면, [스타터 키트](/docs/11.x/starter-kits) 사용을 고려해보세요. 스타터 키트는 백엔드와 프런트엔드 인증 기능의 기본 구조를 제공합니다.

React와 Inertia에서 프리코그니션을 사용하기 전에는, [React에서의 프리코그니션 사용](#using-react) 문서를 먼저 참고하세요. Inertia와 React를 함께 사용한다면, Inertia 호환 프리코그니션 라이브러리를 NPM으로 설치해야 합니다.

```shell
npm install laravel-precognition-react-inertia
```

설치가 완료되면, 프리코그니션의 `useForm` 함수가 Inertia의 [폼 헬퍼](https://inertiajs.com/forms#form-helper)에 앞서 설명한 실시간 유효성 검증 기능을 더해 반환합니다.

폼 헬퍼의 `submit` 메서드는 HTTP 메서드나 URL을 지정할 필요 없이 Inertia의 [visit options](https://inertiajs.com/manual-visits)를 첫 번째(그리고 유일한) 인자로 전달합니다. 또한 `submit` 메서드는 위 React 예시와 달리 Promise를 반환하지 않고, Inertia에서 제공하는 [이벤트 콜백](https://inertiajs.com/manual-visits#event-callbacks)을 visit 옵션에서 지정할 수 있습니다.

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

Laravel 프리코그니션을 이용하면, 프런트엔드 Alpine 애플리케이션에서도 유효성 검증 규칙을 중복 정의하지 않고 실시간 검증 경험을 제공할 수 있습니다. 새로운 사용자를 만드는 폼 예제를 통해 설명하겠습니다.

먼저, 해당 라우트에 `HandlePrecognitiveRequests` 미들웨어를 추가하고, 유효성 검증 규칙을 정의한 [폼 리퀘스트](/docs/11.x/validation#form-request-validation) 클래스를 생성합니다.

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

다음으로, Alpine용 Laravel 프리코그니션 프런트엔드 헬퍼를 NPM으로 설치합니다.

```shell
npm install laravel-precognition-alpine
```

설치 후, `resources/js/app.js` 파일에서 Alpine에 프리코그니션 플러그인을 등록합니다.

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

등록이 완료되면, 프리코그니션의 `$form` "매직"을 사용해 폼 오브젝트를 만들 수 있습니다. HTTP 메서드(`post`), 요청 URL(`/users`), 초기 폼 데이터를 인수로 넘깁니다.

실시간 유효성 검증을 위해 입력값과 폼 데이터를 바인딩하고, 각 입력값의 `change` 이벤트에서 폼의 `validate` 메서드를 호출하고 해당 이름을 전달합니다.

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

사용자가 폼을 채우는 동안, 라우트 폼 리퀘스트의 유효성 검증 규칙을 바탕으로 프리코그니션이 실시간 검증 결과를 보여줍니다. 입력값이 변경되면 프리코그니티브 검증 요청이 디바운스되어 전송되며, 타임아웃은 `setValidationTimeout`으로 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검증 요청이 진행 중인지 여부는 폼의 `validating` 속성이 `true`로 표시됩니다.

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

검증 과정이나 폼 제출 시 발생한 오류는 폼의 `errors` 객체에 자동으로 저장됩니다.

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

폼에 오류가 있는지 여부는 `hasErrors` 속성으로 확인할 수 있습니다.

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

특정 입력의 검증 통과/실패 여부는 이름을 `valid`/`invalid` 함수에 넘겨 사용할 수 있습니다.

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> [!WARNING]  
> 입력 필드는 값이 변경되고, 검증 응답을 받은 뒤에만 유효 또는 무효로 표시됩니다.

개별 입력의 `change` 이벤트에 대해 검증 로직을 연결할 수 있지만, 예를 들어 "다음 단계"로 넘어가기 전 모든 표시된 입력값을 검증해야 할 수도 있습니다.

이때는 `validate` 메서드에 `only` 옵션을 사용해 검증할 필드명 목록을 직접 지정할 수 있으며, 결과에 따라 `onSuccess`, `onValidationError` 콜백도 활용할 수 있습니다.

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
#### 기존 폼 데이터 재입력 처리

위 예시처럼 프리코그니션을 실시간 검증에만 사용하고, 실제 폼 제출은 전통적인 서버 방식으로 처리하는 경우, 서버에서 반환하는 "이전(old)" 입력값과 유효성 검증 오류로 폼을 자동 채워줄 필요가 있습니다.

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

또한, 폼을 XHR로 제출하고 싶다면, 폼의 `submit` 함수를 사용할 수 있습니다. 이 함수는 Axios Promise를 반환합니다.

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

프리코그니션 유효성 검증 라이브러리는 [Axios](https://github.com/axios/axios) HTTP 클라이언트를 사용해 백엔드에 요청을 보냅니다. 애플리케이션에서 필요하다면 Axios 인스턴스를 자유롭게 커스터마이징할 수 있습니다. 예를 들어, `laravel-precognition-vue` 라이브러리를 사용할 때, `resources/js/app.js` 파일에서 각 요청에 추가 헤더를 선언할 수 있습니다.

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

이미 별도의 설정이 적용된 Axios 인스턴스를 보유한 경우, 프리코그니션이 해당 인스턴스를 사용하도록 지정할 수도 있습니다.

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

> [!WARNING]  
> Inertia 전용 프리코그니션 라이브러리는 유효성 검증 요청에만 커스텀 Axios 인스턴스를 사용합니다. 폼 제출 자체는 항상 Inertia가 직접 처리합니다.

<a name="customizing-validation-rules"></a>
## 유효성 검증 규칙 커스터마이징

프리코그니티브 요청이 들어올 때 어떤 유효성 검증 규칙을 사용할지 `isPrecognitive` 메서드를 통해 직접 지정할 수 있습니다.

예를 들어, 사용자 등록 폼에서 최종 제출 시에만 비밀번호가 "유출되지 않은(uncompromised) 비밀번호"인지 검증하고 싶을 수 있습니다. 프리코그니션 요청에서는 단순히 비밀번호가 필수이고 최소 8자 이상인지 검증만 하면 됩니다. `isPrecognitive` 메서드를 사용하여 폼 리퀘스트 내에서 유효성 검증 규칙을 동적으로 조정할 수 있습니다.

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

기본적으로, Laravel 프리코그니션은 프리코그니티브 유효성 검증 요청 시 파일 업로드나 파일 유효성 검증을 수행하지 않습니다. 이로 인해 대용량 파일이 불필요하게 여러 번 업로드되는 일을 방지할 수 있습니다.

이런 동작 특성 때문에, [관련 폼 리퀘스트의 유효성 검증 규칙을 커스터마이징](#customizing-validation-rules) 해서, 실제 폼 전체 제출 시에만 해당 필드가 필수로 요구되도록 처리해야 합니다.

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

모든 유효성 검증 요청에 파일도 포함하고 싶다면, 프런트엔드 폼 인스턴스에서 `validateFiles` 메서드를 호출하면 됩니다.

```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## 부수효과 관리

라우트에 `HandlePrecognitiveRequests` 미들웨어를 추가할 때는, _다른_ 미들웨어에서 프리코그니션 요청에 대해서는 건너뛰어야 하는 부수효과(사이드 이펙트)가 있는지도 꼭 고려해야 합니다.

예를 들어, 미들웨어에서 각 사용자의 "상호작용 횟수"를 집계하는 로직이 있고, 프리코그니션 요청은 상호작용으로 간주하고 싶지 않을 수 있습니다. 이럴 때는, 요청의 `isPrecognitive` 메서드를 사용해 프리코그니션 요청에서는 상호작용 수를 증가시키지 않도록 제어할 수 있습니다.

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

테스트에서 프리코그니션 요청을 보내고 싶다면, Laravel의 `TestCase`에서 제공하는 `withPrecognition` 헬퍼를 사용하면 됩니다. 이 헬퍼는 `Precognition` 헤더를 요청에 자동으로 추가해줍니다.

또한, 프리코그니션 요청이 성공적으로 처리되었는지(즉, 유효성 검증 오류가 없었는지) 검사하려면, 응답 객체의 `assertSuccessfulPrecognition` 메서드를 사용할 수 있습니다.

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