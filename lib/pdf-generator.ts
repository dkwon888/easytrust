import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';

interface QuestionnaireData {
  personal: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dob: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    maritalStatus: string;
    spouseFirst?: string;
    spouseLast?: string;
    spouseDob?: string;
    jointTrust?: boolean;
  };
  trust: {
    trustName: string;
    successorFirst: { name: string; relationship: string; address: string; phone: string; email?: string };
    successorSecond?: { name: string; relationship: string; address: string; phone: string; email?: string };
  };
  beneficiaries: {
    primary: Array<{ name: string; relationship: string; dob?: string; percentage: number }>;
    contingent?: Array<{ name: string; relationship: string; percentage: number }>;
    specific?: Array<{ item: string; recipient: string }>;
  };
  assets: {
    realEstate?: string;
    bankAccounts?: string;
    investment?: string;
    business?: string;
    vehicles?: string;
    other?: string;
  };
  poa: {
    agent: { name: string; relationship: string; address: string; phone: string; email?: string };
    alternate?: { name: string; relationship: string; address: string; phone: string };
    powers: string[];
  };
  healthcare: {
    agent: { name: string; relationship: string; address: string; phone: string };
    alternate?: { name: string; relationship: string; phone: string };
    lifeSustaining: string;
    artificialNutrition: string;
    organDonation: string;
    additionalWishes?: string;
  };
  hipaa: {
    persons: Array<{ name: string; relationship: string; phone: string }>;
  };
  engagement: {
    signatureName: string;
    signedAt: string;
  };
}

interface AttorneyInfo {
  name: string;
  barNumber: string;
  firm: string;
  address: string;
  phone: string;
  email: string;
}

const PAGE_MARGIN = 60;
const LINE_HEIGHT = 18;
const SECTION_GAP = 30;

async function createBaseDocument(): Promise<{
  doc: PDFDocument;
  helvetica: PDFFont;
  helveticaBold: PDFFont;
  helveticaOblique: PDFFont;
}> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);
  return { doc, helvetica, helveticaBold, helveticaOblique };
}

function addPage(doc: PDFDocument): { page: PDFPage; width: number; height: number } {
  const page = doc.addPage([612, 792]);
  return { page, width: 612, height: 792 };
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = rgb(0, 0, 0)
): void {
  page.drawText(text, { x, y, font, size, color });
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  width: number
): void {
  const textWidth = font.widthOfTextAtSize(text, size);
  const x = (width - textWidth) / 2;
  page.drawText(text, { x, y, font, size, color: rgb(0, 0, 0) });
}

function drawLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number): void {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.5, color: rgb(0.3, 0.3, 0.3) });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function addPageHeader(
  page: PDFPage,
  title: string,
  bold: PDFFont,
  regular: PDFFont,
  attorney: AttorneyInfo,
  width: number,
  height: number
): number {
  let y = height - 50;
  drawCenteredText(page, attorney.firm, y, bold, 12, width);
  y -= LINE_HEIGHT;
  drawCenteredText(page, attorney.address, y, regular, 9, width);
  y -= 14;
  drawCenteredText(page, `Tel: ${attorney.phone}  |  ${attorney.email}`, y, regular, 9, width);
  y -= 20;
  drawLine(page, PAGE_MARGIN, y, width - PAGE_MARGIN, y);
  y -= 20;
  drawCenteredText(page, title.toUpperCase(), y, bold, 14, width);
  y -= 25;
  drawLine(page, PAGE_MARGIN, y, width - PAGE_MARGIN, y);
  y -= 25;
  return y;
}

class DocumentWriter {
  private page: PDFPage;
  private doc: PDFDocument;
  private y: number;
  private readonly width: number;
  private readonly height: number;
  private readonly regular: PDFFont;
  private readonly bold: PDFFont;
  private readonly italic: PDFFont;
  private readonly contentWidth: number;
  private readonly attorney: AttorneyInfo;
  private readonly title: string;

