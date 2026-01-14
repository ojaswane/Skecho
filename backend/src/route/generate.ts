import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

interface GenerateRequest extends Request {
    // Add any custom properties if needed in the future
}

interface GenerateResponse {
    message: string;
}

router.post('/', async (req: GenerateRequest, res: Response<GenerateResponse>) => {
    res.json({
        message: "Api is working fine at generate route"
    });
});
    
export default router;
