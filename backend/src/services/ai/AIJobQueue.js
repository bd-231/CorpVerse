const AIJob = require('../../models/AIJob');
const aiGateway = require('./AIGateway');
const { v4: uuidv4 } = require('uuid') || { v4: () => `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };

class AIJobQueue {
  async enqueueJob(taskType, payload) {
    const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const job = await AIJob.create({
      jobId,
      taskType,
      payload,
      status: 'PENDING',
    });
    return job;
  }

  async processNextJob() {
    const job = await AIJob.findOne({ status: { $in: ['PENDING', 'RETRYING'] } }).sort({ createdAt: 1 });
    if (!job) return null;

    job.status = 'PROCESSING';
    job.attempts += 1;
    await job.save();

    try {
      const response = await aiGateway.processRequest({
        taskType: job.taskType,
        userInput: job.payload,
      });

      job.status = 'COMPLETED';
      job.result = response;
      job.lastProviderUsed = response.provider;
      await job.save();
      return job;
    } catch (err) {
      if (job.attempts < job.maxAttempts) {
        job.status = 'RETRYING';
        job.error = err.message;
      } else {
        job.status = 'WAITING_FOR_PROVIDER';
        job.error = err.message;
      }
      await job.save();
      return job;
    }
  }

  async getJobStatus(jobId) {
    return AIJob.findOne({ jobId });
  }
}

module.exports = new AIJobQueue();
