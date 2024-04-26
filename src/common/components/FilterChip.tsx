// in common/components as samples will also soon have filtering
import { Chip, Tooltip } from '@mui/material';
import { ComponentProps } from 'react';
import { FilterState } from '../../features/collections/collectionsSlice';

interface FilterChipProps extends ComponentProps<typeof Chip> {
  name: string;
  filter: FilterState;
  showValue?: boolean;
  showWhenUnused?: boolean;
}

export const FilterChip = ({
  name,
  filter,
  showValue = true,
  showWhenUnused = false,
  ...chipProps
}: FilterChipProps) => {
  let filterString = '';
  if (filter.value) {
    if (
      filter.type === 'date' ||
      filter.type === 'int' ||
      filter.type === 'float'
    ) {
      const [minString, maxString] = filter.value.range
        .map((val) => {
          return filter.type === 'date' ? new Date(val) : Number(val);
        })
        .map((val) => val.toLocaleString());
      filterString = `${minString} to ${maxString}`;
    } else if (filter.type === 'bool') {
      filterString = filter.value.range[1] === 1 ? 'true' : 'false';
    } else {
      const val = filter.value;
      if (typeof val === 'string') {
        if (filter.type === 'fulltext')
          filterString = `includes words "${filter.value}"`;
        if (filter.type === 'identity')
          filterString = `equals "${filter.value}"`;
        if (filter.type === 'ngram') filterString = `ngram "${filter.value}"`;
        if (filter.type === 'prefix')
          filterString = `has prefix "${filter.value}*"`;
      } else {
        filterString = `???`;
      }
    }
  }
  if (!showWhenUnused && !filterString) {
    return <></>;
  }

  return (
    <Tooltip
      title={filterString}
      arrow
      placement="top"
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -10],
              },
            },
          ],
        },
      }}
    >
      <Chip label={name} {...chipProps} />
    </Tooltip>
  );
};
