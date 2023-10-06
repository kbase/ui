import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageNotFound from '../layout/PageNotFound';

/**
 * 404s from the legacy site are redirected from legacy.DOMAIN/[some/path/here] to DOMAIN/fallback/[some/path/here]
 */
export const Fallback = () => {
  const location = useParams();
  const navigate = useNavigate();

  const fallbackPath = location['*']?.toLowerCase();

  // Make sure we are in window.top (not within an iframe)
  // do this in a useEffect to run it before the first render
  useEffect(() => {
    if (window.top && window !== window.top) {
      window.top.location = window.location;
    }
  }, []);

  // redirect appropriately based on the fallbackPath, or render a PageNotFound
  if (fallbackPath === 'narratives') {
    navigate('/narratives');
  } else {
    return <PageNotFound />;
  }

  return <p>Redirecting...</p>;
};
