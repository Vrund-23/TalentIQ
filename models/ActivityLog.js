
import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: String, // Can be user name or 'System'
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  target: {
    type: String, 
    required: true,
  },
  details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  icon: {
      type: String, // e.g., 'Users', 'Calendar', 'Plus', 'Activity'
      default: 'Activity' 
  }
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
