export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientEmail: string;
  itemTitle: string;
  itemDescription: string;
  videoDuration: string;
  amount: number;
  subtotal: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  routingNumber: string;
  agencyEmail: string;
  agencyPhone: string;
  website: string;
  agencyAddress: string;
  logoSrc?: string;
}
