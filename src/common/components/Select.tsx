import { FC, ReactNode, useState, useEffect } from 'react';
import ReactSelect, {
  GroupBase,
  MultiValue,
  OptionsOrGroups,
  SingleValue,
  Props as ReactSelectProps,
} from 'react-select';
import AsyncSelect from 'react-select/async';
import classes from './Select.module.scss';

export interface SelectOption {
  label: ReactNode;
  value: string | number;
  icon?: ReactNode;
}

export type OptionsArray = OptionsOrGroups<
  SelectOption,
  GroupBase<SelectOption>
>;
type OptionsAsync = (inputValue: string) => Promise<OptionsArray>;

export interface SelectProps {
  /** Sets a className attribute on the outer component */
  className?: string;
  /** If true, adds a clickable icon for clearing the select */
  clearable?: boolean;
  /** Advanced: allows manualy manipulation of react-select subcomponents */
  components?: ReactSelectProps<SelectOption>['components'];
  /** If true, sets select to disabled */
  disabled?: boolean;
  /** Whether the dropdown select menu should be pinned to the left or right
   * (default left) */
  horizontalMenuAlign?: 'left' | 'right';
  /** If true, sets select to multiple select mode */
  multiple?: boolean;
  /** onChange callback, triggered when the selected value changes */
  onChange?: (value: SelectOption[]) => void;
  /** The array of options & option groups (see react-select documentation) OR
   * an async function which returns such an array given the input content */
  options: OptionsArray | OptionsAsync;
  /** If defined, sets the value of the select. */
  value?: SingleValue<SelectOption> | MultiValue<SelectOption>;
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
  const defaultHasIcons = doesHaveIcons(options);
  const [hasIcons, setHasIcons] = useState(defaultHasIcons);

  useEffect(() => {
    // Detect if static option icons have changed
    // needed so we can deal with icons set ansynchronously
    if (!isFunc(options)) {
      setHasIcons(defaultHasIcons);
    }
  }, [options, defaultHasIcons]);

  // Add the right-aligned class if needed
  const classNames = [classes['react-select'], props.className ?? ''];
  if (props.horizontalMenuAlign === 'right') {
    classNames.push(classes['react-select--right']);
  }

  const callOnChange =
    props.onChange ??
    (() => {
      /* noop */
    });
  const handleChange = handleChangeFactory(callOnChange);
  const handleFormatOptionLabel = (data: SelectOption) => {
    return (
      <span className={classes.option_content}>
        {hasIcons && (
          <span className={classes.option_content_icon}>{data.icon}</span>
        )}
        {data.label}
      </span>
    );
  };

  // Common between sync/async
  const commonProps = {
    className: classNames.join(' '),
    /** classNamePrefix allows us to override the default styles by using global
     * classes prefixed with the below */
    classNamePrefix: 'react-select',
    components: props.components,
    formatOptionLabel: handleFormatOptionLabel,
    isClearable: props.clearable,
    isDisabled: props.disabled,
    isMulti: props.multiple,
    onChange: handleChange,
    value: props.value,
  };

  return !isFunc(options) ? (
    // Synchronous
    <ReactSelect {...commonProps} options={options} />
  ) : (
    // Asynchronous
    // Could later support pagination here with react-select-async-paginate
    <AsyncSelect
      {...commonProps}
      loadOptions={async (inputValue: string) => {
        const newOpts = await options(inputValue);
        setHasIcons(doesHaveIcons(newOpts));
        return newOpts;
      }}
      defaultOptions={true}
    />
  );
};

const isFunc = (opts: SelectProps['options']): opts is OptionsAsync => {
  return typeof opts === 'function';
};

const doesHaveIcons = (opts: SelectProps['options']): boolean => {
  // Double check that we're not dealing with async options
  // mostly appeasing typescript here
  if (isFunc(opts)) return false;
  return opts.some((optionOrGroup) => {
    if ('options' in optionOrGroup) {
      return doesHaveIcons(optionOrGroup.options);
    }
    return !!optionOrGroup.icon;
  });
};
