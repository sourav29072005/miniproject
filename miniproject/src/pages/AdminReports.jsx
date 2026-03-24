import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/adminreports.css"; // Create this next

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      // Fallback to demo data if fail, though should normally show error
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (!window.confirm(`Are you sure you want to mark this report as ${status}?`)) return;
      await api.put(`/reports/${id}/status`, { status });
      fetchReports(); // Refresh
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const viewEntity = (report) => {
    if (report.entityModel === "Item") {
      localStorage.setItem("selectedItemId", report.reportedEntity?._id || report.reportedEntity);
      navigate("/admin/items"); // Or straight to /item-details if admin allows
    } else if (report.entityModel === "User") {
      navigate(`/seller/${report.reportedEntity?._id || report.reportedEntity}`);
    }
  };

  const filteredReports = reports.filter(report => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    
    const reporterMatch = report.reporter?.name?.toLowerCase().includes(q) || report.reporter?.email?.toLowerCase().includes(q);
    
    let targetMatch = false;
    if (report.entityModel === "Item" && report.reportedEntity) {
      targetMatch = report.reportedEntity.title?.toLowerCase().includes(q) ||
                    report.reportedEntity.user?.name?.toLowerCase().includes(q) ||
                    report.reportedEntity.user?.email?.toLowerCase().includes(q);
    } else if (report.entityModel === "User" && report.reportedEntity) {
      targetMatch = report.reportedEntity.name?.toLowerCase().includes(q) || 
                    report.reportedEntity.email?.toLowerCase().includes(q);
    }
    
    return reporterMatch || targetMatch;
  });

  return (
    <div className="admin-reports-container">
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          ← Back to Admin
        </button>
        <h1>User Reports ({reports.length})</h1>
      </div>

      {loading ? (
        <p className="loading-text">Loading reports...</p>
      ) : reports.length === 0 ? (
        <div className="no-reports">No reports found. Good job community!</div>
      ) : (
        <>
          <div className="reports-controls" style={{ marginBottom: "20px" }}>
            <input 
              type="text" 
              placeholder="Search by reporter, item title, or seller name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="reports-search-input"
              style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", maxWidth: "400px" }}
            />
          </div>
          <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reporter</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report._id} className={report.status === "Pending" ? "row-pending" : ""}>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    {report.reporter?.name || "Unknown"}<br/>
                    <small className="text-gray-500">{report.reporter?.email}</small>
                  </td>
                  <td>
                    <span className={`entity-badge ${report.entityModel.toLowerCase()}`}>
                      {report.entityModel}
                    </span>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                      {report.entityModel === "Item" && report.reportedEntity ? (
                        <>
                          <div className="font-semibold text-gray-800" style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{report.reportedEntity.title}</div>
                          <div className="text-gray-500">Seller: {report.reportedEntity.user?.name || "Unknown"}</div>
                        </>
                      ) : report.entityModel === "User" && report.reportedEntity ? (
                        <>
                          <div className="font-semibold text-gray-800">{report.reportedEntity.name}</div>
                          <div className="text-gray-500">{report.reportedEntity.email}</div>
                        </>
                      ) : (
                        <em className="text-gray-400">Deleted Entity</em>
                      )}
                    </div>
                  </td>
                  <td className="font-semibold text-red-600">{report.reason}</td>
                  <td className="report-desc">{report.description || <em className="text-gray-400">No details provided</em>}</td>
                  <td>
                    <span className={`status-badge status-${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-view" onClick={() => viewEntity(report)}>
                      Investigate
                    </button>
                    {report.status !== "Resolved" && (
                      <button className="btn-resolve" onClick={() => updateStatus(report._id, "Resolved")}>
                        Resolve
                      </button>
                    )}
                    {report.status !== "Dismissed" && (
                      <button className="btn-dismiss" onClick={() => updateStatus(report._id, "Dismissed")}>
                        Dismiss
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
              No reports match your search criteria.
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}

export default AdminReports;
