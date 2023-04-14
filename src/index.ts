import { app } from './app';
import { config } from '@/configs/config';
import { connectDatabase } from '@/database';
import { logger } from '@/utilities/logger.utility';

connectDatabase().then(() => {
    app.listen(config.app.port, () => {
        logger.info('Example app listening on port http://localhost:%d', config.app.port);
    });
});
