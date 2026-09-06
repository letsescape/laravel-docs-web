<!-- # Contribution Guide -->
# Contribution Guide

- [Bug Reports](#bug-reports)
- [Support Questions](#support-questions)
- [Which Branch?](#which-branch)
- [Compiled Assets](#compiled-assets)
- [AI-Generated Contributions](#ai-generated-contributions)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Coding Style](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [Code of Conduct](#code-of-conduct)

<a name="bug-reports"></a>
<!-- ## Bug Reports -->
## Bug Reports

<!-- To encourage active collaboration, Laravel strongly encourages pull requests that address problems, not GitHub issues. GitHub issues are disabled on most of our first-party packages. -->
積極的なコラボレーションを促進するため、Laravel では問題に対処するプルリクエストの作成を強く推奨しており、GitHub issue の作成は推奨していません。ファーストパーティパッケージの大半では、GitHub issue を無効にしています。

<!-- If you discover a problem, please create a pull request that addresses the problem. Your pull request should contain a title and a clear description of the problem and its solution. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a pull request is to make it easy for yourself - and others - to understand the problem and verify the fix. -->
問題を見つけた場合は、その問題に対処するプルリクエストを作成してください。プルリクエストにはタイトルと、問題およびその解決方法を明確に説明する内容を含めてください。また、関連する情報をできるだけ多く添え、問題を示すコードサンプルも含めてください。プルリクエストの目的は、あなたや他の人が問題を理解し、修正を検証しやすくすることです。

<!-- If you do not know how to fix the problem, describe the issue to a coding agent and use it to attempt a pull request. -->
問題を修正する方法がわからない場合は、コーディングエージェントに問題の内容を説明し、それを使ってプルリクエストを試みてください。

<!-- Pull requests will only be reviewed when marked as "ready for review" (not in the "draft" state) and all tests for new features are passing. Lingering, non-active pull requests left in the "draft" state will be closed after a few days. -->
プルリクエストは「ready for review」とマークされていて（「draft」状態ではなく）、新機能に対するすべてのテストが成功している場合にのみレビューします。「draft」状態のまま放置されている非アクティブなプルリクエストは、数日後にクローズします。

<!-- The Laravel source code is managed on GitHub, and there are repositories for each of the Laravel projects: -->
Laravel のソース コードは GitHub で管理されており、Laravel プロジェクトごとにリポジトリがあります。

<div class="content-list" markdown="1">

<!-- - [Laravel AI SDK](https://github.com/laravel/ai) - [Laravel Application](https://github.com/laravel/laravel) - [Laravel Art](https://github.com/laravel/art) - [Laravel Boost](https://github.com/laravel/boost) - [Laravel Documentation](https://github.com/laravel/docs) - [Laravel Dusk](https://github.com/laravel/dusk) - [Laravel Cashier Stripe](https://github.com/laravel/cashier) - [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle) - [Laravel Echo](https://github.com/laravel/echo) - [Laravel Envoy](https://github.com/laravel/envoy) - [Laravel Folio](https://github.com/laravel/folio) - [Laravel Framework](https://github.com/laravel/framework) - [Laravel Horizon](https://github.com/laravel/horizon) - [Laravel Passport](https://github.com/laravel/passport) - [Laravel Pennant](https://github.com/laravel/pennant) - [Laravel Pint](https://github.com/laravel/pint) - [Laravel Prompts](https://github.com/laravel/prompts) - [Laravel Reverb](https://github.com/laravel/reverb) - [Laravel Sail](https://github.com/laravel/sail) - [Laravel Sanctum](https://github.com/laravel/sanctum) - [Laravel Scout](https://github.com/laravel/scout) - [Laravel Socialite](https://github.com/laravel/socialite) - [Laravel Telescope](https://github.com/laravel/telescope) - [Laravel Livewire Starter Kit](https://github.com/laravel/livewire-starter-kit) - [Laravel React Starter Kit](https://github.com/laravel/react-starter-kit) - [Laravel Svelte Starter Kit](https://github.com/laravel/svelte-starter-kit) - [Laravel Vue Starter Kit](https://github.com/laravel/vue-starter-kit) -->
- [Laravel AI SDK](https://github.com/laravel/ai)
- [Laravel Application](https://github.com/laravel/laravel)
- [Laravel Art](https://github.com/laravel/art)
- [Laravel Boost](https://github.com/laravel/boost)
- [Laravel Documentation](https://github.com/laravel/docs)
- [Laravel Dusk](https://github.com/laravel/dusk)
- [Laravel Cashier Stripe](https://github.com/laravel/cashier)
- [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [Laravel Echo](https://github.com/laravel/echo)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Folio](https://github.com/laravel/folio)
- [Laravel Framework](https://github.com/laravel/framework)
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Pennant](https://github.com/laravel/pennant)
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Prompts](https://github.com/laravel/prompts)
- [Laravel Reverb](https://github.com/laravel/reverb)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Livewire Starter Kit](https://github.com/laravel/livewire-starter-kit)
- [Laravel React Starter Kit](https://github.com/laravel/react-starter-kit)
- [Laravel Svelte Starter Kit](https://github.com/laravel/svelte-starter-kit)
- [Laravel Vue Starter Kit](https://github.com/laravel/vue-starter-kit)

</div>

<a name="support-questions"></a>
<!-- ## Support Questions -->
## Support Questions

<!-- Laravel's GitHub issue trackers are not intended to provide Laravel help or support. Instead, use one of the following channels: -->
Laravel の GitHub 問題トラッカーは、Laravel のヘルプやサポートを提供することを目的としたものではありません。代わりに、次のいずれかのチャネルを使用してください。

<div class="content-list" markdown="1">

<!-- - [GitHub Discussions](https://github.com/laravel/framework/discussions) - [Laracasts Forums](https://laracasts.com/discuss) - [Laravel.io Forums](https://laravel.io/forum) - [StackOverflow](https://stackoverflow.com/questions/tagged/laravel) - [Discord](https://discord.gg/laravel) - [Larachat](https://larachat.co) - [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel) -->
- [GitHub Discussions](https://github.com/laravel/framework/discussions)
- [Laracasts Forums](https://laracasts.com/discuss)
- [Laravel.io Forums](https://laravel.io/forum)
- [StackOverflow](https://stackoverflow.com/questions/tagged/laravel)
- [Discord](https://discord.gg/laravel)
- [Larachat](https://larachat.co)
- [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

</div>

<a name="which-branch"></a>
<!-- ## Which Branch? -->
## Which Branch?

<!-- **All** bug fixes should be sent to the latest version that supports bug fixes (currently `13.x`). Bug fixes should **never** be sent to the `master` branch unless they fix features that exist only in the upcoming release. -->
**すべて**のバグ修正は、バグ修正をサポートする最新バージョン (現在 `13.x`) に送信する必要があります。バグ修正は、今後のリリースにのみ存在する機能を修正するものでない限り、`master` ブランチには**決して**送信しないでください。

<!-- **Minor** features that are **fully backward compatible** with the current release may be sent to the latest stable branch (currently `13.x`). -->
現在のリリースと**完全に下位互換性がある**、**マイナー**機能は、最新の安定したブランチ (現在 `13.x`) に送信される場合があります。

<!-- **Major** new features or features with breaking changes should always be sent to the `master` branch, which contains the upcoming release. -->
**主要な**新機能または重大な変更を伴う機能は、次のリリースが含まれる `master` ブランチに常に送信する必要があります。

<a name="compiled-assets"></a>
<!-- ## Compiled Assets -->
## Compiled Assets

<!-- If you are submitting a change that will affect a compiled file, such as most of the files in `resources/css` or `resources/js` of the `laravel/laravel` repository, do not commit the compiled files. Due to their large size, they cannot realistically be reviewed by a maintainer. This could be exploited as a way to inject malicious code into Laravel. In order to defensively prevent this, all compiled files will be generated and committed by Laravel maintainers. -->
`laravel/laravel` リポジトリの `resources/css` または `resources/js` 内のほとんどのファイルなど、コンパイル済みファイルに影響を与える変更を送信する場合は、コンパイル済みファイルをコミットしないでください。サイズが大きいため、現実的にはメンテナがレビューすることはできません。これは、悪意のあるコードを Laravel に挿入する方法として悪用される可能性があります。これを防御的に防ぐために、すべてのコンパイル済みファイルは Laravel メンテナによって生成およびコミットされます。

<a name="ai-generated-contributions"></a>
<!-- ## AI-Generated Contributions -->
## AI-Generated Contributions

<!-- We appreciate every pull request submitted to Laravel. However, substantial contributions that are primarily AI-generated without thoughtful human review and consideration are not acceptable. -->
Laravel に送られるすべてのプルリクエストに感謝します。ただし、十分な人間によるレビューと検討を経ず、主に AI が生成した大規模な貢献は受け付けられません。

<!-- If you choose to use AI tools to assist with large or complex contributions to the framework, the resulting code **must** be thoroughly reviewed, tested, and understood by you before submitting. -->
フレームワークへの大規模または複雑なコントリビューションを支援するために AI ツールを使用する場合、生成されたコードを提出する前に、必ず自分自身で十分にレビューし、テストし、内容を理解してください。

<!-- Pull request descriptions **must** be written entirely by the contributor. Pull requests with AI-generated descriptions will be closed. -->
プルリクエストの説明は、貢献者自身がすべて記述しなければなりません。AIが生成した説明を含むプルリクエストはクローズします。

<!-- **Mass opening issues or pull requests that are entirely AI-generated will not be tolerated.** Such pull requests will be closed without review, and the contributing user may be blocked from the repository. -->
**完全に AI によって生成された問題やプル リクエストを大量に開くことは許容されません。** このようなプル リクエストはレビューなしで閉じられ、投稿したユーザーはリポジトリからブロックされる場合があります。

<!-- We encourage contributors to familiarize themselves with the existing codebase, engage with the community, and submit pull requests that reflect their own understanding and careful consideration of the problem they are solving. -->
コントリビューターには、既存のコードベースに慣れ、コミュニティに参加し、解決しようとしている問題についての自身の理解と慎重な検討を反映したプル リクエストを送信することをお勧めします。

<a name="security-vulnerabilities"></a>
<!-- ## Security Vulnerabilities -->
## Security Vulnerabilities

<!-- If you discover a security vulnerability within Laravel, please email our security team at <a href="mailto:security@laravel.com">security@laravel.com</a>. All security vulnerabilities will be promptly addressed. -->
Laravel 内でセキュリティ脆弱性を発見した場合は、<a href="mailto:security@laravel.com">security@laravel.com</a> のセキュリティチームまでメールでご連絡ください。すべてのセキュリティ脆弱性は速やかに対応されます。

<a name="coding-style"></a>
<!-- ## Coding Style -->
## Coding Style

<!-- Laravel follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. -->
Laravel は、[PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) コーディング標準と [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) オートロード標準に従っています。

<a name="phpdoc"></a>
<!-- ### PHPDoc -->
### PHPDoc

<!-- Below is an example of a valid Laravel documentation block. Note that the `@param` attribute is followed by two spaces, the argument type, two more spaces, and finally the variable name: -->
以下は、有効な Laravel ドキュメント ブロックの例です。 `@param` 属性の後には 2 つのスペース、引数の型、さらに 2 つのスペース、そして最後に変数名が続くことに注意してください。

```php
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

<!-- When the `@param` or `@return` attributes are redundant due to the use of native types, they can be removed: -->
`@param` 属性または `@return` 属性がネイティブ タイプの使用により冗長である場合、それらは削除できます。

```php
/**
 * Execute the job.
 * [tl! remove]
 * @return void [tl! remove]
 */
public function handle(AudioProcessor $processor): void
{
    // ...
}
```

<!-- However, when the native type is generic, please specify the generic type through the use of the `@param` or `@return` attributes: -->
ただし、ネイティブ タイプがジェネリックの場合は、`@param` または `@return` 属性を使用してジェネリック タイプを指定してください。

```php
/**
 * Get the attachments for the message.
 * [tl! add]
 * @return array<int, \Illuminate\Mail\Mailables\Attachment> [tl! add]
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

<a name="styleci"></a>
<!-- ### StyleCI -->
### StyleCI

<!-- Don't worry if your code styling isn't perfect! [StyleCI](https://styleci.io/) will automatically merge any style fixes into the Laravel repository after pull requests are merged. This allows us to focus on the content of the contribution and not the code style. -->
コードのスタイルが完璧でなくても心配する必要はありません。 [StyleCI](https://styleci.io/) は、プルリクエストがマージされた後、スタイル修正を自動的に Laravel リポジトリにマージします。これにより、コード スタイルではなく、投稿の内容に集中できるようになります。

<a name="code-of-conduct"></a>
<!-- ## Code of Conduct -->
## Code of Conduct

<!-- The Laravel code of conduct is derived from the Ruby code of conduct. Any violations of the code of conduct may be reported to Taylor Otwell (taylor@laravel.com): -->
Laravel の行動規範は、Ruby の行動規範から派生しています。行動規範の違反は、Taylor Otwell (taylor@laravel.com) に報告される場合があります。

<div class="content-list" markdown="1">

<!-- - Participants will be tolerant of opposing views. - Participants must ensure that their language and actions are free of personal attacks and disparaging personal remarks. - When interpreting the words and actions of others, participants should always assume good intentions. - Behavior that can be reasonably considered harassment will not be tolerated. -->
- 参加者は、異なる意見に対して寛容である必要があります。
- 参加者は、発言や行動に個人攻撃や他者を中傷する発言が含まれないようにしてください。
- 他者の発言や行動を解釈する際は、常に善意に基づくものと考えてください。
- 合理的にハラスメントとみなされる行為は許容されません。

</div>
