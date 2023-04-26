import { createSlice } from '@reduxjs/toolkit';
import { IconInfo, typeIconInfos } from './common';
import { faCube, faFile, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getMethodBriefInfo } from '../../common/api/narrativeMethodStore';
import { useMemo } from 'react';
import { useAppSelector } from '../../common/hooks';

export enum AppTag {
  release = 'release',
  beta = 'beta',
  dev = 'dev',
}

const isAppTag = (appTag: string): appTag is AppTag => {
  return appTag in AppTag;
};

type AppIconCache = { [appTag in AppTag]: { [appId: string]: IconInfo } };

interface IconState {
  typeIconInfos: { [key: string]: IconInfo };
  appIconCache: AppIconCache;
  defaultApp: IconInfo;
  defaultType: IconInfo;
  loadingIcon: IconInfo;
}

const initialState: IconState = {
  appIconCache: {
    release: {},
    beta: {},
    dev: {},
  },
  typeIconInfos,
  defaultApp: {
    icon: faCube,
    color: '#683AB7',
  },
  defaultType: {
    icon: faFile,
    color: '#F44336',
  },
  loadingIcon: {
    icon: faSpinner,
    color: 'silver',
  },
};

export const iconSlice = createSlice({
  name: 'icons',
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder.addMatcher(
      getMethodBriefInfo.matchFulfilled,
      (state, { payload, meta }) => {
        if (!payload) return;
        // Update Icon Cache when getMethodBriefInfo succeeds
        const appIds = meta.arg.originalArgs[0].ids;
        const appTags = meta.arg.originalArgs[0].ids;
        for (let i = 0; i < appIds.length; i++) {
          const appId = appIds[i];
          const appTag = appTags[i];
          const iconPath = payload[i]?.icon?.url;
          if (appId && iconPath && isAppTag(appTag)) {
            state.appIconCache[appTag][appId] = {
              icon: `/services/narrative_method_store/${iconPath}`,
              color: 'silver',
            };
          }
        }
      }
    ),
});

export default iconSlice.reducer;

export const useAppIcon = ({
  appId,
  appTag,
}: {
  appId: string;
  appTag: AppTag;
}): IconInfo => {
  // Get the default, loading, and cached icons
  const defaultIcon = useAppSelector(({ icons }) => icons.defaultApp);
  const loadingIcon = useAppSelector(({ icons }) => icons.loadingIcon);
  const cachedIcon = useAppSelector(
    ({ icons }) => icons.appIconCache[appTag][appId]
  );

  // If there isn't a cached icon, update the cache by calling getMethodBriefInfo
  const getMethodBriefInfoParams = useMemo(() => {
    return [{ ids: [appId], tag: appTag }];
  }, [appId, appTag]);
  const out = getMethodBriefInfo.useQuery(getMethodBriefInfoParams, {
    skip: !!cachedIcon,
  });
  console.log({ out }); // eslint-disable-line no-console
  // TODO: Note that icons will not work locally without configuring a proxy.
  // For example, MEGAHIT/run_megahit will receive the default icon.
  // https://ci.kbase.us/services/narrative_method_store/img?method_id=MEGAHIT/run_megahit&image_name=megahit-blue.png&tag=release
  const { isLoading } = out;

  if (cachedIcon) return cachedIcon;
  if (isLoading) return loadingIcon;
  return defaultIcon;
};
