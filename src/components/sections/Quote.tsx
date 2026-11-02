"use client";

import { useRef, useState, type FormEvent } from "react";
import { Paperclip, CircleAlert, CircleCheck, ArrowRight, Loader2 } from "lucide-react";
import { SectionHead } from "@/components/ui/brand";
import { Photo } from "@/components/ui/photo";
import type { Dictionary } from "@/i18n";

type Status = "idle" | "sending" | "sent" | "failed";
type Errors = Partial<Record<"name" | "email" | "phone" | "message" | "file", string>>;

const MAX_FILE = 20 * 1024 * 1024;

export function Quote({ t, moldNames, kicker, photoAlt }: { t: Dictionary["quote"]; moldNames: string[]; kicker: string; photoAlt: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [fileName, setFileName] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);

  const validate = (fd: FormData): Errors => {
    const e: Errors = {};
    if (!String(fd.get("name") ?? "").trim()) e.name = t.required;
    const email = String(fd.get("email") ?? "").trim();
    if (!email) e.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t.invalidEmail;
    if (!String(fd.get("phone") ?? "").trim()) e.phone = t.required;
    if (!String(fd.get("message") ?? "").trim()) e.message = t.required;
    const file = fd.get("file");
    if (file instanceof File && file.size > MAX_FILE) e.file = t.fileTooLarge;
    return e;
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const e = validate(fd);
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/quote", { method: "POST", body: fd });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
      setFileName("");
    } catch {
      setStatus("failed");
    }
  };

  const field = (name: keyof Errors) => ({
    id: `q-${name}`,
    name,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `q-${name}-err` : undefined,
  });
  const err = (name: keyof Errors) =>
    errors[name] ? (
      <span id={`q-${name}-err`} className="err">
        <CircleAlert size={14} aria-hidden />
        {errors[name]}
      </span>
    ) : null;

  return (
    <section id="quote" className="section">
      <div className="wrap relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHead kicker={kicker} title={t.title} lead={t.lead} />
          <div data-reveal className="mt-12">
            <p className="mb-5 text-sm font-medium text-white">{t.stepsTitle}</p>
            <ol className="border-t border-line">
              {t.steps.map((s, i) => (
                <li key={s} className="flex items-center gap-5 border-b border-line py-4">
                  <span className="tnum grid h-9 w-9 flex-none place-items-center rounded border border-line-strong text-sm font-medium text-white">{i + 1}</span>
                  <span className="text-white/90">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <Photo name="mold-nozzle" alt={photoAlt} sizes="(min-width: 1024px) 38vw, 100vw" className="mt-10 aspect-[4/3] rounded max-lg:hidden" />
        </div>

        <div data-reveal className="lg:col-span-7">
          <div className="glass relative rounded-md p-6 md:p-10">
            <form noValidate onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2" encType="multipart/form-data">
              {Object.keys(errors).length > 0 && (
                <div
                  ref={summaryRef}
                  tabIndex={-1}
                  role="alert"
                  className="flex items-center gap-3 rounded border border-molten/40 bg-molten/10 px-4 py-3 font-medium text-[#ffcdb8] sm:col-span-2"
                >
                  <CircleAlert size={18} aria-hidden />
                  {t.errorSummary}
                </div>
              )}

              <div className="field">
                <label htmlFor="q-name">{t.name}</label>
                <input className="input" autoComplete="name" required {...field("name")} />
                {err("name")}
              </div>
              <div className="field">
                <label htmlFor="q-company">{t.company}</label>
                <input className="input" id="q-company" name="company" autoComplete="organization" />
              </div>
              <div className="field">
                <label htmlFor="q-phone">{t.phone}</label>
                <input className="input" type="tel" autoComplete="tel" inputMode="tel" required {...field("phone")} />
                {err("phone")}
              </div>
              <div className="field">
                <label htmlFor="q-email">{t.email}</label>
                <input className="input" type="email" autoComplete="email" inputMode="email" required {...field("email")} />
                {err("email")}
              </div>
              <div className="field">
                <label htmlFor="q-type">{t.type}</label>
                <select className="input cursor-pointer pr-10" id="q-type" name="type" defaultValue={moldNames[0]}>
                  {moldNames.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                  <option>{t.typeUnknown}</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="q-volume">{t.volume}</label>
                <input className="input tnum" id="q-volume" name="volume" inputMode="numeric" aria-describedby="q-volume-hint" />
                <span id="q-volume-hint" className="hint">{t.volumeHint}</span>
              </div>
              <div className="field sm:col-span-2">
                <label htmlFor="q-message">{t.message}</label>
                <textarea className="input" required {...field("message")} aria-describedby={errors.message ? "q-message-err" : "q-message-hint"} />
                <span id="q-message-hint" className="hint">{t.messageHint}</span>
                {err("message")}
              </div>
              <div className="field sm:col-span-2">
                <span className="label" id="q-file-label">{t.file}</span>
                <label
                  htmlFor="q-file"
                  className="input flex cursor-pointer items-center gap-4 border-dashed py-3"
                  aria-invalid={errors.file ? true : undefined}
                >
                  <span className="icon-tile h-10 w-10">
                    <Paperclip size={18} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-white">{t.fileButton}</span>
                    <span className="block truncate text-sm text-muted">{fileName || t.fileNone}</span>
                  </span>
                  <input
                    className="sr-only"
                    type="file"
                    accept=".step,.stp,.iges,.igs,.stl,.pdf,.dwg,.dxf"
                    {...field("file")}
                    aria-labelledby="q-file-label"
                    aria-describedby={errors.file ? "q-file-err" : "q-file-hint"}
                    onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? "")}
                  />
                </label>
                <span id="q-file-hint" className="hint">{t.fileHint}</span>
                {err("file")}
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2 sm:col-span-2">
                <button type="submit" className="btn btn-primary min-w-[13rem]" disabled={status === "sending"} aria-busy={status === "sending"}>
                  {status === "sending" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" aria-hidden />
                      {t.sending}
                    </>
                  ) : (
                    <>
                      {t.submit}
                      <ArrowRight size={18} className="arrow" aria-hidden />
                    </>
                  )}
                </button>
                <p role="status" className="flex items-center gap-2 text-sm font-medium">
                  {status === "sent" && (
                    <>
                      <CircleCheck size={18} className="text-cyan" aria-hidden />
                      <span className="text-white">{t.success}</span>
                    </>
                  )}
                  {status === "failed" && (
                    <>
                      <CircleAlert size={18} className="text-molten" aria-hidden />
                      <span className="text-[#ffcdb8]">{t.error}</span>
                    </>
                  )}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
