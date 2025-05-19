# 라라벨 핀트 (Laravel Pint)

- [소개](#introduction)
- [설치](#installation)
- [Pint 실행하기](#running-pint)
- [Pint 설정하기](#configuring-pint)
    - [프리셋](#presets)
    - [규칙](#rules)
    - [파일/폴더 제외하기](#excluding-files-or-folders)

<a name="introduction"></a>
## 소개

[라라벨 Pint](https://github.com/laravel/pint)는 미니멀리스트를 위한, 의견이 반영된(opinionated) PHP 코드 스타일 자동 교정 도구입니다. Pint는 PHP-CS-Fixer를 기반으로 만들어졌으며, 여러분의 코드 스타일을 깔끔하고 일관되게 유지할 수 있도록 단순한 사용법을 제공합니다.

Pint는 모든 새로운 라라벨 애플리케이션에 자동으로 설치되기 때문에, 별도 설치 없이 바로 사용할 수 있습니다. 기본적으로 Pint는 별도의 설정 없이도 라라벨의 권장 코딩 스타일을 따라 여러분의 코드 스타일 문제를 자동으로 고쳐줍니다.

<a name="installation"></a>
## 설치

Pint는 최신 버전의 라라벨 프레임워크에 기본 포함되어 있으므로, 별도의 설치가 필요하지 않습니다. 하지만 예전 버전의 애플리케이션에서는 Composer를 통해 라라벨 Pint를 설치할 수 있습니다:

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## Pint 실행하기

Pint로 코드 스타일 문제를 자동으로 교정하려면, 여러분 프로젝트의 `vendor/bin` 디렉터리에 있는 `pint` 바이너리를 실행하면 됩니다:

```shell
./vendor/bin/pint
```

Pint를 특정 파일이나 디렉터리에만 실행할 수도 있습니다:

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

Pint는 업데이트한 모든 파일의 목록을 자세하게 보여줍니다. Pint가 적용한 변경 내역을 더 자세히 확인하고 싶다면, Pint 실행 시 `-v` 옵션을 추가하면 됩니다:

```shell
./vendor/bin/pint -v
```

코드를 실제로 수정하지 않고 스타일 오류만 검사하고 싶다면, `--test` 옵션을 사용하세요:

```shell
./vendor/bin/pint --test
```

Git에서 커밋되지 않은 변경 사항이 있는 파일에만 Pint를 적용하고 싶다면, `--dirty` 옵션을 사용할 수 있습니다:

```shell
./vendor/bin/pint --dirty
```

<a name="configuring-pint"></a>
## Pint 설정하기

앞서 설명한 것처럼, Pint는 기본적으로 아무런 설정 없이도 사용할 수 있습니다. 하지만 프리셋, 규칙, 검사 대상 폴더 등을 원하는 대로 커스터마이즈하고 싶다면, 프로젝트 루트 디렉터리에 `pint.json` 파일을 만들면 됩니다:

```json
{
    "preset": "laravel"
}
```

또한, 특정 디렉터리에 있는 `pint.json` 파일을 사용하고 싶다면, Pint 실행 시 `--config` 옵션을 지정할 수 있습니다:

```shell
pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### 프리셋

프리셋은 코드 스타일 문제를 고치는 데 사용할 규칙 세트입니다. 기본적으로 Pint는 `laravel` 프리셋을 사용하여, 라라벨의 권장 코딩 스타일 기준에 맞춰 문제를 해결합니다. 하지만, 원한다면 Pint를 실행할 때 `--preset` 옵션을 주어 다른 프리셋을 지정할 수 있습니다:

```shell
pint --preset psr12
```

원하면, 프로젝트의 `pint.json` 파일에 프리셋을 미리 지정해 둘 수도 있습니다:

```json
{
    "preset": "psr12"
}
```

현재 Pint가 지원하는 프리셋은 다음과 같습니다: `laravel`, `psr12`, `symfony`.

<a name="rules"></a>
### 규칙

규칙은 Pint가 코드 스타일을 수정할 때 참고하는 스타일 가이드라인을 의미합니다. 위에서 설명한 것처럼, 프리셋은 여러 개의 규칙이 미리 묶여 있는 형태이므로, 일반적으로는 프리셋만 신경 써도 충분합니다.

하지만 원한다면, `pint.json` 파일에서 개별 규칙을 직접 활성화하거나 비활성화할 수도 있습니다:

```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "braces": false,
        "new_with_braces": {
            "anonymous_class": false,
            "named_class": false
        }
    }
}
```

Pint는 [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer)를 기반으로 동작합니다. 따라서, 해당 도구에서 제공하는 모든 규칙을 활용해 프로젝트의 코드 스타일 문제를 교정할 수 있습니다: [PHP-CS-Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator).

<a name="excluding-files-or-folders"></a>
### 파일/폴더 제외하기

기본적으로 Pint는 프로젝트 내의 모든 `.php` 파일을 검사하지만, `vendor` 디렉터리는 자동으로 제외됩니다. 추가로 제외할 폴더가 있다면, `exclude` 설정 옵션을 사용하여 지정할 수 있습니다:

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

특정 이름 패턴이 포함된 모든 파일을 제외하고 싶다면, `notName` 옵션을 사용할 수 있습니다:

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

정확한 경로로 특정 파일을 제외하고 싶다면, `notPath` 옵션을 사용하세요:

```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```