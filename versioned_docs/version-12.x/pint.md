# 라라벨 Pint (Laravel Pint)

- [소개](#introduction)
- [설치](#installation)
- [Pint 실행하기](#running-pint)
- [Pint 설정하기](#configuring-pint)
    - [프리셋(Presets)](#presets)
    - [규칙(Rules)](#rules)
    - [파일/폴더 제외](#excluding-files-or-folders)
- [지속적 통합(CI)](#continuous-integration)
    - [GitHub Actions에서 실행하기](#running-tests-on-github-actions)

<a name="introduction"></a>
## 소개

[라라벨 Pint](https://github.com/laravel/pint)는 미니멀리스트를 위한 라라벨의 의견이 반영된(의견 기반의) PHP 코드 스타일 자동 수정 도구입니다. Pint는 [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer)를 기반으로 만들어졌으며, 여러분의 코드 스타일을 항상 깔끔하고 일관되게 유지할 수 있게 도와줍니다.

Pint는 최신 라라벨 애플리케이션에 기본으로 설치되어 있으므로, 바로 사용할 수 있습니다. 기본적으로 별도의 설정 없이도 Pint는 라라벨의 공식적인 코드 스타일 가이드에 따라 코드 스타일 문제를 자동으로 수정합니다.

<a name="installation"></a>
## 설치

Pint는 최근 라라벨 프레임워크에서는 기본 제공되므로, 별도의 설치 과정이 필요하지 않습니다. 하지만 구 버전 애플리케이션에서는 Composer로 라라벨 Pint를 수동 설치할 수 있습니다:

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## Pint 실행하기

Pint로 코드 스타일 문제를 자동으로 수정하려면, 프로젝트의 `vendor/bin` 디렉터리에 있는 `pint` 실행 파일을 이용하면 됩니다:

```shell
./vendor/bin/pint
```

특정 파일이나 디렉터리만 대상으로 지정해서 Pint를 실행할 수도 있습니다:

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

Pint는 업데이트된 모든 파일 목록을 자세히 보여줍니다. 더 많은 정보를 확인하고 싶다면 `-v` 옵션을 추가해 보십시오:

```shell
./vendor/bin/pint -v
```

실제 파일을 변경하지 않고 코드 스타일 오류만 검사하려면 `--test` 옵션을 사용하십시오. 코드 스타일 오류가 발견되면 Pint는 0이 아닌 종료 코드를 반환합니다:

```shell
./vendor/bin/pint --test
```

Git 기준으로 지정한 브랜치에서 변경된 파일만 자동 수정하고 싶다면 `--diff=[branch]` 옵션을 사용할 수 있습니다. 이 옵션은 GitHub Actions 같은 CI 환경에서 새로 추가되거나 수정된 파일만 검사하여 시간을 절약할 수 있습니다:

```shell
./vendor/bin/pint --diff=main
```

Git 기준으로 아직 커밋되지 않은 변경 파일만 검사 및 수정하려면 `--dirty` 옵션을 사용하십시오:

```shell
./vendor/bin/pint --dirty
```

코드 스타일 오류가 있는 파일을 자동 수정하면서, 수정된 파일이 하나라도 있으면 0이 아닌 종료 코드로 프로세스를 끝내고 싶다면 `--repair` 옵션을 사용할 수 있습니다:

```shell
./vendor/bin/pint --repair
```

<a name="configuring-pint"></a>
## Pint 설정하기

위에서 언급했듯, Pint는 별도의 설정 파일 없이도 작동합니다. 다만, 프리셋, 규칙, 검사 대상 폴더 등을 직접 설정하고 싶다면, 프로젝트 루트 디렉터리에 `pint.json` 파일을 만들면 됩니다:

```json
{
    "preset": "laravel"
}
```

또한, 특정 디렉터리의 `pint.json` 파일 설정을 사용하려면 Pint 실행 시 `--config` 옵션을 추가할 수 있습니다:

```shell
./vendor/bin/pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### 프리셋(Presets)

프리셋은 코드 스타일 문제를 자동으로 수정하기 위한 여러 규칙 모음입니다. Pint는 기본적으로 라라벨의 공식 스타일을 반영한 `laravel` 프리셋을 사용합니다. 물론, 필요에 따라 `--preset` 옵션으로 다른 프리셋을 지정할 수도 있습니다:

```shell
./vendor/bin/pint --preset psr12
```

또한, 프로젝트의 `pint.json` 파일 안에서 프리셋을 설정할 수도 있습니다:

```json
{
    "preset": "psr12"
}
```

현재 Pint에서 지원하는 프리셋은 다음과 같습니다: `laravel`, `per`, `psr12`, `symfony`, `empty`.

<a name="rules"></a>
### 규칙(Rules)

규칙은 Pint가 코드 스타일 문제를 고칠 때 적용하는 스타일 가이드입니다. 위에서 소개된 프리셋은 여러 가지 규칙을 묶어 놓은 것으로, 대부분의 PHP 프로젝트에 충분히 적합합니다. 따라서, 일반적으로 개별 규칙까지 신경 쓸 필요는 없습니다.

하지만, 필요하다면 프로젝트의 `pint.json` 파일에서 특정 규칙을 직접 켜거나 끌 수 있으며, 또는 `empty` 프리셋을 선택해서 완전히 직접 규칙을 정의할 수 있습니다:

```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "array_indentation": false,
        "new_with_parentheses": {
            "anonymous_class": true,
            "named_class": true
        }
    }
}
```

Pint는 [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) 위에서 동작하므로, 해당 프로젝트에서 제공하는 모든 규칙을 사용할 수 있습니다: [PHP CS Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator).

<a name="excluding-files-or-folders"></a>
### 파일/폴더 제외

기본적으로 Pint는 `vendor` 디렉터리를 제외한 프로젝트 내 모든 `.php` 파일을 검사합니다. 추가적으로 제외할 폴더가 있다면 `exclude` 설정 옵션을 사용하면 됩니다:

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

특정한 이름 패턴을 가진 모든 파일을 제외하고 싶다면 `notName` 옵션을 설정할 수 있습니다:

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

정확한 경로를 지정해서 파일을 제외하려면 `notPath` 옵션을 사용합니다:

```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```

<a name="continuous-integration"></a>
## 지속적 통합(CI)

<a name="running-tests-on-github-actions"></a>
### GitHub Actions에서 실행하기

라라벨 Pint를 활용해 프로젝트의 코드 린팅을 자동화하려면, [GitHub Actions](https://github.com/features/actions)에 Pint를 연동할 수 있습니다. 새로운 코드가 GitHub 저장소로 푸시될 때마다 Pint가 자동으로 린트하도록 셋업할 수 있습니다. 먼저, GitHub의 **Settings > Actions > General > Workflow permissions**에서 워크플로에 "Read and write permissions"를 부여해야 합니다. 그 후, 다음과 같이 `.github/workflows/lint.yml` 파일을 만들어주세요:

```yaml
name: Fix Code Style

on: [push]

jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        php: [8.4]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          extensions: json, dom, curl, libxml, mbstring
          coverage: none

      - name: Install Pint
        run: composer global require laravel/pint

      - name: Run Pint
        run: pint

      - name: Commit linted files
        uses: stefanzweifel/git-auto-commit-action@v5
```
