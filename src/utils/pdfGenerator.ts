import jsPDF from 'jspdf';
import { User, Activity } from '../types';

export const generatePDFPortfolio = async (user: User, activities: Activity[]) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;

  // Add header
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("Student Portfolio", pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${user.name}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  pdf.setFontSize(12);
  pdf.text(`${user.email}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;

  // Add line separator
  pdf.setLineWidth(0.5);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 20;

  // Add activities
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Approved Activities", margin, currentY);
  currentY += 20;

  activities.forEach((activity, index) => {
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      pdf.addPage();
      currentY = margin;
    }

    // Activity title
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${index + 1}. ${activity.title}`, margin, currentY);
    currentY += 10;

    // Category and date
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Category: ${activity.category}`, margin + 10, currentY);
    pdf.text(`Date: ${new Date(activity.createdAt?.toDate()).toLocaleDateString()}`, pageWidth - margin - 50, currentY);
    currentY += 10;

    // Description
    pdf.setFontSize(10);
    const splitDescription = pdf.splitTextToSize(activity.description, pageWidth - 2 * margin - 20);
    pdf.text(splitDescription, margin + 10, currentY);
    currentY += splitDescription.length * 5 + 10;

    // Remarks if available
    if (activity.remarks) {
      pdf.setFont("helvetica", "italic");
      pdf.text("Faculty Remarks:", margin + 10, currentY);
      currentY += 5;
      const splitRemarks = pdf.splitTextToSize(activity.remarks, pageWidth - 2 * margin - 20);
      pdf.text(splitRemarks, margin + 10, currentY);
      currentY += splitRemarks.length * 5;
    }

    currentY += 10;

    // Add a light line separator between activities
    if (index < activities.length - 1) {
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      pdf.line(margin + 10, currentY, pageWidth - margin - 10, currentY);
      currentY += 10;
    }
  });

  // Add footer
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Download the PDF
  pdf.save(`${user.name.replace(/\s+/g, '_')}_Portfolio.pdf`);
};