# 기여 가이드 (Contribution Guide)

- [버그 리포트](#bug-reports)
- [지원 문의](#support-questions)
- [코어 개발 논의](#core-development-discussion)
- [어떤 브랜치에 커밋해야 할까요?](#which-branch)
- [컴파일된 에셋](#compiled-assets)
- [보안 취약점](#security-vulnerabilities)
- [코딩 스타일](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [행동 강령](#code-of-conduct)

<a name="bug-reports"></a>
## 버그 리포트

라라벨은 적극적인 협업을 위해, 단순한 버그 리포트 뿐만 아니라 풀 리퀘스트(Pull Request)를 보내는 것을 강력하게 권장합니다. 풀 리퀘스트를 리뷰받으려면 반드시 "ready for review"(검토 준비 완료) 상태여야 하며, "draft"(초안) 상태에서는 리뷰되지 않습니다. 새로운 기능을 추가하는 경우, 모든 테스트가 통과해야만 리뷰가 진행됩니다. 오랜 기간 동안 "draft" 상태로 비활성화되어 있는 풀 리퀘스트는 며칠 후에 닫힐 수 있습니다.

그럼에도 불구하고 버그 리포트를 제출할 때에는, 이슈 제목과 문제에 대한 명확한 설명을 포함해야 합니다. 또한 문제를 재현할 수 있도록 관련 정보와 문제를 보여주는 코드 샘플을 최대한 자세히 첨부하는 것이 좋습니다. 버그 리포트의 목적은 본인은 물론 다른 사람들이 문제를 쉽게 재현하고 해결 방법을 찾을 수 있도록 돕는 것입니다.

버그 리포트는 비슷한 문제를 겪는 다른 사람들이 함께 해결책을 찾을 수 있도록 만들기 위한 것입니다. 버그 리포트를 작성한다고 해서 반드시 즉시 반응이 오거나 바로 누군가가 고쳐주리라 기대하지 마십시오. 버그 리포트는 문제 해결의 첫 걸음을 시작하는 데 도움을 주고자 작성하는 것입니다. 직접 기여하고 싶다면 [이슈 트래커에 등록된 버그들](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel) 중에서 직접 수정에 참여할 수도 있습니다. 라라벨의 모든 이슈를 확인하려면 GitHub에 로그인해야 합니다.

라라벨을 사용하면서 DocBlock, PHPStan, 또는 IDE 경고 등의 잘못된 부분을 발견한다면, 별도의 GitHub 이슈를 만들지 말고, 해당 문제를 직접 수정 후 풀 리퀘스트로 보내주십시오.

라라벨의 소스코드는 GitHub에서 관리되고 있으며, 다양한 라라벨 프로젝트별로 각각의 저장소가 있습니다.

<div class="content-list" markdown="1">

- [라라벨 애플리케이션](https://github.com/laravel/laravel)
- [라라벨 아트](https://github.com/laravel/art)
- [라라벨 문서](https://github.com/laravel/docs)
- [라라벨 Dusk](https://github.com/laravel/dusk)
- [라라벨 Cashier Stripe](https://github.com/laravel/cashier)
- [라라벨 Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [라라벨 Echo](https://github.com/laravel/echo)
- [라라벨 Envoy](https://github.com/laravel/envoy)
- [라라벨 Folio](https://github.com/laravel/folio)
- [라라벨 프레임워크](https://github.com/laravel/framework)
- [라라벨 Homestead](https://github.com/laravel/homestead)
- [라라벨 Homestead 빌드 스크립트](https://github.com/laravel/settler)
- [라라벨 Horizon](https://github.com/laravel/horizon)
- [라라벨 Jetstream](https://github.com/laravel/jetstream)
- [라라벨 Passport](https://github.com/laravel/passport)
- [라라벨 Pennant](https://github.com/laravel/pennant)
- [라라벨 Pint](https://github.com/laravel/pint)
- [라라벨 Prompts](https://github.com/laravel/prompts)
- [라라벨 Sail](https://github.com/laravel/sail)
- [라라벨 Sanctum](https://github.com/laravel/sanctum)
- [라라벨 Scout](https://github.com/laravel/scout)
- [라라벨 Socialite](https://github.com/laravel/socialite)
- [라라벨 Telescope](https://github.com/laravel/telescope)
- [라라벨 웹사이트](https://github.com/laravel/laravel.com-next)

</div>

<a name="support-questions"></a>
## 지원 문의

라라벨의 GitHub 이슈 트래커는 라라벨 사용 관련 질문이나 지원 요청을 위한 공간이 아닙니다. 아래의 공식 지원 채널 중 하나를 이용해 주세요.

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

새로운 기능 제안이나 기존 라라벨 동작의 개선 아이디어가 있다면, 라라벨 프레임워크 저장소의 [GitHub 디스커션 보드](https://github.com/laravel/framework/discussions)에 제안해 주시기 바랍니다. 새로운 기능을 제안할 때에는 최소한 일부 구현 코드를 직접 작성할 의사가 있어야 합니다.

버그, 신규 기능, 기존 기능 구현에 대한 비공식 논의는 [라라벨 Discord 서버](https://discord.gg/laravel)의 `#internals` 채널에서 이루어집니다. 라라벨의 메인테이너인 Taylor Otwell은 보통 미국 중부 시간대(UTC-06:00 또는 America/Chicago 기준)로 평일 오전 8시부터 오후 5시까지 채널에 상주하며, 그 외 시간에도 가끔 접속합니다.

<a name="which-branch"></a>
## 어떤 브랜치에 커밋해야 할까요?

**모든** 버그 수정은 현재 버그 수정을 지원하는 최신 버전(현재는 `10.x`) 브랜치로 보내야 합니다. 버그 수정은, 다가오는 릴리스에만 존재하는 기능을 고치는 경우가 아닌 한, **절대로** `master` 브랜치로 보내지 마십시오.

**완전히 하위 호환성**을 유지하는 **경미한** 기능 추가는 최신 안정 브랜치(현재는 `10.x`)로 보낼 수 있습니다.

**주요** 새로운 기능, 또는 하위 호환성이 깨지는 변경사항이 있는 기능은 항상 `master` 브랜치(향후 릴리스를 위한 브랜치)로 보내야 합니다.

<a name="compiled-assets"></a>
## 컴파일된 에셋

`laravel/laravel` 저장소의 `resources/css`나 `resources/js`에 있는 대부분의 컴파일된 파일에 변경사항이 생기는 커밋을 제출할 경우, **컴파일된 파일은 절대로 커밋하지 마십시오**. 이러한 파일은 용량이 커서 메인테이너가 현실적으로 리뷰하기 어렵습니다. 만약 커밋된다면 악의적인 코드를 라라벨에 삽입하는 수단으로 악용될 수 있습니다. 이를 방지하기 위해, 모든 컴파일된 파일은 라라벨 메인테이너가 직접 생성 및 커밋합니다.

<a name="security-vulnerabilities"></a>
## 보안 취약점

라라벨에서 보안 취약점을 발견했을 경우, Taylor Otwell에게 <a href="mailto:taylor@laravel.com">taylor@laravel.com</a>으로 이메일을 보내주시기 바랍니다. 모든 보안 취약점은 신속하게 처리될 것입니다.

<a name="coding-style"></a>
## 코딩 스타일

라라벨은 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) 코딩 표준과 [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) 오토로딩 표준을 따릅니다.

<a name="phpdoc"></a>
### PHPDoc

아래는 라라벨에서 올바른 문서화 블록의 예시입니다. `@param` 속성 뒤에 공백 2개, 인수 타입, 공백 2개, 마지막으로 변수 이름이 오오는 것에 유의하세요.

```
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

네이티브 타입으로 되어 있어서 `@param` 또는 `@return` 속성이 중복되는 경우, 해당 속성은 제거할 수 있습니다.

```
/**
 * Execute the job.
 */
public function handle(AudioProcessor $processor): void
{
    //
}
```

하지만 네이티브 타입이 제네릭인 경우에는, 반드시 `@param` 또는 `@return` 속성을 이용해 제네릭 타입을 명시해 주어야 합니다.

```
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

코드 스타일이 완벽하지 않아도 너무 걱정하실 필요 없습니다! [StyleCI](https://styleci.io/)가 풀 리퀘스트가 병합된 이후, 라라벨 저장소에 자동으로 코드 스타일을 맞춰줍니다. 덕분에 기여 내용에 더 집중할 수 있고, 코드 스타일 자체에는 신경을 덜 쓸 수 있습니다.

<a name="code-of-conduct"></a>
## 행동 강령

라라벨의 행동 강령은 Ruby 커뮤니티의 행동 강령에서 영감을 받았습니다. 행동 강령을 위반하는 경우 Taylor Otwell(taylor@laravel.com)에게 신고할 수 있습니다.

<div class="content-list" markdown="1">

- 참가자는 서로의 상반된 견해를 관용적으로 받아들여야 합니다.
- 참가자는 언행이 개인 공격이나 비방이 되지 않도록 스스로 조심해야 합니다.
- 타인의 언행을 해석할 때는 항상 선의로 받아들이도록 노력해야 합니다.
- 상식적으로 괴롭힘(하라스먼트)으로 받아들여질 수 있는 모든 행위는 절대로 용인하지 않습니다.

</div>
