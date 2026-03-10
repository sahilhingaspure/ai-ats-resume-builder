import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import {
  Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Packer, BorderStyle, TabStopPosition, TabStopType,
} from 'docx';

export class ExportService {
  // ─────────── PDF Generation ───────────
  async generatePDF(resume: any, templateId: string = 'classic'): Promise<Buffer> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;
    const titleSize = 20;
    const sectionSize = 13;
    const margin = 50;
    const lineHeight = 14;

    let page = doc.addPage([612, 792]); // US Letter
    let y = 792 - margin;

    const addNewPageIfNeeded = (needed: number) => {
      if (y - needed < margin) {
        page = doc.addPage([612, 792]);
        y = 792 - margin;
      }
    };

    const drawText = (text: string, x: number, yPos: number, f: PDFFont, size: number, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x, y: yPos, size, font: f, color });
    };

    const drawSection = (title: string) => {
      addNewPageIfNeeded(30);
      y -= lineHeight;
      // Line separator
      page.drawLine({
        start: { x: margin, y },
        end: { x: 612 - margin, y },
        thickness: 0.5,
        color: rgb(0.6, 0.6, 0.6),
      });
      y -= lineHeight + 2;
      drawText(title.toUpperCase(), margin, y, fontBold, sectionSize, rgb(0.15, 0.15, 0.15));
      y -= lineHeight + 4;
    };

    const wrapText = (text: string, maxWidth: number, f: PDFFont, size: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let current = '';
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (f.widthOfTextAtSize(test, size) <= maxWidth) {
          current = test;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      }
      if (current) lines.push(current);
      return lines;
    };

    const maxWidth = 612 - margin * 2;

    // ── Header / Personal Info ──
    if (resume.personalInfo) {
      const pi = resume.personalInfo;
      drawText(pi.name, margin, y, fontBold, titleSize, rgb(0.1, 0.1, 0.1));
      y -= titleSize + 4;

      const contactParts: string[] = [];
      if (pi.email) contactParts.push(pi.email);
      if (pi.phone) contactParts.push(pi.phone);
      if (pi.location) contactParts.push(pi.location);
      if (contactParts.length) {
        drawText(contactParts.join('  |  '), margin, y, font, fontSize, rgb(0.3, 0.3, 0.3));
        y -= lineHeight;
      }

      const linkParts: string[] = [];
      if (pi.linkedin) linkParts.push(pi.linkedin);
      if (pi.portfolio) linkParts.push(pi.portfolio);
      if (linkParts.length) {
        drawText(linkParts.join('  |  '), margin, y, font, fontSize - 1, rgb(0.2, 0.4, 0.7));
        y -= lineHeight;
      }
    }

    // ── Summary ──
    if (resume.summary?.content) {
      drawSection('Professional Summary');
      const lines = wrapText(resume.summary.content, maxWidth, font, fontSize);
      for (const line of lines) {
        addNewPageIfNeeded(lineHeight);
        drawText(line, margin, y, font, fontSize, rgb(0.2, 0.2, 0.2));
        y -= lineHeight;
      }
    }

    // ── Experience ──
    if (resume.experiences?.length) {
      drawSection('Experience');
      for (const exp of resume.experiences) {
        addNewPageIfNeeded(40);
        drawText(exp.jobTitle, margin, y, fontBold, fontSize + 1);
        y -= lineHeight;
        const meta = [exp.company, exp.location, `${exp.startDate} - ${exp.endDate || 'Present'}`].filter(Boolean).join('  |  ');
        drawText(meta, margin, y, font, fontSize - 1, rgb(0.4, 0.4, 0.4));
        y -= lineHeight + 2;

        for (const resp of exp.responsibilities) {
          const lines = wrapText(`•  ${resp}`, maxWidth - 10, font, fontSize);
          for (const line of lines) {
            addNewPageIfNeeded(lineHeight);
            drawText(line, margin + 10, y, font, fontSize, rgb(0.2, 0.2, 0.2));
            y -= lineHeight;
          }
        }
        y -= 4;
      }
    }

    // ── Skills ──
    if (resume.skills?.length) {
      drawSection('Skills');
      const grouped: Record<string, string[]> = {};
      for (const skill of resume.skills) {
        const cat = skill.category || 'OTHER';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(skill.name);
      }
      for (const [cat, skills] of Object.entries(grouped)) {
        addNewPageIfNeeded(lineHeight);
        const label = cat.replace('_', ' ');
        const text = `${label}: ${skills.join(', ')}`;
        const lines = wrapText(text, maxWidth, font, fontSize);
        for (const line of lines) {
          addNewPageIfNeeded(lineHeight);
          drawText(line, margin, y, font, fontSize);
          y -= lineHeight;
        }
      }
    }

    // ── Education ──
    if (resume.educations?.length) {
      drawSection('Education');
      for (const edu of resume.educations) {
        addNewPageIfNeeded(30);
        drawText(edu.degree, margin, y, fontBold, fontSize);
        y -= lineHeight;
        const meta = [edu.university, edu.graduationYear, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join('  |  ');
        drawText(meta, margin, y, font, fontSize - 1, rgb(0.4, 0.4, 0.4));
        y -= lineHeight + 4;
      }
    }

    // ── Projects ──
    if (resume.projects?.length) {
      drawSection('Projects');
      for (const proj of resume.projects) {
        addNewPageIfNeeded(40);
        drawText(proj.name, margin, y, fontBold, fontSize);
        y -= lineHeight;
        if (proj.technologies?.length) {
          drawText(`Technologies: ${proj.technologies.join(', ')}`, margin, y, font, fontSize - 1, rgb(0.4, 0.4, 0.4));
          y -= lineHeight;
        }
        const descLines = wrapText(proj.description, maxWidth, font, fontSize);
        for (const line of descLines) {
          addNewPageIfNeeded(lineHeight);
          drawText(line, margin, y, font, fontSize, rgb(0.2, 0.2, 0.2));
          y -= lineHeight;
        }
        if (proj.githubLink) {
          drawText(proj.githubLink, margin, y, font, fontSize - 1, rgb(0.2, 0.4, 0.7));
          y -= lineHeight;
        }
        y -= 4;
      }
    }

    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
  }

  // ─────────── DOCX Generation ───────────
  async generateDOCX(resume: any): Promise<Buffer> {
    const sections: any[] = [];

    // Header
    if (resume.personalInfo) {
      const pi = resume.personalInfo;
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: pi.name, bold: true, size: 36, font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );

      const contactParts: string[] = [];
      if (pi.email) contactParts.push(pi.email);
      if (pi.phone) contactParts.push(pi.phone);
      if (pi.location) contactParts.push(pi.location);
      if (pi.linkedin) contactParts.push(pi.linkedin);
      if (pi.portfolio) contactParts.push(pi.portfolio);

      sections.push(
        new Paragraph({
          children: [new TextRun({ text: contactParts.join('  |  '), size: 18, font: 'Calibri', color: '666666' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    const addSectionHeader = (title: string) => {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 24, font: 'Calibri', color: '2B2B2B' })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        })
      );
    };

    // Summary
    if (resume.summary?.content) {
      addSectionHeader('Professional Summary');
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: resume.summary.content, size: 20, font: 'Calibri' })],
          spacing: { after: 200 },
        })
      );
    }

    // Experience
    if (resume.experiences?.length) {
      addSectionHeader('Experience');
      for (const exp of resume.experiences) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.jobTitle, bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: `  |  ${exp.company}`, size: 20, font: 'Calibri', color: '555555' }),
            ],
            spacing: { before: 150, after: 50 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: [exp.location, `${exp.startDate} - ${exp.endDate || 'Present'}`].filter(Boolean).join('  |  '),
                size: 18, font: 'Calibri', color: '888888', italics: true,
              }),
            ],
            spacing: { after: 50 },
          })
        );
        for (const resp of exp.responsibilities) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: resp, size: 20, font: 'Calibri' })],
              bullet: { level: 0 },
              spacing: { after: 30 },
            })
          );
        }
      }
    }

    // Skills
    if (resume.skills?.length) {
      addSectionHeader('Skills');
      const grouped: Record<string, string[]> = {};
      for (const skill of resume.skills) {
        const cat = skill.category || 'OTHER';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(skill.name);
      }
      for (const [cat, skills] of Object.entries(grouped)) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${cat.replace('_', ' ')}: `, bold: true, size: 20, font: 'Calibri' }),
              new TextRun({ text: skills.join(', '), size: 20, font: 'Calibri' }),
            ],
            spacing: { after: 50 },
          })
        );
      }
    }

    // Education
    if (resume.educations?.length) {
      addSectionHeader('Education');
      for (const edu of resume.educations) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: `  |  ${edu.university}  |  ${edu.graduationYear}`, size: 20, font: 'Calibri', color: '555555' }),
            ],
            spacing: { after: 50 },
          })
        );
        if (edu.gpa) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 18, font: 'Calibri', color: '888888' })],
              spacing: { after: 100 },
            })
          );
        }
      }
    }

    // Projects
    if (resume.projects?.length) {
      addSectionHeader('Projects');
      for (const proj of resume.projects) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.name, bold: true, size: 22, font: 'Calibri' }),
            ],
            spacing: { before: 100, after: 30 },
          }),
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 20, font: 'Calibri' })],
            spacing: { after: 30 },
          })
        );
        if (proj.technologies?.length) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Technologies: ', bold: true, size: 18, font: 'Calibri' }),
                new TextRun({ text: proj.technologies.join(', '), size: 18, font: 'Calibri', color: '555555' }),
              ],
              spacing: { after: 30 },
            })
          );
        }
        if (proj.githubLink) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: proj.githubLink, size: 18, font: 'Calibri', color: '2563EB' })],
              spacing: { after: 100 },
            })
          );
        }
      }
    }

    const docxDoc = new Document({
      sections: [{ children: sections }],
      styles: {
        default: {
          document: {
            run: { font: 'Calibri', size: 20 },
          },
        },
      },
    });

    const buffer = await Packer.toBuffer(docxDoc);
    return Buffer.from(buffer);
  }

  // ─────────── Plain Text ───────────
  generatePlainText(resume: any): string {
    const lines: string[] = [];

    if (resume.personalInfo) {
      const pi = resume.personalInfo;
      lines.push(pi.name);
      const contact = [pi.email, pi.phone, pi.location].filter(Boolean).join(' | ');
      if (contact) lines.push(contact);
      const links = [pi.linkedin, pi.portfolio].filter(Boolean).join(' | ');
      if (links) lines.push(links);
      lines.push('');
    }

    if (resume.summary?.content) {
      lines.push('PROFESSIONAL SUMMARY');
      lines.push('-'.repeat(40));
      lines.push(resume.summary.content);
      lines.push('');
    }

    if (resume.experiences?.length) {
      lines.push('EXPERIENCE');
      lines.push('-'.repeat(40));
      for (const exp of resume.experiences) {
        lines.push(`${exp.jobTitle} | ${exp.company}`);
        lines.push(`${[exp.location, `${exp.startDate} - ${exp.endDate || 'Present'}`].filter(Boolean).join(' | ')}`);
        for (const resp of exp.responsibilities) {
          lines.push(`  - ${resp}`);
        }
        lines.push('');
      }
    }

    if (resume.skills?.length) {
      lines.push('SKILLS');
      lines.push('-'.repeat(40));
      const grouped: Record<string, string[]> = {};
      for (const skill of resume.skills) {
        const cat = skill.category || 'OTHER';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(skill.name);
      }
      for (const [cat, skills] of Object.entries(grouped)) {
        lines.push(`${cat.replace('_', ' ')}: ${skills.join(', ')}`);
      }
      lines.push('');
    }

    if (resume.educations?.length) {
      lines.push('EDUCATION');
      lines.push('-'.repeat(40));
      for (const edu of resume.educations) {
        lines.push(`${edu.degree} | ${edu.university} | ${edu.graduationYear}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
      }
      lines.push('');
    }

    if (resume.projects?.length) {
      lines.push('PROJECTS');
      lines.push('-'.repeat(40));
      for (const proj of resume.projects) {
        lines.push(proj.name);
        lines.push(proj.description);
        if (proj.technologies?.length) lines.push(`Technologies: ${proj.technologies.join(', ')}`);
        if (proj.githubLink) lines.push(proj.githubLink);
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
