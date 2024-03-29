import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import ReactSelect, {
  GroupBase,
  MultiValue,
  OptionsOrGroups,
  SingleValue,
  Props as ReactSelectProps,
} from 'react-select';
import classes from './Select.module.scss';

export interface SelectOption {
  label: ReactNode;
  value: string | number;
  icon?: ReactNode;
  fullWidth?: boolean; // ignores icon padding when icons are present
}

export type OptionsArray = OptionsOrGroups<
  SelectOption,
  GroupBase<SelectOption>
>;

export interface SelectProps {
  children?: React.ReactNode;
  /**html ID for integrating labels, etc */
  id?: string;
  /** Sets a className attribute on the outer component */
  className?: string;
  /** If true, adds a clickable icon for clearing the select */
  clearable?: boolean;
  /** Advanced: allows manually manipulation of react-select subcomponents */
  components?: ReactSelectProps<SelectOption>['components'];
  /** If true, sets select to disabled */
  disabled?: boolean;
  /** If true, sets select to loading */
  loading?: boolean;
  /** Whether the dropdown select menu should be pinned to the left or right
   * (default left) */
  horizontalMenuAlign?: 'left' | 'right';
  /** If true, sets select to multiple select mode */
  multiple?: boolean;
  /** onChange callback, triggered when the selected value changes */
  onChange?: (value: SelectOption[]) => void;
  /** onSearch callback, triggered when the user types in the suggest box */
  onSearch?: (value: string) => void;
  /** The array of options & option groups (see react-select documentation) */
  options: OptionsArray;
  /** If defined, sets the value of the select. */
  value?: SingleValue<SelectOption> | MultiValue<SelectOption>;
  /** If defined, sets the value of the placeholder */
  placeholder?: string;
  /** Set where the menu should open in relation to the input */
  menuPlacement?: ReactSelectProps['menuPlacement'];
}

export const handleChangeFactory = (
  callOnChange: (value: SelectOption[]) => void
) => {
  return (options: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
    if (options === null) return;
    if ('value' in options) {
      callOnChange([options]);
    } else {
      // multiple/no options returned
      callOnChange([...options]);
    }
  };
};

/**
 * Select component that supports multiple selection, async options loading,
 * custom styling, and more.
 */
export const Select: FC<SelectProps> = (props) => {
  const options = props.options;

  // Detect how to format options based on if they have icons
  const hasIcons = useMemo(() => doesHaveIcons(options), [options]);

  // Add the right-aligned class if needed
  const classNames = [classes['react-select'], props.className ?? ''];
  if (props.horizontalMenuAlign === 'right') {
    classNames.push(classes['react-select--right']);
  }

  const [searchString, setSearchString] = useState('');
  const handleInputChange = async (searchInput: string) => {
    setSearchString(searchInput);
  };
  const { onSearch } = props;
  useEffect(() => {
    if (onSearch) onSearch(searchString);
  }, [onSearch, searchString]);

  const callOnChange: SelectProps['onChange'] = (options) => {
    const opt = options?.[0];
    if (props.onChange) return props.onChange(options);
    if (opt) {
      if (typeof opt.label === 'string') {
        setSearchString(opt.label);
      }
    }
    return;
  };

  const handleChange = handleChangeFactory(callOnChange);
  const handleFormatOptionLabel = (data: SelectOption) => {
    return (
      <span className={classes.option_content}>
        {hasIcons && !data.fullWidth ? (
          <span className={classes.option_content_icon}>{data.icon}</span>
        ) : null}
        {data.label}
      </span>
    );
  };

  return (
    <ReactSelect
      id={props.id}
      placeholder={props.placeholder}
      className={classNames.join(' ')}
      /** classNamePrefix allows us to override the default styles by using global
       * classes prefixed with the below */
      classNamePrefix={'react-select'}
      components={props.components}
      formatOptionLabel={handleFormatOptionLabel}
      isClearable={props.clearable}
      isDisabled={props.disabled}
      isLoading={props.loading}
      isMulti={props.multiple}
      menuPlacement={props.menuPlacement}
      onChange={handleChange}
      value={props.value}
      options={options}
      onInputChange={handleInputChange}
      inputValue={searchString}
      // don't auto-filter the list if we're using onSearch
      filterOption={props.onSearch ? () => true : undefined}
    />
  );
};

const doesHaveIcons = (opts: SelectProps['options']): boolean => {
  // mostly appeasing typescript here
  return opts.some((optionOrGroup) => {
    if ('options' in optionOrGroup) {
      return doesHaveIcons(optionOrGroup.options);
    }
    return !!optionOrGroup.icon;
  });
};