  constructor(
    doc: PDFDocument,
    attorney: AttorneyInfo,
    title: string,
    regular: PDFFont,
    bold: PDFFont,
    italic: PDFFont
  ) {
    this.doc = doc;
    this.attorney = attorney;
    this.title = title;
    this.regular = regular;
    this.bold = bold;
    this.italic = italic;
    this.width = 612;
    this.height = 792;
    this.contentWidth = this.width - PAGE_MARGIN * 2;
    const { page } = addPage(doc);
    this.page = page;
    this.y = addPageHeader(this.page, title, bold, regular, attorney, this.width, this.height);
  }

  private newPageIfNeeded(needed = LINE_HEIGHT * 3): void {
    if (this.y < PAGE_MARGIN + needed) {
      const { page } = addPage(this.doc);
      this.page = page;
      this.y = this.height - PAGE_MARGIN;
    }
  }

  section(text: string): this {
    this.newPageIfNeeded(40);
    this.y -= 10;
    drawText(this.page, text.toUpperCase(), PAGE_MARGIN, this.y, this.bold, 10, rgb(0.1, 0.1, 0.5));
    this.y -= 4;
    drawLine(this.page, PAGE_MARGIN, this.y, this.width - PAGE_MARGIN, this.y);
    this.y -= LINE_HEIGHT;
    return this;
  }

  paragraph(text: string, indent = 0): this {
    const lines = wrapText(text, this.regular, 10, this.contentWidth - indent);
    for (const line of lines) {
      this.newPageIfNeeded();
      drawText(this.page, line, PAGE_MARGIN + indent, this.y, this.regular, 10);
      this.y -= LINE_HEIGHT;
    }
    this.y -= 4;
    return this;
  }

  boldLine(label: string, value: string): this {
    this.newPageIfNeeded();
    drawText(this.page, `${label}: `, PAGE_MARGIN, this.y, this.bold, 10);
    const labelWidth = this.bold.widthOfTextAtSize(`${label}: `, 10);
    drawText(this.page, value, PAGE_MARGIN + labelWidth, this.y, this.regular, 10);
    this.y -= LINE_HEIGHT;
    return this;
  }

  gap(amount = SECTION_GAP): this {
    this.y -= amount;
    return this;
  }

  signatureLine(label: string): this {
    this.newPageIfNeeded(50);
    this.y -= 10;
    drawLine(this.page, PAGE_MARGIN, this.y, PAGE_MARGIN + 200, this.y);
    this.y -= LINE_HEIGHT;
    drawText(this.page, label, PAGE_MARGIN, this.y, this.regular, 9, rgb(0.4, 0.4, 0.4));
    this.y -= LINE_HEIGHT;
    return this;
  }

  notaryBlock(): this {
    this.newPageIfNeeded(120);
    this.y -= 20;
    drawText(this.page, 'NOTARY ACKNOWLEDGMENT', PAGE_MARGIN, this.y, this.bold, 10);
    this.y -= LINE_HEIGHT * 2;
    const text = 'State of California\nCounty of ___________________________\n\nBefore me, the undersigned Notary Public, personally appeared _________________________, known to me (or proved to me on the basis of satisfactory evidence) to be the person whose name is subscribed to the within instrument, and acknowledged to me that they executed the same in their authorized capacity.';
    this.paragraph(text);
    this.y -= 20;
    this.signatureLine('Notary Signature');
    drawText(this.page, 'My Commission Expires: _______________', PAGE_MARGIN + 220, this.y + LINE_HEIGHT, this.regular, 9);
    return this;
  }
}

export async function generateTrustPackage(
  data: QuestionnaireData,
  attorney: AttorneyInfo
): Promise<{ type: string; bytes: Uint8Array }[]> {
  const results = await Promise.all([
    generateTrust(data, attorney),
    generatePOA(data, attorney),
    generateAHCD(data, attorney),
    generateHIPAA(data, attorney),
    generatePourOverWill(data, attorney),
    generateCertificate(data, attorney),
  ]);
  return results;
}

