import { compare, hash } from 'bcrypt';
import { Model, Schema, model } from 'mongoose';

const Role = {
    User: 'USER',
    Administrator: 'ADMINISTRATOR',
};

interface IUser {
    fullname: string;
    email: string;
    password: string;
    verified: boolean;
    role: string;
}

interface IUserMethods {
    comparePassword: (candidatePassword: string) => Promise<boolean>;
}

interface IUserModel extends Model<IUser, {}, IUserMethods> {}

const UserSchema = new Schema<IUser, IUserModel, IUserMethods>(
    {
        fullname: {
            type: String,
            trim: true,
            minlength: 5,
            maxlength: 50,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            index: true,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: Object.keys(Role),
            default: Role.User,
        },
    },
    {
        timestamps: true,
        collection: 'Users',
    }
);

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password, 10);
    }
    next();
});

UserSchema.method('comparePassword', async function (candidatePassword: string) {
    return await compare(candidatePassword, this.password);
});

export const User = model<IUser, IUserModel>('User', UserSchema);
