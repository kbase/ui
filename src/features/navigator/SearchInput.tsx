import { ChangeEvent, FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input, InputInterface } from '../../common/components';

interface SearchInterface extends InputInterface {
  search: string;
}
const SearchInput: FC<SearchInterface> = ({
  label,
  search,
}: SearchInterface) => {
  const loc = useLocation();
  const navigate = useNavigate();
  const searchChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const queryParams = new URLSearchParams(loc.search);
    const val = event.target.value;
    if (!val) {
      queryParams.delete('search');
    } else {
      queryParams.set('search', val);
    }
    const path = [loc.pathname, queryParams.toString()].join('?');
    navigate(path);
  };
  return (
    <Input
      label={label}
      onChange={searchChangeHandler}
      placeholder=":mag:"
      value={search}
    />
  );
};

export default SearchInput;
