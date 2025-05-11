# 기여 가이드 (Contribution Guide)

- [버그 리포트](#bug-reports)
- [지원 요청](#support-questions)
- [코어 개발 논의](#core-development-discussion)
- [어떤 브랜치에?](#which-branch)
- [컴파일된 에셋](#compiled-assets)
- [보안 취약점](#security-vulnerabilities)
- [코딩 스타일](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [행동강령](#code-of-conduct)

<a name="bug-reports"></a>
## 버그 리포트

라라벨은 적극적인 협업을 장려하기 위해 단순한 버그 리포트보다는 풀 리퀘스트(Pull Request) 제출을 강력하게 권장합니다. 새 기능에 대한 모든 테스트가 통과하고, 풀 리퀘스트가 "draft(초안)" 상태가 아닌 "ready for review(검토 요청됨)" 상태여야만 리뷰가 진행됩니다. 오랜 시간 활동이 없는 채로 "draft" 상태로 남아있는 풀 리퀘스트는 며칠 후 자동으로 닫힙니다.

만약 버그 리포트를 작성한다면, 이슈에는 제목과 문제에 대한 명확한 설명이 필요합니다. 관련 정보와 문제를 재현할 수 있는 코드 예시도 최대한 자세히 작성해 주세요. 버그 리포트의 목적은 문제를 쉽게 재현하고 해결 방법을 찾을 수 있도록 돕는 데 있습니다.

버그 리포트는 동일한 문제를 가진 다른 사용자와 협업해 해결책을 찾기 위한 토대를 마련하는 것입니다. 버그 리포트에 즉각적인 반응이 반드시 있을 것이라고 기대하거나, 다른 사람이 바로 해결해 줄 것이라 기대하지 마세요. 버그 리포트 작성은 나 자신과 다른 사용자가 문제를 해결하는 첫걸음이 됩니다. 직접 기여하고 싶다면 [이슈 트래커에 등록된 버그들](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel)을 수정하여 도울 수 있습니다. 모든 라라벨 이슈를 보려면 GitHub에 인증되어 있어야 합니다.

라라벨을 사용하면서 DocBlock, PHPStan, 또는 IDE 경고와 관련된 문제를 발견했다면 GitHub 이슈를 생성하지 말고, 이를 바로잡는 풀 리퀘스트를 제출해 주세요.

라라벨의 소스 코드는 GitHub에서 관리되며, 각 라라벨 프로젝트별로 별도의 저장소가 있습니다.

<div class="content-list" markdown="1">

- [Laravel Application](https://github.com/laravel/laravel)
- [Laravel Art](https://github.com/laravel/art)
- [Laravel Documentation](https://github.com/laravel/docs)
- [Laravel Dusk](https://github.com/laravel/dusk)
- [Laravel Cashier Stripe](https://github.com/laravel/cashier)
- [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [Laravel Echo](https://github.com/laravel/echo)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Folio](https://github.com/laravel/folio)
- [Laravel Framework](https://github.com/laravel/framework)
- [Laravel Homestead](https://github.com/laravel/homestead) ([빌드 스크립트](https://github.com/laravel/settler))
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Livewire Starter Kit](https://github.com/laravel/livewire-starter-kit)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Pennant](https://github.com/laravel/pennant)
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Prompts](https://github.com/laravel/prompts)
- [Laravel React Starter Kit](https://github.com/laravel/react-starter-kit)
- [Laravel Reverb](https://github.com/laravel/reverb)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Vue Starter Kit](https://github.com/laravel/vue-starter-kit)

</div>

<a name="support-questions"></a>
## 지원 요청

라라벨의 GitHub 이슈 트래커는 라라벨에 대한 질문이나 지원을 제공하는 용도가 아닙니다. 대신 아래 채널을 이용해 주세요.

<div class="content-list" markdown="1">

- [GitHub Discussions](https://github.com/laravel/framework/discussions)
- [Laracasts 포럼](https://laracasts.com/discuss)
- [Laravel.io 포럼](https://laravel.io/forum)
- [StackOverflow](https://stackoverflow.com/questions/tagged/laravel)
- [Discord](https://discord.gg/laravel)
- [Larachat](https://larachat.co)
- [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

</div>

<a name="core-development-discussion"></a>
## 코어 개발 논의

라라벨의 프레임워크 저장소 내 [GitHub 토론 게시판](https://github.com/laravel/framework/discussions)을 통해 새로운 기능 제안이나 기존 기능의 개선 의견을 제출할 수 있습니다. 새로운 기능을 제안할 경우, 해당 기능을 완성하는 데 필요한 코드도 일부 직접 구현할 의지가 있는지 확인해 주세요.

버그, 새 기능, 기존 기능 구현 등에 대한 비공식 논의는 [라라벨 Discord 서버](https://discord.gg/laravel) 내 `#internals` 채널에서 이루어지고 있습니다. 라라벨의 메인테이너인 Taylor Otwell은 평일(UTC-06:00, 미국 시카고 기준) 오전 8시부터 오후 5시까지 보통 이 채널에 상주하며, 그 외 시간에도 가끔씩 접속합니다.

<a name="which-branch"></a>
## 어떤 브랜치에?

**모든** 버그 수정은 버그 수정을 지원하는 최신 버전(현재는 `12.x`)으로 보내야 합니다. 버그 수정은 **절대로** `master` 브랜치로 직접 보내면 안 되며, 만약 다가오는 릴리스에만 있는 기능을 수정한다면 예외적으로 보낼 수 있습니다.

**완전히 이전 버전과 호환 가능한** 소규모 기능의 경우, 현재 최신 릴리스 브랜치(현재는 `12.x`)로 보낼 수 있습니다.

**주요 신규 기능**이나 이전 버전과 호환되지 않는 변경이 포함된 기능은 항상 `master` 브랜치(예정 릴리스가 포함된 브랜치)로 보내야 합니다.

<a name="compiled-assets"></a>
## 컴파일된 에셋

`laravel/laravel` 저장소의 `resources/css` 또는 `resources/js` 등 컴파일 결과물에 영향을 줄 수 있는 변경 사항을 제출할 때는, 컴파일된 파일 자체는 커밋하지 마세요. 컴파일된 파일들은 용량이 커서 메인테이너가 현실적으로 코드를 검토하기 어렵기 때문입니다. 이는 악의적인 코드가 라라벨에 삽입되는 것을 방지하기 위한 조치이기도 합니다. 모든 컴파일된 파일은 라라벨 메인테이너가 직접 생성·커밋합니다.

<a name="security-vulnerabilities"></a>
## 보안 취약점

라라벨에서 보안 취약점을 발견했다면, 반드시 Taylor Otwell에게 아래 이메일로 알려주세요: <a href="mailto:taylor@laravel.com">taylor@laravel.com</a>. 모든 보안 취약점은 신속하게 처리됩니다.

<a name="coding-style"></a>
## 코딩 스타일

라라벨은 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) 코딩 표준과 [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) 오토로딩 표준을 따릅니다.

<a name="phpdoc"></a>
### PHPDoc

아래는 라라벨에서 올바른 문서 블록 예시입니다. `@param` 속성은 두 칸 띄운 후 인수 타입, 다시 두 칸 띄운 후 변수명이 옵니다.

```php
/**
 * Register a binding with the container.
 *
 * @param  string|array  $abstract
 * @param  \Closure|string|null  $concrete
 * @param  bool  $shared
 * @return void
 *
 * @throws \Exception
 */
public function bind($abstract, $concrete = null, $shared = false)
{
    // ...
}
```

만약 네이티브 타입 선언 덕분에 `@param`이나 `@return` 속성이 중복되는 경우, 해당 속성은 생략할 수 있습니다.

```php
/**
 * Execute the job.
 */
public function handle(AudioProcessor $processor): void
{
    //
}
```

그러나 네이티브 타입이 제네릭인 경우라면, `@param` 또는 `@return` 속성에 제네릭 타입을 명시해야 합니다.

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

<a name="styleci"></a>
### StyleCI

코드 스타일이 완벽하지 않아도 걱정하지 마세요! [StyleCI](https://styleci.io/)가 풀 리퀘스트가 병합된 후 자동으로 코드 스타일을 교정합니다. 덕분에 우리는 기여의 실제 내용에 집중할 수 있습니다.

<a name="code-of-conduct"></a>
## 행동강령

라라벨 행동강령은 Ruby 행동강령에서 유래하였습니다. 행동강령 위반 사항은 Taylor Otwell(taylor@laravel.com)에게 신고해 주세요.

<div class="content-list" markdown="1">

- 참가자는 반대되는 의견에도 관용적으로 대응해야 합니다.
- 참가자는 자신의 언행에 인신 공격이나 비방적 표현이 없도록 해야 합니다.
- 타인의 언행을 해석할 때는 항상 선의로 생각해야 합니다.
- 합리적으로 괴롭힘(하라스먼트)으로 간주될 수 있는 행위는 용납되지 않습니다.

</div>