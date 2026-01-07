const subjectModel = require("../models/subjectModel");

// add subjects api
const addSubjects = async (req, res) => {
  try {
    const { subject_name, description } = req.body;

    // Validate required fields
    if (!subject_name || !description) {
      return res
        .status(400)
        .json({ error: "subject_name and description are required" });
    }

    // Generate a unique `course_id`
    const lastCourse = await subjectModel
      .findOne()
      .sort({ subject_id: -1 }) // Find the highest course_id
      .select("subject_id");

    const newCourseId = lastCourse ? lastCourse.subject_id + 1 : 1;
    // Create a new subject document
    const newSubject = await subjectModel.create({
      subject_id: newCourseId,
      subject_name,
      description,
      //   status, // Optional, defaults to "active"
    });

    res.status(201).json({
      Status: "1",
      message: "Subject created successfully",
      data: newSubject,
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the subject" });
  }
};

// get all subject api
const findAllSubjects = async (req, res) => {
  try {
    // Fetch all subjects from the database
    const subjects = await subjectModel.find();

    // Check if subjects exist
    if (!subjects || subjects.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No subjects found",
        data: [],
      });
    }

    // Return the subjects
    res.status(200).json({
      status: "1",
      message: "Subjects retrieved successfully",
      data: subjects,
    });
  } catch (error) {
    console.error("Error retrieving subjects:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while retrieving the subjects",
    });
  }
};

// find by id subject api
const findById = async (req, res) => {
  try {
    const { subject_id } = req.params; // Extract subject_id from request parameters

    // Validate subject_id
    if (!subject_id) {
      return res.status(400).json({
        status: "0",
        message: "subject_id is required",
      });
    }

    // Find the subject by subject_id
    const subject = await subjectModel.findOne({ subject_id });

    // Check if subject exists
    if (!subject) {
      return res.status(404).json({
        status: "0",
        message: "Subject not found",
      });
    }

    // Return the found subject
    res.status(200).json({
      status: "1",
      message: "Subject retrieved successfully",
      data: subject,
    });
  } catch (error) {
    // console.error("Error retrieving subject by ID:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while retrieving the subject",
    });
  }
};

// delete by subject_id api
const deleteId = async (req, res) => {
  try {
    const { subject_id } = req.params; // Extract subject_id from request parameters

    // Validate subject_id
    if (!subject_id) {
      return res.status(400).json({
        status: "0",
        message: "subject_id is required",
      });
    }

    // Find and delete the subject by subject_id
    const deletedSubject = await subjectModel.findOneAndDelete({ subject_id });

    // Check if the subject was found and deleted
    if (!deletedSubject) {
      return res.status(404).json({
        status: "0",
        message: "Subject not found or already deleted",
      });
    }

    // Return success response
    res.status(200).json({
      status: "1",
      message: "Subject deleted successfully",
      data: deletedSubject,
    });
  } catch (error) {
    // console.error("Error deleting subject by ID:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while deleting the subject",
    });
  }
};

// update subject details api
const subjectUpdate = async (req, res) => {
  try {
    const { subject_id } = req.params; // Extract subject_id from request parameters
    const { subject_name, description, status } = req.body; // Extract fields to update

    // Validate subject_id
    if (!subject_id) {
      return res.status(400).json({
        status: "0",
        message: "subject_id is required",
      });
    }

    // Validate at least one field is provided for update
    if (!subject_name && !description && !status) {
      return res.status(400).json({
        status: "0",
        message:
          "At least one field (subject_name, description, or status) must be provided to update",
      });
    }

    // Build update object dynamically
    const updateFields = {};
    if (subject_name) updateFields.subject_name = subject_name;
    if (description) updateFields.description = description;
    if (status) updateFields.status = status;

    // Find and update the subject
    const updatedSubject = await subjectModel.findOneAndUpdate(
      { subject_id }, // Find the subject by subject_id
      { $set: updateFields }, // Set the fields to update
      { new: true } // Return the updated document
    );

    // Check if the subject was found and updated
    if (!updatedSubject) {
      return res.status(404).json({
        status: "0",
        message: "Subject not found",
      });
    }

    // Return success response
    res.status(200).json({
      status: "1",
      message: "Subject updated successfully",
      data: updatedSubject,
    });
  } catch (error) {
    // console.error("Error updating subject:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while updating the subject",
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
