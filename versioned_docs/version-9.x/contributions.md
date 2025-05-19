# 기여 가이드 (Contribution Guide)

- [버그 리포트](#bug-reports)
- [지원 문의](#support-questions)
- [코어 개발 논의](#core-development-discussion)
- [어떤 브랜치에 기여해야 할까요?](#which-branch)
- [컴파일된 자산 파일](#compiled-assets)
- [보안 취약점 신고](#security-vulnerabilities)
- [코딩 스타일](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [행동 강령](#code-of-conduct)

<a name="bug-reports"></a>
## 버그 리포트

라라벨에서는 활발한 협업을 장려하기 위해 단순한 버그 리포트만이 아닌, Pull Request(기능·수정 코드 기여)를 적극적으로 권장합니다. Pull Request는 "Ready for review"(리뷰 준비 완료) 상태로 표시되어야만 검토되며, "draft"(초안) 상태이거나 신규 기능 관련 모든 테스트가 통과하지 않은 경우 검토 대상이 아닙니다. 며칠간 비활성 상태로 남아 있는 draft Pull Request는 자동으로 닫힐 수 있습니다.

버그 리포트를 등록할 경우에는, 반드시 제목과 구체적이고 명확한 설명을 포함해 주세요. 문제를 재현할 수 있는 코드 샘플과 관련 정보를 최대한 자세히 제공해 주셔야 합니다. 버그 리포트의 목적은 작성자 본인과 다른 사람들이 해당 버그를 쉽게 재현하고, 문제를 수정하는 데 도움을 주는 데 있습니다.

버그 리포트는 같은 문제를 겪는 다른 사람들이 해결책을 찾아가는 과정에 참여할 수 있도록 남기는 것입니다. 버그 리포트를 올렸다고 해서 즉시 누군가가 해결해 주리라고 기대해서는 안 됩니다. 버그 리포트를 남기는 행위 자체가 본인과 다른 사용자 모두에게 문제 해결의 첫 단추를 제공하는 셈입니다. 직접 버그 수정에 기여하고 싶다면, [issue tracker에 등록된 버그들](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel) 중에서 자유롭게 해결을 시도하실 수 있습니다. 라라벨의 모든 이슈를 보려면 GitHub 인증이 필요합니다.

라라벨의 소스 코드는 GitHub에서 관리되고 있으며, 각 프로젝트별로 별도의 저장소가 있습니다.

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
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Website](https://github.com/laravel/laravel.com-next)

</div>

<a name="support-questions"></a>
## 지원 문의

라라벨의 GitHub 이슈 트래커는 문제 신고와 버그 리포트 용도이며, 라라벨 사용법이나 일반적인 지원을 제공하는 곳이 아닙니다. 대신, 아래 커뮤니티 채널들을 이용해 주세요.

<div class="content-list" markdown="1">

- [GitHub Discussions](https://github.com/laravel/framework/discussions)
- [Laracasts Forums](https://laracasts.com/discuss)
- [Laravel.io Forums](https://laravel.io/forum)
- [StackOverflow](https://stackoverflow.com/questions/tagged/laravel)
- [Discord](https://discord.gg/laravel)
- [Larachat](https://larachat.co)
- [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

</div>

<a name="core-development-discussion"></a>
## 코어 개발 논의

라라벨의 동작 개선이나 새로운 기능 제안을 원한다면, 라라벨 프레임워크 저장소의 [GitHub Discussion Board](https://github.com/laravel/framework/discussions)에 논의를 남길 수 있습니다. 새로운 기능을 제안할 때는, 해당 기능 구현에 실질적으로 일부라도 직접 코드로 참여할 의향이 있으면 좋습니다.

버그, 신규 기능, 기존 기능의 구현 등 다양한 비공식 논의는 [라라벨 Discord 서버](https://discord.gg/laravel)의 `#internals` 채널에서 자유롭게 이루어지고 있습니다. 라라벨의 관리자인 Taylor Otwell은 평일(UTC-06:00/America/Chicago 기준) 오전 8시~오후 5시에 주로 채널에 있으며, 그 외 시간에도 불규칙하게 접속합니다.

<a name="which-branch"></a>
## 어떤 브랜치에 기여해야 할까요?

**모든** 버그 수정은 현재 버그 수정이 적용되는 최신 버전(현재는 `9.x`) 브랜치에 보내야 합니다. 버그 수정은 예외적으로 다음 릴리즈 버전에만 존재하는 신규 기능을 고칠 때를 제외하고는, 결코 `master` 브랜치로 직접 보내면 안 됩니다.

기존 릴리즈와 **완전히 하위 호환되는** **마이너**(작은 규모의) 기능 추가는 최신 안정화 브랜치(현재는 `9.x`)에 보낼 수 있습니다.

**주요(메이저) 신규 기능** 또는 호환성을 깨뜨릴 수 있는 큰 변경 사항(브레이킹 체인지)은 항상 다음 릴리즈가 포함된 `master` 브랜치로만 보내야 합니다.

<a name="compiled-assets"></a>
## 컴파일된 자산 파일

`laravel/laravel` 저장소의 `resources/css` 또는 `resources/js` 등, 컴파일이 필요한 파일을 변경하는 경우라면, 수정된 결과물(컴파일된 파일)은 커밋하지 않아야 합니다. 컴파일 파일은 대용량이고, 유지자가 직접 일일이 검토할 수 없기 때문입니다. 악의적으로 변조된 코드를 심을 위험을 방지하기 위해 보호 차원에서, 모든 컴파일 파일은 라라벨 유지자가 직접 생성해서 커밋하게 되어 있습니다.

<a name="security-vulnerabilities"></a>
## 보안 취약점 신고

라라벨에서 보안 취약점을 발견한 경우, Taylor Otwell에게 이메일로(<a href="mailto:taylor@laravel.com">taylor@laravel.com</a>) 알려주세요. 접수된 보안 이슈는 신속하게 처리됩니다.

<a name="coding-style"></a>
## 코딩 스타일

라라벨은 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) 코딩 표준, 그리고 [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) 오토로딩 표준을 따릅니다.

<a name="phpdoc"></a>
### PHPDoc

아래는 라라벨에서 사용하는 올바른 문서화 블록(PHPDoc) 예시입니다. `@param` 속성 뒤에 두 칸의 공백, 인수 타입, 다시 두 칸의 공백, 그리고 변수명이 이어지는 방식임을 참고하세요.

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

코드 스타일이 완벽하지 않아도 걱정하지 마세요! [StyleCI](https://styleci.io/)가 Pull Request가 머지된 이후 자동으로 스타일 정리를 해줍니다. 덕분에 기여자는 코드 내용에만 집중하면 됩니다.

<a name="code-of-conduct"></a>
## 행동 강령

라라벨의 행동 강령은 Ruby 커뮤니티의 행동 강령에서 유래되었습니다. 행동 강령을 위반하는 사례가 발견되면 Taylor Otwell(taylor@laravel.com)에게 신고하실 수 있습니다.

<div class="content-list" markdown="1">

- 참가자는 서로의 반대 의견에 관용적인 태도를 지녀야 합니다.
- 참가자는 언어나 행동에서 개인에 대한 공격이나 경멸적 발언을 삼가야 합니다.
- 타인의 말과 행동을 해석할 때 항상 선의(善意)를 전제로 해야 합니다.
- 괴롭힘으로 간주할 수 있는 행동은 용납되지 않습니다.

</div>