async function generateTrust(
  data: QuestionnaireData,
  attorney: AttorneyInfo
): Promise<{ type: string; bytes: Uint8Array }> {
  const { doc, helvetica, helveticaBold, helveticaOblique } = await createBaseDocument();
  const w = new DocumentWriter(doc, attorney, data.trust.trustName, helvetica, helveticaBold, helveticaOblique);
  const trustorName = [data.personal.firstName, data.personal.middleName, data.personal.lastName]
    .filter(Boolean)
    .join(' ');

  w.section('Article I — Declaration of Trust')
    .paragraph(
      `I, ${trustorName}, residing at ${data.personal.address}, ${data.personal.city}, ${data.personal.state} ${data.personal.zip}, hereby declare that I have transferred and delivered to myself as Trustee the property described in Schedule A attached hereto. I hereby declare that I hold said property, and any property subsequently transferred to this trust, IN TRUST, for the uses and purposes and subject to the terms and conditions set forth in this instrument, which shall be known as the ${data.trust.trustName}.`
    )
    .section('Article II — Revocability')
    .paragraph(
      'This trust is hereby declared to be REVOCABLE. I reserve the right during my lifetime to revoke this trust in whole or in part, to withdraw any property from the trust, and to amend the terms of this trust in any manner whatsoever.'
    )
    .section('Article III — Trustee')
    .boldLine('Initial Trustee', trustorName)
    .boldLine('First Successor Trustee', `${data.trust.successorFirst.name} (${data.trust.successorFirst.relationship}), ${data.trust.successorFirst.address}`)
    .paragraph('Should the initial Trustee become unable or unwilling to serve, the First Successor Trustee shall assume all duties without court intervention.')

  if (data.trust.successorSecond) {
    w.boldLine('Second Successor Trustee', `${data.trust.successorSecond.name} (${data.trust.successorSecond.relationship}), ${data.trust.successorSecond.address}`)
      .paragraph('Should the First Successor Trustee be unable or unwilling to serve, the Second Successor Trustee shall serve.');
  }

  w.section('Article IV — Distributions During Lifetime')
    .paragraph(
      'During my lifetime, the Trustee shall pay to me or apply for my benefit so much of the income and principal of the trust estate as I may direct from time to time. In the event of my incapacity, the Trustee shall pay to me or apply for my benefit so much of the net income and principal of the trust estate as is reasonably necessary for my health, support, maintenance, and general welfare.'
    )
    .section('Article V — Distribution Upon Death')
    .paragraph('Upon my death, the Trustee shall distribute the trust estate as follows:');

  for (const bene of data.beneficiaries.primary) {
    w.boldLine(`${bene.percentage}% to`, `${bene.name} (${bene.relationship})`);
  }

  if (data.beneficiaries.contingent && data.beneficiaries.contingent.length > 0) {
    w.paragraph('If any primary beneficiary predeceases me, their share shall be distributed equally among the surviving primary beneficiaries, unless otherwise provided. If all primary beneficiaries predecease me, the trust estate shall be distributed to the following contingent beneficiaries:');
    for (const bene of data.beneficiaries.contingent) {
      w.boldLine(`${bene.percentage}% to`, `${bene.name} (${bene.relationship})`);
    }
  }

  if (data.beneficiaries.specific && data.beneficiaries.specific.length > 0) {
    w.section('Specific Bequests');
    for (const bequest of data.beneficiaries.specific) {
      w.boldLine(bequest.item, `to ${bequest.recipient}`);
    }
  }

  w.section('Article VI — Trust Property (Schedule A)')
    .paragraph('The following property is hereby transferred to the Trustee:');

  if (data.assets.realEstate) w.paragraph(`Real Estate: ${data.assets.realEstate}`, 20);
  if (data.assets.bankAccounts) w.paragraph(`Financial Accounts: ${data.assets.bankAccounts}`, 20);
  if (data.assets.investment) w.paragraph(`Investment Accounts: ${data.assets.investment}`, 20);
  if (data.assets.vehicles) w.paragraph(`Vehicles: ${data.assets.vehicles}`, 20);
  if (data.assets.business) w.paragraph(`Business Interests: ${data.assets.business}`, 20);
  if (data.assets.other) w.paragraph(`Other: ${data.assets.other}`, 20);

  w.section('Article VII — Governing Law')
    .paragraph(
      `This Trust shall be governed by the laws of the State of California. This Trust Agreement has been prepared by ${attorney.name}, ${attorney.barNumber}, and constitutes the entire agreement of the parties with respect to the subject matter hereof.`
    )
    .gap()
    .signatureLine(`${trustorName}, Trustor and Initial Trustee`)
    .signatureLine('Date')
    .notaryBlock();

  const bytes = await doc.save();
  return { type: 'trust', bytes };
}

