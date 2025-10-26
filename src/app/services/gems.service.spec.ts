import { GemsService } from './gems.service';

describe('GemsService', () => {
  let service: GemsService;

  beforeEach(() => {
    service = new GemsService();
  });

  it('should initialize with default values', () => {
    expect(service.totalValue).toBe(0);
    expect(service.averageValue).toBe(0);
    expect(service.averageScale).toBe(0);
    expect(service.averageRoughness).toBe(0);
    expect(service.totalValueDirty).toBeFalse();
    expect(service.distribution).toEqual([]);
    expect(service.totalValueHistory).toEqual([]);
    expect(service.recentlyAdded).toEqual([]);
  });

  it('should update numeric metrics when changed', () => {
    service.setTotalValue(100);
    service.setAverageValue(20);
    service.setAverageScale(1.5);
    service.setAverageRoughness(0.3);
    service.setTotalValueDirty(true);

    expect(service.totalValue).toBe(100);
    expect(service.averageValue).toBe(20);
    expect(service.averageScale).toBe(1.5);
    expect(service.averageRoughness).toBe(0.3);
    expect(service.totalValueDirty).toBeTrue();
  });

  it('should update distribution and history arrays', () => {
    const distribution = [{ id: 1 }];
    const history = [{ total: 10 }];

    service.setDistribution(distribution);
    expect(service.distribution).toBe(distribution);

    service.setTotalValueHistory(history);
    expect(service.totalValueHistory).toBe(history);
  });

  it('should manage recently added list', () => {
    service.addToRecentlyAdded('gem-1');
    service.addToRecentlyAdded('gem-2');
    expect(service.recentlyAdded).toEqual(['gem-1', 'gem-2']);

    service.shiftRecentlyAdded();
    expect(service.recentlyAdded).toEqual(['gem-2']);
  });
});
