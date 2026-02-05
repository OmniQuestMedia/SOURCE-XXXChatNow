import {
  IGeoDemo,
  IItem,
  IRateCard,
  RateCardItemType
} from 'src/interfaces';

import { APIRequest } from './api-request';

/**
 * Rate Card Service - Canonical commerce layer for all purchasable value
 *
 * This service provides methods for managing rate cards, items, and transactions
 * in the Rate Card System v2.
 */
export class RateCardService extends APIRequest {
  /**
   * Search/list rate cards with optional filters
   */
  search(params?: {
    ownerId?: string;
    ownerType?: 'performer' | 'studio' | 'platform';
    status?: 'active' | 'inactive' | 'draft';
    limit?: number;
    offset?: number;
  }) {
    return this.get(this.buildUrl('/rate-card/search', params));
  }

  /**
   * Get a specific rate card by ID
   */
  findById(id: string) {
    return this.get(`/rate-card/${encodeURIComponent(id)}`);
  }

  /**
   * Get rate card for a specific performer with Geo/Demo rules applied
   */
  findByPerformerId(performerId: string, geoDemo?: IGeoDemo) {
    const params: any = { performerId };
    if (geoDemo) {
      params.country = geoDemo.country;
      params.region = geoDemo.region;
      params.segment = geoDemo.segment;
    }
    return this.get(this.buildUrl('/rate-card/performer', params));
  }

  /**
   * Create a new rate card
   */
  create(data: Partial<IRateCard>) {
    return this.post('/rate-card', data);
  }

  /**
   * Update an existing rate card
   */
  update(id: string, data: Partial<IRateCard>) {
    return this.put(`/rate-card/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete a rate card
   */
  delete(id: string) {
    return this.del(`/rate-card/${encodeURIComponent(id)}`);
  }

  /**
   * Get items for a rate card
   */
  getItems(rateCardId: string, params?: {
    type?: RateCardItemType;
    status?: 'active' | 'inactive' | 'archived';
  }) {
    return this.get(this.buildUrl(`/rate-card/${encodeURIComponent(rateCardId)}/items`, params));
  }

  /**
   * Add an item to a rate card
   */
  addItem(rateCardId: string, item: Partial<IItem>) {
    return this.post(`/rate-card/${encodeURIComponent(rateCardId)}/items`, item);
  }

  /**
   * Update an item in a rate card
   */
  updateItem(rateCardId: string, itemId: string, item: Partial<IItem>) {
    return this.put(
      `/rate-card/${encodeURIComponent(rateCardId)}/items/${encodeURIComponent(itemId)}`,
      item
    );
  }

  /**
   * Remove an item from a rate card
   */
  removeItem(rateCardId: string, itemId: string) {
    return this.del(`/rate-card/${encodeURIComponent(rateCardId)}/items/${encodeURIComponent(itemId)}`);
  }

  /**
   * Validate Geo/Demo rules for a user
   */
  validateGeoDemo(geoDemo: IGeoDemo, userContext: {
    country?: string;
    region?: string;
    segment?: string;
    age?: number;
  }) {
    return this.post('/rate-card/validate-geo-demo', {
      geoDemo,
      userContext
    });
  }

  /**
   * Apply a rate card item (purchase/execute transaction)
   * Ensures idempotency through idempotencyKey
   */
  applyItem(params: {
    rateCardId: string;
    itemId: string;
    buyerId: string;
    sellerId: string;
    quantity?: number;
    idempotencyKey: string;
    geoDemo?: IGeoDemo;
    metadata?: Record<string, any>;
  }) {
    return this.post('/rate-card/apply-item', params);
  }

  /**
   * Get transaction history
   */
  getTransactions(params?: {
    buyerId?: string;
    sellerId?: string;
    rateCardId?: string;
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
    limit?: number;
    offset?: number;
  }) {
    return this.get(this.buildUrl('/rate-card/transactions', params));
  }

  /**
   * Get a specific transaction by ID
   */
  getTransaction(transactionId: string) {
    return this.get(`/rate-card/transactions/${encodeURIComponent(transactionId)}`);
  }

  /**
   * Legacy adapter: Convert legacy pricing to Rate Card Item
   */
  convertLegacyPricing(params: {
    legacyType: 'privateCallPrice' | 'groupCallPrice' | 'tipMenu' | 'product' | 'gallery' | 'video' | 'tokenPackage' | 'featuredPackage';
    entityId: string;
    price: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<{ data: IItem }> {
    return this.post('/rate-card/convert-legacy', params);
  }

  /**
   * Get rate card with legacy pricing mapped
   */
  getLegacyCompatibleRateCard(performerId: string) {
    return this.get(`/rate-card/legacy-compatible/${encodeURIComponent(performerId)}`);
  }
}

export const rateCardService = new RateCardService();
