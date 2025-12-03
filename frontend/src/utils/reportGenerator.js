import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function generateReport(requests, role) {
  if (!requests || requests.length === 0) {
    alert("⚠️ No data to generate report");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`ITSolve Report - ${role.toUpperCase()}`, 14, 10);

  const tableColumn = [
    "Title",
    "Description",
    "Requested By",
    "Assigned To",
    "Status",
    "Created",
    "Resolved At",
  ];

  const tableRows = requests.map((r) => [
    r.title || "—",
    r.description || "—",
    r.requestedBy?.name || "—",
    r.assignedTo?.name || "Unassigned",
    r.status === "resolved" ? "Resolved" : "Pending",
    new Date(r.createdAt).toLocaleString(),
    r.resolvedAt ? new Date(r.resolvedAt).toLocaleString() : "—",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(`${role}_report.pdf`);
}
