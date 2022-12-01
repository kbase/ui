import { Route, Routes } from 'react-router-dom';
import PageNotFound from '../layout/PageNotFound';
import { CollectionDetail } from './CollectionDetail';
import { CollectionsList } from './CollectionsList';

export default function Collections() {
  return (
    <Routes>
      <Route index element={<CollectionsList />} />
      <Route path=":id">
        <Route index element={<CollectionDetail />} />
        <Route path=":data_product" element={<CollectionDetail />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
