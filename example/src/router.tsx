import { createBrowserRouter } from "react-router-dom";
import Layout from "./elements/Layout";
import BasicMutation from "./elements/mutations/BasicMutation";
import ModifyCache from "./elements/mutations/ModifyCache";
import RefetchAfterMutation from "./elements/mutations/RefetchAfterMutation";
import RevalidateAfterMutation from "./elements/mutations/RevalidateAfterMutation";
import BasicFetch from "./elements/queries/BasicFetch";
import CacheData from "./elements/queries/CacheData";
import CallbackHooks from "./elements/queries/CallbackHooks";
import LazyFetch from "./elements/queries/LazyFetch";
import RedundantRequests from "./elements/queries/RedundantRequests";
import RefetchOnFocus from "./elements/queries/RefetchOnFocus";

export default createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'queries',
        children: [
          {
            path: 'basic-fetch',
            element: <BasicFetch />
          },
          {
            path: 'lazy-fetch',
            element: <LazyFetch />
          },
          {
            path: 'redundant-requests',
            element: <RedundantRequests />
          },
          {
            path: 'cache-data',
            element: <CacheData />
          },
          {
            path: 'callback-hooks',
            element: <CallbackHooks />
          },
          {
            path: 'refetch-on-focus',
            element: <RefetchOnFocus />
          }
        ]
      },
      {
        path: 'mutations',
        children: [
          {
            path: 'basic-mutation',
            element: <BasicMutation />
          },
          {
            path: 'refetch-after-mutation',
            element: <RefetchAfterMutation />
          },
          {
            path: 'revalidate-after-mutation',
            element: <RevalidateAfterMutation />
          },
          {
            path: 'modify-cache',
            element: <ModifyCache />
          }
        ]
      }
    ]
  }
])