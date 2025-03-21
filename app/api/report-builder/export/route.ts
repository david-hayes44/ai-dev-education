import { NextRequest, NextResponse } from 'next/server';
import { ExportReportRequest, ReportState } from '@/components/report-builder/types';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import PDFDocument from 'pdfkit';

// Function to convert report to markdown
function generateMarkdown(report: ReportState): string {
  return `
# ${report.title}
Date: ${report.date}

## Accomplishments Since Last Update
${report.sections.accomplishments}

## Insights / Learnings
${report.sections.insights}

## Decisions / Risks / Resources Required
${report.sections.decisions}

## Next Steps / Upcoming Tasks
${report.sections.nextSteps}
  `.trim();
}

// Function to create a DOCX document
async function generateDocx(report: ReportState): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: report.title,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Date: ", bold: true }),
              new TextRun(report.date),
            ],
          }),
          new Paragraph({ text: "" }), // Empty line
          
          // Accomplishments section
          new Paragraph({
            text: "Accomplishments Since Last Update",
            heading: HeadingLevel.HEADING_2,
          }),
          ...report.sections.accomplishments.split('\n').map(line => 
            new Paragraph({ text: line })
          ),
          new Paragraph({ text: "" }), // Empty line
          
          // Insights section
          new Paragraph({
            text: "Insights / Learnings",
            heading: HeadingLevel.HEADING_2,
          }),
          ...report.sections.insights.split('\n').map(line => 
            new Paragraph({ text: line })
          ),
          new Paragraph({ text: "" }), // Empty line
          
          // Decisions section
          new Paragraph({
            text: "Decisions / Risks / Resources Required",
            heading: HeadingLevel.HEADING_2,
          }),
          ...report.sections.decisions.split('\n').map(line => 
            new Paragraph({ text: line })
          ),
          new Paragraph({ text: "" }), // Empty line
          
          // Next Steps section
          new Paragraph({
            text: "Next Steps / Upcoming Tasks",
            heading: HeadingLevel.HEADING_2,
          }),
          ...report.sections.nextSteps.split('\n').map(line => 
            new Paragraph({ text: line })
          ),
        ],
      },
    ],
  });

  // Create a buffer with the document
  return await Packer.toBuffer(doc);
}

// Function to create PDF document
async function generatePdf(report: ReportState): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Collect PDF data chunks
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => {
        try {
          chunks.push(chunk);
        } catch (err) {
          console.error('Error handling PDF chunk:', err);
        }
      });
      
      doc.on('end', () => {
        try {
          const result = Buffer.concat(chunks);
          console.log('PDF generation completed successfully, size:', result.length);
          resolve(result);
        } catch (err) {
          console.error('Error concatenating PDF chunks:', err);
          reject(err);
        }
      });
      
      doc.on('error', (err) => {
        console.error('PDF generation error:', err);
        reject(err);
      });
      
      // Add title
      doc.fontSize(24).text(report.title || 'Report', { align: 'center' });
      doc.moveDown();
      
      // Add date
      doc.fontSize(12).text(`Date: ${report.date || new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);
      
      // Function to add a section
      const addSection = (title: string, content: string) => {
        try {
          // Add section title
          doc.fontSize(16).font('Helvetica-Bold').text(title);
          doc.moveDown(0.5);
          
          // Add section content
          doc.fontSize(12).font('Helvetica');
          
          if (!content || content.trim() === '') {
            doc.text('No content');
            doc.moveDown(1);
            return;
          }
          
          // Split content by lines
          const lines = content.split('\n');
          lines.forEach(line => {
            if (line.trim()) {
              doc.text(line.trim());
            } else {
              doc.moveDown(0.5);
            }
          });
          
          doc.moveDown(2);
        } catch (err) {
          console.error(`Error adding section ${title}:`, err);
        }
      };
      
      // Add each section
      addSection('Accomplishments Since Last Update', report.sections.accomplishments);
      addSection('Insights / Learnings', report.sections.insights);
      addSection('Decisions / Risks / Resources Required', report.sections.decisions);
      addSection('Next Steps / Upcoming Tasks', report.sections.nextSteps);
      
      // Finalize the PDF
      doc.end();
    } catch (err) {
      console.error('Error in PDF generation:', err);
      reject(err);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Export API route called');
    
    // Parse JSON body
    const data = await request.json();
    console.log('Received export request for format:', data.format);
    
    if (!data.reportState || !data.format) {
      console.error('Missing required data');
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }
    
    const { reportState, format } = data;
    
    let buffer: Buffer;
    let filename: string;
    let fileContentType: string;
    
    // Generate a safe filename based on report title
    const safeTitle = (reportState.title || 'Report')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50);
    
    console.log(`Processing ${format} export for report: ${reportState.title || 'Unnamed Report'}`);
    
    try {
      switch (format) {
        case 'md':
          console.log('Generating markdown content');
          const markdownContent = generateMarkdown(reportState);
          buffer = Buffer.from(markdownContent, 'utf-8');
          filename = `${safeTitle}.md`;
          fileContentType = 'text/markdown';
          console.log('Markdown generation complete, buffer size:', buffer.length);
          break;
          
        case 'docx':
          console.log('Generating DOCX document');
          buffer = await generateDocx(reportState);
          filename = `${safeTitle}.docx`;
          fileContentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          console.log('DOCX generation complete, buffer size:', buffer.length);
          break;
          
        case 'pdf':
          console.log('Generating PDF document');
          buffer = await generatePdf(reportState);
          filename = `${safeTitle}.pdf`;
          fileContentType = 'application/pdf';
          console.log('PDF generation complete, buffer size:', buffer.length);
          break;
          
        default:
          console.error('Unsupported format:', format);
          return NextResponse.json(
            { error: 'Unsupported format' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('Error generating document:', error);
      return NextResponse.json(
        { error: `Failed to generate ${format} document` },
        { status: 500 }
      );
    }
    
    console.log(`Returning ${format} file with content type: ${fileContentType}`);
    
    // Return the file as a response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fileContentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        // Add headers to prevent caching issues
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (error) {
    console.error('Error in export API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export report' },
      { status: 500 }
    );
  }
} 