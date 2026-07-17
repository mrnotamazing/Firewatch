import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** React Router doesn't reset scroll position on navigation by default — without this,
 * landing on a new page can leave you scrolled to wherever the previous page left off. */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
