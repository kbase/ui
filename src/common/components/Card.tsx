import {
  Children,
  ComponentProps,
  FC,
  HTMLAttributes,
  ReactElement,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Card.module.scss';

/**
 * Component for rendering a data summary as a card.
 * Can behave as static (no onClick or linkTo), as an internal link (when linkTo
 * is defined), or as a button (when onClick is defined). Link behavior takes
 * precedence. A11y compatable (tab-selectable, enter/spacebar to simulate click)
 */
export const Card: FC<{
  /** Title of the Card, may be a string or any react element */
  title: string | ReactElement;
  /** Subtitle of the Card, may be a string or any react element */
  subtitle?: string | ReactElement;
  /** Image for the card, any react element, but preferably and `<img>` */
  image?: ReactElement;
  /** When true, the card will appear selected */
  selected?: boolean;
  /** An internal link, when defined clicking the Card will navigate to the link */
  linkTo?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}> = ({ title, subtitle, image, onClick, linkTo, selected, className }) => {
  const navigate = useNavigate();
  const rootDiv = useRef<HTMLDivElement>(null);

  const clickableRole = linkTo ? 'link' : onClick ? 'button' : undefined;
  const handleClick: (e: React.MouseEvent) => void = useCallback(
    (e: React.MouseEvent) => {
      if (onClick) onClick(e);
      if (linkTo) navigate(linkTo);
    },
    [linkTo, onClick, navigate]
  );

  let classNames: string = [
    'card',
    clickableRole ? 'clickable' : '',
    selected ? 'selected' : '',
  ]
    .map((c) => classes[c])
    .join(' ');

  if (className) classNames += `${className}`;

  const clickableProps: HTMLAttributes<HTMLDivElement> | undefined =
    clickableRole
      ? {
          role: clickableRole,
          tabIndex: 0,
          'aria-pressed': selected,
          onClick: handleClick,
          /** For keyboard a11y */
          onKeyDown: (ev, ...args) =>
            [' ', 'Enter', 'Spacebar'].includes(ev.key)
              ? rootDiv?.current?.click()
              : null,
        }
      : undefined;

  return (
    <div
      className={classNames}
      ref={rootDiv}
      {...clickableProps}
      data-testid="card"
    >
      {image ? <div className={classes['image-wrapper']}>{image}</div> : null}
      <div className={classes['body']}>
        <div>{title}</div>
        {subtitle ? (
          <div className={classes['subtitle']}>{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Simple wrapper component for rendering a list of cards.
 * @example ```tsx
 * <CardList>
 *   <Card {...}/>
 *   <Card {...}/>
 * <CardList/>
 * ```
 */
export const CardList: FC<ComponentProps<'ol'>> = ({ children, ...props }) => {
  return (
    <ol
      {...props}
      data-testid="cardList"
      className={props.className + ' ' + classes['card-list']}
    >
      {Children.map(children, (child) => (
        <li>{child}</li>
      ))}
    </ol>
  );
};
