import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

const router = Router();
const { OK } = StatusCodes;

// 이전 메시지를 불러온다.
router.get('/messages/:channelId', (req: Request, res: Response) => {
    const { channelId } = req.params;
    return res.status(OK).end();
});

export default router;
