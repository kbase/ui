import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageNotFound from '../layout/PageNotFound';

/**
 * 404s from the legacy site are redirected from legacy.DOMAIN/[some/path/here] to DOMAIN/fallback/[some/path/here]
 * this component handles these fallback redirects for pages such as '/narratives'
 */
export const Fallback = () => {
  const location = useParams();
  const navigate = useNavigate();

  const fallbackPath = location['*']?.toLowerCase();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Make sure we are in window.top (not within an iframe),
    if (window && window.top && window !== window.top) {
      // Not in top window, redirect top window to current location
      window.top.location = window.location;
    } else {
      // We are in the top window
      // redirect appropriately based on the fallbackPath, otherwise set notFound to true
      if (fallbackPath === 'narratives') {
        navigate('/narratives');
      } else {
        setNotFound(true);
      }
    }
  }, [fallbackPath, navigate]);

  // show PageNotFound if we don't have a fallback redirect
  if (notFound) {
    return <PageNotFound />;
  }
  return <p>Redirecting...</p>;
};
