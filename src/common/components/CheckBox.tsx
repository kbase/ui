import { HTMLProps, useEffect, useRef } from 'react';

export const CheckBox = ({
  partial,
  className = '',
  ...rest
}: { partial?: boolean } & HTMLProps<HTMLInputElement>) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof partial === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && partial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, partial]);

  return <input type="checkbox" ref={ref} className={className} {...rest} />;
};
