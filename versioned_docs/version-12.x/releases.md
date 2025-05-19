# 릴리즈 노트 (Release Notes)

- [버전 관리 방식](#versioning-scheme)
- [지원 정책](#support-policy)
- [라라벨 12](#laravel-12)

<a name="versioning-scheme"></a>
## 버전 관리 방식

라라벨 및 라라벨의 공식 패키지들은 [Semantic Versioning(시맨틱 버저닝)](https://semver.org) 규칙을 따릅니다. 프레임워크의 주요(메이저) 릴리즈는 매년(대략 1분기)에 한 번씩 배포되며, 마이너 및 패치 릴리즈는 매주라도 배포될 수 있습니다. 마이너 및 패치 릴리즈에는 **절대로** 기존 코드에 영향을 미치는(호환성 파괴) 변경사항이 포함되지 않습니다.

애플리케이션이나 패키지에서 라라벨 프레임워크 또는 그 구성 요소를 참조할 때는 항상 `^12.0`과 같이 버전 제약 조건을 사용해야 합니다. 이는 라라벨의 메이저 버전 업데이트에는 호환성에 영향을 주는 변경이 포함될 수 있기 때문입니다. 하지만, 새로운 메이저 릴리즈로 하루, 혹은 그보다 짧은 시간 안에 업데이트할 수 있도록 최대한 배려하고 있습니다.

<a name="named-arguments"></a>
#### 명명된 인수(Named Arguments)

[명명된 인수(named arguments)](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 라라벨의 하위 호환성 가이드라인에 포함되지 않습니다. 라라벨 코드베이스의 품질 향상을 위해 필요하다면 함수의 인수명을 언제든지 변경할 수 있습니다. 따라서 라라벨의 메서드를 호출할 때 명명된 인수를 사용할 경우, 해당 파라미터 이름이 앞으로 변경될 수 있다는 점을 충분히 이해하고 신중하게 사용하셔야 합니다.

<a name="support-policy"></a>
## 지원 정책

모든 라라벨 릴리즈에 대해서는 18개월 동안 버그 수정이 제공되며, 2년 동안 보안 수정이 제공됩니다. 추가 라이브러리(예: Lumen)에는 최신 메이저 릴리즈만 버그 수정이 적용됩니다. 또한, 라라벨이 [지원하는 데이터베이스 버전](/docs/12.x/database#introduction)도 반드시 확인하시기 바랍니다.

<div class="overflow-auto">

| 버전 | PHP (*) | 출시일 | 버그 수정 종료 | 보안 수정 종료 |
| --- | --- | --- | --- | --- |
| 9 | 8.0 - 8.2 | 2022년 2월 8일 | 2023년 8월 8일 | 2024년 2월 6일 |
| 10 | 8.1 - 8.3 | 2023년 2월 14일 | 2024년 8월 6일 | 2025년 2월 4일 |
| 11 | 8.2 - 8.4 | 2024년 3월 12일 | 2025년 9월 3일 | 2026년 3월 12일 |
| 12 | 8.2 - 8.4 | 2025년 2월 24일 | 2026년 8월 13일 | 2027년 2월 24일 |

</div>

<div class="version-colors">
```
<div class="end-of-life">
    <div class="color-box"></div>
    <div>End of life</div>
</div>
<div class="security-fixes">
    <div class="color-box"></div>
    <div>Security fixes only</div>
</div>
```
</div>

(*) 지원되는 PHP 버전

<a name="laravel-12"></a>
## 라라벨 12

라라벨 12는 상위(Upstream) 의존성 업데이트와 함께, React, Vue, Livewire용 새로운 스타터 킷을 도입하여 라라벨 11.x에서의 개선 사항을 이어가고 있습니다. 이번에는 사용자인증을 위한 [WorkOS AuthKit](https://authkit.com) 옵션도 추가되었습니다. WorkOS 기반 스타터 킷에서는 소셜 인증, 패스키, SSO 지원까지 제공합니다.

<a name="minimal-breaking-changes"></a>
### 최소한의 호환성 파괴 변경

이번 릴리즈 주기의 주요 초점은, 호환성 파괴(기존 코드가 깨지는) 변경을 최소화하는 데 있었습니다. 대신, 기존 애플리케이션에는 영향을 미치지 않으면서도, 개발자 경험을 높이기 위한 다양한 품질 개선 사항을 연중 지속적으로 제공하는 데 전념하였습니다.

이로 인해, 라라벨 12는 기존 의존성 패키지 업데이트 중심의 일종의 "유지보수 릴리즈"라 볼 수 있습니다. 따라서 대부분의 라라벨 애플리케이션은 별다른 코드 변경 없이 라라벨 12로 업그레이드할 수 있습니다.

<a name="new-application-starter-kits"></a>
### 새로운 애플리케이션 스타터 킷

라라벨 12는 React, Vue, Livewire를 위한 [애플리케이션 스타터 킷](/docs/12.x/starter-kits)을 새롭게 제공합니다. React·Vue 스타터 킷은 Inertia 2, TypeScript, [shadcn/ui](https://ui.shadcn.com), Tailwind를 사용하며, Livewire 스타터 킷은 Tailwind 기반 [Flux UI](https://fluxui.dev) 컴포넌트 라이브러리와 Laravel Volt를 채택합니다.

React, Vue, Livewire 스타터 킷 모두 라라벨이 기본 제공하는 인증 시스템을 활용하여, 로그인, 회원가입, 비밀번호 초기화, 이메일 인증 등 주요한 인증 관련 기능을 제공합니다. 여기에 [WorkOS AuthKit 기반](https://authkit.com) 스타터 킷도 직접 선택해 사용할 수 있는데, 이 경우 소셜 인증, 패스키, SSO까지 지원합니다. WorkOS는 최대 100만 명의 월간 활성 사용자까지 무료로 인증 서비스를 제공합니다.

새로운 애플리케이션 스타터 킷 도입과 함께, 이제 Laravel Breeze와 Laravel Jetstream은 더 이상 추가적인 업데이트를 받지 않습니다.

새로운 스타터 킷의 사용법과 자세한 내용은 [스타터 킷 문서](/docs/12.x/starter-kits)를 참고하세요.
