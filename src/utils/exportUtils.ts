import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface FormData {
  patientInfo: {
    name?: string;
    age?: string;
    sex?: string;
  };
  circumstances?: Record<string, any>;
  onset?: Record<string, any>;
  attack?: Record<string, any>;
  end?: Record<string, any>;
  background?: Record<string, any>;
  clinicalFeatures?: Record<string, any>;
  ecgFindings?: Record<string, any>;
  labTests?: Record<string, any>;
  initialEvaluation?: Record<string, any>;
  tiltTestProtocol?: Record<string, any>;
  riskScore?: Record<string, any>;
  differentialDiagnosis?: Record<string, any>;
  subclavianSteal?: Record<string, any>;
  carotidSinusMassage?: Record<string, any>;
  orthostaticIntolerance?: Record<string, any>;
  diagnosticCriteria?: Record<string, any>;
}

const formatSectionData = (data: Record<string, any> | undefined): string[] => {
  if (!data || Object.keys(data).length === 0) return [];
  
  const positiveItems: string[] = [];
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/^./, str => str.toUpperCase());
    if (typeof value === 'boolean') {
      positiveItems.push(formattedKey);
    } else if (Array.isArray(value) && value.length > 0) {
      positiveItems.push(`${formattedKey}: ${value.join(', ')}`);
    } else if (typeof value === 'object') {
      const nested = formatSectionData(value);
      if (nested.length > 0) positiveItems.push(...nested);
    } else {
      positiveItems.push(`${formattedKey}: ${value}`);
    }
  });
  return positiveItems;
};

const formatSectionAsSummary = (data: Record<string, any> | undefined): string => {
  const items = formatSectionData(data);
  if (items.length === 0) return '';
  return items.join('; ');
};

