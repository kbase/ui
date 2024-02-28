import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { createTheme } from '@mui/material';
import { forwardRef } from 'react';

const RouterCompatibleLink = forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to'] }
>((props, ref) => {
  const { href, ...other } = props;
  return <RouterLink ref={ref} to={href} {...other} />;
});

export const theme = createTheme({
  components: {
    MuiLink: {
      defaultProps: {
        component: RouterCompatibleLink,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: RouterCompatibleLink,
      },
    },
  },
});
