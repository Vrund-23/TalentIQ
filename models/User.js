import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\d{2}[a-zA-Z]{2}\d{3}@bvmengineering\.ac\.in$/,
            'Please provide a valid college email (e.g., 23cp045@bvmengineering.ac.in)',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
