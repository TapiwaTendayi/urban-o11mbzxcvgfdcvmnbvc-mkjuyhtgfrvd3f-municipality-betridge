// frontend/src/utils/reportGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generateReport = (
  requests,
  role,
  filters = {},
  isPaginated = false,
  totalCount = 0
) => {
  if (!requests || requests.length === 0) {
    alert("⚠️ No data to generate report");
    return;
  }

  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  // Title
  doc.setFontSize(18);
  doc.text(`ITSolve Report - ${role.toUpperCase()}`, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated: ${date} ${time}`, 14, 32);

  // Show if data is paginated
  if (isPaginated && totalCount > 0) {
    doc.text(
      `Showing: ${requests.length} of ${totalCount} total records`,
      14,
      42
    );
  }

  // Filter info
  let startY = isPaginated ? 52 : 42;
  if (filters) {
    if (filters.status && filters.status !== "all") {
      doc.text(
        `Status: ${filters.status === "resolved" ? "Resolved" : "Pending"}`,
        14,
        startY
      );
      startY += 10;
    }
    if (filters.month) {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      doc.text(`Month: ${monthNames[parseInt(filters.month) - 1]}`, 14, startY);
      startY += 10;
    }
    if (filters.year) {
      doc.text(`Year: ${filters.year}`, 14, startY);
      startY += 10;
    }
  }

  // Table headers based on role
  let tableColumn = [];
  if (role === "office") {
    tableColumn = ["Title", "Description", "Status", "Created", "Resolved At"];
  } else if (role === "student") {
    tableColumn = [
      "Title",
      "Description",
      "Requested By",
      "Assigned To",
      "Status",
      "Created",
      "Resolved At",
    ];
  } else if (role === "supervisor") {
    tableColumn = [
      "Title",
      "Description",
      "Office",
      "Assigned To",
      "Status",
      "Created",
      "Resolved At",
    ];
  }

  // Table rows
  const tableRows = requests.map((r) => {
    const baseRow = [
      r.title || "—",
      r.description || "—",
      r.status === "resolved" ? "Resolved" : "Pending",
      new Date(r.createdAt).toLocaleString(),
      r.resolvedAt ? new Date(r.resolvedAt).toLocaleString() : "—",
    ];

    if (role === "student") {
      return [
        r.title || "—",
        r.description || "—",
        r.requestedBy?.name || "—",
        r.assignedTo?.name || "Unassigned",
        ...baseRow.slice(2),
      ];
    } else if (role === "supervisor") {
      return [
        r.title || "—",
        r.description || "—",
        r.requestedBy?.office || r.requestedBy?.name || "N/A",
        r.assignedTo?.name || "Unassigned",
        ...baseRow.slice(2),
      ];
    }

    return baseRow;
  });

  // Generate table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount} • Records: ${requests.length}${
        isPaginated ? ` (Page View)` : ""
      }`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  const fileName = `ITSolve_${role}_Report_${date.replace(
    /\//g,
    "-"
  )}_${time.replace(/:/g, "-")}.pdf`;
  doc.save(fileName);
};

export default generateReport;