async function generatePOA(
  data: QuestionnaireData,
  attorney: AttorneyInfo
): Promise<{ type: string; bytes: Uint8Array }> {
  const { doc, helvetica, helveticaBold, helveticaOblique } = await createBaseDocument();
  const w = new DocumentWriter(doc, attorney, 'DURABLE POWER OF ATTORNEY', helvetica, helveticaBold, helveticaOblique);
  const trustorName = [data.personal.firstName, data.personal.middleName, data.personal.lastName]
    .filter(Boolean)
    .join(' ');

  w.section('Appointment of Agent')
    .paragraph(
      `I, ${trustorName}, residing at ${data.personal.address}, ${data.personal.city}, ${data.personal.state} ${data.personal.zip}, hereby appoint the following individual as my Attorney-in-Fact (Agent):`
    )
    .boldLine('Primary Agent', `${data.poa.agent.name}`)
    .boldLine('Relationship', data.poa.agent.relationship)
    .boldLine('Address', `${data.poa.agent.address}`)
    .boldLine('Phone', data.poa.agent.phone);

  if (data.poa.alternate) {
    w.section('Alternate Agent')
      .boldLine('Alternate Agent', data.poa.alternate.name)
      .boldLine('Relationship', data.poa.alternate.relationship)
      .boldLine('Address', data.poa.alternate.address)
      .boldLine('Phone', data.poa.alternate.phone)
      .paragraph('If my Primary Agent is unable or unwilling to serve, I appoint the Alternate Agent named above to serve with the same authority.');
  }

  w.section('Grant of Powers')
    .paragraph('I grant my Agent FULL AND UNQUALIFIED AUTHORITY to act in my name, place, and stead with respect to the following matters, as checked:');

  const powerMap: Record<string, string> = {
    banking: 'Banking and financial management — Including opening, closing, and managing bank accounts',
    realEstate: 'Real estate — Including purchasing, selling, leasing, and managing real property',
    tax: 'Tax matters — Including filing returns and representing me before the IRS',
    business: 'Business operations — Including managing any business interests I hold',
    gifts: 'Making gifts — Subject to applicable annual gift tax exclusions',
    trusts: 'Trust operations — Including creating, amending, or funding trusts',
    litigation: 'Legal proceedings — Including initiating or defending legal actions',
  };

  for (const power of data.poa.powers) {
    if (powerMap[power]) {
      w.paragraph(`☑  ${powerMap[power]}`, 10);
    }
  }

  w.section('Durability')
    .paragraph(
      'This Power of Attorney shall not be affected by the incapacity of the Principal. This is a DURABLE Power of Attorney pursuant to California Probate Code Section 4124.'
    )
    .section('Effective Date')
    .paragraph('This Power of Attorney is effective immediately upon execution.')
    .gap()
    .signatureLine(`${trustorName}, Principal`)
    .signatureLine('Date')
    .notaryBlock();

  const bytes = await doc.save();
  return { type: 'poa', bytes };
}

