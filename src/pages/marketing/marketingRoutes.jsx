import React from 'react';
import { SOLUTIONS, INDUSTRIES, COMPLIANCE_PAGES } from '../../data/marketingPages';
import SolutionPage from './SolutionPage';
import IndustryPage from './IndustryPage';
import CompliancePage from './CompliancePage';
import TrustPage from './TrustPage';
import DemoPage from './DemoPage';

/**
 * Every marketing route as { path, element }.
 * Explicit per-slug elements (no useParams) so this works on React Router v5 and v6.
 *
 * React Router v6 usage inside your <Routes>:
 *   {marketingRoutes.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
 *
 * React Router v5 usage inside your <Switch>:
 *   {marketingRoutes.map((r) => <Route key={r.path} exact path={r.path}>{r.element}</Route>)}
 */
export const marketingRoutes = [
  ...SOLUTIONS.map((p) => ({ path: `/${p.slug}`, element: <SolutionPage slug={p.slug} /> })),
  ...INDUSTRIES.map((p) => ({
    path: `/industries/${p.slug}`,
    element: <IndustryPage slug={p.slug} />
  })),
  ...COMPLIANCE_PAGES.map((p) => ({
    path: `/compliance/${p.slug}`,
    element: <CompliancePage slug={p.slug} />
  })),
  { path: '/trust', element: <TrustPage /> },
  { path: '/demo', element: <DemoPage /> }
];

export default marketingRoutes;
