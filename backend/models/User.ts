import mongoose, {Schema} from "mongoose";      

const UserSchema = new Schema({
    firstName: {type: String, required: true, trim: true},
    lastName: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    password: {type: String, required: true},
    businessDetails: {
        address: String,
        contact: String,
        logoUrl: String,
    }
}, {timestamps: true});

export default mongoose.model("User", UserSchema);