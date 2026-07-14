import { createGlobalStyle } from 'styled-components';

// Add these once, e.g. in pages/_document.tsx <Head>:
// <link rel="preconnect" href="https://fonts.googleapis.com" />
// <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
// <link
//   href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
//   rel="stylesheet"
// />

export const SchoolAdminGlobalStyle = createGlobalStyle`
  .school-admin-root {
    font-family: ${({ theme }) => theme.font.body};
    color: ${({ theme }) => theme.colors.ink};
    -webkit-font-smoothing: antialiased;
  }

  .school-admin-root *:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
    border-radius: ${({ theme }) => theme.radius.sm};
  }

  .school-admin-root button {
    font-family: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    .school-admin-root * {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }
  }
`;
