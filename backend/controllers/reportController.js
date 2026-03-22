const Report = require("../models/Report");
const User = require("../models/User");
const Item = require("../models/Item");

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reportedEntity, entityModel, reason, description } = req.body;
    const reporter = req.user.id;

    // Optional: Validate that the reported entity exists
    if (entityModel === "User") {
      const userExists = await User.findById(reportedEntity);
      if (!userExists) return res.status(404).json({ message: "Reported user not found" });
    } else if (entityModel === "Item") {
      const itemExists = await Item.findById(reportedEntity);
      if (!itemExists) return res.status(404).json({ message: "Reported item not found" });
    } else {
      return res.status(400).json({ message: "Invalid entity model" });
    }

    const report = new Report({
      reporter,
      reportedEntity,
      entityModel,
      reason,
      description,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all reports (Admin only usually)
exports.getReports = async (req, res) => {
  try {
    // We populate reporter. Depending on entityModel, frontend might need reportedEntity populated, 
    // but Mongoose refPath handles it if configured correctly in model.
    const reports = await Report.find({})
      .populate("reporter", "name email")
      .populate({
        path: "reportedEntity",
        populate: { path: "user", select: "name email" } 
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reportId = req.params.id;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report status updated", report });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
