import { bannerService } from "./banner.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";



const createBanner = catchAsync(async (req, res) => {
    // ✅ multerUpload uses .fields() so files land in req.files not req.file
    const imageFile = req.files?.image?.[0];

    if (!imageFile) {
        return generateResponse(res, 400, false, "Banner image is required", null);
    }

    const { title, subTitle, btn1, btn2 } = req.body;

    const cloudinaryResult = await cloudinaryUpload(imageFile.path, `banner-${Date.now()}`, "banners");
    if (!cloudinaryResult || cloudinaryResult === "file upload failed" || !cloudinaryResult.url) {
        return generateResponse(res, 500, false, "Image upload failed", null);
    }

    const created = await bannerService.createBannerIntoDb({
        title, subTitle, btn1, btn2,
        image: cloudinaryResult.url,
    });

    return generateResponse(res, 201, true, "Banner created successfully", created);
});



const getAllBanners = catchAsync(async (req, res) => {
    const banners = await bannerService.getAllBannersFromDb();
    return generateResponse(res, 200, true, "Banners fetched successfully", banners);
});

const getBannerById = catchAsync(async (req, res) => {

    const banner = await bannerService.getBannerByIdFromDb(req.params.bannerId);
    return generateResponse(res, 200, true, "Banner fetched successfully", banner);
});




const updateBanner = catchAsync(async (req, res) => {
    const { title, subTitle, btn1, btn2 } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title;
    if (subTitle !== undefined) payload.subTitle = subTitle;
    if (btn1 !== undefined) payload.btn1 = btn1;
    if (btn2 !== undefined) payload.btn2 = btn2;

    // ✅ Upload new image only if provided
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `banner-${Date.now()}`, "banners");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        payload.image = cloudinaryResult.url;
    }

    // ✅ Check AFTER image processing — not before
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await bannerService.updateBannerIntoDb(req.params.bannerId, payload);
    return generateResponse(res, 200, true, "Banner updated successfully", updated);
});




const deleteBanner = catchAsync(async (req, res) => {

    await bannerService.deleteBannerFromDb(req.params.bannerId);
    return generateResponse(res, 200, true, "Banner deleted successfully", null);
});

export const bannerController = {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
};