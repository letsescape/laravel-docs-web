# 라라벨 핀트 (Laravel Pint)

- [소개](#introduction)
- [설치](#installation)
- [핀트 실행하기](#running-pint)
- [핀트 설정하기](#configuring-pint)
    - [프리셋](#presets)
    - [규칙(Rules)](#rules)
    - [파일/폴더 제외하기](#excluding-files-or-folders)
- [지속적 통합(CI)](#continuous-integration)
    - [GitHub Actions에서 실행하기](#running-tests-on-github-actions)

<a name="introduction"></a>
## 소개

[라라벨 핀트](https://github.com/laravel/pint)는 미니멀리스트를 위한 라라벨의 의견이 반영된(의견 기반의) PHP 코드 스타일 자동 수정 도구입니다. Pint는 [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer)를 기반으로 하며, 여러분의 코드 스타일을 깨끗하고 일관되게 유지할 수 있도록 간단하게 도와줍니다.

Pint는 최신 라라벨 애플리케이션에는 자동으로 설치되어 있으므로 바로 사용할 수 있습니다. 기본적으로 Pint는 별도의 설정 없이 라라벨의 공식적인 코드 스타일을 따라 코드 스타일 문제를 자동으로 수정해 줍니다.

<a name="installation"></a>
## 설치

Pint는 최신 라라벨 프레임워크 릴리즈에 포함되어 있으므로 별도의 설치가 필요하지 않은 경우가 많습니다. 하지만 구버전 애플리케이션의 경우에는 Composer를 통해 라라벨 핀트를 직접 설치할 수 있습니다.

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## 핀트 실행하기

Pint로 코드 스타일을 자동으로 수정하려면, 프로젝트 내 `vendor/bin` 디렉터리에 있는 `pint` 바이너리를 실행하면 됩니다.

```shell
./vendor/bin/pint
```

특정 파일이나 디렉터리만 대상으로 지정해 Pint를 실행할 수도 있습니다.

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

Pint는 수정된 모든 파일 목록을 자세하게 보여줍니다. Pint가 어떤 변경을 했는지 더 상세하게 보고 싶다면 `-v` 옵션을 함께 사용할 수 있습니다.

```shell
./vendor/bin/pint -v
```

파일을 실제로 변경하지 않고, 코드 스타일 오류만 검사하려면 `--test` 옵션을 사용할 수 있습니다. 이 경우 코드 스타일 오류가 발견되면, Pint는 0이 아닌 종료 코드로 반환합니다.

```shell
./vendor/bin/pint --test
```

Git의 브랜치 기준으로 변경된 파일만 Pint가 처리하도록 하려면, `--diff=[branch]` 옵션을 이용하세요. 이 방법은 GitHub Actions와 같은 CI 환경에서 새로운 파일이나 변경된 파일만 검사할 때 시간을 절약하는 데 유용합니다.

```shell
./vendor/bin/pint --diff=main
```

Git 기준으로 아직 커밋되지 않은 변경이 있는 파일만 Pint가 수정하게 하려면 `--dirty` 옵션을 사용할 수 있습니다.

```shell
./vendor/bin/pint --dirty
```

Pint가 코드 스타일 오류가 있는 파일들을 고치면서, 동시에 오류가 있었던 경우 0이 아닌 종료 코드로 끝내길 원한다면, `--repair` 옵션을 사용하면 됩니다.

```shell
./vendor/bin/pint --repair
```

<a name="configuring-pint"></a>
## 핀트 설정하기

앞서 언급했듯이 Pint는 별도 설정 없이 바로 동작합니다. 하지만, 프리셋이나 규칙 또는 검사할 폴더를 직접 지정하고 싶을 경우, 프로젝트의 루트 디렉터리에 `pint.json` 파일을 생성하면 됩니다.

```json
{
    "preset": "laravel"
}
```

특정 경로의 `pint.json` 설정 파일을 사용하고 싶다면, Pint 실행 시 `--config` 옵션을 추가해 해당 경로를 지정할 수 있습니다.

```shell
./vendor/bin/pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### 프리셋

프리셋(preset)은 코드 스타일 문제를 자동으로 고칠 때 적용할 규칙 집합입니다. 기본적으로 Pint는 `laravel` 프리셋을 사용해서, 라라벨의 공식 스타일을 따릅니다. 하지만 Pint 실행 시 `--preset` 옵션을 지정하여 다른 프리셋을 사용할 수도 있습니다.

```shell
./vendor/bin/pint --preset psr12
```

또한 프로젝트의 `pint.json` 파일에서 프리셋을 지정할 수도 있습니다.

```json
{
    "preset": "psr12"
}
```

현재 Pint가 지원하는 프리셋은 다음과 같습니다: `laravel`, `per`, `psr12`, `symfony`, `empty`.

<a name="rules"></a>
### 규칙(Rules)

규칙은 Pint가 코드 스타일을 자동 수정할 때 사용하는 세부 지침입니다. 위에서 설명한 대로, 프리셋은 이미 다양한 규칙을 사전에 그룹화해 놓은 것이기 때문에 대부분의 PHP 프로젝트에서는 별도로 규칙을 신경 쓸 필요가 없습니다.

하지만 필요하다면, `pint.json` 파일에서 특정 규칙을 켜거나 끌 수 있으며, 또는 `empty` 프리셋을 사용해 규칙을 처음부터 직접 정의할 수도 있습니다.

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

Pint는 [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer)를 기반으로 만들어졌기 때문에, PHP CS Fixer가 제공하는 모든 규칙을 프로젝트에서 사용할 수 있습니다. 더 많은 규칙 관련 정보는 [PHP CS Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator)에서 확인할 수 있습니다.

<a name="excluding-files-or-folders"></a>
### 파일/폴더 제외하기

기본적으로 Pint는 프로젝트 내의 모든 `.php` 파일을 검사하며, `vendor` 디렉터리는 자동으로 제외합니다. 검사에서 제외할 폴더가 더 있다면, `exclude` 설정 옵션을 사용할 수 있습니다.

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

특정 패턴을 포함하는 파일 이름을 가진 모든 파일을 제외하고 싶다면, `notName` 옵션을 사용할 수 있습니다.

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

정확한 경로로 특정 파일 하나를 제외하고 싶을 때는 `notPath` 옵션을 사용하세요.

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

라라벨 Pint로 프로젝트의 코드 스타일 자동 점검을 자동화하려면, [GitHub Actions](https://github.com/features/actions)를 설정하여 코드가 GitHub에 푸시될 때마다 Pint가 실행되도록 만들 수 있습니다. 우선, GitHub 내 **Settings > Actions > General > Workflow permissions**에서 워크플로우에 "Read and write permissions" 권한을 부여하세요. 그런 다음 아래와 같이 `.github/workflows/lint.yml` 파일을 생성하고 다음 내용을 입력합니다.

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
