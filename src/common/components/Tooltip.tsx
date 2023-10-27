import { ReactNode, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import classes from './Tooltip.module.scss';

type PopperTarget = Parameters<typeof usePopper>[0];

const TooltipSharedState: {
  portalElement?: HTMLDivElement;
} = {};

export const Tooltip = ({
  target,
  children,
  visible,
}: {
  target: PopperTarget;
  children: ReactNode;
  visible: boolean;
}) => {
  const id = useId();
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(target, popperElement, {
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
    strategy: 'absolute',
    placement: 'top',
  });

  if (TooltipSharedState.portalElement)
    return (
      <>
        {createPortal(
          visible ? (
            <div
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
              className={classes['tooltip']}
            >
              <div>{children}</div>
              <div
                ref={setArrowElement}
                style={styles.arrow}
                className={classes['arrow']}
              />
            </div>
          ) : (
            <></>
          ),
          TooltipSharedState.portalElement,
          id
        )}
      </>
    );
  return <></>;
};

export const RootTooltip = () => {
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    TooltipSharedState.portalElement = portalElement ?? undefined;
  }, [portalElement]);

  return <div ref={setPortalElement}></div>;
};
