import { FC } from 'react';
import { Route, Routes as RRRoutes } from 'react-router-dom';

import Auth from '../features/auth/Auth';
import Count from '../features/count/Counter';
import Legacy from '../features/legacy/Legacy';
import Navigator from '../features/navigator/Navigator';
import PageNotFound from '../features/layout/PageNotFound';
import ProfileWrapper from '../features/profile/Profile';

const Routes: FC = () => (
  <>
    <RRRoutes>
      <Route path="/legacy/*" element={Legacy} />
      <Route
        path="/profile/:usernameRequested/narratives"
        element={<ProfileWrapper />}
      />
      <Route path="/profile/:usernameRequested" element={<ProfileWrapper />} />
      <Route path="/profile" element={<ProfileWrapper />} />
      <Route path="/count" element={<Count />} />
      <Route path="/auth" element={<Auth />} />
      <Route path={'/:id/:obj/:ver'} element={<Navigator />} />
      <Route path={'/:category'} element={<Navigator />} />
      <Route path={'/:category/:id/:obj/:ver'} element={<Navigator />} />
      <Route path="/" element={<Navigator />} />
      <Route path="*" element={<PageNotFound />} />
    </RRRoutes>
  </>
);

export default Routes;
