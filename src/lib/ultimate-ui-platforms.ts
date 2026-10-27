import type { PlatformKey } from '../platform';

/**
 * The XAML platforms, which ship under the Ultimate UI brand rather than Ignite UI and show
 * their named source files (Sample.xaml, Sample.xaml.cs, ...) as code tabs.
 *
 * Kept apart from platform.ts so the client sample widget can import it without bundling the
 * platform registry's head entries.
 */
export const ULTIMATE_UI_PLATFORMS: ReadonlySet<string> = new Set<PlatformKey>(['winui', 'uno']);
