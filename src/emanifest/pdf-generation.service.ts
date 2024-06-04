import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import EmanifestEntity from './entities/emanifest.entity';
import e from 'express';

@Injectable()
export class PdfGenerationService {
  async generateEmanifestPdf(emanifest: EmanifestEntity): Promise<Buffer> {
    const data = emanifest
    const routeObject = JSON.parse(<string><unknown>data.route);; // Parse the JSON string
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ bufferPages: true, layout: 'landscape' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add content to the PDF
      doc.font('Helvetica-Bold').fontSize(20).text('...... STATE DATA MANAGEMENT SYSTEM', { align: 'center' }).moveDown();
      doc.fontSize(12).text(`Date: ${emanifest.createdAt.toISOString().slice(0, 10)}`, { align: 'left' }).moveDown();
      doc.fontSize(12).text(`Manifest No: ${emanifest.id}`, { align: 'left' }).moveDown();
      doc.fontSize(12).text(`Vehicle No: ${emanifest.plateNumber}`, { align: 'left' }).moveDown();
    
      // Add passenger details in a tabular form
      doc.font('Helvetica-Bold').fontSize(12).text(`Driver: ${emanifest.driverName}`, { align: 'left' }).moveDown();
      doc.font('Helvetica-Bold').fontSize(12).text(`NO of Passengers: ${emanifest.numberOfPassengers}`, { align: 'left' }).moveDown();
      doc.fontSize(12).text(`Departure/Destination Park: ${routeObject.from}/${routeObject.to}`, { align: 'left' }).moveDown();

      // Define column headers
      const headers = [
        'Name', 'Address', 'Phone No', 'Destination', 'Age', 'Sex',
        'Marital Status', 'NOK', 'NOK Address', 'NOK Phone',
        // 'Relationship with Next of Kin'
      ];

      // Define column widths
      const columnWidths = [90, 90, 80, 100, 30, 30, 70, 90, 100, 90, 100];
      const startX = 30; // Starting X position
      let currentY = doc.y + 10; // Starting Y position

      const pageHeight = doc.page.height;
      const marginBottom = 30; // Adjust the bottom margin as needed
      const rowHeight = 20;

      // Function to add headers
      const addHeaders = () => {
        let currentX = startX;
        headers.forEach((header, index) => {
          doc.font('Helvetica-Bold').fontSize(10).text(header, currentX, currentY, { width: columnWidths[index], align: 'center' });
          currentX += columnWidths[index];
        });
        currentY += rowHeight;
      };

      // Add headers initially
      addHeaders();

      // Function to check and add a new page if needed
      const checkAndAddNewPage = () => {
        if (currentY + rowHeight > pageHeight - marginBottom) {
          doc.addPage({ layout: 'landscape' });
          currentY = doc.y; // Reset currentY to the top of the new page
          addHeaders(); // Add headers on the new page
        }
      };

      // Add passenger data
      emanifest.passengers.forEach(passenger => {
        checkAndAddNewPage();
        const { name, address, phoneNumber, destinationAddress, age, sex, maritalStatus, nextOfKinName, nextOfKinAddress, nextOfKinPhoneNumber, relationshipWithNextOfKin } = passenger;
        const passengerData = [name, address, phoneNumber, destinationAddress, age, sex, maritalStatus, nextOfKinName, nextOfKinAddress, nextOfKinPhoneNumber, /*relationshipWithNextOfKin*/];

        let currentX = startX;
        passengerData.forEach((data, index) => {
          doc.font('Helvetica').fontSize(10).text(data, currentX, currentY, { width: columnWidths[index], align: 'center' });
          currentX += columnWidths[index];
        });
        currentY += rowHeight; // Move down for the next row
      });

      doc.end();
    });
  }
}
