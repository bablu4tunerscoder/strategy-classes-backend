const UploadData = require("../models/uploadModels");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");


const createUpload = async (req, res) => {
  try {
    const {
      subject,
      upload_type,
      upload_price,
      upload_title,
      upload_description,
      notes_description,
    } = req.body;

    if (!subject || !upload_type || !upload_title || !upload_description) {
      return res.status(400).json({
        status: "0",
        message: "Required fields missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({ message: "Invalid subject id" });
    }

    let upload_pdfs = [];

    if (!notes_description) {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one PDF is required" });
      }

      upload_pdfs = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/pdfs/${file.filename}`,
      }));
    }

    const upload = await UploadData.create({
      subject,
      upload_type,
      upload_price,
      upload_title,
      upload_description,
      notes_description: notes_description || "",
      upload_pdfs,
    });

    res.status(201).json({
      status: "1",
      message: "Upload created successfully",
      data: upload,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


const getAllUploads = async (req, res) => {
  try {
    const { subject, upload_type } = req.query;

    let filter = {};
    if (subject) filter.subject = subject;
    if (upload_type) filter.upload_type = upload_type;

    const uploads = await UploadData.find(filter)
      .populate("subject")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "1",
      data: uploads,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


const findOneUpload = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid upload id" });
    }

    const upload = await UploadData.findById(id).populate("subject");

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    res.json({
      status: "1",
      data: upload,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


const updateUploads = async (req, res) => {
  try {
    const { id } = req.params;

    const upload = await UploadData.findById(id);
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    let upload_pdfs = upload.upload_pdfs;
    let notes_description = upload.notes_description;

    // Notes case
    if (req.body.notes_description) {
      notes_description = req.body.notes_description;
      upload_pdfs = [];
    }
    // PDF case
    else if (req.files && req.files.length > 0) {
      notes_description = "";
      upload_pdfs = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/pdfs/${file.filename}`,
      }));
    }

    Object.assign(upload, req.body, {
      upload_pdfs,
      notes_description,
    });

    await upload.save();

    res.json({
      status: "1",
      message: "Upload updated successfully",
      data: upload,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


const deleteUploads = async (req, res) => {
  try {
    const upload = await UploadData.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    upload.upload_pdfs.forEach((pdf) => {
      fs.unlink(path.join(__dirname, "..", pdf.path), () => {});
    });

    await upload.deleteOne();

    res.json({
      status: "1",
      message: "Upload deleted successfully",
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


const deletePdfs = async (req, res) => {
  try {
    const { uploadId, pdfId } = req.params;

    const upload = await UploadData.findById(uploadId);
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    const pdfIndex = upload.upload_pdfs.findIndex(
      (pdf) => pdf._id.toString() === pdfId
    );

    if (pdfIndex === -1) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const filePath = path.join(
      __dirname,
      "..",
      upload.upload_pdfs[pdfIndex].path
    );

    upload.upload_pdfs.splice(pdfIndex, 1);
    await upload.save();

    fs.unlink(filePath, () => {});

    res.json({
      status: "1",
      message: "PDF deleted successfully",
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  createUpload,
  getAllUploads,
  findOneUpload,
  updateUploads,
  deleteUploads,
  deletePdfs,
};
