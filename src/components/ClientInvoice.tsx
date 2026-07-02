import Image from 'next/image';
import { InvoiceData } from '@/types/invoice';

interface ClientInvoiceProps {
  data: InvoiceData;
}

export default function ClientInvoice({ data }: ClientInvoiceProps) {
  return (
    <article className="mx-auto w-full max-w-[960px] rounded-[32px] bg-white text-slate-950 shadow-[0_18px_60px_rgba(0,0,0,0.08)] print:shadow-none print:border-none print:p-0 print:break-inside-avoid">
      <div className="px-8 py-10 print:p-0">
        <header className="mb-10 grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
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
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-700">MONOLITH MEDIA</p>
              <p className="mt-2 text-base font-semibold uppercase tracking-[0.24em] text-slate-950">VIDEO EDITING AGENCY</p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-5xl font-black uppercase tracking-[0.2em] leading-tight">INVOICE</p>
            <div className="mt-6 space-y-2 text-sm uppercase tracking-[0.24em] text-slate-600">
              <div>
                <p>Invoice Number</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{data.invoiceNumber}</p>
              </div>
              <div>
                <p>Date</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{data.date}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-10">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">Billed To</p>
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-lg font-semibold text-slate-950">{data.clientName}</p>
            <p className="mt-2 text-sm text-slate-600">{data.clientEmail}</p>
          </div>
        </section>

        <section className="mb-10 overflow-hidden rounded-[28px] border border-slate-200">
          <div className="bg-slate-950 px-6 py-4">
            <div className="grid gap-4 text-xs font-semibold uppercase tracking-[0.32em] text-white md:grid-cols-[2fr_1fr_1fr]">
              <span>Item / Description</span>
              <span>Video Duration</span>
              <span className="text-right">Total</span>
            </div>
          </div>
          <div className="bg-white px-6 py-8">
            <div className="grid gap-6 text-slate-950 md:grid-cols-[2fr_1fr_1fr] md:items-center">
              <div>
                <p className="text-lg font-semibold">{data.itemTitle}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{data.itemDescription}</p>
              </div>
              <p className="text-sm text-slate-950">{data.videoDuration}</p>
              <p className="text-right text-lg font-semibold">${data.amount.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">Subtotal</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">${data.subtotal.toFixed(2)}</p>
            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">Agency Name</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">MONOLITH MEDIA</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">TOTAL</p>
            <p className="mt-4 text-4xl font-semibold">${data.amount.toFixed(2)}</p>
          </div>
        </section>

        <section className="mb-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">Payment Information</p>
            <div className="mt-6 grid gap-4 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-950">Bank Name</p>
                <p>{data.bankName}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Account Name</p>
                <p>{data.accountName}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Account Number</p>
                <p>{data.accountNumber}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">SWIFT</p>
                <p>{data.swiftCode}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Routing Number</p>
                <p>{data.routingNumber}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">Contact</p>
            <div className="mt-6 grid gap-4 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-950">Email</p>
                <p>{data.agencyEmail}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Phone</p>
                <p>{data.agencyPhone}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Website</p>
                <p>{data.website}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Address</p>
                <p>{data.agencyAddress}</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>Invoice generated by Monolith Media. Please remit payment according to the agreed terms.</p>
        </footer>
      </div>
    </article>
  );
}
