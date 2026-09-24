# MiniApps

Independent tools belong in `apps/<tool-id>/`. For now these are ordinary folders
in this repository. A tool can later be extracted into its own Git repository
and connected as a Git submodule. Jar Label Maker is the first MiniApp
(internal app ID: `pickle-label`).

Each tool must have its own `package.json`, README, build commands, and tests
where appropriate. It must build and run without the startpage application
or the root Angular configuration. Keep translations, assets, dependency lockfiles,
and app-specific documentation in that folder too. Tools must not import from each other.
Verify independence by copying the folder outside this repository, installing its
dependencies, and running its own start and build commands.

After a tool has a runnable URL, add its metadata in Russian, English, Lithuanian, and Polish to
`startpage/src/app/catalog/tool-registry.ts` so it appears in Collection.
The shell hosts Jar Label Maker at `/tools/kitchen/` by consuming its built
`@miniapps/pickle-label-ui` Angular package. The app's own `App` component uses
that same package for standalone operation. The shell never imports MiniApp source.
Other catalog entries may use regular links to same-origin or independently hosted tools.

Build the public package before either consumer with `npm run build:lib` from
the Jar Label Maker folder. The root build and dev scripts perform this step automatically.
