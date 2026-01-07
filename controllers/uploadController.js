const uploadData = require("../models/uploadModels");
const path = require("path");
const fs = require("fs");
const subjectModel = require("../models/subjectModel");
const courseModel = require("../models/courseModel");

// POST API to Upload PDFs
const createUpload = async (req, res) => {
  try {
    const {
      subject_id,
      upload_type,
      upload_price,
      upload_title,
      upload_description,
      notes_description, // notes_description ko destructure kiya
    } = req.body;

    // Validation: Sab fields required hain
    if (!subject_id || !upload_type || !upload_title || !upload_description) {
      return res
        .status(400)
        .json({ status: "0", message: "All fields are required." });
    }

    // Last Upload ID Fetch karke naye ka ID generate karo
    const lastUpload = await uploadData
      .findOne()
      .sort({ upload_id: -1 })
      .select("upload_id");
    const newUploadId = lastUpload ? lastUpload.upload_id + 1 : 1;

    let pdfFiles = [];

    // Agar notes_description hai, toh upload_pdfs empty hoga
    if (notes_description && notes_description.trim() !== "") {
      pdfFiles = [];
    } else {
      // PDF Handling
      const uploadedFiles = req.files;
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res
          .status(400)
          .json({ status: "0", message: "At least one PDF file is required." });
      }

      // PDF files ko array me store karo
      pdfFiles = uploadedFiles.map((file) => ({
        filename: file.filename,
        path: `/uploads/pdfs/${file.filename}`,
      }));
    }

    // New Upload Document Create karo
    const newUpload = new uploadData({
      upload_id: newUploadId,
      subject_id,
      upload_type,
      upload_price,
      upload_title,
      upload_description,
      notes_description: notes_description || "", // Default empty string
      upload_pdfs: pdfFiles, // Condition ke mutabiq PDF files ya empty array
    });

    // MongoDB me save karo
    await newUpload.save();

    res.status(201).json({
      status: "1",
      message: "Upload successful!",
      upload: newUpload,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getAllUploads = async (req, res) => {
  try {
    const { subject_id, upload_type } = req.body;

    // ✅ Filter will now only consider subject_id & upload_type
    let filter = {};

    if (subject_id) {
      filter.subject_id = subject_id;
    }

    if (upload_type) {
      filter.upload_type = upload_type;
    }

    // ✅ Fetch uploads based on the generated filter
    const uploads = await uploadData.find(filter);

    if (!uploads || uploads.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No uploads found.",
      });
    }

    // ✅ Fetch subject & course details for each upload
    const uploadsWithDetails = await Promise.all(
      uploads.map(async (upload) => {
        const subject = await subjectModel.findOne({
          subject_id: upload.subject_id,
        });
        const course = await courseModel.findOne({
          course_id: upload.course_id,
        });

        return {
          ...upload.toObject(),
          subject_details: subject || null,
          course_details: course || null,
        };
      })
    );

    res.status(200).json({
      status: "1",
      message: "Uploads fetched successfully!",
      uploads: uploadsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching uploads:", error);
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};

// GET API to Fetch All Uploads
const findAllUploads = async (req, res) => {
  try {
    // ✅ Step 1: Saare uploads fetch karo
    const uploads = await uploadData.find();

    if (!uploads || uploads.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No uploads found.",
      });
    }

    const uploadTypeNames = {
      1: "Book",
      2: "Notes",
      3: "Question Bank",
    };

    // ✅ Step 2: Har upload ke saath subject & course ka data bhi add karo
    const uploadsWithDetails = await Promise.all(
      uploads.map(async (upload) => {
        const subject = await subjectModel.findOne({
          subject_id: upload.subject_id,
        });
        const course = await courseModel.findOne({
          course_id: upload.course_id,
        });

        return {
          ...upload.toObject(),
          subject_details: subject || null,
          course_details: course || null,
          upload_type_name: uploadTypeNames[upload.upload_type] || "Unknown",
        };
      })
    );

    // ✅ Step 3: Response send karo
    res.status(200).json({
      status: "1",
      message: "All uploads fetched successfully!",
      uploads: uploadsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching all uploads:", error);
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};

// GET API to Fetch Single Upload by ID
const findOneUpload = async (req, res) => {
  try {
    const { id } = req.params; // ✅ URL se id extract karo

    // ✅ Step 1: Check if ID is provided
    if (!id) {
      return res.status(400).json({
        status: "0",
        message: "Upload ID is required.",
      });
    }

    // ✅ Step 2: Upload find karo ID ke basis par
    const upload = await uploadData.findOne({ upload_id: id });

    if (!upload) {
      return res.status(404).json({
        status: "0",
        message: "Upload not found.",
      });
    }

    // ✅ Step 3: Subject & Course ka detail bhi fetch karo
    const subject = await subjectModel.findOne({
      subject_id: upload.subject_id,
    });
    const course = await courseModel.findOne({ course_id: upload.course_id });

    // ✅ Step 4: Response bhejo
    res.status(200).json({
      status: "1",
      message: "Upload fetched successfully!",
      upload: {
        ...upload.toObject(),
        subject_details: subject || null,
        course_details: course || null,
      },
    });
  } catch (error) {
    console.error("Error fetching upload by ID:", error);
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};

// UPDATE API - Update Upload by ID
const updateUploads = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL
    const {
      subject_id,
      course_id,
      upload_type,
      upload_price,
      upload_title,
      upload_description,
      notes_description, // Extract notes_description
      existing_pdfs, // Existing PDFs from the frontend
    } = req.body;

    // Step 1: Ensure ID is provided
    if (!id) {
      return res.status(400).json({
        status: "0",
        message: "Upload ID is required for update.",
      });
    }

    // Step 2: Find existing upload by ID
    const existingUpload = await uploadData.findOne({ upload_id: id });

    if (!existingUpload) {
      return res.status(404).json({
        status: "0",
        message: "Upload not found.",
      });
    }

    let pdfFiles = existingUpload.upload_pdfs; // Default to existing PDFs
    const uploadedFiles = req.files; // New PDFs being uploaded
    let updatedNotesDescription = existingUpload.notes_description; // Default to existing notes description

    if (notes_description && notes_description.trim() !== "") {
      // If notes_description is provided, upload_pdfs must be empty
      updatedNotesDescription = notes_description;
      pdfFiles = [];
    } else if (uploadedFiles && uploadedFiles.length > 0) {
      // If PDFs are provided, notes_description must be empty
      updatedNotesDescription = "";
      pdfFiles = [
        ...(existing_pdfs ? JSON.parse(existing_pdfs) : []), // Keep only selected existing PDFs
        ...uploadedFiles.map((file) => ({
          filename: file.filename,
          path: `/uploads/pdfs/${file.filename}`,
        })),
      ];
    }

    // Step 4: Update the Upload Data
    const updatedUpload = await uploadData.findOneAndUpdate(
      { upload_id: id },
      {
        subject_id: subject_id || existingUpload.subject_id,
        course_id: course_id || existingUpload.course_id,
        upload_type: upload_type || existingUpload.upload_type,
        upload_price: upload_price || existingUpload.upload_price,
        upload_title: upload_title || existingUpload.upload_title,
        upload_description:
          upload_description || existingUpload.upload_description,
        notes_description: updatedNotesDescription, // Updated notes_description
        upload_pdfs: pdfFiles, // Updated PDF list (or empty if notes_description exists)
      },
      { new: true } // Return updated document
    );

    res.status(200).json({
      status: "1",
      message: "Upload updated successfully!",
      upload: updatedUpload,
    });
  } catch (error) {
    console.error("Error updating upload:", error);
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};


const deleteUploads = async (req, res) => {
  try {
    const { id } = req.params; // ✅ ID URL se milegi

    // ✅ Check if upload exists
    const upload = await uploadData.findOne({ upload_id: id });
    if (!upload) {
      return res.status(404).json({
        status: "0",
        message: "Upload not found!",
      });
    }

    // ✅ Delete from database
    await uploadData.deleteOne({ upload_id: id });

    res.status(200).json({
      status: "1",
      message: "Upload deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting upload:", error);
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};

const deletePdfs = async (req, res) => {
  try {
    const { uploadId, pdfId } = req.params;

    // Find the upload entry
    const upload = await uploadData.findOne({ upload_id: uploadId });
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    // Find the PDF in the array
    const pdfIndex = upload.upload_pdfs.findIndex(
      (pdf) => pdf._id.toString() === pdfId
    );
    if (pdfIndex === -1) {
      return res.status(404).json({ message: "PDF not found" });
    }

    // Get the file path
    const filePath = path.join(
      __dirname,
      "..",
      upload.upload_pdfs[pdfIndex].path
    );

    // Remove the PDF from the database array
    upload.upload_pdfs.splice(pdfIndex, 1);
    await upload.save();

    // Delete the file from the server
    fs.unlink(filePath, (err) => {
      if (err) console.error("File deletion error:", err);
    });

    res.status(200).json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUpload,
  getAllUploads,
  findAllUploads,
  findOneUpload,
  updateUploads,
  deleteUploads,
  deletePdfs,
};
