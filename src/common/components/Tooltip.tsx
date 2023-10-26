import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import classes from './Tooltip.module.scss';

type PopperTarget = Parameters<typeof usePopper>[0];

const TooltipSharedState: {
  targetSetter?: (target: PopperTarget) => unknown;
  vizSetter?: (visibility: boolean) => unknown;
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
  useEffect(() => {
    if (TooltipSharedState.targetSetter)
      TooltipSharedState.targetSetter(target);
    if (TooltipSharedState.vizSetter) TooltipSharedState.vizSetter(visible);
  });
  if (TooltipSharedState.portalElement)
    return (
      <>{createPortal(children, TooltipSharedState.portalElement, 'tooltip')}</>
    );
  return <></>;
};

export const RootTooltip = () => {
  const [targetElement, setTargetElement] = useState<PopperTarget>(undefined);
  const [visibility, setVisibility] = useState<boolean>(false);

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(
    null
  );

  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    TooltipSharedState.targetSetter = setTargetElement;
    TooltipSharedState.vizSetter = setVisibility;
    TooltipSharedState.portalElement = portalElement ?? undefined;
  }, [setTargetElement, portalElement]);

  const { styles, attributes } = usePopper(targetElement, popperElement, {
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

  return (
    <div
      hidden={!visibility}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
      className={classes['tooltip']}
    >
      <div ref={setPortalElement}></div>
      <div
        ref={setArrowElement}
        style={styles.arrow}
        className={classes['arrow']}
      />
    </div>
  );
};
