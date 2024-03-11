import { Container } from '@mui/material';
import { FC, ReactNode } from 'react';
import classes from './PageHeader.module.scss';

interface PageHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
}

/**
 * Header section for app landing pages.
 * Not currently in use.
 */
export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
}) => {
  return (
    <div className={classes['page-header']}>
      <Container
        disableGutters
        sx={{
          marginLeft: 0,
          padding: '2rem 1rem',
        }}
      >
        {title && <h1 className={classes['page-title']}>{title}</h1>}
        {subtitle && <div className={classes['page-subtitle']}>{subtitle}</div>}
        {description && (
          <div className={classes['page-description']}>{description}</div>
        )}
      </Container>
    </div>
  );
};
