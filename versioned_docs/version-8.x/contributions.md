# 기여 가이드 (Contribution Guide)

- [버그 리포트](#bug-reports)
- [지원 문의](#support-questions)
- [코어 개발 논의](#core-development-discussion)
- [어떤 브랜치에 기여해야 할까요?](#which-branch)
- [컴파일된 에셋](#compiled-assets)
- [보안 취약점](#security-vulnerabilities)
- [코딩 스타일](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [행동 강령](#code-of-conduct)

<a name="bug-reports"></a>
## 버그 리포트

라라벨은 활발한 협업을 장려하기 위해, 단순한 버그 리포팅이 아닌 바로 직접 pull request로 기여하는 것을 적극 권장합니다. 실패하는 테스트를 포함하는 pull request 형태로 "버그 리포트"를 제출해도 좋습니다. pull request는 "ready for review"(검토 준비 완료) 상태일 때만 리뷰가 이루어지며, 새 기능을 위한 모든 테스트가 통과해야 합니다. 오랜 기간 비활성화되어 "draft"(임시) 상태로 남아있는 pull request는 며칠 후 종료될 수 있습니다.

만약 버그 리포트를 제출한다면, 해당 이슈에는 제목과 문제를 명확하게 설명하는 내용이 반드시 포함되어야 합니다. 또한, 최대한 관련 정보를 상세하게 넣고, 문제를 재현할 수 있는 코드 예시도 제공해주셔야 합니다. 버그 리포트의 목적은 자신뿐 아니라 다른 사람들이 쉽게 버그를 재현하고, 수정할 수 있도록 돕는 데 있습니다.

버그 리포트는 같은 문제를 겪고 있는 다른 사람들이 함께 해결책을 찾는 데 도움을 주기 위해 만들어진다는 점을 꼭 기억해주세요. 버그 리포트를 올려도 바로 활동이 이어지지 않을 수 있으며, 모두가 바로 해결에 나설 것이라고 기대하지 않는 것이 좋습니다. 버그 리포트를 등록하는 것은 문제 해결의 출발점으로서, 자신과 다른 개발자들에게 도움을 주는 행동입니다. 직접 도움을 주고 싶다면, [이슈 트래커에 등록된 버그](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel)를 수정하는 데 기여할 수도 있습니다. 이슈 목록 전체를 보려면 GitHub 인증이 필요합니다.

라라벨 소스 코드는 GitHub에서 관리되며, 라라벨의 각 프로젝트별로 별도의 저장소가 있습니다:

<div class="content-list" markdown="1">

- [Laravel Application](https://github.com/laravel/laravel)
- [Laravel Art](https://github.com/laravel/art)
- [Laravel Documentation](https://github.com/laravel/docs)
- [Laravel Dusk](https://github.com/laravel/dusk)
- [Laravel Cashier Stripe](https://github.com/laravel/cashier)
- [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [Laravel Echo](https://github.com/laravel/echo)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Framework](https://github.com/laravel/framework)
- [Laravel Homestead](https://github.com/laravel/homestead)
- [Laravel Homestead Build Scripts](https://github.com/laravel/settler)
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Jetstream](https://github.com/laravel/jetstream)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Website](https://github.com/laravel/laravel.com-next)

</div>

<a name="support-questions"></a>
## 지원 문의

라라벨의 GitHub 이슈 트래커는 라라벨 관련 질문이나 일반적인 지원 요청을 위한 공간이 아닙니다. 이런 경우에는 아래 공식 커뮤니티 채널 중 하나를 이용해주세요:

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

라라벨의 기본 동작에 새로운 기능을 제안하거나 기존 기능을 개선하고 싶다면, Laravel framework 저장소의 [GitHub Discussion 보드](https://github.com/laravel/framework/discussions)에서 제안할 수 있습니다. 새로운 기능을 제안하실 경우, 해당 기능 구현을 위해 어느 정도 직접 코드를 작성할 의사가 있으면 더욱 좋습니다.

버그, 신규 기능, 기존 기능의 구현과 관련된 비공식 논의는 [Laravel Discord 서버](https://discord.gg/laravel)의 `#internals` 채널에서 이루어집니다. 라라벨의 유지관리자인 Taylor Otwell도 일반적으로 주중(UTC-06:00 또는 America/Chicago 기준 오전 8시~오후 5시)에는 이 채널에서 활동하며, 그 외 시간대에도 간헐적으로 참여합니다.

<a name="which-branch"></a>
## 어떤 브랜치에 기여해야 할까요?

**모든** 버그 수정은 항상 최신 안정(stable) 브랜치로 보내야 하며, 오직 앞으로 배포될 신규 릴리즈에서만 존재하는 기능을 고칠 때에만 `master` 브랜치로 버그 수정을 보내야 합니다.

**완전히 하위 호환되는 소규모(minor) 기능**의 경우에도 최신 안정 브랜치로 pull request를 보내야 합니다.

**대규모(major) 신규 기능**은 항상 향후 릴리즈를 위한 `master` 브랜치로 보내야 합니다.

자신이 제안하는 기능이 major인지 minor인지 확실하지 않다면, [Laravel Discord 서버](https://discord.gg/laravel)의 `#internals` 채널에서 Taylor Otwell에게 질문해 주세요.

<a name="compiled-assets"></a>
## 컴파일된 에셋

만약 `laravel/laravel` 저장소의 `resources/css` 또는 `resources/js` 등, 컴파일된 파일에 영향을 주는 변경을 제출한다면 컴파일된 파일 자체는 커밋하지 마세요. 이러한 파일은 용량이 크기 때문에 책임자가 코드를 직접 검토할 수 없습니다. 이 제한을 악용해 악성 코드를 삽입하는 것도 현실적으로 가능하므로, 라라벨 팀에서는 컴파일된 파일은 오직 관리자가 직접 생성하고 커밋하도록 정책을 두고 있습니다.

<a name="security-vulnerabilities"></a>
## 보안 취약점

라라벨에서 보안 취약점을 발견했다면, Taylor Otwell에게 <a href="mailto:taylor@laravel.com">taylor@laravel.com</a> 으로 이메일을 보내주시기 바랍니다. 모든 보안 취약점은 신속하게 해결됩니다.

<a name="coding-style"></a>
## 코딩 스타일

라라벨은 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) 코딩 표준과 [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) 오토로딩 표준을 따릅니다.

<a name="phpdoc"></a>
### PHPDoc

아래는 라라벨에서 사용하는 올바른 문서화 주석 블록 예시입니다. `@param` 속성 뒤에는 두 번의 공백, 매개변수 타입, 두 번의 공백, 변수명이 순서대로 따라야 합니다:

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
    //
}
```

<a name="styleci"></a>
### StyleCI

코드 스타일이 완벽하지 않아도 걱정하지 마세요! [StyleCI](https://styleci.io/)가 pull request가 병합된 이후 자동으로 코드 스타일을 맞춰줍니다. 이렇게 하면 우리는 기여의 코드 내용 자체에 더 집중할 수 있습니다.

<a name="code-of-conduct"></a>
## 행동 강령

라라벨 행동 강령은 Ruby의 행동 강령을 바탕으로 제작되었습니다. 행동 강령을 위반한 경우, Taylor Otwell(taylor@laravel.com)에게 신고하실 수 있습니다:

<div class="content-list" markdown="1">

- 참여자는 다른 견해에 관용을 가져야 합니다.
- 참여자는 언행에서 개인을 공격하거나 비방하는 표현을 사용해서는 안 됩니다.
- 타인의 말과 행동을 해석할 때는 항상 선의로 받아들여야 합니다.
- 합리적으로 괴롭힘으로 여겨질 수 있는 행위는 용납되지 않습니다.

</div>
