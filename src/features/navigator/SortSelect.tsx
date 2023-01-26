import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Select, SelectOption } from '../../common/components';
import { generatePathWithSearchParams } from '../../features/params/paramsSlice';
import { sortNames } from './common';
import classes from './Navigator.module.scss';

const SortSelect: FC<{ sort: string }> = ({ sort }) => {
  const loc = useLocation();
  const navigate = useNavigate();
  const SortSelectOnChange = (option: SelectOption[]) => {
    const queryParams = new URLSearchParams(loc.search);
    const { value } = option[0];
    queryParams.set('sort', value.toString());
    const searchParams = Object.fromEntries(queryParams.entries());
    const path = generatePathWithSearchParams(loc.pathname, searchParams);
    navigate(path);
  };
  const options = Object.entries(sortNames).map(([key, value]) => ({
    value: key,
    label: value,
  }));
  const optionSelected = Object.entries(sortNames)
    .filter(([key, value]) => key === sort)
    .map(([key, value]) => ({
      value: key,
      label: value,
    }))[0];
  return (
    <Select
      className={classes.sort}
      onChange={SortSelectOnChange}
      options={options}
      value={optionSelected}
    />
  );
};

export default SortSelect;
