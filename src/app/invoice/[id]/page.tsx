import ClientInvoice from '@/components/ClientInvoice';
import { InvoiceData } from '@/types/invoice';

const sampleInvoice: InvoiceData = {
  invoiceNumber: '12345',
  date: '30 July 2025',
  clientName: 'Estelle Darcy',
  clientEmail: 'estelle.darcy@email.com',
  itemTitle: 'YouTube Video Editing',
  itemDescription:
    'Professional long-form YouTube video editing including transitions, color grading, subtitles, sound design, motion graphics and effects.',
  videoDuration: '25 Minutes',
  amount: 500,
  subtotal: 500,
  bankName: 'Dutch Bangla Bank',
  accountName: 'MST POLY KHATUN',
  accountNumber: '1201580374514',
  swiftCode: 'DBBLBDDH',
  routingNumber: '090471544',
  agencyEmail: 'minzu.bd.123@gmail.com',
  agencyPhone: '+880 1940-420383',
  website: 'monolithmedia.digital',
  agencyAddress: 'Holding 26/1 Road, Goyalkhali, Boyra, Stamp Khulna GPO',
  logoSrc: '/logo.png',
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 print:bg-white">
      <div className="mx-auto w-full max-w-[1000px]">
        <ClientInvoice data={sampleInvoice} />
      </div>
    </main>
  );
}
