import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header className="border-b border-gray-200">
        <div className="container mx-auto p-4">
          <a className="text-xl font-semibold text-black">react-api-fetching</a>
        </div>
      </header>
      <div className="container mx-auto">
        <div className="grid grid-cols-12">
          <div className="col-span-3 border-r border-gray-200">
            <div className="sticky top-0 p-4">
              <h2 className="mb-4">Example</h2>
              <ul className="list-none space-y-4">
                <li>
                  <h6>Queries</h6>
                  <ul>
                    <li>
                      <Link to='/queries/basic-fetch'>
                        Basic fetch
                      </Link>
                    </li>
                    <li>
                      <Link to='/queries/lazy-fetch'>
                        Lazy fetch
                      </Link>
                    </li>
                    <li>
                      <Link to='/queries/redundant-requests'>
                        Redundant requests
                      </Link>
                    </li>
                    <li>
                      <Link to='/queries/cache-data'>
                        Cache data
                      </Link>
                    </li>
                    <li>
                      <Link to='/queries/callback-hooks'>
                        Callback hooks
                      </Link>
                    </li>
                    <li>
                      <Link to='/queries/refetch-on-focus'>
                        Refetch on focus
                      </Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <h6>Mutations</h6>
                  <ul>
                    <li>
                      <Link to='/mutations/basic-mutation'>
                        Basic mutation
                      </Link>
                    </li>
                    <li>
                      <Link to='/mutations/refetch-after-mutation'>
                        Refetch after mutation
                      </Link>
                    </li>
                    <li>
                      <Link to='/mutations/revalidate-after-mutation'>
                        Revalidate after mutation
                      </Link>
                    </li>
                    <li>
                      <Link to='/mutations/modify-cache'>
                        Modify cache
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-span-9 px-8 py-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}