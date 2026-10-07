const PlatformConfig = require('../models/PlatformConfig');

const DEFAULT_LEVELS = [
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
];

class PlatformConfigService {
  async getConfig() {
    let config = await PlatformConfig.findOne({ key: 'default' });
    if (!config) {
      config = await PlatformConfig.create({
        key: 'default',
        levels: DEFAULT_LEVELS,
      });
    }
    return config;
  }

  async updateConfig(updateData) {
    let config = await PlatformConfig.findOne({ key: 'default' });
    if (!config) {
      config = new PlatformConfig({ key: 'default', levels: DEFAULT_LEVELS });
    }
    Object.assign(config, updateData);
    await config.save();
    return config;
  }

  getLevelForExp(expTotal, levelsConfig = DEFAULT_LEVELS) {
    const sorted = [...levelsConfig].sort((a, b) => b.totalExpRequired - a.totalExpRequired);
    for (const lvl of sorted) {
      if (expTotal >= lvl.totalExpRequired) {
        return lvl;
      }
    }
    return levelsConfig[0];
  }
}

module.exports = new PlatformConfigService();
