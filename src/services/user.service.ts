import { UserModel } from '@/models/user.model';
import { logger } from '@/utilities/logger.utility';

export class UserService {
    static findAll = async () => {
        const users = await UserModel.find();
        logger.info('UserService.findAll.users: ', users);

        return users;
    };

    static findByEmail = async (
        email: string,
        select = {
            fullname: 1,
            email: 1,
            password: 2,
            roles: 1,
        }
    ) => {
        const user = await UserModel.findOne({ email }).select(select).lean();
        logger.info('UserService.findByEmail.user: ', user);

        return user;
    };

    static deleteAll = async () => {
        const deleteInfo = await UserModel.deleteMany({});
        logger.info('UserService.deleteAll.deleteInfo: ', deleteInfo);
    };
}
