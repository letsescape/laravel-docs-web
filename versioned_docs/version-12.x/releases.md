# 릴리스 노트 (Release Notes)

- [버전 관리 방식](#versioning-scheme)
- [지원 정책](#support-policy)
- [라라벨 12](#laravel-12)

<a name="versioning-scheme"></a>
## 버전 관리 방식

라라벨과 라라벨의 공식 패키지들은 [시맨틱 버전 규칙(Semantic Versioning)](https://semver.org)을 따릅니다. 프레임워크의 주요 버전(Major)은 매년(대략 1분기)에 출시되며, 마이너 버전과 패치 버전은 매주처럼 자주 출시될 수 있습니다. 마이너 또는 패치 릴리스에는 **절대로** 호환성에 영향을 주는 변경사항(브레이킹 체인지)이 포함되지 않습니다.

여러분의 애플리케이션이나 패키지에서 라라벨 프레임워크 또는 그 구성요소를 참조할 때는 항상 `^12.0`과 같은 버전 제약 조건을 사용하는 것이 좋습니다. 라라벨의 주요 릴리스에는 브레이킹 체인지가 포함되기 때문입니다. 하지만, 저희는 새로운 주요 버전으로의 업그레이드가 하루 이내에 끝날 수 있도록 노력하고 있습니다.

<a name="named-arguments"></a>
#### 명명된 인수(Named Arguments)

[명명된 인수](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 라라벨의 하위 호환성 보장 정책에 포함되지 않습니다. 필요하다면 라라벨 코드베이스의 개선을 위해 함수의 인수 이름이 변경될 수 있습니다. 따라서 라라벨 메서드를 호출할 때 명명된 인수를 사용한다면, 향후 인수 이름이 변경될 가능성이 있음을 유념하고 신중하게 사용해야 합니다.

<a name="support-policy"></a>
## 지원 정책

모든 라라벨 버전은 18개월간 버그 수정(Bug Fixes)을, 2년간 보안 수정(Security Fixes)을 제공합니다. Lumen을 포함한 추가 라이브러리들은 최신 주요 버전만이 버그 수정을 받습니다. 또한, 라라벨이 지원하는 데이터베이스 버전도 [공식 문서](/docs/database#introduction)에서 꼭 확인해 주세요.

<div class="overflow-auto">

| 버전 | PHP (*) | 출시일 | 버그 수정 종료일 | 보안 수정 종료일 |
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

(*) 지원하는 PHP 버전

<a name="laravel-12"></a>
## 라라벨 12

라라벨 12는 라라벨 11.x에서 진행된 여러 개선사항을 이어받아 상위 종속성 패키지들을 업데이트하고, React, Vue, Livewire용 신규 스타터 키트(시작용 템플릿 키트)를 도입했습니다. 특히 사용자 인증을 위한 [WorkOS AuthKit](https://authkit.com)까지 선택적으로 사용할 수 있습니다. WorkOS를 활용한 스타터 키트 버전은 소셜 로그인, 패스키, SSO(싱글 사인온)까지 지원합니다.

<a name="minimal-breaking-changes"></a>
### 최소한의 브레이킹 체인지

이번 릴리스 주기의 주요 목표는 브레이킹 체인지를 최대한 줄이는 것이었습니다. 그 대신, 기존 애플리케이션을 깨뜨리지 않는 다양한 편의성과 품질 향상 개선을 꾸준히 추가했습니다.

이러한 이유로 라라벨 12는 기존 의존성 업그레이드를 위한 비교적 작은 규모의 "유지보수 릴리스"라고 할 수 있습니다. 대부분의 라라벨 애플리케이션은 코드 수정 없이 라라벨 12로 업그레이드할 수 있을 것입니다.

<a name="new-application-starter-kits"></a>
### 새로운 애플리케이션 스타터 키트

라라벨 12에서는 React, Vue, Livewire를 위한 [새로운 스타터 키트](/docs/starter-kits)가 도입되었습니다. React와 Vue 스타터 키트는 Inertia 2, TypeScript, [shadcn/ui](https://ui.shadcn.com), Tailwind를 활용하며, Livewire 스타터 키트는 Tailwind 기반의 [Flux UI](https://fluxui.dev) 컴포넌트 라이브러리와 Laravel Volt를 사용합니다.

React, Vue, Livewire 스타터 키트 모두 라라벨 내장 인증 시스템을 이용해 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 다양한 인증 관련 기능을 제공합니다. 여기에 [WorkOS AuthKit 기반](https://authkit.com) 스타터 키트 버전도 각각 제공되어, 소셜 로그인, 패스키, SSO 인증까지 지원합니다. WorkOS는 월간 100만 명 활동 사용자까지 무료로 인증 기능을 제공합니다.

이러한 새로운 스타터 키트가 출시됨에 따라, 기존의 Laravel Breeze 및 Laravel Jetstream은 더 이상 추가 업데이트를 받지 않습니다.

신규 스타터 키트의 사용법은 [스타터 키트 공식 문서](/docs/starter-kits)를 참고해 시작해 보세요.
