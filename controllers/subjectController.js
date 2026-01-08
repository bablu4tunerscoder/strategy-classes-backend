const subjectModel = require("../models/subjectModel");
const mongoose = require("mongoose");

const addSubjects = async (req, res) => {
  try {
    const { subject_name, description, status } = req.body;

    if (!subject_name || !description) {
      return res.status(400).json({
        status: "0",
        message: "subject_name and description are required",
      });
    }

    const subjectExists = await subjectModel.findOne({ subject_name });
    if (subjectExists) {
      return res.status(409).json({
        status: "0",
        message: "Subject already exists",
      });
    }

    const subject = await subjectModel.create({
      subject_name,
      description,
      status,
    });

    res.status(201).json({
      status: "1",
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: error.message,
    });
  }
};


// get all subject api
const findAllSubjects = async (req, res) => {
  try {
    const subjects = await subjectModel.find();

    res.status(200).json({
      status: "1",
      message: "Subjects fetched successfully",
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: error.message,
    });
  }
};

// find by id subject api
const findById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "0",
        message: "Invalid subject id",
      });
    }

    const subject = await subjectModel.findById(id);

    if (!subject) {
      return res.status(404).json({
        status: "0",
        message: "Subject not found",
      });
    }

    res.status(200).json({
      status: "1",
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: error.message,
    });
  }
};


// delete by subject_id api
const deleteId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "0",
        message: "Invalid subject id",
      });
    }

    const deleted = await subjectModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "0",
        message: "Subject not found",
      });
    }

    res.status(200).json({
      status: "1",
      message: "Subject deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: error.message,
    });
  }
};


// update subject details api
const subjectUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, description, status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "0",
        message: "Invalid subject id",
      });
    }

    // Nothing to update
    if (!subject_name && !description && !status) {
      return res.status(400).json({
        status: "0",
        message: "Nothing to update",
      });
    }


    if (subject_name) {
      const existingSubject = await subjectModel.findOne({
        subject_name,
        _id: { $ne: id }, 
      });

      if (existingSubject) {
        return res.status(409).json({
          status: "0",
          message: "Subject name already exists",
        });
      }
    }

    const updated = await subjectModel.findByIdAndUpdate(
      id,
      { subject_name, description, status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: "0",
        message: "Subject not found",
      });
    }

    res.status(200).json({
      status: "1",
      message: "Subject updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: error.message,
    });
  }
};



module.exports = {
  addSubjects,
  findAllSubjects,
  findById,
  deleteId,
  subjectUpdate,
};
