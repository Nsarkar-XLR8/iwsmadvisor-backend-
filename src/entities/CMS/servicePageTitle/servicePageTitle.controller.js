import {
  createTitle,
  getAllTitles,
  getSingleTitle,
  updateTitle,
  deleteTitle,
} from "./servicePageTitle.service.js";

// Controller functions
export const createTitleController = async (req, res) => {
  const result = await createTitle(req.body);
  res.status(201).json({ success: true, message: "Title created successfully", data: result });
};

export const getAllTitlesController = async (req, res) => {
  const result = await getAllTitles();
  res.status(200).json({ success: true, data: result });
};

export const getSingleTitleController = async (req, res) => {
  const result = await getSingleTitle(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: "Title not found" });
  res.status(200).json({ success: true, data: result });
};

export const updateTitleController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await updateTitle(id, data);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Title not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Title updated successfully",
      data: updated,
    });
  } catch (err) {
    // Duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Title already exists",
      });
    }

    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end",
    });
  }
};

export const deleteTitleController = async (req, res) => {
  const result = await deleteTitle(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: "Title not found" });
  res.status(200).json({ success: true, message: "Title deleted successfully" });
};