import { User } from '@/models/user.model';
import { logger } from '@/utilities/logger.utility';

export class UserService {
    static findAll = async () => {
        const users = await User.find();
        logger.info('UserService.findAll.users: ', users);

        return users;
    };

    static findByEmail = async (
        email: string,
        select = {
            fullname: 1,
            email: 1,
            password: 2,
            role: 1,
        }
    ) => {
        const user = await User.findOne({ email }).select(select).lean();
        logger.info('UserService.findByEmail.user: ', user);

        return user;
    };

    static deleteAll = async () => {
        const deleteInfo = await User.deleteMany({});
        logger.info('UserService.deleteAll.deleteInfo: ', deleteInfo);
    };
}
