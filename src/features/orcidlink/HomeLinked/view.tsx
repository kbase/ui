import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { InfoResult } from '../../../common/api/orcidlinkAPI';
import {
  LinkRecordPublic,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import TabPanel from '../common/TabPanel';
import ManageTab from './ManageTab';
import OverviewTab from './OverviewTab';

export interface HomeLinkedProps {
  info: InfoResult;
  linkRecord: LinkRecordPublic;
  profile: ORCIDProfile;
  removeLink: () => void;
  toggleShowInProfile: () => void;
}

export default function HomeLinked({
  info,
  linkRecord,
  profile,
  removeLink,
  toggleShowInProfile,
}: HomeLinkedProps) {
  const [tab, setTab] = useState<number>(0);

  return (
    <>
      <Tabs
        variant="standard"
        onChange={(_: React.SyntheticEvent, newValue: number) => {
          setTab(newValue);
        }}
        value={tab}
      >
        <Tab label="Overview" />
        <Tab label="Manage Your Link" />
      </Tabs>
      <TabPanel index={0} value={tab}>
        <OverviewTab info={info} linkRecord={linkRecord} profile={profile} />
      </TabPanel>
      <TabPanel index={1} value={tab}>
        <ManageTab
          linkRecord={linkRecord}
          profile={profile}
          orcidSiteURL={info.runtime_info.orcid_site_url}
          removeLink={removeLink}
          toggleShowInProfile={toggleShowInProfile}
        />
      </TabPanel>
    </>
  );
}