async function generateAHCD(
  data: QuestionnaireData,
  attorney: AttorneyInfo
): Promise<{ type: string; bytes: Uint8Array }> {
  const { doc, helvetica, helveticaBold, helveticaOblique } = await createBaseDocument();
  const w = new DocumentWriter(doc, attorney, 'ADVANCE HEALTH CARE DIRECTIVE', helvetica, helveticaBold, helveticaOblique);
  const trustorName = [data.personal.firstName, data.personal.middleName, data.personal.lastName]
    .filter(Boolean)
    .join(' ');

  w.section('Designation of Health Care Agent')
    .paragraph(
      `I, ${trustorName}, hereby designate the following individual as my Health Care Agent to make health care decisions for me:`
    )
    .boldLine('Primary Healthcare Agent', data.healthcare.agent.name)
    .boldLine('Relationship', data.healthcare.agent.relationship)
    .boldLine('Address', data.healthcare.agent.address)
    .boldLine('Phone', data.healthcare.agent.phone);

  if (data.healthcare.alternate) {
    w.section('Alternate Healthcare Agent')
      .boldLine('Alternate Healthcare Agent', data.healthcare.alternate.name)
      .boldLine('Relationship', data.healthcare.alternate.relationship)
      .boldLine('Phone', data.healthcare.alternate.phone);
  }

  w.section('Agent\'s Authority')
    .paragraph(
      'My Agent is authorized to make all health care decisions for me, including decisions to provide, withhold, or withdraw artificial nutrition and hydration and all other forms of health care to keep me alive, except as I state here.'
    )
    .section('End-of-Life Directives')
    .boldLine('Life-Sustaining Treatment', data.healthcare.lifeSustaining)
    .boldLine('Artificial Nutrition & Hydration', data.healthcare.artificialNutrition)
    .boldLine('Organ Donation', data.healthcare.organDonation);

  if (data.healthcare.additionalWishes) {
    w.section('Additional Instructions')
      .paragraph(data.healthcare.additionalWishes);
  }

  w.section('HIPAA Release')
    .paragraph(
      'I intend for my agent to be treated as I would be with respect to my rights regarding the use and disclosure of my individually identifiable health information or other medical records under the Health Insurance Portability and Accountability Act of 1996.'
    )
    .section('Effective Date')
    .paragraph(
      'This directive shall be effective upon my incapacity and shall remain in effect unless I revoke it. This directive is made pursuant to California Probate Code Section 4700 et seq.'
    )
    .gap()
    .signatureLine(`${trustorName}, Principal`)
    .signatureLine('Date')
    .paragraph('WITNESS STATEMENT: I declare that the person who signed or acknowledged this document is personally known to me and appears to be of sound mind and under no duress, fraud, or undue influence.')
    .signatureLine('Witness 1 Signature')
    .signatureLine('Witness 2 Signature')
    .notaryBlock();

  const bytes = await doc.save();
  return { type: 'ahcd', bytes };
}

async function generateHIPAA(
  data: QuestionnaireData,
  attorney: AttorneyInfo
): Promise<{ type: string; bytes: Uint8Array }> {
  const { doc, helvetica, helveticaBold, helveticaOblique } = await createBaseDocument();
  const w = new DocumentWriter(doc, attorney, 'HIPAA AUTHORIZATION', helvetica, helveticaBold, helveticaOblique);
  const trustorName = [data.personal.firstName, data.personal.middleName, data.personal.lastName]
    .filter(Boolean)
    .join(' ');

  w.section('Authorization for Release of Protected Health Information')
    .paragraph(
      `I, ${trustorName}, hereby authorize the following individuals to access my protected health information (PHI) as defined under the Health Insurance Portability and Accountability Act of 1996 (HIPAA):`
    );

  for (const person of data.hipaa.persons) {
    w.boldLine(person.name, `${person.relationship} — Phone: ${person.phone}`);
  }

  w.section('Scope of Authorization')
    .paragraph(
      'This authorization covers all health information in my medical records, including information relating to mental health, substance abuse, HIV/AIDS status, and genetic information.'
    )
    .section('Purpose')
    .paragraph('The purpose of this authorization is to enable my designated individuals to coordinate my care, communicate with healthcare providers, and make informed decisions on my behalf.')
    .section('Duration')
    .paragraph('This authorization shall remain in effect indefinitely unless revoked in writing by me.')
    .section('Right to Revoke')
    .paragraph('I understand I have the right to revoke this authorization at any time by providing written notice to my healthcare providers.')
    .gap()
    .signatureLine(`${trustorName}, Patient`)
    .signatureLine('Date');

  const bytes = await doc.save();
  return { type: 'hipaa', bytes };
}

