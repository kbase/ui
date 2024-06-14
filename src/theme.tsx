import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { alpha, createTheme, getContrastRatio } from '@mui/material';
import { forwardRef } from 'react';

const RouterCompatibleLink = forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to'] }
>((props, ref) => {
  const { href, ...other } = props;
  return <RouterLink ref={ref} to={href} {...other} />;
});

// TODO: import from single source of truth
const baseColor = 'rgb(62, 56, 50)';

export const theme = createTheme({
  palette: {
    primary: {
      // TODO: import from single source of truth
      main: 'rgb(2, 109, 170)',
    },
    warning: {
      // TODO: import from single source of truth
      main: 'rgb(255, 210, 0)',
    },
    base: {
      main: baseColor,
      contrastText: getContrastRatio(baseColor, '#fff') > 4.5 ? '#fff' : '#111',
    },
  },
  typography: {
    // TODO: import from single source of truth
    fontFamily:
      'Oxygen, -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif',
  },
  components: {
    MuiLink: {
      defaultProps: {
        component: RouterCompatibleLink,
      },
      styleOverrides: {
        root: {
          textDecoration: 'none',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: RouterCompatibleLink,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation0: {
          border: '1px solid',
          borderColor: alpha(baseColor, 0.3),
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: '2.5rem',
        },
        h2: {
          fontSize: '2rem',
        },
        h3: {
          fontSize: '1.75rem',
        },
        h4: {
          fontSize: '1.5rem',
        },
        h5: {
          fontSize: '1.25rem',
        },
        h6: {
          fontSize: '1rem',
        },
      },
    },
  },
});

/**
 * Module augmentations for custom colors and prop options
 */

declare module '@mui/material/styles' {
  interface Palette {
    base: Palette['primary'];
  }

  interface PaletteOptions {
    base?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    base: true;
  }
}
