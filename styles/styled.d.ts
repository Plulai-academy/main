import 'styled-components';
import type { AppTheme } from '../lib/school-admin/theme';

// Lets styled-components' `theme` prop and `useTheme()` know the shape
// of our tokens throughout the app.
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends AppTheme {}
}
