import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { InfoResult } from '../../../common/api/orcidlinkAPI';
import {
  LinkRecordPublic,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import TabPanel from '../common/TabPanel';
import OverviewTab from './OverviewTab';

export interface HomeLinkedProps {
  info: InfoResult;
  linkRecord: LinkRecordPublic;
  profile: ORCIDProfile;
}

export default function HomeLinked({
  info,
  linkRecord,
  profile,
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
        <div>MANAGE TAB</div>
      </TabPanel>
    </>
  );
}