export const exportToPDF = (formData: FormData, language: 'en' | 'ml' = 'en') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;
  const lineHeight = 7;

  const title = language === 'ml' ? 'ബോധക്ഷയ വിലയിരുത്തൽ റിപ്പോർട്ട്' : 'Loss of Consciousness Assessment Report';
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateLabel = language === 'ml' ? 'തീയതി:' : 'Date:';
  doc.text(`${dateLabel} ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  // Patient Info
  const patientLabel = language === 'ml' ? 'രോഗി വിവരങ്ങൾ' : 'Patient Information';
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(patientLabel, margin, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const nameLabel = language === 'ml' ? 'പേര്:' : 'Name:';
  const ageLabel = language === 'ml' ? 'പ്രായം:' : 'Age:';
  const sexLabel = language === 'ml' ? 'ലിംഗഭേദം:' : 'Sex:';
  
  doc.text(`${nameLabel} ${formData.patientInfo?.name || 'Not provided'}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`${ageLabel} ${formData.patientInfo?.age || 'Not provided'}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`${sexLabel} ${formData.patientInfo?.sex || 'Not provided'}`, margin, yPosition);
  yPosition += 15;

  // Helper function to add section
  const addSection = (title: string, data: Record<string, any> | undefined) => {
    const summary = formatSectionAsSummary(data);
    if (!summary) return; // Skip sections with no positive findings

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const splitLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
    splitLines.forEach((splitLine: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(splitLine, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 5;
  };

  // Add all sections
  const sections = [
    { title: language === 'ml' ? 'സാഹചര്യങ്ങൾ' : 'Circumstances', data: formData.circumstances },
    { title: language === 'ml' ? 'ആരംഭം' : 'Onset', data: formData.onset },
    { title: language === 'ml' ? 'ആക്രമണം' : 'Attack', data: formData.attack },
    { title: language === 'ml' ? 'അവസാനം' : 'End', data: formData.end },
    { title: language === 'ml' ? 'പശ്ചാത്തലം' : 'Background', data: formData.background },
    { title: language === 'ml' ? 'ക്ലിനിക്കൽ സവിശേഷതകൾ' : 'Clinical Features', data: formData.clinicalFeatures },
    { title: language === 'ml' ? 'ECG കണ്ടെത്തലുകൾ' : 'ECG Findings', data: formData.ecgFindings },
    { title: language === 'ml' ? 'ലാബ് ടെസ്റ്റുകൾ' : 'Lab Tests', data: formData.labTests },
    { title: language === 'ml' ? 'പ്രാരംഭ വിലയിരുത്തൽ' : 'Initial Evaluation', data: formData.initialEvaluation },
    { title: language === 'ml' ? 'ടിൽറ്റ് ടെസ്റ്റ് പ്രോട്ടോക്കോൾ' : 'Tilt Test Protocol', data: formData.tiltTestProtocol },
    { title: language === 'ml' ? 'റിസ്ക് സ്കോർ' : 'Risk Score', data: formData.riskScore },
    { title: language === 'ml' ? 'ഡിഫറൻഷ്യൽ ഡയഗ്നോസിസ്' : 'Differential Diagnosis', data: formData.differentialDiagnosis },
    { title: language === 'ml' ? 'സബ്ക്ലേവിയൻ സ്റ്റീൽ' : 'Subclavian Steal', data: formData.subclavianSteal },
    { title: language === 'ml' ? 'കരോട്ടിഡ് സൈനസ് മസാജ്' : 'Carotid Sinus Massage', data: formData.carotidSinusMassage },
    { title: language === 'ml' ? 'ഓർത്തോസ്റ്റാറ്റിക് അസഹിഷ്ണുത' : 'Orthostatic Intolerance', data: formData.orthostaticIntolerance },
    { title: language === 'ml' ? 'ഡയഗ്നോസ്റ്റിക് മാനദണ്ഡങ്ങൾ' : 'Diagnostic Criteria', data: formData.diagnosticCriteria },
    { title: language === 'ml' ? 'ഓട്ടോണോമിക് ടെസ്റ്റിംഗ്' : 'Autonomic Testing (Finometer)', data: (formData as any).autonomicTesting },
    { title: language === 'ml' ? 'ഇടപെടലുകൾ' : 'Interventions & Management', data: (formData as any).interventions },
    { title: language === 'ml' ? 'ഡ്രോപ്പ് അറ്റാക്കുകൾ' : 'Drop Attacks Workup', data: (formData as any).dropAttacks },
  ];

  sections.forEach(section => addSection(section.title, section.data));

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  const footer = language === 'ml' 
    ? 'ഈ റിപ്പോർട്ട് ലോസ് ഓഫ് കോൺഷ്യസ്നെസ് അസെസ്മെന്റ് ടൂൾ ഉപയോഗിച്ച് സൃഷ്ടിച്ചതാണ്'
    : 'This report was generated using the Loss of Consciousness Assessment Tool';
  doc.text(footer, pageWidth / 2, 290, { align: 'center' });

  // Save
  const filename = `syncope-assessment-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export const exportToWord = async (formData: FormData, language: 'en' | 'ml' = 'en') => {
  const title = language === 'ml' ? 'ബോധക്ഷയ വിലയിരുത്തൽ റിപ്പോർട്ട്' : 'Loss of Consciousness Assessment Report';
  
  const createSectionParagraphs = (sectionTitle: string, data: Record<string, any> | undefined): Paragraph[] => {
    const summary = formatSectionAsSummary(data);
    if (!summary) return []; // Skip sections with no positive findings

    return [
      new Paragraph({
        text: sectionTitle,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: summary })],
        spacing: { after: 100 },
      }),
    ];
  };

  const sections = [
    { title: language === 'ml' ? 'സാഹചര്യങ്ങൾ' : 'Circumstances', data: formData.circumstances },
    { title: language === 'ml' ? 'ആരംഭം' : 'Onset', data: formData.onset },
    { title: language === 'ml' ? 'ആക്രമണം' : 'Attack', data: formData.attack },
    { title: language === 'ml' ? 'അവസാനം' : 'End', data: formData.end },
    { title: language === 'ml' ? 'പശ്ചാത്തലം' : 'Background', data: formData.background },
    { title: language === 'ml' ? 'ക്ലിനിക്കൽ സവിശേഷതകൾ' : 'Clinical Features', data: formData.clinicalFeatures },
    { title: language === 'ml' ? 'ECG കണ്ടെത്തലുകൾ' : 'ECG Findings', data: formData.ecgFindings },
    { title: language === 'ml' ? 'ലാബ് ടെസ്റ്റുകൾ' : 'Lab Tests', data: formData.labTests },
    { title: language === 'ml' ? 'പ്രാരംഭ വിലയിരുത്തൽ' : 'Initial Evaluation', data: formData.initialEvaluation },
    { title: language === 'ml' ? 'ടിൽറ്റ് ടെസ്റ്റ് പ്രോട്ടോക്കോൾ' : 'Tilt Test Protocol', data: formData.tiltTestProtocol },
    { title: language === 'ml' ? 'റിസ്ക് സ്കോർ' : 'Risk Score', data: formData.riskScore },
    { title: language === 'ml' ? 'ഡിഫറൻഷ്യൽ ഡയഗ്നോസിസ്' : 'Differential Diagnosis', data: formData.differentialDiagnosis },
    { title: language === 'ml' ? 'സബ്ക്ലേവിയൻ സ്റ്റീൽ' : 'Subclavian Steal', data: formData.subclavianSteal },
    { title: language === 'ml' ? 'കരോട്ടിഡ് സൈനസ് മസാജ്' : 'Carotid Sinus Massage', data: formData.carotidSinusMassage },
    { title: language === 'ml' ? 'ഓർത്തോസ്റ്റാറ്റിക് അസഹിഷ്ണുത' : 'Orthostatic Intolerance', data: formData.orthostaticIntolerance },
    { title: language === 'ml' ? 'ഡയഗ്നോസ്റ്റിക് മാനദണ്ഡങ്ങൾ' : 'Diagnostic Criteria', data: formData.diagnosticCriteria },
    { title: language === 'ml' ? 'ഓട്ടോണോമിക് ടെസ്റ്റിംഗ്' : 'Autonomic Testing (Finometer)', data: (formData as any).autonomicTesting },
    { title: language === 'ml' ? 'ഇടപെടലുകൾ' : 'Interventions & Management', data: (formData as any).interventions },
  ];

  const nameLabel = language === 'ml' ? 'പേര്:' : 'Name:';
  const ageLabel = language === 'ml' ? 'പ്രായം:' : 'Age:';
  const sexLabel = language === 'ml' ? 'ലിംഗഭേദം:' : 'Sex:';
  const patientLabel = language === 'ml' ? 'രോഗി വിവരങ്ങൾ' : 'Patient Information';
  const dateLabel = language === 'ml' ? 'തീയതി:' : 'Date:';

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.TITLE,
            spacing: { after: 400 },
          }),
          
          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: `${dateLabel} ${new Date().toLocaleDateString()}`,
                size: 20,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Patient Info Header
          new Paragraph({
            text: patientLabel,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          // Patient Info Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph(nameLabel)],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(formData.patientInfo?.name || 'Not provided')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph(ageLabel)],
                  }),
                  new TableCell({
                    children: [new Paragraph(formData.patientInfo?.age || 'Not provided')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph(sexLabel)],
                  }),
                  new TableCell({
                    children: [new Paragraph(formData.patientInfo?.sex || 'Not provided')],
                  }),
                ],
              }),
            ],
          }),

          // All sections
          ...sections.flatMap(section => createSectionParagraphs(section.title, section.data)),

          // Footer
          new Paragraph({
            children: [
              new TextRun({
                text: language === 'ml' 
                  ? 'ഈ റിപ്പോർട്ട് ലോസ് ഓഫ് കോൺഷ്യസ്നെസ് അസെസ്മെന്റ് ടൂൾ ഉപയോഗിച്ച് സൃഷ്ടിച്ചതാണ്'
                  : 'This report was generated using the Loss of Consciousness Assessment Tool',
                size: 16,
                italics: true,
                color: '666666',
              }),
            ],
            spacing: { before: 800 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `syncope-assessment-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);
};
