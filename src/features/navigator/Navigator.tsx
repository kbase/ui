import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FC, useEffect } from 'react';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import { authUsername } from '../../features/auth/authSlice';
import { usePageTitle } from '../../features/layout/layoutSlice';
import {
  getParams,
  generatePathWithSearchParams,
} from '../../features/params/paramsSlice';
import {
  Category,
  Sort,
  isCategoryString,
  isSortString,
  navigatorPath,
  navigatorPathWithCategory,
  normalizeVersion,
  searchParams,
} from './common';
import {
  useNarratives,
  //useNarrativeServiceStatus // See below
} from './hooks';
import {
  loading,
  navigatorSelected,
  narrativeDocs,
  narrativeDocsCount,
  select,
  setCategory,
} from './navigatorSlice';
import NarrativeList from './NarrativeList/NarrativeList';
import NarrativeView from './NarrativeView';
import RefreshButton from './RefreshButton';
import SearchInput from './SearchInput';
import SortSelect from './SortSelect';
import { LinkButton } from '../../common/components/LinkButton';
import classes from './Navigator.module.scss';

const NarrativeNewButton: FC = () => (
  <LinkButton
    href="/#narrativemanager/new"
    rel="noopener noreferrer"
    target="_blank"
    color="primary"
    size="large"
    icon={<FAIcon icon={faPlus} />}
    className={classes['narrative-new-button']}
  >
    New Narrative
  </LinkButton>
);

const HeaderTabs: FC<{ category: string }> = ({ category }) => {
  const europaParams = useAppSelector(getParams);
  const searchParamsCurrent = Object.fromEntries(
    searchParams.map((param) => [param, europaParams[param]])
  );
  const categoryPathWithSearchParams = (pathSpec: string) => {
    return generatePathWithSearchParams(pathSpec, searchParamsCurrent);
  };
  const { own, shared, tutorials, public: public_ } = Category;
  return (
    <ul className={classes.tabs}>
      <li className={category === own ? classes.active : ''}>
        <Link to={categoryPathWithSearchParams('/narratives/')}>
          My Narratives
        </Link>
      </li>
      <li className={category === shared ? classes.active : ''}>
        <Link to={categoryPathWithSearchParams('/narratives/shared/')}>
          Shared With Me
        </Link>
      </li>
      <li className={category === tutorials ? classes.active : ''}>
        <Link to={categoryPathWithSearchParams('/narratives/tutorials/')}>
          Tutorials
        </Link>
      </li>
      <li className={category === public_ ? classes.active : ''}>
        <Link to={categoryPathWithSearchParams('/narratives/public/')}>
          Public
        </Link>
      </li>
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

const FilterContainer: FC<{ search: string; sort: string }> = ({
  search,
  sort,
}) => {
  return (
    <div className={classes.search}>
      <SearchInput label={<FAIcon icon={faSearch} />} search={search} />
      <SortSelect sort={sort} />
      <RefreshButton />
    </div>
  );
};

const MainContainer: FC<{
  limit: number;
  limitTemplate: (limit: number) => string;
  items: NarrativeDoc[];
  narrativeUPA: string;
  view: string;
}> = ({ limit, limitTemplate, items, narrativeUPA, view }) => {
  const narrativeDocsMatched = useAppSelector(narrativeDocsCount);
  const loadingState = useAppSelector(loading);
  const nextLimit = limitTemplate(limit + 20);
  return (
    <div className={classes.main} /* main component */>
      <div className={classes.container}>
        <div className={classes.list}>
          <NarrativeList
            hasMoreItems={narrativeDocsMatched > limit}
            items={items.slice(0, limit)}
            itemsRemaining={Math.max(narrativeDocsMatched - limit, 0)}
            loading={loadingState}
            narrativeUPA={narrativeUPA}
            nextLimit={nextLimit}
            showVersionDropdown={true}
          />
        </div>
        <NarrativeView narrativeUPA={narrativeUPA} view={view} />
      </div>
    </div>
  );
};

const emptyItem = { access_group: 0, obj_id: 1, version: 1 } as const;
const searchParamDefaults = {
  limit: '20',
  search: '',
  sort: Sort['-updated'],
  view: 'data',
} as const;
const narrativesByAccessGroup = (narratives: NarrativeDoc[]) => {
  return Object.fromEntries(
    narratives.map((narrative) => [narrative.access_group, narrative])
  );
};
const getNarrativeSelected = (parameters: {
  id?: string;
  obj?: string;
  verRaw?: string;
  items: NarrativeDoc[];
}) => {
  const { id, obj, verRaw, items } = parameters;
  const narrativesLookup = narrativesByAccessGroup(items);
  const firstItem = items.length ? items[0] : emptyItem;
  const { access_group, obj_id, version } =
    id && id in narrativesLookup ? narrativesLookup[id] : firstItem;
  const upa = `${access_group}/${obj_id}/${version}`;
  const ver = Math.min(Number(normalizeVersion(verRaw)), version);
  return id && obj && ver ? `${id}/${obj}/${ver}` : upa;
};
// Navigator component
const Navigator: FC = () => {
  /* general hooks */
  usePageTitle('Narrative Navigator');
  const loc = useLocation();
  const { category, id, obj, ver: verRaw } = useParams();
  const categoryFilter =
    category && isCategoryString(category)
      ? Category[category]
      : Category['own'];
  const dispatch = useAppDispatch();
  const searchParamsDefaults = new URLSearchParams(searchParamDefaults);
  const [searchParams] = useSearchParams(searchParamsDefaults);
  const { limit, search, sort, view } = Object.fromEntries(
    searchParams.entries()
  );
  /* hooks for state data */
  const username = useAppSelector(authUsername);
  const previouslySelected = useAppSelector(navigatorSelected);
  const europaParams = useAppSelector(getParams);
  const limitTemplate = (nextLimit: number) =>
    generatePathWithSearchParams(loc.pathname, {
      ...europaParams,
      limit: nextLimit.toString(),
    });
  const sortKey = sort && isSortString(sort) ? Sort[sort] : Sort['-updated'];
  useNarratives({
    category: categoryFilter,
    limit: Number(limit),
    offset: 0,
    sort: sortKey,
    term: search,
    username,
  });
  /* This causes tests to hang which means there is probably a bug in the way
     dynamic services are handled.
  // useNarrativeServiceStatus();
   */
  const items = useAppSelector(narrativeDocs);
  const narrativeSelected = getNarrativeSelected({ id, obj, verRaw, items });
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
          <span>No narratives match this query.</span>
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
          limitTemplate={limitTemplate}
          items={items}
          narrativeUPA={narrativeSelected}
          view={view}
        />
      </section>
    </>
  );
};

export { navigatorPath, navigatorPathWithCategory };
export default Navigator;
