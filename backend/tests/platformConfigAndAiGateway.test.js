const platformConfigService = require('../src/services/platformConfig.service');
const healthTracker = require('../src/services/ai/AIHealthTracker');
const PlatformConfig = require('../src/models/PlatformConfig');

jest.mock('../src/models/PlatformConfig');

describe('PlatformConfig & AI Gateway Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('PlatformConfig returns default configuration with 10 levels', async () => {
    PlatformConfig.findOne.mockResolvedValue({
      key: 'default',
      founder: { unlockExp: 12000, starterCorpCoin: 1000 },
      company: { maxEmployees: 20, bankruptcyThreshold: -1000 },
      levels: [
        { level: 1, name: 'Intern / Beginner', totalExpRequired: 0 },
        { level: 2, name: 'Junior', totalExpRequired: 500 },
        { level: 3, name: 'Junior+', totalExpRequired: 1200 },
        { level: 4, name: 'Associate', totalExpRequired: 2000 },
        { level: 5, name: 'Mid-Level', totalExpRequired: 3000 },
        { level: 6, name: 'Mid-Level+', totalExpRequired: 4500 },
        { level: 7, name: 'Senior', totalExpRequired: 6500 },
        { level: 8, name: 'Senior+', totalExpRequired: 9000 },
        { level: 9, name: 'Lead', totalExpRequired: 12000 },
        { level: 10, name: 'Principal', totalExpRequired: 16000 },
      ],
    });

    const config = await platformConfigService.getConfig();
    expect(config).toBeDefined();
    expect(config.founder.unlockExp).toBe(12000);
    expect(config.founder.starterCorpCoin).toBe(1000);
    expect(config.company.maxEmployees).toBe(20);
    expect(config.company.bankruptcyThreshold).toBe(-1000);
    expect(config.levels.length).toBe(10);
  });

  test('getLevelForExp maps total EXP to corresponding level name correctly', () => {
    const lvl1 = platformConfigService.getLevelForExp(0);
    expect(lvl1.name).toBe('Intern / Beginner');

    const lvl2 = platformConfigService.getLevelForExp(500);
    expect(lvl2.name).toBe('Junior');

    const lvl5 = platformConfigService.getLevelForExp(3000);
    expect(lvl5.name).toBe('Mid-Level');

    const lvl9 = platformConfigService.getLevelForExp(12000);
    expect(lvl9.name).toBe('Lead');

    const lvl10 = platformConfigService.getLevelForExp(16000);
    expect(lvl10.name).toBe('Principal');
  });

  test('AIHealthTracker records success and updates health state', () => {
    healthTracker.recordSuccess('gemini', 150);
    const health = healthTracker.getHealth('gemini');
    expect(health.status).toBe('HEALTHY');
    expect(health.totalRequests).toBeGreaterThanOrEqual(1);
  });
});
