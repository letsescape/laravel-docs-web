# 라라벨 핀트 (Laravel Pint)

- [소개](#introduction)
- [설치](#installation)
- [Pint 실행하기](#running-pint)
- [Pint 설정하기](#configuring-pint)
    - [프리셋](#presets)
    - [룰](#rules)
    - [파일/폴더 제외하기](#excluding-files-or-folders)
- [지속적 통합(CI)](#continuous-integration)
    - [GitHub Actions에서 실행하기](#running-tests-on-github-actions)

<a name="introduction"></a>
## 소개

[라라벨 Pint](https://github.com/laravel/pint)는 미니멀리스트(최소주의자)를 위한 라라벨의 의견이 반영된 PHP 코드 스타일 수정 도구입니다. Pint는 PHP-CS-Fixer 위에 구축되어 있으며, 코드 스타일을 항상 깔끔하고 일관되게 유지할 수 있도록 간편하게 도와줍니다.

Pint는 새로운 라라벨 애플리케이션에 자동으로 설치되므로, 바로 사용할 수 있습니다. 기본적으로 Pint는 별도의 설정이 필요하지 않으며, 라라벨에서 권장하는 코드 스타일을 따라 코드 내 스타일 문제를 자동으로 수정합니다.

<a name="installation"></a>
## 설치

Pint는 최신 라라벨 프레임워크 릴리즈에 기본 포함되어 있으므로, 별도의 설치가 필요 없는 경우가 많습니다. 다만, 구버전 애플리케이션에서는 Composer를 통해 라라벨 Pint를 설치할 수 있습니다.

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## Pint 실행하기

Pint를 사용하여 코드 스타일 문제를 자동으로 수정하려면, 프로젝트의 `vendor/bin` 디렉터리에 있는 `pint` 실행 파일을 다음과 같이 실행합니다.

```shell
./vendor/bin/pint
```

특정 파일이나 디렉터리만 대상으로 Pint를 실행할 수도 있습니다.

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

Pint는 수정된 모든 파일 목록을 상세하게 보여줍니다. `-v` 옵션을 함께 사용하면 Pint가 적용한 변경 사항을 더 자세히 확인할 수 있습니다.

```shell
./vendor/bin/pint -v
```

파일을 실제로 변경하지 않고, 코드 스타일 오류만 점검하고 싶다면 `--test` 옵션을 사용할 수 있습니다. 스타일 오류가 발견되면 Pint는 0이 아닌 종료 코드를 반환합니다.

```shell
./vendor/bin/pint --test
```

Git 상의 특정 브랜치와 비교하여 변경된 파일(새로 생성되었거나 수정된 파일)만 검사하고 싶을 때는 `--diff=[branch]` 옵션을 사용할 수 있습니다. 이 옵션은 GitHub Actions와 같은 CI 환경에서 시간 단축에 효과적입니다.

```shell
./vendor/bin/pint --diff=main
```

Git에서 커밋되지 않은 변경 사항이 있는 파일만 검사하려면 `--dirty` 옵션을 사용합니다.

```shell
./vendor/bin/pint --dirty
```

Pint가 코드 스타일 문제를 찾아서 고치되, 하나라도 수정된 파일이 있다면 0이 아닌 종료 코드로 종료되게 하려면 `--repair` 옵션을 사용할 수 있습니다.

```shell
./vendor/bin/pint --repair
```

<a name="configuring-pint"></a>
## Pint 설정하기

앞서 설명했듯이 Pint는 별도의 설정 없이 바로 사용할 수 있습니다. 그러나 프리셋, 룰, 검사할 폴더 등을 직접 설정하고 싶다면, 프로젝트의 루트 디렉터리에 `pint.json` 파일을 만들어 설정할 수 있습니다.

```json
{
    "preset": "laravel"
}
```

또한, 특정 디렉터리에 있는 `pint.json` 설정 파일을 사용하려면 Pint 실행 시 `--config` 옵션을 지정하면 됩니다.

```shell
./vendor/bin/pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### 프리셋

프리셋(preset)은 코드 스타일 문제를 수정할 때 사용할 룰 세트를 정의합니다. 기본적으로 Pint는 `laravel` 프리셋을 사용하며, 라라벨이 권장하는 코드 스타일로 코드를 고쳐줍니다. 다른 프리셋을 사용하려면 Pint 실행 시 `--preset` 옵션으로 지정할 수 있습니다.

```shell
./vendor/bin/pint --preset psr12
```

원한다면 프로젝트의 `pint.json` 파일에도 프리셋을 직접 설정할 수 있습니다.

```json
{
    "preset": "psr12"
}
```

현재 Pint에서 지원하는 프리셋은 다음과 같습니다: `laravel`, `per`, `psr12`, `symfony`, `empty`.

<a name="rules"></a>
### 룰

룰(rule)은 Pint가 코드 스타일 문제를 수정할 때 따르는 세부 기준(스타일 가이드라인)입니다. 앞서 안내한 것처럼 프리셋은 여러 룰을 미리 묶어둔 것으로, 대부분의 PHP 프로젝트에는 프리셋만으로 충분히 적합하게 스타일을 맞출 수 있습니다. 따라서 일반적으로 개별 룰을 신경 쓰지 않아도 괜찮습니다.

하지만 필요에 따라, 특정 룰만 개별적으로 활성화하거나 비활성화하고 싶다면, `pint.json` 파일에 직접 룰을 지정하거나, `empty` 프리셋을 사용해 처음부터 원하는 룰만 정의할 수 있습니다.

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

Pint는 [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) 기반으로 만들어졌으므로, PHP-CS-Fixer가 제공하는 모든 룰을 사용할 수 있습니다. 자세한 룰 목록과 구성을 확인하려면 [PHP-CS-Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator)를 참고하세요.

<a name="excluding-files-or-folders"></a>
### 파일/폴더 제외하기

기본적으로 Pint는 `vendor` 디렉터리를 제외한 프로젝트 내 모든 `.php` 파일을 검사합니다. 그 외에 특정 폴더를 추가로 제외하고 싶을 때는 `exclude` 설정 옵션을 사용할 수 있습니다.

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

특정 이름 패턴을 가진 모든 파일을 제외하려면 `notName` 옵션을 사용할 수 있습니다.

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

정확한 경로를 지정하여 특정 파일을 제외하고 싶을 때는 `notPath` 옵션을 사용합니다.

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

프로젝트에 라라벨 Pint를 적용해 코드 린팅을 자동화하려면 [GitHub Actions](https://github.com/features/actions)를 이용해 코드를 푸시할 때마다 Pint를 실행하도록 설정할 수 있습니다. 먼저 **Settings > Actions > General > Workflow permissions**에서 워크플로에 "읽기 및 쓰기 권한(Read and write permissions)"을 부여해야 합니다. 그 후, 다음과 같이 `.github/workflows/lint.yml` 파일을 생성합니다.

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
