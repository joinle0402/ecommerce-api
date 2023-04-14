import 'express-async-errors';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { routes } from '@/routes';
import { notFoundHandler, errorHandler } from '@/middlewares/error.middleware';
import { logger } from './utilities/logger.utility';

const app = express();

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    morgan(':method - :url - :status - :res[content-length] - :response-time ms', {
        stream: {
            write: function (message: string) {
                logger.verbose(message);
            },
        },
    })
);

app.use(routes);
app.use('*', notFoundHandler);
app.use(errorHandler);

export { app };
