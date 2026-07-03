import Image from 'next/image';
import { InvoiceData } from '@/types/invoice';

interface ClientInvoiceProps {
  data: InvoiceData;
}

export default function ClientInvoice({ data }: ClientInvoiceProps) {
  return (
    <article className="mx-auto w-full max-w-[960px] rounded-[32px] bg-gradient-to-b from-[#0a0518] to-[#1a0b36] text-white shadow-[0_18px_60px_rgba(0,0,0,0.5)] print:shadow-none print:bg-white print:text-black print:border-none print:p-0 print:break-inside-avoid">
      <div className="px-8 py-10 print:p-0">
        <header className="mb-10 grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#130f26] border border-slate-800">
              {data.logoSrc ? (
                <Image
                  src={data.logoSrc}
                  alt="Monolith Media logo"
                  width={56}
                  height={56}
                  className="h-14 w-14 object-contain"
                />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">MONOLITH MEDIA</p>
              <p className="mt-2 text-base font-semibold uppercase tracking-[0.24em] text-white">VIDEO EDITING AGENCY</p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-5xl font-black uppercase tracking-[0.2em] leading-tight text-white">INVOICE</p>
            <div className="mt-6 space-y-2 text-sm uppercase tracking-[0.24em] text-slate-400">
              <div>
                <p>Invoice Number</p>
                <p className="mt-1 text-lg font-semibold text-white">{data.invoiceNumber}</p>
              </div>
              <div>
                <p>Date</p>
                <p className="mt-1 text-lg font-semibold text-white">{data.date}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-10">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Billed To</p>
          <div className="rounded-[28px] border border-slate-800 bg-[#130f26] p-6">
            <p className="text-lg font-semibold text-white">{data.clientName}</p>
            <p className="mt-2 text-sm text-slate-400">{data.clientEmail}</p>
          </div>
        </section>

        <section className="mb-10 overflow-hidden rounded-[28px] border border-slate-800">
          <div className="bg-[#8B3DFF] px-6 py-4">
            <div className="grid gap-4 text-xs font-semibold uppercase tracking-[0.32em] text-white md:grid-cols-[2fr_1fr_1fr]">
              <span>Item / Description</span>
              <span>Video Duration</span>
              <span className="text-right">Total</span>
            </div>
          </div>
          <div className="bg-[#130f26] px-6 py-8">
            <div className="grid gap-6 text-white md:grid-cols-[2fr_1fr_1fr] md:items-center">
              <div>
                <p className="text-lg font-semibold">{data.itemTitle}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400 whitespace-pre-wrap">{data.itemDescription}</p>
              </div>
              <p className="text-sm text-white">{data.videoDuration}</p>
              <p className="text-right text-lg font-semibold text-white">${data.amount?.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="rounded-[28px] border border-slate-800 bg-[#130f26] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Subtotal</p>
            <p className="mt-4 text-3xl font-semibold text-white">${data.subtotal?.toFixed(2)}</p>
            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">Agency Name</p>
            <p className="mt-1 text-lg font-semibold text-white">MONOLITH MEDIA</p>
          </div>

          <div className="rounded-[28px] border border-[#8B3DFF] bg-[#8B3DFF] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-100">TOTAL</p>
            <p className="mt-4 text-4xl font-semibold">${data.amount?.toFixed(2)}</p>
          </div>
        </section>

        <section className="mb-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-800 bg-[#130f26] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Payment Information</p>
            <div className="mt-6 grid gap-4 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-white">Bank Name</p>
                <p>{data.bankName}</p>
              </div>
              <div>
                <p className="font-semibold text-white">Account Name</p>
                <p>{data.accountName}</p>
              </div>
              <div>
                <p className="font-semibold text-white">Account Number</p>
                <p>{data.accountNumber}</p>
              </div>
              <div>
                <p className="font-semibold text-white">SWIFT</p>
                <p>{data.swiftCode}</p>
              </div>
              <div>
                <p className="font-semibold text-white">Routing Number</p>
                <p>{data.routingNumber}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-800 bg-[#130f26] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Contact</p>
            <div className="mt-6 grid gap-4 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-white">Email</p>
                <p>{data.agencyEmail}</p>
              </div>
              <div>
                <p className="font-semibold text-white">Phone</p>
                <p>{data.agencyPhone}</p>
              </div>
              <div>
                <p className="font-semibold text-white">Website</p>
                <p>{data.website}</p>
              </div>
              <div>
                <p className="font-semibold text-white">Address</p>
                <p>{data.agencyAddress}</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800 pt-6 text-sm text-slate-500">
          <p>Invoice generated by Monolith Media. Please remit payment according to the agreed terms.</p>
        </footer>
      </div>
    </article>
  );
}
