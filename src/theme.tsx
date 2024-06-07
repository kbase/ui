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

/**
 * This is hardcoded at the moment but
 * we should explore importing the color
 * variables from colors.scss
 */
const baseColor = 'rgb(62, 56, 50)';

export const theme = createTheme({
  palette: {
    base: {
      main: baseColor,
      contrastText: getContrastRatio(baseColor, '#fff') > 4.5 ? '#fff' : '#111',
    },
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
