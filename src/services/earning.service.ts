import { APIRequest } from './api-request';

class EarningService extends APIRequest {
  search(params?: { [key: string]: string }, role = 'performer') {
    return this.get(this.buildUrl(`/earning/${role}/search`, params));
  }

  stats(params?: { [key: string]: string }, role = 'performer') {
    return this.get(this.buildUrl(`/earning/${role}/stats`, params));
  }

  exportCsv(query?: { [key: string]: any }, role = 'performer') {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    return (
      baseApiEndpoint
      + this.buildUrl(`/earning/${role}/export/csv`, {
        ...query
      })
    );
  }
}

export const earningService = new EarningService();
