import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FC, useEffect } from 'react';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { Button } from '../../common/components';
import { PlaceholderFactory } from '../../common/components/PlaceholderFactory';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { NarrativeListDoc } from '../../common/types/NarrativeDoc';
import { usePageTitle } from '../../features/layout/layoutSlice';
import {
  isSortString,
  isCategoryString,
  keepParamsForLocation,
  searchParams,
  Category,
  Sort,
} from './common';
import {
  navigatorSelected,
  select,
  setCategory,
  useNarratives,
} from './navigatorSlice';
import RefreshButton from './RefreshButton';
import SortSelect from './SortSelect';
import classes from './Navigator.module.scss';

const NarrativeNewButton: FC = () => (
  <a href="/#narrativemanager/new" rel="noopener noreferrer" target="_blank">
    <Button className={`${classes.button} ${classes['narrative-new']}`}>
      <FAIcon icon={faPlus} /> New Narrative
    </Button>
  </a>
);

const HeaderTabs: FC<{ category: string }> = ({ category }) => {
  const loc = useLocation();
  const keepSearch = keepParamsForLocation({
    location: loc,
    params: searchParams,
  });
  return (
    <ul className={classes.tabs}>
      <Link to={keepSearch('/narratives/')}>
        <li className={category === 'own' ? classes.active : ''}>
          My Narratives
        </li>
      </Link>
      <Link to={keepSearch('/narratives/shared/')}>
        <li className={category === 'shared' ? classes.active : ''}>
          Shared With Me
        </li>
      </Link>
      <Link to={keepSearch('/narratives/tutorials/')}>
        <li className={category === 'tutorials' ? classes.active : ''}>
          Tutorials
        </li>
      </Link>
      <Link to={keepSearch('/narratives/public/')}>
        <li className={category === 'public' ? classes.active : ''}>Public</li>
      </Link>
    </ul>
  );
};

const HeaderNavigationContainer: FC<{ category: string }> = ({ category }) => (
  <nav className={classes.header}>
    <HeaderTabs category={category} />
    <NarrativeNewButton />
  </nav>
);

const HeaderContainer: FC<{ category: string; search: string; sort: string }> =
  ({ category, search, sort }) => (
    <header className={classes.header}>
      <HeaderNavigationContainer category={category} />
      <FilterContainer search={search} sort={sort} />
    </header>
  );

const SearchInput = PlaceholderFactory('SearchInput');
const FilterContainer: FC<{ search: string; sort: string }> = ({
  search,
  sort,
}) => {
  return (
    <div className={classes.search}>
      <SearchInput label={''} search={search} />
      <SortSelect sort={sort} />
      <RefreshButton />
    </div>
  );
};

const NarrativeList = PlaceholderFactory('NarrativeList');
/* NarrativeView should take (at least) a narrative upa as prop, but if it is
   null then it should show a message saying there is no narrative selected.
*/
const NarrativeView = PlaceholderFactory('NarrativeView');

const MainContainer: FC<{
  limit: number;
  items: NarrativeListDoc[];
  narrative: string | null;
  view: string;
}> = ({ limit, items, narrative, view }) => {
  return (
    <div className={classes.main} /* main fragment */>
      <div className={classes.container}>
        {items.length === 0 ? (
          <>No narratives match this query.</>
        ) : (
          <>
            <div className={classes.list}>
              <NarrativeList
                hasMoreItems={items.length - limit > 0}
                items={items.slice(0, limit)}
                itemsRemaining={items.length - limit}
                loading={false}
                narrative={narrative}
                showVersionDropdown={true}
              />
            </div>
            <NarrativeView
              className={classes.details}
              narrative={narrative}
              view={view}
            />
          </>
        )}
      </div>
    </div>
  );
};

const emptyItem = { access_group: 0, obj_id: 0, version: 0 } as const;
const searchParamDefaults = {
  limit: '20',
  search: '',
  sort: Sort['-updated'],
  view: 'data',
} as const;
const narrativesByAccessGroup = (narratives: NarrativeListDoc[]) => {
  return Object.fromEntries(
    narratives.map((narrative) => [narrative.access_group, narrative])
  );
};
const getNarrativeSelected = (parameters: {
  id: string | undefined;
  obj: string | undefined;
  ver: string | undefined;
  items: NarrativeListDoc[];
}) => {
  const { id, obj, ver, items } = parameters;
  const narrativesLookup = narrativesByAccessGroup(items);
  const firstItem = items.length ? items[0] : emptyItem;
  const { access_group, obj_id, version } =
    id && id in narrativesLookup ? narrativesLookup[id] : firstItem;
  const upa = `${access_group}/${obj_id}/${version}`;
  return id && obj && ver ? `${id}/${obj}/${ver}` : upa;
};
// Navigator component
const Navigator: FC = () => {
  usePageTitle('Narrative Navigator');
  const dispatch = useAppDispatch();
  const previouslySelected = useAppSelector(navigatorSelected);
  const { category, id, obj, ver } = useParams();
  const items = useNarratives();
  const searchParamsDefaults = new URLSearchParams(searchParamDefaults);
  const [searchParams] = useSearchParams(searchParamsDefaults);
  const { limit, search, sort, view } = Object.fromEntries(
    searchParams.entries()
  );
  const sortKey = sort && isSortString(sort) ? Sort[sort] : Sort['-updated'];
  const categoryFilter =
    category && isCategoryString(category)
      ? Category[category]
      : Category['own'];

  const narrativeSelected = getNarrativeSelected({ id, obj, ver, items });
  // hooks that update state
  useEffect(() => {
    dispatch(setCategory(categoryFilter));
    if (previouslySelected !== narrativeSelected) {
      dispatch(select(narrativeSelected));
    }
  }, [categoryFilter, dispatch, previouslySelected, narrativeSelected]);
  /*
  The default selected narrative should be the 0 indexed item in items.
  If the length of items is 0 then a message should be shown.
  If the URL specifies a valid narrative object then it should be selected,
  otherwise the default should be selected.
  */
  if (items.length === 0) {
    return (
      <>
        <section className={classes.navigator}>
          <HeaderContainer
            category={categoryFilter}
            search={search}
            sort={sortKey}
          />
          <MainContainer limit={20} items={[]} narrative={null} view={view} />
        </section>
      </>
    );
  }
  // render
  return (
    <>
      <section className={classes.navigator}>
        <HeaderContainer
          category={categoryFilter}
          search={search}
          sort={sortKey}
        />
        <MainContainer
          limit={+limit}
          items={items}
          narrative={narrativeSelected}
          view={view}
        />
      </section>
    </>
  );
};

export default Navigator;
