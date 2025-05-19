# 기여 가이드 (Contribution Guide)

- [버그 리포트](#bug-reports)
- [지원 질문](#support-questions)
- [코어 개발 논의](#core-development-discussion)
- [어느 브랜치에?](#which-branch)
- [컴파일된 에셋](#compiled-assets)
- [보안 취약점](#security-vulnerabilities)
- [코딩 스타일](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [행동 강령](#code-of-conduct)

<a name="bug-reports"></a>
## 버그 리포트

라라벨은 활발한 협업을 촉진하기 위해 단순한 버그 리포트보다는 풀 리퀘스트(Pull Request)를 적극적으로 권장합니다. 풀 리퀘스트는 "검토 준비 완료(ready for review)" 상태(즉, "초안(draft)" 상태가 아님)로 표시되고, 새로운 기능의 모든 테스트가 정상적으로 통과한 경우에만 리뷰가 진행됩니다. 오랜 시간 동안 "초안" 상태로 비활성화되어 있는 풀 리퀘스트는 며칠 후 자동으로 닫히게 됩니다.

하지만 버그 리포트를 등록하는 경우, 반드시 제목과 문제에 대한 명확한 설명을 포함해야 합니다. 또한 가능한 한 많은 관련 정보와 문제를 재현할 수 있는 코드 예시도 함께 제공해 주세요. 버그 리포트의 핵심 목적은 여러분 자신과 다른 사람들이 해당 버그를 쉽게 재현하고, 해결 방안을 찾을 수 있도록 돕는 데 있습니다.

버그 리포트는 동일한 문제를 겪는 다른 사람들이 문제를 함께 해결해 나가는 데 도움이 되기를 바라는 취지로 작성됩니다. 단순히 버그 리포트를 남긴다고 해서 자동으로 누군가가 바로 문제를 해결해주거나, 바로 활동이 일어나리라 기대하지 마세요. 버그 리포트는 문제 해결의 출발점 역할을 합니다. 여러분도 적극적으로 참여하고 싶다면, [라라벨 이슈 트래커에 등록된 버그](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel) 중 하나를 직접 고쳐 보는 것도 좋은 방법입니다. 단, 라라벨의 전체 이슈를 확인하려면 GitHub 인증이 필요합니다.

라라벨을 사용하다가 DocBlock, PHPStan, IDE 경고 등 잘못된 부분을 발견했다면, GitHub 이슈를 새로 생성하지 마시고, 직접 해당 문제를 수정하여 풀 리퀘스트를 보내주세요.

라라벨 소스 코드는 GitHub에서 관리되며, 각 라라벨 프로젝트마다 별도의 저장소(repositories)가 있습니다.

<div class="content-list" markdown="1">

- [라라벨 애플리케이션](https://github.com/laravel/laravel)
- [라라벨 Art](https://github.com/laravel/art)
- [라라벨 문서](https://github.com/laravel/docs)
- [라라벨 Dusk](https://github.com/laravel/dusk)
- [라라벨 Cashier Stripe](https://github.com/laravel/cashier)
- [라라벨 Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [라라벨 Echo](https://github.com/laravel/echo)
- [라라벨 Envoy](https://github.com/laravel/envoy)
- [라라벨 Folio](https://github.com/laravel/folio)
- [라라벨 프레임워크](https://github.com/laravel/framework)
- [라라벨 Homestead](https://github.com/laravel/homestead) ([빌드 스크립트](https://github.com/laravel/settler))
- [라라벨 Horizon](https://github.com/laravel/horizon)
- [라라벨 Livewire 스타터 킷](https://github.com/laravel/livewire-starter-kit)
- [라라벨 Passport](https://github.com/laravel/passport)
- [라라벨 Pennant](https://github.com/laravel/pennant)
- [라라벨 Pint](https://github.com/laravel/pint)
- [라라벨 Prompts](https://github.com/laravel/prompts)
- [라라벨 React 스타터 킷](https://github.com/laravel/react-starter-kit)
- [라라벨 Reverb](https://github.com/laravel/reverb)
- [라라벨 Sail](https://github.com/laravel/sail)
- [라라벨 Sanctum](https://github.com/laravel/sanctum)
- [라라벨 Scout](https://github.com/laravel/scout)
- [라라벨 Socialite](https://github.com/laravel/socialite)
- [라라벨 Telescope](https://github.com/laravel/telescope)
- [라라벨 Vue 스타터 킷](https://github.com/laravel/vue-starter-kit)

</div>

<a name="support-questions"></a>
## 지원 질문

라라벨의 GitHub 이슈 트래커는 라라벨 관련 도움이나 지원을 요청하는 용도가 아닙니다. 다음의 공식 채널 중 한 곳을 이용해 주세요.

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

라라벨의 새로운 기능 제안이나 기존 동작의 개선에 대한 아이디어가 있다면, 라라벨 프레임워크 저장소의 [GitHub 토론 게시판](https://github.com/laravel/framework/discussions)에 자유롭게 제안해 주세요. 새로운 기능을 제안하는 경우, 해당 기능을 완성하는 데 필요한 코드의 일부라도 직접 구현할 의지가 있음을 보여주면 좋습니다.

버그, 새로운 기능, 기존 기능의 구현과 관련한 비공식 논의는 [라라벨 Discord 서버](https://discord.gg/laravel)의 `#internals` 채널에서 비정기적으로 이루어집니다. 라라벨의 메인테이너인 Taylor Otwell은 평일(UTC-06:00 또는 America/Chicago 기준) 오전 8시부터 오후 5시 사이에는 주로 채널에 상주하고, 그 외 시간에도 간헐적으로 참여합니다.

<a name="which-branch"></a>
## 어느 브랜치에?

**모든** 버그 수정은 현재 버그 수정이 지원되는 최신 버전(현재는 `12.x`) 브랜치로 보내야 합니다. 버그를 수정하는 코드는, 오직 다가오는 릴리즈에만 존재하는 기능을 고치는 예외적인 경우를 제외하고는 절대로 `master` 브랜치로 보내면 안 됩니다.

**완전히 하위 호환성**이 보장되는 **마이너** 기능 추가의 경우, 현재 최신 안정(stable) 브랜치(현재 `12.x`)로 보내면 됩니다.

**주요** 신규 기능 또는 하위 호환성에 영향을 주는 기능(브레이킹 체인지 포함)은 반드시 다가오는 릴리즈를 위한 `master` 브랜치로 보내야 합니다.

<a name="compiled-assets"></a>
## 컴파일된 에셋

`laravel/laravel` 저장소의 `resources/css` 또는 `resources/js` 폴더처럼, 컴파일된 파일에 영향을 줄 변경사항을 제출하는 경우, 컴파일된 파일 자체는 커밋하지 마세요. 해당 파일들은 용량이 커서 유지관리자가 현실적으로 검토할 수 없습니다. 이를 악용하여 악의적인 코드를 삽입할 수도 있으므로, 이러한 상황을 사전에 막기 위해 컴파일된 파일은 라라벨 유지관리자에 의해 직접 생성‧커밋됩니다.

<a name="security-vulnerabilities"></a>
## 보안 취약점

라라벨 내에서 보안 취약점을 발견한 경우, Taylor Otwell에게 <a href="mailto:taylor@laravel.com">taylor@laravel.com</a> 으로 이메일을 보내주세요. 모든 보안 취약점은 신속하게 처리됩니다.

<a name="coding-style"></a>
## 코딩 스타일

라라벨은 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) 코딩 표준과 [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) 오토로딩 표준을 따릅니다.

<a name="phpdoc"></a>
### PHPDoc

아래는 라라벨에서 올바르게 작성된 문서화 블록(PHPDoc) 예시입니다. `@param` 속성 뒤에는 두 칸의 공백, 인수 타입, 두 칸의 공백, 그리고 변수명이 순서대로 따라야 합니다.

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

만약 `@param` 또는 `@return` 속성이 이미 네이티브 타입 선언으로 충분히 드러난 경우, 해당 속성은 생략할 수 있습니다.

```php
/**
 * Execute the job.
 */
public function handle(AudioProcessor $processor): void
{
    //
}
```

다만, 네이티브 타입이 generic인 경우에는 `@param` 또는 `@return` 속성을 통해 제네릭 타입까지 명시해 주세요.

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

코드 스타일이 완벽하지 않더라도 걱정하지 마세요! [StyleCI](https://styleci.io/)가 풀 리퀘스트가 병합된 후 자동으로 스타일을 맞춰줍니다. 덕분에 우리는 코드 스타일 대신 실제 기여 내용에 집중할 수 있습니다.

<a name="code-of-conduct"></a>
## 행동 강령

라라벨의 행동 강령은 루비 커뮤니티의 행동 강령을 참고하여 만들어졌습니다. 행동 강령 위반 사항은 Taylor Otwell (taylor@laravel.com)에게 신고할 수 있습니다.

<div class="content-list" markdown="1">

- 참가자는 서로 다른 견해에 관용을 가져야 합니다.
- 참가자는 언어 및 행동에서 상대방을 공격하거나 비방하는 표현을 사용해서는 안 됩니다.
- 타인의 말과 행동을 해석할 때, 항상 선의로 받아들여야 합니다.
- 일반적으로 괴롭힘으로 간주될 수 있는 행동은 용인되지 않습니다.

</div>