async function generatePourOverWill(
  data: QuestionnaireData,
  attorney: AttorneyInfo
): Promise<{ type: string; bytes: Uint8Array }> {
  const { doc, helvetica, helveticaBold, helveticaOblique } = await createBaseDocument();
  const w = new DocumentWriter(doc, attorney, 'POUR-OVER WILL', helvetica, helveticaBold, helveticaOblique);
  const trustorName = [data.personal.firstName, data.personal.middleName, data.personal.lastName]
    .filter(Boolean)
    .join(' ');

  w.section('Declaration')
    .paragraph(
      `I, ${trustorName}, a resident of ${data.personal.city}, ${data.personal.state}, being of sound and disposing mind, memory, and understanding, and not acting under duress, menace, fraud, or undue influence of any person, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all prior Wills and Codicils made by me.`
    )
    .section('Residuary Estate')
    .paragraph(
      `I give, devise, and bequeath all the rest, residue, and remainder of my estate, whether real, personal, or mixed, of whatever kind and wherever situated, to the then-acting Trustee of the ${data.trust.trustName}, to be added to, and administered and distributed as part of, said trust.`
    )
    .section('Executor')
    .paragraph(
      `I hereby appoint ${data.trust.successorFirst.name} as Executor of this Will. If ${data.trust.successorFirst.name} is unable or unwilling to serve, I appoint ${data.trust.successorSecond?.name ?? '[Alternate]'} as Successor Executor.`
    )
    .paragraph('I direct that no bond be required of any Executor serving hereunder.')
    .section('Governing Law')
    .paragraph(
      'This Will shall be governed by the laws of the State of California. IN WITNESS WHEREOF, I have hereunto set my hand this _____________ day of _____________, ______.'
    )
    .gap()
    .signatureLine(`${trustorName}, Testator`)
    .paragraph(
      'We, the undersigned, declare that the Testator named above signed this Will in our presence and in our opinion is of sound and disposing mind and memory.'
    )
    .signatureLine('Witness 1 Signature & Address')
    .signatureLine('Witness 2 Signature & Address');

  const bytes = await doc.save();
  return { type: 'pour_over_will', bytes };
}

async function generateCertificate(
  data: QuestionnaireData,
  attorney: AttorneyInfo
): Promise<{ type: string; bytes: Uint8Array }> {
  const { doc, helvetica, helveticaBold, helveticaOblique } = await createBaseDocument();
  const w = new DocumentWriter(doc, attorney, 'CERTIFICATE OF TRUST', helvetica, helveticaBold, helveticaOblique);
  const trustorName = [data.personal.firstName, data.personal.middleName, data.personal.lastName]
    .filter(Boolean)
    .join(' ');

  w.section('Certification')
    .paragraph(
      `I, ${trustorName}, hereby certify that the following information regarding the ${data.trust.trustName} is true and correct:`
    )
    .boldLine('Name of Trust', data.trust.trustName)
    .boldLine('Date of Trust', 'See original trust document')
    .boldLine('Trustor(s)', trustorName)
    .boldLine('Initial Trustee(s)', trustorName)
    .boldLine('Successor Trustee', `${data.trust.successorFirst.name} (${data.trust.successorFirst.relationship})`)
    .section('Trust Powers')
    .paragraph('The Trustee is authorized to: (1) hold, manage, invest, and reinvest trust assets; (2) purchase and sell real and personal property; (3) borrow money and encumber trust assets; (4) enter into contracts; (5) exercise voting rights; (6) open and maintain financial accounts; and (7) distribute income and principal.')
    .section('Revocability')
    .paragraph('This trust is REVOCABLE. The Trustor retains the right to revoke or amend this trust at any time during the Trustor\'s lifetime.')
    .section('Tax Identification')
    .paragraph('During the Trustor\'s lifetime, the trust\'s taxpayer identification number is the Trustor\'s Social Security Number.')
    .section('Certification Statement')
    .paragraph(
      `The undersigned certifies under penalty of perjury that the ${data.trust.trustName} is in full force and effect as of the date of this certificate, that the trust has not been revoked, and that the Trustee has all power and authority necessary to carry out the purposes for which this Certificate is being issued.`
    )
    .gap()
    .signatureLine(`${trustorName}, Trustor/Trustee`)
    .signatureLine('Date')
    .notaryBlock();

  const bytes = await doc.save();
  return { type: 'certificate', bytes };
}
