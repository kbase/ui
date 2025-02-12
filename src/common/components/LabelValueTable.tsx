import { ComponentProps, ReactElement, FC } from 'react';

import classes from './LabelValueTable.module.scss';

interface LabelValuePair {
  label: string | number | ReactElement;
  value: string | number | ReactElement;
}

interface LabelValueTableProps extends ComponentProps<'table'> {
  data?: LabelValuePair[];
}

/**
 * Component for displaying a flat list of label-value pairs
 * in a two column table.
 */
export const LabelValueTable: FC<LabelValueTableProps> = (props) => {
  const { className, data } = props;

  return (
    <table className={`${classes['label-value-table']} ${className || ''}`}>
      <tbody>
        {data?.map((row, i) => (
          <tr key={String(row.label) + i}>
            <th>{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
