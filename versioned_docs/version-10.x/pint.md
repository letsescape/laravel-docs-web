# 라라벨 핀트 (Laravel Pint)

- [소개](#introduction)
- [설치](#installation)
- [핀트 실행하기](#running-pint)
- [핀트 설정하기](#configuring-pint)
    - [프리셋](#presets)
    - [규칙](#rules)
    - [파일/폴더 제외하기](#excluding-files-or-folders)

<a name="introduction"></a>
## 소개

[Laravel Pint](https://github.com/laravel/pint)는 미니멀리스트를 위한 라라벨의 공식 PHP 코드 스타일 자동 정리 도구입니다. Pint는 PHP-CS-Fixer를 기반으로 만들어졌으며, 여러분의 코드 스타일을 깔끔하고 일관되게 유지하는 데 도움을 줍니다.

Pint는 모든 최신 라라벨 애플리케이션에 기본적으로 설치되어 있으므로, 별도의 설치 없이 바로 사용할 수 있습니다. 기본 설정 상태에서 Pint는 어떠한 추가 설정도 필요하지 않으며, 라라벨에서 제안하는 코드 스타일을 따라 코드 내의 스타일 문제를 자동으로 수정해줍니다.

<a name="installation"></a>
## 설치

Pint는 최근에 출시된 라라벨 프레임워크에 기본 포함되어 있기 때문에, 별도 설치가 필요 없는 경우가 대부분입니다. 하지만 이전 버전의 애플리케이션에서는 Composer를 통해 Laravel Pint를 직접 설치할 수 있습니다:

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## 핀트 실행하기

프로젝트의 `vendor/bin` 디렉터리에 있는 `pint` 바이너리를 실행하면 Pint가 코드 스타일 문제를 자동으로 고쳐줍니다:

```shell
./vendor/bin/pint
```

특정 파일이나 디렉터리만 대상으로 Pint를 실행할 수도 있습니다:

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

Pint는 수정한 모든 파일을 자세하게 목록으로 보여줍니다. 실행 시 `-v` 옵션을 추가하면, Pint가 수행한 변경 내역을 더욱 상세하게 확인할 수 있습니다:

```shell
./vendor/bin/pint -v
```

코드를 실제로 수정하지 않고 스타일 오류만 검사하고 싶다면, `--test` 옵션을 사용할 수 있습니다:

```shell
./vendor/bin/pint --test
```

Git에서 커밋되지 않은 변경사항이 있는 파일만 수정하고 싶다면, `--dirty` 옵션을 활용할 수 있습니다:

```shell
./vendor/bin/pint --dirty
```

<a name="configuring-pint"></a>
## 핀트 설정하기

앞서 언급한 바와 같이, Pint는 별도의 설정 없이도 사용할 수 있습니다. 하지만, 프리셋이나 규칙, 검사할 폴더 등을 직접 지정하고 싶다면 프로젝트의 루트 디렉터리에 `pint.json` 파일을 만들어서 커스터마이즈할 수 있습니다:

```json
{
    "preset": "laravel"
}
```

또한, 특정 디렉터리의 `pint.json` 파일을 사용하고 싶다면 Pint 실행 시 `--config` 옵션을 지정하면 됩니다:

```shell
pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### 프리셋

프리셋은 코드 스타일 문제를 고치기 위한 일련의 규칙 집합을 의미합니다. Pint는 기본적으로 `laravel` 프리셋을 사용하여 라라벨의 공식 코드 스타일 가이드에 따라 문제를 해결합니다. 하지만, 원하는 경우 Pint 실행 시 `--preset` 옵션으로 다른 프리셋을 지정할 수도 있습니다:

```shell
pint --preset psr12
```

또는, 프로젝트의 `pint.json` 파일에서 아래와 같이 프리셋을 설정할 수도 있습니다:

```json
{
    "preset": "psr12"
}
```

Pint에서 현재 지원하는 프리셋은 다음과 같습니다: `laravel`, `per`, `psr12`, `symfony`.

<a name="rules"></a>
### 규칙

규칙이란 Pint가 코드 스타일 문제를 자동으로 고칠 때 사용하는 구체적인 스타일 기준을 의미합니다. 앞서 설명한 프리셋은 여러 규칙을 미리 묶어둔 것으로, 대부분의 PHP 프로젝트에서는 프리셋만 지정해도 충분합니다.

하지만 필요에 따라, `pint.json` 파일에서 특정 규칙만 개별적으로 활성화하거나 비활성화할 수 있습니다:

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

Pint는 [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer)를 기반으로 만들어졌기 때문에, PHP-CS-Fixer에서 제공하는 다양한 규칙도 사용할 수 있습니다. 직접 사용할 수 있는 규칙 목록은 [PHP-CS-Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator)에서 확인할 수 있습니다.

<a name="excluding-files-or-folders"></a>
### 파일/폴더 제외하기

기본적으로 Pint는 여러분 프로젝트 내의 모든 `.php` 파일을 검사하지만, `vendor` 디렉터리 아래의 파일은 자동으로 제외됩니다. 이 외에 추가로 특정 폴더를 검사 대상에서 제외하고 싶다면 `exclude` 설정 옵션을 활용할 수 있습니다:

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

특정 이름 패턴을 가진 파일을 모두 제외하고 싶다면 `notName` 옵션을 사용할 수 있습니다:

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

정확한 경로로 지정한 파일을 제외하려면 `notPath` 옵션을 이용하면 됩니다:

```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```
