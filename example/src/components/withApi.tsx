import { ApiConfig } from "react-api-fetching"
import Api, { APIs } from "../api"
import fetcher from "../utils/fetcher"

export default function withApi(Component: React.ComponentType, config?: Partial<ApiConfig<typeof APIs>>) {
  return function ComponentWithApi() {
    return (
      <Api.Provider config={{ fetcher, ...config }}>
        <Component />
      </Api.Provider>
    )
  }
}