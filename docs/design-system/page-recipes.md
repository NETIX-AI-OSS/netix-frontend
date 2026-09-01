# Page recipes

`app/components/recipes/index.tsx` (distributed as `@netix/recipes`; scaffolds ship it) contains source-level compositions: `AppShell`, `AppSidebar`, `AppTopbar`, `PageHeader`, `PageSection`, `FilterBar`, `ListPageLayout`, `DetailPageLayout`, `SettingsPageLayout`, `DashboardGrid`, `MetricCard`, `FeedbackState`, and `DataTableShell`.

`AppShell` owns the viewport boundary; its content pane is the only scroll container. `AppSidebar` is an unopinionated shell slot so an app can combine a compact product rail with a workspace navigator without copying an identical sidebar. `AppTopbar` is a fixed-height overlay slot and accepts `isHidden` for scroll-driven reveal behaviour; visual treatments such as the NETIX progressive blur remain app-specific children rather than a universal component background.

Every page follows the same anatomy: a title/subtitle with its primary action, optional filters and context controls, main content, then an explicit loading, empty, no-results, or error state. Keep destructive actions separate from the primary action. Use logical spacing and flex/grid instead of left/right-specific layout where possible.
