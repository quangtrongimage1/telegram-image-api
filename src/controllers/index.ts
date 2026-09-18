import { ImageApiController } from './image-api.controller';

export function createControllers(): { imageApiController: ImageApiController } {
    const imageApiController = new ImageApiController();
    
    return { imageApiController };
}
